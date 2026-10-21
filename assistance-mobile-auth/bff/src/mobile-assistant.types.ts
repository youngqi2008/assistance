export interface VerifyIdentityRequestBody {
  token?: unknown
  idLast4?: unknown
  encryptPublicKey?: unknown
}

export interface FetchIdentityRequestBody {
  token?: unknown
}

export type ResultActionKind = 'retry-auth' | 'retry-fetch' | 'refresh-result'

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
      identity: {
        encryptedName: string
        encryptedMobile: string
        encryptedIdCard: string
      }
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

export interface ChinaumsAssistantOpenApiResult {
  httpStatus: number
  httpBody: string
  decryptedData: string
}

export interface VendorEnvelope {
  errCode?: string
  errInfo?: string
}

export interface VendorBusinessData {
  detailRespCode?: string
  detailRespMsg?: string
  respCode?: string
  respMsg?: string
  idCard?: string
  mobile?: string
  name?: string
}
