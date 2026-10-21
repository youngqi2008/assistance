import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type RefObject } from 'react'

import { SdkLoadingSkeleton } from '../../components/auth/SdkLoadingSkeleton'
import { SdkErrorPanel } from '../../components/feedback/SdkErrorPanel'
import { sdkControlSlotMap } from '../../sdk/slots'
import {
  ID_LAST4_LENGTH,
  MobileAuthSubmitSlot,
  SecureKeyboard,
  StatusToast,
  normalizeIdLast4Input,
  useOneShotNativeInputFocus,
  type IdentityLoginSkinProps,
} from './identityLoginShared'
import buttonBgUrl from './assets/chinaums/button@3x.png'
import handUrl from './assets/chinaums/hand@3x.png'
import closeIconUrl from './assets/chinaums/close@3x.png'
import './chinaumsSheet.css'

/** 设计稿四分格输入（62×62、#f6f6f6 底、27px #474857），行为与默认皮肤 IdLast4Block 一致。 */
function ChinaumsIdLast4Boxes({
  value,
  inputRef,
  useNativeInput,
  activeColor,
  onChange,
  onNativeFocus,
  onNativeBlur,
}: {
  value: string
  inputRef: RefObject<HTMLInputElement | null>
  useNativeInput: boolean
  activeColor: string
  onChange?(next: string): void
  onNativeFocus?(): void
  onNativeBlur?(): void
}) {
  const [nativeFocused, setNativeFocused] = useState(false)
  const digits = Array.from({ length: ID_LAST4_LENGTH }, (_, index) => value[index] ?? '')
  const activeDigitIndex = Math.min(value.length, ID_LAST4_LENGTH - 1)

  function focusNativeInput() {
    if (useNativeInput) {
      inputRef.current?.focus()
    }
  }

  function handleNativeChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(normalizeIdLast4Input(event.target.value))
  }

  return (
    <div
      className="chinaums-id-last4-grid relative"
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
          onFocus={() => {
            setNativeFocused(true)
            onNativeFocus?.()
          }}
          onBlur={() => {
            setNativeFocused(false)
            onNativeBlur?.()
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        />
      ) : null}
      {digits.map((digit, index) => {
        const isActive = useNativeInput && nativeFocused && index === activeDigitIndex

        return (
          <div
            key={index}
            aria-label={`身份证后四位第 ${index + 1} 位`}
            data-active-digit={isActive ? 'true' : undefined}
            className="chinaums-id-last4-box flex items-center justify-center rounded-[10px] border-2 border-transparent bg-[#f6f6f6] text-[27px] font-semibold text-[#474857] transition-[border-color] duration-150"
            style={isActive ? { borderColor: activeColor } : undefined}
          >
            {digit}
          </div>
        )
      })}
    </div>
  )
}

/** 银联三要素授权皮肤（appId 分流命中 chinaums-sheet 档案时由 AuthVerificationWindow 渲染）。
 *  结构约定与 CompactIdentityLogin 相同：SDK slots 常驻 DOM、className 折叠显隐。 */
