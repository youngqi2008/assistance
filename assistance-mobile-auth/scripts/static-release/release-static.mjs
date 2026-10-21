import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  assistVersionBasePath,
  ASSIST_LAYER_DIR,
  createDeferredH5Note,
  createManifest,
  createNginxConfig,
  createReadme,
  parseReleaseArgs,
  resolveNextVersion,
  validateReleaseDirectory,
} from './static-release-core.mjs'
import {
  computeDirectoryChecksums,
  FROZEN_CHECKSUMS_FILE,
  FROZEN_DIR_NAME,
  frozenDirectoryName,
  listFrozenAssistVersions,
  verifyFrozenAssets,
} from './frozen-assets.mjs'

function resolveFrozenRoot(projectRoot, dirName = FROZEN_DIR_NAME) {
  return path.join(projectRoot, 'release-frozen', dirName)
}

function resolveFrozenAssistRoot(projectRoot, version) {
  return resolveFrozenRoot(projectRoot, frozenDirectoryName(version))
}

export function readPackageJson(projectRoot) {
  return JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
}

export function writePackageJson(projectRoot, pkg) {
  writeFileSync(path.join(projectRoot, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`)
}

export async function chooseReleaseVersion(currentVersion, options) {
  if (options.version || options.bump) {
    return resolveNextVersion(currentVersion, options)
  }

  if (options.yes) {
    return currentVersion
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    const strategy = (
      await rl.question(
        `当前版本 ${currentVersion}。请选择版本策略 [patch/minor/major/none/manual]: `,
      )
    )
      .trim()
      .toLowerCase()

    if (strategy === 'manual') {
      const manualVersion = (await rl.question('请输入版本号，例如 0.1.1: ')).trim()
      return resolveNextVersion(currentVersion, { version: manualVersion })
    }

    return resolveNextVersion(currentVersion, { bump: strategy || 'none' })
  } finally {
    rl.close()
  }
}

export function updatePackageVersionIfNeeded(projectRoot, pkg, nextVersion) {
  return updatePackageVersionIfNeededWithRunner(projectRoot, pkg, nextVersion, runCommand)
}

function updatePackageVersionIfNeededWithRunner(projectRoot, pkg, nextVersion, executeCommand) {
  if (pkg.version === nextVersion) {
    return false
  }

  const nextPackage = { ...pkg, version: nextVersion }
  writePackageJson(projectRoot, nextPackage)
  executeCommand(projectRoot, 'npm', ['install', '--package-lock-only'])
  return true
}

export function assembleReleasePackage({
  projectRoot,
  releaseRoot,
  packageName,
  version,
  gitCommit,
  builtAt,
}) {
  const frozenRoot = resolveFrozenRoot(projectRoot)
  const releaseFrozenRoot = path.join(projectRoot, 'release-frozen')
  const assistVersions = listFrozenAssistVersions(releaseFrozenRoot)
  if (!assistVersions.includes(version)) {
    throw new Error(`Frozen assist ${version} does not exist`)
  }
  const frozenErrors = verifyFrozenAssets(frozenRoot)
  if (frozenErrors.length > 0) {
    const error = new Error('Frozen 0.1.4 assets failed verification')
    error.validationErrors = frozenErrors
    throw error
  }
  const frozenAssistRoots = {}
  const assistFrozenSourceGitCommits = {}
  for (const assistVersion of assistVersions) {
    const frozenAssistRoot = resolveFrozenAssistRoot(projectRoot, assistVersion)
    const frozenAssistErrors = [
      ...verifyFrozenAssets(frozenAssistRoot),
      ...validateFrozenAssistMetadata(frozenAssistRoot, assistVersion),
    ]
    if (frozenAssistErrors.length > 0) {
      const error = new Error(`Frozen ${assistVersion} assets failed verification`)
      error.validationErrors = frozenAssistErrors
      throw error
    }
    frozenAssistRoots[assistVersion] = frozenAssistRoot
    assistFrozenSourceGitCommits[assistVersion] =
      readFrozenSourceGitCommit(frozenAssistRoot)
  }

  const releaseDist = path.join(releaseRoot, 'dist')
  rmSync(releaseRoot, { recursive: true, force: true })
  mkdirSync(path.join(releaseRoot, 'nginx'), { recursive: true })

  // 根层：冻结 0.1.4 字节原样
  cpSync(path.join(frozenRoot, 'dist'), releaseDist, { recursive: true })
  // assist 层：所有历史版本均按版本目录复制，已冻结版本永不覆盖。
  for (const assistVersion of assistVersions) {
    cpSync(
      path.join(frozenAssistRoots[assistVersion], 'dist'),
      path.join(releaseDist, ASSIST_LAYER_DIR, assistVersion),
      { recursive: true },
    )
  }

  const manifest = createManifest({
    packageName,
    version,
    gitCommit,
    builtAt,
    frozenSourceGitCommit: readFrozenSourceGitCommit(frozenRoot),
    assistFrozenSourceGitCommit: assistFrozenSourceGitCommits[version],
    assistVersions,
  })

  writeFileSync(path.join(releaseRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(
    path.join(releaseRoot, 'README.md'),
    createReadme({ version, assistVersions }),
  )
  writeFileSync(path.join(releaseRoot, 'TODO.md'), createDeferredH5Note(version))
  writeFileSync(
    path.join(releaseRoot, 'nginx', 'sign-pay-pro-static.conf'),
    createNginxConfig({
      releaseRootPlaceholder: '/opt/mobile-auth-static/dist',
      assistVersions,
      latestAssistVersion: version,
    }),
  )

  return releaseRoot
}

function readFrozenSourceManifest(frozenRoot) {
  try {
    return JSON.parse(
      readFileSync(path.join(frozenRoot, 'source-manifest.json'), 'utf8'),
    )
  } catch {
    return {}
  }
}

function readFrozenSourceGitCommit(frozenRoot) {
  return readFrozenSourceManifest(frozenRoot).gitCommit ?? null
}

function validateFrozenAssistMetadata(frozenRoot, version) {
  const sourceManifest = readFrozenSourceManifest(frozenRoot)
  const errors = []
  if (sourceManifest.version !== version) {
    errors.push(
      `Frozen assist source version mismatch: expected ${version}, got ${sourceManifest.version}`,
    )
  }
  const expectedBasePath = assistVersionBasePath(version)
  if (sourceManifest.basePath !== expectedBasePath) {
    errors.push(
      `Frozen assist base path mismatch: expected ${expectedBasePath}, got ${sourceManifest.basePath}`,
    )
  }
  return errors
}

export function validateOrThrow(
  releaseRoot,
  version,
  frozenRoot,
  frozenAssistRoots,
  assistVersions,
) {
  const errors = validateReleaseDirectory(releaseRoot, version, {
    frozenRoot,
    frozenAssistRoots,
    assistVersions,
  })
  if (errors.length === 0) {
    return
  }

  const error = new Error(`Static release validation failed for ${releaseRoot}`)
  error.validationErrors = errors
  throw error
}

function createFrozenAssistSnapshot({
  projectRoot,
  version,
  gitCommit,
  builtAt,
}) {
  const frozenRoot = resolveFrozenAssistRoot(projectRoot, version)
  if (existsSync(frozenRoot)) {
    return { frozenRoot, created: false }
  }

  const stageRoot = `${frozenRoot}.stage-${process.pid}-${Date.now()}`
  const stageDist = path.join(stageRoot, 'dist')
  const wrapperDir = path.join(stageDist, 'assistance-mobile-auth')
  try {
    mkdirSync(stageRoot, { recursive: true })
    cpSync(path.join(projectRoot, 'dist-static'), stageDist, { recursive: true })
    cpSync(path.join(projectRoot, 'dist-wrapper'), wrapperDir, {
      recursive: true,
    })
    copyFileSync(
      path.join(wrapperDir, 'assistance-mobile-auth.js'),
      path.join(wrapperDir, `assistance-mobile-auth.${version}.js`),
    )
    copyFileSync(
      path.join(wrapperDir, 'assistance-mobile-auth.umd.cjs'),
      path.join(wrapperDir, `assistance-mobile-auth.${version}.umd.cjs`),
    )

    if (['0.3.0', '0.3.1', '0.3.2'].includes(version)) {
      const customerOutput = version === '0.3.0' ? 'dist-duodian-health-temp' : `dist-duodian-health${version.replaceAll('.', '')}-temp`
      const customerDist = path.join(projectRoot, customerOutput, 'assist', version)
      for (const relative of [
        'custom-verification.html',
        `assistance-mobile-auth/assistance-mobile-auth.duodian-health.${version}.js`,
        `assistance-mobile-auth/assistance-mobile-auth.duodian-health.${version}.umd.cjs`,
        'assistance-mobile-auth/vendor/new-control-style.css',
      ]) {
        if (!existsSync(path.join(customerDist, relative))) {
          throw new Error(`Missing formal ${version} customer resource: ${relative}`)
        }
      }
      const assets = path.join(customerDist, 'assets')
      if (!existsSync(assets) || readdirSync(assets).length === 0) {
        throw new Error(`Missing formal ${version} customer loader assets`)
      }
      // Merge only the generated version subtree; retain the generic wrappers.
      cpSync(customerDist, stageDist, { recursive: true })
    }

    const distChecksums = computeDirectoryChecksums(stageDist)
    const checksums = Object.fromEntries(
      Object.entries(distChecksums).map(([relative, checksum]) => [
        `dist/${relative}`,
        checksum,
      ]),
    )
    writeFileSync(
      path.join(stageRoot, FROZEN_CHECKSUMS_FILE),
      `${JSON.stringify(checksums, null, 2)}\n`,
    )
    writeFileSync(
      path.join(stageRoot, 'source-manifest.json'),
      `${JSON.stringify(
        {
          version,
          gitCommit,
          builtAt,
          basePath: assistVersionBasePath(version),
        },
        null,
        2,
      )}\n`,
    )
    writeFileSync(
      path.join(stageRoot, 'FROZEN.md'),
      `# Frozen Static Release ${version}\n\n` +
        `- Version: \`${version}\`\n` +
        `- Source commit: \`${gitCommit}\`\n` +
        `- Public base path: \`${assistVersionBasePath(version)}\`\n\n` +
        'This version is immutable after its first successful static release.\n',
    )

    const validationErrors = [
      ...verifyFrozenAssets(stageRoot),
      ...validateFrozenAssistMetadata(stageRoot, version),
    ]
    if (validationErrors.length > 0) {
      const error = new Error(`New frozen ${version} snapshot failed verification`)
      error.validationErrors = validationErrors
      throw error
    }

    renameSync(stageRoot, frozenRoot)
    return { frozenRoot, created: true }
  } catch (error) {
    rmSync(stageRoot, { recursive: true, force: true })
    throw error
  }
}

