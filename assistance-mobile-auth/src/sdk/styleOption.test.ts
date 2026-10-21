import { describe, expect, it } from 'vitest'

import {
  createMobileAuthStyleOption,
  mergeCustomerStyleOption,
  sanitizeStyleOptionForTransport,
} from './styleOption'

describe('createMobileAuthStyleOption', () => {
  it('returns all SDK styleOption sections needed by the H5 and wrapper contracts', () => {
    expect(createMobileAuthStyleOption()).toEqual(
      expect.objectContaining({
        submitBtnStyle: expect.any(Object),
        submitBtnDisabledStyle: expect.any(Object),
        submitBtnLoadingStyle: expect.any(Object),
        phoneStyle: expect.any(Object),
        localTipStyle: expect.any(Object),
        unlocalTipStyle: expect.any(Object),
        stateStyle: expect.any(Object),
        authTextStyle: expect.any(Object),
        authExpireStyle: expect.any(Object),
      }),
    )
  })

  it('locks the verification sheet submit and phone visuals from the 260630 layout spec', () => {
    const styleOption = createMobileAuthStyleOption()

    expect(styleOption.submitBtnStyle).toEqual(
      expect.objectContaining({
        name: '确认',
        bgColor: '#ff2d55',
        height: '48px',
        borderRadius: '10px',
        fontSize: '16px',
      }),
    )
    expect(styleOption.submitBtnLoadingStyle).toEqual(
      expect.objectContaining({
        height: '48px',
      }),
    )
    expect(styleOption.phoneStyle).toEqual(
      expect.objectContaining({
        fontColor: '#8A8F98',
        fontSize: '14px',
        textAlign: 'left',
        width: 'auto',
      }),
    )
  })

  it('supports shallow section overrides without mutating the shared defaults', () => {
    const overridden = createMobileAuthStyleOption({
      submitBtnStyle: {
        name: '自定义提交',
      },
    })

    expect(overridden.submitBtnStyle).toEqual(
      expect.objectContaining({
        name: '自定义提交',
        bgColor: '#ff2d55',
        height: '48px',
        borderRadius: '10px',
      }),
    )
    expect(createMobileAuthStyleOption().submitBtnStyle).toEqual(
      expect.objectContaining({
        name: '确认',
      }),
    )
  })

  it('locks Phase 10 D-10-01 brand red for SDK-rendered submit button', () => {
    const styleOption = createMobileAuthStyleOption()

    expect(styleOption.submitBtnStyle?.bgColor).toBe('#ff2d55')
    expect(styleOption.submitBtnDisabledStyle?.bgColor).toBe('#F5F6F8')
    expect(styleOption.submitBtnDisabledStyle?.fontColor).toBe('#8A8F98')
  })

  it('keeps tips typography aligned with the agreement gray copy', () => {
    expect(createMobileAuthStyleOption()).toEqual(
      expect.objectContaining({
        localTipStyle: expect.objectContaining({
          fontColor: '#8A8F98',
          fontSize: '12px',
          textAlign: 'left',
        }),
        unlocalTipStyle: expect.objectContaining({
          fontColor: '#8A8F98',
          fontSize: '12px',
          textAlign: 'left',
        }),
      }),
    )
  })

  it('uses compact inline phone typography for the subtitle row', () => {
    const styleOption = createMobileAuthStyleOption()
    expect(styleOption.phoneStyle).toEqual(
      expect.objectContaining({
        fontSize: '14px',
        fontColor: '#8A8F98',
        width: 'auto',
      }),
    )
  })

  it('omits agreeStyle by default so the SDK default operator agreement is unaffected', () => {
    expect(createMobileAuthStyleOption()).not.toHaveProperty('agreeStyle')
  })

  it('passes through agreeStyle.agreeArr custom agreements when provided', () => {
    const sft = () => undefined
    const cmcc = () => undefined
    const styleOption = createMobileAuthStyleOption({
      agreeStyle: {
        agreeArr: [
          { name: '《收付通用户信息认证授权协议》', customEvent: sft },
          { name: '《中国移动认证梧桐数盾隐私政策》', customEvent: cmcc },
        ],
      },
    })

    expect(styleOption.agreeStyle?.agreeArr).toEqual([
      { name: '《收付通用户信息认证授权协议》', customEvent: sft },
      { name: '《中国移动认证梧桐数盾隐私政策》', customEvent: cmcc },
    ])
    // 既有 section 仍在，agreeStyle 不破坏其它默认
    expect(styleOption.submitBtnStyle?.bgColor).toBe('#ff2d55')
  })
})

