import { describe, expect, it, vi } from 'vitest'

import {
  MAX_CUSTOM_AGREEMENTS,
  hasAssistanceUiConfig,
  mergeAssistanceUiConfigs,
  normalizeAssistanceUiConfig,
  warnAssistanceUiConfigToConsole,
} from './uiConfig'

describe('normalizeAssistanceUiConfig', () => {
  it('keeps valid theme, text, image, and agreement config', () => {
    const result = normalizeAssistanceUiConfig({
      themeColor: '#1677ff',
      texts: {
        headerTitle: { text: '核验身份信息', fontSize: '17px', color: '#111827', bold: true },
        idTitle: { text: '输入证件后四位', fontSize: '18px', color: '#111827', bold: true },
        phoneTopNotice: { text: '请确认手机号', fontSize: '1rem', color: '#333', bold: false },
        footerNote: { text: '客户授权说明', fontSize: '12px', color: '#9aa0a6' },
      },
      images: {
        top: 'https://merchant.example/top.png',
        bottom: { url: 'https://merchant.example/bottom.png', alt: '底部图', height: 120, fit: 'cover' },
      },
      agreements: [
        { title: '《客户隐私政策》', url: 'https://merchant.example/privacy' },
        { title: '《客户用户协议》', url: 'https://merchant.example/terms' },
      ],
    })

    expect(result).toEqual({
      themeColor: '#1677ff',
      texts: {
        headerTitle: { text: '核验身份信息', fontSize: '17px', color: '#111827', bold: true },
        idTitle: { text: '输入证件后四位', fontSize: '18px', color: '#111827', bold: true },
        phoneTopNotice: { text: '请确认手机号', fontSize: '1rem', color: '#333', bold: false },
        footerNote: { text: '客户授权说明', fontSize: '12px', color: '#9aa0a6' },
      },
      images: {
        top: { url: 'https://merchant.example/top.png' },
        bottom: { url: 'https://merchant.example/bottom.png', alt: '底部图', height: '120px', fit: 'cover' },
      },
      agreements: [
        { title: '《客户隐私政策》', url: 'https://merchant.example/privacy' },
        { title: '《客户用户协议》', url: 'https://merchant.example/terms' },
      ],
    })
    expect(hasAssistanceUiConfig(result)).toBe(true)
  })

  it('drops invalid fields, keeps valid siblings, and reports warnings', () => {
    const warn = vi.fn()

    const result = normalizeAssistanceUiConfig({
      themeColor: 'javascript:red',
      texts: {
        idTitle: { text: '  ', fontSize: 'calc(10px)', color: 'red', bold: 'yes' },
        phoneTopNotice: { text: '保留这段', color: '#123456', bold: true },
      },
      images: {
        top: 'ftp://merchant.example/top.png',
        bottom: { url: 'https://merchant.example/bottom.png', height: -1, fit: 'stretch' },
      },
      agreements: [
        { title: '', url: 'https://merchant.example/empty-title' },
        { title: '《非法 URL》', url: 'javascript:alert(1)' },
        { title: '《合法协议》', url: 'https://merchant.example/ok' },
      ],
    }, { warn })

    expect(result).toEqual({
      texts: {
        phoneTopNotice: { text: '保留这段', color: '#123456', bold: true },
      },
      images: {
        bottom: { url: 'https://merchant.example/bottom.png' },
      },
      agreements: [
        { title: '《合法协议》', url: 'https://merchant.example/ok' },
      ],
    })
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ path: 'themeColor' }))
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ path: 'texts.idTitle.text' }))
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ path: 'images.top.url' }))
    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ path: 'agreements[1].url' }))
  })

  it.each([
    [0.5, '0.5px'],
    [10000, '10000px'],
    ['0.5px', '0.5px'],
    ['10000px', '10000px'],
  ])('keeps positive finite image height %p', (height, expected) => {
    const result = normalizeAssistanceUiConfig({
      images: {
        top: { url: 'https://merchant.example/top.png', height },
      },
    })

    expect(result.images?.top?.height).toBe(expected)
  })

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    '0px',
    '-1px',
    '1rem',
    'Infinitypx',
    'NaNpx',
    '1.px',
  ])('drops invalid image height %p', (height) => {
    const warn = vi.fn()
    const result = normalizeAssistanceUiConfig({
      images: {
        top: { url: 'https://merchant.example/top.png', height },
      },
    }, { warn })

    expect(result.images?.top).toEqual({ url: 'https://merchant.example/top.png' })
    expect(warn).toHaveBeenCalledWith({
      path: 'images.top.height',
      reason: 'Expected a positive px height.',
    })
  })

  it('limits custom agreements to the first 50 valid entries', () => {
    const warn = vi.fn()
    const agreements = Array.from({ length: MAX_CUSTOM_AGREEMENTS + 3 }, (_, index) => ({
      title: `《协议 ${index + 1}》`,
      url: `https://merchant.example/agreement-${index + 1}`,
    }))

    const result = normalizeAssistanceUiConfig({ agreements }, { warn })

    expect(result.agreements).toHaveLength(MAX_CUSTOM_AGREEMENTS)
    expect(result.agreements?.[0]?.title).toBe('《协议 1》')
    expect(result.agreements?.at(-1)?.title).toBe('《协议 50》')
    expect(warn).toHaveBeenCalledWith({
      path: 'agreements',
      reason: 'Only the first 50 valid agreements are used.',
    })
  })

  it('returns an empty object for non-object input', () => {
    const warn = vi.fn()

    expect(normalizeAssistanceUiConfig(null, { warn })).toEqual({})
    expect(normalizeAssistanceUiConfig('bad', { warn })).toEqual({})
    expect(hasAssistanceUiConfig({})).toBe(false)
    expect(warn).toHaveBeenCalledWith({
      path: 'ui',
      reason: 'Expected an object.',
    })
  })

  it('prints normalized warning messages to console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    warnAssistanceUiConfigToConsole({ path: 'texts.idTitle.fontSize', reason: 'Invalid font size.' })

    expect(warnSpy).toHaveBeenCalledWith(
      '[AssistanceMobileAuth] Ignored invalid ui config at texts.idTitle.fontSize: Invalid font size.',
    )

    warnSpy.mockRestore()
  })
})

