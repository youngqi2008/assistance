import { useId, useState, type ReactNode } from 'react'

interface PageShellProps {
  title: string
  description: string
  badge?: string
  reviewLabel?: string
  controls?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function PageShell({
  title,
  description,
  badge = '中国移动认证服务',
  reviewLabel = '静态评审版',
  controls,
  footer,
  children,
}: PageShellProps) {
  const [controlsOpen, setControlsOpen] = useState(false)
  const controlsId = useId()

  return (
    <div className="w-full bg-[var(--color-page-background,transparent)]">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 sm:py-6">
        <main
          className="border-y border-[var(--color-border)] bg-[var(--color-surface)] sm:overflow-hidden sm:rounded-[28px] sm:border sm:shadow-[var(--shadow-card)]"
          aria-label="移动认证授权"
        >
          <header className="px-5 pb-4 pt-5 text-center">
            <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">{badge}</p>
            <div className="mt-2 space-y-1">
              <h1 className="text-[26px] font-semibold leading-tight text-[var(--color-text-primary)]">{title}</h1>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
            </div>
          </header>

          <div className="space-y-4 px-5 pb-5">{children}</div>

          {footer ? <footer className="px-0 pb-0 pt-0">{footer}</footer> : null}
        </main>

        {controls ? (
          <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:rounded-[18px] sm:border sm:shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">其他验证方式</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">需要时再展开查看短信验证和状态切换。</p>
              </div>
              <button
                type="button"
                aria-expanded={controlsOpen}
                aria-controls={controlsId}
                onClick={() => setControlsOpen((open) => !open)}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-[var(--color-brand)] transition hover:text-[var(--color-brand-dark)]"
              >
                {controlsOpen ? '收起' : '展开'}
              </button>
            </div>

            {controlsOpen ? (
              <div id={controlsId} className="mt-3 border-t border-[var(--color-border)] pt-3">
                <p className="sr-only">{reviewLabel}</p>
                {controls}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  )
}