export function createReleaseArchive(projectRoot, version) {
  return createReleaseArchiveWithRunner(projectRoot, version, runCommand)
}

function createReleaseArchiveWithRunner(projectRoot, version, executeCommand) {
  const releaseDirName = `static-mobile-auth-${version}`
  const archivePath = path.join(projectRoot, 'release', `${releaseDirName}.tar.gz`)

  rmSync(archivePath, { force: true })
  executeCommand(projectRoot, 'tar', [
    '-czf',
    archivePath,
    '-C',
    path.join(projectRoot, 'release'),
    releaseDirName,
  ])

  return archivePath
}

export function getGitCommit(projectRoot) {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: projectRoot,
    encoding: 'utf8',
  }).trim()
}

function runCommand(projectRoot, command, args, extraEnv = {}) {
  execFileSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  })
}

export async function runRelease(
  argv = process.argv.slice(2),
  projectRoot = process.cwd(),
  dependencies = {},
) {
  const {
    getGitCommit: getGitCommitForRelease = getGitCommit,
    runCommand: runCommandForRelease = runCommand,
  } = dependencies
  const options = parseReleaseArgs(argv)
  const pkg = readPackageJson(projectRoot)
  const version = await chooseReleaseVersion(pkg.version, options)
  const gitCommit = getGitCommitForRelease(projectRoot)
  const builtAt = new Date().toISOString()
  const frozenAssistRoot = resolveFrozenAssistRoot(projectRoot, version)

  if (!existsSync(frozenAssistRoot)) {
    const versionBasePath = assistVersionBasePath(version)
    const buildEnv = {
      VITE_SFT_PUBLIC_BASE_PATH: versionBasePath,
      VITE_SFT_PUBLIC_BASE_URL: `https://ginkgo.chinaums.com${versionBasePath}`,
    }
    runCommandForRelease(projectRoot, 'npm', ['run', 'build:static-h5'], buildEnv)
    runCommandForRelease(
      projectRoot,
      'npm',
      ['run', 'build:static-wrapper'],
      buildEnv,
    )
    if (['0.3.0', '0.3.1', '0.3.2'].includes(version)) {
      runCommandForRelease(projectRoot, 'npm', [
        'run', version === '0.3.0' ? 'build:duodian-health' : `build:duodian-health${version.replaceAll('.', '')}`, '--',
        '--base-path', '/sign-pay-pro/',
        '--base-url', 'https://ginkgo.chinaums.com/sign-pay-pro/',
        '--loader-url', `${buildEnv.VITE_SFT_PUBLIC_BASE_URL}custom-verification.html`,
      ])
    }
    createFrozenAssistSnapshot({
      projectRoot,
      version,
      gitCommit,
      builtAt,
    })
  }

  const releaseRoot = assembleReleasePackage({
    projectRoot,
    releaseRoot: path.join(projectRoot, 'release', `static-mobile-auth-${version}`),
    packageName: pkg.name,
    version,
    gitCommit,
    builtAt,
  })
  const assistVersions = listFrozenAssistVersions(
    path.join(projectRoot, 'release-frozen'),
  )
  const frozenAssistRoots = Object.fromEntries(
    assistVersions.map((assistVersion) => [
      assistVersion,
      resolveFrozenAssistRoot(projectRoot, assistVersion),
    ]),
  )

  validateOrThrow(
    releaseRoot,
    version,
    resolveFrozenRoot(projectRoot),
    frozenAssistRoots,
    assistVersions,
  )

  const archivePath = createReleaseArchiveWithRunner(projectRoot, version, runCommandForRelease)
  updatePackageVersionIfNeededWithRunner(projectRoot, pkg, version, runCommandForRelease)

  return {
    version,
    releaseRoot,
    archivePath,
  }
}

async function main() {
  try {
    const result = await runRelease()
    console.log(`[release:static] created ${result.releaseRoot}`)
    console.log(`[release:static] created ${result.archivePath}`)
  } catch (error) {
    if (Array.isArray(error.validationErrors)) {
      for (const entry of error.validationErrors) {
        console.error(`[release:static] ${entry}`)
      }
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (entryFile === fileURLToPath(import.meta.url)) {
  await main()
}
