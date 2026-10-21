import { describe, expect, it } from 'vitest'

import type { MobileAuthSdkShowAuthPageData } from './types'
import {
  MOBILE_AUTH_DEFAULT_APP_ID,
  MOBILE_AUTH_FRONTEND_APP_KEY,
  createMobileAuthStd2Sign,
} from './mobileAuthSignature'
import { AUTH_SCOPE_PRESET_MAP, createAuthParamsProvider } from './authParamsProvider'

describe('createAuthParamsProvider', () => {
  it('returns mock defaults with all required showAuthPage fields in mock mode', () => {
    const provider = createAuthParamsProvider({
      config: {
        enabled: false,
        mode: 'mock',
        jsUrl: '',
        cssUrl: '',
        debugEntry: false,
        authParams: {
          version: '',
          appId: '',
          sign: '',
          traceId: '',
          timestamp: '',
          authType: '',
          scope: '',
        },
      },
    })

    expect(provider.resolve()).toEqual({
      status: 'ready',
      source: 'mock',
      data: {
        version: '3.0',
        appId: 'mock-app-id',
        sign: 'mock-sign',
        traceId: 'mock-trace-id',
        timestamp: '20260101000000000',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
      },
    })
  })

  it('returns not-ready in live mode when non-generated required env-backed fields are missing', () => {
    const provider = createAuthParamsProvider({
      config: {
        enabled: true,
        mode: 'live',
        jsUrl: 'https://cdn.example.com/jssdk.min.js',
        cssUrl: '',
        debugEntry: false,
        authParams: {
          version: '',
          appId: 'demo-app',
          sign: 'demo-sign',
          traceId: 'trace-123',
          timestamp: '20260101010101001',
          authType: '',
          scope: '',
        },
      },
    })

    expect(provider.resolve()).toEqual({
      status: 'not-ready',
      source: 'env',
      reason: 'missing-env',
    })
  })

  it('returns invalid when authType and scope do not match the preset map', () => {
    const provider = createAuthParamsProvider({
      config: {
        enabled: true,
        mode: 'live',
        jsUrl: '',
        cssUrl: '',
        debugEntry: false,
        authParams: {
          version: '',
          appId: 'demo-app',
          sign: 'demo-sign',
          traceId: 'trace-123',
          timestamp: '20260101010101001',
          authType: '4',
          scope: '3ElementsAuthAssistFill',
        },
      },
    })

    expect(provider.resolve()).toEqual({
      status: 'invalid',
      source: 'env',
      reason: 'invalid-auth-scope',
    })
  })

  it('validates manual overrides instead of bypassing authType and scope rules', () => {
    const provider = createAuthParamsProvider({
      config: {
        enabled: false,
        mode: 'mock',
        jsUrl: '',
        cssUrl: '',
        debugEntry: false,
        authParams: {
          version: '',
          appId: '',
          sign: '',
          traceId: '',
          timestamp: '',
          authType: '',
          scope: '',
        },
      },
    })

    const overrides: Partial<MobileAuthSdkShowAuthPageData> = {
      version: '3.0',
      appId: 'manual-app',
      sign: 'manual-sign',
      traceId: 'manual-trace',
      timestamp: '20260102020202002',
      authType: '4',
      scope: 'integralPayment',
    }

    expect(provider.resolve({ overrides })).toEqual({
      status: 'ready',
      source: 'manual',
      data: {
        version: '3.0',
        appId: 'manual-app',
        sign: 'manual-sign',
        traceId: 'manual-trace',
        timestamp: '20260102020202002',
        authType: '4',
        scope: 'integralPayment',
      },
    })
  })

  it('normalizes a retired authType 11 manual override to authType 0', () => {
    const provider = createAuthParamsProvider({
      config: {
        enabled: true,
        mode: 'live',
        jsUrl: '',
        cssUrl: '',
        debugEntry: false,
        authParams: {
          version: '3.0',
          appId: 'manual-app',
          sign: 'manual-sign',
          traceId: 'manual-trace',
          timestamp: '20260102020202002',
          authType: '0',
          scope: '3ElementsAuthAssistFill',
        },
      },
    })

    expect(provider.resolve({
      overrides: {
        authType: '11',
        scope: '3ElementsAuthAssistFill',
      },
    })).toEqual({
      status: 'ready',
      source: 'manual',
      data: {
        version: '3.0',
        appId: 'manual-app',
        sign: 'manual-sign',
        traceId: 'manual-trace',
        timestamp: '20260102020202002',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
      },
    })
  })

  it('exposes a typed preset map for authType and scope validation', () => {
    expect(AUTH_SCOPE_PRESET_MAP['0']).toContain('3ElementsAuthAssistFill')
    expect(AUTH_SCOPE_PRESET_MAP['4']).toEqual(['integralPayment'])
    expect(AUTH_SCOPE_PRESET_MAP).not.toHaveProperty('11')
  })

  it('generates frontend live params when live env does not provide sign inputs', () => {
    const provider = createAuthParamsProvider({
      config: {
        enabled: true,
        mode: 'live',
        jsUrl: '/assistance-mobile-auth/vendor/jssdk-1.0.6.min.js',
        cssUrl: '/assistance-mobile-auth/vendor/new-control-style.css',
        debugEntry: false,
        authParams: {
          version: '',
          appId: '',
          sign: '',
          traceId: '',
          timestamp: '',
          authType: '',
          scope: '',
        },
      },
    })

    const resolution = provider.resolve()

    expect(resolution.status).toBe('ready')
    expect(resolution.source).toBe('frontend')
    expect(resolution.data).toEqual(expect.objectContaining({
      version: '3.0',
      appId: MOBILE_AUTH_DEFAULT_APP_ID,
      authType: '0',
      scope: '3ElementsAuthAssistFill',
      traceId: expect.stringMatching(/^[A-F0-9]{32}$/),
      timestamp: expect.stringMatching(/^\d{17}$/),
    }))
    expect(resolution.data?.sign).toBe(createMobileAuthStd2Sign({
      appId: MOBILE_AUTH_DEFAULT_APP_ID,
      appKey: MOBILE_AUTH_FRONTEND_APP_KEY,
      traceId: resolution.data!.traceId,
      timestamp: resolution.data!.timestamp,
      version: '3.0',
    }))
  })

  it('can force frontend signing while preserving session-provided appId/auth scope', () => {
    const provider = createAuthParamsProvider({
      config: {
        enabled: true,
        mode: 'live',
        jsUrl: '/assistance-mobile-auth/vendor/jssdk-1.0.6.min.js',
        cssUrl: '/assistance-mobile-auth/vendor/new-control-style.css',
        debugEntry: false,
        authParams: {
          version: '',
          appId: '',
          sign: '',
          traceId: '',
          timestamp: '',
          authType: '',
          scope: '',
        },
      },
    })

    const resolution = provider.resolve({
      forceFrontend: true,
      overrides: {
        appId: 'session-mobile-app-id',
        sign: 'mock-sign-from-bff',
        traceId: 'mock-trace-from-bff',
        timestamp: '20260508010101001',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
      },
    })

    expect(resolution.status).toBe('ready')
    expect(resolution.source).toBe('frontend')
    expect(resolution.data).toEqual(expect.objectContaining({
      version: '3.0',
      appId: 'session-mobile-app-id',
      authType: '0',
      scope: '3ElementsAuthAssistFill',
      traceId: expect.stringMatching(/^[A-F0-9]{32}$/),
      timestamp: expect.stringMatching(/^\d{17}$/),
    }))
    expect(resolution.data?.sign).not.toBe('mock-sign-from-bff')
  })
})
