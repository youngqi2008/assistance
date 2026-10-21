import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IdentityFlowSnapshot } from '../services/identityFlow'
import {
  ASSISTANCE_AUTH_ERROR,
  ASSISTANCE_AUTH_SUCCESS,
  type AssistanceAuthMessage,
} from '../wrapper/verificationBridge'

type MockServiceInput = {
  token: string
  idLast4?: string
  onTransition?: (snapshot: IdentityFlowSnapshot) => void
}

const {
  mockLoadMobileAuthSdkResources,
  mockCreateMobileAuthSdkFacade,
  mockGetMobileAuthSdkConfig,
  mockCreateMobileAssistantClient,
  mockCreateIdentityFlowService,
  mockIdentityFlowRun,
  mockIdentityFlowResumeFetch,
  mockFacade,
} = vi.hoisted(() => ({
  mockLoadMobileAuthSdkResources: vi.fn(),
  mockCreateMobileAuthSdkFacade: vi.fn(),
  mockGetMobileAuthSdkConfig: vi.fn(),
  mockCreateMobileAssistantClient: vi.fn(),
  mockCreateIdentityFlowService: vi.fn(),
  mockIdentityFlowRun: vi.fn<(input: MockServiceInput) => Promise<IdentityFlowSnapshot>>(),
  mockIdentityFlowResumeFetch: vi.fn<(input: MockServiceInput) => Promise<IdentityFlowSnapshot>>(),
  mockFacade: {
    showAuthPage: vi.fn(),
    initControl: vi.fn(),
    clearControl: vi.fn(),
    getAuthResult: vi.fn(),
    updateSubmitBtnStatus: vi.fn(),
  },
}))

vi.mock('../sdk/resourceLoader', () => ({
  loadMobileAuthSdkResources: mockLoadMobileAuthSdkResources,
}))

vi.mock('../sdk/mobileAuthFacade', () => ({
  createMobileAuthSdkFacade: mockCreateMobileAuthSdkFacade,
}))

vi.mock('../sdk/config', () => ({
  getMobileAuthSdkConfig: mockGetMobileAuthSdkConfig,
}))

vi.mock('../api/mobileAssistantClient', () => ({
  createMobileAssistantClient: mockCreateMobileAssistantClient,
}))

vi.mock('../services/identityFlow', () => ({
  createIdentityFlowService: mockCreateIdentityFlowService,
}))

import { AuthReviewPage } from './AuthReviewPage'

function getReadyConfig(debugEntry = false) {
  return {
    enabled: true,
    mode: 'live',
    jsUrl: 'data:text/javascript,window.__unitTestMobileAuthSdk=true',
    cssUrl: '',
    debugEntry,
    authParams: {
      version: '3.0',
      appId: 'test-app-id',
      sign: 'test-sign',
      traceId: 'test-trace-id',
      timestamp: '20260102030405006',
      authType: '0',
      scope: '3ElementsAuthAssistFill',
    },
  }
}

function getInitControlRequest() {
  const request = vi.mocked(mockFacade.initControl).mock.calls.at(0)?.[0]
  expect(request).toBeDefined()
  return request
}

function typeIdLast4() {
  fireEvent.click(screen.getByRole('button', { name: '输入 1', hidden: true }))
  fireEvent.click(screen.getByRole('button', { name: '输入 2', hidden: true }))
  fireEvent.click(screen.getByRole('button', { name: '输入 3', hidden: true }))
  fireEvent.click(screen.getByRole('button', { name: '输入 4', hidden: true }))
}

async function completeViaReadySdk(token = 'phase4-token', keyA = 'phase4-key-a') {
  await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(mockCreateMobileAuthSdkFacade).toHaveBeenCalledTimes(1))

  // showAuthPage 在 sdk ready + params ready 后自动发起；UI 在 authReady 之前停留在加载骨架。
  await waitFor(() => expect(mockFacade.showAuthPage).toHaveBeenCalledTimes(1))
  const showAuthPageRequest = vi.mocked(mockFacade.showAuthPage).mock.calls[0]?.[0]
  expect(showAuthPageRequest).toBeDefined()

  await act(async () => {
    showAuthPageRequest?.success?.({ code: '103000' })
  })

  const initControlRequest = getInitControlRequest()

  await act(async () => {
    initControlRequest?.authReady?.({})
  })

  await screen.findByLabelText('身份证后四位第 1 位')
  typeIdLast4()

  expect(initControlRequest?.beforeSubmit?.()).toBe(true)

  await act(async () => {
    initControlRequest?.success?.({ code: '103000', token, encryptPublicKey: keyA })
  })
}

function getPostedMessages() {
  return vi.mocked(window.parent.postMessage).mock.calls.map((call) => call[0] as AssistanceAuthMessage)
}

