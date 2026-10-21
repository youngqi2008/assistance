import type { AgreementDoc, AgreementDocKey } from '../agreements/agreementContent'
import type { MobileAuthSdkShowAuthPageData, MobileAuthSdkStyleOption } from '../sdk/types'
import type { AssistanceIframeOptions, AssistanceVerificationRequest } from '../wrapper/verificationBridge'

export type CustomPage = (
  | { html: string; url?: never }
  | { url: string; html?: never }
) & { css?: string; js?: string; baseUrl?: string }

export type NormalizedCustomPage = (
  | { kind: 'html'; html: string }
  | { kind: 'url'; url: string }
) & { css?: string; js?: string; baseUrl?: string }

export type CustomPageState = {
  phase: 'initializing' | 'ready' | 'submitting' | 'error' | 'completed'
  idLast4: string
  inputError: string | null
  message: string | null
  agreementReaderOpen: boolean
}

export type CustomPageHooks = {
  ready?: Promise<void>
  onStateChange?(state: CustomPageState): void
  dispose?(): void
}

export interface CustomPageApi {
  register(hooks: CustomPageHooks): void
  setIdLast4(value: string): void
  setCallerAgreementChecked(index: number, checked: boolean): void
  close(): void
}

export type CustomSessionIdentity = { sessionId: string; parentOrigin: string }

export type CustomAuthorizationConfig = CustomSessionIdentity & {
  mode: 'authorization'
  page: NormalizedCustomPage
  appId: string
  request: AssistanceVerificationRequest
  authParams?: MobileAuthSdkShowAuthPageData
  styleOption?: MobileAuthSdkStyleOption
  agreements: Array<{ name: string; link: string }>
  iframeOptions: AssistanceIframeOptions
  trustedBusinessBaseUrl: string
  deadline: number
  beforeLoginNotificationEnabled: boolean
  stateChangeEnabled: boolean
}

export type CustomAgreementConfig = CustomSessionIdentity & {
  mode: 'agreement'
  docKey: AgreementDocKey | 'entry'
  docs: Partial<Record<AgreementDocKey, AgreementDoc>>
  entries: Array<{ name: string; link: string; docKey?: AgreementDocKey }>
  css: string
  styleUrls: string[]
  rootAttributes: Record<string, string>
}

export type CustomBootConfig = CustomAuthorizationConfig | CustomAgreementConfig
export type CustomBootPayload = { runtimeSource: string; config: CustomBootConfig }

export interface CustomRuntimeHandle {
  dispose(): void
}

// Local lifecycle context; AbortSignal never crosses the BOOT message boundary.
export type CustomRuntimeContext = { runtimeSource: string; signal: AbortSignal }
