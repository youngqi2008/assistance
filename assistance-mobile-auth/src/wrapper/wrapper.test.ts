import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createMobileAuthStyleOption } from '../sdk/styleOption'
import type { MobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import type { MobileAuthSdkShowAuthPageData } from '../sdk/types'

const {
  assertMetadataReady,
  createMobileAuthSdkFacade,
  facade,
  metadata,
} = vi.hoisted(() => {
  const facade = {
    showAuthPage: vi.fn(),
    initControl: vi.fn(),
    clearControl: vi.fn(),
    getAuthResult: vi.fn(),
    updateSubmitBtnStatus: vi.fn(),
  }

  const metadata = {
    version: '1.0.6',
    jsUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js',
    cssUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/css/new-control-style.css',
    localJsPath: 'src/wrapper/vendor/jssdk-1.0.6.min.js',
    localCssPath: 'src/wrapper/vendor/new-control-style.css',
    jsSha256: 'caf9cd6ef6efe96fcc91111ac7d0bf7d314d0bc657a80c4a1db168afcac18486',
    cssSha256: '35bc356791dc1b7c68bdb282baf31db7eac1edeef4853609f6869cb7286aeb1e',
    retrievedAt: '2026-05-07',
    license: 'official-customer-documentation-no-redistribution-license-text-found',
    redistributionStatus: 'approved',
    approvalSource: 'Project owner approved official CSS use on 2026-05-07',
    approvalDate: '2026-05-07',
    h5CssStrategy: 'env-dynamic-remote-css',
    wrapperCssStrategy: 'caller-required-local-asset',
    updatePolicy: 'replace only after source URL/hash/license review',
  }
  return {
    assertMetadataReady: vi.fn(),
    createMobileAuthSdkFacade: vi.fn(() => facade),
    facade,
    metadata,
  }
})

vi.mock('../sdk/mobileAuthFacade', () => ({
  createMobileAuthSdkFacade,
}))

vi.mock('./vendor/mobile-jssdk.meta', () => ({
  assertMobileOfficialJssdkMetadataReady: assertMetadataReady,
  mobileOfficialJssdkResource: metadata,
}))

import * as publicWrapperApi from './index'
import {
  createAssistanceMobileAuthSdk,
  getAssistanceMobileAuthOfficialCssAsset,
  injectAssistanceMobileAuthOfficialCss,
} from './index'
import { resolveAssistanceMobileAuthJssdkResourceForBuild } from './jssdkResource'
import {
  ASSISTANCE_AUTH_CANCEL,
  ASSISTANCE_AUTH_CUSTOM_BOOT,
  ASSISTANCE_AUTH_PRESENTATION_READY,
  ASSISTANCE_AUTH_CLOSE,
  ASSISTANCE_AUTH_CONFIG,
  ASSISTANCE_AUTH_ERROR,
  ASSISTANCE_AUTH_ERROR_NOTICE,
  ASSISTANCE_AUTH_PHONE_READY,
  ASSISTANCE_AUTH_READY,
  ASSISTANCE_AUTH_RESIZE,
  ASSISTANCE_AUTH_STYLE,
  ASSISTANCE_AUTH_STATE_CHANGE,
  ASSISTANCE_AUTH_SUCCESS,
  createAssistanceAuthMessage,
} from './verificationBridge'

function createAuthParams(): MobileAuthSdkShowAuthPageData {
  return {
    appId: 'app-id',
    sign: 'signature',
    traceId: 'trace-id',
    timestamp: '1710000000',
    authType: '0',
    scope: '3ElementsAuthAssistFill',
  }
}

describe('custom page wrapper sessions', () => {
  const validCustomOptions = () => ({ appId: 'customer-id', customPage: { html: '<div data-assistance-sdk-slot></div>' } })
  const create = (extra = {}) => createAssistanceMobileAuthSdk({ ...validCustomOptions(), ...extra } as Parameters<typeof createAssistanceMobileAuthSdk>[0])
  function dispatch(frame: HTMLIFrameElement, type: Parameters<typeof createAssistanceAuthMessage>[0], payload?: unknown, overrides: Partial<MessageEventInit> = {}) {
    const url = new URL(frame.src)
    window.dispatchEvent(new MessageEvent('message', {
      source: frame.contentWindow,
      origin: url.origin,
      data: createAssistanceAuthMessage(type, url.searchParams.get('sessionId')!, payload),
      ...overrides,
    }))
  }
  beforeEach(() => { document.body.innerHTML = ''; document.body.style.overflow = ''; vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); document.body.style.overflow = '' })

  it('RF1 rejects bad configuration without replacing an active custom window', async () => {
    const sdk = create(); const pending = sdk.open({ requestId: 'old' }); const rejected = expect(pending).rejects.toBeDefined()
    const frame = document.querySelector('iframe')!
    expect(() => create({ customPage: { html: '', url: 'https://x.test' } })).toThrow()
    expect(document.querySelector('iframe')).toBe(frame)
    sdk.close(); await rejected
  })
  it('RF1 preserves the pending inline session when its render target disconnects', async () => {
    const target = document.body.appendChild(document.createElement('div'))
    const sdk = create({ display: 'inline', renderTo: target }); const active = sdk.open()
    const rejected = expect(active).rejects.toBeDefined(); const frame = target.querySelector('iframe')
    let settled = false; void active.then(() => { settled = true }, () => { settled = true })
    target.remove(); await expect(sdk.open()).rejects.toBeDefined()
    expect(target.querySelector('iframe')).toBe(frame); expect(settled).toBe(false)
    document.body.append(target); sdk.close(); await rejected
  })
  it('rejects custom container and authorize combinations', () => {
    expect(() => create({ container: document.body, authParams: createAuthParams() })).toThrow(/custom/i)
    const sdk = create(); expect(() => sdk.authorize()).toThrow(/custom/i)
  })
  it('passes the configured production business base to custom BOOT instead of the TEMP base', async () => {
    const sdk = create(); const pending = sdk.open()
    const rejected = expect(pending).rejects.toBeDefined()
    const frame = document.querySelector('iframe')!
    const send = vi.spyOn(frame.contentWindow!, 'postMessage')
    dispatch(frame, ASSISTANCE_AUTH_READY)
    try {
      const boot = send.mock.calls.find(([message]) => message.type === ASSISTANCE_AUTH_CUSTOM_BOOT)![0]
      expect(boot.payload.config.trustedBusinessBaseUrl).toBe('https://ginkgo.chinaums.com/sign-pay-pro/')
    } finally { sdk.destroy(); await rejected }
  })
  it('sends a data-only BOOT exactly once and stays nonblocking until presentation ready', async () => {
    const onReady = vi.fn(); const onAuthReady = vi.fn(); const hostCallback = vi.fn()
    const sdk = create({ onReady, onAuthReady, authParams: createAuthParams(), styleOption: { agreeStyle: { childArr: [{ name: 'host', customEvent: hostCallback }] }, extension: { callback: hostCallback } } })
    const pending = sdk.open({ requestId: 'request' }); const rejected = expect(pending).rejects.toBeDefined()
    const frame = document.querySelector('iframe')!; const send = vi.spyOn(frame.contentWindow!, 'postMessage')
    expect(new URL(frame.src).pathname).toBe('/sign-pay-pro/assist/0.3.0/custom-verification.html')
    expect(frame.style.opacity).toBe('0'); expect(frame.tabIndex).toBe(-1); expect(document.body.style.overflow).toBe('')
    dispatch(frame, ASSISTANCE_AUTH_READY); dispatch(frame, ASSISTANCE_AUTH_READY)
    expect(onReady).toHaveBeenCalledTimes(1); expect(onAuthReady).not.toHaveBeenCalled()
    const boot = send.mock.calls.find(([message]) => message.type === ASSISTANCE_AUTH_CUSTOM_BOOT)!
    expect(boot[1]).toBe(new URL(frame.src).origin)
    expect(boot[0].payload.runtimeSource).toContain('AssistanceInjectedRuntime')
    expect(boot[0].payload.config.styleOption.agreeStyle.childArr).toEqual([{ name: 'host' }])
    expect(boot[0].payload.config.styleOption.extension).toEqual({})
    expect(boot[0].payload.config.deadline).toBe(Date.now() + 15000)
    expect(boot[0].payload.config).not.toHaveProperty('signal'); expect(hostCallback).not.toHaveBeenCalled()
    dispatch(frame, ASSISTANCE_AUTH_PRESENTATION_READY)
    expect(frame.style.opacity).toBe('1'); expect(document.body.style.overflow).toBe('hidden')
    expect(onAuthReady).not.toHaveBeenCalled(); sdk.destroy(); await rejected
  })
  it('snapshots only agreement name/link and produces a structured-clone compatible BOOT', async () => {
    const callback = vi.fn()
    const cyclic: { self?: unknown } = {}; cyclic.self = cyclic
    const agreement = { name: '客户协议', link: 'https://customer.test/terms', callback, extension: cyclic, symbol: Symbol('local') }
    const sdk = create({ agreements: [agreement] }); const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined()
    const frame = document.querySelector('iframe')!; const send = vi.spyOn(frame.contentWindow!, 'postMessage')
    dispatch(frame, ASSISTANCE_AUTH_READY)
    const boot = send.mock.calls.find(([message]) => message.type === ASSISTANCE_AUTH_CUSTOM_BOOT)![0]
    try {
      expect(() => structuredClone(boot)).not.toThrow()
      expect(boot.payload.config.agreements).toEqual([{ name: '客户协议', link: 'https://customer.test/terms' }])
      expect(boot.payload.config.agreements[0]).not.toBe(agreement)
      expect(callback).not.toHaveBeenCalled()
    } finally { sdk.destroy(); await rejected }
  })
  it('keeps open-time agreement values when the host mutates objects and array before READY', async () => {
    const agreement = { name: '原协议', link: 'https://customer.test/original' }
    const agreements = [agreement]
    const sdk = create({ agreements }); const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined()
    agreement.name = '更改名称'; agreement.link = 'https://customer.test/changed'
    agreements.push({ name: '迟到协议', link: 'https://customer.test/late' }); agreements[0] = { name: '替换协议', link: 'https://customer.test/replaced' }
    const frame = document.querySelector('iframe')!; const send = vi.spyOn(frame.contentWindow!, 'postMessage')
    dispatch(frame, ASSISTANCE_AUTH_READY)
    try {
      const boot = send.mock.calls.find(([message]) => message.type === ASSISTANCE_AUTH_CUSTOM_BOOT)![0]
      expect(boot.payload.config.agreements).toEqual([{ name: '原协议', link: 'https://customer.test/original' }])
    } finally { sdk.destroy(); await rejected }
  })
  it.each(['name', 'link'] as const)('rejects invalid agreement $0 before replacing the pending custom session', async field => {
    const agreement = { name: '客户协议', link: 'https://customer.test/terms' }
    const sdk = create({ agreements: [agreement] }); const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined()
    const frame = document.querySelector('iframe'); let settled = false
    void active.then(() => { settled = true }, () => { settled = true })
    agreement[field] = (() => {}) as never
    try {
      await expect(sdk.open()).rejects.toThrow(/agreement/i)
      expect(document.querySelector('iframe')).toBe(frame); expect(settled).toBe(false)
    } finally { sdk.destroy(); await rejected }
  })
  it('checks exact window, origin and session for custom events and drops old source after reopen', async () => {
    const onReady = vi.fn(); const onSuccess = vi.fn(); const sdk = create({ onReady, onSuccess })
    const old = sdk.open(); const oldRejected = expect(old).rejects.toBeDefined(); const oldFrame = document.querySelector('iframe')!
    const next = sdk.open(); await oldRejected; const rejected = expect(next).rejects.toBeDefined(); const frame = document.querySelector('iframe')!
    dispatch(frame, ASSISTANCE_AUTH_READY, undefined, { source: window }); dispatch(frame, ASSISTANCE_AUTH_READY, undefined, { origin: 'https://wrong.test' })
    dispatch(frame, ASSISTANCE_AUTH_READY, undefined, { data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, 'wrong') })
    dispatch(oldFrame, ASSISTANCE_AUTH_SUCCESS, { status: 'success', token: 'token', idLast4: '1234', keyA: 'key' })
    expect(onReady).not.toHaveBeenCalled(); expect(onSuccess).not.toHaveBeenCalled(); expect(document.querySelectorAll('iframe')).toHaveLength(1)
    sdk.destroy(); await rejected
  })
  it('finishes an error once without duplicate notice and removes inline frame', async () => {
    const target = document.body.appendChild(document.createElement('div')); const onError = vi.fn(); const onErrorNotice = vi.fn()
    const sdk = create({ display: 'inline', renderTo: target, onError, onErrorNotice }); const pending = sdk.open(); const rejected = expect(pending).rejects.toThrow('failed')
    const frame = target.querySelector('iframe')!; dispatch(frame, ASSISTANCE_AUTH_ERROR, { message: 'failed' }); dispatch(frame, ASSISTANCE_AUTH_ERROR, { message: 'failed' }); dispatch(frame, ASSISTANCE_AUTH_ERROR_NOTICE, { message: 'failed' })
    await rejected; expect(onError).toHaveBeenCalledTimes(1); expect(onErrorNotice).not.toHaveBeenCalled(); expect(target.querySelector('iframe')).toBeNull()
  })
  it('deduplicates state notifications and ignores late events after cancel', async () => {
    const onStateChange = vi.fn(); const onBeforeLogin = vi.fn(); const sdk = create({ onStateChange, onBeforeLogin })
    const pending = sdk.open(); const rejected = expect(pending).rejects.toBeDefined(); const frame = document.querySelector('iframe')!
    dispatch(frame, ASSISTANCE_AUTH_STATE_CHANGE, { event: { type: 'idLast4Complete' } }); dispatch(frame, ASSISTANCE_AUTH_STATE_CHANGE, { event: { type: 'idLast4Complete' } })
    expect(onStateChange).toHaveBeenCalledTimes(1); expect(onBeforeLogin).toHaveBeenCalledTimes(1)
    dispatch(frame, ASSISTANCE_AUTH_CANCEL); await rejected; dispatch(frame, ASSISTANCE_AUTH_STATE_CHANGE, { event: { type: 'idLast4Incomplete' } })
    expect(onStateChange).toHaveBeenCalledTimes(1)
  })
  it('ends startup at the shared deadline even when READY never arrives', async () => {
    const onError = vi.fn(); const sdk = create({ onError }); const pending = sdk.open(); const rejected = expect(pending).rejects.toBeDefined()
    await vi.advanceTimersByTimeAsync(15000); await rejected; expect(onError).toHaveBeenCalledTimes(1); expect(document.querySelector('iframe')).toBeNull()
  })
  it('rejects a changed page before replacing its pending session', async () => {
    const options = validCustomOptions(); const sdk = createAssistanceMobileAuthSdk(options)
    const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined(); const frame = document.querySelector('iframe')
    options.customPage.html = ''; await expect(sdk.open()).rejects.toBeDefined()
    expect(document.querySelector('iframe')).toBe(frame); sdk.destroy(); await rejected
  })
  it('rejects invalid auth data before replacing the pending session', async () => {
    const options = { ...validCustomOptions(), authParams: createAuthParams() }; const sdk = createAssistanceMobileAuthSdk(options)
    const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined(); const frame = document.querySelector('iframe')
    options.authParams.sign = (() => {}) as never
    await expect(sdk.open()).rejects.toBeDefined(); expect(document.querySelector('iframe')).toBe(frame)
    sdk.destroy(); await rejected
  })
  it('preserves explicit dimensions and keyboard/close options without appId skin selection', async () => {
    const sdk = create({ appId: '8a9481c79c05c8bd019ed8d7ab571df3', authWindowHeight: 520, authWindowMaxHeight: 700, useCustomKeyboard: false, closable: false })
    const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined(); const frame = document.querySelector('iframe')!
    expect(frame.style.height).toBe('520px'); expect(frame.style.maxHeight).toBe('700px'); expect(frame.style.background).toBe('transparent')
    const send = vi.spyOn(frame.contentWindow!, 'postMessage'); dispatch(frame, ASSISTANCE_AUTH_READY)
    expect(send.mock.calls[0][0].payload.config.iframeOptions).toEqual({ closable: false, useCustomKeyboard: false, heightMode: 'fixed' })
    window.dispatchEvent(new Event('resize')); expect(frame.style.height).toBe('520px')
    sdk.destroy(); await rejected
  })
  it('rejects presentation readiness after the absolute deadline before its timer runs', async () => {
    const onError = vi.fn(); const sdk = create({ onError }); const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined()
    const frame = document.querySelector('iframe')!; vi.setSystemTime(Date.now() + 15001)
    dispatch(frame, ASSISTANCE_AUTH_PRESENTATION_READY); await rejected
    expect(onError).toHaveBeenCalledTimes(1); expect(document.body.style.overflow).toBe('')
  })
  it('reopen still removes the old frame if runtime close transport throws', async () => {
    const sdk = create(); const old = sdk.open(); const oldRejected = expect(old).rejects.toBeDefined(); const oldFrame = document.querySelector('iframe')!
    const send = vi.spyOn(oldFrame.contentWindow!, 'postMessage').mockImplementation(() => { throw new Error('disposed window') })
    const next = sdk.open(); const nextRejected = expect(next).rejects.toBeDefined(); await oldRejected
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: ASSISTANCE_AUTH_CLOSE }), new URL(oldFrame.src).origin)
    expect(document.querySelectorAll('iframe')).toHaveLength(1); sdk.destroy(); await nextRejected
  })
  it('preserves a falsy cancel payload for the local public callback', async () => {
    const onCancel = vi.fn(); const sdk = create({ onCancel }); const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined()
    dispatch(document.querySelector('iframe')!, ASSISTANCE_AUTH_CANCEL, false); await rejected
    expect(onCancel).toHaveBeenCalledWith(false)
  })
  it.each([
    { display: 'inline', initial: '420px', want: '600px' },
    { display: 'inline', authWindowHeight: 520, initial: '520px', want: '520px' },
    { display: 'modal', authWindowHeightMode: 'auto', initial: '420px', want: '600px' },
  ] as const)('custom resize respects auto/fixed presentation $display with initial $initial', async ({ initial, want, ...options }) => {
    const target = document.body.appendChild(document.createElement('div'))
    const sdk = create({ ...options, renderTo: target }); const active = sdk.open(); const rejected = expect(active).rejects.toBeDefined()
    const frame = document.querySelector('iframe')!; expect(frame.style.height).toBe(initial)
    dispatch(frame, ASSISTANCE_AUTH_RESIZE, { height: 600 }); expect(frame.style.height).toBe(want)
    sdk.destroy(); await rejected
  })
})

