import { describe, expect, it } from 'vitest'

import { decryptIdentityForDisplay, SFT_IDENTITY_SM4_KEY } from './sm4IdentityDecrypt'

const encryptedIdentity = {
  encryptedName: '81e14c9984617e662117ca545d7adf04',
  encryptedMobile: '2148c59fb4a7085a0e1c1224ef025381',
  encryptedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
}

describe('decryptIdentityForDisplay', () => {
  it('decrypts the staging SM4 identity fixture into complete identity values', () => {
    expect(SFT_IDENTITY_SM4_KEY).toBe('fda3882b14df6abb4f9142999d57cacf')

    const result = decryptIdentityForDisplay({ ...encryptedIdentity, idLast4: '1718' })

    expect(result).toEqual({
      kind: 'ready',
      identity: {
        displayName: '徐三',
        maskedMobile: '15971413742',
        maskedIdCard: '530125199203241718',
      },
    })
    expect(JSON.stringify(result)).not.toContain(encryptedIdentity.encryptedName)
    expect(JSON.stringify(result)).not.toContain(encryptedIdentity.encryptedMobile)
    expect(JSON.stringify(result)).not.toContain(encryptedIdentity.encryptedIdCard)
  })

  it('does not return raw ciphertext when decryption fails', () => {
    const result = decryptIdentityForDisplay({
      encryptedName: 'not-sm4-ciphertext',
      encryptedMobile: encryptedIdentity.encryptedMobile,
      encryptedIdCard: encryptedIdentity.encryptedIdCard,
      idLast4: '1718',
    })

    expect(result.kind).toBe('failed')
    expect(JSON.stringify(result)).not.toContain('not-sm4-ciphertext')
  })

  it('decrypts identity with an explicit SM4 key', () => {
    const result = decryptIdentityForDisplay({
      ...encryptedIdentity,
      idLast4: '1718',
    }, { sm4Key: SFT_IDENTITY_SM4_KEY })

    expect(result).toEqual({
      kind: 'ready',
      identity: {
        displayName: '徐三',
        maskedMobile: '15971413742',
        maskedIdCard: '530125199203241718',
      },
    })
  })

  it('still uses the default SM4 key when the option is omitted', () => {
    const result = decryptIdentityForDisplay({ ...encryptedIdentity, idLast4: '1718' }, {})

    expect(result).toEqual({
      kind: 'ready',
      identity: {
        displayName: '徐三',
        maskedMobile: '15971413742',
        maskedIdCard: '530125199203241718',
      },
    })
  })

  it('fails when an explicit SM4 key is blank or whitespace', () => {
    const blankResult = decryptIdentityForDisplay({
      ...encryptedIdentity,
      idLast4: '1718',
    }, { sm4Key: '' })
    const whitespaceResult = decryptIdentityForDisplay({
      ...encryptedIdentity,
      idLast4: '1718',
    }, { sm4Key: '   ' })

    expect(blankResult).toEqual({ kind: 'failed', message: '身份信息解密失败' })
    expect(whitespaceResult).toEqual({ kind: 'failed', message: '身份信息解密失败' })
    expect(JSON.stringify(blankResult)).not.toContain(encryptedIdentity.encryptedName)
    expect(JSON.stringify(whitespaceResult)).not.toContain(encryptedIdentity.encryptedName)
  })

  it('fails without leaking ciphertext when an explicit SM4 key is wrong', () => {
    const result = decryptIdentityForDisplay({
      ...encryptedIdentity,
      idLast4: '1718',
    }, { sm4Key: '00000000000000000000000000000000' })

    expect(result).toEqual({ kind: 'failed', message: '身份信息解密失败' })
    expect(JSON.stringify(result)).not.toContain(encryptedIdentity.encryptedName)
  })
})
