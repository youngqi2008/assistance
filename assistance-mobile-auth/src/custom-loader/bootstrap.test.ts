// @vitest-environment-options {"runScripts":"dangerously"}
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CustomAuthorizationConfig, CustomBootConfig, CustomRuntimeContext, CustomRuntimeHandle } from '../custom-page/types'
import { createAssistanceAuthMessage, createCustomBootMessage, type AssistanceAuthMessage } from '../wrapper/verificationBridge'
import { startCustomLoader } from './bootstrap'
import { MOBILE_AUTH_DEFAULT_APP_ID } from '../sdk/mobileAuthSignature'

const handles: CustomRuntimeHandle[] = []
const runtimeSource = 'window.AssistanceInjectedRuntime = { start: window.__testRuntimeStart };'

function authorizationFixture(): CustomAuthorizationConfig {
  return {
    mode: 'authorization', sessionId: 's1', parentOrigin: 'https://host.test',
    page: { kind: 'html', html: '<div data-sdk-slot></div>' }, appId: 'app', request: {},
    agreements: [], iframeOptions: { closable: true, useCustomKeyboard: true, heightMode: 'auto' },
    trustedBusinessBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro-temp/',
    deadline: 123456789, beforeLoginNotificationEnabled: false, stateChangeEnabled: false,
  }
}

function loaderFixture(mode: 'authorization' | 'agreement' = 'authorization') {
  const loaderFrame = document.createElement('iframe')
  const parentFrame = document.createElement('iframe')
  const otherFrame = document.createElement('iframe')
  document.body.append(loaderFrame, parentFrame, otherFrame)
  // Use the iframe's real Window so injected classic scripts and listeners share
  // a realm; Vitest's outer Window carries its own uncaught-error reporting.
  const targetWindow = loaderFrame.contentWindow!
  const targetDocument = targetWindow.document
  const parent = parentFrame.contentWindow!
  const other = otherFrame.contentWindow!
  const messages: AssistanceAuthMessage[] = []
  const targets: string[] = []
  vi.spyOn(parent, 'postMessage').mockImplementation((data, target) => {
    messages.push(data as AssistanceAuthMessage)
    targets.push(target as string)
  })
  const dispose = vi.fn()
  const start = vi.fn<(config: CustomBootConfig, context: CustomRuntimeContext) => Promise<CustomRuntimeHandle>>()
    .mockResolvedValue({ dispose })
  Object.assign(targetWindow, { __testRuntimeStart: start })
  const handle = startCustomLoader({ window: targetWindow, document: targetDocument, parentWindow: parent, parentOrigin: 'https://host.test', sessionId: 's1', mode })
  handles.push(handle)
  function dispatch(data: unknown, source = parent, origin = 'https://host.test') {
    targetWindow.dispatchEvent(new MessageEvent('message', { data, source, origin }))
  }
  function boot(config: CustomBootConfig = authorizationFixture(), source = runtimeSource) {
    dispatch(createCustomBootMessage('s1', { runtimeSource: source, config }))
  }
  return { handle, dispatch, boot, parent, other, start, dispose, messages, targets, window: targetWindow, document: targetDocument }
}

