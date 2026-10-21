import { createHash } from 'node:crypto'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'

import {
  assistVersionBasePath,
  createDeferredH5Note,
  createManifest,
  createNginxConfig,
  createReadme,
  parseReleaseArgs,
  resolveNextVersion,
  validateReleaseDirectory,
} from './static-release-core.mjs'
import {
  FROZEN_ASSIST_VERSION,
  FROZEN_VERSION,
  listFrozenAssistVersions,
  listFrozenFiles,
} from './frozen-assets.mjs'
import { assembleReleasePackage, runRelease } from './release-static.mjs'

const customer030Files = [
  'custom-verification.html', 'assets/custom-030.js',
  'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.0.js',
  'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.0.umd.cjs',
  'assistance-mobile-auth/vendor/new-control-style.css',
]
function create030ReleaseRunner(problem) {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-030-'))
  createFrozenFixture(projectRoot)
  writeFixtureFile(projectRoot, 'package.json', JSON.stringify({ name: 'mobile-auth-h5', version: '0.3.0' }))
  const calls = []
  return { projectRoot, calls, runner: (_root, command, args) => {
    calls.push([command, ...args].join(' '))
    if (args[1] === 'build:static-h5') {
      writeFixtureFile(projectRoot, 'dist-static/index.html', '<html>generic 030</html>')
      writeFixtureFile(projectRoot, 'dist-static/assistance-mobile-auth/vendor/rrweb.min.js', realRrweb())
    }
    if (args[1] === 'build:static-wrapper') {
      writeFixtureFile(projectRoot, 'dist-wrapper/assistance-mobile-auth.js', 'export const generic030 = true')
      writeFixtureFile(projectRoot, 'dist-wrapper/assistance-mobile-auth.umd.cjs', 'module.exports = { generic030: true }')
      writeFixtureFile(projectRoot, 'dist-wrapper/vendor/new-control-style.css', 'body{}')
    }
    if (args[1] === 'build:duodian-health') {
      if (problem === 'failure') throw new Error('Customer builder failed')
      for (const file of customer030Files) {
        if (problem === 'missing' && file === 'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.0.umd.cjs') continue
        writeFixtureFile(projectRoot, `dist-duodian-health-temp/assist/0.3.0/${file}`, `formal ${file}`)
      }
      writeFixtureFile(projectRoot, 'dist-duodian-health-temp/test-duodian-health-0.3.0.html', 'must not ship')
    }
  } }
}

const customer031Files = [
  'custom-verification.html', 'assets/custom-031.js',
  'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.1.js',
  'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.1.umd.cjs',
  'assistance-mobile-auth/vendor/new-control-style.css',
]

function create031ReleaseRunner(problem) {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-031-'))
  createFrozenFixture(projectRoot)
  createFrozenVersionFixture(projectRoot, '0.3.0', {
    index: '<html>historical 030</html>', sourceCommit: 'formal030', marker: 'generic030', rrweb: realRrweb(),
  })
  writeFixtureFile(projectRoot, 'package.json', JSON.stringify({ name: 'mobile-auth-h5', version: '0.3.1' }))
  const calls = []
  return { projectRoot, calls, runner: (_root, command, args, extraEnv = {}) => {
    calls.push({ command: [command, ...args].join(' '), extraEnv })
    if (args[1] === 'build:static-h5') {
      writeFixtureFile(projectRoot, 'dist-static/index.html', '<html><script src="/sign-pay-pro/assist/0.3.1/assets/probe-031.js"></script></html>')
      writeFixtureFile(projectRoot, 'dist-static/assets/probe-031.js', 'export const probe031 = true')
      writeFixtureFile(projectRoot, 'dist-static/assistance-mobile-auth/vendor/rrweb.min.js', realRrweb())
    }
    if (args[1] === 'build:static-wrapper') {
      writeFixtureFile(projectRoot, 'dist-wrapper/assistance-mobile-auth.js', 'export const generic031 = true')
      writeFixtureFile(projectRoot, 'dist-wrapper/assistance-mobile-auth.umd.cjs', 'module.exports = { generic031: true }')
      writeFixtureFile(projectRoot, 'dist-wrapper/vendor/new-control-style.css', 'body{}')
    }
    if (args[1] === 'build:duodian-health031') {
      if (problem === 'failure') throw new Error('Customer builder failed')
      for (const file of customer031Files) {
        if (problem === 'missing' && file.endsWith('.umd.cjs')) continue
        if (problem === 'assets' && file.startsWith('assets/')) continue
        writeFixtureFile(projectRoot, `dist-duodian-health031-temp/assist/0.3.1/${file}`, `formal ${file}`)
      }
      writeFixtureFile(projectRoot, 'dist-duodian-health031-temp/test-host.html', 'must not ship')
    }
  } }
}

const customer032Files = [
  'custom-verification.html', 'assets/custom-032.js',
  'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.js',
  'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.umd.cjs',
  'assistance-mobile-auth/vendor/new-control-style.css',
]

function create032ReleaseRunner(problem) {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-032-'))
  createFrozenFixture(projectRoot)
  createFrozenVersionFixture(projectRoot, '0.3.0', {
    index: '<html>historical 030</html>', sourceCommit: 'formal030', marker: 'generic030', rrweb: realRrweb(),
  })
  createFrozenVersionFixture(projectRoot, '0.3.1', {
    index: '<html>historical 031</html>', sourceCommit: 'formal031', marker: 'generic031', rrweb: realRrweb(),
  })
  writeFixtureFile(projectRoot, 'package.json', JSON.stringify({ name: 'mobile-auth-h5', version: '0.3.2' }))
  const calls = []
  return { projectRoot, calls, runner: (_root, command, args, extraEnv = {}) => {
    calls.push({ command: [command, ...args].join(' '), extraEnv })
    if (args[1] === 'build:static-h5') {
      writeFixtureFile(projectRoot, 'dist-static/index.html', '<html><script src="/sign-pay-pro/assist/0.3.2/assets/probe-032.js"></script></html>')
      writeFixtureFile(projectRoot, 'dist-static/assets/probe-032.js', 'export const probe032 = true')
      writeFixtureFile(projectRoot, 'dist-static/assistance-mobile-auth/vendor/rrweb.min.js', realRrweb())
    }
    if (args[1] === 'build:static-wrapper') {
      writeFixtureFile(projectRoot, 'dist-wrapper/assistance-mobile-auth.js', 'export const generic032 = true')
      writeFixtureFile(projectRoot, 'dist-wrapper/assistance-mobile-auth.umd.cjs', 'module.exports = { generic032: true }')
      writeFixtureFile(projectRoot, 'dist-wrapper/vendor/new-control-style.css', 'body{}')
    }
    if (args[1] === 'build:duodian-health032') {
      if (problem === 'failure') throw new Error('Customer builder failed')
      for (const file of customer032Files) {
        if (problem === 'missing' && file.endsWith('.umd.cjs')) continue
        if (problem === 'assets' && file.startsWith('assets/')) continue
        writeFixtureFile(projectRoot, `dist-duodian-health032-temp/assist/0.3.2/${file}`, `formal ${file}`)
      }
      writeFixtureFile(projectRoot, 'dist-duodian-health032-temp/test-host.html', 'must not ship')
    }
  } }
}

