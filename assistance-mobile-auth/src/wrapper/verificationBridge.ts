import { createSftPublicUrl } from '../config/publicBase'
import type { CustomBootPayload } from '../custom-page/types'
import type { PrecheckReason, PrecheckResult } from '../sdk/precheckReason'
import type { MobileAuthSdkAgreeStyle, MobileAuthSdkStyleOption } from '../sdk/types'
import {
  normalizeAssistanceUiConfig,
  type NormalizedAssistanceMobileAuthUiConfig,
} from './uiConfig'

export const ASSISTANCE_AUTH_MESSAGE_SOURCE = 'assistance-mobile-auth'
export const ASSISTANCE_AUTH_READY = 'ASSISTANCE_AUTH_READY'
// iframe 内部 JSSDK initControl.authReady 后发出；仅作展示边界，不对外暴露新 API。
export const ASSISTANCE_AUTH_PRESENTATION_READY = 'ASSISTANCE_AUTH_PRESENTATION_READY'
export const ASSISTANCE_AUTH_SUCCESS = 'ASSISTANCE_AUTH_SUCCESS'
export const ASSISTANCE_AUTH_CANCEL = 'ASSISTANCE_AUTH_CANCEL'
export const ASSISTANCE_AUTH_ERROR = 'ASSISTANCE_AUTH_ERROR'
// 非终态错误通知：验证窗内 SDK / 资源加载报错时实时上抛，弹窗保持打开、流程未结束。
export const ASSISTANCE_AUTH_ERROR_NOTICE = 'ASSISTANCE_AUTH_ERROR_NOTICE'
export const ASSISTANCE_AUTH_CONFIG = 'ASSISTANCE_AUTH_CONFIG'
export const ASSISTANCE_AUTH_PHONE_READY = 'ASSISTANCE_AUTH_PHONE_READY'
export const ASSISTANCE_AUTH_RESIZE = 'ASSISTANCE_AUTH_RESIZE'
export const ASSISTANCE_AUTH_CLOSE = 'ASSISTANCE_AUTH_CLOSE'
// probe（弹窗前预检）结果消息：验证页 probe 模式 showAuthPage 取号后回传裁决，非授权流程。
export const ASSISTANCE_AUTH_PROBE_RESULT = 'ASSISTANCE_AUTH_PROBE_RESULT'
export const ASSISTANCE_AUTH_STATE_CHANGE = 'ASSISTANCE_AUTH_STATE_CHANGE'
// parent→child：宿主 wrapper 把客户 styleOption（已剥函数的纯数据）发进授权页 iframe，
// 由授权页在 initControl 时应用（容器模式对外不可用，样式只能在我方授权页内套用）。
export const ASSISTANCE_AUTH_STYLE = 'ASSISTANCE_AUTH_STYLE'
export const ASSISTANCE_AUTH_CUSTOM_BOOT = 'ASSISTANCE_AUTH_CUSTOM_BOOT'

export type AssistanceAuthMessageType =
  | typeof ASSISTANCE_AUTH_READY
  | typeof ASSISTANCE_AUTH_PRESENTATION_READY
  | typeof ASSISTANCE_AUTH_SUCCESS
  | typeof ASSISTANCE_AUTH_CANCEL
  | typeof ASSISTANCE_AUTH_ERROR
  | typeof ASSISTANCE_AUTH_ERROR_NOTICE
  | typeof ASSISTANCE_AUTH_CONFIG
  | typeof ASSISTANCE_AUTH_PHONE_READY
  | typeof ASSISTANCE_AUTH_RESIZE
  | typeof ASSISTANCE_AUTH_CLOSE
  | typeof ASSISTANCE_AUTH_PROBE_RESULT
  | typeof ASSISTANCE_AUTH_STATE_CHANGE
  | typeof ASSISTANCE_AUTH_STYLE
  | typeof ASSISTANCE_AUTH_CUSTOM_BOOT

export interface AssistanceVerificationRequest {
  scene?: 'native-number'
  requestId?: string
}

export type AssistanceAuthHeightMode = 'auto' | 'fixed'

export interface AssistanceIframeOptions {
  closable: boolean
  useCustomKeyboard: boolean
  heightMode: AssistanceAuthHeightMode
}

