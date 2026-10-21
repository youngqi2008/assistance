import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SdkLoadingSkeleton } from './SdkLoadingSkeleton'

describe('SdkLoadingSkeleton', () => {
  it('renders an aria-busy region with skeleton placeholders for SDK loading state', () => {
    const { container } = render(<SdkLoadingSkeleton />)
    const region = screen.getByRole('region', { name: '加载中' })
    expect(region).toHaveAttribute('aria-busy', 'true')
    const placeholders = container.querySelectorAll('.animate-pulse')
    expect(placeholders.length).toBeGreaterThanOrEqual(9)
  })

  it('renders four input grid placeholders to mirror the 4-digit ID input layout', () => {
    const { container } = render(<SdkLoadingSkeleton />)
    const grid = container.querySelector('.grid-cols-4')
    expect(grid).not.toBeNull()
    expect(grid?.querySelectorAll('.h-\\[64px\\]')).toHaveLength(4)
  })

  it('renders a CTA button-shaped placeholder at the bottom', () => {
    const { container } = render(<SdkLoadingSkeleton />)
    // 按钮骨架: h-[52px] + animate-pulse
    const buttonPlaceholder = container.querySelector('.h-\\[52px\\].animate-pulse')
    expect(buttonPlaceholder).not.toBeNull()
  })
})
