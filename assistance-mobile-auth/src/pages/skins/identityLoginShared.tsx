import {
  useEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from 'react'

import { sdkControlSlotMap } from '../../sdk/slots'
import type { MobileAuthSdkErrorKind, MobileAuthSdkLoadState } from '../../sdk/types'
import type { NormalizedAssistanceMobileAuthUiConfig } from '../../wrapper/uiConfig'
import type { AssistanceIframeOptions, PageImageConfig } from '../../wrapper/verificationBridge'

export const ID_LAST4_LENGTH = 4

export function normalizeIdLast4Input(value: string): string {
  return value.replace(/[^0-9Xx]/g, '').toUpperCase().slice(0, ID_LAST4_LENGTH)
}

export function useOneShotNativeInputFocus(
  inputRef: RefObject<HTMLInputElement | null>,
  enabled: boolean,
) {
  const attemptedRef = useRef(false)

  useEffect(() => {
    if (!enabled || attemptedRef.current || !inputRef.current) {
      return
    }

    attemptedRef.current = true

    try {
      inputRef.current.focus({ preventScroll: true })
    } catch {
      inputRef.current.focus()
    }
  }, [enabled, inputRef])
}

export function createConfiguredTextStyle(
  config: { fontSize?: string; color?: string; bold?: boolean } | undefined,
  defaults: { fontSize: string; color: string; bold: boolean },
): CSSProperties {
  return {
    fontSize: config?.fontSize ?? defaults.fontSize,
    color: config?.color ?? defaults.color,
    fontWeight: (config?.bold ?? defaults.bold) ? 600 : 400,
  }
}

export function MobileAuthSubmitSlot() {
  return <div id={sdkControlSlotMap.submit} data-sdk-control-slot="submit" />
}

export function SecureKeyboard({
  onInput,
  onDelete,
  visible,
  disabled = false,
}: {
  onInput(key: string): void
  onDelete(): void
  visible: boolean
  disabled?: boolean
}) {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['X', '0', 'delete'],
  ]

  return (
    <section
      className={`w-full origin-bottom bg-[#f5f6f7] transition-all duration-300 ease-out ${
        visible ? 'max-h-[288px] translate-y-0 opacity-100' : 'max-h-0 translate-y-8 overflow-hidden opacity-0'
      }`}
      style={{
        paddingBottom: visible
          ? 'max(12px, env(safe-area-inset-bottom, 0px))'
          : '0px',
      }}
      aria-label="安全键盘"
      aria-hidden={!visible}
    >
      <div className="grid grid-cols-3 border-t border-[#eceff2]">
        {rows.flat().map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key === 'delete' ? '删除' : `输入 ${key}`}
            onClick={() => (key === 'delete' ? onDelete() : onInput(key))}
            disabled={disabled}
            className="flex items-center justify-center border-b border-r border-[#edf0f2] bg-white text-[24px] font-normal text-[#111827] active:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:text-[#aeb5bb] [&:nth-child(3n)]:border-r-0"
            style={{ height: 'clamp(52px, 6.5dvh, 56px)' }}
          >
            {key === 'delete' ? <span className="rounded-md bg-[#aeb5bb] px-2 py-0.5 text-lg font-semibold text-white">×</span> : key}
          </button>
        ))}
      </div>
    </section>
  )
}

export function StatusToast({
  title,
  icon = '!',
}: {
  title: string
  icon?: string
}) {
  const iconNode =
    icon === 'loading' ? (
      <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#343741]/30 border-t-[#343741]" aria-hidden="true" />
    ) : (
      icon
    )

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-[18%] z-50 flex w-[150px] flex-col items-center rounded-2xl bg-[#343741] px-5 py-6 text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)]"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[26px] font-semibold text-[#343741] shadow-[0_0_18px_rgba(255,255,255,0.32)]">
        {iconNode}
      </div>
      <p className="mt-4 text-lg font-semibold leading-6">{title}</p>
    </div>
  )
}

/** 授权页展示层皮肤的统一 props 契约：所有皮肤（默认 CompactIdentityLogin / chinaums-sheet 等）
 *  以完全相同的 props 由 AuthVerificationWindow 驱动，流程逻辑与皮肤解耦。 */
export interface IdentityLoginSkinProps {
  topImage: PageImageConfig | null
  bottomImage: PageImageConfig | null
  idLast4: string
  heightMode: AssistanceIframeOptions['heightMode']
  contentMeasureRef: RefObject<HTMLElement | null>
  keyboardVisible: boolean
  dismissKeyboardOnComplete?: boolean
  onCustomInputFocus?(): void
  useDefaultDigitFocusBorder?: boolean
  formHeaderImg?: string
  toast: { title: string; icon?: string } | null
  authorizeDisabled: boolean
  authorizing: boolean
  sdkSubmitActive: boolean
  controlReady: boolean
  sdkLoadState: MobileAuthSdkLoadState
  sdkErrorKind: MobileAuthSdkErrorKind | null
  sdkErrorText: string | null
  sdkErrorCode: string | null
  sdkErrorSteps: readonly string[] | null
  sdkErrorVisible: boolean
  useCustomKeyboard: boolean
  nativeInputFocusColor: string
  enableZidingyiFeedback?: boolean
  enableYuanbaoFeedback?: boolean
  inputError?: 'incomplete' | null
  showCloseControl: boolean
  themeColor: string
  uiConfig: NormalizedAssistanceMobileAuthUiConfig
  customAgreementChecks: Record<number, boolean>
  onContentSizeChange(): void
  onIdLast4Change(next: string): void
  onNativeInputFocus(): void
  onNativeInputBlur(): void
  onAuthorize(): void
  onClose(): void
  onRetry(): void
  onToggleCustomAgreement(index: number): void
  onOpenCustomAgreement(url: string): void
}
