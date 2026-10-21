export interface CreateSdkSessionRequestBody {
  appId?: unknown
  appKey?: unknown
  requestId?: unknown
  scene?: unknown
  mobileAuthEnv?: unknown
  redirectUrl?: unknown
}

export interface ResolveSdkSessionRequestBody {
  launchToken?: unknown
}

export interface CompleteSdkSessionRequestBody {
  launchToken?: unknown
  message?: unknown
  identity?: unknown
}

export interface QuerySdkSessionResultRequestBody {
  appId?: unknown
  appKey?: unknown
  authResultId?: unknown
  authCode?: unknown
  authToken?: unknown
}

export interface MobileAuthLaunchParams {
  appId: string
  sign: string
  traceId: string
  timestamp: string
  authType: string
  scope: string
}

export interface SdkSessionIdentity {
  displayName: string
  maskedMobile: string
  maskedIdCard: string
}

export interface CreateSdkSessionResult {
  kind: 'created'
  launchToken: string
  expiresInSeconds: number
  message: string
}

export interface ResolveSdkSessionResult {
  kind: 'ready'
  params: MobileAuthLaunchParams
  expiresInSeconds: number
  message: string
  mock: boolean
  redirectMode: boolean
}

export interface CompleteSdkSessionResult {
  kind: 'completed'
  authResultId: string
  authCode: string
  authToken: string
  redirectUrl?: string
  expiresInSeconds: number
  message: string
}

export interface QuerySdkSessionResult {
  kind: 'identity-ready'
  message: string
  identity: SdkSessionIdentity
  mock: boolean
}