describe('static release core', () => {
  it('032 release merges generated customer and probe bytes, preserves both historical versions and reuses the snapshot', async () => {
    const { projectRoot, calls, runner } = create032ReleaseRunner()
    try {
      const history = ['0.3.0', '0.3.1'].flatMap(version => {
        const dir = resolveFrozenFixtureRoot(projectRoot, version)
        return listFrozenFiles(dir).map(file => ({ version, file, content: readFileSync(path.join(dir, file)) }))
      })
      const result = await runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'formal032', runCommand: runner })
      expect(calls.slice(0, 3)).toEqual([
        { command: 'npm run build:static-h5', extraEnv: {
          VITE_SFT_PUBLIC_BASE_PATH: '/sign-pay-pro/assist/0.3.2/',
          VITE_SFT_PUBLIC_BASE_URL: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/',
        } },
        { command: 'npm run build:static-wrapper', extraEnv: {
          VITE_SFT_PUBLIC_BASE_PATH: '/sign-pay-pro/assist/0.3.2/',
          VITE_SFT_PUBLIC_BASE_URL: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/',
        } },
        { command: 'npm run build:duodian-health032 -- --base-path /sign-pay-pro/ --base-url https://ginkgo.chinaums.com/sign-pay-pro/ --loader-url https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/custom-verification.html', extraEnv: {} },
      ])
      const snapshot = resolveFrozenFixtureRoot(projectRoot, '0.3.2')
      const checksums = JSON.parse(readFileSync(path.join(snapshot, 'checksums.json'), 'utf8'))
      for (const file of customer032Files) {
        expect(readFileSync(path.join(snapshot, 'dist', file), 'utf8')).toBe(`formal ${file}`)
        expect(readFileSync(path.join(result.releaseRoot, 'dist/assist/0.3.2', file), 'utf8')).toBe(`formal ${file}`)
        expect(checksums[`dist/${file}`]).toBeDefined()
      }
      expect(readFileSync(path.join(snapshot, 'dist/index.html'), 'utf8')).toBe('<html><script src="/sign-pay-pro/assist/0.3.2/assets/probe-032.js"></script></html>')
      expect(readFileSync(path.join(snapshot, 'dist/assets/probe-032.js'), 'utf8')).toBe('export const probe032 = true')
      expect(readFileSync(path.join(snapshot, 'dist/assistance-mobile-auth/assistance-mobile-auth.0.3.2.js'), 'utf8')).toBe('export const generic032 = true')
      expect(existsSync(path.join(snapshot, 'dist/test-host.html'))).toBe(false)
      for (const { version, file, content } of history) {
        expect(readFileSync(path.join(resolveFrozenFixtureRoot(projectRoot, version), file))).toEqual(content)
        if (file.startsWith('dist/')) expect(readFileSync(path.join(result.releaseRoot, 'dist/assist', version, file.slice(5)))).toEqual(content)
      }
      const frozenBefore = readFileSync(path.join(snapshot, 'checksums.json'))
      writeFixtureFile(projectRoot, 'dist-duodian-health032-temp/assist/0.3.2/custom-verification.html', 'mutable')
      calls.length = 0
      await runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'later', runCommand: runner })
      expect(calls).toEqual([{ command: expect.stringMatching(/^tar -czf /), extraEnv: {} }])
      expect(readFileSync(path.join(snapshot, 'checksums.json'))).toEqual(frozenBefore)
      expect(readFileSync(path.join(snapshot, 'dist/custom-verification.html'), 'utf8')).toBe('formal custom-verification.html')
    } finally { rmSync(projectRoot, { recursive: true, force: true }) }
  })

  it.each(['missing', 'assets', 'failure'])('032 does not create a snapshot when customer build has %s outputs', async problem => {
    const { projectRoot, runner } = create032ReleaseRunner(problem)
    try {
      await expect(runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'formal032', runCommand: runner })).rejects.toThrow()
      expect(readdirSync(path.join(projectRoot, 'release-frozen')).filter(name => name.startsWith('static-mobile-auth-0.3.2'))).toEqual([])
    } finally { rmSync(projectRoot, { recursive: true, force: true }) }
  })
  it('parses non-interactive bump and manual version arguments', () => {
    expect(parseReleaseArgs(['--bump', 'patch'])).toEqual({ bump: 'patch' })
    expect(parseReleaseArgs(['--version', '0.2.0'])).toEqual({ version: '0.2.0' })
    expect(parseReleaseArgs(['--bump', 'none'])).toEqual({ bump: 'none' })
  })

  it('fails fast for invalid arguments and versions', () => {
    expect(() => parseReleaseArgs(['--bump'])).toThrow('Missing value for --bump')
    expect(() => parseReleaseArgs(['--version'])).toThrow('Missing value for --version')
    expect(() => parseReleaseArgs(['--bump', 'patch', '--version', '0.2.0'])).toThrow(
      'Use either --bump or --version, not both',
    )
    expect(() => parseReleaseArgs(['--dry-run'])).toThrow(
      'Unknown release argument: --dry-run',
    )
    expect(() => resolveNextVersion('0.1.0', { bump: 'build' })).toThrow(
      'Invalid bump value: build',
    )
    expect(() => resolveNextVersion('0.1', { bump: 'patch' })).toThrow(
      'Invalid semver version: 0.1',
    )
    expect(() => resolveNextVersion('0.1.0', { version: '1.0.0-beta.1' })).toThrow(
      'Invalid semver version: 1.0.0-beta.1',
    )
  })

  it('resolves semantic versions', () => {
    expect(resolveNextVersion('0.1.0', { bump: 'patch' })).toBe('0.1.1')
    expect(resolveNextVersion('0.1.0', { bump: 'minor' })).toBe('0.2.0')
    expect(resolveNextVersion('0.1.0', { bump: 'major' })).toBe('1.0.0')
    expect(resolveNextVersion('0.1.0', { bump: 'none' })).toBe('0.1.0')
    expect(resolveNextVersion('0.1.0', { version: '0.3.5' })).toBe('0.3.5')
  })

  it('builds immutable assist version base paths', () => {
    expect(assistVersionBasePath('0.2.0')).toBe('/sign-pay-pro/assist/0.2.0/')
    expect(assistVersionBasePath('0.2.1')).toBe('/sign-pay-pro/assist/0.2.1/')
  })

  it('discovers all frozen assist versions in semantic order', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'frozen-versions-'))
    createFrozenVersionFixture(projectRoot, '0.2.1', {
      index: '<html>0.2.1</html>',
      sourceCommit: 'frozen021',
      marker: 'frozen021',
      rrweb: realRrweb(),
    })
    createFrozenFixture(projectRoot)

    expect(listFrozenAssistVersions(path.join(projectRoot, 'release-frozen'))).toEqual([
      '0.2.0',
      '0.2.1',
    ])
  })

  it('creates a dual-layer manifest', () => {
    const manifest = createManifest({
      packageName: 'mobile-auth-h5',
      version: '0.2.0',
      gitCommit: 'abc1234',
      builtAt: '2026-07-24T00:00:00.000Z',
      frozenSourceGitCommit: 'frozen123',
      assistFrozenSourceGitCommit: 'frozen020',
    })

    expect(manifest.version).toBe('0.2.0')
    expect(manifest.frozenSourceGitCommit).toBe('frozen123')

    expect(manifest.layers.frozen.version).toBe('0.1.4')
    expect(manifest.layers.frozen.basePath).toBe('/sign-pay-pro/')
    expect(manifest.layers.frozen.frozen).toBe(true)
    expect(manifest.layers.frozen.publicUrls.versionedWrapperEsm).toBe(
      '/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.0.1.4.js',
    )
    expect(manifest.layers.frozen.rrweb.localFallbackPath).toBe(
      '/sign-pay-pro/assistance-mobile-auth/vendor/rrweb.min.js',
    )

    expect(manifest.layers.current.version).toBe('0.2.0')
    expect(manifest.layers.current.basePath).toBe('/sign-pay-pro/assist/0.2.0/')
    expect(manifest.assistFrozenSourceGitCommit).toBe('frozen020')
    expect(manifest.layers.current.frozen).toBe(true)
    expect(manifest.layers.current.publicUrls.versionedWrapperEsm).toBe(
      '/sign-pay-pro/assist/0.2.0/assistance-mobile-auth/assistance-mobile-auth.0.2.0.js',
    )
    expect(manifest.layers.current.publicUrls.iframeVerification).toBe(
      '/sign-pay-pro/assist/0.2.0/verification',
    )
    expect(manifest.layers.current.rrweb.localFallbackPath).toBe(
      '/sign-pay-pro/assist/0.2.0/assistance-mobile-auth/vendor/rrweb.min.js',
    )
    expect(manifest.layers.current.mobileOfficialJssdk.jsUrl).toBe(
      'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js',
    )
    expect(manifest.includes.bff).toBe(false)
  })

  it('defaults frozen source commits to null when omitted', () => {
    const manifest = createManifest({
      packageName: 'mobile-auth-h5',
      version: '0.2.0',
      gitCommit: 'abc1234',
      builtAt: '2026-07-24T00:00:00.000Z',
    })

    expect(manifest.frozenSourceGitCommit).toBeNull()
    expect(manifest.assistFrozenSourceGitCommit).toBeNull()
  })

  it('creates Chinese deployment README content', () => {
    const readme = createReadme({ version: '0.1.1' })

    expect(readme).toContain('银杏助理 JSSDK 静态资源包')
    expect(readme).toContain('/sign-pay-pro/')
    expect(readme).toContain('assistance-mobile-auth.0.1.1.js')
    expect(readme).toContain('/sign-pay-pro/verification?mode=probe')
    expect(readme).toContain('/sign-pay-pro/verification?flow=agreement&doc=entry')
    expect(readme).toContain('curl -I \"https://your-domain/sign-pay-pro/verification?mode=probe\"')
    expect(readme).toContain('curl -I https://your-domain/sign-pay-pro/business-demo')
    expect(readme).toContain(
      '本包不包含 BFF、API、test page、debug、business demo、H5 redirect 会话服务',
    )
    expect(readme).toContain('rrweb 2.0.0-alpha.4')
    expect(readme).toContain('cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js')
    expect(readme).toContain('/sign-pay-pro/assistance-mobile-auth/vendor/rrweb.min.js')
    expect(readme).toContain('CDN 加载失败时回退')
  })

  it('creates nginx config with cjs mime, iframe headers, and static 404 rules', () => {
    const nginx = createNginxConfig({ releaseRootPlaceholder: '/opt/mobile-auth-static/dist' })

    expect(nginx).toContain('location /sign-pay-pro/assistance-mobile-auth/')
    expect(nginx).toContain('location ^~ /sign-pay-pro/assets/')
    expect(nginx).toContain('default_type text/javascript')
    expect(nginx).not.toContain('try_files $request_filename =404;')
    expect(nginx).toContain("frame-ancestors 'self' https: http://localhost:* http://127.0.0.1:*")
    expect(nginx).toContain('location ^~ /sign-pay-pro/api/')
    expect(nginx).toContain('location = /sign-pay-pro/business-demo { return 404; }')
    expect(nginx).toContain('return 404;')
    expect(nginx).toContain('/sign-pay-pro/verification?mode=probe')
    expect(nginx).toContain('/sign-pay-pro/verification?flow=agreement&doc=entry')
    expect(nginx).toMatch(
      /location = \/sign-pay-pro\/verification \{[\s\S]*?alias \/opt\/mobile-auth-static\/dist\/index\.html;[\s\S]*?default_type text\/html;[\s\S]*?add_header Cache-Control "no-store";[\s\S]*?\}/,
    )
    expect(nginx).toMatch(
      /location = \/sign-pay-pro\/assistance-mobile-auth\/vendor\/rrweb\.min\.js \{[\s\S]*?default_type text\/javascript;[\s\S]*?Cache-Control "no-cache";[\s\S]*?\}/,
    )
  })

  it('sets JavaScript MIME for compatibility and versioned UMD files', () => {
    const nginx = createNginxConfig({ releaseRootPlaceholder: '/opt/mobile-auth-static/dist' })

    expect(nginx).toMatch(
      /location = \/sign-pay-pro\/assistance-mobile-auth\/assistance-mobile-auth\.umd\.cjs \{[\s\S]*?types \{\}[\s\S]*?default_type text\/javascript;[\s\S]*?\}/,
    )
    expect(nginx).toMatch(
      /location ~\* \^\/sign-pay-pro\/assistance-mobile-auth\/\(assistance-mobile-auth\\\.\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\\\.umd\\\.cjs\)\$ \{[\s\S]*?types \{\}[\s\S]*?default_type text\/javascript;[\s\S]*?\}/,
    )
  })

  it('creates one version-independent assist routing contract', () => {
    const first = createNginxConfig({
      releaseRootPlaceholder: '/opt/x/dist',
      assistVersions: ['0.2.0'],
      latestAssistVersion: '0.2.0',
    })
    const second = createNginxConfig({
      releaseRootPlaceholder: '/opt/x/dist',
      assistVersions: ['0.2.0', '0.2.1'],
      latestAssistVersion: '0.2.1',
    })

    expect(second).toBe(first)

    // 根层（0.1.4 冻结）原样保留
    expect(first).toContain('location = /sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.js')
    expect(first).toContain('location = /sign-pay-pro/verification')
    expect(first).toContain('alias /opt/x/dist/index.html;')

    // assist 层只接受显式语义化版本，且配置不含具体版本号
    expect(first).toContain('location = /sign-pay-pro/assist { return 404; }')
    expect(first).toContain('location /sign-pay-pro/assist/ { return 404; }')
    expect(first).toContain('(?<assist_version>[0-9]+\\.[0-9]+\\.[0-9]+)')
    expect(first).toContain('alias /opt/x/dist/assist/$assist_version/index.html;')
    expect(first).not.toContain('/assist/0.2.0/')
    expect(first).not.toContain('/assist/0.2.1/')
    expect(first).not.toContain('/assist/latest/')

    // forbidden 路由仍在
    expect(first).toContain('location = /sign-pay-pro/auth { return 404; }')
  })

  it('readme lists both layers public urls', () => {
    const readme = createReadme({ version: '0.2.0' })
    expect(readme).toContain('/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.0.1.4.js')
    expect(readme).toContain(
      '/sign-pay-pro/assist/0.2.0/assistance-mobile-auth/assistance-mobile-auth.0.2.0.js',
    )
    expect(readme).toContain('必须显式携带 `x.y.z` 版本号')
    expect(readme).not.toContain('curl -I https://your-domain/sign-pay-pro/assist/verification')
  })

  it('creates the deferred H5 note', () => {
    expect(createDeferredH5Note('0.1.1')).toContain('H5 独立部署暂不在本次静态资源包内实现')
  })

  it('validates required release files and forbidden static content', () => {
    const version = '0.1.1'
    const root = createValidReleaseFixture({ version })

    expect(validateReleaseDirectory(root, version)).toEqual([])

    writeFileSync(path.join(root, 'dist/assets/leaked.js'), 'fetch("/sign-pay-pro/api/session")')

    expect(validateReleaseDirectory(root, version)).toContain(
      'Forbidden same-origin API path found in dist/assets/leaked.js',
    )
  })

  it('rejects missing required release files', () => {
    const root = createValidReleaseFixture({
      version: '0.1.1',
      omit: ['dist/index.html', 'nginx/sign-pay-pro-static.conf'],
    })

    expect(validateReleaseDirectory(root, '0.1.1')).toEqual(
      expect.arrayContaining([
        'Missing required release file: dist/index.html',
        'Missing required release file: nginx/sign-pay-pro-static.conf',
      ]),
    )
  })

  it('rejects a manifest version mismatch', () => {
    const root = createValidReleaseFixture({
      version: '0.1.1',
      manifestVersion: '0.2.0',
    })

    expect(validateReleaseDirectory(root, '0.1.1')).toContain(
      'manifest.json version mismatch: expected 0.1.1, got 0.2.0',
    )
  })

  it('rejects a modified assist-layer rrweb fallback', () => {
    const root = createValidReleaseFixture({ version: '0.1.1' })
    writeFileSync(
      path.join(root, 'dist/assist/0.1.1/assistance-mobile-auth/vendor/rrweb.min.js'),
      'window.rrweb = {}',
    )
    expect(validateReleaseDirectory(root, '0.1.1')).toEqual(expect.arrayContaining([
      expect.stringContaining(
        'assist 0.1.1 rrweb fallback SHA-256 mismatch: expected 39596e896d80261e0163ea6dc1a00884864a9da53c220486697389a715b293fe',
      ),
    ]))
  })

  it('validates a clean dual-layer release against frozen byte checks', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-dual-'))
    const frozenRoot = createFrozenFixture(projectRoot)
    const root = createValidDualLayerRelease({ projectRoot, version: '0.2.0', frozenRoot })

    expect(validateReleaseDirectory(root, '0.2.0', { frozenRoot })).toEqual([])
  })

  it('flags a tampered frozen root layer', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-dual-'))
    const frozenRoot = createFrozenFixture(projectRoot)
    const root = createValidDualLayerRelease({ projectRoot, version: '0.2.0', frozenRoot })

    // 组装合法双层包后篡改根层文件（字节与冻结清单不再一致）
    writeFileSync(path.join(root, 'dist/index.html'), '<html>tampered</html>')

    expect(validateReleaseDirectory(root, '0.2.0', { frozenRoot })).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Frozen file modified: dist/index.html'),
      ]),
    )
  })

  it('flags missing assist layer files', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-dual-'))
    const frozenRoot = createFrozenFixture(projectRoot)
    const root = createValidDualLayerRelease({ projectRoot, version: '0.2.0', frozenRoot })

    rmSync(
      path.join(
        root,
        'dist/assist/0.2.0/assistance-mobile-auth/assistance-mobile-auth.0.2.0.js',
      ),
    )

    expect(validateReleaseDirectory(root, '0.2.0', { frozenRoot })).toContain(
      'Missing required release file: dist/assist/0.2.0/assistance-mobile-auth/assistance-mobile-auth.0.2.0.js',
    )
  })

  it('flags unexpected files leaked into the frozen root layer', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-dual-'))
    const frozenRoot = createFrozenFixture(projectRoot)
    const root = createValidDualLayerRelease({ projectRoot, version: '0.2.0', frozenRoot })

    // 在包根 dist/ 下多放一个不在冻结清单里的文件
    writeFileSync(path.join(root, 'dist/stray.txt'), 'stray')

    expect(validateReleaseDirectory(root, '0.2.0', { frozenRoot })).toContain(
      'Unexpected file in frozen root layer: dist/stray.txt',
    )
  })

  it.each([
    [
      'manifest layers.frozen.basePath',
      {
        layers: { frozen: { basePath: '/wrong-base/' } },
      },
      'manifest.json layers.frozen.basePath mismatch: expected /sign-pay-pro/, got /wrong-base/',
    ],
    [
      'manifest layers.frozen.frozen flag',
      {
        layers: { frozen: { frozen: false } },
      },
      'manifest.json layers.frozen.frozen mismatch: expected true, got false',
    ],
    [
      'manifest layers.frozen publicUrls probeMode',
      {
        layers: { frozen: { publicUrls: { probeMode: '/sign-pay-pro/probe' } } },
      },
      'manifest.json layers.frozen.publicUrls.probeMode mismatch: expected /sign-pay-pro/verification?mode=probe, got /sign-pay-pro/probe',
    ],
    [
      'manifest layers.current publicUrls agreementReader',
      {
        layers: {
          current: {
            publicUrls: {
              agreementReader:
                '/sign-pay-pro/assist/0.1.1/agreement-reader?doc=entry',
            },
          },
        },
      },
      'manifest.json layers.current.publicUrls.agreementReader mismatch: expected /sign-pay-pro/assist/0.1.1/verification?flow=agreement&doc=entry, got /sign-pay-pro/assist/0.1.1/agreement-reader?doc=entry',
    ],
    [
      'manifest layers.frozen JSSDK version',
      {
        layers: { frozen: { mobileOfficialJssdk: { version: '1.0.7' } } },
      },
      'manifest.json layers.frozen.mobileOfficialJssdk.version mismatch: expected 1.0.6, got 1.0.7',
    ],
    [
      'manifest layers.current rrweb localFallbackPath',
      {
        layers: { current: { rrweb: { localFallbackPath: '/wrong/rrweb.min.js' } } },
      },
      'manifest.json layers.current.rrweb.localFallbackPath mismatch: expected /sign-pay-pro/assist/0.1.1/assistance-mobile-auth/vendor/rrweb.min.js, got /wrong/rrweb.min.js',
    ],
    [
      'manifest includes excluded flag',
      {
        includes: {
          api: true,
        },
      },
      'manifest.json includes.api mismatch: expected false, got true',
    ],
  ])('rejects tampered %s contract', (_name, manifestOverride, expectedError) => {
    const root = createValidReleaseFixture({
      version: '0.1.1',
      manifest: manifestOverride,
    })

    expect(validateReleaseDirectory(root, '0.1.1')).toContain(expectedError)
  })

  it.each([
    [
      'forbidden API route',
      (nginx) => nginx.replace('    location ^~ /sign-pay-pro/api/ { return 404; }\n', ''),
      'nginx config is missing forbidden route 404 for /sign-pay-pro/api/',
    ],
    [
      'forbidden test-page route',
      (nginx) => nginx.replace('    location = /sign-pay-pro/test-page { return 404; }\n', ''),
      'nginx config is missing forbidden route 404 for /sign-pay-pro/test-page',
    ],
    [
      'forbidden test-page-hk route',
      (nginx) => nginx.replace('    location = /sign-pay-pro/test-page-hk { return 404; }\n', ''),
      'nginx config is missing forbidden route 404 for /sign-pay-pro/test-page-hk',
    ],
    [
      'forbidden business-demo route',
      (nginx) => nginx.replace('    location = /sign-pay-pro/business-demo { return 404; }\n', ''),
      'nginx config is missing forbidden route 404 for /sign-pay-pro/business-demo',
    ],
    [
      'forbidden debug route',
      (nginx) => nginx.replace('    location = /sign-pay-pro/debug { return 404; }\n', ''),
      'nginx config is missing forbidden route 404 for /sign-pay-pro/debug',
    ],
    [
      'forbidden auth route',
      (nginx) => nginx.replace('    location = /sign-pay-pro/auth { return 404; }\n', ''),
      'nginx config is missing forbidden route 404 for /sign-pay-pro/auth',
    ],
    [
      'forbidden test callback route',
      (nginx) =>
        nginx.replace('    location = /sign-pay-pro/test-callback { return 404; }\n', ''),
      'nginx config is missing forbidden route 404 for /sign-pay-pro/test-callback',
    ],
    [
      'root non-versioned wrapper alias-incompatible try_files',
      (nginx) =>
        nginx.replace(
          '        add_header Cache-Control "no-store";',
          '        try_files $request_filename =404;\n        add_header Cache-Control "no-store";',
        ),
      'nginx config contains alias-incompatible try_files $request_filename',
    ],
    [
      'root assets alias-incompatible try_files',
      (nginx) =>
        nginx.replace(
          '        add_header Cache-Control "no-cache";\n    }\n\n    location = /sign-pay-pro/verification',
          '        try_files $request_filename =404;\n        add_header Cache-Control "no-cache";\n    }\n\n    location = /sign-pay-pro/verification',
        ),
      'nginx config contains alias-incompatible try_files $request_filename',
    ],
    [
      'root .cjs JavaScript MIME',
      (nginx) => nginx.replaceAll('        default_type text/javascript;\n', ''),
      'nginx config is missing .cjs JavaScript MIME rule [layer /sign-pay-pro/]',
    ],
    [
      'root iframe frame-ancestors header',
      (nginx) =>
        replaceLast(
          nginx,
          '        add_header Content-Security-Policy "frame-ancestors \'self\' https: http://localhost:* http://127.0.0.1:*";\n',
          '',
        ),
      'nginx config is missing iframe frame-ancestors policy [layer /sign-pay-pro/]',
    ],
    [
      'root verification index mapping',
      (nginx) =>
        nginx.replace(
          '        alias /opt/mobile-auth-static/dist/index.html;',
          '        alias /opt/mobile-auth-static/dist/verification.html;',
      ),
      'nginx config is missing /sign-pay-pro/verification index.html mapping',
    ],
    [
      'root verification text/html MIME',
      (nginx) => replaceLast(nginx, '        default_type text/html;\n', ''),
      'nginx config is missing text/html MIME for verification [layer /sign-pay-pro/]',
    ],
    [
      'root verification query-mode probe contract',
      (nginx) =>
        nginx.replace('    # - /sign-pay-pro/verification?mode=probe\n', ''),
      'nginx config is missing verification query-mode contract for probeMode [layer /sign-pay-pro/]',
    ],
    [
      'root verification query-mode agreement contract',
      (nginx) =>
        nginx.replace('    # - /sign-pay-pro/verification?flow=agreement&doc=entry\n', ''),
      'nginx config is missing verification query-mode contract for agreementReader [layer /sign-pay-pro/]',
    ],
    [
      'root base path redirect',
      (nginx) =>
        nginx.replace(
          [
            '    location = /sign-pay-pro/ {',
            '        return 302 /sign-pay-pro/verification$is_args$args;',
            '    }',
            '',
          ].join('\n'),
          '',
        ),
      'nginx config is missing /sign-pay-pro/ redirect to verification',
    ],
    [
      'root versioned immutable cache',
      (nginx) => nginx.replaceAll('        add_header Cache-Control "public, immutable";', ''),
      'nginx config is missing immutable cache for versioned wrappers [layer /sign-pay-pro/]',
    ],
    [
      'root non-versioned no-store cache',
      (nginx) => nginx.replaceAll('        add_header Cache-Control "no-store";', ''),
      'nginx config is missing no-store cache for non-versioned wrappers and verification [layer /sign-pay-pro/]',
    ],
    [
      'unversioned assist root 404',
      (nginx) => nginx.replace('    location = /sign-pay-pro/assist { return 404; }\n', ''),
      'nginx config is missing unversioned assist root 404',
    ],
    [
      'generic assist version root redirect',
      (nginx) =>
        nginx.replace(
          '        return 302 /sign-pay-pro/assist/$assist_version/verification$is_args$args;\n',
          '',
        ),
      'nginx config is missing generic assist version root redirect',
    ],
    [
      'generic assist verification mapping',
      (nginx) =>
        nginx.replace(
          '        alias /opt/mobile-auth-static/dist/assist/$assist_version/index.html;\n',
          '',
        ),
      'nginx config is missing generic assist verification mapping',
    ],
  ])('rejects nginx config missing %s', (_name, mutateNginx, expectedError) => {
    const root = createValidReleaseFixture({
      version: '0.1.1',
      nginxConfig: mutateNginx(
        createNginxConfig({
          releaseRootPlaceholder: '/opt/mobile-auth-static/dist',
          assistVersions: ['0.1.1'],
          latestAssistVersion: '0.1.1',
        }),
      ),
    })

    expect(validateReleaseDirectory(root, '0.1.1')).toContain(expectedError)
  })

  it('rejects globally forbidden release package artifacts', () => {
    const root = createValidReleaseFixture({ version: '0.1.1' })

    for (const [relative, content] of [
      ['dist-bff/main.js', 'require("http")'],
      ['.env', 'SECRET=1'],
      ['dist/assistance-mobile-auth/vendor/jssdk-1.0.7.min.js', ''],
      ['node_modules/example/index.js', 'module.exports = {}'],
      ['dist/Dockerfile', 'FROM nginx'],
      ['nginx/docker-compose.yml', 'services: {}'],
      ['dist/assistance-mobile-auth/ecosystem.config.js', 'module.exports = {}'],
    ]) {
      writeFixtureFile(root, relative, content)
    }

    expect(validateReleaseDirectory(root, '0.1.1')).toEqual(
      expect.arrayContaining([
        'Forbidden release file exists: dist-bff',
        'Forbidden release file exists: .env',
        'Forbidden release file exists: dist/assistance-mobile-auth/vendor/jssdk-1.0.7.min.js',
        'Forbidden release file exists: node_modules',
        'Forbidden Docker artifact exists: dist/Dockerfile',
        'Forbidden Docker artifact exists: nginx/docker-compose.yml',
        'Forbidden pm2 config exists: dist/assistance-mobile-auth/ecosystem.config.js',
      ]),
    )
  })

  it('assembles a valid dual-layer release package end to end (Task 11)', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-project-'))
    const frozenRoot = createFrozenFixture(projectRoot)
    const frozenAssistRoot = resolveFrozenFixtureRoot(projectRoot, FROZEN_ASSIST_VERSION)
    const releaseRoot = path.join(projectRoot, 'release', 'static-mobile-auth-0.2.0')

    writeFixtureFile(projectRoot, 'dist-static/index.html', '<main>verification</main>')
    writeFixtureFile(projectRoot, 'dist-static/assets/app.js', 'console.log("ok")')
    writeFixtureFile(
      projectRoot,
      'dist-static/assistance-mobile-auth/vendor/rrweb.min.js',
      realRrweb(),
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.js',
      'export const bootstrap = true',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.umd.cjs',
      'module.exports = { bootstrap: true }',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/vendor/new-control-style.css',
      '.mobile-auth { color: black; }',
    )

    assembleReleasePackage({
      projectRoot,
      releaseRoot,
      packageName: 'mobile-auth-h5',
      version: '0.2.0',
      gitCommit: 'abc1234',
      builtAt: '2026-07-07T00:00:00.000Z',
    })

    // Task 10 交接：不再放宽为「仅剩 Missing required release file」——双层组包落地后，
    // assembleReleasePackage 产出的包必须是完整合法包（含冻结字节校验）。
    expect(
      validateReleaseDirectory(releaseRoot, '0.2.0', { frozenRoot, frozenAssistRoot }),
    ).toEqual([])
  })

  it('assembles a dual-version package', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'release-'))
    createFrozenFixture(projectRoot)

    writeFixtureFile(projectRoot, 'dist-static/index.html', '<main>verification</main>')
    writeFixtureFile(projectRoot, 'dist-static/assets/app.js', 'console.log("ok")')
    writeFixtureFile(
      projectRoot,
      'dist-static/assistance-mobile-auth/vendor/rrweb.min.js',
      realRrweb(),
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.js',
      'export const bootstrap = true',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.umd.cjs',
      'module.exports = { bootstrap: true }',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/vendor/new-control-style.css',
      '.mobile-auth { color: black; }',
    )

    const releaseRoot = assembleReleasePackage({
      projectRoot,
      releaseRoot: path.join(projectRoot, 'release', 'static-mobile-auth-0.2.0'),
      packageName: 'mobile-auth-h5',
      version: '0.2.0',
      gitCommit: 'abc1234',
      builtAt: '2026-07-24T00:00:00.000Z',
    })

    // 根层 = 冻结 0.1.4 字节
    expect(readFileSync(path.join(releaseRoot, 'dist', 'index.html'), 'utf8')).toBe('<html>frozen</html>')
    expect(
      readFileSync(
        path.join(releaseRoot, 'dist', 'assist', '0.2.0', 'index.html'),
        'utf8',
      ),
    ).toBe(
      '<html>frozen 0.2.0</html>',
    )
    // 根层不得出现 0.2.0 版本化文件名
    expect(existsSync(path.join(releaseRoot, 'dist', 'assistance-mobile-auth', 'assistance-mobile-auth.0.2.0.js'))).toBe(false)
    // assist 层有 0.2.0 版本化文件
    expect(
      existsSync(
        path.join(
          releaseRoot,
          'dist',
          'assist',
          '0.2.0',
          'assistance-mobile-auth',
          'assistance-mobile-auth.0.2.0.js',
        ),
      ),
    ).toBe(true)
    expect(
      existsSync(
        path.join(
          releaseRoot,
          'dist',
          'assist',
          '0.2.0',
          'assistance-mobile-auth',
          'assistance-mobile-auth.0.2.0.umd.cjs',
        ),
      ),
    ).toBe(true)
    // manifest 带冻结来源
    const manifest = JSON.parse(readFileSync(path.join(releaseRoot, 'manifest.json'), 'utf8'))
    expect(manifest.frozenSourceGitCommit).toBe('frozen123')
    expect(manifest.assistFrozenSourceGitCommit).toBe('frozen020')
    expect(manifest.layers.frozen.version).toBe('0.1.4')
    expect(manifest.layers.current.frozen).toBe(true)
  })

  it('refuses to assemble when frozen assets are tampered', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'release-'))
    const frozenRoot = createFrozenFixture(projectRoot)
    writeFileSync(path.join(frozenRoot, 'dist', 'index.html'), '<html>tampered</html>')

    expect(() =>
      assembleReleasePackage({
        projectRoot,
        releaseRoot: path.join(projectRoot, 'release', 'static-mobile-auth-0.2.0'),
        packageName: 'mobile-auth-h5',
        version: '0.2.0',
        gitCommit: 'abc1234',
        builtAt: '2026-07-24T00:00:00.000Z',
      }),
    ).toThrow('Frozen 0.1.4 assets failed verification')
  })

  it('refuses to assemble when frozen 0.2.0 assist assets are tampered', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'release-'))
    createFrozenFixture(projectRoot)
    const frozenAssistRoot = resolveFrozenFixtureRoot(projectRoot, FROZEN_ASSIST_VERSION)
    writeFileSync(path.join(frozenAssistRoot, 'dist', 'index.html'), '<html>tampered</html>')

    expect(() =>
      assembleReleasePackage({
        projectRoot,
        releaseRoot: path.join(projectRoot, 'release', 'static-mobile-auth-0.2.0'),
        packageName: 'mobile-auth-h5',
        version: '0.2.0',
        gitCommit: 'abc1234',
        builtAt: '2026-07-24T00:00:00.000Z',
      }),
    ).toThrow('Frozen 0.2.0 assets failed verification')
  })

  it('assembles frozen 0.2.0 without rebuilding current source', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-project-'))
    createFrozenFixture(projectRoot)

    writeFixtureFile(
      projectRoot,
      'package.json',
      `${JSON.stringify({ name: 'mobile-auth-h5', version: '0.2.0' }, null, 2)}\n`,
    )
    writeFixtureFile(projectRoot, 'dist-static/index.html', '<main>verification</main>')
    writeFixtureFile(projectRoot, 'dist-static/assets/app.js', 'console.log("ok")')
    writeFixtureFile(
      projectRoot,
      'dist-static/assistance-mobile-auth/vendor/rrweb.min.js',
      realRrweb(),
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.js',
      'export const bootstrap = true',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.umd.cjs',
      'module.exports = { bootstrap: true }',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/vendor/new-control-style.css',
      '.mobile-auth { color: black; }',
    )

    const recordedCalls = []

    const result = await runRelease(['--version', '0.2.0'], projectRoot, {
      getGitCommit: () => 'abc1234',
      runCommand: (_projectRoot, command, args, extraEnv = {}) => {
        recordedCalls.push({ command: [command, ...args].join(' '), extraEnv })
      },
    })

    expect(result.version).toBe('0.2.0')

    expect(recordedCalls.map((call) => call.command)).toEqual([
      expect.stringMatching(/^tar -czf /),
    ])
    expect(
      readFileSync(
        path.join(result.releaseRoot, 'dist/assist/0.2.0/index.html'),
        'utf8',
      ),
    ).toBe('<html>frozen 0.2.0</html>')
  })

  it('builds and seals a new assist version while retaining frozen history', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-project-'))
    createFrozenFixture(projectRoot)
    writeFixtureFile(
      projectRoot,
      'package.json',
      `${JSON.stringify({ name: 'mobile-auth-h5', version: '0.2.0' }, null, 2)}\n`,
    )

    const recordedCalls = []
    const result = await runRelease(['--version', '0.2.1'], projectRoot, {
      getGitCommit: () => 'abc1234',
      runCommand: (_projectRoot, command, args, extraEnv = {}) => {
        recordedCalls.push({ command: [command, ...args].join(' '), extraEnv })
        if (args.join(' ') === 'run build:static-h5') {
          writeFixtureFile(projectRoot, 'dist-static/index.html', '<html>0.2.1</html>')
          writeFixtureFile(
            projectRoot,
            'dist-static/assistance-mobile-auth/vendor/rrweb.min.js',
            realRrweb(),
          )
        }
        if (args.join(' ') === 'run build:static-wrapper') {
          writeFixtureFile(
            projectRoot,
            'dist-wrapper/assistance-mobile-auth.js',
            'export const release021 = true',
          )
          writeFixtureFile(
            projectRoot,
            'dist-wrapper/assistance-mobile-auth.umd.cjs',
            'module.exports = { release021: true }',
          )
          writeFixtureFile(
            projectRoot,
            'dist-wrapper/vendor/new-control-style.css',
            'body{}',
          )
        }
      },
    })

    expect(recordedCalls.slice(0, 2)).toEqual([
      expect.objectContaining({
        command: 'npm run build:static-h5',
        extraEnv: expect.objectContaining({
          VITE_SFT_PUBLIC_BASE_PATH: '/sign-pay-pro/assist/0.2.1/',
        }),
      }),
      expect.objectContaining({
        command: 'npm run build:static-wrapper',
        extraEnv: expect.objectContaining({
          VITE_SFT_PUBLIC_BASE_PATH: '/sign-pay-pro/assist/0.2.1/',
        }),
      }),
    ])
    expect(
      existsSync(path.join(result.releaseRoot, 'dist/assist/0.2.0/index.html')),
    ).toBe(true)
    expect(
      existsSync(path.join(result.releaseRoot, 'dist/assist/0.2.1/index.html')),
    ).toBe(true)
    const nginxConfig = readFileSync(
      path.join(result.releaseRoot, 'nginx/sign-pay-pro-static.conf'),
      'utf8',
    )
    expect(nginxConfig).toContain(
      'return 302 /sign-pay-pro/assist/$assist_version/verification$is_args$args;',
    )
    expect(nginxConfig).not.toContain('/sign-pay-pro/assist/0.2.1/')
  })

  it('compiles the exact formal generic customPage loader without changing development fallback', async () => {
    const saved = { release: process.env.VITE_STATIC_RESOURCE_RELEASE, base: process.env.VITE_SFT_PUBLIC_BASE_URL }
    try {
      process.env.VITE_STATIC_RESOURCE_RELEASE = '1'
      process.env.VITE_SFT_PUBLIC_BASE_URL = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.0/'
      const loadDefine = () => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e',
        'import { loadConfigFromFile } from "vite"; const result = await loadConfigFromFile({ command: "build", mode: "production" }, "vite.wrapper.config.ts"); console.log(JSON.stringify(result.config.define));',
      ], { encoding: 'utf8', env: process.env }))
      expect(loadDefine().__CUSTOM_LOADER_URL__).toBe(JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.0/custom-verification.html'))
      delete process.env.VITE_STATIC_RESOURCE_RELEASE
      delete process.env.VITE_SFT_PUBLIC_BASE_URL
      expect(loadDefine().__CUSTOM_LOADER_URL__).toBeUndefined()
    } finally {
      for (const [key, value] of [['VITE_STATIC_RESOURCE_RELEASE', saved.release], ['VITE_SFT_PUBLIC_BASE_URL', saved.base]]) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    }
  })

  it('freezes complete formal 0.3.0 resources before checksums and reuses their bytes', async () => {
    const { projectRoot, calls, runner } = create030ReleaseRunner()
    const historical = readFileSync(path.join(projectRoot, 'release-frozen/static-mobile-auth-0.2.0/checksums.json'))
    const result = await runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'formal030', runCommand: runner })
    expect(calls[2]).toEqual('npm run build:duodian-health -- --base-path /sign-pay-pro/ --base-url https://ginkgo.chinaums.com/sign-pay-pro/ --loader-url https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.0/custom-verification.html')
    const snapshot = path.join(projectRoot, 'release-frozen/static-mobile-auth-0.3.0')
    const checksums = JSON.parse(readFileSync(path.join(snapshot, 'checksums.json'), 'utf8'))
    for (const file of customer030Files) {
      expect(readFileSync(path.join(snapshot, 'dist', file), 'utf8')).toBe(`formal ${file}`)
      expect(checksums[`dist/${file}`]).toBeDefined()
      expect(readFileSync(path.join(result.releaseRoot, 'dist/assist/0.3.0', file), 'utf8')).toBe(`formal ${file}`)
    }
    expect(readFileSync(path.join(snapshot, 'dist/assistance-mobile-auth/assistance-mobile-auth.js'), 'utf8')).toBe('export const generic030 = true')
    expect(existsSync(path.join(snapshot, 'dist/test-duodian-health-0.3.0.html'))).toBe(false)
    const frozenBefore = readFileSync(path.join(snapshot, 'checksums.json'))
    writeFixtureFile(projectRoot, 'dist-duodian-health-temp/assist/0.3.0/custom-verification.html', 'mutable')
    calls.length = 0
    await runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'later', runCommand: runner })
    expect(calls).toEqual([expect.stringMatching(/^tar -czf /)])
    expect(readFileSync(path.join(snapshot, 'checksums.json'))).toEqual(frozenBefore)
    expect(readFileSync(path.join(snapshot, 'dist/custom-verification.html'), 'utf8')).toBe('formal custom-verification.html')
    expect(readFileSync(path.join(projectRoot, 'release-frozen/static-mobile-auth-0.2.0/checksums.json'))).toEqual(historical)
  })

  it.each(['missing', 'failure'])('does not freeze 0.3.0 when customer build has %s outputs', async problem => {
    const { projectRoot, runner } = create030ReleaseRunner(problem)
    await expect(runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'formal030', runCommand: runner })).rejects.toThrow()
    expect(readdirSync(path.join(projectRoot, 'release-frozen')).filter(name => name.startsWith('static-mobile-auth-0.3.0'))).toEqual([])
  })

  it('releases 0.3.1 customer and versioned probe resources before checksums, preserving 0.3.0 and reuse', async () => {
    const { projectRoot, calls, runner } = create031ReleaseRunner()
    const historyRoot = path.join(projectRoot, 'release-frozen/static-mobile-auth-0.3.0')
    const historical = readFileSync(path.join(historyRoot, 'checksums.json'))
    const result = await runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'formal031', runCommand: runner })
    expect(calls.slice(0, 3)).toEqual([
      { command: 'npm run build:static-h5', extraEnv: {
        VITE_SFT_PUBLIC_BASE_PATH: '/sign-pay-pro/assist/0.3.1/',
        VITE_SFT_PUBLIC_BASE_URL: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/',
      } },
      { command: 'npm run build:static-wrapper', extraEnv: {
        VITE_SFT_PUBLIC_BASE_PATH: '/sign-pay-pro/assist/0.3.1/',
        VITE_SFT_PUBLIC_BASE_URL: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/',
      } },
      { command: 'npm run build:duodian-health031 -- --base-path /sign-pay-pro/ --base-url https://ginkgo.chinaums.com/sign-pay-pro/ --loader-url https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/custom-verification.html', extraEnv: {} },
    ])
    const snapshot = path.join(projectRoot, 'release-frozen/static-mobile-auth-0.3.1')
    const checksums = JSON.parse(readFileSync(path.join(snapshot, 'checksums.json'), 'utf8'))
    const genericFiles = {
      'index.html': '<html><script src="/sign-pay-pro/assist/0.3.1/assets/probe-031.js"></script></html>',
      'assets/probe-031.js': 'export const probe031 = true',
      'assistance-mobile-auth/assistance-mobile-auth.js': 'export const generic031 = true',
      'assistance-mobile-auth/assistance-mobile-auth.0.3.1.js': 'export const generic031 = true',
      'assistance-mobile-auth/assistance-mobile-auth.0.3.1.umd.cjs': 'module.exports = { generic031: true }',
    }
    for (const [file, content] of [
      ...customer031Files.map(file => [file, `formal ${file}`]),
      ...Object.entries(genericFiles),
    ]) {
      expect(readFileSync(path.join(snapshot, 'dist', file), 'utf8')).toBe(content)
      expect(checksums[`dist/${file}`]).toBe(createHash('sha256').update(content).digest('hex'))
      expect(readFileSync(path.join(result.releaseRoot, 'dist/assist/0.3.1', file), 'utf8')).toBe(content)
    }
    expect(existsSync(path.join(snapshot, 'dist/test-host.html'))).toBe(false)
    expect(readFileSync(path.join(result.releaseRoot, 'dist/assist/0.3.0/index.html'), 'utf8')).toBe('<html>historical 030</html>')
    const frozenBefore = readFileSync(path.join(snapshot, 'checksums.json'))
    writeFixtureFile(projectRoot, 'dist-duodian-health031-temp/assist/0.3.1/custom-verification.html', 'mutable')
    calls.length = 0
    await runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'later', runCommand: runner })
    expect(calls).toEqual([{ command: expect.stringMatching(/^tar -czf /), extraEnv: {} }])
    expect(readFileSync(path.join(snapshot, 'checksums.json'))).toEqual(frozenBefore)
    expect(readFileSync(path.join(snapshot, 'dist/custom-verification.html'), 'utf8')).toBe('formal custom-verification.html')
    expect(readFileSync(path.join(historyRoot, 'checksums.json'))).toEqual(historical)
  })

  it.each(['missing', 'assets', 'failure'])('does not freeze 0.3.1 when customer build has %s outputs', async problem => {
    const { projectRoot, runner } = create031ReleaseRunner(problem)
    await expect(runRelease(['--bump', 'none'], projectRoot, { getGitCommit: () => 'formal031', runCommand: runner })).rejects.toThrow()
    expect(readdirSync(path.join(projectRoot, 'release-frozen')).filter(name => name.startsWith('static-mobile-auth-0.3.1'))).toEqual([])
  })

  it('does not copy mutable build artifacts into the frozen release', () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-project-'))
    createFrozenFixture(projectRoot)
    const releaseRoot = path.join(projectRoot, 'release', 'static-mobile-auth-0.2.0')

    writeFixtureFile(projectRoot, 'dist-static/index.html', '<main>verification</main>')
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.js',
      'export const bootstrap = true',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/assistance-mobile-auth.umd.cjs',
      'module.exports = { bootstrap: true }',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/vendor/new-control-style.css',
      '.mobile-auth { color: black; }',
    )
    writeFixtureFile(
      projectRoot,
      'dist-wrapper/vendor/jssdk-1.0.7.min.js',
      'window.MobileAuthTestSdk = true',
    )

    assembleReleasePackage({
      projectRoot,
      releaseRoot,
      packageName: 'mobile-auth-h5',
      version: '0.2.0',
      gitCommit: 'abc1234',
      builtAt: '2026-07-07T00:00:00.000Z',
    })

    expect(
      existsSync(
        path.join(
          releaseRoot,
          'dist/assist/0.2.0/assistance-mobile-auth/vendor/jssdk-1.0.7.min.js',
        ),
      ),
    ).toBe(false)
  })

  it('keeps package metadata unchanged when a bumped release fails before archive creation', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'static-release-project-'))
    createFrozenFixture(projectRoot)
    const packageJsonPath = path.join(projectRoot, 'package.json')

    writeFixtureFile(
      projectRoot,
      'package.json',
      `${JSON.stringify(
        {
          name: 'mobile-auth-h5',
          version: '0.2.0',
        },
        null,
        2,
      )}\n`,
    )
    createFrozenVersionFixture(projectRoot, '0.2.1', {
      index: '<html>0.2.1</html>',
      sourceCommit: 'frozen021',
      marker: 'frozen021',
      rrweb: realRrweb(),
    })

    const executedCommands = []

    await expect(
      runRelease(['--version', '0.2.1'], projectRoot, {
        getGitCommit: () => 'abc1234',
        runCommand: (_projectRoot, command, args) => {
          executedCommands.push([command, ...args].join(' '))
          if (command === 'tar') {
            throw new Error('archive failed')
          }
        },
      }),
    ).rejects.toThrow('archive failed')

    expect(JSON.parse(readFileSync(packageJsonPath, 'utf8')).version).toBe('0.2.0')
    expect(executedCommands).toEqual([expect.stringMatching(/^tar -czf /)])
  })
})

