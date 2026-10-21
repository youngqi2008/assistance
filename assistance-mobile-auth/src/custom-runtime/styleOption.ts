import { createMobileAuthStyleOption } from '../sdk/styleOption'
import type { MobileAuthSdkAgreementEntry, MobileAuthSdkAgreeStyle, MobileAuthSdkCheckboxStyle, MobileAuthSdkStyleOption } from '../sdk/types'

export function createCustomStyleOption(input: {
  customer?: MobileAuthSdkStyleOption
  agreeArr: MobileAuthSdkAgreementEntry[]
  childArr: MobileAuthSdkAgreementEntry[]
}): MobileAuthSdkStyleOption {
  const { agreeStyle: customerAgree, topImageStyle: _top, bottomImageStyle: _bottom, ...controls } = input.customer ?? {}
  const agreeStyle: MobileAuthSdkAgreeStyle = {}
  for (const key of ['width', 'fontFamily', 'fontSize', 'textAlign', 'fontColor', 'hrefColor'] as const) {
    if (customerAgree?.[key] !== undefined) agreeStyle[key] = customerAgree[key]
  }
  if (customerAgree?.checkboxStyle) {
    const checkbox: MobileAuthSdkCheckboxStyle = {}
    for (const key of ['width', 'height', 'checkedColor', 'borderColor', 'checkBgImg', 'checkedBgImg'] as const) {
      if (customerAgree.checkboxStyle[key] !== undefined) checkbox[key] = customerAgree.checkboxStyle[key]
    }
    agreeStyle.checkboxStyle = checkbox
  }
  agreeStyle.agreeArr = input.agreeArr
  agreeStyle.childArr = input.childArr
  // Omit CMText/chain semantics: the genuine SDK retains its operator agreement.
  return createMobileAuthStyleOption({
    ...controls,
    submitBtnStyle: { ...controls.submitBtnStyle, name: controls.submitBtnStyle?.name ?? '同意并授权' },
    agreeStyle,
  })
}
