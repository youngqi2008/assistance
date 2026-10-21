import { useEffect, useRef } from 'react'

import { createAuthParamsProvider } from '../sdk/authParamsProvider'
import { getMobileAuthSdkConfig } from '../sdk/config'
import { createMobileAuthSdkFacade } from '../sdk/mobileAuthFacade'
import { loadMobileAuthSdkResources } from '../sdk/resourceLoader'
import { extractSdkErrorPayload, type ExtractedSdkError } from '../sdk/sdkErrorMessages'
import { mapProbeFailureReason, refineAmbiguousReason, type PrecheckReason, type PrecheckResult } from '../sdk/precheckReason'
import { detectNetworkType, type DetectedNetworkType } from '../sdk/networkType'
import type { MobileAuthSdkConfig } from '../sdk/types'
import { mobileOfficialJssdkResource } from '../wrapper/vendor/mobile-jssdk.meta'
import { ASSISTANCE_AUTH_PROBE_RESULT, createAssistanceAuthMessage } from '../wrapper/verificationBridge'

const SUCCESS_CODE = '103000'

// 与 AuthVerificationWindow.getMobileAuthResourceConfig 同义：mock 配置下回落到真实 JSSDK 资源，
// 否则 probe 在 mock 模式拿不到真实取号。probe 不渲染控件，无需 css 之外的额外处理。
function getProbeResourceConfig(): MobileAuthSdkConfig {
  const config = getMobileAuthSdkConfig()
  if (config.enabled) {
    return config
  }
  return {
    ...config,
    enabled: true,
    mode: 'live',
    jsUrl: mobileOfficialJssdkResource.jsUrl,
    cssUrl: mobileOfficialJssdkResource.cssUrl,
  }
}

function buildRaw(ex: ExtractedSdkError, networkType?: DetectedNetworkType): PrecheckResult['raw'] {
  const raw: NonNullable<PrecheckResult['raw']> = {}
  if (ex.code) {
    raw.code = ex.code
  }
  if (ex.carrier && ex.carrier !== 'unknown') {
    raw.carrier = ex.carrier
  }
  if (ex.carriers && Object.keys(ex.carriers).length > 0) {
    raw.carriers = ex.carriers
  }
  if (networkType) {
    raw.networkType = networkType
  }
  return Object.keys(raw).length > 0 ? raw : undefined
}

/**
 * 弹窗前预检的离屏探测页（mode=probe 时渲染）。只跑 showAuthPage 取号、绝不调 initControl，
 * 把裁决经 postMessage 回传父窗后即结束；不发任何终态/通知桥接消息（只查不授权）。
 *
 * 取号失败时：错误码先经 mapProbeFailureReason 归类。「识别不了本机号码」的 ambiguous 场景
 * （ALL_CARRIERS_FAILED / 103111，WiFi 与非移动号码共用同一信号）再用 detectNetworkType
 * 细化为 wifi / non-mobile / ambiguous。各家原始码与探测到的网络类型一并写入 raw，便于排查。
 */
export function AuthProbeWindow() {
  const postedRef = useRef(false)

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const sessionId = search.get('assistanceAuthSessionId') ?? ''
    let cancelled = false

    const post = (result: PrecheckResult) => {
      if (cancelled || postedRef.current) {
        return
      }
      postedRef.current = true
      window.parent.postMessage(createAssistanceAuthMessage(ASSISTANCE_AUTH_PROBE_RESULT, sessionId, result), '*')
    }

    const config = getProbeResourceConfig()
    const paramsProvider = createAuthParamsProvider({ config })

    // settleFailure 永不 reject：任何意外都兜底为 unknown 并 post，保证探测一定有结论
    // （上层 void 调用因此安全；同时不依赖 wrapper 超时兜底）。
    const settleFailure = async (payload: unknown) => {
      try {
        const ex = extractSdkErrorPayload(payload)
        const base = mapProbeFailureReason(ex.code)
        let reason: PrecheckReason = base
        let networkType: DetectedNetworkType | undefined
        if (base === 'ambiguous') {
          networkType = await detectNetworkType()
          if (cancelled) {
            return
          }
          reason = refineAmbiguousReason(networkType)
        }
        const raw = buildRaw(ex, networkType)
        post({ eligible: false, reason, ...(raw ? { raw } : {}) })
      } catch {
        post({ eligible: false, reason: 'unknown' })
      }
    }

    void (async () => {
      try {
        const resolution = paramsProvider.resolve({ forceFrontend: true })
        if (resolution.status !== 'ready' || !resolution.data) {
          post({ eligible: false, reason: 'unknown' })
          return
        }

        const loadResult = await loadMobileAuthSdkResources(config)
        if (cancelled) return
        if (loadResult.state !== 'ready') {
          post({ eligible: false, reason: 'unknown' })
          return
        }

        const facade = createMobileAuthSdkFacade()
        facade.showAuthPage({
          data: resolution.data,
          success: (payload) => {
            if (String(payload.code ?? '') === SUCCESS_CODE) {
              post({ eligible: true, reason: 'ok' })
              return
            }
            void settleFailure(payload)
          },
          error: (payload) => {
            void settleFailure(payload)
          },
        })
      } catch {
        post({ eligible: false, reason: 'unknown' })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return <div data-assistance-auth-probe className="sr-only" aria-hidden="true" />
}
