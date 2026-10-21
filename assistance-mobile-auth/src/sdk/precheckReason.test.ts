import { describe, expect, it } from 'vitest'

import { mapProbeFailureReason, refineAmbiguousReason } from './precheckReason'

describe('mapProbeFailureReason', () => {
  it('maps the all-carriers-failed sentinel and WAP gateway code to ambiguous', () => {
    // 单凭错误码无法区分 WiFi 与非移动号码——归为 ambiguous，由网络类型探测细化。
    expect(mapProbeFailureReason('ALL_CARRIERS_FAILED')).toBe('ambiguous')
    expect(mapProbeFailureReason('103111')).toBe('ambiguous')
  })

  it('maps other carrier-mismatch codes to non-mobile', () => {
    expect(mapProbeFailureReason('110031')).toBe('non-mobile')
    expect(mapProbeFailureReason('110032')).toBe('non-mobile')
    expect(mapProbeFailureReason('103124')).toBe('non-mobile')
    expect(mapProbeFailureReason('103125')).toBe('non-mobile')
    expect(mapProbeFailureReason('105110')).toBe('non-mobile')
  })

  it('maps resource/init/unknown/empty codes to unknown', () => {
    expect(mapProbeFailureReason('NETWORK_TIMEOUT')).toBe('unknown')
    expect(mapProbeFailureReason('CDN_BLOCKED')).toBe('unknown')
    expect(mapProbeFailureReason('103119')).toBe('unknown') // sdk-init-failed
    expect(mapProbeFailureReason('999999')).toBe('unknown') // unmapped
    expect(mapProbeFailureReason('')).toBe('unknown')
  })
})

describe('refineAmbiguousReason', () => {
  it('refines ambiguous via detected network type', () => {
    expect(refineAmbiguousReason('wifi')).toBe('wifi')
    expect(refineAmbiguousReason('cellular')).toBe('non-mobile')
    expect(refineAmbiguousReason('unknown')).toBe('ambiguous')
  })
})
