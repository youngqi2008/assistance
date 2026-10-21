import { useEffect, useRef, useState } from 'react'

import type { MobileAuthSdkErrorKind } from '../../sdk/types'

interface SdkErrorPanelProps {
  errorKind: MobileAuthSdkErrorKind
  uiText: string
  code?: string
  steps?: readonly string[]
  onRetry?: () => void
  retryDisabledSeconds?: number
}

const titleByKind = {
  'network-timeout': '网络较慢',
  'carrier-mismatch': '请使用中国移动数据网络',
  'sdk-init-failed': '验证服务异常',
  'sdk-disabled': 'SDK 已禁用',
  'session-invalid': '会话已失效',
  unknown: '验证未完成',
} satisfies Record<MobileAuthSdkErrorKind, string>

const DEFAULT_RETRY_DISABLED_SECONDS = 10

export function SdkErrorPanel({
  errorKind,
  uiText,
  code,
  steps,
  onRetry,
  retryDisabledSeconds = DEFAULT_RETRY_DISABLED_SECONDS,
}: SdkErrorPanelProps) {
  const title = titleByKind[errorKind]
  const [secondsLeft, setSecondsLeft] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  function handleRetryClick() {
    if (!onRetry || secondsLeft > 0) {
      return
    }

    onRetry()
    setSecondsLeft(retryDisabledSeconds)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const retryDisabled = secondsLeft > 0
  const retryLabel = retryDisabled ? `重试 (${secondsLeft}s)` : '重试'

  return (
    <section className="text-[15px] leading-7" role="alert" aria-labelledby="sdk-error-panel-title">
      <h3 id="sdk-error-panel-title" className="text-[20px] font-semibold leading-tight text-[var(--color-text-primary)]">
        {title}
      </h3>
      {code ? (
        <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">错误代码 {code}</p>
      ) : null}
      <p className="mt-3 text-[var(--color-text-primary)]">{uiText}</p>
      {steps && steps.length > 0 ? (
        <ol className="mt-4 space-y-2 text-[var(--color-text-secondary)]">
          {steps.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 tabular-nums text-[var(--color-text-secondary)]">{idx + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {onRetry ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={handleRetryClick}
            disabled={retryDisabled}
            aria-label={retryDisabled ? `${retryLabel}（请等待）` : '重试'}
            className="flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-[#d6dbe1] bg-white px-4 text-[15px] font-medium text-[var(--color-text-primary)] active:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:border-[#edf0f2] disabled:bg-[#f6f7f7] disabled:text-[#aeb5bb] tabular-nums"
          >
            {retryLabel}
          </button>
        </div>
      ) : null}
    </section>
  )
}
