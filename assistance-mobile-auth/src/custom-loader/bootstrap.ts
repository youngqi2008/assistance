import type { CustomBootConfig, CustomBootPayload, CustomRuntimeContext, CustomRuntimeHandle } from '../custom-page/types'
import {
  ASSISTANCE_AUTH_CLOSE,
  ASSISTANCE_AUTH_CUSTOM_BOOT,
  ASSISTANCE_AUTH_ERROR,
  ASSISTANCE_AUTH_READY,
  createAssistanceAuthMessage,
  isAssistanceAuthMessage,
  parseAssistanceAuthParentOrigin,
} from '../wrapper/verificationBridge'

type RuntimeWindow = Window & {
  AssistanceInjectedRuntime?: {
    start(config: CustomBootConfig, context: CustomRuntimeContext): Promise<CustomRuntimeHandle>
  }
}

type LoaderInput = {
  window: Window
  document: Document
  parentWindow: Window
  parentOrigin: string
  sessionId: string
  mode: 'authorization' | 'agreement'
}

function matchesBoot(value: unknown, input: LoaderInput): value is CustomBootPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<CustomBootPayload>
  const config = payload.config
  return typeof payload.runtimeSource === 'string' && payload.runtimeSource.trim().length > 0 &&
    !!config && typeof config === 'object' && config.mode === input.mode &&
    config.sessionId === input.sessionId && config.parentOrigin === input.parentOrigin
}

