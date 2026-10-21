import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen, waitFor } from '@testing-library/react'
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

import { sdkControlSlotMap } from '../sdk/slots'
import { AuthReviewPage } from './AuthReviewPage'

describe('AuthReviewPage sdk-ready', () => {
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

  it('preserves canonical sdk control nodes including SDK-only non-local seams', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))

    for (const controlId of Object.values(sdkControlSlotMap)) {
      expect(document.querySelector(`#${controlId}`), `expected #${controlId} to exist`).toBeInTheDocument()
    }
  })

  it('keeps the phone slot visible, tips/state slots mounted-but-collapsed, and the sdk agreement seam present with no self-owned checkboxes', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))

    for (const slot of ['phone', 'tips', 'state', 'submit'] as const) {
      const control = document.querySelector(`#${sdkControlSlotMap[slot]}`)
      expect(control, `expected ${slot} slot to exist`).toBeInTheDocument()
      if (slot === 'submit') {
        expect(control?.closest('[data-testid="compact-agreement-panel"]')).not.toBeNull()
        expect(control?.closest('[data-testid="compact-authorize-footer"]')).toBeNull()
      } else if (slot === 'phone') {
        expect(control?.closest('[data-testid="compact-phone-subtitle"]')).not.toBeNull()
        expect(control?.closest('.h-0')).toBeNull()
      } else if (slot === 'tips') {
        expect(control?.closest('[data-testid="compact-agreement-panel"]')).not.toBeNull()
      } else {
        // tips/state 保持挂载供 SDK 注入，但视觉上折叠隐藏。
        expect(control?.closest('.h-0')).not.toBeNull()
        expect(control).toHaveAttribute('aria-hidden', 'true')
      }
    }

    expect(document.querySelector(`#${sdkControlSlotMap.agreement}`)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /已阅读并同意/ })).not.toBeInTheDocument()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('keeps sdk metadata hidden and machine-readable', async () => {
    render(<AuthReviewPage />)

    await waitFor(() => expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledTimes(1))

    const metadata = document.querySelector('[data-sdk-meta]')
    expect(metadata).toBeInTheDocument()
    expect(metadata).toHaveAttribute('data-sdk-status', 'disabled')
    expect(metadata).toHaveAttribute('data-sdk-mode', 'live')
    expect(metadata).toHaveAttribute('data-sdk-debug-entry', 'hidden')
    expect(screen.queryByText(/^SDK Ready$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Phase 2 · SDK Ready/)).not.toBeInTheDocument()
  })

  it('keeps the page source free of direct window.YDRZAuthSF access', () => {
    const pageSourcePath = path.resolve(process.cwd(), 'src/pages/AuthReviewPage.tsx')
    const pageSource = readFileSync(pageSourcePath, 'utf8')

    expect(pageSource).not.toContain('window.YDRZAuthSF')
  })
})
