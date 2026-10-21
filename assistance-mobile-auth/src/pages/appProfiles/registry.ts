import type { AppProfile, AppProfileResolveContext } from './types'
import { YUANBAO_APP_IDS } from '../../config/yuanbaoAppIds'
export { YUANBAO_APP_ID } from '../../config/yuanbaoAppIds'

export const ZIDINGYI_APP_ID = '8a9481c79c05c8bd019f6f42956924a0'
export const HAIKE_APP_ID = '8a9481c79c05c8bd019ed8d7ab571df3'

/** 样式档案键：稳定标识一套皮肤/文案配置，与 appId 解耦（appId 可能变更）。 */
export type AppProfileKey = 'demo-brand' | 'chinaums-sheet' | 'chinaums-sheet-v23' | 'haike-inline'

// 样式档案：按档案键定义，与具体 appId 无关。新皮肤在此追加（每次追加走正常发版）。
const profileDefinitions: Record<AppProfileKey, Omit<AppProfile, 'appId'>> = {
  'demo-brand': {
    label: '示例品牌',
    ui: {
      themeColor: '#0A6CFF',
      texts: { headerTitle: { text: '示例品牌身份核验' } },
      agreements: [{ title: '示例品牌服务协议', url: 'https://example.com/agreement' }],
    },
  },
  // 协议文案由移动 SDK agreement slot 注入（勾选语义由 SDK 承担），此处不得配置
  // ui.agreements：皮肤协议区无勾选框，配置了会让 customAgreementsAllAgreed 永假、授权按钮死锁。
  'chinaums-sheet': {
    label: '银联三要素授权',
    skin: 'chinaumsSheet',
    ui: {
      themeColor: '#f75110',
    },
  },
  'chinaums-sheet-v23': {
    label: '银杏助填版本 23',
    skin: 'chinaumsSheetV23',
    ui: {
      themeColor: '#ff4a19',
    },
  },
  'haike-inline': {
    label: '海客内嵌授权',
    skin: 'haikeInline',
  },
}

// appId 绑定表：appId → 样式档案键。appId 变更/新增只改这里；同一档案可绑多个 appId。
const appIdBindings: Record<string, AppProfileKey> = {
  'demo-brand-001': 'demo-brand',
  [ZIDINGYI_APP_ID]: 'chinaums-sheet-v23',
  ...Object.fromEntries(YUANBAO_APP_IDS.map((appId) => [appId, 'chinaums-sheet-v23' as const])),
}

const profileByAppId: ReadonlyMap<string, AppProfile> = new Map(
  Object.entries(appIdBindings).map(([appId, profileKey]) => [
    appId,
    { appId, ...profileDefinitions[profileKey] },
  ]),
)

export function resolveAppProfileFrom(
  source: ReadonlyMap<string, AppProfile>,
  appId: string | null | undefined,
): AppProfile | null {
  if (typeof appId !== 'string') {
    return null
  }

  const trimmed = appId.trim()
  if (!trimmed) {
    return null
  }

  return source.get(trimmed) ?? null
}

/**
 * 根据授权页已解析的 URL 上下文选择 profile；第二参数可选，保留 resolveAppProfile(appId) 的既有调用语义。
 */
export function resolveAppProfile(
  appId: string | null | undefined,
  context?: AppProfileResolveContext,
): AppProfile | null {
  const trimmed = typeof appId === 'string' ? appId.trim() : ''
  if (trimmed === HAIKE_APP_ID && context?.layout === 'inline') {
    return { appId: HAIKE_APP_ID, ...profileDefinitions['haike-inline'] }
  }

  return resolveAppProfileFrom(profileByAppId, appId)
}

export function isZidingyiFeedbackProfile(appId: string | null | undefined): boolean {
  const trimmed = typeof appId === 'string' ? appId.trim() : ''
  return trimmed === ZIDINGYI_APP_ID && resolveAppProfile(trimmed)?.skin === 'chinaumsSheetV23'
}

export function isYuanbaoFeedbackProfile(appId: string | null | undefined): boolean {
  return typeof appId === 'string' && YUANBAO_APP_IDS.includes(appId.trim())
}
