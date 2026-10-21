# 助填认证 JSSDK 接入演示项目

一个可直接运行的最小接入示例：动态加载 JSSDK → 创建实例 → 拉起安全验证窗口 → 拿结果凭证换取脱敏身份信息。接入核心代码集中在 `src/assistanceAuth.js`，建议对照本文阅读。

## 源码结构

| 文件 | 角色 |
| --- | --- |
| `src/assistanceAuth.js` | **接入核心文件，建议重点阅读**。把完整接入流程（步骤一～五）收敛在一个文件里：动态加载 JSSDK、创建实例并注册回调、调 `/create` 申请 launchToken、`sdk.open()` 拉起安全验证窗口、调 `/result` 换取脱敏身份信息。对外只暴露一个入口 `startAssistanceAuth()`。 |
| `src/h5Redirect.js` | **H5 转跳接入核心**。整页跳转到我方托管授权页、回跳后换取脱敏身份信息；对外暴露 `startH5RedirectAuth()`（发起页用）与 `resolveRedirectResult()`（回跳页用）。 |
| `callback.html` / `src/callback.js` | H5 转跳回跳落地页：用户验证完成后带 `authToken` 回跳到此页，调用 `resolveRedirectResult()` 展示结果。 |
| `index.html` / `src/main.js` | 极简演示宿主页面：只负责按钮与结果展示，调用 `startAssistanceAuth()` / `startH5RedirectAuth()`，不掌握任何 SDK / 接口细节。 |
| `src/style.css` | 页面样式（手写 CSS，无框架依赖）。 |

## 一、运行演示

环境要求：Node.js 18 及以上（含 npm）。

```bash
npm install
npm run dev
```

启动后访问终端输出的本地地址（默认 `http://localhost:5173`），建议开浏览器移动端模拟模式查看。`.env` 已填好测试环境配置，开箱即用。

操作：点击「开始身份验证」→ 在安全验证窗口内输入身份证后四位、勾选协议并提交 → 回到页面查看脱敏身份信息与原始返回值。

### .env 配置

| 变量 | 说明 |
| --- | --- |
| `VITE_SDK_URL` | 我方 JSSDK 静态资源地址 |
| `VITE_SESSION_API_BASE` | 会话接口前缀；开发态走 vite 代理（见 `vite.config.js`） |
| `VITE_API_PROXY_TARGET` | 本地开发代理目标，即我方测试环境域名 |
| `VITE_APP_ID` / `VITE_APP_KEY` | 测试环境演示凭证。正式接入时 `appKey` 必须保管在业务方服务端，严禁放前端 |
| `VITE_SDK_APP_ID` | `createSdk()` 的客户接入 appId（0.2.0 起必传）；与 `VITE_APP_ID` 同一发放体系但用途不同，仅用于授权页内容分流 |
| `VITE_AUTH_PAGE_URL` | 我方托管授权页地址（H5 转跳目标） |
| `VITE_REDIRECT_CALLBACK_URL` | 可选：H5 转跳回跳地址；留空则运行时取当前站点 origin + `/callback.html` |

## 二、引入与调用

### 引入方式

UMD（`<script>` 标签引入，挂载全局对象 `window.AssistanceMobileAuth`）：

```html
<script src="https://ginkgo.chinaums.com/sign-pay-pro/assist/assistance-mobile-auth/assistance-mobile-auth.umd.cjs"></script>
<script>
  const sdk = window.AssistanceMobileAuth.createAssistanceMobileAuthSdk({ /* options */ })
</script>
```

ESM（模块化引入）：

```js
import { createAssistanceMobileAuthSdk } from 'https://ginkgo.chinaums.com/sign-pay-pro/assist/assistance-mobile-auth/assistance-mobile-auth.js'

const sdk = createAssistanceMobileAuthSdk({ /* options */ })
```

本演示采用 ESM：在 `src/assistanceAuth.js` 步骤一用动态 `import()` 按需加载（地址取 `VITE_SDK_URL`），页面无需在 HTML 中预先引入。

