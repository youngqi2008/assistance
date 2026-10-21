import { useEffect, useMemo, useRef, useState } from 'react'

import { createMobileAuthSdkFacade, type MobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import { loadMobileAuthSdkResources } from '../sdk/resourceLoader'
import { sdkControlSlotMap } from '../sdk/slots'
import { createMobileAuthStyleOption } from '../sdk/styleOption'
import type { MobileAuthSdkCallbackPayload, MobileAuthSdkConfig, MobileAuthSdkLoadState } from '../sdk/types'
import {
  ASSISTANCE_AUTH_CANCEL,
  createAssistanceAuthMessage,
} from '../wrapper/verificationBridge'
import { mobileOfficialJssdkResource } from '../wrapper/vendor/mobile-jssdk.meta'
import { normalizeMobileAuthType } from '../sdk/mobileAuthSignature'

type DebugSdkVersion = '1.0.6-remote-cdn'

function readSearch(): URLSearchParams {
  return new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
}

function safeStringifyPayload(value: unknown): Record<string, unknown> {
  try {
    return JSON.parse(
      JSON.stringify(value, (_k, v) => (typeof v === 'function' ? '[Function]' : v)),
    )
  } catch (error) {
    return { error: true, message: error instanceof Error ? error.message : String(error) }
  }
}

function postDebugResult(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.parent.postMessage({ type: 'DEBUG_RESULT', payload }, '*')
}

export function DebugAuthWindow() {
  const params = useMemo(readSearch, [])
  const sessionId = params.get('assistanceAuthSessionId') ?? ''
  const debugVersion: DebugSdkVersion = '1.0.6-remote-cdn'
  const [loadState, setLoadState] = useState<MobileAuthSdkLoadState>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [stage, setStage] = useState<'loading' | 'ready' | 'submitted' | 'done' | 'error'>('loading')
  const [lastEvent, setLastEvent] = useState<string>('SDK 加载中…')
  const facadeRef = useRef<MobileAuthSdkFacade | null>(null)
  const initializedRef = useRef(false)

  function postClose() {
    if (typeof window === 'undefined') return
    window.parent.postMessage(
      createAssistanceAuthMessage(ASSISTANCE_AUTH_CANCEL, sessionId, { message: '调试模式：用户关闭' }),
      '*',
    )
  }

  useEffect(() => {
    const resource = mobileOfficialJssdkResource
    const config: MobileAuthSdkConfig = {
      enabled: true,
      mode: 'live',
      jsUrl: resource.jsUrl,
      cssUrl: resource.cssUrl,
      debugEntry: true,
      authParams: {
        version: params.get('debugVersion') ?? '',
        appId: params.get('debugAppId') ?? '',
        sign: params.get('debugSign') ?? '',
        traceId: params.get('debugTraceId') ?? '',
        timestamp: params.get('debugTimestamp') ?? '',
        authType: normalizeMobileAuthType(params.get('debugAuthType') ?? ''),
        scope: params.get('debugScope') ?? '',
      },
    }

    let cancelled = false
    setLoadState('loading')
    setLastEvent(`加载 ${debugVersion} 资源…`)

    void loadMobileAuthSdkResources(config)
      .then((result) => {
        if (cancelled) return
        setLoadState(result.state)
        setLoadError(result.error?.message ?? null)

        if (result.state !== 'ready') {
          setStage('error')
          setLastEvent(`资源加载失败: ${result.reason ?? result.state}`)
          postDebugResult({
            error: true,
            stage: 'resource-load',
            reason: result.reason ?? result.state,
            message: result.error?.message ?? '',
          })
          return
        }

        if (!facadeRef.current) {
          facadeRef.current = createMobileAuthSdkFacade()
        }
        if (initializedRef.current) return
        initializedRef.current = true

        setStage('ready')
        setLastEvent('调用 showAuthPage…')

        try {
          facadeRef.current.showAuthPage({
            data: {
              version: config.authParams.version || undefined,
              appId: config.authParams.appId,
              sign: config.authParams.sign,
              traceId: config.authParams.traceId,
              timestamp: config.authParams.timestamp,
              authType: config.authParams.authType,
              scope: config.authParams.scope,
            },
            success: (showPayload: MobileAuthSdkCallbackPayload) => {
              setLastEvent(`showAuthPage success code=${String(showPayload.code ?? '')}`)
              if (!facadeRef.current) return

              if (String(showPayload.code ?? '') !== '103000') {
                setStage('error')
                postDebugResult({
                  error: true,
                  stage: 'showAuthPage',
                  ...safeStringifyPayload(showPayload),
                })
                return
              }

              facadeRef.current.initControl({
                styleOption: createMobileAuthStyleOption(),
                beforeSubmit: () => true,
                authReady: (p) => setLastEvent(`authReady code=${String(p.code ?? '')}`),
                success: (nextPayload) => {
                  setStage('done')
                  setLastEvent(`initControl success code=${String(nextPayload.code ?? '')}`)
                  postDebugResult({ stage: 'success', ...safeStringifyPayload(nextPayload) })
                },
                error: (errPayload) => {
                  setStage('error')
                  setLastEvent(`initControl error code=${String(errPayload.code ?? '')}`)
                  postDebugResult({
                    error: true,
                    stage: 'initControl',
                    ...safeStringifyPayload(errPayload),
                  })
                },
              })
            },
            error: (errPayload) => {
              setStage('error')
              setLastEvent(`showAuthPage error code=${String(errPayload.code ?? '')}`)
              postDebugResult({
                error: true,
                stage: 'showAuthPage',
                ...safeStringifyPayload(errPayload),
              })
            },
          })
        } catch (error) {
          setStage('error')
          const message = error instanceof Error ? error.message : String(error)
          setLastEvent(`showAuthPage throw: ${message}`)
          postDebugResult({ error: true, stage: 'showAuthPage-throw', message })
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : String(error)
        setLoadState('error')
        setLoadError(message)
        setStage('error')
        setLastEvent(`资源加载异常: ${message}`)
        postDebugResult({ error: true, stage: 'resource-load-throw', message })
      })

    return () => {
      cancelled = true
      facadeRef.current?.clearControl()
    }
  }, [debugVersion])

  return (
    <main
      className="flex h-dvh min-h-0 flex-col bg-white text-[#0F172A]"
      aria-label="移动 JSSDK 调试模式"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-[#eef1f4] px-4 py-3">
        <div>
          <p className="text-[15px] font-semibold leading-tight">调试模式</p>
          <p className="text-[11px] text-[#475569]">
            SDK={debugVersion} · load={loadState}
            {loadError ? ` · ${loadError}` : ''}
          </p>
        </div>
        <button
          type="button"
          aria-label="关闭"
          onClick={postClose}
          className="flex h-9 w-9 items-center justify-center text-[24px] leading-none text-[#0F172A]"
        >
          ×
        </button>
      </header>

      <div className="shrink-0 border-b border-[#eef1f4] bg-[#fafbfc] px-4 py-2 text-[11px] font-mono text-[#475569]">
        stage={stage} · {lastEvent}
      </div>

      <section
        className={
          stage === 'ready' || stage === 'submitted' || stage === 'done'
            ? 'flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-5 pt-4'
            : 'h-0 flex-shrink-0 overflow-hidden'
        }
        aria-hidden={!(stage === 'ready' || stage === 'submitted' || stage === 'done')}
        data-sdk-mount-host
      >
        <h1 className="mt-2 text-center text-[18px] font-semibold leading-tight">输入身份证后4位</h1>
        <div
          className="compact-phone-subtitle mt-2 flex min-h-5 flex-wrap items-baseline justify-center gap-x-1 text-center text-[14px] leading-5 text-[#8A8F98]"
          data-testid="debug-phone-subtitle"
        >
          <span>用于验证</span>
          <span id={sdkControlSlotMap.phone} data-sdk-control-slot="phone" />
          <span>的实名信息</span>
        </div>
        <div id={sdkControlSlotMap.state} data-sdk-control-slot="state" className="h-0 w-full overflow-hidden" aria-hidden="true" />
        <section
          className="mt-6 w-full px-1 text-[12px] leading-5 text-[#8A8F98]"
          data-testid="debug-agreement-panel"
          aria-label="协议说明"
        >
          <div className="compact-agreement-copy">
            <div id={sdkControlSlotMap.agreement} data-sdk-control-slot="agreement" />
            <div id={sdkControlSlotMap.tips} data-sdk-control-slot="tips" className="w-full" />
          </div>
          <div className="mt-5 w-full" data-testid="debug-submit-shell">
            <div id={sdkControlSlotMap.submit} data-sdk-control-slot="submit" />
          </div>
        </section>
        <div className="h-0 w-full overflow-hidden" aria-hidden="true">
          <div id={sdkControlSlotMap['sms-input']} data-sdk-control-slot="sms-input" />
          <div id={sdkControlSlotMap['sms-button']} data-sdk-control-slot="sms-button" />
        </div>
      </section>
    </main>
  )
}
