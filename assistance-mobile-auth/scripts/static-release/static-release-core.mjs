import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import {
  FROZEN_ASSIST_VERSION,
  FROZEN_VERSION,
  listFrozenFiles,
  readFrozenChecksums,
  verifyChecksums,
  verifyFrozenAssets,
} from './frozen-assets.mjs'

const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const allowedBumps = new Set(['major', 'minor', 'patch', 'none'])

export const ROOT_BASE_PATH = '/sign-pay-pro/'
export const ASSIST_BASE_PATH = '/sign-pay-pro/assist/'
export const ASSIST_LAYER_DIR = 'assist'

export function assistVersionBasePath(version) {
  assertValidVersion(version)
  return `${ASSIST_BASE_PATH}${version}/`
}

function layerVerificationQueryContracts(basePath) {
  return {
    probeMode: `${basePath}verification?mode=probe`,
    agreementReader: `${basePath}verification?flow=agreement&doc=entry`,
  }
}

const rrwebContract = {
  version: '2.0.0-alpha.4',
  cdnUrl: 'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js',
  integrity: 'sha384-UpKcjeLZtEcYxELLISURK3MAcN3KQdTx8iygewcEWVl8LqgVrftgiMtuMHod7D8e',
  localFallbackPath: '/sign-pay-pro/assistance-mobile-auth/vendor/rrweb.min.js',
  recordCrossOriginIframes: true,
}
const rrwebFallbackSha256 = '39596e896d80261e0163ea6dc1a00884864a9da53c220486697389a715b293fe'

export function parseReleaseArgs(argv) {
  const options = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--bump') {
      const bump = argv[index + 1]
      if (!bump || bump.startsWith('--')) {
        throw new Error('Missing value for --bump')
      }
      options.bump = bump
      index += 1
      continue
    }

    if (arg === '--version') {
      const version = argv[index + 1]
      if (!version || version.startsWith('--')) {
        throw new Error('Missing value for --version')
      }
      options.version = version
      index += 1
      continue
    }

    if (arg === '--yes') {
      options.yes = true
      continue
    }

    throw new Error(`Unknown release argument: ${arg}`)
  }

  if (options.bump && options.version) {
    throw new Error('Use either --bump or --version, not both')
  }

  return options
}

export function assertValidVersion(version) {
  if (!semverPattern.test(version)) {
    throw new Error(`Invalid semver version: ${version}`)
  }
}

export function resolveNextVersion(currentVersion, options = {}) {
  assertValidVersion(currentVersion)

  if (options.version) {
    assertValidVersion(options.version)
    return options.version
  }

  const bump = options.bump ?? 'none'
  if (!allowedBumps.has(bump)) {
    throw new Error(`Invalid bump value: ${bump}`)
  }
  if (bump === 'none') return currentVersion

  const [, majorRaw, minorRaw, patchRaw] = currentVersion.match(semverPattern)
  const major = Number(majorRaw)
  const minor = Number(minorRaw)
  const patch = Number(patchRaw)

  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  return `${major + 1}.0.0`
}

export function createManifest({
  packageName,
  version,
  gitCommit,
  builtAt,
  frozenSourceGitCommit,
  assistFrozenSourceGitCommit,
  assistVersions = [version],
}) {
  return {
    packageName,
    version,
    gitCommit,
    builtAt,
    frozenSourceGitCommit: frozenSourceGitCommit ?? null,
    assistFrozenSourceGitCommit: assistFrozenSourceGitCommit ?? null,
    availableAssistVersions: [...assistVersions],
    ...buildManifestContract(version),
  }
}

