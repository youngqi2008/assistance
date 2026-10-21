export const MOBILE_AUTH_DEFAULT_AUTH_TYPE = '0'
export const MOBILE_AUTH_DEFAULT_SCOPE = '3ElementsAuthAssistFill'
const supportedAuthTypes = new Set(['0', '1', '3', '4'])

export function normalizeMobileAuthType(value?: string): string {
  const normalized = value?.trim() ?? ''
  return supportedAuthTypes.has(normalized) ? normalized : MOBILE_AUTH_DEFAULT_AUTH_TYPE
}

// Shared validation policy; importing this file never imports a signing helper.
export const AUTH_SCOPE_PRESET_MAP = {
  '0': [
    'customerValueScore', 'insuranceFraudScore', 'renewalRenewalForecastData', 'theCountrySpreadData',
    'BAA05', 'BBA02', 'BAB01', 'BAA07', 'BAA06', 'BBA01', 'BBA04', 'BBB01', 'BBA03', 'BBB02', 'BBB03',
    'BCA05', 'BCA02', 'BCA03', 'BCA04', 'BCA10', 'BCA01', 'BCA09', 'BDD07', 'BDB08', 'BDB01', 'BDB02',
    'BDB04', 'BDD09', 'BDD03', 'BDD04', 'BEB01', 'BFA01', 'BDD12', 'BDD02', 'BDD08', 'BCA07',
    '3ElementsAuthAssistFill',
  ],
  '1': ['applyQos', 'updateQos', 'releaseQos', 'typeQueryQos'],
  '3': ['creditTreasure'],
  '4': ['integralPayment'],
} as const satisfies Record<string, readonly string[]>
