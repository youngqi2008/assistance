import { describe, expect, it } from 'vitest'

import {
  ANXINGTIANXIA_V2_APP_ID,
  DONGFANGDADI_V2_APP_ID,
  HAIKE_V2_APP_ID,
  HENGDA_V2_APP_ID,
  TIANTIANYOUBAO_V2_APP_ID,
  resolveAppAgreementProfile,
} from './appAgreementRegistry'
import { getAgreementDocByKey } from './agreementContent'

describe('app agreement registry', () => {
  it('resolves both exact Yuanbao appIds to the same agreement profile', () => {
    const profile = resolveAppAgreementProfile('10037e6f9d903f86019ed8cfb6320365')
    expect(profile).toMatchObject({ key: 'yuanbao', thirdPartySharingDocKey: 'third-party-sharing-list' })
    expect(resolveAppAgreementProfile(' 8a9481c79c05c8bd019ed8d49fb81df2 ')).toBe(profile)
    expect(resolveAppAgreementProfile('8a9481c79c05c8bd019ed8d49fb81df2x')).toBeNull()
  })
  it('resolves the Anxingtianxia profile after trimming the exact appId', () => {
    expect(resolveAppAgreementProfile(` ${ANXINGTIANXIA_V2_APP_ID} `)).toEqual({
      key: 'anxingtianxia-v2',
      thirdPartySharingDocKey: 'anxingtianxia-v2-third-party-sharing',
    })
  })

  it('resolves the Hengda profile after trimming the exact appId', () => {
    expect(resolveAppAgreementProfile(` ${HENGDA_V2_APP_ID} `)).toEqual({
      key: 'hengda-v2',
      thirdPartySharingDocKey: 'hengda-v2-third-party-sharing',
    })
  })

  it('resolves the Haike profile after trimming the exact appId', () => {
    expect(resolveAppAgreementProfile(` ${HAIKE_V2_APP_ID} `)).toEqual({
      key: 'haike-v2',
      thirdPartySharingDocKey: 'haike-v2-third-party-sharing',
    })
  })

  it('resolves the Tiantianyoubao profile after trimming the exact appId', () => {
    expect(resolveAppAgreementProfile(` ${TIANTIANYOUBAO_V2_APP_ID} `)).toEqual({
      key: 'tiantianyoubao-v2',
      thirdPartySharingDocKey: 'tiantianyoubao-v2-third-party-sharing',
    })
  })

  it('resolves the Dongfangdadi profile after trimming the exact appId', () => {
    expect(resolveAppAgreementProfile(` ${DONGFANGDADI_V2_APP_ID} `)).toEqual({
      key: 'dongfangdadi-v2',
      thirdPartySharingDocKey: 'dongfangdadi-v2-third-party-sharing',
    })
  })

  it.each([
    undefined,
    null,
    '',
    '   ',
    'unknown-app',
    'toString',
    'constructor',
    '__proto__',
    '8a9481c79c05c8bd019ed8d7ab571df',
    '8A9481C79C05C8BD019ED8D7AB571DF3',
    '8A9481C79C05C8BD019F6F42956924A0',
    123,
    {},
  ])('returns null for an unconfigured or invalid appId: %j', (appId) => {
    expect(resolveAppAgreementProfile(appId)).toBeNull()
  })

  it.each([
    HAIKE_V2_APP_ID,
    TIANTIANYOUBAO_V2_APP_ID,
    DONGFANGDADI_V2_APP_ID,
    ANXINGTIANXIA_V2_APP_ID,
    HENGDA_V2_APP_ID,
  ])('only registers profile document keys that exist for %s', (appId) => {
    const profile = resolveAppAgreementProfile(appId)

    expect(profile).not.toBeNull()
    expect(getAgreementDocByKey(profile!.thirdPartySharingDocKey)).not.toBeNull()
  })
})
