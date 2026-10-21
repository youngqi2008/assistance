import { describe, expect, it, vi } from 'vitest'
import type { CustomAgreementConfig } from '../custom-page/types'

import {
  ASSISTANCE_AUTH_CANCEL,
  ASSISTANCE_AUTH_CLOSE,
  ASSISTANCE_AUTH_CONFIG,
  ASSISTANCE_AUTH_ERROR,
  ASSISTANCE_AUTH_ERROR_NOTICE,
  ASSISTANCE_AUTH_MESSAGE_SOURCE,
  ASSISTANCE_AUTH_PHONE_READY,
  ASSISTANCE_AUTH_PROBE_RESULT,
  ASSISTANCE_AUTH_READY,
  ASSISTANCE_AUTH_RESIZE,
  ASSISTANCE_AUTH_STYLE,
  ASSISTANCE_AUTH_STATE_CHANGE,
  ASSISTANCE_AUTH_SUCCESS,
  defaultAssistanceIframeOptions,
  createAssistanceAuthConfigMessage,
  createAssistanceAuthMessage,
  createCustomBootMessage,
  createAssistanceAuthSessionId,
  createVerificationUrl,
  isAssistanceAuthMessage,
  listenForAssistanceAuthMessages,
  listenForStyleMessage,
  normalizeAssistanceIframeOptions,
  parsePageImageParam,
  parseAssistanceAuthParentOrigin,
} from './verificationBridge'

