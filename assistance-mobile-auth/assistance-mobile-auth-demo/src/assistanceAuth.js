/**
 * 助填认证 JSSDK 接入示范（assistance-mobile-auth）
 * ===================================================================
 *
 * 这是本演示的核心文件：把「在业务方 H5 页面接入我方 JSSDK」的完整做法
 * 收敛到一个可以从上到下逐行讲解的模块里。页面（index.html / main.js）
 * 只负责按钮与展示，不掌握任何 SDK / 接口细节。
 *
 * 全流程一共五步，按下面的顺序串起来：
 *   步骤一  动态加载我方 JSSDK
 *   步骤二  创建 SDK 实例并注册回调
 *   步骤三  调 /create 申请 launchToken（一次性启动凭证）
 *   步骤四  sdk.open() 拉起我方托管的安全验证窗口，等待用户完成验证
 *   步骤五  用验证结果凭证调 /result 换取脱敏身份信息
 *
 * 对外只暴露一个入口 startAssistanceAuth()，页面调用它即可跑完整条链路。
 */

/* ===================================================================
 * 配置区
 *
 * 全部来自构建期注入的环境变量（见 .env）。SESSION_API_BASE 给个兜底
 * 默认值并去掉结尾斜杠，避免拼接路径时出现双斜杠。
 * ================================================================= */

const SDK_URL = import.meta.env.VITE_SDK_URL
const SESSION_API_BASE = (import.meta.env.VITE_SESSION_API_BASE || '/sign-pay-pro/api/sdk/session').replace(/\/+$/, '')
const APP_ID = import.meta.env.VITE_APP_ID
const APP_KEY = import.meta.env.VITE_APP_KEY
// 0.2.0 起 createSdk() 必传 appId，用于 iframe 授权页按客户内容分流；与上面
// BFF createSession 用的 APP_ID（业务方接入认证）是同一发放体系但用途不同，
// 因此单独用一个 env 变量承载，避免把两种语义混作一个值。
const SDK_APP_ID = import.meta.env.VITE_SDK_APP_ID

/* ===================================================================
 * 步骤一　动态加载我方 JSSDK
 *
 * 这里用「动态 import() 按需加载 ESM 模块」的方式：直接 import 我方
 * JSSDK 的 ESM 包地址（VITE_SDK_URL），便于业务方按需懒加载，且页面
 * 无需在 HTML 中预先引入任何脚本。正式接入也可以直接在模块顶部静态
 * import（见 README「四、前端 API 参考」方式二）。
 *
 * 动态 import() 返回模块命名空间对象，其中包含具名导出
 * createAssistanceMobileAuthSdk；后续步骤二即基于它创建实例。
 *
 * loadPromise 是模块级单例：加载只发生一次，后续点击直接复用；
 * 加载失败时把单例清空，让下一次点击可以重试。
 * ================================================================= */

let loadPromise = null

function loadAssistanceSdk() {
  if (loadPromise) {
    return loadPromise
  }

  loadPromise = import(/* @vite-ignore */ SDK_URL).then((module) => {
    if (typeof module?.createAssistanceMobileAuthSdk !== 'function') {
      throw new Error('JSSDK 已加载但未导出 createAssistanceMobileAuthSdk，请检查 VITE_SDK_URL 是否正确。')
    }
    return module
  })

  // 加载失败时清空单例，允许下一次点击重新尝试加载
  loadPromise.catch(() => {
    loadPromise = null
  })

  return loadPromise
}

/* ===================================================================
 * 步骤二　创建 SDK 实例并注册回调
 *
 * createAssistanceMobileAuthSdk(options) 返回一个 SDK 实例。options 里
 * 注册的回调有 7 个，理解它们的「终态 / 非终态」语义是接入的关键：
 *
 *   终态回调（流程结束，三选一只会命中其一）：
 *     onSuccess  —— 验证成功，payload 与 open() resolve 的结果一致
 *     onCancel   —— 用户主动取消
 *     onError    —— 发生终态错误，验证窗口自动关闭
 *
 *   非终态回调：
 *     onErrorNotice —— 实时提示：验证窗口仍保持打开，用户可在窗口内重试，
 *                      同一次验证里可能触发多次，open() 的 Promise 不会因此 reject。
 *                      适合做埋点上报，或在页面上做辅助展示。
 *
 *   其它：
 *     onReady   —— 安全验证窗口加载就绪
 *     onClose   —— 安全验证窗口关闭（未完成验证）时回调
 *
 * 关于「回调 vs Promise 二选一」：onSuccess / onError / onCancel 拿到的
 * 数据，与步骤四 open() 返回的 Promise（resolve / reject）完全一致。
 * 因此主流程控制只需选一种风格即可——本示范以 await open() 驱动主流程，
 * 回调则用来把过程态实时反馈给页面（onErrorNotice 尤其只能靠回调拿到）。
 *
 * instance 同样是模块级单例：实例只创建一次，回调通过下面的 hooks
 * 转发出去，这样每次点击复用同一个实例，而展示逻辑仍由页面提供。
 * ================================================================= */

let instance = null

// 页面通过 startAssistanceAuth 传入的 UI 回调，挂在这里供 SDK 回调转发
let hooks = {}

