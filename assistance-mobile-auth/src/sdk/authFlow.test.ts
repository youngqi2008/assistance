import { describe, expect, it } from 'vitest'

import type { AuthDemoState } from '../types/auth-review'
import { deriveAuthFlowStatus, mapSdkOutcomeToScenarioState, shouldDisablePrimaryAction, type AuthFlowStatus } from './authFlow'

describe('authFlow helpers', () => {
  it('maps params and sdk readiness into blocker statuses before any outcome state', () => {
    expect(
      deriveAuthFlowStatus({
        paramsStatus: 'not-ready',
        sdkLoadState: 'ready',
        authState: 'default',
      }),
    ).toBe('params-not-ready')

    expect(
      deriveAuthFlowStatus({
        paramsStatus: 'invalid',
        sdkLoadState: 'ready',
        authState: 'default',
      }),
    ).toBe('params-not-ready')

    expect(
      deriveAuthFlowStatus({
        paramsStatus: 'ready',
        sdkLoadState: 'loading',
        authState: 'default',
      }),
    ).toBe('sdk-not-ready')
  })

  it('maps in-flight and terminal states to the approved shell statuses', () => {
    const cases: Array<{ authState: AuthDemoState; expected: AuthFlowStatus }> = [
      { authState: 'loading', expected: 'submitting' },
      { authState: 'success', expected: 'success' },
      { authState: 'failure', expected: 'failure' },
      { authState: 'cancel', expected: 'cancel' },
    ]

    for (const testCase of cases) {
      expect(
        deriveAuthFlowStatus({
          paramsStatus: 'ready',
          sdkLoadState: 'ready',
          authState: testCase.authState,
        }),
      ).toBe(testCase.expected)
    }
  })

  it('surfaces control-init failure separately from general sdk readiness', () => {
    expect(
      deriveAuthFlowStatus({
        paramsStatus: 'ready',
        sdkLoadState: 'ready',
        authState: 'default',
        controlInitFailed: true,
      }),
    ).toBe('control-init-failed')
  })

  it('disables the primary action for blocker and submitting states', () => {
    expect(
      shouldDisablePrimaryAction({
        agreementChecked: true,
        flowStatus: 'params-not-ready',
      }),
    ).toBe(true)

    expect(
      shouldDisablePrimaryAction({
        agreementChecked: true,
        flowStatus: 'sdk-not-ready',
      }),
    ).toBe(true)

    expect(
      shouldDisablePrimaryAction({
        agreementChecked: true,
        flowStatus: 'submitting',
      }),
    ).toBe(true)

    expect(
      shouldDisablePrimaryAction({
        agreementChecked: false,
        flowStatus: 'ready',
      }),
    ).toBe(true)

    expect(
      shouldDisablePrimaryAction({
        agreementChecked: true,
        flowStatus: 'ready',
      }),
    ).toBe(false)

    expect(
      shouldDisablePrimaryAction({
        agreementChecked: true,
        flowStatus: 'control-init-failed',
      }),
    ).toBe(false)
  })

  it('maps sdk payloads into success, failure, and cancel outcomes', () => {
    expect(mapSdkOutcomeToScenarioState({ code: '103000' })).toBe('success')
    expect(mapSdkOutcomeToScenarioState({ message: '用户取消授权' })).toBe('cancel')
    expect(mapSdkOutcomeToScenarioState({ code: '500001', message: '系统异常' })).toBe('failure')
  })

  describe('controlReady gate', () => {
    it('controlReady === false 时返回 sdk-not-ready', () => {
      expect(
        deriveAuthFlowStatus({
          paramsStatus: 'ready',
          sdkLoadState: 'ready',
          authState: 'default',
          controlReady: false,
        }),
      ).toBe('sdk-not-ready')
    })

    it('controlReady === true 与 omit 行为一致', () => {
      const withTrue = deriveAuthFlowStatus({
        paramsStatus: 'ready',
        sdkLoadState: 'ready',
        authState: 'default',
        controlReady: true,
      })
      const withOmit = deriveAuthFlowStatus({
        paramsStatus: 'ready',
        sdkLoadState: 'ready',
        authState: 'default',
      })
      expect(withTrue).toBe('ready')
      expect(withOmit).toBe('ready')
      expect(withTrue).toBe(withOmit)
    })

    it('controlReady === false 优先于 controlInitFailed', () => {
      expect(
        deriveAuthFlowStatus({
          paramsStatus: 'ready',
          sdkLoadState: 'ready',
          authState: 'default',
          controlInitFailed: true,
          controlReady: false,
        }),
      ).toBe('sdk-not-ready')
    })

    it('已有所有现有 case 在不传 controlReady 时返回值不变', () => {
      const cases: Array<{ input: Parameters<typeof deriveAuthFlowStatus>[0]; expected: AuthFlowStatus }> = [
        { input: { paramsStatus: 'not-ready', sdkLoadState: 'ready', authState: 'default' }, expected: 'params-not-ready' },
        { input: { paramsStatus: 'invalid', sdkLoadState: 'ready', authState: 'default' }, expected: 'params-not-ready' },
        { input: { paramsStatus: 'ready', sdkLoadState: 'loading', authState: 'default' }, expected: 'sdk-not-ready' },
        { input: { paramsStatus: 'ready', sdkLoadState: 'ready', authState: 'default', controlInitFailed: true }, expected: 'control-init-failed' },
        { input: { paramsStatus: 'ready', sdkLoadState: 'ready', authState: 'loading' }, expected: 'submitting' },
        { input: { paramsStatus: 'ready', sdkLoadState: 'ready', authState: 'success' }, expected: 'success' },
        { input: { paramsStatus: 'ready', sdkLoadState: 'ready', authState: 'failure' }, expected: 'failure' },
        { input: { paramsStatus: 'ready', sdkLoadState: 'ready', authState: 'cancel' }, expected: 'cancel' },
      ]

      for (const testCase of cases) {
        expect(deriveAuthFlowStatus(testCase.input)).toBe(testCase.expected)
      }
    })
  })
})
