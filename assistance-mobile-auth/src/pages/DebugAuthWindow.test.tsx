import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockLoadMobileAuthSdkResources,
  mockCreateMobileAuthSdkFacade,
  mockFacade,
} = vi.hoisted(() => ({
  mockLoadMobileAuthSdkResources: vi.fn(),
  mockCreateMobileAuthSdkFacade: vi.fn(),
  mockFacade: {
    showAuthPage: vi.fn(),
    initControl: vi.fn(),
    clearControl: vi.fn(),
  },
}))

vi.mock('../sdk/resourceLoader', () => ({
  loadMobileAuthSdkResources: mockLoadMobileAuthSdkResources,
}))

vi.mock('../sdk/mobileAuthFacade', () => ({
  createMobileAuthSdkFacade: mockCreateMobileAuthSdkFacade,
}))

import { sdkControlSlotMap } from '../sdk/slots'
import { DebugAuthWindow } from './DebugAuthWindow'

describe('DebugAuthWindow', () => {
  beforeEach(() => {
    window.history.replaceState(
      null,
      '',
      '/debug-auth?assistanceAuthSessionId=debug-session&debugSdkVersion=1.0.7-local-vendor&debugAppId=app&debugSign=sign&debugTraceId=trace&debugTimestamp=1&debugAuthType=11&debugScope=3ElementsAuthAssistFill',
    )
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined)
    mockLoadMobileAuthSdkResources.mockReset()
    mockCreateMobileAuthSdkFacade.mockReset()
    mockFacade.showAuthPage.mockReset()
    mockFacade.initControl.mockReset()
    mockFacade.clearControl.mockReset()
    mockCreateMobileAuthSdkFacade.mockReturnValue(mockFacade)
    mockLoadMobileAuthSdkResources.mockResolvedValue({ state: 'ready' })
    mockFacade.showAuthPage.mockImplementation(({ success }) => success?.({ code: '103000' }))
    mockFacade.initControl.mockImplementation(() => undefined)
  })

  it('uses the same phone subtitle and agreement panel slot layout as the verification sheet', async () => {
    render(<DebugAuthWindow />)

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))
    await act(async () => {
      await Promise.resolve()
    })

    const subtitle = screen.getByTestId('debug-phone-subtitle')
    const panel = screen.getByTestId('debug-agreement-panel')

    expect(subtitle).toHaveTextContent('用于验证')
    expect(subtitle).toHaveTextContent('的实名信息')
    expect(subtitle).toContainElement(document.getElementById(sdkControlSlotMap.phone))
    expect(panel).toContainElement(document.getElementById(sdkControlSlotMap.agreement))
    expect(panel).toContainElement(document.getElementById(sdkControlSlotMap.tips))
    expect(panel).toContainElement(document.getElementById(sdkControlSlotMap.submit))
  })

  it('ignores retired debug overrides and calls the official SDK with authType 0', async () => {
    render(<DebugAuthWindow />)

    await waitFor(() => expect(mockFacade.showAuthPage).toHaveBeenCalledTimes(1))

    expect(mockLoadMobileAuthSdkResources).toHaveBeenCalledWith(expect.objectContaining({
      jsUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js',
    }))
    expect(mockFacade.showAuthPage).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        authType: '0',
      }),
    }))
  })

  it('initializes the debug SDK with the new confirm button style defaults', async () => {
    render(<DebugAuthWindow />)

    await waitFor(() => expect(mockFacade.initControl).toHaveBeenCalledTimes(1))

    const req = mockFacade.initControl.mock.calls[0]?.[0]
    expect(req?.styleOption?.submitBtnStyle).toEqual(
      expect.objectContaining({
        name: '确认',
        height: '48px',
        borderRadius: '10px',
      }),
    )
  })
})
