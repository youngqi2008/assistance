import { describe, expect, it } from 'vitest'

import { HAIKE_APP_ID, ZIDINGYI_APP_ID, YUANBAO_APP_ID, isYuanbaoFeedbackProfile, isZidingyiFeedbackProfile, resolveAppProfile, resolveAppProfileFrom } from './registry'
import type { AppProfile } from './types'

describe('resolveAppProfile', () => {
  it('matches the new Yuanbao appId without replacing its identity', () => {
    const appId = '8a9481c79c05c8bd019ed8d49fb81df2'
    expect(resolveAppProfile(appId)).toMatchObject({ appId, skin: 'chinaumsSheetV23' })
    expect(isYuanbaoFeedbackProfile(appId)).toBe(true)
  })
  it('isolates Yuanbao feedback from existing profiles and preserves caller identity', () => {
    expect(resolveAppProfile(YUANBAO_APP_ID)).toMatchObject({ appId: YUANBAO_APP_ID, skin: 'chinaumsSheetV23' })
    expect(resolveAppProfile(YUANBAO_APP_ID)?.ui?.agreements).toBeUndefined()
    expect(isYuanbaoFeedbackProfile(` ${YUANBAO_APP_ID} `)).toBe(true)
    expect(isZidingyiFeedbackProfile(YUANBAO_APP_ID)).toBe(false)
    for (const appId of [ZIDINGYI_APP_ID, HAIKE_APP_ID, 'unknown', `${YUANBAO_APP_ID}x`, null, undefined]) {
      expect(isYuanbaoFeedbackProfile(appId)).toBe(false)
    }
  })
  it('resolves the built-in demo profile', () => {
    const profile = resolveAppProfile('demo-brand-001')
    expect(profile?.appId).toBe('demo-brand-001')
    expect(profile?.ui?.texts?.headerTitle?.text).toBe('示例品牌身份核验')
  })

  it('returns null for unknown, empty, or non-string appId', () => {
    expect(resolveAppProfile('nope')).toBeNull()
    expect(resolveAppProfile('')).toBeNull()
    expect(resolveAppProfile('   ')).toBeNull()
    expect(resolveAppProfile(null)).toBeNull()
    expect(resolveAppProfile(undefined)).toBeNull()
  })

  it('trims appId before lookup', () => {
    expect(resolveAppProfile('  demo-brand-001  ')?.appId).toBe('demo-brand-001')
  })

  it('resolveAppProfileFrom supports injected maps', () => {
    const fake: AppProfile = { appId: 'x', label: 'x' }
    const map = new Map([['x', fake]])
    expect(resolveAppProfileFrom(map, 'x')).toBe(fake)
    expect(resolveAppProfileFrom(map, 'y')).toBeNull()
  })
})

describe('chinaums-sheet 绑定（appId 可变，样式档案稳定）', () => {
  it('新 appId 解析出银联皮肤档案：skin/themeColor/appId 回填', () => {
    const profile = resolveAppProfile('8a9481c79c05c8bd019f6f42956924a0')
    expect(profile).not.toBeNull()
    expect(profile?.appId).toBe('8a9481c79c05c8bd019f6f42956924a0')
    expect(profile?.label).toBe('银杏助填版本 23')
    expect(profile?.skin).toBe('chinaumsSheetV23')
    expect(profile?.ui?.themeColor).toBe('#ff4a19')
    expect(profile?.ui?.agreements).toBeUndefined()
  })

  it('新 appId 首尾空白仍可解析（trim 不回归）', () => {
    expect(resolveAppProfile('  8a9481c79c05c8bd019f6f42956924a0  ')?.skin).toBe('chinaumsSheetV23')
  })

  it('旧 zidingyi 占位 appId 不再命中银联皮肤', () => {
    expect(resolveAppProfile('zidingyi')).toBeNull()
  })

  it('东方大地 appId 不绑定自定义皮肤，继续使用老样式', () => {
    expect(resolveAppProfile('8a9481c79c05c8bd019f6a0a6c002457')).toBeNull()
  })

  it('安行天下 appId 不绑定 V23 或其他自定义皮肤，继续使用老样式', () => {
    expect(resolveAppProfile('8a9481c79c05c8bd019f8e3061ce25ee')).toBeNull()
  })

  it('恒大 appId 不绑定 V23 或其他自定义皮肤，继续使用老样式', () => {
    expect(resolveAppProfile('8a9481c69c05c8c1019ffa21d9722a4b')).toBeNull()
  })

  it('demo-brand-001 仍解析为示例品牌且无 skin（默认皮肤不回归）', () => {
    const profile = resolveAppProfile('demo-brand-001')
    expect(profile?.label).toBe('示例品牌')
    expect(profile?.skin).toBeUndefined()
  })
})

describe('海客 inline profile 分流', () => {
  it('只在精确海客 appId 与 inline layout 同时存在时命中 haikeInline', () => {
    const inline = resolveAppProfile(HAIKE_APP_ID, { layout: 'inline' })
    expect(inline).toMatchObject({
      appId: HAIKE_APP_ID,
      label: '海客内嵌授权',
      skin: 'haikeInline',
    })

    expect(resolveAppProfile(HAIKE_APP_ID)?.skin).toBeUndefined()
    expect(resolveAppProfile(HAIKE_APP_ID, { layout: 'modal' })?.skin).toBeUndefined()
    expect(resolveAppProfile(` ${HAIKE_APP_ID} `, { layout: 'INLINE' })?.skin).toBeUndefined()
  })

  it('不改变 zidingyi 与普通 appId 的既有 profile', () => {
    expect(resolveAppProfile(ZIDINGYI_APP_ID, { layout: 'inline' })?.skin).toBe('chinaumsSheetV23')
    expect(resolveAppProfile('demo-brand-001', { layout: 'inline' })?.skin).toBeUndefined()
    expect(resolveAppProfile('unknown-app', { layout: 'inline' })).toBeNull()
  })
})
