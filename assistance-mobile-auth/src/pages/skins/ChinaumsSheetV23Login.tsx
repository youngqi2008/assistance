import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react'

import { SdkLoadingSkeleton } from '../../components/auth/SdkLoadingSkeleton'
import { SdkErrorPanel } from '../../components/feedback/SdkErrorPanel'
import { sdkControlSlotMap } from '../../sdk/slots'
import {
  ID_LAST4_LENGTH,
  MobileAuthSubmitSlot,
  StatusToast,
  normalizeIdLast4Input,
  type IdentityLoginSkinProps,
} from './identityLoginShared'
import handUrl from './assets/chinaums-v23/hand.png'
import headerUrl from './assets/chinaums-v23/header.png'
import loadingUrl from './assets/chinaums-v23/loading.png'
import middleUrl from './assets/chinaums-v23/middle.png'
import warningUrl from './assets/chinaums-v23/warning.png'
import yuanbaoLoadingUrl from './assets/chinaums-v23/yuanbao-loading.gif?no-inline'
import './chinaumsSheetV23.css'

function V23IdLast4Boxes({
  value,
  inputRef,
  useNativeInput,
  disabled,
  showFeedbackCaret,
  onChange,
  onNativeFocus,
  onNativeBlur,
}: {
  value: string
  inputRef: RefObject<HTMLInputElement | null>
  useNativeInput: boolean
  disabled: boolean
  showFeedbackCaret: boolean
  onChange(next: string): void
  onNativeFocus(): void
  onNativeBlur(): void
}) {
  const [nativeFocused, setNativeFocused] = useState(false)
  const digits = Array.from({ length: ID_LAST4_LENGTH }, (_, index) => value[index] ?? '')
  const activeIndex = Math.min(value.length, ID_LAST4_LENGTH - 1)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!disabled) {
      onChange(normalizeIdLast4Input(event.target.value))
    }
  }

  return (
    <div
      className="chinaums-v23-id-grid"
      aria-label="身份证后四位输入"
      data-rrweb-sensitive="true"
      role={useNativeInput ? 'group' : undefined}
      onClick={() => {
        if (useNativeInput && !disabled) {
          inputRef.current?.focus()
        }
      }}
    >
      {useNativeInput ? (
        <input
          ref={inputRef}
          aria-label="身份证后四位"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onFocus={() => {
            setNativeFocused(true)
            onNativeFocus()
          }}
          onBlur={() => {
            setNativeFocused(false)
            onNativeBlur()
          }}
          className="absolute inset-0 z-10 h-full w-full opacity-0"
        />
      ) : null}
      {digits.map((digit, index) => (
        <div
          key={index}
          aria-label={`身份证后四位第 ${index + 1} 位`}
          data-active={
            !disabled &&
            ((useNativeInput && nativeFocused) || !useNativeInput) &&
            index === activeIndex
              ? 'true'
              : 'false'
          }
          className="chinaums-v23-id-box"
        >
          {digit}
          {showFeedbackCaret && value.length < ID_LAST4_LENGTH && index === value.length ? (
            <span
              aria-hidden="true"
              data-testid="chinaums-v23-id-caret"
              className="chinaums-v23-id-caret"
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}

function V23FigmaKeyboard({
  onInput,
  onDelete,
  visible,
  disabled,
}: {
  onInput(key: string): void
  onDelete(): void
  visible: boolean
  disabled: boolean
}) {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['X', '0', 'delete'],
  ]

  return (
    <section
      aria-label="安全键盘"
      aria-hidden={!visible}
      inert={!visible}
      className="chinaums-v23-figma-keyboard"
      data-visible={visible ? 'true' : 'false'}
    >
      <div className="chinaums-v23-key-grid">
        {rows.flat().map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key === 'delete' ? '删除' : `输入 ${key}`}
            className="chinaums-v23-key"
            data-key={key}
            disabled={disabled}
            onClick={() => (key === 'delete' ? onDelete() : onInput(key))}
          >
            {key === 'delete' ? (
              <svg
                viewBox="0 0 44 32"
                className="chinaums-v23-delete-icon"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M15.2 3.5h22.3a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H15.2L3.5 16 15.2 3.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="m23 11 10 10m0-10L23 21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              key
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

/** 版本 23 专属皮肤。官方 phone/agreement/submit slots 始终挂载。 */
export function ChinaumsSheetV23Login({
  idLast4,
  contentMeasureRef,
  toast,
  authorizeDisabled,
  authorizing,
  controlReady,
  sdkLoadState,
  sdkErrorKind,
  sdkErrorText,
  sdkErrorCode,
  sdkErrorSteps,
  sdkErrorVisible,
  formHeaderImg,
  enableZidingyiFeedback,
  enableYuanbaoFeedback,
  inputError,
  keyboardVisible,
  showCloseControl,
  uiConfig,
  customAgreementChecks,
  onContentSizeChange,
  onIdLast4Change,
  onNativeInputFocus,
  onNativeInputBlur,
  onClose,
  onRetry,
  onToggleCustomAgreement,
  onOpenCustomAgreement,
  themeColor,
}: IdentityLoginSkinProps) {
  const nativeInputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLElement | null>(null)
  const keyboardRef = useRef<HTMLDivElement | null>(null)
  const [resolvedHeaderUrl, setResolvedHeaderUrl] = useState(formHeaderImg || headerUrl)
  const isError = sdkErrorVisible && Boolean(sdkErrorText && sdkErrorKind)
  const isSdkFallbackReady = sdkLoadState === 'disabled' || (sdkLoadState === 'error' && !isError)
  const isSdkLoading =
    !isError && !isSdkFallbackReady && (sdkLoadState !== 'ready' || !controlReady)
  const isReady = !isError && !isSdkLoading
  const showHand = enableYuanbaoFeedback
    ? isReady && !authorizing && !authorizeDisabled && !inputError && !toast && keyboardVisible && /^[0-9X]{4}$/.test(idLast4)
    : enableZidingyiFeedback
    ? isReady && !authorizing && !authorizeDisabled && idLast4.length === ID_LAST4_LENGTH
    : isReady && !authorizing && idLast4.length === ID_LAST4_LENGTH
  const customAgreements = uiConfig.agreements ?? []
  const inlineError = enableYuanbaoFeedback
    ? inputError === 'incomplete' ? '请完整输入身份证后4位数字' : null
    : toast?.icon === '!' && toast.title === '请完整输入身份证后4位数字' ? toast.title : null
  const yuanbaoPending = Boolean(enableYuanbaoFeedback && authorizing)

  function blockPendingClick(event: ReactMouseEvent<HTMLElement>) {
    if (!yuanbaoPending) return
    event.preventDefault()
    event.stopPropagation()
  }

  function blockPendingKey(event: ReactKeyboardEvent<HTMLElement>) {
    if (!yuanbaoPending || !['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    event.stopPropagation()
  }

  useEffect(() => {
    setResolvedHeaderUrl(formHeaderImg || headerUrl)
  }, [formHeaderImg])

  useLayoutEffect(() => {
    const stageHost = contentMeasureRef.current
    const dialog = dialogRef.current
    const keyboard = keyboardRef.current
    if (!stageHost || !dialog || !keyboard) {
      return
    }

    const setMeasuredUnits = (
      element: HTMLElement,
      prefix: 'stage' | 'dialog' | 'keyboard',
      includeBlockSize: boolean,
    ) => {
      const { width, height } = element.getBoundingClientRect()
      element.style.setProperty(`--v23-${prefix}-cqi`, `${width / 100}px`)
      element.style.setProperty(`--v23-${prefix}-cqw`, `${width / 100}px`)
      if (includeBlockSize) {
        element.style.setProperty(`--v23-${prefix}-cqh`, `${height / 100}px`)
      }
    }

    const updateMeasuredUnits = () => {
      // Stage measurements determine the card and keyboard size, so update in
      // dependency order and let each following read flush the new geometry.
      setMeasuredUnits(stageHost, 'stage', true)
      if (enableYuanbaoFeedback) {
        const stage = dialog.parentElement?.parentElement
        if (!stage) return
        const width = stageHost.clientWidth
        const height = stageHost.clientHeight
        if (!width || !height) return
        const preferredWidth = Math.min(width * 0.85125448, width - 24)
        const preferredKeyboard = Math.min(width * 0.56, height * 0.31)
        const minimumKeyboard = Math.min(preferredKeyboard, 132)
        const topSpace = Math.min(16, height * 0.025)
        const preferredGap = Math.min(width * 0.08243728, height * 0.04581673)
        const minimumGap = 8
        const setWidthAndBudget = (cardWidth: number) => {
          stage.style.setProperty('--v23-dialog-width', `${cardWidth}px`)
          setMeasuredUnits(dialog, 'dialog', false)
          const errorRow = dialog.querySelector<HTMLElement>('.chinaums-v23-inline-error')
          const actualErrorSpace = errorRow ? errorRow.getBoundingClientRect().height + parseFloat(getComputedStyle(errorRow).marginTop) : 0
          // Reserve the possible error height in the allocation, never in the DOM.
          return dialog.getBoundingClientRect().height - actualErrorSpace + cardWidth * 0.06896552
        }
        let cardWidth = preferredWidth
        let errorHeight = setWidthAndBudget(cardWidth)
        const cardBudget = height - topSpace - minimumKeyboard - minimumGap
        if (errorHeight > cardBudget) {
          let low = Math.min(1, preferredWidth)
          let high = preferredWidth
          for (let i = 0; i < 9; i += 1) {
            const candidate = (low + high) / 2
            if (setWidthAndBudget(candidate) <= cardBudget) low = candidate
            else high = candidate
          }
          cardWidth = low
          errorHeight = setWidthAndBudget(cardWidth)
        }
        const gap = Math.max(minimumGap, Math.min(preferredGap, height - topSpace - errorHeight - preferredKeyboard))
        const keyboardHeight = Math.min(preferredKeyboard, Math.max(minimumKeyboard, height - topSpace - errorHeight - gap))
        stage.style.setProperty('--v23-keyboard-height', `${keyboardHeight}px`)
        stage.style.setProperty('--v23-card-keyboard-gap', `${gap}px`)
      }
      setMeasuredUnits(dialog, 'dialog', false)
      setMeasuredUnits(keyboard, 'keyboard', true)
    }

    updateMeasuredUnits()

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateMeasuredUnits)
    resizeObserver?.observe(stageHost)
    resizeObserver?.observe(dialog)
    resizeObserver?.observe(keyboard)
    window.addEventListener('resize', updateMeasuredUnits)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateMeasuredUnits)
    }
  }, [contentMeasureRef, enableYuanbaoFeedback, inlineError, isReady, authorizing])

  function appendKey(key: string) {
    if (!authorizing && idLast4.length < ID_LAST4_LENGTH) {
      onIdLast4Change(normalizeIdLast4Input(`${idLast4}${key}`))
    }
  }

  function deleteKey() {
    if (!authorizing) {
      onIdLast4Change(idLast4.slice(0, -1))
    }
  }

  return (
    <main
      aria-label="银杏助填版本23"
      data-testid="chinaums-sheet-v23-root"
      data-zidingyi-feedback={enableZidingyiFeedback ? 'true' : undefined}
      data-yuanbao-feedback={enableYuanbaoFeedback ? 'true' : undefined}
      className="chinaums-sheet-v23"
    >
      <section
        ref={contentMeasureRef}
        data-assistance-auth-content-measure="true"
        className="chinaums-v23-stage-host"
      >
        {toast && !inlineError && !authorizing ? (
          <StatusToast title={toast.title} icon={toast.icon} />
        ) : null}
        <div className="chinaums-v23-stage" data-stage-scale-ready="true">
          <div className="chinaums-v23-dialog-layer">
            <section
              ref={dialogRef}
              className="chinaums-v23-dialog"
              data-error={inlineError ? 'true' : 'false'}
              data-yuanbao-pending={yuanbaoPending ? 'true' : undefined}
            >
              {showCloseControl ? (
                <button
                  type="button"
                  aria-label="关闭"
                  className="chinaums-v23-close"
                  onClick={onClose}
                >
                  ×
                </button>
              ) : null}

              <img
                src={resolvedHeaderUrl}
                alt="输入您的身份证后四位"
                className="chinaums-v23-header"
                onLoad={onContentSizeChange}
                onError={() => setResolvedHeaderUrl(headerUrl)}
              />

              <div
                className="chinaums-v23-phone"
                data-testid="chinaums-v23-phone"
                aria-hidden={!isReady}
              >
                <span>用于验证您</span>
                <span id={sdkControlSlotMap.phone} data-sdk-control-slot="phone" />
                <span>的实名信息</span>
              </div>

              {isError && sdkErrorKind && sdkErrorText ? (
                <SdkErrorPanel
                  errorKind={sdkErrorKind}
                  uiText={sdkErrorText}
                  code={sdkErrorCode ?? undefined}
                  steps={sdkErrorSteps ?? undefined}
                  onRetry={onRetry}
                />
              ) : null}

              {isSdkLoading ? <SdkLoadingSkeleton /> : null}

              <div
                id={sdkControlSlotMap.state}
                data-sdk-control-slot="state"
                className="sr-only"
                aria-hidden="true"
              />

              <div className={isReady ? 'block' : 'hidden'} aria-hidden={!isReady}>
                <img src={middleUrl} alt="" aria-hidden="true" className="chinaums-v23-middle" />

                <V23IdLast4Boxes
                  value={idLast4}
                  inputRef={nativeInputRef}
                  useNativeInput={false}
                  disabled={authorizing}
                  showFeedbackCaret={Boolean(enableZidingyiFeedback || (enableYuanbaoFeedback && keyboardVisible)) && !authorizing}
                  onChange={onIdLast4Change}
                  onNativeFocus={onNativeInputFocus}
                  onNativeBlur={onNativeInputBlur}
                />

                {inlineError ? (
                  <p role="alert" className="chinaums-v23-inline-error">
                    {enableYuanbaoFeedback ? <span className="chinaums-v23-warning-icon" aria-hidden="true">!</span> : <img src={warningUrl} alt="" aria-hidden="true" />}
                    <span>{inlineError}</span>
                  </p>
                ) : null}

                <div
                  className="chinaums-v23-submit-wrap"
                  onClickCapture={blockPendingClick}
                  onKeyDownCapture={blockPendingKey}
                >
                  <div
                    className="chinaums-v23-submit"
                    data-testid="chinaums-v23-submit"
                    inert={authorizeDisabled && !yuanbaoPending}
                  >
                    <MobileAuthSubmitSlot />
                  </div>
                  {yuanbaoPending ? (
                    <div className="yuanbao-inline-loading" role="status" aria-label="加载中">
                      <span>同意并登录</span>
                      <img src={yuanbaoLoadingUrl} alt="" aria-hidden="true" />
                    </div>
                  ) : null}
                  <img
                    src={handUrl}
                    alt=""
                    aria-hidden="true"
                    data-testid="chinaums-v23-hand"
                    data-visible={showHand ? 'true' : 'false'}
                    className="chinaums-v23-hand"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>

                <section
                  data-slot="agreement"
                  aria-label="协议说明"
                  data-testid="chinaums-v23-agreement-panel"
                  className="chinaums-v23-agreements"
                  inert={yuanbaoPending}
                  onClickCapture={blockPendingClick}
                  onKeyDownCapture={blockPendingKey}
                >
                  <div id={sdkControlSlotMap.agreement} data-sdk-control-slot="agreement" />
                  <div id={sdkControlSlotMap.tips} data-sdk-control-slot="tips" />

                  {customAgreements.map((agreement, index) => {
                    const checked = customAgreementChecks[index] === true
                    return (
                      <label
                        key={`${agreement.title}-${agreement.url}-${index}`}
                        className="chinaums-v23-custom-agreement"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleCustomAgreement(index)}
                          style={{ accentColor: themeColor }}
                        />
                        <span>已阅读并同意</span>
                        <button
                          type="button"
                          style={{ color: themeColor }}
                          onClick={() => onOpenCustomAgreement(agreement.url)}
                        >
                          {agreement.title}
                        </button>
                      </label>
                    )
                  })}
                </section>

                <button
                  type="button"
                  className="chinaums-v23-other"
                  disabled={yuanbaoPending}
                  onClick={onClose}
                >
                  选择其他方式
                </button>
              </div>

              <div className="sr-only" aria-hidden="true">
                <div id={sdkControlSlotMap['sms-input']} data-sdk-control-slot="sms-input" />
                <div id={sdkControlSlotMap['sms-button']} data-sdk-control-slot="sms-button" />
              </div>

              {authorizing && !enableYuanbaoFeedback ? (
                <div role="status" aria-label="加载中" className="chinaums-v23-loading-mask">
                  <div className="chinaums-v23-loading-card">
                    <img src={loadingUrl} alt="" aria-hidden="true" />
                    <span>加载中...</span>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <div ref={keyboardRef} className="chinaums-v23-keyboard">
            <V23FigmaKeyboard
              onInput={appendKey}
              onDelete={deleteKey}
              visible={isReady && (!enableYuanbaoFeedback || keyboardVisible)}
              disabled={authorizing}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