describe('AuthReviewPage data flow', () => {
  beforeEach(() => {
    mockLoadMobileAuthSdkResources.mockReset()
    mockCreateMobileAuthSdkFacade.mockReset()
    mockGetMobileAuthSdkConfig.mockReset()
    mockCreateMobileAssistantClient.mockReset()
    mockCreateIdentityFlowService.mockReset()
    mockIdentityFlowRun.mockReset()
    mockIdentityFlowResumeFetch.mockReset()

    Object.values(mockFacade).forEach((spy) => spy.mockReset())
    window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-data-flow')
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined)

    mockGetMobileAuthSdkConfig.mockReturnValue(getReadyConfig(false))
    mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
    mockCreateMobileAssistantClient.mockReturnValue({})
    mockCreateIdentityFlowService.mockReturnValue({
      run: mockIdentityFlowRun,
      resumeFetch: mockIdentityFlowResumeFetch,
    })
    mockIdentityFlowRun.mockResolvedValue({
      status: 'complete',
      title: '身份信息已返回',
      description: '授权结果已同步到当前页面。',
      resultKind: 'identity-ready',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })
    mockIdentityFlowResumeFetch.mockResolvedValue({
      status: 'complete',
      title: '身份信息已返回',
      description: '授权结果已同步到当前页面。',
      resultKind: 'identity-ready',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    })
  })

  it('posts iframe success payload directly from initControl success without entering the data lane', async () => {
    render(<AuthReviewPage />)

    await completeViaReadySdk()

    await waitFor(() => expect(getPostedMessages()).toContainEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_SUCCESS,
      sessionId: 'assistance-auth-data-flow',
      payload: {
        status: 'success',
        token: 'phase4-token',
        idLast4: '1234',
        keyA: 'phase4-key-a',
        requestId: undefined,
        message: '验证完成',
      },
    })))
    expect(mockIdentityFlowRun).not.toHaveBeenCalled()
    expect(JSON.stringify(getPostedMessages())).not.toContain('张三')
  })

  it('posts SDK_UNAVAILABLE instead of running the test-token data lane when the Mobile JSSDK is not available', async () => {
    mockGetMobileAuthSdkConfig.mockReturnValue({
      enabled: false,
      mode: 'mock',
      jsUrl: '',
      cssUrl: '',
      debugEntry: false,
      authParams: {
        version: '',
        appId: '',
        sign: '',
        traceId: '',
        timestamp: '',
        authType: '',
        scope: '',
      },
    })
    mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'disabled' })

    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
    await screen.findByLabelText('身份证后四位第 1 位')
    typeIdLast4()

    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: '确认' }))
    })

    await waitFor(() => expect(getPostedMessages()).toContainEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_ERROR,
      sessionId: 'assistance-auth-data-flow',
      payload: expect.objectContaining({
        code: 'SDK_UNAVAILABLE',
        message: '授权服务暂不可用，请稍后重试。',
      }),
    })))
    expect(mockIdentityFlowRun).not.toHaveBeenCalled()
    expect(mockFacade.showAuthPage).not.toHaveBeenCalled()
  })

  it('posts a safe error when backend verification fails without exposing raw context', async () => {
    render(<AuthReviewPage />)

    await completeViaReadySdk('', 'phase4-key-a')

    await waitFor(() => expect(getPostedMessages()).toContainEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_ERROR,
      sessionId: 'assistance-auth-data-flow',
      payload: expect.objectContaining({
        code: 'TOKEN_MISSING',
        message: '本次授权未返回有效 token，请重新授权后再试。',
      }),
    })))
    expect(mockIdentityFlowRun).not.toHaveBeenCalled()
    expect(mockIdentityFlowResumeFetch).not.toHaveBeenCalled()
    expect(screen.queryByText('查看授权结果')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '确认身份信息' })).toBeInTheDocument()
  })

  it('posts a safe error when identity fetch fails and does not expose retry controls in the iframe', async () => {
    render(<AuthReviewPage />)

    await completeViaReadySdk('phase4-token', '')

    expect(mockIdentityFlowRun).not.toHaveBeenCalled()
    expect(mockIdentityFlowResumeFetch).not.toHaveBeenCalled()
    await waitFor(() => expect(getPostedMessages()).toContainEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_ERROR,
      sessionId: 'assistance-auth-data-flow',
      payload: expect.objectContaining({
        code: 'KEY_A_MISSING',
        message: '本次授权未返回 keyA，请重新授权后再试。',
      }),
    })))
    expect(screen.queryByRole('button', { name: '重新获取结果' })).not.toBeInTheDocument()
  })

  it('keeps the auxiliary tray hidden by default unless debugEntry is enabled', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
    expect(document.querySelector('[data-sdk-debug-entry="hidden"]')).toBeInTheDocument()

    cleanup()
    mockGetMobileAuthSdkConfig.mockReturnValue(getReadyConfig(true))
    render(<AuthReviewPage />)

    await waitFor(() => expect(document.querySelector('[data-sdk-debug-entry="enabled"]')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: '展开' })).not.toBeInTheDocument()
  })
})
