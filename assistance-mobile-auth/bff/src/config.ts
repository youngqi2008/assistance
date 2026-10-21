export interface MobileAssistantBffConfig {
  port: number
  apiPrefix: string
  customerAppId: string
  customerAppKey: string
  mobileAuthAppId: string
  appId: string
  appKey: string
  privateKey: string
  platformPublicKey: string
  checkUrl: string
  queryUrl: string
  userNo: string
  requestId: string
  keyA: string
  staticRoot: string
  staticBase: string
}

const DEFAULT_PORT = 12588
const DEFAULT_API_PREFIX = '/sign-pay-pro/api'
const DEFAULT_USER_NO = '08'
const DEFAULT_REQUEST_ID = '00139cdb314f45b0a4843a3a5fbd1a18078f120260508093855666'
const DEFAULT_KEY_A = '12345685825822222222222222'
const DEFAULT_STATIC_ROOT = 'dist'
const DEFAULT_STATIC_BASE = '/sign-pay-pro'
const DEFAULT_PLATFORM_PUBLIC_KEY =
  '0414bb7e9c3914bb65b85079b1dc6e1ca2a0ee04dd9bb55b2f8d31704a6dec0cca695739e128f9c931330e1c0f493be4d56244236434c9d344c4716ba64a4470ba'
const DEFAULT_CHECK_URL =
  'https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/check'
const DEFAULT_QUERY_URL =
  'https://test-api-open.chinaums.com/v1/datacenter/smartverification/encrypted/assistant/info/query'

function readString(key: string, fallback = '') {
  return process.env[key]?.trim() || fallback
}

function readPort() {
  const raw = process.env.BFF_PORT?.trim()
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_PORT

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PORT
}

export function readMobileAssistantBffConfig(): MobileAssistantBffConfig {
  const appId = readString('CHINAUMS_ASSISTANT_APP_ID')
  const appKey = readString('CHINAUMS_ASSISTANT_APP_KEY')

  return {
    port: readPort(),
    apiPrefix: readString('BFF_API_PREFIX', DEFAULT_API_PREFIX),
    customerAppId: readString('SFT_CUSTOMER_APP_ID', appId),
    customerAppKey: readString('SFT_CUSTOMER_APP_KEY', appKey),
    mobileAuthAppId: readString('MOBILE_AUTH_APP_ID', '300013215094'),
    appId,
    appKey,
    privateKey: readString('CHINAUMS_ASSISTANT_PRIVATE_KEY'),
    platformPublicKey: readString('CHINAUMS_ASSISTANT_PLATFORM_PUBLIC_KEY', DEFAULT_PLATFORM_PUBLIC_KEY),
    checkUrl: readString('CHINAUMS_ASSISTANT_CHECK_URL', DEFAULT_CHECK_URL),
    queryUrl: readString('CHINAUMS_ASSISTANT_QUERY_URL', DEFAULT_QUERY_URL),
    userNo: readString('CHINAUMS_ASSISTANT_USER_NO', DEFAULT_USER_NO),
    requestId: readString('CHINAUMS_ASSISTANT_REQUEST_ID', DEFAULT_REQUEST_ID),
    keyA: readString('CHINAUMS_ASSISTANT_KEY_A', DEFAULT_KEY_A),
    staticRoot: readString('BFF_STATIC_ROOT', DEFAULT_STATIC_ROOT),
    staticBase: readString('BFF_STATIC_BASE', DEFAULT_STATIC_BASE),
  }
}

export function validateMobileAssistantConfig(config: MobileAssistantBffConfig): string[] {
  const missing: string[] = []

  if (!config.appId) {
    missing.push('CHINAUMS_ASSISTANT_APP_ID')
  }

  if (!config.appKey) {
    missing.push('CHINAUMS_ASSISTANT_APP_KEY')
  }

  if (!config.privateKey) {
    missing.push('CHINAUMS_ASSISTANT_PRIVATE_KEY')
  }

  if (!config.platformPublicKey) {
    missing.push('CHINAUMS_ASSISTANT_PLATFORM_PUBLIC_KEY')
  }

  return missing
}
