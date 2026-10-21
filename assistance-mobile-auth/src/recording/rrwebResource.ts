import { createSftPublicPath } from '../config/publicBase'

export const RRWEB_VERSION = '2.0.0-alpha.4'
export const RRWEB_CDN_URL =
  'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js'
export const RRWEB_CDN_INTEGRITY =
  'sha384-UpKcjeLZtEcYxELLISURK3MAcN3KQdTx8iygewcEWVl8LqgVrftgiMtuMHod7D8e'
// The static release contract fixes the fallback URL per layer; see manifest layers.*.rrweb.localFallbackPath.
export const RRWEB_LOCAL_PATH = createSftPublicPath('assistance-mobile-auth/vendor/rrweb.min.js')
export const RRWEB_LOCAL_SHA256 =
  '39596e896d80261e0163ea6dc1a00884864a9da53c220486697389a715b293fe'

const CDN_SCRIPT_ID = 'assistance-rrweb-cdn'
const LOCAL_SCRIPT_ID = 'assistance-rrweb-local'

export interface RrwebEvent {
  type: number
  timestamp: number
  data?: unknown
}

export interface RrwebRecordOptions {
  emit(event: RrwebEvent, isCheckout?: boolean): void
  recordCrossOriginIframes: true
}

export interface RrwebApi {
  record(options: RrwebRecordOptions): void | (() => void)
}

declare global {
  interface Window {
    rrweb?: RrwebApi
  }
}

export type RrwebLoadSource = 'cdn' | 'local'

export type RrwebLoadResult =
  | { status: 'ready'; source: RrwebLoadSource; rrweb: RrwebApi }
  | { status: 'unavailable'; error: Error }

interface LoadOptions {
  targetWindow?: Window
  targetDocument?: Document
  warn?: (message: string, error: Error) => void
}

const loadPromises = new WeakMap<Window, Promise<RrwebLoadResult>>()
const warnedWindows = new WeakSet<Window>()

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

function isRrwebApi(value: unknown): value is RrwebApi {
  return typeof value === 'object' && value !== null &&
    typeof (value as { record?: unknown }).record === 'function'
}

function warnOnce(targetWindow: Window, warn: LoadOptions['warn'], error: Error) {
  if (warnedWindows.has(targetWindow)) return
  warnedWindows.add(targetWindow)
  if (warn) warn('[rrweb] recording unavailable', error)
  else console.warn('[rrweb] recording unavailable', error)
}

function waitForScript(
  targetWindow: Window,
  targetDocument: Document,
  source: RrwebLoadSource,
): Promise<RrwebApi> {
  return new Promise((resolve, reject) => {
    const script = targetDocument.createElement('script')
    script.id = source === 'cdn' ? CDN_SCRIPT_ID : LOCAL_SCRIPT_ID
    script.async = true
    script.src = source === 'cdn'
      ? RRWEB_CDN_URL
      : new URL(RRWEB_LOCAL_PATH, targetWindow.location.href).toString()

    if (source === 'cdn') {
      script.integrity = RRWEB_CDN_INTEGRITY
      script.crossOrigin = 'anonymous'
    }

    script.addEventListener('load', () => {
      if (isRrwebApi(targetWindow.rrweb)) {
        resolve(targetWindow.rrweb)
        return
      }
      reject(new Error(`rrweb ${source} script loaded without window.rrweb.record`))
    }, { once: true })
    script.addEventListener('error', () => {
      reject(new Error(`Failed to load rrweb from ${source}`))
    }, { once: true })

    targetDocument.head.appendChild(script)
  })
}

export function loadRrwebResource(options: LoadOptions = {}): Promise<RrwebLoadResult> {
  const targetWindow = options.targetWindow ?? window
  const targetDocument = options.targetDocument ?? document
  const existing = loadPromises.get(targetWindow)
  if (existing) return existing

  const promise = (async (): Promise<RrwebLoadResult> => {
    try {
      const rrweb = await waitForScript(targetWindow, targetDocument, 'cdn')
      return { status: 'ready', source: 'cdn', rrweb }
    } catch (cdnError) {
      try {
        const rrweb = await waitForScript(targetWindow, targetDocument, 'local')
        return { status: 'ready', source: 'local', rrweb }
      } catch (localError) {
        const error = new Error(
          `rrweb CDN and local fallback failed: ${toError(cdnError).message}; ${toError(localError).message}`,
        )
        warnOnce(targetWindow, options.warn, error)
        return { status: 'unavailable', error }
      }
    }
  })()

  loadPromises.set(targetWindow, promise)
  return promise
}

export function resetRrwebResourceForTests(
  targetWindow: Window = window,
  targetDocument: Document = document,
) {
  loadPromises.delete(targetWindow)
  warnedWindows.delete(targetWindow)
  targetDocument.getElementById(CDN_SCRIPT_ID)?.remove()
  targetDocument.getElementById(LOCAL_SCRIPT_ID)?.remove()
  delete targetWindow.rrweb
}
