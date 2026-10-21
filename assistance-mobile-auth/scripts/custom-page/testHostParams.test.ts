// @vitest-environment node
import { expect, test } from 'vitest'
import { MOBILE_AUTH_DEFAULT_APP_ID, MOBILE_AUTH_DEFAULT_SCOPE, MOBILE_AUTH_FRONTEND_APP_KEY, createMobileAuthStd2Sign } from '../../src/sdk/mobileAuthSignature'
import { createTestHostAuthParams } from './testHostParams'

test('test host supplies fresh signed provider parameters without exposing the key', () => {
  const first = createTestHostAuthParams()
  const second = createTestHostAuthParams()
  expect(first).toMatchObject({ appId: MOBILE_AUTH_DEFAULT_APP_ID, version: '3.0', authType: '0', scope: MOBILE_AUTH_DEFAULT_SCOPE })
  expect(first.timestamp).toMatch(/^\d{17}$/)
  expect(first.traceId).toMatch(/^[A-F0-9]{32}$/)
  expect(first.sign).toBe(createMobileAuthStd2Sign({ ...first, appKey: MOBILE_AUTH_FRONTEND_APP_KEY }))
  expect(second.traceId).not.toBe(first.traceId)
  expect(second.sign).not.toBe(first.sign)
  expect(first).not.toHaveProperty('appKey')
  expect(JSON.stringify(first)).not.toContain(MOBILE_AUTH_FRONTEND_APP_KEY)
})
