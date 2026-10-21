import type { CustomBootConfig } from '../custom-page/types'
import { createFrontendMobileAuthParams } from '../sdk/mobileAuthSignature'

// This module belongs only to the selected 031 iframe loader. The business
// appId identifies the host; provider signing always uses the existing defaults.
export function prepareDuodian031Config(config: CustomBootConfig): CustomBootConfig {
  if (config.mode !== 'authorization' || config.authParams !== undefined) return config
  return { ...config, authParams: createFrontendMobileAuthParams() }
}
