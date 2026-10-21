import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type RefObject } from 'react'

import { SdkLoadingSkeleton } from '../components/auth/SdkLoadingSkeleton'
import type { IdentityFlowSnapshot } from '../services/identityFlow'
import { createAuthParamsProvider, type AuthParamsResolution } from '../sdk/authParamsProvider'
import { getMobileAuthSdkConfig } from '../sdk/config'
import { deriveAuthFlowStatus, mapSdkOutcomeToScenarioState, shouldDisablePrimaryAction } from '../sdk/authFlow'
import { createMobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import type { MobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import { loadMobileAuthSdkResources, resetMobileAuthSdkLoader } from '../sdk/resourceLoader'
import { extractSdkErrorPayload, lookupSdkError } from '../sdk/sdkErrorMessages'
import { mergeCustomerStyleOption } from '../sdk/styleOption'
import { sdkControlSlotMap } from '../sdk/slots'
import type { MobileAuthSdkAgreementEntry, MobileAuthSdkConfig, MobileAuthSdkErrorKind, MobileAuthSdkLoadState, MobileAuthSdkMode, MobileAuthSdkStyleOption } from '../sdk/types'
import { SdkErrorPanel } from '../components/feedback/SdkErrorPanel'
import {
  buildUserServiceAgreeArr,
  buildUserServiceChildArr,
} from '../agreements/agreementAggregation'
import type { AuthDemoState, AuthScene } from '../types/auth-review'
import {
  ASSISTANCE_AUTH_CANCEL,
  ASSISTANCE_AUTH_CONFIG,
  ASSISTANCE_AUTH_ERROR,
  ASSISTANCE_AUTH_ERROR_NOTICE,
  ASSISTANCE_AUTH_PHONE_READY,
  ASSISTANCE_AUTH_PRESENTATION_READY,
  ASSISTANCE_AUTH_READY,
  ASSISTANCE_AUTH_RESIZE,
  ASSISTANCE_AUTH_STATE_CHANGE,
  ASSISTANCE_AUTH_SUCCESS,
  createAssistanceAuthMessage,
  defaultAssistanceIframeOptions,
  isAssistanceAuthMessage,
  listenForStyleMessage,
  normalizePageImage,
  parseAssistanceAuthParentOrigin,
  parsePageImageParam,
  type AssistanceAuthResizePayload,
  type AssistanceIframeOptions,
  type AssistanceVerificationErrorNoticePayload,
  type AssistanceVerificationErrorPayload,
  type AssistanceVerificationPhoneReadyPayload,
  type AssistanceVerificationSuccessPayload,
  type PageImageConfig,
} from '../wrapper/verificationBridge'
import {
  mergeAssistanceUiConfigs,
  normalizeAssistanceUiConfig,
  warnAssistanceUiConfigToConsole,
  type NormalizedAssistanceMobileAuthUiConfig,
} from '../wrapper/uiConfig'
import { mobileOfficialJssdkResource } from '../wrapper/vendor/mobile-jssdk.meta'
import { isZidingyiFeedbackProfile, isYuanbaoFeedbackProfile, resolveAppProfile } from './appProfiles'
import { ChinaumsSheetLogin } from './skins/ChinaumsSheetLogin'
import { ChinaumsSheetV23Login } from './skins/ChinaumsSheetV23Login'
import { DefaultAgreementDisplay } from './skins/DefaultAgreementDisplay'
import { HaikeInlineLogin } from './skins/HaikeInlineLogin'
import {
  ID_LAST4_LENGTH,
  MobileAuthSubmitSlot,
  SecureKeyboard,
  StatusToast,
  createConfiguredTextStyle,
  normalizeIdLast4Input,
  useOneShotNativeInputFocus,
  type IdentityLoginSkinProps,
} from './skins/identityLoginShared'
import type { AuthVerificationIntegration } from './authVerification/integrationClients'

const SUCCESS_CODE = '103000'
const MOCK_TOAST_DURATION_MS = 1400
const PHONE_READY_TIMEOUT_MS = 1500
const PHONE_READY_POLL_INTERVAL_MS = 50
const MASKED_MOBILE_TEXT_PATTERN = /1\d{2}\*{4}\d{4}/
const MOBILE_OPERATOR_AGREEMENT_NORMALIZED_NAME = '中国移动认证服务条款'
const MOBILE_OPERATOR_AGREEMENT_OFFICIAL_URL = 'https://slw.h5cmpassport.com:9091/h5/resource/umsProtocol.html'
const DEFAULT_NATIVE_INPUT_FOCUS_COLOR = '#ff2d55'
const DEFAULT_THEME_COLOR = '#ff2d55'
const DEFAULT_HEADER_TITLE_TEXT = '确认身份信息'
const DEFAULT_ID_TITLE_TEXT = '输入身份证后4位'
const STATIC_RESOURCE_RELEASE = __STATIC_RESOURCE_RELEASE__
// 验证成功后不再显示"授权成功"toast，直接进行下一步（跳转 / 关闭 iframe）。
// 用 setTimeout(…, 0) 仅为把切换推到下一个 tick（保留 completionGeneration 守卫、让 React 先 flush），
// 不再人为停留给 toast 展示时间。
const SUCCESS_HANDOFF_DELAY_MS = 0
const UI_CONFIG_WAIT_TIMEOUT_MS = 2000

export async function loadAuthVerificationIntegration(): Promise<AuthVerificationIntegration> {
  if (STATIC_RESOURCE_RELEASE) {
    throw new Error('Static resource release does not include API or H5 redirect integration clients.')
  }

  const module = await import('./authVerification/integrationClients')
  return module.authVerificationIntegration
}

function normalizeDomText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeCssColor(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed || /url\s*\(|expression\s*\(|var\s*\(|[;{}"'<>]|[\u0000-\u001f\u007f]/i.test(trimmed)) {
    return null
  }

  return trimmed
}

function normalizeAgreementLinkName(value: string): string {
  return value.replace(/[《》\s]/g, '').trim()
}

function retargetMobileOperatorAgreementLinks(root: ParentNode): boolean {
  const targetHref = MOBILE_OPERATOR_AGREEMENT_OFFICIAL_URL
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a'))
  let retargeted = false

  for (const anchor of anchors) {
    const linkName = normalizeAgreementLinkName(anchor.dataset.name ?? anchor.textContent ?? '')

    if (linkName !== MOBILE_OPERATOR_AGREEMENT_NORMALIZED_NAME) {
      continue
    }

    if (anchor.getAttribute('href') !== targetHref) {
      anchor.setAttribute('href', targetHref)
      retargeted = true
    }
    anchor.dataset.assistanceAgreementRetargeted = 'cmcc'
  }

  return retargeted
}

function formatYuanbaoAgreementLinks(root: HTMLElement) {
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a')).filter((anchor) =>
    ['用户信息授权协议', MOBILE_OPERATOR_AGREEMENT_NORMALIZED_NAME, '移动认证安全基座服务条款'].includes(normalizeAgreementLinkName(anchor.dataset.name ?? anchor.textContent ?? '')),
  )
  for (const anchor of anchors) {
    const walker = document.createTreeWalker(anchor, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const next = node.textContent?.replace(/[《》]/g, '') ?? ''
      if (node.textContent !== next) node.textContent = next
    }
  }
  if (anchors.length === 2) {
    const first = anchors[0]
    const next = first.nextSibling
    if (next?.nodeType === Node.TEXT_NODE && /^[\s、，,|]*$/.test(next.textContent ?? '')) {
      if (next.textContent !== ' | ') next.textContent = ' | '
    } else if (!(next instanceof HTMLElement && next.dataset.yuanbaoAgreementSeparator)) {
      const separator = document.createElement('span')
      separator.dataset.yuanbaoAgreementSeparator = 'true'
      separator.textContent = ' | '
      first.after(separator)
    }
  }
}

export function extractMaskedMobileText(root: HTMLElement | null): AssistanceVerificationPhoneReadyPayload | null {
  if (!root) {
    return null
  }

  const rawText = normalizeDomText(root.textContent ?? '')
  const maskedMobile = rawText.match(MASKED_MOBILE_TEXT_PATTERN)?.[0]

  if (!maskedMobile) {
    return null
  }

  return {
    maskedMobile,
    rawText,
    source: 'ydrzPhoneControl',
  }
}

type RedirectCompletionPayload = {
  status: 'success'
  message: string
  authResultId: string
  authCode: string
  authToken?: string
  mock?: boolean
}

function getSdkStatusLabel(state: MobileAuthSdkLoadState) {
  switch (state) {
    case 'loading':
      return 'loading'
    case 'ready':
      return 'ready'
    case 'error':
      return 'error'
    case 'disabled':
      return 'disabled'
    default:
      return 'idle'
  }
}

function ConfiguredUiImage({
  image,
  fallbackAlt,
}: {
  image?: { url: string; alt?: string; height?: string; fit?: 'cover' | 'contain' }
  fallbackAlt: string
}) {
  const [failed, setFailed] = useState(false)

  if (!image || failed) {
    return null
  }

  return (
    <img
      src={image.url}
      alt={image.alt ?? fallbackAlt}
      onError={() => {
        console.warn(`[AssistanceMobileAuth] Failed to load configured image: ${image.url}`)
        setFailed(true)
      }}
      className="w-full rounded-[8px] object-contain"
      style={{
        height: image.height,
        objectFit: image.fit ?? 'contain',
      }}
    />
  )
}

function IdLast4Block({
  value,
  inputRef,
  showLabel = true,
  useNativeInput = false,
  activeColor = DEFAULT_NATIVE_INPUT_FOCUS_COLOR,
  onChange,
  onNativeFocus,
  onNativeBlur,
  dismissKeyboardOnComplete = false,
  onCustomInputFocus,
  useThemeFocusBorder = false,
  customInputActive = false,
}: {
  value: string
  inputRef: RefObject<HTMLInputElement | null>
  showLabel?: boolean
  useNativeInput?: boolean
  activeColor?: string
  onChange?(next: string): void
  onNativeFocus?(): void
  onNativeBlur?(): void
  dismissKeyboardOnComplete?: boolean
  onCustomInputFocus?(): void
  useThemeFocusBorder?: boolean
  customInputActive?: boolean
}) {
  const [nativeFocused, setNativeFocused] = useState(false)
  const digits = Array.from({ length: ID_LAST4_LENGTH }, (_, index) => value[index] ?? '')
  const activeDigitIndex = Math.min(value.length, ID_LAST4_LENGTH - 1)

  function focusNativeInput() {
    if (useNativeInput) {
      inputRef.current?.focus()
    } else {
      onCustomInputFocus?.()
    }
  }

  function handleNativeChange(event: ChangeEvent<HTMLInputElement>) {
    const normalizedValue = normalizeIdLast4Input(event.target.value)
    onChange?.(normalizedValue)
    if (dismissKeyboardOnComplete && normalizedValue.length === ID_LAST4_LENGTH) {
      event.currentTarget.blur()
    }
  }

  function handleNativeFocus() {
    setNativeFocused(true)
    onNativeFocus?.()
  }

  function handleNativeBlur() {
    setNativeFocused(false)
    onNativeBlur?.()
  }

  return (
    <section className="space-y-3 text-center" aria-labelledby="id-last4-title">
      <h3 id="id-last4-title" className={showLabel ? 'text-sm font-medium text-[var(--color-text-secondary)]' : 'sr-only'}>
        身份证后四位
      </h3>
      <div
        className="relative grid grid-cols-4 gap-2.5"
        aria-label="身份证后四位输入"
        data-rrweb-sensitive="true"
        role={useNativeInput ? 'group' : undefined}
        onClick={focusNativeInput}
      >
        {useNativeInput ? (
          <input
            ref={inputRef}
            aria-label="身份证后四位"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            value={value}
            onChange={handleNativeChange}
            onFocus={handleNativeFocus}
            onBlur={handleNativeBlur}
            className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
          />
        ) : null}
        {digits.map((digit, index) => {
          const isActive = index === activeDigitIndex && (
            (useNativeInput && nativeFocused) || (!useNativeInput && customInputActive)
          )

          return (
            <div
              key={index}
              aria-label={`身份证后四位第 ${index + 1} 位`}
              data-active-digit={isActive ? 'true' : undefined}
              className={`flex h-[56px] min-w-0 items-center justify-center rounded-2xl border-transparent bg-[#f6f7f7] text-center text-[22px] font-semibold text-[var(--color-text-primary)] transition-[border-color] duration-150 ${useThemeFocusBorder ? 'border' : 'border-2'}`}
              style={
                isActive
                  ? {
                      borderColor: activeColor,
                      ...(useThemeFocusBorder ? { boxShadow: `inset 0 0 0 1px ${activeColor}` } : {}),
                    }
                  : undefined
              }
            >
              {digit}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CompactAgreementNotice({
  sdkSubmitActive,
  isReady,
  authorizeDisabled,
  authorizing,
  onAuthorize,
  themeColor,
  uiConfig,
  customAgreementChecks,
  onToggleCustomAgreement,
  onOpenCustomAgreement,
}: {
  sdkSubmitActive: boolean
  isReady: boolean
  authorizeDisabled: boolean
  authorizing: boolean
  onAuthorize(): void
  themeColor: string
  uiConfig: NormalizedAssistanceMobileAuthUiConfig
  customAgreementChecks: Record<number, boolean>
  onToggleCustomAgreement(index: number): void
  onOpenCustomAgreement(url: string): void
}) {
  return (
    <DefaultAgreementDisplay
      themeColor={themeColor}
      uiConfig={uiConfig}
      customAgreementChecks={customAgreementChecks}
      onToggleCustomAgreement={onToggleCustomAgreement}
      onOpenCustomAgreement={onOpenCustomAgreement}
    >
      <div
        className={sdkSubmitActive ? 'mt-5 w-full' : 'h-0 w-full overflow-hidden'}
        aria-hidden={!sdkSubmitActive}
        data-testid="compact-submit-shell"
      >
        <MobileAuthSubmitSlot />
      </div>

      {!sdkSubmitActive && isReady ? (
        <button
          type="button"
          onClick={onAuthorize}
          disabled={authorizeDisabled}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-[10px] bg-[#ff2d55] px-4 text-[16px] font-semibold text-white shadow-[0_3px_0_rgba(191,23,65,0.24)] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#F5F6F8] disabled:text-[#8A8F98] disabled:shadow-none"
          style={!authorizeDisabled ? { backgroundColor: themeColor } : undefined}
        >
          {authorizing ? '验证中' : '确认'}
        </button>
      ) : null}
    </DefaultAgreementDisplay>
  )
}

function getMobileAuthResourceConfig(): MobileAuthSdkConfig {
  const config = getMobileAuthSdkConfig()

  if (config.enabled) {
    return config
  }

  return {
    ...config,
    enabled: true,
    mode: 'live',
    jsUrl: mobileOfficialJssdkResource.jsUrl,
    cssUrl: mobileOfficialJssdkResource.cssUrl,
  }
}


function CompactIdentityLogin({
  topImage,
  bottomImage,
  idLast4,
  heightMode,
  contentMeasureRef,
  keyboardVisible,
  toast,
  authorizeDisabled,
  authorizing,
  sdkSubmitActive,
  controlReady,
  sdkLoadState,
  sdkErrorKind,
  sdkErrorText,
  sdkErrorCode,
  sdkErrorSteps,
  sdkErrorVisible,
  useCustomKeyboard,
  nativeInputFocusColor,
  showCloseControl,
  themeColor,
  uiConfig,
  customAgreementChecks,
  onContentSizeChange,
  onIdLast4Change,
  onNativeInputFocus,
  onNativeInputBlur,
  dismissKeyboardOnComplete,
  onCustomInputFocus,
  useDefaultDigitFocusBorder,
  onAuthorize,
  onClose,
  onRetry,
  onToggleCustomAgreement,
  onOpenCustomAgreement,
}: IdentityLoginSkinProps) {
  const nativeInputRef = useRef<HTMLInputElement | null>(null)
  const nativeInputFocusedRef = useRef(false)
  const headerTitle = uiConfig.texts?.headerTitle
  const idTitle = uiConfig.texts?.idTitle
  const phoneTopNotice = uiConfig.texts?.phoneTopNotice
  const isError = sdkErrorVisible && Boolean(sdkErrorText && sdkErrorKind)
  const isSdkFallbackReady = sdkLoadState === 'disabled' || (sdkLoadState === 'error' && !isError)
  const isSdkLoading = !isError && !isSdkFallbackReady && (sdkLoadState !== 'ready' || !controlReady)
  const isReady = !isError && !isSdkLoading
  useOneShotNativeInputFocus(nativeInputRef, !useCustomKeyboard && isReady)
  useEffect(() => {
    if ((useCustomKeyboard || !isReady) && nativeInputFocusedRef.current) {
      nativeInputFocusedRef.current = false
      onNativeInputBlur?.()
    }
  }, [isReady, onNativeInputBlur, useCustomKeyboard])
  const showKeyboard = useCustomKeyboard && keyboardVisible && isReady
  const isAutoHeight = heightMode === 'auto'
  const mainClassName = isAutoHeight
    ? 'flex min-h-0 flex-col overflow-visible bg-white text-[var(--color-text-primary)]'
    : 'flex h-full min-h-0 flex-col bg-white text-[var(--color-text-primary)]'
  const measureRootClassName = isAutoHeight
    ? 'flex min-h-0 flex-col bg-white'
    : 'flex h-full min-h-0 flex-col bg-white'
  const readySectionClassName = isReady
    ? isAutoHeight
      ? 'flex min-h-0 flex-col items-center px-6 pb-3 pt-3'
      : 'flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-3 pt-3'
    : 'h-0 flex-shrink-0 overflow-hidden'
  function appendKey(key: string) {
    if (idLast4.length >= ID_LAST4_LENGTH) {
      return
    }

    onIdLast4Change(normalizeIdLast4Input(`${idLast4}${key}`))
  }

  function deleteKey() {
    onIdLast4Change(idLast4.slice(0, -1))
  }

  function handleNativeInputFocus() {
    nativeInputFocusedRef.current = true
    onNativeInputFocus?.()
  }

  function handleNativeInputBlur() {
    nativeInputFocusedRef.current = false
    onNativeInputBlur?.()
  }

  return (
    <main className={mainClassName} aria-label="确认身份信息">
      <section
        ref={contentMeasureRef}
        data-assistance-auth-content-measure="true"
        className={measureRootClassName}
      >
        {topImage ? (
          <img
            src={topImage.src}
            alt=""
            aria-hidden="true"
            className="block shrink-0"
            style={{ width: topImage.width ?? '100%', height: topImage.height, objectFit: 'cover' }}
            onLoad={onContentSizeChange}
          />
        ) : null}
        {toast ? <StatusToast title={toast.title} icon={toast.icon} /> : null}

        <header className="grid min-h-9 shrink-0 grid-cols-[36px_1fr_36px] items-center px-6 pt-1">
          {showCloseControl ? (
            <button type="button" aria-label="关闭" onClick={onClose} className="flex h-9 w-9 items-center justify-start text-[26px] leading-none text-[#111827]">
              ×
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <h1
            className="text-center leading-6"
            style={createConfiguredTextStyle(headerTitle, { fontSize: '17px', color: '#111827', bold: true })}
          >
            {headerTitle?.text ?? DEFAULT_HEADER_TITLE_TEXT}
          </h1>
          <span aria-hidden="true" />
        </header>

        {/* Error panel (when isError) — overlay above the stable SDK slot mount */}
        {isError && sdkErrorKind && sdkErrorText ? (
          <section className="flex flex-col px-6 pb-3 pt-3">
            <SdkErrorPanel
              errorKind={sdkErrorKind}
              uiText={sdkErrorText}
              code={sdkErrorCode ?? undefined}
              steps={sdkErrorSteps ?? undefined}
              onRetry={onRetry}
            />
          </section>
        ) : null}

        {/* Skeleton (when SDK loading and no error) — overlay above the stable SDK slot mount */}
        {isSdkLoading ? (
          <section className="flex flex-col items-center px-6 pt-4">
            <SdkLoadingSkeleton />
          </section>
        ) : null}

        {/* Stable SDK slot mount — slots live here for the entire component lifetime so the SDK's
            getElementById + appendChild injection survives loading→ready transitions. Visibility is
            controlled by the wrapper className: collapsed (h-0 overflow-hidden) during loading and
            error states, expanded (flex flex-col, scrollable, padded) when isReady.
            Keep the child tree shape fixed from first render onward: use always-mounted wrappers and
            collapse them with className/aria-hidden instead of inserting/removing siblings around the
            SDK slots as authReady flips. */}
        <section
          className={readySectionClassName}
          aria-hidden={!isReady}
          data-sdk-mount-host
        >
          {/* DOM 顺序固定：标题 → phone → state → 4 格 → 协议/tips → submit。
              通过稳定 wrapper 控制显隐，避免在 SDK slot 前后插入/移除兄弟节点。 */}
          <div
            className={isReady ? 'mt-2 w-full' : 'h-0 w-full overflow-hidden'}
            aria-hidden={!isReady}
            data-testid="compact-title-shell"
          >
            <h2
              className="text-center leading-tight"
              style={createConfiguredTextStyle(idTitle, { fontSize: '18px', color: '#111827', bold: true })}
            >
              {idTitle?.text ?? DEFAULT_ID_TITLE_TEXT}
            </h2>
          </div>
          {isReady ? (
            <div className="w-full space-y-3">
              <ConfiguredUiImage
                image={uiConfig.images?.top}
                fallbackAlt="顶部图片"
              />
              {phoneTopNotice?.text ? (
                <p
                  className="text-center leading-tight"
                  style={createConfiguredTextStyle(phoneTopNotice, { fontSize: '18px', color: '#111827', bold: true })}
                >
                  {phoneTopNotice.text}
                </p>
              ) : null}
            </div>
          ) : null}
          <div
            className={isReady ? 'compact-phone-subtitle mt-2 flex min-h-5 flex-wrap items-baseline justify-center gap-x-1 text-center text-[14px] leading-5 text-[#8A8F98]' : 'h-0 overflow-hidden'}
            data-testid="compact-phone-subtitle"
            aria-hidden={!isReady}
          >
            <span>用于验证</span>
            <span id={sdkControlSlotMap.phone} data-sdk-control-slot="phone" />
            <span>的实名信息</span>
          </div>
          {/* state 槽当前不在正式流程展示；保留 DOM 让 SDK 可注入，视觉上折叠隐藏。 */}
          <div id={sdkControlSlotMap.state} data-sdk-control-slot="state" className="h-0 w-full overflow-hidden" aria-hidden="true" />

          <div
            className={isReady ? 'mt-3 w-full max-w-[300px]' : 'h-0 w-full max-w-[300px] overflow-hidden'}
            aria-hidden={!isReady}
            data-testid="compact-id-last4-shell"
          >
            {isReady ? (
              <IdLast4Block
                value={idLast4}
                inputRef={nativeInputRef}
                showLabel={false}
                useNativeInput={!useCustomKeyboard}
                activeColor={nativeInputFocusColor}
                onChange={onIdLast4Change}
                onNativeFocus={handleNativeInputFocus}
                onNativeBlur={handleNativeInputBlur}
                dismissKeyboardOnComplete={dismissKeyboardOnComplete}
                onCustomInputFocus={onCustomInputFocus}
                useThemeFocusBorder={useDefaultDigitFocusBorder}
                customInputActive={Boolean(useDefaultDigitFocusBorder && showKeyboard && !authorizing)}
              />
            ) : null}
          </div>

          <div className={isReady ? 'mt-3 w-full' : ''}>
            <CompactAgreementNotice
              sdkSubmitActive={sdkSubmitActive}
              isReady={isReady}
              authorizeDisabled={authorizeDisabled}
              authorizing={authorizing}
              onAuthorize={onAuthorize}
              themeColor={themeColor}
              uiConfig={uiConfig}
              customAgreementChecks={customAgreementChecks}
              onToggleCustomAgreement={onToggleCustomAgreement}
              onOpenCustomAgreement={onOpenCustomAgreement}
            />
          </div>

          {isReady && uiConfig.images?.bottom ? (
            <div className="mt-3 w-full">
              <ConfiguredUiImage
                image={uiConfig.images.bottom}
                fallbackAlt="底部图片"
              />
            </div>
          ) : null}

          {/* sms-input / sms-button — authType 0 不用，但 slot 必须挂上让 SDK 找得到 */}
          <div className="h-0 w-full overflow-hidden" aria-hidden="true">
            <div id={sdkControlSlotMap['sms-input']} data-sdk-control-slot="sms-input" />
            <div id={sdkControlSlotMap['sms-button']} data-sdk-control-slot="sms-button" />
          </div>
        </section>

        {useCustomKeyboard ? (
          <div className="shrink-0">
            <SecureKeyboard onInput={appendKey} onDelete={deleteKey} visible={showKeyboard} />
          </div>
        ) : null}

        {bottomImage ? (
          <img
            src={bottomImage.src}
            alt=""
            aria-hidden="true"
            className="block shrink-0"
            style={{ width: bottomImage.width ?? '100%', height: bottomImage.height, objectFit: 'cover' }}
            onLoad={onContentSizeChange}
          />
        ) : null}
      </section>
    </main>
  )
}

export function AuthVerificationWindow() {
  const scene: AuthScene = 'native-number'
  const [state, setState] = useState<AuthDemoState>('default')
  const [idLast4, setIdLast4] = useState('')
  const [customAgreementChecks, setCustomAgreementChecks] = useState<Record<number, boolean>>({})
  const [sdkLoadState, setSdkLoadState] = useState<MobileAuthSdkLoadState>('idle')
  const [sdkMode, setSdkMode] = useState<MobileAuthSdkMode>('mock')
  const [sdkDebugEntry, setSdkDebugEntry] = useState(false)
  const [sdkLoadError, setSdkLoadError] = useState<string | null>(null)
  const [resolvedParams, setResolvedParams] = useState<AuthParamsResolution>({
    status: 'not-ready',
    source: 'mock',
    reason: 'missing-required-field',
  })
  const [controlInitFailed, setControlInitFailed] = useState(false)
  const [controlReady, setControlReady] = useState(false)
  const [sdkErrorKind, setSdkErrorKind] = useState<MobileAuthSdkErrorKind | null>(null)
  const [sdkErrorText, setSdkErrorText] = useState<string | null>(null)
  const [sdkErrorCode, setSdkErrorCode] = useState<string | null>(null)
  const [sdkErrorSteps, setSdkErrorSteps] = useState<readonly string[] | null>(null)
  const [sdkErrorVisible, setSdkErrorVisible] = useState(false)
  const [dataSnapshot, setDataSnapshot] = useState<IdentityFlowSnapshot | null>(null)
  const [dataFlowBusy, setDataFlowBusy] = useState(false)
  const [compactVerifying, setCompactVerifying] = useState(false)
  const [compactKeyboardVisible, setCompactKeyboardVisible] = useState(true)
  const [compactToast, setCompactToast] = useState<{ title: string; icon?: string } | null>(null)
  const [yuanbaoInputError, setYuanbaoInputError] = useState<'incomplete' | null>(null)
  const [yuanbaoAgreementOpen, setYuanbaoAgreementOpen] = useState(false)
  const [formHeaderImg, setFormHeaderImg] = useState<string | undefined>(undefined)
  const [iframeOptions, setIframeOptions] = useState<AssistanceIframeOptions>(() => ({
    ...defaultAssistanceIframeOptions,
  }))
  const authWindowRootRef = useRef<HTMLDivElement | null>(null)
  const contentMeasureRef = useRef<HTMLElement | null>(null)
  const sdkFacadeRef = useRef<MobileAuthSdkFacade | null>(null)
  const idLast4Ref = useRef(idLast4)
  const customAgreementsAllAgreedRef = useRef(true)
  const primaryDisabledRef = useRef(false)
  const dataFlowBusyRef = useRef(false)
  const flowStatusRef = useRef<ReturnType<typeof deriveAuthFlowStatus>>('params-not-ready')
  const hasInitializedControlRef = useRef(false)
  const dataFlowTokenRef = useRef('')
  const dataFlowIdLast4Ref = useRef('')
  const dataFlowRunIdRef = useRef(0)
  const compactToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completionPostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completionGenerationRef = useRef(0)
  const completionPostedRef = useRef(false)
  const presentationReadyPostedRef = useRef(false)
  const phoneReadyCleanupRef = useRef<(() => void) | null>(null)
  const phoneReadyPostedRef = useRef(false)
  const operatorAgreementRetargetCleanupRef = useRef<(() => void) | null>(null)
  const hasPostedMissingSessionRef = useRef(false)
  const lastPostedResizeHeightRef = useRef(0)
  const lastPostedResizeKeyboardFocusedRef = useRef<boolean | null>(null)
  const resizeTimerRef = useRef<number | null>(null)
  const pendingResizeKeyboardFocusedRef = useRef<boolean | undefined>(undefined)
  const nativeKeyboardFocusedRef = useRef(false)
  const beforeLoginNotificationEnabledRef = useRef(false)
  const stateChangeEnabledRef = useRef(false)
  const v23ProviderHandoffActiveRef = useRef(false)
  const [nativeInputFocused, setNativeInputFocused] = useState(false)
  // 最近一次 SDK / 资源加载错误通知 —— 用户关闭弹窗时随 CANCEL 一起带给宿主，
  // 让调用方区分"看到错误后放弃"和"单纯取消"。
  const lastSdkErrorNoticeRef = useRef<{ code?: string; message: string } | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const assistanceAuthSessionId = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return new URLSearchParams(window.location.search).get('assistanceAuthSessionId') ?? ''
  }, [])
  const assistanceAuthParentOrigin = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }

    return parseAssistanceAuthParentOrigin(
      new URLSearchParams(window.location.search).get('assistanceAuthParentOrigin'),
    )
  }, [])
  const launchToken = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return new URLSearchParams(window.location.search).get('launchToken')?.trim() ?? ''
  }, [])
  const shouldWaitForUiConfig = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return new URLSearchParams(window.location.search).get('expectsUiConfig') === '1' && !window.location.pathname.endsWith('/auth')
  }, [])
  const requestedAppId = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }

    return new URLSearchParams(window.location.search).get('appId')
  }, [])
  const requestedLayout = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }

    return new URLSearchParams(window.location.search).get('layout')
  }, [])
  const appProfile = useMemo(
    () => resolveAppProfile(requestedAppId, { layout: requestedLayout }),
    [requestedAppId, requestedLayout],
  )
  const isChinaumsV23 = appProfile?.skin === 'chinaumsSheetV23'
  const isHaikeInline = appProfile?.skin === 'haikeInline'
  const enableZidingyiFeedback = useMemo(
    () => isZidingyiFeedbackProfile(requestedAppId),
    [requestedAppId],
  )
  const enableYuanbaoFeedback = isYuanbaoFeedbackProfile(requestedAppId)

  useLayoutEffect(() => {
    if (!enableYuanbaoFeedback) return
    const root = document.documentElement
    const previous = root.getAttribute('data-assistance-yuanbao-feedback')
    root.setAttribute('data-assistance-yuanbao-feedback', 'true')
    return () => {
      if (previous === null) root.removeAttribute('data-assistance-yuanbao-feedback')
      else root.setAttribute('data-assistance-yuanbao-feedback', previous)
    }
  }, [enableYuanbaoFeedback])

  useEffect(() => {
    if (!enableYuanbaoFeedback) return
    // The official SDK owns the reader and close action. Observe its actual
    // visibility, including ancestor display changes, without rebuilding it.
    const update = () => {
      document.querySelectorAll<HTMLElement>('.ydrz-confirm-iframe .ydrz-confirm-header em').forEach((close) => {
        close.setAttribute('role', 'button')
        close.setAttribute('aria-label', '关闭协议')
        close.tabIndex = 0
      })
      const open = Array.from(document.querySelectorAll('.ydrz-confirm-iframe')).some((reader) => {
        for (let node: Element | null = reader; node; node = node.parentElement) {
          const style = window.getComputedStyle(node)
          if (node.hasAttribute('hidden') || style.display === 'none' || style.visibility === 'hidden') return false
        }
        return true
      })
      setYuanbaoAgreementOpen(open)
    }
    const observer = new MutationObserver(update)
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] })
    update()
    const handleReaderKey = (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement && event.target.matches('.ydrz-confirm-iframe .ydrz-confirm-header em')) {
        event.preventDefault()
        event.target.click()
      }
    }
    document.addEventListener('keydown', handleReaderKey)
    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', handleReaderKey)
    }
  }, [enableYuanbaoFeedback])

  useLayoutEffect(() => {
    if (!isChinaumsV23) {
      return
    }

    const documentRoot = document.documentElement
    const appRoot = document.getElementById('root')
    const previousDocumentFlag = documentRoot.getAttribute('data-assistance-v23-viewport-modal')
    const previousBodyFlag = document.body.getAttribute('data-assistance-v23-viewport-modal')
    const previousAppRootFlag = appRoot?.getAttribute('data-assistance-v23-viewport-modal')
    documentRoot.dataset.assistanceV23ViewportModal = 'true'
    document.body.dataset.assistanceV23ViewportModal = 'true'
    appRoot?.setAttribute('data-assistance-v23-viewport-modal', 'true')

    return () => {
      if (previousDocumentFlag === null) {
        delete documentRoot.dataset.assistanceV23ViewportModal
      } else {
        documentRoot.setAttribute('data-assistance-v23-viewport-modal', previousDocumentFlag)
      }
      if (previousBodyFlag === null) {
        delete document.body.dataset.assistanceV23ViewportModal
      } else {
        document.body.setAttribute('data-assistance-v23-viewport-modal', previousBodyFlag)
      }
      if (appRoot) {
        if (previousAppRootFlag == null) {
          appRoot.removeAttribute('data-assistance-v23-viewport-modal')
        } else {
          appRoot.setAttribute('data-assistance-v23-viewport-modal', previousAppRootFlag)
        }
      }
    }
  }, [isChinaumsV23])
  useLayoutEffect(() => {
    if (!isHaikeInline) {
      return
    }

    const documentRoot = document.documentElement
    const appRoot = document.getElementById('root')
    const previousDocumentFlag = documentRoot.getAttribute('data-assistance-haike-inline')
    const previousBodyFlag = document.body.getAttribute('data-assistance-haike-inline')
    const previousAppRootFlag = appRoot?.getAttribute('data-assistance-haike-inline')
    documentRoot.dataset.assistanceHaikeInline = 'true'
    document.body.dataset.assistanceHaikeInline = 'true'
    appRoot?.setAttribute('data-assistance-haike-inline', 'true')

    return () => {
      if (previousDocumentFlag === null) {
        delete documentRoot.dataset.assistanceHaikeInline
      } else {
        documentRoot.setAttribute('data-assistance-haike-inline', previousDocumentFlag)
      }
      if (previousBodyFlag === null) {
        delete document.body.dataset.assistanceHaikeInline
      } else {
        document.body.setAttribute('data-assistance-haike-inline', previousBodyFlag)
      }
      if (appRoot) {
        if (previousAppRootFlag == null) {
          appRoot.removeAttribute('data-assistance-haike-inline')
        } else {
          appRoot.setAttribute('data-assistance-haike-inline', previousAppRootFlag)
        }
      }
    }
  }, [isHaikeInline])
  const profileUi = useMemo(
    () => normalizeAssistanceUiConfig(appProfile?.ui ?? {}, { warn: warnAssistanceUiConfigToConsole }),
    [appProfile],
  )
  const [uiConfig, setUiConfig] = useState<NormalizedAssistanceMobileAuthUiConfig>(profileUi)
  const [uiConfigReady, setUiConfigReady] = useState(!shouldWaitForUiConfig)

  useEffect(() => {
    if (requestedAppId && !appProfile) {
      console.info(
        `[AssistanceMobileAuth] appId "${requestedAppId}" 未匹配任何 profile，使用默认页面`,
      )
    }
  }, [requestedAppId, appProfile])
  const requestId = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return new URLSearchParams(window.location.search).get('requestId')?.trim() ?? ''
  }, [])
  // 授权页顶部 / 底部自定义图片（弹层模式由 wrapper 经 styleOption 走 postMessage 推来，见样式监听）。
  // 初值仅从 URL 读取，作为 H5 转跳模式 / 旧版打开方的向后兼容兜底；弹层模式 URL 不再带图，靠 postMessage 覆盖。
  const [topImage, setTopImage] = useState<PageImageConfig | null>(() =>
    typeof window === 'undefined'
      ? null
      : parsePageImageParam(new URLSearchParams(window.location.search).get('topImage')),
  )
  const [bottomImage, setBottomImage] = useState<PageImageConfig | null>(() =>
    typeof window === 'undefined'
      ? null
      : parsePageImageParam(new URLSearchParams(window.location.search).get('bottomImage')),
  )
  const completionMode = useMemo<'iframe' | 'redirect'>(() => {
    if (typeof window === 'undefined') {
      return 'iframe'
    }

    return window.location.pathname.endsWith('/auth') ? 'redirect' : 'iframe'
  }, [])

  // 客户 styleOption（由宿主 wrapper 经 postMessage 推进来，已剥函数）。容器模式对外不可用，
  // 样式只能在我方授权页 iframe 内应用，故走 initControl 时合并我方默认（保护协议区 agreeStyle）。
  const customerStyleOptionRef = useRef<MobileAuthSdkStyleOption | null>(null)
  // 调用方自定义协议（由 wrapper 经 style 通道透传，纯 {name, link}）。默认空，Task 6 填充。
  const customerAgreementsRef = useRef<MobileAuthSdkAgreementEntry[]>([])
  // 样式门：等 wrapper 推来的样式到位或超时兜底再放行自动调起，
  // 避免 initControl 早于样式到达而被单次初始化门永久丢弃。
  const [styleSettled, setStyleSettled] = useState(false)

  useEffect(() => {
    // 仅弹层（iframe）模式且有会话标识时才需要等样式：H5 转跳模式无宿主 wrapper，直接放行。
    if (completionMode !== 'iframe' || !assistanceAuthSessionId || typeof window === 'undefined') {
      setStyleSettled(true)
      return
    }

    const dispose = listenForStyleMessage(
      window,
      assistanceAuthSessionId,
      (styleOption, agreements, nextIframeOptions) => {
        customerStyleOptionRef.current = styleOption
        customerAgreementsRef.current = agreements
        setIframeOptions(nextIframeOptions)
        // 顶/底图随 styleOption 经 postMessage 推来（不再走 URL 查询参数，避免触发云 WAF）。
        // 仅在客户确有传入时覆盖，避免抹掉 URL 兜底（H5 转跳模式）的取值。
        const top = normalizePageImage(styleOption?.topImageStyle)
        if (top) {
          setTopImage(top)
        }
        const bottom = normalizePageImage(styleOption?.bottomImageStyle)
        if (bottom) {
          setBottomImage(bottom)
        }
        setStyleSettled(true)
      },
      {
        expectedSource: window.parent,
        onRuntimeConfig: (runtimeConfig) => {
          beforeLoginNotificationEnabledRef.current = runtimeConfig.beforeLoginNotificationEnabled
          stateChangeEnabledRef.current = runtimeConfig.stateChangeEnabled
          setFormHeaderImg(runtimeConfig.formHeaderImg)
        },
      },
    )
    // 超时兜底：旧版 wrapper / 非 wrapper 打开方不会推样式，300ms 后照常放行（退化为默认样式）。
    const timer = window.setTimeout(() => setStyleSettled(true), 300)

    return () => {
      dispose()
      window.clearTimeout(timer)
    }
  }, [assistanceAuthSessionId, completionMode])

  useEffect(() => {
    if (completionMode !== 'redirect' || typeof document === 'undefined') {
      return
    }

    const previousTitle = document.title
    document.title = ''

    return () => {
      document.title = previousTitle
    }
  }, [completionMode])

  const flowStatus = deriveAuthFlowStatus({
    paramsStatus: resolvedParams.status,
    sdkLoadState,
    authState: state,
    controlInitFailed,
    controlReady,
  })
  const needsIdLast4 = scene === 'native-number'
  const idLast4Complete = idLast4.length === ID_LAST4_LENGTH
  const customAgreements = uiConfig.agreements ?? []
  const customAgreementsAllAgreed = customAgreements.every((_, index) => customAgreementChecks[index] === true)

  const authDisabled = shouldDisablePrimaryAction({
    agreementChecked: true,
    flowStatus,
  })
  const primaryDisabled = authDisabled || dataFlowBusy || dataSnapshot !== null || (needsIdLast4 && !idLast4Complete)
  const sdkSubmitDisabled = isChinaumsV23
    ? compactVerifying || dataFlowBusy || dataSnapshot !== null
    : isHaikeInline
      ? compactVerifying || dataFlowBusy || dataSnapshot !== null || !idLast4Complete
      : compactVerifying || dataFlowBusy || dataSnapshot !== null || (needsIdLast4 && !idLast4Complete) || !customAgreementsAllAgreed
  const sdkSubmitActive = sdkLoadState === 'ready' && resolvedParams.status === 'ready'
  const themeColor =
    uiConfig.themeColor ??
    normalizeCssColor(customerStyleOptionRef.current?.submitBtnStyle?.bgColor) ??
    normalizeCssColor(customerStyleOptionRef.current?.checkboxStyle?.checkedColor) ??
    DEFAULT_THEME_COLOR
  const agreementLinkColor =
    uiConfig.themeColor ??
    customerStyleOptionRef.current?.submitBtnStyle?.bgColor ??
    customerStyleOptionRef.current?.checkboxStyle?.checkedColor ??
    '#1677FF'

  function postBridgeMessage(
    type:
      | typeof ASSISTANCE_AUTH_READY
      | typeof ASSISTANCE_AUTH_PRESENTATION_READY
      | typeof ASSISTANCE_AUTH_SUCCESS
      | typeof ASSISTANCE_AUTH_CANCEL
      | typeof ASSISTANCE_AUTH_ERROR
      | typeof ASSISTANCE_AUTH_PHONE_READY
      | typeof ASSISTANCE_AUTH_ERROR_NOTICE
      | typeof ASSISTANCE_AUTH_RESIZE,
    payload?:
      | AssistanceVerificationSuccessPayload
      | RedirectCompletionPayload
      | AssistanceVerificationErrorPayload
      | AssistanceVerificationPhoneReadyPayload
      | AssistanceVerificationErrorNoticePayload
      | AssistanceAuthResizePayload
      | { message?: string; lastError?: { code?: string; message: string } },
  ) {
    window.parent.postMessage(createAssistanceAuthMessage(type, assistanceAuthSessionId, payload), '*')
  }

  function postIdLast4StateChange(type: 'idLast4Complete' | 'idLast4Incomplete') {
    if (
      completionMode !== 'iframe' ||
      !assistanceAuthSessionId ||
      !assistanceAuthParentOrigin
    ) {
      return
    }

    window.parent.postMessage(
      createAssistanceAuthMessage(ASSISTANCE_AUTH_STATE_CHANGE, assistanceAuthSessionId, {
        event: { type },
      }),
      assistanceAuthParentOrigin,
    )
  }

  function clearScheduledAuthWindowResize() {
    if (resizeTimerRef.current !== null) {
      window.clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = null
    }
    pendingResizeKeyboardFocusedRef.current = undefined
  }

  function postAuthWindowResize(keyboardFocused?: boolean) {
    if (
      completionMode !== 'iframe' ||
      !assistanceAuthSessionId ||
      !styleSettled ||
      iframeOptions.heightMode !== 'auto'
    ) {
      return
    }

    const root = contentMeasureRef.current
    if (!root) {
      return
    }

    const rectHeight = root.getBoundingClientRect().height
    const height = Math.ceil(Math.max(rectHeight, root.scrollHeight, root.offsetHeight))
    const keyboardStateChanged =
      keyboardFocused !== undefined && keyboardFocused !== lastPostedResizeKeyboardFocusedRef.current

    if (
      !Number.isFinite(height) ||
      height <= 0 ||
      (height === lastPostedResizeHeightRef.current && !keyboardStateChanged)
    ) {
      return
    }

    lastPostedResizeHeightRef.current = height
    if (keyboardFocused !== undefined) {
      lastPostedResizeKeyboardFocusedRef.current = keyboardFocused
    }
    postBridgeMessage(ASSISTANCE_AUTH_RESIZE, {
      height,
      ...(keyboardFocused !== undefined ? { keyboardFocused } : {}),
    })
  }

  function scheduleAuthWindowResize(keyboardFocused?: boolean) {
    if (keyboardFocused !== undefined) {
      pendingResizeKeyboardFocusedRef.current = keyboardFocused
    }

    if (resizeTimerRef.current !== null) {
      return
    }

    resizeTimerRef.current = window.setTimeout(() => {
      const nextKeyboardFocused = pendingResizeKeyboardFocusedRef.current
      pendingResizeKeyboardFocusedRef.current = undefined
      resizeTimerRef.current = null
      postAuthWindowResize(nextKeyboardFocused)
    }, 0)
  }

  function handleNativeInputFocus() {
    nativeKeyboardFocusedRef.current = true
    setNativeInputFocused(true)
    scheduleAuthWindowResize(true)
  }

  function handleNativeInputBlur() {
    nativeKeyboardFocusedRef.current = false
    setNativeInputFocused(false)
    scheduleAuthWindowResize(false)
  }

  function stopPhoneReadyWatcher() {
    phoneReadyCleanupRef.current?.()
    phoneReadyCleanupRef.current = null
  }

  function stopOperatorAgreementRetargetWatcher() {
    operatorAgreementRetargetCleanupRef.current?.()
    operatorAgreementRetargetCleanupRef.current = null
  }

  function startOperatorAgreementRetargetWatcher() {
    stopOperatorAgreementRetargetWatcher()

    if (typeof document === 'undefined') {
      return
    }

    const agreementSlot = document.getElementById(sdkControlSlotMap.agreement)
    if (!agreementSlot) {
      return
    }

    retargetMobileOperatorAgreementLinks(agreementSlot)
    if (enableYuanbaoFeedback) formatYuanbaoAgreementLinks(agreementSlot)

    if (typeof MutationObserver === 'undefined') {
      return
    }

    const observer = new MutationObserver(() => {
      retargetMobileOperatorAgreementLinks(agreementSlot)
      if (enableYuanbaoFeedback) formatYuanbaoAgreementLinks(agreementSlot)
    })
    observer.observe(agreementSlot, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'data-name', 'href'],
    })

    operatorAgreementRetargetCleanupRef.current = () => observer.disconnect()
  }

  function postPhoneReady(payload: AssistanceVerificationPhoneReadyPayload) {
    if (completionMode !== 'iframe' || !assistanceAuthSessionId || phoneReadyPostedRef.current) {
      return
    }

    phoneReadyPostedRef.current = true
    postBridgeMessage(ASSISTANCE_AUTH_PHONE_READY, payload)
  }

  function startPhoneReadyWatcher() {
    stopPhoneReadyWatcher()

    if (completionMode !== 'iframe' || !assistanceAuthSessionId) {
      return
    }

    const phoneSlot = document.getElementById(sdkControlSlotMap.phone)
    const immediate = extractMaskedMobileText(phoneSlot)
    if (immediate) {
      postPhoneReady(immediate)
      return
    }

    let stopped = false
    const tryPost = () => {
      if (stopped || phoneReadyPostedRef.current) {
        return true
      }

      const next = extractMaskedMobileText(document.getElementById(sdkControlSlotMap.phone))
      if (next) {
        postPhoneReady(next)
        return true
      }

      return false
    }

    const observer = typeof MutationObserver !== 'undefined' && phoneSlot
      ? new MutationObserver(() => {
          if (tryPost()) {
            stopPhoneReadyWatcher()
          }
        })
      : null

    observer?.observe(phoneSlot!, { childList: true, subtree: true, characterData: true })

    const pollTimer = window.setInterval(() => {
      if (tryPost()) {
        stopPhoneReadyWatcher()
      }
    }, PHONE_READY_POLL_INTERVAL_MS)

    const timeoutTimer = window.setTimeout(() => {
      stopPhoneReadyWatcher()
    }, PHONE_READY_TIMEOUT_MS)

    phoneReadyCleanupRef.current = () => {
      stopped = true
      observer?.disconnect()
      window.clearInterval(pollTimer)
      window.clearTimeout(timeoutTimer)
    }
  }

  function showInlineVerificationError(message: string, code = 'VERIFICATION_FAILED') {
    clearCompactToast()
    setCompactVerifying(false)
    setCompactKeyboardVisible(false)
    setControlReady(false)
    setSdkErrorKind('sdk-init-failed')
    setSdkErrorText(message)
    setSdkErrorCode(code)
    setSdkErrorSteps(null)
    setSdkErrorVisible(true)
    setSdkLoadState('error')
  }

  function postVerificationError(message: string, code = 'VERIFICATION_FAILED') {
    if (completionPostedRef.current) {
      return
    }

    stopPhoneReadyWatcher()
    clearCompactToast()

    if (completionMode === 'redirect') {
      completionPostedRef.current = true
      showInlineVerificationError(message, code)
      return
    }

    completionPostedRef.current = true
    postBridgeMessage(ASSISTANCE_AUTH_ERROR, { code, message })
  }

  function postPresentationReady() {
    if (
      !(enableZidingyiFeedback || enableYuanbaoFeedback) ||
      presentationReadyPostedRef.current ||
      completionPostedRef.current ||
      completionMode !== 'iframe' ||
      !assistanceAuthSessionId
    ) {
      return
    }

    presentationReadyPostedRef.current = true
    postBridgeMessage(ASSISTANCE_AUTH_PRESENTATION_READY)
  }

  // 实时非终态错误通知：SDK / 资源加载报错时立即把错误码同步给宿主（wrapper onErrorNotice），
  // 但不发终态 ASSISTANCE_AUTH_ERROR —— 弹窗保持打开，用户仍可读提示后重试或手动关闭。
  function postSdkErrorNotice(
    phase: 'resourceLoad' | 'showAuthPage' | 'initControl',
    raw: { code?: string; desc?: string; carrier?: string },
    fallbackUiText: string,
  ) {
    // ALL_CARRIERS_FAILED 的 desc 是内部聚合调试串（YD:code/desc | CT:… ），
    // 对外统一用映射后的友好文案，与窗内 SdkErrorPanel 展示一致。
    const message =
      raw.code === 'ALL_CARRIERS_FAILED'
        ? fallbackUiText
        : (raw.desc && raw.desc.trim()) || fallbackUiText
    const notice: AssistanceVerificationErrorNoticePayload = {
      code: raw.code || undefined,
      message,
      phase,
      // 'unknown' 是 extractSdkErrorPayload 的内部哨兵值，不外泄给调用方。
      carrier: raw.carrier && raw.carrier !== 'unknown' ? raw.carrier : undefined,
    }
    lastSdkErrorNoticeRef.current = { code: notice.code, message: notice.message }

    if (completionMode !== 'iframe' || !assistanceAuthSessionId) {
      return
    }

    if ((enableZidingyiFeedback || enableYuanbaoFeedback) && !presentationReadyPostedRef.current) {
      postVerificationError(message, notice.code ?? `${phase.toUpperCase()}_FAILED`)
      return
    }

    postBridgeMessage(ASSISTANCE_AUTH_ERROR_NOTICE, notice)
  }

  function toggleCustomAgreement(index: number) {
    setCustomAgreementChecks((previous) => ({
      ...previous,
      [index]: !previous[index],
    }))
  }

  function openCustomAgreement(url: string) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) {
      console.warn(`[AssistanceMobileAuth] Browser blocked opening custom agreement URL: ${url}`)
    }
  }

  function invalidatePendingCompletion() {
    stopPhoneReadyWatcher()
    stopOperatorAgreementRetargetWatcher()
    completionGenerationRef.current += 1
    if (completionPostTimerRef.current) {
      clearTimeout(completionPostTimerRef.current)
      completionPostTimerRef.current = null
    }
  }

  function resetDataLane() {
    invalidatePendingCompletion()
    dataFlowRunIdRef.current += 1
    dataFlowTokenRef.current = ''
    dataFlowIdLast4Ref.current = ''
    completionPostedRef.current = false
    hasPostedMissingSessionRef.current = false
    setDataFlowBusy(false)
    setDataSnapshot(null)
  }

  async function runDataLane(token: string, idLast4Value: string, encryptPublicKey: string) {
    const runId = dataFlowRunIdRef.current + 1
    dataFlowRunIdRef.current = runId
    dataFlowTokenRef.current = token.trim()
    dataFlowIdLast4Ref.current = idLast4Value.trim().toUpperCase()
    setDataFlowBusy(true)

    const applySnapshot = (snapshot: IdentityFlowSnapshot) => {
      if (dataFlowRunIdRef.current !== runId) {
        return
      }

      setDataSnapshot(snapshot)
    }

    try {
      if (STATIC_RESOURCE_RELEASE) {
        postVerificationError('静态资源包不包含身份信息查询服务。', 'STATIC_RELEASE_NO_API')
        return
      }

      const integration = await loadAuthVerificationIntegration()
      const service = integration.createIdentityFlowRunner()
      const finalSnapshot = await service.run({
        token: dataFlowTokenRef.current,
        idLast4: dataFlowIdLast4Ref.current,
        encryptPublicKey,
        onTransition: applySnapshot,
      })
      applySnapshot(finalSnapshot)
    } finally {
      if (dataFlowRunIdRef.current === runId) {
        setDataFlowBusy(false)
      }
    }
  }

  useEffect(() => {
    if (!assistanceAuthSessionId || completionMode !== 'iframe') {
      return
    }

    postBridgeMessage(ASSISTANCE_AUTH_READY)
  }, [assistanceAuthSessionId, completionMode])

  useEffect(() => {
    if (!shouldWaitForUiConfig || completionMode !== 'iframe') {
      setUiConfigReady(true)
      return
    }

    let settled = false
    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return
      }

      settled = true
      console.warn('[AssistanceMobileAuth] UI config was expected but not received; using defaults.')
      setUiConfig(profileUi)
      setCustomAgreementChecks({})
      setUiConfigReady(true)
    }, UI_CONFIG_WAIT_TIMEOUT_MS)

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) {
        return
      }

      if (!isAssistanceAuthMessage(event.data, assistanceAuthSessionId) || event.data.type !== ASSISTANCE_AUTH_CONFIG) {
        return
      }

      if (settled || hasInitializedControlRef.current) {
        console.warn('[AssistanceMobileAuth] Ignored late UI config message.')
        return
      }

      settled = true
      window.clearTimeout(timeoutId)
      const rawPayload = event.data.payload
      const rawUi = typeof rawPayload === 'object' && rawPayload !== null && 'ui' in rawPayload
        ? (rawPayload as { ui?: unknown }).ui
        : undefined
      setCustomAgreementChecks({})
      setUiConfig(
        mergeAssistanceUiConfigs(
          profileUi,
          normalizeAssistanceUiConfig(rawUi, { warn: warnAssistanceUiConfigToConsole }),
        ),
      )
      setUiConfigReady(true)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      settled = true
      window.clearTimeout(timeoutId)
      window.removeEventListener('message', handleMessage)
    }
  }, [assistanceAuthSessionId, completionMode, shouldWaitForUiConfig, profileUi])

  useEffect(() => {
    if (
      completionMode !== 'iframe' ||
      !assistanceAuthSessionId ||
      !styleSettled ||
      iframeOptions.heightMode !== 'auto'
    ) {
      lastPostedResizeHeightRef.current = 0
      lastPostedResizeKeyboardFocusedRef.current = null
      clearScheduledAuthWindowResize()
      return
    }

    const root = contentMeasureRef.current
    if (!root) {
      return
    }

    let stopped = false
    const scheduleResize = () => {
      if (stopped) {
        return
      }

      scheduleAuthWindowResize()
    }

    scheduleResize()

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleResize) : null
    resizeObserver?.observe(root)

    const mutationObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver(scheduleResize) : null
    mutationObserver?.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    })

    window.addEventListener('resize', scheduleResize)

    return () => {
      stopped = true
      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
      window.removeEventListener('resize', scheduleResize)
    }
  }, [
    assistanceAuthSessionId,
    bottomImage,
    compactKeyboardVisible,
    completionMode,
    controlReady,
    iframeOptions.heightMode,
    iframeOptions.useCustomKeyboard,
    sdkErrorVisible,
    sdkLoadState,
    styleSettled,
    topImage,
  ])

  useEffect(() => {
    if (
      !nativeInputFocused ||
      completionMode !== 'iframe' ||
      !assistanceAuthSessionId ||
      iframeOptions.heightMode !== 'auto'
    ) {
      return
    }

    const scheduleFocusedResize = () => scheduleAuthWindowResize(true)
    const viewport = window.visualViewport

    scheduleFocusedResize()
    window.addEventListener('resize', scheduleFocusedResize)
    viewport?.addEventListener('resize', scheduleFocusedResize)
    viewport?.addEventListener('scroll', scheduleFocusedResize)

    return () => {
      window.removeEventListener('resize', scheduleFocusedResize)
      viewport?.removeEventListener('resize', scheduleFocusedResize)
      viewport?.removeEventListener('scroll', scheduleFocusedResize)
    }
  }, [assistanceAuthSessionId, completionMode, iframeOptions.heightMode, nativeInputFocused])

  useEffect(() => {
    if (!dataSnapshot || completionPostedRef.current) {
      return
    }

    if (dataSnapshot.status === 'complete' && dataSnapshot.identity) {
      // 不再弹"授权成功"toast，验证成功后直接进入下一步（postMessage 关闭 iframe / redirect 跳转）。
      completionPostedRef.current = true
      const completionGeneration = completionGenerationRef.current
      const identity = dataSnapshot.identity

      if (!launchToken) {
        const payload: RedirectCompletionPayload = {
          status: 'success',
          message: dataSnapshot.description,
          authResultId: 'local_mock_result',
          authCode: 'local_mock_code',
          authToken: 'local_mock_auth_token',
          mock: true,
        }
        completionPostTimerRef.current = setTimeout(() => {
          if (completionGeneration !== completionGenerationRef.current) {
            return
          }

          postBridgeMessage(ASSISTANCE_AUTH_SUCCESS, payload)
        }, SUCCESS_HANDOFF_DELAY_MS)
        return
      }

      if (STATIC_RESOURCE_RELEASE) {
        completionPostedRef.current = false
        postVerificationError('静态资源包不包含 H5 回跳会话服务。', 'STATIC_RELEASE_NO_REDIRECT')
        return
      }

      void loadAuthVerificationIntegration()
        .then((integration) => integration.completeSdkLaunchSession({
          launchToken,
          message: dataSnapshot.description,
          identity: {
            displayName: identity.displayName,
            maskedMobile: identity.maskedMobile,
            maskedIdCard: identity.maskedIdCard,
          },
        }))
        .then((completion) => {
          if (completionGeneration !== completionGenerationRef.current) {
            return
          }

          const payload: RedirectCompletionPayload = {
            status: 'success',
            message: completion.message,
            authResultId: completion.authResultId,
            authCode: completion.authCode,
            authToken: completion.authToken,
            mock: true,
          }
          completionPostTimerRef.current = setTimeout(() => {
            if (completionGeneration !== completionGenerationRef.current) {
              return
            }

            if (completionMode === 'redirect') {
              if (completion.redirectUrl) {
                window.location.replace(completion.redirectUrl)
                return
              }

              completionPostedRef.current = false
              postVerificationError('认证完成后缺少回跳地址，请重新发起。', 'REDIRECT_URL_MISSING')
              return
            }

            postBridgeMessage(ASSISTANCE_AUTH_SUCCESS, payload)
          }, SUCCESS_HANDOFF_DELAY_MS)
        })
        .catch((error: unknown) => {
          if (completionGeneration !== completionGenerationRef.current) {
            return
          }

          completionPostedRef.current = false
          postVerificationError(error instanceof Error ? error.message : String(error), 'SESSION_COMPLETE_FAILED')
        })
      return
    }

    if (dataSnapshot.status === 'fetch-pending') {
      postVerificationError(dataSnapshot.description, 'RESULT_PENDING')
      return
    }

    if (dataSnapshot.status === 'token-missing' || dataSnapshot.status === 'verify-failed' || dataSnapshot.status === 'fetch-failed') {
      postVerificationError(dataSnapshot.description)
    }
  }, [dataSnapshot, completionMode, launchToken])

  useEffect(() => {
    idLast4Ref.current = idLast4
  }, [idLast4])

  useEffect(() => {
    customAgreementsAllAgreedRef.current = customAgreementsAllAgreed
  }, [customAgreementsAllAgreed])

  useEffect(() => {
    primaryDisabledRef.current = primaryDisabled
  }, [primaryDisabled])

  useEffect(() => {
    dataFlowBusyRef.current = dataFlowBusy
  }, [dataFlowBusy])

  useEffect(() => {
    flowStatusRef.current = flowStatus
  }, [flowStatus])

  useEffect(() => {
    return () => {
      if (compactToastTimerRef.current) {
        clearTimeout(compactToastTimerRef.current)
      }

      invalidatePendingCompletion()
      v23ProviderHandoffActiveRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!uiConfigReady) {
      return
    }

    if (completionMode === 'redirect' && !launchToken) {
      showInlineVerificationError('验证会话已失效，请重新发起。', 'SESSION_MISSING')
      return
    }

    const config = getMobileAuthResourceConfig()
    const paramsProvider = createAuthParamsProvider({ config })
    let cancelled = false

    if (completionMode === 'redirect' && launchToken) {
      setResolvedParams({
        status: 'not-ready',
        source: 'manual',
        reason: 'missing-required-field',
      })
      if (STATIC_RESOURCE_RELEASE) {
        showInlineVerificationError('静态资源包不包含 H5 授权会话服务。', 'STATIC_RELEASE_NO_REDIRECT')
        return
      }

      void loadAuthVerificationIntegration()
        .then((integration) => integration.resolveSdkLaunchSession(launchToken))
        .then((session) => {
          if (cancelled) {
            return
          }

          const resolution = paramsProvider.resolve({ overrides: session.params, forceFrontend: true })
          setResolvedParams(resolution)

          if (resolution.status !== 'ready') {
            postVerificationError('移动 JSSDK 参数校验未通过，请重新发起验证。', 'SESSION_PARAMS_INVALID')
          }
        })
        .catch((error: unknown) => {
          if (cancelled) {
            return
          }

          const message = error instanceof Error ? error.message : String(error)
          setResolvedParams({
            status: 'not-ready',
            source: 'manual',
            reason: 'missing-required-field',
          })
          postVerificationError(message || 'JSSDK 验证会话已失效，请重新发起。', 'SESSION_RESOLVE_FAILED')
        })
    } else {
      setResolvedParams(paramsProvider.resolve())
    }
    setSdkMode(config.mode)
    setSdkDebugEntry(config.debugEntry)
    setSdkLoadError(null)
    setSdkLoadState(config.enabled ? 'loading' : 'disabled')
    setControlReady(false)
    setSdkErrorKind(null)
    setSdkErrorText(null)
    setSdkErrorCode(null)
    setSdkErrorSteps(null)
    setSdkErrorVisible(false)
    setCustomAgreementChecks({})
    lastSdkErrorNoticeRef.current = null
    resetDataLane()

    void loadMobileAuthSdkResources(config)
      .then((result) => {
        if (cancelled) {
          return
        }

        setSdkLoadState(result.state)
        setSdkLoadError(result.error?.message ?? null)

        if (result.state === 'ready' && sdkFacadeRef.current == null) {
          sdkFacadeRef.current = createMobileAuthSdkFacade()
        }

        if (result.state === 'error') {
          let sentinelKey: string
          switch (result.reason) {
            case 'network-timeout':
              sentinelKey = 'NETWORK_TIMEOUT'
              break
            case 'spa-html-fallback':
              sentinelKey = 'SPA_HTML_FALLBACK'
              break
            case 'sdk-disabled':
              sentinelKey = 'SDK_DISABLED'
              break
            default:
              sentinelKey = 'CDN_BLOCKED'
          }
          const mapped = lookupSdkError(sentinelKey)
          setSdkErrorKind(mapped.errorKind)
          setSdkErrorText(mapped.uiText)
          setSdkErrorCode(null)
          setSdkErrorSteps(mapped.steps ?? null)
          setSdkErrorVisible(result.reason === 'network-timeout')
          postSdkErrorNotice('resourceLoad', { code: sentinelKey }, mapped.uiText)
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        setSdkLoadState('error')
        setSdkLoadError(error instanceof Error ? error.message : String(error))
        setSdkErrorVisible(false)
        postSdkErrorNotice(
          'resourceLoad',
          { code: 'SDK_LOAD_FAILED', desc: error instanceof Error ? error.message : String(error) },
          '授权服务资源加载失败',
        )
      })

    return () => {
      cancelled = true
      hasInitializedControlRef.current = false
      sdkFacadeRef.current?.clearControl()
    }
  }, [completionMode, launchToken, reloadTick, uiConfigReady])

  useEffect(() => {
    // SDK 自己管 button 的初始 loading→ready 切换（carrier query 完成后自动切走 "安全保障中" 默认状态）。
    // 我们只在 controlReady 之后联动 disabled/loading：
    //   - disabled 由 idLast4 / 当前提交状态驱动（协议已由移动 SDK 勾选框自动同意，无 React 勾选框）
    //   - loading 仅由 compactVerifying（点提交后）或 dataFlowBusy（后端身份核验进行中）驱动
    // 不要把 flowStatus === 'submitting' 拉进来 — 那个状态在 handlePrimaryAction 自动 fire 后就为 true，
    // 会把 SDK 已经清掉的 loading 状态又强制设回去，导致按钮永远转圈（pre-Phase-10 的 bug，Phase 10
    // 的 controlReady gate 反而把它"激活"了，所以表现出来）。
    if (!controlReady) {
      return
    }

    sdkFacadeRef.current?.updateSubmitBtnStatus({
      disabled: sdkSubmitDisabled,
      loading: compactVerifying || dataFlowBusy,
    })
  }, [compactVerifying, controlReady, dataFlowBusy, sdkSubmitDisabled])

  useEffect(() => {
    if (sdkLoadState !== 'ready' || resolvedParams.status !== 'ready' || hasInitializedControlRef.current) {
      return
    }

    // 样式门未放行前不自动调起：确保客户 styleOption 在 initControl 前就位。
    if (!styleSettled) {
      return
    }

    handlePrimaryAction()
  }, [resolvedParams, sdkLoadState, styleSettled])

  function closeVerificationWindow() {
    invalidatePendingCompletion()
    v23ProviderHandoffActiveRef.current = false
    clearCompactToast()
    setCompactVerifying(false)
    setCompactKeyboardVisible(true)
    completionPostedRef.current = true
    if (completionMode === 'redirect') {
      return
    }

    // 带上最近一次 SDK 错误通知，让调用方区分"看到错误后放弃"和"单纯取消"。
    // 没有错误时不带 lastError 键，保持与旧 payload 形状完全一致。
    postBridgeMessage(ASSISTANCE_AUTH_CANCEL, {
      message: '用户取消验证',
      ...(lastSdkErrorNoticeRef.current ? { lastError: lastSdkErrorNoticeRef.current } : {}),
    })
  }

  function handleSdkRetry() {
    invalidatePendingCompletion()
    v23ProviderHandoffActiveRef.current = false
    // 清掉旧 <script>/<link> + module 缓存，确保下一次 load 真发请求（wifi/CDN 失败时旧标签是 pending/error）。
    resetMobileAuthSdkLoader()
    sdkFacadeRef.current?.clearControl()
    sdkFacadeRef.current = null
    hasInitializedControlRef.current = false
    setSdkErrorKind(null)
    setSdkErrorText(null)
    setSdkErrorCode(null)
    setSdkErrorSteps(null)
    setSdkErrorVisible(false)
    lastSdkErrorNoticeRef.current = null
    setSdkLoadState('idle')
    setSdkLoadError(null)
    setControlReady(false)
    setControlInitFailed(false)
    setReloadTick((tick) => tick + 1)
  }

  function clearCompactToastTimer() {
    if (compactToastTimerRef.current) {
      clearTimeout(compactToastTimerRef.current)
      compactToastTimerRef.current = null
    }
  }

  function clearCompactToast() {
    clearCompactToastTimer()
    setCompactToast(null)
  }

  function showPersistentToast(nextToast: { title: string; icon?: string }) {
    clearCompactToastTimer()
    setCompactToast(nextToast)
  }

  function showTemporaryToast(nextToast: { title: string; icon?: string }) {
    clearCompactToastTimer()
    setCompactToast(nextToast)
    compactToastTimerRef.current = setTimeout(() => {
      setCompactToast(null)
      compactToastTimerRef.current = null
    }, MOCK_TOAST_DURATION_MS)
  }

  function handleCompactIdLast4Change(nextValue: string) {
    if (compactVerifying) {
      return
    }

    const normalizedValue = normalizeIdLast4Input(nextValue)
    const previousLength = idLast4Ref.current.length
    const nextLength = normalizedValue.length

    clearCompactToast()
    idLast4Ref.current = normalizedValue
    setIdLast4(normalizedValue)
    if (!appProfile && nextLength === ID_LAST4_LENGTH) setCompactKeyboardVisible(false)
    if (enableYuanbaoFeedback && nextLength === ID_LAST4_LENGTH) setYuanbaoInputError(null)

    if (
      previousLength < ID_LAST4_LENGTH &&
      nextLength === ID_LAST4_LENGTH &&
      (beforeLoginNotificationEnabledRef.current || stateChangeEnabledRef.current)
    ) {
      postIdLast4StateChange('idLast4Complete')
      return
    }

    if (
      previousLength === ID_LAST4_LENGTH &&
      nextLength < ID_LAST4_LENGTH &&
      stateChangeEnabledRef.current
    ) {
      postIdLast4StateChange('idLast4Incomplete')
    }
  }

  function handleCompactAuthorize() {
    if (compactVerifying) {
      return
    }

    if (idLast4Ref.current.length !== ID_LAST4_LENGTH || !customAgreementsAllAgreedRef.current) {
      return
    }

    setCompactKeyboardVisible(false)
    setCompactVerifying(true)
    showPersistentToast({ title: '验证中', icon: 'loading' })
    handlePrimaryAction()
  }

  function handlePrimaryAction() {
    if (completionMode === 'iframe' && !assistanceAuthSessionId && !hasPostedMissingSessionRef.current) {
      hasPostedMissingSessionRef.current = true
      window.parent.postMessage(
        createAssistanceAuthMessage(ASSISTANCE_AUTH_ERROR, '', {
          code: 'SESSION_MISSING',
          message: '验证会话已失效，请重新发起。',
        }),
        '*',
      )
      return
    }

    if (completionMode === 'redirect' && !launchToken) {
      showInlineVerificationError('验证会话已失效，请重新发起。', 'SESSION_MISSING')
      return
    }

    if (sdkLoadState === 'disabled' || sdkLoadState === 'error') {
      if (completionMode === 'redirect') {
        showInlineVerificationError('授权服务暂不可用，请稍后重试。', 'SDK_UNAVAILABLE')
        return
      }

      postVerificationError('授权服务暂不可用，请稍后重试。', 'SDK_UNAVAILABLE')
      return
    }

    if (sdkLoadState !== 'ready') {
      setCompactVerifying(false)
      clearCompactToast()
      return
    }

    if (resolvedParams.status !== 'ready' || !resolvedParams.data) {
      setCompactVerifying(false)
      clearCompactToast()
      return
    }

    const facade = sdkFacadeRef.current

    if (!facade) {
      setControlInitFailed(true)
      setState('failure')
      clearCompactToast()
      return
    }

    resetDataLane()
    setControlInitFailed(false)
    setState('loading')
    hasInitializedControlRef.current = true

    facade.showAuthPage({
      data: resolvedParams.data,
      success: (payload) => {
        if (String(payload.code ?? '') !== SUCCESS_CODE) {
          const mappedState = mapSdkOutcomeToScenarioState(payload)

          // SDK 以 success 回调返回了非成功结果码 —— 同样实时通知宿主。
          // 注意用 mappedState 而非裸 code 判断：'200' 在 SUCCESS_CODES 里也算成功，不能误报。
          if (mappedState !== 'success') {
            const { code, desc, carrier } = extractSdkErrorPayload(payload)
            postSdkErrorNotice('showAuthPage', { code, desc, carrier }, lookupSdkError(code).uiText)
          }
          setState(mappedState)
          return
        }

        phoneReadyPostedRef.current = false
        startOperatorAgreementRetargetWatcher()
        const customerStyleOption = customerStyleOptionRef.current
        const profileSubmitName =
          appProfile?.skin === 'chinaumsSheet'
            ? '同意并授权'
            : appProfile?.skin === 'chinaumsSheetV23'
              ? '同意并登录'
              : appProfile?.skin === 'haikeInline'
                ? '确认立即保障'
                : null
        const styleOption = uiConfig.themeColor || profileSubmitName || enableYuanbaoFeedback
          ? {
              ...customerStyleOption,
              ...(isChinaumsV23
                ? {
                    phoneStyle: {
                      ...customerStyleOption?.phoneStyle,
                      width: 'auto',
                      bgColor: 'transparent',
                      borderRadius: '0',
                      fontColor: '#3E424B',
                      fontSize: '13px',
                      textAlign: 'center',
                    },
                  }
                : isHaikeInline
                  ? {
                      phoneStyle: {
                        ...customerStyleOption?.phoneStyle,
                        width: 'auto',
                        bgColor: 'transparent',
                        borderRadius: '0',
                        fontColor: '#FF633F',
                        fontSize: '14px',
                        textAlign: 'center',
                      },
                    }
                  : {}),
              submitBtnStyle: {
                ...customerStyleOption?.submitBtnStyle,
                ...(uiConfig.themeColor ? { bgColor: uiConfig.themeColor } : {}),
                ...(profileSubmitName ? { name: profileSubmitName } : {}),
              },
              ...(enableYuanbaoFeedback ? {
                authTextStyle: { ...customerStyleOption?.authTextStyle, fontColor: '#848AB4', bgColor: 'transparent' },
                stateStyle: {
                  ...customerStyleOption?.stateStyle,
                  fontColor: '#848AB4',
                  authTextStyle: {
                    ...(customerStyleOption?.stateStyle?.authTextStyle as Record<string, unknown> | undefined),
                    fontColor: '#848AB4',
                    bgColor: 'transparent',
                  },
                },
                localTipStyle: { ...customerStyleOption?.localTipStyle, fontColor: '#848AB4' },
                unlocalTipStyle: { ...customerStyleOption?.unlocalTipStyle, fontColor: '#848AB4' },
              } : {}),
              ...(uiConfig.themeColor
                ? {
                    checkboxStyle: {
                      ...customerStyleOption?.checkboxStyle,
                      checkedColor: uiConfig.themeColor,
                    },
                  }
                : {}),
            }
          : customerStyleOption
        facade.initControl({
          // 合并客户 styleOption（仅非协议分组生效）与我方默认；协议区 agreeStyle 永远用我方默认：
          // agreeArr 追加一级入口"《用户信息授权协议》"；
          // childArr 放四个本方内置协议 + 调用方自定义协议。
          styleOption: mergeCustomerStyleOption(styleOption, {
            textAlign: 'left',
            width: '100%',
            fontSize: isChinaumsV23 ? '11.5px' : '13px',
            fontColor: enableZidingyiFeedback
              ? '#333333'
              : isChinaumsV23
                ? '#848AB4'
                : '#475569',
            hrefColor: enableZidingyiFeedback
              ? '#333333'
              : isChinaumsV23
                ? '#848AB4'
                : agreementLinkColor,
            CMText: '《移动认证安全基座服务条款》',
            agreeArr: buildUserServiceAgreeArr(requestedAppId),
            childArr: buildUserServiceChildArr({
              appId: requestedAppId,
              callerAgreements: customerAgreementsRef.current,
              preserveReservedCallerAgreement: isHaikeInline || enableYuanbaoFeedback,
            }),
          }),
          beforeSubmit: () => {
            if (
              completionPostedRef.current ||
              dataFlowBusyRef.current ||
              (completionMode === 'iframe' && !assistanceAuthSessionId) ||
              (isChinaumsV23 && v23ProviderHandoffActiveRef.current)
            ) {
              return false
            }

            // SDK 内置协议默认同意；调用方追加的协议仍由 React 勾选状态严格校验。
            const idOk = idLast4Ref.current.length === ID_LAST4_LENGTH
            const restoreYuanbaoRejectedSubmit = () => {
              if (!enableYuanbaoFeedback) return
              // Official 1.0.6 enters loading before beforeSubmit and leaves
              // it set on false. React state may already be false, so restore
              // the provider-owned label/lock on every local rejection.
              try {
                sdkFacadeRef.current?.updateSubmitBtnStatus({ disabled: false, loading: false })
              } catch (error) {
                // Never let a provider UI failure escape the false-return contract.
                console.warn('[AuthVerificationWindow] restore rejected submit failed', error)
              }
            }

            if (!idOk) {
              setCompactKeyboardVisible(true)
              setCompactVerifying(false)
              if (enableYuanbaoFeedback) {
                setYuanbaoInputError('incomplete')
                restoreYuanbaoRejectedSubmit()
              }
              else showTemporaryToast({
                title: isChinaumsV23 ? '请完整输入身份证后4位数字' : '请输入后四位',
                icon: '!',
              })
              return false
            }

            if (!customAgreementsAllAgreedRef.current) {
              setCompactKeyboardVisible(true)
              setCompactVerifying(false)
              showTemporaryToast({ title: '请先同意全部协议', icon: '!' })
              restoreYuanbaoRejectedSubmit()
              return false
            }

            if (isChinaumsV23) {
              v23ProviderHandoffActiveRef.current = true
            } else {
              setCompactKeyboardVisible(false)
            }

            setCompactVerifying(true)
            showPersistentToast({ title: '验证中', icon: 'loading' })
            return true
          },
          authReady: (payload) => {
            console.info('[AuthVerificationWindow] initControl.authReady', payload)
            setControlInitFailed(false)
            setControlReady(true)
            if (enableYuanbaoFeedback) setCompactKeyboardVisible(true)
            postPresentationReady()
            // 把 React UI state 从 'loading'（handlePrimaryAction 设的）切回 'default'。
            // 否则 deriveAuthFlowStatus 会一直把 'loading' 映射成 'submitting'，
            // shouldDisablePrimaryAction 看见 'submitting' → 永远返回 true → 按钮永远灰。
            // (Mock demo 时代 'loading' 表示"模拟在处理"，真 SDK 接入后这个语义不再合适。)
            setState('default')
            startOperatorAgreementRetargetWatcher()
            startPhoneReadyWatcher()
            // 不调 updateSubmitBtnStatus / 不监听 SDK 自带 checkbox — 都由 React 端管。
            void payload
          },
          success: (nextPayload) => {
            const mappedState = mapSdkOutcomeToScenarioState(nextPayload)

            if (mappedState !== 'success') {
              // SDK 以 success 回调返回了非成功结果码 —— 同样实时通知宿主。
              const { code, desc, carrier } = extractSdkErrorPayload(nextPayload)
              stopPhoneReadyWatcher()
              if (isChinaumsV23 && v23ProviderHandoffActiveRef.current) {
                v23ProviderHandoffActiveRef.current = false
                const mapped = lookupSdkError(code)
                postSdkErrorNotice('initControl', { code, desc, carrier }, mapped.uiText)
                postVerificationError(mapped.uiText, code || 'PROVIDER_VERIFY_FAILED')
                return
              }
              postSdkErrorNotice('initControl', { code, desc, carrier }, lookupSdkError(code).uiText)
              setControlInitFailed(false)
              setState(mappedState)
              setCompactVerifying(false)
              clearCompactToast()
              return
            }

            if (idLast4Ref.current.length !== ID_LAST4_LENGTH) {
              setControlInitFailed(false)
              setState('default')
              setCompactVerifying(false)
              setCompactKeyboardVisible(true)
              showTemporaryToast({ title: '请输入后四位', icon: '!' })
              return
            }

            setControlInitFailed(false)
            setState('default')
            setCompactVerifying(false)
            v23ProviderHandoffActiveRef.current = false
            const token = typeof nextPayload.token === 'string' ? nextPayload.token.trim() : ''
            const idLast4 = idLast4Ref.current
            const keyA = typeof nextPayload.encryptPublicKey === 'string' ? nextPayload.encryptPublicKey.trim() : ''

            if (completionMode === 'iframe') {
              if (!token) {
                postVerificationError('本次授权未返回有效 token，请重新授权后再试。', 'TOKEN_MISSING')
                return
              }
              if (!keyA) {
                postVerificationError('本次授权未返回 keyA，请重新授权后再试。', 'KEY_A_MISSING')
                return
              }

              completionPostedRef.current = true
              stopPhoneReadyWatcher()
              clearCompactToast()
              postBridgeMessage(ASSISTANCE_AUTH_SUCCESS, {
                status: 'success',
                token,
                idLast4,
                keyA,
                requestId: requestId || undefined,
                message: '验证完成',
              })
              return
            }

            void runDataLane(token, idLast4, keyA)
          },
          error: (nextPayload) => {
            const { code, desc, carrier } = extractSdkErrorPayload(nextPayload)
            console.error('[AuthVerificationWindow] initControl.error', nextPayload, { code, desc, carrier })
            const mapped = lookupSdkError(code)
            const mappedState = mapSdkOutcomeToScenarioState(nextPayload)
            stopPhoneReadyWatcher()
            if (isChinaumsV23 && v23ProviderHandoffActiveRef.current) {
              v23ProviderHandoffActiveRef.current = false
              postSdkErrorNotice('initControl', { code, desc, carrier }, mapped.uiText)
              postVerificationError(mapped.uiText, code || 'PROVIDER_VERIFY_FAILED')
              return
            }
            setCompactVerifying(false)
            setCompactKeyboardVisible(false)
            clearCompactToast()
            setControlInitFailed(mappedState === 'failure')
            setControlReady(false)
            hasInitializedControlRef.current = false
            setSdkErrorKind(mapped.errorKind)
            setSdkErrorText(mapped.uiText)
            setSdkErrorCode(code || null)
            setSdkErrorSteps(mapped.steps ?? null)
            setSdkErrorVisible(true)
            setState(mappedState)
            // SDK error callbacks still stay in iframe (SdkErrorPanel renders the message inline):
            // terminal ASSISTANCE_AUTH_ERROR remains suppressed because the host wrapper auto-closes
            // on it (index.ts onError → finish → closeFrameWithAnimation), which would hide the hint.
            // NEW: a non-terminal ASSISTANCE_AUTH_ERROR_NOTICE is posted real-time below, so the
            // caller sees the SDK error code immediately while the iframe stays open for retry.
            // Final close remains user-driven (X button → ASSISTANCE_AUTH_CANCEL with lastError).
            postSdkErrorNotice('initControl', { code, desc, carrier }, mapped.uiText)
          },
        })
      },
      error: (payload) => {
        const { code, desc, carrier } = extractSdkErrorPayload(payload)
        console.error('[AuthVerificationWindow] showAuthPage.error', payload, { code, desc, carrier })
        const mapped = lookupSdkError(code)
        const mappedState = mapSdkOutcomeToScenarioState(payload)
        stopPhoneReadyWatcher()
        setCompactVerifying(false)
        setCompactKeyboardVisible(false)
        setSdkErrorKind(mapped.errorKind)
        setSdkErrorText(mapped.uiText)
        setSdkErrorCode(code || null)
        setSdkErrorSteps(mapped.steps ?? null)
        setSdkErrorVisible(true)
        clearCompactToast()
        setState(mappedState)
        // SDK error stays inline in iframe; real-time non-terminal notice goes to the caller
        // (see comment in initControl.error above).
        postSdkErrorNotice('showAuthPage', { code, desc, carrier }, mapped.uiText)
      },
    })
  }

  const sdkStatusLabel = getSdkStatusLabel(sdkLoadState)
  const nativeInputFocusColor = themeColor ?? DEFAULT_NATIVE_INPUT_FOCUS_COLOR

  const footer = (
    <div
      className="sr-only"
      data-sdk-meta
      data-sdk-status={sdkStatusLabel}
      data-sdk-mode={sdkMode}
      data-sdk-debug-entry={sdkDebugEntry ? 'enabled' : 'hidden'}
      data-sdk-error={sdkLoadError ?? ''}
      data-sdk-flow-status={flowStatus}
      aria-hidden="true"
    >
      sdk metadata preserved for phase-2 verification
    </div>
  )

  if (!uiConfigReady) {
    const waitRootClassName = isChinaumsV23
      ? 'h-full min-h-0 overflow-hidden bg-transparent'
      : isHaikeInline
        ? 'min-h-0 overflow-visible bg-transparent'
        : 'h-dvh overflow-hidden bg-white'
    const waitStatusClassName = isChinaumsV23 || isHaikeInline ? 'min-h-0 bg-transparent' : 'h-full bg-white'

    return (
      <div
        data-app="mobile-auth-verification-window"
        data-v23-viewport-modal={isChinaumsV23 ? 'true' : undefined}
        data-haike-inline={isHaikeInline ? 'true' : undefined}
        className={waitRootClassName}
      >
        <div role="status" aria-label="授权配置加载中" className={waitStatusClassName} />
      </div>
    )
  }

  const IdentityLoginSkin =
    appProfile?.skin === 'chinaumsSheet'
      ? ChinaumsSheetLogin
      : appProfile?.skin === 'chinaumsSheetV23'
        ? ChinaumsSheetV23Login
        : appProfile?.skin === 'haikeInline'
          ? HaikeInlineLogin
        : CompactIdentityLogin
  const visibleAuthorizeDisabled = isChinaumsV23
    ? compactVerifying || dataFlowBusy || dataSnapshot !== null
    : isHaikeInline
      ? !idLast4Complete || compactVerifying || dataFlowBusy || dataSnapshot !== null
      : !idLast4Complete || compactVerifying || dataFlowBusy || dataSnapshot !== null || !customAgreementsAllAgreed

  const authSheetContent = (
    <IdentityLoginSkin
      topImage={topImage}
      bottomImage={bottomImage}
      idLast4={idLast4}
      heightMode={iframeOptions.heightMode}
      contentMeasureRef={contentMeasureRef}
      keyboardVisible={compactKeyboardVisible && !yuanbaoAgreementOpen}
      dismissKeyboardOnComplete={!appProfile}
      useDefaultDigitFocusBorder={!appProfile}
      onCustomInputFocus={!appProfile ? () => {
        if (!compactVerifying) setCompactKeyboardVisible(true)
      } : undefined}
      formHeaderImg={isChinaumsV23 ? formHeaderImg : undefined}
      toast={compactToast}
      authorizeDisabled={visibleAuthorizeDisabled}
      authorizing={compactVerifying || dataFlowBusy}
      sdkSubmitActive={sdkSubmitActive}
      controlReady={controlReady}
      sdkLoadState={sdkLoadState}
      sdkErrorKind={sdkErrorKind}
      sdkErrorText={sdkErrorText}
      sdkErrorCode={sdkErrorCode}
      sdkErrorSteps={sdkErrorSteps}
      sdkErrorVisible={sdkErrorVisible}
      useCustomKeyboard={iframeOptions.useCustomKeyboard}
      nativeInputFocusColor={nativeInputFocusColor}
      enableZidingyiFeedback={enableZidingyiFeedback}
      enableYuanbaoFeedback={enableYuanbaoFeedback}
      inputError={yuanbaoInputError}
      showCloseControl={completionMode === 'iframe' && iframeOptions.closable}
      themeColor={themeColor}
      uiConfig={uiConfig}
      customAgreementChecks={customAgreementChecks}
      onContentSizeChange={() => scheduleAuthWindowResize(nativeKeyboardFocusedRef.current ? true : undefined)}
      onIdLast4Change={handleCompactIdLast4Change}
      onNativeInputFocus={handleNativeInputFocus}
      onNativeInputBlur={handleNativeInputBlur}
      onAuthorize={handleCompactAuthorize}
      onClose={closeVerificationWindow}
      onRetry={handleSdkRetry}
      onToggleCustomAgreement={toggleCustomAgreement}
      onOpenCustomAgreement={openCustomAgreement}
    />
  )

  const nativeKeyboardScrollActive =
    completionMode === 'iframe'
    && iframeOptions.heightMode === 'auto'
    && nativeInputFocused

  const rootClassName =
    isChinaumsV23
      ? 'h-full min-h-0 overflow-hidden bg-transparent'
      : isHaikeInline
        ? 'min-h-0 overflow-visible bg-transparent'
      : completionMode === 'iframe' && iframeOptions.heightMode === 'auto'
      ? nativeKeyboardScrollActive
        ? 'h-dvh min-h-0 overflow-y-auto overscroll-contain bg-white'
        : 'min-h-0 overflow-visible bg-white'
      : 'h-dvh overflow-hidden bg-white'

  return (
    <div
      ref={authWindowRootRef}
      data-app="mobile-auth-verification-window"
      data-v23-viewport-modal={isChinaumsV23 ? 'true' : undefined}
      data-haike-inline={isHaikeInline ? 'true' : undefined}
      data-native-keyboard-scroll={nativeKeyboardScrollActive ? 'true' : 'false'}
      className={rootClassName}
      style={nativeKeyboardScrollActive ? { WebkitOverflowScrolling: 'touch' } : undefined}
    >
      {authSheetContent}
      {footer}
    </div>
  )

}
