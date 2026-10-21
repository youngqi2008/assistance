import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common'

import { MobileAssistantService } from './mobile-assistant.service.js'
import type { FetchIdentityRequestBody, VerifyIdentityRequestBody } from './mobile-assistant.types.js'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

@Controller('mobile-assistant')
export class MobileAssistantController {
  constructor(private readonly mobileAssistantService: MobileAssistantService) {}

  @Post('verify')
  @HttpCode(200)
  async verifyIdentity(@Body() body: VerifyIdentityRequestBody) {
    if (process.env.BFF_VERIFY_TRACE === '1') {
      console.log('[verify-trace] controller body:', JSON.stringify(body))
    }
    const token = readTrimmedString(body.token)
    const idLast4 = readTrimmedString(body.idLast4).toUpperCase()
    const encryptPublicKey = readTrimmedString(body.encryptPublicKey)

    if (!token) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 token。',
        action: 'retry-fetch',
      })
    }

    if (!idLast4) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少身份证后四位。',
        action: 'retry-fetch',
      })
    }

    return this.mobileAssistantService.verifyIdentity({ token, idLast4, encryptPublicKey })
  }

  @Post('identity')
  @HttpCode(200)
  async fetchIdentity(@Body() body: FetchIdentityRequestBody) {
    const token = readTrimmedString(body.token)

    if (!token) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 token。',
        action: 'retry-fetch',
      })
    }

    return this.mobileAssistantService.fetchIdentity({ token })
  }
}
