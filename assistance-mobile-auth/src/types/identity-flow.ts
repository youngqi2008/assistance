export type DataFlowStatus =
  | 'idle'
  | 'token-ready'
  | 'token-missing'
  | 'verify-loading'
  | 'verify-failed'
  | 'fetch-loading'
  | 'fetch-pending'
  | 'fetch-failed'
  | 'complete'

export type ResultActionKind = 'retry-auth' | 'retry-fetch' | 'refresh-result'

export interface TokenHandoffRequest {
  token: string
}

export interface VerifyIdentityRequest extends TokenHandoffRequest {
  idLast4: string
  encryptPublicKey?: string
}

export interface FetchIdentityRequest extends TokenHandoffRequest {
  idLast4?: string
}

export interface IdentityDisplayReady {
  displayName: string
  maskedMobile: string
  maskedIdCard: string
}

export type VerifyIdentityResult =
  | {
      kind: 'verified'
      message: string
    }
  | {
      kind: 'verify-failed'
      message: string
      action: Extract<ResultActionKind, 'retry-auth' | 'retry-fetch'>
      code?: string
    }
  | {
      kind: 'request-failed'
      message: string
      action: Extract<ResultActionKind, 'retry-fetch'>
    }

export type FetchIdentityResult =
  | {
      kind: 'identity-ready'
      message: string
      identity: IdentityDisplayReady
    }
  | {
      kind: 'identity-pending'
      message: string
      action: Extract<ResultActionKind, 'refresh-result'>
    }
  | {
      kind: 'identity-failed'
      message: string
      action: Extract<ResultActionKind, 'retry-auth' | 'retry-fetch'>
      code?: string
    }
  | {
      kind: 'request-failed'
      message: string
      action: Extract<ResultActionKind, 'retry-fetch'>
    }
