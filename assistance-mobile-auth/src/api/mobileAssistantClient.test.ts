import { describe, expect, it, vi } from 'vitest'

import { createMobileAssistantClient } from './mobileAssistantClient'

describe('createMobileAssistantClient', () => {
  it('posts same-origin verify and identity payloads and returns normalized success results', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: 'verified', message: '身份核验通过' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            kind: 'identity-ready',
            message: '身份信息已返回',
            identity: {
              displayName: '张三',
              maskedMobile: '138****0000',
              maskedIdCard: '110101********1234',
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )

    const client = createMobileAssistantClient(fetchImpl)

    await expect(client.verifyIdentity({ token: 'verify-token', idLast4: '1234' })).resolves.toEqual({
      kind: 'verified',
      message: '身份核验通过',
    })

    await expect(client.fetchIdentity({ token: 'fetch-token' })).resolves.toEqual({
      kind: 'identity-ready',
      message: '身份信息已返回',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })

    expect(fetchImpl).toHaveBeenNthCalledWith(1, '/sign-pay-pro/api/mobile-assistant/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'verify-token', idLast4: '1234', encryptPublicKey: '' }),
    })
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/sign-pay-pro/api/mobile-assistant/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'fetch-token' }),
    })
  })

  it('normalizes non-2xx responses and fetch errors into request-failed results', async () => {
    const nonOkFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ detail: 'upstream exploded' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const throwingFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error('socket hang up'))

    const nonOkClient = createMobileAssistantClient(nonOkFetch)
    const throwingClient = createMobileAssistantClient(throwingFetch)

    await expect(nonOkClient.verifyIdentity({ token: 'verify-token', idLast4: '1234' })).resolves.toEqual({
      kind: 'request-failed',
      message: '数据请求失败，请稍后重试。',
      action: 'retry-fetch',
    })

    await expect(throwingClient.fetchIdentity({ token: 'fetch-token' })).resolves.toEqual({
      kind: 'request-failed',
      message: '数据请求失败，请稍后重试。',
      action: 'retry-fetch',
    })
  })

  it('normalizes malformed backend payloads, partial request-failed payloads, and invalid identity shapes into request-failed results', async () => {
    const invalidJsonFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"kind":"verified"', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const partialVerifyFailureFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ kind: 'request-failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const partialFetchFailureFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ kind: 'request-failed', message: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const missingFieldFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          kind: 'identity-ready',
          message: '身份信息已返回',
          identity: {
            displayName: '张三',
            maskedMobile: '138****0000',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(createMobileAssistantClient(invalidJsonFetch).verifyIdentity({ token: 'verify-token', idLast4: '1234' })).resolves.toEqual({
      kind: 'request-failed',
      message: '数据返回异常，请稍后重试。',
      action: 'retry-fetch',
    })

    await expect(
      createMobileAssistantClient(partialVerifyFailureFetch).verifyIdentity({ token: 'verify-token', idLast4: '1234' }),
    ).resolves.toEqual({
      kind: 'request-failed',
      message: '数据返回异常，请稍后重试。',
      action: 'retry-fetch',
    })

    await expect(createMobileAssistantClient(missingFieldFetch).fetchIdentity({ token: 'fetch-token' })).resolves.toEqual({
      kind: 'request-failed',
      message: '数据返回异常，请稍后重试。',
      action: 'retry-fetch',
    })

    await expect(createMobileAssistantClient(partialFetchFailureFetch).fetchIdentity({ token: 'fetch-token' })).resolves.toEqual({
      kind: 'request-failed',
      message: '数据返回异常，请稍后重试。',
      action: 'retry-fetch',
    })
  })


  it('returns backend-normalized business results without leaking extra vendor-facing fields', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          kind: 'identity-ready',
          message: '身份信息已返回',
          identity: {
            displayName: '张三',
            maskedMobile: '138****0000',
            maskedIdCard: '110101********1234',
          },
          vendorPayload: { openBodySig: 'secret' },
          accessToken: 'should-not-leak',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const result = await createMobileAssistantClient(fetchImpl).fetchIdentity({ token: 'fetch-token' })

    expect(result).toEqual({
      kind: 'identity-ready',
      message: '身份信息已返回',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })
    expect(result).not.toHaveProperty('vendorPayload')
    expect(result).not.toHaveProperty('accessToken')
  })

  it('decrypts encrypted identity payloads locally without sending idLast4 to the BFF body', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          kind: 'identity-ready',
          message: '身份信息已返回',
          identity: {
            encryptedName: '81e14c9984617e662117ca545d7adf04',
            encryptedMobile: '2148c59fb4a7085a0e1c1224ef025381',
            encryptedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const result = await createMobileAssistantClient(fetchImpl).fetchIdentity({ token: 'fetch-token', idLast4: '1718' })

    expect(result).toEqual({
      kind: 'identity-ready',
      message: '身份信息已返回',
      identity: {
        displayName: '徐三',
        maskedMobile: '15971413742',
        maskedIdCard: '530125199203241718',
      },
    })
    expect(JSON.stringify(result)).not.toContain('81e14c9984617e662117ca545d7adf04')
    expect(JSON.stringify(result)).not.toContain('2148c59fb4a7085a0e1c1224ef025381')
    expect(JSON.stringify(result)).not.toContain('67e43ccf0f591daeebaa0789dc4161da')
    expect(fetchImpl).toHaveBeenCalledWith(
      '/sign-pay-pro/api/mobile-assistant/identity',
      expect.objectContaining({
        body: JSON.stringify({ token: 'fetch-token' }),
      }),
    )
  })

  it('sends encryptPublicKey in the verify POST body when provided', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ kind: 'verified', message: '核验通过' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = createMobileAssistantClient(fetchImpl)

    await client.verifyIdentity({
      token: 'tok-1',
      idLast4: 'ABCD',
      encryptPublicKey: 'pk-from-sdk',
    })

    expect(fetchImpl).toHaveBeenCalledWith(
      '/sign-pay-pro/api/mobile-assistant/verify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'tok-1', idLast4: 'ABCD', encryptPublicKey: 'pk-from-sdk' }),
      }),
    )
  })

  it('defaults encryptPublicKey to empty string when not provided', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ kind: 'verified', message: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = createMobileAssistantClient(fetchImpl)

    await client.verifyIdentity({ token: 'tok-1', idLast4: 'ABCD' })

    expect(fetchImpl).toHaveBeenCalledWith(
      '/sign-pay-pro/api/mobile-assistant/verify',
      expect.objectContaining({
        body: JSON.stringify({ token: 'tok-1', idLast4: 'ABCD', encryptPublicKey: '' }),
      }),
    )
  })
})
