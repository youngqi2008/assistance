import { randomBytes, randomUUID } from 'node:crypto'

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'

import { readMobileAssistantBffConfig } from './config.js'
import type {
  CompleteSdkSessionResult,
  CreateSdkSessionResult,
  MobileAuthLaunchParams,
  QuerySdkSessionResult,
  ResolveSdkSessionResult,
  SdkSessionIdentity,
} from './sdk-session.types.js'

const SESSION_TTL_SECONDS = 10 * 60
// Official JSSDK 1.0.6 requires authType=0 in every environment.
const DEFAULT_AUTH_TYPE = '0'
const DEFAULT_SCOPE = '3ElementsAuthAssistFill'

interface StoredSession {
  expiresAt: number
  params: MobileAuthLaunchParams
  redirectUrl?: string
  result?: StoredResult
}

interface StoredResult {
  authResultId: string
  authCode: string
  authToken: string
  identity: SdkSessionIdentity
}

function createTimestamp(date = new Date()) {
  const pad = (value: number, size = 2) => String(value).padStart(size, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad(date.getMilliseconds(), 3),
  ].join('')
}

function createTraceId() {
  return randomUUID().replaceAll('-', '')
}

function createLaunchToken() {
  return `sft_launch_${randomBytes(24).toString('base64url')}`
}

function createAuthResultId() {
  return `sft_result_${randomBytes(18).toString('base64url')}`
}

function createAuthCode() {
  return `sft_code_${randomBytes(18).toString('base64url')}`
}

function createAuthToken() {
  return `sft_auth_${randomBytes(24).toString('base64url')}`
}

function normalizeRedirectUrl(redirectUrl?: string): string | undefined {
  const value = (redirectUrl ?? '').trim()
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value)
    if (!url.protocol || !url.host) {
      throw new Error('invalid absolute URL')
    }
    return url.toString()
  } catch {
    throw new BadRequestException({
      kind: 'request-failed',
      message: 'redirectUrl 必须是合法的 absolute URL。',
    })
  }
}

function appendAuthTokenToRedirectUrl(redirectUrl: string, authToken: string): string {
  const url = new URL(redirectUrl)
  url.searchParams.set('authToken', authToken)
  return url.toString()
}

@Injectable()
export class SdkSessionService {
  private readonly config = readMobileAssistantBffConfig()
  private readonly sessions = new Map<string, StoredSession>()

  createSession(input: {
    appId: string
    appKey: string
    requestId?: string
    scene?: string
    mobileAuthEnv?: string
    redirectUrl?: string
  }): CreateSdkSessionResult {
    // 业务方 appId/appKey 不做限制与校验：业务方可自定义，原样接受。
    const redirectUrl = normalizeRedirectUrl(input.redirectUrl)
    const launchToken = createLaunchToken()
    const timestamp = createTimestamp()
    const traceId = input.requestId || createTraceId()
    const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000

    this.sessions.set(launchToken, {
      expiresAt,
      params: {
        appId: this.config.mobileAuthAppId,
        sign: `mock-sign-${traceId.slice(0, 12)}`,
        traceId,
        timestamp,
        authType: DEFAULT_AUTH_TYPE,
        scope: DEFAULT_SCOPE,
      },
      redirectUrl,
    })

    return {
      kind: 'created',
      launchToken,
      expiresInSeconds: SESSION_TTL_SECONDS,
      message: 'JSSDK 验证会话已创建。',
    }
  }

  resolveSession(input: { launchToken: string }): ResolveSdkSessionResult {
    const session = this.sessions.get(input.launchToken)

    if (!session || session.expiresAt <= Date.now()) {
      if (session) {
        this.sessions.delete(input.launchToken)
      }

      throw new UnauthorizedException({
        kind: 'unauthorized',
        message: 'JSSDK 验证会话已失效，请重新发起。',
      })
    }

    return {
      kind: 'ready',
      params: session.params,
      expiresInSeconds: Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000)),
      message: '移动 JSSDK 参数已准备就绪（mock）。',
      mock: true,
      redirectMode: Boolean(session.redirectUrl),
    }
  }

  completeSession(input: { launchToken: string; identity: SdkSessionIdentity; message?: string }): CompleteSdkSessionResult {
    const session = this.sessions.get(input.launchToken)

    if (!session || session.expiresAt <= Date.now()) {
      if (session) {
        this.sessions.delete(input.launchToken)
      }

      throw new UnauthorizedException({
        kind: 'unauthorized',
        message: 'JSSDK 验证会话已失效，请重新发起。',
      })
    }

    const result = session.result ?? {
      authResultId: createAuthResultId(),
      authCode: createAuthCode(),
      authToken: createAuthToken(),
      identity: input.identity,
    }

    session.result = result
    this.sessions.set(input.launchToken, session)

    return {
      kind: 'completed',
      authResultId: result.authResultId,
      authCode: result.authCode,
      authToken: result.authToken,
      redirectUrl: session.redirectUrl ? appendAuthTokenToRedirectUrl(session.redirectUrl, result.authToken) : undefined,
      expiresInSeconds: Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000)),
      message: input.message || '认证已完成。',
    }
  }

  queryResult(input: {
    appId: string
    appKey: string
    authResultId?: string
    authCode?: string
    authToken?: string
  }): QuerySdkSessionResult {
    // 业务方 appId/appKey 不做限制与校验：凭 token 取结果即可。
    for (const [launchToken, session] of this.sessions) {
      if (session.expiresAt <= Date.now()) {
        this.sessions.delete(launchToken)
        continue
      }

      const result = session.result
      if (!result) {
        continue
      }

      const matchesAuthToken = Boolean(input.authToken) && result.authToken === input.authToken
      const matchesLegacyResult = Boolean(input.authResultId && input.authCode)
        && result.authResultId === input.authResultId
        && result.authCode === input.authCode

      if (matchesAuthToken || matchesLegacyResult) {
        return {
          kind: 'identity-ready',
          message: '测试页已通过 mock 查询接口获取认证结果。',
          identity: result.identity,
          mock: true,
        }
      }
    }

    throw new UnauthorizedException({
      kind: 'unauthorized',
      message: '认证结果不存在或已失效。',
    })
  }
}
