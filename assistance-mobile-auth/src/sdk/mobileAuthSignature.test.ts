import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  MOBILE_AUTH_DEFAULT_APP_ID,
  MOBILE_AUTH_DEFAULT_VERSION,
  MOBILE_AUTH_FRONTEND_APP_KEY,
  createFrontendMobileAuthParams,
  createMobileAuthStd2Sign,
  createMobileAuthTimestamp,
  md5Hex,
} from './mobileAuthSignature'

describe('mobile auth frontend signing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('computes standard MD5 hex digests', () => {
    expect(md5Hex('')).toBe('d41d8cd98f00b204e9800998ecf8427e')
    expect(md5Hex('abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
  })

  it('formats the 17 digit mobile JSSDK timestamp', () => {
    expect(createMobileAuthTimestamp(new Date(2026, 4, 9, 12, 3, 4, 5))).toBe('20260509120304005')
  })

  it('uses the documented STD2 signing source with msgId equal to traceId', () => {
    const traceId = 'ABCDEF1234567890ABCDEF1234567890'
    const timestamp = '20260509120304005'

    expect(createMobileAuthStd2Sign({
      appId: MOBILE_AUTH_DEFAULT_APP_ID,
      appKey: MOBILE_AUTH_FRONTEND_APP_KEY,
      traceId,
      timestamp,
      version: MOBILE_AUTH_DEFAULT_VERSION,
    })).toBe(md5Hex(`${MOBILE_AUTH_DEFAULT_APP_ID}14${traceId}${timestamp}${traceId}${MOBILE_AUTH_DEFAULT_VERSION}${MOBILE_AUTH_FRONTEND_APP_KEY}`))
  })

  it('creates showAuthPage params with frontend-generated sign/timestamp/traceId defaults', () => {
    if (!('randomUUID' in crypto)) {
      Object.defineProperty(crypto, 'randomUUID', {
        configurable: true,
        value: vi.fn(),
      })
    }

    vi.spyOn(crypto, 'randomUUID').mockReturnValue('abcdef12-3456-7890-abcd-ef1234567890')

    expect(createFrontendMobileAuthParams({
      timestamp: '20260509120304005',
    })).toEqual({
      version: '3.0',
      appId: '300013215094',
      sign: createMobileAuthStd2Sign({
        appId: '300013215094',
        appKey: '143B232CAA71306A80CB6ED01655B23E',
        traceId: 'ABCDEF1234567890ABCDEF1234567890',
        timestamp: '20260509120304005',
        version: '3.0',
      }),
      traceId: 'ABCDEF1234567890ABCDEF1234567890',
      timestamp: '20260509120304005',
      authType: '0',
      scope: '3ElementsAuthAssistFill',
    })
  })

  it('never emits the retired authType 11 value', () => {
    const params = createFrontendMobileAuthParams({
      appId: '300013215094',
      appKey: MOBILE_AUTH_FRONTEND_APP_KEY,
      traceId: 'ABCDEF1234567890ABCDEF1234567890',
      timestamp: '20260509120304005',
      authType: '11',
      scope: '3ElementsAuthAssistFill',
    })

    expect(params.authType).toBe('0')
  })
})
