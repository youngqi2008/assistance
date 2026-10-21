import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PreverifiedAuthWindow } from './PreverifiedAuthWindow'

describe('PreverifiedAuthWindow', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com/sign-pay-pro/verification?flow=preverified&assistanceAuthSessionId=sess-1'),
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the masked phone, success copy, agreements and confirm button (no SDK)', () => {
    render(<PreverifiedAuthWindow />)

    expect(screen.getByText('182****5610')).toBeInTheDocument()
    expect(screen.getByText('您的身份证后四位已校验通过')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《收付通用户信息认证授权协议》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认授权' })).toBeEnabled()
  })

  it('opens the agreement modal when an agreement link is clicked', () => {
    render(<PreverifiedAuthWindow />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '《收付通用户信息认证授权协议》' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '《收付通用户信息认证授权协议》' })).toBeInTheDocument()
  })

  it('posts an ASSISTANCE_AUTH_CANCEL message to the parent on close', () => {
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined)
    render(<PreverifiedAuthWindow />)

    fireEvent.click(screen.getByRole('button', { name: '关闭' }))

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ASSISTANCE_AUTH_CANCEL', sessionId: 'sess-1' }),
      '*',
    )
  })

  it('confirm button is a UI-only placeholder (logs, no throw)', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    render(<PreverifiedAuthWindow />)

    fireEvent.click(screen.getByRole('button', { name: '确认授权' }))
    expect(info).toHaveBeenCalledWith('[PreverifiedAuthWindow] 确认授权 clicked (placeholder)')
  })
})
