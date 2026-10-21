import { afterEach, expect, test, vi } from 'vitest'
import { createAuthParamsProvider, getMobileAuthSdkConfig } from './suppliedSdk'
const signed = { version: 'MOCK_ONLY_VERSION', appId: ' MOCK_ONLY_SIGNED_APP_ID ', sign: ' MOCK_ONLY_INVALID_SIGN ',
  traceId: 'MOCK_ONLY_TRACE', timestamp: 'MOCK_ONLY_TIMESTAMP', authType: '0', scope: '3ElementsAuthAssistFill' }
afterEach(() => vi.unstubAllEnvs())

test('complete supplied parameters are returned unchanged including signed identity and whitespace', () => {
  expect(createAuthParamsProvider().resolve({ overrides: signed })).toEqual({ status: 'ready', source: 'manual', data: signed })
})
test.each(['appId', 'sign', 'traceId', 'timestamp', 'authType', 'scope'] as const)('missing %s is never generated even when forceFrontend is requested', field => {
  const resolution = createAuthParamsProvider().resolve({ overrides: { ...signed, [field]: ' ' }, forceFrontend: true })
  expect(resolution).toEqual({ status: 'not-ready', source: 'manual', reason: 'missing-required-field' })
})
test.each([['0', 'creditTreasure'], ['3', '3ElementsAuthAssistFill'], ['unsupported', '3ElementsAuthAssistFill'],
  ['toString', '3ElementsAuthAssistFill'], ['constructor', '3ElementsAuthAssistFill']])('rejects invalid supplied authType/scope pair %s/%s', (authType, scope) => {
  expect(createAuthParamsProvider().resolve({ overrides: { ...signed, authType, scope } })).toEqual({ status: 'invalid', source: 'manual', reason: 'invalid-auth-scope' })
})
test('environment and configured auth fields cannot fill absent caller values', () => {
  vi.stubEnv('VITE_MOBILE_AUTH_APP_ID', 'MOCK_ONLY_ENV_APP_ID')
  vi.stubEnv('VITE_MOBILE_AUTH_SIGN', 'MOCK_ONLY_ENV_INVALID_SIGN')
  const config = getMobileAuthSdkConfig()
  config.authParams = signed
  expect(createAuthParamsProvider({ config }).resolve({ overrides: { authType: '0', scope: '3ElementsAuthAssistFill' } }).data).toBeUndefined()
  expect(createAuthParamsProvider({ config }).resolve().status).toBe('not-ready')
  expect(getMobileAuthSdkConfig().authParams.appId).toBe('')
  expect(getMobileAuthSdkConfig().jsUrl).toBe('https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js')
})
