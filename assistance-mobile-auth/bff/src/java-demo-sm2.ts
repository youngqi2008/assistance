import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { BigInteger } = require('jsbn') as { BigInteger: typeof import('jsbn').BigInteger }
const sm3 = require('sm-crypto/src/sm2/sm3') as { sm3(input: number[]): number[] }
const sm2Utils = require('sm-crypto/src/sm2/utils') as {
  getGlobalCurve(): {
    decodePointHex(hex: string): EcPoint
  }
  generateKeyPairHex(): {
    privateKey: string
    publicKey: string
  }
}

interface EcPoint {
  multiply(k: import('jsbn').BigInteger): EcPoint
  getX(): {
    toBigInteger(): import('jsbn').BigInteger
  }
  getY(): {
    toBigInteger(): import('jsbn').BigInteger
  }
}

const DIGEST_LENGTH = 32
const C1_BYTE_LENGTH = 65

function toUnsignedByte(value: number) {
  return value & 0xff
}

function hexToBytes(hex: string) {
  const normalized = hex.length % 2 === 0 ? hex : `0${hex}`
  const bytes: number[] = []

  for (let index = 0; index < normalized.length; index += 2) {
    bytes.push(Number.parseInt(normalized.slice(index, index + 2), 16))
  }

  return bytes
}

function bytesToHex(bytes: number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function bigIntegerToJavaBytes(value: import('jsbn').BigInteger) {
  return value.toByteArray().map(toUnsignedByte)
}

function utf8ToBytes(value: string) {
  return Array.from(Buffer.from(value, 'utf8'))
}

function bytesToUtf8(bytes: number[]) {
  return Buffer.from(bytes).toString('utf8')
}

function sm3Hash(...parts: number[][]) {
  return sm3.sm3(parts.flat()).map(toUnsignedByte)
}

function kdf(z: number[], keyLength: number) {
  let counter = 1
  const output: number[] = []
  const rounds = Math.ceil(keyLength / DIGEST_LENGTH)

  for (let round = 1; round < rounds; round += 1) {
    output.push(...sm3Hash(z, intToBytes(counter)))
    counter += 1
  }

  const last = sm3Hash(z, intToBytes(counter))
  output.push(...last.slice(0, keyLength % DIGEST_LENGTH === 0 ? DIGEST_LENGTH : keyLength % DIGEST_LENGTH))

  return output
}

function intToBytes(value: number) {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]
}

function allZero(bytes: number[]) {
  return bytes.every((byte) => byte === 0)
}

function decodeCipherText(cipherText: string) {
  return Array.from(Buffer.from(cipherText, 'base64'))
}

function encodeCipherText(bytes: number[]) {
  return Buffer.from(bytes).toString('base64')
}

export function sm2EncryptLikeJavaDemo(plainText: string, publicKey: string) {
  const publicPoint = sm2Utils.getGlobalCurve().decodePointHex(publicKey)
  const input = utf8ToBytes(plainText)

  let c1: number[] = []
  let sharedPoint: EcPoint
  let mask: number[] = []

  do {
    const keypair = sm2Utils.generateKeyPairHex()
    const random = new BigInteger(keypair.privateKey, 16)
    c1 = hexToBytes(keypair.publicKey)
    sharedPoint = publicPoint.multiply(random)
    mask = kdf(hexToBytes(`04${pointCoordinateHex(sharedPoint, 'x')}${pointCoordinateHex(sharedPoint, 'y')}`), input.length)
  } while (allZero(mask))

  const c2 = input.map((byte, index) => byte ^ mask[index])
  const c3 = sm3Hash(
    bigIntegerToJavaBytes(sharedPoint.getX().toBigInteger()),
    input,
    bigIntegerToJavaBytes(sharedPoint.getY().toBigInteger()),
  )

  return encodeCipherText([...c1, ...c2, ...c3])
}

export function sm2DecryptLikeJavaDemo(cipherText: string, privateKey: string) {
  const encrypted = decodeCipherText(cipherText)
  const c1 = encrypted.slice(0, C1_BYTE_LENGTH)
  const c2 = encrypted.slice(C1_BYTE_LENGTH, encrypted.length - DIGEST_LENGTH)
  const c3 = encrypted.slice(encrypted.length - DIGEST_LENGTH)
  const c1Point = sm2Utils.getGlobalCurve().decodePointHex(bytesToHex(c1))
  const privateKeyValue = new BigInteger(privateKey, 16)
  const sharedPoint = c1Point.multiply(privateKeyValue)
  const mask = kdf(hexToBytes(bytesToHex(c1PointBytes(sharedPoint))), c2.length)

  if (allZero(mask)) {
    return ''
  }

  const plain = c2.map((byte, index) => byte ^ mask[index])
  const checkC3 = sm3Hash(
    bigIntegerToJavaBytes(sharedPoint.getX().toBigInteger()),
    plain,
    bigIntegerToJavaBytes(sharedPoint.getY().toBigInteger()),
  )

  return bytesToHex(checkC3) === bytesToHex(c3) ? bytesToUtf8(plain) : ''
}

function pointCoordinateHex(point: EcPoint, axis: 'x' | 'y') {
  const value = axis === 'x' ? point.getX().toBigInteger() : point.getY().toBigInteger()

  return value.toString(16).padStart(64, '0')
}

function c1PointBytes(point: EcPoint) {
  return hexToBytes(`04${pointCoordinateHex(point, 'x')}${pointCoordinateHex(point, 'y')}`)
}
