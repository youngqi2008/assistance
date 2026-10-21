import { ensureGlobalCryptoJs } from '../sdk/cryptoJsBootstrap'
import { createMobileAuthSdkFacade, type MobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import { normalizeMobileAuthType } from '../sdk/authPolicy'
import { createMobileAuthStyleOption, sanitizeStyleOptionForTransport } from '../sdk/styleOption'
import { SFT_PUBLIC_BASE_URL } from '../config/publicBase'
import customRuntimeSource from 'virtual:assistance-custom-runtime'
import { createCustomVerificationUrl, normalizeCustomPage } from '../custom-page/normalize'
import type { CustomAuthorizationConfig, CustomPage } from '../custom-page/types'
import type {
  MobileAuthSdkCallbackPayload,
  MobileAuthSdkShowAuthPageData,
  MobileAuthSdkStyleOption,
  SdkControlId,
} from '../sdk/types'
import {
  ASSISTANCE_AUTH_CLOSE,
  ASSISTANCE_AUTH_CUSTOM_BOOT,
  ASSISTANCE_AUTH_RESIZE,
  ASSISTANCE_AUTH_STATE_CHANGE,
  ASSISTANCE_AUTH_STYLE,
  createAssistanceAuthConfigMessage,
  createAssistanceAuthMessage,
  createAssistanceAuthSessionId,
  createVerificationUrl,
  listenForAssistanceAuthMessages,
  normalizeAssistanceIframeOptions,
  normalizeFormHeaderImg,
  type AssistanceVerificationErrorNoticePayload,
  type AssistanceVerificationErrorPayload,
  type AssistanceIframeOptions,
  type AssistanceVerificationPhoneReadyPayload,
  type AssistanceVerificationRequest,
  type AssistanceVerificationSuccessPayload,
  type AssistanceAuthStateChangeEvent,
} from './verificationBridge'
export type { AssistanceAuthStateChangeEvent } from './verificationBridge'
import {
  hasAssistanceUiConfig,
  normalizeAssistanceUiConfig,
  warnAssistanceUiConfigToConsole,
  type AssistanceMobileAuthUiConfig,
} from './uiConfig'
import {
  createKeyboardViewportAvoidanceController,
  KEYBOARD_SAFE_TOP_GAP_PX,
  type KeyboardViewportAvoidanceController,
} from './keyboardViewportAvoidance'
import type { PrecheckResult } from '../sdk/precheckReason'
import {
  assertMobileOfficialJssdkMetadataReady,
} from './vendor/mobile-jssdk.meta'
import { resolveAssistanceMobileAuthJssdkResourceForBuild } from './jssdkResource'
import { isZidingyiFeedbackProfile, isYuanbaoFeedbackProfile } from '../pages/appProfiles'

function getActiveJssdkResource() {
  return resolveAssistanceMobileAuthJssdkResourceForBuild()
}

export interface AssistanceMobileAuthSdkOptions {
  /** 客户接入 appId（0.2.0 起必传，与 BFF 同一发放体系）；用于 iframe 授权页按客户分流展示内容 */
  appId: string
  customPage?: CustomPage
  /** iframe 授权页展示方式；默认 modal，inline 时直接挂入 renderTo。 */
  display?: 'modal' | 'inline'
  /** inline iframe 的宿主容器；与 legacy container/authorize() 完全独立。 */
  renderTo?: HTMLElement | string
  container?: HTMLElement | string
  authParams?: MobileAuthSdkShowAuthPageData
  styleOption?: MobileAuthSdkStyleOption
  /** 调用方自定义协议，追加到移动控件 childArr 二级页（插在我方四条内置协议之后）。仅 {name, link}。 */
  agreements?: Array<{ name: string; link: string }>
  authWindowTitle?: string
  /** 默认 true；false 时隐藏 iframe 验证页左上角用户关闭入口。sdk.close() 不受影响。 */
  closable?: boolean
  /** 可见 iframe 弹窗高度；number 按 px，string 仅接受安全 CSS 长度。未传时锁定为 92dvh/92vh。 */
  authWindowHeight?: string | number
  /** 默认 fixed；传 auto 时由 iframe 内容高度驱动弹窗高度。有效 authWindowHeight 优先保持 fixed。 */
  authWindowHeightMode?: AssistanceIframeOptions['heightMode']
  /** 可见 iframe 弹窗最大高度；number 按 px，string 仅接受安全 CSS 长度。未传或非法时默认 820px。 */
  authWindowMaxHeight?: string | number
  /** 默认 true；false 时隐藏我方自绘键盘并启用系统原生输入。 */
  useCustomKeyboard?: boolean
  /** 版本 23 顶部图片；仅接受 http/https，非法或加载失败时由验证页回退本地图片。 */
  formHeaderImg?: string
  ui?: AssistanceMobileAuthUiConfig
  /** 用户进入登录前就绪状态时的纯通知；返回值、Promise 和异常均不影响登录。 */
  onBeforeLogin?(): void
  /** iframe 验证页的公开、非敏感状态变化。 */
  onStateChange?(event: AssistanceAuthStateChangeEvent): void
  onReady?(): void
  onAuthReady?(payload: MobileAuthSdkCallbackPayload): void
  onSuccess?(payload: MobileAuthSdkCallbackPayload | AssistanceVerificationSuccessPayload): void
  onCancel?(payload?: unknown): void
  onError?(payload: MobileAuthSdkCallbackPayload | AssistanceVerificationErrorPayload): void
  /**
   * 实时错误通知 —— 验证窗内移动 jssdk / 资源加载报错时立即回调；
   * 弹窗保持打开、流程未结束（用户仍可重试或关闭），Promise 不 reject。
   */
  onErrorNotice?(payload: AssistanceVerificationErrorNoticePayload): void
  onPhoneReady?(payload: AssistanceVerificationPhoneReadyPayload): void
  onClose?(): void
}

export interface AssistanceMobileAuthPrecheckOptions {
  scene?: 'native-number'
  requestId?: string
  timeoutMs?: number
}

export interface AssistanceMobileAuthSdkInstance {
  authorize(): void
  clear(targetId?: SdkControlId): void
  open(request?: AssistanceVerificationRequest): Promise<AssistanceVerificationSuccessPayload>
  openVerification(request?: AssistanceVerificationRequest): Promise<AssistanceVerificationSuccessPayload>
  precheck(options: AssistanceMobileAuthPrecheckOptions): Promise<PrecheckResult>
  close(): void
  destroy(): void
}

export interface AssistanceMobileAuthOfficialCssAsset {
  href: string
  integrity: string
  version: string
}

export interface AssistanceMobileAuthOfficialCssInjectionOptions {
  baseUrl?: string
  document?: Document
  id?: string
}

const defaultOfficialCssElementId = 'assistance-mobile-auth-official-css'
const frameShellId = 'assistance-mobile-auth-frame-shell'
const frameEnterClass = 'assistance-auth-frame-enter'
const frameExitAnimationMs = 280
const defaultVerificationPath = 'verification'
const PROBE_DEFAULT_TIMEOUT_MS = 12000
const HAIKE_INLINE_APP_ID = '8a9481c79c05c8bd019ed8d7ab571df3'

type AssistanceFramePresentation =
  | 'bottom-sheet'
  | 'ginkgo-v23-viewport-modal'
  | 'inline'

interface ActiveVerificationSession {
  sessionId: string
  shell?: HTMLDivElement
  frame: HTMLIFrameElement
  presentation: AssistanceFramePresentation
  previousBodyOverflow?: string
  settled: boolean
  keyboardAvoidance?: KeyboardViewportAvoidanceController
  disposeViewportFrame?: () => void
  disposeMessageListener?: () => void
  reject?: (error: Error) => void
  cancelPendingEnterAnimation?: () => void
  finishPendingExitAnimation?: () => void
  presented: boolean
  allowedOrigin?: string
}

function resolveFramePresentation(appId: string): AssistanceFramePresentation {
  return isZidingyiFeedbackProfile(appId) || isYuanbaoFeedbackProfile(appId)
    ? 'ginkgo-v23-viewport-modal'
    : 'bottom-sheet'
}

function isHaikeInternalTestPage(): boolean {
  if (__STATIC_RESOURCE_RELEASE__) return false
  return window.location.pathname.replace(/\/+$/, '').endsWith('/test-page-hk')
}

function usesFixedHaikeInlineFrame(appId: string, display: 'modal' | 'inline'): boolean {
  return appId === HAIKE_INLINE_APP_ID && display === 'inline'
}

function notifyAuthCallback<T>(
  callback: (() => unknown) | ((event: T) => unknown) | undefined,
  callbackName: 'onBeforeLogin' | 'onStateChange' | 'onReady' | 'onSuccess' | 'onCancel' | 'onClose',
  event?: T,
): void {
  if (!callback) {
    return
  }

  try {
    const result = event !== undefined
      ? (callback as (value: T) => unknown)(event)
      : (callback as () => unknown)()
    void Promise.resolve(result).catch(() => {
      console.warn(`[AssistanceMobileAuth] ${callbackName} failed; notification was ignored.`)
    })
  } catch {
    console.warn(`[AssistanceMobileAuth] ${callbackName} failed; notification was ignored.`)
  }
}

function sanitizeCallerAgreements(
  agreements: AssistanceMobileAuthSdkOptions['agreements'],
): Array<{ name: string; link: string }> {
  if (!Array.isArray(agreements)) {
    return []
  }
  return agreements.filter(
    (item): item is { name: string; link: string } =>
      Boolean(item) && typeof item.name === 'string' && typeof item.link === 'string',
  )
}

function resolveContainer(container: HTMLElement | string): HTMLElement {
  if (typeof container !== 'string') {
    return container
  }

  const resolved = document.querySelector<HTMLElement>(container)

  if (!resolved) {
    throw new Error('AssistanceMobileAuth container not found')
  }

  return resolved
}

function resolveInlineRenderTarget(renderTo: HTMLElement | string): HTMLElement {
  const target = typeof renderTo === 'string'
    ? document.querySelector<HTMLElement>(renderTo)
    : renderTo

  if (!(target instanceof HTMLElement)) {
    throw new Error('AssistanceMobileAuth inline renderTo not found')
  }

  return target
}

function assertConnectedInlineRenderTarget(target: HTMLElement): HTMLElement {
  if (!target.isConnected || !document.contains(target)) {
    throw new Error('AssistanceMobileAuth inline renderTo is no longer connected')
  }

  return target
}

const officialJssdkScriptId = 'assistance-mobile-auth-official-jssdk'

function assertOfficialJssdkMetadataReady(): void {
  const resource = getActiveJssdkResource()
  assertMobileOfficialJssdkMetadataReady(resource)

  if (!resource.jsUrl.trim()) {
    throw new Error('Mobile official JSSDK remote jsUrl is missing')
  }
}

function loadRemoteOfficialJssdk(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Mobile official JSSDK requires a browser window and document'))
  }

  ensureGlobalCryptoJs()

  if (window.YDRZAuthSF) {
    return Promise.resolve()
  }

  const sourceUrl = getActiveJssdkResource().jsUrl
  const existing = document.getElementById(officialJssdkScriptId)

  if (existing instanceof HTMLScriptElement) {
    if (existing.dataset.assistanceMobileAuthLoaded === 'true' && window.YDRZAuthSF) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      existing.addEventListener(
        'load',
        () => {
          existing.dataset.assistanceMobileAuthLoaded = 'true'
          resolve()
        },
        { once: true },
      )
      existing.addEventListener(
        'error',
        () => reject(new Error(`Failed to load mobile official JSSDK script: ${sourceUrl}`)),
        { once: true },
      )
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = officialJssdkScriptId
    script.async = true
    script.src = sourceUrl
    script.addEventListener(
      'load',
      () => {
        script.dataset.assistanceMobileAuthLoaded = 'true'
        if (!window.YDRZAuthSF) {
          reject(new Error('Mobile official JSSDK loaded but did not initialize window.YDRZAuthSF'))
          return
        }
        resolve()
      },
      { once: true },
    )
    script.addEventListener(
      'error',
      () => reject(new Error(`Failed to load mobile official JSSDK script: ${sourceUrl}`)),
      { once: true },
    )

    document.head.appendChild(script)
  })
}

