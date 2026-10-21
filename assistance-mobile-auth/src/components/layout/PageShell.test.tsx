import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PageShell } from './PageShell'

describe('PageShell', () => {
  it('avoids the old floating-card mobile shell class combination', () => {
    const { container } = render(
      <PageShell title="移动认证授权" description="用于确认当前手机号的授权页面。">
        <div>页面内容</div>
      </PageShell>,
    )

    const mobileWrapper = container.firstElementChild as HTMLElement | null
    const authMain = screen.getByRole('main', { name: '移动认证授权' })

    expect(mobileWrapper).not.toBeNull()
    expect(mobileWrapper).not.toHaveClass('min-h-dvh')
    expect(mobileWrapper).not.toHaveClass('px-4')
    expect(mobileWrapper).not.toHaveClass('py-5')
    expect(authMain).not.toHaveClass('rounded-[32px]')
    expect(authMain).not.toHaveClass('shadow-[var(--shadow-shell)]')
  })
})