### 调用流程

```js
// 1) 业务方服务端用 appId/appKey 调 /create，拿到一次性 launchToken 下发前端
const { launchToken } = await createSessionOnServer()

// 2) 前端创建实例并拉起安全验证窗口；open() 返回 Promise
const sdk = createAssistanceMobileAuthSdk({ appId: 'demo-brand-001', authWindowTitle: '身份验证', onErrorNotice })
const result = await sdk.open({ launchToken, scene: 'native-number' })
//    result: { status:'success', authResultId, authCode, authToken? }

// 3) 业务方服务端用 appId/appKey + 结果凭证调 /result，换取脱敏身份信息
const identity = await queryResultOnServer(result)
//    identity: { displayName, maskedMobile, maskedIdCard }
```

> `appKey`、`/create`、`/result` 都应在业务方服务端完成，前端只接收 `launchToken`、只上送结果凭证。本演示前端直调接口仅为演示便利，完整写法见 `src/assistanceAuth.js`。

## 二·五、H5 转跳方式

与 JSSDK 弹窗方式二选一，按接入习惯任选其一：

- **JSSDK 弹窗方式**：引入我方 JSSDK，无需离开当前页面即可在我方安全验证窗口内完成，完成后直接拿到结果凭证（见上文）。
- **H5 转跳方式**：不引入 SDK、不弹窗，业务页整页跳转到我方托管授权页；用户在授权页完成验证后，浏览器带 `authToken` 回跳到业务方回跳页，再换取脱敏身份信息。接入核心见 `src/h5Redirect.js`，回跳落地页见 `callback.html` / `src/callback.js`。

### 调用流程

```js
// 发起页（src/h5Redirect.js → startH5RedirectAuth）
// 1) 业务方服务端用 appId/appKey 调 /create，带 redirectUrl=回跳页绝对地址，拿到 launchToken
const { launchToken } = await postJson('/create', { appId, appKey, scene: 'native-number', redirectUrl })
//    redirectUrl 例：new URL('callback.html', window.location.origin).toString()
//    响应里 redirectMode 为 true，表示走转跳模式

// 2) 整页跳转到我方托管授权页，仅带 launchToken
window.location.assign(`${AUTH_PAGE_URL}?launchToken=${encodeURIComponent(launchToken)}`)
//    AUTH_PAGE_URL = https://ginkgo.chinaums.com/sign-pay-pro/auth

// —— 用户在我方托管授权页完成验证后，浏览器带 ?authToken=<token> 回跳到 redirectUrl ——

// 回跳页（src/h5Redirect.js → resolveRedirectResult）
// 3) 从本页 URL 读 authToken
const authToken = new URLSearchParams(window.location.search).get('authToken')

// 4) 业务方服务端用 appId/appKey + authToken 调 /result，换取脱敏身份信息
const identity = await postJson('/result', { appId, appKey, authToken })
//    identity: { displayName, maskedMobile, maskedIdCard }
```

### 回跳契约参数

| 参数 | 位置 | 说明 |
| --- | --- | --- |
| `redirectUrl` | `/create` 请求字段 | 验证完成后用户回跳的**绝对地址**，我方会在其后追加 `?authToken=<token>`；H5 转跳方式必填 |
| 授权页 URL | 跳转目标 | `https://ginkgo.chinaums.com/sign-pay-pro/auth`，仅在 query 携带 `launchToken` |
| `authToken` | 回跳页 query | 我方在回跳地址后追加，回跳页据此调 `/result` 换取身份信息 |

> 同样地，`appKey`、`/create`、`/result` 都应在业务方服务端完成；本演示前端直调接口仅为演示便利。

## 三、createAssistanceMobileAuthSdk(options)