export function createReadme({ version, assistVersions = [version] }) {
  const assistVersionList = assistVersions
    .map((assistVersion) => {
      const basePath = assistVersionBasePath(assistVersion)
      return `### ${assistVersion}（冻结 assist 层）

- \`${basePath}assistance-mobile-auth/assistance-mobile-auth.js\`
- \`${basePath}assistance-mobile-auth/assistance-mobile-auth.umd.cjs\`
- \`${basePath}assistance-mobile-auth/assistance-mobile-auth.${assistVersion}.js\`
- \`${basePath}assistance-mobile-auth/assistance-mobile-auth.${assistVersion}.umd.cjs\`
- \`${basePath}assistance-mobile-auth/vendor/rrweb.min.js\`
- \`${basePath}verification\`
`
    })
    .join('\n')

  return `# 银杏助理 JSSDK 静态资源包

版本：${version}

本包用于正式环境静态资源部署，必须挂载到 \`/sign-pay-pro/\`。本包不包含 BFF、API、test page、debug、business demo、H5 redirect 会话服务。

## 包内容

- \`dist/\`：iframe 授权页和 JSSDK 静态资源。
- \`nginx/sign-pay-pro-static.conf\`：nginx 示例配置。
- \`manifest.json\`：版本、构建信息和公开 URL 清单。
- \`TODO.md\`：H5 独立部署后续事项。

## 公开 URL

### ${FROZEN_VERSION}（冻结层，存量客户）

- \`/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.js\`
- \`/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.umd.cjs\`
- \`/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.${FROZEN_VERSION}.js\`
- \`/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.${FROZEN_VERSION}.umd.cjs\`
- \`/sign-pay-pro/assistance-mobile-auth/vendor/rrweb.min.js\`
- \`/sign-pay-pro/verification\`（含 \`?mode=probe\`、\`?flow=agreement&doc=entry\`）

\`/sign-pay-pro/assist/\` 下必须显式携带 \`x.y.z\` 版本号；不带版本号的路径返回 404。

${assistVersionList}

## 部署方法

1. 将本包解压到服务器目录，例如 \`/opt/mobile-auth-static/\`。
2. 将 nginx 示例中的 \`/opt/mobile-auth-static/dist\` 改成实际 \`dist\` 绝对路径。
3. 将配置放入 nginx，例如 \`/etc/nginx/conf.d/sign-pay-pro-static.conf\`。
4. 执行 \`nginx -t && nginx -s reload\`。

## 验证命令

\`\`\`bash
curl -I https://your-domain/sign-pay-pro/verification
curl -I "https://your-domain/sign-pay-pro/verification?mode=probe"
curl -I "https://your-domain/sign-pay-pro/verification?flow=agreement&doc=entry"
curl -I https://your-domain/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.js
curl -I https://your-domain/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.umd.cjs
curl -I https://your-domain/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.${FROZEN_VERSION}.js
curl -I https://your-domain/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.${FROZEN_VERSION}.umd.cjs
curl -I https://your-domain/sign-pay-pro/api/
curl -I https://your-domain/sign-pay-pro/test-page
curl -I https://your-domain/sign-pay-pro/business-demo
curl -I https://your-domain/sign-pay-pro/debug
curl -I https://your-domain/sign-pay-pro/auth
curl -I https://your-domain/sign-pay-pro/test-callback
curl -I https://your-domain${assistVersionBasePath(version)}verification
curl -I https://your-domain${assistVersionBasePath(version)}assistance-mobile-auth/assistance-mobile-auth.${version}.umd.cjs
\`\`\`

\`.umd.cjs\` 必须返回 JavaScript MIME，不能返回 HTML。版本化 wrapper 打开的 iframe 必须保持在同一 \`/sign-pay-pro/assist/<version>/\` 路径。

## 移动官方 JSSDK

正式静态包固定加载移动官方 prod JSSDK 1.0.6：\`https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js\`。

## rrweb 跨域 iframe 录制

授权 iframe 使用 rrweb 2.0.0-alpha.4。页面优先加载固定版本 CDN：
\`https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js\`。
CDN 加载失败时回退到：
\`/sign-pay-pro/assistance-mobile-auth/vendor/rrweb.min.js\`。
assist 层兜底路径位于对应的 \`/sign-pay-pro/assist/<version>/assistance-mobile-auth/vendor/rrweb.min.js\`。
rrweb 加载或启动失败不会阻断认证流程。

## 缓存与回滚

版本化 JSSDK 文件可以长缓存；非版本化 JSSDK 文件、\`index.html\` 和 \`/verification\` 不建议长缓存。回滚时替换整个 release 目录或切回上一版静态目录。
`
}

