import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ASSISTANCE_AUTH_CANCEL,
  ASSISTANCE_AUTH_CONFIG,
  ASSISTANCE_AUTH_ERROR,
  ASSISTANCE_AUTH_ERROR_NOTICE,
  ASSISTANCE_AUTH_MESSAGE_SOURCE,
  ASSISTANCE_AUTH_PHONE_READY,
  ASSISTANCE_AUTH_READY,
  ASSISTANCE_AUTH_RESIZE,
  ASSISTANCE_AUTH_STATE_CHANGE,
  ASSISTANCE_AUTH_STYLE,
  ASSISTANCE_AUTH_SUCCESS,
  createAssistanceAuthMessage,
  type AssistanceAuthMessage,
} from '../wrapper/verificationBridge'
import type { IdentityFlowSnapshot } from '../services/identityFlow'
import * as uiConfigModule from '../wrapper/uiConfig'
import {
  DONGFANGDADI_V2_APP_ID,
  HAIKE_V2_APP_ID,
  HENGDA_V2_APP_ID,
  TIANTIANYOUBAO_V2_APP_ID,
} from '../agreements/appAgreementRegistry'

const originalLocation = window.location

type MockServiceInput = {
  token: string
  idLast4?: string
  onTransition?: (snapshot: IdentityFlowSnapshot) => void
}

