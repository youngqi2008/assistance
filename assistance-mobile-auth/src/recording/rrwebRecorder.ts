import {
  loadRrwebResource,
  type RrwebEvent,
  type RrwebLoadSource,
} from './rrwebResource'

export type RrwebRecorderStartResult =
  | { status: 'recording'; source: RrwebLoadSource; stop(): void }
  | { status: 'unavailable'; error: Error; stop(): void }

interface StartOptions {
  emit(event: RrwebEvent, isCheckout?: boolean): void
  targetWindow?: Window
  targetDocument?: Document
  warn?: (message: string, error: Error) => void
}

const noOp = () => undefined

export async function startRrwebRecorder(options: StartOptions): Promise<RrwebRecorderStartResult> {
  const warn = options.warn ?? ((message: string, error: Error) => { console.warn(message, error) })
  const loaded = await loadRrwebResource({
    targetWindow: options.targetWindow,
    targetDocument: options.targetDocument,
    warn,
  })

  if (loaded.status === 'unavailable') {
    return { status: 'unavailable', error: loaded.error, stop: noOp }
  }

  try {
    const stopRecord = loaded.rrweb.record({
      emit: options.emit,
      recordCrossOriginIframes: true,
    })
    let stopped = false
    return {
      status: 'recording',
      source: loaded.source,
      stop() {
        if (stopped) return
        stopped = true
        if (typeof stopRecord !== 'function') return
        try {
          stopRecord()
        } catch (error) {
          warn('[rrweb] recorder cleanup failed', error instanceof Error ? error : new Error(String(error)))
        }
      },
    }
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error(String(error))
    warn('[rrweb] recorder startup failed', normalized)
    return { status: 'unavailable', error: normalized, stop: noOp }
  }
}
