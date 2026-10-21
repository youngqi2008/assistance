import { describe, expect, it, vi } from 'vitest'

import type {
  MobileAuthSdkGetAuthResultRequest,
  MobileAuthSdkInitControlRequest,
  MobileAuthSdkResult,
  MobileAuthSdkShowAuthPageRequest,
  MobileAuthSdkSubmitButtonState,
} from './types'
import { MobileAuthSdkUnavailableError, createMobileAuthSdkFacade } from './mobileAuthFacade'

describe('createMobileAuthSdkFacade', () => {
  it('delegates showAuthPage to the SDK global with the original request object', () => {
    const showAuthPage = vi.fn()
    window.YDRZAuthSF = {
      showAuthPage,
      initControl: vi.fn(),
      clearControl: vi.fn(),
      getAuthResult: vi.fn(),
      updateSubmitBtnStatus: vi.fn(),
    }

    const facade = createMobileAuthSdkFacade()
    const request: MobileAuthSdkShowAuthPageRequest = {
      data: {
        appId: 'app-id',
        sign: 'signature',
        traceId: 'trace-id',
        timestamp: '1710000000',
        authType: '0',
        scope: '3ElementsAuthAssistFill',
      },
      success: vi.fn(),
      error: vi.fn(),
    }

    facade.showAuthPage(request)

    expect(showAuthPage).toHaveBeenCalledWith(request)
  })

  it('throws MobileAuthSdkUnavailableError when the SDK global is missing', () => {
    delete window.YDRZAuthSF

    const facade = createMobileAuthSdkFacade()

    expect(() =>
      facade.showAuthPage({
        data: {
          appId: 'app-id',
          sign: 'signature',
          traceId: 'trace-id',
          timestamp: '1710000000',
          authType: '0',
          scope: '3ElementsAuthAssistFill',
        },
      }),
    ).toThrowError(MobileAuthSdkUnavailableError)
  })

  it('throws a method-specific unavailable error when one SDK method is missing', () => {
    window.YDRZAuthSF = {
      showAuthPage: vi.fn(),
      clearControl: vi.fn(),
      getAuthResult: vi.fn(),
      updateSubmitBtnStatus: vi.fn(),
    } as unknown as NonNullable<Window['YDRZAuthSF']>

    const facade = createMobileAuthSdkFacade()
    const request: MobileAuthSdkInitControlRequest = {
      styleOption: {},
      success: vi.fn(),
    }

    expect(() => facade.initControl(request)).toThrowError(
      new MobileAuthSdkUnavailableError('Mobile auth SDK method unavailable: initControl', 'initControl'),
    )
  })

  it('wraps the remaining approved SDK methods without requiring a real auth flow', () => {
    const initControl = vi.fn()
    const clearControl = vi.fn()
    const getAuthResult = vi.fn()
    const updateSubmitBtnStatus = vi.fn()

    window.YDRZAuthSF = {
      showAuthPage: vi.fn(),
      initControl,
      clearControl,
      getAuthResult,
      updateSubmitBtnStatus,
    }

    const facade = createMobileAuthSdkFacade()
    const initRequest: MobileAuthSdkInitControlRequest = {
      styleOption: {},
      beforeSubmit: vi.fn(() => true),
      authReady: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
    }
    const resultRequest: MobileAuthSdkGetAuthResultRequest = {
      data: { appId: 'app-id' },
      success: (payload: MobileAuthSdkResult) => payload,
      error: vi.fn(),
    }
    const submitState: MobileAuthSdkSubmitButtonState = { disabled: true, loading: true }

    facade.initControl(initRequest)
    facade.clearControl('ydrzSubmitControl')
    facade.getAuthResult(resultRequest)
    facade.updateSubmitBtnStatus(submitState)

    expect(initControl).toHaveBeenCalledWith(initRequest)
    expect(clearControl).toHaveBeenCalledWith('ydrzSubmitControl')
    expect(getAuthResult).toHaveBeenCalledWith(resultRequest)
    expect(updateSubmitBtnStatus).toHaveBeenCalledWith(submitState)
  })
})
