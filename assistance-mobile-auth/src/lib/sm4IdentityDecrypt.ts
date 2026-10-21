import { sm4 } from 'sm-crypto'

export const SFT_IDENTITY_SM4_KEY = 'fda3882b14df6abb4f9142999d57cacf'

export interface EncryptedIdentityFields {
  encryptedName?: string
  encryptedMobile?: string
  encryptedIdCard?: string
  idLast4?: string
}

export interface IdentityDisplayFields {
  displayName: string
  maskedMobile: string
  maskedIdCard: string
}

export interface IdentityDecryptOptions {
  sm4Key?: string
}

export type DecryptedIdentityResult =
  | { kind: 'ready'; identity: IdentityDisplayFields }
  | { kind: 'failed'; message: string }

function normalizeSm4Key(value: string | undefined) {
  if (value === undefined) {
    return SFT_IDENTITY_SM4_KEY
  }

  const key = value.trim()
  if (!/^[0-9a-f]{32}$/i.test(key)) {
    throw new Error('invalid sm4 key')
  }

  return key
}

function decryptField(cipher: string | undefined, sm4Key: string) {
  const normalized = cipher?.trim()
  if (!normalized) {
    throw new Error('missing encrypted identity field')
  }

  const decrypted = sm4.decrypt(normalized, sm4Key).trim()
  if (!decrypted) {
    throw new Error('empty decrypted identity field')
  }

  return decrypted
}

// 注意：返回的是「完整」明文身份信息（不脱敏），用于身份信息助填。
// IdentityDisplayFields 的字段名仍为 maskedMobile / maskedIdCard（历史命名，
// 改名涉及前后端十多个文件，后续统一清理），但其内容现已是完整值。

function toFullMobile(value: string) {
  return /^\d{11}$/.test(value) ? value : ''
}

function normalizeIdLast4(value: string | undefined) {
  const normalized = value?.trim().toUpperCase() ?? ''
  return /^[0-9A-Z]{4}$/.test(normalized) ? normalized : ''
}

function toFullIdCard(value: string, idLast4?: string) {
  const last4 = normalizeIdLast4(idLast4)

  // 后端下发的身份证已抹去末 4 位（14 位），需拼接用户回填的 idLast4 还原为完整 18 位。
  if (/^\d{14}$/.test(value)) {
    return last4 ? `${value}${last4}` : value
  }

  // 后端直接下发完整 18 位时原样返回。
  if (/^[0-9A-Z]{18}$/.test(value)) {
    return value
  }

  return ''
}

export function decryptIdentityForDisplay(
  input: EncryptedIdentityFields,
  options: IdentityDecryptOptions = {},
): DecryptedIdentityResult {
  try {
    const sm4Key = normalizeSm4Key(options.sm4Key)
    const displayName = decryptField(input.encryptedName, sm4Key)
    const maskedMobile = toFullMobile(decryptField(input.encryptedMobile, sm4Key))
    const maskedIdCard = toFullIdCard(decryptField(input.encryptedIdCard, sm4Key), input.idLast4)

    if (!displayName || !maskedMobile || !maskedIdCard) {
      return { kind: 'failed', message: '身份信息解密失败' }
    }

    return {
      kind: 'ready',
      identity: {
        displayName,
        maskedMobile,
        maskedIdCard,
      },
    }
  } catch {
    return { kind: 'failed', message: '身份信息解密失败' }
  }
}
