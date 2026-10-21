import { useEffect, useRef, useState } from 'react'

import type {
  AssistanceAuthStateChangeEvent,
  AssistanceMobileAuthSdkInstance,
  AssistanceMobileAuthSdkOptions,
  AssistanceVerificationErrorPayload,
  AssistanceVerificationSuccessPayload,
} from '../wrapper'
import {
  createBusinessDemoClient,
  type BusinessDemoCheckResult,
  type BusinessDemoQueryResult,
} from '../api/businessDemoClient'
import { createSdkSessionClient } from '../api/sdkSessionClient'
import { HAIKE_V2_APP_ID } from '../agreements/appAgreementRegistry'
import { RrwebEventMonitor } from '../components/debug/RrwebEventMonitor'
import { createSftPublicPath, createSftPublicUrl } from '../config/publicBase'
import { decryptIdentityForDisplay, type IdentityDisplayFields } from '../lib/sm4IdentityDecrypt'
import type { PrecheckResult } from '../sdk/precheckReason'
import { getAssistanceMobileAuthEsmSdkUrl, loadAssistanceMobileAuthEsmModule } from '../wrapper/esmSdkLoader'

type HostStatus = 'idle' | 'waiting' | 'success' | 'cancelled' | 'error'
type HostFlowMode = 'jssdk' | 'h5' | null
type SdkSource = 'UMD' | 'ESM'
type NotificationTestMode =
  | 'absent'
  | 'before-login-only'
  | 'state-change-only'
  | 'both'
  | 'throw'
  | 'reject'
type NotificationCallbackName = 'onBeforeLogin' | 'onStateChange'

interface NotificationLogEntry {
  callback: NotificationCallbackName
  event: AssistanceAuthStateChangeEvent['type']
  calls: number
}

interface HaikeCallbackLogEntry {
  summary: string
}

type AssistanceMobileAuthSdkFactory = (
  options: AssistanceMobileAuthSdkOptions,
) => AssistanceMobileAuthSdkInstance

// 仅用于默认样式测试，不代表真实发放的 appId。
const DEFAULT_STYLE_TEST_APP_ID = 'default-test-026'

let haikeTestWrapperFactoryPromise: Promise<AssistanceMobileAuthSdkFactory> | null = null

function loadCurrentHaikeTestWrapperFactory(): Promise<AssistanceMobileAuthSdkFactory> {
  const existingFactory = window.AssistanceMobileAuth?.createAssistanceMobileAuthSdk

  // Local tests route the pinned script to the current source wrapper already.
  if (!import.meta.env.PROD && typeof existingFactory === 'function') {
    return Promise.resolve(existingFactory)
  }

  if (haikeTestWrapperFactoryPromise) {
    return haikeTestWrapperFactoryPromise
  }

  const sourceUrl = createSftPublicUrl('assistance-mobile-auth/assistance-mobile-auth.umd.cjs')
  const script = document.createElement('script')
  script.src = sourceUrl
  script.async = true

  haikeTestWrapperFactoryPromise = new Promise<AssistanceMobileAuthSdkFactory>((resolve, reject) => {
    script.addEventListener('load', () => {
      const factory = window.AssistanceMobileAuth?.createAssistanceMobileAuthSdk
      if (typeof factory === 'function') {
        resolve(factory)
        return
      }

      reject(new Error(`AssistanceMobileAuth UMD SDK 加载后未注册：${sourceUrl}`))
    }, { once: true })
    script.addEventListener('error', () => {
      reject(new Error(`AssistanceMobileAuth UMD SDK 加载失败：${sourceUrl}`))
    }, { once: true })
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    haikeTestWrapperFactoryPromise = null
    throw error
  })

  return haikeTestWrapperFactoryPromise
}

function createHostAssistanceMobileAuthSdk(options: AssistanceMobileAuthSdkOptions) {
  const factory = window.AssistanceMobileAuth?.createAssistanceMobileAuthSdk

  if (typeof factory !== 'function') {
    throw new Error(`AssistanceMobileAuth UMD SDK 未加载，请检查 ${createSftPublicPath('assistance-mobile-auth/assistance-mobile-auth.umd.cjs')} 是否返回 JS。`)
  }

  return factory(options)
}

function createDisplayValue(value: unknown) {
  if (value == null) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value, null, 2)
}

function getPublicVerificationFields(result: AssistanceVerificationSuccessPayload) {
  return [
    { label: 'token', value: result.token },
    { label: 'idLast4', value: result.idLast4 },
    { label: 'keyA', value: result.keyA },
  ]
}

function readCustomerCredentials() {
  const appId = import.meta.env.VITE_SFT_CUSTOMER_APP_ID?.trim() || ''
  const appKey = import.meta.env.VITE_SFT_CUSTOMER_APP_KEY?.trim() || ''

  if (!appId || !appKey) {
    throw new Error('缺少客户 appId/appKey，请通过 VITE_SFT_CUSTOMER_APP_ID / VITE_SFT_CUSTOMER_APP_KEY 配置。')
  }

  return { appId, appKey }
}

function createTestCallbackUrl() {
  return createSftPublicUrl('test-callback')
}

