import type { AuthReviewScenario } from '../../types/auth-review'

interface PhoneInfoBlockProps {
  scene: AuthReviewScenario['scene']
  phoneLabel: string
  phoneValue: string
  assistiveText: string
}

export function PhoneInfoBlock({ scene, phoneLabel, phoneValue, assistiveText }: PhoneInfoBlockProps) {
  return (
    <section
      aria-label="授权号码信息"
      className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-7 text-center"
    >
      <p className="text-sm text-[var(--color-text-secondary)]">{phoneLabel}</p>
      <p className="mt-4 text-[34px] font-semibold tracking-[0.04em] text-[var(--color-text-primary)]">{phoneValue}</p>
      <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">{scene === 'native-number' ? '本机号码' : '短信验证号码'}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{assistiveText}</p>
    </section>
  )
}