export interface AssistanceAuthStylePayload {
  styleOption?: MobileAuthSdkStyleOption
  agreements?: NonNullable<MobileAuthSdkAgreeStyle['childArr']>
  iframeOptions?: Partial<AssistanceIframeOptions>
  beforeLoginNotificationEnabled?: boolean
  stateChangeEnabled?: boolean
  formHeaderImg?: string
}

export interface AssistanceAuthRuntimeConfig {
  beforeLoginNotificationEnabled: boolean
  stateChangeEnabled: boolean
  formHeaderImg?: string
}

export type AssistanceAuthStateChangeEvent =
  | { type: 'idLast4Complete' }
  | { type: 'idLast4Incomplete' }

export const defaultAssistanceIframeOptions: AssistanceIframeOptions = {
  closable: true,
  useCustomKeyboard: true,
  heightMode: 'auto',
}

export function normalizeAssistanceIframeOptions(
  value: unknown,
  fallback: AssistanceIframeOptions = defaultAssistanceIframeOptions,
): AssistanceIframeOptions {
  if (!isRecord(value)) {
    return { ...fallback }
  }

  return {
    closable: typeof value.closable === 'boolean' ? value.closable : fallback.closable,
    useCustomKeyboard:
      typeof value.useCustomKeyboard === 'boolean' ? value.useCustomKeyboard : fallback.useCustomKeyboard,
    heightMode: value.heightMode === 'auto' || value.heightMode === 'fixed' ? value.heightMode : fallback.heightMode,
  }
}

export interface AssistanceVerificationSuccessPayload {
  requestId?: string
  message?: string
  token: string
  idLast4: string
  keyA: string
  status: 'success'
  mock?: boolean
}

export interface AssistanceVerificationErrorPayload {
  code?: string
  message: string
}

// 非终态错误通知 payload：在终态错误结构基础上补充错误发生阶段与运营商信息。
export interface AssistanceVerificationErrorNoticePayload extends AssistanceVerificationErrorPayload {
  phase?: 'resourceLoad' | 'showAuthPage' | 'initControl'
  carrier?: string
}

export interface AssistanceVerificationConfigPayload {
  ui: NormalizedAssistanceMobileAuthUiConfig
}

export interface AssistanceVerificationPhoneReadyPayload {
  maskedMobile: string
  rawText: string
  source: 'ydrzPhoneControl'
}

export interface AssistanceAuthResizePayload {
  height: number
  keyboardFocused?: boolean
}

export interface AssistanceAuthMessage {
  source: typeof ASSISTANCE_AUTH_MESSAGE_SOURCE
  type: AssistanceAuthMessageType
  sessionId: string
  payload?: unknown
}

export interface AssistanceAuthMessageHandlers {
  onReady?(): void
  onPresentationReady?(): void
  onSuccess?(payload: AssistanceVerificationSuccessPayload): void
  onCancel?(payload?: unknown): void
  onError?(payload: AssistanceVerificationErrorPayload): void
  onErrorNotice?(payload: AssistanceVerificationErrorNoticePayload): void
  onConfig?(payload: AssistanceVerificationConfigPayload): void
  onPhoneReady?(payload: AssistanceVerificationPhoneReadyPayload): void
  onResize?(payload: AssistanceAuthResizePayload): void
  onClose?(): void
  onProbeResult?(payload: PrecheckResult): void
  onStateChange?(event: AssistanceAuthStateChangeEvent): void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isAssistanceAuthMessageType(value: unknown): value is AssistanceAuthMessageType {
  return (
    value === ASSISTANCE_AUTH_READY ||
    value === ASSISTANCE_AUTH_PRESENTATION_READY ||
    value === ASSISTANCE_AUTH_SUCCESS ||
    value === ASSISTANCE_AUTH_CANCEL ||
    value === ASSISTANCE_AUTH_ERROR ||
    value === ASSISTANCE_AUTH_ERROR_NOTICE ||
    value === ASSISTANCE_AUTH_CONFIG ||
    value === ASSISTANCE_AUTH_PHONE_READY ||
    value === ASSISTANCE_AUTH_RESIZE ||
    value === ASSISTANCE_AUTH_CLOSE ||
    value === ASSISTANCE_AUTH_PROBE_RESULT ||
    value === ASSISTANCE_AUTH_STATE_CHANGE ||
    value === ASSISTANCE_AUTH_STYLE ||
    value === ASSISTANCE_AUTH_CUSTOM_BOOT
  )
}

export function createAssistanceAuthSessionId() {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return `assistance-auth-${random}`
}

export function parseAssistanceAuthParentOrigin(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  try {
    const url = new URL(value.trim())
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      url.origin === 'null'
    ) {
      return null
    }
    return url.origin
  } catch {
    return null
  }
}

