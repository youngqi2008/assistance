import { createAssistanceMobileAuthSdk as createWrapper, type AssistanceMobileAuthSdkOptions,
  type AssistanceMobileAuthSdkInstance } from '../../wrapper'
import { THIRD_PARTY_SHARING_AGREEMENT_NAME } from '../../agreements/agreementAggregation'
import { createDuodianPage } from './page.ts'

export type DuodianHealthSdkOptions = Omit<AssistanceMobileAuthSdkOptions, 'appId' | 'customPage'> & { appId?: string }

export function createAssistanceMobileAuthSdk(options: DuodianHealthSdkOptions): AssistanceMobileAuthSdkInstance {
  const closable = options.closable ?? false
  const useCustomKeyboard = options.useCustomKeyboard ?? true
  const agreements = (options.agreements ?? []).filter(({ name }) => name.trim() !== THIRD_PARTY_SHARING_AGREEMENT_NAME)
  return createWrapper({ ...options, appId: options.appId ?? '8a9481c79c05c8bd019f6a0a6c002457',
    closable, useCustomKeyboard, agreements, customPage: createDuodianPage({ closable, useCustomKeyboard, agreements }),
    styleOption: {
      ...options.styleOption,
      phoneStyle: { width: '100%', height: 'auto', fontSize: '14px', fontColor: '#8d8d92', ...options.styleOption?.phoneStyle },
      submitBtnStyle: { ...options.styleOption?.submitBtnStyle, name: '授权登录', width: '100%', height: '100%',
        bgColor: '#19be00', fontColor: '#FFFFFF', fontSize: '22px', borderRadius: '16px', textAlign: 'center' },
      submitBtnDisabledStyle: { ...options.styleOption?.submitBtnDisabledStyle, width: '100%', height: '100%',
        bgColor: '#e2e6e2', fontColor: '#8a8f8a', borderRadius: '16px' },
      submitBtnLoadingStyle: { ...options.styleOption?.submitBtnLoadingStyle, width: '100%', height: '100%',
        bgColor: '#8bbe81', fontColor: '#FFFFFF', borderRadius: '16px' },
      agreeStyle: { fontSize: '12px', fontColor: '#8d8d92', hrefColor: '#77777e', ...options.styleOption?.agreeStyle },
    },
  })
}

export { getAssistanceMobileAuthOfficialCssAsset, injectAssistanceMobileAuthOfficialCss } from '../../wrapper'
export type { AssistanceMobileAuthSdkOptions, AssistanceMobileAuthSdkInstance, AssistanceMobileAuthPrecheckOptions,
  AssistanceMobileAuthOfficialCssAsset, AssistanceMobileAuthOfficialCssInjectionOptions,
  AssistanceAuthStateChangeEvent, AssistanceVerificationErrorNoticePayload, AssistanceVerificationErrorPayload,
  AssistanceVerificationPhoneReadyPayload, AssistanceVerificationRequest, AssistanceVerificationSuccessPayload } from '../../wrapper'
