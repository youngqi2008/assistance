import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createRrwebMonitorStore, isStagingRrwebMonitorPage } from './rrwebTestMonitorStore'
import type { RrwebEvent } from './rrwebResource'

describe('rrwebTestMonitorStore', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('enables both staging test pages regardless of build env', () => {
    expect(isStagingRrwebMonitorPage('/sign-pay-pro/test-page')).toBe(true)
    expect(isStagingRrwebMonitorPage('/sign-pay-pro-temp/test-page')).toBe(true)
    expect(isStagingRrwebMonitorPage('/sign-pay-pro/test-page/')).toBe(true)
    expect(isStagingRrwebMonitorPage('/sign-pay-pro/test-page-hk')).toBe(true)
    expect(isStagingRrwebMonitorPage('/sign-pay-pro-temp/test-page-hk')).toBe(true)
    expect(isStagingRrwebMonitorPage('/sign-pay-pro/test-page-hk/')).toBe(true)
    expect(isStagingRrwebMonitorPage('/sign-pay-pro/verification')).toBe(false)
    expect(isStagingRrwebMonitorPage('/sign-pay-pro/anything-else')).toBe(false)
  })

  it('batches events, caps recent JSON at 50, and counts iframe attachments', async () => {
    let emit: ((event: RrwebEvent) => void) | undefined
    const stop = vi.fn()
    const startRecorder = vi.fn(async (options: { emit(event: RrwebEvent): void }) => {
      emit = options.emit
      return { status: 'recording' as const, source: 'local' as const, stop }
    })
    const store = createRrwebMonitorStore({ startRecorder })

    store.start()
    await Promise.resolve()
    await Promise.resolve()
    expect(store.getSnapshot().status).toBe('recording')
    expect(store.getSnapshot().source).toBe('local')

    emit?.({ type: 3, timestamp: 1, data: { source: 0, isAttachIframe: true } })
    for (let index = 0; index < 55; index += 1) {
      emit?.({ type: 3, timestamp: index + 2, data: { source: 1, index } })
    }

    expect(store.getSnapshot().totalEvents).toBe(0)
    await vi.advanceTimersByTimeAsync(250)
    expect(store.getSnapshot()).toMatchObject({
      totalEvents: 56,
      iframeAttachEvents: 1,
    })
    expect(store.getSnapshot().recentEvents).toHaveLength(50)
    expect(store.getSnapshot().recentEvents.at(-1)?.timestamp).toBe(56)

    store.clear()
    expect(store.getSnapshot()).toMatchObject({
      totalEvents: 0,
      iframeAttachEvents: 0,
      recentEvents: [],
    })
    store.stop()
    store.stop()
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('publishes unavailable without throwing', async () => {
    const store = createRrwebMonitorStore({
      startRecorder: vi.fn(async () => ({
        status: 'unavailable' as const,
        error: new Error('blocked'),
        stop() {},
      })),
    })
    store.start()
    await Promise.resolve()
    await Promise.resolve()
    expect(store.getSnapshot()).toMatchObject({
      status: 'unavailable',
      message: 'blocked',
    })
  })
})
