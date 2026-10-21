export type MobileOfficialJssdkRedistributionStatus = 'pending-approval' | 'approved'

export type MobileOfficialJssdkH5CssStrategy = 'env-dynamic-remote-css'

export type MobileOfficialJssdkWrapperCssStrategy = 'caller-required-local-asset'

export interface MobileOfficialJssdkResource {
  version: string
  jsUrl: string
  cssUrl: string
  localJsPath: string
  localCssPath: string
  jsSha256: string
  cssSha256: string
  retrievedAt: string
  license: string
  redistributionStatus: MobileOfficialJssdkRedistributionStatus
  approvalSource: string
  approvalDate: string
  h5CssStrategy: MobileOfficialJssdkH5CssStrategy
  wrapperCssStrategy: MobileOfficialJssdkWrapperCssStrategy
  updatePolicy: string
}

export type MobileOfficialJssdkEnv = 'prod' | 'test'

export const mobileOfficialJssdkResource: MobileOfficialJssdkResource = {
  version: '1.0.6',
  jsUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js',
  cssUrl: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/css/new-control-style.css',
  localJsPath: 'src/wrapper/vendor/jssdk-1.0.6.min.js',
  localCssPath: 'src/wrapper/vendor/new-control-style.css',
  jsSha256: 'caf9cd6ef6efe96fcc91111ac7d0bf7d314d0bc657a80c4a1db168afcac18486',
  cssSha256: '35bc356791dc1b7c68bdb282baf31db7eac1edeef4853609f6869cb7286aeb1e',
  retrievedAt: '2026-05-07',
  license: 'official-customer-documentation-no-redistribution-license-text-found',
  redistributionStatus: 'approved',
  approvalSource: 'Project owner approved official CSS use on 2026-05-07',
  approvalDate: '2026-05-07',
  h5CssStrategy: 'env-dynamic-remote-css',
  wrapperCssStrategy: 'caller-required-local-asset',
  updatePolicy: 'replace only after source URL/hash/license review',
}

/**
 * Legacy environment selector retained for source compatibility. Environment
 * values no longer change the executable JSSDK resource.
 */
export function selectMobileOfficialJssdkResource(
  _env: MobileOfficialJssdkEnv | string | undefined,
): MobileOfficialJssdkResource {
  return mobileOfficialJssdkResource
}

/**
 * 运行时解析当前移动 JSSDK 环境模式。
 * 优先级：URL 参数 `?mobileAuthEnv=prod|test` > build 时 `VITE_MOBILE_AUTH_ENV`。
 * 非 prod/test 的参数值忽略，回落 build 默认；build 默认非 'test' 即 'prod'。
 * 该解析结果仅为旧调用方兼容信息，不得用于切换可执行 JSSDK 资源。
 */
export function resolveRuntimeMobileAuthEnv(
  search?: string,
  buildEnv?: string,
): MobileOfficialJssdkEnv {
  const qs = search ?? (typeof window !== 'undefined' ? window.location.search : '')
  if (qs) {
    const value = new URLSearchParams(qs).get('mobileAuthEnv')?.trim().toLowerCase()
    if (value === 'prod') return 'prod'
    if (value === 'test') return 'test'
  }
  return (buildEnv ?? '').trim().toLowerCase() === 'test' ? 'test' : 'prod'
}

export function assertMobileOfficialJssdkMetadataReady(
  resource: MobileOfficialJssdkResource = mobileOfficialJssdkResource,
): void {
  // localJsPath / jsSha256 are no longer required: JS is loaded from the remote
  // CDN via <script src=jsUrl>. CSS is still resolved from a local asset path
  // by wrapper consumers, so localCssPath / cssSha256 stay required.
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
    if (!resource[field].trim()) {
      throw new Error(`Mobile official JSSDK metadata is missing ${field}`)
    }
  }
}
