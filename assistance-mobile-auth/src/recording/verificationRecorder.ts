import { startRrwebRecorder } from './rrwebRecorder'

interface EmbeddedRecorderOptions {
  targetWindow?: Window
  targetDocument?: Document
  embedded?: boolean
}

const cleanupByWindow = new WeakMap<Window, () => void>()
const noOp: () => void = () => undefined

export function isVerificationPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized.endsWith('/verification')
}

export function shouldStartEmbeddedVerificationRecorder(pathname: string, embedded: boolean) {
  return embedded && isVerificationPath(pathname)
}

export function startEmbeddedVerificationRecorder(options: EmbeddedRecorderOptions = {}) {
  const targetWindow = options.targetWindow ?? window
  const targetDocument = options.targetDocument ?? document
  const embedded = options.embedded ?? targetWindow.parent !== targetWindow

  if (!shouldStartEmbeddedVerificationRecorder(targetWindow.location.pathname, embedded)) {
    return noOp
  }

  const existing = cleanupByWindow.get(targetWindow)
  if (existing) return existing

  let stopped = false
  let stopRecorder = noOp
  const cleanup = () => {
    if (stopped) return
    stopped = true
    targetWindow.removeEventListener('pagehide', cleanup)
    targetWindow.removeEventListener('beforeunload', cleanup)
    stopRecorder()
    cleanupByWindow.delete(targetWindow)
  }

  cleanupByWindow.set(targetWindow, cleanup)
  targetWindow.addEventListener('pagehide', cleanup)
  targetWindow.addEventListener('beforeunload', cleanup)

  void startRrwebRecorder({
    targetWindow,
    targetDocument,
    emit() {},
  }).then((result) => {
    if (stopped) {
      result.stop()
      return
    }
    stopRecorder = result.stop
  }).catch(() => undefined)

  return cleanup
}

export function resetEmbeddedVerificationRecorderForTests(targetWindow: Window = window) {
  cleanupByWindow.get(targetWindow)?.()
}
