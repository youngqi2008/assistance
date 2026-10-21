import type { MobileAuthSdkShowAuthPageData } from '../sdk/types'
import { decryptIdentityForDisplay } from '../lib/sm4IdentityDecrypt'
import { createSftPublicPath } from '../config/publicBase'

export interface CreateSdkSessionRequest {
  appId: string
  appKey: string
  requestId?: string
  scene?: 'native-number'
  mobileAuthEnv?: string
  redirectUrl?: string
}

export interface CreateSdkSessionResult {
  kind: 'created'
  launchToken: string
  expiresInSeconds: number
  message: string
}

export interface ResolveSdkSessionResult {
  kind: 'ready'
  params: MobileAuthSdkShowAuthPageData
  expiresInSeconds: number
  message: string
  mock: boolean
  redirectMode: boolean
}

export interface SdkSessionIdentity {
  displayName: string
  maskedMobile: string
  maskedIdCard: string
}

export interface CompleteSdkSessionResult {
  kind: 'completed'
  authResultId: string
  authCode: string
  authToken: string
  redirectUrl?: string
  expiresInSeconds: number
  message: string
}

export interface QuerySdkSessionResult {
  kind: 'identity-ready'
  message: string
  identity: SdkSessionIdentity
  mock: boolean
}

type QuerySdkSessionRequestBase = {
  appId: string
  appKey: string
}

export type QuerySdkSessionRequest = QuerySdkSessionRequestBase & (
  | { authToken: string; authResultId?: never; authCode?: never }
  | { authResultId: string; authCode: string; authToken?: never }
)

export interface SdkSessionClient {
  createSession(request: CreateSdkSessionRequest): Promise<CreateSdkSessionResult>
  resolveSession(request: { launchToken: string }): Promise<ResolveSdkSessionResult>
  completeSession(request: { launchToken: string; message?: string; identity: SdkSessionIdentity }): Promise<CompleteSdkSessionResult>
  queryResult(request: QuerySdkSessionRequest): Promise<QuerySdkSessionResult>
}

type FetchImpl = typeof fetch

function getSdkSessionApiBase() {
  return import.meta.env.VITE_SFT_SDK_SESSION_API_BASE?.trim() || createSftPublicPath('api/sdk/session')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isMobileAuthParams(value: unknown): value is MobileAuthSdkShowAuthPageData {
  return (
    isRecord(value) &&
    isString(value.appId) &&
    isString(value.sign) &&
    isString(value.traceId) &&
    isString(value.timestamp) &&
    isString(value.authType) &&
    isString(value.scope)
  )
}

function isIdentity(value: unknown): value is SdkSessionIdentity {
  return (
    isRecord(value) &&
    isString(value.displayName) &&
    isString(value.maskedMobile) &&
    isString(value.maskedIdCard)
  )
}

function looksLikeSm4Ciphertext(value: string) {
  return /^[0-9a-f]{32,}$/i.test(value) && value.length % 32 === 0
}

export function normalizeSdkSessionIdentityForDisplay(identity: SdkSessionIdentity): SdkSessionIdentity {
  if (
    !looksLikeSm4Ciphertext(identity.displayName) ||
    !looksLikeSm4Ciphertext(identity.maskedMobile) ||
    !looksLikeSm4Ciphertext(identity.maskedIdCard)
  ) {
    return identity
  }

  const decrypted = decryptIdentityForDisplay({
    encryptedName: identity.displayName,
    encryptedMobile: identity.maskedMobile,
    encryptedIdCard: identity.maskedIdCard,
  })

  return decrypted.kind === 'ready' ? decrypted.identity : {
    displayName: '身份信息解密失败',
    maskedMobile: '',
    maskedIdCard: '',
  }
}

async function postJson(fetchImpl: FetchImpl, endpoint: string, body: Record<string, unknown>) {
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error('JSSDK 会话请求失败，请稍后重试。')
  }

  return response.json() as Promise<unknown>
}

export function createSdkSessionClient(fetchImpl: FetchImpl = fetch): SdkSessionClient {
  const apiBase = getSdkSessionApiBase().replace(/\/+$/, '')

  return {
    async createSession(request) {
      const payload = await postJson(fetchImpl, `${apiBase}/create`, {
        appId: request.appId,
        appKey: request.appKey,
        requestId: request.requestId ?? '',
        scene: request.scene ?? '',
        mobileAuthEnv: request.mobileAuthEnv ?? '',
        redirectUrl: request.redirectUrl ?? '',
      })

      if (!isRecord(payload) || payload.kind !== 'created' || !isString(payload.launchToken)) {
        throw new Error('JSSDK 会话创建结果异常。')
      }

      return {
        kind: 'created',
        launchToken: payload.launchToken,
        expiresInSeconds: typeof payload.expiresInSeconds === 'number' ? payload.expiresInSeconds : 0,
        message: isString(payload.message) ? payload.message : 'JSSDK 验证会话已创建。',
      }
    },
    async resolveSession(request) {
      const payload = await postJson(fetchImpl, `${apiBase}/resolve`, {
        launchToken: request.launchToken,
      })

      if (!isRecord(payload) || payload.kind !== 'ready' || !isMobileAuthParams(payload.params)) {
        throw new Error('JSSDK 会话参数返回异常。')
      }

      return {
        kind: 'ready',
        params: {
          appId: payload.params.appId,
          sign: payload.params.sign,
          traceId: payload.params.traceId,
          timestamp: payload.params.timestamp,
          authType: payload.params.authType,
          scope: payload.params.scope,
        },
        expiresInSeconds: typeof payload.expiresInSeconds === 'number' ? payload.expiresInSeconds : 0,
        message: isString(payload.message) ? payload.message : '移动 JSSDK 参数已准备就绪。',
        mock: payload.mock === true,
        redirectMode: payload.redirectMode === true,
      }
    },
    async completeSession(request) {
      const payload = await postJson(fetchImpl, `${apiBase}/complete`, {
        launchToken: request.launchToken,
        message: request.message ?? '',
        identity: request.identity,
      })

      if (
        !isRecord(payload) ||
        payload.kind !== 'completed' ||
        !isString(payload.authResultId) ||
        !isString(payload.authCode) ||
        !isNonEmptyString(payload.authToken)
      ) {
        throw new Error('JSSDK 认证完成结果异常。')
      }

      return {
        kind: 'completed',
        authResultId: payload.authResultId,
        authCode: payload.authCode,
        authToken: payload.authToken,
        redirectUrl: isString(payload.redirectUrl) ? payload.redirectUrl : undefined,
        expiresInSeconds: typeof payload.expiresInSeconds === 'number' ? payload.expiresInSeconds : 0,
        message: isString(payload.message) ? payload.message : '认证已完成。',
      }
    },
    async queryResult(request) {
      const payload = await postJson(fetchImpl, `${apiBase}/result`, {
        appId: request.appId,
        appKey: request.appKey,
        authResultId: request.authResultId ?? '',
        authCode: request.authCode ?? '',
        authToken: request.authToken ?? '',
      })

      if (!isRecord(payload) || payload.kind !== 'identity-ready' || !isIdentity(payload.identity)) {
        throw new Error('JSSDK 认证结果查询返回异常。')
      }

      return {
        kind: 'identity-ready',
        message: isString(payload.message) ? payload.message : '认证结果已返回。',
        identity: normalizeSdkSessionIdentityForDisplay({
          displayName: payload.identity.displayName,
          maskedMobile: payload.identity.maskedMobile,
          maskedIdCard: payload.identity.maskedIdCard,
        }),
        mock: payload.mock === true,
      }
    },
  }
}
