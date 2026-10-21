import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadPublicBase() {
  vi.resetModules()
  return import('./publicBase')
}

describe('public base helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to the current prod sign-pay-pro base', async () => {
    vi.stubEnv('VITE_SFT_PUBLIC_BASE_PATH', '')
    vi.stubEnv('VITE_SFT_PUBLIC_BASE_URL', '')

    const mod = await loadPublicBase()

    expect(mod.SFT_PUBLIC_BASE_PATH).toBe('/sign-pay-pro/')
    expect(mod.SFT_PUBLIC_BASE_URL).toBe('https://ginkgo.chinaums.com/sign-pay-pro/')
    expect(mod.createSftPublicPath('api/sdk/session')).toBe('/sign-pay-pro/api/sdk/session')
    expect(mod.createSftPublicUrl('verification')).toBe('https://ginkgo.chinaums.com/sign-pay-pro/verification')
  })

  it('uses sign-pay-pro-temp when staging env is provided', async () => {
    vi.stubEnv('VITE_SFT_PUBLIC_BASE_PATH', '/sign-pay-pro-temp/')
    vi.stubEnv('VITE_SFT_PUBLIC_BASE_URL', 'https://ginkgo.chinaums.com/sign-pay-pro-temp/')

    const mod = await loadPublicBase()

    expect(mod.SFT_PUBLIC_BASE_PATH).toBe('/sign-pay-pro-temp/')
    expect(mod.SFT_PUBLIC_BASE_URL).toBe('https://ginkgo.chinaums.com/sign-pay-pro-temp/')
    expect(mod.createSftPublicPath('/assistance-mobile-auth/assistance-mobile-auth.js')).toBe(
      '/sign-pay-pro-temp/assistance-mobile-auth/assistance-mobile-auth.js',
    )
    expect(mod.createSftPublicUrl('/verification')).toBe(
      'https://ginkgo.chinaums.com/sign-pay-pro-temp/verification',
    )
  })
})
