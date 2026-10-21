import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('getAssistanceMobileAuthEsmSdkUrl', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_SFT_PUBLIC_BASE_PATH', '/sign-pay-pro-temp/')
    vi.stubEnv('VITE_SFT_PUBLIC_BASE_URL', 'https://ginkgo.chinaums.com/sign-pay-pro-temp/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('pins the test-page ESM action to version 0.2.3', async () => {
    const { getAssistanceMobileAuthEsmSdkUrl } = await import('./esmSdkLoader')

    expect(getAssistanceMobileAuthEsmSdkUrl()).toBe(
      '/sign-pay-pro-temp/assist/0.2.3/assistance-mobile-auth/assistance-mobile-auth.0.2.3.js',
    )
  })
})