function createLayerLocationBlocks({ basePath, aliasRoot }) {
  const queryContracts = layerVerificationQueryContracts(basePath)
  const regexBasePath = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return `    location = ${basePath} {
        return 302 ${basePath}verification$is_args$args;
    }

    location = ${basePath}assistance-mobile-auth/assistance-mobile-auth.umd.cjs {
        alias ${aliasRoot}/assistance-mobile-auth/assistance-mobile-auth.umd.cjs;
        types {}
        default_type text/javascript;
        add_header Cache-Control "no-store";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location = ${basePath}assistance-mobile-auth/assistance-mobile-auth.js {
        alias ${aliasRoot}/assistance-mobile-auth/assistance-mobile-auth.js;
        add_header Cache-Control "no-store";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location ~* ^${regexBasePath}assistance-mobile-auth/(assistance-mobile-auth\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.umd\\.cjs)$ {
        alias ${aliasRoot}/assistance-mobile-auth/$1;
        types {}
        default_type text/javascript;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location ~* ^${regexBasePath}assistance-mobile-auth/(assistance-mobile-auth\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.js)$ {
        alias ${aliasRoot}/assistance-mobile-auth/$1;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location ~* ^${regexBasePath}assistance-mobile-auth/(.*\\.cjs)$ {
        alias ${aliasRoot}/assistance-mobile-auth/$1;
        types {}
        default_type text/javascript;
        add_header Cache-Control "no-cache";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location = ${basePath}assistance-mobile-auth/vendor/rrweb.min.js {
        alias ${aliasRoot}/assistance-mobile-auth/vendor/rrweb.min.js;
        types {}
        default_type text/javascript;
        add_header Cache-Control "no-cache";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location ${basePath}assistance-mobile-auth/ {
        alias ${aliasRoot}/assistance-mobile-auth/;
        add_header Cache-Control "no-cache";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location ^~ ${basePath}assets/ {
        alias ${aliasRoot}/assets/;
        add_header Cache-Control "no-cache";
    }

    location = ${basePath}verification {
        # Query-mode contracts on the same iframe entry:
        # - ${queryContracts.probeMode}
        # - ${queryContracts.agreementReader}
        alias ${aliasRoot}/index.html;
        default_type text/html;
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
        add_header Content-Security-Policy "frame-ancestors 'self' https: http://localhost:* http://127.0.0.1:*";
        add_header Cache-Control "no-store";
    }
`
}

function createGenericAssistLocationBlocks(releaseRootPlaceholder) {
  return `    location = /sign-pay-pro/assist { return 404; }

    location ~ ^/sign-pay-pro/assist/(?<assist_version>[0-9]+\\.[0-9]+\\.[0-9]+)/?$ {
        return 302 /sign-pay-pro/assist/$assist_version/verification$is_args$args;
    }

    location ~ ^/sign-pay-pro/assist/(?<assist_version>[0-9]+\\.[0-9]+\\.[0-9]+)/verification$ {
        alias ${releaseRootPlaceholder}/assist/$assist_version/index.html;
        default_type text/html;
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
        add_header Content-Security-Policy "frame-ancestors 'self' https: http://localhost:* http://127.0.0.1:*";
        add_header Cache-Control "no-store";
    }

    location ~* ^/sign-pay-pro/assist/(?<assist_version>[0-9]+\\.[0-9]+\\.[0-9]+)/(?<assist_cjs_path>.+\\.cjs)$ {
        alias ${releaseRootPlaceholder}/assist/$assist_version/$assist_cjs_path;
        types {}
        default_type text/javascript;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location ~ ^/sign-pay-pro/assist/(?<assist_version>[0-9]+\\.[0-9]+\\.[0-9]+)/(?<assist_file_path>.+)$ {
        alias ${releaseRootPlaceholder}/assist/$assist_version/$assist_file_path;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        add_header Cross-Origin-Resource-Policy "cross-origin";
    }

    location /sign-pay-pro/assist/ { return 404; }
`
}

export function createNginxConfig({
  releaseRootPlaceholder,
}) {
  return `server {
    listen 80;
    server_name _;

    location ^~ /sign-pay-pro/api/ { return 404; }
    location = /sign-pay-pro/test-page { return 404; }
    location = /sign-pay-pro/test-page-hk { return 404; }
    location = /sign-pay-pro/business-demo { return 404; }
    location = /sign-pay-pro/debug { return 404; }
    location = /sign-pay-pro/auth { return 404; }
    location = /sign-pay-pro/test-callback { return 404; }

${createGenericAssistLocationBlocks(releaseRootPlaceholder)}
${createLayerLocationBlocks({
    basePath: ROOT_BASE_PATH,
    aliasRoot: releaseRootPlaceholder,
  })}}
`
}

export function createDeferredH5Note(version) {
  return `# Deferred H5 Deployment

版本：${version}

H5 独立部署暂不在本次静态资源包内实现。本包只保证 wrapper JSSDK 与 iframe 授权页静态资源。
`
}

