import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockBusinessDemoClient,
  mockCreateAssistanceMobileAuthSdk,
  mockCreateEsmAssistanceMobileAuthSdk,
  mockCreateBusinessDemoClient,
  mockCreateSdkSessionClient,
  mockLoadAssistanceMobileAuthEsmModule,
  mockSessionClient,
  mockEsmSdk,
  mockSdk,
  mockVConsoleCreate,
  mockVConsoleDestroy,
} = vi.hoisted(() => ({
  mockBusinessDemoClient: {
    checkIdentity: vi.fn(),
    queryIdentity: vi.fn(),
  },
  mockCreateAssistanceMobileAuthSdk: vi.fn(),
  mockCreateEsmAssistanceMobileAuthSdk: vi.fn(),
  mockCreateBusinessDemoClient: vi.fn(),
  mockCreateSdkSessionClient: vi.fn(),
  mockLoadAssistanceMobileAuthEsmModule: vi.fn(),
  mockSessionClient: {
    createSession: vi.fn(),
    queryResult: vi.fn(),
  },
  mockEsmSdk: {
    authorize: vi.fn(),
    clear: vi.fn(),
    open: vi.fn(),
    openVerification: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
    precheck: vi.fn(),
  },
  mockSdk: {
    authorize: vi.fn(),
    clear: vi.fn(),
    open: vi.fn(),
    openVerification: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
    precheck: vi.fn(),
  },
  mockVConsoleCreate: vi.fn(),
  mockVConsoleDestroy: vi.fn(),
}))

vi.mock('vconsole', () => ({
  default: class MockVConsole {
    constructor() {
      mockVConsoleCreate()
    }

    destroy() {
      mockVConsoleDestroy()
    }
  },
}))

vi.mock('../api/businessDemoClient', () => ({
  createBusinessDemoClient: mockCreateBusinessDemoClient,
}))

vi.mock('../api/sdkSessionClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/sdkSessionClient')>()
  return {
    ...actual,
    createSdkSessionClient: mockCreateSdkSessionClient,
  }
})

vi.mock('../wrapper/esmSdkLoader', () => ({
  getAssistanceMobileAuthEsmSdkUrl: () => '/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.js',
  loadAssistanceMobileAuthEsmModule: mockLoadAssistanceMobileAuthEsmModule,
}))

import { AuthHostPage } from './AuthHostPage'

