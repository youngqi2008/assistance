import { useEffect, useMemo, useRef, useState } from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { AuthParamsResolution } from '../sdk/authParamsProvider'
import type { MobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import type { MobileAuthSdkLoadState } from '../sdk/types'
import { deriveAuthFlowStatus, mapSdkOutcomeToScenarioState, shouldDisablePrimaryAction } from '../sdk/authFlow'
import { createMobileAuthStyleOption } from '../sdk/styleOption'

type HarnessProps = {
  paramsResolution: AuthParamsResolution
  sdkLoadState: MobileAuthSdkLoadState
  facade: MobileAuthSdkFacade
  scene?: 'native-number'
  initialResultAction?: 'retry-auth'
}

function TestAuthReviewPageHarness({
  paramsResolution,
  sdkLoadState,
  facade,
  scene = 'native-number',
  initialResultAction,
}: HarnessProps) {
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [authState, setAuthState] = useState<'default' | 'loading' | 'success' | 'failure' | 'cancel'>('default')
  const [controlInitFailed, setControlInitFailed] = useState(false)
  const [resultAction, setResultAction] = useState<'retry-auth' | null>(initialResultAction ?? null)
  const agreementCheckedRef = useRef(agreementChecked)
  const initializedRef = useRef(false)

  const flowStatus = deriveAuthFlowStatus({
    paramsStatus: paramsResolution.status,
    sdkLoadState,
    authState,
    controlInitFailed,
  })

  const primaryDisabled = shouldDisablePrimaryAction({
    agreementChecked,
    flowStatus,
  })

  useEffect(() => {
    if (!initializedRef.current) {
      return
    }

    facade.clearControl()
    initializedRef.current = false
    setAgreementChecked(false)
    setAuthState('default')
    setControlInitFailed(false)
  }, [facade, scene])

  useEffect(() => {
    return () => {
      if (initializedRef.current) {
        facade.clearControl()
      }
    }
  }, [facade])

  useEffect(() => {
    agreementCheckedRef.current = agreementChecked
  }, [agreementChecked])

  const helperText = useMemo(() => {
    if (flowStatus === 'params-not-ready') {
      return '授权参数暂未就绪'
    }

    if (flowStatus === 'sdk-not-ready' || flowStatus === 'control-init-failed') {
      return '授权服务暂不可用，请稍后重试。'
    }

    return ''
  }, [flowStatus])

  function markInitialized() {
    initializedRef.current = true
  }

  function handlePrimaryAction() {
    if (primaryDisabled || paramsResolution.status !== 'ready' || !paramsResolution.data) {
      return
    }

    setAuthState('loading')

    facade.showAuthPage({
      data: paramsResolution.data,
      success: (payload) => {
        if (mapSdkOutcomeToScenarioState(payload) !== 'success') {
          setAuthState(mapSdkOutcomeToScenarioState(payload))
          return
        }

        facade.initControl({
          styleOption: createMobileAuthStyleOption(),
          beforeSubmit: () => agreementCheckedRef.current,
          authReady: () => {
            setControlInitFailed(false)
          },
          success: (nextPayload) => {
            setAuthState(mapSdkOutcomeToScenarioState(nextPayload))
          },
          error: (nextPayload) => {
            const mappedState = mapSdkOutcomeToScenarioState(nextPayload)
            setControlInitFailed(mappedState === 'failure')
            setAuthState(mappedState)
          },
        })

        markInitialized()
      },
      error: (payload) => {
        setAuthState(mapSdkOutcomeToScenarioState(payload))
      },
    })
  }

  function handleResultAction() {
    if (resultAction !== 'retry-auth') {
      return
    }

    facade.clearControl()
    initializedRef.current = false
    setResultAction(null)
    setControlInitFailed(false)
    setAuthState('default')
  }

  return (
    <div>
      <label>
        <input type="checkbox" checked={agreementChecked} onChange={(event) => setAgreementChecked(event.target.checked)} />
        已阅读并同意
      </label>
      <button type="button" disabled={primaryDisabled} onClick={handlePrimaryAction}>
        确认
      </button>
      {resultAction ? (
        <button type="button" onClick={handleResultAction}>
          重新授权
        </button>
      ) : null}
      {helperText ? <p>{helperText}</p> : null}
    </div>
  )
}

describe('AuthReviewPage jssdk flow orchestration', () => {
  function createFacade(): MobileAuthSdkFacade {
    return {
      showAuthPage: vi.fn(),
      initControl: vi.fn(),
      clearControl: vi.fn(),
      getAuthResult: vi.fn(),
      updateSubmitBtnStatus: vi.fn(),
    }
  }

  const readyResolution: AuthParamsResolution = {
    status: 'ready',
    source: 'mock',
    data: {
      appId: 'mock-app-id',
      sign: 'mock-sign',
      traceId: 'mock-trace-id',
      timestamp: '20260101000000000',
      authType: '0',
      scope: '3ElementsAuthAssistFill',
    },
  }

  function startAuthCycle() {
    const agreementCheckbox = screen.getByRole('checkbox', { name: '已阅读并同意' })

    if (!(agreementCheckbox as HTMLInputElement).checked) {
      fireEvent.click(agreementCheckbox)
    }

    fireEvent.click(screen.getByRole('button', { name: '确认' }))
  }

  it('runs showAuthPage first and initControl after a successful sdk preflight', () => {
    const facade = createFacade()

    render(
      <TestAuthReviewPageHarness
        paramsResolution={readyResolution}
        sdkLoadState="ready"
        facade={facade}
      />,
    )

    startAuthCycle()

    expect(facade.showAuthPage).toHaveBeenCalledTimes(1)
    expect(facade.updateSubmitBtnStatus).not.toHaveBeenCalled()

    const showAuthPageRequest = vi.mocked(facade.showAuthPage).mock.calls[0]?.[0]
    expect(showAuthPageRequest).toMatchObject({
      data: readyResolution.data,
      success: expect.any(Function),
      error: expect.any(Function),
    })

    act(() => {
      showAuthPageRequest?.success?.({ code: '103000' })
    })

    expect(facade.initControl).toHaveBeenCalledTimes(1)
    expect(vi.mocked(facade.initControl).mock.calls[0]?.[0]).toMatchObject({
      styleOption: createMobileAuthStyleOption(),
      beforeSubmit: expect.any(Function),
      authReady: expect.any(Function),
      success: expect.any(Function),
      error: expect.any(Function),
    })
    expect(vi.mocked(facade.showAuthPage).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(facade.initControl).mock.invocationCallOrder[0],
    )
  })

  it('reads the latest agreement value from beforeSubmit after initControl registration', () => {
    const facade = createFacade()

    render(
      <TestAuthReviewPageHarness
        paramsResolution={readyResolution}
        sdkLoadState="ready"
        facade={facade}
      />,
    )

    startAuthCycle()

    const showAuthPageRequest = vi.mocked(facade.showAuthPage).mock.calls[0]?.[0]
    act(() => {
      showAuthPageRequest?.success?.({ code: '103000' })
    })

    const controlRequest = vi.mocked(facade.initControl).mock.calls[0]?.[0]
    expect(controlRequest).toBeDefined()
    expect(controlRequest?.beforeSubmit).toEqual(expect.any(Function))
    fireEvent.click(screen.getByRole('checkbox', { name: '已阅读并同意' }))

    expect(controlRequest?.beforeSubmit?.()).toBe(false)
  })

  it('skips sdk calls when auth params are not ready', () => {
    const facade = createFacade()

    render(
      <TestAuthReviewPageHarness
        paramsResolution={{ status: 'not-ready', source: 'env', reason: 'missing-env' }}
        sdkLoadState="ready"
        facade={facade}
      />,
    )

    expect(screen.getByText('授权参数暂未就绪')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()
    expect(facade.showAuthPage).not.toHaveBeenCalled()
    expect(facade.initControl).not.toHaveBeenCalled()
  })

  it('skips sdk calls when sdk resources are not ready and shows the approved blocker copy', () => {
    const facade = createFacade()

    render(
      <TestAuthReviewPageHarness
        paramsResolution={readyResolution}
        sdkLoadState="loading"
        facade={facade}
      />,
    )

    expect(
      screen.getByText('授权服务暂不可用，请稍后重试。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()
    expect(facade.showAuthPage).not.toHaveBeenCalled()
    expect(facade.initControl).not.toHaveBeenCalled()
  })

  it('does not init controls after a failed or cancelled showAuthPage outcome', () => {
    const facade = createFacade()

    render(
      <TestAuthReviewPageHarness
        paramsResolution={readyResolution}
        sdkLoadState="ready"
        facade={facade}
      />,
    )

    startAuthCycle()

    const showAuthPageRequest = vi.mocked(facade.showAuthPage).mock.calls[0]?.[0]
    act(() => {
      showAuthPageRequest?.success?.({ message: '用户取消授权' })
      showAuthPageRequest?.error?.({ code: '500001', message: '系统异常' })
    })

    expect(facade.initControl).not.toHaveBeenCalled()
  })

  it('clears controls on retry-auth before the next auth cycle re-enters showAuthPage and initControl', () => {
    const facade = createFacade()

    render(
      <TestAuthReviewPageHarness
        paramsResolution={readyResolution}
        sdkLoadState="ready"
        facade={facade}
        initialResultAction="retry-auth"
      />,
    )

    startAuthCycle()

    const firstShowAuthPageRequest = vi.mocked(facade.showAuthPage).mock.calls[0]?.[0]
    act(() => {
      firstShowAuthPageRequest?.success?.({ code: '103000' })
    })

    fireEvent.click(screen.getByRole('button', { name: '重新授权' }))
    startAuthCycle()

    const secondShowAuthPageRequest = vi.mocked(facade.showAuthPage).mock.calls[1]?.[0]
    act(() => {
      secondShowAuthPageRequest?.success?.({ code: '103000' })
    })

    expect(facade.clearControl).toHaveBeenCalledTimes(1)
    expect(vi.mocked(facade.clearControl).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(facade.showAuthPage).mock.invocationCallOrder[1],
    )
    expect(vi.mocked(facade.clearControl).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(facade.initControl).mock.invocationCallOrder[1],
    )
  })

  it('clears controls on unmount cleanup after native-number initialization', () => {
    const facade = createFacade()
    const { unmount } = render(
      <TestAuthReviewPageHarness
        paramsResolution={readyResolution}
        sdkLoadState="ready"
        facade={facade}
        scene="native-number"
      />,
    )

    startAuthCycle()

    const showAuthPageRequest = vi.mocked(facade.showAuthPage).mock.calls[0]?.[0]
    act(() => {
      showAuthPageRequest?.success?.({ code: '103000' })
    })

    unmount()

    expect(facade.clearControl).toHaveBeenCalledTimes(1)
  })
})