function realRrweb() {
  return readFileSync(path.resolve('src/static/public/assistance-mobile-auth/vendor/rrweb.min.js'))
}

function createValidReleaseFixture({
  version,
  manifestVersion = version,
  manifest = {},
  nginxConfig,
  omit = [],
}) {
  const root = mkdtempSync(path.join(tmpdir(), 'static-release-core-'))
  const resolvedNginxConfig =
    nginxConfig ??
    createNginxConfig({
      releaseRootPlaceholder: '/opt/mobile-auth-static/dist',
      assistVersions: [version],
      latestAssistVersion: version,
    })
  const omitted = new Set(omit)
  const rrweb = realRrweb()
  const files = {
    // 冻结根层（0.1.4）：版本化 wrapper 用 FROZEN_VERSION
    'dist/index.html': '<main>verification</main>',
    'dist/assistance-mobile-auth/assistance-mobile-auth.js': 'export {}',
    'dist/assistance-mobile-auth/assistance-mobile-auth.umd.cjs': 'module.exports = {}',
    [`dist/assistance-mobile-auth/assistance-mobile-auth.${FROZEN_VERSION}.js`]: 'export {}',
    [`dist/assistance-mobile-auth/assistance-mobile-auth.${FROZEN_VERSION}.umd.cjs`]:
      'module.exports = {}',
    'dist/assistance-mobile-auth/vendor/new-control-style.css': 'body{}',
    'dist/assistance-mobile-auth/vendor/rrweb.min.js': rrweb,
    // assist 层（当前版本）：assist rrweb 必须是固定 SHA 的真实文件
    [`dist/assist/${version}/index.html`]: '<main>verification</main>',
    [`dist/assist/${version}/assistance-mobile-auth/assistance-mobile-auth.js`]: 'export {}',
    [`dist/assist/${version}/assistance-mobile-auth/assistance-mobile-auth.umd.cjs`]:
      'module.exports = {}',
    [`dist/assist/${version}/assistance-mobile-auth/assistance-mobile-auth.${version}.js`]:
      'export {}',
    [`dist/assist/${version}/assistance-mobile-auth/assistance-mobile-auth.${version}.umd.cjs`]:
      'module.exports = {}',
    [`dist/assist/${version}/assistance-mobile-auth/vendor/new-control-style.css`]: 'body{}',
    [`dist/assist/${version}/assistance-mobile-auth/vendor/rrweb.min.js`]: rrweb,
    'nginx/sign-pay-pro-static.conf': resolvedNginxConfig,
    'manifest.json': JSON.stringify(mergeManifest(
      createManifest({
        packageName: 'mobile-auth-h5',
        version: manifestVersion,
        gitCommit: 'abc1234',
        builtAt: '2026-07-07T00:00:00.000Z',
      }),
      manifest,
    )),
    'README.md': createReadme({ version }),
    'TODO.md': createDeferredH5Note(version),
  }

  for (const [relative, content] of Object.entries(files)) {
    if (!omitted.has(relative)) {
      writeFixtureFile(root, relative, content)
    }
  }
  mkdirSync(path.join(root, 'dist/assets'), { recursive: true })

  return root
}