describe('createAssistanceMobileAuthSdk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.head.innerHTML = ''
    document.body.innerHTML = '<main><section id="auth-container"></section></main>'
    delete window.YDRZAuthSF
    Reflect.deleteProperty(window, 'CryptoJS')
    metadata.redistributionStatus = 'approved'
    metadata.jsUrl = 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js'
    metadata.localJsPath = 'src/wrapper/vendor/jssdk-1.0.6.min.js'
    assertMetadataReady.mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('asserts metadata readiness and fails closed when the remote jsUrl is missing', () => {
    expect(() =>
      createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        container: '#auth-container',
        authParams: createAuthParams(),
      }),
    ).not.toThrow()

    expect(assertMetadataReady).toHaveBeenCalledWith(metadata)

    metadata.jsUrl = ''

    expect(() =>
      createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        container: '#auth-container',
        authParams: createAuthParams(),
      }),
    ).toThrow('Mobile official JSSDK remote jsUrl is missing')
  })

  it('resolves selector containers and throws clearly when the container is missing', () => {
    expect(() =>
      createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        container: '#missing-container',
        authParams: createAuthParams(),
      }),
    ).toThrow('AssistanceMobileAuth container not found')
  })

  it('injects a remote <script src=jsUrl> before authorizing and showAuthPage waits for script load', async () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      container: '#auth-container',
      authParams: createAuthParams(),
    })

    const script = document.getElementById('assistance-mobile-auth-official-jssdk')
    expect(script).toBeInstanceOf(HTMLScriptElement)
    expect((script as HTMLScriptElement).src).toBe(metadata.jsUrl)
    expect(createMobileAuthSdkFacade).not.toHaveBeenCalled()

    sdk.authorize()

    expect(facade.showAuthPage).not.toHaveBeenCalled()

    window.YDRZAuthSF = {} as Window['YDRZAuthSF']
    script?.dispatchEvent(new Event('load'))

    await Promise.resolve()
    await Promise.resolve()

    expect(createMobileAuthSdkFacade).toHaveBeenCalledTimes(1)
    expect(facade.showAuthPage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: createAuthParams(),
      }),
    )
  })

  it('normalizes retired authType 11 to 0 at the public authorize boundary', async () => {
    const authParams = {
      ...createAuthParams(),
      authType: '11',
    }
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      container: '#auth-container',
      authParams,
    })

    sdk.authorize()

    window.YDRZAuthSF = {} as Window['YDRZAuthSF']
    document.getElementById('assistance-mobile-auth-official-jssdk')?.dispatchEvent(new Event('load'))
    await Promise.resolve()
    await Promise.resolve()

    expect(facade.showAuthPage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          ...authParams,
          authType: '0',
        },
      }),
    )
    expect(authParams.authType).toBe('11')
  })

  it('exposes window.CryptoJS before injecting the remote SDK <script> so aesEncrypt and friends resolve', () => {
    expect(window.CryptoJS).toBeUndefined()

    createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      container: '#auth-container',
      authParams: createAuthParams(),
    })

    expect(window.CryptoJS).toBeDefined()
    expect(typeof window.CryptoJS?.AES?.encrypt).toBe('function')
    expect(typeof window.CryptoJS?.enc?.Utf8?.parse).toBe('function')
    expect(document.getElementById('assistance-mobile-auth-official-jssdk')).toBeInstanceOf(HTMLScriptElement)
  })

  it('does not overwrite a pre-existing window.CryptoJS provided by the host page', () => {
    const sentinel = { sentinel: true } as unknown as typeof import('crypto-js')
    window.CryptoJS = sentinel

    createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      container: '#auth-container',
      authParams: createAuthParams(),
    })

    expect(window.CryptoJS).toBe(sentinel)
  })

  it('initializes controls only after successful showAuthPage code 103000 and routes other outcomes to onError', async () => {
    const onAuthReady = vi.fn()
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const styleOption = {
      submitBtnStyle: {
        name: '立即认证',
      },
    }

    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      container: document.querySelector<HTMLElement>('#auth-container')!,
      authParams: createAuthParams(),
      styleOption,
      onAuthReady,
      onSuccess,
      onError,
    })

    sdk.authorize()

    window.YDRZAuthSF = {} as Window['YDRZAuthSF']
    document.getElementById('assistance-mobile-auth-official-jssdk')?.dispatchEvent(new Event('load'))
    await Promise.resolve()
    await Promise.resolve()

    const showAuthPageRequest = facade.showAuthPage.mock.calls[0]?.[0]
    expect(showAuthPageRequest).toBeDefined()

    showAuthPageRequest?.success?.({ code: '103000', traceId: 'trace-id' })

    expect(facade.initControl).toHaveBeenCalledWith({
      styleOption: createMobileAuthStyleOption(styleOption),
      beforeSubmit: expect.any(Function),
      authReady: onAuthReady,
      success: onSuccess,
      error: onError,
    })
    expect(facade.initControl.mock.calls[0]?.[0].beforeSubmit?.()).toBe(true)

    showAuthPageRequest?.success?.({ code: '500001', message: 'user cancelled' })

    expect(onError).toHaveBeenCalledWith({ code: '500001', message: 'user cancelled' })
  })

  it('delegates clear to facade.clearControl with the optional target id', () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      container: '#auth-container',
      authParams: createAuthParams(),
    })

    sdk.clear('ydrzSubmitControl')

    expect(facade.clearControl).toHaveBeenCalledWith('ydrzSubmitControl')
  })

  it('requires a valid inline renderTo at SDK creation without falling back to a modal', () => {
    expect(() => createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      display: 'inline',
    })).toThrow('AssistanceMobileAuth inline renderTo not found')
    expect(() => createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      display: 'inline',
      renderTo: '#missing-inline-target',
    })).toThrow('AssistanceMobileAuth inline renderTo not found')
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
  })

  it('mounts an inline iframe directly into renderTo without modal presentation behavior', () => {
    const target = document.createElement('section')
    target.id = 'inline-target'
    document.body.appendChild(target)
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      display: 'inline',
      renderTo: '#inline-target',
    })
    const promise = sdk.open({ requestId: 'inline-open' })
    void promise.catch(() => undefined)

    const frame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    expect(frame).toBeTruthy()
    expect(new URL(frame.src).searchParams.get('layout')).toBe('inline')
    expect(frame).toHaveStyle({
      display: 'block',
      width: '100%',
      background: 'transparent',
      border: '0px',
      borderRadius: '0',
      boxShadow: 'none',
      transition: 'none',
    })
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.querySelector('[data-assistance-auth-positioning-layer="true"]')).toBeNull()
    sdk.destroy()
  })

  it('applies only current inline resize messages after origin, source, and session checks', () => {
    const target = document.createElement('section')
    document.body.appendChild(target)
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', display: 'inline', renderTo: target })
    const promise = sdk.openVerification()
    void promise.catch(() => undefined)
    const frame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId')!

    for (const event of [
      new MessageEvent('message', {
        origin: 'https://evil.example',
        source: frame.contentWindow,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 501 }),
      }),
      new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        source: window,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 502 }),
      }),
      new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        source: frame.contentWindow,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, 'wrong-session', { height: 503 }),
      }),
    ]) {
      window.dispatchEvent(event)
    }
    expect(frame.style.height).toBe('420px')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: frame.contentWindow,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 504.1 }),
    }))
    expect(frame.style.height).toBe('505px')
    sdk.destroy()
  })

  it('keeps the exact Haike inline frame fixed to its renderTo before and after a resize message', () => {
    const target = document.createElement('section')
    document.body.appendChild(target)
    const sdk = createAssistanceMobileAuthSdk({
      appId: '8a9481c79c05c8bd019ed8d7ab571df3',
      display: 'inline',
      renderTo: target,
    })
    const promise = sdk.openVerification()
    void promise.catch(() => undefined)
    const frame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId')!

    expect(frame).toHaveStyle({ width: '100%', height: '100%' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: frame.contentWindow,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 504.1 }),
    }))

    expect(frame).toHaveStyle({ width: '100%', height: '100%' })
    sdk.destroy()
  })

  it('keeps the Haike modal frame on the existing modal sizing path', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: '8a9481c79c05c8bd019ed8d7ab571df3' })
    const promise = sdk.openVerification()
    void promise.catch(() => undefined)
    const frame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const initialHeight = frame.style.height
    const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId')!

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: frame.contentWindow,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 504.1 }),
    }))

    expect(frame.style.height).toBe(initialHeight)
    expect(frame.style.height).not.toBe('100%')
    sdk.destroy()
  })

  it('enables iframe vConsole only from the dedicated Haike test page', () => {
    const originalUrl = window.location.href

    try {
      window.history.replaceState(null, '', '/sign-pay-pro-temp/test-page-hk')
      const target = document.createElement('section')
      document.body.appendChild(target)
      const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', display: 'inline', renderTo: target })
      const promise = sdk.openVerification()
      void promise.catch(() => undefined)

      const frame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
      expect(new URL(frame.src).searchParams.get('debugVConsole')).toBe('1')
      sdk.destroy()
    } finally {
      window.history.replaceState(null, '', originalUrl)
    }
  })

  it.each([
    [ASSISTANCE_AUTH_SUCCESS, { status: 'success', token: 'token', idLast4: '1234', keyA: 'key-a' }],
    [ASSISTANCE_AUTH_ERROR, { message: '验证失败' }],
    [ASSISTANCE_AUTH_CANCEL, undefined],
  ] as const)('retains an inline iframe after terminal %s until close', async (type, payload) => {
    const target = document.createElement('section')
    document.body.appendChild(target)
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', display: 'inline', renderTo: target })
    const promise = sdk.openVerification()
    const frame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId')!

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(type, sessionId, payload),
    }))
    if (type === ASSISTANCE_AUTH_SUCCESS) {
      await expect(promise).resolves.toMatchObject({ token: 'token' })
    } else {
      await expect(promise).rejects.toBeInstanceOf(Error)
    }
    expect(frame).toBeInTheDocument()
    sdk.close()
    expect(frame).not.toBeInTheDocument()
  })

  it('destroy removes a retained inline terminal iframe and its active listener', async () => {
    const target = document.createElement('section')
    document.body.appendChild(target)
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', display: 'inline', renderTo: target })
    const promise = sdk.openVerification()
    const frame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId')!

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, sessionId, {
        status: 'success', token: 'token', idLast4: '1234', keyA: 'key-a',
      }),
    }))
    await expect(promise).resolves.toMatchObject({ token: 'token' })
    expect(frame).toBeInTheDocument()

    sdk.destroy()
    expect(frame).not.toBeInTheDocument()
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: frame.contentWindow,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 600 }),
    }))
    expect(frame.style.height).toBe('420px')
  })

  it('checks a stale inline target before replacing an existing active session, then removes the old frame on a valid open', async () => {
    const target = document.createElement('section')
    document.body.appendChild(target)
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', display: 'inline', renderTo: target })
    const first = sdk.openVerification()
    const firstFrame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    document.body.removeChild(target)
    expect(() => sdk.openVerification()).toThrow('inline renderTo is no longer connected')
    expect(target.contains(firstFrame)).toBe(true)

    document.body.appendChild(target)
    const second = sdk.openVerification()
    await expect(first).rejects.toThrow('Assistance auth replaced')
    expect(firstFrame).not.toBeInTheDocument()
    const secondFrame = target.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    sdk.destroy()
    await expect(second).rejects.toThrow('Assistance auth destroyed')
    expect(secondFrame).not.toBeInTheDocument()
  })

  it('opens one JSSDK-owned verification iframe without launchToken and resolves from a matching success message', async () => {
    vi.useFakeTimers()

    const onSuccess = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      authWindowTitle: '移动认证验证窗口',
      onSuccess,
    })

    const promise = sdk.open({ scene: 'native-number', requestId: 'req-1' })
    const shell = document.getElementById('assistance-mobile-auth-frame-shell')
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    expect(shell).toBeInTheDocument()
    expect(shell).toHaveAttribute('data-assistance-auth-overlay', 'true')
    expect(shell).toHaveStyle({ position: 'fixed', inset: '0', opacity: '0' })
    expect(iframe).toBeInTheDocument()
    expect(iframe?.title).toBe('移动认证验证窗口')
    expect(iframe?.src).toContain('https://ginkgo.chinaums.com/sign-pay-pro/verification')
    expect(iframe?.src).toContain('requestId=req-1')
    expect(iframe?.src).not.toContain('launchToken')
    expect(iframe).toHaveStyle({ height: '92vh', maxHeight: '820px' })
    expect(iframe).toHaveClass('assistance-auth-frame-enter')
    expect(iframe).toHaveStyle({ transform: 'translateY(100%)' })
    expect(sessionId).toMatch(/^assistance-auth-/)
    expect(document.body.style.overflow).toBe('hidden')

    await vi.advanceTimersByTimeAsync(16)
    expect(shell).toHaveStyle({ opacity: '0' })
    expect(iframe).toHaveStyle({ transform: 'translateY(100%)' })

    await vi.advanceTimersByTimeAsync(16)
    expect(shell).toHaveStyle({ opacity: '1' })
    expect(iframe).toHaveStyle({ transform: 'translateY(0)' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, sessionId, {
        status: 'success',
        token: 'sdk-token',
        idLast4: '1234',
        keyA: 'sdk-key-a',
        requestId: 'req-1',
        message: '验证完成',
        mock: true,
        displayName: 'Ada Lovelace',
        mobile: '13800000000',
        idCard: '110101199001011234',
        encryptedName: 'ENCRYPTED',
      }),
    }))

    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    expect(onSuccess).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200)
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200)

    const result = await promise
    expect(result).toMatchObject({
      status: 'success',
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
      requestId: 'req-1',
      message: '验证完成',
      mock: true,
    })
    expect(result).not.toHaveProperty('displayName')
    expect(result).not.toHaveProperty('mobile')
    expect(result).not.toHaveProperty('idCard')
    expect(result).not.toHaveProperty('encryptedName')
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
    }))
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('displayName')
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('mobile')
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('idCard')
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('encryptedName')
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })

  it.each(['8a9481c79c05c8bd019f6f42956924a0', '10037e6f9d903f86019ed8cfb6320365', '8a9481c79c05c8bd019ed8d49fb81df2'])('defers target %s until presentation-ready and keeps its modal shell contract', async (appId) => {
    vi.useFakeTimers()
    const sdk = createAssistanceMobileAuthSdk({
      appId,
    })
    const promise = sdk.openVerification()
    void promise.catch(() => undefined)
    const shell = document.getElementById('assistance-mobile-auth-frame-shell') as HTMLDivElement
    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe[data-assistance-auth-frame="true"]',
    )!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''

    expect(new URL(iframe.src).searchParams.get('appId')).toBe(appId)
    try {
      expect(shell).toHaveStyle({ opacity: '0', pointerEvents: 'none' })
      expect(shell).toHaveAttribute('aria-hidden', 'true')
      expect(shell).not.toHaveAttribute('role')
      expect(iframe).toHaveAttribute('aria-hidden', 'true')
      expect(iframe).toHaveAttribute('tabindex', '-1')
      expect(document.body.style.overflow).toBe('')

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
      }))
      await vi.advanceTimersByTimeAsync(32)
      expect(shell).toHaveStyle({ opacity: '0', pointerEvents: 'none' })
      expect(document.body.style.overflow).toBe('')

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(
          'ASSISTANCE_AUTH_PRESENTATION_READY' as never,
          sessionId,
        ),
      }))
      expect(shell).toHaveAttribute('role', 'dialog')
      expect(shell).toHaveAttribute('aria-modal', 'true')
      expect(shell).not.toHaveAttribute('aria-hidden')
      expect(iframe).not.toHaveAttribute('aria-hidden')
      expect(iframe).not.toHaveAttribute('tabindex')
      expect(document.body.style.overflow).toBe('hidden')
      await vi.advanceTimersByTimeAsync(16000)
      expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBe(shell)
      expect(shell.style.background).toBe(appId === '8a9481c79c05c8bd019f6f42956924a0' ? 'rgba(15, 23, 42, 0.35)' : 'transparent')
    } finally {
      sdk.destroy()
      await vi.advanceTimersByTimeAsync(400)
    }
  })

  it.each([
    ['default', 'no-such-app'],
    ['Haike', '8a9481c79c05c8bd019ed8d7ab571df3'],
  ])('keeps %s appId on the existing immediate modal path', async (_label, appId) => {
    vi.useFakeTimers()
    const sdk = createAssistanceMobileAuthSdk({ appId })
    const promise = sdk.openVerification()
    void promise.catch(() => undefined)
    const shell = document.getElementById('assistance-mobile-auth-frame-shell') as HTMLDivElement
    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe[data-assistance-auth-frame="true"]',
    )!

    try {
      expect(shell).toHaveAttribute('role', 'dialog')
      expect(shell).toHaveAttribute('aria-modal', 'true')
      expect(shell).not.toHaveAttribute('aria-hidden')
      expect(iframe).not.toHaveAttribute('aria-hidden')
      expect(document.body.style.overflow).toBe('hidden')
      await vi.advanceTimersByTimeAsync(32)
      expect(shell).toHaveStyle({ opacity: '1' })
    } finally {
      sdk.destroy()
      await vi.advanceTimersByTimeAsync(400)
    }
  })

  it.each(['failure', 'timeout'])('cleans Yuanbao hidden initialization once on %s despite duplicate messages', async (mode) => {
    vi.useFakeTimers()
    const onError = vi.fn(() => { throw new Error('customer callback failed') })
    const sdk = createAssistanceMobileAuthSdk({ appId: '10037e6f9d903f86019ed8cfb6320365', onError })
    const promise = sdk.openVerification()
    const rejected = vi.fn()
    void promise.catch(rejected)
    const frame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId')!
    const send = (type: string) => window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(type as never, sessionId, { code: 'INIT_FAILED', message: '初始化失败' }),
    }))
    send('ASSISTANCE_AUTH_READY')
    if (mode === 'failure') send('ASSISTANCE_AUTH_ERROR')
    else await vi.advanceTimersByTimeAsync(15000)
    send('ASSISTANCE_AUTH_ERROR')
    send('ASSISTANCE_AUTH_PRESENTATION_READY')
    await vi.advanceTimersByTimeAsync(500)
    expect(rejected).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(document.querySelector('iframe[data-assistance-auth-frame="true"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    if (mode === 'timeout') expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'AUTH_READY_TIMEOUT' }))
    sdk.destroy()
  })

  it.each(['close', 'destroy', 'replace'])('clears Yuanbao initialization timer on %s', async (action) => {
    vi.useFakeTimers()
    const onError = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({ appId: '10037e6f9d903f86019ed8cfb6320365', onError })
    void sdk.openVerification().catch(() => undefined)
    if (action === 'replace') {
      void sdk.openVerification().catch(() => undefined)
      const frame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage('ASSISTANCE_AUTH_PRESENTATION_READY' as never, new URL(frame.src).searchParams.get('assistanceAuthSessionId')!),
      }))
    } else if (action === 'close') sdk.close()
    else sdk.destroy()
    await vi.advanceTimersByTimeAsync(16000)
    expect(onError).not.toHaveBeenCalled()
    sdk.destroy()
    await vi.advanceTimersByTimeAsync(500)
  })

  it('adds expectsUiConfig and sends normalized ui config after iframe ready', async () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      ui: {
        themeColor: '#1677ff',
        texts: {
          idTitle: { text: '输入证件后四位', fontSize: '18px', color: '#111827', bold: true },
        },
        agreements: [
          { title: '《客户隐私政策》', url: 'https://merchant.example/privacy' },
        ],
      },
    })
    const promise = sdk.openVerification({ scene: 'native-number' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const postToFrame = vi.spyOn(iframe.contentWindow!, 'postMessage')

    expect(iframe.src).toContain('expectsUiConfig=1')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage('ASSISTANCE_AUTH_READY', sessionId),
    }))

    expect(postToFrame).toHaveBeenCalledWith({
      source: 'assistance-mobile-auth',
      type: ASSISTANCE_AUTH_CONFIG,
      sessionId,
      payload: {
        ui: {
          themeColor: '#1677ff',
          texts: {
            idTitle: { text: '输入证件后四位', fontSize: '18px', color: '#111827', bold: true },
          },
          agreements: [
            { title: '《客户隐私政策》', url: 'https://merchant.example/privacy' },
          ],
        },
      },
    }, 'https://ginkgo.chinaums.com')

    sdk.destroy()
  })

  it('posts STYLE and CONFIG before an external onReady callback throws', () => {
    const onReady = vi.fn(() => {
      throw new Error('ready callback failed')
    })
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      ui: { themeColor: '#1677ff' },
      onReady,
    })
    const promise = sdk.openVerification({ requestId: 'ready-throws' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const postToFrame = vi.spyOn(iframe.contentWindow!, 'postMessage')
    const messageListener = addEventListenerSpy.mock.calls.find(([type]) => type === 'message')?.[1]

    expect(messageListener).toEqual(expect.any(Function))
    expect(() => {
      ;(messageListener as EventListener)(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
      }))
    }).toThrow('ready callback failed')

    expect(postToFrame.mock.calls.map(([message]) => (message as { type?: string }).type)).toEqual([
      ASSISTANCE_AUTH_STYLE,
      ASSISTANCE_AUTH_CONFIG,
    ])
    expect(onReady).toHaveBeenCalledTimes(1)

    addEventListenerSpy.mockRestore()
    sdk.destroy()
  })

  it('posts STYLE and CONFIG before a reentrant onReady callback destroys the frame', async () => {
    let sdk: ReturnType<typeof createAssistanceMobileAuthSdk>
    const onReady = vi.fn(() => sdk.destroy())
    sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      ui: { themeColor: '#1677ff' },
      onReady,
    })
    const promise = sdk.openVerification({ requestId: 'ready-destroys' })
    const rejectionSpy = vi.fn()
    void promise.catch(rejectionSpy)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const postToFrame = vi.spyOn(iframe.contentWindow!, 'postMessage')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    expect(postToFrame.mock.calls.map(([message]) => (message as { type?: string }).type)).toEqual([
      ASSISTANCE_AUTH_STYLE,
      ASSISTANCE_AUTH_CONFIG,
    ])
    expect(onReady).toHaveBeenCalledTimes(1)
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
    await Promise.resolve()
    expect(rejectionSpy).toHaveBeenCalledTimes(1)
    expect(rejectionSpy.mock.calls[0]?.[0]).toEqual(new Error('Assistance auth destroyed'))
  })

  it('keeps READY delivery pinned to the frame and session that initiated it', async () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', ui: { themeColor: '#1677ff' } })
    const firstPromise = sdk.openVerification({ requestId: 'first-frame' })
    const firstRejectionSpy = vi.fn()
    const secondRejectionSpy = vi.fn()
    void firstPromise.catch(firstRejectionSpy)
    let secondPromise: Promise<unknown> | undefined

    const firstFrame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const firstSessionId = new URL(firstFrame.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const firstPost = vi.spyOn(firstFrame.contentWindow!, 'postMessage')
    let reentered = false
    firstPost.mockImplementation((message) => {
      if (!reentered && (message as { type?: string }).type === ASSISTANCE_AUTH_STYLE) {
        reentered = true
        secondPromise = sdk.openVerification({ requestId: 'second-frame' })
        void secondPromise.catch(secondRejectionSpy)
      }
    })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, firstSessionId),
    }))

    const configMessage = firstPost.mock.calls
      .map(([message]) => message as { type?: string; sessionId?: string })
      .find((message) => message.type === ASSISTANCE_AUTH_CONFIG)
    expect(configMessage?.sessionId).toBe(firstSessionId)

    const secondFrame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    expect(secondFrame).not.toBe(firstFrame)
    expect(new URL(secondFrame.src).searchParams.get('requestId')).toBe('second-frame')
    await Promise.resolve()
    expect(firstRejectionSpy).toHaveBeenCalledTimes(1)
    expect(firstRejectionSpy.mock.calls[0]?.[0]).toEqual(new Error('Assistance auth replaced'))
    sdk.destroy()
    await Promise.resolve()
    expect(secondPromise).toBeDefined()
    expect(secondRejectionSpy).toHaveBeenCalledTimes(1)
    expect(secondRejectionSpy.mock.calls[0]?.[0]).toEqual(new Error('Assistance auth destroyed'))
  })

  it('does not post CONFIG when ui is omitted', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    const promise = sdk.openVerification({ requestId: 'no-ui' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const postToFrame = vi.spyOn(iframe.contentWindow!, 'postMessage')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    expect(iframe.src).not.toContain('expectsUiConfig=1')
    expect(postToFrame.mock.calls.map(([message]) => (message as { type?: string }).type)).toEqual([
      ASSISTANCE_AUTH_STYLE,
    ])
    sdk.destroy()
  })

  it('advertises notification capability flags without putting callback code in the iframe', () => {
    const onBeforeLogin = vi.fn()
    const onStateChange = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      formHeaderImg: 'https://cdn.example.com/v23-header.png',
      onBeforeLogin,
      onStateChange,
    })
    const promise = sdk.openVerification({ requestId: 'before-login-style' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const iframeUrl = new URL(iframe.src)
    const sessionId = iframeUrl.searchParams.get('assistanceAuthSessionId') ?? ''
    const postToFrame = vi.spyOn(iframe.contentWindow!, 'postMessage')

    expect(iframeUrl.searchParams.get('assistanceAuthParentOrigin')).toBe(window.location.origin)
    expect(iframe.src).not.toContain('onBeforeLogin')
    expect(iframe.src).not.toContain('v23-header')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleMessage = postToFrame.mock.calls
      .map(([message]) => message as {
        type?: string
        payload?: Record<string, unknown>
      })
      .find((message) => message.type === ASSISTANCE_AUTH_STYLE)

    expect(styleMessage?.payload).toEqual(expect.objectContaining({
      beforeLoginNotificationEnabled: true,
      stateChangeEnabled: true,
      formHeaderImg: 'https://cdn.example.com/v23-header.png',
    }))
    expect(styleMessage?.payload).not.toHaveProperty('onBeforeLogin')
    expect(styleMessage?.payload).not.toHaveProperty('onStateChange')

    sdk.destroy()
  })

  it('notifies state change before onBeforeLogin on idLast4 completion without exposing sensitive payload fields', () => {
    const calls: string[] = []
    const onBeforeLogin = vi.fn(() => {
      calls.push('before-login')
      return { preventLogin: true }
    })
    const onStateChange = vi.fn((event) => {
      calls.push(`state:${event.type}`)
      return Promise.resolve('ignored')
    })
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      onBeforeLogin,
      onStateChange,
    })
    const promise = sdk.openVerification({ requestId: 'notification-complete' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const postToFrame = vi.spyOn(iframe.contentWindow!, 'postMessage')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: iframe.contentWindow,
      data: createAssistanceAuthMessage(
        ASSISTANCE_AUTH_STATE_CHANGE,
        sessionId,
        {
          event: {
            type: 'idLast4Complete',
            idLast4: '1234',
            mobile: '13800000000',
            token: 'secret',
            protocolAccepted: true,
            provider: { private: true },
          },
        },
      ),
    }))

    expect(onBeforeLogin).toHaveBeenCalledOnce()
    expect(onStateChange).toHaveBeenCalledWith({ type: 'idLast4Complete' })
    expect(calls).toEqual(['state:idLast4Complete', 'before-login'])
    expect(postToFrame).not.toHaveBeenCalled()

    sdk.destroy()
  })

  it('only sends incomplete state-change notifications to onStateChange', () => {
    const onBeforeLogin = vi.fn()
    const onStateChange = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      onBeforeLogin,
      onStateChange,
    })
    const promise = sdk.openVerification({ requestId: 'notification-incomplete' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: iframe.contentWindow,
      data: createAssistanceAuthMessage(
        ASSISTANCE_AUTH_STATE_CHANGE,
        sessionId,
        { event: { type: 'idLast4Incomplete' } },
      ),
    }))

    expect(onStateChange).toHaveBeenCalledWith({ type: 'idLast4Incomplete' })
    expect(onBeforeLogin).not.toHaveBeenCalled()
    sdk.destroy()
  })

  it('isolates notification returns, throws, and rejections without settling the flow', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      onBeforeLogin: () => Promise.reject(new Error('before-login rejection')),
      onStateChange: () => { throw new Error('state failure') },
    })
    const promise = sdk.openVerification({ requestId: 'notification-errors' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: iframe.contentWindow,
      data: createAssistanceAuthMessage(
        ASSISTANCE_AUTH_STATE_CHANGE,
        sessionId,
        { event: { type: 'idLast4Complete' } },
      ),
    }))
    await Promise.resolve()
    await Promise.resolve()

    expect(warnSpy).toHaveBeenCalledWith(
      '[AssistanceMobileAuth] onStateChange failed; notification was ignored.',
    )
    expect(warnSpy).toHaveBeenCalledWith(
      '[AssistanceMobileAuth] onBeforeLogin failed; notification was ignored.',
    )
    expect(document.querySelector('iframe[data-assistance-auth-frame="true"]')).toBe(iframe)

    sdk.destroy()
    warnSpy.mockRestore()
  })

  it('ignores state notifications from wrong origin, source, session, and settled sessions', () => {
    const onStateChange = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      onStateChange,
    })
    const promise = sdk.openVerification({ requestId: 'notification-lifecycle' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const stateMessage = createAssistanceAuthMessage(
      ASSISTANCE_AUTH_STATE_CHANGE,
      sessionId,
      { event: { type: 'idLast4Complete' } },
    )

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://other.example',
      source: iframe.contentWindow,
      data: stateMessage,
    }))
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: window,
      data: stateMessage,
    }))
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: iframe.contentWindow,
      data: createAssistanceAuthMessage(
        ASSISTANCE_AUTH_STATE_CHANGE,
        'wrong-session',
        { event: { type: 'idLast4Complete' } },
      ),
    }))

    expect(onStateChange).not.toHaveBeenCalled()
    sdk.close()
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      source: iframe.contentWindow,
      data: stateMessage,
    }))
    expect(onStateChange).not.toHaveBeenCalled()
  })

  it('does not advertise state-change capabilities when callbacks are absent', () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      formHeaderImg: 'javascript:alert(1)',
    })
    const promise = sdk.openVerification({ requestId: 'before-login-absent' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId') ?? ''
    const postToFrame = vi.spyOn(iframe.contentWindow!, 'postMessage')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleMessage = postToFrame.mock.calls
      .map(([message]) => message as {
        type?: string
        payload?: Record<string, unknown>
      })
      .find((message) => message.type === ASSISTANCE_AUTH_STYLE)
    expect(styleMessage?.payload).toEqual(expect.objectContaining({
      beforeLoginNotificationEnabled: false,
      stateChangeEnabled: false,
    }))
    expect(styleMessage?.payload).not.toHaveProperty('formHeaderImg')

    sdk.destroy()
  })

  it('does not add expectsUiConfig when all ui fields are invalid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      ui: {
        themeColor: 'red',
        agreements: [{ title: '《坏协议》', url: 'javascript:alert(1)' }],
      },
    })
    const promise = sdk.openVerification({ scene: 'native-number' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!

    expect(iframe.src).not.toContain('expectsUiConfig=1')
    expect(warnSpy).toHaveBeenCalledWith(
      '[AssistanceMobileAuth] Ignored invalid ui config at themeColor: Expected #RGB or #RRGGBB.',
    )

    sdk.destroy()
    warnSpy.mockRestore()
  })

  it('applies numeric and string auth window height options to the visible iframe', () => {
    const numericSdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      authWindowHeight: 620,
      authWindowMaxHeight: 760,
    })
    const numericPromise = numericSdk.openVerification({ requestId: 'height-number' })
    void numericPromise.catch(() => undefined)

    const numericFrame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    expect(numericFrame).toHaveStyle({ height: '620px', maxHeight: '760px' })
    numericSdk.destroy()

    const stringSdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      authWindowHeight: '80vh',
      authWindowMaxHeight: '90dvh',
    })
    const stringPromise = stringSdk.openVerification({ requestId: 'height-string' })
    void stringPromise.catch(() => undefined)

    const stringFrame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    expect(stringFrame).toHaveStyle({ height: '80vh', maxHeight: '90dvh' })
    stringSdk.destroy()
  })

  it('uses the locked transparent viewport modal only for the exact V23 appId', () => {
    const viewport = new EventTarget() as VisualViewport
    Object.defineProperties(viewport, {
      height: { value: 667, writable: true, configurable: true },
      offsetTop: { value: 12, writable: true, configurable: true },
    })
    const originalViewport = window.visualViewport
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: '  8a9481c79c05c8bd019f6f42956924a0  ',
        authWindowHeight: '50px',
        authWindowHeightMode: 'auto',
        authWindowMaxHeight: '60px',
      })
      const promise = sdk.openVerification({ requestId: 'v23-viewport-modal' })
      void promise.catch(() => undefined)

      const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
      const layer = document.querySelector<HTMLDivElement>('[data-assistance-auth-viewport-modal="true"]')!
      const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId')!

      expect(layer).toHaveStyle({ position: 'fixed', top: '12px', height: '667px' })
      expect(iframe).toHaveStyle({
        height: '100%',
        maxHeight: 'none',
        borderRadius: '0',
        background: 'transparent',
        boxShadow: 'none',
      })
      expect(iframe.style.transform).toBe('')

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 99 }),
      }))
      expect(iframe.style.height).toBe('100%')

      Object.defineProperties(viewport, {
        height: { value: 510, writable: true, configurable: true },
        offsetTop: { value: 24, writable: true, configurable: true },
      })
      viewport.dispatchEvent(new Event('resize'))
      expect(layer).toHaveStyle({ top: '24px', height: '510px' })
      sdk.close()
      sdk.destroy()
    } finally {
      Object.defineProperty(window, 'visualViewport', { value: originalViewport, configurable: true })
    }

    const nonTargetSdk = createAssistanceMobileAuthSdk({
      appId: '8a9481c79c05c8bd019f6f42956924a1',
      authWindowHeight: '50px',
      authWindowMaxHeight: '60px',
    })
    const nonTargetPromise = nonTargetSdk.openVerification({ requestId: 'v23-non-target-parity' })
    void nonTargetPromise.catch(() => undefined)
    const nonTargetFrame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')!
    expect(nonTargetFrame).toHaveStyle({
      height: '50px',
      maxHeight: '60px',
      borderRadius: '24px 24px 0 0',
      background: 'rgb(255, 255, 255)',
      boxShadow: '0 -16px 40px rgba(15,23,42,0.18)',
    })
    nonTargetSdk.destroy()
  })

  it('uses innerHeight, 100dvh, then 100vh as the ordered V23 viewport fallbacks', () => {
    const viewport = new EventTarget() as VisualViewport
    const originalViewport = window.visualViewport
    const originalInnerHeight = window.innerHeight
    const originalCss = globalThis.CSS
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })

    try {
      for (const {
        innerHeight,
        supportsDvh,
        expectedHeight,
      } of [
        { innerHeight: 731, supportsDvh: true, expectedHeight: '731px' },
        { innerHeight: 0, supportsDvh: true, expectedHeight: '100dvh' },
        { innerHeight: 0, supportsDvh: false, expectedHeight: '100vh' },
      ]) {
        Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true })
        vi.stubGlobal('CSS', { supports: vi.fn(() => supportsDvh) })
        const sdk = createAssistanceMobileAuthSdk({ appId: '8a9481c79c05c8bd019f6f42956924a0' })
        const promise = sdk.openVerification({ requestId: `v23-fallback-${expectedHeight}` })
        void promise.catch(() => undefined)

        const layer = document.querySelector<HTMLDivElement>('[data-assistance-auth-viewport-modal="true"]')!
        expect(layer.style.height).toBe(expectedHeight)
        expect(layer.style.top).toBe('0px')
        sdk.destroy()
      }
    } finally {
      vi.stubGlobal('CSS', originalCss)
      Object.defineProperty(window, 'visualViewport', { value: originalViewport, configurable: true })
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
    }
  })

  it('releases the exact V23 viewport listeners on replace and close', () => {
    const viewport = new EventTarget() as VisualViewport
    Object.defineProperties(viewport, {
      height: { value: 667, configurable: true },
      offsetTop: { value: 0, configurable: true },
    })
    const addSpy = vi.spyOn(viewport, 'addEventListener')
    const removeSpy = vi.spyOn(viewport, 'removeEventListener')
    const windowRemoveSpy = vi.spyOn(window, 'removeEventListener')
    const originalViewport = window.visualViewport
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({ appId: '8a9481c79c05c8bd019f6f42956924a0' })
      const firstPromise = sdk.openVerification({ requestId: 'v23-listener-replaced' })
      void firstPromise.catch(() => undefined)
      const firstResize = addSpy.mock.calls.find(([type]) => type === 'resize')?.[1]
      const firstScroll = addSpy.mock.calls.find(([type]) => type === 'scroll')?.[1]

      const secondPromise = sdk.openVerification({ requestId: 'v23-listener-closed' })
      void secondPromise.catch(() => undefined)
      expect(removeSpy).toHaveBeenCalledWith('resize', firstResize)
      expect(removeSpy).toHaveBeenCalledWith('scroll', firstScroll)

      const secondResize = addSpy.mock.calls.filter(([type]) => type === 'resize').at(-1)?.[1]
      const secondScroll = addSpy.mock.calls.filter(([type]) => type === 'scroll').at(-1)?.[1]
      sdk.close()
      expect(removeSpy).toHaveBeenCalledWith('resize', secondResize)
      expect(removeSpy).toHaveBeenCalledWith('scroll', secondScroll)
      sdk.destroy()
      expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    } finally {
      windowRemoveSpy.mockRestore()
      Object.defineProperty(window, 'visualViewport', { value: originalViewport, configurable: true })
    }
  })

  it('falls back for invalid auth window height values and rejects hostile CSS strings', () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      authWindowHeight: 'calc(100dvh - url(https://evil.example/x))',
      authWindowMaxHeight: 'var(--bad)',
    } as Parameters<typeof createAssistanceMobileAuthSdk>[0])

    const promise = sdk.openVerification({ requestId: 'bad-height' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    expect(iframe).toHaveStyle({ height: '92vh', maxHeight: '820px' })
    sdk.destroy()
  })

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('falls back for invalid numeric authWindowHeight %s', (authWindowHeight) => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      authWindowHeight,
      authWindowMaxHeight: authWindowHeight,
    } as Parameters<typeof createAssistanceMobileAuthSdk>[0])

    const promise = sdk.openVerification({ requestId: 'bad-numeric-height' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    expect(iframe).toHaveStyle({ height: '92vh', maxHeight: '820px' })
    sdk.destroy()
  })

  it('defaults to locked height and ignores RESIZE messages from the iframe', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    const promise = sdk.openVerification({ requestId: 'locked-height' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const frameWindow = iframe?.contentWindow
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''
    const postSpy = vi.spyOn(frameWindow as Window, 'postMessage')

    expect(iframe).toHaveStyle({ height: '92vh', maxHeight: '820px' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleCall = postSpy.mock.calls.find(
      (call) => (call[0] as { type?: string } | undefined)?.type === ASSISTANCE_AUTH_STYLE,
    )
    const payload = (styleCall?.[0] as Record<string, unknown>).payload as Record<string, unknown>
    expect(payload.iframeOptions).toEqual({ closable: true, useCustomKeyboard: true, heightMode: 'fixed' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, { height: 568.2 }),
    }))

    expect(iframe).toHaveStyle({ height: '92vh', maxHeight: '820px' })
    sdk.destroy()
  })

  it('ignores keyboard resize metadata in default locked-height mode', () => {
    const originalInnerHeight = window.innerHeight
    const originalVisualViewport = window.visualViewport
    const visualViewport = {
      height: 500,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(window, 'visualViewport', { value: visualViewport, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
      const promise = sdk.openVerification({ requestId: 'locked-height-keyboard' })
      void promise.catch(() => undefined)

      const shell = document.getElementById('assistance-mobile-auth-frame-shell')
      const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
      const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

      expect(visualViewport.addEventListener).not.toHaveBeenCalled()

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
          height: 620,
          keyboardFocused: true,
        }),
      }))

      expect(iframe).toHaveStyle({ height: '92vh', maxHeight: '820px' })
      expect(shell?.style.transform).toBe('')
      sdk.destroy()
    } finally {
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
      Object.defineProperty(window, 'visualViewport', { value: originalVisualViewport, configurable: true })
    }
  })

  it('uses auto height mode when explicitly requested and applies RESIZE messages', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', authWindowHeightMode: 'auto' })
    const promise = sdk.openVerification({ requestId: 'auto-height-mode' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const frameWindow = iframe?.contentWindow
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''
    const postSpy = vi.spyOn(frameWindow as Window, 'postMessage')

    expect(iframe).toHaveStyle({ height: '420px', maxHeight: '820px' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleCall = postSpy.mock.calls.find(
      (call) => (call[0] as { type?: string } | undefined)?.type === ASSISTANCE_AUTH_STYLE,
    )
    const payload = (styleCall?.[0] as Record<string, unknown>).payload as Record<string, unknown>
    expect(payload.iframeOptions).toEqual({ closable: true, useCustomKeyboard: true, heightMode: 'auto' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
        height: 520,
      }),
    }))

    expect(iframe).toHaveStyle({ height: '520px', maxHeight: '820px' })
    sdk.destroy()
  })

  it('moves auto-height iframe on a separate positioning layer without overwriting frame animation', async () => {
    vi.useFakeTimers()
    const originalVisualViewport = window.visualViewport
    const originalInnerHeight = window.innerHeight
    const viewport = new EventTarget() as VisualViewport
    Object.defineProperties(viewport, {
      height: { value: 500, configurable: true },
      offsetTop: { value: 0, configurable: true },
    })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
        useCustomKeyboard: false,
      })
      const promise = sdk.openVerification({ requestId: 'ios-keyboard-overlap' })
      void promise.catch(() => undefined)

      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const layer = document.querySelector<HTMLDivElement>(
        '[data-assistance-auth-positioning-layer="true"]',
      )!
      const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId')!
      await vi.advanceTimersByTimeAsync(40)
      let appliedShift = 0
      vi.spyOn(layer, 'getBoundingClientRect').mockImplementation(() => {
        const match = layer.style.transform.match(/-(\d+)px/)
        appliedShift = match ? Number(match[1]) : 0
        return {
          x: 0,
          y: 0,
          top: 0,
          right: 390,
          bottom: 844 - appliedShift,
          left: 0,
          width: 390,
          height: Number.parseFloat(iframe.style.height),
          toJSON: () => ({}),
        }
      })

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
          height: 620,
          keyboardFocused: true,
        }),
      }))
      vi.runOnlyPendingTimers()

      expect(layer.parentElement).toBe(document.getElementById('assistance-mobile-auth-frame-shell'))
      expect(iframe.parentElement).toBe(layer)
      expect(iframe.style.height).toBe('488px')
      expect(layer.style.transform).toBe('translate3d(0, -344px, 0)')
      expect(iframe.style.transform).toBe('translateY(0)')
      expect(iframe.style.transform).not.toBe(layer.style.transform)

      viewport.dispatchEvent(new Event('resize'))
      vi.runOnlyPendingTimers()
      expect(layer.style.transform).toBe('translate3d(0, -344px, 0)')
      sdk.destroy()
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        value: originalVisualViewport,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
    }
  })

  it('iOS 系统键盘模式在打开 iframe 的同步调用栈中聚焦激活输入', () => {
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(navigator, 'userAgent')
    const platformDescriptor = Object.getOwnPropertyDescriptor(navigator, 'platform')
    const maxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')

    Object.defineProperties(navigator, {
      userAgent: {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      },
      platform: { value: 'iPhone', configurable: true },
      maxTouchPoints: { value: 5, configurable: true },
    })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
        useCustomKeyboard: false,
      })
      const promise = sdk.openVerification({ requestId: 'ios-native-keyboard-prime' })
      void promise.catch(() => undefined)

      const activator = document.querySelector<HTMLInputElement>(
        'input[data-assistance-auth-keyboard-activator="true"]',
      )
      expect(activator).not.toBeNull()
      expect(document.activeElement).toBe(activator)

      sdk.destroy()
    } finally {
      if (userAgentDescriptor) {
        Object.defineProperty(navigator, 'userAgent', userAgentDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'userAgent')
      }
      if (platformDescriptor) {
        Object.defineProperty(navigator, 'platform', platformDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'platform')
      }
      if (maxTouchPointsDescriptor) {
        Object.defineProperty(navigator, 'maxTouchPoints', maxTouchPointsDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'maxTouchPoints')
      }
    }
  })

  it('iOS 固定高度模式不创建键盘激活输入且不抢占现有焦点', () => {
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(navigator, 'userAgent')
    const platformDescriptor = Object.getOwnPropertyDescriptor(navigator, 'platform')
    const maxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')
    const focusSentinel = document.createElement('input')
    document.body.appendChild(focusSentinel)
    focusSentinel.focus()

    Object.defineProperties(navigator, {
      userAgent: {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      },
      platform: { value: 'iPhone', configurable: true },
      maxTouchPoints: { value: 5, configurable: true },
    })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeight: '560px',
        useCustomKeyboard: false,
      })
      const promise = sdk.openVerification({ requestId: 'ios-fixed-height-no-keyboard-prime' })
      void promise.catch(() => undefined)

      expect(document.querySelector(
        'input[data-assistance-auth-keyboard-activator="true"]',
      )).toBeNull()
      expect(document.activeElement).toBe(focusSentinel)

      sdk.destroy()
    } finally {
      if (userAgentDescriptor) {
        Object.defineProperty(navigator, 'userAgent', userAgentDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'userAgent')
      }
      if (platformDescriptor) {
        Object.defineProperty(navigator, 'platform', platformDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'platform')
      }
      if (maxTouchPointsDescriptor) {
        Object.defineProperty(navigator, 'maxTouchPoints', maxTouchPointsDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'maxTouchPoints')
      }
    }
  })

  it('keeps the loading iframe above an iOS keyboard before the child input is ready', () => {
    vi.useFakeTimers()
    const userAgentDescriptor = Object.getOwnPropertyDescriptor(navigator, 'userAgent')
    const platformDescriptor = Object.getOwnPropertyDescriptor(navigator, 'platform')
    const maxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')
    const originalVisualViewport = window.visualViewport
    const originalInnerHeight = window.innerHeight
    let visualViewportHeight = 844
    const viewport = new EventTarget() as VisualViewport
    Object.defineProperties(viewport, {
      height: { configurable: true, get: () => visualViewportHeight },
      offsetTop: { value: 0, configurable: true },
    })
    Object.defineProperties(navigator, {
      userAgent: {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      },
      platform: { value: 'iPhone', configurable: true },
      maxTouchPoints: { value: 5, configurable: true },
    })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
        useCustomKeyboard: false,
      })
      const promise = sdk.openVerification({ requestId: 'ios-loading-keyboard-overlap' })
      void promise.catch(() => undefined)

      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const layer = document.querySelector<HTMLDivElement>(
        '[data-assistance-auth-positioning-layer="true"]',
      )!
      vi.spyOn(layer, 'getBoundingClientRect').mockImplementation(() => {
        const match = layer.style.transform.match(/-(\d+)px/)
        const appliedShift = match ? Number(match[1]) : 0
        return {
          x: 0,
          y: 424 - appliedShift,
          top: 424 - appliedShift,
          right: 390,
          bottom: 844 - appliedShift,
          left: 0,
          width: 390,
          height: 420,
          toJSON: () => ({}),
        }
      })
      vi.spyOn(iframe, 'getBoundingClientRect').mockImplementation(() => {
        const match = layer.style.transform.match(/-(\d+)px/)
        const appliedShift = match ? Number(match[1]) : 0
        const enterTransformShift = iframe.style.transform === 'translateY(100%)' ? 420 : 0
        return {
          x: 0,
          y: 844 - Number.parseFloat(iframe.style.height) - appliedShift + enterTransformShift,
          top: 844 - Number.parseFloat(iframe.style.height) - appliedShift + enterTransformShift,
          right: 390,
          bottom: 844 - appliedShift + enterTransformShift,
          left: 0,
          width: 390,
          height: Number.parseFloat(iframe.style.height),
          toJSON: () => ({}),
        }
      })

      visualViewportHeight = 500
      viewport.dispatchEvent(new Event('resize'))
      vi.runOnlyPendingTimers()

      expect(iframe.style.height).toBe('420px')
      expect(iframe.style.transform).toBe('translateY(100%)')
      expect(layer.style.transform).toBe('translate3d(0, -344px, 0)')
      sdk.destroy()
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        value: originalVisualViewport,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
      if (userAgentDescriptor) {
        Object.defineProperty(navigator, 'userAgent', userAgentDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'userAgent')
      }
      if (platformDescriptor) {
        Object.defineProperty(navigator, 'platform', platformDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'platform')
      }
      if (maxTouchPointsDescriptor) {
        Object.defineProperty(navigator, 'maxTouchPoints', maxTouchPointsDescriptor)
      } else {
        Reflect.deleteProperty(navigator, 'maxTouchPoints')
      }
    }
  })

  it('destroy clears keyboard positioning listeners and removes the layer', () => {
    vi.useFakeTimers()
    const originalVisualViewport = window.visualViewport
    const viewport = new EventTarget() as VisualViewport
    const removeSpy = vi.spyOn(viewport, 'removeEventListener')
    Object.defineProperties(viewport, {
      height: { value: 500, configurable: true },
      offsetTop: { value: 0, configurable: true },
    })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
      })
      const promise = sdk.openVerification({ requestId: 'cleanup-keyboard-layer' })
      void promise.catch(() => undefined)
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId')!

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
          height: 620,
          keyboardFocused: true,
        }),
      }))
      sdk.destroy()

      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(document.querySelector(
        '[data-assistance-auth-positioning-layer="true"]',
      )).toBeNull()
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        value: originalVisualViewport,
        configurable: true,
      })
    }
  })

  it('rejects a directly replaced session exactly once while the replacement remains responsive', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const onCancel = vi.fn()
    const onError = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      authWindowHeightMode: 'auto',
      onClose,
      onCancel,
      onError,
    })
    const promiseA = sdk.openVerification({ requestId: 'direct-replace-a' })
    const rejectionA = vi.fn()
    void promiseA.catch(rejectionA)
    const frameA = document.querySelector<HTMLIFrameElement>(
      'iframe[data-assistance-auth-frame="true"]',
    )!
    const sessionA = new URL(frameA.src).searchParams.get('assistanceAuthSessionId')!

    const promiseB = sdk.openVerification({ requestId: 'direct-replace-b' })
    const frameB = document.querySelector<HTMLIFrameElement>(
      'iframe[data-assistance-auth-frame="true"]',
    )!
    const sessionB = new URL(frameB.src).searchParams.get('assistanceAuthSessionId')!
    await Promise.resolve()

    expect(rejectionA).toHaveBeenCalledTimes(1)
    expect(rejectionA.mock.calls[0]?.[0]).toEqual(new Error('Assistance auth replaced'))
    expect(frameA.isConnected).toBe(false)
    expect(frameB.isConnected).toBe(true)
    expect(document.querySelectorAll('#assistance-mobile-auth-frame-shell')).toHaveLength(1)

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR, sessionA, {
        code: 'STALE_ERROR',
        message: 'stale',
      }),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionB, { height: 520 }),
    }))
    expect(frameB.style.height).toBe('520px')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, sessionB, {
        status: 'success',
        token: 'sdk-token-b',
        idLast4: '1234',
        keyA: 'sdk-key-b',
        message: '验证完成',
      }),
    }))
    await vi.advanceTimersByTimeAsync(400)

    await expect(promiseB).resolves.toMatchObject({
      status: 'success',
      token: 'sdk-token-b',
      idLast4: '1234',
      keyA: 'sdk-key-b',
    })
    expect(rejectionA).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('rejects a destroyed session exactly once and removes its active resources', async () => {
    vi.useFakeTimers()
    const originalVisualViewport = window.visualViewport
    const viewport = new EventTarget() as VisualViewport
    const removeSpy = vi.spyOn(viewport, 'removeEventListener')
    Object.defineProperties(viewport, {
      height: { value: 500, configurable: true },
      offsetTop: { value: 0, configurable: true },
    })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })

    try {
      const onClose = vi.fn()
      const onCancel = vi.fn()
      const onError = vi.fn()
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
        onClose,
        onCancel,
        onError,
      })
      const promise = sdk.openVerification({ requestId: 'direct-destroy' })
      const rejectionSpy = vi.fn()
      void promise.catch(rejectionSpy)
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId')!

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
          height: 620,
          keyboardFocused: true,
        }),
      }))
      vi.runOnlyPendingTimers()
      sdk.destroy()
      await Promise.resolve()

      expect(rejectionSpy).toHaveBeenCalledTimes(1)
      expect(rejectionSpy.mock.calls[0]?.[0]).toEqual(new Error('Assistance auth destroyed'))
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
      expect(document.querySelector('[data-assistance-auth-positioning-layer="true"]')).toBeNull()

      sdk.destroy()
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR, sessionId, {
          code: 'STALE_ERROR',
          message: 'stale',
        }),
      }))
      await Promise.resolve()
      expect(rejectionSpy).toHaveBeenCalledTimes(1)
      expect(onClose).not.toHaveBeenCalled()
      expect(onCancel).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        value: originalVisualViewport,
        configurable: true,
      })
    }
  })

  it('keeps session B alive when session A finishes a stale exit animation', async () => {
    vi.useFakeTimers()
    const originalVisualViewport = window.visualViewport
    const originalInnerHeight = window.innerHeight
    const viewport = new EventTarget() as VisualViewport
    const removeSpy = vi.spyOn(viewport, 'removeEventListener')
    Object.defineProperties(viewport, {
      height: { value: 500, configurable: true },
      offsetTop: { value: 0, configurable: true },
    })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })

    try {
      const onPhoneReady = vi.fn()
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
        onPhoneReady,
      })
      const promiseA = sdk.openVerification({ requestId: 'stale-exit-a' })
      void promiseA.catch(() => undefined)
      const frameA = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const sessionA = new URL(frameA.src).searchParams.get('assistanceAuthSessionId')!

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionA, {
          height: 620,
          keyboardFocused: true,
        }),
      }))
      vi.runOnlyPendingTimers()
      sdk.close()

      const promiseB = sdk.openVerification({ requestId: 'stale-exit-b' })
      let promiseBSettled = false
      void promiseB.then(
        () => {
          promiseBSettled = true
        },
        () => {
          promiseBSettled = true
        },
      )
      const frameB = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const layerB = document.querySelector<HTMLDivElement>(
        '[data-assistance-auth-positioning-layer="true"]',
      )!
      const sessionB = new URL(frameB.src).searchParams.get('assistanceAuthSessionId')!
      let appliedShift = 0
      vi.spyOn(layerB, 'getBoundingClientRect').mockImplementation(() => {
        const match = layerB.style.transform.match(/-(\d+)px/)
        appliedShift = match ? Number(match[1]) : 0
        return {
          x: 0,
          y: 0,
          top: 0,
          right: 390,
          bottom: 844 - appliedShift,
          left: 0,
          width: 390,
          height: Number.parseFloat(frameB.style.height),
          toJSON: () => ({}),
        }
      })

      await vi.advanceTimersByTimeAsync(400)

      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(document.querySelectorAll('#assistance-mobile-auth-frame-shell')).toHaveLength(1)
      expect(document.querySelectorAll('[data-assistance-auth-positioning-layer="true"]')).toHaveLength(1)
      expect(document.querySelectorAll('iframe[data-assistance-auth-frame="true"]')).toHaveLength(1)
      expect(document.querySelector('iframe[data-assistance-auth-frame="true"]')).toBe(frameB)
      expect(frameA.isConnected).toBe(false)
      expect(promiseBSettled).toBe(false)

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PHONE_READY, sessionA, {
          maskedMobile: '138****0000',
          source: 'ydrzPhoneControl',
        }),
      }))
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PHONE_READY, sessionB, {
          maskedMobile: '138****1234',
          source: 'ydrzPhoneControl',
        }),
      }))
      expect(onPhoneReady).toHaveBeenCalledTimes(1)
      expect(onPhoneReady).toHaveBeenCalledWith({
        maskedMobile: '138****1234',
        rawText: '138****1234',
        source: 'ydrzPhoneControl',
      })

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionB, {
          height: 620,
          keyboardFocused: true,
        }),
      }))
      vi.runOnlyPendingTimers()
      expect(frameB.style.height).toBe('488px')
      expect(layerB.style.transform).toBe('translate3d(0, -344px, 0)')
      sdk.destroy()
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        value: originalVisualViewport,
        configurable: true,
      })
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
    }
  })

  it('cleans keyboard positioning resources after an animated close', async () => {
    vi.useFakeTimers()
    const originalVisualViewport = window.visualViewport
    const viewport = new EventTarget() as VisualViewport
    const removeSpy = vi.spyOn(viewport, 'removeEventListener')
    Object.defineProperties(viewport, {
      height: { value: 500, configurable: true },
      offsetTop: { value: 0, configurable: true },
    })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
      })
      const promise = sdk.openVerification({ requestId: 'animated-close-cleanup' })
      void promise.catch(() => undefined)
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId')!

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
          height: 620,
          keyboardFocused: true,
        }),
      }))
      vi.runOnlyPendingTimers()
      sdk.close()
      await vi.advanceTimersByTimeAsync(20)
      expect(iframe.style.transform).toBe('translateY(100%)')

      await vi.advanceTimersByTimeAsync(400)
      await expect(promise).rejects.toThrow('Assistance auth closed')
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
      expect(document.querySelector('[data-assistance-auth-positioning-layer="true"]')).toBeNull()
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        value: originalVisualViewport,
        configurable: true,
      })
    }
  })

  it('cleans keyboard positioning resources after a terminal error', async () => {
    vi.useFakeTimers()
    const originalVisualViewport = window.visualViewport
    const viewport = new EventTarget() as VisualViewport
    const removeSpy = vi.spyOn(viewport, 'removeEventListener')
    Object.defineProperties(viewport, {
      height: { value: 500, configurable: true },
      offsetTop: { value: 0, configurable: true },
    })
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true })

    try {
      const sdk = createAssistanceMobileAuthSdk({
        appId: 'test-app-id',
        authWindowHeightMode: 'auto',
      })
      const promise = sdk.openVerification({ requestId: 'terminal-error-cleanup' })
      void promise.catch(() => undefined)
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[data-assistance-auth-frame="true"]',
      )!
      const sessionId = new URL(iframe.src).searchParams.get('assistanceAuthSessionId')!

      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
          height: 620,
          keyboardFocused: true,
        }),
      }))
      vi.runOnlyPendingTimers()
      window.dispatchEvent(new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR, sessionId, {
          code: 'SESSION_RESOLVE_FAILED',
          message: '验证失败',
        }),
      }))

      await vi.advanceTimersByTimeAsync(400)
      await expect(promise).rejects.toThrow('Assistance auth error: 验证失败')
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
      expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
      expect(document.querySelector('[data-assistance-auth-positioning-layer="true"]')).toBeNull()
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        value: originalVisualViewport,
        configurable: true,
      })
    }
  })

  it('uses fixed height mode for explicit authWindowHeight and ignores RESIZE messages', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', authWindowHeight: 620 })
    const promise = sdk.openVerification({ requestId: 'fixed-height' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const frameWindow = iframe?.contentWindow
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''
    const postSpy = vi.spyOn(frameWindow as Window, 'postMessage')

    expect(iframe).toHaveStyle({ height: '620px', maxHeight: '820px' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleCall = postSpy.mock.calls.find(
      (call) => (call[0] as { type?: string } | undefined)?.type === ASSISTANCE_AUTH_STYLE,
    )
    const payload = (styleCall?.[0] as Record<string, unknown>).payload as Record<string, unknown>
    expect(payload.iframeOptions).toEqual({ closable: true, useCustomKeyboard: true, heightMode: 'fixed' })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, sessionId, {
        height: 480,
        keyboardFocused: true,
      }),
    }))

    expect(iframe).toHaveStyle({ height: '620px', maxHeight: '820px' })
    sdk.destroy()
  })

  it('sends iframeOptions on ready while leaving the iframe URL free of closable config', () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      closable: false,
      useCustomKeyboard: false,
    })

    const promise = sdk.openVerification({ requestId: 'iframe-options' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const frameWindow = iframe?.contentWindow
    const url = new URL(iframe?.src ?? '')
    const sessionId = url.searchParams.get('assistanceAuthSessionId') ?? ''
    expect(url.searchParams.has('closable')).toBe(false)

    const postSpy = vi.spyOn(frameWindow as Window, 'postMessage')
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleCall = postSpy.mock.calls.find(
      (call) => (call[0] as { type?: string } | undefined)?.type === ASSISTANCE_AUTH_STYLE,
    )
    const payload = (styleCall?.[0] as Record<string, unknown>).payload as Record<string, unknown>
    expect(payload.iframeOptions).toEqual({ closable: false, useCustomKeyboard: false, heightMode: 'fixed' })
    sdk.destroy()
  })

  it('rejects malformed iframe success payloads and forwards them to onError', async () => {
    vi.useFakeTimers()

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      onSuccess,
      onError,
    })

    const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-1' })
    void promise.catch(() => undefined)
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, sessionId, {
        status: 'success',
        token: 'sdk-token',
        idLast4: '1234',
      }),
    }))

    await vi.advanceTimersByTimeAsync(200)
    await vi.advanceTimersByTimeAsync(200)

    await expect(promise).rejects.toThrow('Assistance auth error: 验证结果返回异常，请稍后重试。')
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      code: 'INVALID_SUCCESS_PAYLOAD',
      message: '验证结果返回异常，请稍后重试。',
    })
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
  })

  it.each([
    ['missing status', { token: 'sdk-token', idLast4: '1234', keyA: 'sdk-key-a' }],
    ['wrong status', { status: 'failed', token: 'sdk-token', idLast4: '1234', keyA: 'sdk-key-a' }],
  ])('rejects %s iframe success payloads and forwards them to onError', async (_label, payload) => {
    vi.useFakeTimers()

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      onSuccess,
      onError,
    })

    const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-1' })
    void promise.catch(() => undefined)
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, sessionId, payload),
    }))

    await vi.advanceTimersByTimeAsync(200)
    await vi.advanceTimersByTimeAsync(200)

    await expect(promise).rejects.toThrow('Assistance auth error: 验证结果返回异常，请稍后重试。')
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      code: 'INVALID_SUCCESS_PAYLOAD',
      message: '验证结果返回异常，请稍后重试。',
    })
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
  })

  it('posts the sanitized styleOption into the iframe (targetOrigin pinned) once the iframe reports READY', () => {
    const sft = () => undefined
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      styleOption: {
        submitBtnStyle: { bgColor: '#0A66FF', name: '立即授权' },
        agreeStyle: {
          fontColor: '#475569',
          // 回调不可跨 postMessage —— wrapper 必须先剥函数再发。
          agreeArr: [{ name: '《服务协议》', link: 'https://example.com/s', customEvent: sft }],
        },
      },
    })

    const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-1' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const frameWindow = iframe?.contentWindow
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''
    expect(frameWindow).toBeTruthy()
    const postSpy = vi.spyOn(frameWindow as Window, 'postMessage')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleCall = postSpy.mock.calls.find(
      (call) => (call[0] as { type?: string } | undefined)?.type === ASSISTANCE_AUTH_STYLE,
    )
    expect(styleCall).toBeTruthy()
    const [message, targetOrigin] = styleCall as [Record<string, unknown>, string]
    expect(message.sessionId).toBe(sessionId)
    expect(targetOrigin).toBe('https://ginkgo.chinaums.com')
    // payload 包裹形态：{ styleOption, agreements, iframeOptions }
    const payload = message.payload as {
      styleOption: Record<string, unknown>
      agreements: unknown[]
      iframeOptions: unknown
    }
    expect(payload.styleOption.submitBtnStyle).toEqual({ bgColor: '#0A66FF', name: '立即授权' })
    // customEvent 函数已被剥掉，纯数据保留
    expect((payload.styleOption.agreeStyle as { agreeArr?: unknown }).agreeArr).toEqual([
      { name: '《服务协议》', link: 'https://example.com/s' },
    ])
    // 无 agreements 选项时为空数组
    expect(payload.agreements).toEqual([])
    expect(payload.iframeOptions).toEqual({ closable: true, useCustomKeyboard: true, heightMode: 'fixed' })

    sdk.destroy()
  })

  it('sends top/bottom images via the style postMessage, not the iframe URL (avoids Cloud WAF on embedded external URLs)', () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      styleOption: {
        submitBtnStyle: { bgColor: '#0A66FF' },
        topImageStyle: { src: 'https://cdn.example.com/top.png', height: '88px' },
        bottomImageStyle: { src: 'https://cdn.example.com/bottom.png' },
      },
    })

    const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-1' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    // iframe URL 不再带任何图片参数（外部 URL 嵌查询串会触发云 WAF）。
    expect(iframe?.src).not.toContain('topImage')
    expect(iframe?.src).not.toContain('bottomImage')
    expect(iframe?.src).not.toContain('cdn.example.com')

    const frameWindow = iframe?.contentWindow
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''
    const postSpy = vi.spyOn(frameWindow as Window, 'postMessage')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleCall = postSpy.mock.calls.find(
      (call) => (call[0] as { type?: string } | undefined)?.type === ASSISTANCE_AUTH_STYLE,
    )
    const payload = (styleCall as [Record<string, unknown>, string])[0].payload as {
      styleOption: Record<string, unknown>
    }
    // 图片随 styleOption 走 postMessage 透传。
    expect(payload.styleOption.topImageStyle).toEqual({ src: 'https://cdn.example.com/top.png', height: '88px' })
    expect(payload.styleOption.bottomImageStyle).toEqual({ src: 'https://cdn.example.com/bottom.png' })

    sdk.destroy()
  })

  it('openVerification posts caller agreements through the style message on ready', () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      verificationUrl: 'https://verify.example/verification',
      agreements: [
        { name: '《甲方协议》', link: 'https://x.example/a' },
        { name: 123 as unknown as string, link: 'https://x.example/bad' }, // 非法 name，应被净化掉
      ],
    } as Parameters<typeof createAssistanceMobileAuthSdk>[0])

    const promise = sdk.openVerification({ requestId: 'req-1' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const frameWindow = iframe?.contentWindow
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''
    expect(frameWindow).toBeTruthy()
    const postSpy = vi.spyOn(frameWindow as Window, 'postMessage')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, sessionId),
    }))

    const styleCall = postSpy.mock.calls.find(
      (call) => (call[0] as { type?: string } | undefined)?.type === ASSISTANCE_AUTH_STYLE,
    )
    expect(styleCall).toBeTruthy()
    const payload = (styleCall?.[0] as Record<string, unknown>).payload as Record<string, unknown>
    expect(payload.agreements).toEqual([{ name: '《甲方协议》', link: 'https://x.example/a' }])

    sdk.destroy()
  })

  it('uses dvh for the default locked height when the engine supports dynamic viewport units', () => {
    const originalCSS = globalThis.CSS
    // 测试桩：jsdom 的 CSS 无 supports，这里提供一个声明支持 dvh 的实现走 dvh 分支。
    Object.defineProperty(globalThis, 'CSS', { value: { supports: () => true }, configurable: true })
    try {
      const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
      const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-1' })
      void promise.catch(() => undefined)

      const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
      expect(iframe).toHaveStyle({ height: '92dvh', maxHeight: '820px' })
      sdk.destroy()
    } finally {
      Object.defineProperty(globalThis, 'CSS', { value: originalCSS, configurable: true })
    }
  })

  it('opens the verification iframe on the fixed public staging domain even when loaded from an IP script asset', () => {
    const script = document.createElement('script')
    script.src = 'http://47.95.5.18:12588/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.umd.js'
    document.head.appendChild(script)

    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-1' })

    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')

    expect(iframe?.src).toContain('https://ginkgo.chinaums.com/sign-pay-pro/verification')
    expect(iframe?.src).toContain('requestId=req-1')
    expect(iframe?.src).not.toContain('launchToken')

    sdk.destroy()
  })

  it.each([
    [ASSISTANCE_AUTH_CANCEL, 'Assistance auth cancelled'],
    [ASSISTANCE_AUTH_ERROR, 'Assistance auth error: 验证失败'],
    [ASSISTANCE_AUTH_CLOSE, 'Assistance auth closed'],
  ] as const)('rejects and cleans up iframe on %s', async (type, expectedMessage) => {
    const onCancel = vi.fn()
    const onError = vi.fn()
    const onClose = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      onCancel,
      onError,
      onClose,
    })
    const promise = sdk.openVerification()
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(type, sessionId, { message: '验证失败' }),
    }))

    await expect(promise).rejects.toThrow(expectedMessage)
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
  })

  it('forwards non-terminal ERROR_NOTICE to onErrorNotice without closing the iframe or settling the promise', async () => {
    const onErrorNotice = vi.fn()
    const onError = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', onErrorNotice, onError })
    const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-1' })
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    let settled = false
    void promise.then(
      () => {
        settled = true
      },
      () => {
        settled = true
      },
    )

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, sessionId, {
        code: '110031',
        message: '当前为非中国移动号码',
        phase: 'initControl',
        carrier: 'YD',
      }),
    }))

    await Promise.resolve()
    await Promise.resolve()

    // 通知透传给调用方；弹窗仍在、Promise 仍 pending（非终态）
    expect(onErrorNotice).toHaveBeenCalledWith({
      code: '110031',
      message: '当前为非中国移动号码',
      phase: 'initControl',
      carrier: 'YD',
    })
    expect(onError).not.toHaveBeenCalled()
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()
    expect(settled).toBe(false)

    // 之后的 SUCCESS 仍正常 resolve（通知不改变终态语义）
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, sessionId, {
        status: 'success',
        token: 'sdk-token',
        idLast4: '1234',
        keyA: 'sdk-key-a',
        message: '验证完成',
        mock: true,
        displayName: 'Ada Lovelace',
        mobile: '13800000000',
        idCard: '110101199001011234',
        encryptedName: 'ENCRYPTED',
      }),
    }))

    const result = await promise
    expect(result).toMatchObject({
      status: 'success',
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
      message: '验证完成',
      mock: true,
    })
    expect(result).not.toHaveProperty('displayName')
    expect(result).not.toHaveProperty('mobile')
    expect(result).not.toHaveProperty('idCard')
    expect(result).not.toHaveProperty('encryptedName')
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
  })

  it('calls onPhoneReady from a matching iframe PHONE_READY message without settling the open promise', async () => {
    vi.useFakeTimers()
    const onPhoneReady = vi.fn()
    const onSuccess = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', onPhoneReady, onSuccess })

    const promise = sdk.openVerification({ scene: 'native-number', requestId: 'req-phone' })
    void promise.catch(() => undefined)

    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PHONE_READY, sessionId, {
        maskedMobile: '138****1234',
        rawText: '用于验证 138****1234 的实名信息',
        source: 'ydrzPhoneControl',
      }),
    }))

    expect(onPhoneReady).toHaveBeenCalledWith({
      maskedMobile: '138****1234',
      rawText: '用于验证 138****1234 的实名信息',
      source: 'ydrzPhoneControl',
    })
    expect(onSuccess).not.toHaveBeenCalled()
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()

    sdk.close()
    await vi.advanceTimersByTimeAsync(400)
    await expect(promise).rejects.toThrow('Assistance auth closed')
  })

  it('still auto-closes on terminal ERROR after a prior ERROR_NOTICE (regression guard)', async () => {
    const onErrorNotice = vi.fn()
    const onError = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', onErrorNotice, onError })
    const promise = sdk.openVerification()
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, sessionId, { code: '110031', message: '验证失败' }),
    }))
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR, sessionId, { code: 'SESSION_RESOLVE_FAILED', message: '验证失败' }),
    }))

    await expect(promise).rejects.toThrow('Assistance auth error: 验证失败')
    expect(onErrorNotice).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith({ code: 'SESSION_RESOLVE_FAILED', message: '验证失败' })
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
  })

  it('drops an ERROR_NOTICE that arrives after the flow has settled (close-animation window)', async () => {
    const onErrorNotice = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', onErrorNotice })
    const promise = sdk.openVerification()
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame="true"]')
    const sessionId = new URL(iframe?.src ?? '').searchParams.get('assistanceAuthSessionId') ?? ''

    // 先到终态 ERROR（settled=true，进入关闭动画），紧跟着一条迟到的通知
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR, sessionId, { code: 'SESSION_RESOLVE_FAILED', message: '验证失败' }),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://ginkgo.chinaums.com',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, sessionId, { code: 'NETWORK_TIMEOUT', message: '资源加载超时' }),
    }))

    await expect(promise).rejects.toThrow('Assistance auth error: 验证失败')
    // 流程已终结，迟到的通知不再透传给调用方
    expect(onErrorNotice).not.toHaveBeenCalled()
  })

  it('closes and destroys the active verification iframe', async () => {
    vi.useFakeTimers()

    const onClose = vi.fn()
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })

    const closePromise = sdk.openVerification()
    void closePromise.catch(() => undefined)
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()

    sdk.close()
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(200)
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(200)
    await expect(closePromise).rejects.toThrow('Assistance auth closed')
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()

    const callbackSdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id', onClose })
    const callbackPromise = callbackSdk.openVerification()
    void callbackPromise.catch(() => undefined)
    callbackSdk.close()

    await vi.advanceTimersByTimeAsync(400)
    await expect(callbackPromise).rejects.toThrow('Assistance auth closed')
    expect(onClose).toHaveBeenCalledTimes(1)

    const destroyPromise = sdk.openVerification()
    const destroyRejectionSpy = vi.fn()
    void destroyPromise.catch(destroyRejectionSpy)
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeInTheDocument()

    sdk.destroy()
    await Promise.resolve()
    expect(destroyRejectionSpy).toHaveBeenCalledTimes(1)
    expect(destroyRejectionSpy.mock.calls[0]?.[0]).toEqual(new Error('Assistance auth destroyed'))
    expect(document.getElementById('assistance-mobile-auth-frame-shell')).toBeNull()
  })
})

