// @vitest-environment-options {"runScripts":"dangerously"}
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getAgreementDocByKey, type AgreementDocKey } from '../../agreements/agreementContent'
import type { CustomAgreementConfig, CustomAuthorizationConfig, CustomBootPayload } from '../../custom-page/types'
import type { MobileAuthSdkFacade } from '../../sdk/mobileAuthFacade'
import { createAssistanceAuthMessage } from '../../wrapper/verificationBridge'
import { createAssistanceMobileAuthSdk } from './index'
import { start } from './runtime'

// Keep entry, wrapper BOOT, customer DOM, session and reader real. The external
// carrier calls and browser image decoding are the only unavailable dependencies.
vi.mock('../../sdk/resourceLoader', () => ({ loadMobileAuthSdkResources: vi.fn(async () => ({ state: 'ready',
  scriptId: 'mobile-auth-sdk-script', styleId: 'mobile-auth-sdk-style' })) }))
const official = vi.hoisted(() => ({ facade: undefined as MobileAuthSdkFacade | undefined }))
vi.mock('../../sdk/mobileAuthFacade', () => ({ createMobileAuthSdkFacade: () => official.facade }))
vi.mock('./style.css?raw', async () => ({ default: (await import('node:fs')).readFileSync('src/customers/duodian-health/style.css', 'utf8') }))
const signed = { version: 'MOCK_ONLY_VERSION', appId: 'MOCK_ONLY_SIGNED_APP_ID', sign: 'MOCK_ONLY_INVALID_SIGN',
  traceId: 'MOCK_ONLY_TRACE', timestamp: 'MOCK_ONLY_TIMESTAMP', authType: '0', scope: '3ElementsAuthAssistFill' }
const formalNames = ['《用户认证服务隐私政策》', '《个人信息收集清单》', '《敏感个人信息处理规则》', '《第三方共享个人信息清单》']
const commonKeys = ['user-auth-privacy-policy', 'personal-info-collection-list', 'sensitive-info-rules']
const originalUrl = window.location.href
const handles: Array<{ dispose(): void }> = []

beforeEach(() => {
  vi.stubGlobal('__DUODIAN_BOTTOM_SHEET__', true)
})
afterEach(() => {
  handles.splice(0).reverse().forEach(handle => handle.dispose())
  vi.restoreAllMocks(); vi.unstubAllGlobals()
  document.body.replaceChildren(); document.body.style.overflow = ''
  window.history.replaceState(null, '', originalUrl)
})

