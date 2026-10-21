import type { MobileAuthSdkAuthParams, MobileAuthSdkConfig, MobileAuthSdkMode } from './types'
import {
  MOBILE_AUTH_DEFAULT_AUTH_TYPE,
  MOBILE_AUTH_DEFAULT_SCOPE,
  normalizeMobileAuthType,
} from './authPolicy'
import {
  resolveRuntimeMobileAuthEnv,
  selectMobileOfficialJssdkResource,
} from '../wrapper/vendor/mobile-jssdk.meta'

type MobileAuthSdkEnv = Pick<
  ImportMetaEnv,
  | 'VITE_MOBILE_AUTH_SDK_ENABLED'
  | 'VITE_MOBILE_AUTH_SDK_MODE'
  | 'VITE_MOBILE_AUTH_SDK_JS_URL'
  | 'VITE_MOBILE_AUTH_SDK_CSS_URL'
  | 'VITE_MOBILE_AUTH_DEBUG_ENTRY'
  | 'VITE_MOBILE_AUTH_VERSION'
  | 'VITE_MOBILE_AUTH_APP_ID'
  | 'VITE_MOBILE_AUTH_SIGN'
  | 'VITE_MOBILE_AUTH_TRACE_ID'
  | 'VITE_MOBILE_AUTH_TIMESTAMP'
  | 'VITE_MOBILE_AUTH_AUTH_TYPE'
  | 'VITE_MOBILE_AUTH_SCOPE'
  | 'VITE_MOBILE_AUTH_ENV'
>

const DEFAULT_MOBILE_AUTH_PARAMS: MobileAuthSdkAuthParams = {
  version: '',
  appId: '',
  sign: '',
  traceId: '',
  timestamp: '',
  authType: '',
  scope: '',
}

const DEFAULT_MOBILE_AUTH_SDK_CONFIG: MobileAuthSdkConfig = {
  enabled: false,
  mode: 'mock',
  jsUrl: '',
  cssUrl: '',
  debugEntry: false,
  authParams: DEFAULT_MOBILE_AUTH_PARAMS,
}

export interface MobileAuthSdkConfigBuildOptions {
  /** Build/test hook; production callers should omit so the Vite define controls static release mode. */
  staticResourceRelease?: boolean
}

function normalizeBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null) {
    return fallback
  }

  const normalized = value.trim().toLowerCase()

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'off', ''].includes(normalized)) {
    return false
  }

  return fallback
}

function normalizeMode(value: string | undefined): MobileAuthSdkMode {
  return value?.trim().toLowerCase() === 'live' ? 'live' : DEFAULT_MOBILE_AUTH_SDK_CONFIG.mode
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? ''
}

function readAuthParams(env: MobileAuthSdkEnv): MobileAuthSdkAuthParams {
  return {
    version: normalizeString(env.VITE_MOBILE_AUTH_VERSION),
    appId: normalizeString(env.VITE_MOBILE_AUTH_APP_ID),
    sign: normalizeString(env.VITE_MOBILE_AUTH_SIGN),
    traceId: normalizeString(env.VITE_MOBILE_AUTH_TRACE_ID),
    timestamp: normalizeString(env.VITE_MOBILE_AUTH_TIMESTAMP),
    authType: normalizeMobileAuthType(env.VITE_MOBILE_AUTH_AUTH_TYPE),
    scope: normalizeString(env.VITE_MOBILE_AUTH_SCOPE) || MOBILE_AUTH_DEFAULT_SCOPE,
  }
}

// D-01/D-02/D-03 contracts layer: env parsing only, no side effects and no SDK calls.
// The legacy environment selector is accepted as a no-op; every build uses official 1.0.6.
export function resolveMobileAuthSdkConfigForBuild(
  env: MobileAuthSdkEnv,
  options: MobileAuthSdkConfigBuildOptions = {},
): MobileAuthSdkConfig {
  const staticResourceRelease = __STATIC_RESOURCE_RELEASE__ || options.staticResourceRelease === true
  const envMode = staticResourceRelease
    ? 'prod'
    : resolveRuntimeMobileAuthEnv(undefined, env.VITE_MOBILE_AUTH_ENV)
  const resource = selectMobileOfficialJssdkResource(envMode)
  // JavaScript is always locked to the reviewed official 1.0.6 resource. CSS may still
  // use a deployment-specific override outside immutable static releases.
  const explicitCssUrl = staticResourceRelease ? '' : normalizeString(env.VITE_MOBILE_AUTH_SDK_CSS_URL)

  return {
    enabled: normalizeBoolean(env.VITE_MOBILE_AUTH_SDK_ENABLED, DEFAULT_MOBILE_AUTH_SDK_CONFIG.enabled),
    mode: normalizeMode(env.VITE_MOBILE_AUTH_SDK_MODE),
    jsUrl: resource.jsUrl,
    cssUrl: explicitCssUrl || resource.cssUrl,
    debugEntry: normalizeBoolean(env.VITE_MOBILE_AUTH_DEBUG_ENTRY, DEFAULT_MOBILE_AUTH_SDK_CONFIG.debugEntry),
    authParams: readAuthParams(env),
  }
}

export function getMobileAuthSdkConfig(env: MobileAuthSdkEnv = import.meta.env): MobileAuthSdkConfig {
  return resolveMobileAuthSdkConfigForBuild(env)
}