// 组装能通过双版校验的最小合法冻结目录：dist 根层 + checksums.json + source-manifest.json。
// 根层 rrweb 内容任意即可——校验器对根层 rrweb 的把关走冻结 checksum 而非固定 SHA。
function createFrozenFixture(projectRoot) {
  const frozenRoot = createFrozenVersionFixture(projectRoot, FROZEN_VERSION, {
    index: '<html>frozen</html>',
    sourceCommit: 'frozen123',
    marker: 'frozen',
  })
  createFrozenVersionFixture(projectRoot, FROZEN_ASSIST_VERSION, {
    index: '<html>frozen 0.2.0</html>',
    sourceCommit: 'frozen020',
    marker: 'frozen020',
    rrweb: realRrweb(),
  })
  return frozenRoot
}

function resolveFrozenFixtureRoot(projectRoot, version) {
  return path.join(projectRoot, 'release-frozen', `static-mobile-auth-${version}`)
}

function createFrozenVersionFixture(
  projectRoot,
  version,
  { index, sourceCommit, marker, rrweb = 'window.frozenRrweb = true' },
) {
  const frozenRoot = resolveFrozenFixtureRoot(projectRoot, version)
  const frozenDist = path.join(frozenRoot, 'dist')
  const wrapperDir = path.join(frozenDist, 'assistance-mobile-auth')
  const vendorDir = path.join(wrapperDir, 'vendor')
  mkdirSync(vendorDir, { recursive: true })

  writeFileSync(path.join(frozenDist, 'index.html'), index)
  writeFileSync(path.join(wrapperDir, 'assistance-mobile-auth.js'), `export const ${marker} = true`)
  writeFileSync(path.join(wrapperDir, 'assistance-mobile-auth.umd.cjs'), `module.exports = { ${marker}: true }`)
  writeFileSync(path.join(wrapperDir, `assistance-mobile-auth.${version}.js`), `export const ${marker} = true`)
  writeFileSync(
    path.join(wrapperDir, `assistance-mobile-auth.${version}.umd.cjs`),
    `module.exports = { ${marker}: true }`,
  )
  writeFileSync(path.join(vendorDir, 'new-control-style.css'), 'body{}')
  writeFileSync(path.join(vendorDir, 'rrweb.min.js'), rrweb)

  const checksums = {}
  for (const rel of listFrozenFiles(frozenDist)) {
    checksums[`dist/${rel}`] = createHash('sha256')
      .update(readFileSync(path.join(frozenDist, rel)))
      .digest('hex')
  }
  writeFileSync(path.join(frozenRoot, 'checksums.json'), JSON.stringify(checksums))
  writeFileSync(
    path.join(frozenRoot, 'source-manifest.json'),
    JSON.stringify({
      version,
      gitCommit: sourceCommit,
      basePath:
        version === FROZEN_VERSION
          ? '/sign-pay-pro/'
          : `/sign-pay-pro/assist/${version}/`,
    }),
  )

  return frozenRoot
}

