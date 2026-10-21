/**
 * 助填认证 H5 转跳接入示范（assistance-mobile-auth）
 * ===================================================================
 *
 * 这是「H5 转跳方式」的核心文件，与 JSSDK 弹窗方式（assistanceAuth.js）并列。
 * 两种接入方式二选一：
 *   - JSSDK 弹窗方式：无需离开当前页面，在我方安全验证窗口内完成，详见 assistanceAuth.js。
 *   - H5 转跳方式：不引入任何 SDK、不弹窗——业务页整页跳转到我方托管的授权页，
 *     用户在授权页完成验证后，浏览器自动带 authToken 回跳到业务方回跳页。
 *
 * 本文件不引用任何 DOM，只负责接口与跳转逻辑，可从上到下逐行讲解。
 * 全流程分两段（分别由两个页面触发）：
 *   步骤一  发起页：调 /create 拿 launchToken → 整页跳转到我方托管授权页
 *   步骤二  回跳页：从 URL 读 authToken → 调 /result 换取脱敏身份信息
 *
 * 对外只暴露两个入口：
 *   startH5RedirectAuth()   —— 发起页调用（如 index.html）
 *   resolveRedirectResult() —— 回跳页调用（callback.html）
 */

/* ===================================================================
 * 配置区
 *
 * 全部来自构建期注入的环境变量（见 .env）。
 *   SESSION_API_BASE  会话接口前缀（去掉结尾斜杠，避免拼接出双斜杠）
 *   APP_ID / APP_KEY  测试环境演示凭证
 *   AUTH_PAGE_URL     我方托管授权页地址（H5 转跳目标）
 *   REDIRECT_CALLBACK_URL 可选：回跳地址；留空则运行时取当前站点 origin + /callback.html
 * ================================================================= */

const SESSION_API_BASE = (import.meta.env.VITE_SESSION_API_BASE || '/sign-pay-pro/api/sdk/session').replace(/\/+$/, '')
const APP_ID = import.meta.env.VITE_APP_ID
const APP_KEY = import.meta.env.VITE_APP_KEY
const AUTH_PAGE_URL = import.meta.env.VITE_AUTH_PAGE_URL || 'https://ginkgo.chinaums.com/sign-pay-pro/auth'
const REDIRECT_CALLBACK_URL = import.meta.env.VITE_REDIRECT_CALLBACK_URL

/* ===================================================================
 * 接口请求工具
 *
 * 一个极简的 POST JSON 封装（与 assistanceAuth.js 同款，各自独立实现以保持
 * 文件自包含）。
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

/* 计算回跳地址（绝对 URL）：优先用 .env 覆盖值，否则取当前站点 origin + /callback.html */
function resolveRedirectUrl() {
  if (REDIRECT_CALLBACK_URL) {
    return REDIRECT_CALLBACK_URL
  }
  return new URL('callback.html', window.location.origin).toString()
}

/* ===================================================================
 * 步骤一　发起转跳　startH5RedirectAuth()
 *
 * 由发起页（index.html）调用，做两件事：
 *   1) 调 /create 申请 launchToken，并带上 redirectUrl=本站回跳页绝对地址。
 *      传了 redirectUrl 后，响应里 redirectMode 会是 true，表示走转跳模式；
 *      用户在我方授权页完成验证后，我方会把浏览器带 ?authToken=<token>
 *      回跳到这个 redirectUrl。
 *   2) window.location.assign 整页跳转到我方托管授权页，只在 query 里带
 *      launchToken（不带任何内部参数）。跳转后浏览器即离开本页。
 *
 * requestId 为业务方自定义请求标识，便于对账与排查；这里用 'demo-' 前缀
 * 拼当前毫秒时间戳。
 *
 * 正式接入注意：/create 必须由业务方服务端调用并保管 appKey，前端只从
 * 业务方服务端拿到 launchToken 后再发起跳转。
 * ================================================================= */

export async function startH5RedirectAuth() {
  const redirectUrl = resolveRedirectUrl()

  // 1) 申请 launchToken（带回跳地址）
  const session = await postJson('/create', {
    appId: APP_ID,
    appKey: APP_KEY,
    requestId: `demo-${Date.now()}`,
    scene: 'native-number',
    redirectUrl,
  })

  // 2) 整页跳转到我方托管授权页：只带 launchToken。跳转后浏览器离开本页。
  const authPageUrl = `${AUTH_PAGE_URL}?launchToken=${encodeURIComponent(session.launchToken)}`
  window.location.assign(authPageUrl)
}

/* ===================================================================
 * 步骤二　换取结果　resolveRedirectResult()
 *
 * 由回跳页（callback.html）调用。用户在我方授权页完成验证后，浏览器会带
 * ?authToken=<token> 回跳到本页，本函数做两件事：
 *   1) 从 window.location.search 读取 authToken；缺失则返回
 *      { status:'missing-token' }（说明不是从授权页正常回跳过来的）。
 *   2) 用 authToken 调 /result 换取脱敏身份信息，成功返回
 *      { status:'success', identity, message }；接口异常直接抛出 Error。
 *
 * 正式接入注意：/result 同样应由业务方服务端用 appId/appKey + authToken
 * 调用，前端不应持有 appKey。这里前端直查仅为演示便利。
 * ================================================================= */

export async function resolveRedirectResult() {
  const authToken = new URLSearchParams(window.location.search).get('authToken')?.trim() ?? ''

  if (!authToken) {
    return { status: 'missing-token' }
  }

  const identityResult = await postJson('/result', {
    appId: APP_ID,
    appKey: APP_KEY,
    authToken,
  })

  const message = identityResult.message || '身份信息已返回，可用于业务表单助填。'
  return { status: 'success', identity: identityResult.identity, message, authToken, result: identityResult }
}
