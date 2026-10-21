import { describe, expect, it } from 'vitest'

import {
  getMobileAuthSdkConfig,
  resolveMobileAuthSdkConfigForBuild,
} from './config'
import {
  MOBILE_AUTH_DEFAULT_AUTH_TYPE,
  MOBILE_AUTH_DEFAULT_SCOPE,
} from './mobileAuthSignature'
import {
  mobileOfficialJssdkResource,
} from '../wrapper/vendor/mobile-jssdk.meta'

describe('getMobileAuthSdkConfig', () => {
  it('returns disabled mock defaults with prod resource/authType/scope fallbacks when env values are missing', () => {
    expect(getMobileAuthSdkConfig({})).toEqual({
      enabled: false,
      mode: 'mock',
      // jsUrl/cssUrl fall back to the resolved env-mode resource (default prod = 1.0.6 remote CDN)
      jsUrl: mobileOfficialJssdkResource.jsUrl,
      cssUrl: mobileOfficialJssdkResource.cssUrl,
      debugEntry: false,
      authParams: {
        version: '',
        appId: '',
        sign: '',
        traceId: '',
        timestamp: '',
        // authType/scope fall back to env-mode defaults (prod: authType=0)
        authType: MOBILE_AUTH_DEFAULT_AUTH_TYPE,
        scope: MOBILE_AUTH_DEFAULT_SCOPE,
      },
    })
  })

  it('locks the JavaScript resource while normalizing live mode and supported auth params', () => {
    expect(
      getMobileAuthSdkConfig({
        VITE_MOBILE_AUTH_SDK_ENABLED: 'true',
        VITE_MOBILE_AUTH_SDK_MODE: ' LIVE ',
        VITE_MOBILE_AUTH_SDK_JS_URL: ' https://cdn.example.com/jssdk.min.js ',
        VITE_MOBILE_AUTH_SDK_CSS_URL: ' https://cdn.example.com/jssdk.css ',
        VITE_MOBILE_AUTH_DEBUG_ENTRY: '1',
        VITE_MOBILE_AUTH_VERSION: ' 3.0 ',
        VITE_MOBILE_AUTH_APP_ID: ' demo-app ',
        VITE_MOBILE_AUTH_SIGN: ' demo-sign ',
        VITE_MOBILE_AUTH_TRACE_ID: ' trace-123 ',
        VITE_MOBILE_AUTH_TIMESTAMP: ' 20260101010101001 ',
        VITE_MOBILE_AUTH_AUTH_TYPE: ' 4 ',
        VITE_MOBILE_AUTH_SCOPE: ' integralPayment ',
      }),
    ).toEqual({
      enabled: true,
      mode: 'live',
      jsUrl: mobileOfficialJssdkResource.jsUrl,
      cssUrl: 'https://cdn.example.com/jssdk.css',
      debugEntry: true,
      authParams: {
        version: '3.0',
        appId: 'demo-app',
        sign: 'demo-sign',
        traceId: 'trace-123',
        timestamp: '20260101010101001',
        authType: '4',
        scope: 'integralPayment',
      },
    })
  })

  it('falls back to mock mode, resource defaults, and env-mode auth params for invalid or blank env values', () => {
    expect(
      getMobileAuthSdkConfig({
        VITE_MOBILE_AUTH_SDK_ENABLED: 'off',
        VITE_MOBILE_AUTH_SDK_MODE: 'sandbox',
        VITE_MOBILE_AUTH_SDK_JS_URL: '   ',
        VITE_MOBILE_AUTH_SDK_CSS_URL: undefined,
        VITE_MOBILE_AUTH_DEBUG_ENTRY: 'no',
        VITE_MOBILE_AUTH_VERSION: '   ',
        VITE_MOBILE_AUTH_APP_ID: '   ',
        VITE_MOBILE_AUTH_SIGN: undefined,
        VITE_MOBILE_AUTH_TRACE_ID: '',
        VITE_MOBILE_AUTH_TIMESTAMP: ' ',
        VITE_MOBILE_AUTH_AUTH_TYPE: undefined,
        VITE_MOBILE_AUTH_SCOPE: '',
      }),
    ).toEqual({
      enabled: false,
      mode: 'mock',
      jsUrl: mobileOfficialJssdkResource.jsUrl,
      cssUrl: mobileOfficialJssdkResource.cssUrl,
      debugEntry: false,
      authParams: {
        version: '',
        appId: '',
        sign: '',
        traceId: '',
        timestamp: '',
        authType: MOBILE_AUTH_DEFAULT_AUTH_TYPE,
        scope: MOBILE_AUTH_DEFAULT_SCOPE,
      },
    })
  })
})

describe('static resource release config', () => {
  it('documents that static resource release builds must use the prod 1.0.6 resource', () => {
    const config = resolveMobileAuthSdkConfigForBuild({
      VITE_MOBILE_AUTH_ENV: 'prod',
      VITE_MOBILE_AUTH_SDK_ENABLED: 'true',
      VITE_MOBILE_AUTH_SDK_MODE: 'live',
    }, { staticResourceRelease: true })

    expect(config.jsUrl).toBe(mobileOfficialJssdkResource.jsUrl)
    expect(config.cssUrl).toBe(mobileOfficialJssdkResource.cssUrl)
    expect(config.authParams.authType).toBe(MOBILE_AUTH_DEFAULT_AUTH_TYPE)
  })

  it('locks static resource release builds to prod official URLs when env and explicit overrides request test resources', () => {
    const config = resolveMobileAuthSdkConfigForBuild({
      VITE_MOBILE_AUTH_ENV: 'test',
      VITE_MOBILE_AUTH_SDK_JS_URL: ' https://cdn.example.com/override-jssdk.js ',
      VITE_MOBILE_AUTH_SDK_CSS_URL: ' https://cdn.example.com/override.css ',
      VITE_MOBILE_AUTH_AUTH_TYPE: '',
    }, { staticResourceRelease: true })

    expect(config.jsUrl).toBe(mobileOfficialJssdkResource.jsUrl)
    expect(config.cssUrl).toBe(mobileOfficialJssdkResource.cssUrl)
    expect(config.authParams.authType).toBe(MOBILE_AUTH_DEFAULT_AUTH_TYPE)
  })

  it('locks non-static builds to official 1.0.6 and authType 0 even when legacy test overrides are supplied', () => {
    const config = resolveMobileAuthSdkConfigForBuild({
      VITE_MOBILE_AUTH_ENV: 'test',
      VITE_MOBILE_AUTH_SDK_JS_URL: ' https://cdn.example.com/override-jssdk.js ',
      VITE_MOBILE_AUTH_SDK_CSS_URL: ' https://cdn.example.com/override.css ',
      VITE_MOBILE_AUTH_AUTH_TYPE: '11',
    }, { staticResourceRelease: false })

    expect(config.jsUrl).toBe(mobileOfficialJssdkResource.jsUrl)
    expect(config.cssUrl).toBe('https://cdn.example.com/override.css')
    expect(config.authParams.authType).toBe(MOBILE_AUTH_DEFAULT_AUTH_TYPE)
  })
})