afterEach(() => {
  for (const handle of handles.splice(0)) handle.dispose()
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('fixed custom loader', () => {
  it('prepares omitted parameters inside the selected 031 iframe without changing business metadata or posting them to the host', async () => {
    vi.stubGlobal('__DUODIAN_IFRAME_AUTO_PARAMS__', true)
    const f = loaderFixture()
    const config = authorizationFixture()
    f.boot(config)
    f.boot(config)
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce())
    const prepared = f.start.mock.calls[0][0] as CustomAuthorizationConfig
    expect(Boolean(prepared.authParams?.sign)).toBe(true)
    expect(prepared.authParams?.appId === MOBILE_AUTH_DEFAULT_APP_ID).toBe(true)
    expect(prepared.appId).toBe(config.appId)
    expect({ ...prepared, authParams: undefined }).toEqual(config)
    expect(config.authParams).toBeUndefined()
    expect(f.messages.map(message => message.type)).toEqual(['ASSISTANCE_AUTH_READY'])
  })

  it('passes the ordinary loader config and runtime context through unchanged', async () => {
    vi.stubGlobal('__DUODIAN_IFRAME_AUTO_PARAMS__', false)
    const f = loaderFixture()
    const config = authorizationFixture()
    f.boot(config)
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce())
    expect(f.start.mock.calls[0][0]).toBe(config)
    expect(f.start.mock.calls[0][1]).toEqual({ runtimeSource, signal: expect.any(AbortSignal) })
    expect(config.authParams).toBeUndefined()
  })

  it.each(['CLOSE', 'dispose', 'script failure'])('does not start runtime after %s during 031 parameter module loading', async action => {
    vi.stubGlobal('__DUODIAN_IFRAME_AUTO_PARAMS__', true)
    const f = loaderFixture()
    // Dynamic imports yield before preparation. Cancel in that interval, after
    // the injected script has installed the runtime synchronously.
    f.boot()
    expect(f.document.querySelector('script')).not.toBeNull()
    expect(f.start.mock.calls.length).toBe(0)
    if (action === 'CLOSE') f.dispatch(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1'))
    else if (action === 'dispose') f.handle.dispose()
    else f.document.querySelector('script')!.dispatchEvent(new Event('error'))
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(f.start.mock.calls.length).toBe(0)
    expect(f.messages.filter(message => message.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(action === 'script failure' ? 1 : 0)
  })

  it.each(['complete', 'partial'])('passes %s explicit parameters to the existing runtime without resigning', async kind => {
    vi.stubGlobal('__DUODIAN_IFRAME_AUTO_PARAMS__', true)
    const f = loaderFixture()
    const config = {
      ...authorizationFixture(),
      authParams: kind === 'complete' ? {
        version: '3.0', appId: 'explicit-provider', sign: 'supplied-sign', traceId: 'supplied-trace',
        timestamp: '20261015120000000', authType: '0', scope: '3ElementsAuthAssistFill',
      } : { appId: 'partial-provider' },
    } as CustomAuthorizationConfig
    f.boot(config)
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce())
    expect(f.start.mock.calls[0][0]).toBe(config)
    expect(f.messages.map(message => message.type)).toEqual(['ASSISTANCE_AUTH_READY'])
  })

  it('posts READY to the exact parent origin and executes the received classic script only once', async () => {
    const f = loaderFixture()
    const source = runtimeSource + 'window.__runtimeExecutionCount = (window.__runtimeExecutionCount || 0) + 1;'
    f.boot(authorizationFixture(), source)
    f.boot(authorizationFixture(), source)
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledTimes(1))
    expect(f.messages[0]).toEqual({ source: 'assistance-mobile-auth', type: 'ASSISTANCE_AUTH_READY', sessionId: 's1', payload: undefined })
    expect(f.targets).toEqual(['https://host.test'])
    expect(f.start).toHaveBeenCalledWith(authorizationFixture(), { runtimeSource: source, signal: expect.any(AbortSignal) })
    expect((f.window as Window & { __runtimeExecutionCount?: number }).__runtimeExecutionCount).toBe(1)
    expect(f.document.querySelectorAll('script')).toHaveLength(1)
    f.handle.dispose()
    expect(f.dispose).toHaveBeenCalledOnce()
    expect(f.document.querySelector('script')).toBeNull()
  })

  it.each([false, true])('rejects wrong window, origin, source marker, session and role without consuming BOOT (031=%s)', async enabled => {
    vi.stubGlobal('__DUODIAN_IFRAME_AUTO_PARAMS__', enabled)
    const f = loaderFixture()
    const boot = createCustomBootMessage('s1', { runtimeSource, config: authorizationFixture() })
    f.dispatch(boot, f.other)
    f.dispatch(boot, f.parent, 'https://evil.test')
    f.dispatch({ ...boot, source: 'someone-else' })
    f.dispatch({ ...boot, sessionId: 'old' })
    f.dispatch({ ...boot, payload: { runtimeSource, config: { ...authorizationFixture(), mode: 'agreement' } } })
    f.dispatch({ ...boot, payload: { runtimeSource, config: { ...authorizationFixture(), sessionId: 'old' } } })
    f.dispatch({ ...boot, payload: { runtimeSource, config: { ...authorizationFixture(), parentOrigin: 'https://evil.test' } } })
    f.dispatch({ ...boot, payload: { runtimeSource: 1, config: authorizationFixture() } })
    expect(f.start).not.toHaveBeenCalled()
    expect(f.document.querySelector('script')).toBeNull()
    f.dispatch(boot)
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce())
  })

  it.each([false, true])('accepts the agreement role without starting an authorization BOOT (031=%s)', async enabled => {
    vi.stubGlobal('__DUODIAN_IFRAME_AUTO_PARAMS__', enabled)
    const f = loaderFixture('agreement')
    f.boot()
    expect(f.start).not.toHaveBeenCalled()
    const config: CustomBootConfig = {
      mode: 'agreement', sessionId: 's1', parentOrigin: 'https://host.test', docKey: 'entry',
      docs: {}, entries: [], css: '', styleUrls: [], rootAttributes: {},
    }
    f.boot(config)
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledWith(config, { runtimeSource, signal: expect.any(AbortSignal) }))
  })

  it.each(['reject', 'throw'])('reports a runtime start %s once and preserves CLOSE handling', async (kind) => {
    const f = loaderFixture()
    if (kind === 'reject') f.start.mockRejectedValue(new Error('runtime failed'))
    else f.start.mockImplementation(() => { throw new Error('runtime failed') })
    f.boot()
    await vi.waitFor(() => expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1))
    expect(f.document.body.textContent).toContain('runtime failed')
    expect(f.document.body.textContent).toContain('start')
    f.boot()
    expect(f.start).toHaveBeenCalledOnce()
    const signal = f.start.mock.calls[0][1].signal
    expect(signal.aborted).toBe(false)
    f.dispatch(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1'))
    expect(signal.aborted).toBe(true)
    expect(f.document.querySelector('script')).toBeNull()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
  })

  it.each(['throw new Error("script failed")', 'const = invalid;', '/* no installation */'])('reports actual script execution failure: %s', async source => {
    const f = loaderFixture()
    f.boot(authorizationFixture(), source)
    await vi.waitFor(() => expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1))
    expect(f.document.body.textContent).toContain('script')
    expect(f.start).not.toHaveBeenCalled()
    f.dispatch(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1'))
    expect(f.document.querySelector('script')).toBeNull()
  })

  it('reports script.onerror once, aborts pending work and disposes a late handle', async () => {
    const f = loaderFixture()
    let resolve!: (handle: CustomRuntimeHandle) => void
    f.start.mockImplementation(() => new Promise(r => { resolve = r }))
    f.boot()
    const script = f.document.querySelector('script')!
    script.dispatchEvent(new Event('error'))
    script.dispatchEvent(new Event('error'))
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    expect(f.document.body.textContent).toContain('script')
    resolve({ dispose: f.dispose })
    await vi.waitFor(() => expect(f.dispose).toHaveBeenCalledOnce())
  })

  it('reports TrustedScript assignment rejection once, visibly, and retains CLOSE cleanup', async () => {
    const f = loaderFixture()
    const createElement = f.document.createElement.bind(f.document)
    let preparedScript!: HTMLScriptElement
    vi.spyOn(f.document, 'createElement').mockImplementation((tagName: string) => {
      const element = createElement(tagName)
      if (tagName === 'script') {
        preparedScript = element as HTMLScriptElement
        Object.defineProperty(element, 'textContent', {
          set() { throw new TypeError("This document requires 'TrustedScript' assignment.") },
        })
      }
      return element
    })
    f.boot()
    await vi.waitFor(() => expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1))
    expect(f.document.querySelector('[role="alert"]')?.textContent).toContain('TrustedScript')
    expect(f.start).not.toHaveBeenCalled()
    f.boot()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    f.dispatch(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1'))
    expect(preparedScript.onerror).toBeNull()
    expect(preparedScript.isConnected).toBe(false)
    expect(f.document.querySelector('[role="alert"]')).toBeNull()
    f.handle.dispose()
    f.boot()
    expect(f.start).not.toHaveBeenCalled()
  })

  it('reports an enforced inline-script CSP failure once and retains the CLOSE listener', async () => {
    const f = loaderFixture()
    f.boot(authorizationFixture(), '/* CSP prevented installation */')
    const violation = new Event('securitypolicyviolation')
    Object.assign(violation, { effectiveDirective: 'script-src-elem', blockedURI: 'inline', disposition: 'enforce' })
    f.document.dispatchEvent(violation)
    f.document.dispatchEvent(violation)
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1)
    expect(f.document.body.textContent).toContain('CSP')
    f.dispatch(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1'))
    expect(f.document.querySelector('script')).toBeNull()
    expect(f.start).not.toHaveBeenCalled()
    f.boot()
    expect(f.start).not.toHaveBeenCalled()
  })

  it('ignores report-only and unrelated CSP reports', async () => {
    const f = loaderFixture()
    f.boot()
    for (const detail of [
      { effectiveDirective: 'script-src', blockedURI: 'inline', disposition: 'report' },
      { effectiveDirective: 'img-src', blockedURI: 'https://image.test', disposition: 'enforce' },
    ]) f.document.dispatchEvent(Object.assign(new Event('securitypolicyviolation'), detail))
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce())
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(0)
  })

  it('identifies the queued CSP violation when injection never installs a runtime', async () => {
    const f = loaderFixture()
    f.boot(authorizationFixture(), '/* blocked injection */')
    queueMicrotask(() => f.document.dispatchEvent(Object.assign(new Event('securitypolicyviolation'), {
      effectiveDirective: 'script-src-elem', blockedURI: 'inline', disposition: 'enforce',
    })))
    await vi.waitFor(() => expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(1))
    expect(f.document.body.textContent).toContain('CSP')
    expect(f.start).not.toHaveBeenCalled()
  })

  it('stops observing injection CSP once runtime is installed, including while start is pending', () => {
    const f = loaderFixture()
    f.start.mockImplementation(() => new Promise(() => {}))
    f.boot()
    f.document.dispatchEvent(Object.assign(new Event('securitypolicyviolation'), {
      effectiveDirective: 'script-src-elem', blockedURI: 'inline', disposition: 'enforce',
    }))
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(0)
    expect(f.start.mock.calls[0][1].signal.aborted).toBe(false)
  })

  it('accepts CLOSE only from the exact parent, marker, origin and session', async () => {
    const f = loaderFixture()
    f.boot()
    await vi.waitFor(() => expect(f.start).toHaveBeenCalledOnce())
    const close = createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1')
    f.dispatch(close, f.other)
    f.dispatch(close, f.parent, 'https://evil.test')
    f.dispatch({ ...close, sessionId: 'old' })
    f.dispatch({ ...close, source: 'other' })
    expect(f.dispose).not.toHaveBeenCalled()
    f.dispatch(close)
    f.dispatch(close)
    f.handle.dispose()
    expect(f.dispose).toHaveBeenCalledOnce()
  })

  it.each(['CLOSE', 'dispose'])('prevents BOOT after %s before startup', action => {
    const f = loaderFixture()
    if (action === 'CLOSE') f.dispatch(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1'))
    else f.handle.dispose()
    f.boot()
    expect(f.start).not.toHaveBeenCalled()
    expect(f.document.querySelector('script')).toBeNull()
  })

  it.each(['CLOSE', 'dispose'])('aborts immediately on %s during pending start and cleans up late handle once', async action => {
    const f = loaderFixture()
    let resolve!: (handle: CustomRuntimeHandle) => void
    f.start.mockImplementation(() => new Promise(r => { resolve = r }))
    f.boot()
    const signal = f.start.mock.calls[0][1].signal
    if (action === 'CLOSE') f.dispatch(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', 's1'))
    else f.handle.dispose()
    expect(signal.aborted).toBe(true)
    expect(f.document.querySelector('script')).toBeNull()
    resolve({ dispose: f.dispose })
    await vi.waitFor(() => expect(f.dispose).toHaveBeenCalledOnce())
    f.handle.dispose()
    expect(f.dispose).toHaveBeenCalledOnce()
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(0)
  })

  it('suppresses a rejected startup after cancellation', async () => {
    const f = loaderFixture()
    let reject!: (reason: Error) => void
    f.start.mockImplementation(() => new Promise((_, r) => { reject = r }))
    f.boot()
    f.handle.dispose()
    reject(new Error('aborted'))
    await new Promise(r => setTimeout(r, 0))
    expect(f.messages.filter(x => x.type === 'ASSISTANCE_AUTH_ERROR')).toHaveLength(0)
  })

  it.each(['resolved', 'late'])('continues cleanup when the %s runtime dispose throws and preserves unrelated listeners', async timing => {
    const f = loaderFixture()
    const unrelated = vi.fn()
    f.window.addEventListener('message', unrelated)
    f.dispose.mockImplementation(() => { throw new Error('dispose failed') })
    let resolve!: (handle: CustomRuntimeHandle) => void
    if (timing === 'late') f.start.mockImplementation(() => new Promise(r => { resolve = r }))
    f.boot()
    if (timing === 'resolved') await new Promise(r => setTimeout(r, 0))
    expect(() => f.handle.dispose()).not.toThrow()
    if (timing === 'late') resolve({ dispose: f.dispose })
    await vi.waitFor(() => expect(f.dispose).toHaveBeenCalledOnce())
    f.boot()
    expect(f.start).toHaveBeenCalledOnce()
    expect(unrelated).toHaveBeenCalledTimes(2)
    expect(f.document.querySelector('script')).toBeNull()
    f.window.removeEventListener('message', unrelated)
  })
})
