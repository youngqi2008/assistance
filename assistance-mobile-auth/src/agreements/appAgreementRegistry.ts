import type { AgreementDocKey } from './agreementTypes'
import { YUANBAO_APP_IDS } from '../config/yuanbaoAppIds'
export { YUANBAO_APP_ID } from '../config/yuanbaoAppIds'

export const HAIKE_V2_APP_ID = '8a9481c79c05c8bd019ed8d7ab571df3'
export const TIANTIANYOUBAO_V2_APP_ID = '8a9481c79c05c8bd019f6f42956924a0'
export const DONGFANGDADI_V2_APP_ID = '8a9481c79c05c8bd019f6a0a6c002457'
export const ANXINGTIANXIA_V2_APP_ID = '8a9481c79c05c8bd019f8e3061ce25ee'
export const HENGDA_V2_APP_ID = '8a9481c69c05c8c1019ffa21d9722a4b'

export type AppAgreementProfileKey =
  | 'haike-v2'
  | 'tiantianyoubao-v2'
  | 'dongfangdadi-v2'
  | 'anxingtianxia-v2'
  | 'hengda-v2'
  | 'yuanbao'

export interface AppAgreementProfile {
  readonly key: AppAgreementProfileKey
  readonly thirdPartySharingDocKey: AgreementDocKey
}

const HAIKE_V2_PROFILE = {
  key: 'haike-v2',
  thirdPartySharingDocKey: 'haike-v2-third-party-sharing',
} as const satisfies AppAgreementProfile

const TIANTIANYOUBAO_V2_PROFILE = {
  key: 'tiantianyoubao-v2',
  thirdPartySharingDocKey: 'tiantianyoubao-v2-third-party-sharing',
} as const satisfies AppAgreementProfile

const DONGFANGDADI_V2_PROFILE = {
  key: 'dongfangdadi-v2',
  thirdPartySharingDocKey: 'dongfangdadi-v2-third-party-sharing',
} as const satisfies AppAgreementProfile

const ANXINGTIANXIA_V2_PROFILE = {
  key: 'anxingtianxia-v2',
  thirdPartySharingDocKey: 'anxingtianxia-v2-third-party-sharing',
} as const satisfies AppAgreementProfile

const HENGDA_V2_PROFILE = {
  key: 'hengda-v2',
  thirdPartySharingDocKey: 'hengda-v2-third-party-sharing',
} as const satisfies AppAgreementProfile

const APP_AGREEMENT_PROFILES: Readonly<
  Record<AppAgreementProfileKey, AppAgreementProfile>
> = {
  'haike-v2': HAIKE_V2_PROFILE,
  'tiantianyoubao-v2': TIANTIANYOUBAO_V2_PROFILE,
  'dongfangdadi-v2': DONGFANGDADI_V2_PROFILE,
  'anxingtianxia-v2': ANXINGTIANXIA_V2_PROFILE,
  'hengda-v2': HENGDA_V2_PROFILE,
  // Restore the existing historical fourth document without rewriting its content.
  'yuanbao': { key: 'yuanbao', thirdPartySharingDocKey: 'third-party-sharing-list' },
}

const APP_AGREEMENT_PROFILE_KEYS: Readonly<Record<string, AppAgreementProfileKey>> = {
  [HAIKE_V2_APP_ID]: 'haike-v2',
  [TIANTIANYOUBAO_V2_APP_ID]: 'tiantianyoubao-v2',
  [DONGFANGDADI_V2_APP_ID]: 'dongfangdadi-v2',
  [ANXINGTIANXIA_V2_APP_ID]: 'anxingtianxia-v2',
  [HENGDA_V2_APP_ID]: 'hengda-v2',
  ...Object.fromEntries(YUANBAO_APP_IDS.map((appId) => [appId, 'yuanbao' as const])),
}

export function resolveAppAgreementProfile(appId: unknown): AppAgreementProfile | null {
  if (typeof appId !== 'string') {
    return null
  }

  const normalizedAppId = appId.trim()
  if (!Object.prototype.hasOwnProperty.call(APP_AGREEMENT_PROFILE_KEYS, normalizedAppId)) {
    return null
  }

  const profileKey = APP_AGREEMENT_PROFILE_KEYS[normalizedAppId]
  return profileKey ? APP_AGREEMENT_PROFILES[profileKey] : null
}
