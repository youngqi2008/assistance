import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import type { MobileAssistantClient } from '../api/mobileAssistantClient'
import type { FetchIdentityResult, VerifyIdentityResult } from '../types/identity-flow'

type IdentityFlowModule = {
  createIdentityFlowService: (client: MobileAssistantClient) => {
    run(input: {
      token: string
      idLast4?: string
      encryptPublicKey?: string
      onTransition?: (snapshot: { status: string; description: string }) => void
    }): Promise<{
      status: string
      title: string
      description: string
      resultKind?: string
      action?: {
        kind: string
        label: string
      }
      identity?: {
        displayName: string
        maskedMobile: string
        maskedIdCard: string
        [key: string]: unknown
      }
    }>
    resumeFetch(input: {
      token: string
      onTransition?: (snapshot: { status: string; description: string }) => void
    }): Promise<{
      status: string
      title: string
      description: string
      resultKind?: string
      action?: {
        kind: string
        label: string
      }
      identity?: {
        displayName: string
        maskedMobile: string
        maskedIdCard: string
        [key: string]: unknown
      }
    }>
  }
}

const identityFlowModules = import.meta.glob<IdentityFlowModule>('./identityFlow.ts')

async function loadCreateIdentityFlowService() {
  const loadModule = identityFlowModules['./identityFlow.ts']

  if (!loadModule) {
    throw new Error('Missing identityFlow service implementation')
  }

  const module = await loadModule()
  return module.createIdentityFlowService
}

function createClient(overrides: Partial<MobileAssistantClient> = {}): MobileAssistantClient {
  return {
    verifyIdentity: vi.fn<MobileAssistantClient['verifyIdentity']>(),
    fetchIdentity: vi.fn<MobileAssistantClient['fetchIdentity']>(),
    ...overrides,
  }
}

