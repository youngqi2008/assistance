import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createKeyboardViewportAvoidanceController } from './keyboardViewportAvoidance'

function installViewport(height: number, offsetTop = 0) {
  const viewport = new EventTarget() as VisualViewport
  Object.defineProperties(viewport, {
    height: { value: height, writable: true, configurable: true },
    offsetTop: { value: offsetTop, writable: true, configurable: true },
  })
  Object.defineProperty(window, 'visualViewport', {
    value: viewport,
    configurable: true,
  })
  return viewport
}

function createHarness(positioningLayerBottom: () => number, constrainToViewport = false) {
  const frame = document.createElement('iframe')
  const positioningLayer = document.createElement('div')
  positioningLayer.appendChild(frame)
  document.body.appendChild(positioningLayer)
  vi.spyOn(positioningLayer, 'getBoundingClientRect').mockImplementation(() => ({
    x: 0,
    y: 0,
    top: 0,
    right: 390,
    bottom: positioningLayerBottom(),
    left: 0,
    width: 390,
    height: Number.parseFloat(frame.style.height) || 0,
    toJSON: () => ({}),
  }))
  return {
    frame,
    positioningLayer,
    controller: createKeyboardViewportAvoidanceController({
      targetWindow: window,
      frame,
      positioningLayer,
      constrainToViewport,
    }),
  }
}

