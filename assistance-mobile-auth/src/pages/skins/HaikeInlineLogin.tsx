import { useRef, useState, type ChangeEvent } from 'react'

import { SdkLoadingSkeleton } from '../../components/auth/SdkLoadingSkeleton'
import { SdkErrorPanel } from '../../components/feedback/SdkErrorPanel'
import { sdkControlSlotMap } from '../../sdk/slots'
import {
  ID_LAST4_LENGTH,
  MobileAuthSubmitSlot,
  normalizeIdLast4Input,
  type IdentityLoginSkinProps,
} from './identityLoginShared'
import { DefaultAgreementDisplay } from './DefaultAgreementDisplay'
import handUrl from './assets/chinaums-v23/hand.png'
import './haikeInline.css'

function HaikeIdLast4Input({
  value,
  disabled,
  onChange,
  onFocus,
  onBlur,
}: {
  value: string
  disabled: boolean
  onChange(next: string): void
  onFocus(): void
  onBlur(): void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
  const digits = Array.from({ length: ID_LAST4_LENGTH }, (_, index) => value[index] ?? '')
  const focusedIndex = Math.min(value.length, ID_LAST4_LENGTH - 1)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!disabled) {
      onChange(normalizeIdLast4Input(event.target.value))
    }
  }

  return (
    <div
      className="haike-inline-id-grid"
      aria-label="身份证后四位输入"
      data-rrweb-sensitive="true"
      role="group"
      onClick={() => {
        if (!disabled) {
          inputRef.current?.focus()
        }
      }}
    >
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
          setFocused(true)
          onFocus()
        }}
        onBlur={() => {
          setFocused(false)
          onBlur()
        }}
        className="haike-inline-native-input"
      />

      {digits.map((digit, index) => {
        const state = digit
          ? focused && index === focusedIndex
            ? 'focus'
            : 'filled'
          : focused && index === focusedIndex
            ? 'focus'
            : 'empty'

        return (
          <span
            key={index}
            aria-label={`身份证后四位第 ${index + 1} 位`}
            className="haike-inline-id-cell"
            data-state={state}
          >
            {digit}
          </span>
        )
      })}
    </div>
  )
}

/** The exact Haike appId + layout=inline card. Flow and SDK lifecycle stay in AuthVerificationWindow. */
export function HaikeInlineLogin({
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
  themeColor,
  uiConfig,
  customAgreementChecks,
  onIdLast4Change,
  onNativeInputFocus,
  onNativeInputBlur,
  onRetry,
  onToggleCustomAgreement,
  onOpenCustomAgreement,
}: IdentityLoginSkinProps) {
  const isError = sdkErrorVisible && Boolean(sdkErrorText && sdkErrorKind)
  const isSdkFallbackReady = sdkLoadState === 'disabled' || (sdkLoadState === 'error' && !isError)
  const isSdkLoading =
    !isError && !isSdkFallbackReady && (sdkLoadState !== 'ready' || !controlReady)
  const isReady = !isError && !isSdkLoading
  const showHand = isReady
  const submitDisabled = authorizeDisabled || authorizing

  return (
    <main
      aria-label="海客内嵌授权"
      className="haike-inline-login"
      data-testid="haike-inline-root"
    >
      <section
        ref={contentMeasureRef}
        data-assistance-auth-content-measure="true"
        className="haike-inline-measure"
      >
        <article className="haike-inline-card" data-testid="haike-inline-card">
          {toast ? (
            <div
              className="haike-inline-status"
              role={toast.icon === '!' ? 'alert' : 'status'}
            >
              {toast.title}
            </div>
          ) : null}

          {isError && sdkErrorKind && sdkErrorText ? (
            <div className="haike-inline-feedback">
              <SdkErrorPanel
                errorKind={sdkErrorKind}
                uiText={sdkErrorText}
                code={sdkErrorCode ?? undefined}
                steps={sdkErrorSteps ?? undefined}
                onRetry={onRetry}
              />
            </div>
          ) : null}

          {isSdkLoading ? (
            <div className="haike-inline-feedback">
              <SdkLoadingSkeleton />
            </div>
          ) : null}

          <section
            className="haike-inline-sdk-host"
            data-ready={isReady ? 'true' : 'false'}
            data-sdk-mount-host
            aria-hidden={!isReady}
          >
            <div
              className="haike-inline-phone"
              data-testid="haike-inline-phone"
              aria-label="脱敏手机号"
            >
              <div id={sdkControlSlotMap.phone} data-sdk-control-slot="phone" />
            </div>

            <div className="haike-inline-folded-slots" aria-hidden="true" hidden>
              <div id={sdkControlSlotMap.state} data-sdk-control-slot="state" />
              <div id={sdkControlSlotMap['sms-input']} data-sdk-control-slot="sms-input" />
              <div id={sdkControlSlotMap['sms-button']} data-sdk-control-slot="sms-button" />
            </div>

            {isReady ? (
              <HaikeIdLast4Input
                value={idLast4}
                disabled={authorizing}
                onChange={onIdLast4Change}
                onFocus={onNativeInputFocus}
                onBlur={onNativeInputBlur}
              />
            ) : null}

            <div
              className="haike-inline-submit"
              data-authorizing={authorizing ? 'true' : 'false'}
              data-disabled={submitDisabled ? 'true' : 'false'}
              data-testid="haike-inline-submit"
              aria-disabled={submitDisabled}
              inert={submitDisabled ? true : undefined}
            >
              <span className="haike-inline-submit-label" aria-hidden="true">确认立即保障</span>
              <MobileAuthSubmitSlot />
              <img
                src={handUrl}
                alt=""
                aria-hidden="true"
                className="haike-inline-hand"
                data-visible={showHand ? 'true' : 'false'}
                data-testid="haike-inline-hand"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>

            <div className="haike-inline-agreements">
              <DefaultAgreementDisplay
                themeColor={themeColor}
                uiConfig={uiConfig}
                customAgreementChecks={customAgreementChecks}
                onToggleCustomAgreement={onToggleCustomAgreement}
                onOpenCustomAgreement={onOpenCustomAgreement}
              />
            </div>
          </section>
        </article>
      </section>
    </main>
  )
}
