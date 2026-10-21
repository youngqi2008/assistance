import { Injectable, ServiceUnavailableException } from '@nestjs/common'

import { runChinaumsAssistantRequest } from './chinaums-assistant-client.js'
import { readMobileAssistantBffConfig, validateMobileAssistantConfig } from './config.js'
import type { ChinaumsAssistantOpenApiResult, VendorBusinessData, VendorEnvelope } from './mobile-assistant.types.js'
import type { BusinessDemoCheckResult, BusinessDemoQueryResult } from './business-demo.types.js'

function parseJsonObject<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeCheckResult(result: ChinaumsAssistantOpenApiResult): BusinessDemoCheckResult {
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

function normalizeQueryResult(result: ChinaumsAssistantOpenApiResult): BusinessDemoQueryResult {
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

  if (data?.respCode === '00' && data.detailRespCode === '0000' && data.name && data.mobile && data.idCard) {
    return {
      kind: 'identity-encrypted',
      message: data.respMsg || '身份信息已返回',
      identity: {
        encryptedName: data.name,
        encryptedMobile: data.mobile,
        encryptedIdCard: data.idCard,
      },
    }
  }

  if (data?.respCode === '00' && data.detailRespCode && data.detailRespCode !== '0000') {
    return {
      kind: 'identity-pending',
      message: data.detailRespMsg || data.respMsg || '身份信息正在处理中',
      action: 'refresh-result',
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
export class BusinessDemoService {
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

  async checkIdentity(input: { token: string; idLast4: string; keyA: string }): Promise<BusinessDemoCheckResult> {
    this.assertConfigured()
    const result = await runChinaumsAssistantRequest('check', this.config, {
      token: input.token,
      idLast4: input.idLast4,
      encryptPublicKey: input.keyA,
    })

    return normalizeCheckResult(result)
  }

  async queryIdentity(input: { token: string }): Promise<BusinessDemoQueryResult> {
    this.assertConfigured()
    const result = await runChinaumsAssistantRequest('query', this.config, {
      token: input.token,
    })

    return normalizeQueryResult(result)
  }
}
