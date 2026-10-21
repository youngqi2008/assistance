import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockCreateSdkSessionClient, mockSessionClient } = vi.hoisted(() => ({
  mockCreateSdkSessionClient: vi.fn(),
  mockSessionClient: {
    queryResult: vi.fn(),
  },
}))

vi.mock('../api/sdkSessionClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/sdkSessionClient')>()
  return {
    ...actual,
    createSdkSessionClient: mockCreateSdkSessionClient,
  }
})

import { TestCallbackPage } from './TestCallbackPage'

describe('TestCallbackPage', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/sign-pay-pro/test-callback?authToken=sft_auth_test')
    vi.stubEnv('VITE_SFT_CUSTOMER_APP_ID', 'customer-app-id')
    vi.stubEnv('VITE_SFT_CUSTOMER_APP_KEY', 'customer-app-key')
    mockCreateSdkSessionClient.mockReset()
    mockSessionClient.queryResult.mockReset()
    mockCreateSdkSessionClient.mockReturnValue(mockSessionClient)
    mockSessionClient.queryResult.mockResolvedValue({
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

  it('queries identity by authToken and renders the test callback result', async () => {
    render(<TestCallbackPage />)

    expect(screen.getByRole('heading', { name: '授权回跳测试页' })).toBeInTheDocument()
    await waitFor(() => expect(mockSessionClient.queryResult).toHaveBeenCalledWith({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      authToken: 'sft_auth_test',
    }))
    expect(screen.getByText('张三')).toBeInTheDocument()
    expect(screen.getByText('138****0000')).toBeInTheDocument()
    expect(screen.getByText('110101********1234')).toBeInTheDocument()
  })

  it('decrypts encrypted-looking query identity before rendering the callback result', async () => {
    mockSessionClient.queryResult.mockResolvedValueOnce({
      kind: 'identity-ready',
      message: '真实查询结果已返回。',
      identity: {
        displayName: '81e14c9984617e662117ca545d7adf04',
        maskedMobile: '2148c59fb4a7085a0e1c1224ef025381',
        maskedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
      },
      mock: false,
    })

    render(<TestCallbackPage />)

    await waitFor(() => expect(screen.getByText('徐三')).toBeInTheDocument())
    expect(screen.getByText('15971413742')).toBeInTheDocument()
    expect(screen.getByText('53012519920324')).toBeInTheDocument()
    expect(screen.queryByText('81e14c9984617e662117ca545d7adf04')).not.toBeInTheDocument()
    expect(screen.queryByText('2148c59fb4a7085a0e1c1224ef025381')).not.toBeInTheDocument()
    expect(screen.queryByText('67e43ccf0f591daeebaa0789dc4161da')).not.toBeInTheDocument()
  })

  it('shows a local error when authToken is missing', () => {
    window.history.replaceState(null, '', '/sign-pay-pro/test-callback')

    render(<TestCallbackPage />)

    expect(screen.getByText('缺少 authToken，无法查询授权结果。')).toBeInTheDocument()
    expect(mockSessionClient.queryResult).not.toHaveBeenCalled()
  })

  it('shows a local error instead of falling back to hardcoded customer credentials', async () => {
    vi.stubEnv('VITE_SFT_CUSTOMER_APP_ID', '')
    vi.stubEnv('VITE_SFT_CUSTOMER_APP_KEY', '')

    render(<TestCallbackPage />)

    await waitFor(() => expect(screen.getByText('缺少客户 appId/appKey，请通过 VITE_SFT_CUSTOMER_APP_ID / VITE_SFT_CUSTOMER_APP_KEY 配置。')).toBeInTheDocument())
    expect(mockSessionClient.queryResult).not.toHaveBeenCalled()
  })
})
