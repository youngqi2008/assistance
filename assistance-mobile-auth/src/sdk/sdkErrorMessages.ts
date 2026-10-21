import type { MobileAuthSdkErrorKind } from './types'

export interface SdkErrorMapping {
  uiText: string
  errorKind: MobileAuthSdkErrorKind
  /** 'doc' = 官方附录 A; 'business' = [ASSUMED] 业务推断; 'sentinel' = 我们生成的 */
  source: 'doc' | 'business' | 'sentinel'
  /** 给用户的有序操作步骤；SdkErrorPanel 会渲染为 <ol> */
  steps?: readonly string[]
}

const CARRIER_MISMATCH_STEPS = [
  '确认当前手机号是中国移动号码',
  '关闭 Wi-Fi 与 VPN/代理',
  '打开手机的移动数据（4G/5G 蜂窝网络）',
  '回到本页面，刷新或重新发起验证',
] as const

export const SDK_ERROR_CODE_MAP = {
  // === 文档附录 A ===
  '103111': { uiText: '当前网络无法识别本机号码（WAP 网关 IP 错误），通常是因为没有使用中国移动的数据网络。', errorKind: 'carrier-mismatch', source: 'doc', steps: CARRIER_MISMATCH_STEPS },
  '103119': { uiText: 'AppID 配置异常，请联系管理员。', errorKind: 'sdk-init-failed', source: 'doc' },
  '103120': { uiText: '运管配置异常，请稍后再试。', errorKind: 'sdk-init-failed', source: 'doc' },
  '103124': { uiText: '该号码暂不支持电信网络验证。', errorKind: 'carrier-mismatch', source: 'doc', steps: CARRIER_MISMATCH_STEPS },
  '103125': { uiText: '该号码暂不支持联通网络验证。', errorKind: 'carrier-mismatch', source: 'doc', steps: CARRIER_MISMATCH_STEPS },
  '103126': { uiText: '认证权益已失效，请联系管理员。', errorKind: 'sdk-init-failed', source: 'doc' },
  '103127': { uiText: '应用没有认证权益，请联系管理员。', errorKind: 'sdk-init-failed', source: 'doc' },
  '103130': { uiText: '本机号码校验失败。', errorKind: 'carrier-mismatch', source: 'doc', steps: CARRIER_MISMATCH_STEPS },
  '103131': { uiText: '当前网络号码与请求号码不一致。', errorKind: 'carrier-mismatch', source: 'doc', steps: CARRIER_MISMATCH_STEPS },
  '103135': { uiText: '请勾选阅读并同意隐私协议后重试。', errorKind: 'sdk-init-failed', source: 'doc' },
  '105110': { uiText: '该号码暂不支持本次验证。', errorKind: 'carrier-mismatch', source: 'doc', steps: CARRIER_MISMATCH_STEPS },
  '105302': { uiText: '应用未在白名单，请联系管理员。', errorKind: 'sdk-init-failed', source: 'doc' },
  '105312': { uiText: '认证能力余量不足，请稍后再试。', errorKind: 'sdk-init-failed', source: 'doc' },
  '105016': { uiText: '已达到使用次数限制，请稍后再试。', errorKind: 'sdk-init-failed', source: 'doc' },
  '105999': { uiText: '系统繁忙，请稍后再试。', errorKind: 'sdk-init-failed', source: 'doc' },
  // === [ASSUMED] 业务推断（不在官方文档附录 A 中） ===
  '110031': { uiText: '该号码不在中国移动网络环境。', errorKind: 'carrier-mismatch', source: 'business', steps: CARRIER_MISMATCH_STEPS },
  '110032': { uiText: '当前网络环境暂不支持验证。', errorKind: 'carrier-mismatch', source: 'business', steps: CARRIER_MISMATCH_STEPS },
  // === 哨兵：我们自己生成的状态码 ===
  ALL_CARRIERS_FAILED: { uiText: '本机号码识别需要使用中国移动手机号 + 中国移动数据网络（4G/5G 流量）。当前检测到三个运营商网络都无法识别，通常是因为正在使用 Wi-Fi 或非中国移动蜂窝网络。', errorKind: 'carrier-mismatch', source: 'sentinel', steps: CARRIER_MISMATCH_STEPS },
  NETWORK_TIMEOUT: { uiText: '网络较慢加载超时，建议切换到中国移动数据网络后重试。', errorKind: 'network-timeout', source: 'sentinel' },
  SPA_HTML_FALLBACK: { uiText: 'SDK 资源未正确加载，请刷新页面或联系技术支持。', errorKind: 'sdk-init-failed', source: 'sentinel' },
  SDK_DISABLED: { uiText: 'SDK 已禁用，无法继续验证。', errorKind: 'sdk-disabled', source: 'sentinel' },
  CDN_BLOCKED: { uiText: '无法加载 SDK 资源，请检查网络或防火墙设置。', errorKind: 'sdk-init-failed', source: 'sentinel' },
} as const satisfies Record<string, SdkErrorMapping>

