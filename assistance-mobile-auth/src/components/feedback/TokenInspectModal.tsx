import { useEffect, useState } from 'react'

export interface TokenInspectData {
  traceId: string
  appId: string
  token: string
  encryptPublicKey: string
  idLast4: string
}

interface Props {
  data: TokenInspectData
  onCloseAndContinue(): void
}

const COPY_TOAST_MS = 1500

function formatForClipboard(data: TokenInspectData): string {
  return [
    `traceId: ${data.traceId}`,
    `appId: ${data.appId}`,
    `token: ${data.token}`,
    `encryptPublicKey: ${data.encryptPublicKey}`,
    `idLast4: ${data.idLast4}`,
  ].join('\n')
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to legacy path
    }
  }
  // Legacy fallback for iOS Safari < 13.4 and older WebViews
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      return ok
    } catch {
      return false
    }
  }
  return false
}

export function TokenInspectModal({ data, onCloseAndContinue }: Props) {
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (!toastVisible) return
    const handle = window.setTimeout(() => setToastVisible(false), COPY_TOAST_MS)
    return () => window.clearTimeout(handle)
  }, [toastVisible])

  async function handleCopyAll() {
    const ok = await copyToClipboard(formatForClipboard(data))
    if (ok) setToastVisible(true)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-inspect-modal-title"
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 px-4 py-8 sm:items-center"
    >
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="px-5 pb-3 pt-5">
          <h2 id="token-inspect-modal-title" className="text-[18px] font-semibold leading-tight text-[var(--color-text-primary)]">
            JSSDK Token 调试信息
          </h2>
          <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
            仅在测试 / 挡板环境下显示。用于联调时核对 token 链路。
          </p>
        </div>

        <dl className="max-h-[60vh] divide-y divide-[#eef1f4] overflow-y-auto px-5 text-[13px] leading-5">
          {(
            [
              ['traceId', data.traceId],
              ['appId', data.appId],
              ['token', data.token],
              ['encryptPublicKey', data.encryptPublicKey],
              ['idLast4', data.idLast4],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="py-3">
              <dt className="text-[12px] font-medium text-[var(--color-text-secondary)]">{label}</dt>
              <dd className="mt-1 break-all font-mono text-[12px] text-[var(--color-text-primary)]">
                {value || <span className="text-[var(--color-text-secondary)]">(empty)</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-3 border-t border-[#eef1f4] px-5 py-4">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex h-11 flex-1 items-center justify-center rounded-[10px] border border-[#c8ccd1] bg-white text-[15px] font-medium text-[var(--color-text-primary)] active:bg-[#f5f6f8]"
          >
            复制全部
          </button>
          <button
            type="button"
            onClick={onCloseAndContinue}
            className="flex h-11 flex-1 items-center justify-center rounded-[10px] bg-[#ff2d55] text-[15px] font-semibold text-white active:translate-y-px"
          >
            关闭并继续
          </button>
        </div>
      </div>

      {toastVisible ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-black/80 px-4 py-2 text-[13px] text-white"
        >
          复制成功
        </div>
      ) : null}
    </div>
  )
}
