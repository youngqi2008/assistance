// @vitest-environment node
import { readFileSync } from 'node:fs'
import { JSDOM, VirtualConsole } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

const hostFiles = ['test-duodian-health-0.3.0-live.html', 'test-duodian-health-formal-0.3.0.html']
const formalSdkUrl = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.0/assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.0.umd.cjs'
const windows: JSDOM[] = []
afterEach(() => { for (const dom of windows.splice(0)) dom.window.close() })

function host(file = hostFiles[0], options: { sdk?: boolean; helper?: boolean } = {}) {
  const html = readFileSync(new URL(`../../tests/manual/${file}`, import.meta.url), 'utf8')
  const dom = new JSDOM(html, { url: 'https://host.invalid/test.html', runScripts: 'outside-only', virtualConsole: new VirtualConsole() })
  windows.push(dom)
  const { window } = dom
  const consoleCalls = ['log', 'info', 'warn', 'error', 'debug'].map(method => vi.spyOn(window.console, method as 'log'))
  const storage = vi.spyOn(window.Storage.prototype, 'setItem')
  const fetch = vi.fn(); Object.assign(window, { fetch })
  const xhr = vi.spyOn(window.XMLHttpRequest.prototype, 'open')
  const sessions: Array<{ options: Record<string, (...args: any[]) => void>; resolve: (value: unknown) => void; reject: (value: unknown) => void }> = []
  const factory = vi.fn(options => {
    let resolve!: (value: unknown) => void, reject!: (value: unknown) => void
    const pending = new Promise((yes, no) => { resolve = yes; reject = no })
    sessions.push({ options, resolve, reject })
    return { open: vi.fn(() => pending), destroy: vi.fn() }
  })
  Object.assign(window, { AssistanceMobileAuth: { createAssistanceMobileAuthSdk: factory },
    AssistanceCustomPageTestHost: { createTestHostAuthParams: vi.fn(() => ({ sign: 'INPUT_PRIVATE_SIGN' })) } })
  if (options.sdk === false) delete (window as any).AssistanceMobileAuth
  if (options.helper === false) delete (window as any).AssistanceCustomPageTestHost
  for (const script of window.document.querySelectorAll('script:not([src])')) window.eval(script.textContent!)
  const node = (selector: string) => window.document.querySelector<HTMLElement>(selector)!
  const click = (selector = '#open') => node(selector).click()
  const flush = async () => { await Promise.resolve(); await Promise.resolve() }
  const assertPrivate = () => {
    for (const spy of consoleCalls) expect(spy).not.toHaveBeenCalled()
    expect(storage).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled(); expect(xhr).not.toHaveBeenCalled()
    expect(window.localStorage.length).toBe(0); expect(window.sessionStorage.length).toBe(0)
    expect(node('body').textContent).not.toContain('INPUT_PRIVATE_SIGN')
  }
  return { window, node, click, flush, sessions, factory, assertPrivate }
}