export function ChinaumsSheetLogin({
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
  onAuthorize,
  onClose,
  onRetry,
  onToggleCustomAgreement,
  onOpenCustomAgreement,
}: IdentityLoginSkinProps) {
  const nativeInputRef = useRef<HTMLInputElement | null>(null)
  const nativeInputFocusedRef = useRef(false)
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
  const showHandCue = isReady && idLast4.length === ID_LAST4_LENGTH
  const showKeyboard = useCustomKeyboard && keyboardVisible && isReady
  const isAutoHeight = heightMode === 'auto'
  const customAgreements = uiConfig.agreements ?? []
  const footerNote = uiConfig.texts?.footerNote

  const mainClassName = isAutoHeight
    ? 'chinaums-sheet flex min-h-0 flex-col overflow-visible bg-white text-[#333333]'
    : 'chinaums-sheet flex h-full min-h-0 flex-col bg-white text-[#333333]'
  const measureRootClassName = isAutoHeight
    ? 'flex min-h-0 flex-col bg-white'
    : 'flex h-full min-h-0 flex-col bg-white'
  const readySectionClassName = isReady
    ? isAutoHeight
      ? 'chinaums-ready-section flex min-h-0 flex-col items-center pb-4 pt-[26px]'
      : 'chinaums-ready-section flex min-h-0 flex-1 flex-col items-center overflow-y-auto pb-4 pt-[26px]'
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
    <main
      className={mainClassName}
      aria-label="银联三要素授权"
      data-testid="chinaums-sheet-root"
      style={{ '--chinaums-button-bg': `url("${buttonBgUrl}")` } as CSSProperties}
    >
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

        {/* 头部常显：两段式主标题 + 掩码手机号副标题（phone slot 常驻）；右上 X 切图 */}
        <header className="relative shrink-0 px-[30px] pt-[27px]">
          {showCloseControl ? (
            <button
              type="button"
              aria-label="关闭"
              onClick={onClose}
              className="absolute right-[14px] top-[12px] flex h-9 w-9 items-center justify-center"
            >
              <img src={closeIconUrl} alt="" aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
          ) : null}
          <h1 className="chinaums-sheet-title text-center text-[22px] font-semibold leading-8">
            <span className="text-[#333333]">输入您的</span>
            <span className="text-[#f75110]">身份证后四位</span>
          </h1>
          <div
            className={
              isReady
                ? 'mt-[5px] flex min-h-[18px] flex-wrap items-baseline justify-center gap-x-1 text-center text-[12px] leading-[18px] text-[#444444]'
                : 'flex h-0 flex-wrap items-baseline justify-center gap-x-1 overflow-hidden'
            }
            data-testid="chinaums-phone-subtitle"
            aria-hidden={!isReady}
          >
            <span>用于验证您</span>
            <span id={sdkControlSlotMap.phone} data-sdk-control-slot="phone" />
            <span>的实名信息</span>
          </div>
        </header>

        {isError && sdkErrorKind && sdkErrorText ? (
          <section className="flex flex-col px-[30px] pb-3 pt-3">
            <SdkErrorPanel
              errorKind={sdkErrorKind}
              uiText={sdkErrorText}
              code={sdkErrorCode ?? undefined}
              steps={sdkErrorSteps ?? undefined}
              onRetry={onRetry}
            />
          </section>
        ) : null}

        {isSdkLoading ? (
          <section className="flex flex-col items-center px-[30px] pt-4">
            <SdkLoadingSkeleton />
          </section>
        ) : null}

        {/* 稳定 SDK slot 挂载区：与默认皮肤同规则，slots 常驻、className 折叠 */}
        <section className={readySectionClassName} aria-hidden={!isReady} data-sdk-mount-host>
          <div
            id={sdkControlSlotMap.state}
            data-sdk-control-slot="state"
            className="h-0 w-full overflow-hidden"
            aria-hidden="true"
          />

          <div
            className={isReady ? 'w-full' : 'h-0 w-full overflow-hidden'}
            aria-hidden={!isReady}
            data-testid="chinaums-id-last4-shell"
          >
            {isReady ? (
              <ChinaumsIdLast4Boxes
                value={idLast4}
                inputRef={nativeInputRef}
                useNativeInput={!useCustomKeyboard}
                activeColor={nativeInputFocusColor}
                onChange={onIdLast4Change}
                onNativeFocus={handleNativeInputFocus}
                onNativeBlur={handleNativeInputBlur}
              />
            ) : null}
          </div>

          {/* 同意并授权：SDK 注入 submit 时以 CSS 换装为切图按钮，否则渲染兜底按钮；手指切图叠加 */}
          <div
            className={isReady ? 'chinaums-submit-block relative mt-[30px]' : 'h-0 w-full overflow-hidden'}
            aria-hidden={!isReady}
            data-testid="chinaums-submit-block"
          >
            <div
              className={
                sdkSubmitActive
                  ? 'chinaums-submit-shell chinaums-submit-sdk'
                  : 'h-0 w-full overflow-hidden'
              }
              aria-hidden={!sdkSubmitActive}
              data-testid={sdkSubmitActive ? 'chinaums-submit-shell' : undefined}
            >
              <MobileAuthSubmitSlot />
            </div>
            {!sdkSubmitActive && isReady ? (
              <button
                type="button"
                onClick={onAuthorize}
                disabled={authorizeDisabled}
                className="chinaums-submit-shell chinaums-submit-fallback active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="chinaums-submit-shell"
              >
                {authorizing ? '验证中' : '同意并授权'}
              </button>
            ) : null}
            <img
              src={handUrl}
              alt=""
              aria-hidden="true"
              className="chinaums-hand-cue"
              data-testid="chinaums-hand-cue"
              data-visible={showHandCue ? 'true' : 'false'}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={onContentSizeChange}
            />
          </div>

          {/* 协议/授权说明：移动 SDK 注入协议文案与链接；caller 自定义协议保留勾选行维持 authorize 门 */}
          <section
            className={isReady ? 'mt-4 w-full' : 'h-0 w-full overflow-hidden'}
            aria-hidden={!isReady}
            data-slot="agreement"
            data-testid="chinaums-agreement-panel"
            aria-label="协议说明"
          >
            <div className="chinaums-agreement-copy">
              <div id={sdkControlSlotMap.agreement} data-sdk-control-slot="agreement" />
              <div id={sdkControlSlotMap.tips} data-sdk-control-slot="tips" className="w-full" />
            </div>

            {customAgreements.map((agreement, index) => {
              const checked = customAgreementChecks[index] === true
              const checkboxId = `chinaums-custom-agreement-${index}`

              return (
                <div
                  key={`${agreement.title}-${agreement.url}-${index}`}
                  className="mt-2 flex items-start gap-2 text-[12px] leading-[18px] text-[#444444]"
                  data-testid={`chinaums-custom-agreement-row-${index}`}
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCustomAgreement(index)}
                    aria-label={checked ? `已同意${agreement.title}` : `同意${agreement.title}`}
                    className="mt-0.5 shrink-0"
                    style={{ accentColor: themeColor }}
                  />
                  <span>
                    <label htmlFor={checkboxId}>已阅读并同意</label>
                    <button
                      type="button"
                      className="inline text-left"
                      style={{ color: themeColor }}
                      onClick={() => onOpenCustomAgreement(agreement.url)}
                    >
                      {agreement.title}
                    </button>
                  </span>
                </div>
              )
            })}

            {footerNote?.text ? (
              <p className="mt-3 text-[12px] leading-[18px] text-[#9aa0a6]">{footerNote.text}</p>
            ) : null}
          </section>

          {/* sms slots：authType 0 不用，但必须挂上让 SDK 找得到 */}
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