export function validateReleaseDirectory(
  root,
  version,
  {
    frozenRoot,
    frozenAssistRoot,
    frozenAssistRoots,
    assistVersions = frozenAssistRoots ? Object.keys(frozenAssistRoots) : [version],
  } = {},
) {
  const errors = []
  const layerChecks = [
    { distPrefix: 'dist', layerVersion: FROZEN_VERSION },
    ...assistVersions.map((assistVersion) => ({
      distPrefix: `dist/${ASSIST_LAYER_DIR}/${assistVersion}`,
      layerVersion: assistVersion,
    })),
  ]

  const mustExist = ['nginx/sign-pay-pro-static.conf', 'manifest.json', 'README.md', 'TODO.md']
  for (const { distPrefix, layerVersion } of layerChecks) {
    mustExist.push(
      `${distPrefix}/index.html`,
      `${distPrefix}/assistance-mobile-auth/assistance-mobile-auth.js`,
      `${distPrefix}/assistance-mobile-auth/assistance-mobile-auth.umd.cjs`,
      `${distPrefix}/assistance-mobile-auth/assistance-mobile-auth.${layerVersion}.js`,
      `${distPrefix}/assistance-mobile-auth/assistance-mobile-auth.${layerVersion}.umd.cjs`,
      `${distPrefix}/assistance-mobile-auth/vendor/new-control-style.css`,
      `${distPrefix}/assistance-mobile-auth/vendor/rrweb.min.js`,
    )
  }

  for (const relative of mustExist) {
    if (!existsSync(path.join(root, relative))) {
      errors.push(`Missing required release file: ${relative}`)
    }
  }

  // assist 层 rrweb 固定 SHA 校验（根层 rrweb 由冻结 checksum 把关）
  for (const assistVersion of assistVersions) {
    const assistRrwebPath = path.join(
      root,
      `dist/${ASSIST_LAYER_DIR}/${assistVersion}/assistance-mobile-auth/vendor/rrweb.min.js`,
    )
    if (existsSync(assistRrwebPath)) {
      const actualSha256 = createHash('sha256').update(readFileSync(assistRrwebPath)).digest('hex')
      if (actualSha256 !== rrwebFallbackSha256) {
        errors.push(
          `assist ${assistVersion} rrweb fallback SHA-256 mismatch: expected ${rrwebFallbackSha256}, got ${actualSha256}`,
        )
      }
    }
  }

  // 根层字节冻结校验
  if (frozenRoot) {
    if (!existsSync(frozenRoot)) {
      errors.push(`Frozen assets directory missing: ${frozenRoot}`)
    } else {
      errors.push(...verifyFrozenAssets(frozenRoot))
      const checksums = readFrozenChecksums(frozenRoot)
      errors.push(...verifyChecksums(root, checksums))

      for (const relative of listFrozenFiles(path.join(root, 'dist'))) {
        if (relative.startsWith(`${ASSIST_LAYER_DIR}/`)) {
          continue
        }
        if (!(`dist/${relative}` in checksums)) {
          errors.push(`Unexpected file in frozen root layer: dist/${relative}`)
        }
      }
    }
  }

  // assist 层字节冻结校验
  const resolvedFrozenAssistRoots =
    frozenAssistRoots ?? (frozenAssistRoot ? { [version]: frozenAssistRoot } : {})
  for (const [assistVersion, assistRoot] of Object.entries(resolvedFrozenAssistRoots)) {
    if (!existsSync(assistRoot)) {
      errors.push(`Frozen assist assets directory missing: ${assistRoot}`)
    } else {
      errors.push(...verifyFrozenAssets(assistRoot))
      const assistChecksums = Object.fromEntries(
        Object.entries(readFrozenChecksums(assistRoot)).map(([relative, checksum]) => [
          `dist/${ASSIST_LAYER_DIR}/${assistVersion}/${relative.slice('dist/'.length)}`,
          checksum,
        ]),
      )
      errors.push(...verifyChecksums(root, assistChecksums))

      const frozenChecksums = readFrozenChecksums(assistRoot)
      for (const relative of listFrozenFiles(
        path.join(root, 'dist', ASSIST_LAYER_DIR, assistVersion),
      )) {
        if (!(`dist/${relative}` in frozenChecksums)) {
          errors.push(
            `Unexpected file in frozen assist ${assistVersion} layer: dist/${ASSIST_LAYER_DIR}/${assistVersion}/${relative}`,
          )
        }
      }
    }
  }

  validateForbiddenReleaseEntries(root, errors)

  try {
    const manifest = JSON.parse(readFileSync(path.join(root, 'manifest.json'), 'utf8'))
    if (manifest.version !== version) {
      errors.push(`manifest.json version mismatch: expected ${version}, got ${manifest.version}`)
    }
    validateManifestContract(manifest, version, errors)
    if (JSON.stringify(manifest.availableAssistVersions) !== JSON.stringify(assistVersions)) {
      errors.push(
        `manifest.json availableAssistVersions mismatch: expected ${JSON.stringify(assistVersions)}, got ${JSON.stringify(manifest.availableAssistVersions)}`,
      )
    }
  } catch (error) {
    errors.push(`manifest.json is not readable JSON: ${formatError(error)}`)
  }

  const nginxConfigPath = path.join(root, 'nginx/sign-pay-pro-static.conf')
  const nginxConfig = existsSync(nginxConfigPath) ? readFileSync(nginxConfigPath, 'utf8') : ''
  validateNginxStaticContract(nginxConfig, errors)

  const forbiddenPatterns = [
    { pattern: /jssdk-1\.0\.7\.min\.js/, label: 'mobile official test vendor 1.0.7' },
    { pattern: /\/sign-pay-pro\/api\//, label: 'same-origin API path' },
    { pattern: /test-page|business-demo|DebugConfigPage|DebugAuthWindow/, label: 'internal test/debug entry' },
  ]

  for (const relative of listFiles(path.join(root, 'dist'))) {
    const full = path.join(root, 'dist', relative)
    const text = readFileSync(full, 'utf8')
    for (const item of forbiddenPatterns) {
      if (item.pattern.test(text)) {
        errors.push(`Forbidden ${item.label} found in dist/${relative}`)
      }
    }
  }

  return errors
}

function validateForbiddenReleaseEntries(root, errors) {
  for (const entry of listReleaseEntries(root)) {
    const relative = toPosix(entry.relative)
    const segments = relative.split('/')
    const basename = segments.at(-1)

    if (segments.includes('dist-bff')) {
      addUniqueError(
        errors,
        `Forbidden release file exists: ${pathThroughSegment(segments, 'dist-bff')}`,
      )
    }
    if (basename === '.env' || basename.startsWith('.env.')) {
      addUniqueError(errors, `Forbidden release file exists: ${relative}`)
    }
    if (basename === 'jssdk-1.0.7.min.js') {
      addUniqueError(errors, `Forbidden release file exists: ${relative}`)
    }
    if (segments.includes('node_modules')) {
      addUniqueError(
        errors,
        `Forbidden release file exists: ${pathThroughSegment(segments, 'node_modules')}`,
      )
    }
    if (isDockerArtifact(basename)) {
      addUniqueError(errors, `Forbidden Docker artifact exists: ${relative}`)
    }
    if (isPm2Config(basename)) {
      addUniqueError(errors, `Forbidden pm2 config exists: ${relative}`)
    }
  }
}

function validateNginxStaticContract(
  nginxConfig,
  errors,
) {
  if (nginxConfig.includes('try_files $request_filename =404;')) {
    errors.push('nginx config contains alias-incompatible try_files $request_filename')
  }

  for (const route of [
    { path: '/sign-pay-pro/api/', exact: false },
    { path: '/sign-pay-pro/test-page', exact: true },
    { path: '/sign-pay-pro/test-page-hk', exact: true },
    { path: '/sign-pay-pro/business-demo', exact: true },
    { path: '/sign-pay-pro/debug', exact: true },
    { path: '/sign-pay-pro/auth', exact: true },
    { path: '/sign-pay-pro/test-callback', exact: true },
  ]) {
    if (!hasForbiddenRoute404(nginxConfig, route)) {
      errors.push(`nginx config is missing forbidden route 404 for ${route.path}`)
    }
  }

  validateNginxLayerContract(nginxConfig, ROOT_BASE_PATH, errors)
  validateGenericAssistContract(nginxConfig, errors)
}

function validateGenericAssistContract(nginxConfig, errors) {
  const versionPattern = '(?<assist_version>[0-9]+\\.[0-9]+\\.[0-9]+)'

  if (!nginxConfig.includes('location = /sign-pay-pro/assist { return 404; }')) {
    errors.push('nginx config is missing unversioned assist root 404')
  }
  if (!nginxConfig.includes('location /sign-pay-pro/assist/ { return 404; }')) {
    errors.push('nginx config is missing unversioned assist path 404')
  }
  if (
    !nginxConfig.includes(
      'return 302 /sign-pay-pro/assist/$assist_version/verification$is_args$args;',
    )
  ) {
    errors.push('nginx config is missing generic assist version root redirect')
  }

  const verificationBlock = findNginxLocationBlock(
    nginxConfig,
    `location ~ ^/sign-pay-pro/assist/${versionPattern}/verification$`,
  )
  if (
    !verificationBlock.includes('alias /opt/mobile-auth-static/dist/assist/$assist_version/index.html;')
    || !hasVerificationHtmlMime(verificationBlock)
    || !hasFrameAncestors(verificationBlock)
    || !hasNoStoreCache(verificationBlock)
  ) {
    errors.push('nginx config is missing generic assist verification mapping')
  }

  const cjsBlock = findNginxLocationBlock(
    nginxConfig,
    `location ~* ^/sign-pay-pro/assist/${versionPattern}/(?<assist_cjs_path>.+\\.cjs)$`,
  )
  if (
    !cjsBlock.includes(
      'alias /opt/mobile-auth-static/dist/assist/$assist_version/$assist_cjs_path;',
    )
    || !hasCjsJavascriptMime(cjsBlock)
    || !hasImmutableCache(cjsBlock)
    || !hasOneYearExpiry(cjsBlock)
  ) {
    errors.push('nginx config is missing generic assist .cjs mapping')
  }

  const fileBlock = findNginxLocationBlock(
    nginxConfig,
    `location ~ ^/sign-pay-pro/assist/${versionPattern}/(?<assist_file_path>.+)$`,
  )
  if (
    !fileBlock.includes(
      'alias /opt/mobile-auth-static/dist/assist/$assist_version/$assist_file_path;',
    )
    || !hasImmutableCache(fileBlock)
    || !hasOneYearExpiry(fileBlock)
  ) {
    errors.push('nginx config is missing generic assist static file mapping')
  }
}

function validateNginxLayerContract(nginxConfig, basePath, errors) {
  const layerTag = `[layer ${basePath}]`
  const regexBasePath = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const wrapperBlocks = [
    {
      label: `${layerTag} non-versioned UMD wrapper`,
      block: findNginxLocationBlock(
        nginxConfig,
        `location = ${basePath}assistance-mobile-auth/assistance-mobile-auth.umd.cjs`,
      ),
    },
    {
      label: `${layerTag} non-versioned ESM wrapper`,
      block: findNginxLocationBlock(
        nginxConfig,
        `location = ${basePath}assistance-mobile-auth/assistance-mobile-auth.js`,
      ),
    },
    {
      label: `${layerTag} versioned UMD wrapper`,
      block: findNginxLocationBlock(
        nginxConfig,
        `^${regexBasePath}assistance-mobile-auth/(assistance-mobile-auth\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.umd\\.cjs)$`,
      ),
    },
    {
      label: `${layerTag} versioned ESM wrapper`,
      block: findNginxLocationBlock(
        nginxConfig,
        `^${regexBasePath}assistance-mobile-auth/(assistance-mobile-auth\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.js)$`,
      ),
    },
  ]

  const rrwebBlock = findNginxLocationBlock(
    nginxConfig,
    `location = ${basePath}assistance-mobile-auth/vendor/rrweb.min.js`,
  )
  if (!hasCjsJavascriptMime(rrwebBlock) || !hasNoCacheCache(rrwebBlock)) {
    errors.push(`nginx config is missing rrweb JavaScript MIME or no-cache policy ${layerTag}`)
  }

  const [nonVersionedUmdBlock, nonVersionedEsmBlock, versionedUmdBlock, versionedEsmBlock] =
    wrapperBlocks.map((item) => item.block)
  const cjsFallbackBlock = findNginxLocationBlock(
    nginxConfig,
    `^${regexBasePath}assistance-mobile-auth/(.*\\.cjs)$`,
  )
  const wrapperFallbackBlock = findNginxLocationBlock(
    nginxConfig,
    `location ${basePath}assistance-mobile-auth/`,
  )
  const assetsBlock = findNginxLocationBlock(nginxConfig, `location ^~ ${basePath}assets/`)
  const verificationBlock = findNginxLocationBlock(nginxConfig, `location = ${basePath}verification`)

  if (![nonVersionedUmdBlock, versionedUmdBlock, cjsFallbackBlock].every(hasCjsJavascriptMime)) {
    errors.push(`nginx config is missing .cjs JavaScript MIME rule ${layerTag}`)
  }
  if (!hasFrameAncestors(verificationBlock)) {
    errors.push(`nginx config is missing iframe frame-ancestors policy ${layerTag}`)
  }
  if (!hasVerificationIndexMapping(verificationBlock, basePath)) {
    errors.push(`nginx config is missing ${basePath}verification index.html mapping`)
  }
  if (!hasVerificationHtmlMime(verificationBlock)) {
    errors.push(`nginx config is missing text/html MIME for verification ${layerTag}`)
  }
  for (const [key, verificationUrl] of Object.entries(layerVerificationQueryContracts(basePath))) {
    if (!hasVerificationQueryContract(nginxConfig, verificationUrl)) {
      errors.push(`nginx config is missing verification query-mode contract for ${key} ${layerTag}`)
    }
  }
  if (!hasBasePathRedirect(nginxConfig, basePath)) {
    errors.push(`nginx config is missing ${basePath} redirect to verification`)
  }
  if (
    ![versionedUmdBlock, versionedEsmBlock].every(
      (block) => hasImmutableCache(block) && hasOneYearExpiry(block),
    )
  ) {
    errors.push(`nginx config is missing immutable cache for versioned wrappers ${layerTag}`)
  }
  if (![nonVersionedUmdBlock, nonVersionedEsmBlock, verificationBlock].every(hasNoStoreCache)) {
    errors.push(`nginx config is missing no-store cache for non-versioned wrappers and verification ${layerTag}`)
  }
  if (![cjsFallbackBlock, wrapperFallbackBlock, assetsBlock].every(hasNoCacheCache)) {
    errors.push(`nginx config is missing no-cache behavior for non-versioned asset fallbacks ${layerTag}`)
  }
}

function listFiles(dir, prefix = '') {
  if (!existsSync(dir)) {
    return []
  }

  const files = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const relative = path.join(prefix, entry)
    const stat = statSync(full)

    if (stat.isDirectory()) {
      files.push(...listFiles(full, relative))
    } else if (stat.isFile() && stat.size < 5_000_000) {
      files.push(relative)
    }
  }

  return files
}