| 选项 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `appId` | `string` | 是 | 客户接入 appId（0.2.0 起必传）；与 BFF 发放同一体系，此处仅用于 iframe 授权页内容分流，不做认证；未匹配到 profile 时展示默认页 |
| `authWindowTitle` | `string` | 否 | 安全验证窗口的标题，建议按业务场景设置（如「身份验证」）；不传时使用我方默认标题 |
| `onReady` | `() => void` | 否 | 安全验证窗口加载就绪时回调 |
| `onSuccess` | `(payload) => void` | 否 | 验证成功（终态），payload 与 `open()` resolve 的结果一致 |
| `onCancel` | `(payload) => void` | 否 | 用户取消验证（终态），见下方 payload 说明 |
| `onError` | `(payload) => void` | 否 | 终态错误：流程结束，验证窗口自动关闭，`open()` 的 Promise reject |
| `onErrorNotice` | `(payload) => void` | 否 | **非终态**实时提示：验证窗口保持打开，用户可在窗口内重试；可能触发多次，Promise 不会因此 reject |
| `onClose` | `() => void` | 否 | 安全验证窗口关闭（未完成验证）时回调 |

### 实例方法

| 方法 | 说明 |
| --- | --- |
| `open(request?)` | 打开我方托管的安全验证窗口，返回 `Promise<成功 payload>`，见下方「四、生命周期」 |
| `openVerification(request?)` | `open()` 的等价别名 |
| `close()` | 主动关闭安全验证窗口；若流程未完成，`open()` 的 Promise 将以 `'Assistance auth closed'` reject |
| `destroy()` | 销毁实例并清理资源，页面卸载时建议调用 |

### open(request) 参数

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `launchToken` | `string` | 是（实际使用中必传） | 由业务方服务端通过 `/create` 获取的一次性启动凭证 |
| `scene` | `'native-number'` | 否 | 验证场景，当前固定传 `'native-number'`（本机号码认证） |
| `requestId` | `string` | 否 | 业务方自定义请求标识，便于对账与排查 |

### 回调 payload 字段

成功 payload（`onSuccess` / `open()` resolve）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `'success'` | 固定为 `'success'` |
| `message` | `string?` | 结果说明文案 |
| `authResultId` | `string` | 结果标识，与 `authCode` 配套换取身份信息 |
| `authCode` | `string` | 结果校验码 |
| `authToken` | `string?` | 结果令牌，存在时可单独换取身份信息 |
| `mock` | `boolean?` | 是否为测试环境模拟结果（仅测试环境可能出现） |

错误 payload（`onError`，终态）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `string?` | 错误码 |
| `message` | `string` | 错误说明 |

实时提示 payload（`onErrorNotice`，非终态）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `string?` | 提示码 |
| `message` | `string` | 提示说明。收到该回调时验证窗口仍保持打开，用户可在窗口内重试 |

取消 payload（`onCancel`）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `message` | `string` | 取消说明 |
| `lastError` | `{ code?: string, message: string }?` | 存在时表示用户是在看到错误提示后关闭窗口的，可用于区分「直接取消」与「失败后放弃」 |

## 四、生命周期

调用 `sdk.open(request)` 后，一次验证的回调与 Promise 时序如下：

1. `onReady`：安全验证窗口加载就绪。
2. 用户操作过程中，如出现可恢复错误（非终态）：触发 `onErrorNotice(payload)`，窗口保持打开、用户可重试，**可触发多次**，`open()` 的 Promise 不结束。
3. 进入以下任一终态，流程结束：

| 终态 | 回调 | `open()` Promise |
| --- | --- | --- |
| 验证成功 | `onSuccess(payload)` | resolve（结果为成功 payload） |
| 用户取消 | `onCancel(payload)` | reject(`Error('Assistance auth cancelled')`) |
| 窗口关闭（含调用 `close()`） | `onClose()` | reject(`Error('Assistance auth closed')`) |
| 终态错误（窗口自动关闭） | `onError(payload)` | reject(`Error('Assistance auth error: <message>')`) |

回调与 `open()` 的 Promise 拿到的数据一致，按团队习惯**二选一驱动主流程**即可。推荐做法见 `src/assistanceAuth.js`：以 `await sdk.open()` 驱动，在 `catch` 中按 `error.message` 是否含 `cancelled` / `closed` 区分「取消」与「失败」。

