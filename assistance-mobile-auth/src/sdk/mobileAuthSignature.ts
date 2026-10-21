import type { MobileAuthSdkShowAuthPageData } from './types'
import { MOBILE_AUTH_DEFAULT_AUTH_TYPE, MOBILE_AUTH_DEFAULT_SCOPE, normalizeMobileAuthType } from './authPolicy'
export { MOBILE_AUTH_DEFAULT_AUTH_TYPE, MOBILE_AUTH_DEFAULT_SCOPE, normalizeMobileAuthType } from './authPolicy'

export const MOBILE_AUTH_DEFAULT_APP_ID = '300013215094'
export const MOBILE_AUTH_FRONTEND_APP_KEY = '143B232CAA71306A80CB6ED01655B23E'
export const MOBILE_AUTH_DEFAULT_VERSION = '3.0'
const hexAlphabet = '0123456789abcdef'

function leftRotate(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0
}

function toLittleEndianHex(value: number): string {
  let result = ''

  for (let index = 0; index < 4; index += 1) {
    result += hexAlphabet[(value >>> (index * 8 + 4)) & 0x0f]
    result += hexAlphabet[(value >>> (index * 8)) & 0x0f]
  }

  return result
}

export function md5Hex(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const bitLength = BigInt(bytes.length) * 8n
  const paddedLength = bytes.length + 1 + ((56 - ((bytes.length + 1) % 64) + 64) % 64) + 8
  const buffer = new Uint8Array(paddedLength)

  buffer.set(bytes)
  buffer[bytes.length] = 0x80

  for (let index = 0; index < 8; index += 1) {
    buffer[paddedLength - 8 + index] = Number((bitLength >> BigInt(index * 8)) & 0xffn)
  }

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]
  const constants = Array.from({ length: 64 }, (_, index) => {
    return Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0
  })

  for (let offset = 0; offset < buffer.length; offset += 64) {
    const words = new Array<number>(16)

    for (let index = 0; index < 16; index += 1) {
      const wordOffset = offset + index * 4
      words[index] =
        buffer[wordOffset] |
        (buffer[wordOffset + 1] << 8) |
        (buffer[wordOffset + 2] << 16) |
        (buffer[wordOffset + 3] << 24)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let index = 0; index < 64; index += 1) {
      let f: number
      let g: number

      if (index < 16) {
        f = (b & c) | (~b & d)
        g = index
      } else if (index < 32) {
        f = (d & b) | (~d & c)
        g = (5 * index + 1) % 16
      } else if (index < 48) {
        f = b ^ c ^ d
        g = (3 * index + 5) % 16
      } else {
        f = c ^ (b | ~d)
        g = (7 * index) % 16
      }

      const previousD = d
      d = c
      c = b
      b = (b + leftRotate((a + f + constants[index] + words[g]) >>> 0, shifts[index])) >>> 0
      a = previousD
    }

    a0 = (a0 + a) >>> 0
    b0 = (b0 + b) >>> 0
    c0 = (c0 + c) >>> 0
    d0 = (d0 + d) >>> 0
  }

  return `${toLittleEndianHex(a0)}${toLittleEndianHex(b0)}${toLittleEndianHex(c0)}${toLittleEndianHex(d0)}`
}

export function createMobileAuthTimestamp(date = new Date()): string {
  const pad = (value: number, size = 2) => String(value).padStart(size, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad(date.getMilliseconds(), 3),
  ].join('')
}

export function createMobileAuthTraceId(): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replaceAll('-', '')
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`

  return random.replace(/[^a-fA-F0-9]/g, '').slice(0, 32).padEnd(32, '0').toUpperCase()
}

export function createMobileAuthStd2Sign({
  appId,
  appKey,
  traceId,
  timestamp,
  version = MOBILE_AUTH_DEFAULT_VERSION,
}: {
  appId: string
  appKey: string
  traceId: string
  timestamp: string
  version?: string
}): string {
  return md5Hex(`${appId}14${traceId}${timestamp}${traceId}${version}${appKey}`)
}

export function createFrontendMobileAuthParams(input: {
  appId?: string
  appKey?: string
  authType?: string
  scope?: string
  timestamp?: string
  traceId?: string
  version?: string
} = {}): MobileAuthSdkShowAuthPageData {
  const appId = input.appId?.trim() || MOBILE_AUTH_DEFAULT_APP_ID
  const appKey = input.appKey?.trim() || MOBILE_AUTH_FRONTEND_APP_KEY
  const traceId = input.traceId?.trim() || createMobileAuthTraceId()
  const timestamp = input.timestamp?.trim() || createMobileAuthTimestamp()
  const version = input.version?.trim() || MOBILE_AUTH_DEFAULT_VERSION

  return {
    version,
    appId,
    sign: createMobileAuthStd2Sign({
      appId,
      appKey,
      traceId,
      timestamp,
      version,
    }),
    traceId,
    timestamp,
    authType: normalizeMobileAuthType(input.authType),
    scope: input.scope?.trim() || MOBILE_AUTH_DEFAULT_SCOPE,
  }
}