// 组装一个能通过双版校验的最小合法发布包：
// - 根层字节 = 冻结 dist（逐字节一致，才能过 verifyChecksums）
// - assist 层 = 当前版本，assist rrweb 用固定 SHA 的真实文件
function createValidDualLayerRelease({ projectRoot, version, frozenRoot }) {
  const root = path.join(projectRoot, 'release', `static-mobile-auth-${version}`)
  const rootDist = path.join(root, 'dist')

  // 根层与冻结 dist 逐字节一致
  cpSync(path.join(frozenRoot, 'dist'), rootDist, { recursive: true })

  // assist 层
  const assistVersionRoot = path.join(rootDist, 'assist', version)
  const assistWrapper = path.join(assistVersionRoot, 'assistance-mobile-auth')
  const assistVendor = path.join(assistWrapper, 'vendor')
  mkdirSync(assistVendor, { recursive: true })
  writeFileSync(path.join(assistVersionRoot, 'index.html'), '<html>assist</html>')
  writeFileSync(path.join(assistWrapper, 'assistance-mobile-auth.js'), 'export const assist = true')
  writeFileSync(path.join(assistWrapper, 'assistance-mobile-auth.umd.cjs'), 'module.exports = { assist: true }')
  writeFileSync(path.join(assistWrapper, `assistance-mobile-auth.${version}.js`), 'export const assist = true')
  writeFileSync(
    path.join(assistWrapper, `assistance-mobile-auth.${version}.umd.cjs`),
    'module.exports = { assist: true }',
  )
  writeFileSync(path.join(assistVendor, 'new-control-style.css'), 'body{}')
  writeFileSync(path.join(assistVendor, 'rrweb.min.js'), realRrweb())

  // 包元数据
  mkdirSync(path.join(root, 'nginx'), { recursive: true })
  writeFileSync(
    path.join(root, 'nginx', 'sign-pay-pro-static.conf'),
    createNginxConfig({
      releaseRootPlaceholder: '/opt/mobile-auth-static/dist',
      assistVersions: [version],
      latestAssistVersion: version,
    }),
  )
  writeFileSync(
    path.join(root, 'manifest.json'),
    JSON.stringify(
      createManifest({
        packageName: 'mobile-auth-h5',
        version,
        gitCommit: 'abc1234',
        builtAt: '2026-07-24T00:00:00.000Z',
        frozenSourceGitCommit: 'frozen123',
      }),
    ),
  )
  writeFileSync(path.join(root, 'README.md'), createReadme({ version }))
  writeFileSync(path.join(root, 'TODO.md'), createDeferredH5Note(version))

  return root
}

function writeFixtureFile(root, relative, content) {
  const fullPath = path.join(root, relative)
  mkdirSync(path.dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, content)
}

function replaceLast(value, search, replacement) {
  const index = value.lastIndexOf(search)
  return index === -1
    ? value
    : `${value.slice(0, index)}${replacement}${value.slice(index + search.length)}`
}

function mergeManifest(baseManifest, override) {
  return deepMergeManifest(baseManifest, override)
}

function deepMergeManifest(base, override) {
  if (
    base === null ||
    typeof base !== 'object' ||
    Array.isArray(base) ||
    override === null ||
    typeof override !== 'object' ||
    Array.isArray(override)
  ) {
    return override
  }

  const result = { ...base }
  for (const [key, value] of Object.entries(override)) {
    result[key] = key in base ? deepMergeManifest(base[key], value) : value
  }
  return result
}
