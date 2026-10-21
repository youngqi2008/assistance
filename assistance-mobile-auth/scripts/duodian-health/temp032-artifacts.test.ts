// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { JSDOM, VirtualConsole } from 'jsdom'
import { build, type Rollup } from 'vite'
import { describe, expect, test, vi } from 'vitest'

const root = path.resolve(import.meta.dirname, '../..')
const candidate = path.resolve(process.env.TEMP032_CANDIDATE_DIR || 'test-results/duodian032-temp-candidate')
const base = 'https://ginkgo.chinaums.com/sign-pay-pro-temp/assist/0.3.2/'
const subtree = path.join(candidate, 'assist/0.3.2')
const sdkName = 'assistance-mobile-auth.duodian-health.0.3.2.'
const chunks = (result: Rollup.RollupOutput | Rollup.RollupOutput[]) =>
  (Array.isArray(result) ? result : [result]).flatMap(item => item.output).filter(item => item.type === 'chunk')
const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)])

// Artifact checks require an explicitly selected local candidate, never a network URL.
describe.skipIf(!process.env.TEMP032_CANDIDATE_DIR)('actual isolated TEMP032 candidate', () => {
  test('contains the complete H5/probe, loader, customer SDK and resolvable HTML/generated CSS assets', () => {
    expect(existsSync(candidate), 'Build the TEMP032 candidate first').toBe(true)
    expect(readdirSync(candidate).sort()).toEqual(['assist', 'test-duodian-health-temp-0.3.2.html'])
    for (const relative of ['index.html', 'verification', 'custom-verification.html',
      'assistance-mobile-auth/' + sdkName + 'js', 'assistance-mobile-auth/' + sdkName + 'umd.cjs',
      'assistance-mobile-auth/vendor/new-control-style.css', 'assistance-mobile-auth/vendor/rrweb.min.js']) {
      expect(existsSync(path.join(subtree, relative)), relative).toBe(true)
    }
    // Zhongguan's static host serves this extensionless HTML before its legacy
    // fallback redirect. It must retain the versioned H5, not the old root app.
    expect(readFileSync(path.join(subtree, 'verification')))
      .toEqual(readFileSync(path.join(subtree, 'index.html')))
    expect(readFileSync(path.join(candidate, 'test-duodian-health-temp-0.3.2.html'), 'utf8'))
      .toBe(readFileSync(path.join(root, 'tests/manual/test-duodian-health-temp-0.3.2.html'), 'utf8'))
    const check = (reference: string, from: string) => {
      if (/^(?:data:|#|https?:\/\/)/.test(reference)) return
      const relative = path.relative(subtree, from).split(path.sep).join('/')
      const url = new URL(reference, base + relative)
      expect(url.href.startsWith(base), 'TEMP versioned resource: ' + url.pathname).toBe(true)
      expect(existsSync(path.join(subtree, decodeURIComponent(url.pathname.slice(new URL(base).pathname.length)))),
        'Actual dependency: ' + url.pathname).toBe(true)
    }
    for (const file of files(subtree)) {
      const source = readFileSync(file, 'utf8')
      if (file.endsWith('.html')) {
        const dom = new JSDOM(source)
        try {
          for (const element of dom.window.document.querySelectorAll('script[src], link[href]')) {
            check(element.getAttribute(element.tagName === 'SCRIPT' ? 'src' : 'href')!, file)
          }
        } finally { dom.window.close() }
      }
      // Existing vendor CSS has an unused toast loading.png dependency absent in prior releases too.
      // Check generated CSS here; actual browser request failures are checked by the release harness.
      if (file.endsWith('.css') && !file.includes(path.sep + 'vendor' + path.sep)) {
        for (const match of source.matchAll(/url\(["']?([^"')]+)["']?\)/g)) check(match[1], file)
      }
    }
  })

  test('executes the actual UMD and observes TEMP probe and loader URLs without fabricating eligibility', async () => {
    expect(existsSync(subtree), 'Build the TEMP032 candidate first').toBe(true)
    const dom = new JSDOM('<!doctype html><body></body>', {
      url: 'https://customer.invalid/', runScripts: 'outside-only', virtualConsole: new VirtualConsole(),
    })
    const fetch = vi.fn(() => Promise.reject(new Error('Network disabled')))
    Object.assign(dom.window, { fetch })
    let sdk: any
    try {
      dom.window.eval(readFileSync(path.join(subtree, 'assistance-mobile-auth', sdkName + 'umd.cjs'), 'utf8'))
      sdk = (dom.window as any).AssistanceMobileAuth.createAssistanceMobileAuthSdk({
        closable: true, authWindowHeight: '72vh', authWindowMaxHeight: '82vh', useCustomKeyboard: true,
        onReady() {}, onSuccess() {}, onCancel() {}, onError() {}, onClose() {},
      })
      const pendingProbe = sdk.precheck({ scene: 'native-number' })
      const probe = dom.window.document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-probe]')!
      const probeUrl = new URL(probe.src)
      expect(probeUrl.origin + probeUrl.pathname).toBe(base + 'verification')
      expect(probeUrl.searchParams.get('mode')).toBe('probe')
      sdk.destroy()
      expect(await pendingProbe).toMatchObject({ eligible: false, reason: 'unknown' })
      // This independent open inspects routing only. No simulated probe result or auth success is claimed.
      const pendingOpen = sdk.open({ scene: 'native-number' }).catch(() => undefined)
      for (let i = 0; i < 12; i++) await Promise.resolve()
      const frame = dom.window.document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame]')!
      expect(frame, 'Actual UMD creates the authorization iframe').not.toBeNull()
      const loaderUrl = new URL(frame.src)
      expect(loaderUrl.origin + loaderUrl.pathname).toBe(base + 'custom-verification.html')
      expect(loaderUrl.searchParams.has('authParams')).toBe(false)
      sdk.destroy(); await pendingOpen
      expect(fetch).not.toHaveBeenCalled()
      expect(dom.window.localStorage.length + dom.window.sessionStorage.length).toBe(0)
    } finally { sdk?.destroy(); dom.window.close() }
  })

  test('TEMP wrapper/runtime module trees exclude signer and parameter helpers', async () => {
    const { default: config, duodian032RuntimeAliases } = await import('../../vite.duodian-health032.config')
    const define = { ...config.define,
      __CUSTOM_LOADER_URL__: JSON.stringify(base + 'custom-verification.html'),
      'import.meta.env.VITE_SFT_PUBLIC_BASE_PATH': JSON.stringify('/sign-pay-pro-temp/assist/0.3.2/'),
      'import.meta.env.VITE_SFT_PUBLIC_BASE_URL': JSON.stringify(base),
    }
    const wrapper = chunks(await build({ ...config, configFile: false, logLevel: 'silent', define,
      build: { ...config.build, write: false } }) as Rollup.RollupOutput[])
    const runtime = chunks(await build({ root, envDir: false, logLevel: 'silent',
      configFile: path.join(root, 'vite.custom-runtime.config.ts'), resolve: { alias: duodian032RuntimeAliases },
      define, build: { write: false, lib: { entry: path.join(root, 'src/customers/duodian-health/runtime.ts'),
        name: 'AssistanceInjectedRuntime' } },
    }) as Rollup.RollupOutput)
    for (const output of [wrapper, runtime]) {
      expect(output.flatMap(item => Object.keys(item.modules)).filter(id =>
        /mobileAuthSignature|testHostParams|sftSignature|signParams|duodian031AuthParams/i.test(id))).toEqual([])
      for (const item of output) expect(item.code).not.toMatch(/BEGIN (?:RSA )?PRIVATE KEY|MOBILE_AUTH_FRONTEND_APP_KEY|VITE_SFT_CUSTOMER_APP_KEY/)
    }
    expect(runtime[0].imports).toEqual([]); expect(runtime[0].dynamicImports).toEqual([])
  }, 30000)
})
