import { UnauthorizedException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('SdkSessionService', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.MOBILE_AUTH_ENV
    process.env.SFT_CUSTOMER_APP_ID = 'customer-app-id'
    process.env.SFT_CUSTOMER_APP_KEY = 'customer-app-key'
    process.env.MOBILE_AUTH_APP_ID = 'mobile-app-id'
  })

  it('creates a short-lived launchToken and resolves mocked mobile JSSDK params', async () => {
    const { SdkSessionService } = await import('./sdk-session.service.js')
    const service = new SdkSessionService()

    const created = service.createSession({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      requestId: 'trace-id-from-customer',
      scene: 'native-number',
    })

    expect(created).toEqual({
      kind: 'created',
      launchToken: expect.stringMatching(/^sft_launch_/),
      expiresInSeconds: 600,
      message: 'JSSDK 验证会话已创建。',
    })

    expect(service.resolveSession({ launchToken: created.launchToken })).toMatchObject({
      kind: 'ready',
      params: {
        appId: 'mobile-app-id',
        sign: 'mock-sign-trace-id-fro',
        traceId: 'trace-id-from-customer',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
      },
      mock: true,
    })

    const completed = service.completeSession({
      launchToken: created.launchToken,
      message: '认证已完成。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })

    expect(completed).toEqual({
      kind: 'completed',
      authResultId: expect.stringMatching(/^sft_result_/),
      authCode: expect.stringMatching(/^sft_code_/),
      authToken: expect.stringMatching(/^sft_auth_/),
      redirectUrl: undefined,
      expiresInSeconds: expect.any(Number),
      message: '认证已完成。',
    })

    expect(service.queryResult({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      authResultId: completed.authResultId,
      authCode: completed.authCode,
    })).toEqual({
      kind: 'identity-ready',
      message: '测试页已通过 mock 查询接口获取认证结果。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
      mock: true,
    })
  })

  it('always signs with authType 0 regardless of process or request mobileAuthEnv', async () => {
    process.env.MOBILE_AUTH_ENV = 'test'
    const { SdkSessionService } = await import('./sdk-session.service.js')
    const service = new SdkSessionService()

    const authTypes = [undefined, 'prod', 'test', 'garbage'].map((mobileAuthEnv) => {
      const session = service.createSession({
        appId: 'customer-app-id',
        appKey: 'customer-app-key',
        mobileAuthEnv,
      })
      return service.resolveSession({ launchToken: session.launchToken }).params.authType
    })

    expect(authTypes).toEqual(['0', '0', '0', '0'])
  })

  it('creates an authToken and composes a bound redirectUrl when completing a redirect session', async () => {
    const { SdkSessionService } = await import('./sdk-session.service.js')
    const service = new SdkSessionService()

    const created = service.createSession({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      redirectUrl: 'https://merchant.example/callback?orderId=123#done',
    })

    expect(service.resolveSession({ launchToken: created.launchToken })).toMatchObject({
      kind: 'ready',
      redirectMode: true,
    })

    const completed = service.completeSession({
      launchToken: created.launchToken,
      message: '认证已完成。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })

    expect(completed).toEqual(expect.objectContaining({
      kind: 'completed',
      authToken: expect.stringMatching(/^sft_auth_/),
      redirectUrl: expect.stringMatching(/^https:\/\/merchant\.example\/callback\?orderId=123&authToken=sft_auth_/),
      authResultId: expect.stringMatching(/^sft_result_/),
      authCode: expect.stringMatching(/^sft_code_/),
    }))
    expect(completed.redirectUrl?.endsWith('#done')).toBe(true)

    expect(service.queryResult({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      authToken: completed.authToken,
    })).toEqual({
      kind: 'identity-ready',
      message: '测试页已通过 mock 查询接口获取认证结果。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
      mock: true,
    })
  })

  it('overwrites an existing authToken parameter in the bound redirectUrl', async () => {
    const { SdkSessionService } = await import('./sdk-session.service.js')
    const service = new SdkSessionService()

    const created = service.createSession({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      redirectUrl: 'https://merchant.example/callback?authToken=old-token&orderId=123',
    })
    const completed = service.completeSession({
      launchToken: created.launchToken,
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })

    const url = new URL(completed.redirectUrl ?? '')
    expect(url.searchParams.get('authToken')).toBe(completed.authToken)
    expect(url.searchParams.get('orderId')).toBe('123')
    expect(completed.redirectUrl).not.toContain('old-token')
  })

  it('rejects malformed redirectUrl values during session creation', async () => {
    const { BadRequestException } = await import('@nestjs/common')
    const { SdkSessionService } = await import('./sdk-session.service.js')
    const service = new SdkSessionService()

    expect(() => service.createSession({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      redirectUrl: '/relative/callback',
    })).toThrow(BadRequestException)
  })

  it('does not restrict or validate business appId/appKey — customer can use any', async () => {
    const { SdkSessionService } = await import('./sdk-session.service.js')
    const service = new SdkSessionService()

    // 业务方可用任意 appId/appKey，createSession 不再校验、直接放行
    const created = service.createSession({
      appId: 'any-business-appid',
      appKey: 'any-business-appkey',
    })
    expect(created.kind).toBe('created')

    const completed = service.completeSession({
      launchToken: created.launchToken,
      identity: { displayName: '李四', maskedMobile: '139****1111', maskedIdCard: '440101********5678' },
    })

    // queryResult 同样不校验业务方凭证，凭 token 取结果即可
    expect(service.queryResult({
      appId: 'totally-different-appid',
      appKey: 'totally-different-appkey',
      authToken: completed.authToken,
    }).kind).toBe('identity-ready')
  })

  it('still rejects unknown launchToken values', async () => {
    const { SdkSessionService } = await import('./sdk-session.service.js')
    const service = new SdkSessionService()

    expect(() => service.resolveSession({ launchToken: 'sft_launch_missing' })).toThrow(UnauthorizedException)
  })
})
