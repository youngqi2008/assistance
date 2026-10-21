import { AuthVerificationWindow } from './AuthVerificationWindow'
import { resolveAppProfile } from './appProfiles'

/** 按 ?appId 分流：profile 提供整页模板则替换，否则渲染默认授权页（默认页内部再应用 profile.ui）。 */
export function ProfiledVerificationWindow() {
  const appId =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('appId')
  const profile = resolveAppProfile(appId)

  if (profile?.Page) {
    const Page = profile.Page
    return <Page />
  }

  return <AuthVerificationWindow />
}
