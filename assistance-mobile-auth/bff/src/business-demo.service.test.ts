import { beforeEach, describe, expect, it, vi } from 'vitest'

const runChinaumsAssistantRequest = vi.hoisted(() => vi.fn())

vi.mock('./chinaums-assistant-client.js', () => ({
  runChinaumsAssistantRequest,
}))

import { BusinessDemoService } from './business-demo.service.js'

describe('BusinessDemoService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.CHINAUMS_ASSISTANT_APP_ID = 'base-page-app-id'
    process.env.CHINAUMS_ASSISTANT_APP_KEY = 'base-page-app-key'
    process.env.CHINAUMS_ASSISTANT_PRIVATE_KEY = 'base-page-private-key'
  })

  it('calls check with token, idLast4, and keyA mapped to encryptPublicKey', async () => {
    runChinaumsAssistantRequest.mockResolvedValue({
      httpStatus: 200,
      httpBody: JSON.stringify({ errCode: '20000000', errInfo: '成功' }),
      decryptedData: JSON.stringify({ respCode: '00', respMsg: '核验通过', detailRespCode: '0000' }),
    })

    await expect(
      new BusinessDemoService().checkIdentity({
        token: 'sdk-token',
        idLast4: '1234',
        keyA: 'sdk-key-a',
      }),
    ).resolves.toEqual({
      kind: 'verified',
      message: '核验通过',
    })

    expect(runChinaumsAssistantRequest).toHaveBeenCalledWith(
      'check',
      expect.objectContaining({
        appId: 'base-page-app-id',
        appKey: 'base-page-app-key',
        privateKey: 'base-page-private-key',
      }),
      {
        token: 'sdk-token',
        idLast4: '1234',
        encryptPublicKey: 'sdk-key-a',
      },
    )
  })

  it('returns encrypted identity fields from query without SM4 decrypting them', async () => {
    runChinaumsAssistantRequest.mockResolvedValue({
      httpStatus: 200,
      httpBody: JSON.stringify({ errCode: '20000000', errInfo: '成功' }),
      decryptedData: JSON.stringify({
        respCode: '00',
        respMsg: '查询成功',
        detailRespCode: '0000',
        name: '81e14c9984617e662117ca545d7adf04',
        mobile: '2148c59fb4a7085a0e1c1224ef025381',
        idCard: '67e43ccf0f591daeebaa0789dc4161da',
      }),
    })

    await expect(new BusinessDemoService().queryIdentity({ token: 'sdk-token' })).resolves.toEqual({
      kind: 'identity-encrypted',
      message: '查询成功',
      identity: {
        encryptedName: '81e14c9984617e662117ca545d7adf04',
        encryptedMobile: '2148c59fb4a7085a0e1c1224ef025381',
        encryptedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
      },
    })
    expect(JSON.stringify(runChinaumsAssistantRequest.mock.results)).not.toContain('徐三')
  })

  it('returns identity pending when the vendor response is accepted but not complete', async () => {
    runChinaumsAssistantRequest.mockResolvedValue({
      httpStatus: 200,
      httpBody: JSON.stringify({ errCode: '20000000', errInfo: '成功' }),
      decryptedData: JSON.stringify({
        respCode: '00',
        respMsg: '查询受理成功',
        detailRespCode: '1001',
        detailRespMsg: '身份信息处理中',
      }),
    })

    await expect(new BusinessDemoService().queryIdentity({ token: 'sdk-token' })).resolves.toEqual({
      kind: 'identity-pending',
      message: '身份信息处理中',
      action: 'refresh-result',
    })
  })

  it('normalizes vendor failures for check and query', async () => {
    runChinaumsAssistantRequest.mockResolvedValueOnce({
      httpStatus: 200,
      httpBody: JSON.stringify({ errCode: '20000000', errInfo: '成功' }),
      decryptedData: JSON.stringify({
        respCode: '01',
        respMsg: '失败',
        detailRespCode: '1001',
        detailRespMsg: '后四位不匹配',
      }),
    })
    runChinaumsAssistantRequest.mockResolvedValueOnce({
      httpStatus: 200,
      httpBody: JSON.stringify({ errCode: '50000000', errInfo: '处理中' }),
      decryptedData: '',
    })

    await expect(
      new BusinessDemoService().checkIdentity({
        token: 'sdk-token',
        idLast4: '9999',
        keyA: 'sdk-key-a',
      }),
    ).resolves.toEqual({
      kind: 'verify-failed',
      message: '后四位不匹配',
      action: 'retry-auth',
      code: '1001',
    })

    await expect(new BusinessDemoService().queryIdentity({ token: 'sdk-token' })).resolves.toEqual({
      kind: 'identity-failed',
      message: '处理中',
      action: 'retry-fetch',
      code: '50000000',
    })
  })
})