export function normalizeFormHeaderImg(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined
    }
    return url.toString()
  } catch {
    return undefined
  }
}

// 授权页顶部 / 底部自定义图片配置。仅在 src 为非空字符串时生效。
export interface PageImageConfig {
  src: string
  width?: string
  height?: string
}

export function normalizePageImage(value: unknown): PageImageConfig | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const v = value as Record<string, unknown>
  const src = typeof v.src === 'string' ? v.src.trim() : ''
  if (!src) {
    return null
  }
  const out: PageImageConfig = { src }
  if (typeof v.width === 'string' && v.width.trim()) {
    out.width = v.width.trim()
  }
  if (typeof v.height === 'string' && v.height.trim()) {
    out.height = v.height.trim()
  }
  return out
}

// 解析 iframe URL 上 topImage / bottomImage 参数（JSON）为图片配置。
export function parsePageImageParam(raw: string | null | undefined): PageImageConfig | null {
  if (!raw) {
    return null
  }
  try {
    return normalizePageImage(JSON.parse(raw))
  } catch {
    return null
  }
}

export function createVerificationUrl({
  sessionId,
  request,
  verificationUrl,
  pageImages,
  mode,
  layout,
  debugVConsole,
  expectsUiConfig,
  appId,
  parentOrigin,
}: {
  sessionId: string
  request?: AssistanceVerificationRequest
  verificationUrl?: string
  pageImages?: { top?: unknown; bottom?: unknown }
  mode?: 'probe'
  layout?: 'inline'
  debugVConsole?: boolean
  expectsUiConfig?: boolean
  appId?: string
  parentOrigin?: string
}) {
  const resolvedUrl = verificationUrl ?? createSftPublicUrl('verification')

  const url = new URL(resolvedUrl, typeof window !== 'undefined' ? window.location.href : 'http://localhost')

  url.searchParams.set('assistanceAuthSessionId', sessionId)

  if (appId) {
    url.searchParams.set('appId', appId)
  }

  if (expectsUiConfig) {
    url.searchParams.set('expectsUiConfig', '1')
  }

  if (mode === 'probe') {
    url.searchParams.set('mode', 'probe')
  }

  if (layout === 'inline') {
    url.searchParams.set('layout', 'inline')
  }

  if (debugVConsole) {
    url.searchParams.set('debugVConsole', '1')
  }

  const normalizedParentOrigin = parseAssistanceAuthParentOrigin(parentOrigin)
  if (mode !== 'probe' && normalizedParentOrigin) {
    url.searchParams.set('assistanceAuthParentOrigin', normalizedParentOrigin)
  }

  if (request?.scene) {
    url.searchParams.set('scene', request.scene)
  }

  if (request?.requestId) {
    url.searchParams.set('requestId', request.requestId)
  }

  // 透传授权页顶部 / 底部自定义图片（弹层 / H5 授权页在 height 维度的最上 / 最下渲染）。
  const topImage = normalizePageImage(pageImages?.top)
  if (topImage) {
    url.searchParams.set('topImage', JSON.stringify(topImage))
  }
  const bottomImage = normalizePageImage(pageImages?.bottom)
  if (bottomImage) {
    url.searchParams.set('bottomImage', JSON.stringify(bottomImage))
  }

  if (typeof window !== 'undefined') {
    const parentSearch = new URLSearchParams(window.location.search)

    if (!__STATIC_RESOURCE_RELEASE__) {
      const parentEnv = parentSearch.get('mobileAuthEnv')
      if (parentEnv) {
        url.searchParams.set('mobileAuthEnv', parentEnv)
      }
    }

    // 透传父页 ?flow，让 iframe 切到对应页面变体（如 preverified 静态页，无 JSSDK）。
    const parentFlow = parentSearch.get('flow')
    if (parentFlow && mode !== 'probe') {
      url.searchParams.set('flow', parentFlow)
    }
  }

  return url.toString()
}

