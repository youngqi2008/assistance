import { AuthHostPage } from '../pages/AuthHostPage'
import { ProfiledVerificationWindow } from '../pages/ProfiledVerificationWindow'
import { PreverifiedAuthWindow } from '../pages/PreverifiedAuthWindow'
import { DebugConfigPage } from '../pages/DebugConfigPage'
import { DebugAuthWindow } from '../pages/DebugAuthWindow'
import { TestCallbackPage } from '../pages/TestCallbackPage'
import { AuthProbeWindow } from '../pages/AuthProbeWindow'
import { AgreementDocPage } from '../pages/AgreementDocPage'

function isNonProdBuild() {
  return (import.meta.env.VITE_MOBILE_AUTH_ENV ?? '').trim().toLowerCase() !== 'prod'
}

function shouldRenderVerificationWindow() {
  if (typeof window === 'undefined') {
    return false
  }

  const searchParams = new URLSearchParams(window.location.search)

  return window.location.pathname.endsWith('/verification') || searchParams.get('assistanceAuthWindow') === '1'
}

function shouldRenderDirectAuthPage() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.pathname.endsWith('/auth')
}

function shouldRenderTestCallbackPage() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.pathname.endsWith('/test-callback')
}

function getFlowParam() {
  if (typeof window === 'undefined') {
    return null
  }

  return new URLSearchParams(window.location.search).get('flow')
}

function getModeParam() {
  if (typeof window === 'undefined') {
    return null
  }

  return new URLSearchParams(window.location.search).get('mode')
}

function shouldRenderDebugConfigPage() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.pathname.endsWith('/debug') && isNonProdBuild()
}

function shouldRenderHaikeTestPage() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.pathname.replace(/\/+$/, '').endsWith('/test-page-hk')
}

export default function App() {
  if (getFlowParam() === 'agreement') {
    return <AgreementDocPage />
  }

  if (shouldRenderDebugConfigPage()) {
    return <DebugConfigPage />
  }

  if (shouldRenderTestCallbackPage()) {
    return <TestCallbackPage />
  }

  if (shouldRenderDirectAuthPage()) {
    return <ProfiledVerificationWindow />
  }

  if (shouldRenderVerificationWindow()) {
    if (getModeParam() === 'probe') {
      return <AuthProbeWindow />
    }

    const flow = getFlowParam()

    if (flow === 'debug' && isNonProdBuild()) {
      return <DebugAuthWindow />
    }

    if (flow === 'preverified') {
      return <PreverifiedAuthWindow />
    }

    return <ProfiledVerificationWindow />
  }

  if (shouldRenderHaikeTestPage()) {
    return <AuthHostPage variant="haike" />
  }

  return <AuthHostPage />
}