function layerPublicUrls(basePath, version) {
  return {
    wrapperEsm: `${basePath}assistance-mobile-auth/assistance-mobile-auth.js`,
    wrapperUmd: `${basePath}assistance-mobile-auth/assistance-mobile-auth.umd.cjs`,
    versionedWrapperEsm: `${basePath}assistance-mobile-auth/assistance-mobile-auth.${version}.js`,
    versionedWrapperUmd: `${basePath}assistance-mobile-auth/assistance-mobile-auth.${version}.umd.cjs`,
    iframeVerification: `${basePath}verification`,
    ...layerVerificationQueryContracts(basePath),
  }
}

function layerContract(basePath, version, frozen) {
  return {
    version,
    basePath,
    frozen,
    publicUrls: layerPublicUrls(basePath, version),
    mobileOfficialJssdk: {
      version: '1.0.6',
      jsUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js',
      cssLocalPath: `${basePath}assistance-mobile-auth/vendor/new-control-style.css`,
    },
    rrweb: {
      ...rrwebContract,
      localFallbackPath: `${basePath}assistance-mobile-auth/vendor/rrweb.min.js`,
    },
  }
}

function buildManifestContract(version) {
  return {
    layers: {
      frozen: layerContract(ROOT_BASE_PATH, FROZEN_VERSION, true),
      current: layerContract(assistVersionBasePath(version), version, true),
    },
    includes: {
      bff: false,
      api: false,
      testPage: false,
      debugPage: false,
      businessDemo: false,
      h5RedirectSession: false,
      mobileOfficialTestVendor107: false,
    },
  }
}