export function lookupSdkError(code: string | number | undefined | null): SdkErrorMapping {
  const key = code == null ? '' : String(code).trim()
  const entry = (SDK_ERROR_CODE_MAP as Record<string, SdkErrorMapping>)[key]
  if (entry) return entry
  return {
    uiText: `验证失败（错误码 ${key || '未知'}），请稍后再试。`,
    errorKind: 'unknown',
    source: 'sentinel',
  }
}

const CARRIER_KEYS = ['YDData', 'CTData', 'CUData'] as const
const CARRIER_SUCCESS_CODE = '103000'

export type SdkErrorCarrier = 'YD' | 'CT' | 'CU' | 'unknown'

export interface ExtractedSdkError {
  code: string
  desc: string
  carrier: SdkErrorCarrier
  /** 各运营商网关的原始失败码（YD=移动 / CT=电信 / CU=联通）；存在 carrier 子负载时填充，排查用。 */
  carriers?: { YD?: string; CT?: string; CU?: string }
}

function buildCarrierMap(failed: readonly ExtractedSdkError[]): { YD?: string; CT?: string; CU?: string } | undefined {
  const map: { YD?: string; CT?: string; CU?: string } = {}
  for (const item of failed) {
    if (item.carrier === 'YD' || item.carrier === 'CT' || item.carrier === 'CU') {
      map[item.carrier] = item.code
    }
  }
  return Object.keys(map).length > 0 ? map : undefined
}

/**
 * 移动 JSSDK showAuthPage/initControl error 回调实测 payload 形态：
 *   { YDData: {code, message}, CTData: {...}, CUData: {...}, msgId: '...' }
 * Staging 实测：每个 carrier 对象用 `code` (而非 `resultCode`) 与 `message`/`desc`。
 *
 * 关键启发：当 YD/CT/CU 三家都失败时，意味着用户既不在中国移动数据网络，也没有
 * 走电信/联通的取号能力 — 通常是 wifi 或非蜂窝场景。映射到 ALL_CARRIERS_FAILED
 * 哨兵以触发更友好的引导文案，而不是把 YDData 那条原始错误码（如 103111
 * "WAP网关IP错误"）直接展示给用户。
 *
 * 早期 [ASSUMED] 假设的 flat {code, desc} 形态作为 fallback 兼容。
 */
export function extractSdkErrorPayload(payload: unknown): ExtractedSdkError {
  if (payload == null || typeof payload !== 'object') {
    return { code: '', desc: '', carrier: 'unknown' }
  }
  const p = payload as Record<string, unknown>

  const carriersPresent: SdkErrorCarrier[] = []
  const carriersFailed: ExtractedSdkError[] = []
  for (const key of CARRIER_KEYS) {
    const data = p[key]
    if (!data || typeof data !== 'object') continue
    carriersPresent.push(key.slice(0, 2) as SdkErrorCarrier)
    const sub = data as Record<string, unknown>
    const subCode = sub.resultCode ?? sub.code
    if (subCode == null || subCode === '' || String(subCode).trim() === CARRIER_SUCCESS_CODE) continue
    const subDesc =
      (typeof sub.desc === 'string' && sub.desc) ||
      (typeof sub.message === 'string' && sub.message) ||
      ''
    carriersFailed.push({
      code: String(subCode).trim(),
      desc: subDesc,
      carrier: key.slice(0, 2) as SdkErrorCarrier,
    })
  }

  if (carriersPresent.length === CARRIER_KEYS.length && carriersFailed.length === CARRIER_KEYS.length) {
    // All three carriers reported errors — user is on wifi / non-mobile network.
    // Surface the ALL_CARRIERS_FAILED sentinel for a friendlier "switch to China Mobile cellular" hint
    // instead of the YDData original code (e.g. 103111 WAP gateway IP error).
    return {
      code: 'ALL_CARRIERS_FAILED',
      desc: carriersFailed.map((c) => `${c.carrier}:${c.code}/${c.desc}`).join(' | '),
      carrier: 'unknown',
      carriers: buildCarrierMap(carriersFailed),
    }
  }

  if (carriersFailed.length > 0) {
    return { ...carriersFailed[0], carriers: buildCarrierMap(carriersFailed) }
  }

  const flat = p.code ?? p.resultCode
  if (flat != null && flat !== '') {
    return {
      code: String(flat).trim(),
      desc:
        (typeof p.desc === 'string' && p.desc) ||
        (typeof p.message === 'string' && p.message) ||
        '',
      carrier: 'unknown',
    }
  }
  return { code: '', desc: '', carrier: 'unknown' }
}
