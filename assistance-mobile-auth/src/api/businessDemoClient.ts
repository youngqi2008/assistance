import { createSftPublicPath } from '../config/publicBase'

export type BusinessDemoAction = 'retry-auth' | 'retry-fetch' | 'refresh-result'

export interface BusinessDemoHttpResponse {
  status: number | null
  statusText: string | null
  body: string | null
  error?: string
}

export type BusinessDemoCheckResult = (
  | { kind: 'verified'; message: string }
  | {
      kind: 'verify-failed'
      message: string
      action: Extract<BusinessDemoAction, 'retry-auth' | 'retry-fetch'>
      code?: string
    }
  | { kind: 'request-failed'; message: string; action: Extract<BusinessDemoAction, 'retry-fetch'> }
) & { http?: BusinessDemoHttpResponse }

export type BusinessDemoQueryResult = (
  | {
      kind: 'identity-encrypted'
      message: string
      identity: {
        encryptedName: string
        encryptedMobile: string
        encryptedIdCard: string
      }
    }
  | { kind: 'identity-pending'; message: string; action: Extract<BusinessDemoAction, 'refresh-result'> }
  | {
      kind: 'identity-failed'
      message: string
      action: Extract<BusinessDemoAction, 'retry-auth' | 'retry-fetch'>
      code?: string
    }
  | { kind: 'request-failed'; message: string; action: Extract<BusinessDemoAction, 'retry-fetch'> }
) & { http?: BusinessDemoHttpResponse }

export interface BusinessDemoClient {
  checkIdentity(input: { token: string; idLast4: string; keyA: string }): Promise<BusinessDemoCheckResult>
  queryIdentity(input: { token: string }): Promise<BusinessDemoQueryResult>
}

type FetchImpl = typeof fetch
type UnknownRecord = Record<string, unknown>

const REQUEST_FAILED_MESSAGE = '内部基座联调请求失败，请稍后重试。'
const MALFORMED_RESPONSE_MESSAGE = '内部基座联调返回异常，请稍后重试。'

function getApiBase() {
  return import.meta.env.VITE_SFT_BUSINESS_DEMO_API_BASE?.trim() || createSftPublicPath('api/business-demo')
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function requestFailed(message: string): Extract<BusinessDemoCheckResult | BusinessDemoQueryResult, { kind: 'request-failed' }> {
  return { kind: 'request-failed', message, action: 'retry-fetch' }
}

async function postJson(fetchImpl: FetchImpl, endpoint: string, body: Record<string, string>) {
  const http: BusinessDemoHttpResponse = { status: null, statusText: null, body: null }
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    http.status = response.status
    http.statusText = response.statusText
    http.body = await response.text()

    let payload: unknown
    try {
      payload = JSON.parse(http.body)
    } catch (error) {
      http.error = `响应正文不是有效 JSON：${error instanceof Error ? error.message : String(error)}`
      return { payload: requestFailed(response.ok ? MALFORMED_RESPONSE_MESSAGE : REQUEST_FAILED_MESSAGE), http }
    }

    if (!response.ok) {
      return {
        payload: requestFailed(isRecord(payload) && isString(payload.message) ? payload.message : REQUEST_FAILED_MESSAGE),
        http,
      }
    }
    return { payload, http }
  } catch (error) {
    http.error = error instanceof Error ? error.message : String(error)
    return { payload: requestFailed(REQUEST_FAILED_MESSAGE), http }
  }
}

function normalizeCheck(payload: unknown): BusinessDemoCheckResult {
  if (!isRecord(payload) || !isString(payload.kind) || !isString(payload.message)) {
    return requestFailed(MALFORMED_RESPONSE_MESSAGE)
  }

  if (payload.kind === 'verified') {
    return { kind: 'verified', message: payload.message }
  }

  if (payload.kind === 'verify-failed' && (payload.action === 'retry-auth' || payload.action === 'retry-fetch')) {
    return {
      kind: 'verify-failed',
      message: payload.message,
      action: payload.action,
      code: isString(payload.code) ? payload.code : undefined,
    }
  }

  if (payload.kind === 'request-failed') {
    return requestFailed(payload.message)
  }

  return requestFailed(MALFORMED_RESPONSE_MESSAGE)
}

function isEncryptedIdentity(value: unknown): value is {
  encryptedName: string
  encryptedMobile: string
  encryptedIdCard: string
} {
  return (
    isRecord(value) &&
    isString(value.encryptedName) &&
    isString(value.encryptedMobile) &&
    isString(value.encryptedIdCard)
  )
}

function normalizeQuery(payload: unknown): BusinessDemoQueryResult {
  if (!isRecord(payload) || !isString(payload.kind) || !isString(payload.message)) {
    return requestFailed(MALFORMED_RESPONSE_MESSAGE)
  }

  if (payload.kind === 'identity-encrypted' && isEncryptedIdentity(payload.identity)) {
    return {
      kind: 'identity-encrypted',
      message: payload.message,
      identity: {
        encryptedName: payload.identity.encryptedName,
        encryptedMobile: payload.identity.encryptedMobile,
        encryptedIdCard: payload.identity.encryptedIdCard,
      },
    }
  }

  if (payload.kind === 'identity-pending' && payload.action === 'refresh-result') {
    return { kind: 'identity-pending', message: payload.message, action: 'refresh-result' }
  }

  if (payload.kind === 'identity-failed' && (payload.action === 'retry-auth' || payload.action === 'retry-fetch')) {
    return {
      kind: 'identity-failed',
      message: payload.message,
      action: payload.action,
      code: isString(payload.code) ? payload.code : undefined,
    }
  }

  if (payload.kind === 'request-failed') {
    return requestFailed(payload.message)
  }

  return requestFailed(MALFORMED_RESPONSE_MESSAGE)
}

export function createBusinessDemoClient(fetchImpl: FetchImpl = fetch): BusinessDemoClient {
  const apiBase = getApiBase().replace(/\/+$/, '')

  return {
    async checkIdentity(input) {
      const { payload, http } = await postJson(fetchImpl, `${apiBase}/check`, {
        token: input.token,
        idLast4: input.idLast4,
        keyA: input.keyA,
      })

      return { ...normalizeCheck(payload), http }
    },
    async queryIdentity(input) {
      const { payload, http } = await postJson(fetchImpl, `${apiBase}/query`, {
        token: input.token,
      })

      return { ...normalizeQuery(payload), http }
    },
  }
}
