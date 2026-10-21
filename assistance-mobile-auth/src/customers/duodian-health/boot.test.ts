import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createAssistanceMobileAuthSdk as createCustomerSdk } from './index'
import { createAssistanceMobileAuthSdk as createGenericSdk } from '../../wrapper'
import { createAuthParamsProvider } from './suppliedSdk'
import type { MobileAuthSdkShowAuthPageData } from '../../sdk/types'
import type { CustomAuthorizationConfig } from '../../custom-page/types'
import { createAssistanceAuthMessage } from '../../wrapper/verificationBridge'

const signed: MobileAuthSdkShowAuthPageData = { version: 'MOCK_ONLY_VERSION', appId: ' MOCK_ONLY_SIGNED_APP_ID ',
  sign: ' MOCK_ONLY_INVALID_SIGN ', traceId: 'MOCK_ONLY_TRACE', timestamp: 'MOCK_ONLY_TIMESTAMP',
  authType: '0', scope: '3ElementsAuthAssistFill' }

beforeEach(() => { document.body.replaceChildren(); vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.replaceChildren(); document.body.style.overflow = '' })

async function paramsFromRealBoot(authParams: MobileAuthSdkShowAuthPageData, customer = true): Promise<MobileAuthSdkShowAuthPageData> {
  vi.stubGlobal('__DUODIAN_BOTTOM_SHEET__', customer)
  const sdk = customer ? createCustomerSdk({ authParams }) : createGenericSdk({ appId: 'MOCK_ONLY_BUSINESS_APP_ID',
    customPage: { html: '<main>MOCK_ONLY_GENERIC_CUSTOM_PAGE</main>' }, authParams })
  const pending = sdk.open().catch(() => undefined)
  try {
    const frame = document.querySelector<HTMLIFrameElement>('iframe')!
    const url = new URL(frame.src)
    const send = vi.spyOn(frame.contentWindow!, 'postMessage')
    window.dispatchEvent(new MessageEvent('message', { source: frame.contentWindow, origin: url.origin,
      data: createAssistanceAuthMessage('ASSISTANCE_AUTH_READY', url.searchParams.get('sessionId')!),
    }))
    const boot = send.mock.calls.find(([message]) => message.type === 'ASSISTANCE_AUTH_CUSTOM_BOOT')![0]
    return (boot.payload.config as CustomAuthorizationConfig).authParams!
  } finally { sdk.destroy(); await pending }
}

test.each(['MOCK_ONLY_UNSUPPORTED', ' 0 ', 'toString', 'constructor'])('customer open→BOOT preserves invalid signed authType %s for rejection by supplied-only validation', async authType => {
  const original = { ...signed, authType }
  const bootParams = await paramsFromRealBoot(original)
  expect(createAuthParamsProvider().resolve({ overrides: bootParams })).toEqual({ status: 'invalid', source: 'manual', reason: 'invalid-auth-scope' })
  expect(bootParams).toEqual(original)
})

test.each([['0', '3ElementsAuthAssistFill'], ['3', 'creditTreasure']])('customer open→BOOT→provider retains every signed field for valid %s/%s', async (authType, scope) => {
  const original = { ...signed, authType, scope }
  const bootParams = await paramsFromRealBoot(original)
  expect(createAuthParamsProvider().resolve({ overrides: bootParams })).toEqual({ status: 'ready', source: 'manual', data: original })
  expect(bootParams).toEqual(original)
})

test.each(['MOCK_ONLY_UNSUPPORTED', ' 0 '])('generic custom open keeps existing authType normalization for %s', async authType => {
  const bootParams = await paramsFromRealBoot({ ...signed, authType }, false)
  expect(bootParams.authType).toBe('0')
})