export function createAssistanceAuthMessage(
  type: AssistanceAuthMessageType,
  sessionId: string,
  payload?: unknown,
): AssistanceAuthMessage {
  return {
    source: ASSISTANCE_AUTH_MESSAGE_SOURCE,
    type,
    sessionId,
    payload,
  }
}

export function isAssistanceAuthMessage(value: unknown, sessionId?: string): value is AssistanceAuthMessage {
  return (
    isRecord(value) &&
    value.source === ASSISTANCE_AUTH_MESSAGE_SOURCE &&
    isAssistanceAuthMessageType(value.type) &&
    typeof value.sessionId === 'string' &&
    (!sessionId || value.sessionId === sessionId)
  )
}

export function createCustomBootMessage(sessionId: string, payload: CustomBootPayload): AssistanceAuthMessage {
  return createAssistanceAuthMessage(ASSISTANCE_AUTH_CUSTOM_BOOT, sessionId, payload)
}

function toErrorPayload(payload: unknown): AssistanceVerificationErrorPayload {
  if (isRecord(payload) && typeof payload.message === 'string') {
    return {
      code: typeof payload.code === 'string' ? payload.code : undefined,
      message: payload.message,
    }
  }

  return { message: '验证失败，请稍后重试。' }
}

function toErrorNoticePayload(payload: unknown): AssistanceVerificationErrorNoticePayload {
  const base = toErrorPayload(payload)

  if (!isRecord(payload)) {
    return base
  }

  return {
    ...base,
    phase:
      payload.phase === 'resourceLoad' || payload.phase === 'showAuthPage' || payload.phase === 'initControl'
        ? payload.phase
        : undefined,
    carrier: typeof payload.carrier === 'string' ? payload.carrier : undefined,
  }
}

function toConfigPayload(payload: unknown): AssistanceVerificationConfigPayload {
  if (isRecord(payload) && isRecord(payload.ui)) {
    return { ui: normalizeAssistanceUiConfig(payload.ui) }
  }

  return { ui: {} }
}

export function createAssistanceAuthConfigMessage(
  sessionId: string,
  ui: NormalizedAssistanceMobileAuthUiConfig,
): AssistanceAuthMessage {
  return createAssistanceAuthMessage(ASSISTANCE_AUTH_CONFIG, sessionId, { ui })
}

const MASKED_MOBILE_PATTERN = /1\d{2}\*{4}\d{4}/
const UNMASKED_MAINLAND_MOBILE_PATTERN = /1\d{10}/

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function toPhoneReadyPayload(payload: unknown): AssistanceVerificationPhoneReadyPayload | null {
  if (!isRecord(payload)) {
    return null
  }

  if (payload.source !== 'ydrzPhoneControl') {
    return null
  }

  const maskedMobile = typeof payload.maskedMobile === 'string' ? payload.maskedMobile.trim() : ''
  const extractedMaskedMobile = maskedMobile.match(MASKED_MOBILE_PATTERN)?.[0]
  if (!extractedMaskedMobile) {
    return null
  }

  let rawText = extractedMaskedMobile
  if (typeof payload.rawText === 'string') {
    const normalizedRawText = normalizeText(payload.rawText)
    if (
      !normalizedRawText.includes(extractedMaskedMobile) ||
      UNMASKED_MAINLAND_MOBILE_PATTERN.test(normalizedRawText)
    ) {
      return null
    }
    rawText = normalizedRawText
  }

  return {
    maskedMobile: extractedMaskedMobile,
    rawText,
    source: 'ydrzPhoneControl',
  }
}

function toResizePayload(payload: unknown): AssistanceAuthResizePayload | null {
  if (!isRecord(payload) || !isFinitePositiveNumber(payload.height)) {
    return null
  }

  return {
    height: Math.ceil(payload.height),
    ...(typeof payload.keyboardFocused === 'boolean' ? { keyboardFocused: payload.keyboardFocused } : {}),
  }
}

