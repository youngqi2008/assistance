import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SdkErrorPanel } from './SdkErrorPanel'

describe('SdkErrorPanel', () => {
  it('renders an alert region with the provided uiText', () => {
    render(<SdkErrorPanel errorKind="carrier-mismatch" uiText="该号码不在中国移动网络环境，请切换到中国移动数据网络后重试。" />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('该号码不在中国移动网络环境')
  })

  it('renders the SDK error code badge when code prop is provided', () => {
    render(<SdkErrorPanel errorKind="carrier-mismatch" uiText="..." code="110031" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('110031')
    expect(alert).toHaveTextContent('错误代码')
  })

  it('shows network-tone title for network-timeout errorKind', () => {
    render(<SdkErrorPanel errorKind="network-timeout" uiText="网络较慢加载超时..." />)
    expect(screen.getByText('网络较慢')).toBeInTheDocument()
  })

  it('shows carrier-tone title for carrier-mismatch errorKind', () => {
    render(<SdkErrorPanel errorKind="carrier-mismatch" uiText="..." />)
    expect(screen.getByText('请使用中国移动数据网络')).toBeInTheDocument()
  })

  it('shows sdk-init-failed tone title for sdk-init-failed errorKind', () => {
    render(<SdkErrorPanel errorKind="sdk-init-failed" uiText="..." />)
    expect(screen.getByText('验证服务异常')).toBeInTheDocument()
  })

  it('omits code badge when code prop is not provided', () => {
    render(<SdkErrorPanel errorKind="unknown" uiText="..." />)
    expect(screen.queryByText(/错误代码/)).not.toBeInTheDocument()
  })

  describe('retry button', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not render the retry button when onRetry is omitted', () => {
      render(<SdkErrorPanel errorKind="carrier-mismatch" uiText="..." />)
      expect(screen.queryByRole('button', { name: /重试/ })).not.toBeInTheDocument()
    })

    it('renders the retry button and invokes onRetry on first click', () => {
      const onRetry = vi.fn()
      render(<SdkErrorPanel errorKind="carrier-mismatch" uiText="..." onRetry={onRetry} />)
      const button = screen.getByRole('button', { name: '重试' })
      expect(button).toBeEnabled()

      fireEvent.click(button)

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('重试 (10s)')
    })

    it('counts down each second and re-enables after the disabled window', () => {
      const onRetry = vi.fn()
      render(<SdkErrorPanel errorKind="carrier-mismatch" uiText="..." onRetry={onRetry} />)
      const button = screen.getByRole('button', { name: '重试' })

      fireEvent.click(button)
      expect(button).toHaveTextContent('重试 (10s)')

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(button).toHaveTextContent('重试 (9s)')

      act(() => {
        vi.advanceTimersByTime(8000)
      })
      expect(button).toHaveTextContent('重试 (1s)')

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(button).toHaveTextContent('重试')
      expect(button).toBeEnabled()
    })

    it('ignores clicks while the disabled window is active', () => {
      const onRetry = vi.fn()
      render(<SdkErrorPanel errorKind="carrier-mismatch" uiText="..." onRetry={onRetry} />)
      const button = screen.getByRole('button', { name: '重试' })

      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('honors a custom retryDisabledSeconds value', () => {
      const onRetry = vi.fn()
      render(
        <SdkErrorPanel errorKind="carrier-mismatch" uiText="..." onRetry={onRetry} retryDisabledSeconds={3} />,
      )
      const button = screen.getByRole('button', { name: '重试' })

      fireEvent.click(button)
      expect(button).toHaveTextContent('重试 (3s)')

      act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(button).toHaveTextContent('重试')
      expect(button).toBeEnabled()
    })
  })
})