describe('verificationBridge', () => {
  it('creates data-only custom BOOT messages recognized for the exact session and source', () => {
    const config: CustomAgreementConfig = {
      mode: 'agreement', sessionId: 's1', parentOrigin: 'https://host.test', docKey: 'entry',
      docs: {}, entries: [], css: '', styleUrls: [], rootAttributes: {},
    }
    const message = createCustomBootMessage('s1', { runtimeSource: '/* IIFE */', config })
    expect(message).toEqual({
      source: 'assistance-mobile-auth', type: 'ASSISTANCE_AUTH_CUSTOM_BOOT', sessionId: 's1',
      payload: { runtimeSource: '/* IIFE */', config: {
        mode: 'agreement', sessionId: 's1', parentOrigin: 'https://host.test', docKey: 'entry',
        docs: {}, entries: [], css: '', styleUrls: [], rootAttributes: {},
      } },
    })
    expect(isAssistanceAuthMessage(message, 's1')).toBe(true)
    expect(isAssistanceAuthMessage(message, 's2')).toBe(false)
    expect(isAssistanceAuthMessage({ ...message, source: 'other' }, 's1')).toBe(false)
    for (const key of ['appId', 'authParams', 'token', 'keyA']) expect(config).not.toHaveProperty(key)
    expect(message.payload).not.toHaveProperty('signal')
  })

  it('creates scoped session ids and launchToken-free verification URLs', () => {
    expect(createAssistanceAuthSessionId()).toMatch(/^assistance-auth-/)

    const url = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      request: { scene: 'native-number', requestId: 'req-1' },
    })

    expect(url).toContain('/verification')
    expect(url).toContain('assistanceAuthSessionId=assistance-auth-1')
    expect(url).toContain('scene=native-number')
    expect(url).toContain('requestId=req-1')
    expect(url).not.toContain('launchToken')
  })

  it('adds an exact http(s) parent origin only to popup verification URLs', () => {
    const url = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      parentOrigin: 'https://merchant.example:8443',
    })
    expect(new URL(url).searchParams.get('assistanceAuthParentOrigin')).toBe(
      'https://merchant.example:8443',
    )
    expect(parseAssistanceAuthParentOrigin('https://merchant.example:8443')).toBe(
      'https://merchant.example:8443',
    )
    expect(parseAssistanceAuthParentOrigin('javascript:alert(1)')).toBeNull()
    expect(parseAssistanceAuthParentOrigin('https://merchant.example/path')).toBeNull()

    const probeUrl = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      parentOrigin: 'https://merchant.example',
      mode: 'probe',
    })
    expect(new URL(probeUrl).searchParams.has('assistanceAuthParentOrigin')).toBe(false)
  })

  it('defaults verification URLs to the fixed public staging domain', () => {
    const url = createVerificationUrl({
      sessionId: 'assistance-auth-1',
      request: { scene: 'native-number' },
    })

    expect(url).toContain('https://ginkgo.chinaums.com/sign-pay-pro/verification')
    expect(url).toContain('assistanceAuthSessionId=assistance-auth-1')
  })

  it('forwards the parent page ?mobileAuthEnv param into the iframe URL', () => {
    const original = window.location.href
    window.history.replaceState(null, '', '/?mobileAuthEnv=prod')

    try {
      const url = createVerificationUrl({
        verificationUrl: 'https://example.com/verification',
        sessionId: 'assistance-auth-1',
        request: { scene: 'native-number', requestId: 'req-1' },
      })
      expect(url).toContain('mobileAuthEnv=prod')
    } finally {
      window.history.replaceState(null, '', original)
    }
  })

  it('forwards the parent page ?flow param into the iframe URL', () => {
    const original = window.location.href
    window.history.replaceState(null, '', '/?flow=preverified')

    try {
      const url = createVerificationUrl({
        verificationUrl: 'https://example.com/verification',
        sessionId: 'assistance-auth-1',
        request: { scene: 'native-number' },
      })
      expect(url).toContain('flow=preverified')
    } finally {
      window.history.replaceState(null, '', original)
    }
  })

  it('does not add mobileAuthEnv when the parent page has no such param', () => {
    const url = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      request: { scene: 'native-number' },
    })
    expect(url).not.toContain('mobileAuthEnv')
  })

  it('forwards top/bottom page images to the iframe URL and round-trips them', () => {
    const url = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      request: { scene: 'native-number' },
      pageImages: {
        top: { src: 'https://cdn.example.com/top.png', width: '100%' },
        bottom: { src: 'https://cdn.example.com/bottom.png' },
      },
    })

    const params = new URL(url).searchParams
    expect(parsePageImageParam(params.get('topImage'))).toEqual({
      src: 'https://cdn.example.com/top.png',
      width: '100%',
    })
    expect(parsePageImageParam(params.get('bottomImage'))).toEqual({
      src: 'https://cdn.example.com/bottom.png',
    })
  })

  it('omits page image params when src is missing/empty and parses invalid input as null', () => {
    const url = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      request: { scene: 'native-number' },
      pageImages: { top: { width: '100%' }, bottom: { src: '   ' } },
    })
    expect(url).not.toContain('topImage')
    expect(url).not.toContain('bottomImage')
    expect(parsePageImageParam(null)).toBeNull()
    expect(parsePageImageParam('not-json')).toBeNull()
  })

  it('recognizes only assistance messages for the requested session', () => {
    const message = createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, 'assistance-auth-1')

    expect(isAssistanceAuthMessage(message, 'assistance-auth-1')).toBe(true)
    expect(isAssistanceAuthMessage(message, 'assistance-auth-2')).toBe(false)
    expect(isAssistanceAuthMessage({ ...message, source: 'other' }, 'assistance-auth-1')).toBe(false)
    expect(isAssistanceAuthMessage({ ...message, type: 'OTHER' }, 'assistance-auth-1')).toBe(false)
  })

  it('recognizes the non-terminal ERROR_NOTICE message type', () => {
    const message = createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, 'assistance-auth-1')

    expect(isAssistanceAuthMessage(message, 'assistance-auth-1')).toBe(true)
    expect(isAssistanceAuthMessage(message, 'assistance-auth-2')).toBe(false)
  })

  it('normalizes only public state-change events and filters the expected window source', () => {
    const expectedSource = window
    const otherSource = {
      postMessage: vi.fn(),
    } as unknown as MessageEventSource
    const onStateChange = vi.fn()
    const dispose = listenForAssistanceAuthMessages(
      window,
      'assistance-auth-1',
      { onStateChange },
      'https://allowed.example',
      { expectedSource },
    )

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://allowed.example',
      source: expectedSource,
      data: createAssistanceAuthMessage(
        ASSISTANCE_AUTH_STATE_CHANGE,
        'assistance-auth-1',
        {
          event: {
            type: 'idLast4Complete',
            idLast4: '1234',
            mobile: '13800000000',
            token: 'secret',
            provider: { private: true },
          },
        },
      ),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://allowed.example',
      source: otherSource,
      data: createAssistanceAuthMessage(
        ASSISTANCE_AUTH_STATE_CHANGE,
        'assistance-auth-1',
        { event: { type: 'idLast4Incomplete' } },
      ),
    }))

    expect(onStateChange).toHaveBeenCalledOnce()
    expect(onStateChange).toHaveBeenCalledWith({ type: 'idLast4Complete' })
    dispose()
  })

  it('ignores malformed and non-public state-change payloads', () => {
    const onStateChange = vi.fn()
    const dispose = listenForAssistanceAuthMessages(
      window,
      'assistance-auth-1',
      { onStateChange },
    )

    for (const payload of [
      null,
      {},
      { event: null },
      { event: {} },
      { event: { type: 'unknown' } },
    ]) {
      window.dispatchEvent(new MessageEvent('message', {
        data: createAssistanceAuthMessage(
          ASSISTANCE_AUTH_STATE_CHANGE,
          'assistance-auth-1',
          payload,
        ),
      }))
    }
    expect(onStateChange).not.toHaveBeenCalled()
    dispose()
  })

  it('dispatches bridge events only for matching sessions', () => {
    const handlers = {
      onReady: vi.fn(),
      onSuccess: vi.fn(),
      onCancel: vi.fn(),
      onError: vi.fn(),
      onClose: vi.fn(),
    }
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', handlers)

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, 'assistance-auth-1'),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, 'assistance-auth-1', {
        status: 'success',
        token: 'sdk-token',
        idLast4: '1234',
        keyA: 'sdk-key-a',
        message: 'ok',
      }),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_CANCEL, 'assistance-auth-1'),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR, 'assistance-auth-1', { message: 'bad' }),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_CLOSE, 'assistance-auth-1'),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, 'wrong-session'),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: { source: ASSISTANCE_AUTH_MESSAGE_SOURCE, type: 'UNKNOWN', sessionId: 'assistance-auth-1' },
    }))

    expect(handlers.onReady).toHaveBeenCalledTimes(1)
    expect(handlers.onSuccess).toHaveBeenCalledWith({
      status: 'success',
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
      message: 'ok',
      requestId: undefined,
      mock: undefined,
    })
    expect(handlers.onCancel).toHaveBeenCalledTimes(1)
    expect(handlers.onError).toHaveBeenCalledWith({ message: 'bad' })
    expect(handlers.onClose).toHaveBeenCalledTimes(1)

    dispose()
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_READY, 'assistance-auth-1'),
    }))
    expect(handlers.onReady).toHaveBeenCalledTimes(1)
  })

  it('sanitizes ASSISTANCE_AUTH_SUCCESS payloads at the bridge boundary', () => {
    const onSuccess = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onSuccess })

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, 'assistance-auth-1', {
        status: 'success',
        token: 'sdk-token',
        idLast4: '1234',
        keyA: 'sdk-key-a',
        requestId: 'req-1',
        message: 'ok',
        mock: true,
        displayName: 'Ada Lovelace',
        mobile: '13800000000',
        idCard: '110101199001011234',
        encryptedName: 'ENCRYPTED',
      }),
    }))

    expect(onSuccess).toHaveBeenCalledWith({
      status: 'success',
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
      requestId: 'req-1',
      message: 'ok',
      mock: true,
    })
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('displayName')
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('mobile')
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('idCard')
    expect(onSuccess.mock.calls[0]?.[0]).not.toHaveProperty('encryptedName')

    dispose()
  })

  it('routes malformed ASSISTANCE_AUTH_SUCCESS payloads to onError instead of onSuccess', () => {
    const handlers = {
      onSuccess: vi.fn(),
      onError: vi.fn(),
    }
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', handlers)

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, 'assistance-auth-1', {
        status: 'success',
        idLast4: '1234',
        keyA: 'sdk-key-a',
      }),
    }))

    expect(handlers.onSuccess).not.toHaveBeenCalled()
    expect(handlers.onError).toHaveBeenCalledWith({
      code: 'INVALID_SUCCESS_PAYLOAD',
      message: '验证结果返回异常，请稍后重试。',
    })

    dispose()
  })

  it.each([
    ['missing status', { token: 'sdk-token', idLast4: '1234', keyA: 'sdk-key-a' }],
    ['wrong status', { status: 'failed', token: 'sdk-token', idLast4: '1234', keyA: 'sdk-key-a' }],
  ])('routes %s ASSISTANCE_AUTH_SUCCESS payloads to onError instead of onSuccess', (_label, payload) => {
    const handlers = {
      onSuccess: vi.fn(),
      onError: vi.fn(),
    }
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', handlers)

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, 'assistance-auth-1', payload),
    }))

    expect(handlers.onSuccess).not.toHaveBeenCalled()
    expect(handlers.onError).toHaveBeenCalledWith({
      code: 'INVALID_SUCCESS_PAYLOAD',
      message: '验证结果返回异常，请稍后重试。',
    })

    dispose()
  })

  it('routes ERROR_NOTICE to onErrorNotice with normalized phase/carrier payload', () => {
    const handlers = {
      onError: vi.fn(),
      onErrorNotice: vi.fn(),
    }
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', handlers)

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, 'assistance-auth-1', {
        code: '110031',
        message: '当前为非中国移动号码',
        phase: 'initControl',
        carrier: 'YD',
      }),
    }))

    expect(handlers.onErrorNotice).toHaveBeenCalledWith({
      code: '110031',
      message: '当前为非中国移动号码',
      phase: 'initControl',
      carrier: 'YD',
    })
    // 非终态通知不触发终态 onError
    expect(handlers.onError).not.toHaveBeenCalled()

    // 缺 message 时回退兜底文案，非法 phase 被过滤
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, 'assistance-auth-1', {
        code: 110031,
        phase: 'somewhere-else',
      }),
    }))

    expect(handlers.onErrorNotice).toHaveBeenLastCalledWith({
      message: '验证失败，请稍后重试。',
      phase: undefined,
      carrier: undefined,
    })

    // 其他 session 的通知仍被过滤
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, 'wrong-session', { message: 'x' }),
    }))
    expect(handlers.onErrorNotice).toHaveBeenCalledTimes(2)

    dispose()
  })

  it('recognizes and dispatches PHONE_READY with normalized masked mobile payload', () => {
    const onPhoneReady = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onPhoneReady })

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PHONE_READY, 'assistance-auth-1', {
        maskedMobile: '138****1234',
        rawText: ' 用于验证 138****1234 的实名信息 ',
        source: 'ydrzPhoneControl',
        ignored: 'x',
      }),
    }))

    expect(onPhoneReady).toHaveBeenCalledWith({
      maskedMobile: '138****1234',
      rawText: '用于验证 138****1234 的实名信息',
      source: 'ydrzPhoneControl',
    })

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PHONE_READY, 'wrong-session', {
        maskedMobile: '139****5678',
        rawText: '139****5678',
        source: 'ydrzPhoneControl',
      }),
    }))
    expect(onPhoneReady).toHaveBeenCalledTimes(1)

    dispose()
  })

  it('ignores malformed PHONE_READY payloads', () => {
    const onPhoneReady = vi.fn()
    const onError = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onPhoneReady, onError })

    for (const payload of [
      null,
      { maskedMobile: '13800001234', rawText: '13800001234', source: 'ydrzPhoneControl' },
      { maskedMobile: '138****1234', rawText: '138****1234', source: 'other' },
      { maskedMobile: '', rawText: '138****1234', source: 'ydrzPhoneControl' },
      { maskedMobile: '138****1234', rawText: '用于验证 13800001234 的实名信息', source: 'ydrzPhoneControl' },
      { maskedMobile: '138****1234', rawText: '用于验证 139****5678 的实名信息', source: 'ydrzPhoneControl' },
    ]) {
      window.dispatchEvent(new MessageEvent('message', {
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PHONE_READY, 'assistance-auth-1', payload),
      }))
    }

    expect(onPhoneReady).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    dispose()
  })

  it('recognizes and dispatches RESIZE with a finite positive height', () => {
    const onResize = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onResize })

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, 'assistance-auth-1', { height: 512.2 }),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, 'assistance-auth-1', { height: 0 }),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_RESIZE, 'wrong-session', { height: 640 }),
    }))

    expect(onResize).toHaveBeenCalledTimes(1)
    expect(onResize).toHaveBeenCalledWith({ height: 513 })
    dispose()
  })

  it('keeps origin filtering for ERROR_NOTICE when an allowedOrigin is configured', () => {
    const onErrorNotice = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onErrorNotice }, 'https://allowed.example')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://evil.example',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, 'assistance-auth-1', { message: 'x' }),
    }))
    expect(onErrorNotice).not.toHaveBeenCalled()

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://allowed.example',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR_NOTICE, 'assistance-auth-1', { message: 'x' }),
    }))
    expect(onErrorNotice).toHaveBeenCalledTimes(1)

    dispose()
  })

  it('writes mode=probe and drops inherited flow for probe URLs', () => {
    const original = window.location.href
    window.history.replaceState(null, '', '/?flow=preverified')
    try {
      const url = createVerificationUrl({
        verificationUrl: 'https://example.com/verification',
        sessionId: 'assistance-auth-1',
        request: { scene: 'native-number', requestId: 'req-1' },
        mode: 'probe',
      })
      expect(url).toContain('mode=probe')
      expect(url).not.toContain('flow=preverified')
      expect(url).not.toContain('launchToken')
    } finally {
      window.history.replaceState(null, '', original)
    }
  })

  it('does not add mode when not a probe', () => {
    const url = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      request: { scene: 'native-number' },
    })
    expect(url).not.toContain('mode=')
  })

  it('adds layout=inline only when inline iframe presentation is requested', () => {
    const inlineUrl = new URL(createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-inline',
      layout: 'inline',
    }))
    const modalUrl = new URL(createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-modal',
    }))

    expect(inlineUrl.searchParams.get('layout')).toBe('inline')
    expect(modalUrl.searchParams.has('layout')).toBe(false)
  })

  it('adds the iframe vConsole marker only when explicitly requested', () => {
    const debugUrl = new URL(createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-debug',
      debugVConsole: true,
    }))
    const regularUrl = new URL(createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-regular',
    }))

    expect(debugUrl.searchParams.get('debugVConsole')).toBe('1')
    expect(regularUrl.searchParams.has('debugVConsole')).toBe(false)
  })

  it('recognizes and dispatches PROBE_RESULT, normalizing reason and eligible', () => {
    const onProbeResult = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onProbeResult })

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, 'assistance-auth-1', {
        eligible: true,
        reason: 'ok',
        raw: { code: '103000', carrier: 'YD' },
      }),
    }))
    expect(onProbeResult).toHaveBeenCalledWith({ eligible: true, reason: 'ok', raw: { code: '103000', carrier: 'YD' } })

    // 非法 reason → unknown，eligible 由 reason 推导
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, 'assistance-auth-1', { reason: 'bogus' }),
    }))
    expect(onProbeResult).toHaveBeenLastCalledWith({ eligible: false, reason: 'unknown' })

    // 其它 session 过滤
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, 'wrong-session', { reason: 'wifi' }),
    }))
    expect(onProbeResult).toHaveBeenCalledTimes(2)

    dispose()
  })

  it('recognizes ambiguous reason and passes through raw carriers/networkType', () => {
    const onProbeResult = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onProbeResult })

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, 'assistance-auth-1', {
        reason: 'ambiguous',
        raw: {
          code: 'ALL_CARRIERS_FAILED',
          networkType: 'unknown',
          carriers: { YD: '103111', CT: '103124', CU: '103125', bogus: 1 },
        },
      }),
    }))
    expect(onProbeResult).toHaveBeenLastCalledWith({
      eligible: false,
      reason: 'ambiguous',
      raw: {
        code: 'ALL_CARRIERS_FAILED',
        networkType: 'unknown',
        carriers: { YD: '103111', CT: '103124', CU: '103125' },
      },
    })

    // 非法 networkType 被丢弃
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, 'assistance-auth-1', {
        reason: 'non-mobile',
        raw: { networkType: 'bogus' },
      }),
    }))
    expect(onProbeResult).toHaveBeenLastCalledWith({ eligible: false, reason: 'non-mobile' })

    dispose()
  })

  it('omits absent raw sub-fields in PROBE_RESULT (no undefined carrier key)', () => {
    const onProbeResult = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onProbeResult })
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, 'assistance-auth-1', {
        reason: 'non-mobile',
        raw: { code: '110031' },
      }),
    }))
    const delivered = onProbeResult.mock.calls.at(-1)?.[0]
    expect(delivered).toEqual({ eligible: false, reason: 'non-mobile', raw: { code: '110031' } })
    expect('carrier' in (delivered.raw ?? {})).toBe(false)
    dispose()
  })

  it('recognizes the parent→child ASSISTANCE_AUTH_STYLE message type', () => {
    const message = createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-1', {
      submitBtnStyle: { bgColor: '#0A66FF' },
    })
    expect(isAssistanceAuthMessage(message, 'assistance-auth-1')).toBe(true)
    expect(isAssistanceAuthMessage(message, 'assistance-auth-2')).toBe(false)
  })

  it('listenForStyleMessage delivers the styleOption payload for a matching session and source', () => {
    const onStyle = vi.fn()
    const dispose = listenForStyleMessage(window, 'assistance-auth-1', onStyle, { expectedSource: window })

    window.dispatchEvent(new MessageEvent('message', {
      source: window,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-1', {
        submitBtnStyle: { bgColor: '#0A66FF', name: '立即授权' },
      }),
    }))

    expect(onStyle).toHaveBeenCalledWith(
      { submitBtnStyle: { bgColor: '#0A66FF', name: '立即授权' } },
      [],
      defaultAssistanceIframeOptions,
    )

    dispose()
    window.dispatchEvent(new MessageEvent('message', {
      source: window,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-1', { phoneStyle: {} }),
    }))
    expect(onStyle).toHaveBeenCalledTimes(1)
  })

  it('listenForStyleMessage delivers agreements alongside styleOption (wrapped payload)', () => {
    const onStyle = vi.fn()
    const sessionId = 'assistance-auth-x'
    const dispose = listenForStyleMessage(window, sessionId, onStyle)
    const agreements = [{ name: '《甲方协议》', link: 'https://x.example/a' }]
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          source: 'assistance-mobile-auth',
          type: 'ASSISTANCE_AUTH_STYLE',
          sessionId,
          payload: { styleOption: { submitBtnStyle: { name: 'go' } }, agreements },
        },
      }),
    )
    expect(onStyle).toHaveBeenCalledWith(
      { submitBtnStyle: { name: 'go' } },
      agreements,
      defaultAssistanceIframeOptions,
    )
    dispose()
  })

  it('listenForStyleMessage stays backward compatible with a bare styleOption payload', () => {
    const onStyle = vi.fn()
    const sessionId = 'assistance-auth-y'
    const dispose = listenForStyleMessage(window, sessionId, onStyle)
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          source: 'assistance-mobile-auth',
          type: 'ASSISTANCE_AUTH_STYLE',
          sessionId,
          payload: { submitBtnStyle: { name: 'legacy' } },
        },
      }),
    )
    expect(onStyle).toHaveBeenCalledWith(
      { submitBtnStyle: { name: 'legacy' } },
      [],
      defaultAssistanceIframeOptions,
    )
    dispose()
  })

  it('listenForStyleMessage delivers normalized iframeOptions from a wrapped payload', () => {
    const onStyle = vi.fn()
    const sessionId = 'assistance-auth-options'
    const dispose = listenForStyleMessage(window, sessionId, onStyle)

    window.dispatchEvent(
      new MessageEvent('message', {
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, sessionId, {
          styleOption: { submitBtnStyle: { name: 'go' } },
          agreements: [],
          iframeOptions: { closable: false, useCustomKeyboard: false },
        }),
      }),
    )

    expect(onStyle).toHaveBeenCalledWith(
      { submitBtnStyle: { name: 'go' } },
      [],
      { closable: false, useCustomKeyboard: false, heightMode: 'auto' },
    )
    dispose()
  })

  it('listenForStyleMessage reports pure-data before-login capability and sanitized form header', () => {
    const onStyle = vi.fn()
    const onRuntimeConfig = vi.fn()
    const sessionId = 'assistance-auth-runtime'
    const dispose = listenForStyleMessage(window, sessionId, onStyle, {
      expectedSource: window,
      onRuntimeConfig,
    })

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, sessionId, {
          styleOption: {},
          beforeLoginNotificationEnabled: true,
          stateChangeEnabled: true,
          formHeaderImg: 'https://cdn.example.com/v23-header.png',
        }),
      }),
    )

    expect(onStyle).toHaveBeenCalledWith({}, [], defaultAssistanceIframeOptions)
    expect(onRuntimeConfig).toHaveBeenCalledWith({
      beforeLoginNotificationEnabled: true,
      stateChangeEnabled: true,
      formHeaderImg: 'https://cdn.example.com/v23-header.png',
    })

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, sessionId, {
          beforeLoginNotificationEnabled: 'true',
          stateChangeEnabled: 'true',
          formHeaderImg: 'javascript:alert(1)',
        }),
      }),
    )
    expect(onRuntimeConfig).toHaveBeenLastCalledWith({
      beforeLoginNotificationEnabled: false,
      stateChangeEnabled: false,
      formHeaderImg: undefined,
    })
    dispose()
  })

  it('listenForStyleMessage accepts payloads containing only iframeOptions as wrapped payloads', () => {
    const onStyle = vi.fn()
    const sessionId = 'assistance-auth-options-only'
    const dispose = listenForStyleMessage(window, sessionId, onStyle)

    window.dispatchEvent(
      new MessageEvent('message', {
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, sessionId, {
          iframeOptions: { closable: false },
        }),
      }),
    )

    expect(onStyle).toHaveBeenCalledWith(
      {},
      [],
      { closable: false, useCustomKeyboard: true, heightMode: 'auto' },
    )
    dispose()
  })

  it('normalizes iframeOptions field-by-field and ignores wrong-type fields', () => {
    expect(
      normalizeAssistanceIframeOptions({
        closable: false,
        useCustomKeyboard: 'false',
        heightMode: 'fixed',
      }),
    ).toEqual({ closable: false, useCustomKeyboard: true, heightMode: 'fixed' })

    expect(
      normalizeAssistanceIframeOptions({
        closable: 'false',
        useCustomKeyboard: false,
        heightMode: 'full',
      }),
    ).toEqual({ closable: true, useCustomKeyboard: false, heightMode: 'auto' })

    expect(normalizeAssistanceIframeOptions(null)).toEqual(defaultAssistanceIframeOptions)
  })

  it('listenForStyleMessage ignores wrong session, wrong source, and non-style message types', () => {
    const onStyle = vi.fn()
    const dispose = listenForStyleMessage(window, 'assistance-auth-1', onStyle, { expectedSource: window })

    // wrong session
    window.dispatchEvent(new MessageEvent('message', {
      source: window,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'wrong-session', { submitBtnStyle: {} }),
    }))
    // wrong source (null !== window)
    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-1', { submitBtnStyle: {} }),
    }))
    // non-style type on the same session
    window.dispatchEvent(new MessageEvent('message', {
      source: window,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_SUCCESS, 'assistance-auth-1', {
        status: 'success',
        token: 'sdk-token',
        idLast4: '1234',
        keyA: 'sdk-key-a',
        message: 'ok',
      }),
    }))

    expect(onStyle).not.toHaveBeenCalled()
    dispose()
  })

  it('adds expectsUiConfig=1 to verification URLs when requested', () => {
    const url = createVerificationUrl({
      verificationUrl: 'https://example.com/verification',
      sessionId: 'assistance-auth-1',
      request: { scene: 'native-number' },
      expectsUiConfig: true,
    })

    expect(url).toContain('expectsUiConfig=1')
  })

  it('recognizes and creates CONFIG messages for a session', () => {
    const message = createAssistanceAuthConfigMessage('assistance-auth-1', {
      themeColor: '#1677ff',
      agreements: [{ title: '《客户协议》', url: 'https://merchant.example/terms' }],
    })

    expect(message).toEqual({
      source: ASSISTANCE_AUTH_MESSAGE_SOURCE,
      type: ASSISTANCE_AUTH_CONFIG,
      sessionId: 'assistance-auth-1',
      payload: {
        ui: {
          themeColor: '#1677ff',
          agreements: [{ title: '《客户协议》', url: 'https://merchant.example/terms' }],
        },
      },
    })
    expect(isAssistanceAuthMessage(message, 'assistance-auth-1')).toBe(true)
    expect(isAssistanceAuthMessage(message, 'wrong-session')).toBe(false)
  })

  it('routes CONFIG to onConfig with normalized payload shape and keeps origin filtering', () => {
    const onConfig = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onConfig }, 'https://allowed.example')

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://evil.example',
      data: createAssistanceAuthConfigMessage('assistance-auth-1', { themeColor: '#1677ff' }),
    }))
    expect(onConfig).not.toHaveBeenCalled()

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://allowed.example',
      data: createAssistanceAuthConfigMessage('assistance-auth-1', { themeColor: '#1677ff' }),
    }))
    expect(onConfig).toHaveBeenCalledWith({ ui: { themeColor: '#1677ff' } })

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://allowed.example',
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_CONFIG, 'assistance-auth-1', { bad: true }),
    }))
    expect(onConfig).toHaveBeenLastCalledWith({ ui: {} })

    dispose()
  })

  it('sanitizes object-shaped CONFIG ui before exposing the normalized payload type', () => {
    const onConfig = vi.fn()
    const dispose = listenForAssistanceAuthMessages(window, 'assistance-auth-1', { onConfig })

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_CONFIG, 'assistance-auth-1', {
        ui: {
          themeColor: 'red',
          texts: {
            headerTitle: { text: '  核验身份  ', color: 'blue', bold: 'yes' },
            unknown: { text: 'drop me' },
          },
          images: {
            top: { url: 'https://merchant.example/top.png', height: '0px', fit: 'stretch' },
            bottom: 'javascript:alert(1)',
          },
          agreements: [
            { title: '《合法协议》', url: 'https://merchant.example/terms' },
            { title: '《非法协议》', url: 'javascript:alert(1)' },
          ],
          unknown: true,
        },
      }),
    }))

    expect(onConfig).toHaveBeenCalledWith({
      ui: {
        texts: {
          headerTitle: { text: '核验身份' },
        },
        images: {
          top: { url: 'https://merchant.example/top.png' },
        },
        agreements: [
          { title: '《合法协议》', url: 'https://merchant.example/terms' },
        ],
      },
    })

    dispose()
  })
})

describe('createVerificationUrl appId', () => {
  it('appends appId to the verification url', () => {
    const url = new URL(
      createVerificationUrl({
        sessionId: 's1',
        verificationUrl: 'https://example.com/sign-pay-pro/assist/verification',
        appId: 'demo-brand-001',
      }),
    )
    expect(url.searchParams.get('appId')).toBe('demo-brand-001')
  })

  it('appends appId in probe mode', () => {
    const url = new URL(
      createVerificationUrl({
        sessionId: 's1',
        verificationUrl: 'https://example.com/sign-pay-pro/assist/verification',
        mode: 'probe',
        appId: 'demo-brand-001',
      }),
    )
    expect(url.searchParams.get('mode')).toBe('probe')
    expect(url.searchParams.get('appId')).toBe('demo-brand-001')
  })

  it('omits appId param when not provided', () => {
    const url = new URL(
      createVerificationUrl({
        sessionId: 's1',
        verificationUrl: 'https://example.com/sign-pay-pro/verification',
      }),
    )
    expect(url.searchParams.get('appId')).toBeNull()
  })
})
