import { describe, expect, it } from 'vitest'
import { createCustomStyleOption } from './styleOption'

describe('custom official control styles', () => {
  it('uses an explicit authorization label when customer styles are omitted', () => {
    const style = createCustomStyleOption({ agreeArr: [], childArr: [] })
    expect(style.submitBtnStyle?.name).toBe('同意并授权')
  })

  it('keeps customer button appearance while filling a missing authorization label', () => {
    const style = createCustomStyleOption({ customer: { submitBtnStyle: { bgColor: '#ff8a00', height: '56px' } }, agreeArr: [], childArr: [] })
    expect(style.submitBtnStyle).toMatchObject({ name: '同意并授权', bgColor: '#ff8a00', height: '56px' })
  })

  it('preserves an explicitly supplied customer authorization label', () => {
    const style = createCustomStyleOption({ customer: { submitBtnStyle: { name: '同意并登录' } }, agreeArr: [], childArr: [] })
    expect(style.submitBtnStyle?.name).toBe('同意并登录')
  })

  it('preserves customer button and protocol colors while supplying genuine aggregated agreements', () => {
    const style = createCustomStyleOption({
      customer: { submitBtnStyle: { bgColor: '#ff8a00', name: '同意并登录' }, phoneStyle: { fontColor: '#176bff' },
        agreeStyle: { hrefColor: '#176bff', fontColor: '#ff8a00', width: '100%', fontFamily: 'Arial', fontSize: '12px', textAlign: 'left',
          agreeArr: [], childArr: [], CMText: '', setChainAgreement: [], hidden: true,
          checkboxStyle: { width: '20px', checkedColor: '#ff8a00', hidden: true } } },
      agreeArr: [{ name: '《用户信息授权协议》', link: 'https://business.example/entry' }],
      childArr: [{ name: '《个人信息授权》', link: 'https://business.example/privacy' }],
    })
    expect(style.submitBtnStyle).toMatchObject({ bgColor: '#ff8a00', name: '同意并登录' })
    expect(style.phoneStyle).toMatchObject({ fontColor: '#176bff' })
    expect(style.agreeStyle).toEqual({ width: '100%', fontFamily: 'Arial', fontSize: '12px', textAlign: 'left', fontColor: '#ff8a00', hrefColor: '#176bff',
      checkboxStyle: { width: '20px', checkedColor: '#ff8a00' },
      agreeArr: [{ name: '《用户信息授权协议》', link: 'https://business.example/entry' }],
      childArr: [{ name: '《个人信息授权》', link: 'https://business.example/privacy' }],
    })
    expect(style.agreeStyle).not.toHaveProperty('CMText')
  })

  it('retains supplied agreement click callbacks rather than caller semantics', () => {
    const customEvent = () => {}
    const style = createCustomStyleOption({ agreeArr: [{ name: '授权协议', customEvent }], childArr: [] })
    expect(style.agreeStyle?.agreeArr?.[0].customEvent).toBe(customEvent)
    expect(style.submitBtnStyle?.height).toBe('48px')
  })
})
