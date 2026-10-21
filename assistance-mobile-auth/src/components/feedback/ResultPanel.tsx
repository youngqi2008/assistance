interface ResultPanelAction {
  kind?: 'retry-auth' | 'refresh-result' | 'retry-fetch'
  label: string
  onAction?: () => void
  disabled?: boolean
}

interface ResultPanelTokenSection {
  title: '授权凭证已接收' | '授权凭证暂未返回' | '授权凭证已失效，请重新授权'
  description: string
  statusLabel?: string
  summaryValue?: string
}

interface ResultPanelIdentityField {
  label: '姓名' | '手机号' | '身份证号'
  value: string
}

interface ResultPanelIdentitySection {
  title: string
  description: string
  fields?: readonly ResultPanelIdentityField[]
}

interface ResultPanelProps {
  title?: string
  description?: string
  tokenSection?: ResultPanelTokenSection
  identitySection?: ResultPanelIdentitySection
  action?: ResultPanelAction
}

function SubsectionCard({
  title,
  description,
  badge,
  children,
  labelledBy,
}: {
  title: string
  description: string
  badge?: string
  children?: React.ReactNode
  labelledBy: string
}) {
  return (
    <section
      className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4"
      aria-labelledby={labelledBy}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 id={labelledBy} className="text-base font-semibold text-[var(--color-text-primary)]">
            {title}
          </h4>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
            {badge}
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  )
}

function getActionCopy(action: ResultPanelAction) {
  switch (action.kind) {
    case 'retry-auth':
      return {
        title: '重新发起授权',
        description: '如当前授权已失效，可重新发起本次授权并继续完成校验。',
        buttonLabel: '重新授权',
      }
    case 'refresh-result':
      return {
        title: '继续查看结果',
        description: '如结果仍在处理中，可直接重新获取当前授权结果。',
        buttonLabel: '重新获取结果',
      }
    case 'retry-fetch':
    default:
      return {
        title: '继续查看结果',
        description: '如信息暂未返回，可直接重新获取当前授权结果。',
        buttonLabel: '重新获取结果',
      }
  }
}

export function ResultPanel({
  title = '查看授权结果',
  description = '授权完成后，系统会在当前页面继续展示凭证状态与身份信息结果；如暂未返回，可直接重新获取当前授权结果。',
  tokenSection,
  identitySection,
  action,
}: ResultPanelProps) {
  const identityFields = identitySection?.fields ?? []
  const actionCopy = action ? getActionCopy(action) : null

  return (
    <section
      className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
      aria-labelledby="result-panel-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-[var(--color-brand)] uppercase">授权结果</p>
          <h3 id="result-panel-title" className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-dark)]">
          当前流程
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {tokenSection ? (
          <SubsectionCard
            title={tokenSection.title}
            description={tokenSection.description}
            badge={tokenSection.statusLabel ?? '凭证状态'}
            labelledBy="result-panel-token-title"
          >
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {tokenSection.summaryValue ?? tokenSection.title}
            </p>
          </SubsectionCard>
        ) : null}

        {identitySection ? (
          <section
            className="rounded-3xl border border-[var(--color-border)] bg-white p-4"
            aria-labelledby="result-panel-identity-title"
            aria-label="身份信息结果"
          >
            <h4 id="result-panel-identity-title" className="text-base font-semibold text-[var(--color-text-primary)]">
              {identitySection.title}
            </h4>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{identitySection.description}</p>

            {identityFields.length > 0 ? (
              <dl className="mt-4 space-y-3">
                {identityFields.map((field) => (
                  <div
                    key={field.label}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3"
                  >
                    <dt className="text-sm font-semibold text-[var(--color-text-secondary)]">{field.label}</dt>
                    <dd className="text-sm font-medium text-[var(--color-text-primary)]">{field.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        ) : null}
      </div>

      {action && actionCopy ? (
        <div className="mt-4 rounded-3xl border border-[var(--color-border)] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{actionCopy.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{actionCopy.description}</p>
            </div>
            <button
              type="button"
              onClick={action.onAction}
              disabled={action.disabled}
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionCopy.buttonLabel}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
