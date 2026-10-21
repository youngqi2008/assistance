import { describe, expect, it } from 'vitest'

import { sdkControlIds, sdkControlSlotMap } from './slots'

describe('sdkControlSlotMap', () => {
  it('maps required H5 SDK slots to exact official ydrz control IDs', () => {
    expect(sdkControlSlotMap).toEqual({
      phone: 'ydrzPhoneControl',
      tips: 'ydrzTipsControl',
      state: 'ydrzStateControl',
      'sms-input': 'ydrzYZMControl',
      'sms-button': 'ydrzYZMBtnControl',
      submit: 'ydrzSubmitControl',
      agreement: 'ydrzAgreementControl',
    })
  })

  it('contains every required ydrz control ID exactly once', () => {
    const expectedIds = [
      'ydrzPhoneControl',
      'ydrzTipsControl',
      'ydrzStateControl',
      'ydrzYZMControl',
      'ydrzYZMBtnControl',
      'ydrzSubmitControl',
      'ydrzAgreementControl',
    ]

    expect(sdkControlIds).toEqual(expectedIds)
    expect(new Set(sdkControlIds).size).toBe(expectedIds.length)
    expect(Object.values(sdkControlSlotMap)).toEqual(expectedIds)
  })

  it('keeps non-local SMS IDs as SDK-only seams instead of visible H5 SMS controls', () => {
    expect(sdkControlSlotMap['sms-input']).toBe('ydrzYZMControl')
    expect(sdkControlSlotMap['sms-button']).toBe('ydrzYZMBtnControl')
  })

  it('documents optional authType 4 and custom controls as out of scope for visible H5 slots', () => {
    const optionalDocIds = [
      'ydrzTypeControl',
      'ydrzNameControl',
      'ydrzIntegralControl',
      'ydrzOrderControl',
      'ydrzGoodsControl',
      'ydrzCustomControls',
    ]

    expect(sdkControlIds).not.toEqual(expect.arrayContaining(optionalDocIds))
  })
})