function validateManifestContract(manifest, version, errors) {
  const expected = buildManifestContract(version)

  for (const [layerKey, expectedLayer] of Object.entries(expected.layers)) {
    const actualLayer = manifest?.layers?.[layerKey]
    compareManifestValue(errors, `layers.${layerKey}.version`, actualLayer?.version, expectedLayer.version)
    compareManifestValue(errors, `layers.${layerKey}.basePath`, actualLayer?.basePath, expectedLayer.basePath)
    compareManifestValue(errors, `layers.${layerKey}.frozen`, actualLayer?.frozen, expectedLayer.frozen)

    for (const [key, value] of Object.entries(expectedLayer.publicUrls)) {
      compareManifestValue(errors, `layers.${layerKey}.publicUrls.${key}`, actualLayer?.publicUrls?.[key], value)
    }
    for (const [key, value] of Object.entries(expectedLayer.mobileOfficialJssdk)) {
      compareManifestValue(
        errors,
        `layers.${layerKey}.mobileOfficialJssdk.${key}`,
        actualLayer?.mobileOfficialJssdk?.[key],
        value,
      )
    }
    for (const [key, value] of Object.entries(expectedLayer.rrweb)) {
      compareManifestValue(errors, `layers.${layerKey}.rrweb.${key}`, actualLayer?.rrweb?.[key], value)
    }
  }

  for (const [key, value] of Object.entries(expected.includes)) {
    compareManifestValue(errors, `includes.${key}`, manifest?.includes?.[key], value)
  }
}