function joinLocalAssetPath(baseUrl: string | undefined, fileName: string): string {
  const normalizedBase = baseUrl ? baseUrl.replace(/\/?$/, '/') : ''

  return `${normalizedBase}vendor/${fileName}`
}

function createFrameShell(presentation: AssistanceFramePresentation, viewportBottomSheet = false) {
  const shell = document.createElement('div')
  shell.id = frameShellId
  shell.setAttribute('role', 'dialog')
  shell.setAttribute('aria-modal', 'true')
  shell.dataset.assistanceAuthOverlay = 'true'
  shell.style.position = 'fixed'
  shell.style.inset = '0'
  shell.style.zIndex = '2147483647'
  shell.style.background = 'rgba(15,23,42,0)'
  shell.style.display = 'flex'
  shell.style.alignItems = 'flex-end'
  shell.style.justifyContent = 'center'
  shell.style.opacity = '0'
  shell.style.transition = 'opacity 220ms ease, background-color 220ms ease'
  shell.style.willChange = 'opacity, background-color'

  const positioningLayer = document.createElement('div')
  positioningLayer.dataset.assistanceAuthPositioningLayer = 'true'
  positioningLayer.style.display = 'flex'
  positioningLayer.style.width = '100%'
  positioningLayer.style.justifyContent = 'center'
  positioningLayer.style.willChange = 'transform'
  if (presentation === 'ginkgo-v23-viewport-modal' || viewportBottomSheet) {
    if (!viewportBottomSheet) positioningLayer.dataset.assistanceAuthViewportModal = 'true'
    positioningLayer.style.position = 'fixed'
    positioningLayer.style.left = '0'
    positioningLayer.style.top = '0'
    positioningLayer.style.height = '100vh'
    if (viewportBottomSheet) positioningLayer.style.alignItems = 'flex-end'
  }
  shell.appendChild(positioningLayer)

  return { shell, positioningLayer }
}

