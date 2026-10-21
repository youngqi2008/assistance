import { describe, expect, it, vi } from 'vitest'

import { createSdkSessionClient } from './sdkSessionClient'

describe('createSdkSessionClient', () => {
  it('creates, resolves, completes, and queries an SFT launchToken session through same-origin APIs', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          kind: 'created',
          launchToken: 'sft_launch_test',
          expiresInSeconds: 600,
          message: 'JSSDK 验证会话已创建。',
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          kind: 'ready',
          params: {
            appId: 'mobile-app-id',
            sign: 'mobile-sign',
            traceId: 'trace-id',
            timestamp: '20260508010101001',
            authType: '0',
            scope: '3ElementsAuthAssistFill',
          },
          expiresInSeconds: 599,
          message: '移动 JSSDK 参数已准备就绪（mock）。',
          mock: true,
          redirectMode: true,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          kind: 'completed',
          authResultId: 'sft_result_test',
          authCode: 'sft_code_test',
          authToken: 'sft_auth_test',
          redirectUrl: 'https://merchant.example/callback?authToken=sft_auth_test',
          expiresInSeconds: 598,
          message: '认证已完成。',
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          kind: 'identity-ready',
          message: '测试页已通过 mock 查询接口获取认证结果。',
          identity: {
            displayName: '张三',
            maskedMobile: '138****0000',
            maskedIdCard: '110101********1234',
          },
          mock: true,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          kind: 'identity-ready',
          message: '测试页已通过 mock 查询接口获取认证结果。',
          identity: {
            displayName: '张三',
            maskedMobile: '138****0000',
            maskedIdCard: '110101********1234',
          },
          mock: true,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    const client = createSdkSessionClient(fetchImpl)

    if (false) {
      // @ts-expect-error queryResult requires authToken or authResultId/authCode
      void client.queryResult({ appId: 'customer-app-id', appKey: 'customer-app-key' })
      // @ts-expect-error legacy queryResult requires both authResultId and authCode
      void client.queryResult({ appId: 'customer-app-id', appKey: 'customer-app-key', authResultId: 'sft_result_test' })
      // @ts-expect-error authToken mode must not mix partial legacy identifiers
      void client.queryResult({ appId: 'customer-app-id', appKey: 'customer-app-key', authToken: 'sft_auth_test', authResultId: 'sft_result_test' })
      // @ts-expect-error authToken mode must not mix partial legacy identifiers
      void client.queryResult({ appId: 'customer-app-id', appKey: 'customer-app-key', authToken: 'sft_auth_test', authCode: 'sft_code_test' })
      // @ts-expect-error query modes are mutually exclusive
      void client.queryResult({ appId: 'customer-app-id', appKey: 'customer-app-key', authToken: 'sft_auth_test', authResultId: 'sft_result_test', authCode: 'sft_code_test' })
    }

    await expect(client.createSession({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      scene: 'native-number',
    })).resolves.toEqual({
      kind: 'created',
      launchToken: 'sft_launch_test',
      expiresInSeconds: 600,
      message: 'JSSDK 验证会话已创建。',
    })

    await expect(client.resolveSession({ launchToken: 'sft_launch_test' })).resolves.toEqual({
      kind: 'ready',
      params: {
        appId: 'mobile-app-id',
        sign: 'mobile-sign',
        traceId: 'trace-id',
        timestamp: '20260508010101001',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
      },
      expiresInSeconds: 599,
      message: '移动 JSSDK 参数已准备就绪（mock）。',
      mock: true,
      redirectMode: true,
    })

    await expect(client.completeSession({
      launchToken: 'sft_launch_test',
      message: '认证已完成。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })).resolves.toEqual({
      kind: 'completed',
      authResultId: 'sft_result_test',
      authCode: 'sft_code_test',
      authToken: 'sft_auth_test',
      redirectUrl: 'https://merchant.example/callback?authToken=sft_auth_test',
      expiresInSeconds: 598,
      message: '认证已完成。',
    })

    await expect(client.queryResult({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      authResultId: 'sft_result_test',
      authCode: 'sft_code_test',
    })).resolves.toEqual({
      kind: 'identity-ready',
      message: '测试页已通过 mock 查询接口获取认证结果。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
      mock: true,
    })

    await expect(client.queryResult({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      authToken: 'sft_auth_test',
    })).resolves.toEqual({
      kind: 'identity-ready',
      message: '测试页已通过 mock 查询接口获取认证结果。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
      mock: true,
    })

    expect(fetchImpl).toHaveBeenNthCalledWith(1, '/sign-pay-pro/api/sdk/session/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: 'customer-app-id',
        appKey: 'customer-app-key',
        requestId: '',
        scene: 'native-number',
        mobileAuthEnv: '',
        redirectUrl: '',
      }),
    })
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/sign-pay-pro/api/sdk/session/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ launchToken: 'sft_launch_test' }),
    })
    expect(fetchImpl).toHaveBeenNthCalledWith(3, '/sign-pay-pro/api/sdk/session/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        launchToken: 'sft_launch_test',
        message: '认证已完成。',
        identity: {
          displayName: '张三',
          maskedMobile: '138****0000',
          maskedIdCard: '110101********1234',
        },
      }),
    })
    expect(fetchImpl).toHaveBeenNthCalledWith(4, '/sign-pay-pro/api/sdk/session/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: 'customer-app-id',
        appKey: 'customer-app-key',
        authResultId: 'sft_result_test',
        authCode: 'sft_code_test',
        authToken: '',
      }),
    })
    expect(fetchImpl).toHaveBeenNthCalledWith(5, '/sign-pay-pro/api/sdk/session/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: 'customer-app-id',
        appKey: 'customer-app-key',
        authResultId: '',
        authCode: '',
        authToken: 'sft_auth_test',
      }),
    })
  })

  it('normalizes encrypted-looking query identity fields to display-ready values', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        kind: 'identity-ready',
        message: '真实查询结果已返回。',
        identity: {
          displayName: '81e14c9984617e662117ca545d7adf04',
          maskedMobile: '2148c59fb4a7085a0e1c1224ef025381',
          maskedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
        },
        mock: false,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(createSdkSessionClient(fetchImpl).queryResult({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      authToken: 'sft_auth_test',
    })).resolves.toEqual({
      kind: 'identity-ready',
      message: '真实查询结果已返回。',
      identity: {
        displayName: '徐三',
        maskedMobile: '15971413742',
        maskedIdCard: '53012519920324',
      },
      mock: false,
    })
  })

  it('throws safe errors for failed requests and malformed payloads', async () => {
    const failedFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 401 }))
    const malformedFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ kind: 'ready', params: { appId: 'missing-fields' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const emptyAuthTokenFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        kind: 'completed',
        authResultId: 'sft_result_test',
        authCode: 'sft_code_test',
        authToken: '   ',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(createSdkSessionClient(failedFetch).createSession({
      appId: 'bad',
      appKey: 'bad',
    })).rejects.toThrow('JSSDK 会话请求失败，请稍后重试。')

    await expect(createSdkSessionClient(malformedFetch).resolveSession({
      launchToken: 'sft_launch_bad',
    })).rejects.toThrow('JSSDK 会话参数返回异常。')

    await expect(createSdkSessionClient(emptyAuthTokenFetch).completeSession({
      launchToken: 'sft_launch_bad',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })).rejects.toThrow('JSSDK 认证完成结果异常。')
  })
})
