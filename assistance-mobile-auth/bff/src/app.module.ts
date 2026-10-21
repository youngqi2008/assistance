import { Module } from '@nestjs/common'

import { BusinessDemoController } from './business-demo.controller.js'
import { BusinessDemoService } from './business-demo.service.js'
import { MobileAssistantController } from './mobile-assistant.controller.js'
import { MobileAssistantService } from './mobile-assistant.service.js'
import { SdkSessionController } from './sdk-session.controller.js'
import { SdkSessionService } from './sdk-session.service.js'

@Module({
  controllers: [BusinessDemoController, MobileAssistantController, SdkSessionController],
  providers: [BusinessDemoService, MobileAssistantService, SdkSessionService],
})
export class AppModule {}