describe.each(hostFiles)('%s executes its actual inline script', file => {
  const host = () => createHost(file)
  it('renders the complete SDK success object only in the protected result region', async () => {
    const h = host(); h.click()
    const payload = { token: 'PRIVATE_TOKEN', idLast4: '123X', keyA: 'PRIVATE_KEY', requestId: 'duodian-health-test', status: 'success', message: '完成', extra: { supplied: true } }
    h.sessions[0].resolve(payload); await h.flush()
    expect(JSON.parse(h.node('#result').textContent!)).toEqual(payload)
    expect(h.node('#result').classList.contains('rr-block')).toBe(true)
    expect(h.node('#result').dataset.rrwebSensitive).toBe('true')
    expect(h.node('#status').textContent).toBe('验证完成')
    expect(h.node('#open').hasAttribute('disabled')).toBe(false)
    expect(h.node('#open').hasAttribute('aria-busy')).toBe(false)
    h.assertPrivate()
  })

  it('retains a specific error callback instead of the subsequent generic rejection', async () => {
    const h = host(); h.click()
    const error = { code: 'SDK_SPECIFIC_FAILURE', message: '输入有误', requestId: 'one' }
    h.sessions[0].options.onError?.(error)
    h.sessions[0].reject(new Error('generic rejection')); await h.flush()
    expect(JSON.parse(h.node('#result').textContent!)).toEqual(error)
    expect(h.node('#status').textContent).toBe('验证失败')
    expect(h.node('#open').hasAttribute('disabled')).toBe(false); h.assertPrivate()
  })

  it.each([{ reason: '用户关闭', requestId: 'one' }, false, undefined])('preserves cancellation payload %j and status through rejection', async payload => {
    const h = host(); h.click()
    h.sessions[0].options.onCancel?.(payload)
    h.sessions[0].reject(new Error('Assistance auth cancelled')); await h.flush()
    expect(h.node('#result').textContent).toBe(payload === undefined ? '' : JSON.stringify(payload, null, 2))
    expect(h.node('#status').textContent).toBe('验证已取消')
    expect(h.node('#open').hasAttribute('disabled')).toBe(false); h.assertPrivate()
  })

  it('shows a protected nonterminal notice without unlocking and keeps it separate from success', async () => {
    const h = host(); h.click()
    const notice = { code: 'RETRY_INPUT', message: '请重试', phase: 'verify' }
    h.sessions[0].options.onErrorNotice(notice); await h.flush()
    expect(JSON.parse(h.node('#notices').textContent!)).toEqual(notice)
    expect(h.node('#notices').classList.contains('rr-block')).toBe(true)
    expect(h.node('#notices').dataset.rrwebSensitive).toBe('true')
    expect(h.node('#open').hasAttribute('disabled')).toBe(true)
    expect(h.node('#result').textContent).toBe('')
    h.click('#native'); expect(h.factory).toHaveBeenCalledTimes(1)
    h.sessions[0].resolve({ status: 'success', token: 'PRIVATE_TOKEN' }); await h.flush()
    expect(h.node('#result').textContent).toContain('PRIVATE_TOKEN')
    expect(h.node('#notices').textContent).toContain('RETRY_INPUT'); h.assertPrivate()
  })

  it('clears previous result, notices and terminal callback state on reopening', async () => {
    const h = host(); h.click(); h.click(); h.click('#native')
    expect(h.factory).toHaveBeenCalledTimes(1)
    h.sessions[0].options.onErrorNotice({ message: 'old notice' })
    h.sessions[0].options.onError?.({ code: 'OLD_FAILURE' })
    h.sessions[0].reject(new Error('old rejection')); await h.flush()
    h.click()
    expect(h.node('#result').textContent).toBe(''); expect(h.node('#notices').textContent).toBe('')
    h.sessions[1].reject(new h.window.Error('new failure')); await h.flush()
    expect(JSON.parse(h.node('#result').textContent!)).toEqual({ name: 'Error', message: 'new failure' })
    expect(h.node('#open').hasAttribute('disabled')).toBe(false); h.assertPrivate()
  })

  it('renders hostile payloads as text without creating HTML or executing handlers', async () => {
    const h = host(); h.click()
    const message = '<img src=x onerror="window.injected=true"><script>window.injected=true</script>'
    h.sessions[0].options.onErrorNotice({ message })
    h.sessions[0].options.onError?.({ code: 'HTML_ERROR', message })
    h.sessions[0].reject(new Error('generic')); await h.flush()
    expect(h.node('#result').textContent).toContain('<img')
    expect(h.node('#notices').textContent).toContain('<script>')
    expect(h.node('#result').children.length).toBe(0); expect(h.node('#notices').children.length).toBe(0)
    expect((h.window as any).injected).toBeUndefined(); h.assertPrivate()
  })

  it('retains actual fields on a thrown Error and unlocks the buttons', async () => {
    const h = host(); h.click()
    h.sessions[0].reject(Object.assign(new Error('configuration failure'), { code: 'CONFIG', detail: { available: true } })); await h.flush()
    expect(JSON.parse(h.node('#result').textContent!)).toEqual({ code: 'CONFIG', detail: { available: true }, name: 'Error', message: 'configuration failure' })
    expect(h.node('#native').hasAttribute('disabled')).toBe(false); h.assertPrivate()
  })

  it('invalid advanced JSON unlocks without creating a session and a valid native retry retains options', async () => {
    const h = host()
    const input = h.node('#authParams') as HTMLTextAreaElement; input.value = '{invalid'
    h.click(); await h.flush()
    expect(h.node('#status').textContent).toBe('参数格式有误，请检查高级设置中的 JSON')
    expect(h.node('#open').hasAttribute('disabled')).toBe(false); expect(h.factory).not.toHaveBeenCalled()
    input.value = ''; h.click('#native')
    expect(h.factory).toHaveBeenCalledWith(expect.objectContaining({ closable: false, useCustomKeyboard: false }))
    h.sessions[0].resolve({ status: 'success' }); await h.flush(); h.assertPrivate()
  })
})

