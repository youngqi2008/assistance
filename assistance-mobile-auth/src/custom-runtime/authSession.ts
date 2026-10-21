import type { CustomAuthorizationConfig, CustomPageState, CustomRuntimeContext, CustomRuntimeHandle } from '../custom-page/types'
import { createAuthParamsProvider } from '../sdk/authParamsProvider'
import { mapSdkOutcomeToScenarioState } from '../sdk/authFlow'
import { getMobileAuthSdkConfig } from '../sdk/config'
import { ensureGlobalCryptoJs } from '../sdk/cryptoJsBootstrap'
import { createMobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import { loadMobileAuthSdkResources } from '../sdk/resourceLoader'
import { extractSdkErrorPayload, lookupSdkError } from '../sdk/sdkErrorMessages'
import { sdkControlSlotMap } from '../sdk/slots'
import type { MobileAuthSdkCallbackPayload } from '../sdk/types'
import { createAssistanceAuthMessage, type AssistanceAuthMessageType } from '../wrapper/verificationBridge'
import { createCustomerApi } from './customerApi'
import { loadCustomerPage } from './customerPage'
import { withinCustomerDeadline } from './resources'
import { createCustomStyleOption } from './styleOption'
import { createCustomAgreementController } from './agreements'

export async function startAuthorization(config: CustomAuthorizationConfig, context: CustomRuntimeContext,
  options: { recoverableSubmitErrors?: boolean; safeErrorNotices?: boolean; syncSubmitState?: boolean } = {}): Promise<CustomRuntimeHandle> {
  const controller = new AbortController()
  const facade = createMobileAuthSdkFacade()
  let page: Awaited<ReturnType<typeof loadCustomerPage>> | undefined
  let agreements: ReturnType<typeof createCustomAgreementController> | undefined
  let disposed = false
  let terminal = false
  let terminalHookError: Error | undefined
  let ready = false
  let initialized = false
  let shown = false
  let busy = false
  let submittedId = ''
  let phonePosted = false
  let phoneWatching = false
  let observer: MutationObserver | undefined
  let resizeObserver: ResizeObserver | undefined
  let phonePoll: ReturnType<typeof setInterval> | undefined
  let phoneTimeout: ReturnType<typeof setTimeout> | undefined
  let toastTimer: ReturnType<typeof setTimeout> | undefined
  let startupTimer: ReturnType<typeof setTimeout> | undefined
  let recoveryTimer: ReturnType<typeof setTimeout> | undefined
  let initAttempt = 0
  let currentControlReady = false
  let lastHeight = 0
  const noticedEvents = new WeakSet<object>()
  const callerChecks = config.agreements.map(() => false)
  const state: CustomPageState = { phase: 'initializing', idLast4: '', inputError: null, message: null, agreementReaderOpen: false }
  const active = () => !disposed && !terminal && !controller.signal.aborted
  const post = (type: AssistanceAuthMessageType, payload?: unknown) => {
    if (!disposed && !context.signal.aborted) window.parent.postMessage(createAssistanceAuthMessage(type, config.sessionId, payload), config.parentOrigin)
  }
  const publish = () => { if (active()) customer.publish(state) }
  const stopPhone = () => { phoneWatching = false; clearInterval(phonePoll); clearTimeout(phoneTimeout); phonePoll = undefined; phoneTimeout = undefined }
  function dispose(): void {
    if (disposed) return
    disposed = true
    clearTimeout(startupTimer); clearTimeout(recoveryTimer); clearTimeout(toastTimer); stopPhone()
    observer?.disconnect(); resizeObserver?.disconnect()
    try { agreements?.dispose() } catch { /* continue every session owner's cleanup */ }
    context.signal.removeEventListener('abort', dispose)
    // Each owner is cleaned even when another cleanup throws.
    try { controller.abort() } catch { /* continue each owner's cleanup */ }
    try { customer.dispose() } catch { /* continue page cleanup */ }
    try { page?.dispose() } catch { /* continue provider cleanup */ }
    if (initialized || options.recoverableSubmitErrors) { try { facade.clearControl() } catch { /* already detached */ } }
  }
  function finish(type: 'ASSISTANCE_AUTH_ERROR' | 'ASSISTANCE_AUTH_CANCEL' | 'ASSISTANCE_AUTH_SUCCESS', payload: unknown): void {
    if (!active()) return
    terminal = true
    state.phase = type === 'ASSISTANCE_AUTH_SUCCESS' ? 'completed' : 'error'
    // Terminal is latched before hooks, so throwing terminal hooks cannot emit twice.
    try {
      customer.publish(state)
      if (terminalHookError) {
        state.phase = 'error'
        post('ASSISTANCE_AUTH_ERROR', { code: 'CUSTOM_PAGE_FAILED', message: options.safeErrorNotices ? safeMessage('CUSTOM_PAGE_FAILED') : terminalHookError.message })
      }
      else post(type, payload)
    } finally { dispose() }
  }
  const safeMessage = (code: string) => {
    const mapped = lookupSdkError(code)
    return mapped.errorKind === 'unknown' ? '验证失败，请稍后重试。' : mapped.uiText
  }
  const fail = (message: string, code = 'CUSTOM_PAGE_FAILED', phase?: 'showAuthPage' | 'initControl') => {
    if (options.safeErrorNotices) { message = safeMessage(code); state.message = message }
    finish('ASSISTANCE_AUTH_ERROR', { code, message, ...(phase ? { phase } : {}) })
  }
  // Custom inputs do not feed the official submit control's own input listener.
  // Never reset provider loading while its beforeSubmit handoff is in flight.
  const syncSubmitState = (attempt = initAttempt) => {
    if (!options.syncSubmitState || !active() || attempt !== initAttempt || !currentControlReady || busy) return
    const enabled = state.phase === 'ready' && /^[0-9X]{4}$/.test(state.idLast4) && callerChecks.every(Boolean)
    try { facade.updateSubmitBtnStatus({ disabled: !enabled, loading: false }) }
    catch (error) { fail(error instanceof Error ? error.message : String(error)) }
  }
  const startupActive = () => {
    if (!active()) return false
    if (!ready && Date.now() >= config.deadline) { fail('Customer page startup deadline exceeded', 'NETWORK_TIMEOUT'); return false }
    return true
  }
  const transientMessage = (message: string) => {
    clearTimeout(toastTimer)
    state.message = message; publish()
    if (active()) toastTimer = setTimeout(() => { state.message = null; publish() }, 1400)
  }
  const customer = createCustomerApi({
    callerAgreementCount: config.agreements.length,
    onIdLast4(value) {
      if (!active() || busy) return
      const wasComplete = state.idLast4.length === 4
      state.idLast4 = value
      const complete = value.length === 4
      if (complete) state.inputError = null
      publish()
      syncSubmitState()
      if (active() && ready && complete !== wasComplete &&
        (config.stateChangeEnabled || (complete && config.beforeLoginNotificationEnabled))) {
        post('ASSISTANCE_AUTH_STATE_CHANGE', { event: { type: complete ? 'idLast4Complete' : 'idLast4Incomplete' } })
      }
    },
    onCallerAgreement(index, checked) {
      if (!active() || busy) return
      callerChecks[index] = checked
      syncSubmitState()
    },
    onClose() { finish('ASSISTANCE_AUTH_CANCEL', { message: '用户取消验证' }) },
    onError(error, origin) {
      if (terminal && !disposed && origin === 'hook') { terminalHookError = error; return }
      if (!active()) return
      if (!ready || origin === 'hook') fail(error.message)
      else if (!busy) transientMessage(options.safeErrorNotices ? '请检查输入和协议后重试。' : error.message)
    },
  })
  context.signal.addEventListener('abort', dispose, { once: true })
  if (context.signal.aborted) controller.abort()
  const waitContext = { signal: controller.signal, deadline: config.deadline }
  const onNotice = (message: string) => { if (active()) post('ASSISTANCE_AUTH_ERROR_NOTICE', {
    message: options.safeErrorNotices ? lookupSdkError('CDN_BLOCKED').uiText : message, phase: 'resourceLoad',
  }) }
  function sdkFailure(payload: MobileAuthSdkCallbackPayload, phase: 'showAuthPage' | 'initControl'): void {
    if (!active()) return
    const raw = extractSdkErrorPayload(payload)
    const mapped = lookupSdkError(raw.code)
    const message = options.safeErrorNotices ? safeMessage(raw.code) : mapped.uiText
    if (mapSdkOutcomeToScenarioState(payload) === 'cancel') {
      finish('ASSISTANCE_AUTH_CANCEL', { code: raw.code || undefined,
        message: options.safeErrorNotices ? '用户取消验证' : raw.desc || mapped.uiText }); return
    }
    if (!ready) { fail(message, raw.code || 'PROVIDER_VERIFY_FAILED', options.safeErrorNotices ? phase : undefined); return }
    if (!noticedEvents.has(payload)) {
      noticedEvents.add(payload)
      post('ASSISTANCE_AUTH_ERROR_NOTICE', {
        code: raw.code || undefined, message: options.safeErrorNotices ? message : raw.code === 'ALL_CARRIERS_FAILED' ? mapped.uiText : raw.desc.trim() || mapped.uiText,
        phase, ...(!options.safeErrorNotices && raw.carrier !== 'unknown' ? { carrier: raw.carrier } : {}),
      })
    }
    if (options.recoverableSubmitErrors) {
      if (phase === 'initControl' && busy && submittedId.length === 4 && (raw.code === '105999' || raw.code === '103135')) {
        busy = false; submittedId = ''; state.phase = 'initializing'; state.message = message
        clearTimeout(toastTimer)
        initializeControls(true)
      } else fail(message, raw.code || 'PROVIDER_VERIFY_FAILED', options.safeErrorNotices ? phase : undefined)
      return
    }
    if (busy) { fail(mapped.uiText, raw.code || 'PROVIDER_VERIFY_FAILED'); return }
    state.phase = 'error'; state.message = mapped.uiText; publish()
  }
  function initializeControls(recovering = false): void {
    const attempt = ++initAttempt
    currentControlReady = false
    const deadline = recovering ? Date.now() + 15000 : config.deadline
    let controlReady = false
    const current = () => {
      if (!active() || attempt !== initAttempt) return false
      if (recovering && !controlReady && Date.now() >= deadline) { fail(lookupSdkError('NETWORK_TIMEOUT').uiText, 'NETWORK_TIMEOUT'); return false }
      return true
    }
    if (recovering) {
      clearTimeout(recoveryTimer)
      recoveryTimer = setTimeout(() => { if (current()) fail(lookupSdkError('NETWORK_TIMEOUT').uiText, 'NETWORK_TIMEOUT') }, 15000)
      publish()
      if (!active()) return
    }
    try {
      initialized = true
      facade.initControl({
        styleOption: createCustomStyleOption({ customer: config.styleOption,
          agreeArr: agreements!.agreeArr, childArr: agreements!.childArr,
        }),
        beforeSubmit() {
          if (!current() || !controlReady || busy) return false
          if (state.idLast4.length !== 4 || callerChecks.some(checked => !checked)) {
            if (state.idLast4.length !== 4) { state.inputError = '请输入身份证后四位'; publish() }
            else transientMessage('请先同意全部协议')
            if (options.syncSubmitState) syncSubmitState(attempt)
            else if (active()) { try { facade.updateSubmitBtnStatus({ disabled: false, loading: false }) } catch { /* false contract still applies */ } }
            return false
          }
          busy = true; submittedId = state.idLast4; state.phase = 'submitting'; state.message = '验证中'; publish()
          return active()
        },
        authReady() {
          if (!current() || controlReady || (!recovering && !startupActive())) return
          controlReady = true; currentControlReady = true; ready = true; clearTimeout(startupTimer); clearTimeout(recoveryTimer)
          state.phase = 'ready'; if (!recovering) state.message = null
          publish()
          if (!active()) return
          if (options.syncSubmitState) {
            syncSubmitState(attempt)
            if (!current()) return
          } else if (recovering) {
            try { facade.updateSubmitBtnStatus({ disabled: false, loading: false }) }
            catch (error) { fail(error instanceof Error ? error.message : String(error)); return }
          }
          if (!recovering) { post('ASSISTANCE_AUTH_PRESENTATION_READY'); observePage() }
        },
        success(result) {
          if (!current()) return
          if (String(result.code ?? '') !== '103000') { sdkFailure(result, 'initControl'); return }
          if (!busy || submittedId.length !== 4) { fail('验证结果返回异常，请稍后重试。', 'INVALID_SUCCESS_PAYLOAD'); return }
          const token = typeof result.token === 'string' ? result.token.trim() : ''
          const keyA = typeof result.encryptPublicKey === 'string' ? result.encryptPublicKey.trim() : ''
          if (!token) { fail('本次授权未返回有效 token，请重新授权后再试。', 'TOKEN_MISSING'); return }
          if (!keyA) { fail('本次授权未返回 keyA，请重新授权后再试。', 'KEY_A_MISSING'); return }
          finish('ASSISTANCE_AUTH_SUCCESS', { status: 'success', token, idLast4: submittedId, keyA, requestId: config.request.requestId || undefined, message: '验证完成' })
        },
        error: payload => { if (current()) sdkFailure(payload, 'initControl') },
      })
    } catch (error) { fail(error instanceof Error ? error.message : String(error)) }
  }
  function observePage(): void {
    if (!page) return
    const inspect = () => {
      if (!active()) return
      if (phoneWatching && !phonePosted) {
        const rawText = (page!.root.querySelector(`#${sdkControlSlotMap.phone}`)?.textContent ?? '').replace(/\s+/g, ' ').trim()
        const maskedMobile = rawText.match(/1\d{2}\*{4}\d{4}/)?.[0]
        if (maskedMobile) { phonePosted = true; stopPhone(); post('ASSISTANCE_AUTH_PHONE_READY', { maskedMobile, rawText, source: 'ydrzPhoneControl' }) }
      }
      if (config.iframeOptions.heightMode === 'auto') {
        const root = page!.root
        const height = Math.ceil(Math.max(root.getBoundingClientRect().height, root.scrollHeight, root.offsetHeight))
        if (Number.isFinite(height) && height > 0 && height !== lastHeight) { lastHeight = height; post('ASSISTANCE_AUTH_RESIZE', { height }) }
      }
    }
    observer = new MutationObserver(inspect)
    observer.observe(page.root, { childList: true, subtree: true, characterData: true })
    if (typeof ResizeObserver !== 'undefined') { resizeObserver = new ResizeObserver(inspect); resizeObserver.observe(page.root) }
    phoneWatching = true
    phonePoll = setInterval(inspect, 50)
    phoneTimeout = setTimeout(stopPhone, 1500)
    inspect()
  }
  startupTimer = setTimeout(() => fail('Customer page startup deadline exceeded', 'NETWORK_TIMEOUT'), Math.max(0, config.deadline - Date.now()))
  try {
    ensureGlobalCryptoJs()
    const sdkConfig = { ...getMobileAuthSdkConfig(), enabled: true, mode: 'live' as const }
    sdkConfig.cssUrl = new URL('assistance-mobile-auth/vendor/new-control-style.css', window.location.href).href
    const resolution = createAuthParamsProvider({ config: sdkConfig }).resolve({ overrides: config.authParams ?? { appId: config.appId } })
    if (resolution.status !== 'ready' || !resolution.data) throw new Error('Mobile authorization parameters are invalid or incomplete')
    const customerReady = loadCustomerPage(config.page, {
      document, ...waitContext, api: customer.api, sealRegistration: customer.sealRegistration, onNotice,
    }).then(loaded => {
      page = loaded
      if (!active()) { loaded.dispose(); throw new DOMException('Customer page aborted', 'AbortError') }
      publish()
      if (!active()) throw new DOMException('Customer page aborted', 'AbortError')
      return loaded
    })
    const officialReady = loadMobileAuthSdkResources(sdkConfig).then(resources => {
      if (resources.state !== 'ready') {
        const code = resources.reason === 'network-timeout' ? 'NETWORK_TIMEOUT' : resources.reason === 'spa-html-fallback' ? 'SPA_HTML_FALLBACK' : resources.state === 'disabled' ? 'SDK_DISABLED' : 'CDN_BLOCKED'
        fail(lookupSdkError(code).uiText, code)
        throw resources.error ?? new Error(lookupSdkError(code).uiText)
      }
    })
    const preparations = Promise.all([customerReady, officialReady])
    // Synchronous customer misuse can abort before the deadline wrapper attaches.
    void preparations.catch(() => {})
    await withinCustomerDeadline(preparations, waitContext)
    if (!active()) throw new DOMException('Customer page aborted', 'AbortError')
    agreements = createCustomAgreementController(config, context.runtimeSource, page!.styles)
    agreements.observe(document.body, open => { if (active()) { state.agreementReaderOpen = open; publish() } })
    facade.showAuthPage({
      data: resolution.data,
      success(payload) {
        if (!startupActive() || shown) return
        shown = true
        if (String(payload.code ?? '') !== '103000') { sdkFailure(payload, 'showAuthPage'); return }
        initializeControls()
      },
      error: payload => sdkFailure(payload, 'showAuthPage'),
    })
    return { dispose }
  } catch (error) {
    if (active()) fail(error instanceof Error ? error.message : String(error))
    dispose()
    if (options.safeErrorNotices) {
      if (error instanceof DOMException && error.name === 'AbortError') throw new DOMException('Customer page aborted', 'AbortError')
      throw new Error(safeMessage('CUSTOM_PAGE_FAILED'))
    }
    throw error
  }
}
