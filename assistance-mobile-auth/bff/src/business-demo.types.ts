export interface BusinessDemoCheckRequestBody {
  token?: unknown
  idLast4?: unknown
  keyA?: unknown
}

export interface BusinessDemoQueryRequestBody {
  token?: unknown
}

export type BusinessDemoResultAction = 'retry-auth' | 'retry-fetch' | 'refresh-result'

export type BusinessDemoCheckResult =
  | { kind: 'verified'; message: string }
  | {
      kind: 'verify-failed'
      message: string
      action: Extract<BusinessDemoResultAction, 'retry-auth' | 'retry-fetch'>
      code?: string
    }
  | { kind: 'request-failed'; message: string; action: Extract<BusinessDemoResultAction, 'retry-fetch'> }

export type BusinessDemoQueryResult =
  | {
      kind: 'identity-encrypted'
      message: string
      identity: {
        encryptedName: string
        encryptedMobile: string
        encryptedIdCard: string
      }
    }
  | { kind: 'identity-pending'; message: string; action: Extract<BusinessDemoResultAction, 'refresh-result'> }
  | {
      kind: 'identity-failed'
      message: string
      action: Extract<BusinessDemoResultAction, 'retry-auth' | 'retry-fetch'>
      code?: string
    }
  | { kind: 'request-failed'; message: string; action: Extract<BusinessDemoResultAction, 'retry-fetch'> }