describe('createKeyboardViewportAvoidanceController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => (
      window.setTimeout(() => callback(performance.now()), 0)
    ))
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
    document.body.innerHTML = ''
    Object.defineProperty(window, 'innerHeight', { value: 844, configurable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('keeps customer content capped while the custom keyboard is closed and the viewport changes', () => {
    const vv = installViewport(500)
    const harness = createHarness(() => vv.height + vv.offsetTop, true)
    harness.controller.update({ height: 900, keyboardFocused: false })
    vi.advanceTimersByTime(10)
    expect(harness.frame.style.height).toBe('488px')
    Object.assign(vv, { height: 350 }); vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(10)
    expect(harness.frame.style.height).toBe('338px')
    Object.assign(vv, { height: 1000 }); vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(10)
    expect(harness.frame.style.height).toBe('900px')
    harness.controller.dispose()
  })

  it('retains viewport limiting after custom keyboard blur and releases subscriptions on dispose', () => {
    const vv = installViewport(500); const remove = vi.spyOn(vv, 'removeEventListener')
    const harness = createHarness(() => vv.height, true)
    harness.controller.update({ height: 900, keyboardFocused: true }); vi.advanceTimersByTime(10)
    harness.controller.update({ height: 900, keyboardFocused: false }); vi.advanceTimersByTime(600)
    expect(harness.frame.style.height).toBe('488px')
    harness.controller.dispose(); expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
    const finalHeight = harness.frame.style.height
    Object.assign(vv, { height: 300 }); vv.dispatchEvent(new Event('resize')); vi.advanceTimersByTime(10)
    expect(harness.frame.style.height).toBe(finalHeight)
  })

  it('moves an iOS-style bottom-anchored frame by the exact overlap and caps its height', () => {
    const viewport = installViewport(500)
    let appliedShift = 0
    const harness = createHarness(() => 844 - appliedShift)

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.height).toBe('488px')
    expect(harness.positioningLayer.style.transform).toBe('translate3d(0, -344px, 0)')
    appliedShift = 344

    viewport.dispatchEvent(new Event('resize'))
    vi.runOnlyPendingTimers()
    expect(harness.positioningLayer.style.transform).toBe('translate3d(0, -344px, 0)')
  })

  it('uses the positioning layer baseline while the iframe enter transform is still active', () => {
    installViewport(500)
    const harness = createHarness(() => 844)
    harness.frame.style.height = '420px'
    harness.frame.style.transform = 'translateY(100%)'
    vi.spyOn(harness.frame, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: 844,
      top: 844,
      right: 390,
      bottom: 1264,
      left: 0,
      width: 390,
      height: 420,
      toJSON: () => ({}),
    }))

    harness.controller.update({ height: 420, keyboardFocused: true })
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.transform).toBe('translateY(100%)')
    expect(harness.positioningLayer.style.transform).toBe('translate3d(0, -344px, 0)')
  })

  it('does not translate an Android-style frame already ending at the visible bottom', () => {
    installViewport(500)
    const harness = createHarness(() => 500)

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.height).toBe('488px')
    expect(harness.positioningLayer.style.transform).toBe('')
  })

  it('keeps natural height when content fits but still applies the measured overlap', () => {
    installViewport(500)
    const harness = createHarness(() => 844)

    harness.controller.update({ height: 400, keyboardFocused: true })
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.height).toBe('400px')
    expect(harness.positioningLayer.style.transform).toBe('translate3d(0, -344px, 0)')
    expect(harness.frame.dataset.assistanceAuthKeyboardConstrained).toBeUndefined()
  })

  it('restores natural height and position when the closing viewport reaches baseline', () => {
    const viewport = installViewport(500)
    const harness = createHarness(() => 844)

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()
    harness.controller.update({ height: 620, keyboardFocused: false })

    Object.defineProperty(viewport, 'height', { value: 844, writable: true })
    viewport.dispatchEvent(new Event('resize'))
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.height).toBe('620px')
    expect(harness.positioningLayer.style.transform).toBe('')
  })

  it('cleans closing state after 500ms even if the viewport never reports recovery', () => {
    installViewport(500)
    const harness = createHarness(() => 844)

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()
    harness.controller.update({ height: 620, keyboardFocused: false })
    vi.advanceTimersByTime(500)

    expect(harness.frame.style.height).toBe('620px')
    expect(harness.positioningLayer.style.transform).toBe('')
  })

  it('does not restart the closing deadline for duplicate blurred updates', () => {
    const viewport = installViewport(844)
    const harness = createHarness(() => 844)
    Object.defineProperty(viewport, 'height', { value: 500, writable: true })

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()
    harness.controller.update({ height: 620, keyboardFocused: false })
    vi.advanceTimersByTime(250)
    harness.controller.update({ height: 620, keyboardFocused: false })
    vi.advanceTimersByTime(250)

    expect(harness.frame.style.height).toBe('620px')
    expect(harness.positioningLayer.style.transform).toBe('')
  })

  it('replaces viewport listeners when the active VisualViewport instance changes', () => {
    const originalViewport = installViewport(500)
    const originalRemoveSpy = vi.spyOn(originalViewport, 'removeEventListener')
    let appliedShift = 0
    const harness = createHarness(() => 844 - appliedShift)

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()
    appliedShift = 344

    const replacementViewport = installViewport(400)
    const replacementAddSpy = vi.spyOn(replacementViewport, 'addEventListener')
    const replacementRemoveSpy = vi.spyOn(replacementViewport, 'removeEventListener')

    harness.controller.update({ height: 620 })
    vi.runOnlyPendingTimers()

    expect(originalRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(originalRemoveSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(replacementAddSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(replacementAddSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(harness.frame.style.height).toBe('388px')
    expect(harness.positioningLayer.style.transform).toBe('translate3d(0, -444px, 0)')
    appliedShift = 444

    Object.defineProperty(replacementViewport, 'height', { value: 450, writable: true })
    replacementViewport.dispatchEvent(new Event('resize'))
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.height).toBe('438px')
    expect(harness.positioningLayer.style.transform).toBe('translate3d(0, -394px, 0)')

    harness.controller.dispose()
    expect(replacementRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(replacementRemoveSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('uses innerHeight when visualViewport is unavailable', () => {
    Object.defineProperty(window, 'visualViewport', {
      value: undefined,
      configurable: true,
    })
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })
    const harness = createHarness(() => 844)

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.height).toBe('488px')
    expect(harness.positioningLayer.style.transform).toBe('translate3d(0, -344px, 0)')
  })

  it('does not overwrite the frame max-height constraint', () => {
    installViewport(500)
    const harness = createHarness(() => 844)
    harness.frame.style.maxHeight = 'calc(100% - 24px)'

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()

    expect(harness.frame.style.maxHeight).toBe('calc(100% - 24px)')
  })

  it('preserves the last valid natural height for nonfinite and negative payloads', () => {
    for (const height of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      const viewport = installViewport(844)
      const harness = createHarness(() => 844)
      Object.defineProperty(viewport, 'height', { value: 500, writable: true })

      harness.controller.update({ height: 620, keyboardFocused: true })
      vi.runOnlyPendingTimers()
      harness.controller.update({ height, keyboardFocused: false })
      vi.advanceTimersByTime(500)

      expect(harness.frame.style.height).toBe('620px')
      harness.controller.dispose()
    }
  })

  it('restores a valid zero natural height after keyboard cleanup', () => {
    const viewport = installViewport(844)
    const harness = createHarness(() => 844)
    Object.defineProperty(viewport, 'height', { value: 500, writable: true })

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()
    harness.controller.update({ height: 0, keyboardFocused: false })
    Object.defineProperty(viewport, 'height', { value: 0, writable: true })
    vi.advanceTimersByTime(500)

    expect(harness.frame.style.height).toBe('0px')
    expect(harness.positioningLayer.style.transform).toBe('')
  })

  it('dispose restores an applied shift and removes all active listeners', () => {
    const viewport = installViewport(500)
    const removeSpy = vi.spyOn(viewport, 'removeEventListener')
    const windowRemoveSpy = vi.spyOn(window, 'removeEventListener')
    const harness = createHarness(() => 844)
    harness.frame.style.transform = 'scale(1)'

    harness.controller.update({ height: 620, keyboardFocused: true })
    vi.runOnlyPendingTimers()
    harness.controller.dispose()
    vi.runAllTimers()

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(harness.frame.style.height).toBe('620px')
    expect(harness.positioningLayer.style.transform).toBe('')
    expect(harness.frame.style.transform).toBe('scale(1)')
  })
})
