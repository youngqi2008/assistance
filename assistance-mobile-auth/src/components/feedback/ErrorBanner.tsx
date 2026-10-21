interface ErrorBannerProps {
  title?: string
  code?: string
  reason: string
  suggestion: string
}

export function ErrorBanner({
  title = '异常反馈说明',
  code = 'ERR-02',
  reason,
  suggestion,
}: ErrorBannerProps) {
  return (
    <section
      className="rounded-[24px] border border-[color:rgba(220,38,38,0.18)] bg-[color:rgba(220,38,38,0.08)] p-4"
      role="alert"
      aria-labelledby="error-banner-title"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="error-banner-title" className="text-base font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-error)]">
          错误代码 {code}
        </span>
      </div>

      <div className="mt-3 space-y-3 text-sm leading-6">
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">错误原因</p>
          <p className="text-[var(--color-text-secondary)]">{reason}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">建议处理</p>
          <p className="text-[var(--color-text-secondary)]">建议：{suggestion}</p>
        </div>
      </div>
    </section>
  )
}
