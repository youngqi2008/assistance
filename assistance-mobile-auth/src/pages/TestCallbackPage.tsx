import { useEffect, useMemo, useState } from 'react'

import { createSdkSessionClient, normalizeSdkSessionIdentityForDisplay, type SdkSessionIdentity } from '../api/sdkSessionClient'

type QueryState =
  | { status: 'missing-token' }
  | { status: 'loading' }
  | { status: 'success'; message: string; identity: SdkSessionIdentity }
  | { status: 'error'; message: string }

function readCustomerCredentials() {
  const appId = import.meta.env.VITE_SFT_CUSTOMER_APP_ID?.trim() || ''
  const appKey = import.meta.env.VITE_SFT_CUSTOMER_APP_KEY?.trim() || ''

  if (!appId || !appKey) {
    throw new Error('缺少客户 appId/appKey，请通过 VITE_SFT_CUSTOMER_APP_ID / VITE_SFT_CUSTOMER_APP_KEY 配置。')
  }

  return {
    appId,
    appKey,
  }
}

function maskToken(token: string) {
  if (token.length <= 16) {
    return token
  }

  return `${token.slice(0, 10)}...${token.slice(-6)}`
}

export function TestCallbackPage() {
  const authToken = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return new URLSearchParams(window.location.search).get('authToken')?.trim() ?? ''
  }, [])
  const [queryState, setQueryState] = useState<QueryState>(() => (authToken ? { status: 'loading' } : { status: 'missing-token' }))

  useEffect(() => {
    if (!authToken) {
      return
    }

    let appId: string
    let appKey: string

    try {
      ;({ appId, appKey } = readCustomerCredentials())
    } catch (error: unknown) {
      setQueryState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
      return
    }

    let cancelled = false

    createSdkSessionClient()
      .queryResult({ appId, appKey, authToken })
      .then((result) => {
        if (!cancelled) {
          setQueryState({
            status: 'success',
            message: result.message,
            identity: normalizeSdkSessionIdentityForDisplay(result.identity),
          })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setQueryState({ status: 'error', message: error instanceof Error ? error.message : String(error) })
        }
      })

    return () => {
      cancelled = true
    }
  }, [authToken])

  return (
    <main className="min-h-dvh bg-[#f5f6f8] px-5 pb-8 pt-5 text-[var(--color-text-primary)]" aria-label="授权回跳测试页">
      <header className="flex min-h-11 items-center justify-center">
        <h1 className="text-lg font-semibold">授权回跳测试页</h1>
      </header>

      <section className="mt-6 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold text-[#1d4ed8]">H5 转跳授权结果</p>
        {authToken ? (
          <p className="mt-3 break-all rounded-lg bg-[#eff6ff] px-3 py-2 text-xs leading-5 text-[#1d4ed8]">
            authToken: {maskToken(authToken)}
          </p>
        ) : null}

        {queryState.status === 'missing-token' ? <p className="mt-4 text-sm text-[#be123c]">缺少 authToken，无法查询授权结果。</p> : null}
        {queryState.status === 'loading' ? <p className="mt-4 text-sm text-[#8a8f98]">正在查询授权结果...</p> : null}
        {queryState.status === 'error' ? <p className="mt-4 text-sm text-[#be123c]">{queryState.message}</p> : null}
        {queryState.status === 'success' ? (
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[#8a8f98]">姓名</dt>
              <dd className="font-semibold">{queryState.identity.displayName}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#8a8f98]">手机号</dt>
              <dd className="font-semibold">{queryState.identity.maskedMobile}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#8a8f98]">身份证号</dt>
              <dd className="font-semibold">{queryState.identity.maskedIdCard}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </main>
  )
}