async function fixture(options: Parameters<typeof createAssistanceMobileAuthSdk>[0] = {}) {
  const sdk = createAssistanceMobileAuthSdk({ authParams: signed, ...options })
  const pending = sdk.open().catch(() => undefined)
  let boot: CustomBootPayload
  try {
    const frame = document.querySelector<HTMLIFrameElement>('[data-assistance-auth-frame]')!
    const transport = vi.spyOn(frame.contentWindow!, 'postMessage')
    const url = new URL(frame.src)
    window.dispatchEvent(new MessageEvent('message', { source: frame.contentWindow, origin: url.origin,
      data: createAssistanceAuthMessage('ASSISTANCE_AUTH_READY', url.searchParams.get('sessionId')!) }))
    boot = transport.mock.calls.find(([message]) => message.type === 'ASSISTANCE_AUTH_CUSTOM_BOOT')![0].payload
  } finally { sdk.destroy(); await pending }
  const config = boot.config as CustomAuthorizationConfig
  // Use a different, current loader mount: stale generic /verification URLs or
  // the business asset base must not leak into reader links.
  // As in customerPage.test.ts, run classic customer scripts in a real iframe
  // realm; Vitest's top-level globals and jsdom's script realm differ.
  const runtimeFrame = document.createElement('iframe')
  runtimeFrame.src = new URL('/current-temp/assist/0.3.0/custom-verification.html?role=authorization&old=discard', window.location.origin).href
  document.body.append(runtimeFrame)
  const view = runtimeFrame.contentWindow!
  view.document.open(); view.document.write('<!doctype html><html><body></body></html>'); view.document.close()
  handles.push({ dispose: () => runtimeFrame.remove() })
  vi.stubGlobal('window', view); vi.stubGlobal('document', view.document)
  const realm = view as unknown as typeof globalThis
  for (const name of ['HTMLElement', 'Element', 'Event', 'MessageEvent'] as const) vi.stubGlobal(name, realm[name])
  vi.spyOn(realm.HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
  vi.spyOn(realm.HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(318)
  config.page.baseUrl = 'https://customer.example/ui-assets/'
  const facade: MobileAuthSdkFacade = { showAuthPage: vi.fn(), initControl: vi.fn(), clearControl: vi.fn(),
    getAuthResult: vi.fn(), updateSubmitBtnStatus: vi.fn() }
  official.facade = facade
  const lifetime = new AbortController()
  handles.push(await start(config, { runtimeSource: boot.runtimeSource, signal: lifetime.signal }))
  vi.mocked(facade.showAuthPage).mock.calls[0][0].success?.({ code: '103000' })
  const init = vi.mocked(facade.initControl).mock.calls[0][0]
  init.authReady?.({ code: '103000' })
  const root = document.querySelector<HTMLElement>('[data-custom-root]')!
  function node<T extends HTMLElement = HTMLElement>(selector: string) { return root.querySelector<T>(selector)! }
  function reader(link = init.styleOption.agreeStyle!.agreeArr![0].link!) {
    const panel = document.createElement('div'); panel.className = 'ydrz-confirm-iframe'
    const header = document.createElement('div'); header.className = 'ydrz-confirm-header'
    const close = document.createElement('em'); close.addEventListener('click', () => panel.remove()); header.append(close)
    const frame = document.createElement('iframe'); frame.src = link
    panel.append(header, frame); document.body.append(panel)
    const transport = vi.spyOn(frame.contentWindow!, 'postMessage')
    function send(type: 'ASSISTANCE_AUTH_READY' | 'ASSISTANCE_AUTH_CLOSE', override: Partial<MessageEventInit> = {}) {
      window.dispatchEvent(new MessageEvent('message', { source: frame.contentWindow, origin: window.location.origin,
        data: createAssistanceAuthMessage(type, config.sessionId), ...override }))
    }
    return { panel, frame, transport, send, close }
  }
  return { config, runtimeSource: boot.runtimeSource, root, node, reader, init, facade, lifetime }
}

// Break caught: entry filtering and runtime child/check indexes diverge, or a
// shared aggregation change loses/reorders ordinary duplicate caller documents.
test('default entry→runtime keeps the formal four then filtered caller order and duplicate checkbox indexes', async () => {
  const first = { name: '《客户服务协议》', link: 'https://caller.example/first' }
  const middle = { name: '《客户隐私协议》', link: 'https://caller.example/privacy' }
  const duplicate = { name: '《客户服务协议》', link: 'https://caller.example/second' }
  const f = await fixture({ agreements: [first, { name: '  《第三方共享个人信息清单》  ', link: 'https://caller.example/reserved' }, middle, duplicate] })
  expect(f.config.appId).toBe('8a9481c79c05c8bd019f6a0a6c002457')
  expect(f.config.agreements).toEqual([first, middle, duplicate])
  const childArr = f.init.styleOption.agreeStyle!.childArr!
  expect(childArr.map(entry => entry.name)).toEqual([...formalNames, first.name, middle.name, duplicate.name])
  expect(childArr.slice(4)).toEqual([first, middle, duplicate])
  expect(childArr.slice(0, 4).map(entry => new URL(entry.link!).searchParams.get('doc')))
    .toEqual([...commonKeys, 'dongfangdadi-v2-third-party-sharing'])
  const checks = [...f.root.querySelectorAll<HTMLInputElement>('[data-caller-agreements] input')]
  expect([...f.root.querySelectorAll<HTMLAnchorElement>('[data-caller-agreements] a')].map(link => link.href))
    .toEqual(['https://caller.example/first', 'https://caller.example/privacy', 'https://caller.example/second'])
  window.AssistanceCustomPage!.setIdLast4('123X')
  // Check the last duplicate first: checking index 2 must not check index 0.
  for (const index of [2, 1]) {
    checks[index].checked = true; checks[index].dispatchEvent(new Event('change'))
    expect(f.init.beforeSubmit?.()).toBe(false)
  }
  checks[0].checked = true; checks[0].dispatchEvent(new Event('change'))
  expect(f.init.beforeSubmit?.()).toBe(true)
  expect(f.init.styleOption.agreeStyle).not.toHaveProperty('CMText')
  expect(f.init.styleOption.agreeStyle).not.toHaveProperty('setChainAgreement')
  expect(f.node('#ydrzAgreementControl').closest('[hidden]')).toBeNull()
})

// Literal profile fixtures independently name the expected registry keys; doc
// identity below catches copied/replaced content at the runtime BOOT boundary.
test.each([
  ['yuanbao', '10037e6f9d903f86019ed8cfb6320365', 'third-party-sharing-list'],
  ['yuanbao alias', '8a9481c79c05c8bd019ed8d49fb81df2', 'third-party-sharing-list'],
  ['haike', '8a9481c79c05c8bd019ed8d7ab571df3', 'haike-v2-third-party-sharing'],
  ['tiantianyoubao', '8a9481c79c05c8bd019f6f42956924a0', null],
  ['anxingtianxia', '8a9481c79c05c8bd019f8e3061ce25ee', 'anxingtianxia-v2-third-party-sharing'],
  ['hengda', '8a9481c69c05c8c1019ffa21d9722a4b', 'hengda-v2-third-party-sharing'],
])('%s business override selects its existing documents while preserving Duodian appearance and signed identity', async (_profile, appId, fourthKey) => {
  const f = await fixture({ appId })
  expect(f.config.appId).toBe(appId)
  expect(f.config.authParams).toEqual(signed)
  expect(vi.mocked(f.facade.showAuthPage).mock.calls[0][0].data).toEqual(signed)
  expect(f.root.dataset.customTemplate).toBe('duodian-health')
  expect(f.node('[data-security-title]').getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/)
  expect(f.node('[data-other]').textContent).toBe('选择其他方式')
  expect(f.init.styleOption.submitBtnStyle?.name).toBe('授权登录')
  const r = f.reader(); r.send('ASSISTANCE_AUTH_READY')
  const reader = r.transport.mock.calls.find(([message]) => message.type === 'ASSISTANCE_AUTH_CUSTOM_BOOT')![0].payload.config as CustomAgreementConfig
  const keys = fourthKey ? [...commonKeys, fourthKey] : commonKeys
  expect(reader.entries.map(entry => entry.docKey)).toEqual(keys)
  expect(reader.entries.map(entry => entry.name)).toEqual(fourthKey ? formalNames : formalNames.slice(0, 3))
  for (const key of keys) expect(reader.docs[key as keyof typeof reader.docs]).toBe(getAgreementDocByKey(key as AgreementDocKey))
  if (fourthKey === 'haike-v2-third-party-sharing') {
    expect(reader.docs['haike-v2-privacy-policy']).toBe(getAgreementDocByKey('haike-v2-privacy-policy'))
    expect(reader.docs['haike-v2-cmcc-privacy-policy']).toBe(getAgreementDocByKey('haike-v2-cmcc-privacy-policy'))
  }
})

test('reader uses the current loader, session, runtime and loaded customer styles and rejects invalid boot senders', async () => {
  const f = await fixture()
  const link = f.init.styleOption.agreeStyle!.agreeArr![0].link!
  const url = new URL(link)
  expect(url.pathname).toBe('/current-temp/assist/0.3.0/custom-verification.html')
  expect(url.origin).toBe(window.location.origin)
  expect(Object.fromEntries(url.searchParams)).toEqual({ role: 'agreement', sessionId: f.config.sessionId, parentOrigin: window.location.origin, doc: 'entry' })
  const r = f.reader()
  r.send('ASSISTANCE_AUTH_READY', { origin: 'https://foreign.example' })
  r.send('ASSISTANCE_AUTH_READY', { source: window })
  r.send('ASSISTANCE_AUTH_READY', { data: createAssistanceAuthMessage('ASSISTANCE_AUTH_READY', 'old-session') })
  r.send('ASSISTANCE_AUTH_READY', { data: { ...createAssistanceAuthMessage('ASSISTANCE_AUTH_READY', f.config.sessionId), source: 'foreign-sdk' } })
  expect(r.transport).not.toHaveBeenCalled()
  const unregistered = f.reader(`${link}&unregistered=1`); unregistered.send('ASSISTANCE_AUTH_READY')
  expect(unregistered.transport).not.toHaveBeenCalled(); unregistered.panel.remove()
  r.send('ASSISTANCE_AUTH_READY')
  const payload = r.transport.mock.calls[0][0].payload as CustomBootPayload
  expect(payload.runtimeSource).toBe(f.runtimeSource)
  const reader = payload.config as CustomAgreementConfig
  expect(reader.rootAttributes).toEqual({ 'data-custom-template': 'duodian-health' })
  expect(reader.css).toBe([...f.root.querySelectorAll('style')].map(style => style.textContent).join('\n'))
  expect(reader.css).not.toBe(''); expect(reader.styleUrls).toEqual([])
  expect(reader).not.toHaveProperty('authParams'); expect(reader).not.toHaveProperty('appId')
  // Rendering the transmitted config exercises actual formal content and its
  // navigation/close controls without starting another authorization session.
  handles.push(await start(reader, { runtimeSource: payload.runtimeSource, signal: f.lifetime.signal }))
  document.querySelector<HTMLAnchorElement>('[data-agreement-reader] a[data-doc-key="personal-info-collection-list"]')!.click()
  expect(document.querySelector('[data-agreement-reader] article')!.textContent).toContain('手机号码')
  document.querySelector<HTMLButtonElement>('[data-reader-back]')!.click()
  expect(document.querySelectorAll('[data-agreement-reader] nav a')).toHaveLength(4)
  const post = vi.spyOn(window.parent, 'postMessage')
  document.querySelector<HTMLButtonElement>('[data-reader-close]')!.click()
  expect(post).toHaveBeenCalledWith(expect.objectContaining({ type: 'ASSISTANCE_AUTH_CLOSE', sessionId: f.config.sessionId }), window.location.origin)
  expect(f.facade.showAuthPage).toHaveBeenCalledTimes(1)
  expect(f.facade.initControl).toHaveBeenCalledTimes(1)
})

// Break caught: reader observation resets the value, loses next-empty selection
// or focus, unconditionally reopens the keyboard, or restarts official controls.
test.each([
  ['partial/collapsed', '12', false], ['partial/expanded', '12', true],
  ['full/collapsed', '123X', false], ['full/expanded', '123X', true],
] as const)('actual reader CLOSE restores %s without a new authorization session', async (_name, value, expanded) => {
  const f = await fixture(); const grid = f.node('[data-id-grid]')
  window.AssistanceCustomPage!.setIdLast4(value)
  grid.click()
  if (!expanded) f.node('[data-collapse]').click()
  grid.focus()
  const r = f.reader(); r.send('ASSISTANCE_AUTH_READY'); r.frame.focus()
  expect(f.node('[data-keyboard]').hidden).toBe(true)
  f.node('[data-key="3"]').click()
  expect(f.node<HTMLInputElement>('[data-id-value]').value).toBe(value)
  r.send('ASSISTANCE_AUTH_CLOSE'); await Promise.resolve()
  expect(r.panel.isConnected).toBe(false)
  expect(f.node<HTMLInputElement>('[data-id-value]').value).toBe(value)
  expect([...f.root.querySelectorAll('[data-digit]')].map(box => box.textContent).join('')).toBe(value)
  expect(f.node('[data-keyboard]').hidden).toBe(!expanded)
  expect(document.activeElement).toBe(grid)
  expect([...f.root.querySelectorAll<HTMLElement>('[data-id-box]')].map(box => box.dataset.active))
    .toEqual(value.length === 4 || !expanded ? ['false', 'false', 'false', 'false'] : ['false', 'false', 'true', 'false'])
  expect(f.node('[data-other]').hidden).toBe(false); expect(f.node<HTMLButtonElement>('[data-other]').disabled).toBe(false)
  expect(f.facade.showAuthPage).toHaveBeenCalledTimes(1); expect(f.facade.initControl).toHaveBeenCalledTimes(1)
  expect(f.config.sessionId).toBe(new URL(r.frame.src).searchParams.get('sessionId'))
})
