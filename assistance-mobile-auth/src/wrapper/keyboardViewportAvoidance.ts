import type { AssistanceAuthResizePayload } from './verificationBridge'

export const KEYBOARD_SAFE_TOP_GAP_PX = 12
export const KEYBOARD_RESTORE_TOLERANCE_PX = 1
export const KEYBOARD_RESTORE_TIMEOUT_MS = 500

type AvoidanceState = 'idle' | 'focused' | 'closing'

export interface KeyboardViewportAvoidanceController {
  update(payload: AssistanceAuthResizePayload): void
  dispose(): void
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function isValidNaturalHeight(value: number): boolean {
  return isFiniteNumber(value) && value >= 0
}

export function createKeyboardViewportAvoidanceController({
  targetWindow,
  frame,
  positioningLayer,
  constrainToViewport = false,
}: {
  targetWindow: Window
  frame: HTMLIFrameElement
  positioningLayer: HTMLDivElement
  /** Customer bottom sheets stay within the visible viewport even without native keyboard focus. */
  constrainToViewport?: boolean
}): KeyboardViewportAvoidanceController {
  let state: AvoidanceState = 'idle'
  let naturalHeight = 0
  let hasNaturalHeight = false
  let appliedShift = 0
  let frameRequest: number | undefined
  let restoreTimer: number | undefined
  let listening = false
  let disposed = false
  let subscribedViewport: VisualViewport | undefined

  const readViewport = () => {
    const viewport = targetWindow.visualViewport
    return {
      top: viewport?.offsetTop ?? 0,
      height: viewport?.height ?? targetWindow.innerHeight,
    }
  }
  const baselineHeight = readViewport().height

  const clearFrameRequest = () => {
    if (frameRequest !== undefined) {
      targetWindow.cancelAnimationFrame(frameRequest)
      frameRequest = undefined
    }
  }

  const clearRestoreTimer = () => {
    if (restoreTimer !== undefined) {
      targetWindow.clearTimeout(restoreTimer)
      restoreTimer = undefined
    }
  }

  const applyNaturalLayout = () => {
    appliedShift = 0
    positioningLayer.style.transform = ''
    delete frame.dataset.assistanceAuthKeyboardConstrained
    if (hasNaturalHeight) {
      frame.style.height = `${naturalHeight}px`
    }
  }

  const syncViewportListeners = () => {
    const nextViewport = targetWindow.visualViewport ?? undefined
    if (subscribedViewport === nextViewport) {
      return
    }

    subscribedViewport?.removeEventListener('resize', schedule)
    subscribedViewport?.removeEventListener('scroll', schedule)
    subscribedViewport = nextViewport

    if (listening) {
      subscribedViewport?.addEventListener('resize', schedule)
      subscribedViewport?.addEventListener('scroll', schedule)
    }
  }

  const stopListening = () => {
    if (!listening) {
      return
    }
    listening = false
    targetWindow.removeEventListener('resize', schedule)
    subscribedViewport?.removeEventListener('resize', schedule)
    subscribedViewport?.removeEventListener('scroll', schedule)
    subscribedViewport = undefined
  }

  const finishClosing = () => {
    state = 'idle'
    clearFrameRequest()
    clearRestoreTimer()
    stopListening()
    applyNaturalLayout()
  }

  const apply = () => {
    frameRequest = undefined
    if (disposed) {
      return
    }
    syncViewportListeners()
    if (state === 'idle' && !constrainToViewport) {
      applyNaturalLayout()
      return
    }

    const viewport = readViewport()
    const visibleBottom = viewport.top + viewport.height
    // The frame itself enters with translateY(100%). Its visual rect therefore
    // includes the entrance animation and is not a stable keyboard-overlap
    // baseline. The positioning layer keeps the frame's untransformed layout
    // geometry while still reflecting the avoidance shift applied below.
    const rect = positioningLayer.getBoundingClientRect()
    if (
      !isFiniteNumber(viewport.top)
      || !isFiniteNumber(viewport.height)
      || viewport.height <= 0
      || !isFiniteNumber(rect.bottom)
    ) {
      return
    }

    const availableHeight = Math.max(
      1,
      Math.floor(viewport.height - KEYBOARD_SAFE_TOP_GAP_PX),
    )
    const effectiveHeight = Math.min(naturalHeight, availableHeight)
    frame.style.height = `${effectiveHeight}px`
    if (effectiveHeight < naturalHeight) {
      frame.dataset.assistanceAuthKeyboardConstrained = 'true'
    } else {
      delete frame.dataset.assistanceAuthKeyboardConstrained
    }

    const unshiftedFrameBottom = rect.bottom + appliedShift
    appliedShift = Math.max(0, Math.ceil(unshiftedFrameBottom - visibleBottom))
    positioningLayer.style.transform = appliedShift > 0
      ? `translate3d(0, -${appliedShift}px, 0)`
      : ''

    if (
      state === 'closing'
      && viewport.height >= baselineHeight - KEYBOARD_RESTORE_TOLERANCE_PX
    ) {
      finishClosing()
    }
  }

  function schedule() {
    if (disposed) {
      return
    }
    syncViewportListeners()
    if (frameRequest !== undefined) {
      return
    }
    frameRequest = targetWindow.requestAnimationFrame(apply)
  }

  const startListening = () => {
    if (!listening) {
      listening = true
      targetWindow.addEventListener('resize', schedule)
    }
    syncViewportListeners()
  }

  return {
    update(payload) {
      if (disposed) {
        return
      }

      if (isValidNaturalHeight(payload.height)) {
        naturalHeight = Math.ceil(payload.height)
        hasNaturalHeight = true
      }

      if (constrainToViewport) {
        startListening()
        schedule()
        return
      }

      if (payload.keyboardFocused === true) {
        state = 'focused'
        clearRestoreTimer()
        startListening()
        schedule()
        return
      }

      if (payload.keyboardFocused === false && state !== 'idle') {
        const enteringClosing = state !== 'closing'
        state = 'closing'
        startListening()
        schedule()
        if (enteringClosing) {
          clearRestoreTimer()
          restoreTimer = targetWindow.setTimeout(
            finishClosing,
            KEYBOARD_RESTORE_TIMEOUT_MS,
          )
        }
        return
      }

      if (state === 'idle') {
        applyNaturalLayout()
      } else {
        schedule()
      }
    },
    dispose() {
      disposed = true
      clearFrameRequest()
      clearRestoreTimer()
      stopListening()
      applyNaturalLayout()
    },
  }
}
