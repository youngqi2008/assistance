import type { SdkControlId, SdkControlSlot } from './types'

// D-05 contract: keep one canonical registry from Phase 1 data-slot boundaries
// to the required JSSDK ydrz*Control container IDs.
export const sdkControlSlotMap: Record<SdkControlSlot, SdkControlId> = {
  phone: 'ydrzPhoneControl',
  tips: 'ydrzTipsControl',
  state: 'ydrzStateControl',
  // SDK-only non-local seams; H5 must not render a self-enter phone/SMS flow.
  'sms-input': 'ydrzYZMControl',
  'sms-button': 'ydrzYZMBtnControl',
  submit: 'ydrzSubmitControl',
  agreement: 'ydrzAgreementControl',
}

// Official authType=4/custom controls are intentionally out of scope for
// visible H5 slots until the runtime flow actually uses authType 4.
// ydrzTypeControl, ydrzNameControl, ydrzIntegralControl, ydrzOrderControl,
// ydrzGoodsControl, ydrzCustomControls.
export const sdkControlIds = Object.freeze(Object.values(sdkControlSlotMap))
