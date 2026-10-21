import { mobileOfficialJssdkResource } from './vendor/mobile-jssdk.meta'

export interface AssistanceMobileAuthJssdkResourceBuildOptions {
  /** Legacy compatibility option; resource selection ignores it. */
  staticResourceRelease?: boolean
  /** Legacy compatibility option; resource selection ignores it. */
  env?: Pick<ImportMetaEnv, 'VITE_MOBILE_AUTH_ENV'>
  /** Legacy compatibility option; resource selection ignores it. */
  search?: string
}

/**
 * Resolves the active JSSDK resource. Legacy options remain accepted as no-ops;
 * every build and runtime URL uses the reviewed official CDN 1.0.6 resource.
 */
export function resolveAssistanceMobileAuthJssdkResourceForBuild(
  _options: AssistanceMobileAuthJssdkResourceBuildOptions = {},
) {
  return mobileOfficialJssdkResource
}
