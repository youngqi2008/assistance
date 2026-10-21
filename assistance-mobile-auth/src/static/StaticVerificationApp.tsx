import { AgreementDocPage } from '../pages/AgreementDocPage'
import { AuthProbeWindow } from '../pages/AuthProbeWindow'
import { ProfiledVerificationWindow } from '../pages/ProfiledVerificationWindow'

export function isStaticVerificationRoute(pathname: string): boolean {
  const normalizedPath = pathname.replace(/\/+$/, '')

  return normalizedPath.endsWith('/verification')
}

function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams()
  }

  return new URLSearchParams(window.location.search)
}

export function StaticVerificationApp() {
  if (typeof window === 'undefined' || !isStaticVerificationRoute(window.location.pathname)) {
    return null
  }

  const searchParams = getSearchParams()

  if (searchParams.get('mode') === 'probe') {
    return <AuthProbeWindow />
  }

  if (searchParams.get('flow') === 'agreement') {
    return <AgreementDocPage />
  }

  return <ProfiledVerificationWindow />
}
