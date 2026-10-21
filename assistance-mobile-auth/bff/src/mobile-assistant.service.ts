import { Injectable, ServiceUnavailableException } from '@nestjs/common'

import { runChinaumsAssistantRequest } from './chinaums-assistant-client.js'
import { readMobileAssistantBffConfig, validateMobileAssistantConfig } from './config.js'
import type {
  ChinaumsAssistantOpenApiResult,
  FetchIdentityResult,
  VendorBusinessData,
  VendorEnvelope,
  VerifyIdentityResult,
} from './mobile-assistant.types.js'

function parseJsonObject<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeVerifyResult(result: ChinaumsAssistantOpenApiResult): VerifyIdentityResult {
  const envelope = parseJsonObject<VendorEnvelope>(result.httpBody)
  const data = parseJsonObject<VendorBusinessData>(result.decryptedData)

  if (envelope?.errCode !== '20000000') {
    return {
      kind: 'verify-failed',
      message: envelope?.errInfo || '身份核验未通过',
      action: 'retry-fetch',
      code: envelope?.errCode,
    }
  }

  if (data?.respCode === '00' && data.detailRespCode === '0000') {
    return {
      kind: 'verified',
      message: data.respMsg || '身份核验通过',
    }
  }

  return {
    kind: 'verify-failed',
    message: data?.detailRespMsg || data?.respMsg || '身份核验未通过',
    action: 'retry-auth',
    code: data?.detailRespCode || data?.respCode,
  }
}

function normalizeIdentityResult(result: ChinaumsAssistantOpenApiResult): FetchIdentityResult {
  const envelope = parseJsonObject<VendorEnvelope>(result.httpBody)
  const data = parseJsonObject<VendorBusinessData>(result.decryptedData)

  if (envelope?.errCode !== '20000000') {
    return {
      kind: 'identity-failed',
      message: envelope?.errInfo || '身份信息暂未返回',
      action: 'retry-fetch',
      code: envelope?.errCode,
    }
  }

  if (data?.respCode === '00' && data.detailRespCode === '0000' && data.mobile && data.idCard) {
    return {
      kind: 'identity-ready',
      message: data.respMsg || '身份信息已返回',
      identity: {
        encryptedName: data.name || '',
        encryptedMobile: data.mobile,
        encryptedIdCard: data.idCard,
      },
    }
  }

  return {
    kind: 'identity-failed',
    message: data?.detailRespMsg || data?.respMsg || '身份信息暂未返回',
    action: 'retry-auth',
    code: data?.detailRespCode || data?.respCode,
  }
}

@Injectable()
export class MobileAssistantService {
  private readonly config = readMobileAssistantBffConfig()

  assertConfigured() {
    const missing = validateMobileAssistantConfig(this.config)

    if (missing.length > 0) {
      throw new ServiceUnavailableException({
        kind: 'request-failed',
        message: `BFF 联调参数未配置：${missing.join(', ')}`,
        action: 'retry-fetch',
      })
    }
  }

  async verifyIdentity(input: { token: string; idLast4: string; encryptPublicKey?: string }): Promise<VerifyIdentityResult> {
    this.assertConfigured()
    if (process.env.BFF_VERIFY_TRACE === '1') {
      console.log('[verify-trace] service input:', JSON.stringify({ ...input, token: input.token?.slice(0, 12) + '...' }))
    }
    const result = await runChinaumsAssistantRequest('check', this.config, input)

    return normalizeVerifyResult(result)
  }

  async fetchIdentity(input: { token: string }): Promise<FetchIdentityResult> {
    this.assertConfigured()
    const result = await runChinaumsAssistantRequest('query', this.config, input)

    return normalizeIdentityResult(result)
  }
}
