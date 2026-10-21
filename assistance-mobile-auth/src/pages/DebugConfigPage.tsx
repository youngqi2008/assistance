import { useEffect, useRef, useState } from 'react'

import {
  MOBILE_AUTH_DEFAULT_APP_ID,
  MOBILE_AUTH_DEFAULT_AUTH_TYPE,
  MOBILE_AUTH_DEFAULT_SCOPE,
  MOBILE_AUTH_DEFAULT_VERSION,
  MOBILE_AUTH_FRONTEND_APP_KEY,
  createMobileAuthStd2Sign,
} from '../sdk/mobileAuthSignature'
import { createSftPublicPath } from '../config/publicBase'

type SdkVersionId = '1.0.6-remote-cdn'

const SDK_VERSION_OPTIONS: Array<{ id: SdkVersionId; label: string }> = [
  { id: '1.0.6-remote-cdn', label: '1.0.6 官方远程 CDN' },
]

const AUTH_TYPE_PRESETS = [
  { value: MOBILE_AUTH_DEFAULT_AUTH_TYPE, label: `${MOBILE_AUTH_DEFAULT_AUTH_TYPE}（当前固定值）` },
]

const SCOPE_PRESETS = [MOBILE_AUTH_DEFAULT_SCOPE]
const APP_ID_PRESETS = [MOBILE_AUTH_DEFAULT_APP_ID]

// 调试页是直接 FE → SDK（不走 BFF createSession），所以这里的 appKey 是
// **FE 签名 key**（喂给 createMobileAuthStd2Sign 算 sign 用），不是 BFF
// createSession 的客户凭证。常量已是 FE 公开值，安全。
const ENV_APP_KEY = (import.meta.env.VITE_MOBILE_AUTH_APP_KEY ?? '').trim() || MOBILE_AUTH_FRONTEND_APP_KEY
const APP_KEY_PRESETS = [ENV_APP_KEY]

function generateTimestamp(date = new Date()): string {
  const pad = (n: number, w = 2) => String(n).padStart(w, '0')
  return (
    String(date.getFullYear()) +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds()) +
    pad(date.getMilliseconds(), 3)
  )
}

function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replaceAll('-', '')
  }
  return `trace${Date.now()}${Math.random().toString(36).slice(2, 10)}`
}

interface DebugFormState {
  sdkVersion: SdkVersionId
  authType: string
  scope: string
  appId: string
  appKey: string
  version: string
  sign: string
  traceId: string
  timestamp: string
}

function initialForm(): DebugFormState {
  return {
    sdkVersion: '1.0.6-remote-cdn',
    authType: MOBILE_AUTH_DEFAULT_AUTH_TYPE,
    scope: MOBILE_AUTH_DEFAULT_SCOPE,
    appId: MOBILE_AUTH_DEFAULT_APP_ID,
    appKey: ENV_APP_KEY,
    version: MOBILE_AUTH_DEFAULT_VERSION,
    sign: '',
    traceId: '',
    timestamp: '',
  }
}

interface DebugResult {
  ok: boolean
  payload: Record<string, unknown>
  receivedAt: string
}

