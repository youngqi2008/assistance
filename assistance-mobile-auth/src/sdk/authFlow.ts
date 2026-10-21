import type { AuthDemoState } from '../types/auth-review'
import type { AuthParamsResolutionStatus } from './authParamsProvider'
import type { MobileAuthSdkCallbackPayload, MobileAuthSdkLoadState } from './types'

export type AuthFlowStatus =
  | 'ready'
  | 'params-not-ready'
  | 'sdk-not-ready'
  | 'control-init-failed'
  | 'submitting'
  | 'success'
  | 'failure'
  | 'cancel'

export interface DeriveAuthFlowStatusInput {
  paramsStatus: AuthParamsResolutionStatus
  sdkLoadState: MobileAuthSdkLoadState
  authState: AuthDemoState
  controlInitFailed?: boolean
  controlReady?: boolean // 新增（默认 true 维持向后兼容）
}

export interface ShouldDisablePrimaryActionInput {
  agreementChecked: boolean
  flowStatus: AuthFlowStatus
}

const SDK_NOT_READY_STATES = new Set<MobileAuthSdkLoadState>(['idle', 'loading', 'error', 'disabled'])
const CANCEL_TOKENS = ['取消', 'cancel']
const CANCEL_CODES = new Set(['102507', '103119', '103120'])
const SUCCESS_CODES = new Set(['103000', '200'])

export function deriveAuthFlowStatus({
  paramsStatus,
  sdkLoadState,
  authState,
  controlInitFailed = false,
  controlReady = true,
}: DeriveAuthFlowStatusInput): AuthFlowStatus {
  if (paramsStatus !== 'ready') {
    return 'params-not-ready'
  }

  if (SDK_NOT_READY_STATES.has(sdkLoadState)) {
    return 'sdk-not-ready'
  }

  // controlReady 默认 true 以保持向后兼容
  if (controlReady === false) {
    return 'sdk-not-ready'
  }

  if (controlInitFailed) {
    return 'control-init-failed'
  }

  switch (authState) {
    case 'loading':
      return 'submitting'
    case 'success':
      return 'success'
    case 'failure':
      return 'failure'
    case 'cancel':
      return 'cancel'
    case 'default':
    default:
      return 'ready'
  }
}

export function shouldDisablePrimaryAction({
  agreementChecked,
  flowStatus,
}: ShouldDisablePrimaryActionInput): boolean {
  if (!agreementChecked) {
    return true
  }

  return flowStatus === 'params-not-ready' || flowStatus === 'sdk-not-ready' || flowStatus === 'submitting'
}

export function mapSdkOutcomeToScenarioState(payload: MobileAuthSdkCallbackPayload): Extract<AuthDemoState, 'success' | 'failure' | 'cancel'> {
  const code = payload.code == null ? '' : String(payload.code)
  const message = typeof payload.message === 'string' ? payload.message.toLowerCase() : ''

  if (SUCCESS_CODES.has(code)) {
    return 'success'
  }

  if (CANCEL_CODES.has(code) || CANCEL_TOKENS.some((token) => message.includes(token))) {
    return 'cancel'
  }

  return 'failure'
}
