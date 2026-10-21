import { describe, expect, it, vi } from 'vitest'
import type { CustomAuthorizationConfig, CustomBootConfig } from '../custom-page/types'
import { createAuthParamsProvider } from '../customers/duodian-health/suppliedSdk'
import { MOBILE_AUTH_DEFAULT_APP_ID, MOBILE_AUTH_DEFAULT_VERSION, createMobileAuthStd2Sign, MOBILE_AUTH_FRONTEND_APP_KEY } from '../sdk/mobileAuthSignature'
import { prepareDuodian031Config } from './duodian031AuthParams'

function authorizationFixture(): CustomAuthorizationConfig {
  return {
    mode: 'authorization', appId: 'business-app', sessionId: 's1', parentOrigin: 'https://host.test',
    page: { kind: 'html', html: '<div data-sdk-slot></div>' }, request: { scene: 'native-number' },
    agreements: [], iframeOptions: { closable: true, useCustomKeyboard: true, heightMode: 'auto' },
    trustedBusinessBaseUrl: 'https://host.test/', deadline: Date.now() + 30_000,
    beforeLoginNotificationEnabled: false, stateChangeEnabled: false,
  }
}

describe('031 iframe authorization preparation', () => {
  it('generates independently fresh valid provider parameters while retaining business identity and metadata', () => {
    const config = authorizationFixture()
    const first = prepareDuodian031Config(config) as CustomAuthorizationConfig
    const second = prepareDuodian031Config({ ...config, sessionId: 's2' }) as CustomAuthorizationConfig
    expect(Boolean(first.authParams && second.authParams)).toBe(true)
    const params = first.authParams!
    expect(params.appId === MOBILE_AUTH_DEFAULT_APP_ID).toBe(true)
    expect(params.version === MOBILE_AUTH_DEFAULT_VERSION).toBe(true)
    expect(params.authType).toBe('0')
    expect(params.scope).toBe('3ElementsAuthAssistFill')
    expect(/^\d{17}$/.test(params.timestamp)).toBe(true)
    expect(/^[A-F0-9]{32}$/.test(params.traceId)).toBe(true)
    expect(params.traceId !== second.authParams!.traceId).toBe(true)
    expect(params.sign === createMobileAuthStd2Sign({
      appId: MOBILE_AUTH_DEFAULT_APP_ID, appKey: MOBILE_AUTH_FRONTEND_APP_KEY,
      version: MOBILE_AUTH_DEFAULT_VERSION, timestamp: params.timestamp, traceId: params.traceId,
    })).toBe(true)
    expect(createAuthParamsProvider().resolve({ overrides: params }).status).toBe('ready')
    expect({ ...first, authParams: undefined }).toEqual(config)
    expect(first.page).toBe(config.page)
    expect(first.request).toBe(config.request)
    expect(first.iframeOptions).toBe(config.iframeOptions)
    expect(config.authParams).toBeUndefined()
  })

  it('preserves all explicitly supplied provider fields and their existing validation result', () => {
    const authParams = {
      version: '3.0', appId: 'explicit-provider', sign: 'supplied-sign',
      traceId: 'supplied-trace', timestamp: '20261015120000000', authType: '0', scope: '3ElementsAuthAssistFill',
    }
    const config = { ...authorizationFixture(), authParams }
    const prepared = prepareDuodian031Config(config) as CustomAuthorizationConfig
    expect(prepared).toBe(config)
    expect(prepared.authParams).toBe(authParams)
    expect(createAuthParamsProvider().resolve({ overrides: prepared.authParams }).status).toBe('ready')
  })

  it.each([null, {}, { appId: 'partial' }, { authType: '0', scope: 'unsupported' }])('does not replace malformed supplied parameters: %j', supplied => {
    const config = { ...authorizationFixture(), authParams: supplied } as unknown as CustomAuthorizationConfig
    const prepared = prepareDuodian031Config(config) as CustomAuthorizationConfig
    expect(prepared).toBe(config)
    expect(prepared.authParams).toBe(supplied)
    expect(createAuthParamsProvider().resolve({ overrides: prepared.authParams }).status).not.toBe('ready')
  })

  it('leaves agreement configuration untouched without generating parameters', () => {
    const config: CustomBootConfig = {
      mode: 'agreement', sessionId: 's1', parentOrigin: 'https://host.test', docKey: 'entry',
      docs: {}, entries: [], css: '', styleUrls: [], rootAttributes: {},
    }
    const random = vi.spyOn(crypto, 'getRandomValues')
    expect(prepareDuodian031Config(config)).toBe(config)
    expect(random).not.toHaveBeenCalled()
    random.mockRestore()
  })
})