function createAssistanceMobileAuthSdk(AssistanceMobileAuth) {
  const { createAssistanceMobileAuthSdk: createSdk } = AssistanceMobileAuth
  return createSdk({
    // 客户接入 appId（0.2.0 起必传）：用于 iframe 授权页按客户内容分流，
    // 未匹配到任何 profile 时展示默认页；不做认证。
    appId: SDK_APP_ID,

    // 验证窗口标题，可按业务场景自定义
    authWindowTitle: '身份验证',

    // 安全验证窗口加载就绪
    onReady() {
      hooks.onStatus?.('waiting', '等待验证', '安全验证窗口已就绪，请在窗口内完成身份确认。')
    },

    // 验证成功（终态）：数据与 open() resolve 一致，主流程在步骤四里拿，
    // 这里不重复处理，留作埋点等扩展点。
    onSuccess() {},

    // 用户取消（终态）：主流程由 open() reject 统一处理，这里留作扩展点。
    onCancel() {},

    // 终态错误（终态）：同上，由 open() reject 统一处理。
    onError() {},

    // 实时提示（非终态）：窗口保持打开、可能多次触发，转发给页面做辅助展示。
    onErrorNotice(payload) {
      hooks.onNotice?.(payload)
    },

    // 窗口关闭（未完成验证）：主流程由 open() reject 统一处理，这里留作扩展点。
    onClose() {},
  })
}

function getSdkInstance(AssistanceMobileAuth) {
  if (!instance) {
    instance = createAssistanceMobileAuthSdk(AssistanceMobileAuth)
  }
  return instance
}

/* ===================================================================
 * 接口请求工具
 *
 * 一个极简的 POST JSON 封装。
 *
 * 正式接入注意：下面 /create 与 /result 这两个接口都应由【业务方服务端】
 * 调用并保管 appKey，前端只接收 launchToken、只上送结果凭证。本示范由
 * 前端直调接口，仅为演示便利，请勿照搬到生产前端。
 * ================================================================= */

async function postJson(path, body) {
  const response = await fetch(`${SESSION_API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`接口请求失败（HTTP ${response.status}）：${path}`)
  }

  return response.json()
}

/* ===================================================================
 * 公开入口：startAssistanceAuth
 *
 * 把步骤一～五串成一条龙：load → create → /create → open → /result。
 * 页面只管调用它、传两个可选 UI 钩子，并处理 resolve / throw：
 *
 *   onStatus(tone, title, description) —— 过程态文案（waiting/success/...）
 *   onNotice(payload)                  —— onErrorNotice 实时提示透传
 *
 * 成功时 resolve { result, identity, message }；
 * 取消 / 关闭 / 终态错误时直接抛出原始 Error（页面据 message 区分处理）。
 * ================================================================= */

export async function startAssistanceAuth({ onStatus, onNotice } = {}) {
  // 记录本次调用的 UI 钩子，供步骤二里注册的 SDK 回调转发
  hooks = { onStatus, onNotice }

  // 步骤一 + 步骤二：确保 SDK 已加载、实例已就绪（均为单例，复用）
  onStatus?.('waiting', '正在创建验证会话', '正在向我方认证服务申请 launchToken……')
  const AssistanceMobileAuth = await loadAssistanceSdk()
  const sdk = getSdkInstance(AssistanceMobileAuth)

  /* ----------------------------------------------------------------
   * 步骤三　调 /create 申请 launchToken
   *
   * requestId 为业务方自定义的请求标识，便于对账与排查；这里用
   * 'demo-' 前缀拼当前毫秒时间戳。
   *
   * 正式接入注意：/create 必须由业务方服务端调用并保管 appKey，
   * 前端只从业务方服务端拿到 launchToken。
   * -------------------------------------------------------------- */
  const session = await postJson('/create', {
    appId: APP_ID,
    appKey: APP_KEY,
    requestId: `demo-${Date.now()}`,
    scene: 'native-number',
  })

  /* ----------------------------------------------------------------
   * 步骤四　sdk.open() 拉起我方托管的安全验证窗口
   *
   * open() 返回 Promise：用户验证成功时 resolve（结果与 onSuccess
   * 回调一致）；用户取消、窗口关闭或发生终态错误时以 Error reject。
   * 我们 await 它来拿到安全验证结果，作为主流程的「真相来源」。
   * -------------------------------------------------------------- */
  onStatus?.('waiting', '等待验证', '已打开安全验证窗口，请在窗口内完成身份确认。')

  const result = await sdk.open({
    launchToken: session.launchToken,
    scene: 'native-number',
  })

  /* ----------------------------------------------------------------
   * 步骤五　用验证结果凭证调 /result 换取脱敏身份信息
   *
   * 结果凭证二选一：优先用 authToken；没有则用 authResultId + authCode。
   *
   * 正式接入注意：/result 同样应由业务方服务端用 appId/appKey + 结果凭证
   * 调用，前端不应持有 appKey。这里前端直查仅为演示便利。
   * -------------------------------------------------------------- */
  onStatus?.('waiting', '正在查询认证结果', '验证已完成，正在查询脱敏身份信息……')

  const query = result.authToken
    ? { appId: APP_ID, appKey: APP_KEY, authToken: result.authToken }
    : { appId: APP_ID, appKey: APP_KEY, authResultId: result.authResultId, authCode: result.authCode }

  const identityResult = await postJson('/result', query)

  const message = identityResult.message || '身份信息已返回，可用于业务表单助填。'
  onStatus?.('success', '验证成功', message)

  return { result, identity: identityResult.identity, message }
}
