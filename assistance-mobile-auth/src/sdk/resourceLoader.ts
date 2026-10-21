import { getMobileAuthSdkConfig } from './config'
import { ensureGlobalCryptoJs } from './cryptoJsBootstrap'
import type { MobileAuthSdkConfig, MobileAuthSdkLoadState } from './types'

const SDK_SCRIPT_ID = 'mobile-auth-sdk-script'
const SDK_STYLE_ID = 'mobile-auth-sdk-style'
export const SDK_LOAD_TIMEOUT_MS = 12_000

export interface MobileAuthSdkResourceLoadResult {
  state: MobileAuthSdkLoadState
  scriptId: string
  styleId: string
  error?: Error
  reason?: 'sdk-disabled' | 'missing-js-url' | 'network-timeout' | 'spa-html-fallback' | 'error'
}

let currentLoadPromise: Promise<MobileAuthSdkResourceLoadResult> | null = null
let lastResolvedResult: MobileAuthSdkResourceLoadResult | null = null

function createResult(
  state: MobileAuthSdkLoadState,
  options: Pick<MobileAuthSdkResourceLoadResult, 'error' | 'reason'> = {},
): MobileAuthSdkResourceLoadResult {
  return {
    state,
    scriptId: SDK_SCRIPT_ID,
    styleId: SDK_STYLE_ID,
    ...options,
  }
}

function cleanupTrackedPromise() {
  currentLoadPromise = null
}

function createLoadError(kind: 'script' | 'style', sourceUrl: string): Error {
  return new Error(`Failed to load mobile auth SDK ${kind} resource: ${sourceUrl}`)
}

function ensureScriptElement(sourceUrl: string): HTMLScriptElement {
  const existing = document.getElementById(SDK_SCRIPT_ID)

  if (existing instanceof HTMLScriptElement) {
    existing.src = sourceUrl
    return existing
  }

  const script = document.createElement('script')
  script.id = SDK_SCRIPT_ID
  script.async = true
  script.src = sourceUrl
  document.head.appendChild(script)
  return script
}

function ensureStyleElement(sourceUrl: string): HTMLLinkElement {
  const existing = document.getElementById(SDK_STYLE_ID)

  if (existing instanceof HTMLLinkElement) {
    existing.href = sourceUrl
    return existing
  }

  const style = document.createElement('link')
  style.id = SDK_STYLE_ID
  style.rel = 'stylesheet'
  style.href = sourceUrl
  document.head.appendChild(style)
  return style
}

function waitForScript(sourceUrl: string): Promise<void> {
  const script = ensureScriptElement(sourceUrl)

  return new Promise((resolve, reject) => {
    let done = false
    const cleanup = () => {
      done = true
      clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      if (done) return
      cleanup()
      const err = new Error(`Mobile auth SDK script load timed out after ${SDK_LOAD_TIMEOUT_MS}ms: ${sourceUrl}`)
      ;(err as Error & { reason?: string }).reason = 'timeout'
      reject(err)
    }, SDK_LOAD_TIMEOUT_MS)

    const handleLoad = () => {
      if (done) return
      cleanup()
      script.dataset.mobileAuthSdkLoaded = 'true'
      resolve()
    }

    const handleError = () => {
      if (done) return
      cleanup()
      const err = createLoadError('script', sourceUrl) as Error & { reason?: string }
      err.reason = 'error'
      reject(err)
    }

    if (script.dataset.mobileAuthSdkLoaded === 'true') {
      cleanup()
      resolve()
      return
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
  })
}

function waitForStyle(sourceUrl: string): Promise<void> {
  const style = ensureStyleElement(sourceUrl)

  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      style.dataset.mobileAuthSdkLoaded = 'true'
      resolve()
    }

    const handleError = () => {
      reject(createLoadError('style', sourceUrl))
    }

    if (style.dataset.mobileAuthSdkLoaded === 'true') {
      resolve()
      return
    }

    style.addEventListener('load', handleLoad, { once: true })
    style.addEventListener('error', handleError, { once: true })
  })
}

function loadResources(config: MobileAuthSdkConfig = getMobileAuthSdkConfig()): Promise<MobileAuthSdkResourceLoadResult> {
  if (!config.enabled) {
    const result = createResult('disabled', { reason: 'sdk-disabled' })
    lastResolvedResult = result
    return Promise.resolve(result)
  }

  if (!config.jsUrl.trim()) {
    const result = createResult('disabled', { reason: 'missing-js-url' })
    lastResolvedResult = result
    return Promise.resolve(result)
  }

  // Vendored mobile JSSDK references a global CryptoJS inside aesEncrypt; install it
  // on window before the SDK <script> evaluates so the lazy crypto path resolves.
  ensureGlobalCryptoJs()

  const resourcePromises: Promise<void>[] = [waitForScript(config.jsUrl.trim())]

  if (config.cssUrl.trim()) {
    resourcePromises.push(waitForStyle(config.cssUrl.trim()))
  }

  return Promise.all(resourcePromises)
    .then(() => {
      if (typeof window.YDRZAuthSF !== 'object' || window.YDRZAuthSF == null) {
        const err = new Error('Mobile auth SDK script loaded but window.YDRZAuthSF is not registered')
        const result = createResult('error', { error: err, reason: 'spa-html-fallback' })
        lastResolvedResult = result
        return result
      }
      const result = createResult('ready')
      lastResolvedResult = result
      return result
    })
    .catch((error: unknown) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error))
      const errReason = (normalizedError as Error & { reason?: string }).reason
      const reason: MobileAuthSdkResourceLoadResult['reason'] =
        errReason === 'timeout' ? 'network-timeout' : 'error'
      const result = createResult('error', { error: normalizedError, reason })
      lastResolvedResult = result
      return result
    })
    .finally(() => {
      cleanupTrackedPromise()
    })
}

export function loadMobileAuthSdkResources(config?: MobileAuthSdkConfig): Promise<MobileAuthSdkResourceLoadResult> {
  if (config) {
    return loadResources(config)
  }

  if (lastResolvedResult?.state === 'ready') {
    return Promise.resolve(lastResolvedResult)
  }

  if (currentLoadPromise) {
    return currentLoadPromise
  }

  currentLoadPromise = loadResources()
  return currentLoadPromise
}

// 清掉 module-level 缓存 + DOM 里旧的 <script>/<link>，让下一次 load 重新发请求。
// 用于：用户点错误面板里的"重试"按钮；测试 setup/teardown。
export function resetMobileAuthSdkLoader(): void {
  currentLoadPromise = null
  lastResolvedResult = null

  document.getElementById(SDK_SCRIPT_ID)?.remove()
  document.getElementById(SDK_STYLE_ID)?.remove()
}

export const resetMobileAuthSdkLoaderForTests = resetMobileAuthSdkLoader
