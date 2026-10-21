import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CustomAgreementConfig, CustomAuthorizationConfig, CustomPageApi, CustomPageHooks, CustomPageState } from '../custom-page/types'
import type { MobileAuthSdkCallbackPayload, MobileAuthSdkInitControlRequest, MobileAuthSdkShowAuthPageRequest } from '../sdk/types'
import type { MobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import { createAssistanceAuthMessage, type AssistanceAuthMessage } from '../wrapper/verificationBridge'
import { startAuthorization } from './authSession'
import { start } from './entry'
import { loadCustomerPage } from './customerPage'
import { loadMobileAuthSdkResources } from '../sdk/resourceLoader'

vi.mock('../sdk/resourceLoader', () => ({ loadMobileAuthSdkResources: vi.fn() }))
vi.mock('./customerPage', () => ({ loadCustomerPage: vi.fn() }))
const sdk = vi.hoisted(() => ({ facade: undefined as MobileAuthSdkFacade | undefined }))
vi.mock('../sdk/mobileAuthFacade', () => ({ createMobileAuthSdkFacade: () => sdk.facade }))

let hooks: CustomPageHooks
let states: CustomPageState[]
let pageDispose: ReturnType<typeof vi.fn>
let root: HTMLElement
let parentController: AbortController
let pageSignal: AbortSignal
const handles: Array<{ dispose(): void }> = []

beforeEach(() => {
  vi.useFakeTimers()
  states = []
  hooks = { onStateChange: state => states.push(state) }
  pageDispose = vi.fn(() => root.remove())
  root = document.createElement('div')
  root.innerHTML = '<div id="ydrzPhoneControl"></div><div id="ydrzSubmitControl"></div>'
  document.body.append(root)
  parentController = new AbortController()
  vi.mocked(loadMobileAuthSdkResources).mockResolvedValue({ state: 'ready', scriptId: 'sdk', styleId: 'css' })
  vi.mocked(loadCustomerPage).mockImplementation(async (_page, ctx) => {
    pageSignal = ctx.signal
    ctx.api.register(hooks)
    await ctx.sealRegistration()
    return { root, styles: { css: '', urls: [], rootAttributes: {} }, dispose: pageDispose }
  })
})
afterEach(() => {
  handles.splice(0).forEach(handle => handle.dispose())
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  vi.useRealTimers()
})

export async function authFixture(overrides: Partial<CustomAuthorizationConfig> = {}): Promise<{
  config: CustomAuthorizationConfig; facade: MobileAuthSdkFacade; showSuccess(payload: MobileAuthSdkCallbackPayload): void;
  authReady(): void; beforeSubmit(): boolean; api: CustomPageApi; messages: AssistanceAuthMessage[];
  finish(payload: MobileAuthSdkCallbackPayload): void; dispose(): void;
}> {
  const config: CustomAuthorizationConfig = {
    mode: 'authorization', sessionId: 'session-4', parentOrigin: 'https://host.example', appId: 'customer-app',
    page: { kind: 'html', html: '<div></div>', baseUrl: 'https://customer.example/assets/' },
    request: { scene: 'native-number', requestId: 'request-4' },
    authParams: { version: '3.0', appId: 'mobile-app', sign: 'real-sign', traceId: 'trace', timestamp: '20261008000000000', authType: '0', scope: '3ElementsAuthAssistFill' },
    agreements: [], iframeOptions: { closable: true, useCustomKeyboard: true, heightMode: 'auto' },
    trustedBusinessBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro-temp/', deadline: Date.now() + 15000,
    beforeLoginNotificationEnabled: true, stateChangeEnabled: true, ...overrides,
  }
  const facade: MobileAuthSdkFacade = { showAuthPage: vi.fn(), initControl: vi.fn(), clearControl: vi.fn(), getAuthResult: vi.fn(), updateSubmitBtnStatus: vi.fn() }
  sdk.facade = facade
  const messages: AssistanceAuthMessage[] = []
  vi.spyOn(window.parent, 'postMessage').mockImplementation(message => { messages.push(message) })
  const handle = await startAuthorization(config, { runtimeSource: 'runtime', signal: parentController.signal })
  handles.push(handle)
  const show = () => vi.mocked(facade.showAuthPage).mock.calls[0][0] as MobileAuthSdkShowAuthPageRequest
  const init = () => vi.mocked(facade.initControl).mock.calls[0][0] as MobileAuthSdkInitControlRequest
  return { config, facade, messages, api: vi.mocked(loadCustomerPage).mock.calls.at(-1)![1].api,
    showSuccess: payload => show().success?.(payload),
    authReady() { if (!vi.mocked(facade.initControl).mock.calls.length) show().success?.({ code: '103000' }); init().authReady?.({ code: '103000' }) },
    beforeSubmit: () => init().beforeSubmit?.() ?? false,
    finish: payload => init().success?.(payload), dispose: () => handle.dispose(),
  }
}

describe('custom official authorization lifecycle', () => {
  it('loads official CSS next to the fixed loader independently of customer and business bases', async () => {
    const original = window.location.href
    window.history.replaceState({}, '', '/sign-pay-pro-temp/assist/0.3.0/custom-verification.html')
    try {
      const f = await authFixture({ page: { kind: 'html', html: '<div></div>', baseUrl: 'https://customer.example/other/' } })
      const input = vi.mocked(loadMobileAuthSdkResources).mock.calls.at(-1)![0]!
      expect(input.cssUrl).toBe('http://localhost:3000/sign-pay-pro-temp/assist/0.3.0/assistance-mobile-auth/vendor/new-control-style.css')
      expect(f.config.trustedBusinessBaseUrl).toBe('https://ginkgo.chinaums.com/sign-pay-pro-temp/')
      expect(input.jsUrl).toBe('https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js')
    } finally { window.history.replaceState({}, '', original) }
  })
  it('initializes only after customer ready and valid showAuthPage success', async () => {
    const f = await authFixture()
    expect(f.facade.initControl).not.toHaveBeenCalled()
    expect(states.at(-1)?.phase).toBe('initializing')
    f.showSuccess({ code: '103000' })
    expect(f.facade.initControl).toHaveBeenCalledTimes(1)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toBe(false)
    f.authReady(); f.authReady()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toHaveLength(1)
    expect(states.at(-1)?.phase).toBe('ready')
  })
  it('invalid showAuthPage success terminates initialization and ignores late valid callbacks', async () => {
    const f = await authFixture()
    f.showSuccess({ code: 'bad' }); f.showSuccess({ code: '103000' })
    expect(f.facade.initControl).not.toHaveBeenCalled()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    expect(pageSignal.aborted).toBe(true)
  })
  it('RF4 restores only local rejection and locks before first legal submit', async () => {
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123')
    expect(f.beforeSubmit()).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
    expect(states.at(-1)?.inputError).toBeTruthy()
    f.api.setIdLast4('12'); expect(states.at(-1)?.inputError).toBeTruthy()
    f.api.setIdLast4('123x'); expect(states.at(-1)?.inputError).toBeNull()
    expect(f.beforeSubmit()).toBe(true)
    expect(states.at(-1)?.phase).toBe('submitting')
    const calls = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    expect(f.beforeSubmit()).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(calls)
  })
  it('rejects unchecked caller agreement without a persistent identity input error', async () => {
    const f = await authFixture({ agreements: [{ name: '客户协议', link: 'https://external.example/doc' }] })
    f.authReady(); f.api.setIdLast4('123X')
    expect(f.beforeSubmit()).toBe(false)
    expect(states.at(-1)?.inputError).toBeNull()
    expect(states.at(-1)?.message).toBeTruthy()
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
    await vi.advanceTimersByTimeAsync(1400)
    expect(states.at(-1)?.message).toBeNull()
    f.api.setCallerAgreementChecked(0, true)
    expect(f.beforeSubmit()).toBe(true)
  })
  it('RF3 keeps parameters and business URLs independent of customer asset base', async () => {
    const f = await authFixture(); f.showSuccess({ code: '103000' })
    expect(vi.mocked(f.facade.showAuthPage).mock.calls[0][0].data).toEqual(f.config.authParams)
    const agreements = vi.mocked(f.facade.initControl).mock.calls[0][0].styleOption.agreeStyle!
    const readerUrl = new URL(agreements.agreeArr![0].link!)
    expect(readerUrl.origin).toBe(window.location.origin)
    expect(Object.fromEntries(readerUrl.searchParams)).toEqual({ role: 'agreement', sessionId: 'session-4', parentOrigin: window.location.origin, doc: 'entry' })
    expect(f.config.trustedBusinessBaseUrl).toBe('https://ginkgo.chinaums.com/sign-pay-pro-temp/')
    expect(agreements.childArr).toHaveLength(4)
    expect(agreements).not.toHaveProperty('CMText')
  })
  it('returns existing iframe success once with exact origin and request identity', async () => {
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123X'); f.beforeSubmit()
    f.finish({ code: '103000', token: 'real-provider-token', encryptPublicKey: 'key-a' })
    f.finish({ code: '103000', token: 'late', encryptPublicKey: 'late' })
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_SUCCESS')).toEqual([{
      source: 'assistance-mobile-auth', type: 'ASSISTANCE_AUTH_SUCCESS', sessionId: 'session-4',
      payload: { status: 'success', token: 'real-provider-token', idLast4: '123X', keyA: 'key-a', requestId: 'request-4', message: '验证完成' },
    }])
    expect(vi.mocked(window.parent.postMessage).mock.calls.every(call => (call as unknown[])[1] === 'https://host.example')).toBe(true)
    const calls = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    expect(f.beforeSubmit()).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(calls)
    expect(f.facade.getAuthResult).not.toHaveBeenCalled()
  })
  it.each([
    [{ code: '103000', encryptPublicKey: 'key' }, 'TOKEN_MISSING'],
    [{ code: '103000', token: 'token' }, 'KEY_A_MISSING'],
  ])('rejects incomplete provider result %s', async (payload, code) => {
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123X'); f.beforeSubmit(); f.finish(payload)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_SUCCESS')).toBe(false)
    expect(f.messages.find(x => x.type === 'ASSISTANCE_AUTH_ERROR')?.payload).toMatchObject({ code })
  })
  it('RF2 suppresses stale callbacks, input and provider writes after dispose', async () => {
    const f = await authFixture(); f.authReady(); f.dispose()
    const count = f.messages.length; const writes = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    f.api.setIdLast4('123X'); f.showSuccess({ code: '103000' }); f.authReady(); f.finish({ code: '103000', token: 'token', encryptPublicKey: 'key' })
    expect(f.beforeSubmit()).toBe(false)
    expect(f.messages).toHaveLength(count)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(writes)
    expect(pageSignal.aborted).toBe(true)
  })
  it('expires the shared startup deadline waiting for authReady', async () => {
    const f = await authFixture(); f.showSuccess({ code: '103000' })
    await vi.advanceTimersByTimeAsync(15000)
    f.authReady()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toBe(false)
    expect(pageSignal.aborted).toBe(true)
  })
  it('rejects authReady after the absolute deadline even before its timer runs', async () => {
    const f = await authFixture(); f.showSuccess({ code: '103000' })
    vi.setSystemTime(f.config.deadline)
    f.authReady()
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toBe(false)
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
  })
  it('cancels startup deadline at authReady for unbounded reading and input', async () => {
    const f = await authFixture(); f.authReady()
    await vi.advanceTimersByTimeAsync(60000)
    f.api.setIdLast4('123X'); expect(f.beforeSubmit()).toBe(true)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toBe(false)
  })
  it('aborts pending customer startup immediately on parent cancellation', async () => {
    hooks.ready = new Promise(() => {})
    const pending = authFixture()
    await Promise.resolve(); parentController.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(pageSignal.aborted).toBe(true)
    expect(sdk.facade!.showAuthPage).not.toHaveBeenCalled()
  })
  it('waits customer ready before official show and shares remaining deadline', async () => {
    let ready!: () => void; hooks.ready = new Promise(resolve => { ready = resolve })
    const pending = authFixture()
    await vi.advanceTimersByTimeAsync(10000)
    expect(sdk.facade!.showAuthPage).not.toHaveBeenCalled()
    ready(); const f = await pending
    await vi.advanceTimersByTimeAsync(5000)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toBe(true)
  })
  it('recovers invalid customer API inputs after ready without changing good input', async () => {
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123X'); f.api.setIdLast4('!'); f.api.setCallerAgreementChecked(-1, true)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toBe(false)
    expect(states.at(-1)?.idLast4).toBe('123X')
    expect(f.beforeSubmit()).toBe(true)
  })
  it('keeps pre-submit official failure recoverable with one mapped notice', async () => {
    const f = await authFixture(); f.authReady()
    const callback = vi.mocked(f.facade.initControl).mock.calls[0][0].error!
    const failure = { code: '103135' }; callback(failure); callback(failure)
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR_NOTICE')).toHaveLength(1)
    expect(f.messages.find(x => x.type === 'ASSISTANCE_AUTH_ERROR_NOTICE')?.payload).toMatchObject({ code: '103135', message: '请勾选阅读并同意隐私协议后重试。', phase: 'initControl' })
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toBe(false)
    f.api.setIdLast4('123X'); expect(f.beforeSubmit()).toBe(true)
  })
  it('terminates a failed legal handoff once without unlocking busy or late callbacks', async () => {
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123X'); f.beforeSubmit()
    const failure = { code: '105999' }
    const callback = vi.mocked(f.facade.initControl).mock.calls[0][0].error!
    callback(failure); callback(failure); f.finish({ code: '103000', token: 'token', encryptPublicKey: 'key' })
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR_NOTICE')).toHaveLength(1)
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_SUCCESS')).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).not.toHaveBeenCalled()
  })
  it('does not promote a nonofficial success code to valid token completion', async () => {
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123X'); f.beforeSubmit()
    f.finish({ code: '200', token: 'token', encryptPublicKey: 'key' })
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_SUCCESS')).toBe(false)
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
  })
  it('maps explicit provider cancellation to one terminal cancel', async () => {
    const f = await authFixture(); f.authReady()
    vi.mocked(f.facade.initControl).mock.calls[0][0].error?.({ code: '102507', message: 'cancel' })
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_CANCEL')).toHaveLength(1)
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toBe(false)
  })
  it('fails terminally on customer hook TypeError and still cleans page', async () => {
    const f = await authFixture(); f.showSuccess({ code: '103000' })
    hooks.onStateChange = state => { if (state.phase === 'ready') throw new TypeError('hook') }
    // Registered hooks are snapshotted; create another session to test the hook itself.
    f.dispose()
    const bad = await authFixture(); bad.authReady()
    expect(bad.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    expect(pageDispose).toHaveBeenCalled()
  })
  it('cleans API and page independently when customer dispose and facade clear throw', async () => {
    hooks.dispose = () => { throw new Error('customer dispose') }
    const f = await authFixture(); f.authReady()
    vi.mocked(f.facade.clearControl).mockImplementation(() => { throw new Error('provider clear') })
    expect(() => f.dispose()).not.toThrow()
    expect(pageDispose).toHaveBeenCalled()
    expect(pageSignal.aborted).toBe(true)
  })
  it('clears official controls even when page disposal throws', async () => {
    const f = await authFixture(); f.authReady()
    pageDispose.mockImplementation(() => { throw new Error('page dispose') })
    expect(() => f.dispose()).not.toThrow()
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
  })
  it('turns completed customer hook failure into ERROR rather than SUCCESS', async () => {
    hooks.onStateChange = state => { if (state.phase === 'completed') throw new TypeError('completion hook') }
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123X'); f.beforeSubmit()
    f.finish({ code: '103000', token: 'token', encryptPublicKey: 'key' })
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_SUCCESS')).toBe(false)
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    expect(pageDispose).toHaveBeenCalled()
  })
  it('aborts and reports startup input misuse terminally', async () => {
    vi.mocked(loadCustomerPage).mockImplementationOnce(async (_page, ctx) => {
      pageSignal = ctx.signal; ctx.api.setIdLast4('!')
      return { root, styles: { css: '', urls: [], rootAttributes: {} }, dispose: pageDispose }
    })
    await expect(authFixture()).rejects.toMatchObject({ name: 'AbortError' })
    expect(pageSignal.aborted).toBe(true)
    expect(sdk.facade!.showAuthPage).not.toHaveBeenCalled()
    expect(pageDispose).toHaveBeenCalled()
  })
  it('aborts pending customer startup when the official resources fail', async () => {
    hooks.ready = new Promise(() => {})
    vi.mocked(loadMobileAuthSdkResources).mockResolvedValueOnce({ state: 'error', scriptId: 'sdk', styleId: 'css', reason: 'error', error: new Error('CDN blocked') })
    await expect(authFixture()).rejects.toMatchObject({ name: 'AbortError' })
    expect(vi.mocked(window.parent.postMessage).mock.calls.map(call => call[0])).toContainEqual({
      source: 'assistance-mobile-auth', sessionId: 'session-4', type: 'ASSISTANCE_AUTH_ERROR',
      payload: { code: 'CDN_BLOCKED', message: '无法加载 SDK 资源，请检查网络或防火墙设置。' },
    })
    expect(pageSignal.aborted).toBe(true)
    expect(sdk.facade!.showAuthPage).not.toHaveBeenCalled()
  })
  it('observes real phone slot text once and disconnects on dispose', async () => {
    const f = await authFixture(); f.authReady()
    root.querySelector('#ydrzPhoneControl')!.textContent = '本机号码 138****1234'
    await Promise.resolve()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_PHONE_READY').map(x => x.payload)).toEqual([
      { maskedMobile: '138****1234', rawText: '本机号码 138****1234', source: 'ydrzPhoneControl' },
    ])
    f.dispose(); root.querySelector('#ydrzPhoneControl')!.textContent = '139****5678'; await Promise.resolve()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_PHONE_READY')).toHaveLength(1)
  })
  it('stops observing late phone text after the existing phone readiness limit', async () => {
    const f = await authFixture(); f.authReady()
    await vi.advanceTimersByTimeAsync(1500)
    root.querySelector('#ydrzPhoneControl')!.textContent = '138****1234'
    await Promise.resolve()
    expect(f.messages.some(x => x.type === 'ASSISTANCE_AUTH_PHONE_READY')).toBe(false)
  })
  it('notifies only complete/incomplete transitions without sensitive input', async () => {
    const f = await authFixture(); f.authReady()
    for (const value of ['1', '123X', '456X', '12', '1']) f.api.setIdLast4(value)
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_STATE_CHANGE').map(x => x.payload)).toEqual([
      { event: { type: 'idLast4Complete' } }, { event: { type: 'idLast4Incomplete' } },
    ])
  })
  it('RF5 opens actual SDK reader with pure BOOT and preserves parent input and initialization across navigation', async () => {
    const f = await authFixture(); f.authReady(); f.api.setIdLast4('123X')
    const input = document.createElement('input'); input.value = '123X'; root.append(input); input.focus()
    const panel = document.createElement('div'); panel.className = 'ydrz-confirm-iframe'
    const frame = document.createElement('iframe')
    frame.src = vi.mocked(f.facade.initControl).mock.calls[0][0].styleOption.agreeStyle!.agreeArr![0].link!
    panel.append(frame); document.body.append(panel)
    const boot = vi.spyOn(frame.contentWindow!, 'postMessage')
    const send = (type: 'ASSISTANCE_AUTH_READY' | 'ASSISTANCE_AUTH_CLOSE') => window.dispatchEvent(new MessageEvent('message', {
      source: frame.contentWindow, origin: window.location.origin, data: createAssistanceAuthMessage(type, f.config.sessionId) }))
    send('ASSISTANCE_AUTH_READY')
    const readerConfig: CustomAgreementConfig = boot.mock.calls[0][0].payload.config
    expect(readerConfig).not.toHaveProperty('authParams'); expect(readerConfig).not.toHaveProperty('keyA')
    expect(states.at(-1)?.agreementReaderOpen).toBe(true)
    const reader = await start(readerConfig, { runtimeSource: 'runtime', signal: parentController.signal }); handles.push(reader)
    for (let n = 0; n < 2; n++) {
      document.querySelector<HTMLAnchorElement>('a[data-doc-key="personal-info-collection-list"]')!.click()
      expect(document.querySelector('[data-agreement-reader]')?.textContent).toContain('手机号码')
      document.querySelector<HTMLButtonElement>('button[data-reader-back]')!.click()
    }
    send('ASSISTANCE_AUTH_CLOSE'); reader.dispose()
    expect(states.at(-1)).toMatchObject({ idLast4: '123X', agreementReaderOpen: false, phase: 'ready' })
    expect(input.value).toBe('123X'); expect(document.activeElement).toBe(input)
    expect(f.facade.showAuthPage).toHaveBeenCalledTimes(1); expect(f.facade.initControl).toHaveBeenCalledTimes(1)
    expect(f.messages.some(m => m.type === 'ASSISTANCE_AUTH_SUCCESS' || m.type === 'ASSISTANCE_AUTH_ERROR')).toBe(false)
  })
  it('entry starts agreement reading without opening or initializing the official SDK', async () => {
    const f = await authFixture(); const showCount = vi.mocked(f.facade.showAuthPage).mock.calls.length
    handles.push(await start({ mode: 'agreement', sessionId: 's', parentOrigin: 'https://host.example', docKey: 'entry', docs: {}, entries: [], css: '', styleUrls: [], rootAttributes: {} },
      { runtimeSource: 'runtime', signal: parentController.signal }))
    expect(f.facade.showAuthPage).toHaveBeenCalledTimes(showCount); expect(f.facade.initControl).not.toHaveBeenCalled()
  })
})
