import { getMobileAuthSdkConfig } from './config'
import { createFrontendMobileAuthParams } from './mobileAuthSignature'
import { AUTH_SCOPE_PRESET_MAP, normalizeMobileAuthType } from './authPolicy'
export { AUTH_SCOPE_PRESET_MAP } from './authPolicy'
import type { MobileAuthSdkConfig, MobileAuthSdkShowAuthPageData } from './types'

export type AuthParamsResolutionStatus = 'ready' | 'not-ready' | 'invalid'
export type AuthParamsResolutionSource = 'env' | 'mock' | 'manual' | 'frontend'
export type AuthParamsResolutionReason = 'missing-required-field' | 'missing-env' | 'invalid-auth-scope'

export interface AuthParamsResolution {
  status: AuthParamsResolutionStatus
  source: AuthParamsResolutionSource
  data?: MobileAuthSdkShowAuthPageData
  reason?: AuthParamsResolutionReason
}

const MOCK_AUTH_PARAMS: MobileAuthSdkShowAuthPageData = {
  version: '3.0',
  appId: 'mock-app-id',
  sign: 'mock-sign',
  traceId: 'mock-trace-id',
  timestamp: '20260101000000000',
  authType: '0',
  scope: '3ElementsAuthAssistFill',
}

const REQUIRED_AUTH_PARAM_FIELDS: Array<keyof MobileAuthSdkShowAuthPageData> = [
  'appId',
  'sign',
  'traceId',
  'timestamp',
  'authType',
  'scope',
]

function hasAllRequiredFields(data: MobileAuthSdkShowAuthPageData): boolean {
  return REQUIRED_AUTH_PARAM_FIELDS.every((field) => (data[field] ?? '').trim().length > 0)
}

function isValidAuthScopePair(authType: string, scope: string): boolean {
  const allowedScopes = AUTH_SCOPE_PRESET_MAP[authType as keyof typeof AUTH_SCOPE_PRESET_MAP] as
    | readonly string[]
    | undefined
  return allowedScopes?.includes(scope) ?? false
}

function mergeOverrides(
  base: MobileAuthSdkShowAuthPageData,
  overrides?: Partial<MobileAuthSdkShowAuthPageData>,
): MobileAuthSdkShowAuthPageData {
  if (!overrides) {
    return base
  }

  const next = { ...base }

  for (const [key, value] of Object.entries(overrides) as Array<
    [keyof MobileAuthSdkShowAuthPageData, string | undefined]
  >) {
    if (value !== undefined) {
      next[key] = value.trim()
    }
  }

  return next
}

function shouldGenerateFrontendParams(
  config: MobileAuthSdkConfig,
  overrides?: Partial<MobileAuthSdkShowAuthPageData>,
): boolean {
  const candidate = mergeOverrides(
    {
      version: config.authParams.version,
      appId: config.authParams.appId,
      sign: config.authParams.sign,
      traceId: config.authParams.traceId,
      timestamp: config.authParams.timestamp,
      authType: config.authParams.authType,
      scope: config.authParams.scope,
    },
    overrides,
  )

  return (
    config.mode === 'live' &&
    (!candidate.appId.trim() ||
      !candidate.sign.trim() ||
      !candidate.traceId.trim() ||
      !candidate.timestamp.trim())
  )
}

function createFrontendParamsFromConfig(
  config: MobileAuthSdkConfig,
  overrides?: Partial<MobileAuthSdkShowAuthPageData>,
): MobileAuthSdkShowAuthPageData {
  return createFrontendMobileAuthParams({
    version: overrides?.version ?? config.authParams.version,
    appId: overrides?.appId ?? config.authParams.appId,
    authType: overrides?.authType ?? config.authParams.authType,
    scope: overrides?.scope ?? config.authParams.scope,
  })
}

export interface AuthParamsProvider {
  resolve(input?: {
    overrides?: Partial<MobileAuthSdkShowAuthPageData>
    forceFrontend?: boolean
  }): AuthParamsResolution
}

export function createAuthParamsProvider(options: { config?: MobileAuthSdkConfig } = {}): AuthParamsProvider {
  const config = options.config ?? getMobileAuthSdkConfig()

  return {
    resolve(input = {}) {
      const hasManualOverrides = Object.keys(input.overrides ?? {}).length > 0
      const generatedByFrontend =
        config.mode === 'live' && (input.forceFrontend || shouldGenerateFrontendParams(config, input.overrides))
      const source = generatedByFrontend ? 'frontend' : hasManualOverrides ? 'manual' : config.mode === 'mock' ? 'mock' : 'env'

      const baseData: MobileAuthSdkShowAuthPageData =
        config.mode === 'mock'
          ? MOCK_AUTH_PARAMS
          : generatedByFrontend
            ? createFrontendParamsFromConfig(config, input.overrides)
          : {
              version: config.authParams.version,
              appId: config.authParams.appId,
              sign: config.authParams.sign,
              traceId: config.authParams.traceId,
              timestamp: config.authParams.timestamp,
              authType: config.authParams.authType,
              scope: config.authParams.scope,
            }

      const resolvedData = generatedByFrontend ? baseData : mergeOverrides(baseData, input.overrides)
      const data = {
        ...resolvedData,
        authType: normalizeMobileAuthType(resolvedData.authType),
      }

      if (!hasAllRequiredFields(data)) {
        return {
          status: 'not-ready',
          source,
          reason: source === 'env' ? 'missing-env' : 'missing-required-field',
        }
      }

      if (!isValidAuthScopePair(data.authType, data.scope)) {
        return {
          status: 'invalid',
          source,
          reason: 'invalid-auth-scope',
        }
      }

      return {
        status: 'ready',
        source,
        data,
      }
    },
  }
}
