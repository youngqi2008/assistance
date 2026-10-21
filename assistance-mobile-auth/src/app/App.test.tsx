import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../pages/AuthProbeWindow', () => ({ AuthProbeWindow: () => <div data-testid="probe-window" /> }))
vi.mock('../pages/PreverifiedAuthWindow', () => ({ PreverifiedAuthWindow: () => <div data-testid="preverified-window" /> }))
vi.mock('../pages/AuthHostPage', () => ({
  AuthHostPage: ({ variant = 'default' }: { variant?: string }) => (
    <div data-testid={`auth-host-${variant}`} />
  ),
}))

import App from './App'

describe('App routing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState(null, '', '/')
  })

  it('renders AuthProbeWindow for /verification?mode=probe even with flow=preverified', () => {
    window.history.replaceState(null, '', '/verification?mode=probe&flow=preverified&assistanceAuthSessionId=s1')
    const { getByTestId, queryByTestId } = render(<App />)
    expect(getByTestId('probe-window')).toBeTruthy()
    expect(queryByTestId('preverified-window')).toBeNull()
  })

  it('uses the dedicated Haike host only for /test-page-hk', () => {
    window.history.replaceState(null, '', '/sign-pay-pro-temp/test-page-hk')
    const { getByTestId, queryByTestId } = render(<App />)

    expect(getByTestId('auth-host-haike')).toBeTruthy()
    expect(queryByTestId('auth-host-default')).toBeNull()
  })

  it('keeps the regular test page on the default host', () => {
    window.history.replaceState(null, '', '/sign-pay-pro-temp/test-page')
    const { getByTestId, queryByTestId } = render(<App />)

    expect(getByTestId('auth-host-default')).toBeTruthy()
    expect(queryByTestId('auth-host-haike')).toBeNull()
  })
})
