import { afterEach, describe, expect, it, vi } from 'vitest'

import { detectNetworkType } from './networkType'

type WxStub = { getNetworkType?: (opts: { success?: (r: { networkType?: string }) => void; fail?: () => void }) => void }

function setWx(wx: WxStub | undefined) {
  ;(window as unknown as { wx?: WxStub }).wx = wx
}

function setConnection(type: string | undefined) {
  Object.defineProperty(navigator, 'connection', {
    value: type === undefined ? undefined : { type },
    configurable: true,
  })
}

describe('detectNetworkType', () => {
  afterEach(() => {
    setWx(undefined)
    setConnection(undefined)
    vi.useRealTimers()
  })

  it('uses WeChat getNetworkType: wifi → wifi', async () => {
    setWx({ getNetworkType: ({ success }) => success?.({ networkType: 'wifi' }) })
    await expect(detectNetworkType()).resolves.toBe('wifi')
  })

  it('uses WeChat getNetworkType: 4g → cellular', async () => {
    setWx({ getNetworkType: ({ success }) => success?.({ networkType: '4g' }) })
    await expect(detectNetworkType()).resolves.toBe('cellular')
  })

  it('falls through WeChat "none" to the connection API', async () => {
    setWx({ getNetworkType: ({ success }) => success?.({ networkType: 'none' }) })
    setConnection('cellular')
    await expect(detectNetworkType()).resolves.toBe('cellular')
  })

  it('falls through WeChat fail() to the connection API', async () => {
    setWx({ getNetworkType: ({ fail }) => fail?.() })
    setConnection('wifi')
    await expect(detectNetworkType()).resolves.toBe('wifi')
  })

  it('uses navigator.connection.type when WeChat is absent', async () => {
    setConnection('wifi')
    await expect(detectNetworkType()).resolves.toBe('wifi')
    setConnection('cellular')
    await expect(detectNetworkType()).resolves.toBe('cellular')
  })

  it('returns unknown when no source is decisive (e.g. iOS Safari)', async () => {
    setConnection(undefined)
    await expect(detectNetworkType()).resolves.toBe('unknown')
    setConnection('ethernet')
    await expect(detectNetworkType()).resolves.toBe('unknown')
  })

  it('falls back when WeChat getNetworkType never calls back (timeout)', async () => {
    vi.useFakeTimers()
    setWx({ getNetworkType: () => {} }) // never invokes success/fail
    setConnection('wifi')
    const pending = detectNetworkType()
    await vi.advanceTimersByTimeAsync(600)
    await expect(pending).resolves.toBe('wifi')
  })
})