const createHost = host
describe('formal host resource diagnostics', () => {
  const formal = hostFiles[1]
  it('loads the formal SDK with the existing helper and reports expected source/version/readiness', () => {
    const h = host(formal)
    expect(h.node('script[src]').getAttribute('src')).toBe(formalSdkUrl)
    expect(h.node('script[src="./assist/0.3.0/test-host-params.js"]')).not.toBeNull()
    expect(h.node('#sdkUrl').textContent).toBe(formalSdkUrl)
    expect(h.node('#sdkVersion').textContent).toBe('0.3.0')
    expect(h.node('#sdkStatus').textContent).toContain('已加载')
    h.click()
    expect(h.factory).toHaveBeenCalledWith(expect.objectContaining({ appId: '8a9481c79c05c8bd019f6a0a6c002457' }))
    const options = h.factory.mock.calls[0][0]
    expect(options).not.toHaveProperty('baseUrl'); expect(options).not.toHaveProperty('customPage')
    h.assertPrivate()
  })
  it('reports loading, script failure and recovers after a valid load', async () => {
    const h = host(formal, { sdk: false })
    expect(h.node('#sdkStatus').textContent).toContain('正在加载')
    h.node('script[src]').dispatchEvent(new h.window.Event('error'))
    expect(h.node('#sdkStatus').textContent).toContain('加载失败')
    h.click(); await h.flush()
    expect(h.node('#status').textContent).toContain('SDK 加载失败')
    expect(h.node('#open').hasAttribute('disabled')).toBe(false)
    expect(h.factory).not.toHaveBeenCalled()
    Object.assign(h.window, { AssistanceMobileAuth: { createAssistanceMobileAuthSdk: h.factory } })
    h.node('script[src]').dispatchEvent(new h.window.Event('load'))
    expect(h.node('#sdkStatus').textContent).toContain('已加载')
    h.click(); expect(h.factory).toHaveBeenCalledTimes(1); h.assertPrivate()
  })
  it('distinguishes a completed load missing the expected factory from carrier errors', async () => {
    const h = host(formal, { sdk: false })
    h.node('script[src]').dispatchEvent(new h.window.Event('load'))
    expect(h.node('#sdkStatus').textContent).toContain('接口不可用')
    h.click(); await h.flush()
    expect(h.node('#status').textContent).toContain('接口不可用')
    expect(h.node('#result').textContent).toBe(''); h.assertPrivate()
  })
  it('explains missing integration helper and still accepts supplied authParams', async () => {
    const h = host(formal, { helper: false })
    h.click(); await h.flush()
    expect(h.node('#status').textContent).toContain('联调参数助手未加载')
    expect(h.node('#status').textContent).not.toContain('JSON')
    expect(h.factory).not.toHaveBeenCalled()
    ;(h.node('#authParams') as HTMLTextAreaElement).value = '{"sign":"supplied-private-sign"}'
    h.click()
    expect(h.factory).toHaveBeenCalledWith(expect.objectContaining({ authParams: { sign: 'supplied-private-sign' } }))
    h.sessions[0].resolve({ status: 'success' }); await h.flush(); h.assertPrivate()
  })
})