function compareManifestValue(errors, keyPath, actual, expected) {
  if (actual !== expected) {
    errors.push(`manifest.json ${keyPath} mismatch: expected ${expected}, got ${actual}`)
  }
}

function listReleaseEntries(dir, prefix = '') {
  if (!existsSync(dir)) {
    return []
  }

  const entries = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const relative = path.join(prefix, entry)
    const stat = statSync(full)
    entries.push({ relative, isDirectory: stat.isDirectory(), isFile: stat.isFile() })

    if (stat.isDirectory()) {
      entries.push(...listReleaseEntries(full, relative))
    }
  }

  return entries
}

function hasForbiddenRoute404(nginxConfig, { path: routePath, exact }) {
  const locationPrefix = exact ? '(?:=\\s+)?' : '(?:\\^~\\s+)?'
  return new RegExp(
    `location\\s+${locationPrefix}${escapeRegex(routePath)}\\s*\\{[^}]*return\\s+404\\s*;`,
    'm',
  ).test(nginxConfig)
}

function findNginxLocationBlock(nginxConfig, marker) {
  const markerIndex = nginxConfig.indexOf(marker)
  if (markerIndex === -1) {
    return ''
  }

  const start = nginxConfig.lastIndexOf('location', markerIndex)
  if (start === -1) {
    return ''
  }

  const afterMarker = markerIndex + marker.length
  const nextLocation = /\n\s*location\s/.exec(nginxConfig.slice(afterMarker))
  const end = nextLocation ? afterMarker + nextLocation.index : nginxConfig.length
  return nginxConfig.slice(start, end)
}

