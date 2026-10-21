import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../pages/AuthVerificationWindow', () => ({
  AuthVerificationWindow: () => <div data-testid="static-verification-window" />,
}))
vi.mock('../pages/AuthProbeWindow', () => ({
  AuthProbeWindow: () => <div data-testid="static-probe-window" />,
}))
vi.mock('../pages/AgreementDocPage', () => ({
  AgreementDocPage: () => <div data-testid="static-agreement-page" />,
}))

import { StaticVerificationApp, isStaticVerificationRoute } from './StaticVerificationApp'

describe('StaticVerificationApp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState(null, '', '/')
  })

  it('recognizes any base-prefixed /verification as a static app route', () => {
    expect(isStaticVerificationRoute('/verification')).toBe(true)
    expect(isStaticVerificationRoute('/sign-pay-pro/verification')).toBe(true)
    expect(isStaticVerificationRoute('/sign-pay-pro/verification/')).toBe(true)
    expect(isStaticVerificationRoute('/sign-pay-pro/assist/verification')).toBe(true)
    expect(isStaticVerificationRoute('/foo/verification')).toBe(true)
    expect(isStaticVerificationRoute('/sign-pay-pro/test-page')).toBe(false)
    expect(isStaticVerificationRoute('/sign-pay-pro/test-page-hk')).toBe(false)
    expect(isStaticVerificationRoute('/sign-pay-pro/debug')).toBe(false)
    expect(isStaticVerificationRoute('/sign-pay-pro/auth')).toBe(false)
    expect(isStaticVerificationRoute('/sign-pay-pro/verifications')).toBe(false)
    expect(isStaticVerificationRoute('/sign-pay-pro/test-callback')).toBe(false)
  })

  it('renders the iframe authorization page under the assist layer', () => {
    window.history.replaceState(null, '', '/sign-pay-pro/assist/verification?assistanceAuthSessionId=s1')

    render(<StaticVerificationApp />)

    expect(screen.getByTestId('static-verification-window')).toBeInTheDocument()
  })

  it('renders the iframe authorization page for /verification', () => {
    window.history.replaceState(null, '', '/sign-pay-pro/verification?assistanceAuthSessionId=s1')

    render(<StaticVerificationApp />)

    expect(screen.getByTestId('static-verification-window')).toBeInTheDocument()
  })

  it('renders the probe page for /verification?mode=probe even if flow is present', () => {
    window.history.replaceState(null, '', '/sign-pay-pro/verification?mode=probe&flow=agreement&assistanceAuthSessionId=s1')

    render(<StaticVerificationApp />)

    expect(screen.getByTestId('static-probe-window')).toBeInTheDocument()
  })

  it('renders the agreement reader for /verification?flow=agreement', () => {
    window.history.replaceState(null, '', '/sign-pay-pro/verification?flow=agreement&doc=entry')

    render(<StaticVerificationApp />)

    expect(screen.getByTestId('static-agreement-page')).toBeInTheDocument()
  })

  it.each(['/sign-pay-pro/test-page', '/sign-pay-pro/test-page-hk'])('renders nothing for excluded internal route %s', (path) => {
    window.history.replaceState(null, '', path)

    const { container } = render(<StaticVerificationApp />)

    expect(container).toBeEmptyDOMElement()
  })
})