function createDirectAuthUrl(launchToken: string, mobileAuthEnv?: string) {
  const url = new URL('auth', createSftPublicUrl(''))
  const params = new URLSearchParams({ launchToken })
  if (mobileAuthEnv) {
    params.set('mobileAuthEnv', mobileAuthEnv)
  }

  url.search = params.toString()
  return url.toString()
}

function getStatusCopy(status: HostStatus, errorMessage?: string, flowMode?: HostFlowMode) {
  switch (status) {
    case 'waiting':
      if (flowMode === 'h5') {
        return {
          title: '正在跳转授权',
          description: '正在创建授权会话，即将进入 H5 授权页。',
        }
      }

      return {
        title: '等待验证',
        description: '已通过我们的 JSSDK 打开验证窗口，请在窗口内完成身份确认。',
      }
    case 'success':
      return {
        title: '验证成功',
        description: '验证结果已通过 JSSDK 回传到当前 H5 页面。',
      }
    case 'cancelled':
      return {
        title: '已取消验证',
        description: '用户已关闭或取消本次身份验证。',
      }
    case 'error':
      return {
        title: '验证失败',
        description: errorMessage || '本次验证暂未完成，请稍后重试。',
      }
    case 'idle':
    default:
      return {
        title: '认证测试页',
        description: '点击立即支付后，将通过我们的 JSSDK 拉起移动认证验证窗口。',
      }
  }
}

function isVerificationSuccessPayload(value: unknown): value is AssistanceVerificationSuccessPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { status?: unknown }).status === 'success' &&
    typeof (value as { token?: unknown }).token === 'string' &&
    typeof (value as { idLast4?: unknown }).idLast4 === 'string' &&
    typeof (value as { keyA?: unknown }).keyA === 'string'
  )
}