describe('appId requirement', () => {
  it('throws when appId is missing', () => {
    expect(() =>
      createAssistanceMobileAuthSdk({} as Parameters<typeof createAssistanceMobileAuthSdk>[0]),
    ).toThrow('AssistanceMobileAuth: appId is required since 0.2.0')
  })

  it('throws when appId is blank or not a string', () => {
    expect(() =>
      createAssistanceMobileAuthSdk({ appId: '   ' }),
    ).toThrow('AssistanceMobileAuth: appId is required since 0.2.0')
    expect(() =>
      createAssistanceMobileAuthSdk({ appId: 123 as unknown as string }),
    ).toThrow('AssistanceMobileAuth: appId is required since 0.2.0')
  })

  it('accepts a valid appId', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'demo-brand-001' })
    expect(sdk).toBeTruthy()
    sdk.destroy()
  })
})

describe('wrapper official CSS helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.head.innerHTML = ''
  })

  it('keeps the production official JSSDK URL as the default wrapper resource', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    expect(sdk).toBeDefined()
    expect(getAssistanceMobileAuthOfficialCssAsset('/sign-pay-pro/assistance-mobile-auth/').version).toBe('1.0.6')
  })

  it('keeps static wrapper runtime on the production official resource when mobileAuthEnv requests test', () => {
    const resource = resolveAssistanceMobileAuthJssdkResourceForBuild({
      staticResourceRelease: true,
      search: '?mobileAuthEnv=test',
      env: { VITE_MOBILE_AUTH_ENV: 'test' },
    })

    expect(resource).toBe(metadata)
    expect(resource.version).toBe('1.0.6')
    expect(resource.jsUrl).toBe('https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js')
  })

  it('keeps static resource release resolver out of the public wrapper API', () => {
    expect(publicWrapperApi).not.toHaveProperty('resolveAssistanceMobileAuthJssdkResourceForBuild')
  })

  it('keeps non-static wrapper on official CDN 1.0.6 for test URL and build env inputs', () => {
    const legacyTestInputs = [
      {
        staticResourceRelease: false,
        search: '?mobileAuthEnv=test',
        env: { VITE_MOBILE_AUTH_ENV: 'prod' },
      },
      {
        staticResourceRelease: false,
        search: '',
        env: { VITE_MOBILE_AUTH_ENV: 'test' },
      },
    ] as const

    for (const options of legacyTestInputs) {
      const resource = resolveAssistanceMobileAuthJssdkResourceForBuild(options)

      expect(resource).toBe(metadata)
      expect(resource.version).toBe('1.0.6')
      expect(resource.jsUrl).toBe('https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js')
    }
  })

  it('returns the local CSS href and integrity metadata without injecting automatically', () => {
    const asset = getAssistanceMobileAuthOfficialCssAsset('/assets/')

    expect(asset).toEqual({
      href: '/assets/vendor/new-control-style.css',
      integrity: 'sha256-35bc356791dc1b7c68bdb282baf31db7eac1edeef4853609f6869cb7286aeb1e',
      version: '1.0.6',
    })
    expect(document.head.querySelector('link[href="/assets/vendor/new-control-style.css"]')).toBeNull()
  })

  it('injects one caller-requested local CSS link and reuses it on repeated calls', () => {
    const first = injectAssistanceMobileAuthOfficialCss({ baseUrl: '/wrapper/' })
    const second = injectAssistanceMobileAuthOfficialCss({ baseUrl: '/wrapper/' })

    expect(first).toBe(second)
    expect(first.href).toBe('http://localhost:3000/wrapper/vendor/new-control-style.css')
    expect(first.rel).toBe('stylesheet')
    expect(first.integrity).toBe('sha256-35bc356791dc1b7c68bdb282baf31db7eac1edeef4853609f6869cb7286aeb1e')
    expect(document.head.querySelectorAll('link#assistance-mobile-auth-official-css')).toHaveLength(1)
  })
})

