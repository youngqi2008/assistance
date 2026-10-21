interface AuthParamsEntryProps {
  values: {
    appId: string
    sign: string
    traceId: string
    timestamp: string
    authType: string
    scope: string
  }
  authTypeOptions: Array<{ value: string; label: string }>
  scopeOptions: Array<{ value: string; label: string }>
  onChange(field: 'appId' | 'sign' | 'traceId' | 'timestamp' | 'authType' | 'scope', value: string): void
  onApply(): void
}

const fieldClassName =
  'mt-2 min-h-11 w-full rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[color:rgba(3,105,161,0.15)]'

export function AuthParamsEntry({ values, authTypeOptions, scopeOptions, onChange, onApply }: AuthParamsEntryProps) {
  return (
    <section className="space-y-4" aria-labelledby="auth-params-entry-title">
      <div className="space-y-1">
        <h3 id="auth-params-entry-title" className="text-sm font-semibold text-[var(--color-text-primary)]">
          授权参数配置
        </h3>
        <p className="text-xs leading-5 text-[var(--color-text-secondary)]">仅用于内部验证授权参数 readiness，不影响主授权页布局。</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          appId
          <input className={fieldClassName} type="text" value={values.appId} onChange={(event) => onChange('appId', event.target.value)} />
        </label>

        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          sign
          <input className={fieldClassName} type="text" value={values.sign} onChange={(event) => onChange('sign', event.target.value)} />
        </label>

        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          traceId
          <input className={fieldClassName} type="text" value={values.traceId} onChange={(event) => onChange('traceId', event.target.value)} />
        </label>

        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          timestamp
          <input className={fieldClassName} type="text" value={values.timestamp} onChange={(event) => onChange('timestamp', event.target.value)} />
        </label>

        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          authType
          <select className={fieldClassName} value={values.authType} onChange={(event) => onChange('authType', event.target.value)}>
            {authTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
          scope
          <select className={fieldClassName} value={values.scope} onChange={(event) => onChange('scope', event.target.value)}>
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:border-[var(--color-brand)]"
      >
        应用授权参数
      </button>
    </section>
  )
}
