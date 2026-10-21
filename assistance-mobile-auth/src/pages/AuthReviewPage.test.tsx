import { readFileSync } from 'node:fs'
import path from 'node:path'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockLoadMobileAuthSdkResources,
  mockCreateMobileAuthSdkFacade,
  mockGetMobileAuthSdkConfig,
  mockFacade,
} = vi.hoisted(() => ({
  mockLoadMobileAuthSdkResources: vi.fn(),
  mockCreateMobileAuthSdkFacade: vi.fn(),
  mockGetMobileAuthSdkConfig: vi.fn(),
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

import { AuthReviewPage } from './AuthReviewPage'

const forbiddenRuntimeText = [
  '非本机' + '短信校验',
  '重新' + '获取验证码',
  '发送' + '验证码',
  '输入' + '手机号',
]

const forbiddenSourceStrings = [
  'sms-' + 'fallback',
  'Compact' + 'SmsVerification',
  '改用' + '短信验证',
  '输入' + '手机号',
  '发送' + '验证码',
  '重新' + '获取验证码',
]

describe('AuthReviewPage', () => {
  beforeEach(() => {
    mockLoadMobileAuthSdkResources.mockReset()
    mockCreateMobileAuthSdkFacade.mockReset()
    mockGetMobileAuthSdkConfig.mockReset()
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

  it('renders the native-number-only verification window content', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))

    expect(screen.getByRole('heading', { name: '确认身份信息' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '输入身份证后4位' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '手机号验证' })).not.toBeInTheDocument()

    for (const forbidden of forbiddenRuntimeText) {
      expect(screen.queryByText(forbidden)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: forbidden })).not.toBeInTheDocument()
    }
  })

  it('keeps sdk-only non-local seam nodes without self-authored sms controls', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))

    expect(document.querySelector('#ydrzPhoneControl')).toBeInTheDocument()
    expect(document.querySelector('#ydrzTipsControl')).toBeInTheDocument()
    expect(document.querySelector('#ydrzStateControl')).toBeInTheDocument()
    expect(document.querySelector('#ydrzYZMControl')).toBeInTheDocument()
    expect(document.querySelector('#ydrzYZMBtnControl')).toBeInTheDocument()
    expect(document.querySelector('#ydrzSubmitControl')).toBeInTheDocument()
    expect(document.querySelector('#ydrzAgreementControl')).toBeInTheDocument()
  })

  it('keeps sdk-owned controls mounted without visible compact-sheet placeholders or a competing H5 submit button', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))

    for (const controlId of ['ydrzPhoneControl', 'ydrzTipsControl', 'ydrzStateControl', 'ydrzSubmitControl']) {
      const control = document.querySelector(`#${controlId}`)
      expect(control, `expected #${controlId} to exist`).toBeInTheDocument()
      if (controlId === 'ydrzSubmitControl') {
        expect(control?.closest('[data-testid="compact-agreement-panel"]')).not.toBeNull()
        expect(control?.closest('[data-testid="compact-authorize-footer"]')).toBeNull()
      } else if (controlId === 'ydrzPhoneControl') {
        expect(control?.closest('[data-testid="compact-phone-subtitle"]')).not.toBeNull()
        expect(control?.closest('.h-0')).toBeNull()
      } else if (controlId === 'ydrzTipsControl') {
        expect(control?.closest('[data-testid="compact-agreement-panel"]')).not.toBeNull()
      } else {
        // tips/state 保持挂载供 SDK getElementById 注入，但视觉上折叠隐藏。
        expect(control?.closest('.h-0')).not.toBeNull()
        expect(control).toHaveAttribute('aria-hidden', 'true')
      }
    }

    expect(screen.queryByRole('button', { name: '确认并提交验证' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument()
  })

  it('renders a single SDK agreement seam with no self-owned checkboxes', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(document.querySelector('#ydrzAgreementControl')).toBeInTheDocument()
  })

  it('keeps forbidden self-enter sms source strings deleted from the auth page and scenario data', () => {
    const sourcePaths = [
      'src/pages/AuthReviewPage.tsx',
      'src/pages/AuthVerificationWindow.tsx',
      'src/lib/authReviewScenarios.ts',
      'src/components/auth/VerificationBlock.tsx',
    ]

    for (const sourcePath of sourcePaths) {
      const source = readFileSync(path.resolve(process.cwd(), sourcePath), 'utf8')

      for (const forbidden of forbiddenSourceStrings) {
        expect(source).not.toContain(forbidden)
      }
    }
  })

  it('keeps the page free of direct window.YDRZAuthSF access', () => {
    const pageSourcePath = path.resolve(process.cwd(), 'src/pages/AuthReviewPage.tsx')
    const pageSource = readFileSync(pageSourcePath, 'utf8')

    expect(pageSource).not.toContain('window.YDRZAuthSF')
  })
})