describe('wrapper source compliance guards', () => {
  it('does not import React or React DOM in the wrapper module graph', async () => {
    const wrapperModule = await import('./index')

    expect(wrapperModule).toHaveProperty('createAssistanceMobileAuthSdk')
    expect(wrapperModule).not.toHaveProperty('createRoot')
    expect(wrapperModule).not.toHaveProperty('render')
  })

  it('loads the official JSSDK from the remote authsafe CDN via injected <script>', () => {
    document.head.innerHTML = ''
    document.body.innerHTML = '<main><section id="auth-container"></section></main>'
    delete window.YDRZAuthSF

    createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      container: '#auth-container',
      authParams: createAuthParams(),
    })

    const scripts = [...document.querySelectorAll('script')].map((script) => script.src).join('\n')

    expect(scripts).toContain('https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js')
  })
})

type MockFacade = MobileAuthSdkFacade & {
  showAuthPage: ReturnType<typeof vi.fn>
  initControl: ReturnType<typeof vi.fn>
  clearControl: ReturnType<typeof vi.fn>
}

void (facade satisfies MockFacade)

describe('wrapper build contract', () => {
  const projectRoot = resolve(__dirname, '../..')

  it('defines separate H5 and wrapper package scripts', () => {
    const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    expect(packageJson.scripts.build).toBe('npm run build:h5')
    expect(packageJson.scripts['build:h5']).toBe('tsc -b && vite build && node scripts/flatten-layers.mjs dist/assets')
    expect(packageJson.scripts['build:wrapper']).toBe(
      'tsc -b && vite build --config vite.wrapper.config.ts',
    )
    expect(packageJson.scripts['build:static-wrapper']).toBe(
      'VITE_STATIC_RESOURCE_RELEASE=1 VITE_MOBILE_AUTH_ENV=prod vite build --config vite.wrapper.config.ts',
    )
    expect(packageJson.scripts['test:wrapper']).toBe('vitest --run src/wrapper src/sdk')
    expect(packageJson.scripts['test:phase6']).toBe(
      'vitest --run src/pages src/sdk src/wrapper && npm run build:h5 && npm run build:wrapper',
    )
  })

  it('keeps wrapper build output and vendor copying in a dedicated Vite library config', () => {
    const wrapperConfigPath = resolve(projectRoot, 'vite.wrapper.config.ts')

    expect(existsSync(wrapperConfigPath)).toBe(true)

    const wrapperConfig = readFileSync(wrapperConfigPath, 'utf8')

    expect(wrapperConfig).toContain("outDir: 'dist-wrapper'")
    expect(wrapperConfig).toContain("entry: path.resolve(__dirname, 'src/wrapper/index.ts')")
    expect(wrapperConfig).toContain("name: 'AssistanceMobileAuth'")
    expect(wrapperConfig).toContain("fileName: 'assistance-mobile-auth'")
    expect(wrapperConfig).toContain("formats: ['es', 'umd']")
    expect(wrapperConfig).toContain('src/wrapper/vendor')
    expect(wrapperConfig).toContain('new-control-style.css')
  })

  it('copies only the local CSS asset in every wrapper build', () => {
    const wrapperConfig = readFileSync(resolve(projectRoot, 'vite.wrapper.config.ts'), 'utf8')

    expect(wrapperConfig).toContain("const vendorFiles = ['new-control-style.css'] as const")
    expect(wrapperConfig).not.toContain('jssdk-1.0.7.min.js')
    expect(wrapperConfig).toContain('__STATIC_RESOURCE_RELEASE__')
  })

  it('guards static resource release iframe URLs from mobileAuthEnv forwarding', () => {
    const bridgeSource = readFileSync(resolve(projectRoot, 'src/wrapper/verificationBridge.ts'), 'utf8')

    expect(bridgeSource).toMatch(
      /if \(!__STATIC_RESOURCE_RELEASE__\) {\s+const parentEnv = parentSearch\.get\('mobileAuthEnv'\)/,
    )
  })
})
