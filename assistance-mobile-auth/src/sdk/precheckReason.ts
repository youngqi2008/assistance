import { lookupSdkError } from './sdkErrorMessages'
import type { DetectedNetworkType } from './networkType'

export type PrecheckReason = 'ok' | 'wifi' | 'non-mobile' | 'ambiguous' | 'unknown'

export interface PrecheckResult {
  eligible: boolean
  reason: PrecheckReason
  raw?: {
    code?: string
    carrier?: string
    /** showAuthPage 取号失败时各运营商网关的原始返回码（YD=移动 / CT=电信 / CU=联通），排查用。 */
    carriers?: { YD?: string; CT?: string; CU?: string }
    /** 探测到的网络类型，用于细化 ambiguous 判定；unknown 表示当前环境无法判定（如 iOS Safari）。 */
    networkType?: DetectedNetworkType
  }
}

/**
 * 把 showAuthPage 取号失败时由 extractSdkErrorPayload 提取出的错误码，归类为失败原因。
 * 关键：单凭错误码无法区分「WiFi」与「非移动号码」——移动网关对二者都取不到号。
 * 因此「识别不了本机号码」的码统一归为 ambiguous，需结合网络类型探测进一步细化
 * （见 refineAmbiguousReason / AuthProbeWindow）。判定优先级（命中即止）：
 *   1. ALL_CARRIERS_FAILED / 103111（三家全失败 / WAP 网关 IP 错误＝未用移动数据网络）→ ambiguous
 *   2. errorKind === 'carrier-mismatch' 的其余码（如 110031/110032/103124/103125/105110）→ non-mobile
 *   3. 其它（资源/初始化/未知/空码）→ unknown
 */
export function mapProbeFailureReason(code: string): 'ambiguous' | 'non-mobile' | 'unknown' {
  const normalized = code.trim()
  if (normalized === 'ALL_CARRIERS_FAILED' || normalized === '103111') {
    return 'ambiguous'
  }
  if (lookupSdkError(normalized).errorKind === 'carrier-mismatch') {
    return 'non-mobile'
  }
  return 'unknown'
}

/**
 * 用探测到的网络类型细化 ambiguous 判定：
 *   - WiFi    → wifi（确认在 WiFi）
 *   - 蜂窝    → non-mobile（在移动数据网络仍三家全失败，极可能是非中国移动号码）
 *   - unknown → 保持 ambiguous（环境无法判定，不误导）
 */
export function refineAmbiguousReason(networkType: DetectedNetworkType): 'wifi' | 'non-mobile' | 'ambiguous' {
  if (networkType === 'wifi') {
    return 'wifi'
  }
  if (networkType === 'cellular') {
    return 'non-mobile'
  }
  return 'ambiguous'
}