function hideFrameDuringInitialization(shell: HTMLDivElement, frame: HTMLIFrameElement): void {
  shell.style.pointerEvents = 'none'
  shell.setAttribute('aria-hidden', 'true')
  shell.inert = true
  shell.removeAttribute('role')
  shell.removeAttribute('aria-modal')
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
}

function exposeFrameForPresentation(shell: HTMLDivElement, frame: HTMLIFrameElement): void {
  shell.style.pointerEvents = 'auto'
  shell.removeAttribute('aria-hidden')
  shell.inert = false
  shell.setAttribute('role', 'dialog')
  shell.setAttribute('aria-modal', 'true')
  frame.removeAttribute('aria-hidden')
  frame.removeAttribute('tabindex')
}

function resolveViewportModalMetrics(targetWindow: Window): { height: string; top: string } {
  const viewport = targetWindow.visualViewport
  if (
    viewport
    && Number.isFinite(viewport.height)
    && viewport.height > 0
    && Number.isFinite(viewport.offsetTop)
    && viewport.offsetTop >= 0
  ) {
    return { height: `${viewport.height}px`, top: `${viewport.offsetTop}px` }
  }

  if (Number.isFinite(targetWindow.innerHeight) && targetWindow.innerHeight > 0) {
    return { height: `${targetWindow.innerHeight}px`, top: '0px' }
  }

  const supportsDvh =
    typeof CSS !== 'undefined'
    && typeof CSS.supports === 'function'
    && CSS.supports('height', '100dvh')
  return { height: supportsDvh ? '100dvh' : '100vh', top: '0px' }
}

function createViewportModalController({
  targetWindow,
  frame,
  positioningLayer,
  preserveFrameHeight = false,
}: {
  targetWindow: Window
  frame: HTMLIFrameElement
  positioningLayer: HTMLDivElement
  preserveFrameHeight?: boolean
}): () => void {
  let disposed = false
  let subscribedViewport: VisualViewport | undefined

  const apply = () => {
    if (disposed) {
      return
    }

    const metrics = resolveViewportModalMetrics(targetWindow)
    positioningLayer.style.top = metrics.top
    positioningLayer.style.height = metrics.height
    if (!preserveFrameHeight) frame.style.height = '100%'
  }

  const syncViewport = () => {
    const nextViewport = targetWindow.visualViewport ?? undefined
    if (subscribedViewport === nextViewport) {
      return
    }

    subscribedViewport?.removeEventListener('resize', apply)
    subscribedViewport?.removeEventListener('scroll', apply)
    subscribedViewport = nextViewport
    subscribedViewport?.addEventListener('resize', apply)
    subscribedViewport?.addEventListener('scroll', apply)
  }

  const refresh = () => {
    syncViewport()
    apply()
  }

  targetWindow.addEventListener('resize', refresh)
  refresh()

  return () => {
    if (disposed) {
      return
    }
    disposed = true
    targetWindow.removeEventListener('resize', refresh)
    subscribedViewport?.removeEventListener('resize', apply)
    subscribedViewport?.removeEventListener('scroll', apply)
    subscribedViewport = undefined
  }
}

function isIosLikeDevice(targetNavigator: Navigator): boolean {
  return /iPad|iPhone|iPod/i.test(targetNavigator.userAgent)
    || (targetNavigator.platform === 'MacIntel' && targetNavigator.maxTouchPoints > 1)
}

function primeIosNativeKeyboard(shell: HTMLDivElement): boolean {
  if (!isIosLikeDevice(window.navigator)) {
    return false
  }

  const activator = document.createElement('input')
  activator.type = 'text'
  activator.inputMode = 'text'
  activator.autocomplete = 'off'
  activator.tabIndex = -1
  activator.dataset.assistanceAuthKeyboardActivator = 'true'
  activator.setAttribute('autocapitalize', 'characters')
  activator.setAttribute('autocorrect', 'off')
  activator.style.position = 'fixed'
  activator.style.left = '0'
  activator.style.bottom = '0'
  activator.style.width = '1px'
  activator.style.height = '1px'
  activator.style.border = '0'
  activator.style.padding = '0'
  activator.style.opacity = '0.01'
  activator.style.pointerEvents = 'none'
  activator.style.fontSize = '16px'
  activator.style.color = 'transparent'
  activator.style.background = 'transparent'
  activator.style.caretColor = 'transparent'
  shell.appendChild(activator)

  try {
    activator.focus({ preventScroll: true })
  } catch {
    activator.focus()
  }

  return document.activeElement === activator
}

