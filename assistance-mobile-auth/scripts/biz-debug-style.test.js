import { describe, it, expect } from 'vitest'
import {
  STYLE_GROUPS,
  DROPPED_IN_POPUP,
  validateStyleOption,
} from './biz-debug-style.js'

describe('STYLE_GROUPS schema', () => {
  it('涵盖 13 个合法分组；仅 agreeStyle 在弹窗模式被丢弃（顶/底图改走 postMessage 不再丢弃）', () => {
    expect(Object.keys(STYLE_GROUPS)).toHaveLength(13)
    expect(DROPPED_IN_POPUP).toEqual(['agreeStyle'])
  })
})

describe('validateStyleOption', () => {
  it('非法 JSON → error', () => {
    const r = validateStyleOption('{ not json')
    expect(r.ok).toBe(false)
    expect(r.issues[0].level).toBe('error')
    expect(r.issues[0].message).toMatch(/JSON/)
  })

  it('根非对象 → error', () => {
    const r = validateStyleOption('[]')
    expect(r.ok).toBe(false)
    expect(r.issues[0].level).toBe('error')
  })

  it('未知分组 → warn 且列出合法分组', () => {
    const r = validateStyleOption('{"submitBtnstyle":{}}')
    const warn = r.issues.find((i) => i.level === 'warn')
    expect(warn.path).toBe('submitBtnstyle')
    expect(warn.message).toMatch(/submitBtnStyle/)
  })

  it('未知字段 → warn', () => {
    const r = validateStyleOption('{"submitBtnStyle":{"colour":"#000"}}')
    const warn = r.issues.find((i) => i.path === 'submitBtnStyle.colour')
    expect(warn.level).toBe('warn')
  })

  it('单位字段写裸数字 → error 提示缺单位', () => {
    const r = validateStyleOption('{"submitBtnStyle":{"fontSize":16}}')
    const e = r.issues.find((i) => i.path === 'submitBtnStyle.fontSize')
    expect(e.level).toBe('error')
    expect(e.message).toMatch(/单位/)
    expect(r.ok).toBe(false)
  })

  it('非字符串非单位字段 → error 提示应为字符串', () => {
    const r = validateStyleOption('{"submitBtnStyle":{"bgColor":123}}')
    const e = r.issues.find((i) => i.path === 'submitBtnStyle.bgColor')
    expect(e.level).toBe('error')
    expect(e.message).toMatch(/字符串/)
  })

  it('仅 agreeStyle → drop 级提示；topImageStyle 现按 image 分组正常校验（不再 drop）', () => {
    const r = validateStyleOption('{"agreeStyle":{},"topImageStyle":{"src":"x"}}')
    const drops = r.issues.filter((i) => i.level === 'drop').map((i) => i.path)
    expect(drops).toEqual(['agreeStyle'])
    // topImageStyle 合法（src 为字符串）→ 无任何 issue
    expect(r.issues.some((i) => i.path.startsWith('topImageStyle'))).toBe(false)
  })

  it('topImageStyle.src 写裸数字 → image 分组类型校验报错', () => {
    const r = validateStyleOption('{"topImageStyle":{"src":123}}')
    const e = r.issues.find((i) => i.path === 'topImageStyle.src')
    expect(e.level).toBe('error')
    expect(r.ok).toBe(false)
  })

  it('合法对象 → ok 且无 error', () => {
    const r = validateStyleOption('{"submitBtnStyle":{"bgColor":"#0a84ff","fontSize":"16px"}}')
    expect(r.ok).toBe(true)
    expect(r.issues.some((i) => i.level === 'error')).toBe(false)
  })
})

import {
  BASE_DEFAULTS,
  computeEffectiveStyle,
} from './biz-debug-style.js'

describe('BASE_DEFAULTS verification sheet baseline', () => {
  it('mirrors the 260630 submit and phone defaults from src/sdk/styleOption.ts', () => {
    expect(BASE_DEFAULTS.submitBtnStyle).toEqual(
      expect.objectContaining({
        name: '确认',
        height: '48px',
        borderRadius: '10px',
        fontSize: '16px',
      }),
    )
    expect(BASE_DEFAULTS.submitBtnLoadingStyle).toEqual(
      expect.objectContaining({
        height: '48px',
      }),
    )
    expect(BASE_DEFAULTS.phoneStyle).toEqual(
      expect.objectContaining({
        fontColor: '#8A8F98',
        fontSize: '14px',
        textAlign: 'left',
        width: 'auto',
      }),
    )
  })

  it('keeps effective style overrides shallow while inheriting the new submit baseline', () => {
    const { effective } = computeEffectiveStyle({
      submitBtnStyle: { name: '业务确认' },
    })

    expect(effective.submitBtnStyle).toEqual(
      expect.objectContaining({
        name: '业务确认',
        height: '48px',
        borderRadius: '10px',
      }),
    )
  })
})

describe('computeEffectiveStyle', () => {
  it('客户字段覆盖在我方默认之上', () => {
    const { effective } = computeEffectiveStyle({ submitBtnStyle: { bgColor: '#0a84ff' } })
    expect(effective.submitBtnStyle.bgColor).toBe('#0a84ff')
    // 未覆盖字段保留我方默认
    expect(effective.submitBtnStyle.name).toBe(BASE_DEFAULTS.submitBtnStyle.name)
  })

  it('仅 agreeStyle 计入 dropped；topImageStyle 不再被丢弃（走 postMessage 渲染）', () => {
    const { effective, dropped } = computeEffectiveStyle({
      submitBtnStyle: { bgColor: '#000' },
      topImageStyle: { src: 'x' },
      agreeStyle: { fontColor: '#111' },
    })
    expect(dropped).toEqual(['agreeStyle'])
    // 顶/底图不属于 SDK initControl styleOption（由授权页 React 渲染），故不在 effective 中
    expect(effective.topImageStyle).toBeUndefined()
  })

  it('effective.agreeStyle 标注为我方默认注入', () => {
    const { effective } = computeEffectiveStyle({})
    expect(String(effective.agreeStyle)).toMatch(/我方默认/)
  })

  it('未覆盖分组整体回落我方默认', () => {
    const { effective } = computeEffectiveStyle({})
    expect(effective.phoneStyle).toEqual(BASE_DEFAULTS.phoneStyle)
  })
})
