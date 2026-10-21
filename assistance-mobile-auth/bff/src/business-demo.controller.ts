import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common'

import { BusinessDemoService } from './business-demo.service.js'
import type { BusinessDemoCheckRequestBody, BusinessDemoQueryRequestBody } from './business-demo.types.js'

function readTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

@Controller('business-demo')
export class BusinessDemoController {
  constructor(private readonly businessDemoService: BusinessDemoService) {}

  @Post('check')
  @HttpCode(200)
  checkIdentity(@Body() body: BusinessDemoCheckRequestBody | null | undefined) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 token、身份证后四位或 keyA。',
        action: 'retry-fetch',
      })
    }

    const token = readTrimmedString(body.token)
    const idLast4 = readTrimmedString(body.idLast4).toUpperCase()
    const keyA = readTrimmedString(body.keyA)

    if (!token || !idLast4 || !keyA) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 token、身份证后四位或 keyA。',
        action: 'retry-fetch',
      })
    }

    return this.businessDemoService.checkIdentity({ token, idLast4, keyA })
  }

  @Post('query')
  @HttpCode(200)
  queryIdentity(@Body() body: BusinessDemoQueryRequestBody | null | undefined) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 token。',
        action: 'retry-fetch',
      })
    }

    const token = readTrimmedString(body.token)

    if (!token) {
      throw new BadRequestException({
        kind: 'request-failed',
        message: '缺少 token。',
        action: 'retry-fetch',
      })
    }

    return this.businessDemoService.queryIdentity({ token })
  }
}
