import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAssistanceMobileAuthSdk as createCustomer } from '../customers/duodian-health'
import { createAssistanceMobileAuthSdk as createGeneric, type AssistanceMobileAuthSdkInstance } from './index'
import { ASSISTANCE_AUTH_CUSTOM_BOOT, ASSISTANCE_AUTH_READY, ASSISTANCE_AUTH_PRESENTATION_READY, ASSISTANCE_AUTH_SUCCESS,
  ASSISTANCE_AUTH_RESIZE, createAssistanceAuthMessage } from './verificationBridge'

const sessions: AssistanceMobileAuthSdkInstance[] = []
function viewport(height = 700, offsetTop = 0) {
  const value = new EventTarget() as VisualViewport
  Object.defineProperties(value, { height: { value: height, writable: true }, offsetTop: { value: offsetTop, writable: true } })
  vi.stubGlobal('visualViewport', value)
  return value
}
function message(frame: HTMLIFrameElement, type: Parameters<typeof createAssistanceAuthMessage>[0], payload?: unknown,
  overrides: Partial<MessageEventInit> = {}) {
  const url = new URL(frame.src)
  window.dispatchEvent(new MessageEvent('message', { origin: url.origin, source: frame.contentWindow,
    data: createAssistanceAuthMessage(type, url.searchParams.get('sessionId')!, payload), ...overrides }))
}
function open(sdk: AssistanceMobileAuthSdkInstance) {
  sessions.push(sdk)
  const result = sdk.open()
  const rejected = result.then(() => { throw new Error('Expected this session to reject') }, error => { expect(error).toBeInstanceOf(Error) })
  return { sdk, rejected, frame: document.querySelector<HTMLIFrameElement>('[data-assistance-auth-frame]')!,
    shell: document.querySelector<HTMLDivElement>('[data-assistance-auth-overlay]')!,
    layer: document.querySelector<HTMLDivElement>('[data-assistance-auth-positioning-layer]')! }
}
// A small iframe runtime double supplies protocol events; the wrapper/container lifecycle is real.
function boot(frame: HTMLIFrameElement) {
  const transport = vi.spyOn(frame.contentWindow!, 'postMessage')
  message(frame, ASSISTANCE_AUTH_READY)
  const config = transport.mock.calls.find(([data]) => data.type === ASSISTANCE_AUTH_CUSTOM_BOOT)![0].payload.config
  return config
}
beforeEach(() => {
  vi.useFakeTimers(); document.body.replaceChildren(); document.body.style.overflow = 'scroll'
  vi.stubGlobal('__DUODIAN_BOTTOM_SHEET__', true)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 0))
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  viewport()
})
afterEach(() => {
  sessions.splice(0).forEach(sdk => sdk.destroy())
  vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.style.overflow = ''
})

