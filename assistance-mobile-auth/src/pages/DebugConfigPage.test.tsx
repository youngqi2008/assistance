import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DebugConfigPage } from './DebugConfigPage'

// authType 等字段的 <label> 里还包着预设提示文案（PresetHint），
// 所以这里用前缀正则匹配 label 文本而不是整串精确匹配。
function getFieldInput(label: string) {
  return screen.getByLabelText(new RegExp(`^${label}`))
}

describe('DebugConfigPage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com/sign-pay-pro/debug'),
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all input fields with their default values', () => {
    render(<DebugConfigPage />)

    expect(screen.getByRole('heading', { name: '移动 JSSDK 调试面板' })).toBeInTheDocument()
    expect(getFieldInput('SDK 版本')).toHaveValue('1.0.6-remote-cdn')
    expect(getFieldInput('authType')).toHaveValue('0')
    expect(getFieldInput('scope')).toHaveValue('3ElementsAuthAssistFill')
    expect(getFieldInput('appId')).toHaveValue('300013215094')
    expect(getFieldInput('traceId')).toHaveValue('')
    expect(getFieldInput('timestamp')).toHaveValue('')
  })

  it('on run with empty traceId/timestamp opens an iframe whose URL has all debug* params and synthesised values', () => {
    render(<DebugConfigPage />)

    fireEvent.click(screen.getByRole('button', { name: '运行' }))

    const iframe = document.querySelector('iframe[title="移动 JSSDK 调试 iframe"]') as HTMLIFrameElement | null
    expect(iframe).not.toBeNull()
    const src = iframe?.getAttribute('src') ?? ''
    const params = new URLSearchParams(src.split('?')[1] ?? '')

    expect(params.get('flow')).toBe('debug')
    expect(params.get('debugSdkVersion')).toBe('1.0.6-remote-cdn')
    expect(params.get('debugAuthType')).toBe('0')
    expect(params.get('debugScope')).toBe('3ElementsAuthAssistFill')
    expect(params.get('debugAppId')).toBe('300013215094')
    // user left these blank → page should have synthesised non-empty values at run time
    expect(params.get('debugTraceId') ?? '').not.toBe('')
    expect((params.get('debugTimestamp') ?? '').length).toBeGreaterThanOrEqual(10)
    expect(params.get('assistanceAuthSessionId') ?? '').toMatch(/^debug-/)
  })

  it('preserves user-typed traceId and timestamp through the URL builder', () => {
    render(<DebugConfigPage />)

    fireEvent.change(getFieldInput('traceId'), { target: { value: 'fixed-trace-id' } })
    fireEvent.change(getFieldInput('timestamp'), { target: { value: '20260521120000000' } })
    fireEvent.click(screen.getByRole('button', { name: '运行' }))

    const iframe = document.querySelector('iframe[title="移动 JSSDK 调试 iframe"]') as HTMLIFrameElement | null
    const params = new URLSearchParams((iframe?.getAttribute('src') ?? '').split('?')[1] ?? '')
    expect(params.get('debugTraceId')).toBe('fixed-trace-id')
    expect(params.get('debugTimestamp')).toBe('20260521120000000')
  })

  it('renders the returned payload when a DEBUG_RESULT message arrives', () => {
    render(<DebugConfigPage />)

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'DEBUG_RESULT',
            payload: {
              stage: 'success',
              code: '103000',
              token: 'tok_test_123',
              idLast4: '1234',
              encryptPublicKey: 'pub_key',
              traceId: 'trace_x',
            },
          },
        }),
      )
    })

    expect(screen.getByText(/DEBUG_RESULT/)).toBeInTheDocument()
    // Highlighted fields surfaced in the dl section
    expect(screen.getByText('tok_test_123')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
    expect(screen.getByText('pub_key')).toBeInTheDocument()
  })

  it('reset returns the form to its initial defaults and clears the iframe', () => {
    render(<DebugConfigPage />)

    fireEvent.change(getFieldInput('authType'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: '运行' }))
    expect(document.querySelector('iframe[title="移动 JSSDK 调试 iframe"]')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '重置默认' }))
    expect(getFieldInput('authType')).toHaveValue('0')
    expect(document.querySelector('iframe[title="移动 JSSDK 调试 iframe"]')).toBeNull()
  })
})