describe('createIdentityFlowService', () => {
  const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
  const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')

  beforeEach(() => {
    setIntervalSpy.mockClear()
    setTimeoutSpy.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns a token-missing terminal snapshot with retry-auth guidance for blank or whitespace tokens', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const client = createClient()
    const transitions: Array<{ status: string }> = []

    const result = await createIdentityFlowService(client).run({
      token: '   ',
      onTransition: (snapshot: { status: string; description: string }) => {
        transitions.push({ status: snapshot.status })
      },
    })

    expect(result).toMatchObject({
      status: 'token-missing',
      title: '授权凭证暂未返回',
      action: {
        kind: 'retry-auth',
        label: '重新授权',
      },
    })
    expect(transitions).toEqual([{ status: 'token-missing' }])
    expect(client.verifyIdentity).not.toHaveBeenCalled()
    expect(client.fetchIdentity).not.toHaveBeenCalled()
  })

  it('emits token-ready then verify-loading, and maps verify failure to business-friendly copy', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const verifyResult: VerifyIdentityResult = {
      kind: 'verify-failed',
      message: 'OPEN-BODY-SIG mismatch from upstream',
      action: 'retry-auth',
      code: 'E-VERIFY-01',
    }
    const client = createClient({
      verifyIdentity: vi.fn().mockResolvedValue(verifyResult),
    })
    const transitions: Array<{ status: string; description: string }> = []

    const result = await createIdentityFlowService(client).run({
      token: '  valid-token  ',
      onTransition: (snapshot: { status: string; description: string }) => {
        transitions.push({ status: snapshot.status, description: snapshot.description })
      },
    })

    expect(transitions.map((snapshot) => snapshot.status)).toEqual(['token-ready', 'verify-loading', 'verify-failed'])
    expect(result).toMatchObject({
      status: 'verify-failed',
      resultKind: 'verify-failed',
      action: {
        kind: 'retry-auth',
        label: '重新授权',
      },
    })
    expect(result.description).toContain('请确认授权信息无误后重试')
    expect(result.description).not.toContain('OPEN-BODY-SIG')
    expect(client.verifyIdentity).toHaveBeenCalledWith(expect.objectContaining({ token: 'valid-token', idLast4: '' }))
    expect(client.fetchIdentity).not.toHaveBeenCalled()
  })

  it('normalizes and forwards the user-entered id last four digits to the verify request', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const client = createClient({
      verifyIdentity: vi.fn().mockResolvedValue({
        kind: 'verified',
        message: '核验通过',
      } satisfies VerifyIdentityResult),
      fetchIdentity: vi.fn().mockResolvedValue({
        kind: 'identity-pending',
        message: 'still processing',
        action: 'refresh-result',
      } satisfies FetchIdentityResult),
    })

    await createIdentityFlowService(client).run({
      token: 'valid-token',
      idLast4: ' 12x4 ',
    })

    expect(client.verifyIdentity).toHaveBeenCalledWith(expect.objectContaining({ token: 'valid-token', idLast4: '12X4' }))
    expect(client.fetchIdentity).toHaveBeenCalledWith({ token: 'valid-token', idLast4: '12X4' })
  })

  it('uses idLast4 for fetch normalization and never completes with encrypted identity fields', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const client = createClient({
      verifyIdentity: vi.fn().mockResolvedValue({
        kind: 'verified',
        message: '核验通过',
      } satisfies VerifyIdentityResult),
      fetchIdentity: vi.fn().mockResolvedValue({
        kind: 'identity-ready',
        message: 'identity ready',
        identity: {
          displayName: '徐三',
          maskedMobile: '159****3742',
          maskedIdCard: '530125********1718',
        },
      } satisfies FetchIdentityResult),
    })

    const result = await createIdentityFlowService(client).run({
      token: 'success-token',
      idLast4: ' 1718 ',
    })

    expect(client.fetchIdentity).toHaveBeenCalledWith({ token: 'success-token', idLast4: '1718' })
    expect(result).toMatchObject({
      status: 'complete',
      identity: {
        displayName: '徐三',
        maskedMobile: '159****3742',
        maskedIdCard: '530125********1718',
      },
    })
    expect(JSON.stringify(result)).not.toContain('81e14c9984617e662117ca545d7adf04')
    expect(JSON.stringify(result)).not.toContain('2148c59fb4a7085a0e1c1224ef025381')
    expect(JSON.stringify(result)).not.toContain('67e43ccf0f591daeebaa0789dc4161da')
  })

  it('emits fetch-loading after verify success and maps pending to refresh-result without polling loops', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const client = createClient({
      verifyIdentity: vi.fn().mockResolvedValue({
        kind: 'verified',
        message: '核验通过',
      } satisfies VerifyIdentityResult),
      fetchIdentity: vi.fn().mockResolvedValue({
        kind: 'identity-pending',
        message: 'detailRespCode=2001, continue polling',
        action: 'refresh-result',
      } satisfies FetchIdentityResult),
    })
    const transitions: Array<{ status: string }> = []

    const result = await createIdentityFlowService(client).run({
      token: 'pending-token',
      onTransition: (snapshot: { status: string; description: string }) => {
        transitions.push({ status: snapshot.status })
      },
    })

    expect(transitions.map((snapshot) => snapshot.status)).toEqual([
      'token-ready',
      'verify-loading',
      'fetch-loading',
      'fetch-pending',
    ])
    expect(result).toMatchObject({
      status: 'fetch-pending',
      resultKind: 'identity-pending',
      action: {
        kind: 'refresh-result',
        label: '刷新结果',
      },
    })
    expect(result.description).toContain('稍后刷新结果')
    expect(result.description).not.toContain('detailRespCode')
    expect(setIntervalSpy).not.toHaveBeenCalled()
    expect(setTimeoutSpy).not.toHaveBeenCalled()
  })

  it('resumes only the fetch stage for fetch-only continuation after verify already succeeded', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const verifyIdentity = vi.fn().mockResolvedValue({
      kind: 'verified',
      message: '核验通过',
    } satisfies VerifyIdentityResult)
    const fetchIdentity = vi
      .fn()
      .mockResolvedValueOnce({
        kind: 'identity-ready',
        message: 'identity ready',
        identity: {
          displayName: '张三',
          maskedMobile: '138****0000',
          maskedIdCard: '110101********1234',
        },
      } satisfies FetchIdentityResult)
      .mockResolvedValueOnce({
        kind: 'identity-pending',
        message: 'still processing',
        action: 'refresh-result',
      } satisfies FetchIdentityResult)
    const client = createClient({
      verifyIdentity,
      fetchIdentity,
    })
    const service = createIdentityFlowService(client)
    const transitions: Array<{ status: string }> = []

    await service.run({ token: '  verified-token  ' })

    const result = await service.resumeFetch({
      token: '  verified-token  ',
      onTransition: (snapshot: { status: string; description: string }) => {
        transitions.push({ status: snapshot.status })
      },
    })

    expect(verifyIdentity).toHaveBeenCalledTimes(1)
    expect(fetchIdentity).toHaveBeenCalledTimes(2)
    expect(fetchIdentity).toHaveBeenNthCalledWith(2, { token: 'verified-token' })
    expect(transitions.map((snapshot) => snapshot.status)).toEqual(['fetch-loading', 'fetch-pending'])
    expect(result).toMatchObject({
      status: 'fetch-pending',
      action: {
        kind: 'refresh-result',
        label: '刷新结果',
      },
    })
  })

  it('forwards encryptPublicKey from run input down to client.verifyIdentity', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const verifyIdentity = vi.fn().mockResolvedValue({ kind: 'verified', message: 'ok' })
    const fetchIdentity = vi.fn().mockResolvedValue({
      kind: 'identity-ready',
      message: 'done',
      identity: { displayName: '张三', maskedMobile: '138****0000', maskedIdCard: '110101********1234' },
    })
    const client = createClient({ verifyIdentity, fetchIdentity })

    await createIdentityFlowService(client).run({ token: 'tok-x', idLast4: 'ABCD', encryptPublicKey: 'PUB-X' })

    expect(verifyIdentity).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'tok-x', idLast4: 'ABCD', encryptPublicKey: 'PUB-X' }),
    )
  })

  it.each([
    {
      name: 'request failures into retry-fetch recovery',
      fetchResult: {
        kind: 'request-failed',
        message: 'network socket hang up',
        action: 'retry-fetch',
      } satisfies FetchIdentityResult,
      expectedAction: 'retry-fetch',
    },
    {
      name: 'identity failures into retry-auth recovery',
      fetchResult: {
        kind: 'identity-failed',
        message: 'YXD-00140 failed',
        action: 'retry-auth',
        code: 'ID-FAIL',
      } satisfies FetchIdentityResult,
      expectedAction: 'retry-auth',
    },
  ])('maps fetch failures from %s', async ({ fetchResult, expectedAction }) => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const client = createClient({
      verifyIdentity: vi.fn().mockResolvedValue({
        kind: 'verified',
        message: '核验通过',
      } satisfies VerifyIdentityResult),
      fetchIdentity: vi.fn().mockResolvedValue(fetchResult),
    })

    const result = await createIdentityFlowService(client).run({ token: 'fetch-failure-token' })

    expect(result).toMatchObject({
      status: 'fetch-failed',
      action: {
        kind: expectedAction,
      },
    })
    expect(result.description).toMatch(/重试获取信息|重新授权/)
    expect(result.description).not.toContain('YXD')
    expect(result.description).not.toContain('socket hang up')
  })

  it('resolves full success to complete with display-ready identity fields only', async () => {
    const createIdentityFlowService = await loadCreateIdentityFlowService()
    const client = createClient({
      verifyIdentity: vi.fn().mockResolvedValue({
        kind: 'verified',
        message: '核验通过',
      } satisfies VerifyIdentityResult),
      fetchIdentity: vi.fn().mockResolvedValue({
        kind: 'identity-ready',
        message: 'identity ready with vendor extras',
        identity: {
          displayName: '张三',
          maskedMobile: '138****0000',
          maskedIdCard: '110101********1234',
          token: 'should-not-leak',
        } as unknown as FetchIdentityResult extends { kind: 'identity-ready'; identity: infer T } ? T : never,
      } satisfies FetchIdentityResult),
    })
    const transitions: Array<{ status: string }> = []

    const result = await createIdentityFlowService(client).run({
      token: 'success-token',
      onTransition: (snapshot: { status: string; description: string }) => {
        transitions.push({ status: snapshot.status })
      },
    })

    expect(transitions.map((snapshot) => snapshot.status)).toEqual([
      'token-ready',
      'verify-loading',
      'fetch-loading',
      'complete',
    ])
    expect(result).toMatchObject({
      status: 'complete',
      resultKind: 'identity-ready',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })
    expect(result.identity).toBeDefined()
    expect(Object.keys(result.identity ?? {}).sort()).toEqual(['displayName', 'maskedIdCard', 'maskedMobile'])
    expect(result).not.toHaveProperty('token')
    expect(result.identity).not.toHaveProperty('token')
  })
})