const {
  mockLoadMobileAuthSdkResources,
  mockResetMobileAuthSdkLoader,
  mockCreateMobileAuthSdkFacade,
  mockGetMobileAuthSdkConfig,
  mockCreateMobileAssistantClient,
  mockCreateSdkSessionClient,
  mockSdkSessionComplete,
  mockSdkSessionResolve,
  mockCreateIdentityFlowService,
  mockIdentityFlowRun,
  mockFacade,
} = vi.hoisted(() => ({
  mockLoadMobileAuthSdkResources: vi.fn(),
  mockResetMobileAuthSdkLoader: vi.fn(),
  mockCreateMobileAuthSdkFacade: vi.fn(),
  mockGetMobileAuthSdkConfig: vi.fn(),
  mockCreateMobileAssistantClient: vi.fn(),
  mockCreateSdkSessionClient: vi.fn(),
  mockSdkSessionComplete: vi.fn(),
  mockSdkSessionResolve: vi.fn(),
  mockCreateIdentityFlowService: vi.fn(),
  mockIdentityFlowRun: vi.fn<(input: MockServiceInput) => Promise<IdentityFlowSnapshot>>(),
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
  resetMobileAuthSdkLoader: mockResetMobileAuthSdkLoader,
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

vi.mock('../api/sdkSessionClient', () => ({
  createSdkSessionClient: mockCreateSdkSessionClient,
}))

vi.mock('../services/identityFlow', () => ({
  createIdentityFlowService: mockCreateIdentityFlowService,
}))

import { AuthVerificationWindow } from './AuthVerificationWindow'

function getPostedMessages() {
  return vi.mocked(window.parent.postMessage).mock.calls.map((call) => call[0] as AssistanceAuthMessage)
}

function lastPostedMessage() {
  return getPostedMessages().at(-1)
}

function postConfigToIframe(payload: unknown, sessionId = 'assistance-auth-test') {
  window.dispatchEvent(new MessageEvent('message', {
    source: window.parent,
    data: createAssistanceAuthMessage(ASSISTANCE_AUTH_CONFIG, sessionId, payload),
  }))
}

function setupExpectedUiConfigUrl() {
  window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&expectsUiConfig=1')
}

function mockWindowLocation(value: Partial<Location> & { assign?: Location['assign']; replace?: Location['replace'] }) {
  Object.defineProperty(window, 'location', {
    value: {
      ...originalLocation,
      ...value,
    },
    writable: true,
    configurable: true,
  })
}

async function enterIdLast4() {
  await screen.findByLabelText('身份证后四位第 1 位')
  fireEvent.click(screen.getByRole('button', { name: '输入 1', hidden: true }))
  fireEvent.click(screen.getByRole('button', { name: '输入 2', hidden: true }))
  fireEvent.click(screen.getByRole('button', { name: '输入 3', hidden: true }))
  fireEvent.click(screen.getByRole('button', { name: '输入 4', hidden: true }))
}

function agreeAllVisibleProtocols() {
  screen.getAllByRole('checkbox').forEach((box) => fireEvent.click(box))
}

async function reachReadyControls() {
  await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
  const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
  await act(async () => {
    initControlRequest?.authReady?.({ code: '103000' })
    await Promise.resolve()
  })
  return initControlRequest
}

async function clickTemporaryAuthorizeButton() {
  await act(async () => {
    fireEvent.click(await screen.findByRole('button', { name: '确认' }))
    await Promise.resolve()
  })
}

function setupReadySdkResource() {
  mockGetMobileAuthSdkConfig.mockReturnValue({
    enabled: true,
    mode: 'live',
    jsUrl: 'https://example.com/mobile-jssdk.js',
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
  mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
  mockFacade.showAuthPage.mockImplementation(({ success }: { success?: (p: { code: string; traceId?: string }) => void }) => {
    success?.({ code: '103000', traceId: 'mobile-trace-id' })
  })
  mockFacade.initControl.mockImplementation(() => undefined)
}

async function completeViaReadySdk(token = 'mobile-token', keyA = 'mobile-key-a') {
  await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
  const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
  await act(async () => {
    initControlRequest?.authReady?.({ code: '103000' })
    await Promise.resolve()
  })
  await enterIdLast4()
  expect(initControlRequest?.beforeSubmit?.()).toBe(true)
  await act(async () => {
    initControlRequest?.success?.({ code: '103000', token, encryptPublicKey: keyA })
    await Promise.resolve()
  })
}

function setupReadyWithToken() {
  window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test')
  setupReadySdkResource()
}

describe('AuthVerificationWindow', () => {
  beforeEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
    window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test')
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined)

    mockLoadMobileAuthSdkResources.mockReset()
    mockResetMobileAuthSdkLoader.mockReset()
    mockCreateMobileAuthSdkFacade.mockReset()
    mockGetMobileAuthSdkConfig.mockReset()
    mockCreateMobileAssistantClient.mockReset()
    mockCreateSdkSessionClient.mockReset()
    mockSdkSessionComplete.mockReset()
    mockSdkSessionResolve.mockReset()
    mockCreateIdentityFlowService.mockReset()
    mockIdentityFlowRun.mockReset()
    Object.values(mockFacade).forEach((spy) => spy.mockReset())

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
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
    mockCreateMobileAssistantClient.mockReturnValue({})
    mockCreateSdkSessionClient.mockReturnValue({
      completeSession: mockSdkSessionComplete,
      resolveSession: mockSdkSessionResolve,
    })
    mockSdkSessionComplete.mockResolvedValue({
      kind: 'completed',
      authResultId: 'sft_result_test',
      authCode: 'sft_code_test',
      authToken: 'sft_auth_test',
      expiresInSeconds: 600,
      message: '认证已完成。',
    })
    mockSdkSessionResolve.mockResolvedValue({
      kind: 'ready',
      params: {
        appId: 'mobile-app-id',
        sign: 'mobile-sign',
        traceId: 'mobile-trace-id',
        timestamp: '20260508010101001',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
      },
      expiresInSeconds: 600,
      message: '移动 JSSDK 参数已准备就绪（mock）。',
      mock: true,
    })
    mockCreateIdentityFlowService.mockReturnValue({
      run: mockIdentityFlowRun,
      resumeFetch: vi.fn(),
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
  })

  it('posts ready with the session id after mount', async () => {
    render(<AuthVerificationWindow />)

    await waitFor(() => {
      expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        source: ASSISTANCE_AUTH_MESSAGE_SOURCE,
        type: ASSISTANCE_AUTH_READY,
        sessionId: 'assistance-auth-test',
      }))
    })
  })

  it('waits for expected ui config before loading mobile JSSDK resources', async () => {
    setupExpectedUiConfigUrl()

    render(<AuthVerificationWindow />)

    expect(await screen.findByRole('status', { name: '授权配置加载中' })).toBeInTheDocument()
    expect(mockLoadMobileAuthSdkResources).not.toHaveBeenCalled()

    await act(async () => {
      postConfigToIframe({ ui: { themeColor: '#1677ff' } })
    })

    await waitFor(() => expect(screen.queryByRole('status', { name: '授权配置加载中' })).not.toBeInTheDocument())
    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
  })

  it('falls back to default ui when expected config does not arrive within 2 seconds', async () => {
    vi.useFakeTimers()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const normalizeSpy = vi.spyOn(uiConfigModule, 'normalizeAssistanceUiConfig')

    try {
      setupExpectedUiConfigUrl()

      render(<AuthVerificationWindow />)

      expect(screen.getByRole('status', { name: '授权配置加载中' })).toBeInTheDocument()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000)
      })

      vi.useRealTimers()
      await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
      expect(warnSpy).toHaveBeenCalledWith('[AssistanceMobileAuth] UI config was expected but not received; using defaults.')

      await act(async () => {
        postConfigToIframe({ ui: { themeColor: '#1677ff' } })
      })

      // 1 call is the mount-time profileUi normalization (no appId here → normalizes {}).
      // The late message after the gate settled must not add another call.
      expect(normalizeSpy).toHaveBeenCalledTimes(1)
    } finally {
      normalizeSpy.mockRestore()
      warnSpy.mockRestore()
      vi.useRealTimers()
    }
  })

  it('does not process a duplicate ui config message after the gate settles', async () => {
    const normalizeSpy = vi.spyOn(uiConfigModule, 'normalizeAssistanceUiConfig')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    setupExpectedUiConfigUrl()

    try {
      render(<AuthVerificationWindow />)

      await act(async () => {
        postConfigToIframe({ ui: { themeColor: '#1677ff' } })
      })
      await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
      // 2 calls: mount-time profileUi normalization (no appId here → normalizes {}) + the incoming config message.
      expect(normalizeSpy).toHaveBeenCalledTimes(2)

      await act(async () => {
        postConfigToIframe({ ui: { themeColor: '#f5222d' } })
      })

      expect(normalizeSpy).toHaveBeenCalledTimes(2)
      expect(warnSpy).toHaveBeenCalledWith('[AssistanceMobileAuth] Ignored late UI config message.')
    } finally {
      normalizeSpy.mockRestore()
      warnSpy.mockRestore()
    }
  })

  it('bypasses the expected ui config gate in direct H5 auth mode', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test&expectsUiConfig=1',
    })
    setupReadySdkResource()

    render(<AuthVerificationWindow />)

    expect(screen.queryByRole('status', { name: '授权配置加载中' })).not.toBeInTheDocument()
    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
  })

  it('ignores config messages in direct H5 auth mode while resources load', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test&expectsUiConfig=1',
    })
    setupReadySdkResource()

    render(<AuthVerificationWindow />)
    await act(async () => {
      postConfigToIframe({
        ui: {
          texts: { headerTitle: { text: '不应应用的标题' } },
          agreements: [{ title: '《不应显示的客户协议》', url: 'https://merchant.example/ignored' }],
        },
      })
      await Promise.resolve()
    })

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('不应应用的标题')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '《不应显示的客户协议》' })).not.toBeInTheDocument()
  })

  it('renders custom agreement checks after the SDK agreement slot and gates the fallback confirmation', async () => {
    setupExpectedUiConfigUrl()

    render(<AuthVerificationWindow />)
    await act(async () => {
      postConfigToIframe({
        ui: {
          texts: { footerNote: { text: '客户页脚说明' } },
          agreements: [
            { title: '《客户隐私政策》', url: 'https://merchant.example/privacy' },
            { title: '《客户用户协议》', url: 'https://merchant.example/terms' },
          ],
        },
      })
      await Promise.resolve()
    })

    await enterIdLast4()

    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(2)
    const agreementSlot = document.getElementById('ydrzAgreementControl')
    const tipsSlot = document.getElementById('ydrzTipsControl')
    const firstCustomRow = screen.getByTestId('custom-agreement-row-0')
    const footerNote = screen.getByText('客户页脚说明')
    expect(agreementSlot?.compareDocumentPosition(tipsSlot!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(tipsSlot?.compareDocumentPosition(firstCustomRow)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(firstCustomRow.compareDocumentPosition(footerNote)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(screen.getByRole('button', { name: '《客户隐私政策》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《客户用户协议》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《客户隐私政策》' }).closest('label')).toBeNull()
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()

    fireEvent.click(boxes[0])
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()

    fireEvent.click(boxes[1])

    expect(screen.getByRole('button', { name: '确认' })).toBeEnabled()
  })

  it('gates SDK submission on every custom agreement and syncs its disabled status', async () => {
    setupExpectedUiConfigUrl()
    setupReadySdkResource()

    render(<AuthVerificationWindow />)
    await act(async () => {
      postConfigToIframe({
        ui: {
          agreements: [
            { title: '《客户隐私政策》', url: 'https://merchant.example/privacy' },
            { title: '《客户用户协议》', url: 'https://merchant.example/terms' },
          ],
        },
      })
      await Promise.resolve()
    })

    const initControlRequest = await reachReadyControls()
    await enterIdLast4()

    let beforeSubmitResult: boolean | undefined
    await act(async () => {
      beforeSubmitResult = initControlRequest?.beforeSubmit?.()
      await Promise.resolve()
    })
    expect(beforeSubmitResult).toBe(false)
    expect(mockFacade.updateSubmitBtnStatus).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true }))
    expect(screen.getByText('请先同意全部协议')).toBeInTheDocument()

    const boxes = screen.getAllByRole('checkbox')
    fireEvent.click(boxes[0])
    await waitFor(() => {
      expect(mockFacade.updateSubmitBtnStatus).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true }))
    })
    await act(async () => {
      beforeSubmitResult = initControlRequest?.beforeSubmit?.()
      await Promise.resolve()
    })
    expect(beforeSubmitResult).toBe(false)

    fireEvent.click(boxes[1])

    await waitFor(() => {
      expect(mockFacade.updateSubmitBtnStatus).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: false }))
    })
    await act(async () => {
      beforeSubmitResult = initControlRequest?.beforeSubmit?.()
      await Promise.resolve()
    })
    expect(beforeSubmitResult).toBe(true)
  })

  it('clears custom agreement checks when retry resets the SDK resources', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    setupExpectedUiConfigUrl()
    setupReadySdkResource()

    try {
      render(<AuthVerificationWindow />)
      await act(async () => {
        postConfigToIframe({
          ui: {
            agreements: [
              { title: '《客户隐私政策》', url: 'https://merchant.example/privacy' },
              { title: '《客户用户协议》', url: 'https://merchant.example/terms' },
            ],
          },
        })
        await Promise.resolve()
      })

      const firstInitControlRequest = await reachReadyControls()
      screen.getAllByRole('checkbox').forEach((box) => fireEvent.click(box))
      screen.getAllByRole('checkbox').forEach((box) => expect(box).toBeChecked())

      await act(async () => {
        firstInitControlRequest?.error?.({ code: '110031' })
        await Promise.resolve()
      })

      mockFacade.initControl.mockClear()
      fireEvent.click(screen.getByRole('button', { name: '重试' }))
      const secondInitControlRequest = await reachReadyControls()
      expect(secondInitControlRequest).toBeDefined()
      screen.getAllByRole('checkbox').forEach((box) => expect(box).not.toBeChecked())
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it('opens custom agreement URLs in a new window and warns if blocked', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    setupExpectedUiConfigUrl()

    try {
      render(<AuthVerificationWindow />)
      await act(async () => {
        postConfigToIframe({
          ui: {
            agreements: [{ title: '《客户隐私政策》', url: 'https://merchant.example/privacy' }],
          },
        })
        await Promise.resolve()
      })

      fireEvent.click(await screen.findByRole('button', { name: '《客户隐私政策》' }))

      expect(openSpy).toHaveBeenCalledWith('https://merchant.example/privacy', '_blank', 'noopener,noreferrer')
      expect(warnSpy).toHaveBeenCalledWith(
        '[AssistanceMobileAuth] Browser blocked opening custom agreement URL: https://merchant.example/privacy',
      )
    } finally {
      openSpy.mockRestore()
      warnSpy.mockRestore()
    }
  })

  it('ignores ui config messages from non-parent sources or wrong sessions', async () => {
    setupExpectedUiConfigUrl()

    render(<AuthVerificationWindow />)

    window.dispatchEvent(new MessageEvent('message', {
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_CONFIG, 'wrong-session', { ui: { themeColor: '#1677ff' } }),
    }))
    window.dispatchEvent(new MessageEvent('message', {
      source: null,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_CONFIG, 'assistance-auth-test', { ui: { themeColor: '#1677ff' } }),
    }))

    expect(screen.getByRole('status', { name: '授权配置加载中' })).toBeInTheDocument()
    expect(mockLoadMobileAuthSdkResources).not.toHaveBeenCalled()
  })

  it('applies configured text, images, and theme color after ui config arrives', async () => {
    setupExpectedUiConfigUrl()
    setupReadySdkResource()

    render(<AuthVerificationWindow />)
    await act(async () => {
      postConfigToIframe({
        ui: {
          themeColor: '#1677ff',
          texts: {
            headerTitle: { text: '核验本人身份', fontSize: '19px', color: '#0f172a', bold: true },
            idTitle: { text: '输入证件后四位', fontSize: '20px', color: '#123456', bold: false },
            phoneTopNotice: { text: '请确认本机号码为本人手机号', fontSize: '16px', color: '#654321', bold: true },
            footerNote: { text: '客户自定义授权说明', fontSize: '13px', color: '#333333', bold: false },
          },
          images: {
            top: 'https://merchant.example/top.png',
            bottom: { url: 'https://merchant.example/bottom.png', alt: '底部宣传图', height: 88, fit: 'cover' },
          },
        },
      })
      await Promise.resolve()
    })

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

    await act(async () => {
      initControlRequest?.authReady?.({ code: '103000' })
      await Promise.resolve()
    })

    expect(screen.getByRole('heading', { name: '核验本人身份' })).toHaveStyle({
      fontSize: '19px',
      color: '#0f172a',
      fontWeight: '600',
    })
    expect(screen.getByText('输入证件后四位')).toHaveStyle({
      fontSize: '20px',
      color: '#123456',
      fontWeight: '400',
    })
    expect(screen.getByText('请确认本机号码为本人手机号')).toHaveStyle({
      fontSize: '16px',
      color: '#654321',
      fontWeight: '600',
    })
    expect(screen.getByText('客户自定义授权说明')).toHaveStyle({
      fontSize: '13px',
      color: '#333333',
      fontWeight: '400',
    })
    expect(screen.getByRole('img', { name: '顶部图片' })).toHaveAttribute('src', 'https://merchant.example/top.png')
    expect(screen.getByRole('img', { name: '底部宣传图' })).toHaveStyle({
      height: '88px',
      objectFit: 'cover',
    })
    expect(initControlRequest?.styleOption).toMatchObject({
      submitBtnStyle: { bgColor: '#1677ff' },
      checkboxStyle: { checkedColor: '#1677ff' },
      agreeStyle: { hrefColor: '#1677ff' },
    })
  })

  it('hides failed configured images and warns without blocking the flow', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    setupExpectedUiConfigUrl()

    try {
      render(<AuthVerificationWindow />)
      await act(async () => {
        postConfigToIframe({
          ui: {
            images: {
              top: 'https://merchant.example/broken.png',
            },
          },
        })
        await Promise.resolve()
      })

      const image = await screen.findByRole('img', { name: '顶部图片' })
      fireEvent.error(image)

      expect(screen.queryByRole('img', { name: '顶部图片' })).not.toBeInTheDocument()
      expect(warnSpy).toHaveBeenCalledWith(
        '[AssistanceMobileAuth] Failed to load configured image: https://merchant.example/broken.png',
      )
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('keeps sdk blocker status out of the visible iframe verification form', async () => {
    mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'error', error: 'sdk load failed' })

    render(<AuthVerificationWindow />)

    expect(await screen.findByRole('heading', { name: '确认身份信息' })).toBeVisible()
    expect(screen.getByText('输入身份证后4位')).toBeVisible()
    expect(screen.queryByText('授权服务暂不可用')).not.toBeInTheDocument()
    expect(screen.getByText('sdk metadata preserved for phase-2 verification')).toHaveAttribute('data-sdk-flow-status', 'sdk-not-ready')
  })

  it('posts cancel when the verification close control is clicked', async () => {
    render(<AuthVerificationWindow />)

    fireEvent.click(screen.getByRole('button', { name: '关闭' }))

    expect(lastPostedMessage()).toMatchObject({
      type: ASSISTANCE_AUTH_CANCEL,
      sessionId: 'assistance-auth-test',
    })
  })

  it('hides the iframe close control when parent iframeOptions set closable=false', async () => {
    render(<AuthVerificationWindow />)
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()

    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { closable: false },
      }),
    }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
    })
  })

  it('posts token idLast4 and keyA directly in iframe mode without running BFF data lane', async () => {
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await completeViaReadySdk('mobile-token', 'mobile-key-a')

    expect(screen.queryByText('授权成功')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '查看授权结果' })).not.toBeInTheDocument()
    expect(screen.queryByText('授权结果')).not.toBeInTheDocument()

    await waitFor(() => expect(getPostedMessages().some((message) => message?.type === ASSISTANCE_AUTH_READY)).toBe(true), { timeout: 800 })
    await waitFor(() => expect(lastPostedMessage()).toEqual(expect.objectContaining({
      source: ASSISTANCE_AUTH_MESSAGE_SOURCE,
      type: ASSISTANCE_AUTH_SUCCESS,
      sessionId: 'assistance-auth-test',
      payload: {
        status: 'success',
        token: 'mobile-token',
        idLast4: '1234',
        keyA: 'mobile-key-a',
        requestId: undefined,
        message: '验证完成',
      },
    })))
    expect(mockCreateIdentityFlowService).not.toHaveBeenCalled()
    expect(mockCreateSdkSessionClient).not.toHaveBeenCalled()
  })

  it('posts terminal errors in iframe mode when token or keyA is missing', async () => {
    setupReadySdkResource()
    const { unmount } = render(<AuthVerificationWindow />)

    await completeViaReadySdk('', 'mobile-key-a')
    await waitFor(() => expect(lastPostedMessage()).toEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_ERROR,
      payload: { code: 'TOKEN_MISSING', message: '本次授权未返回有效 token，请重新授权后再试。' },
    })))

    unmount()
    vi.mocked(window.parent.postMessage).mockClear()
    mockFacade.initControl.mockClear()
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await completeViaReadySdk('mobile-token', '')
    await waitFor(() => expect(lastPostedMessage()).toEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_ERROR,
      payload: { code: 'KEY_A_MISSING', message: '本次授权未返回 keyA，请重新授权后再试。' },
    })))
  })

  it('keeps the loading toast visible while identity verification is pending', async () => {
    let resolveIdentityFlow!: (snapshot: IdentityFlowSnapshot) => void
    mockIdentityFlowRun.mockImplementation(() => new Promise((resolve) => {
      resolveIdentityFlow = resolve
    }))
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
    })
    setupReadySdkResource()

    render(<AuthVerificationWindow />)

    await completeViaReadySdk()

    const loadingToastTitle = screen.getAllByText('验证中').find((element) => element.tagName.toLowerCase() === 'p')
    expect(loadingToastTitle).toBeDefined()
    expect(loadingToastTitle?.parentElement).toHaveStyle({ transform: 'translateX(-50%)' })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
    })

    expect(screen.getAllByText('验证中').filter((element) => element.tagName.toLowerCase() === 'p')).toHaveLength(1)

    await act(async () => {
      resolveIdentityFlow({
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
      await Promise.resolve()
    })

    // redirect 模式在默认 completeSession mock 无 redirectUrl 时会落到 inline error；
    // 这里主要验证 data lane pending 期间 toast 持续可见，收尾只断言进入后续完成分支。
    expect(screen.queryByText('授权成功')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('认证完成后缺少回跳地址，请重新发起。')).toBeInTheDocument(), { timeout: 1800 })
  })

  it('enables the confirm button once id last4 is filled, without any checkbox', async () => {
    render(<AuthVerificationWindow />)
    await screen.findByLabelText('身份证后四位第 1 位')
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '输入 1', hidden: true }))
    fireEvent.click(screen.getByRole('button', { name: '输入 2', hidden: true }))
    fireEvent.click(screen.getByRole('button', { name: '输入 3', hidden: true }))
    fireEvent.click(screen.getByRole('button', { name: '输入 4', hidden: true }))
    expect(screen.getByRole('button', { name: '确认' })).toBeEnabled()
  })

  it('moves the default custom-keyboard focus border, clears it on completion, and restores it on reopen', async () => {
    render(<AuthVerificationWindow />)

    const firstDigit = await screen.findByLabelText('身份证后四位第 1 位')
    expect(firstDigit).toHaveAttribute('data-active-digit', 'true')
    expect(firstDigit).toHaveClass('border')
    expect(firstDigit).toHaveStyle({
      borderColor: '#ff2d55',
      boxShadow: 'inset 0 0 0 1px #ff2d55',
    })

    fireEvent.click(screen.getByRole('button', { name: '输入 1' }))
    expect(firstDigit).not.toHaveAttribute('data-active-digit')
    expect(screen.getByLabelText('身份证后四位第 2 位')).toHaveAttribute('data-active-digit', 'true')

    for (const digit of ['2', '3', '4']) {
      fireEvent.click(screen.getByRole('button', { name: `输入 ${digit}` }))
    }
    expect(screen.getAllByLabelText(/身份证后四位第 \d 位/).every((digit) => !digit.dataset.activeDigit)).toBe(true)

    fireEvent.click(firstDigit)
    const fourthDigit = screen.getByLabelText('身份证后四位第 4 位')
    expect(fourthDigit).toHaveAttribute('data-active-digit', 'true')
    fireEvent.click(screen.getByRole('button', { name: '确认' }))
    expect(fourthDigit).not.toHaveAttribute('data-active-digit')
  })

  it('uses the configured JSSDK theme color for the default custom-keyboard focus border', async () => {
    setupExpectedUiConfigUrl()
    render(<AuthVerificationWindow />)

    await act(async () => {
      postConfigToIframe({ ui: { themeColor: '#1677ff' } })
      await Promise.resolve()
    })

    const firstDigit = await screen.findByLabelText('身份证后四位第 1 位')
    expect(firstDigit).toHaveStyle({
      borderColor: '#1677ff',
      boxShadow: 'inset 0 0 0 1px #1677ff',
    })
  })

  it('keeps the confirm button inside the agreement panel above the secure keyboard', async () => {
    render(<AuthVerificationWindow />)

    const confirmButton = await screen.findByRole('button', { name: '确认' })
    const agreementPanel = screen.getByTestId('compact-agreement-panel')
    const keyboard = screen.getByLabelText('安全键盘', { selector: 'section' })

    expect(agreementPanel).toContainElement(confirmButton)
    expect(screen.queryByTestId('compact-authorize-footer')).not.toBeInTheDocument()
    expect(keyboard.parentElement?.previousElementSibling).not.toHaveAttribute('data-testid', 'compact-authorize-footer')
  })

  it('renders the title before the inline phone subtitle and keeps phone slot in that subtitle', async () => {
    render(<AuthVerificationWindow />)

    await screen.findByLabelText('身份证后四位第 1 位')

    const title = screen.getByRole('heading', { name: '输入身份证后4位' })
    const subtitle = screen.getByTestId('compact-phone-subtitle')
    const phoneSlot = document.getElementById('ydrzPhoneControl')

    expect(subtitle).toHaveTextContent('用于验证')
    expect(subtitle).toHaveTextContent('的实名信息')
    expect(phoneSlot).not.toBeNull()
    expect(subtitle).toContainElement(phoneSlot)
    expect(title.compareDocumentPosition(subtitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('mounts agreement, tips, and SDK submit under one agreement panel', async () => {
    render(<AuthVerificationWindow />)

    await screen.findByLabelText('身份证后四位第 1 位')

    const agreementPanel = screen.getByTestId('compact-agreement-panel')
    expect(agreementPanel).toContainElement(document.getElementById('ydrzAgreementControl'))
    expect(agreementPanel).toContainElement(document.getElementById('ydrzTipsControl'))
    expect(agreementPanel).toContainElement(document.getElementById('ydrzSubmitControl'))
  })

  it('preserves SDK-injected slot content across authReady transition', async () => {
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

    const phoneSlot = document.getElementById('ydrzPhoneControl')
    const agreementSlot = document.getElementById('ydrzAgreementControl')
    const tipsSlot = document.getElementById('ydrzTipsControl')
    const submitSlot = document.getElementById('ydrzSubmitControl')

    expect(phoneSlot).not.toBeNull()
    expect(agreementSlot).not.toBeNull()
    expect(tipsSlot).not.toBeNull()
    expect(submitSlot).not.toBeNull()

    const phoneSentinel = document.createElement('span')
    phoneSentinel.textContent = 'sdk-phone'
    const agreementSentinel = document.createElement('span')
    agreementSentinel.textContent = 'sdk-agreement'
    const tipsSentinel = document.createElement('span')
    tipsSentinel.textContent = 'sdk-tips'
    const submitSentinel = document.createElement('span')
    submitSentinel.textContent = 'sdk-submit'

    phoneSlot?.appendChild(phoneSentinel)
    agreementSlot?.appendChild(agreementSentinel)
    tipsSlot?.appendChild(tipsSentinel)
    submitSlot?.appendChild(submitSentinel)

    await reachReadyControls()

    expect(document.getElementById('ydrzPhoneControl')).toContainElement(phoneSentinel)
    expect(document.getElementById('ydrzAgreementControl')).toContainElement(agreementSentinel)
    expect(document.getElementById('ydrzTipsControl')).toContainElement(tipsSentinel)
    expect(document.getElementById('ydrzSubmitControl')).toContainElement(submitSentinel)
  })

  it('posts PHONE_READY when authReady fires and the phone slot already contains masked text', async () => {
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    const phoneSlot = document.getElementById('ydrzPhoneControl')
    expect(phoneSlot).not.toBeNull()
    phoneSlot!.textContent = '用于验证 138****1234 的实名信息'

    const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
    act(() => {
      initControlRequest?.authReady?.({ code: '103000' })
    })

    await waitFor(() => {
      expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        type: ASSISTANCE_AUTH_PHONE_READY,
        payload: {
          maskedMobile: '138****1234',
          rawText: '用于验证 138****1234 的实名信息',
          source: 'ydrzPhoneControl',
        },
      }))
    })
  })

  it('posts PHONE_READY at most once when duplicate authReady callbacks fire in the same initControl attempt', async () => {
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    const phoneSlot = document.getElementById('ydrzPhoneControl')
    expect(phoneSlot).not.toBeNull()
    phoneSlot!.textContent = '138****1234'

    const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
    act(() => {
      initControlRequest?.authReady?.({ code: '103000' })
      initControlRequest?.authReady?.({ code: '103000' })
    })

    await waitFor(() => {
      expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_PHONE_READY)).toHaveLength(1)
    })
  })

  it('allows a new PHONE_READY post after initControl.error starts a fresh initControl attempt', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    const phoneSlot = document.getElementById('ydrzPhoneControl')
    expect(phoneSlot).not.toBeNull()
    phoneSlot!.textContent = '138****1234'

    const firstInitControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
    await act(async () => {
      firstInitControlRequest?.authReady?.({ code: '103000' })
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_PHONE_READY)).toHaveLength(1)
    })

    await act(async () => {
      firstInitControlRequest?.error?.({ code: '110031' })
      await Promise.resolve()
    })

    mockFacade.initControl.mockClear()
    fireEvent.click(screen.getByRole('button', { name: '重试' }))

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    const secondInitControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
    phoneSlot!.textContent = '139****5678'

    await act(async () => {
      secondInitControlRequest?.authReady?.({ code: '103000' })
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_PHONE_READY)).toHaveLength(2)
    })

    vi.restoreAllMocks()
  })

  it('observes delayed SDK phone text after authReady and posts PHONE_READY once', async () => {
    vi.useFakeTimers()
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
      await Promise.resolve()
    })
    expect(mockFacade.initControl).toHaveBeenCalledTimes(1)
    const phoneSlot = document.getElementById('ydrzPhoneControl')
    const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

    act(() => {
      initControlRequest?.authReady?.({ code: '103000' })
    })

    expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_PHONE_READY)).toHaveLength(0)

    act(() => {
      phoneSlot!.textContent = '138****1234'
    })

    await vi.advanceTimersByTimeAsync(50)

    expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_PHONE_READY)).toHaveLength(1)

    act(() => {
      phoneSlot!.textContent = '138****1234 updated'
    })
    await vi.advanceTimersByTimeAsync(50)
    expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_PHONE_READY)).toHaveLength(1)
  })

  it('does not post PHONE_READY when the phone slot never contains a masked mobile', async () => {
    vi.useFakeTimers()
    setupReadySdkResource()
    render(<AuthVerificationWindow />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
      await Promise.resolve()
    })
    expect(mockFacade.initControl).toHaveBeenCalledTimes(1)
    const phoneSlot = document.getElementById('ydrzPhoneControl')
    phoneSlot!.textContent = '手机号识别中'

    const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
    act(() => {
      initControlRequest?.authReady?.({ code: '103000' })
    })

    await vi.advanceTimersByTimeAsync(1600)

    expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_PHONE_READY)).toHaveLength(0)
    expect(screen.getByLabelText('身份证后四位第 1 位')).toBeInTheDocument()
  })

  it('exposes stable CSS hooks for inline phone and agreement copy styling', async () => {
    render(<AuthVerificationWindow />)

    await screen.findByLabelText('身份证后四位第 1 位')

    const subtitle = screen.getByTestId('compact-phone-subtitle')
    const agreementPanel = screen.getByTestId('compact-agreement-panel')
    const copy = agreementPanel.querySelector('.compact-agreement-copy')

    expect(subtitle).toHaveClass('compact-phone-subtitle')
    expect(copy).not.toBeNull()
    expect(copy).toContainElement(document.getElementById('ydrzAgreementControl'))
    expect(copy).toContainElement(document.getElementById('ydrzTipsControl'))
  })

  it('posts RESIZE with natural content height in auto height mode', async () => {
    setupReadyWithToken()
    const scrollHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    const offsetHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return (this as HTMLElement).dataset.assistanceAuthContentMeasure === 'true' ? 566 : 0
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        return (this as HTMLElement).dataset.assistanceAuthContentMeasure === 'true' ? 552 : 0
      },
    })

    try {
      render(<AuthVerificationWindow />)
      window.dispatchEvent(new MessageEvent('message', {
        source: window.parent,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
          iframeOptions: { heightMode: 'auto' },
        }),
      }))

      await waitFor(() => {
        expect(getPostedMessages()).toContainEqual(expect.objectContaining({
          type: ASSISTANCE_AUTH_RESIZE,
          sessionId: 'assistance-auth-test',
          payload: { height: 566 },
        }))
      })
    } finally {
      if (scrollHeightDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scrollHeightDescriptor)
      }
      if (offsetHeightDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeightDescriptor)
      }
    }
  })

  it('uses an un-stretched content root for auto height layout', async () => {
    render(<AuthVerificationWindow />)

    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { heightMode: 'auto' },
      }),
    }))

    const measureRoot = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-assistance-auth-content-measure="true"]')
      expect(element).not.toBeNull()
      return element!
    })
    const sdkMountHost = document.querySelector<HTMLElement>('[data-sdk-mount-host]')

    expect(measureRoot).not.toHaveAttribute('data-app', 'mobile-auth-verification-window')
    expect(sdkMountHost?.className).not.toContain('flex-1')
    expect(sdkMountHost?.className).not.toContain('overflow-y-auto')
  })

  it('系统键盘模式 ready 后自动聚焦一次，并在 focus 期间启用唯一外层滚动容器', async () => {
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
    render(<AuthVerificationWindow />)

    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { useCustomKeyboard: false, heightMode: 'auto' },
      }),
    }))

    const input = await screen.findByRole('textbox', { name: '身份证后四位' })
    const root = document.querySelector<HTMLElement>(
      '[data-app="mobile-auth-verification-window"]',
    )

    await waitFor(() => expect(input).toHaveFocus())
    expect(focusSpy).toHaveBeenCalledTimes(1)
    expect(root).toHaveAttribute('data-native-keyboard-scroll', 'true')
    expect(root).toHaveClass('overflow-y-auto')
    expect(document.querySelectorAll('[data-native-keyboard-scroll="true"]')).toHaveLength(1)

    fireEvent.blur(input)
    expect(root).toHaveAttribute('data-native-keyboard-scroll', 'false')
    expect(root).not.toHaveClass('overflow-y-auto')
    expect(focusSpy).toHaveBeenCalledTimes(1)
    focusSpy.mockRestore()
  })

  it('默认皮肤同一弹窗重试后重新 ready 不再次自动聚焦', async () => {
    setupReadyWithToken()
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    try {
      render(<AuthVerificationWindow />)
      window.dispatchEvent(new MessageEvent('message', {
        source: window.parent,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
          iframeOptions: { useCustomKeyboard: false, heightMode: 'auto' },
        }),
      }))
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const firstRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        firstRequest?.authReady?.({ code: '103000' })
        await Promise.resolve()
      })
      expect(await screen.findByRole('textbox', { name: '身份证后四位' })).toHaveFocus()
      expect(focusSpy).toHaveBeenCalledTimes(1)
      const root = document.querySelector<HTMLElement>('[data-app="mobile-auth-verification-window"]')
      expect(root).toHaveAttribute('data-native-keyboard-scroll', 'true')

      await act(async () => {
        firstRequest?.error?.({ code: '110031' })
        await Promise.resolve()
      })
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: '身份证后四位' })).not.toBeInTheDocument()
      })
      expect(root).toHaveAttribute('data-native-keyboard-scroll', 'false')

      fireEvent.click(screen.getByRole('button', { name: '重试' }))
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(2))

      const secondRequest = vi.mocked(mockFacade.initControl).mock.calls[1]?.[0]
      await act(async () => {
        secondRequest?.authReady?.({ code: '103000' })
        await Promise.resolve()
      })
      const retryInput = await screen.findByRole('textbox', { name: '身份证后四位' })
      expect(retryInput).toBeInTheDocument()
      expect(focusSpy).toHaveBeenCalledTimes(1)
      expect(root).toHaveAttribute('data-native-keyboard-scroll', 'false')

      fireEvent.focus(retryInput)
      expect(root).toHaveAttribute('data-native-keyboard-scroll', 'true')
    } finally {
      focusSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    }
  })

  it('outlines the active native input digit and posts resize immediately on focus', async () => {
    render(<AuthVerificationWindow />)

    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { useCustomKeyboard: false, heightMode: 'auto' },
        styleOption: { submitBtnStyle: { bgColor: '#1677ff' } },
      }),
    }))

    const input = await screen.findByRole('textbox', { name: '身份证后四位' })
    const firstDigit = await screen.findByLabelText('身份证后四位第 1 位')

    fireEvent.blur(input)
    await waitFor(() => {
      expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        type: ASSISTANCE_AUTH_RESIZE,
        payload: expect.objectContaining({ keyboardFocused: false }),
      }))
    })
    vi.mocked(window.parent.postMessage).mockClear()
    fireEvent.focus(input)

    expect(firstDigit).toHaveAttribute('data-active-digit', 'true')
    expect(firstDigit).toHaveClass('border')
    expect(firstDigit).toHaveStyle({
      borderColor: '#1677ff',
      boxShadow: 'inset 0 0 0 1px #1677ff',
    })
    await waitFor(() => {
      expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        type: ASSISTANCE_AUTH_RESIZE,
        payload: expect.objectContaining({ keyboardFocused: true }),
      }))
    })
    fireEvent.blur(input)
    expect(firstDigit).not.toHaveAttribute('data-active-digit')
    expect(firstDigit).not.toHaveStyle({ boxShadow: 'inset 0 0 0 1px #1677ff' })
  })

  it('does not post RESIZE when the parent requested fixed height mode', async () => {
    setupReadyWithToken()
    render(<AuthVerificationWindow />)

    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { heightMode: 'fixed' },
      }),
    }))

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_RESIZE)).toHaveLength(0)
  })

  it.each(['', 'unknown-app'])('closes the default keyboard on completion and reopens from every digit (appId=%s)', async (appId) => {
    if (appId) window.history.replaceState(null, '', `/verification?appId=${appId}`)
    render(<AuthVerificationWindow />)
    await screen.findByLabelText('身份证后四位第 1 位')
    const keyboard = screen.getByLabelText('安全键盘', { selector: 'section' })
    for (const digit of ['1', '2', '3']) {
      fireEvent.click(screen.getByRole('button', { name: `输入 ${digit}` }))
      expect(keyboard).toHaveAttribute('aria-hidden', 'false')
    }
    fireEvent.click(screen.getByRole('button', { name: '输入 4' }))
    expect(keyboard).toHaveAttribute('aria-hidden', 'true')
    for (let index = 1; index <= 4; index++) {
      fireEvent.click(screen.getByLabelText(`身份证后四位第 ${index} 位`))
      expect(keyboard).toHaveAttribute('aria-hidden', 'false')
      expect(screen.getByLabelText('身份证后四位第 4 位')).toHaveTextContent('4')
      fireEvent.click(screen.getByRole('button', { name: '删除' }))
      expect(screen.getByLabelText('身份证后四位第 4 位')).toBeEmptyDOMElement()
      expect(keyboard).toHaveAttribute('aria-hidden', 'false')
      fireEvent.click(screen.getByRole('button', { name: '输入 4' }))
      expect(keyboard).toHaveAttribute('aria-hidden', 'true')
    }
    expect(mockFacade.getAuthResult).not.toHaveBeenCalled()
  })

  it('keeps the matched Compact profile keyboard visible after completion', async () => {
    window.history.replaceState(null, '', '/verification?appId=demo-brand-001')
    render(<AuthVerificationWindow />)
    const firstDigit = await screen.findByLabelText('身份证后四位第 1 位')
    expect(firstDigit).not.toHaveAttribute('data-active-digit')
    expect(firstDigit).toHaveClass('border-2')
    expect(firstDigit).not.toHaveStyle({ boxShadow: 'inset 0 0 0 1px #0A6CFF' })
    await enterIdLast4()
    const keyboard = screen.getByLabelText('安全键盘', { selector: 'section' })
    expect(keyboard).toHaveAttribute('aria-hidden', 'false')
    fireEvent.click(screen.getByRole('button', { name: '删除', hidden: true }))
    expect(screen.getByLabelText('身份证后四位第 4 位')).toHaveTextContent('')
  })

  it.each(['', 'demo-brand-001'])('only blurs completed native input without a profile (appId=%s)', async (appId) => {
    setupReadyWithToken()
    if (appId) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}&appId=${appId}`)
    render(<AuthVerificationWindow />)
    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { useCustomKeyboard: false },
      }),
    }))
    await reachReadyControls()
    const input = screen.getByRole('textbox', { name: '身份证后四位' })
    for (let index = 1; index <= 4; index++) {
      fireEvent.click(screen.getByLabelText(`身份证后四位第 ${index} 位`))
      expect(input).toHaveFocus()
      fireEvent.change(input, { target: { value: '12x' } })
      expect(input).toHaveFocus()
      fireEvent.change(input, { target: { value: '12aX999' } })
      expect(input).toHaveValue('12X9')
      if (appId) expect(input).toHaveFocus()
      else expect(input).not.toHaveFocus()
    }
    expect(mockFacade.getAuthResult).not.toHaveBeenCalled()
  })

  it('marks the ID-last-four grid as rrweb-sensitive', async () => {
    render(<AuthVerificationWindow />)

    await screen.findByLabelText('身份证后四位第 1 位')
    expect(screen.getByLabelText('身份证后四位输入')).toHaveAttribute(
      'data-rrweb-sensitive',
      'true',
    )
  })

  it('uses native input and hides the custom keyboard when useCustomKeyboard=false', async () => {
    setupReadyWithToken()
    render(<AuthVerificationWindow />)

    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { useCustomKeyboard: false },
      }),
    }))

    await reachReadyControls()
    expect(screen.queryByLabelText('安全键盘', { selector: 'section' })).not.toBeInTheDocument()

    const group = screen.getByLabelText('身份证后四位输入')
    const input = within(group).getByLabelText('身份证后四位')
    fireEvent.click(group)
    expect(document.activeElement).toBe(input)

    fireEvent.change(input, { target: { value: '12x9' } })
    expect(screen.getByLabelText('身份证后四位第 1 位')).toHaveTextContent('1')
    expect(screen.getByLabelText('身份证后四位第 2 位')).toHaveTextContent('2')
    expect(screen.getByLabelText('身份证后四位第 3 位')).toHaveTextContent('X')
    expect(screen.getByLabelText('身份证后四位第 4 位')).toHaveTextContent('9')
  })

  it('normalizes native ID input paste and overlength values', async () => {
    setupReadyWithToken()
    render(<AuthVerificationWindow />)

    window.dispatchEvent(new MessageEvent('message', {
      source: window.parent,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
        iframeOptions: { useCustomKeyboard: false },
      }),
    }))

    await reachReadyControls()

    const input = within(screen.getByLabelText('身份证后四位输入')).getByLabelText('身份证后四位')
    expect(input).not.toHaveAttribute('maxlength')
    fireEvent.change(input, { target: { value: '12aX9' } })

    expect(screen.getByLabelText('身份证后四位第 1 位')).toHaveTextContent('1')
    expect(screen.getByLabelText('身份证后四位第 2 位')).toHaveTextContent('2')
    expect(screen.getByLabelText('身份证后四位第 3 位')).toHaveTextContent('X')
    expect(screen.getByLabelText('身份证后四位第 4 位')).toHaveTextContent('9')
    expect(input).toHaveValue('12X9')
  })

  it('resolves launchToken before invoking the mobile JSSDK facade', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
    })
    mockGetMobileAuthSdkConfig.mockReturnValue({
      enabled: true,
      mode: 'live',
      jsUrl: 'https://example.com/mobile-jssdk.js',
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
    mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
    mockFacade.showAuthPage.mockImplementation(({ success }) => {
      success?.({ code: '103000', traceId: 'mobile-trace-id' })
    })
    mockFacade.initControl.mockImplementation(() => undefined)

    render(<AuthVerificationWindow />)

    await waitFor(() => expect(mockSdkSessionResolve).toHaveBeenCalledWith({ launchToken: 'sft_launch_test' }))
    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
    await act(async () => {
      initControlRequest?.authReady?.({ code: '103000' })
      await Promise.resolve()
    })
    await enterIdLast4()
    expect(initControlRequest?.beforeSubmit?.()).toBe(true)
    await act(async () => {
      initControlRequest?.success?.({ code: '103000', token: 'mobile-token' })
    })

    await waitFor(() => expect(mockFacade.showAuthPage).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        version: '3.0',
        appId: 'mobile-app-id',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
        traceId: expect.stringMatching(/^[A-F0-9]{32}$/),
        timestamp: expect.stringMatching(/^\d{17}$/),
      }),
    })))
    expect(vi.mocked(mockFacade.showAuthPage).mock.calls[0]?.[0].data.sign).not.toBe('mobile-sign')
    await waitFor(() => expect(mockIdentityFlowRun).toHaveBeenCalledWith(expect.objectContaining({
      token: 'mobile-token',
      idLast4: '1234',
    })))
    await waitFor(() => expect(mockSdkSessionComplete).toHaveBeenCalledWith({
      launchToken: 'sft_launch_test',
      message: '授权结果已同步到当前页面。',
      identity: {
        displayName: '张三',
        maskedMobile: '138****0000',
        maskedIdCard: '110101********1234',
      },
    }))
    expect(getPostedMessages()).not.toContainEqual(expect.objectContaining({ type: ASSISTANCE_AUTH_SUCCESS }))
  })

  it('redirects to the completed redirectUrl in direct H5 auth mode', async () => {
    const assign = vi.fn()
    const replace = vi.fn()
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
      assign,
      replace,
    })
    setupReadySdkResource()
    mockSdkSessionComplete.mockResolvedValue({
      kind: 'completed',
      authResultId: 'sft_result_test',
      authCode: 'sft_code_test',
      authToken: 'sft_auth_test',
      redirectUrl: 'https://merchant.example/callback?authToken=sft_auth_test',
      expiresInSeconds: 600,
      message: '认证已完成。',
    })

    render(<AuthVerificationWindow />)
    await completeViaReadySdk()

    await waitFor(() => expect(replace).toHaveBeenCalledWith('https://merchant.example/callback?authToken=sft_auth_test'), { timeout: 1800 })
    expect(assign).not.toHaveBeenCalled()
    expect(getPostedMessages()).not.toContainEqual(expect.objectContaining({ type: ASSISTANCE_AUTH_SUCCESS }))
  })

  it('does not render a close control in direct H5 auth mode', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
    })
    document.title = '银商助理测试页'

    const { unmount } = render(<AuthVerificationWindow />)

    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(''))

    expect(getPostedMessages()).not.toContainEqual(expect.objectContaining({ type: ASSISTANCE_AUTH_CANCEL }))
    unmount()
    expect(document.title).toBe('银商助理测试页')
  })

  it('shows an error in direct H5 auth mode when launchToken is missing', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '',
    })

    render(<AuthVerificationWindow />)

    await waitFor(() => expect(screen.getByText('验证会话已失效，请重新发起。')).toBeInTheDocument())
    expect(mockSdkSessionResolve).not.toHaveBeenCalled()
  })

  it('shows an inline error instead of running test-token fallback when direct H5 SDK is unavailable', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
    })

    render(<AuthVerificationWindow />)
    await enterIdLast4()
    await clickTemporaryAuthorizeButton()

    await waitFor(() => expect(screen.getByText('授权服务暂不可用，请稍后重试。')).toBeInTheDocument())
    expect(mockIdentityFlowRun).not.toHaveBeenCalled()
    expect(mockSdkSessionComplete).not.toHaveBeenCalled()
  })

  it('shows an inline error when direct H5 completion has no redirectUrl', async () => {
    const assign = vi.fn()
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
      assign,
    })
    setupReadySdkResource()
    mockSdkSessionComplete.mockResolvedValue({
      kind: 'completed',
      authResultId: 'sft_result_test',
      authCode: 'sft_code_test',
      authToken: 'sft_auth_test',
      expiresInSeconds: 600,
      message: '认证已完成。',
    })

    render(<AuthVerificationWindow />)
    await completeViaReadySdk()

    await waitFor(() => expect(screen.getByText('认证完成后缺少回跳地址，请重新发起。')).toBeInTheDocument(), { timeout: 1800 })
    expect(assign).not.toHaveBeenCalled()
    expect(getPostedMessages()).not.toContainEqual(expect.objectContaining({ type: ASSISTANCE_AUTH_SUCCESS }))
  })

  it('does not render a close control while direct H5 completion is pending', async () => {
    const assign = vi.fn()
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
      assign,
    })
    setupReadySdkResource()
    mockSdkSessionComplete.mockImplementation(() => new Promise(() => undefined))

    render(<AuthVerificationWindow />)
    await completeViaReadySdk()
    await waitFor(() => expect(mockSdkSessionComplete).toHaveBeenCalledTimes(1))

    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
    expect(getPostedMessages()).not.toContainEqual(expect.objectContaining({ type: ASSISTANCE_AUTH_SUCCESS }))
  })

  it('posts a safe error when result completion cannot be stored', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
    })
    setupReadySdkResource()
    mockSdkSessionComplete.mockRejectedValue(new Error('认证结果保存失败。'))

    render(<AuthVerificationWindow />)
    await completeViaReadySdk()

    await waitFor(() => expect(screen.getByText('认证结果保存失败。')).toBeInTheDocument())
  })

  it('posts a safe error when launchToken cannot be resolved', async () => {
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=bad-token',
    })
    mockSdkSessionResolve.mockRejectedValue(new Error('JSSDK 验证会话已失效，请重新发起。'))

    render(<AuthVerificationWindow />)

    await waitFor(() => expect(screen.getByText('JSSDK 验证会话已失效，请重新发起。')).toBeInTheDocument())
  })

  it('posts a safe error when the backend data lane reaches a terminal failure', async () => {
    mockIdentityFlowRun.mockResolvedValue({
      status: 'verify-failed',
      title: '身份信息校验未通过',
      description: '请确认授权信息无误后重试；如仍失败，可重新授权后再试。',
      resultKind: 'verify-failed',
      action: { kind: 'retry-auth', label: '重新授权' },
    })
    mockWindowLocation({
      pathname: '/sign-pay-pro/auth',
      search: '?launchToken=sft_launch_test',
    })
    setupReadySdkResource()

    render(<AuthVerificationWindow />)
    await completeViaReadySdk()

    await waitFor(() => expect(screen.getByText('请确认授权信息无误后重试；如仍失败，可重新授权后再试。')).toBeInTheDocument())
  })

  it('posts SESSION_MISSING when completion is attempted without a session id', async () => {
    window.history.replaceState(null, '', '/verification')

    render(<AuthVerificationWindow />)
    await enterIdLast4()
    await clickTemporaryAuthorizeButton()

    await waitFor(() => expect(getPostedMessages()).toContainEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_ERROR,
      sessionId: '',
      payload: {
        code: 'SESSION_MISSING',
        message: '验证会话已失效，请重新发起。',
      },
    })))
  })

  describe('skeleton screen / controlReady gate (REQ-10-03, REQ-10-04)', () => {
    async function setupSdkReadyScenario() {
      window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test')
      mockGetMobileAuthSdkConfig.mockReturnValue({
        enabled: true,
        mode: 'live',
        jsUrl: 'https://example.com/mobile-jssdk.js',
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
      mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
      mockFacade.showAuthPage.mockImplementation(({ success }: { success?: (p: { code: string }) => void }) => {
        success?.({ code: '103000' })
      })
      mockFacade.initControl.mockImplementation(() => undefined)
    }

    async function triggerAuthReady() {
      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      if (initControlRequest?.authReady) {
        await act(async () => {
          initControlRequest.authReady?.({ code: '103000' })
          await Promise.resolve()
        })
      }
    }

    it('shows skeleton placeholder before initControl.authReady fires', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      // authReady not yet triggered — skeleton should be visible
      const skeleton = screen.queryByRole('region', { name: '加载中' })
      expect(skeleton).toBeInTheDocument()
    })

    it('hides skeleton and shows real input grid after authReady', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      // Before authReady: skeleton visible
      expect(screen.queryByRole('region', { name: '加载中' })).toBeInTheDocument()

      await triggerAuthReady()

      // After authReady: skeleton gone, real input visible
      await waitFor(() => {
        expect(screen.queryByRole('region', { name: '加载中' })).not.toBeInTheDocument()
      })
      // 4-grid input should be visible after controlReady
      const inputGridCells = await screen.findAllByRole('generic', { name: /身份证后四位第/ })
      expect(inputGridCells.length).toBe(4)
    })

    it('keeps SDK mount slots in the DOM during skeleton phase so SDK can find them by ID', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      // authReady not triggered — ydrzPhoneControl slot must still exist in DOM
      const phoneSlot = document.getElementById('ydrzPhoneControl')
      expect(phoneSlot).not.toBeNull()
    })

    it('hides handwritten fallback button before authReady to prevent premature submission', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      // controlReady === false (authReady not fired yet) → fallback button must not be in document
      // Note: sdkSubmitActive is true (sdkLoadState='ready' && params='ready'), so the SDK owns submit
      // but even checking the handwritten fallback path: !sdkSubmitActive && controlReady
      // → since sdkSubmitActive is true, fallback is hidden regardless; this test confirms
      // the button is not rendered when controlReady===false
      const fallbackButton = screen.queryByRole('button', { name: '确认' })
      expect(fallbackButton).not.toBeInTheDocument()
    })
  })

  describe('customer styleOption via parent→child postMessage', () => {
    async function setupSdkReadyScenario() {
      window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test')
      mockGetMobileAuthSdkConfig.mockReturnValue({
        enabled: true,
        mode: 'live',
        jsUrl: 'https://example.com/mobile-jssdk.js',
        cssUrl: '',
        debugEntry: false,
        authParams: { version: '', appId: '', sign: '', traceId: '', timestamp: '', authType: '', scope: '' },
      })
      mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
      mockFacade.showAuthPage.mockImplementation(({ success }: { success?: (p: { code: string }) => void }) => {
        success?.({ code: '103000' })
      })
      mockFacade.initControl.mockImplementation(() => undefined)
    }

    function postStyle(styleOption: unknown) {
      window.dispatchEvent(new MessageEvent('message', {
        source: window.parent,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', styleOption),
      }))
    }

    it.each([
      { appId: '8a9481c79c05c8bd019f6f42956924a0', expectedName: '同意并登录' },
      { appId: null, expectedName: '确认' },
    ] as const)(
      'uses the $expectedName SDK submit label for appId=$appId',
      async ({ appId, expectedName }) => {
        await setupSdkReadyScenario()
        window.history.replaceState(
          null,
          '',
          `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test${appId ? `&appId=${appId}` : ''}`,
        )
        render(<AuthVerificationWindow />)

        await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1), {
          timeout: 1500,
        })
        const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

        expect(request?.styleOption.submitBtnStyle?.name).toBe(expectedName)
      },
    )

    it('preserves the customer submit color when no ui theme color is configured', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await act(async () => {
        postStyle({
          submitBtnStyle: { bgColor: '#0A66FF' },
        })
        await Promise.resolve()
      })

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

      expect(request?.styleOption.submitBtnStyle?.bgColor).toBe('#0A66FF')
    })

    it('locks only V23 phone and agreement typography to the Figma contract', async () => {
      await setupSdkReadyScenario()
      window.history.replaceState(
        null,
        '',
        '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=8a9481c79c05c8bd019f6f42956924a0',
      )
      render(<AuthVerificationWindow />)

      await act(async () => {
        postStyle({
          phoneStyle: {
            bgColor: '#ffffff',
            fontColor: '#ff0000',
            fontSize: '22px',
            textAlign: 'left',
          },
          submitBtnStyle: { bgColor: '#ff4a19' },
          checkboxStyle: { checkedColor: '#ff4a19' },
        })
        await Promise.resolve()
      })

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

      expect(request?.styleOption.phoneStyle).toEqual(expect.objectContaining({
        width: 'auto',
        bgColor: 'transparent',
        borderRadius: '0',
        fontColor: '#3E424B',
        fontSize: '13px',
        textAlign: 'center',
      }))
      expect(request?.styleOption.agreeStyle).toEqual(expect.objectContaining({
        fontSize: '11.5px',
        fontColor: '#333333',
        hrefColor: '#333333',
        textAlign: 'left',
        width: '100%',
      }))
    })

    it('uses the legacy checkbox color for checkbox and hrefColor when no ui theme color is configured', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await act(async () => {
        postStyle({
          checkboxStyle: { checkedColor: '#16A34A' },
        })
        await Promise.resolve()
      })

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

      expect(request?.styleOption.checkboxStyle?.checkedColor).toBe('#16A34A')
      expect(request?.styleOption.agreeStyle?.hrefColor).toBe('#16A34A')
    })

    it('uses the legacy submit color for hrefColor when no ui theme color is configured', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await act(async () => {
        postStyle({
          submitBtnStyle: { bgColor: '#0A66FF' },
        })
        await Promise.resolve()
      })

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

      expect(request?.styleOption.agreeStyle?.hrefColor).toBe('#0A66FF')
    })

    it('uses an explicit ui theme color for all SDK style targets over legacy colors', async () => {
      setupExpectedUiConfigUrl()
      setupReadySdkResource()
      render(<AuthVerificationWindow />)

      await act(async () => {
        postConfigToIframe({ ui: { themeColor: '#1677ff' } })
        postStyle({
          submitBtnStyle: { bgColor: '#0A66FF' },
          checkboxStyle: { checkedColor: '#16A34A' },
        })
        await Promise.resolve()
      })

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

      expect(request?.styleOption).toMatchObject({
        submitBtnStyle: { bgColor: '#1677ff' },
        checkboxStyle: { checkedColor: '#1677ff' },
        agreeStyle: { hrefColor: '#1677ff' },
      })
    })

    it('applies customer non-protocol groups at initControl while keeping our default agreeStyle', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      // wrapper pushes the styleOption once the iframe is ready
      postStyle({
        submitBtnStyle: { bgColor: '#0A66FF', name: '立即授权' },
        phoneStyle: { fontColor: '#111111' },
        // 客户即便传 agreeStyle 也必须被我方默认覆盖（保护协议勾选区）
        agreeStyle: { fontColor: '#ff0000', agreeArr: [{ name: '客户协议' }] },
      })

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

      // 客户非协议分组生效
      expect(request?.styleOption.submitBtnStyle).toEqual(expect.objectContaining({ bgColor: '#0A66FF', name: '立即授权' }))
      expect(request?.styleOption.phoneStyle).toEqual(expect.objectContaining({ fontColor: '#111111' }))
      // 协议区仍是我方默认（一级"《用户信息授权协议》"入口 + 本方内置二级协议），客户 agreeArr 未注入
      expect(request?.styleOption.agreeStyle).toEqual(expect.objectContaining({
        textAlign: 'left',
      }))
      expect(request?.styleOption.agreeStyle?.CMText).toBe('《移动认证安全基座服务条款》')
      expect(request?.styleOption.agreeStyle?.agreeArr).toHaveLength(1)
      expect(request?.styleOption.agreeStyle?.agreeArr?.[0]).toMatchObject({ name: '《用户信息授权协议》' })
      expect(request?.styleOption.agreeStyle?.childArr?.map((item: { name: string }) => item.name)).toEqual([
        '《用户认证服务隐私政策》',
        '《个人信息收集清单》',
        '《敏感个人信息处理规则》',
        '《第三方共享个人信息清单》',
      ])
      expect(request?.styleOption.agreeStyle?.fontColor).not.toBe('#ff0000')
    })

    it('keeps the legacy agreement link color when no ui or style message arrives', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      // no style message posted — gate must open on timeout so auth still proceeds
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1), { timeout: 1500 })
      const request = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]

      expect(request?.styleOption.submitBtnStyle?.bgColor).toBe('#ff2d55')
      expect(request?.styleOption.agreeStyle).toEqual(expect.objectContaining({
        hrefColor: '#1677FF',
        textAlign: 'left',
      }))
      expect(request?.styleOption.agreeStyle?.CMText).toBe('《移动认证安全基座服务条款》')
      expect(request?.styleOption.agreeStyle?.agreeArr?.[0]).toMatchObject({ name: '《用户信息授权协议》' })
    })
  })

  describe('controlReady / updateSubmitBtnStatus timing (REQ-10-01)', () => {
    async function setupSdkReadyScenario() {
      window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test')
      mockGetMobileAuthSdkConfig.mockReturnValue({
        enabled: true,
        mode: 'live',
        jsUrl: 'https://example.com/mobile-jssdk.js',
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
      mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
      mockFacade.showAuthPage.mockImplementation(({ success }: { success?: (p: { code: string }) => void }) => {
        success?.({ code: '103000' })
      })
      mockFacade.initControl.mockImplementation(() => undefined)
    }

    async function triggerAuthReady() {
      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      if (initControlRequest?.authReady) {
        await act(async () => {
          initControlRequest.authReady?.({ code: '103000' })
          await Promise.resolve()
        })
      }
    }

    it('syncs updateSubmitBtnStatus immediately when initControl.authReady fires', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const callsBefore = mockFacade.updateSubmitBtnStatus.mock.calls.length

      await triggerAuthReady()

      await waitFor(() => {
        expect(mockFacade.updateSubmitBtnStatus.mock.calls.length).toBeGreaterThan(callsBefore)
      })

      const lastCall = mockFacade.updateSubmitBtnStatus.mock.calls.at(-1)?.[0]
      expect(lastCall).toEqual(
        expect.objectContaining({
          disabled: expect.any(Boolean),
          loading: expect.any(Boolean),
        }),
      )
    })

    it('does not push updateSubmitBtnStatus before authReady fires', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      // authReady NOT triggered — updateSubmitBtnStatus should not have been called via the effect
      expect(mockFacade.updateSubmitBtnStatus.mock.calls.length).toBe(0)
    })

    it('continues syncing updateSubmitBtnStatus after authReady when primaryDisabled changes', async () => {
      await setupSdkReadyScenario()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      await triggerAuthReady()

      await waitFor(() => expect(mockFacade.updateSubmitBtnStatus.mock.calls.length).toBeGreaterThan(0))
      const callsAfterReady = mockFacade.updateSubmitBtnStatus.mock.calls.length

      // Enter 4 digits to change the disabled input (idLast4Complete flip; no checkboxes needed)
      await enterIdLast4()

      await waitFor(() => {
        expect(mockFacade.updateSubmitBtnStatus.mock.calls.length).toBeGreaterThan(callsAfterReady)
      })

      const lastCall = mockFacade.updateSubmitBtnStatus.mock.calls.at(-1)?.[0]
      expect(lastCall?.disabled).toBe(false)
    })
  })

  describe('single SDK agreement bar (no self-owned checkboxes)', () => {
    it('renders a single SDK agreement seam with no self-owned checkboxes after SDK ready', async () => {
      setupReadyWithToken()
      render(<AuthVerificationWindow />)
      await reachReadyControls()

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
      expect(document.querySelector('#ydrzAgreementControl')).toBeInTheDocument()
    })

    it('retargets the SDK default China Mobile service terms link to the official China Mobile protocol', async () => {
      setupReadyWithToken()
      render(<AuthVerificationWindow />)

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const agreementSlot = document.getElementById('ydrzAgreementControl')
      expect(agreementSlot).not.toBeNull()

      const operatorLink = document.createElement('a')
      operatorLink.className = 'ydrz-confirm'
      operatorLink.dataset.name = '《中国移动认证服务条款》'
      operatorLink.href = 'https://wap.cmpassport.com/resources/html/sfContract.html'
      operatorLink.textContent = '《中国移动认证服务条款》'
      agreementSlot!.appendChild(operatorLink)

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        initControlRequest?.authReady?.({ code: '103000' })
        await Promise.resolve()
      })

      expect(operatorLink.getAttribute('href')).toBe('https://slw.h5cmpassport.com:9091/h5/resource/umsProtocol.html')
    })

    it.each([
      [
        'Haike',
        HAIKE_V2_APP_ID,
        'haike-v2-third-party-sharing',
        true,
        '#1677FF',
        '13px',
        '#475569',
      ],
      [
        'Tiantianyoubao',
        TIANTIANYOUBAO_V2_APP_ID,
        'tiantianyoubao-v2-third-party-sharing',
        false,
        '#333333',
        '11.5px',
        '#333333',
      ],
      [
        'Dongfangdadi',
        DONGFANGDADI_V2_APP_ID,
        'dongfangdadi-v2-third-party-sharing',
        true,
        '#1677FF',
        '13px',
        '#475569',
      ],
      [
        'Anxingtianxia',
        '8a9481c79c05c8bd019f8e3061ce25ee',
        'anxingtianxia-v2-third-party-sharing',
        true,
        '#1677FF',
        '13px',
        '#475569',
      ],
      [
        'Hengda',
        HENGDA_V2_APP_ID,
        'hengda-v2-third-party-sharing',
        true,
        '#1677FF',
        '13px',
        '#475569',
      ],
    ])(
      'passes the %s appId into one agreement entry with the configured built-in child agreements',
      async (_profileName, appId, thirdPartyDocKey, includesThirdPartySharing, hrefColor, fontSize, fontColor) => {
        setupReadyWithToken()
        window.history.replaceState(
          null,
          '',
          `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=${appId}`,
        )
        render(<AuthVerificationWindow />)
        await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
        const req = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
        const agreeStyle = req?.styleOption?.agreeStyle
        expect(agreeStyle).toEqual(
          expect.objectContaining({
            fontSize,
            fontColor,
            hrefColor,
            textAlign: 'left',
            width: '100%',
            CMText: '《移动认证安全基座服务条款》',
          }),
        )
        expect(agreeStyle?.agreeArr).toHaveLength(1)
        expect(agreeStyle?.agreeArr?.[0]).toMatchObject({ name: '《用户信息授权协议》' })
        expect(agreeStyle?.agreeArr?.[0]?.link).toContain('flow=agreement')
        expect(agreeStyle?.agreeArr?.[0]?.link).toContain('doc=entry')
        expect(agreeStyle?.agreeArr?.[0]?.link).toContain(`appId=${appId}`)
        const childArr = agreeStyle?.childArr ?? []
        expect(childArr).toHaveLength(includesThirdPartySharing ? 4 : 3)
        expect(childArr[0]).toMatchObject({ name: '《用户认证服务隐私政策》' })
        expect(childArr[0]?.link).toContain('flow=agreement')
        expect(childArr[0]?.link).toContain('doc=user-auth-privacy-policy')
        expect(childArr[1]).toMatchObject({ name: '《个人信息收集清单》' })
        expect(childArr[1]?.link).toContain('doc=personal-info-collection-list')
        expect(childArr[2]).toMatchObject({ name: '《敏感个人信息处理规则》' })
        expect(childArr[2]?.link).toContain('doc=sensitive-info-rules')
        if (includesThirdPartySharing) {
          expect(childArr[3]).toMatchObject({ name: '《第三方共享个人信息清单》' })
          expect(childArr[3]?.link).toContain(`doc=${thirdPartyDocKey}`)
        } else {
          expect(childArr.some((item: { name: string }) => (
            item.name === '《第三方共享个人信息清单》'
          ))).toBe(false)
        }
        for (const agreement of childArr) {
          expect(agreement.link).toContain(`appId=${appId}`)
        }
      },
    )

    it('passes four built-in child agreements for an unknown appId', async () => {
      setupReadyWithToken()
      window.history.replaceState(
        null,
        '',
        '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=unknown-app',
      )
      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const childArr = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
        ?.styleOption?.agreeStyle?.childArr ?? []

      expect(childArr.map((item: { name: string }) => item.name)).toEqual([
        '《用户认证服务隐私政策》',
        '《个人信息收集清单》',
        '《敏感个人信息处理规则》',
        '《第三方共享个人信息清单》',
      ])
      for (const agreement of childArr) {
        expect(agreement.link).toContain('appId=unknown-app')
      }
    })

    it('keeps a same-name external caller agreement in the actual Haike inline SDK childArr', async () => {
      setupReadyWithToken()
      window.history.replaceState(
        null,
        '',
        `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=${HAIKE_V2_APP_ID}&layout=inline`,
      )
      render(<AuthVerificationWindow />)

      window.dispatchEvent(new MessageEvent('message', {
        source: window.parent,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
          styleOption: {},
          agreements: [
            { name: ' 《第三方共享个人信息清单》 ', link: 'https://x.example/override' },
            { name: '《甲方协议》', link: 'https://x.example/a' },
          ],
          iframeOptions: { closable: true, useCustomKeyboard: true },
        }),
      }))

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const childArr = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
        ?.styleOption?.agreeStyle?.childArr ?? []
      expect(childArr).toHaveLength(6)
      expect(childArr.filter((item: { name: string }) => (
        item.name.trim() === '《第三方共享个人信息清单》'
      ))).toHaveLength(2)
      expect(childArr).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: ' 《第三方共享个人信息清单》 ',
          link: 'https://x.example/override',
        }),
        expect.objectContaining({ name: '《甲方协议》', link: 'https://x.example/a' }),
      ]))
    })

    it('keeps the reserved third-party caller filter for Haike modal agreements', async () => {
      setupReadyWithToken()
      window.history.replaceState(
        null,
        '',
        '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=8a9481c79c05c8bd019ed8d7ab571df3',
      )
      render(<AuthVerificationWindow />)

      // 发送包裹形态 { styleOption, agreements }，模拟 wrapper 在 ready 后推送
      window.dispatchEvent(new MessageEvent('message', {
        source: window.parent,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
          styleOption: {},
          agreements: [
            { name: ' 《第三方共享个人信息清单》 ', link: 'https://x.example/override' },
            { name: '《甲方协议》', link: 'https://x.example/a' },
          ],
          iframeOptions: { closable: true, useCustomKeyboard: true },
        }),
      }))

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const req = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      const childArr = req?.styleOption?.agreeStyle?.childArr ?? []
      expect(childArr).toHaveLength(5)
      expect(req?.styleOption?.agreeStyle?.agreeArr?.[0]).toMatchObject({ name: '《用户信息授权协议》' })
      expect(childArr[0]).toMatchObject({ name: '《用户认证服务隐私政策》' })
      expect(childArr[1]).toMatchObject({ name: '《个人信息收集清单》' })
      expect(childArr[2]).toMatchObject({ name: '《敏感个人信息处理规则》' })
      expect(childArr[3]).toMatchObject({ name: '《第三方共享个人信息清单》' })
      expect(childArr[4]).toMatchObject({ name: '《甲方协议》', link: 'https://x.example/a' })
      expect(childArr.filter((item: { name: string }) => item.name.trim() === '《第三方共享个人信息清单》')).toHaveLength(1)
      expect(childArr.some((item: { link: string }) => item.link === 'https://x.example/override')).toBe(false)
    })

    it('keeps the reserved third-party caller filter for non-Haike profiles', async () => {
      setupReadyWithToken()
      window.history.replaceState(
        null,
        '',
        `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=${DONGFANGDADI_V2_APP_ID}&layout=inline`,
      )
      render(<AuthVerificationWindow />)

      window.dispatchEvent(new MessageEvent('message', {
        source: window.parent,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
          styleOption: {},
          agreements: [
            { name: '《第三方共享个人信息清单》', link: 'https://x.example/override' },
            { name: '《甲方协议》', link: 'https://x.example/a' },
          ],
          iframeOptions: { closable: true, useCustomKeyboard: true },
        }),
      }))

      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
      const childArr = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
        ?.styleOption?.agreeStyle?.childArr ?? []
      expect(childArr).toHaveLength(5)
      expect(childArr.filter((item: { name: string }) => (
        item.name.trim() === '《第三方共享个人信息清单》'
      ))).toHaveLength(1)
      expect(childArr.some((item: { link: string }) => item.link === 'https://x.example/override')).toBe(false)
    })

    it('passes beforeSubmit that returns true once id last4 is filled (no agreement check)', async () => {
      setupReadyWithToken()
      render(<AuthVerificationWindow />)
      const initControlRequest = await reachReadyControls()

      // Without id last4 → beforeSubmit returns false
      expect(initControlRequest?.beforeSubmit?.()).toBe(false)

      await enterIdLast4()

      // With id last4 filled → beforeSubmit returns true (no agreement gate)
      expect(initControlRequest?.beforeSubmit?.()).toBe(true)
    })

    it('keeps the agreement slot and tips slot in the document', async () => {
      setupReadyWithToken()
      render(<AuthVerificationWindow />)
      await reachReadyControls()

      const tipsControl = document.getElementById('ydrzTipsControl')
      expect(tipsControl).toBeInTheDocument()
      expect(tipsControl).not.toHaveAttribute('aria-hidden', 'true')
      expect(tipsControl?.className).not.toContain('h-0')
    })
  })

  describe('SDK error capture and mapping (REQ-10-05, REQ-10-06, REQ-10-08)', () => {
    async function setupSdkReadyScenario() {
      window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test')
      mockGetMobileAuthSdkConfig.mockReturnValue({
        enabled: true,
        mode: 'live',
        jsUrl: 'https://example.com/mobile-jssdk.js',
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
      mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
      mockFacade.showAuthPage.mockImplementation(({ success }: { success?: (p: { code: string }) => void }) => {
        success?.({ code: '103000' })
      })
      mockFacade.initControl.mockImplementation(() => undefined)
    }

    it('logs raw payload via console.error when initControl.error fires', async () => {
      await setupSdkReadyScenario()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      const rawPayload = { code: '110031', message: 'carrier error', traceId: 'trace-abc' }
      await act(async () => {
        initControlRequest?.error?.(rawPayload)
        await Promise.resolve()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AuthVerificationWindow] initControl.error',
        rawPayload,
        expect.objectContaining({ code: '110031', carrier: 'unknown' }),
      )
      consoleErrorSpy.mockRestore()
    })

    it('displays SdkErrorPanel with mapped uiText when 110031 error code is received', async () => {
      await setupSdkReadyScenario()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        initControlRequest?.error?.({ code: '110031' })
        await Promise.resolve()
      })

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('中国移动')
      expect(alert).toHaveTextContent('110031')

      vi.restoreAllMocks()
    })

    it('maps network-timeout reason from resourceLoader to network-timeout errorKind', async () => {
      window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test')
      mockGetMobileAuthSdkConfig.mockReturnValue({
        enabled: true,
        mode: 'live',
        jsUrl: 'https://example.com/mobile-jssdk.js',
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
      mockLoadMobileAuthSdkResources.mockResolvedValue({
        state: 'error',
        reason: 'network-timeout',
        error: new Error('timed out'),
        scriptId: 'mobile-auth-sdk-script',
        styleId: 'mobile-auth-sdk-style',
      })

      render(<AuthVerificationWindow />)

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('网络较慢')
    })

    it('keeps fatal sdk-init-failed errors (e.g. 103119) inside iframe — user dismisses via X button instead of auto-close', async () => {
      await setupSdkReadyScenario()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const callsBefore = vi.mocked(window.parent.postMessage).mock.calls.length

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        // 103119 = AppID 配置异常 (sdk-init-failed) — surfaces inline, no host postMessage so wrapper does NOT auto-close
        initControlRequest?.error?.({ code: '103119' })
        await Promise.resolve()
      })

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toHaveTextContent('AppID')
      })

      const newErrorPosts = vi.mocked(window.parent.postMessage).mock.calls
        .slice(callsBefore)
        .filter((c) => (c[0] as { type?: string })?.type === ASSISTANCE_AUTH_ERROR)
      expect(newErrorPosts).toHaveLength(0)

      vi.restoreAllMocks()
    })

    it('keeps carrier-mismatch errors inside iframe (no host postMessage) so user can switch network and retry', async () => {
      await setupSdkReadyScenario()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const callsBefore = vi.mocked(window.parent.postMessage).mock.calls.length

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        // 110031 carrier-mismatch — staging实测形态 {YDData, CTData, CUData, msgId}
        initControlRequest?.error?.({
          YDData: { resultCode: '110031', desc: '无电信取号权益' },
          CTData: { resultCode: '103000' },
          CUData: { resultCode: '103000' },
          msgId: 'test-msg-id',
        })
        await Promise.resolve()
      })

      // SdkErrorPanel renders inline with the carrier-mismatch hint
      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toHaveTextContent('中国移动')
      })

      // No new ASSISTANCE_AUTH_ERROR postMessage was sent (iframe keeps the error visible)
      const newErrorPosts = vi.mocked(window.parent.postMessage).mock.calls
        .slice(callsBefore)
        .filter((c) => (c[0] as { type?: string })?.type === ASSISTANCE_AUTH_ERROR)
      expect(newErrorPosts).toHaveLength(0)

      vi.restoreAllMocks()
    })

    it('posts a real-time non-terminal ERROR_NOTICE with the SDK code while the error stays inline', async () => {
      await setupSdkReadyScenario()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        initControlRequest?.error?.({
          YDData: { resultCode: '110031', desc: '无电信取号权益' },
          CTData: { resultCode: '103000' },
          CUData: { resultCode: '103000' },
          msgId: 'test-msg-id',
        })
        await Promise.resolve()
      })

      // 非终态通知实时发出（带 SDK 错误码 + 阶段 + 运营商），终态 ASSISTANCE_AUTH_ERROR 仍被抑制
      expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        type: ASSISTANCE_AUTH_ERROR_NOTICE,
        sessionId: 'assistance-auth-test',
        payload: expect.objectContaining({
          code: '110031',
          message: '无电信取号权益',
          phase: 'initControl',
          carrier: 'YD',
        }),
      }))
      expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_ERROR)).toHaveLength(0)

      vi.restoreAllMocks()
    })

    it('includes lastError in the cancel payload when the user closes after an SDK error', async () => {
      await setupSdkReadyScenario()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        initControlRequest?.error?.({ code: '110031' })
        await Promise.resolve()
      })

      fireEvent.click(screen.getByRole('button', { name: '关闭' }))

      // 见错后放弃 → CANCEL 带上 lastError，让调用方与"单纯取消"区分开
      expect(lastPostedMessage()).toMatchObject({
        type: ASSISTANCE_AUTH_CANCEL,
        sessionId: 'assistance-auth-test',
        payload: {
          message: '用户取消验证',
          lastError: expect.objectContaining({ code: '110031' }),
        },
      })

      vi.restoreAllMocks()
    })

    it('posts a resourceLoad ERROR_NOTICE when SDK resources fail to load', async () => {
      window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test')
      mockGetMobileAuthSdkConfig.mockReturnValue({
        enabled: true,
        mode: 'live',
        jsUrl: 'https://example.com/mobile-jssdk.js',
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
      mockLoadMobileAuthSdkResources.mockResolvedValue({
        state: 'error',
        reason: 'network-timeout',
        error: new Error('timed out'),
        scriptId: 'mobile-auth-sdk-script',
        styleId: 'mobile-auth-sdk-style',
      })

      render(<AuthVerificationWindow />)

      await waitFor(() => expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        type: ASSISTANCE_AUTH_ERROR_NOTICE,
        sessionId: 'assistance-auth-test',
        payload: expect.objectContaining({
          code: 'NETWORK_TIMEOUT',
          phase: 'resourceLoad',
        }),
      })))
      expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_ERROR)).toHaveLength(0)
    })

    it('does not post an ERROR_NOTICE when showAuthPage succeeds with the alternate success code 200', async () => {
      await setupSdkReadyScenario()
      // '200' 与 '103000' 一样在 SUCCESS_CODES 里（authFlow.ts）—— 不能当作失败误报通知
      mockFacade.showAuthPage.mockImplementation(({ success }: { success?: (p: { code: string }) => void }) => {
        success?.({ code: '200' })
      })

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.showAuthPage).toHaveBeenCalledTimes(1))

      expect(getPostedMessages().filter((message) => message?.type === ASSISTANCE_AUTH_ERROR_NOTICE)).toHaveLength(0)
    })

    it('omits lastError from the cancel payload when no SDK error occurred', async () => {
      await setupSdkReadyScenario()

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      fireEvent.click(screen.getByRole('button', { name: '关闭' }))

      const cancel = lastPostedMessage()
      expect(cancel).toMatchObject({
        type: ASSISTANCE_AUTH_CANCEL,
        sessionId: 'assistance-auth-test',
        payload: { message: '用户取消验证' },
      })
      // 无错误时不应携带 lastError 键，payload 形状与旧版完全一致
      expect(Object.prototype.hasOwnProperty.call(cancel?.payload ?? {}, 'lastError')).toBe(false)
    })

    it('uses the friendly uiText and omits the internal carrier sentinel for ALL_CARRIERS_FAILED notices', async () => {
      await setupSdkReadyScenario()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        initControlRequest?.error?.({
          YDData: { resultCode: '103111', desc: 'WAP网关IP错误' },
          CTData: { resultCode: '103124', desc: '' },
          CUData: { resultCode: '103125', desc: '' },
          msgId: 'test-msg-id',
        })
        await Promise.resolve()
      })

      const notice = getPostedMessages().find((message) => message?.type === ASSISTANCE_AUTH_ERROR_NOTICE)
      expect(notice?.payload).toMatchObject({
        code: 'ALL_CARRIERS_FAILED',
        phase: 'initControl',
      })
      const payload = notice?.payload as { message?: string; carrier?: string }
      // 对外不泄漏内部聚合调试串（YD:code/desc | CT:… ）与 'unknown' 运营商哨兵
      expect(payload.message).toContain('中国移动')
      expect(payload.message).not.toContain('|')
      expect(payload.carrier).toBeUndefined()

      vi.restoreAllMocks()
    })

    it('resets controlReady and hasInitializedControlRef when initControl.error fires so retry path can re-init', async () => {
      await setupSdkReadyScenario()
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      render(<AuthVerificationWindow />)
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      // Trigger authReady to set controlReady=true
      const initControlRequest = vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
      await act(async () => {
        initControlRequest?.authReady?.({ code: '103000' })
        await Promise.resolve()
      })

      // Trigger error — should reset controlReady and hasInitializedControlRef
      await act(async () => {
        initControlRequest?.error?.({ code: '110031' })
        await Promise.resolve()
      })

      // After error, the SDK state machine should allow re-init on next trigger
      // Reset the mock to allow a new initControl call
      mockFacade.initControl.mockClear()
      mockFacade.showAuthPage.mockImplementation(({ success }: { success?: (p: { code: string }) => void }) => {
        success?.({ code: '103000' })
      })

      fireEvent.click(screen.getByRole('button', { name: '重试' }))

      // Since sdkLoadState is ready and error reset hasInitializedControlRef,
      // a new showAuthPage call should be dispatched
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

      vi.restoreAllMocks()
    })
  })

  describe('app profile ui base', () => {
    it('applies the matched profile ui as the base ui config', () => {
      window.history.replaceState(
        null,
        '',
        '/verification?assistanceAuthSessionId=assistance-auth-test&appId=demo-brand-001',
      )

      render(<AuthVerificationWindow />)

      expect(document.body.textContent).toContain('示例品牌身份核验')
    })

    it('falls back to the default page and logs info for an unmatched appId', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
      window.history.replaceState(
        null,
        '',
        '/verification?assistanceAuthSessionId=assistance-auth-test&appId=no-such-app',
      )

      render(<AuthVerificationWindow />)

      expect(document.body.textContent).not.toContain('示例品牌身份核验')
      expect(infoSpy).toHaveBeenCalledWith(
        '[AssistanceMobileAuth] appId "no-such-app" 未匹配任何 profile，使用默认页面',
      )
      infoSpy.mockRestore()
    })
  })

  describe('公共输入状态通知与同步 provider 提交', () => {
    const targetAppId = '8a9481c79c05c8bd019f6f42956924a0'
    const parentOrigin = window.location.origin

    async function mountReadyFlow({
      appId = targetAppId,
      beforeLoginNotificationEnabled = true,
      stateChangeEnabled = true,
      formHeaderImg,
    }: {
      appId?: string
      beforeLoginNotificationEnabled?: boolean
      stateChangeEnabled?: boolean
      formHeaderImg?: string
    } = {}) {
      window.history.replaceState(
        null,
        '',
        `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=${appId}&assistanceAuthParentOrigin=${encodeURIComponent(parentOrigin)}`,
      )
      setupReadySdkResource()
      render(<AuthVerificationWindow />)

      await act(async () => {
        window.dispatchEvent(new MessageEvent('message', {
          origin: parentOrigin,
          source: window.parent,
          data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
            styleOption: {},
            beforeLoginNotificationEnabled,
            stateChangeEnabled,
            ...(formHeaderImg ? { formHeaderImg } : {}),
          }),
        }))
        await Promise.resolve()
      })

      const initControlRequest = await reachReadyControls()
      const slot = document.getElementById('ydrzSubmitControl')!
      const providerButton = document.createElement('button')
      providerButton.type = 'button'
      providerButton.textContent = 'provider submit'
      slot.appendChild(providerButton)
      const providerResults: Array<boolean | undefined> = []
      providerButton.addEventListener('click', () => {
        providerResults.push(initControlRequest?.beforeSubmit?.())
      })

      return { initControlRequest, providerButton, providerResults }
    }

    function getStateChangePosts() {
      return vi.mocked(window.parent.postMessage).mock.calls.filter(
        ([message]) => (message as AssistanceAuthMessage).type === ASSISTANCE_AUTH_STATE_CHANGE,
      )
    }

    function getStateChangeTypes() {
      return getStateChangePosts().map(
        ([message]) => ((message as AssistanceAuthMessage).payload as { event: { type: string } }).event.type,
      )
    }

    async function enterIdLast4Value(value: string) {
      await screen.findByLabelText('身份证后四位第 1 位')
      for (const character of value) {
        fireEvent.click(screen.getByRole('button', { name: `输入 ${character}`, hidden: true }))
      }
    }

    it('按规范化长度转换发出 complete/incomplete，数字与 X 均适用且可重新 complete', async () => {
      await mountReadyFlow({
        formHeaderImg: 'https://cdn.example.com/v23-header.png',
      })
      expect(screen.getByRole('img', { name: '输入您的身份证后四位' })).toHaveAttribute(
        'src',
        'https://cdn.example.com/v23-header.png',
      )

      await enterIdLast4Value('123')
      expect(getStateChangePosts()).toHaveLength(0)

      fireEvent.click(screen.getByRole('button', { name: '输入 4', hidden: true }))
      fireEvent.click(screen.getByRole('button', { name: '输入 X', hidden: true }))
      expect(getStateChangeTypes()).toEqual(['idLast4Complete'])

      fireEvent.click(screen.getByRole('button', { name: '删除', hidden: true }))
      fireEvent.click(screen.getByRole('button', { name: '输入 X', hidden: true }))
      expect(getStateChangeTypes()).toEqual([
        'idLast4Complete',
        'idLast4Incomplete',
        'idLast4Complete',
      ])

      for (const [message, targetOrigin] of getStateChangePosts()) {
        expect(targetOrigin).toBe(parentOrigin)
        expect(message).toEqual(expect.objectContaining({
          type: ASSISTANCE_AUTH_STATE_CHANGE,
          sessionId: 'assistance-auth-test',
          payload: { event: { type: expect.stringMatching(/^idLast4/) } },
        }))
        expect(JSON.stringify(message)).not.toContain('123')
      }
    })

    it('complete 在任一通知能力开启时只发一条，incomplete 仅由 stateChange 开启', async () => {
      await mountReadyFlow({
        appId: 'non-target-app',
        beforeLoginNotificationEnabled: true,
        stateChangeEnabled: false,
      })

      await enterIdLast4Value('12X9')
      fireEvent.click(screen.getByRole('button', { name: '删除', hidden: true }))

      expect(getStateChangeTypes()).toEqual(['idLast4Complete'])
    })

    it.each([targetAppId, 'non-target-app'])(
      '未配置回调时 appId=%s 不发状态消息',
      async (appId) => {
        await mountReadyFlow({
          appId,
          beforeLoginNotificationEnabled: false,
          stateChangeEnabled: false,
        })

        await enterIdLast4Value('1234')
        fireEvent.click(screen.getByRole('button', { name: '删除', hidden: true }))

        expect(getStateChangePosts()).toHaveLength(0)
      },
    )

    it('关闭不会伪造 incomplete 通知', async () => {
      await mountReadyFlow()
      await enterIdLast4Value('1234')

      fireEvent.click(screen.getByRole('button', { name: '关闭' }))

      expect(getStateChangeTypes()).toEqual(['idLast4Complete'])
      expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        type: ASSISTANCE_AUTH_CANCEL,
      }))
    })

    it('V23 不足四位时 provider 仍可点击显示精确错误，补齐后仅同步提交一次', async () => {
      const { providerButton, providerResults } = await mountReadyFlow({
        beforeLoginNotificationEnabled: false,
        stateChangeEnabled: false,
      })

      expect(mockFacade.updateSubmitBtnStatus.mock.calls.map(([state]) => state)).toContainEqual({
        disabled: false,
        loading: false,
      })
      fireEvent.click(providerButton)
      expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
      expect(providerResults).toEqual([false])

      await enterIdLast4Value('1234')
      fireEvent.click(providerButton)

      expect(providerResults).toEqual([false, true])
      expect(screen.getByRole('status', { name: '加载中' })).toBeInTheDocument()
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([false, true, false])
    })

    it('Yuanbao explicitly restores provider button state on every incomplete rejection, not only React state changes', async () => {
      const { providerButton, providerResults } = await mountReadyFlow({ appId: '10037e6f9d903f86019ed8cfb6320365' })
      await enterIdLast4Value('11')
      mockFacade.updateSubmitBtnStatus.mockClear()
      fireEvent.click(providerButton)
      fireEvent.click(providerButton)
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([false, false, false])
      expect(mockFacade.updateSubmitBtnStatus.mock.calls.map(([state]) => state)).toEqual([
        { disabled: false, loading: false },
        { disabled: false, loading: false },
        { disabled: false, loading: false },
      ])
      expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
    })

    it('Yuanbao still rejects incomplete input when provider button restoration throws', async () => {
      const { providerButton, providerResults } = await mountReadyFlow({ appId: '10037e6f9d903f86019ed8cfb6320365' })
      mockFacade.updateSubmitBtnStatus.mockImplementationOnce(() => { throw new Error('provider UI failure') })
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([false])
      expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
      expect(screen.queryByRole('status', { name: '加载中' })).not.toBeInTheDocument()
    })

    it('does not change provider state restoration for old V23 rejection', async () => {
      const { providerButton, providerResults } = await mountReadyFlow()
      mockFacade.updateSubmitBtnStatus.mockClear()
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([false])
      expect(mockFacade.updateSubmitBtnStatus).not.toHaveBeenCalled()
    })

    it('Yuanbao duplicate-submit rejection must not unlock the accepted provider request', async () => {
      const { providerButton, providerResults } = await mountReadyFlow({ appId: '10037e6f9d903f86019ed8cfb6320365' })
      await enterIdLast4Value('1234')
      fireEvent.click(providerButton)
      mockFacade.updateSubmitBtnStatus.mockClear()
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([true])
      expect(mockFacade.updateSubmitBtnStatus).not.toHaveBeenCalled()
    })

    it('Yuanbao keeps incomplete validation across time, partial edits, delete and blur until four valid characters', async () => {
      const { providerButton, providerResults, initControlRequest } = await mountReadyFlow({ appId: '10037e6f9d903f86019ed8cfb6320365' })
      expect(document.documentElement).toHaveAttribute('data-assistance-yuanbao-feedback', 'true')
      expect(screen.getByTestId('chinaums-sheet-v23-root')).not.toHaveAttribute('data-zidingyi-feedback')
      expect(initControlRequest?.styleOption?.agreeStyle).toMatchObject({ fontColor: '#848AB4', hrefColor: '#848AB4' })
      expect(initControlRequest?.styleOption?.authTextStyle).toMatchObject({ fontColor: '#848AB4', bgColor: 'transparent' })
      expect(initControlRequest?.styleOption?.stateStyle).toMatchObject({
        fontColor: '#848AB4', authTextStyle: { fontColor: '#848AB4', bgColor: 'transparent' },
      })
      fireEvent.click(providerButton)
      vi.useFakeTimers()
      await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
      vi.useRealTimers()
      expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
      await enterIdLast4Value('12')
      fireEvent.click(screen.getByRole('button', { name: '删除' }))
      fireEvent.blur(providerButton)
      expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([false, false])
      expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'false')
      await enterIdLast4Value('23X')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'true')
      fireEvent.click(providerButton)
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([false, false, true])
    })

    it('Yuanbao formats first-level agreement text without replacing official anchors or click handlers', async () => {
      await mountReadyFlow({ appId: '10037e6f9d903f86019ed8cfb6320365' })
      const slot = document.getElementById('ydrzAgreementControl')!
      const userLink = document.createElement('a')
      userLink.href = '#user-original'
      userLink.textContent = '《用户信息授权协议》'
      const operatorLink = document.createElement('a')
      operatorLink.href = '#operator-original'
      operatorLink.textContent = '《移动认证安全基座服务条款》'
      const handler = vi.fn((event: Event) => event.preventDefault())
      userLink.addEventListener('click', handler)
      slot.append(userLink, document.createTextNode(' '), operatorLink)
      await waitFor(() => expect(slot.textContent).toBe('用户信息授权协议 | 移动认证安全基座服务条款'))
      expect(slot.querySelector('a')).toBe(userLink)
      expect(userLink.getAttribute('href')).toBe('#user-original')
      fireEvent.click(userLink)
      expect(handler).toHaveBeenCalledOnce()
    })

    it('Yuanbao observes provider reader visibility and restores keyboard and identity without re-init', async () => {
      await mountReadyFlow({ appId: '10037e6f9d903f86019ed8cfb6320365' })
      await enterIdLast4Value('12')
      const calls = mockFacade.initControl.mock.calls.length
      const overlay = document.createElement('div')
      overlay.innerHTML = '<div class="ydrz-confirm-iframe"></div>'
      await act(async () => { document.body.append(overlay) })
      expect(screen.getByLabelText('安全键盘')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.queryByTestId('chinaums-v23-id-caret')).not.toBeInTheDocument()
      await act(async () => { overlay.style.display = 'none' })
      expect(screen.getByLabelText('安全键盘')).toHaveAttribute('aria-hidden', 'false')
      expect(screen.getByLabelText('身份证后四位第 2 位')).toHaveTextContent('2')
      expect(mockFacade.initControl).toHaveBeenCalledTimes(calls)
      overlay.remove()
    })

    it('Yuanbao restores typing after a displayed provider error and successful retry', async () => {
      const { initControlRequest } = await mountReadyFlow({ appId: '10037e6f9d903f86019ed8cfb6320365' })
      await enterIdLast4Value('12')
      vi.useFakeTimers()
      await act(async () => { initControlRequest?.error?.({ code: '103119' }) })
      await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
      vi.useRealTimers()
      fireEvent.click(screen.getByRole('button', { name: '重试' }))
      await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(2))
      await act(async () => { mockFacade.initControl.mock.calls[1]?.[0]?.authReady?.({ code: '103000' }) })
      expect(screen.getByLabelText('安全键盘')).toHaveAttribute('aria-hidden', 'false')
      fireEvent.click(screen.getByRole('button', { name: '输入 3' }))
      expect(screen.getByLabelText('身份证后四位第 3 位')).toHaveTextContent('3')
    })

    it('旧 preventLogin result 消息不再改变键盘、loading 或 provider 结果', async () => {
      const { providerButton, providerResults } = await mountReadyFlow()
      await enterIdLast4Value('1234')
      expect(screen.getByLabelText('安全键盘')).toHaveAttribute('aria-hidden', 'false')
      expect(screen.queryByRole('status', { name: '加载中' })).not.toBeInTheDocument()

      window.dispatchEvent(new MessageEvent('message', {
        origin: parentOrigin,
        source: window.parent,
        data: {
          source: ASSISTANCE_AUTH_MESSAGE_SOURCE,
          type: 'ASSISTANCE_AUTH_BEFORE_LOGIN_RESULT',
          sessionId: 'assistance-auth-test',
          payload: { correlationId: 'obsolete', preventLogin: true },
        },
      }))
      expect(screen.getByLabelText('安全键盘')).toHaveAttribute('aria-hidden', 'false')
      expect(screen.queryByRole('status', { name: '加载中' })).not.toBeInTheDocument()
      fireEvent.click(providerButton)

      expect(providerResults).toEqual([true])
      expect(screen.getByRole('status', { name: '加载中' })).toBeInTheDocument()
    })

    it.each([true, false])('非目标 appId 通知能力=%s 时都不安装 capture gate，provider 语义不变', async (notificationsEnabled) => {
      const { providerButton, providerResults } = await mountReadyFlow({
        appId: 'non-target-app',
        beforeLoginNotificationEnabled: notificationsEnabled,
        stateChangeEnabled: notificationsEnabled,
      })
      await enterIdLast4Value('1234')

      fireEvent.click(providerButton)

      expect(providerResults).toEqual([true])
    })

    it('V23 同步 beforeSubmit 通过后 provider error 保持终态', async () => {
      const { initControlRequest, providerButton, providerResults } = await mountReadyFlow({
        beforeLoginNotificationEnabled: false,
        stateChangeEnabled: false,
      })
      await enterIdLast4Value('1234')
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([true])

      await act(async () => {
        initControlRequest?.error?.({ code: '110031' })
        await Promise.resolve()
      })

      expect(getPostedMessages()).toContainEqual(expect.objectContaining({
        type: ASSISTANCE_AUTH_ERROR,
        payload: expect.objectContaining({ code: '110031' }),
      }))
      expect(initControlRequest?.beforeSubmit?.()).toBe(false)
      fireEvent.click(providerButton)
      expect(providerResults).toEqual([true, false])
      expect(providerResults.filter((result) => result === true)).toHaveLength(1)
    })
  })
})

describe('AuthVerificationWindow static release boundary', () => {
  beforeEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
    window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test')
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined)

    mockLoadMobileAuthSdkResources.mockReset()
    mockResetMobileAuthSdkLoader.mockReset()
    mockCreateMobileAuthSdkFacade.mockReset()
    mockGetMobileAuthSdkConfig.mockReset()
    mockCreateMobileAssistantClient.mockReset()
    mockCreateSdkSessionClient.mockReset()
    mockCreateIdentityFlowService.mockReset()
    Object.values(mockFacade).forEach((spy) => spy.mockReset())

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
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
  })

  it('does not require launchToken APIs for iframe mode success', async () => {
    window.history.replaceState(null, '', '/verification?assistanceAuthSessionId=assistance-auth-test')

    render(<AuthVerificationWindow />)

    expect(screen.getByText('确认身份信息')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/verification')
    expect(mockCreateSdkSessionClient).not.toHaveBeenCalled()
    expect(mockCreateMobileAssistantClient).not.toHaveBeenCalled()
    expect(mockCreateIdentityFlowService).not.toHaveBeenCalled()
  })
})

describe('appId 皮肤分流', () => {
  beforeEach(() => {
    if (vi.isMockFunction(window.parent.postMessage)) {
      vi.mocked(window.parent.postMessage).mockClear()
    } else {
      vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined)
    }
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
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
  })

  it('目标 appId 仅渲染 chinaums-sheet-v23 皮肤', async () => {
    window.history.replaceState(
      null,
      '',
      '/verification?assistanceAuthSessionId=assistance-auth-test&appId=8a9481c79c05c8bd019f6f42956924a0',
    )
    render(<AuthVerificationWindow />)
    expect(await screen.findByTestId('chinaums-sheet-v23-root')).toHaveAttribute(
      'data-zidingyi-feedback',
      'true',
    )
    expect(screen.getByLabelText('安全键盘').querySelectorAll('button')).toHaveLength(12)
    expect(screen.queryByTestId('chinaums-sheet-root')).not.toBeInTheDocument()
    expect(screen.queryByTestId('compact-title-shell')).not.toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-assistance-v23-viewport-modal', 'true')
    expect(document.body).toHaveAttribute('data-assistance-v23-viewport-modal', 'true')
    expect(document.querySelector('[data-app="mobile-auth-verification-window"]')).toHaveClass('bg-transparent')
  })

  it('目标 appId 等待父页 UI config 时首帧保持透明', () => {
    window.history.replaceState(
      null,
      '',
      '/verification?assistanceAuthSessionId=assistance-auth-test&expectsUiConfig=1&appId=8a9481c79c05c8bd019f6f42956924a0',
    )
    render(<AuthVerificationWindow />)

    const waitStatus = screen.getByRole('status', { name: '授权配置加载中' })
    const authRoot = document.querySelector('[data-app="mobile-auth-verification-window"]')
    expect(authRoot).toHaveAttribute('data-v23-viewport-modal', 'true')
    expect(authRoot).toHaveClass('bg-transparent')
    expect(authRoot).not.toHaveClass('bg-white')
    expect(waitStatus).toHaveClass('bg-transparent')
    expect(waitStatus).not.toHaveClass('bg-white')
    expect(document.documentElement).toHaveAttribute('data-assistance-v23-viewport-modal', 'true')
    expect(document.body).toHaveAttribute('data-assistance-v23-viewport-modal', 'true')
  })

  it('海客 appId 仅在 layout=inline 时渲染单层透明自然高度卡片', async () => {
    window.history.replaceState(
      null,
      '',
      `/verification?assistanceAuthSessionId=assistance-auth-test&appId=${HAIKE_V2_APP_ID}&layout=inline`,
    )
    render(<AuthVerificationWindow />)

    expect(await screen.findByTestId('haike-inline-root')).toBeInTheDocument()
    expect(screen.getAllByTestId('haike-inline-card')).toHaveLength(1)
    expect(screen.queryByTestId('compact-title-shell')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chinaums-sheet-v23-root')).not.toBeInTheDocument()
    const authRoot = document.querySelector('[data-app="mobile-auth-verification-window"]')
    expect(authRoot).toHaveAttribute('data-haike-inline', 'true')
    expect(authRoot).toHaveClass('min-h-0', 'overflow-visible', 'bg-transparent')
    expect(authRoot).not.toHaveClass('h-dvh', 'bg-white')
    expect(document.documentElement).toHaveAttribute('data-assistance-haike-inline', 'true')
    expect(document.body).toHaveAttribute('data-assistance-haike-inline', 'true')
    expect(document.documentElement).not.toHaveAttribute('data-assistance-v23-viewport-modal')
  })

  it('海客 inline 等待 ui-config 时同样保持透明自然高度且不设置 V23 标记', () => {
    window.history.replaceState(
      null,
      '',
      `/verification?assistanceAuthSessionId=assistance-auth-test&expectsUiConfig=1&appId=${HAIKE_V2_APP_ID}&layout=inline`,
    )
    render(<AuthVerificationWindow />)

    const authRoot = document.querySelector('[data-app="mobile-auth-verification-window"]')
    const waitStatus = screen.getByRole('status', { name: '授权配置加载中' })
    expect(authRoot).toHaveAttribute('data-haike-inline', 'true')
    expect(authRoot).toHaveClass('min-h-0', 'overflow-visible', 'bg-transparent')
    expect(authRoot).not.toHaveClass('h-full', 'h-dvh', 'bg-white')
    expect(waitStatus).toHaveClass('min-h-0', 'bg-transparent')
    expect(document.documentElement).toHaveAttribute('data-assistance-haike-inline', 'true')
    expect(document.documentElement).not.toHaveAttribute('data-assistance-v23-viewport-modal')
  })

  it('海客 inline 配置官方提交文案为确认立即保障并保持四协议聚合', async () => {
    Object.values(mockFacade).forEach((spy) => spy.mockReset())
    setupReadySdkResource()
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
    window.history.replaceState(
      null,
      '',
      `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=${HAIKE_V2_APP_ID}&layout=inline`,
    )
    render(<AuthVerificationWindow />)

    const request = await waitFor(() => {
      expect(mockFacade.initControl).toHaveBeenCalledTimes(1)
      return vi.mocked(mockFacade.initControl).mock.calls[0]?.[0]
    })
    expect(request?.styleOption?.submitBtnStyle).toMatchObject({ name: '确认立即保障' })
    expect(request?.styleOption?.phoneStyle).toMatchObject({
      width: 'auto',
      bgColor: 'transparent',
      borderRadius: '0',
      fontColor: '#FF633F',
      fontSize: '14px',
      textAlign: 'center',
    })
    const childArr = request?.styleOption?.agreeStyle?.childArr ?? []
    expect(childArr).toHaveLength(4)
    expect(childArr.map((item: { name: string }) => item.name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
    expect(childArr[3]?.link).toContain('doc=haike-v2-third-party-sharing')
  })

  it('海客 inline 原生输入发出完成通知，不自动聚焦，并在同步提交后锁定输入与官方按钮', async () => {
    Object.values(mockFacade).forEach((spy) => spy.mockReset())
    setupReadySdkResource()
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
    const parentOrigin = window.location.origin
    window.history.replaceState(
      null,
      '',
      `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=${HAIKE_V2_APP_ID}&layout=inline&assistanceAuthParentOrigin=${encodeURIComponent(parentOrigin)}`,
    )
    render(<AuthVerificationWindow />)

    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', {
        origin: parentOrigin,
        source: window.parent,
        data: createAssistanceAuthMessage(ASSISTANCE_AUTH_STYLE, 'assistance-auth-test', {
          styleOption: {},
          beforeLoginNotificationEnabled: true,
          stateChangeEnabled: true,
        }),
      }))
      await Promise.resolve()
    })
    const request = await reachReadyControls()
    const input = screen.getByRole('textbox', { name: '身份证后四位' })
    expect(input).not.toHaveFocus()
    expect(screen.queryByLabelText('安全键盘')).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'ab12x9z8' } })
    expect(screen.getByLabelText('身份证后四位第 1 位')).toHaveTextContent('1')
    expect(screen.getByLabelText('身份证后四位第 3 位')).toHaveTextContent('X')
    expect(getPostedMessages()).toContainEqual(expect.objectContaining({
      type: ASSISTANCE_AUTH_STATE_CHANGE,
      payload: expect.objectContaining({ event: expect.objectContaining({ type: 'idLast4Complete' }) }),
    }))

    await act(async () => {
      expect(request?.beforeSubmit?.()).toBe(true)
      await Promise.resolve()
    })
    expect(input).toBeDisabled()
    expect(mockFacade.updateSubmitBtnStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({ disabled: true, loading: true }),
    )
  })

  it('海客 inline 不足四位禁用官方按钮并保留同步 beforeSubmit 兜底，不套用 V23 终态语义', async () => {
    Object.values(mockFacade).forEach((spy) => spy.mockReset())
    setupReadySdkResource()
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
    window.history.replaceState(
      null,
      '',
      `/verification?assistanceAuthSessionId=assistance-auth-test&launchToken=sft_launch_test&appId=${HAIKE_V2_APP_ID}&layout=inline`,
    )
    render(<AuthVerificationWindow />)

    const request = await reachReadyControls()
    await waitFor(() => {
      expect(mockFacade.updateSubmitBtnStatus).toHaveBeenLastCalledWith(
        expect.objectContaining({ disabled: true }),
      )
    })
    expect(screen.getByTestId('haike-inline-submit')).toHaveAttribute('data-disabled', 'true')
    expect(screen.getByTestId('haike-inline-submit')).toHaveAttribute('inert')
    await act(async () => {
      expect(request?.beforeSubmit?.()).toBe(false)
      await Promise.resolve()
    })
    expect(screen.getByRole('alert')).toHaveTextContent('请输入后四位')
    expect(getPostedMessages().some((message) => message.type === ASSISTANCE_AUTH_ERROR)).toBe(false)

    fireEvent.change(screen.getByRole('textbox', { name: '身份证后四位' }), {
      target: { value: '12x9' },
    })
    await waitFor(() => {
      expect(mockFacade.updateSubmitBtnStatus).toHaveBeenLastCalledWith(
        expect.objectContaining({ disabled: false }),
      )
    })
    expect(screen.getByTestId('haike-inline-submit')).toHaveAttribute('data-disabled', 'false')
    expect(screen.getByTestId('haike-inline-submit')).not.toHaveAttribute('inert')
  })

  it('无 appId 渲染默认 Compact 皮肤', async () => {
    window.history.replaceState(
      null,
      '',
      '/verification?assistanceAuthSessionId=assistance-auth-test',
    )
    render(<AuthVerificationWindow />)
    expect(await screen.findByTestId('compact-title-shell')).toBeInTheDocument()
    expect(screen.queryByTestId('chinaums-sheet-v23-root')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chinaums-sheet-root')).not.toBeInTheDocument()
  })

  it('appId 未命中绑定表时渲染默认 Compact 皮肤', async () => {
    window.history.replaceState(
      null,
      '',
      '/verification?assistanceAuthSessionId=assistance-auth-test&appId=no-such-app',
    )
    render(<AuthVerificationWindow />)
    expect(await screen.findByTestId('compact-title-shell')).toBeInTheDocument()
    expect(screen.queryByTestId('chinaums-sheet-v23-root')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chinaums-sheet-root')).not.toBeInTheDocument()
  })

  it.each([
    ['海客', '8a9481c79c05c8bd019ed8d7ab571df3'],
    ['东方大地', '8a9481c79c05c8bd019f6a0a6c002457'],
  ])('%s appId 保持默认 Compact DOM，不继承目标反馈', async (_label, appId) => {
    window.history.replaceState(
      null,
      '',
      `/verification?assistanceAuthSessionId=assistance-auth-test&appId=${appId}`,
    )
    render(<AuthVerificationWindow />)

    expect(await screen.findByTestId('compact-title-shell')).toBeInTheDocument()
    expect(screen.queryByTestId('chinaums-sheet-v23-root')).not.toBeInTheDocument()
    expect(document.querySelector('[data-zidingyi-feedback="true"]')).toBeNull()
  })

  it('普通 appId 即使 layout=inline 也保持默认皮肤，zidingyi 则保持 V23', async () => {
    window.history.replaceState(
      null,
      '',
      '/verification?assistanceAuthSessionId=assistance-auth-test&appId=demo-brand-001&layout=inline',
    )
    const { unmount } = render(<AuthVerificationWindow />)
    expect(await screen.findByTestId('compact-title-shell')).toBeInTheDocument()
    expect(screen.queryByTestId('haike-inline-root')).not.toBeInTheDocument()

    unmount()
    window.history.replaceState(
      null,
      '',
      '/verification?assistanceAuthSessionId=assistance-auth-test&appId=8a9481c79c05c8bd019f6f42956924a0&layout=inline',
    )
    render(<AuthVerificationWindow />)
    expect(await screen.findByTestId('chinaums-sheet-v23-root')).toBeInTheDocument()
    expect(screen.queryByTestId('haike-inline-root')).not.toBeInTheDocument()
  })
})
