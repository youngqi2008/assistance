import { createFrontendMobileAuthParams } from '../../src/sdk/mobileAuthSignature'

/** Test host only: business identity never overrides the provider's identity. */
export function createTestHostAuthParams() {
  return createFrontendMobileAuthParams()
}
