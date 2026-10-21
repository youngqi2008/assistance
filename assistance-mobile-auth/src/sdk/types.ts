export type MobileAuthSdkMode = 'mock' | 'live'

export type MobileAuthSdkLoadState = 'disabled' | 'idle' | 'loading' | 'ready' | 'error'

export type MobileAuthSdkErrorKind =
  | 'network-timeout'
  | 'carrier-mismatch'
  | 'sdk-init-failed'
  | 'sdk-disabled'
  | 'session-invalid'
  | 'unknown'

export type SdkControlId =
  | 'ydrzPhoneControl'
  | 'ydrzTipsControl'
  | 'ydrzStateControl'
  | 'ydrzYZMControl'
  | 'ydrzYZMBtnControl'
  | 'ydrzSubmitControl'
  | 'ydrzAgreementControl'

export type SdkControlSlot =
  | 'phone'
  | 'tips'
  | 'state'
  | 'sms-input'
  | 'sms-button'
  | 'submit'
  | 'agreement'

export type MobileAuthSdkBooleanFlag = boolean

export interface MobileAuthSdkAuthParams {
  version?: string
  appId: string
  sign: string
  traceId: string
  timestamp: string
  authType: string
  scope: string
}

export interface MobileAuthSdkConfig {
  enabled: MobileAuthSdkBooleanFlag
  mode: MobileAuthSdkMode
  jsUrl: string
  cssUrl: string
  debugEntry: boolean
  authParams: MobileAuthSdkAuthParams
}

export interface MobileAuthSdkCallbackPayload {
  code?: string | number
  message?: string
  traceId?: string
  [key: string]: unknown
}

export interface MobileAuthSdkResult extends MobileAuthSdkCallbackPayload {
  token?: string
  authType?: string
}

export interface MobileAuthSdkShowAuthPageData {
  version?: string
  appId: string
  sign: string
  traceId: string
  timestamp: string
  authType: string
  scope: string
}

export interface MobileAuthSdkShowAuthPageRequest {
  data: MobileAuthSdkShowAuthPageData
  success?(payload: MobileAuthSdkCallbackPayload): void
  error?(payload: MobileAuthSdkCallbackPayload): void
}

export interface MobileAuthSdkTextStyle {
  bgColor?: string
  borderRadius?: string
  fontColor?: string
  fontSize?: string
  height?: string
  name?: string
  textAlign?: string
  width?: string
  [key: string]: unknown
}

export interface MobileAuthSdkCheckboxStyle {
  width?: string
  height?: string
  checkedColor?: string
  borderColor?: string
  checkBgImg?: string
  checkedBgImg?: string
  [key: string]: unknown
}

export interface MobileAuthSdkAgreementEntry {
  name: string
  link?: string
  customEvent?: () => void
}

// 隐私条款元素组件 agreeStyle（见 JSSDK 文档 2.2.3 第 3 节）。
// agreeArr 为一级自定义协议（与默认运营商协议并列渲染在 ydrzAgreementControl 内）。
export interface MobileAuthSdkAgreeStyle {
  width?: string
  fontFamily?: string
  fontSize?: string
  textAlign?: string
  fontColor?: string
  hrefColor?: string
  CMText?: string
  childArr?: MobileAuthSdkAgreementEntry[]
  agreeArr?: MobileAuthSdkAgreementEntry[]
  setChainAgreement?: MobileAuthSdkAgreementEntry[]
  checkboxStyle?: MobileAuthSdkCheckboxStyle
  [key: string]: unknown
}

// 授权页顶部 / 底部自定义图片（height 维度的页面最上方 / 最下方，非背景、非按钮）。
// 不传 src 则该位置不渲染图片。默认无。
export interface MobileAuthSdkImageStyle {
  src?: string
  width?: string
  height?: string
  [key: string]: unknown
}

export interface MobileAuthSdkStyleOption {
  submitBtnStyle?: MobileAuthSdkTextStyle
  submitBtnDisabledStyle?: MobileAuthSdkTextStyle
  submitBtnLoadingStyle?: MobileAuthSdkTextStyle
  phoneStyle?: MobileAuthSdkTextStyle
  localTipStyle?: MobileAuthSdkTextStyle
  unlocalTipStyle?: MobileAuthSdkTextStyle
  stateStyle?: MobileAuthSdkTextStyle
  authTextStyle?: MobileAuthSdkTextStyle
  authExpireStyle?: MobileAuthSdkTextStyle
  checkboxStyle?: MobileAuthSdkCheckboxStyle
  agreeStyle?: MobileAuthSdkAgreeStyle
  topImageStyle?: MobileAuthSdkImageStyle
  bottomImageStyle?: MobileAuthSdkImageStyle
  [key: string]: unknown
}

export interface MobileAuthSdkInitControlRequest {
  styleOption: MobileAuthSdkStyleOption
  beforeSubmit?(): boolean
  authReady?(payload: MobileAuthSdkCallbackPayload): void
  success?(payload: MobileAuthSdkCallbackPayload): void
  error?(payload: MobileAuthSdkCallbackPayload): void
}

export interface MobileAuthSdkGetAuthResultRequest {
  data: {
    appId: string
  }
  success?(payload: MobileAuthSdkResult): void
  error?(payload: MobileAuthSdkCallbackPayload): void
}

export interface MobileAuthSdkSubmitButtonState {
  disabled?: boolean
  loading?: boolean
}

export interface MobileAuthSdkGlobal {
  showAuthPage(request: MobileAuthSdkShowAuthPageRequest): void
  initControl(request: MobileAuthSdkInitControlRequest): void
  clearControl(targetId?: SdkControlId): void
  getAuthResult(request: MobileAuthSdkGetAuthResultRequest): void
  updateSubmitBtnStatus(state: MobileAuthSdkSubmitButtonState): void
}

declare global {
  interface Window {
    YDRZAuthSF?: MobileAuthSdkGlobal
  }
}