describe('AuthHostPage', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_SFT_CUSTOMER_APP_ID', 'customer-app-id')
    vi.stubEnv('VITE_SFT_CUSTOMER_APP_KEY', 'customer-app-key')
    mockBusinessDemoClient.checkIdentity.mockReset()
    mockBusinessDemoClient.queryIdentity.mockReset()
    mockCreateAssistanceMobileAuthSdk.mockReset()
    mockCreateEsmAssistanceMobileAuthSdk.mockReset()
    mockCreateBusinessDemoClient.mockReset()
    mockCreateSdkSessionClient.mockReset()
    mockLoadAssistanceMobileAuthEsmModule.mockReset()
    mockSessionClient.createSession.mockReset()
    mockSessionClient.queryResult.mockReset()
    mockVConsoleCreate.mockReset()
    mockVConsoleDestroy.mockReset()
    Object.values(mockSdk).forEach((spy) => spy.mockReset())
    Object.values(mockEsmSdk).forEach((spy) => spy.mockReset())
    document.title = ''
    window.AssistanceMobileAuth = {
      createAssistanceMobileAuthSdk: mockCreateAssistanceMobileAuthSdk,
    }
    mockCreateAssistanceMobileAuthSdk.mockReturnValue(mockSdk)
    mockCreateEsmAssistanceMobileAuthSdk.mockReturnValue(mockEsmSdk)
    mockLoadAssistanceMobileAuthEsmModule.mockResolvedValue({
      createAssistanceMobileAuthSdk: mockCreateEsmAssistanceMobileAuthSdk,
    })
    mockCreateBusinessDemoClient.mockReturnValue(mockBusinessDemoClient)
    mockCreateSdkSessionClient.mockReturnValue(mockSessionClient)
    mockSessionClient.createSession.mockResolvedValue({
      kind: 'created',
      launchToken: 'sft_launch_test',
      expiresInSeconds: 600,
      message: 'JSSDK 验证会话已创建。',
    })
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
    mockSdk.open.mockImplementation(() => new Promise(() => undefined))
    mockSdk.openVerification.mockImplementation(() => new Promise(() => undefined))
    mockEsmSdk.open.mockImplementation(() => new Promise(() => undefined))
    mockEsmSdk.openVerification.mockImplementation(() => new Promise(() => undefined))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    delete window.AssistanceMobileAuth
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('renders the payment test host page and starts verification through the UMD global JSSDK', async () => {
    mockSdk.open.mockResolvedValue({
      status: 'success',
      message: '验证完成',
      token: 'smoke-token',
      idLast4: '2468',
      keyA: 'smoke-key-a',
    })

    render(<AuthHostPage />)

    expect(document.title).toBe('银商助理测试页')
    expect(screen.getByRole('heading', { name: '银商助理测试页' })).toBeInTheDocument()
    expect(screen.queryByText('认证能力测试页面')).not.toBeInTheDocument()
    // "移动认证接入测试" / "收付通 · 中国移动认证服务" 文案已按需删除。
    expect(screen.queryByText('移动认证接入测试')).not.toBeInTheDocument()
    expect(screen.queryByText('收付通 · 中国移动认证服务')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '立即支付-jssdk' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '立即支付-h5转跳' })).toBeInTheDocument()
    expect(screen.queryByText('认证测试页')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: '前端开发进度' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '立即支付-jssdk' }))

    expect(mockCreateAssistanceMobileAuthSdk).toHaveBeenCalledWith(expect.objectContaining({
      authWindowTitle: '移动认证验证窗口',
    }))
    await waitFor(() => expect(mockSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
    expect(mockSessionClient.createSession).not.toHaveBeenCalled()
    expect(mockSdk.openVerification).not.toHaveBeenCalled()
    expect(screen.getByText('验证成功')).toBeInTheDocument()
  })

  it('creates a redirect session and navigates to the direct H5 auth page', async () => {
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        origin: 'http://47.95.5.18:12588',
        search: '',
        assign,
      },
      configurable: true,
      writable: true,
    })

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-h5转跳' }))

    await waitFor(() => expect(mockSessionClient.createSession).toHaveBeenCalledWith({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      scene: 'native-number',
      redirectUrl: 'https://ginkgo.chinaums.com/sign-pay-pro/test-callback',
    }))
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://ginkgo.chinaums.com/sign-pay-pro/auth?launchToken=sft_launch_test'))
    expect(mockSdk.open).not.toHaveBeenCalled()
  })

  it('preserves mobileAuthEnv when redirecting to the direct H5 auth page', async () => {
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        origin: 'https://ginkgo.chinaums.com',
        search: '?mobileAuthEnv=prod',
        assign,
      },
      configurable: true,
      writable: true,
    })

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-h5转跳' }))

    expect(screen.getByText('正在跳转授权')).toBeInTheDocument()
    expect(screen.getByText('正在创建授权会话，即将进入 H5 授权页。')).toBeInTheDocument()
    await waitFor(() => expect(mockSessionClient.createSession).toHaveBeenCalledWith({
      appId: 'customer-app-id',
      appKey: 'customer-app-key',
      scene: 'native-number',
      mobileAuthEnv: 'prod',
      redirectUrl: 'https://ginkgo.chinaums.com/sign-pay-pro/test-callback',
    }))
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://ginkgo.chinaums.com/sign-pay-pro/auth?launchToken=sft_launch_test&mobileAuthEnv=prod'))
    expect(mockSdk.open).not.toHaveBeenCalled()
  })

  it('opens JSSDK iframe without creating a launch session and displays only returned dynamic fields', async () => {
    mockSdk.open.mockResolvedValue({
      status: 'success',
      message: '验证完成',
      token: 'mobile-token',
      idLast4: '1234',
      keyA: 'mobile-key-a',
    })

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-jssdk' }))

    await waitFor(() => expect(mockSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
    expect(mockSessionClient.createSession).not.toHaveBeenCalled()
    expect(mockSessionClient.queryResult).not.toHaveBeenCalled()
    expect(screen.getByText('token')).toBeInTheDocument()
    expect(screen.getByText('mobile-token')).toBeInTheDocument()
    expect(screen.getByText('idLast4')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
    expect(screen.getByText('keyA')).toBeInTheDocument()
    expect(screen.getByText('mobile-key-a')).toBeInTheDocument()
    expect(screen.getByText('mobile-token').closest('[data-rrweb-sensitive]')).not.toBeNull()
    expect(screen.getByText('mobile-key-a').closest('[data-rrweb-sensitive]')).not.toBeNull()
    expect(screen.queryByText('status')).not.toBeInTheDocument()
    expect(screen.queryByText('message')).not.toBeInTheDocument()
    expect(screen.queryByText('requestId')).not.toBeInTheDocument()
    expect(screen.queryByText('mock')).not.toBeInTheDocument()
    expect(screen.queryByText('authResultId')).not.toBeInTheDocument()
    expect(screen.queryByText('张三')).not.toBeInTheDocument()
    expect(screen.queryByText(/"token": "mobile-token"/)).not.toBeInTheDocument()
  })

  it('logs phone-ready payloads from the UMD SDK instance for manual verification', async () => {
    const payload = {
      maskedMobile: '138****1234',
      rawText: '用于验证 138****1234 的实名信息',
      source: 'ydrzPhoneControl',
    }
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    render(<AuthHostPage />)

    try {
      await waitFor(() => expect(mockCreateAssistanceMobileAuthSdk).toHaveBeenCalled())
      const options = mockCreateAssistanceMobileAuthSdk.mock.calls[0]?.[0]

      options.onPhoneReady?.(payload)

      expect(logSpy).toHaveBeenCalledWith('[phone-ready]', payload)
    } finally {
      logSpy.mockRestore()
    }
  })

  it('loads the ESM JSSDK module from the host page and opens verification through the ESM instance', async () => {
    mockEsmSdk.open.mockResolvedValue({
      status: 'success',
      message: 'ESM 验证完成',
      token: 'esm-token',
      idLast4: '5678',
      keyA: 'esm-key-a',
    })
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '测试 ESM JSSDK' }))

    try {
      await waitFor(() => expect(mockLoadAssistanceMobileAuthEsmModule).toHaveBeenCalled())
      expect(mockCreateEsmAssistanceMobileAuthSdk).toHaveBeenCalledWith(expect.objectContaining({
        authWindowTitle: '移动认证验证窗口（ESM）',
      }))
      await waitFor(() => expect(mockEsmSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
      expect(screen.getByText((_, element) => element?.textContent === '当前 JSSDK 通道：ESM')).toBeInTheDocument()
      expect(screen.getByText('esm-token')).toBeInTheDocument()
      expect(logSpy).toHaveBeenCalledWith('[esm-jssdk-test]', expect.objectContaining({ stage: 'open-success' }))
    } finally {
      logSpy.mockRestore()
    }
  })

  it('opens a dedicated UMD options test with hidden close control and native keyboard input', async () => {
    const optionTestSdk = {
      authorize: vi.fn(),
      clear: vi.fn(),
      open: vi.fn().mockResolvedValue({
        status: 'success',
        message: '验证完成',
        token: 'option-token',
        idLast4: '1357',
        keyA: 'option-key-a',
      }),
      openVerification: vi.fn(),
      close: vi.fn(),
      destroy: vi.fn(),
      precheck: vi.fn(),
    }
    mockCreateAssistanceMobileAuthSdk
      .mockReturnValueOnce(mockSdk)
      .mockReturnValueOnce(optionTestSdk)

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '测试无关闭X + 系统键盘' }))

    await waitFor(() => expect(optionTestSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
    expect(mockCreateAssistanceMobileAuthSdk).toHaveBeenLastCalledWith(expect.objectContaining({
      authWindowTitle: '移动认证验证窗口（无关闭X / 系统键盘）',
      closable: false,
      useCustomKeyboard: false,
      authWindowHeightMode: 'auto',
    }))
    expect(optionTestSdk.destroy).toHaveBeenCalled()
    expect(mockSdk.open).not.toHaveBeenCalled()
    expect(screen.getByText('option-token')).toBeInTheDocument()
  })

  it.each([
    { supportsDvh: true, expectedMaxHeight: '88dvh' },
    { supportsDvh: false, expectedMaxHeight: '88vh' },
  ] as const)(
    'opens zidingyi with the custom keyboard and auto height capped at $expectedMaxHeight',
    async ({ supportsDvh, expectedMaxHeight }) => {
      vi.stubGlobal('CSS', {
        supports: vi.fn((property: string, value: string) => (
          property === 'height' && value === '100dvh' && supportsDvh
        )),
      })
    const skinTestSdk = {
      authorize: vi.fn(),
      clear: vi.fn(),
      open: vi.fn().mockResolvedValue({
        status: 'success',
        message: '验证完成',
        token: 'skin-token',
        idLast4: '2468',
        keyA: 'skin-key-a',
      }),
      openVerification: vi.fn(),
      close: vi.fn(),
      destroy: vi.fn(),
      precheck: vi.fn(),
    }
    mockCreateAssistanceMobileAuthSdk
      .mockReturnValueOnce(mockSdk)
      .mockReturnValueOnce(skinTestSdk)

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '测试银联三要素皮肤（zidingyi）' }))

    await waitFor(() => expect(skinTestSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
    const options = mockCreateAssistanceMobileAuthSdk.mock.calls.at(-1)?.[0]
    expect(options).toEqual(expect.objectContaining({
      appId: '8a9481c79c05c8bd019f6f42956924a0',
      authWindowTitle: '银杏助填版本23',
      useCustomKeyboard: true,
      authWindowHeightMode: 'auto',
      authWindowMaxHeight: expectedMaxHeight,
    }))
    expect(options).not.toHaveProperty('authWindowHeight')
    expect(options).not.toHaveProperty('onBeforeLogin')
    expect(options).not.toHaveProperty('onStateChange')
    expect(skinTestSdk.destroy).toHaveBeenCalled()
    expect(mockSdk.open).not.toHaveBeenCalled()
    },
  )

  it.each([
    {
      mode: 'before-login-only',
      expectedBeforeLogin: true,
      expectedStateChange: false,
    },
    {
      mode: 'state-change-only',
      expectedBeforeLogin: false,
      expectedStateChange: true,
    },
    {
      mode: 'both',
      expectedBeforeLogin: true,
      expectedStateChange: true,
    },
    {
      mode: 'throw',
      expectedBeforeLogin: true,
      expectedStateChange: true,
    },
    {
      mode: 'reject',
      expectedBeforeLogin: true,
      expectedStateChange: true,
    },
  ] as const)(
    'configures $mode notification observation mode without legacy gate results',
    async ({ mode, expectedBeforeLogin, expectedStateChange }) => {
      const skinTestSdk = {
        authorize: vi.fn(),
        clear: vi.fn(),
        open: vi.fn().mockResolvedValue({
          status: 'success',
          message: '验证完成',
          token: 'skin-token',
          idLast4: '2468',
          keyA: 'skin-key-a',
        }),
        openVerification: vi.fn(),
        close: vi.fn(),
        destroy: vi.fn(),
        precheck: vi.fn(),
      }
      mockCreateAssistanceMobileAuthSdk
        .mockReturnValueOnce(mockSdk)
        .mockReturnValueOnce(skinTestSdk)

      render(<AuthHostPage />)
      fireEvent.change(screen.getByRole('combobox', { name: '通知回调观察模式' }), {
        target: { value: mode },
      })
      fireEvent.click(screen.getByRole('button', { name: '测试银联三要素皮肤（zidingyi）' }))

      await waitFor(() => expect(skinTestSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
      const options = mockCreateAssistanceMobileAuthSdk.mock.calls.at(-1)?.[0]
      expect(typeof options?.onBeforeLogin === 'function').toBe(expectedBeforeLogin)
      expect(typeof options?.onStateChange === 'function').toBe(expectedStateChange)
    },
  )

  it('logs complete, incomplete, complete notifications with callback-local call counts only', async () => {
    const skinTestSdk = {
      authorize: vi.fn(),
      clear: vi.fn(),
      open: vi.fn(() => new Promise(() => undefined)),
      openVerification: vi.fn(),
      close: vi.fn(),
      destroy: vi.fn(),
      precheck: vi.fn(),
    }
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    mockCreateAssistanceMobileAuthSdk
      .mockReturnValueOnce(mockSdk)
      .mockReturnValueOnce(skinTestSdk)

    render(<AuthHostPage />)
    fireEvent.change(screen.getByRole('combobox', { name: '通知回调观察模式' }), {
      target: { value: 'both' },
    })
    fireEvent.click(screen.getByRole('button', { name: '测试银联三要素皮肤（zidingyi）' }))

    try {
      await waitFor(() => expect(skinTestSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
      const options = mockCreateAssistanceMobileAuthSdk.mock.calls.at(-1)?.[0]

      act(() => {
        options?.onStateChange?.({ type: 'idLast4Complete' })
        options?.onBeforeLogin?.()
        options?.onStateChange?.({ type: 'idLast4Incomplete' })
        options?.onStateChange?.({ type: 'idLast4Complete' })
        options?.onBeforeLogin?.()
      })

      expect(screen.getByRole('log', { name: '通知回调日志' })).toHaveTextContent(
        'onStateChange · idLast4Complete · 第 1 次',
      )
      expect(screen.getByRole('log', { name: '通知回调日志' })).toHaveTextContent(
        'onStateChange · idLast4Incomplete · 第 2 次',
      )
      expect(screen.getByRole('log', { name: '通知回调日志' })).toHaveTextContent(
        'onStateChange · idLast4Complete · 第 3 次',
      )
      expect(screen.getByRole('log', { name: '通知回调日志' })).toHaveTextContent(
        'onBeforeLogin · idLast4Complete · 第 2 次',
      )
      expect(logSpy).toHaveBeenLastCalledWith(
        '[auth-notification]',
        { callback: 'onBeforeLogin', event: 'idLast4Complete', calls: 2 },
      )
      expect(JSON.stringify(logSpy.mock.calls)).not.toMatch(/1234|138|token|provider/i)
    } finally {
      logSpy.mockRestore()
    }
  })

  it('does not render any Haike test entry on the default test page', () => {
    render(<AuthHostPage />)

    expect(screen.queryByTestId('haike-inline-test-trigger')).not.toBeInTheDocument()
    expect(screen.queryByTestId('haike-inline-test-fixture')).not.toBeInTheDocument()
    expect(screen.queryByText('测试海客四协议（指定 appId）')).not.toBeInTheDocument()
  })

  it('renders Haike diagnostics, records safe callback summaries in occurrence order, and does not duplicate them on promise settlement', async () => {
    type HaikeSuccessResult = {
      status: 'success'
      message: string
      token: string
      idLast4: string
      keyA: string
    }
    let resolveOpen: ((payload: HaikeSuccessResult) => void) | undefined
    const haikeInlineSdk = {
      authorize: vi.fn(),
      clear: vi.fn(),
      open: vi.fn(() => new Promise<HaikeSuccessResult>((resolve) => {
        resolveOpen = resolve
      })),
      openVerification: vi.fn(),
      close: vi.fn(),
      destroy: vi.fn(),
      precheck: vi.fn(),
    }
    mockCreateAssistanceMobileAuthSdk
      .mockReturnValueOnce(mockSdk)
      .mockReturnValueOnce(haikeInlineSdk)

    render(<AuthHostPage variant="haike" />)

    expect(screen.getByTestId('haike-inline-test-trigger')).toBeVisible()
    expect(screen.getAllByRole('button', { name: '测试海客 inline 授权卡片（指定 appId）' })).toHaveLength(1)
    expect(screen.getAllByRole('button').map((button) => (
      button.getAttribute('aria-label') ?? button.textContent?.trim()
    ))).toEqual([
      '测试海客 inline 授权卡片（指定 appId）',
      '清空 Haike 回调日志',
      '清空 rrweb 事件',
    ])
    expect(screen.getByRole('region', { name: 'Haike JSSDK 状态与结果' })).toHaveTextContent(
      '点击测试海客 inline 授权卡片（指定 appId）后，将通过我们的 JSSDK 拉起内嵌验证卡片。',
    )
    expect(screen.getByRole('region', { name: 'Haike JSSDK 状态与结果' })).toHaveClass('rr-block')
    expect(screen.getByRole('log', { name: 'Haike 回调日志' })).toHaveClass('rr-block')
    expect(screen.getByRole('region', { name: 'rrweb 事件监视器' })).toHaveClass('rr-block')
    expect(screen.queryByRole('button', { name: '立即支付-jssdk' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('haike-inline-test-trigger'))
    await waitFor(() => expect(haikeInlineSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
    const options = mockCreateAssistanceMobileAuthSdk.mock.calls.at(-1)?.[0]

    act(() => {
      options?.onPhoneReady?.({ maskedMobile: '138****1234', rawText: 'do-not-log-this' })
      options?.onStateChange?.({ type: 'idLast4Complete' })
      options?.onStateChange?.({ type: 'idLast4Incomplete' })
      options?.onBeforeLogin?.()
      options?.onSuccess?.({ status: 'success', message: '验证完成', token: 'token-secret', idLast4: '1234', keyA: 'key-secret' })
      options?.onError?.({ code: 'PROVIDER_FAILED', message: 'do-not-log-this' })
      options?.onCancel?.({ raw: 'do-not-log-this' })
      options?.onClose?.()
    })

    const callbackLog = screen.getByRole('log', { name: 'Haike 回调日志' })
    expect(callbackLog).toHaveTextContent('onPhoneReady · 138****1234')
    expect(callbackLog).toHaveTextContent('onStateChange · idLast4Complete')
    expect(callbackLog).toHaveTextContent('onStateChange · idLast4Incomplete')
    expect(callbackLog).toHaveTextContent('onBeforeLogin')
    expect(callbackLog).toHaveTextContent('onSuccess')
    expect(callbackLog).toHaveTextContent('onError · PROVIDER_FAILED')
    expect(callbackLog).toHaveTextContent('onCancel')
    expect(callbackLog).toHaveTextContent('onClose')
    expect(callbackLog.textContent).not.toMatch(/token-secret|key-secret|do-not-log-this/)
    expect([...callbackLog.querySelectorAll('li')].map((entry) => entry.textContent)).toEqual([
      'onPhoneReady · 138****1234',
      'onStateChange · idLast4Complete',
      'onStateChange · idLast4Incomplete',
      'onBeforeLogin',
      'onSuccess',
      'onError · PROVIDER_FAILED',
      'onCancel',
      'onClose',
    ])

    act(() => {
      resolveOpen?.({ status: 'success', message: '验证完成', token: 'token-secret', idLast4: '1234', keyA: 'key-secret' })
    })
    await waitFor(() => expect(screen.getByText('验证成功')).toBeInTheDocument())
    expect(callbackLog.querySelectorAll('li')).toHaveLength(8)

    fireEvent.click(screen.getByRole('button', { name: '清空 Haike 回调日志' }))
    expect(callbackLog).toHaveTextContent('暂无回调')

    act(() => options?.onBeforeLogin?.())
    expect(callbackLog).toHaveTextContent('onBeforeLogin')
    fireEvent.click(screen.getByTestId('haike-inline-test-trigger'))
    expect(callbackLog).toHaveTextContent('暂无回调')
  })

  it('renders a visible Haike inline fixture on the dedicated page and creates the exact inline SDK instance', async () => {
    const haikeInlineSdk = {
      authorize: vi.fn(),
      clear: vi.fn(),
      open: vi.fn().mockImplementation(() => new Promise(() => undefined)),
      openVerification: vi.fn(),
      close: vi.fn(),
      destroy: vi.fn(),
      precheck: vi.fn(),
    }
    mockCreateAssistanceMobileAuthSdk
      .mockReturnValueOnce(mockSdk)
      .mockReturnValueOnce(haikeInlineSdk)

    const { unmount } = render(<AuthHostPage variant="haike" />)
    const fixture = screen.getByTestId('haike-inline-test-fixture')
    const renderTo = screen.getByTestId('haike-inline-test-render-to')
    const entry = screen.getByTestId('haike-inline-test-trigger')

    expect(document.title).toBe('银商助理海客测试页')
    expect(screen.queryByText('快捷支付签约订单')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '立即支付-jssdk' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /运行预检/ })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'rrweb 事件监视器' })).toHaveClass('rr-block')
    expect(fixture).toBeVisible()
    expect(renderTo).toHaveClass('mx-auto', 'aspect-[84/100]', 'w-full', 'max-w-[430px]')
    expect(entry).toBeVisible()
    await waitFor(() => expect(mockVConsoleCreate).toHaveBeenCalledTimes(1))

    fireEvent.click(entry)

    await waitFor(() => expect(haikeInlineSdk.open).toHaveBeenCalledWith({ scene: 'native-number' }))
    expect(mockCreateAssistanceMobileAuthSdk).toHaveBeenLastCalledWith(expect.objectContaining({
      appId: '8a9481c79c05c8bd019ed8d7ab571df3',
      display: 'inline',
      renderTo,
    }))
    expect(haikeInlineSdk.destroy).not.toHaveBeenCalled()

    unmount()
    expect(haikeInlineSdk.destroy).toHaveBeenCalledTimes(1)
    expect(mockVConsoleDestroy).toHaveBeenCalledTimes(1)
  })

  it('logs phone-ready payloads from the ESM SDK instance for manual verification', async () => {
    mockEsmSdk.open.mockResolvedValue({
      status: 'success',
      message: 'ESM 验证完成',
      token: 'esm-token',
      idLast4: '5678',
      keyA: 'esm-key-a',
    })
    const payload = {
      maskedMobile: '138****5678',
      rawText: '用于验证 138****5678 的实名信息',
      source: 'ydrzPhoneControl',
    }
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '测试 ESM JSSDK' }))

    try {
      await waitFor(() => expect(mockCreateEsmAssistanceMobileAuthSdk).toHaveBeenCalled())
      const options = mockCreateEsmAssistanceMobileAuthSdk.mock.calls[0]?.[0]

      options.onPhoneReady?.(payload)

      expect(logSpy).toHaveBeenCalledWith('[phone-ready]', payload)
    } finally {
      logSpy.mockRestore()
    }
  })

  it.each(['check', 'query'] as const)('shows %s HTTP details under rrweb protection and clears old results before retry', async (operation) => {
    mockSdk.open.mockResolvedValue({ status: 'success', message: '验证完成', token: 'mobile-token', idLast4: '1718', keyA: 'mobile-key-a' })
    const clientMethod = operation === 'check' ? mockBusinessDemoClient.checkIdentity : mockBusinessDemoClient.queryIdentity
    const body = '<html>upstream unavailable</html>'
    clientMethod.mockResolvedValueOnce({ kind: 'request-failed', message: '上游异常详情', action: 'retry-fetch', http: { status: 502, statusText: 'Bad Gateway', body } })
    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-jssdk' }))
    await screen.findByText('mobile-token')
    fireEvent.click(screen.getByRole('button', { name: `调用 ${operation}` }))
    const panel = await screen.findByRole('region', { name: `${operation} HTTP 诊断` })
    expect(panel).toHaveAttribute('data-rrweb-sensitive', 'true')
    expect(panel).toHaveClass('rr-block')
    expect(panel).toHaveTextContent('HTTP 502 Bad Gateway')
    expect(panel).toHaveTextContent('浏览器收到的 HTTP 响应')
    expect(panel).toHaveTextContent(body)
    expect(panel.querySelector('html')).toBeNull()
    expect(screen.getAllByText('上游异常详情').every((node) => node.closest('.rr-block[data-rrweb-sensitive="true"]'))).toBe(true)
    let finish: (value: unknown) => void = () => undefined
    clientMethod.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
    fireEvent.click(screen.getByRole('button', { name: `调用 ${operation}` }))
    expect(screen.queryByRole('region', { name: `${operation} HTTP 诊断` })).toBeNull()
    await act(async () => finish({ kind: 'request-failed', message: '请求失败', action: 'retry-fetch', http: { status: null, statusText: null, body: null, error: 'Failed to fetch' } }))
    const retried = await screen.findByRole('region', { name: `${operation} HTTP 诊断` })
    expect(retried).toHaveTextContent('未收到 HTTP 响应')
    expect(retried).toHaveTextContent('Failed to fetch')
    expect(retried).not.toHaveTextContent('502')
  })

  it('shows the query business failure code even when HTTP succeeds', async () => {
    mockSdk.open.mockResolvedValue({ status: 'success', message: '验证完成', token: 'mobile-token', idLast4: '1718', keyA: 'mobile-key-a' })
    mockBusinessDemoClient.queryIdentity.mockResolvedValue({ kind: 'identity-failed', message: '系统异常', action: 'retry-fetch', code: 'QUERY_500', http: { status: 200, statusText: 'OK', body: '{"code":"QUERY_500","message":"系统异常"}' } })
    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-jssdk' }))
    await screen.findByText('mobile-token')
    fireEvent.click(screen.getByRole('button', { name: '调用 query' }))
    const panel = await screen.findByRole('region', { name: 'query HTTP 诊断' })
    expect(panel).toHaveTextContent('HTTP 200 OK')
    expect(panel).toHaveTextContent('identity-failed')
    expect(panel).toHaveTextContent('QUERY_500')
    expect(panel).toHaveTextContent('retry-fetch')
  })

  it('runs internal business-demo check query and decrypts with the entered SM4 key', async () => {
    mockSdk.open.mockResolvedValue({
      status: 'success',
      message: '验证完成',
      token: 'mobile-token',
      idLast4: '1718',
      keyA: 'mobile-key-a',
    })
    mockBusinessDemoClient.checkIdentity.mockResolvedValue({ kind: 'verified', message: '核验通过' })
    mockBusinessDemoClient.queryIdentity.mockResolvedValue({
      kind: 'identity-encrypted',
      message: '查询成功',
      identity: {
        encryptedName: '81e14c9984617e662117ca545d7adf04',
        encryptedMobile: '2148c59fb4a7085a0e1c1224ef025381',
        encryptedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
      },
    })

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-jssdk' }))

    await screen.findByText('mobile-token')
    fireEvent.change(screen.getByLabelText('SM4 密钥'), {
      target: { value: 'fda3882b14df6abb4f9142999d57cacf' },
    })
    fireEvent.click(screen.getByRole('button', { name: '调用 check' }))
    await waitFor(() => expect(mockBusinessDemoClient.checkIdentity).toHaveBeenCalledWith({
      token: 'mobile-token',
      idLast4: '1718',
      keyA: 'mobile-key-a',
    }))

    fireEvent.click(screen.getByRole('button', { name: '调用 query' }))
    await waitFor(() => expect(screen.getByText('徐三')).toBeInTheDocument())
    expect(screen.getByText('15971413742')).toBeInTheDocument()
    expect(screen.getByText('530125199203241718')).toBeInTheDocument()
    expect(screen.getByLabelText('SM4 密钥')).toHaveAttribute('data-rrweb-sensitive', 'true')
    expect(screen.getByText('徐三').closest('[data-rrweb-sensitive]')).not.toBeNull()
    expect(screen.getAllByText('查询成功').length).toBeGreaterThanOrEqual(2)
    expect(screen.queryByText('encryptedName')).not.toBeInTheDocument()
    expect(screen.queryByText('encryptedMobile')).not.toBeInTheDocument()
    expect(screen.queryByText('encryptedIdCard')).not.toBeInTheDocument()
    expect(screen.queryByText('81e14c9984617e662117ca545d7adf04')).not.toBeInTheDocument()
    expect(screen.queryByText('2148c59fb4a7085a0e1c1224ef025381')).not.toBeInTheDocument()
    expect(screen.queryByText('67e43ccf0f591daeebaa0789dc4161da')).not.toBeInTheDocument()
  })

  it('runs precheck and shows the reason + logs to console', async () => {
    mockSdk.precheck.mockResolvedValue({ eligible: false, reason: 'non-mobile', raw: { code: '110031' } })
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    const { getByRole, findAllByText } = render(<AuthHostPage />)
    fireEvent.click(getByRole('button', { name: /运行预检/ }))

    try {
      const matches = await findAllByText(/non-mobile/)
      expect(matches.some((el) => el.tagName === 'DD')).toBe(true)
      expect(mockSdk.precheck).toHaveBeenCalledWith({ scene: 'native-number' })
      expect(mockSessionClient.createSession).not.toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalledWith('[precheck]', expect.objectContaining({ reason: 'non-mobile' }))
    } finally {
      logSpy.mockRestore()
    }
  })

  it('passes mobileAuthEnv from URL to H5 redirect session creation', async () => {
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '?mobileAuthEnv=prod',
        assign,
      },
      configurable: true,
      writable: true,
    })

    render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-h5转跳' }))

    await waitFor(() =>
      expect(mockSessionClient.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'customer-app-id',
          appKey: 'customer-app-key',
          mobileAuthEnv: 'prod',
        })
      )
    )
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://ginkgo.chinaums.com/sign-pay-pro/auth?launchToken=sft_launch_test&mobileAuthEnv=prod'))
  })

  it('shows cancel and failure outcomes from JSSDK completion', async () => {
    mockSdk.open.mockRejectedValueOnce(new Error('Assistance auth cancelled'))

    const { unmount } = render(<AuthHostPage />)
    fireEvent.click(screen.getByRole('button', { name: '立即支付-jssdk' }))
    await waitFor(() => expect(screen.getByText('已取消验证')).toBeInTheDocument())

    unmount()
    render(<AuthHostPage />)
    const onError = mockCreateAssistanceMobileAuthSdk.mock.calls.at(-1)?.[0].onError
    act(() => {
      onError?.({ code: 'VERIFICATION_FAILED', message: '验证失败' })
    })

    await waitFor(() => expect(screen.getAllByText('验证失败').length).toBeGreaterThan(0))
    expect(screen.getByText('JSSDK 错误返回')).toBeInTheDocument()
    expect(screen.getByText(/"code": "VERIFICATION_FAILED"/)).toBeInTheDocument()
  })

  it('shows the rrweb monitor only on the staging test-page route', () => {
    window.history.replaceState({}, '', '/sign-pay-pro/test-page')
    render(<AuthHostPage />)
    expect(screen.getByRole('region', { name: 'rrweb 事件监视器' })).toHaveClass('rr-block')
    window.history.replaceState({}, '', '/')
  })

  it('hides the rrweb monitor outside the staging test-page route', () => {
    window.history.replaceState({}, '', '/sign-pay-pro/')
    render(<AuthHostPage />)
    expect(screen.queryByRole('region', { name: 'rrweb 事件监视器' })).toBeNull()
  })
})
