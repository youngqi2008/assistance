import { describe, expect, it } from 'vitest'

import { extractSdkErrorPayload, lookupSdkError, SDK_ERROR_CODE_MAP } from './sdkErrorMessages'

describe('lookupSdkError', () => {
  it('returns the doc-source mapping for known appendix-A codes', () => {
    expect(lookupSdkError('103119').errorKind).toBe('sdk-init-failed')
    expect(lookupSdkError('103119').source).toBe('doc')
    expect(lookupSdkError('103124').errorKind).toBe('carrier-mismatch')
    expect(lookupSdkError('103124').source).toBe('doc')
    expect(lookupSdkError('105110').errorKind).toBe('carrier-mismatch')
  })

  it('flags 110031 / 110032 as business-inferred carrier-mismatch ([ASSUMED])', () => {
    expect(lookupSdkError('110031').errorKind).toBe('carrier-mismatch')
    expect(lookupSdkError('110031').source).toBe('business')
    expect(lookupSdkError('110032').errorKind).toBe('carrier-mismatch')
    expect(lookupSdkError('110032').source).toBe('business')
  })

  it('coerces numeric codes to strings before lookup', () => {
    expect(lookupSdkError(103124).errorKind).toBe('carrier-mismatch')
    expect(lookupSdkError(110031).errorKind).toBe('carrier-mismatch')
  })

  it('trims whitespace before lookup', () => {
    expect(lookupSdkError(' 103124 ').errorKind).toBe('carrier-mismatch')
  })

  it('returns sentinel unknown mapping for missing or undefined codes', () => {
    expect(lookupSdkError(undefined).errorKind).toBe('unknown')
    expect(lookupSdkError(undefined).source).toBe('sentinel')
    expect(lookupSdkError(null).errorKind).toBe('unknown')
    expect(lookupSdkError('').errorKind).toBe('unknown')
  })

  it('returns sentinel mapping for unrecognized codes with code visible in uiText', () => {
    const unknown = lookupSdkError('999999')
    expect(unknown.errorKind).toBe('unknown')
    expect(unknown.source).toBe('sentinel')
    expect(unknown.uiText).toContain('999999')
  })

  it('exposes sentinel keys for our own state machine', () => {
    expect(lookupSdkError('NETWORK_TIMEOUT').errorKind).toBe('network-timeout')
    expect(lookupSdkError('NETWORK_TIMEOUT').source).toBe('sentinel')
    expect(lookupSdkError('SDK_DISABLED').errorKind).toBe('sdk-disabled')
  })

  it('table contains at least 17 entries covering doc + business + sentinel', () => {
    expect(Object.keys(SDK_ERROR_CODE_MAP).length).toBeGreaterThanOrEqual(17)
  })
})

describe('extractSdkErrorPayload', () => {
  it('extracts non-success code from CUData (only CU failed)', () => {
    const payload = {
      YDData: { resultCode: '103000' },
      CTData: { resultCode: '103000' },
      CUData: { code: '110032', message: '无联通取号权益' },
      msgId: 'BD823A4DFE5045E8B5AA010E4062DCF8',
    }
    const out = extractSdkErrorPayload(payload)
    expect(out.code).toBe('110032')
    expect(out.desc).toBe('无联通取号权益')
    expect(out.carrier).toBe('CU')
  })

  it('returns ALL_CARRIERS_FAILED when YD, CT, and CU all reported errors (wifi / non-mobile network)', () => {
    // Real staging payload: user on wifi, no mobile cellular
    const payload = {
      YDData: { code: '103111', message: 'WAP网关IP错误' },
      CTData: { code: '110031', message: '无电信取号权益' },
      CUData: { code: '110032', message: '无联通取号权益' },
      msgId: '02FEA18B670F4DC8B977FFCE0E1BAB42',
    }
    const out = extractSdkErrorPayload(payload)
    expect(out.code).toBe('ALL_CARRIERS_FAILED')
    expect(out.carrier).toBe('unknown')
    // desc preserves carrier breakdown for staging logs
    expect(out.desc).toContain('YD:103111')
    expect(out.desc).toContain('CT:110031')
    expect(out.desc).toContain('CU:110032')
    // 结构化各家原始码，供上层（precheck）区分 wifi vs 非移动号码时排查
    expect(out.carriers).toEqual({ YD: '103111', CT: '110031', CU: '110032' })
  })

  it('lookupSdkError(ALL_CARRIERS_FAILED) maps to friendly carrier-mismatch panel with steps', () => {
    const m = lookupSdkError('ALL_CARRIERS_FAILED')
    expect(m.errorKind).toBe('carrier-mismatch')
    expect(m.steps).toBeDefined()
    expect(m.steps?.length ?? 0).toBeGreaterThanOrEqual(3)
    expect(m.uiText).toContain('中国移动')
  })

  it('YDData takes priority over CT when both failed (CU success keeps it below the all-failed sentinel)', () => {
    // 注意：三家全失败时会映射成 ALL_CARRIERS_FAILED 哨兵（见上一个用例），
    // 所以这里让 CU 成功，只验证 YD > CT 的优先级。
    const payload = {
      YDData: { resultCode: '110031', desc: '无移动取号权益' },
      CTData: { resultCode: '110032', desc: '无电信取号权益' },
      CUData: { resultCode: '103000' },
      msgId: 'm1',
    }
    const out = extractSdkErrorPayload(payload)
    expect(out.code).toBe('110031')
    expect(out.carrier).toBe('YD')
  })

  it('falls back to flat payload.code when no carrier sub-objects present (legacy [ASSUMED] shape)', () => {
    const payload = { code: '103119', desc: 'AppID 配置异常' }
    const out = extractSdkErrorPayload(payload)
    expect(out.code).toBe('103119')
    expect(out.desc).toBe('AppID 配置异常')
    expect(out.carrier).toBe('unknown')
  })

  it('returns empty code for null / undefined / non-object payloads', () => {
    expect(extractSdkErrorPayload(null).code).toBe('')
    expect(extractSdkErrorPayload(undefined).code).toBe('')
    expect(extractSdkErrorPayload('not-an-object').code).toBe('')
    expect(extractSdkErrorPayload(42).code).toBe('')
  })

  it('returns empty code when all carriers report 103000 (success) and no flat code', () => {
    const payload = {
      YDData: { resultCode: '103000' },
      CTData: { resultCode: '103000' },
      CUData: { resultCode: '103000' },
      msgId: 'm1',
    }
    const out = extractSdkErrorPayload(payload)
    expect(out.code).toBe('')
    expect(out.carrier).toBe('unknown')
  })
})
