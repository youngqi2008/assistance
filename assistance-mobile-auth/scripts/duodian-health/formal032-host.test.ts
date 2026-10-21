// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { JSDOM, VirtualConsole } from 'jsdom'
import { afterEach, expect, test, vi } from 'vitest'

const file = new URL('../../tests/manual/test-duodian-health-formal-0.3.2.html', import.meta.url)
const sdkUrl = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.umd.cjs?image=20261015-compact'
const windows: JSDOM[] = []
afterEach(() => { for (const dom of windows.splice(0)) dom.window.close() })

function host() {
  expect(existsSync(file), 'The 032 customer-shaped manual host must exist').toBe(true)
  const dom = new JSDOM(readFileSync(file, 'utf8'), { url: 'https://host.invalid/test.html', runScripts: 'outside-only', virtualConsole: new VirtualConsole() })
  windows.push(dom)
  const { window } = dom
  const fetch = vi.fn(); Object.assign(window, { fetch })
  const logs = ['log', 'warn', 'error', 'info'].map(method => vi.spyOn(window.console, method as 'log'))
  let resolveProbe!: (value: unknown) => void
  let rejectProbe!: (value: unknown) => void
  const probe = new Promise((resolve, reject) => { resolveProbe = resolve; rejectProbe = reject })
  let resolveOpen!: (value: unknown) => void
  let rejectOpen!: (value: unknown) => void
  const pending = new Promise((resolve, reject) => { resolveOpen = resolve; rejectOpen = reject })
  const precheck = vi.fn(() => probe), open = vi.fn(() => pending), destroy = vi.fn()
  let options: Record<string, any>
  const factory = vi.fn(input => { options = input; return { precheck, open, destroy } })
  for (const script of window.document.querySelectorAll('script:not([src])')) window.eval(script.textContent!)
  const node = (selector: string) => window.document.querySelector<HTMLElement>(selector)!
  const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve() }
  const click = () => node('#open').click()
  const load = async () => {
    Object.assign(window, { AssistanceMobileAuth: { createAssistanceMobileAuthSdk: factory } })
    node('#formalSdk032').dispatchEvent(new window.Event('load')); await flush()
  }
  const callbacks = () => options!
  const assertPrivate = () => {
    expect(fetch).not.toHaveBeenCalled()
    expect(window.localStorage.length).toBe(0); expect(window.sessionStorage.length).toBe(0)
    for (const log of logs) expect(log).not.toHaveBeenCalled()
  }
  return { window, node, click, flush, load, factory, precheck, open, callbacks, resolveProbe, rejectProbe, resolveOpen, rejectOpen, assertPrivate }
}

test('the real host dynamically loads only the 032 formal UMD before constructing the old options', async () => {
  const h = host()
  expect(h.window.document.querySelectorAll('script[src]')).toHaveLength(0)
  h.click(); h.click()
  expect(h.window.document.querySelectorAll('script[src]')).toHaveLength(1)
  expect(h.node('#formalSdk032').getAttribute('src')).toBe(sdkUrl)
  expect(h.factory).not.toHaveBeenCalled()
  await h.load()
  expect(h.factory).toHaveBeenCalledTimes(1)
  expect(Object.keys(h.callbacks()).sort()).toEqual(['closable', 'authWindowHeight', 'authWindowMaxHeight', 'useCustomKeyboard', 'onReady', 'onSuccess', 'onCancel', 'onError', 'onClose'].sort())
  expect(h.callbacks()).toMatchObject({ closable: true, authWindowHeight: '72vh', authWindowMaxHeight: '82vh', useCustomKeyboard: true })
  expect(h.precheck).toHaveBeenCalledWith({ scene: 'native-number' })
  expect(h.open).not.toHaveBeenCalled()
  h.resolveProbe({ eligible: true }); await h.flush()
  expect(h.open).toHaveBeenCalledExactlyOnceWith({ scene: 'native-number' })
  h.resolveOpen({ status: 'success' }); await h.flush(); h.assertPrivate()
})

