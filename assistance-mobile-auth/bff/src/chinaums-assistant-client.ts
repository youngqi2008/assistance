import { createHash, createHmac, randomUUID } from 'node:crypto'

import type { MobileAssistantBffConfig } from './config.js'
import { sm2DecryptLikeJavaDemo, sm2EncryptLikeJavaDemo } from './java-demo-sm2.js'
import type { ChinaumsAssistantOpenApiResult } from './mobile-assistant.types.js'

type AssistantAction = 'check' | 'query'

function createTimestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

function sha256Hex(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function createOpenBodySig(input: {
  appId: string
  appKey: string
  body: string
  timestamp?: string
  nonce?: string
}) {
  const timestamp = input.timestamp ?? createTimestamp()
  const nonce = input.nonce ?? randomUUID().replaceAll('-', '')
  const bodyDigest = sha256Hex(input.body)
  const signingText = `${input.appId}${timestamp}${nonce}${bodyDigest}`
  const signature = createHmac('sha256', input.appKey).update(signingText, 'utf8').digest('base64')

  return `OPEN-BODY-SIG AppId="${input.appId}", Timestamp="${timestamp}", Nonce="${nonce}", Signature="${signature}"`
}

function sm2EncryptToBase64(plainText: string, publicKey: string) {
  return sm2EncryptLikeJavaDemo(plainText, publicKey)
}

function sm2DecryptFromBase64(cipherText: string, privateKey: string) {
  return sm2DecryptLikeJavaDemo(cipherText, privateKey)
}

function buildPlainPayload(
  action: AssistantAction,
  config: MobileAssistantBffConfig,
  input: {
    token: string
    idLast4?: string
    encryptPublicKey?: string
  },
) {
  const payload: Record<string, string> = {
    requestId: config.requestId,
    userNo: config.userNo,
    token: input.token,
  }

  if (action === 'check') {
    payload.servidL4 = input.idLast4 ?? ''
    payload.keyA = input.encryptPublicKey ?? ''
  }

  return payload
}

function getActionUrl(action: AssistantAction, config: MobileAssistantBffConfig) {
  return action === 'check' ? config.checkUrl : config.queryUrl
}

function parseJsonObject<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function runChinaumsAssistantRequest(
  action: AssistantAction,
  config: MobileAssistantBffConfig,
  input: {
    token: string
    idLast4?: string
    encryptPublicKey?: string
  },
): Promise<ChinaumsAssistantOpenApiResult> {
  const trace = process.env.BFF_VERIFY_TRACE === '1'
  const plainPayload = buildPlainPayload(action, config, input)
  if (trace) {
    console.log(`[verify-trace] chinaums action=${action} url=${getActionUrl(action, config)}`)
    console.log(`[verify-trace] chinaums plainPayload=${JSON.stringify(plainPayload)}`)
  }
  const encryptedData = sm2EncryptToBase64(JSON.stringify(plainPayload), config.platformPublicKey)
  const requestBody = JSON.stringify({ data: encryptedData })
  const response = await fetch(getActionUrl(action, config), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: createOpenBodySig({
        appId: config.appId,
        appKey: config.appKey,
        body: requestBody,
      }),
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: requestBody,
  })
  const httpBody = await response.text()
  const responseJson = parseJsonObject<{ data?: unknown }>(httpBody)
  const encryptedResponseData = typeof responseJson?.data === 'string' ? responseJson.data : ''
  const decryptedData = encryptedResponseData ? sm2DecryptFromBase64(encryptedResponseData, config.privateKey) : ''
  if (trace) {
    console.log(`[verify-trace] chinaums httpStatus=${response.status} httpBody=${httpBody}`)
    console.log(`[verify-trace] chinaums decryptedData=${decryptedData}`)
  }

  return {
    httpStatus: response.status,
    httpBody,
    decryptedData,
  }
}

export const chinaumsAssistantProtocolForTest = {
  createOpenBodySig,
  createTimestamp,
  sm2EncryptToBase64,
  sm2DecryptFromBase64,
}