export function startCustomLoader(input: LoaderInput): CustomRuntimeHandle {
  const { window: targetWindow, document, parentWindow, parentOrigin, sessionId } = input
  if (!sessionId.trim() || parseAssistanceAuthParentOrigin(parentOrigin) !== parentOrigin ||
    (input.mode !== 'authorization' && input.mode !== 'agreement')) {
    throw new Error('Invalid custom loader identity or role')
  }

  const controller = new AbortController()
  let booted = false
  let closed = false
  let failed = false
  let script: HTMLScriptElement | undefined
  let runtimeHandle: CustomRuntimeHandle | undefined
  let errorElement: HTMLElement | undefined

  const send = (type: typeof ASSISTANCE_AUTH_READY | typeof ASSISTANCE_AUTH_ERROR, payload?: unknown) => {
    parentWindow.postMessage(createAssistanceAuthMessage(type, sessionId, payload), parentOrigin)
  }

  function disposeRuntime() {
    const handle = runtimeHandle
    runtimeHandle = undefined
    // A customer cleanup exception must not retain this loader's resources/listeners.
    try { handle?.dispose() } catch { /* Remaining cleanup is still required. */ }
  }

  function fail(stage: 'script' | 'start' | 'CSP', reason: unknown) {
    if (closed || failed) return
    failed = true
    const detail = reason instanceof Error ? reason.message : String(reason)
    const message = `Custom loader ${stage}: ${detail}`
    errorElement = document.createElement('p')
    errorElement.setAttribute('role', 'alert')
    errorElement.textContent = message
    document.body.append(errorElement)
    if (stage !== 'start') {
      controller.abort()
      disposeRuntime()
    }
    send(ASSISTANCE_AUTH_ERROR, { code: 'CUSTOM_RUNTIME_START_FAILED', message })
  }

  function onPolicyViolation(event: Event) {
    const violation = event as SecurityPolicyViolationEvent
    if (booted && violation.disposition === 'enforce' && violation.blockedURI === 'inline' &&
      ['script-src', 'script-src-elem', 'default-src'].includes(violation.effectiveDirective)) {
      fail('CSP', 'Runtime script injection was blocked by Content Security Policy')
    }
  }

  function dispose() {
    if (closed) return
    closed = true
    controller.abort()
    try {
      disposeRuntime()
    } finally {
      targetWindow.removeEventListener('message', onMessage)
      document.removeEventListener('securitypolicyviolation', onPolicyViolation)
      if (script) script.onerror = null
      script?.remove()
      errorElement?.remove()
    }
  }

  async function boot(payload: CustomBootPayload) {
    // Inline classic scripts execute synchronously and report syntax/runtime errors
    // on Window rather than reliably firing script.onerror.
    const onScriptError = (event: ErrorEvent) => {
      event.preventDefault()
      fail('script', event.error ?? event.message)
    }
    targetWindow.addEventListener('error', onScriptError)
    try {
      script = document.createElement('script')
      script.type = 'text/javascript'
      script.textContent = payload.runtimeSource
      script.onerror = () => fail('script', 'Runtime script could not execute')
      document.head.append(script)
    } catch (error) {
      fail('script', error)
    } finally {
      targetWindow.removeEventListener('error', onScriptError)
    }
    if (failed || closed) return

    let runtime = (targetWindow as RuntimeWindow).AssistanceInjectedRuntime
    if (!runtime || typeof runtime.start !== 'function') {
      // CSP violations are queued after a blocked inline insertion. Give that
      // event a turn before reporting a generic missing-runtime failure.
      await new Promise<void>(resolve => targetWindow.setTimeout(resolve, 0))
      if (closed || failed) return
      runtime = (targetWindow as RuntimeWindow).AssistanceInjectedRuntime
    }
    if (!runtime || typeof runtime.start !== 'function') {
      fail('script', 'Runtime script did not install AssistanceInjectedRuntime.start')
      return
    }
    // Subsequent customer scripts are owned by the runtime, not this injection.
    document.removeEventListener('securitypolicyviolation', onPolicyViolation)
    try {
      let config = payload.config
      if (typeof __DUODIAN_IFRAME_AUTO_PARAMS__ !== 'undefined' && __DUODIAN_IFRAME_AUTO_PARAMS__ &&
        config.mode === 'authorization' && config.authParams === undefined) {
        const { prepareDuodian031Config } = await import('./duodian031AuthParams')
        if (closed || failed || controller.signal.aborted) return
        config = prepareDuodian031Config(config)
      }
      if (closed || failed || controller.signal.aborted) return
      const handle = await runtime.start(config, { runtimeSource: payload.runtimeSource, signal: controller.signal })
      if (!handle || typeof handle.dispose !== 'function') {
        throw new Error('Runtime start did not return a disposable handle')
      }
      runtimeHandle = handle
      if (closed || failed) disposeRuntime()
    } catch (error) {
      fail('start', error)
    }
  }

  function onMessage(event: MessageEvent) {
    if (closed || event.source !== parentWindow || event.origin !== parentOrigin ||
      !isAssistanceAuthMessage(event.data, sessionId)) return
    if (event.data.type === ASSISTANCE_AUTH_CLOSE) {
      dispose()
    } else if (event.data.type === ASSISTANCE_AUTH_CUSTOM_BOOT && !booted && matchesBoot(event.data.payload, input)) {
      booted = true
      void boot(event.data.payload)
    }
  }

  targetWindow.addEventListener('message', onMessage)
  document.addEventListener('securitypolicyviolation', onPolicyViolation)
  send(ASSISTANCE_AUTH_READY)
  return { dispose }
}

// This entry is also imported by tests; only the fixed iframe document auto-starts.
if (typeof window !== 'undefined' && window.location.pathname.endsWith('/custom-verification.html')) {
  const query = new URLSearchParams(window.location.search)
  const mode = query.get('role')
  const sessionId = query.get('sessionId')
  const parentOrigin = query.get('parentOrigin')
  try {
    if ((mode !== 'authorization' && mode !== 'agreement') || !sessionId || !parentOrigin || window.parent === window) {
      throw new Error('Custom loader requires a parent, role, sessionId and parentOrigin')
    }
    startCustomLoader({ window, document, parentWindow: window.parent, parentOrigin, sessionId, mode })
  } catch (error) {
    const status = document.createElement('p')
    status.setAttribute('role', 'alert')
    status.textContent = error instanceof Error ? error.message : String(error)
    document.body.append(status)
  }
}
