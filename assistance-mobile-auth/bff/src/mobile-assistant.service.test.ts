import { beforeEach, describe, expect, it, vi } from 'vitest'

const runChinaumsAssistantRequest = vi.hoisted(() => vi.fn())

vi.mock('./chinaums-assistant-client.js', () => ({
  runChinaumsAssistantRequest,
}))

import { MobileAssistantService } from './mobile-assistant.service.js'

describe('MobileAssistantService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.CHINAUMS_ASSISTANT_APP_ID = 'test-app-id'
    process.env.CHINAUMS_ASSISTANT_APP_KEY = 'test-app-key'
    process.env.CHINAUMS_ASSISTANT_PRIVATE_KEY = 'test-private-key'
  })

  it('normalizes successful check responses from the ChinaUMS OpenAPI client', async () => {
    runChinaumsAssistantRequest.mockResolvedValue({
      httpStatus: 200,
      httpBody: JSON.stringify({ errCode: '20000000', errInfo: '成功' }),
      decryptedData: JSON.stringify({ respCode: '00', respMsg: '查询成功', detailRespCode: '0000' }),
    })

    await expect(new MobileAssistantService().verifyIdentity({ token: 'token-1', idLast4: '1234' })).resolves.toEqual({
      kind: 'verified',
      message: '查询成功',
    })

    expect(runChinaumsAssistantRequest).toHaveBeenCalledWith('check', expect.objectContaining({
      appId: 'test-app-id',
      appKey: 'test-app-key',
      privateKey: 'test-private-key',
    }), {
      token: 'token-1',
      idLast4: '1234',
    })
  })

  it('forwards encryptPublicKey from request to chinaums check action', async () => {
    runChinaumsAssistantRequest.mockResolvedValue({
      httpStatus: 200,
      httpBody: JSON.stringify({ errCode: '20000000', errInfo: '' }),
      decryptedData: JSON.stringify({ detailRespCode: '0000', detailRespMsg: '核验通过' }),
    })

    await new MobileAssistantService().verifyIdentity({
      token: 'tok-x',
      idLast4: 'ABCD',
      encryptPublicKey: 'PUBKEY-FROM-SDK',
    })

    expect(runChinaumsAssistantRequest).toHaveBeenCalledWith(
      'check',
      expect.any(Object),
      expect.objectContaining({
        token: 'tok-x',
        idLast4: 'ABCD',
        encryptPublicKey: 'PUBKEY-FROM-SDK',
      }),
    )
  })

  it('returns successful identity responses with raw encrypted business fields for frontend decrypt', async () => {
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

    const result = await new MobileAssistantService().fetchIdentity({ token: 'token-1' })

    expect(result).toEqual({
      kind: 'identity-ready',
      message: '查询成功',
      identity: {
        encryptedName: '81e14c9984617e662117ca545d7adf04',
        encryptedMobile: '2148c59fb4a7085a0e1c1224ef025381',
        encryptedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
      },
    })
    expect(JSON.stringify(result)).not.toContain('徐三')
    expect(JSON.stringify(result)).not.toContain('15971413742')
  })
})