export function DebugConfigPage() {
  const [form, setForm] = useState<DebugFormState>(initialForm)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [result, setResult] = useState<DebugResult | null>(null)
  const [copyToast, setCopyToast] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof event.data !== 'object' || event.data === null) return
      const data = event.data as { type?: unknown; payload?: unknown }
      if (data.type !== 'DEBUG_RESULT') return
      const payload = (data.payload && typeof data.payload === 'object'
        ? (data.payload as Record<string, unknown>)
        : { raw: data.payload })
      setResult({
        ok: !payload.error,
        payload,
        receivedAt: new Date().toISOString(),
      })
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!copyToast) return
    const t = window.setTimeout(() => setCopyToast(false), 1500)
    return () => window.clearTimeout(t)
  }, [copyToast])

  function update<K extends keyof DebugFormState>(key: K, value: DebugFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleRun() {
    const traceId = form.traceId.trim() || generateTraceId()
    const timestamp = form.timestamp.trim() || generateTimestamp()
    const version = form.version.trim() || MOBILE_AUTH_DEFAULT_VERSION
    // sign 留空时按 createMobileAuthStd2Sign 算法即时算出（用表单 appKey）；
    // 用户手填则原样透传。
    const sign =
      form.sign.trim() ||
      createMobileAuthStd2Sign({
        appId: form.appId,
        appKey: form.appKey,
        traceId,
        timestamp,
        version,
      })
    const filled: DebugFormState = { ...form, traceId, timestamp, version, sign }
    const params = new URLSearchParams({
      flow: 'debug',
      assistanceAuthSessionId: `debug-${generateTraceId().slice(0, 12)}`,
      debugSdkVersion: filled.sdkVersion,
      debugAuthType: filled.authType,
      debugScope: filled.scope,
      debugAppId: filled.appId,
      debugAppKey: filled.appKey,
      debugVersion: filled.version,
      debugSign: filled.sign,
      debugTraceId: filled.traceId,
      debugTimestamp: filled.timestamp,
    })
    setResult(null)
    setIframeUrl(`${createSftPublicPath('verification')}?${params.toString()}`)
  }

  function handleReset() {
    setForm(initialForm())
    setResult(null)
    setIframeUrl(null)
  }

  function handleCloseFrame() {
    setIframeUrl(null)
  }

  async function handleCopy() {
    if (!result) return
    const json = JSON.stringify(result.payload, null, 2)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(json)
        setCopyToast(true)
      }
    } catch {
      /* ignore */
    }
  }

  const highlights = result
    ? (['token', 'idLast4', 'encryptPublicKey', 'traceId', 'appId', 'code'] as const).filter(
        (k) => k in result.payload,
      )
    : []

  return (
    <div className="min-h-dvh bg-[#f5f6f7] text-[#0F172A]">
      <header className="border-b border-[#e2e6eb] bg-white px-6 py-4">
        <h1 className="text-[20px] font-semibold leading-tight">移动 JSSDK 调试面板</h1>
        <p className="mt-1 text-[12px] text-[#475569]">
          仅非 prod build 显示；填表后「运行」会在 iframe 内按所选版本+参数实跑 SDK，并把成功回调 payload 回传到右侧
        </p>
      </header>

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[480px_1fr]">
        <section className="rounded-2xl border border-[#e2e6eb] bg-white p-5">
          <h2 className="text-[15px] font-semibold">SDK 调用参数</h2>

          <div className="mt-4 grid gap-3 text-[13px]">
            <Field label="SDK 版本">
              <select
                value={form.sdkVersion}
                onChange={(e) => update('sdkVersion', e.target.value as SdkVersionId)}
                className="h-9 w-full rounded-md border border-[#c8ccd1] bg-white px-2"
              >
                {SDK_VERSION_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="authType">
              <DatalistInput
                listId="dt-authType"
                value={form.authType}
                onChange={(v) => update('authType', v)}
                options={AUTH_TYPE_PRESETS.map((p) => p.value)}
                placeholder="0"
              />
              <PresetHint items={AUTH_TYPE_PRESETS.map((p) => p.label)} />
            </Field>

            <Field label="scope">
              <DatalistInput
                listId="dt-scope"
                value={form.scope}
                onChange={(v) => update('scope', v)}
                options={SCOPE_PRESETS}
              />
            </Field>

            <Field label="appId">
              <DatalistInput
                listId="dt-appId"
                value={form.appId}
                onChange={(v) => update('appId', v)}
                options={APP_ID_PRESETS}
              />
            </Field>

            <Field label="appKey">
              <DatalistInput
                listId="dt-appKey"
                value={form.appKey}
                onChange={(v) => update('appKey', v)}
                options={APP_KEY_PRESETS}
                placeholder=""
              />
            </Field>

            <Field label="version">
              <input
                type="text"
                value={form.version}
                onChange={(e) => update('version', e.target.value)}
                placeholder="留空"
                className="h-9 w-full rounded-md border border-[#c8ccd1] bg-white px-2"
              />
            </Field>

            <Field label="sign">
              <input
                type="text"
                value={form.sign}
                onChange={(e) => update('sign', e.target.value)}
                placeholder="留空则按算法用 appId+appKey+traceId+timestamp+version 即时算出"
                className="h-9 w-full rounded-md border border-[#c8ccd1] bg-white px-2 font-mono text-[12px]"
              />
            </Field>

            <Field label="traceId">
              <input
                type="text"
                value={form.traceId}
                onChange={(e) => update('traceId', e.target.value)}
                placeholder="留空则点运行时生成 UUID"
                className="h-9 w-full rounded-md border border-[#c8ccd1] bg-white px-2 font-mono text-[12px]"
              />
            </Field>

            <Field label="timestamp">
              <input
                type="text"
                value={form.timestamp}
                onChange={(e) => update('timestamp', e.target.value)}
                placeholder="留空则点运行时实时生成 yyyyMMddHHmmssSSS"
                className="h-9 w-full rounded-md border border-[#c8ccd1] bg-white px-2 font-mono text-[12px]"
              />
            </Field>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleRun}
              className="h-11 flex-1 rounded-[10px] bg-[#ff2d55] text-[15px] font-semibold text-white active:translate-y-px"
            >
              运行
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 w-[120px] rounded-[10px] border border-[#c8ccd1] bg-white text-[14px] font-medium text-[#0F172A] active:bg-[#f3f4f6]"
            >
              重置默认
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e2e6eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">返回结果</h2>
            {result ? (
              <button
                type="button"
                onClick={handleCopy}
                className="h-8 rounded-md border border-[#c8ccd1] bg-white px-3 text-[12px] font-medium text-[#0F172A] active:bg-[#f3f4f6]"
              >
                复制 JSON
              </button>
            ) : null}
          </div>

          {!result ? (
            <p className="mt-3 text-[12px] text-[#8a8f98]">点「运行」后 SDK 成功/失败回调会在此展示。</p>
          ) : (
            <>
              <p className="mt-2 text-[11px] text-[#8a8f98]">
                {result.ok ? '✓ DEBUG_RESULT' : '✗ DEBUG_RESULT (error)'} · {result.receivedAt}
              </p>
              {highlights.length > 0 ? (
                <dl className="mt-3 divide-y divide-[#eef1f4] text-[12px]">
                  {highlights.map((k) => (
                    <div key={k} className="grid grid-cols-[120px_1fr] gap-2 py-2">
                      <dt className="font-medium text-[#475569]">{k}</dt>
                      <dd className="break-all font-mono text-[#0F172A]">{String(result.payload[k] ?? '')}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <pre className="mt-3 max-h-[420px] overflow-auto rounded-md border border-[#eef1f4] bg-[#fafbfc] p-3 text-[12px] font-mono leading-5 text-[#0F172A]">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </>
          )}
        </section>
      </div>

      {iframeUrl ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="flex h-[720px] max-h-[90vh] w-[480px] max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[#eef1f4] px-4 py-2">
              <span className="text-[12px] text-[#475569]">调试 iframe — flow=debug</span>
              <button
                type="button"
                onClick={handleCloseFrame}
                aria-label="关闭"
                className="flex h-8 w-8 items-center justify-center text-[22px] leading-none text-[#0F172A]"
              >
                ×
              </button>
            </div>
            <iframe
              ref={iframeRef}
              src={iframeUrl}
              title="移动 JSSDK 调试 iframe"
              className="min-h-0 flex-1 border-0"
            />
          </div>
        </div>
      ) : null}

      {copyToast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[1100] flex justify-center">
          <span className="rounded-full bg-[#0F172A] px-4 py-2 text-[12px] font-medium text-white">已复制 JSON</span>
        </div>
      ) : null}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-[#475569]">{label}</span>
      {children}
    </label>
  )
}

function DatalistInput({
  listId,
  value,
  onChange,
  options,
  placeholder,
}: {
  listId: string
  value: string
  onChange(next: string): void
  options: string[]
  placeholder?: string
}) {
  return (
    <>
      <input
        type="text"
        list={options.length > 0 ? listId : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-[#c8ccd1] bg-white px-2 font-mono text-[12px]"
      />
      {options.length > 0 ? (
        <datalist id={listId}>
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      ) : null}
    </>
  )
}

function PresetHint({ items }: { items: string[] }) {
  return (
    <span className="text-[11px] text-[#8a8f98]">预设：{items.join(' / ')}</span>
  )
}
