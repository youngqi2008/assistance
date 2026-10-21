import type { MobileAssistantClient } from '../api/mobileAssistantClient'
import type {
  DataFlowStatus,
  FetchIdentityResult,
  IdentityDisplayReady,
  ResultActionKind,
  VerifyIdentityResult,
} from '../types/identity-flow'

export interface IdentityFlowAction {
  kind: ResultActionKind
  label: string
}

export interface IdentityFlowSnapshot {
  status: DataFlowStatus
  title: string
  description: string
  resultKind?: 'token-missing' | VerifyIdentityResult['kind'] | FetchIdentityResult['kind']
  action?: IdentityFlowAction
  identity?: IdentityDisplayReady
}

export interface IdentityFlowRunInput {
  token: string
  idLast4?: string
  encryptPublicKey?: string
  onTransition?: (snapshot: IdentityFlowSnapshot) => void
}

export interface IdentityFlowService {
  run(input: IdentityFlowRunInput): Promise<IdentityFlowSnapshot>
  resumeFetch(input: IdentityFlowRunInput): Promise<IdentityFlowSnapshot>
}

function createAction(kind: ResultActionKind): IdentityFlowAction {
  switch (kind) {
    case 'retry-auth':
      return {
        kind,
        label: '重新授权',
      }
    case 'refresh-result':
      return {
        kind,
        label: '刷新结果',
      }
    case 'retry-fetch':
    default:
      return {
        kind: 'retry-fetch',
        label: '重试获取信息',
      }
  }
}

function createSnapshot(snapshot: IdentityFlowSnapshot): IdentityFlowSnapshot {
  if (!snapshot.identity) {
    return snapshot
  }

  return {
    ...snapshot,
    identity: {
      displayName: snapshot.identity.displayName,
      maskedMobile: snapshot.identity.maskedMobile,
      maskedIdCard: snapshot.identity.maskedIdCard,
    },
  }
}

function createTokenMissingSnapshot(): IdentityFlowSnapshot {
  return createSnapshot({
    status: 'token-missing',
    title: '授权凭证暂未返回',
    description: '本次授权未返回有效凭证，请重新授权后再试。',
    resultKind: 'token-missing',
    action: createAction('retry-auth'),
  })
}

function createTokenReadySnapshot(): IdentityFlowSnapshot {
  return createSnapshot({
    status: 'token-ready',
    title: '授权凭证已接收',
    description: '授权已完成，系统将继续校验身份信息。',
  })
}

function createVerifyLoadingSnapshot(): IdentityFlowSnapshot {
  return createSnapshot({
    status: 'verify-loading',
    title: '身份信息校验中',
    description: '系统正在校验授权信息，请稍候。',
  })
}

function createFetchLoadingSnapshot(): IdentityFlowSnapshot {
  return createSnapshot({
    status: 'fetch-loading',
    title: '身份信息获取中',
    description: '身份校验已完成，正在获取身份信息。',
  })
}

function createVerifyFailureSnapshot(result: Extract<VerifyIdentityResult, { kind: 'verify-failed' | 'request-failed' }>): IdentityFlowSnapshot {
  if (result.kind === 'request-failed') {
    return createSnapshot({
      status: 'verify-failed',
      title: '身份信息校验暂未完成',
      description: '当前服务暂不可用，请稍后重试获取信息。',
      resultKind: 'request-failed',
      action: createAction('retry-fetch'),
    })
  }

  return createSnapshot({
    status: 'verify-failed',
    title: '身份信息校验未通过',
    description:
      result.action === 'retry-auth'
        ? '请确认授权信息无误后重试；如仍失败，可重新授权后再试。'
        : '身份校验未通过，请稍后重试获取信息。',
    resultKind: 'verify-failed',
    action: createAction(result.action),
  })
}

function createFetchResultSnapshot(result: FetchIdentityResult): IdentityFlowSnapshot {
  switch (result.kind) {
    case 'identity-pending':
      return createSnapshot({
        status: 'fetch-pending',
        title: '结果处理中',
        description: '身份信息正在处理中，请稍后刷新结果。',
        resultKind: 'identity-pending',
        action: createAction('refresh-result'),
      })
    case 'identity-failed':
      return createSnapshot({
        status: 'fetch-failed',
        title: '身份信息暂未返回',
        description:
          result.action === 'retry-auth'
            ? '当前身份信息未能返回，请重新授权后再试。'
            : '当前身份信息暂未返回，请稍后重试获取信息。',
        resultKind: 'identity-failed',
        action: createAction(result.action),
      })
    case 'request-failed':
      return createSnapshot({
        status: 'fetch-failed',
        title: '身份信息暂未返回',
        description: '当前服务繁忙，请稍后重试获取信息。',
        resultKind: 'request-failed',
        action: createAction('retry-fetch'),
      })
    case 'identity-ready':
      return createSnapshot({
        status: 'complete',
        title: '身份信息已返回',
        description: '授权结果已同步到当前页面。',
        resultKind: 'identity-ready',
        identity: {
          displayName: result.identity.displayName,
          maskedMobile: result.identity.maskedMobile,
          maskedIdCard: result.identity.maskedIdCard,
        },
      })
  }
}

function normalizeToken(token: string) {
  return token.trim()
}

function normalizeIdLast4(idLast4: string | undefined) {
  return idLast4?.trim().toUpperCase() ?? ''
}

function emitSnapshot(onTransition: IdentityFlowRunInput['onTransition'], snapshot: IdentityFlowSnapshot) {
  onTransition?.(snapshot)
  return snapshot
}

async function fetchOnlyContinuation(
  client: MobileAssistantClient,
  normalizedToken: string,
  idLast4?: string,
  onTransition?: IdentityFlowRunInput['onTransition'],
) {
  emitSnapshot(onTransition, createFetchLoadingSnapshot())

  const fetchResult = await client.fetchIdentity(idLast4 ? { token: normalizedToken, idLast4 } : { token: normalizedToken })

  return emitSnapshot(onTransition, createFetchResultSnapshot(fetchResult))
}

export function createIdentityFlowService(client: MobileAssistantClient): IdentityFlowService {
  return {
    async run({ token, idLast4, encryptPublicKey, onTransition }) {
      const normalizedToken = normalizeToken(token)
      const normalizedIdLast4 = normalizeIdLast4(idLast4)

      if (!normalizedToken) {
        return emitSnapshot(onTransition, createTokenMissingSnapshot())
      }

      emitSnapshot(onTransition, createTokenReadySnapshot())
      emitSnapshot(onTransition, createVerifyLoadingSnapshot())

      const verifyResult = await client.verifyIdentity({
        token: normalizedToken,
        idLast4: normalizedIdLast4,
        encryptPublicKey,
      })

      if (verifyResult.kind !== 'verified') {
        return emitSnapshot(onTransition, createVerifyFailureSnapshot(verifyResult))
      }

      return fetchOnlyContinuation(client, normalizedToken, normalizedIdLast4, onTransition)
    },

    async resumeFetch({ token, onTransition }) {
      const normalizedToken = normalizeToken(token)

      if (!normalizedToken) {
        return emitSnapshot(onTransition, createTokenMissingSnapshot())
      }

      return fetchOnlyContinuation(client, normalizedToken, undefined, onTransition)
    },
  }
}