test('the manual page visibly includes the SDK URL and the customer-shaped integration code', () => {
  const h = host()
  const code = h.node('#integrationCode')
  expect(code, 'Visible integration code is required on the test page').not.toBeNull()
  expect(code.textContent).toContain(sdkUrl)
  expect(code.textContent).toContain('createAssistanceMobileAuthSdk')
  expect(code.textContent).toContain("authWindowHeight: '72vh'")
  expect(code.textContent).toContain("authWindowMaxHeight: '82vh'")
  expect(code.textContent).toContain("precheck({ scene: 'native-number' })")
  expect(code.textContent).toContain("open({ scene: 'native-number' })")
  expect(code.textContent).not.toMatch(/authParams|test-host-params|fetchAuthParams/)
})

test.each([false, undefined])('a non-eligible probe (%s) is fully displayed and never opens authorization', async eligible => {
  const h = host(); h.click(); await h.load()
  const payload = { eligible, reason: 'unsupported', detail: { carrier: 'unavailable' } }
  h.resolveProbe(payload); await h.flush()
  expect(h.open).not.toHaveBeenCalled()
  expect(JSON.parse(h.node('#precheckResult').textContent!)).toEqual(payload)
  expect(h.node('#open').hasAttribute('disabled')).toBe(false); h.assertPrivate()
})

test('success displays the complete payload plus the unchanged three-field backend handoff without calling a customer API', async () => {
  const h = host(); h.click(); await h.load(); h.resolveProbe({ eligible: true }); await h.flush()
  const result = { status: 'success', token: 'PRIVATE_TOKEN', idLast4: '0000', keyA: 'PRIVATE_KEY_A', extra: { retained: true } }
  h.callbacks().onReady()
  await h.callbacks().onSuccess(result)
  h.callbacks().onClose(); h.resolveOpen(result); await h.flush()
  expect(JSON.parse(h.node('#result').textContent!)).toEqual(result)
  expect(JSON.parse(h.node('#backendPayload').textContent!)).toEqual({ token: 'PRIVATE_TOKEN', idLast4: '0000', keyA: 'PRIVATE_KEY_A' })
  expect(h.node('#status').textContent).toContain('授权成功')
  for (const selector of ['#result', '#backendPayload', '#precheckResult', '#callbacks']) {
    expect(h.node(selector).classList.contains('rr-block')).toBe(true)
    expect(h.node(selector).dataset.rrwebSensitive).toBe('true')
  }
  expect(h.node('#callbacks').textContent).toContain('onReady')
  expect(h.node('#callbacks').textContent).toContain('onSuccess')
  expect(h.node('#callbacks').textContent).toContain('onClose')
  h.assertPrivate()
})

test.each(['onError', 'onCancel'])('%s remains visible through open rejection and onClose', async callback => {
  const h = host(); h.click(); await h.load(); h.resolveProbe({ eligible: true }); await h.flush()
  const payload = { code: 'CUSTOMER_VISIBLE', message: '<img src=x onerror="window.injected=1">', extra: true }
  h.callbacks()[callback](payload); h.callbacks().onClose(); h.rejectOpen(new Error('generic rejection')); await h.flush()
  expect(JSON.parse(h.node('#result').textContent!)).toEqual(payload)
  expect(h.node('#result').children.length).toBe(0)
  expect((h.window as any).injected).toBeUndefined()
  expect(h.node('#open').hasAttribute('disabled')).toBe(false); h.assertPrivate()
})

test('SDK loading failure explains the deployment prerequisite without asking for authParams and permits retry', async () => {
  const h = host(); h.click()
  h.node('#formalSdk032').dispatchEvent(new h.window.Event('error')); await h.flush()
  expect(h.node('#status').textContent).toContain('部署')
  expect(h.factory).not.toHaveBeenCalled()
  expect(h.node('#open').hasAttribute('disabled')).toBe(false)
  h.click(); await h.load()
  expect(h.factory).toHaveBeenCalledTimes(1)
  h.rejectProbe(new Error('precheck failed')); await h.flush()
  expect(h.open).not.toHaveBeenCalled()
  expect(h.node('#status').textContent).toContain('预检异常'); h.assertPrivate()
})
