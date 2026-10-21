import { sdkControlSlotMap } from '../../sdk/slots'
import type { ActionConfig } from '../../types/auth-review'

interface PrimaryActionBarProps {
  primaryAction: ActionConfig
  secondaryAction?: ActionConfig
  loading?: boolean
  disabled?: boolean
  helperText?: string
  onPrimaryAction?(): void
  onSecondaryAction?(): void
}

function getButtonClasses(emphasis: ActionConfig['emphasis']) {
  if (emphasis === 'secondary') {
    return 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-brand)]'
  }

  if (emphasis === 'ghost') {
    return 'border border-transparent bg-transparent text-[var(--color-brand)]'
  }

  return 'bg-[var(--color-brand)] text-white shadow-[0_14px_28px_rgba(3,105,161,0.22)]'
}

export function PrimaryActionBar({
  primaryAction,
  secondaryAction,
  loading = false,
  disabled = false,
  helperText,
  onPrimaryAction,
  onSecondaryAction,
}: PrimaryActionBarProps) {
  const primaryDisabled = disabled || primaryAction.disabled || loading
  const resolvedHelperText = helperText ?? (loading ? '授权请求提交中，请稍候。' : primaryDisabled ? '勾选协议后即可继续。' : '确认当前号码后继续授权。')

  return (
    <section className="space-y-3" aria-labelledby="primary-action-bar-title">
      <p id="primary-action-bar-title" className="text-center text-sm leading-6 text-[var(--color-text-secondary)]">
        {resolvedHelperText}
      </p>

      <div data-slot="submit" className="min-h-[52px]">
        <div id={sdkControlSlotMap.submit} data-sdk-control-slot="submit" />
      </div>

      {secondaryAction ? (
        <div className="text-center">
          <button
            type="button"
            onClick={onSecondaryAction}
            disabled={secondaryAction.disabled || loading}
            className={`inline-flex min-h-10 items-center justify-center px-2 text-sm font-medium transition ${getButtonClasses(
              secondaryAction.emphasis,
            )} disabled:cursor-not-allowed disabled:text-[var(--color-text-secondary)]`}
          >
            {secondaryAction.label}
          </button>
        </div>
      ) : null}
    </section>
  )
}