describe('sanitizeStyleOptionForTransport', () => {
  it('returns undefined for non-object input so callers can fall back to defaults', () => {
    expect(sanitizeStyleOptionForTransport(undefined)).toBeUndefined()
    expect(sanitizeStyleOptionForTransport(null)).toBeUndefined()
    expect(sanitizeStyleOptionForTransport('nope')).toBeUndefined()
  })

  it('preserves pure data style groups untouched', () => {
    const input = {
      submitBtnStyle: { bgColor: '#0A66FF', name: '立即授权' },
      phoneStyle: { fontColor: '#0F172A', fontSize: '18px' },
      checkboxStyle: { checkedColor: '#0A66FF', borderColor: '#C8CCD1' },
    }

    expect(sanitizeStyleOptionForTransport(input)).toEqual(input)
  })

  it('strips customEvent functions inside agreeStyle protocol arrays (postMessage-safe)', () => {
    const sanitized = sanitizeStyleOptionForTransport({
      agreeStyle: {
        fontColor: '#475569',
        agreeArr: [
          { name: '《服务协议》', link: 'https://example.com/s', customEvent: () => undefined },
          { name: '《隐私政策》', customEvent: () => undefined },
        ],
      },
    })

    expect(sanitized?.agreeStyle?.agreeArr).toEqual([
      { name: '《服务协议》', link: 'https://example.com/s' },
      { name: '《隐私政策》' },
    ])
  })

  it('drops any function-valued field reaching in via index signatures', () => {
    const sanitized = sanitizeStyleOptionForTransport({
      submitBtnStyle: { bgColor: '#fff', onClick: () => undefined },
      malicious: () => undefined,
    })

    expect(sanitized).toEqual({ submitBtnStyle: { bgColor: '#fff' } })
  })

  it('produces a structured-clone-safe object (no DataCloneError)', () => {
    const sanitized = sanitizeStyleOptionForTransport({
      agreeStyle: { agreeArr: [{ name: 'x', customEvent: () => undefined }] },
    })

    expect(() => structuredClone(sanitized)).not.toThrow()
  })
})

describe('mergeCustomerStyleOption', () => {
  const ourAgreeStyle = { textAlign: 'left', fontColor: '#475569', CMText: '《移动认证安全基座服务条款》' }

  it('applies customer non-protocol groups over our defaults', () => {
    const merged = mergeCustomerStyleOption(
      { submitBtnStyle: { bgColor: '#0A66FF', name: '立即授权' }, phoneStyle: { fontColor: '#111111' } },
      ourAgreeStyle,
    )

    expect(merged.submitBtnStyle).toEqual(expect.objectContaining({ bgColor: '#0A66FF', name: '立即授权' }))
    expect(merged.phoneStyle).toEqual(expect.objectContaining({ fontColor: '#111111' }))
  })

  it('always uses our agreeStyle and ignores any customer agreeStyle (protect protocol区)', () => {
    const merged = mergeCustomerStyleOption(
      { agreeStyle: { fontColor: '#ff0000', agreeArr: [{ name: '客户协议' }] } },
      ourAgreeStyle,
    )

    expect(merged.agreeStyle).toEqual(ourAgreeStyle)
    expect(merged.agreeStyle?.agreeArr).toBeUndefined()
  })

  it('drops customer image styles (rendered via React img, not SDK styleOption)', () => {
    const merged = mergeCustomerStyleOption(
      { topImageStyle: { src: 'https://x/top.png' }, bottomImageStyle: { src: 'https://x/bot.png' } },
      ourAgreeStyle,
    )

    expect(merged).not.toHaveProperty('topImageStyle')
    expect(merged).not.toHaveProperty('bottomImageStyle')
  })

  it('falls back to defaults + our agreeStyle when customer style is null', () => {
    const merged = mergeCustomerStyleOption(null, ourAgreeStyle)

    expect(merged.submitBtnStyle?.bgColor).toBe('#ff2d55')
    expect(merged.agreeStyle).toEqual(ourAgreeStyle)
  })
})