function toSuccessPayload(payload: unknown): AssistanceVerificationSuccessPayload | null {
  if (!isRecord(payload)) {
    return null
  }

  if (payload.status !== 'success') {
    return null
  }

  const token = typeof payload.token === 'string' ? payload.token : ''
  const idLast4 = typeof payload.idLast4 === 'string' ? payload.idLast4 : ''
  const keyA = typeof payload.keyA === 'string' ? payload.keyA : ''

  if (!token.trim() || !idLast4.trim() || !keyA.trim()) {
    return null
  }

  return {
    status: 'success',
    token,
    idLast4,
    keyA,
    requestId: typeof payload.requestId === 'string' ? payload.requestId : undefined,
    message: typeof payload.message === 'string' ? payload.message : undefined,
    mock: typeof payload.mock === 'boolean' ? payload.mock : undefined,
  }
}

const PRECHECK_REASONS: readonly PrecheckReason[] = ['ok', 'wifi', 'non-mobile', 'ambiguous', 'unknown']

function normalizeCarriers(value: Record<string, unknown>): { YD?: string; CT?: string; CU?: string } | undefined {
  const out: { YD?: string; CT?: string; CU?: string } = {}
  for (const key of ['YD', 'CT', 'CU'] as const) {
    if (typeof value[key] === 'string') {
      out[key] = value[key] as string
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function toProbeResultPayload(payload: unknown): PrecheckResult {
  if (!isRecord(payload)) {
    return { eligible: false, reason: 'unknown' }
  }
  const reason = PRECHECK_REASONS.includes(payload.reason as PrecheckReason)
    ? (payload.reason as PrecheckReason)
    : 'unknown'
  let raw: PrecheckResult['raw']
  if (isRecord(payload.raw)) {
    const carriers = isRecord(payload.raw.carriers) ? normalizeCarriers(payload.raw.carriers) : undefined
    const rawNetworkType = payload.raw.networkType
    const networkType: 'wifi' | 'cellular' | 'unknown' | undefined =
      rawNetworkType === 'wifi' || rawNetworkType === 'cellular' || rawNetworkType === 'unknown' ? rawNetworkType : undefined
    const next = {
      ...(typeof payload.raw.code === 'string' ? { code: payload.raw.code } : {}),
      ...(typeof payload.raw.carrier === 'string' ? { carrier: payload.raw.carrier } : {}),
      ...(carriers ? { carriers } : {}),
      ...(networkType ? { networkType } : {}),
    }
    if (Object.keys(next).length > 0) {
      raw = next
    }
  }
  return { eligible: reason === 'ok', reason, ...(raw ? { raw } : {}) }
}

function toStateChangeEvent(payload: unknown): AssistanceAuthStateChangeEvent | null {
  if (!isRecord(payload) || !isRecord(payload.event)) {
    return null
  }

  if (payload.event.type === 'idLast4Complete') {
    return { type: 'idLast4Complete' }
  }

  if (payload.event.type === 'idLast4Incomplete') {
    return { type: 'idLast4Incomplete' }
  }

  return null
}

export function listenForAssistanceAuthMessages(
  targetWindow: Window,
  sessionId: string,
  handlers: AssistanceAuthMessageHandlers,
  allowedOrigin?: string,
  options?: {
    expectedSource?: MessageEventSource | null
    expectedSourceTypes?: readonly AssistanceAuthMessageType[]
  },
) {
  const listener = (event: MessageEvent) => {
    if (allowedOrigin && event.origin !== allowedOrigin) {
      return
    }

    if (!isAssistanceAuthMessage(event.data, sessionId)) {
      return
    }

    if (
      options &&
      'expectedSource' in options &&
      (
        !options.expectedSourceTypes ||
        options.expectedSourceTypes.includes(event.data.type)
      ) &&
      event.source !== options.expectedSource
    ) {
      return
    }

    switch (event.data.type) {
      case ASSISTANCE_AUTH_READY:
        handlers.onReady?.()
        break
      case ASSISTANCE_AUTH_PRESENTATION_READY:
        handlers.onPresentationReady?.()
        break
      case ASSISTANCE_AUTH_SUCCESS:
        {
          const payload = toSuccessPayload(event.data.payload)
          if (!payload) {
            handlers.onError?.({
              code: 'INVALID_SUCCESS_PAYLOAD',
              message: '验证结果返回异常，请稍后重试。',
            })
            break
          }
          handlers.onSuccess?.(payload)
        }
        break
      case ASSISTANCE_AUTH_CANCEL:
        handlers.onCancel?.(event.data.payload)
        break
      case ASSISTANCE_AUTH_ERROR:
        handlers.onError?.(toErrorPayload(event.data.payload))
        break
      case ASSISTANCE_AUTH_ERROR_NOTICE:
        handlers.onErrorNotice?.(toErrorNoticePayload(event.data.payload))
        break
      case ASSISTANCE_AUTH_CONFIG:
        handlers.onConfig?.(toConfigPayload(event.data.payload))
        break
      case ASSISTANCE_AUTH_PHONE_READY:
        {
          const payload = toPhoneReadyPayload(event.data.payload)
          if (payload) {
            handlers.onPhoneReady?.(payload)
          }
        }
        break
      case ASSISTANCE_AUTH_RESIZE:
        {
          const payload = toResizePayload(event.data.payload)
          if (payload) {
            handlers.onResize?.(payload)
          }
        }
        break
      case ASSISTANCE_AUTH_CLOSE:
        handlers.onClose?.()
        break
      case ASSISTANCE_AUTH_PROBE_RESULT:
        handlers.onProbeResult?.(toProbeResultPayload(event.data.payload))
        break
      case ASSISTANCE_AUTH_STATE_CHANGE:
        {
          const stateChangeEvent = toStateChangeEvent(event.data.payload)
          if (stateChangeEvent) {
            handlers.onStateChange?.(stateChangeEvent)
          }
        }
        break
    }
  }

  targetWindow.addEventListener('message', listener)

  return () => targetWindow.removeEventListener('message', listener)
}

// 授权页 iframe 侧的入站监听：只接受来自预期 source（通常是 window.parent）、
// 且 sessionId 匹配的 ASSISTANCE_AUTH_STYLE 消息。styleOption 纯属外观数据，
// 被伪造仅致视觉篡改、不触 token / 身份；真正的防伪靠 sessionId（随 URL 下发的随机串）。
// 载荷格式：新形态 { styleOption, agreements }；旧形态（直接是 styleOption）向后兼容 → agreements=[]。
export function listenForStyleMessage(
  targetWindow: Window,
  sessionId: string,
  onStyle: (
    styleOption: MobileAuthSdkStyleOption,
    agreements: NonNullable<MobileAuthSdkAgreeStyle['childArr']>,
    iframeOptions: AssistanceIframeOptions,
  ) => void,
  options?: {
    expectedSource?: MessageEventSource | null
    onRuntimeConfig?(config: AssistanceAuthRuntimeConfig): void
  },
) {
  const listener = (event: MessageEvent) => {
    if (options && 'expectedSource' in options && event.source !== options.expectedSource) {
      return
    }

    if (!isAssistanceAuthMessage(event.data, sessionId) || event.data.type !== ASSISTANCE_AUTH_STYLE) {
      return
    }

    const payload = event.data.payload
    const raw = isRecord(payload) ? payload : {}
    // 新形态 { styleOption, agreements, iframeOptions }；旧形态：payload 即 styleOption。
    const wrapped =
      isRecord(payload) &&
      (
        'styleOption' in raw ||
        'agreements' in raw ||
        'iframeOptions' in raw ||
        'beforeLoginNotificationEnabled' in raw ||
        'stateChangeEnabled' in raw ||
        'formHeaderImg' in raw
      )
    const styleOption = (wrapped ? raw.styleOption : payload) as MobileAuthSdkStyleOption
    const agreements =
      wrapped && Array.isArray(raw.agreements) ? (raw.agreements as NonNullable<MobileAuthSdkAgreeStyle['childArr']>) : []
    const iframeOptions = normalizeAssistanceIframeOptions(
      wrapped ? raw.iframeOptions : undefined,
      defaultAssistanceIframeOptions,
    )
    onStyle(styleOption ?? {}, agreements, iframeOptions)
    options?.onRuntimeConfig?.({
      beforeLoginNotificationEnabled: wrapped && raw.beforeLoginNotificationEnabled === true,
      stateChangeEnabled: wrapped && raw.stateChangeEnabled === true,
      formHeaderImg: wrapped ? normalizeFormHeaderImg(raw.formHeaderImg) : undefined,
    })
  }

  targetWindow.addEventListener('message', listener)

  return () => targetWindow.removeEventListener('message', listener)
}
