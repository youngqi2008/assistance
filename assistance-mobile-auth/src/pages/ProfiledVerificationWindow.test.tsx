import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const resolveAppProfileMock = vi.fn()

vi.mock('./appProfiles', () => ({
  resolveAppProfile: (appId: string | null) => resolveAppProfileMock(appId),
}))
vi.mock('./AuthVerificationWindow', () => ({
  AuthVerificationWindow: () => <div data-testid="default-verification-window" />,
}))

import { ProfiledVerificationWindow } from './ProfiledVerificationWindow'

describe('ProfiledVerificationWindow', () => {
  afterEach(() => {
    resolveAppProfileMock.mockReset()
    window.history.replaceState(null, '', '/')
  })

  it('renders the profile Page variant when the profile provides one', () => {
    window.history.replaceState(null, '', '/sign-pay-pro/assist/verification?appId=tpl-app')
    resolveAppProfileMock.mockReturnValue({
      appId: 'tpl-app',
      label: 'tpl',
      Page: () => <div data-testid="custom-template-page" />,
    })

    render(<ProfiledVerificationWindow />)

    expect(resolveAppProfileMock).toHaveBeenCalledWith('tpl-app')
    expect(screen.getByTestId('custom-template-page')).toBeInTheDocument()
  })

  it('renders the default window when profile has no Page or is unmatched', () => {
    window.history.replaceState(null, '', '/sign-pay-pro/assist/verification?appId=ui-only')
    resolveAppProfileMock.mockReturnValue({ appId: 'ui-only', label: 'ui' })

    render(<ProfiledVerificationWindow />)

    expect(screen.getByTestId('default-verification-window')).toBeInTheDocument()
  })
})
