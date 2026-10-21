import { createMobileAssistantClient } from '../../api/mobileAssistantClient'
import {
  createSdkSessionClient,
  type CompleteSdkSessionResult,
  type ResolveSdkSessionResult,
  type SdkSessionIdentity,
} from '../../api/sdkSessionClient'
import { createIdentityFlowService, type IdentityFlowService } from '../../services/identityFlow'

export type { CompleteSdkSessionResult, ResolveSdkSessionResult, SdkSessionIdentity }

export interface CompleteSdkLaunchSessionInput {
  launchToken: string
  message?: string
  identity: SdkSessionIdentity
}

export interface AuthVerificationIntegration {
  createIdentityFlowRunner(): IdentityFlowService
  resolveSdkLaunchSession(launchToken: string): Promise<ResolveSdkSessionResult>
  completeSdkLaunchSession(input: CompleteSdkLaunchSessionInput): Promise<CompleteSdkSessionResult>
}

export const authVerificationIntegration: AuthVerificationIntegration = {
  createIdentityFlowRunner() {
    return createIdentityFlowService(createMobileAssistantClient())
  },
  resolveSdkLaunchSession(launchToken) {
    return createSdkSessionClient().resolveSession({ launchToken })
  },
  completeSdkLaunchSession(input) {
    return createSdkSessionClient().completeSession(input)
  },
}