describe('mergeAssistanceUiConfigs', () => {
  it('override wins per field, base fills the gaps', () => {
    const merged = mergeAssistanceUiConfigs(
      {
        themeColor: '#111111',
        texts: { headerTitle: { text: 'base-title' }, footerNote: { text: 'base-note' } },
        agreements: [{ title: 'base-agreement', url: 'https://example.com/base' }],
      },
      {
        themeColor: '#222222',
        texts: { headerTitle: { text: 'override-title' } },
      },
    )

    expect(merged.themeColor).toBe('#222222')
    expect(merged.texts?.headerTitle?.text).toBe('override-title')
    expect(merged.texts?.footerNote?.text).toBe('base-note')
    expect(merged.agreements).toEqual([{ title: 'base-agreement', url: 'https://example.com/base' }])
  })

  it('merges images shallowly: base and override keys both survive, override wins on shared keys', () => {
    const merged = mergeAssistanceUiConfigs(
      { images: { top: { url: 'https://example.com/base-top.png' } } },
      { images: { bottom: { url: 'https://example.com/override-bottom.png' } } },
    )
    expect(merged.images).toEqual({
      top: { url: 'https://example.com/base-top.png' },
      bottom: { url: 'https://example.com/override-bottom.png' },
    })

    const overridden = mergeAssistanceUiConfigs(
      { images: { top: { url: 'https://example.com/base-top.png' } } },
      { images: { top: { url: 'https://example.com/override-top.png' } } },
    )
    expect(overridden.images).toEqual({
      top: { url: 'https://example.com/override-top.png' },
    })
  })

  it('override agreements replace base agreements entirely', () => {
    const merged = mergeAssistanceUiConfigs(
      { agreements: [{ title: 'base', url: 'https://example.com/a' }] },
      { agreements: [{ title: 'override', url: 'https://example.com/b' }] },
    )
    expect(merged.agreements).toEqual([{ title: 'override', url: 'https://example.com/b' }])
  })

  it('returns empty object when both are empty', () => {
    expect(mergeAssistanceUiConfigs({}, {})).toEqual({})
  })
})
