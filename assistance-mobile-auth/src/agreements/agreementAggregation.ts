import {
  PERSONAL_INFO_COLLECTION_LIST_AGREEMENT,
  SENSITIVE_INFO_RULES_AGREEMENT,
  USER_AUTH_PRIVACY_POLICY_AGREEMENT,
  type AgreementDoc,
  type AgreementDocKey,
  getAgreementDocByKey,
} from './agreementContent'
import {
  TIANTIANYOUBAO_V2_APP_ID,
  resolveAppAgreementProfile,
} from './appAgreementRegistry'
import { buildAgreementDocUrl, buildAgreementEntryUrl } from './agreementUrl'
import type { MobileAuthSdkAgreementEntry } from '../sdk/types'

export const USER_SERVICE_AGREEMENT_ENTRY_NAME = '《用户信息授权协议》'
export const THIRD_PARTY_SHARING_AGREEMENT_NAME = '《第三方共享个人信息清单》'
export type CustomDocUrlResolver = (docKey: AgreementDocKey | 'entry', appId?: string | null) => string

const USER_INFO_AUTHORIZATION_CHILD_DOCS: Array<{ key: AgreementDocKey; doc: AgreementDoc }> = [
  { key: 'user-auth-privacy-policy', doc: USER_AUTH_PRIVACY_POLICY_AGREEMENT },
  { key: 'personal-info-collection-list', doc: PERSONAL_INFO_COLLECTION_LIST_AGREEMENT },
  { key: 'sensitive-info-rules', doc: SENSITIVE_INFO_RULES_AGREEMENT },
]

export function buildUserServiceAgreeArr(
  appId?: string | null,
  docUrlResolver?: CustomDocUrlResolver,
): MobileAuthSdkAgreementEntry[] {
  return [
    {
      name: USER_SERVICE_AGREEMENT_ENTRY_NAME,
      link: docUrlResolver ? docUrlResolver('entry', appId) : buildAgreementEntryUrl(appId),
    },
  ]
}

interface BuildUserServiceChildArrInput {
  docUrlResolver?: CustomDocUrlResolver
  appId?: string | null
  callerAgreements?: MobileAuthSdkAgreementEntry[]
  /** Haike inline's complete SDK list may intentionally include an external
   * caller document with the same title as our built-in third-party list. */
  preserveReservedCallerAgreement?: boolean
}

export function buildUserServiceChildArr(
  input: BuildUserServiceChildArrInput = {},
): MobileAuthSdkAgreementEntry[] {
  const {
    appId,
    callerAgreements = [],
    preserveReservedCallerAgreement = false,
    docUrlResolver,
  } = input
  const profile = resolveAppAgreementProfile(appId)
  const thirdPartyDocKey = profile?.thirdPartySharingDocKey ?? 'third-party-sharing-list'
  const profileDoc = getAgreementDocByKey(thirdPartyDocKey)
  const includesThirdPartySharing = appId?.trim() !== TIANTIANYOUBAO_V2_APP_ID
  const builtInDocs = profileDoc && includesThirdPartySharing
    ? [
        ...USER_INFO_AUTHORIZATION_CHILD_DOCS,
        { key: thirdPartyDocKey, doc: profileDoc },
      ]
    : USER_INFO_AUTHORIZATION_CHILD_DOCS
  const filteredCallerAgreements = preserveReservedCallerAgreement
    ? callerAgreements
    : callerAgreements.filter(
      ({ name }) => name.trim() !== THIRD_PARTY_SHARING_AGREEMENT_NAME,
    )

  return [
    ...builtInDocs.map(({ key, doc }) => ({
      name: doc.title,
      link: docUrlResolver ? docUrlResolver(key, appId) : buildAgreementDocUrl(key, appId),
    })),
    ...filteredCallerAgreements,
  ]
}
