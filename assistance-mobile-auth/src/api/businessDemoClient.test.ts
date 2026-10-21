import { describe, expect, it, vi } from 'vitest'

import { createBusinessDemoClient } from './businessDemoClient'

describe('createBusinessDemoClient', () => {
  it.each([
    { status: 200, statusText: 'OK', body: '{"kind":"identity-failed","message":"系统异常","action":"retry-fetch","code":"B500"}', kind: 'identity-failed' },
    { status: 502, statusText: 'Bad Gateway', body: '{"message":"上游查询失败","code":"UPSTREAM_502"}', kind: 'request-failed' },
    { status: 503, statusText: 'Service Unavailable', body: '<html>upstream temporarily unavailable</html>', kind: 'request-failed' },
    { status: 200, statusText: 'OK', body: 'not JSON', kind: 'request-failed' },
    { status: 200, statusText: 'OK', body: '{"unexpected":"business payload"}', kind: 'request-failed' },
  ])('retains query HTTP $status and the actual response body', async ({ status, statusText, body, kind }) => {
    const response = new Response(body, { status, statusText })
    const text = vi.spyOn(response, 'text')
    const client = createBusinessDemoClient(vi.fn<typeof fetch>().mockResolvedValue(response))
    const result = await client.queryIdentity({ token: 'never-record-this-token' })
    expect(result.kind).toBe(kind)
    expect(result.http).toMatchObject({ status, statusText, body })
    expect(JSON.stringify(result.http)).not.toContain('never-record-this-token')
    expect(text).toHaveBeenCalledOnce()
  })

  it('distinguishes fetch rejection from failure reading an already received HTTP response', async () => {
    const network = await createBusinessDemoClient(vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')))
      .checkIdentity({ token: 'secret-token', idLast4: '1234', keyA: 'secret-key-a' })
    expect(network).toMatchObject({ kind: 'request-failed', http: { status: null, statusText: null, body: null, error: 'Failed to fetch' } })
    expect(JSON.stringify(network.http)).not.toMatch(/secret-token|secret-key-a|1234/)
    const response = new Response('', { status: 502, statusText: 'Bad Gateway' })
    vi.spyOn(response, 'text').mockRejectedValue(new Error('response stream interrupted'))
    const readFailure = await createBusinessDemoClient(vi.fn<typeof fetch>().mockResolvedValue(response)).queryIdentity({ token: 'secret-token' })
    expect(readFailure).toMatchObject({ kind: 'request-failed', http: { status: 502, statusText: 'Bad Gateway', body: null, error: 'response stream interrupted' } })
  })

  it('posts check and query requests to business-demo endpoints', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ kind: 'verified', message: '核验通过' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        kind: 'identity-encrypted',
        message: '查询成功',
        identity: {
          encryptedName: 'name-cipher',
          encryptedMobile: 'mobile-cipher',
          encryptedIdCard: 'id-cipher',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

    const client = createBusinessDemoClient(fetchImpl)

    await expect(client.checkIdentity({
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
    })).resolves.toMatchObject({ kind: 'verified', message: '核验通过' })
    await expect(client.queryIdentity({ token: 'sdk-token' })).resolves.toMatchObject({
      kind: 'identity-encrypted',
      message: '查询成功',
      identity: {
        encryptedName: 'name-cipher',
        encryptedMobile: 'mobile-cipher',
        encryptedIdCard: 'id-cipher',
      },
    })

    expect(fetchImpl).toHaveBeenNthCalledWith(1, '/sign-pay-pro/api/business-demo/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'sdk-token', idLast4: '1234', keyA: 'sdk-key-a' }),
    })
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/sign-pay-pro/api/business-demo/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'sdk-token' }),
    })
  })

  it('normalizes request failures and malformed payloads', async () => {
    const badStatusFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 500 }))
    const malformedFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ kind: 'identity-encrypted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    const invalidJsonFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"kind":"verified"', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(createBusinessDemoClient(badStatusFetch).checkIdentity({
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
    })).resolves.toMatchObject({
      kind: 'request-failed',
      message: '内部基座联调请求失败，请稍后重试。',
      action: 'retry-fetch',
    })

    await expect(createBusinessDemoClient(malformedFetch).queryIdentity({ token: 'sdk-token' })).resolves.toMatchObject({
      kind: 'request-failed',
      message: '内部基座联调返回异常，请稍后重试。',
      action: 'retry-fetch',
    })

    await expect(createBusinessDemoClient(invalidJsonFetch).checkIdentity({
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
    })).resolves.toMatchObject({
      kind: 'request-failed',
      message: '内部基座联调返回异常，请稍后重试。',
      action: 'retry-fetch',
    })
  })

  it('normalizes verify-failed, identity-pending, and identity-failed payloads', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        kind: 'verify-failed',
        message: '核验失败',
        action: 'retry-auth',
        code: 'AUTH_401',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        kind: 'identity-pending',
        message: '结果处理中',
        action: 'refresh-result',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        kind: 'identity-failed',
        message: '查询失败',
        action: 'retry-fetch',
        code: 'BUSINESS_500',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

    const client = createBusinessDemoClient(fetchImpl)

    await expect(client.checkIdentity({
      token: 'sdk-token',
      idLast4: '1234',
      keyA: 'sdk-key-a',
    })).resolves.toMatchObject({
      kind: 'verify-failed',
      message: '核验失败',
      action: 'retry-auth',
      code: 'AUTH_401',
    })

    await expect(client.queryIdentity({ token: 'sdk-token' })).resolves.toMatchObject({
      kind: 'identity-pending',
      message: '结果处理中',
      action: 'refresh-result',
    })

    await expect(client.queryIdentity({ token: 'sdk-token' })).resolves.toMatchObject({
      kind: 'identity-failed',
      message: '查询失败',
      action: 'retry-fetch',
      code: 'BUSINESS_500',
    })
  })
})