// dvh（动态视口单位）需 Chrome 108+ / Safari 15.4+；荣耀等 <Chromium99 旧引擎不识别，会忽略
// `height:92dvh` 这条声明导致 iframe 塌成默认高度。按支持性回退到 vh（全引擎支持），现代浏览器仍用 dvh。
function preferredViewportHeight(value: number): string {
  const supportsDvh =
    typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('height', '100dvh')
  return supportsDvh ? `${value}dvh` : `${value}vh`
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function readInitialFrameHeight(frame: HTMLIFrameElement): number | null {
  const measuredHeight = frame.getBoundingClientRect().height
  if (isFinitePositiveNumber(measuredHeight)) {
    return measuredHeight
  }

  const pixelHeight = /^(\d+(?:\.\d+)?)px$/.exec(frame.style.height.trim())?.[1]
  const styledHeight = pixelHeight === undefined ? Number.NaN : Number(pixelHeight)
  return isFinitePositiveNumber(styledHeight) ? styledHeight : null
}

function normalizeCssLength(value: unknown, fallback: string): string {
  return normalizeOptionalCssLength(value) ?? fallback
}

function normalizeOptionalCssLength(value: unknown): string | null {
  if (isFinitePositiveNumber(value)) {
    return `${value}px`
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (/url\s*\(|expression\s*\(|var\s*\(|[;{}"'<>]|[\u0000-\u001f\u007f]/i.test(trimmed)) {
    return null
  }

  const unit = '(?:px|vh|dvh|svh|lvh|%|rem)'
  const simpleLength = new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d+)?${unit}$`, 'i')
  if (simpleLength.test(trimmed)) {
    return trimmed
  }

  const calcBody = trimmed.match(/^calc\((.*)\)$/i)?.[1]
  if (calcBody && /^[\d\s.+\-*/()%a-z]+$/i.test(calcBody)) {
    const tokenPattern = new RegExp(`(?:0|[1-9]\\d*)(?:\\.\\d+)?${unit}`, 'gi')
    const withoutLengths = calcBody.replace(tokenPattern, '')
    if (/^[\d\s.+\-*/()]*$/.test(withoutLengths)) {
      return trimmed
    }
  }

  return null
}

const defaultLockedFrameMaxHeight = '820px'
const defaultAutoFrameHeight = '420px'

function resolveFrameCssLengths(options: AssistanceMobileAuthSdkOptions) {
  const explicitHeight = normalizeOptionalCssLength(options.authWindowHeight)
  const heightMode = explicitHeight
    ? 'fixed'
    : options.authWindowHeightMode === 'auto' ? 'auto' : 'fixed'

  return {
    heightMode,
    height: explicitHeight ?? (heightMode === 'auto' ? defaultAutoFrameHeight : preferredViewportHeight(92)),
    maxHeight: normalizeCssLength(options.authWindowMaxHeight, defaultLockedFrameMaxHeight),
  }
}

function createVerificationFrame(
  src: string,
  title: string,
  frameCss: { height: string; maxHeight: string },
  presentation: AssistanceFramePresentation,
) {
  const frame = document.createElement('iframe')
  frame.title = title
  frame.src = src
  frame.dataset.assistanceAuthFrame = 'true'
  frame.style.width = '100%'
  frame.style.height = presentation === 'ginkgo-v23-viewport-modal' ? '100%' : frameCss.height
  frame.style.maxHeight = presentation === 'ginkgo-v23-viewport-modal' ? 'none' : frameCss.maxHeight
  frame.style.border = '0'
  frame.style.borderRadius = presentation === 'ginkgo-v23-viewport-modal' ? '0' : '24px 24px 0 0'
  frame.style.background = presentation === 'ginkgo-v23-viewport-modal' ? 'transparent' : '#fff'
  frame.style.boxShadow = presentation === 'ginkgo-v23-viewport-modal'
    ? 'none'
    : '0 -16px 40px rgba(15,23,42,0.18)'
  if (presentation === 'bottom-sheet') {
    frame.style.transform = 'translateY(100%)'
    frame.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)'
    frame.style.willChange = 'transform'
    frame.className = frameEnterClass
  }

  return frame
}

// Host callbacks remain local. Reject objects that cannot be represented as BOOT data.
function customTransportData(value: unknown, ancestors = new Set<object>()): unknown {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return undefined
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'object' || ancestors.has(value) ||
    (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    throw new TypeError('customPage transport options must contain finite plain data')
  }
  ancestors.add(value)
  try {
    if (Array.isArray(value)) return value.map(child => customTransportData(child, ancestors)).filter(child => child !== undefined)
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, customTransportData(child, ancestors)]).filter(([, child]) => child !== undefined))
  } finally { ancestors.delete(value) }
}

function createInlineVerificationFrame(
  src: string,
  title: string,
  fixedToRenderTarget = false,
): HTMLIFrameElement {
  const frame = document.createElement('iframe')
  frame.title = title
  frame.src = src
  frame.dataset.assistanceAuthFrame = 'true'
  frame.dataset.assistanceAuthInline = 'true'
  frame.style.display = 'block'
  frame.style.width = '100%'
  frame.style.height = fixedToRenderTarget ? '100%' : defaultAutoFrameHeight
  frame.style.maxHeight = 'none'
  frame.style.border = '0'
  frame.style.borderRadius = '0'
  frame.style.background = 'transparent'
  frame.style.boxShadow = 'none'
  frame.style.transform = 'none'
  frame.style.transition = 'none'
  return frame
}

function createHiddenProbeFrame(src: string): HTMLIFrameElement {
  const frame = document.createElement('iframe')
  frame.src = src
  frame.title = ''
  frame.dataset.assistanceAuthProbe = 'true'
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  frame.style.position = 'fixed'
  frame.style.left = '-99999px'
  frame.style.top = '0'
  frame.style.width = '1px'
  frame.style.height = '1px'
  frame.style.border = '0'
  frame.style.opacity = '0'
  frame.style.pointerEvents = 'none'
  return frame
}

function resolveVerificationUrlBase() {
  return SFT_PUBLIC_BASE_URL
}

function resolveVerificationLocation() {
  const baseUrl = resolveVerificationUrlBase()
  const verificationUrl = new URL(defaultVerificationPath, baseUrl).toString()

  return {
    verificationUrl,
    allowedOrigin: new URL(baseUrl).origin,
  }
}

function playFrameEnterAnimation(
  shell: HTMLDivElement,
  frame: HTMLIFrameElement,
  presentation: AssistanceFramePresentation,
  transparentBackdrop = false,
): () => void {
  let cancelled = false
  let secondFrameId: number | undefined

  // Flush the off-screen initial state so the first visible paint can animate from it.
  shell.getBoundingClientRect()
  frame.getBoundingClientRect()

  const applyEnterState = () => {
    if (cancelled || !shell.isConnected || !frame.isConnected) {
      return
    }

    shell.style.background = transparentBackdrop ? 'transparent' : 'rgba(15,23,42,0.35)'
    shell.style.opacity = '1'
    if (presentation === 'bottom-sheet') {
      frame.style.transform = 'translateY(0)'
    }
  }

  const firstFrameId = requestAnimationFrame(() => {
    if (cancelled) {
      return
    }

    secondFrameId = requestAnimationFrame(applyEnterState)
  })

  return () => {
    cancelled = true
    cancelAnimationFrame(firstFrameId)

    if (secondFrameId !== undefined) {
      cancelAnimationFrame(secondFrameId)
    }
  }
}

function playFrameExitAnimation(
  shell: HTMLDivElement,
  frame: HTMLIFrameElement,
  presentation: AssistanceFramePresentation,
  registerFinish: (finish: () => void) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false
    let timer: number | undefined
    let animationFrame: number | undefined
    const finish = () => {
      if (resolved) {
        return
      }

      resolved = true
      if (timer !== undefined) window.clearTimeout(timer)
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
      transitionTarget.removeEventListener('transitionend', finish)
      resolve()
    }

    const transitionTarget = presentation === 'bottom-sheet' ? frame : shell
    registerFinish(finish)
    transitionTarget.addEventListener('transitionend', finish)
    timer = window.setTimeout(finish, frameExitAnimationMs + 80)
    animationFrame = requestAnimationFrame(() => {
      shell.style.background = 'rgba(15,23,42,0)'
      shell.style.opacity = '0'
      if (presentation === 'bottom-sheet') {
        frame.style.transform = 'translateY(100%)'
      }
    })
  })
}

export function getAssistanceMobileAuthOfficialCssAsset(
  baseUrl?: string,
): AssistanceMobileAuthOfficialCssAsset {
  const resource = getActiveJssdkResource()
  return {
    href: joinLocalAssetPath(baseUrl, 'new-control-style.css'),
    integrity: `sha256-${resource.cssSha256}`,
    version: resource.version,
  }
}

export function injectAssistanceMobileAuthOfficialCss(
  options: AssistanceMobileAuthOfficialCssInjectionOptions = {},
): HTMLLinkElement {
  const targetDocument = options.document ?? document
  const elementId = options.id ?? defaultOfficialCssElementId
  const existing = targetDocument.getElementById(elementId)

  if (existing instanceof targetDocument.defaultView!.HTMLLinkElement) {
    return existing
  }

  const asset = getAssistanceMobileAuthOfficialCssAsset(options.baseUrl)
  const link = targetDocument.createElement('link')
  link.id = elementId
  link.rel = 'stylesheet'
  link.href = asset.href
  link.integrity = asset.integrity
  link.dataset.assistanceMobileAuthOfficialCssVersion = asset.version
  targetDocument.head.appendChild(link)

  return link
}

export function createAssistanceMobileAuthSdk(
  options: AssistanceMobileAuthSdkOptions,
): AssistanceMobileAuthSdkInstance {
  const appId = typeof options.appId === 'string' ? options.appId.trim() : ''
  if (!appId) {
    throw new Error('AssistanceMobileAuth: appId is required since 0.2.0')
  }

  const custom = options.customPage !== undefined
  if (custom) {
    normalizeCustomPage(options.customPage, window.location.href)
    if (options.container !== undefined) throw new TypeError('customPage does not support container/authorize mode')
  }

  const display = options.display === 'inline' ? 'inline' : 'modal'
  // 创建阶段即解析 selector，避免 inline 配置悄然退回 modal。打开时会再次确认节点仍在文档中。
  const inlineRenderTarget = display === 'inline'
    ? resolveInlineRenderTarget(options.renderTo as HTMLElement | string)
    : undefined

  const uiConfig = normalizeAssistanceUiConfig(options.ui, { warn: warnAssistanceUiConfigToConsole })
  const shouldSendUiConfig = hasAssistanceUiConfig(uiConfig)
  const beforeLoginNotificationEnabled = typeof options.onBeforeLogin === 'function'
  const stateChangeEnabled = typeof options.onStateChange === 'function'
  const formHeaderImg = normalizeFormHeaderImg(options.formHeaderImg)
  let officialJssdkLoadPromise: Promise<void> | undefined

  if (!custom && (options.container || options.authParams)) {
    if (!options.container || !options.authParams) {
      throw new Error('AssistanceMobileAuth legacy authorize mode requires container and authParams')
    }

    assertOfficialJssdkMetadataReady()
    resolveContainer(options.container)
    officialJssdkLoadPromise = loadRemoteOfficialJssdk()
  }

  let facade: MobileAuthSdkFacade | undefined
  let activeVerification: ActiveVerificationSession | undefined
  let activeProbe: Promise<PrecheckResult> | undefined
  let abortActiveProbe: (() => void) | undefined

  function getFacade(): MobileAuthSdkFacade {
    facade ??= createMobileAuthSdkFacade()

    return facade
  }

  function cleanupFrame(session = activeVerification): void {
    if (!session) {
      return
    }

    if (session.allowedOrigin) {
      try {
        session.frame.contentWindow?.postMessage(createAssistanceAuthMessage(ASSISTANCE_AUTH_CLOSE, session.sessionId), session.allowedOrigin)
      } catch { /* Disposal failure cannot retain the old session. */ }
    }

    if (activeVerification !== session) {
      session.shell?.remove()
      session.frame.remove()
      return
    }

    session.keyboardAvoidance?.dispose()
    session.keyboardAvoidance = undefined
    session.disposeViewportFrame?.()
    session.disposeViewportFrame = undefined
    session.cancelPendingEnterAnimation?.()
    session.cancelPendingEnterAnimation = undefined
    session.finishPendingExitAnimation?.()
    session.finishPendingExitAnimation = undefined
    session.disposeMessageListener?.()
    session.disposeMessageListener = undefined
    session.shell?.remove()
    session.frame.remove()
    if (session.presentation !== 'inline') {
      document.body.style.overflow = session.previousBodyOverflow ?? ''
    }
    activeVerification = undefined
  }

  function terminateSession(session: ActiveVerificationSession, error: Error): void {
    if (session.settled) {
      cleanupFrame(session)
      return
    }

    const reject = session.reject
    session.settled = true
    cleanupFrame(session)
    reject?.(error)
  }

  async function closeFrameWithAnimation(session: ActiveVerificationSession): Promise<void> {
    if (session.presentation === 'inline') {
      cleanupFrame(session)
      return
    }

    session.cancelPendingEnterAnimation?.()
    session.cancelPendingEnterAnimation = undefined
    // The viewport frame is immutable for the session. Once dismissal starts it
    // must no longer react to a keyboard/tool-bar viewport change during fade-out.
    session.disposeViewportFrame?.()
    session.disposeViewportFrame = undefined
    if (custom && session.presentation === 'bottom-sheet' && session.keyboardAvoidance) {
      const frameHeight = session.frame.style.height
      const layer = session.frame.parentElement!
      const layerTransform = layer.style.transform
      session.keyboardAvoidance.dispose()
      session.keyboardAvoidance = undefined
      session.frame.style.height = frameHeight
      layer.style.transform = layerTransform
    }
    if (session.presented && session.shell) {
      await playFrameExitAnimation(session.shell, session.frame, session.presentation, finish => {
        session.finishPendingExitAnimation = finish
      })
      session.finishPendingExitAnimation = undefined
    }
    cleanupFrame(session)
  }

  function handleShowAuthPageSuccess(payload: MobileAuthSdkCallbackPayload): void {
    if (String(payload.code) !== '103000') {
      options.onError?.(payload)
      return
    }

    getFacade().initControl({
      styleOption: createMobileAuthStyleOption(options.styleOption),
      beforeSubmit: () => true,
      authReady: options.onAuthReady,
      success: options.onSuccess as ((payload: MobileAuthSdkCallbackPayload) => void) | undefined,
      error: options.onError,
    })
  }

  const instance: AssistanceMobileAuthSdkInstance = {
    authorize() {
      if (custom) throw new TypeError('customPage does not support authorize mode; use open')
      if (!options.container || !options.authParams) {
        throw new Error('AssistanceMobileAuth authorize requires container and authParams')
      }

      const normalizedAuthType = normalizeMobileAuthType(options.authParams.authType)
      const authParams = normalizedAuthType === options.authParams.authType
        ? options.authParams
        : { ...options.authParams, authType: normalizedAuthType }
      const loadPromise = officialJssdkLoadPromise ?? loadRemoteOfficialJssdk()
      officialJssdkLoadPromise = loadPromise

      void loadPromise
        .then(() => {
          getFacade().showAuthPage({
            data: authParams,
            success: handleShowAuthPageSuccess,
            error: options.onError,
          })
        })
        .catch((error: unknown) => {
          const normalizedError = error instanceof Error ? error : new Error(String(error))
          options.onError?.({ code: 'sdk-script-load-failed', message: normalizedError.message })
        })
    },
    clear(targetId) {
      getFacade().clearControl(targetId)
    },
    open(request) {
      return instance.openVerification(request)
    },
    openVerification(request) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('Assistance auth requires a browser window and document'))
      }

      // 先验证新 inline 容器，避免失效的目标把已有活动会话提前打断。
      const openedAt = Date.now()
      let page: ReturnType<typeof normalizeCustomPage> | undefined
      let activeInlineRenderTarget: HTMLElement | undefined
      let customStyle: MobileAuthSdkStyleOption | undefined
      let customAuthParams: MobileAuthSdkShowAuthPageData | undefined
      let customRequest: AssistanceVerificationRequest | undefined
      let customAgreements: Array<{ name: string; link: string }> = []
      try {
        if (custom) {
          page = normalizeCustomPage(options.customPage, window.location.href)
          customStyle = customTransportData(options.styleOption) as MobileAuthSdkStyleOption | undefined
          if (options.agreements !== undefined && !Array.isArray(options.agreements)) {
            throw new TypeError('customPage agreements must be an array')
          }
          customAgreements = Array.from(options.agreements ?? [], item => {
            const name = item?.name
            const link = item?.link
            if (typeof name !== 'string' || typeof link !== 'string') {
              throw new TypeError('customPage agreement name and link must be strings')
            }
            return { name, link }
          })
          if (options.authParams) {
            const authFields = ['version', 'appId', 'sign', 'traceId', 'timestamp', 'authType', 'scope'] as const
            for (const field of authFields) {
              const value = options.authParams[field]
              if (field === 'version' && value === undefined) continue
              if (typeof value !== 'string' || !value.trim()) throw new TypeError(`customPage authParams.${field} must be a non-empty string`)
            }
            const params = options.authParams
            customAuthParams = {
              ...(params.version === undefined ? {} : { version: params.version }),
              appId: params.appId, sign: params.sign, traceId: params.traceId, timestamp: params.timestamp,
              authType: typeof __DUODIAN_BOTTOM_SHEET__ !== 'undefined' && __DUODIAN_BOTTOM_SHEET__
                ? params.authType : normalizeMobileAuthType(params.authType), scope: params.scope,
            }
          }
          if (request?.requestId !== undefined && typeof request.requestId !== 'string') throw new TypeError('customPage requestId must be a string')
          if (request?.scene !== undefined && request.scene !== 'native-number') throw new TypeError('customPage scene must be native-number')
          customRequest = { ...(request?.requestId ? { requestId: request.requestId } : {}), ...(request?.scene ? { scene: request.scene } : {}) }
        }
        activeInlineRenderTarget = display === 'inline' ? assertConnectedInlineRenderTarget(inlineRenderTarget!) : undefined
      } catch (error) {
        if (custom) return Promise.reject(error)
        throw error
      }
      const previousSession = activeVerification
      if (previousSession) {
        terminateSession(previousSession, new Error('Assistance auth replaced'))
      }
      const sessionId = createAssistanceAuthSessionId()

      const loaderUrl = typeof __CUSTOM_LOADER_URL__ === 'string' && __CUSTOM_LOADER_URL__
        ? __CUSTOM_LOADER_URL__ : new URL('assist/0.3.0/custom-verification.html', SFT_PUBLIC_BASE_URL).href
      const verificationLocation = custom ? { verificationUrl: loaderUrl, allowedOrigin: new URL(loaderUrl).origin } : resolveVerificationLocation()
      const customerBottomSheet = custom && display !== 'inline'
        && typeof __DUODIAN_BOTTOM_SHEET__ !== 'undefined' && __DUODIAN_BOTTOM_SHEET__
      const presentation = display === 'inline' ? 'inline' : custom
        ? customerBottomSheet ? 'bottom-sheet' : 'ginkgo-v23-viewport-modal' : resolveFramePresentation(appId)
      const fixedHaikeInlineFrame = !custom && usesFixedHaikeInlineFrame(appId, display)
      const customFrameCss = custom ? resolveFrameCssLengths({
        ...options, authWindowHeightMode: options.authWindowHeightMode ?? (display === 'inline' || customerBottomSheet ? 'auto' : 'fixed'),
      }) : undefined
      const customMaxHeight = normalizeOptionalCssLength(options.authWindowMaxHeight)
      const viewportMaxHeight = `calc(100% - ${KEYBOARD_SAFE_TOP_GAP_PX}px)`
      const frameCss = custom
        ? { ...customFrameCss!,
          height: normalizeOptionalCssLength(options.authWindowHeight) ?? (customFrameCss!.heightMode === 'auto' ? defaultAutoFrameHeight : '100%'),
          maxHeight: customerBottomSheet
            ? customMaxHeight ? `min(${customMaxHeight}, ${viewportMaxHeight})` : viewportMaxHeight
            : customMaxHeight ?? 'none',
        }
        : presentation === 'inline'
        ? { heightMode: 'auto' as const, height: defaultAutoFrameHeight, maxHeight: 'none' }
        : presentation === 'ginkgo-v23-viewport-modal'
        ? { heightMode: 'fixed' as const, height: '100%', maxHeight: 'none' }
        : resolveFrameCssLengths(options)
      const iframeOptions: AssistanceIframeOptions = normalizeAssistanceIframeOptions({
        closable: options.closable,
        useCustomKeyboard: options.useCustomKeyboard,
        heightMode: frameCss.heightMode,
      })
      // 顶/底图随 styleOption 走 postMessage（见下方 onReady），不再编进 iframe URL 查询参数：
      // 查询串里嵌外部图片 URL 会触发 ginkgo 云 WAF 拦截（461）。
      const verificationUrl = custom ? createCustomVerificationUrl({
        loaderUrl, mode: 'authorization', sessionId, parentOrigin: window.location.origin,
      }) : createVerificationUrl({
        verificationUrl: verificationLocation.verificationUrl,
        sessionId,
        request,
        expectsUiConfig: shouldSendUiConfig,
        appId,
        parentOrigin: window.location.origin,
        ...(presentation === 'inline' ? { layout: 'inline' as const } : {}),
        debugVConsole: presentation === 'inline' && isHaikeInternalTestPage(),
      })
      const shellAndLayer = presentation === 'inline' ? undefined : createFrameShell(presentation, customerBottomSheet)
      const frame = presentation === 'inline'
        ? createInlineVerificationFrame(
          verificationUrl,
          options.authWindowTitle ?? '移动认证验证窗口',
          fixedHaikeInlineFrame,
        )
        : createVerificationFrame(
          verificationUrl,
          options.authWindowTitle ?? '移动认证验证窗口',
          frameCss,
          presentation,
        )
      shellAndLayer?.positioningLayer.appendChild(frame)
      if (custom) { frame.style.height = frameCss.height; frame.style.maxHeight = frameCss.maxHeight }
      const session: ActiveVerificationSession = {
        sessionId,
        shell: shellAndLayer?.shell,
        frame,
        previousBodyOverflow: presentation === 'inline' ? undefined : document.body.style.overflow,
        settled: false,
        presentation,
        presented: false,
        allowedOrigin: custom ? verificationLocation.allowedOrigin : undefined,
      }
      const deferPresentation = custom || presentation !== 'inline' &&
        (isZidingyiFeedbackProfile(appId) || isYuanbaoFeedbackProfile(appId))
      if (deferPresentation) {
        if (session.shell) hideFrameDuringInitialization(session.shell, frame)
        if (custom) {
          frame.style.opacity = '0'
          frame.style.pointerEvents = 'none'
          frame.inert = true
          frame.tabIndex = -1
          frame.setAttribute('aria-hidden', 'true')
        }
      }
      if (presentation === 'ginkgo-v23-viewport-modal' || customerBottomSheet) {
        session.disposeViewportFrame = createViewportModalController({
          targetWindow: window,
          frame,
          positioningLayer: shellAndLayer!.positioningLayer,
          preserveFrameHeight: custom,
        })
      }
      if (presentation === 'bottom-sheet' && frameCss.heightMode === 'auto') {
        session.keyboardAvoidance = createKeyboardViewportAvoidanceController({
          targetWindow: window,
          frame,
          positioningLayer: shellAndLayer!.positioningLayer,
          constrainToViewport: customerBottomSheet,
        })
        if (customerBottomSheet) session.keyboardAvoidance.update({ height: Number.parseFloat(defaultAutoFrameHeight) })
      }
      activeVerification = session
      if (presentation === 'inline') {
        activeInlineRenderTarget!.appendChild(frame)
      } else {
        document.body.appendChild(session.shell!)
      }

      const presentFrame = () => {
        if (!custom && presentation === 'inline') return
        if (
          session.settled
          || session.presented
          || (presentation !== 'inline' && !session.shell?.isConnected)
          || !frame.isConnected
        ) {
          return
        }

        session.presented = true
        if (custom) {
          frame.style.opacity = '1'; frame.style.pointerEvents = 'auto'; frame.inert = false
          frame.removeAttribute('tabindex'); frame.removeAttribute('aria-hidden')
          if (presentation === 'inline') return
        }
        exposeFrameForPresentation(session.shell!, frame)
        document.body.style.overflow = 'hidden'
        session.cancelPendingEnterAnimation = playFrameEnterAnimation(session.shell!, frame, presentation,
          custom ? !customerBottomSheet : isYuanbaoFeedbackProfile(appId))
      }

      if (!deferPresentation) {
        presentFrame()
      }
      if (
        !customerBottomSheet
        && session.keyboardAvoidance
        && !iframeOptions.useCustomKeyboard
        && primeIosNativeKeyboard(session.shell!)
      ) {
        const initialFrameHeight = readInitialFrameHeight(frame)
        if (initialFrameHeight !== null) {
          session.keyboardAvoidance.update({
            height: initialFrameHeight,
            keyboardFocused: true,
          })
        }
      }
      const frameWindow = frame.contentWindow
      let bootSent = false
      const customConfig: CustomAuthorizationConfig | undefined = page ? {
        mode: 'authorization', sessionId, parentOrigin: window.location.origin, page, appId,
        request: customRequest!, authParams: customAuthParams,
        styleOption: customStyle, agreements: customAgreements, iframeOptions,
        trustedBusinessBaseUrl: SFT_PUBLIC_BASE_URL,
        deadline: openedAt + 15000, beforeLoginNotificationEnabled, stateChangeEnabled,
      } : undefined

      const sendUiConfigToFrame = () => {
        if (!shouldSendUiConfig || !frameWindow) {
          return
        }

        frameWindow.postMessage(
          createAssistanceAuthConfigMessage(sessionId, uiConfig),
          verificationLocation.allowedOrigin,
        )
      }

      const sendStyleToFrame = () => {
        frameWindow?.postMessage(
          createAssistanceAuthMessage(
            ASSISTANCE_AUTH_STYLE,
            sessionId,
            {
              styleOption: sanitizeStyleOptionForTransport(options.styleOption) ?? {},
              agreements: sanitizeCallerAgreements(options.agreements),
              iframeOptions,
              beforeLoginNotificationEnabled,
              stateChangeEnabled,
              ...(formHeaderImg ? { formHeaderImg } : {}),
            },
          ),
          verificationLocation.allowedOrigin,
        )
      }

      return new Promise<AssistanceVerificationSuccessPayload>((resolve, reject) => {
        session.reject = reject
        let presentationTimer: ReturnType<typeof setTimeout> | undefined
        let lastState: AssistanceAuthStateChangeEvent['type'] | undefined

        const finish = (callback: () => void) => {
          if (session.settled) {
            return
          }

          session.settled = true
          clearTimeout(presentationTimer)
          if (custom && (!customerBottomSheet || !session.presented)) {
            cleanupFrame(session)
            callback()
            return
          }
          if (presentation === 'inline') {
            callback()
            return
          }
          void closeFrameWithAnimation(session).then(callback)
        }

        const failVerification = (payload: AssistanceVerificationErrorPayload) => {
          if (custom || isYuanbaoFeedbackProfile(appId)) {
            try {
              options.onError?.(payload)
            } catch (error) {
              console.warn('[AssistanceMobileAuth] onError callback failed', error)
            }
          } else {
            options.onError?.(payload)
          }
          reject(new Error(`Assistance auth error: ${payload.message}`))
        }

        session.disposeMessageListener = listenForAssistanceAuthMessages(
          window,
          sessionId,
          {
            onReady: () => {
              if (activeVerification !== session) {
                return
              }
              // iframe 就绪后，把客户 styleOption（剥函数的纯数据）推进授权页，
              // 由授权页在 initControl 时应用。容器模式对外不可用，样式只能在我方 iframe 内套用。
              // targetOrigin 精确锁定授权页 origin（不用 '*'）。即使无 styleOption 也发空对象，
              // 让授权页的样式门尽快放行、不必等超时兜底。
              if (custom) {
                if (session.settled || bootSent) return
                if (Date.now() >= openedAt + 15000) {
                  finish(() => failVerification({ code: 'AUTH_READY_TIMEOUT', message: '认证页面初始化超时，请稍后重试。' }))
                  return
                }
                bootSent = true
                try {
                  frameWindow?.postMessage(createAssistanceAuthMessage(ASSISTANCE_AUTH_CUSTOM_BOOT, sessionId,
                    { runtimeSource: customRuntimeSource, config: customConfig }), verificationLocation.allowedOrigin)
                } catch (error) {
                  finish(() => failVerification({ code: 'CUSTOM_BOOT_FAILED', message: error instanceof Error ? error.message : String(error) }))
                  return
                }
                notifyAuthCallback(options.onReady, 'onReady')
              } else {
                sendStyleToFrame(); sendUiConfigToFrame(); options.onReady?.()
              }
            },
            onPresentationReady: () => {
              if (custom && Date.now() >= openedAt + 15000 && !session.presented) {
                finish(() => failVerification({ code: 'AUTH_READY_TIMEOUT', message: '认证页面初始化超时，请稍后重试。' }))
                return
              }
              clearTimeout(presentationTimer)
              if (deferPresentation) {
                presentFrame()
              }
            },
            onStateChange: (event) => {
              if (activeVerification !== session || session.settled) {
                return
              }

              if (custom && lastState === event.type) return
              lastState = event.type

              notifyAuthCallback(options.onStateChange, 'onStateChange', event)
              if (event.type === 'idLast4Complete') {
                notifyAuthCallback(options.onBeforeLogin, 'onBeforeLogin')
              }
            },
            onSuccess: (payload) => finish(() => {
              if (custom) notifyAuthCallback(options.onSuccess, 'onSuccess', payload)
              else options.onSuccess?.(payload)
              resolve(payload)
            }),
            onCancel: (payload) => finish(() => {
              if (custom) notifyAuthCallback(options.onCancel, 'onCancel', payload)
              else options.onCancel?.(payload)
              reject(new Error('Assistance auth cancelled'))
            }),
            onError: (payload) => finish(() => failVerification(payload)),
            // 非终态通知：纯透传，不 settle、不关弹窗、不 reject —— 终态语义不变。
            // settled 之后不再透传：关闭动画期间迟到的通知对调用方已无意义（流程已终结）。
            onErrorNotice: (payload) => {
              if (activeVerification === session && !session.settled) {
                options.onErrorNotice?.(payload)
              }
            },
            onPhoneReady: (payload) => {
              if (activeVerification === session && !session.settled) {
                options.onPhoneReady?.(payload)
              }
            },
            onResize: (payload) => {
              if (custom) {
                if (activeVerification === session && !session.settled && iframeOptions.heightMode === 'auto') {
                  if (customerBottomSheet) session.keyboardAvoidance?.update(payload)
                  else frame.style.height = `${payload.height}px`
                }
                return
              }
              if (activeVerification === session && presentation === 'inline') {
                if (!fixedHaikeInlineFrame) {
                  session.frame.style.height = `${payload.height}px`
                }
                return
              }

              if (
                activeVerification !== session
                || presentation === 'ginkgo-v23-viewport-modal'
                || iframeOptions.heightMode !== 'auto'
                || !session.keyboardAvoidance
              ) {
                return
              }

              session.keyboardAvoidance.update(payload)
            },
            onClose: () => finish(() => {
              if (custom) notifyAuthCallback(options.onClose, 'onClose')
              else options.onClose?.()
              reject(new Error('Assistance auth closed'))
            }),
          },
          verificationLocation.allowedOrigin,
          {
            expectedSource: frameWindow,
            expectedSourceTypes: custom ? undefined : presentation === 'inline'
              ? [ASSISTANCE_AUTH_STATE_CHANGE, ASSISTANCE_AUTH_RESIZE]
              : [ASSISTANCE_AUTH_STATE_CHANGE],
          },
        )
        if (custom || deferPresentation && isYuanbaoFeedbackProfile(appId)) {
          presentationTimer = setTimeout(() => finish(() => {
            const payload = { code: 'AUTH_READY_TIMEOUT', message: '认证页面初始化超时，请稍后重试。' }
            failVerification(payload)
          }), custom ? Math.max(0, openedAt + 15000 - Date.now()) : 15000)
          const disposeListener = session.disposeMessageListener
          session.disposeMessageListener = () => {
            clearTimeout(presentationTimer)
            disposeListener?.()
          }
        }
      })
    },
    precheck(options) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('Assistance auth precheck requires a browser window and document'))
      }

      if (activeProbe) {
        return activeProbe
      }

      const timeoutMs = options.timeoutMs ?? PROBE_DEFAULT_TIMEOUT_MS
      const probeSessionId = createAssistanceAuthSessionId()
      const verificationLocation = resolveVerificationLocation()
      const probeUrl = createVerificationUrl({
        verificationUrl: verificationLocation.verificationUrl,
        sessionId: probeSessionId,
        request: { scene: options.scene, requestId: options.requestId },
        mode: 'probe',
        appId,
      })
      const frame = createHiddenProbeFrame(probeUrl)

      const probe = new Promise<PrecheckResult>((resolve) => {
        let probeSettled = false
        let dispose: (() => void) | undefined
        let timer: ReturnType<typeof setTimeout> | undefined

        const finish = (result: PrecheckResult) => {
          if (probeSettled) {
            return
          }
          probeSettled = true
          if (timer !== undefined) {
            clearTimeout(timer)
          }
          dispose?.()
          frame.remove()
          resolve(result)
        }

        abortActiveProbe = () => finish({ eligible: false, reason: 'unknown' })

        dispose = listenForAssistanceAuthMessages(
          window,
          probeSessionId,
          { onProbeResult: (payload) => finish(payload) },
          verificationLocation.allowedOrigin,
        )

        timer = setTimeout(() => finish({ eligible: false, reason: 'unknown' }), timeoutMs)
        document.body.appendChild(frame)
      }).finally(() => {
        activeProbe = undefined
        abortActiveProbe = undefined
      })

      activeProbe = probe
      return probe
    },
    close() {
      const session = activeVerification
      if (session?.frame.contentWindow) {
        try {
          session.frame.contentWindow.postMessage(createAssistanceAuthMessage(ASSISTANCE_AUTH_CLOSE, session.sessionId), session.allowedOrigin ?? '*')
        } catch { /* Closing an already disposed runtime still removes the frame. */ }
      }

      if (session && !session.settled && session.reject) {
        session.settled = true
        const reject = session.reject
        if (custom && (session.presentation !== 'bottom-sheet' || !session.presented)) {
          cleanupFrame(session)
          notifyAuthCallback(options.onClose, 'onClose')
          reject(new Error('Assistance auth closed'))
          return
        }
        void closeFrameWithAnimation(session).then(() => {
          if (custom) notifyAuthCallback(options.onClose, 'onClose')
          else options.onClose?.()
          reject(new Error('Assistance auth closed'))
        })
        return
      }

      cleanupFrame(session)
    },
    destroy() {
      abortActiveProbe?.()
      const session = activeVerification
      if (session) {
        terminateSession(session, new Error('Assistance auth destroyed'))
      }
    },
  }

  return instance
}

export type {
  AssistanceVerificationErrorNoticePayload,
  AssistanceVerificationErrorPayload,
  AssistanceVerificationPhoneReadyPayload,
  AssistanceVerificationRequest,
  AssistanceVerificationSuccessPayload,
}
