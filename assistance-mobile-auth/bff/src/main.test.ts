import { describe, expect, it } from 'vitest'

import {
  createVerificationFallbackRedirectUrl,
  getStaticContentTypeOverride,
  shouldRedirectToVerificationFallback,
  shouldServeStaticAppFallback,
} from './main'

describe('shouldServeStaticAppFallback', () => {
  it('serves the app shell only for supported application routes, not root or missing static assets', () => {
    expect(shouldServeStaticAppFallback('/sign-pay-pro/', '/sign-pay-pro')).toBe(false)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/verification', '/sign-pay-pro')).toBe(true)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/assistance-mobile-auth/verification', '/sign-pay-pro')).toBe(false)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/auth', '/sign-pay-pro')).toBe(true)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/test-page', '/sign-pay-pro')).toBe(true)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/test-page-hk', '/sign-pay-pro')).toBe(true)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/test-callback', '/sign-pay-pro')).toBe(true)

    expect(shouldServeStaticAppFallback('/sign-pay-pro/assets/missing.js', '/sign-pay-pro')).toBe(false)
    expect(
      shouldServeStaticAppFallback(
        '/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.umd.cjs',
        '/sign-pay-pro',
      ),
    ).toBe(false)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/assistance-mobile-auth/assistance-mobile-auth.js', '/sign-pay-pro')).toBe(false)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/index.html', '/sign-pay-pro')).toBe(false)
    expect(shouldServeStaticAppFallback('/sign-pay-pro/biz-debug.html', '/sign-pay-pro')).toBe(false)
  })

  it('supports the staging temp static base without changing route semantics', () => {
    expect(shouldServeStaticAppFallback('/sign-pay-pro-temp/', '/sign-pay-pro-temp')).toBe(false)
    expect(shouldServeStaticAppFallback('/sign-pay-pro-temp/verification', '/sign-pay-pro-temp')).toBe(true)
    expect(shouldServeStaticAppFallback('/sign-pay-pro-temp/test-page', '/sign-pay-pro-temp')).toBe(true)
    expect(shouldServeStaticAppFallback('/sign-pay-pro-temp/test-page-hk', '/sign-pay-pro-temp')).toBe(true)
    expect(shouldServeStaticAppFallback('/sign-pay-pro-temp/assets/missing.js', '/sign-pay-pro-temp')).toBe(false)
    expect(
      shouldServeStaticAppFallback(
        '/sign-pay-pro-temp/assistance-mobile-auth/assistance-mobile-auth.umd.cjs',
        '/sign-pay-pro-temp',
      ),
    ).toBe(false)
  })

  it('serves browser-loaded cjs bundles with a JavaScript MIME type', () => {
    expect(getStaticContentTypeOverride('/dist/assistance-mobile-auth/assistance-mobile-auth.umd.cjs')).toBe('text/javascript; charset=utf-8')
    expect(getStaticContentTypeOverride('/dist/assist/0.2.0/verification')).toBe('text/html; charset=utf-8')
    expect(getStaticContentTypeOverride('/dist/assets/index.js')).toBeUndefined()
  })
})

describe('verification fallback redirects', () => {
  it('redirects root, nested verification, and unknown page routes to the canonical verification page', () => {
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/', '/sign-pay-pro')).toBe(true)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/index.html', '/sign-pay-pro')).toBe(true)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/assistance-mobile-auth/verification', '/sign-pay-pro')).toBe(true)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/missing-page', '/sign-pay-pro')).toBe(true)
  })

  it('does not redirect supported app routes or missing static assets', () => {
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/verification', '/sign-pay-pro')).toBe(false)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/auth', '/sign-pay-pro')).toBe(false)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/test-page', '/sign-pay-pro')).toBe(false)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/test-page-hk', '/sign-pay-pro')).toBe(false)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/test-callback', '/sign-pay-pro')).toBe(false)
    expect(shouldRedirectToVerificationFallback('/sign-pay-pro/assistance-mobile-auth/not-exist.js', '/sign-pay-pro')).toBe(false)
  })

  it('preserves the original query string when building the redirect target', () => {
    expect(createVerificationFallbackRedirectUrl('/sign-pay-pro/?scene=native-number&foo=bar', '/sign-pay-pro')).toBe(
      '/sign-pay-pro/verification?scene=native-number&foo=bar',
    )
    expect(createVerificationFallbackRedirectUrl('/sign-pay-pro/missing-page?x=1%202&x=3', '/sign-pay-pro')).toBe(
      '/sign-pay-pro/verification?x=1%202&x=3',
    )
    expect(createVerificationFallbackRedirectUrl('/sign-pay-pro/assistance-mobile-auth/verification?mode=probe', '/sign-pay-pro')).toBe(
      '/sign-pay-pro/verification?mode=probe',
    )
    expect(createVerificationFallbackRedirectUrl('/sign-pay-pro/index.html?foo=bar', '/sign-pay-pro')).toBe(
      '/sign-pay-pro/verification?foo=bar',
    )
  })

  it('preserves query strings when redirecting staging temp routes', () => {
    expect(createVerificationFallbackRedirectUrl('/sign-pay-pro-temp/?scene=native-number', '/sign-pay-pro-temp')).toBe(
      '/sign-pay-pro-temp/verification?scene=native-number',
    )
    expect(
      createVerificationFallbackRedirectUrl(
        '/sign-pay-pro-temp/assistance-mobile-auth/verification?mode=probe',
        '/sign-pay-pro-temp',
      ),
    ).toBe('/sign-pay-pro-temp/verification?mode=probe')
  })
})
