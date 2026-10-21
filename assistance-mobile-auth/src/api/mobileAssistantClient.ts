import type {
  FetchIdentityRequest,
  FetchIdentityResult,
  IdentityDisplayReady,
  VerifyIdentityRequest,
  VerifyIdentityResult,
} from '../types/identity-flow'
import { decryptIdentityForDisplay, type EncryptedIdentityFields } from '../lib/sm4IdentityDecrypt'
import { createSftPublicPath } from '../config/publicBase'

export interface MobileAssistantClient {
  verifyIdentity(request: VerifyIdentityRequest): Promise<VerifyIdentityResult>
  fetchIdentity(request: FetchIdentityRequest): Promise<FetchIdentityResult>
}

type FetchImpl = typeof fetch

type UnknownRecord = Record<string, unknown>

const REQUEST_FAILED_MESSAGE = '数据请求失败，请稍后重试。'
const MALFORMED_RESPONSE_MESSAGE = '数据返回异常，请稍后重试。'

function getMobileAssistantApiBase() {
  return import.meta.env.VITE_MOBILE_ASSISTANT_API_BASE?.trim() || createSftPublicPath('api/mobile-assistant')
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isIdentityDisplayReady(value: unknown): value is IdentityDisplayReady {
  return (
    isRecord(value) &&
    isString(value.displayName) &&
    isString(value.maskedMobile) &&
    isString(value.maskedIdCard)
  )
}

function isEncryptedIdentityFields(value: unknown): value is Required<Omit<EncryptedIdentityFields, 'idLast4'>> {
  return (
    isRecord(value) &&
    isString(value.encryptedName) &&
    isString(value.encryptedMobile) &&
    isString(value.encryptedIdCard)
  )
}

type FetchTransportResult =
  | {
      kind: 'ok'
      payload: unknown
    }
  | {
      kind: 'request-failed'
    }
  | {
      kind: 'malformed-response'
    }

function toRequestFailed(message: string): Extract<VerifyIdentityResult | FetchIdentityResult, { kind: 'request-failed' }> {
  return {
    kind: 'request-failed',
    message,
    action: 'retry-fetch',
  }
}

async function postJson(
  fetchImpl: FetchImpl,
  input: { endpoint: string; body: Record<string, string> },
): Promise<FetchTransportResult> {
  try {
    const response = await fetchImpl(input.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.body),
    })

    if (!response.ok) {
      return { kind: 'request-failed' }
    }

    try {
      const payload = await response.json()
      return {
        kind: 'ok',
        payload,
      }
    } catch {
      return { kind: 'malformed-response' }
    }
  } catch {
    return { kind: 'request-failed' }
  }
}

function normalizeVerifyIdentityResult(payload: unknown): VerifyIdentityResult {
  if (!isRecord(payload) || !isString(payload.kind) || !isString(payload.message)) {
    return toRequestFailed(MALFORMED_RESPONSE_MESSAGE)
  }

  if (payload.kind === 'verified') {
    return {
      kind: 'verified',
      message: payload.message,
    }
  }

  if (
    payload.kind === 'verify-failed' &&
    (payload.action === 'retry-auth' || payload.action === 'retry-fetch')
  ) {
    return {
      kind: 'verify-failed',
      message: payload.message,
      action: payload.action,
      code: isString(payload.code) ? payload.code : undefined,
    }
  }

  if (payload.kind === 'request-failed') {
    return toRequestFailed(payload.message)
  }

  return toRequestFailed(MALFORMED_RESPONSE_MESSAGE)
}

function normalizeFetchIdentityResult(payload: unknown, request: FetchIdentityRequest): FetchIdentityResult {
  if (!isRecord(payload) || !isString(payload.kind) || !isString(payload.message)) {
    return toRequestFailed(MALFORMED_RESPONSE_MESSAGE)
  }

  if (payload.kind === 'identity-ready' && isIdentityDisplayReady(payload.identity)) {
    return {
      kind: 'identity-ready',
      message: payload.message,
      identity: {
        displayName: payload.identity.displayName,
        maskedMobile: payload.identity.maskedMobile,
        maskedIdCard: payload.identity.maskedIdCard,
      },
    }
  }

  if (payload.kind === 'identity-ready' && isEncryptedIdentityFields(payload.identity)) {
    const decrypted = decryptIdentityForDisplay({
      encryptedName: payload.identity.encryptedName,
      encryptedMobile: payload.identity.encryptedMobile,
      encryptedIdCard: payload.identity.encryptedIdCard,
      idLast4: request.idLast4,
    })

    if (decrypted.kind === 'ready') {
      return {
        kind: 'identity-ready',
        message: payload.message,
        identity: decrypted.identity,
      }
    }

    return {
      kind: 'identity-failed',
      message: decrypted.message,
      action: 'retry-fetch',
    }
  }

  if (payload.kind === 'identity-pending' && payload.action === 'refresh-result') {
    return {
      kind: 'identity-pending',
      message: payload.message,
      action: 'refresh-result',
    }
  }

  if (
    payload.kind === 'identity-failed' &&
    (payload.action === 'retry-auth' || payload.action === 'retry-fetch')
  ) {
    return {
      kind: 'identity-failed',
      message: payload.message,
      action: payload.action,
      code: isString(payload.code) ? payload.code : undefined,
    }
  }

  if (payload.kind === 'request-failed') {
    return toRequestFailed(payload.message)
  }

  return toRequestFailed(MALFORMED_RESPONSE_MESSAGE)
}

export function createMobileAssistantClient(fetchImpl: FetchImpl = fetch): MobileAssistantClient {
  const apiBase = getMobileAssistantApiBase().replace(/\/+$/, '')

  return {
    async verifyIdentity(request) {
      const result = await postJson(fetchImpl, {
        endpoint: `${apiBase}/verify`,
        body: {
          token: request.token,
          idLast4: request.idLast4,
          encryptPublicKey: request.encryptPublicKey ?? '',
        },
      })

      if (result.kind === 'request-failed') {
        return toRequestFailed(REQUEST_FAILED_MESSAGE)
      }

      if (result.kind === 'malformed-response') {
        return toRequestFailed(MALFORMED_RESPONSE_MESSAGE)
      }

      return normalizeVerifyIdentityResult(result.payload)
    },
    async fetchIdentity(request) {
      const result = await postJson(fetchImpl, {
        endpoint: `${apiBase}/identity`,
        body: {
          token: request.token,
        },
      })

      if (result.kind === 'request-failed') {
        return toRequestFailed(REQUEST_FAILED_MESSAGE)
      }

      if (result.kind === 'malformed-response') {
        return toRequestFailed(MALFORMED_RESPONSE_MESSAGE)
      }

      return normalizeFetchIdentityResult(result.payload, request)
    },
  }
}
