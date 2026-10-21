import { CircleAlert, LoaderCircle, ShieldCheck } from 'lucide-react'

import type { StatusTone } from '../../types/auth-review'

interface StatusFeedbackCardProps {
  tone: StatusTone
  title: string
  description: string
  hint?: string
}

const toneConfig = {
  neutral: {
    icon: ShieldCheck,
    badge: '待确认',
    cardClass: 'border-[var(--color-border)] bg-[var(--color-surface)]',
    iconClass: 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]',
  },
  progress: {
    icon: LoaderCircle,
    badge: '处理中',
    cardClass: 'border-[var(--color-border)] bg-[var(--color-surface)]',
    iconClass: 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]',
  },
  success: {
    icon: ShieldCheck,
    badge: '已完成',
    cardClass: 'border-[color:rgba(21,128,61,0.18)] bg-[color:rgba(21,128,61,0.06)]',
    iconClass: 'bg-white text-[var(--color-success)]',
  },
  warning: {
    icon: CircleAlert,
    badge: '已取消',
    cardClass: 'border-[color:rgba(217,119,6,0.18)] bg-[color:rgba(217,119,6,0.08)]',
    iconClass: 'bg-white text-[var(--color-warning)]',
  },
  error: {
    icon: CircleAlert,
    badge: '未完成',
    cardClass: 'border-[color:rgba(220,38,38,0.18)] bg-[color:rgba(220,38,38,0.08)]',
    iconClass: 'bg-white text-[var(--color-error)]',
  },
} satisfies Record<
  StatusTone,
  {
    icon: typeof ShieldCheck
    badge: string
    cardClass: string
    iconClass: string
  }
>

export function StatusFeedbackCard({ tone, title, description, hint }: StatusFeedbackCardProps) {
  const config = toneConfig[tone]
  const Icon = config.icon
  const isProgress = tone === 'progress'

  return (
    <section
      className={`rounded-[28px] border p-5 shadow-[var(--shadow-card)] ${config.cardClass}`}
      aria-live={isProgress ? 'polite' : 'off'}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] ${config.iconClass}`}>
          <Icon className={`h-5 w-5 ${isProgress ? 'animate-spin' : ''}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">{config.badge}</span>
          </div>
          <p className="text-base leading-7 text-[var(--color-text-secondary)]">{description}</p>
          {hint ? <p className="text-sm leading-6 text-[var(--color-text-primary)]">{hint}</p> : null}
        </div>
      </div>
    </section>
  )
}
