import { startRrwebRecorder } from './rrwebRecorder'
import type { RrwebEvent, RrwebLoadSource } from './rrwebResource'

const MAX_RECENT_EVENTS = 50
const FLUSH_INTERVAL_MS = 250

export interface RrwebMonitorState {
  status: 'idle' | 'loading' | 'recording' | 'unavailable'
  source?: RrwebLoadSource
  message?: string
  totalEvents: number
  iframeAttachEvents: number
  recentEvents: RrwebEvent[]
}

export interface RrwebMonitorStore {
  start(): void
  stop(): void
  clear(): void
  subscribe(listener: () => void): () => void
  getSnapshot(): RrwebMonitorState
}

interface StoreDependencies {
  startRecorder?: typeof startRrwebRecorder
  schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>
  cancel?: (timer: ReturnType<typeof setTimeout>) => void
}

function isIframeAttachEvent(event: RrwebEvent) {
  return typeof event.data === 'object' && event.data !== null &&
    (event.data as { isAttachIframe?: unknown }).isAttachIframe === true
}

export function createRrwebMonitorStore(dependencies: StoreDependencies = {}): RrwebMonitorStore {
  const startRecorder = dependencies.startRecorder ?? startRrwebRecorder
  const schedule = dependencies.schedule ?? setTimeout
  const cancel = dependencies.cancel ?? clearTimeout
  const listeners = new Set<() => void>()
  let state: RrwebMonitorState = {
    status: 'idle',
    totalEvents: 0,
    iframeAttachEvents: 0,
    recentEvents: [],
  }
  let started = false
  let stopped = false
  let stopRecorder: () => void = () => undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let totalEvents = 0
  let iframeAttachEvents = 0
  let recentEvents: RrwebEvent[] = []

  const publish = (next: Partial<RrwebMonitorState> = {}) => {
    state = {
      ...state,
      totalEvents,
      iframeAttachEvents,
      recentEvents: [...recentEvents],
      ...next,
    }
    listeners.forEach((listener) => listener())
  }

  const flush = () => {
    timer = undefined
    if (!stopped) publish()
  }

  const emit = (event: RrwebEvent) => {
    try {
      totalEvents += 1
      if (isIframeAttachEvent(event)) iframeAttachEvents += 1
      recentEvents = [...recentEvents, event].slice(-MAX_RECENT_EVENTS)
      timer ??= schedule(flush, FLUSH_INTERVAL_MS)
    } catch {
      // Diagnostic rendering must never escape into rrweb's emit path.
    }
  }

  return {
    start() {
      if (started) return
      started = true
      publish({ status: 'loading', message: undefined })
      void startRecorder({ emit }).then((result) => {
        if (stopped) {
          result.stop()
          return
        }
        stopRecorder = result.stop
        if (result.status === 'recording') {
          publish({ status: 'recording', source: result.source, message: undefined })
          return
        }
        publish({ status: 'unavailable', source: undefined, message: result.error.message })
      }).catch((error: unknown) => {
        publish({
          status: 'unavailable',
          source: undefined,
          message: error instanceof Error ? error.message : String(error),
        })
      })
    },
    stop() {
      if (stopped) return
      stopped = true
      if (timer !== undefined) cancel(timer)
      timer = undefined
      stopRecorder()
    },
    clear() {
      totalEvents = 0
      iframeAttachEvents = 0
      recentEvents = []
      publish()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return state
    },
  }
}

export const rrwebTestMonitorStore = createRrwebMonitorStore()

export function isStagingRrwebMonitorPage(
  pathname: string = window.location.pathname,
) {
  const normalizedPathname = pathname.replace(/\/+$/, '')
  return normalizedPathname.endsWith('/test-page') || normalizedPathname.endsWith('/test-page-hk')
}

export function startStagingRrwebMonitor() {
  if (!isStagingRrwebMonitorPage()) return
  rrwebTestMonitorStore.start()
  const stop = () => rrwebTestMonitorStore.stop()
  window.addEventListener('pagehide', stop, { once: true })
  window.addEventListener('beforeunload', stop, { once: true })
}