function hasCjsJavascriptMime(block) {
  return /types\s*\{\s*\}/.test(block) && /default_type\s+text\/javascript\s*;/.test(block)
}

function hasFrameAncestors(block) {
  return /add_header\s+Content-Security-Policy\s+"[^"]*frame-ancestors[^"]*"\s*;/.test(block)
}

function hasVerificationIndexMapping(block, basePath) {
  return new RegExp(`location\\s+=\\s+${escapeRegex(basePath)}verification`).test(block) &&
    /alias\s+\S*\/index\.html\s*;/.test(block)
}

function hasVerificationHtmlMime(block) {
  return /default_type\s+text\/html\s*;/.test(block)
}

function hasBasePathRedirect(nginxConfig, basePath) {
  return new RegExp(
    `location\\s+=\\s+${escapeRegex(basePath)}\\s*\\{[^}]*return\\s+30[1278]\\s+${escapeRegex(basePath)}verification(?:\\$is_args\\$args)?\\s*;`,
  ).test(nginxConfig)
}

function hasVerificationQueryContract(nginxConfig, verificationUrl) {
  return nginxConfig.includes(verificationUrl)
}

function hasImmutableCache(block) {
  return /add_header\s+Cache-Control\s+"[^"]*public[^"]*immutable[^"]*"\s*;/.test(block)
}

function hasOneYearExpiry(block) {
  return /expires\s+1y\s*;/.test(block)
}

function hasNoStoreCache(block) {
  return /add_header\s+Cache-Control\s+"[^"]*no-store[^"]*"\s*;/.test(block)
}

function hasNoCacheCache(block) {
  return /add_header\s+Cache-Control\s+"[^"]*no-cache[^"]*"\s*;/.test(block)
}

function isDockerArtifact(basename) {
  const lower = basename.toLowerCase()
  return lower === 'dockerfile' ||
    lower.startsWith('dockerfile.') ||
    lower === '.dockerignore' ||
    lower === 'compose.yml' ||
    lower === 'compose.yaml' ||
    (lower.startsWith('docker-compose.') && (lower.endsWith('.yml') || lower.endsWith('.yaml')))
}

function isPm2Config(basename) {
  const lower = basename.toLowerCase()
  return /^(ecosystem|pm2)\.config\.(js|cjs|mjs|json)$/.test(lower) || lower === 'pm2.json'
}

function pathThroughSegment(segments, segment) {
  return segments.slice(0, segments.indexOf(segment) + 1).join('/')
}

function addUniqueError(errors, message) {
  if (!errors.includes(message)) {
    errors.push(message)
  }
}

function toPosix(relative) {
  return relative.split(path.sep).join('/')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}
