import type { ComponentType } from 'react'

import type { AssistanceMobileAuthUiConfig } from '../../wrapper/uiConfig'

/** 展示层皮肤键。skin 只替换授权页展示组件（流程/SDK/bridge 全复用）；
 *  与 Page 的整页替换不同：有 Page 时根本不进 AuthVerificationWindow，skin 不生效。 */
export type AppProfileSkinKey = 'chinaumsSheet' | 'chinaumsSheetV23' | 'haikeInline'

/**
 * 授权页 URL 的展示上下文。保留为宽松字符串，方便页面直接传入已解析的查询参数，
 * 而 registry 只为自己明确支持的值分流。
 */
export interface AppProfileResolveContext {
  layout?: string | null
}

export interface AppProfile {
  /** 客户 appId（与 BFF createSession 同一发放体系；此处仅用于内容分流，不做认证） */
  appId: string
  /** 展示名，便于排查日志 */
  label: string
  /** 品牌/文案/协议差异；与调用方 ui 选项同构，调用方 ui 在其上逐字段覆盖 */
  ui?: AssistanceMobileAuthUiConfig
  /** 流程/功能开关预留位；当前无消费方，首个真实开关接入时在此定义具体字段 */
  features?: Record<string, boolean>
  /** 展示层皮肤：命中时 AuthVerificationWindow 换用对应皮肤组件渲染，流程逻辑不变 */
  skin?: AppProfileSkinKey
  /**
   * 整页模板变体。提供时以零 props 渲染，完全替换默认授权页（不复用默认页的
   * iframe 桥接与状态管理）。实现方必须自行：
   *   1. 读取 URL 上的 `assistanceAuthSessionId` 参数；
   *   2. 实现 postMessage bridge 协议（ready / success / error / close 等，
   *      参见 `src/wrapper/verificationBridge.ts`）与宿主页 wrapper 通信。
   * 未实现 bridge 协议时，wrapper 的 `open()` Promise 永不 settle。
   * 在有真实模板 profile 接入前，此字段仅为预留能力，registry 中暂无消费方。
   */
  Page?: ComponentType
}
