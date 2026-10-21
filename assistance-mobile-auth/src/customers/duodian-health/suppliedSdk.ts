import type { AuthParamsProvider } from '../../sdk/authParamsProvider'
import type { MobileAuthSdkConfig, MobileAuthSdkShowAuthPageData } from '../../sdk/types'
import { AUTH_SCOPE_PRESET_MAP } from '../../sdk/authPolicy'
import { mobileOfficialJssdkResource } from '../../wrapper/vendor/mobile-jssdk.meta'

export function getMobileAuthSdkConfig(): MobileAuthSdkConfig {
  return { enabled: true, mode: 'live', debugEntry: false,
    jsUrl: mobileOfficialJssdkResource.jsUrl, cssUrl: mobileOfficialJssdkResource.cssUrl,
    authParams: { version: '', appId: '', sign: '', traceId: '', timestamp: '', authType: '', scope: '' },
  }
}

export function createAuthParamsProvider(_options: { config?: MobileAuthSdkConfig } = {}): AuthParamsProvider {
  return { resolve(input = {}) {
    const supplied = input.overrides
    const required = ['appId', 'sign', 'traceId', 'timestamp', 'authType', 'scope'] as const
    if (!supplied || required.some(field => typeof supplied[field] !== 'string' || !supplied[field]!.trim())) {
      return { status: 'not-ready', source: 'manual', reason: 'missing-required-field' }
    }
    const scopes: readonly string[] | undefined = Object.hasOwn(AUTH_SCOPE_PRESET_MAP, supplied.authType!)
      ? AUTH_SCOPE_PRESET_MAP[supplied.authType as keyof typeof AUTH_SCOPE_PRESET_MAP] : undefined
    if (!scopes?.includes(supplied.scope!)) return { status: 'invalid', source: 'manual', reason: 'invalid-auth-scope' }
    return { status: 'ready', source: 'manual', data: { ...supplied } as MobileAuthSdkShowAuthPageData }
  } }
}
