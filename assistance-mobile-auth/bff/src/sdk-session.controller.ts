import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common'

import { SdkSessionService } from './sdk-session.service.js'
import type {
  CompleteSdkSessionRequestBody,
  CreateSdkSessionRequestBody,
  QuerySdkSessionResultRequestBody,
  ResolveSdkSessionRequestBody,
  SdkSessionIdentity,
} from './sdk-session.types.js'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readIdentity(value: unknown): SdkSessionIdentity | null {
  if (!isRecord(value)) {
    return null
  }

  const displayName = readTrimmedString(value.displayName)
  const maskedMobile = readTrimmedString(value.maskedMobile)
  const maskedIdCard = readTrimmedString(value.maskedIdCard)

  if (!displayName || !maskedMobile || !maskedIdCard) {
    return null
  }

  return {
    displayName,
    maskedMobile,
    maskedIdCard,
  }
}

@Controller('sdk/session')
export class SdkSessionController {
  constructor(private readonly sdkSessionService: SdkSessionService) {}

  @Post('create')
  @HttpCode(200)
  createSession(@Body() body: CreateSdkSessionRequestBody) {
    const appId = readTrimmedString(body.appId)
    const appKey = readTrimmedString(body.appKey)
    const requestId = readTrimmedString(body.requestId)
    const scene = readTrimmedString(body.scene)
    const mobileAuthEnv = readTrimmedString(body.mobileAuthEnv)
    const redirectUrl = readTrimmedString(body.redirectUrl)

    if (!appId || !appKey) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少客户 appId 或 appKey。',
      })
    }

    return this.sdkSessionService.createSession({ appId, appKey, requestId, scene, mobileAuthEnv, redirectUrl })
  }

  @Post('resolve')
  @HttpCode(200)
  resolveSession(@Body() body: ResolveSdkSessionRequestBody) {
    const launchToken = readTrimmedString(body.launchToken)

    if (!launchToken) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 launchToken。',
      })
    }

    return this.sdkSessionService.resolveSession({ launchToken })
  }

  @Post('complete')
  @HttpCode(200)
  completeSession(@Body() body: CompleteSdkSessionRequestBody) {
    const launchToken = readTrimmedString(body.launchToken)
    const message = readTrimmedString(body.message)
    const identity = readIdentity(body.identity)

    if (!launchToken || !identity) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 launchToken 或认证结果。',
      })
    }

    return this.sdkSessionService.completeSession({ launchToken, identity, message })
  }

  @Post('result')
  @HttpCode(200)
  queryResult(@Body() body: QuerySdkSessionResultRequestBody) {
    const appId = readTrimmedString(body.appId)
    const appKey = readTrimmedString(body.appKey)
    const authResultId = readTrimmedString(body.authResultId)
    const authCode = readTrimmedString(body.authCode)
    const authToken = readTrimmedString(body.authToken)

    if (!appId || !appKey || (!authToken && (!authResultId || !authCode))) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少客户凭证或认证结果标识。',
      })
    }

    return this.sdkSessionService.queryResult({ appId, appKey, authResultId, authCode, authToken })
  }
}