function JssdkStatusResult({
  status,
  errorMessage,
  flowMode,
  sdkSource,
  esmDebug,
  result,
  failedResult,
  cancelPayload,
  ariaLabel,
  heading,
  idleDescription,
  showWhenIdle = false,
  rrwebBlocked = false,
}: {
  status: HostStatus
  errorMessage: string
  flowMode: HostFlowMode
  sdkSource: SdkSource
  esmDebug: unknown
  result: AssistanceVerificationSuccessPayload | null
  failedResult: AssistanceVerificationErrorPayload | null
  cancelPayload: unknown
  ariaLabel?: string
  heading?: string
  idleDescription?: string
  showWhenIdle?: boolean
  rrwebBlocked?: boolean
}) {
  if (status === 'idle' && !showWhenIdle) {
    return null
  }

  const statusCopy = status === 'idle' && idleDescription
    ? { title: '认证测试页', description: idleDescription }
    : getStatusCopy(status, errorMessage, flowMode)

  return (
    <section
      aria-label={ariaLabel}
      aria-live="polite"
      data-rrweb-sensitive={rrwebBlocked ? 'true' : undefined}
      className={`mt-5 rounded-2xl bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]${rrwebBlocked ? ' rr-block' : ''}`}
    >
      {heading ? <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{heading}</h2> : null}
      <p className={`${heading ? 'mt-3 ' : ''}text-sm font-semibold text-[var(--color-text-primary)]`}>{statusCopy.title}</p>
      <p className="mt-2 text-sm leading-6 text-[#8a8f98]">{statusCopy.description}</p>
      <p className="mt-2 text-xs font-semibold text-[#4b5563]">当前 JSSDK 通道：{sdkSource}</p>
      {esmDebug ? (
        <pre data-rrweb-sensitive="true" className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[#eef6ff] p-3 text-xs leading-5 text-[#1e3a8a]">
          {createDisplayValue(esmDebug)}
        </pre>
      ) : null}
      {status === 'success' && result ? (
        <div data-rrweb-sensitive="true" className="mt-4 rounded-xl bg-[#f6f7f7] p-3">
          <p className="text-xs font-semibold text-[#8a8f98]">JSSDK 返回值</p>
          <dl className="mt-2 space-y-2 text-xs leading-5 text-[#111827]">
            {getPublicVerificationFields(result).map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-[#8a8f98]">{field.label}</dt>
                <dd className="break-all text-right font-semibold">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {status === 'error' && failedResult ? (
        <div className="mt-4 rounded-xl bg-[#fff1f2] p-3">
          <p className="text-xs font-semibold text-[#be123c]">JSSDK 错误返回</p>
          <pre data-rrweb-sensitive="true" className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[#881337]">
            {createDisplayValue(failedResult)}
          </pre>
        </div>
      ) : null}
      {status === 'cancelled' && cancelPayload ? (
        <div className="mt-4 rounded-xl bg-[#f6f7f7] p-3">
          <p className="text-xs font-semibold text-[#8a8f98]">JSSDK 取消返回</p>
          <pre data-rrweb-sensitive="true" className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[#111827]">
            {createDisplayValue(cancelPayload)}
          </pre>
        </div>
      ) : null}
    </section>
  )
}

function BusinessDemoResultPanel({ operation, result }: {
  operation: 'check' | 'query'
  result: BusinessDemoCheckResult | BusinessDemoQueryResult
}) {
  const http = result.http
  return (
    <section aria-label={`${operation} HTTP 诊断`} data-rrweb-sensitive="true" className="rr-block mt-3 rounded-xl bg-[#f6f7f7] p-3 text-xs leading-5 text-[#111827]">
      <p className="font-semibold">{operation} 结果 · {result.kind}</p>
      <p>{result.message}</p>
      {'code' in result && result.code ? <p>业务 code：{result.code}</p> : null}
      {'action' in result ? <p>后续操作：{result.action}</p> : null}
      {http ? (
        <>
          <p className="mt-2 font-semibold">浏览器收到的 HTTP 响应</p>
          <p>{http.status === null ? '未收到 HTTP 响应' : `HTTP ${http.status} ${http.statusText || ''}`}</p>
          {http.error ? <p>{http.error}</p> : null}
          {http.body !== null ? (
            <details className="mt-2">
              <summary className="cursor-pointer">响应正文</summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words">{http.body || '（空正文）'}</pre>
            </details>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

type AuthHostPageProps = {
  variant?: 'default' | 'haike'
}

export function AuthHostPage({ variant = 'default' }: AuthHostPageProps = {}) {
  const isHaikeTestPage = variant === 'haike'
  const sftSdkRef = useRef<AssistanceMobileAuthSdkInstance | null>(null)
  const haikeInlineSdkRef = useRef<AssistanceMobileAuthSdkInstance | null>(null)
  const haikeInlineRenderToRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<HostStatus>('idle')
  const [result, setResult] = useState<AssistanceVerificationSuccessPayload | null>(null)
  const [sm4Key, setSm4Key] = useState('')
  const [businessDemoBusy, setBusinessDemoBusy] = useState<'check' | 'query' | null>(null)
  const [businessDemoCheck, setBusinessDemoCheck] = useState<BusinessDemoCheckResult | null>(null)
  const [businessDemoQuery, setBusinessDemoQuery] = useState<BusinessDemoQueryResult | null>(null)
  const [businessDemoIdentity, setBusinessDemoIdentity] = useState<IdentityDisplayFields | null>(null)
  const [businessDemoMessage, setBusinessDemoMessage] = useState('')
  const [failedResult, setFailedResult] = useState<AssistanceVerificationErrorPayload | null>(null)
  const [cancelPayload, setCancelPayload] = useState<unknown>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [flowMode, setFlowMode] = useState<HostFlowMode>(null)
  const [precheckResult, setPrecheckResult] = useState<PrecheckResult | null>(null)
  const [precheckBusy, setPrecheckBusy] = useState(false)
  const [sdkSource, setSdkSource] = useState<SdkSource>('UMD')
  const [esmDebug, setEsmDebug] = useState<unknown>(null)
  const [notificationTestMode, setNotificationTestMode] = useState<NotificationTestMode>('absent')
  const [notificationLog, setNotificationLog] = useState<NotificationLogEntry[]>([])
  const [haikeCallbackLog, setHaikeCallbackLog] = useState<HaikeCallbackLogEntry[]>([])

  function appendHaikeCallbackLog(summary: string) {
    setHaikeCallbackLog((entries) => [...entries, { summary }])
  }

  useEffect(() => {
    document.title = isHaikeTestPage ? '银商助理海客测试页' : '银商助理测试页'
  }, [isHaikeTestPage])

  useEffect(() => {
    if (!isHaikeTestPage) {
      return
    }

    let disposed = false
    let instance: { destroy(): void } | null = null

    void import('vconsole').then(({ default: VConsole }) => {
      if (disposed) {
        return
      }

      instance = new VConsole()
    }).catch((error: unknown) => {
      console.error('[test-page-hk] vConsole 加载失败', error)
    })

    return () => {
      disposed = true
      instance?.destroy()
    }
  }, [isHaikeTestPage])

  useEffect(() => {
    return () => {
      haikeInlineSdkRef.current?.destroy()
      haikeInlineSdkRef.current = null
    }
  }, [])

  useEffect(() => {
    try {
      sftSdkRef.current = createHostAssistanceMobileAuthSdk({
        appId: DEFAULT_STYLE_TEST_APP_ID,
        authWindowTitle: '移动认证验证窗口',
        onSuccess: (payload) => {
          if (!isVerificationSuccessPayload(payload)) {
            return
          }

          setResult(payload)
          setBusinessDemoCheck(null)
          setBusinessDemoQuery(null)
          setBusinessDemoIdentity(null)
          setBusinessDemoMessage('')
          setFailedResult(null)
          setCancelPayload(null)
          setStatus('success')
        },
        onCancel: (payload) => {
          setCancelPayload(payload ?? null)
          setStatus('cancelled')
        },
        onError: (payload: AssistanceVerificationErrorPayload) => {
          setFailedResult(payload)
          setErrorMessage(payload.message)
          setStatus('error')
        },
        onPhoneReady: (payload) => {
          console.info('[phone-ready]', payload)
        },
        onClose: () => {
          setStatus('cancelled')
        },
      })
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setStatus('error')
    }

    return () => {
      sftSdkRef.current?.destroy()
      sftSdkRef.current = null
    }
  }, [])

  async function handleJssdkPay() {
    setSdkSource('UMD')
    setFlowMode('jssdk')
    setStatus('waiting')
    setResult(null)
    setBusinessDemoCheck(null)
    setBusinessDemoQuery(null)
    setBusinessDemoIdentity(null)
    setBusinessDemoMessage('')
    setFailedResult(null)
    setCancelPayload(null)
    setErrorMessage('')
    setEsmDebug(null)

    try {
      const payload = await sftSdkRef.current?.open({ scene: 'native-number' })

      if (payload) {
        setResult(payload)
        setBusinessDemoCheck(null)
        setBusinessDemoQuery(null)
        setBusinessDemoIdentity(null)
        setBusinessDemoMessage('')
        setStatus('success')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      if (message.includes('cancelled') || message.includes('closed')) {
        setStatus('cancelled')
        return
      }

      setErrorMessage(message)
      setStatus('error')
    }
  }

  async function handleJssdkOptionsTest() {
    setSdkSource('UMD')
    setFlowMode('jssdk')
    setStatus('waiting')
    setResult(null)
    setBusinessDemoCheck(null)
    setBusinessDemoQuery(null)
    setBusinessDemoIdentity(null)
    setBusinessDemoMessage('')
    setFailedResult(null)
    setCancelPayload(null)
    setErrorMessage('')
    setEsmDebug(null)

    let optionSdk: AssistanceMobileAuthSdkInstance | null = null

    try {
      optionSdk = createHostAssistanceMobileAuthSdk({
        appId: DEFAULT_STYLE_TEST_APP_ID,
        authWindowTitle: '移动认证验证窗口（无关闭X / 系统键盘）',
        closable: false,
        useCustomKeyboard: false,
        authWindowHeightMode: 'auto',
        onSuccess: (payload) => {
          if (!isVerificationSuccessPayload(payload)) {
            return
          }

          setResult(payload)
          setBusinessDemoCheck(null)
          setBusinessDemoQuery(null)
          setBusinessDemoIdentity(null)
          setBusinessDemoMessage('')
          setFailedResult(null)
          setCancelPayload(null)
          setStatus('success')
        },
        onCancel: (payload) => {
          setCancelPayload(payload ?? null)
          setStatus('cancelled')
        },
        onError: (payload: AssistanceVerificationErrorPayload) => {
          setFailedResult(payload)
          setErrorMessage(payload.message)
          setStatus('error')
        },
        onPhoneReady: (payload) => {
          console.info('[phone-ready]', payload)
        },
        onClose: () => {
          setStatus('cancelled')
        },
      })

      const payload = await optionSdk.open({ scene: 'native-number' })

      if (payload) {
        setResult(payload)
        setBusinessDemoCheck(null)
        setBusinessDemoQuery(null)
        setBusinessDemoIdentity(null)
        setBusinessDemoMessage('')
        setStatus('success')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      if (message.includes('cancelled') || message.includes('closed')) {
        setStatus('cancelled')
        return
      }

      setErrorMessage(message)
      setStatus('error')
    } finally {
      optionSdk?.destroy()
    }
  }

  function resolveChinaumsAuthWindowMaxHeight(): '88dvh' | '88vh' {
    return typeof CSS !== 'undefined'
      && typeof CSS.supports === 'function'
      && CSS.supports('height', '100dvh')
      ? '88dvh'
      : '88vh'
  }

  async function handleChinaumsSkinTest(appId = '8a9481c79c05c8bd019f6f42956924a0') {
    setSdkSource('UMD')
    setFlowMode('jssdk')
    setStatus('waiting')
    setResult(null)
    setBusinessDemoCheck(null)
    setBusinessDemoQuery(null)
    setBusinessDemoIdentity(null)
    setBusinessDemoMessage('')
    setFailedResult(null)
    setCancelPayload(null)
    setErrorMessage('')
    setEsmDebug(null)

    let skinSdk: AssistanceMobileAuthSdkInstance | null = null

    try {
      const notificationHarness = {
        mode: notificationTestMode,
        onBeforeLoginCalls: 0,
        onStateChangeCalls: 0,
        log: [] as NotificationLogEntry[],
      }
      ;(window as Window & {
        __assistanceNotificationHarness?: typeof notificationHarness
      }).__assistanceNotificationHarness = notificationHarness
      setNotificationLog([])

      const recordNotification = (
        callback: NotificationCallbackName,
        event: AssistanceAuthStateChangeEvent['type'],
      ) => {
        const countKey = callback === 'onBeforeLogin'
          ? 'onBeforeLoginCalls'
          : 'onStateChangeCalls'
        notificationHarness[countKey] += 1
        const entry = {
          callback,
          event,
          calls: notificationHarness[countKey],
        }
        notificationHarness.log.push(entry)
        setNotificationLog((current) => [...current, entry])
        console.info('[auth-notification]', entry)
      }

      const includeBeforeLogin = [
        'before-login-only',
        'both',
        'throw',
        'reject',
      ].includes(notificationTestMode)
      const includeStateChange = [
        'state-change-only',
        'both',
        'throw',
        'reject',
      ].includes(notificationTestMode)

      const onBeforeLogin = includeBeforeLogin
        ? () => {
            recordNotification('onBeforeLogin', 'idLast4Complete')
            if (notificationTestMode === 'throw') {
              throw new Error('test-page onBeforeLogin throw')
            }
            if (notificationTestMode === 'reject') {
              return Promise.reject(new Error('test-page onBeforeLogin rejection'))
            }
          }
        : undefined
      const onStateChange = includeStateChange
        ? (event: AssistanceAuthStateChangeEvent) => {
            recordNotification('onStateChange', event.type)
            if (notificationTestMode === 'throw') {
              throw new Error('test-page onStateChange throw')
            }
            if (notificationTestMode === 'reject') {
              return Promise.reject(new Error('test-page onStateChange rejection'))
            }
          }
        : undefined

      skinSdk = createHostAssistanceMobileAuthSdk({
        appId,
        authWindowTitle: '银杏助填版本23',
        useCustomKeyboard: true,
        authWindowHeightMode: 'auto',
        authWindowMaxHeight: resolveChinaumsAuthWindowMaxHeight(),
        ...(onBeforeLogin ? { onBeforeLogin } : {}),
        ...(onStateChange ? { onStateChange } : {}),
        onSuccess: (payload) => {
          if (!isVerificationSuccessPayload(payload)) {
            return
          }

          setResult(payload)
          setBusinessDemoCheck(null)
          setBusinessDemoQuery(null)
          setBusinessDemoIdentity(null)
          setBusinessDemoMessage('')
          setFailedResult(null)
          setCancelPayload(null)
          setStatus('success')
        },
        onCancel: (payload) => {
          setCancelPayload(payload ?? null)
          setStatus('cancelled')
        },
        onError: (payload: AssistanceVerificationErrorPayload) => {
          setFailedResult(payload)
          setErrorMessage(payload.message)
          setStatus('error')
        },
        onPhoneReady: (payload) => {
          console.info('[phone-ready]', payload)
        },
        onClose: () => {
          setStatus('cancelled')
        },
      })

      const payload = await skinSdk.open({ scene: 'native-number' })

      if (payload) {
        setResult(payload)
        setBusinessDemoCheck(null)
        setBusinessDemoQuery(null)
        setBusinessDemoIdentity(null)
        setBusinessDemoMessage('')
        setStatus('success')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      if (message.includes('cancelled') || message.includes('closed')) {
        setStatus('cancelled')
        return
      }

      setErrorMessage(message)
      setStatus('error')
    } finally {
      skinSdk?.destroy()
    }
  }

  async function handleHaikeInlineTest() {
    const renderTo = haikeInlineRenderToRef.current

    if (!renderTo) {
      setErrorMessage('海客 inline 测试容器未就绪。')
      setStatus('error')
      return
    }

    setSdkSource('UMD')
    setFlowMode('jssdk')
    setStatus('waiting')
    setResult(null)
    setBusinessDemoCheck(null)
    setBusinessDemoQuery(null)
    setBusinessDemoIdentity(null)
    setBusinessDemoMessage('')
    setFailedResult(null)
    setCancelPayload(null)
    setErrorMessage('')
    setEsmDebug(null)
    setHaikeCallbackLog([])

    haikeInlineSdkRef.current?.destroy()
    haikeInlineSdkRef.current = null

    try {
      const haikeTestWrapperFactory = await loadCurrentHaikeTestWrapperFactory()
      const haikeInlineSdk = haikeTestWrapperFactory({
        appId: HAIKE_V2_APP_ID,
        authWindowTitle: '海客 inline 授权卡片',
        display: 'inline',
        renderTo,
        onSuccess: (payload) => {
          appendHaikeCallbackLog('onSuccess')
          if (!isVerificationSuccessPayload(payload)) {
            return
          }

          setResult(payload)
          setBusinessDemoCheck(null)
          setBusinessDemoQuery(null)
          setBusinessDemoIdentity(null)
          setBusinessDemoMessage('')
          setFailedResult(null)
          setCancelPayload(null)
          setStatus('success')
        },
        onCancel: (payload) => {
          appendHaikeCallbackLog('onCancel')
          setCancelPayload(payload ?? null)
          setStatus('cancelled')
        },
        onError: (payload: AssistanceVerificationErrorPayload) => {
          appendHaikeCallbackLog(`onError · ${payload.code || 'unknown'}`)
          setFailedResult(payload)
          setErrorMessage(payload.message)
          setStatus('error')
        },
        onPhoneReady: (payload) => {
          appendHaikeCallbackLog(`onPhoneReady · ${payload.maskedMobile}`)
        },
        onStateChange: (event) => {
          appendHaikeCallbackLog(`onStateChange · ${event.type}`)
        },
        onBeforeLogin: () => {
          appendHaikeCallbackLog('onBeforeLogin')
        },
        onClose: () => {
          appendHaikeCallbackLog('onClose')
          setStatus('cancelled')
        },
      })
      haikeInlineSdkRef.current = haikeInlineSdk

      const payload = await haikeInlineSdk.open({ scene: 'native-number' })

      if (payload) {
        setResult(payload)
        setBusinessDemoCheck(null)
        setBusinessDemoQuery(null)
        setBusinessDemoIdentity(null)
        setBusinessDemoMessage('')
        setStatus('success')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      if (message.includes('cancelled') || message.includes('closed')) {
        setStatus('cancelled')
        return
      }

      setErrorMessage(message)
      setStatus('error')
    }
  }

  async function handleEsmJssdkTest() {
    setSdkSource('ESM')
    setFlowMode('jssdk')
    setStatus('waiting')
    setResult(null)
    setBusinessDemoCheck(null)
    setBusinessDemoQuery(null)
    setBusinessDemoIdentity(null)
    setBusinessDemoMessage('')
    setFailedResult(null)
    setCancelPayload(null)
    setErrorMessage('')
    setEsmDebug({ stage: 'importing', url: getAssistanceMobileAuthEsmSdkUrl() })
    console.info('[esm-jssdk-test]', { stage: 'importing', url: getAssistanceMobileAuthEsmSdkUrl() })

    let esmSdk: AssistanceMobileAuthSdkInstance | null = null

    try {
      const module = await loadAssistanceMobileAuthEsmModule()
      const importDebug = {
        stage: 'imported',
        url: getAssistanceMobileAuthEsmSdkUrl(),
        keys: Object.keys(module),
      }
      setEsmDebug(importDebug)
      console.info('[esm-jssdk-test]', importDebug)

      esmSdk = module.createAssistanceMobileAuthSdk({
        appId: DEFAULT_STYLE_TEST_APP_ID,
        authWindowTitle: '移动认证验证窗口（ESM）',
        onSuccess: (payload) => {
          if (!isVerificationSuccessPayload(payload)) {
            return
          }
          setResult(payload)
          setStatus('success')
        },
        onCancel: (payload) => {
          setCancelPayload(payload ?? null)
          setStatus('cancelled')
        },
        onError: (payload: AssistanceVerificationErrorPayload) => {
          setFailedResult(payload)
          setErrorMessage(payload.message)
          setStatus('error')
        },
        onPhoneReady: (payload) => {
          console.info('[phone-ready]', payload)
        },
        onClose: () => {
          setStatus('cancelled')
        },
      })

      const payload = await esmSdk.open({ scene: 'native-number' })
      console.info('[esm-jssdk-test]', { stage: 'open-success', payload })
      setEsmDebug({ stage: 'open-success', payload })

      if (payload) {
        setResult(payload)
        setStatus('success')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.info('[esm-jssdk-test]', { stage: 'error', message, error })

      if (message.includes('cancelled') || message.includes('closed')) {
        setStatus('cancelled')
        setEsmDebug({ stage: 'cancelled', message })
        return
      }

      setErrorMessage(message)
      setEsmDebug({ stage: 'error', message })
      setStatus('error')
    } finally {
      esmSdk?.destroy()
    }
  }

  async function handlePrecheck() {
    setPrecheckBusy(true)
    setPrecheckResult(null)
    try {
      const probeResult = await sftSdkRef.current?.precheck({ scene: 'native-number' })
      if (probeResult) {
        console.info('[precheck]', probeResult)
        setPrecheckResult(probeResult)
      }
    } catch (error: unknown) {
      console.info('[precheck] error', error)
      setPrecheckResult({ eligible: false, reason: 'unknown' })
    } finally {
      setPrecheckBusy(false)
    }
  }

  async function handleH5RedirectPay() {
    setFlowMode('h5')
    setStatus('waiting')
    setResult(null)
    setBusinessDemoCheck(null)
    setBusinessDemoQuery(null)
    setBusinessDemoIdentity(null)
    setBusinessDemoMessage('')
    setFailedResult(null)
    setCancelPayload(null)
    setErrorMessage('')

    try {
      const { appId, appKey } = readCustomerCredentials()
      const sessionClient = createSdkSessionClient()
      const mobileAuthEnv = new URLSearchParams(window.location.search).get('mobileAuthEnv') ?? undefined
      const session = await sessionClient.createSession({
        appId,
        appKey,
        scene: 'native-number',
        mobileAuthEnv,
        redirectUrl: createTestCallbackUrl(),
      })
      window.location.assign(createDirectAuthUrl(session.launchToken, mobileAuthEnv))
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setStatus('error')
    }
  }

  async function handleBusinessDemoCheck() {
    if (!result) {
      setBusinessDemoMessage('缺少 JSSDK 返回字段，请先完成 JSSDK 验证。')
      return
    }

    setBusinessDemoBusy('check')
    setBusinessDemoMessage('')
    setBusinessDemoCheck(null)
    try {
      const check = await createBusinessDemoClient().checkIdentity({
        token: result.token,
        idLast4: result.idLast4,
        keyA: result.keyA,
      })
      setBusinessDemoCheck(check)
      setBusinessDemoMessage(check.message)
    } finally {
      setBusinessDemoBusy(null)
    }
  }

  async function handleBusinessDemoQuery() {
    if (!result) {
      setBusinessDemoMessage('缺少 JSSDK 返回字段，请先完成 JSSDK 验证。')
      return
    }

    setBusinessDemoBusy('query')
    setBusinessDemoMessage('')
    setBusinessDemoQuery(null)
    setBusinessDemoIdentity(null)
    try {
      const query = await createBusinessDemoClient().queryIdentity({ token: result.token })
      setBusinessDemoQuery(query)
      if (query.kind === 'identity-encrypted') {
        const decrypted = decryptIdentityForDisplay({
          ...query.identity,
          idLast4: result.idLast4,
        }, { sm4Key })
        if (decrypted.kind === 'ready') {
          setBusinessDemoIdentity(decrypted.identity)
          setBusinessDemoMessage(query.message)
        } else {
          setBusinessDemoMessage(decrypted.message)
        }
        return
      }

      setBusinessDemoMessage(query.message)
    } finally {
      setBusinessDemoBusy(null)
    }
  }

  if (isHaikeTestPage) {
    return (
      <main className="min-h-dvh bg-[#f5f6f8] px-5 py-5 text-[var(--color-text-primary)]" aria-label="海客认证测试">
        <button
          type="button"
          data-testid="haike-inline-test-trigger"
          onClick={handleHaikeInlineTest}
          disabled={status === 'waiting'}
          className="flex min-h-[52px] w-full items-center justify-center rounded-[10px] border border-[#f97316] bg-white px-4 text-[16px] font-semibold text-[#ea580c] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          测试海客 inline 授权卡片（指定 appId）
        </button>
        <div className="mt-3 w-full" data-testid="haike-inline-test-fixture">
          <div
            ref={haikeInlineRenderToRef}
            data-testid="haike-inline-test-render-to"
            className="mx-auto aspect-[84/100] w-full max-w-[430px]"
          />
        </div>
        <JssdkStatusResult
          status={status}
          errorMessage={errorMessage}
          flowMode={flowMode}
          sdkSource={sdkSource}
          esmDebug={esmDebug}
          result={result}
          failedResult={failedResult}
          cancelPayload={cancelPayload}
          ariaLabel="Haike JSSDK 状态与结果"
          heading="JSSDK 状态与结果"
          idleDescription="点击测试海客 inline 授权卡片（指定 appId）后，将通过我们的 JSSDK 拉起内嵌验证卡片。"
          showWhenIdle
          rrwebBlocked
        />
        <section
          role="log"
          aria-label="Haike 回调日志"
          aria-live="polite"
          data-rrweb-sensitive="true"
          className="rr-block mt-4 rounded-2xl bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">回调日志</h2>
            <button
              type="button"
              aria-label="清空 Haike 回调日志"
              onClick={() => setHaikeCallbackLog([])}
              className="rounded-[8px] border border-[#d1d5db] px-3 py-1.5 text-xs font-medium text-[#4b5563]"
            >
              清空
            </button>
          </div>
          {haikeCallbackLog.length === 0 ? (
            <p className="mt-3 text-xs text-[#6b7280]">暂无回调</p>
          ) : (
            <ol className="mt-3 space-y-1 text-xs leading-5 text-[#374151]">
              {haikeCallbackLog.map((entry, index) => <li key={`${entry.summary}-${index}`}>{entry.summary}</li>)}
            </ol>
          )}
        </section>
        <RrwebEventMonitor enabled />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[#f5f6f8] px-5 pb-8 pt-5 text-[var(--color-text-primary)]" aria-label="订单支付">
      <header className="flex min-h-11 items-center justify-between">
        <button type="button" aria-label="关闭" className="text-[32px] leading-none text-[#111827]">
          ×
        </button>
        <h1 className="text-lg font-semibold">银商助理测试页</h1>
        <button type="button" aria-label="设置" className="text-2xl text-[#8a8f98]">
          ⚙
        </button>
      </header>

      <section className="pt-5 text-center">
        <p className="text-lg font-semibold">快捷支付签约订单</p>
        <p className="mt-5 text-[44px] font-semibold leading-none tracking-tight">¥0.01</p>
      </section>

      <section className="mt-6 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between border-b border-[#eef1f4] pb-3 text-sm">
          <span className="text-[#8a8f98]">商品</span>
          <strong>快捷支付签约</strong>
        </div>
        <div className="flex items-center justify-between border-b border-[#eef1f4] py-3 text-sm">
          <span className="text-[#8a8f98]">手机号</span>
          <strong>138****8000</strong>
        </div>
        <div className="flex items-center justify-between pt-3 text-sm">
          <span className="text-[#8a8f98]">支付方式</span>
          <strong>银行卡快捷支付</strong>
        </div>
      </section>

      <button
        type="button"
        onClick={handleJssdkPay}
        disabled={status === 'waiting'}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-[10px] bg-[#ff2d55] px-4 text-[18px] font-semibold text-white shadow-[0_3px_0_rgba(191,23,65,0.32)] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        立即支付-jssdk
      </button>

      <button
        type="button"
        onClick={handleH5RedirectPay}
        disabled={status === 'waiting'}
        className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[10px] border border-[#ff2d55] bg-white px-4 text-[18px] font-semibold text-[#ff2d55] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        立即支付-h5转跳
      </button>

      <button
        type="button"
        onClick={handleEsmJssdkTest}
        disabled={status === 'waiting'}
        className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[10px] border border-[#2563eb] bg-white px-4 text-[16px] font-semibold text-[#1d4ed8] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        测试 ESM JSSDK
      </button>

      <button
        type="button"
        onClick={handleJssdkOptionsTest}
        disabled={status === 'waiting'}
        className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[10px] border border-[#059669] bg-white px-4 text-[16px] font-semibold text-[#047857] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        测试无关闭X + 系统键盘
      </button>

      <button
        type="button"
        onClick={() => handleChinaumsSkinTest()}
        disabled={status === 'waiting'}
        className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[10px] border border-[#f75110] bg-white px-4 text-[16px] font-semibold text-[#f75110] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        测试银联三要素皮肤（zidingyi）
      </button>

      <button
        type="button"
        onClick={() => handleChinaumsSkinTest('10037e6f9d903f86019ed8cfb6320365')}
        disabled={status === 'waiting'}
        className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[10px] border border-[#f75110] bg-white px-4 text-[16px] font-semibold text-[#f75110] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        测试元保三要素皮肤
      </button>

      <label className="mt-3 block text-left text-[13px] text-[#475569]">
        <span className="mb-1 block">通知回调观察模式</span>
        <select
          aria-label="通知回调观察模式"
          value={notificationTestMode}
          onChange={(event) => setNotificationTestMode(event.target.value as NotificationTestMode)}
          disabled={status === 'waiting'}
          className="min-h-10 w-full rounded-lg border border-[#cbd5e1] bg-white px-3"
        >
          <option value="absent">未配置</option>
          <option value="before-login-only">仅 onBeforeLogin</option>
          <option value="state-change-only">仅 onStateChange</option>
          <option value="both">onBeforeLogin + onStateChange</option>
          <option value="throw">两者同步 throw</option>
          <option value="reject">两者 Promise reject</option>
        </select>
      </label>

      <section
        role="log"
        aria-label="通知回调日志"
        aria-live="polite"
        className="mt-3 rounded-lg bg-[#f8fafc] px-3 py-2 text-left text-[12px] text-[#475569]"
      >
        {notificationLog.length === 0 ? (
          <p>暂无通知</p>
        ) : (
          <ol className="space-y-1">
            {notificationLog.map((entry, index) => (
              <li key={`${entry.callback}-${entry.event}-${entry.calls}-${index}`}>
                {entry.callback} · {entry.event} · 第 {entry.calls} 次
              </li>
            ))}
          </ol>
        )}
      </section>

      <button
        type="button"
        onClick={handlePrecheck}
        disabled={precheckBusy}
        className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[10px] border border-[#8a8f98] bg-white px-4 text-[16px] font-semibold text-[#374151] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
      >
        {precheckBusy ? '预检中…' : '运行预检（precheck）'}
      </button>

      {precheckResult ? (
        <section className="mt-4 rounded-2xl bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]" aria-live="polite">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">网络/运营商预检结果</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[#8a8f98]">eligible</dt>
              <dd className="font-semibold">{String(precheckResult.eligible)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#8a8f98]">reason</dt>
              <dd className="font-semibold">{precheckResult.reason}</dd>
            </div>
          </dl>
          <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[#f6f7f7] p-3 text-xs leading-5 text-[#111827]">
            {createDisplayValue(precheckResult)}
          </pre>
        </section>
      ) : null}

      <JssdkStatusResult
        status={status}
        errorMessage={errorMessage}
        flowMode={flowMode}
        sdkSource={sdkSource}
        esmDebug={esmDebug}
        result={result}
        failedResult={failedResult}
        cancelPayload={cancelPayload}
      />

      {status === 'success' && result ? (
        <section className="mt-4 rounded-2xl bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">内部基座联调</p>
          <label className="mt-3 block text-sm text-[#374151]">
            <span className="mb-1 block text-xs font-semibold text-[#8a8f98]">SM4 密钥</span>
            <input
              data-rrweb-sensitive="true"
              aria-label="SM4 密钥"
              value={sm4Key}
              onChange={(event) => setSm4Key(event.target.value)}
              className="min-h-11 w-full rounded-[10px] border border-[#d1d5db] px-3 text-sm"
              placeholder="请输入业务方 SM4 解密密钥"
            />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleBusinessDemoCheck}
              disabled={businessDemoBusy !== null}
              className="min-h-11 rounded-[10px] bg-[#111827] px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {businessDemoBusy === 'check' ? 'check 中...' : '调用 check'}
            </button>
            <button
              type="button"
              onClick={handleBusinessDemoQuery}
              disabled={businessDemoBusy !== null}
              className="min-h-11 rounded-[10px] border border-[#111827] px-3 text-sm font-semibold text-[#111827] disabled:opacity-60"
            >
              {businessDemoBusy === 'query' ? 'query 中...' : '调用 query'}
            </button>
          </div>
          {businessDemoMessage ? <p data-rrweb-sensitive="true" className="rr-block mt-3 text-xs leading-5 text-[#8a8f98]">{businessDemoMessage}</p> : null}
          {businessDemoCheck ? (
            <BusinessDemoResultPanel operation="check" result={businessDemoCheck} />
          ) : null}
          {businessDemoQuery ? (
            <BusinessDemoResultPanel operation="query" result={businessDemoQuery} />
          ) : null}
          {businessDemoIdentity ? (
            <dl data-rrweb-sensitive="true" className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#8a8f98]">姓名</dt>
                <dd className="font-semibold">{businessDemoIdentity.displayName}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#8a8f98]">手机号</dt>
                <dd className="font-semibold">{businessDemoIdentity.maskedMobile}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#8a8f98]">身份证号</dt>
                <dd className="font-semibold">{businessDemoIdentity.maskedIdCard}</dd>
              </div>
            </dl>
          ) : null}
        </section>
      ) : null}

      <RrwebEventMonitor />
    </main>
  )
}
