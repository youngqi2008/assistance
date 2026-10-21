import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure window.YDRZAuthSF is cleaned up between tests
const mockYDRZAuthSF = {
  showAuthPage: vi.fn(),
  initControl: vi.fn(),
  clearControl: vi.fn(),
  getAuthResult: vi.fn(),
  updateSubmitBtnStatus: vi.fn(),
}

const { getMobileAuthSdkConfig } = vi.hoisted(() => ({
  getMobileAuthSdkConfig: vi.fn(),
}))

vi.mock('./config', () => ({
  getMobileAuthSdkConfig,
}))

import { loadMobileAuthSdkResources, resetMobileAuthSdkLoaderForTests } from './resourceLoader'

describe('loadMobileAuthSdkResources', () => {
  beforeEach(() => {
    getMobileAuthSdkConfig.mockReset()
    resetMobileAuthSdkLoaderForTests()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  afterEach(() => {
    resetMobileAuthSdkLoaderForTests()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('returns disabled without injecting resources when sdk is disabled', async () => {
    getMobileAuthSdkConfig.mockReturnValue({
      enabled: false,
      mode: 'mock',
      jsUrl: 'https://cdn.example.com/jssdk.min.js',
      cssUrl: 'https://cdn.example.com/jssdk.css',
      debugEntry: false,
    })

    await expect(loadMobileAuthSdkResources()).resolves.toMatchObject({
      state: 'disabled',
      scriptId: 'mobile-auth-sdk-script',
      styleId: 'mobile-auth-sdk-style',
    })

    expect(document.getElementById('mobile-auth-sdk-script')).toBeNull()
    expect(document.getElementById('mobile-auth-sdk-style')).toBeNull()
  })

  it('injects one script and one stylesheet with stable ids and resolves ready', async () => {
    getMobileAuthSdkConfig.mockReturnValue({
      enabled: true,
      mode: 'live',
      jsUrl: 'https://cdn.example.com/jssdk.min.js',
      cssUrl: 'https://cdn.example.com/jssdk.css',
      debugEntry: false,
    })

    const resultPromise = loadMobileAuthSdkResources()

    const script = document.getElementById('mobile-auth-sdk-script') as HTMLScriptElement | null
    const style = document.getElementById('mobile-auth-sdk-style') as HTMLLinkElement | null

    expect(script).not.toBeNull()
    expect(style).not.toBeNull()
    expect(script?.src).toBe('https://cdn.example.com/jssdk.min.js')
    expect(style?.href).toBe('https://cdn.example.com/jssdk.css')
    expect(document.querySelectorAll('#mobile-auth-sdk-script')).toHaveLength(1)
    expect(document.querySelectorAll('#mobile-auth-sdk-style')).toHaveLength(1)

    // Install YDRZAuthSF so the SPA-HTML-fallback probe passes
    ;(window as unknown as { YDRZAuthSF: typeof mockYDRZAuthSF }).YDRZAuthSF = mockYDRZAuthSF

    script?.dispatchEvent(new Event('load'))
    style?.dispatchEvent(new Event('load'))

    await expect(resultPromise).resolves.toMatchObject({
      state: 'ready',
      scriptId: 'mobile-auth-sdk-script',
      styleId: 'mobile-auth-sdk-style',
    })

    delete (window as unknown as { YDRZAuthSF?: unknown }).YDRZAuthSF
  })

  it('reuses the same in-flight promise and does not append duplicate tags on repeated calls', async () => {
    getMobileAuthSdkConfig.mockReturnValue({
      enabled: true,
      mode: 'live',
      jsUrl: 'https://cdn.example.com/jssdk.min.js',
      cssUrl: 'https://cdn.example.com/jssdk.css',
      debugEntry: false,
    })

    const firstPromise = loadMobileAuthSdkResources()
    const secondPromise = loadMobileAuthSdkResources()

    expect(secondPromise).toBe(firstPromise)
    expect(document.querySelectorAll('#mobile-auth-sdk-script')).toHaveLength(1)
    expect(document.querySelectorAll('#mobile-auth-sdk-style')).toHaveLength(1)

    const script = document.getElementById('mobile-auth-sdk-script')
    const style = document.getElementById('mobile-auth-sdk-style')

    // Install YDRZAuthSF so the SPA-HTML-fallback probe passes
    ;(window as unknown as { YDRZAuthSF: typeof mockYDRZAuthSF }).YDRZAuthSF = mockYDRZAuthSF

    script?.dispatchEvent(new Event('load'))
    style?.dispatchEvent(new Event('load'))

    await expect(firstPromise).resolves.toMatchObject({ state: 'ready' })
    await expect(secondPromise).resolves.toMatchObject({ state: 'ready' })

    delete (window as unknown as { YDRZAuthSF?: unknown }).YDRZAuthSF
  })

  it('returns an error state with diagnostic information when the script fails to load', async () => {
    getMobileAuthSdkConfig.mockReturnValue({
      enabled: true,
      mode: 'live',
      jsUrl: 'https://cdn.example.com/jssdk.min.js',
      cssUrl: '',
      debugEntry: false,
    })

    const resultPromise = loadMobileAuthSdkResources()
    const script = document.getElementById('mobile-auth-sdk-script')

    script?.dispatchEvent(new Event('error'))

    await expect(resultPromise).resolves.toMatchObject({
      state: 'error',
      scriptId: 'mobile-auth-sdk-script',
      styleId: 'mobile-auth-sdk-style',
      error: expect.any(Error),
      reason: 'error',
    })
  })

  it('returns network-timeout reason when script does not load within 12s', async () => {
    vi.useFakeTimers()
    getMobileAuthSdkConfig.mockReturnValue({
      enabled: true,
      mode: 'live',
      jsUrl: 'https://cdn.example.com/jssdk.min.js',
      cssUrl: '',
      debugEntry: false,
      authParams: {} as never,
    })

    const resultPromise = loadMobileAuthSdkResources()
    await vi.advanceTimersByTimeAsync(12_000)
    const result = await resultPromise

    expect(result.state).toBe('error')
    expect(result.reason).toBe('network-timeout')
    expect(result.error).toBeInstanceOf(Error)

    vi.useRealTimers()
  })

  it('returns spa-html-fallback reason when script load fires but YDRZAuthSF is not registered', async () => {
    getMobileAuthSdkConfig.mockReturnValue({
      enabled: true,
      mode: 'live',
      jsUrl: 'https://cdn.example.com/jssdk.min.js',
      cssUrl: '',
      debugEntry: false,
      authParams: {} as never,
    })

    // Ensure YDRZAuthSF is NOT registered
    delete (window as unknown as { YDRZAuthSF?: unknown }).YDRZAuthSF

    const resultPromise = loadMobileAuthSdkResources()
    const script = document.getElementById('mobile-auth-sdk-script')
    script?.dispatchEvent(new Event('load'))

    const result = await resultPromise

    expect(result.state).toBe('error')
    expect(result.reason).toBe('spa-html-fallback')
  })

  it('returns disabled without injecting resources when sdk is enabled but the script url is empty', async () => {
    getMobileAuthSdkConfig.mockReturnValue({
      enabled: true,
      mode: 'live',
      jsUrl: '   ',
      cssUrl: 'https://cdn.example.com/jssdk.css',
      debugEntry: false,
    })

    await expect(loadMobileAuthSdkResources()).resolves.toMatchObject({
      state: 'disabled',
      scriptId: 'mobile-auth-sdk-script',
      styleId: 'mobile-auth-sdk-style',
      reason: 'missing-js-url',
    })

    expect(document.getElementById('mobile-auth-sdk-script')).toBeNull()
    expect(document.getElementById('mobile-auth-sdk-style')).toBeNull()
  })
})
