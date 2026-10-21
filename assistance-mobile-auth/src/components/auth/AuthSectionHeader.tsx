import type { ReactNode } from 'react'

interface AuthSectionHeaderProps {
  eyebrow?: string
  title: string
  description: string
  aside?: ReactNode
}

export function AuthSectionHeader({ eyebrow, title, description, aside }: AuthSectionHeaderProps) {
  return (
    <header className="space-y-2 text-center">
      {eyebrow ? <p className="text-xs font-medium tracking-[0.06em] text-[var(--color-brand)]">{eyebrow}</p> : null}
      <div className="space-y-2">
        <h2 className="text-[20px] font-semibold leading-tight text-[var(--color-text-primary)]">{title}</h2>
        <p className="mx-auto max-w-[18rem] text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
      </div>
      {aside ? <div className="flex justify-center pt-1">{aside}</div> : null}
    </header>
  )
}
