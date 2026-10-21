import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { startRrwebRecorder } = vi.hoisted(() => ({ startRrwebRecorder: vi.fn() }))
vi.mock('./rrwebRecorder', () => ({ startRrwebRecorder }))

import {
  isVerificationPath,
  resetEmbeddedVerificationRecorderForTests,
  shouldStartEmbeddedVerificationRecorder,
  startEmbeddedVerificationRecorder,
} from './verificationRecorder'

describe('verificationRecorder', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/sign-pay-pro/verification')
    startRrwebRecorder.mockReset()
    startRrwebRecorder.mockResolvedValue({
      status: 'recording',
      source: 'cdn',
      stop: vi.fn(),
    })
    resetEmbeddedVerificationRecorderForTests()
  })

  afterEach(() => {
    resetEmbeddedVerificationRecorderForTests()
    window.history.replaceState({}, '', '/')
  })

  it.each([
    '/verification',
    '/verification/',
    '/sign-pay-pro/verification',
    '/sign-pay-pro/verification///',
    '/sign-pay-pro-temp/verification',
    '/sign-pay-pro-temp/verification/',
  ])('accepts verification path %s', (pathname) => {
    expect(isVerificationPath(pathname)).toBe(true)
    expect(shouldStartEmbeddedVerificationRecorder(pathname, true)).toBe(true)
  })

  it.each([
    '/verification?mode=probe',
    '/sign-pay-pro/verification?flow=agreement&doc=entry',
  ])('starts on embedded query variant %s', async (url) => {
    window.history.replaceState({}, '', url)
    const cleanup = startEmbeddedVerificationRecorder({ embedded: true })
    await vi.waitFor(() => expect(startRrwebRecorder).toHaveBeenCalledTimes(1))
    cleanup()
  })

  it('recognizes assist-layer verification path', () => {
    expect(isVerificationPath('/sign-pay-pro/assist/verification')).toBe(true)
    expect(isVerificationPath('/sign-pay-pro/assist/verification/')).toBe(true)
    expect(isVerificationPath('/sign-pay-pro/auth')).toBe(false)
  })

  it('rejects top-level verification and unrelated embedded pages', () => {
    expect(shouldStartEmbeddedVerificationRecorder('/verification', false)).toBe(false)
    expect(shouldStartEmbeddedVerificationRecorder('/test-page', true)).toBe(false)
    expect(shouldStartEmbeddedVerificationRecorder('/auth', true)).toBe(false)
  })

  it('starts once and stops once across pagehide and beforeunload', async () => {
    const stop = vi.fn()
    startRrwebRecorder.mockResolvedValue({ status: 'recording', source: 'local', stop })

    const firstCleanup = startEmbeddedVerificationRecorder({ embedded: true })
    const secondCleanup = startEmbeddedVerificationRecorder({ embedded: true })
    expect(secondCleanup).toBe(firstCleanup)
    await vi.waitFor(() => expect(startRrwebRecorder).toHaveBeenCalledTimes(1))

    window.dispatchEvent(new Event('pagehide'))
    window.dispatchEvent(new Event('beforeunload'))
    firstCleanup()
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('does nothing for an ineligible page', () => {
    const cleanup = startEmbeddedVerificationRecorder({ embedded: false })
    cleanup()
    expect(startRrwebRecorder).not.toHaveBeenCalled()
  })
})
