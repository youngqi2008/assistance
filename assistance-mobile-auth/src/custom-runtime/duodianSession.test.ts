import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CustomAuthorizationConfig, CustomPageApi, CustomPageHooks, CustomPageState } from '../custom-page/types'
import type { MobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import type { AssistanceAuthMessage } from '../wrapper/verificationBridge'
import { start } from '../customers/duodian-health/runtime'
import { startAuthorization } from './authSession'
import { loadCustomerPage } from './customerPage'
import { loadMobileAuthSdkResources } from '../sdk/resourceLoader'

vi.mock('../sdk/resourceLoader', () => ({ loadMobileAuthSdkResources: vi.fn() }))
vi.mock('./customerPage', () => ({ loadCustomerPage: vi.fn() }))
const sdk = vi.hoisted(() => ({ facade: undefined as MobileAuthSdkFacade | undefined }))
vi.mock('../sdk/mobileAuthFacade', () => ({ createMobileAuthSdkFacade: () => sdk.facade }))

const secret = 'MOCK_ONLY_token_fullID_123456789012345678_signedparams'
let states: CustomPageState[]
let api: CustomPageApi
let signal: AbortSignal
let hooks: CustomPageHooks
let pageDispose: ReturnType<typeof vi.fn>
let parent: AbortController
let root: HTMLElement
const handles: Array<{ dispose(): void }> = []

beforeEach(() => {
  vi.useFakeTimers()
  states = []
  hooks = { onStateChange: state => states.push(state), dispose: vi.fn() }
  parent = new AbortController()
  root = document.createElement('div')
  root.innerHTML = '<div id="ydrzPhoneControl"></div><div id="ydrzSubmitControl"></div>'
  document.body.append(root)
  pageDispose = vi.fn(() => root.remove())
  vi.mocked(loadMobileAuthSdkResources).mockResolvedValue({ state: 'ready', scriptId: 'sdk', styleId: 'css' })
  vi.mocked(loadCustomerPage).mockImplementation(async (_page, ctx) => {
    api = ctx.api; signal = ctx.signal
    ctx.api.register(hooks); await ctx.sealRegistration()
    return { root, styles: { css: '', urls: [], rootAttributes: {} }, dispose: pageDispose }
  })
})

afterEach(() => {
  handles.splice(0).forEach(handle => handle.dispose())
  document.body.replaceChildren()
  vi.restoreAllMocks(); vi.clearAllMocks(); vi.useRealTimers()
})

async function fixture(options: { generic?: boolean; syncSubmitState?: boolean; agreements?: boolean; showThrows?: boolean; providerAbortThrows?: boolean } = {}) {
  const facade: MobileAuthSdkFacade = {
    showAuthPage: vi.fn(), initControl: vi.fn(), clearControl: vi.fn(),
    getAuthResult: vi.fn(), updateSubmitBtnStatus: vi.fn(),
  }
  if (options.showThrows) vi.mocked(facade.showAuthPage).mockImplementation(() => { throw new Error(secret) })
  if (options.providerAbortThrows) vi.mocked(facade.showAuthPage).mockImplementation(() => { throw new DOMException(secret, 'AbortError') })
  sdk.facade = facade
  const messages: AssistanceAuthMessage[] = []
  vi.spyOn(window.parent, 'postMessage').mockImplementation(message => messages.push(message))
  const config: CustomAuthorizationConfig = {
    mode: 'authorization', sessionId: 'duodian-session', parentOrigin: 'https://host.example', appId: 'customer-app',
    page: { kind: 'html', html: '<div></div>' }, request: { scene: 'native-number', requestId: 'request-4' },
    authParams: { version: '3.0', appId: 'supplied-app', sign: 'MOCK_ONLY_sign', traceId: 'trace', timestamp: '20261011000000000', authType: '0', scope: '3ElementsAuthAssistFill' },
    agreements: options.agreements ? [{ name: '客户协议', link: 'https://customer.example/agreement' }] : [],
    styleOption: { submitBtnStyle: { name: '授权登录', bgColor: '#00cc00' } },
    iframeOptions: { closable: false, useCustomKeyboard: true, heightMode: 'auto' },
    trustedBusinessBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro-temp/', deadline: Date.now() + 15000,
    beforeLoginNotificationEnabled: true, stateChangeEnabled: true,
  }
  const context = { runtimeSource: 'runtime', signal: parent.signal }
  const pending = options.generic ? startAuthorization(config, context, options) : start(config, context)
  const show = () => vi.mocked(facade.showAuthPage).mock.calls[0][0]
  const init = (index = vi.mocked(facade.initControl).mock.calls.length - 1) => vi.mocked(facade.initControl).mock.calls[index][0]
  if (options.showThrows || options.providerAbortThrows) return { facade, messages, config, pending, show, init }
  handles.push(await pending)
  return { facade, messages, config, pending, show, init }
}

async function readyFixture(options: { generic?: boolean; agreements?: boolean } = {}) {
  const f = await fixture(options)
  f.show().success?.({ code: '103000' }); f.init().authReady?.({ code: '103000' })
  return f
}

const terminalMessages = (messages: AssistanceAuthMessage[]) => messages.filter(message =>
  ['ASSISTANCE_AUTH_ERROR', 'ASSISTANCE_AUTH_CANCEL', 'ASSISTANCE_AUTH_SUCCESS'].includes(message.type))

describe('Duodian official authorization recovery', () => {
  it('waits for the ordered official show, init and authReady before presentation', async () => {
    const f = await fixture()
    expect(f.facade.initControl).not.toHaveBeenCalled()
    f.show().success?.({ code: '103000' })
    expect(states.at(-1)?.phase).toBe('initializing')
    expect(f.messages.some(message => message.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toBe(false)
    f.init().authReady?.({ code: '103000' })
    expect(states.at(-1)?.phase).toBe('ready')
    expect(f.messages.filter(message => message.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toHaveLength(1)
  })

  it('rejects repeated local incomplete and unchecked submissions without entering authorization', async () => {
    const f = await readyFixture({ agreements: true })
    api.setIdLast4('123')
    for (let n = 0; n < 3; n++) expect(f.init().beforeSubmit?.()).toBe(false)
    expect(states.at(-1)).toMatchObject({ phase: 'ready', inputError: '请输入身份证后四位' })
    api.setIdLast4('123x')
    for (let n = 0; n < 3; n++) expect(f.init().beforeSubmit?.()).toBe(false)
    expect(states.at(-1)).toMatchObject({ phase: 'ready', idLast4: '123X' })
    expect(terminalMessages(f.messages)).toHaveLength(0)
    expect(f.facade.getAuthResult).not.toHaveBeenCalled()
    expect(f.init().styleOption.submitBtnStyle?.name).toBe('授权登录')
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: true, loading: false })
    api.setCallerAgreementChecked(0, true)
    expect(f.init().beforeSubmit?.()).toBe(true)
    const writes = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    expect(f.init().beforeSubmit?.()).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(writes)
  })

  it.each([
    ['105999', '系统繁忙，请稍后再试。'], ['103135', '请勾选阅读并同意隐私协议后重试。'],
  ])('reinitializes only recoverable submitted %s and preserves input and caller checks', async (code, message) => {
    const f = await readyFixture({ agreements: true })
    api.setIdLast4('123x'); api.setCallerAgreementChecked(0, true)
    const old = f.init()
    expect(old.beforeSubmit?.()).toBe(true)
    api.setIdLast4('9999'); api.setCallerAgreementChecked(0, false)
    old.error?.({ code, desc: secret })
    expect(terminalMessages(f.messages)).toHaveLength(0)
    expect(states.at(-1)).toMatchObject({ phase: 'initializing', idLast4: '123X', message })
    expect(f.facade.initControl).toHaveBeenCalledTimes(2)
    expect(f.init().styleOption).toEqual(old.styleOption)
    expect(f.facade.clearControl).not.toHaveBeenCalled()
    expect(f.init().beforeSubmit?.()).toBe(false)
    const count = f.messages.length
    old.authReady?.({ code: '103000' }); old.error?.({ code: 'fatal' }); old.success?.({ code: '103000', token: 'old', encryptPublicKey: 'old' })
    expect(f.messages).toHaveLength(count)
    expect(states.at(-1)?.phase).toBe('initializing')
    f.init().authReady?.({ code: '103000' })
    expect(states.at(-1)).toMatchObject({ phase: 'ready', idLast4: '123X', message })
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
    expect(f.init().beforeSubmit?.()).toBe(true)
    const submittedCount = f.messages.length
    old.success?.({ code: '103000', token: 'old', encryptPublicKey: 'old' }); old.error?.({ code: 'fatal' })
    expect(old.beforeSubmit?.()).toBe(false)
    expect(f.messages).toHaveLength(submittedCount)
    expect(states.at(-1)?.phase).toBe('submitting')
    f.init().success?.({ code: '103000', token: 'provider-token', encryptPublicKey: 'provider-key' })
    expect(terminalMessages(f.messages)).toEqual([expect.objectContaining({ type: 'ASSISTANCE_AUTH_SUCCESS',
      payload: { status: 'success', token: 'provider-token', idLast4: '123X', keyA: 'provider-key', requestId: 'request-4', message: '验证完成' } })])
    expect(JSON.stringify(f.messages.filter(message => message.type === 'ASSISTANCE_AUTH_ERROR_NOTICE'))).not.toContain(secret)
    expect(signal.aborted).toBe(true)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
  })

  it.each(['105999', '103135', 'UNKNOWN_PROVIDER_ERROR', 'NETWORK_TIMEOUT'])('terminates pre-submit %s instead of enabling recovery', async code => {
    const f = await readyFixture()
    f.init().error?.({ code, desc: secret })
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(f.facade.initControl).toHaveBeenCalledTimes(1)
    expect(signal.aborted).toBe(true)
    expect(JSON.stringify([f.messages, states])).not.toContain(secret)
  })

  it.each(['UNKNOWN_PROVIDER_ERROR', 'NETWORK_TIMEOUT'])('terminates submitted fatal %s with safe UI and no late result', async code => {
    const f = await readyFixture(); api.setIdLast4('123X'); f.init().beforeSubmit?.()
    f.init().error?.({ code, desc: secret })
    const count = f.messages.length
    f.init().success?.({ code: '103000', token: 'late', encryptPublicKey: 'late' }); f.init().authReady?.({ code: '103000' })
    expect(f.messages).toHaveLength(count)
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(JSON.stringify([f.messages, states])).not.toContain(secret)
    expect(signal.aborted).toBe(true)
  })

  it('keeps the generic submitted 105999 terminal policy', async () => {
    const f = await readyFixture({ generic: true }); api.setIdLast4('123X'); f.init().beforeSubmit?.()
    f.init().error?.({ code: '105999' })
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(f.facade.initControl).toHaveBeenCalledTimes(1)
  })

  it('keeps the generic startup timeout message and ignores premature submissions at its deadline', async () => {
    const f = await fixture({ generic: true }); f.show().success?.({ code: '103000' })
    vi.setSystemTime(f.config.deadline)
    expect(f.init().beforeSubmit?.()).toBe(false)
    expect(terminalMessages(f.messages)).toHaveLength(0)
    f.init().authReady?.({ code: '103000' })
    expect(terminalMessages(f.messages)).toEqual([expect.objectContaining({ type: 'ASSISTANCE_AUTH_ERROR',
      payload: { code: 'NETWORK_TIMEOUT', message: 'Customer page startup deadline exceeded' } })])
  })

  it.each([
    [{ code: '103000', encryptPublicKey: 'key' }, 'TOKEN_MISSING'],
    [{ code: '103000', token: 'token' }, 'KEY_A_MISSING'],
  ])('rejects incomplete successful provider payload without recovery: %s', async (payload, code) => {
    const f = await readyFixture(); api.setIdLast4('123X'); f.init().beforeSubmit?.(); f.init().success?.(payload)
    expect(terminalMessages(f.messages)).toEqual([expect.objectContaining({ type: 'ASSISTANCE_AUTH_ERROR', payload: expect.objectContaining({ code }) })])
    expect(f.facade.initControl).toHaveBeenCalledTimes(1)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
  })

  it('bounds reinitialization at 15 seconds after the original startup deadline', async () => {
    const f = await readyFixture(); await vi.advanceTimersByTimeAsync(60000)
    api.setIdLast4('123X'); f.init().beforeSubmit?.(); f.init().error?.({ code: '105999' })
    await vi.advanceTimersByTimeAsync(14999)
    expect(terminalMessages(f.messages)).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(1)
    expect(terminalMessages(f.messages)).toEqual([expect.objectContaining({ type: 'ASSISTANCE_AUTH_ERROR', payload: expect.objectContaining({ code: 'NETWORK_TIMEOUT' }) })])
    f.init().authReady?.({ code: '103000' })
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(signal.aborted).toBe(true)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rejects recovery authReady at its absolute deadline before the timer fires', async () => {
    const f = await readyFixture(); api.setIdLast4('123X'); f.init().beforeSubmit?.(); f.init().error?.({ code: '103135' })
    vi.setSystemTime(Date.now() + 15000); f.init().authReady?.({ code: '103000' })
    expect(terminalMessages(f.messages)).toEqual([expect.objectContaining({ type: 'ASSISTANCE_AUTH_ERROR', payload: expect.objectContaining({ code: 'NETWORK_TIMEOUT' }) })])
  })

  it.each(['abort', 'cancel'])('cleans recovery on %s once and ignores every old or current callback', async exit => {
    const f = await readyFixture(); api.setIdLast4('123X'); f.init().beforeSubmit?.(); f.init().error?.({ code: '105999' })
    if (exit === 'abort') parent.abort(); else api.close()
    const count = f.messages.length
    for (const [request] of vi.mocked(f.facade.initControl).mock.calls) {
      request.authReady?.({ code: '103000' }); request.error?.({ code: '105999' })
      request.success?.({ code: '103000', token: 'late', encryptPublicKey: 'late' })
      expect(request.beforeSubmit?.()).toBe(false)
    }
    root.querySelector('#ydrzPhoneControl')!.textContent = '138****1234'
    await vi.advanceTimersByTimeAsync(20000)
    expect(f.messages).toHaveLength(count)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
    expect(pageDispose).toHaveBeenCalledTimes(1); expect(hooks.dispose).toHaveBeenCalledTimes(1)
    expect(signal.aborted).toBe(true); expect(vi.getTimerCount()).toBe(0)
  })

  it('never presents the first timed-out initialization and clears controls once', async () => {
    const f = await fixture(); await vi.advanceTimersByTimeAsync(15000)
    expect(f.messages.some(message => message.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toBe(false)
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
    expect(signal.aborted).toBe(true)
  })

  it('maps provider cancel description without echoing sensitive text', async () => {
    const f = await readyFixture(); f.init().error?.({ code: '102507', desc: secret })
    expect(terminalMessages(f.messages)).toEqual([expect.objectContaining({ type: 'ASSISTANCE_AUTH_CANCEL' })])
    expect(JSON.stringify([f.messages, states])).not.toContain(secret)
  })

  it('maps synchronous show exceptions in both public result and rejected promise', async () => {
    const f = await fixture({ showThrows: true })
    await expect(f.pending).rejects.not.toThrow(secret)
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(JSON.stringify([f.messages, states])).not.toContain(secret)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
  })

  it('preserves AbortError identity while removing provider text from rejected promises', async () => {
    const f = await fixture({ providerAbortThrows: true })
    await expect(f.pending).rejects.toMatchObject({ name: 'AbortError' })
    await expect(f.pending).rejects.not.toThrow(secret)
    expect(JSON.stringify([f.messages, states])).not.toContain(secret)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
  })

  it('maps synchronous init exceptions without leaking error UI', async () => {
    const f = await fixture()
    vi.mocked(f.facade.initControl).mockImplementation(() => { throw new Error(secret) })
    f.show().success?.({ code: '103000' })
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(JSON.stringify([f.messages, states])).not.toContain(secret)
    expect(signal.aborted).toBe(true)
  })

  it('maps throwing completed hooks into one safe terminal error while cleaning all owners', async () => {
    hooks.onStateChange = state => { states.push(state); if (state.phase === 'completed') throw new Error(secret) }
    const f = await readyFixture(); api.setIdLast4('123X'); f.init().beforeSubmit?.()
    f.init().success?.({ code: '103000', token: 'provider-token', encryptPublicKey: 'provider-key' })
    expect(terminalMessages(f.messages)).toEqual([expect.objectContaining({ type: 'ASSISTANCE_AUTH_ERROR', payload: expect.objectContaining({ code: 'CUSTOM_PAGE_FAILED' }) })])
    expect(JSON.stringify([f.messages, states])).not.toContain(secret)
    expect(pageDispose).toHaveBeenCalledTimes(1); expect(hooks.dispose).toHaveBeenCalledTimes(1)
    expect(signal.aborted).toBe(true); expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
  })

  it('keeps successive retries isolated until only the final attempt completes', async () => {
    const f = await readyFixture(); api.setIdLast4('123X')
    for (const code of ['105999', '103135']) {
      expect(f.init().beforeSubmit?.()).toBe(true)
      f.init().error?.({ code })
      f.init().authReady?.({ code: '103000' })
    }
    expect(f.facade.initControl).toHaveBeenCalledTimes(3)
    expect(f.init().beforeSubmit?.()).toBe(true)
    for (const [request] of vi.mocked(f.facade.initControl).mock.calls.slice(0, 2)) {
      request.error?.({ code: '105999' }); request.success?.({ code: '103000', token: 'old', encryptPublicKey: 'old' })
    }
    expect(terminalMessages(f.messages)).toHaveLength(0)
    f.init().success?.({ code: '103000', token: 'provider-token', encryptPublicKey: 'provider-key' })
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0)
  })

  it('starts customer agreement mode without touching official authorization', async () => {
    const f = await fixture()
    handles.push(await start({ mode: 'agreement', sessionId: 'agreement', parentOrigin: 'https://host.example',
      docKey: 'entry', docs: {}, entries: [], css: '', styleUrls: [], rootAttributes: {} },
    { runtimeSource: 'runtime', signal: parent.signal }))
    expect(f.facade.showAuthPage).toHaveBeenCalledTimes(1)
    expect(f.facade.initControl).not.toHaveBeenCalled()
    expect(document.querySelector('[data-agreement-reader]')).not.toBeNull()
  })
})

describe('Duodian submit state synchronization', () => {
  it('starts disabled, enables normalized valid input, and disables deletion and unchecked consent', async () => {
    const f = await readyFixture({ agreements: true })
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: true, loading: false })
    api.setIdLast4('0000')
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: true, loading: false })
    api.setCallerAgreementChecked(0, true)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
    api.setCallerAgreementChecked(0, false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: true, loading: false })
    api.setCallerAgreementChecked(0, true)
    for (const value of ['123x', 'X000', '0000']) {
      api.setIdLast4(value)
      expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
    }
    api.setIdLast4('000')
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: true, loading: false })
    const writes = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    api.setIdLast4('!')
    expect(states.at(-1)?.idLast4).toBe('000')
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(writes)
  })

  it.each([false, true])('keeps early input and consent disabled until first ready (agreements=%s)', async agreements => {
    const f = await fixture({ agreements })
    api.setIdLast4('0000')
    if (agreements) api.setCallerAgreementChecked(0, true)
    expect(f.facade.updateSubmitBtnStatus).not.toHaveBeenCalled()
    f.show().success?.({ code: '103000' })
    api.setIdLast4('123x')
    expect(f.facade.updateSubmitBtnStatus).not.toHaveBeenCalled()
    f.init().authReady?.({ code: '103000' })
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
  })

  it.each(['105999', '103135'])('does not reset official busy/loading or use old ready during %s recovery', async code => {
    const f = await readyFixture({ agreements: true })
    api.setIdLast4('0000'); api.setCallerAgreementChecked(0, true)
    const old = f.init()
    expect(old.beforeSubmit?.()).toBe(true)
    const writes = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    api.setIdLast4('9999'); api.setCallerAgreementChecked(0, false); old.authReady?.({ code: '103000' })
    expect(old.beforeSubmit?.()).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(writes)
    old.error?.({ code })
    api.setIdLast4('12'); api.setCallerAgreementChecked(0, false)
    old.authReady?.({ code: '103000' })
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(writes)
    f.init().authReady?.({ code: '103000' })
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: true, loading: false })
    api.setIdLast4('123x'); api.setCallerAgreementChecked(0, true)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
    expect(f.init().beforeSubmit?.()).toBe(true)
    expect(f.init().beforeSubmit?.()).toBe(false)
  })

  it.each(['ready', 'input', 'consent', 'rejection', 'recovery'])('terminates once when setter throws during %s', async transition => {
    const f = await fixture({ agreements: true })
    f.show().success?.({ code: '103000' })
    if (transition !== 'ready') f.init().authReady?.({ code: '103000' })
    if (transition === 'recovery') {
      api.setIdLast4('0000'); api.setCallerAgreementChecked(0, true)
      f.init().beforeSubmit?.(); f.init().error?.({ code: '105999' })
    }
    vi.mocked(f.facade.updateSubmitBtnStatus).mockImplementation(() => { throw new Error(secret) })
    if (transition === 'ready' || transition === 'recovery') f.init().authReady?.({ code: '103000' })
    else if (transition === 'input') api.setIdLast4('0000')
    else if (transition === 'consent') api.setCallerAgreementChecked(0, true)
    else expect(f.init().beforeSubmit?.()).toBe(false)
    expect(terminalMessages(f.messages)).toHaveLength(1)
    expect(signal.aborted).toBe(true)
    expect(f.facade.clearControl).toHaveBeenCalledTimes(1)
    expect(JSON.stringify([states, f.messages])).not.toContain(secret)
    const writes = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    api.setIdLast4('123x'); api.setCallerAgreementChecked(0, true)
    f.init().authReady?.({ code: '103000' }); f.init().success?.({ code: '103000', token: 'late', encryptPublicKey: 'late' })
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(writes)
    expect(terminalMessages(f.messages)).toHaveLength(1)
    if (transition === 'ready') expect(f.messages.some(m => m.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toBe(false)
  })

  it.each(['abort', 'close', 'dispose', 'terminal'])('does not enable after %s or late callbacks', async exit => {
    const f = await readyFixture({ agreements: true })
    if (exit === 'abort') parent.abort()
    else if (exit === 'close') api.close()
    else if (exit === 'dispose') handles.at(-1)!.dispose()
    else f.init().error?.({ code: 'NETWORK_TIMEOUT' })
    const writes = vi.mocked(f.facade.updateSubmitBtnStatus).mock.calls.length
    api.setIdLast4('0000'); api.setCallerAgreementChecked(0, true); f.init().authReady?.({ code: '103000' })
    expect(f.init().beforeSubmit?.()).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenCalledTimes(writes)
  })

  it('does not synchronize after a ready hook closes the session', async () => {
    hooks.onStateChange = state => { if (state.phase === 'ready') api.close() }
    const f = await readyFixture()
    expect(f.facade.updateSubmitBtnStatus).not.toHaveBeenCalled()
    expect(f.messages.some(m => m.type === 'ASSISTANCE_AUTH_PRESENTATION_READY')).toBe(false)
  })

  it.each([undefined, false])('retains legacy ready/input/consent and rejection with option %s', async syncSubmitState => {
    const f = await fixture({ generic: true, syncSubmitState, agreements: true })
    f.show().success?.({ code: '103000' }); f.init().authReady?.({ code: '103000' })
    api.setIdLast4('0000'); api.setCallerAgreementChecked(0, true)
    expect(f.facade.updateSubmitBtnStatus).not.toHaveBeenCalled()
    api.setCallerAgreementChecked(0, false)
    expect(f.init().beforeSubmit?.()).toBe(false)
    expect(f.facade.updateSubmitBtnStatus).toHaveBeenLastCalledWith({ disabled: false, loading: false })
  })
})
