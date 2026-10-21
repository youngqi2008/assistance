import { describe, expect, it } from 'vitest'

import {
  assertMobileOfficialJssdkMetadataReady,
  mobileOfficialJssdkResource,
  resolveRuntimeMobileAuthEnv,
  selectMobileOfficialJssdkResource,
  type MobileOfficialJssdkResource,
} from './mobile-jssdk.meta'

describe('mobile official JSSDK resource metadata', () => {
  it('records exact official JS/CSS provenance and local wrapper paths', () => {
    expect(mobileOfficialJssdkResource).toMatchObject({
      version: '1.0.6',
      jsUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js',
      cssUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/css/new-control-style.css',
      localJsPath: 'src/wrapper/vendor/jssdk-1.0.6.min.js',
      localCssPath: 'src/wrapper/vendor/new-control-style.css',
      jsSha256: 'caf9cd6ef6efe96fcc91111ac7d0bf7d314d0bc657a80c4a1db168afcac18486',
      cssSha256: '35bc356791dc1b7c68bdb282baf31db7eac1edeef4853609f6869cb7286aeb1e',
      retrievedAt: '2026-05-07',
      updatePolicy: 'replace only after source URL/hash/license review',
    })
  })

  it('records approval evidence before committing official resource bytes', () => {
    expect(mobileOfficialJssdkResource.license).toBe(
      'official-customer-documentation-no-redistribution-license-text-found',
    )
    expect(mobileOfficialJssdkResource.redistributionStatus).toBe('approved')
    expect(mobileOfficialJssdkResource.approvalSource).toBe(
      'Project owner approved official CSS use on 2026-05-07',
    )
    expect(mobileOfficialJssdkResource.approvalDate).toBe('2026-05-07')
  })

  it('always selects the official CDN 1.0.6 resource for legacy environment values', () => {
    for (const env of [undefined, 'prod', 'test', 'staging']) {
      expect(selectMobileOfficialJssdkResource(env)).toBe(mobileOfficialJssdkResource)
    }
  })

  describe('resolveRuntimeMobileAuthEnv', () => {
    it('lets ?mobileAuthEnv=prod URL param override a test build', () => {
      expect(resolveRuntimeMobileAuthEnv('?mobileAuthEnv=prod', 'test')).toBe('prod')
    })

    it('lets ?mobileAuthEnv=test URL param override a prod build', () => {
      expect(resolveRuntimeMobileAuthEnv('?mobileAuthEnv=test', 'prod')).toBe('test')
    })

    it('is case-insensitive on the param value', () => {
      expect(resolveRuntimeMobileAuthEnv('?mobileAuthEnv=PROD', 'test')).toBe('prod')
    })

    it('ignores unrecognized param values and falls back to build env', () => {
      expect(resolveRuntimeMobileAuthEnv('?mobileAuthEnv=garbage', 'test')).toBe('test')
      expect(resolveRuntimeMobileAuthEnv('?mobileAuthEnv=garbage', 'prod')).toBe('prod')
    })

    it('falls back to build env when no param present', () => {
      expect(resolveRuntimeMobileAuthEnv('', 'test')).toBe('test')
      expect(resolveRuntimeMobileAuthEnv('', undefined)).toBe('prod')
      expect(resolveRuntimeMobileAuthEnv('?foo=bar', 'test')).toBe('test')
    })
  })

  it('documents the H5-vs-wrapper CSS ownership boundary from D-19', () => {
    expect(mobileOfficialJssdkResource.h5CssStrategy).toBe('env-dynamic-remote-css')
    expect(mobileOfficialJssdkResource.wrapperCssStrategy).toBe('caller-required-local-asset')
  })

  it('fails closed when required provenance or CSS strategy fields are blank', () => {
    expect(() => assertMobileOfficialJssdkMetadataReady(mobileOfficialJssdkResource)).not.toThrow()

    // localJsPath / jsSha256 are no longer required: JS is consumed live from
    // the remote CDN via <script src=jsUrl> in src/wrapper/index.ts.
    const requiredFields: Array<keyof MobileOfficialJssdkResource> = [
      'version',
      'jsUrl',
      'cssUrl',
      'localCssPath',
      'cssSha256',
      'h5CssStrategy',
      'wrapperCssStrategy',
    ]

    for (const field of requiredFields) {
      expect(() =>
        assertMobileOfficialJssdkMetadataReady({
          ...mobileOfficialJssdkResource,
          [field]: '',
        }),
      ).toThrow(field)
    }

    expect(() =>
      assertMobileOfficialJssdkMetadataReady({
        ...mobileOfficialJssdkResource,
        redistributionStatus: 'pending-approval',
      }),
    ).not.toThrow()
  })
})
