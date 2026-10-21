import type { AgreementDocKey } from './agreementTypes'
import { HAIKE_V2_APP_ID } from './appAgreementRegistry'

function shouldKeepHaikeInlineLayout(appId?: string | null): boolean {
  if (typeof window === 'undefined' || appId?.trim() !== HAIKE_V2_APP_ID) {
    return false
  }

  return new URLSearchParams(window.location.search).get('layout') === 'inline'
}

// 复用当前部署路径（适配 staging/prod 子路径如 /sign-pay-pro/...），只替换 query。
// 由移动 SDK 控件作为 childArr.link 在二级页打开。
export function buildAgreementDocUrl(
  key: AgreementDocKey,
  appId?: string | null,
): string {
  const { origin, pathname } = window.location
  const normalizedAppId = appId?.trim()
  const appIdParam = normalizedAppId
    ? `&appId=${encodeURIComponent(normalizedAppId)}`
    : ''
  const layoutParam = shouldKeepHaikeInlineLayout(appId) ? '&layout=inline' : ''
  return `${origin}${pathname}?flow=agreement&doc=${encodeURIComponent(key)}${appIdParam}${layoutParam}`
}

export function buildAgreementEntryUrl(appId?: string | null): string {
  return buildAgreementDocUrl('entry', appId)
}