## 五、服务端接口参考

接口基础地址（测试环境）：`https://ginkgo.chinaums.com/sign-pay-pro/api/sdk/session`，两个接口均为 `POST`、JSON 收发（`Content-Type: application/json`）。

### 1. 创建验证会话 `/create`

请求字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `appId` | `string` | 是 | 业务方接入标识 |
| `appKey` | `string` | 是 | 业务方接入密钥（仅限服务端使用） |
| `requestId` | `string` | 否 | 业务方自定义请求标识 |
| `scene` | `'native-number'` | 否 | 验证场景；`/create` 不校验也不使用该字段（场景由前端 `open()` 透传），当前固定传 `'native-number'` |
| `redirectUrl` | `string` | 可选 | H5 转跳方式必填；验证完成后用户回跳的绝对地址，我方会在其后追加 `?authToken=<token>`。传该字段后响应进入转跳模式 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `kind` | `'created'` | 固定为 `'created'` |
| `launchToken` | `string` | 一次性启动凭证，下发给前端 |
| `expiresInSeconds` | `number` | 凭证有效期（秒） |
| `message` | `string` | 结果说明 |
| `redirectMode` | `boolean` | 是否为 H5 转跳模式；传入 `redirectUrl` 时为 `true`，标识本次会话走整页转跳 |

```bash
curl -X POST 'https://ginkgo.chinaums.com/sign-pay-pro/api/sdk/session/create' \
  -H 'Content-Type: application/json' \
  -d '{
    "appId": "10037e6f9512b0b10195401ca57901d1",
    "appKey": "YOUR_CUSTOMER_APP_KEY",
    "scene": "native-number"
  }'
```

### 2. 查询认证结果 `/result`

请求字段（凭证二选一：`authToken`，或 `authResultId` + `authCode`）：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `appId` | `string` | 是 | 业务方接入标识 |
| `appKey` | `string` | 是 | 业务方接入密钥（仅限服务端使用） |
| `authToken` | `string` | 二选一 | 验证成功返回的结果令牌 |
| `authResultId` | `string` | 二选一 | 验证成功返回的结果标识，与 `authCode` 配套 |
| `authCode` | `string` | 二选一 | 验证成功返回的结果校验码，与 `authResultId` 配套 |

响应字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `kind` | `'identity-ready'` | 固定为 `'identity-ready'` |
| `message` | `string` | 结果说明 |
| `identity.displayName` | `string` | 姓名（脱敏） |
| `identity.maskedMobile` | `string` | 手机号（脱敏） |
| `identity.maskedIdCard` | `string` | 身份证号（脱敏） |
| `mock` | `boolean` | 是否为测试环境模拟数据 |

```bash
curl -X POST 'https://ginkgo.chinaums.com/sign-pay-pro/api/sdk/session/result' \
  -H 'Content-Type: application/json' \
  -d '{
    "appId": "10037e6f9512b0b10195401ca57901d1",
    "appKey": "YOUR_CUSTOMER_APP_KEY",
    "authToken": "<open() 成功返回的 authToken>"
  }'
```

## 六、正式接入注意事项

1. **`appKey` 必须保管在业务方服务端**，严禁出现在前端代码、配置或浏览器请求中；本演示前端直调接口仅为演示便利。
2. **`/create` 与 `/result` 应由业务方服务端调用**：前端只接收 `launchToken`、只上送结果凭证。
3. **`launchToken` 是一次性短时效凭证**：用后即失效、过期需重新创建，不应缓存复用。
4. **域名与回调白名单**：正式接入前请按我方要求提供业务域名等信息完成白名单配置；本地开发可参照 `vite.config.js` 用代理解决跨域，正式环境由业务方自有域名直接调用我方服务端接口（或由业务方服务端转发）。
5. 测试环境返回的身份信息可能为模拟数据（响应中 `mock` 为 `true`），正式环境以真实认证结果为准。
