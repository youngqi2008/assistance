import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAssistanceMobileAuthSdk } from './index'
import {
  ASSISTANCE_AUTH_PROBE_RESULT,
  createAssistanceAuthMessage,
} from './verificationBridge'
import { SFT_PUBLIC_BASE_URL } from '../config/publicBase'

const ALLOWED_ORIGIN = new URL(SFT_PUBLIC_BASE_URL).origin

function probeFrame() {
  return document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-probe="true"]')
}

function postProbeResultForActiveFrame(payload: unknown) {
  const frame = probeFrame()
  if (!frame) throw new Error('no probe frame')
  const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId') ?? ''
  window.dispatchEvent(new MessageEvent('message', {
    origin: ALLOWED_ORIGIN,
    data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, sessionId, payload),
  }))
}

describe('precheck()', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('creates a hidden probe iframe (mode=probe) and resolves on PROBE_RESULT, then cleans up', async () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    const pending = sdk.precheck({ scene: 'native-number', requestId: 'req-1' })

    const frame = probeFrame()
    expect(frame).not.toBeNull()
    expect(new URL(frame!.src).searchParams.get('mode')).toBe('probe')
    expect(new URL(frame!.src).searchParams.get('requestId')).toBe('req-1')
    expect(frame!.src).not.toContain('launchToken')

    postProbeResultForActiveFrame({ eligible: false, reason: 'wifi', raw: { code: 'ALL_CARRIERS_FAILED' } })
    const result = await pending
    expect(result.reason).toBe('wifi')
    expect(probeFrame()).toBeNull() // iframe removed
  })

  it('resolves unknown on timeout and ignores a late PROBE_RESULT', async () => {
    vi.useFakeTimers()
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    const pending = sdk.precheck({ timeoutMs: 1000 })

    const frame = probeFrame()!
    const sessionId = new URL(frame.src).searchParams.get('assistanceAuthSessionId') ?? ''

    vi.advanceTimersByTime(1000)
    const result = await pending
    expect(result).toEqual({ eligible: false, reason: 'unknown' })
    expect(probeFrame()).toBeNull()

    // 迟到结果被忽略（不抛错、状态已 settle）
    window.dispatchEvent(new MessageEvent('message', {
      origin: ALLOWED_ORIGIN,
      data: createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, sessionId, { reason: 'ok' }),
    }))
  })

  it('reuses the same in-flight promise for concurrent precheck calls', () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    const a = sdk.precheck({})
    const b = sdk.precheck({})
    expect(a).toBe(b)
    expect(document.querySelectorAll('iframe[data-assistance-auth-probe="true"]').length).toBe(1)
    postProbeResultForActiveFrame({ reason: 'ok' })
    return a
  })

  it('keeps the hidden precheck iframe at 1px regardless of auth window height options', () => {
    const sdk = createAssistanceMobileAuthSdk({
      appId: 'test-app-id',
      authWindowHeight: 640,
      authWindowMaxHeight: 760,
    })

    const promise = sdk.precheck({ scene: 'native-number', requestId: 'probe-height' })
    void promise.then(() => undefined)

    const frame = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-probe="true"]')
    expect(frame).toHaveStyle({ width: '1px', height: '1px' })
    sdk.destroy()
  })

  it('destroy() aborts an in-flight precheck: resolves unknown and removes the probe iframe', async () => {
    const sdk = createAssistanceMobileAuthSdk({ appId: 'test-app-id' })
    const pending = sdk.precheck({})

    expect(probeFrame()).not.toBeNull()

    sdk.destroy()

    const result = await pending
    expect(result).toEqual({ eligible: false, reason: 'unknown' })
    expect(probeFrame()).toBeNull()
  })
})