describe('customer ready-first bottom presentation', () => {
  it.each([undefined, '8a9481c79c05c8bd019ed8d7ab571df3'])('uses a full-width white bottom sheet independent of business appId %s', async appId => {
    const active = open(createCustomer({ appId }))
    expect(active.frame.style.width).toBe('100%')
    expect(active.frame.style.borderRadius).toBe('24px 24px 0 0')
    expect(active.frame.style.background).toBe('rgb(255, 255, 255)')
    expect(active.frame.style.transform).toBe('translateY(100%)')
    expect(boot(active.frame).iframeOptions.heightMode).toBe('auto')
    message(active.frame, ASSISTANCE_AUTH_RESIZE, { height: 500, keyboardFocused: false })
    vi.advanceTimersByTime(10)
    expect(active.frame.style.opacity).toBe('0')
    message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY)
    vi.advanceTimersByTime(10)
    expect(active.frame.style.height).toBe('500px')
    expect(active.frame.style.transform).toBe('translateY(0)')
    expect(active.shell.style.background).toBe('rgba(15, 23, 42, 0.35)')
    expect(active.layer.style.alignItems).toBe('flex-end')
    expect(active.layer.style.height).toBe('700px')
    expect(document.body.style.overflow).toBe('hidden')
    active.sdk.destroy(); await active.rejected
  })

  it('leaves host clicks and scrolling available throughout hidden boot, then removes the pending frame at 15 seconds', async () => {
    const button = document.body.appendChild(document.createElement('button')); let clicks = 0
    button.addEventListener('click', () => { clicks++ })
    const onError = vi.fn(); const active = open(createCustomer({ onError }))
    boot(active.frame); button.click()
    expect(clicks).toBe(1); expect(document.body.style.overflow).toBe('scroll')
    expect(active.shell.style.pointerEvents).toBe('none'); expect(active.shell.inert).toBe(true)
    expect(active.shell.hasAttribute('role')).toBe(false); expect(active.frame.style.opacity).toBe('0')
    vi.advanceTimersByTime(14999); expect(active.frame.isConnected).toBe(true)
    vi.advanceTimersByTime(1); await active.rejected
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'AUTH_READY_TIMEOUT' }))
    expect(active.shell.isConnected).toBe(false); expect(document.body.style.overflow).toBe('scroll')
    message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY)
    expect(document.querySelector('[data-assistance-auth-overlay]')).toBeNull()
  })

  it('does not steal host focus during hidden iOS startup when native keyboard mode is requested', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')
    const button = document.body.appendChild(document.createElement('button')); button.focus()
    const active = open(createCustomer({ useCustomKeyboard: false }))
    expect(document.activeElement).toBe(button)
    expect(active.shell.querySelector('[data-assistance-auth-keyboard-activator]')).toBeNull()
    expect(document.body.style.overflow).toBe('scroll')
    active.sdk.destroy(); await active.rejected
  })

  it('caps auto content without native focus and follows a smaller visual viewport while keeping its bottom edge aligned', async () => {
    const vv = viewport(400, 20); const active = open(createCustomer({}))
    boot(active.frame); message(active.frame, ASSISTANCE_AUTH_RESIZE, { height: 900, keyboardFocused: false })
    vi.advanceTimersByTime(10)
    expect(active.frame.style.height).toBe('388px')
    expect(active.layer.style.top).toBe('20px'); expect(active.layer.style.height).toBe('400px')
    message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY)
    Object.assign(vv, { height: 300, offsetTop: 40 }); vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(10)
    expect(active.frame.style.height).toBe('288px')
    expect(active.layer.style.top).toBe('40px'); expect(active.layer.style.height).toBe('300px')
    Object.assign(vv, { height: 700, offsetTop: 0 }); vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(10)
    expect(active.frame.style.height).toBe('688px')
    active.sdk.destroy(); await active.rejected
  })

  it('preserves fixed height and a smaller caller maximum while bounding the sheet to the visual viewport', async () => {
    const vv = viewport(400); const active = open(createCustomer({ authWindowHeight: 520, authWindowMaxHeight: 350 }))
    expect(boot(active.frame).iframeOptions.heightMode).toBe('fixed')
    message(active.frame, ASSISTANCE_AUTH_RESIZE, { height: 900, keyboardFocused: true })
    expect(active.frame.style.height).toBe('520px')
    expect(active.frame.style.maxHeight).toBe('min(350px, calc(100% - 12px))')
    Object.assign(vv, { height: 300 }); vv.dispatchEvent(new Event('resize'))
    expect(active.layer.style.height).toBe('300px'); expect(active.frame.style.height).toBe('520px')
    active.sdk.destroy(); await active.rejected
  })

  it.each(['close', 'destroy'] as const)('cleans hidden startup with %s and ignores old readiness after reopen', async method => {
    const active = open(createCustomer({})); const config = boot(active.frame)
    active.sdk[method](); await active.rejected
    const reopened = open(createCustomer({}))
    message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY)
    message(reopened.frame, ASSISTANCE_AUTH_PRESENTATION_READY, undefined, { source: active.frame.contentWindow })
    message(reopened.frame, ASSISTANCE_AUTH_PRESENTATION_READY, undefined, {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PRESENTATION_READY, config.sessionId) })
    expect(reopened.frame.style.opacity).toBe('0'); expect(document.body.style.overflow).toBe('scroll')
    reopened.sdk.destroy(); await reopened.rejected
  })

  it('slides out after presentation and restores host overflow and viewport subscriptions on close', async () => {
    const vv = viewport(); const remove = vi.spyOn(vv, 'removeEventListener')
    const active = open(createCustomer({})); boot(active.frame)
    message(active.frame, ASSISTANCE_AUTH_RESIZE, { height: 500 }); message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY)
    vi.advanceTimersByTime(10); active.sdk.close(); vi.advanceTimersByTime(10)
    expect(active.frame.isConnected).toBe(true); expect(active.frame.style.transform).toBe('translateY(100%)')
    expect(active.shell.style.background).toBe('rgba(15, 23, 42, 0)')
    Object.assign(vv, { height: 100 }); vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(10)
    expect(active.frame.style.height).toBe('500px')
    await vi.advanceTimersByTimeAsync(360); await active.rejected
    expect(active.frame.isConnected).toBe(false); expect(document.body.style.overflow).toBe('scroll')
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    const height = active.frame.style.height; Object.assign(vv, { height: 100 }); vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(10)
    expect(active.frame.style.height).toBe(height)
  })

  it('keeps generic custom modals full-screen when the build flag is absent', async () => {
    vi.unstubAllGlobals()
    const active = open(createGeneric({ appId: 'customer', customPage: { html: '<div data-assistance-sdk-slot></div>' } }))
    expect(active.frame.style.borderRadius).toBe('0'); expect(active.frame.style.background).toBe('transparent')
    expect(boot(active.frame).iframeOptions.heightMode).toBe('fixed')
    active.sdk.destroy(); await active.rejected
  })

  it('keeps customer inline frames unrounded without a modal or host scroll lock', async () => {
    const target = document.body.appendChild(document.createElement('div'))
    const active = open(createCustomer({ display: 'inline', renderTo: target }))
    expect(active.shell).toBeNull(); expect(active.frame.parentElement).toBe(target)
    expect(active.frame.style.borderRadius).toBe('0'); expect(boot(active.frame).iframeOptions.heightMode).toBe('auto')
    message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY); message(active.frame, ASSISTANCE_AUTH_RESIZE, { height: 800 })
    expect(active.frame.style.height).toBe('800px'); expect(document.body.style.overflow).toBe('scroll')
    active.sdk.destroy(); await active.rejected
  })

  it('cleans pending exit animation on destroy and does not duplicate the close callback from late readiness', async () => {
    const onClose = vi.fn(); const active = open(createCustomer({ onClose }))
    boot(active.frame); message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY); vi.advanceTimersByTime(10)
    active.sdk.close(); expect(vi.getTimerCount()).toBeGreaterThan(0)
    active.sdk.destroy(); await active.rejected
    message(active.frame, ASSISTANCE_AUTH_PRESENTATION_READY); vi.advanceTimersByTime(400)
    expect(active.frame.isConnected).toBe(false); expect(document.body.style.overflow).toBe('scroll')
    expect(onClose).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0)
  })

  it('delivers the first success payload once after the exit animation and drops duplicate terminal events', async () => {
    const onSuccess = vi.fn(); const sdk = createCustomer({ onSuccess }); sessions.push(sdk)
    const result = sdk.open(); const frame = document.querySelector<HTMLIFrameElement>('iframe')!
    boot(frame); message(frame, ASSISTANCE_AUTH_PRESENTATION_READY); vi.advanceTimersByTime(10)
    const payload = { status: 'success', token: 'MOCK_ONLY_TOKEN', idLast4: '1234', keyA: 'MOCK_ONLY_KEY' }
    message(frame, ASSISTANCE_AUTH_SUCCESS, payload); message(frame, ASSISTANCE_AUTH_SUCCESS, { ...payload, token: 'MOCK_ONLY_LATE' })
    expect(frame.isConnected).toBe(true); expect(onSuccess).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(360)
    await expect(result).resolves.toEqual(payload)
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(payload)
    expect(frame.isConnected).toBe(false); expect(document.body.style.overflow).toBe('scroll')
  })
})
