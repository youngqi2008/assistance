import { describe, expect, expectTypeOf, it } from 'vitest'

import { createCustomVerificationUrl, normalizeCustomPage } from './normalize'
import type {
  CustomAgreementConfig,
  CustomBootConfig,
  CustomBootPayload,
  CustomPage,
  CustomPageApi,
  CustomRuntimeContext,
  NormalizedCustomPage,
} from './types'

describe('normalizeCustomPage', () => {
  it.each(['authorization', 'agreement'] as const)('emits the fixed loader query for %s', mode => {
    const url = new URL(createCustomVerificationUrl({ loaderUrl: 'https://auth.example/assist/0.3.0/custom-verification.html?old=1#old', mode,
      sessionId: 's1', parentOrigin: 'https://parent.example', ...(mode === 'agreement' ? { docKey: 'entry' as const } : {}) }))
    expect(Object.fromEntries(url.searchParams)).toEqual({ role: mode, sessionId: 's1', parentOrigin: 'https://parent.example', ...(mode === 'agreement' ? { doc: 'entry' } : {}) })
    expect(url.pathname).toBe('/assist/0.3.0/custom-verification.html'); expect(url.hash).toBe('')
  })
  it('resolves explicit URLs against the host page', () => {
    expect(normalizeCustomPage({ url: './page.html' }, 'https://customer.example/auth/')).toEqual({
      kind: 'url',
      url: 'https://customer.example/auth/page.html',
    })
  })

  it('preserves HTML, CSS and JS contents without inferring a URL', () => {
    expect(normalizeCustomPage({ html: 'https://not-a-url.test', css: ' p { color: red; } ', js: '/* JS */' }, 'https://host.test/')).toEqual({
      kind: 'html', html: 'https://not-a-url.test', css: ' p { color: red; } ', js: '/* JS */',
    })
  })

  it('resolves a separate asset base without changing the page URL base', () => {
    expect(normalizeCustomPage({ url: './page.html', baseUrl: '../assets/' }, 'https://customer.example/auth/')).toEqual({
      kind: 'url', url: 'https://customer.example/auth/page.html', baseUrl: 'https://customer.example/assets/',
    })
  })

  it.each([
    null, [], 'page', {}, { html: '', url: 'https://x.test' },
    { html: '<p>Hi</p>', url: 'https://x.test' }, { html: '' }, { html: ' ' },
    { html: 123 }, { url: '' }, { url: ' ' }, { url: 123 },
    { url: 'data:text/html,x' }, { url: 'javascript:alert(1)' }, { url: 'file:///page.html' },
    { html: '<p>Hi</p>', css: 1 }, { html: '<p>Hi</p>', js: null },
    { html: '<p>Hi</p>', baseUrl: 123 }, { html: '<p>Hi</p>', baseUrl: '' },
    { html: '<p>Hi</p>', baseUrl: 'data:text/html,x' },
  ])('rejects invalid page input %#', (input) => {
    expect(() => normalizeCustomPage(input, 'https://host.test/')).toThrow()
  })

  it('keeps empty optional scripts/styles and omits absent optional fields', () => {
    expect(normalizeCustomPage({ html: '<p>Hi</p>', css: '', js: '' }, 'https://host.test/')).toEqual({
      kind: 'html', html: '<p>Hi</p>', css: '', js: '',
    })
    expect(normalizeCustomPage({ html: '<p>Hi</p>' }, 'https://host.test/')).toEqual({ kind: 'html', html: '<p>Hi</p>' })
  })

  it('requires an HTTP(S) host when resolving relative addresses', () => {
    expect(() => normalizeCustomPage({ url: './page.html' }, 'not a URL')).toThrow()
    expect(() => normalizeCustomPage({ url: './page.html' }, 'file:///host/')).toThrow()
  })

  it('exposes exclusive sources and data-only reading/runtime boundaries in types', () => {
    expectTypeOf<{ html: string }>().toMatchTypeOf<CustomPage>()
    expectTypeOf<{ url: string }>().toMatchTypeOf<CustomPage>()
    expectTypeOf<{ html: string; url: string }>().not.toMatchTypeOf<CustomPage>()
    expectTypeOf<NormalizedCustomPage>().extract<{ kind: 'html' }>().toHaveProperty('html')
    expectTypeOf<CustomBootConfig>().extract<{ mode: 'agreement' }>().toEqualTypeOf<CustomAgreementConfig>()
    expectTypeOf<Extract<keyof CustomAgreementConfig, 'appId' | 'authParams' | 'token' | 'keyA'>>().toEqualTypeOf<never>()
    expectTypeOf<keyof CustomPageApi>().toEqualTypeOf<'register' | 'setIdLast4' | 'setCallerAgreementChecked' | 'close'>()
    expectTypeOf<CustomRuntimeContext>().toEqualTypeOf<{ runtimeSource: string; signal: AbortSignal }>()
    expectTypeOf<Extract<keyof CustomBootPayload, 'signal'>>().toEqualTypeOf<never>()
  })
})
