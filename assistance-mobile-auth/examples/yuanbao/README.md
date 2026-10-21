# 完整元保自定义授权页

这是移动认证 JSSDK 0.3.0 的完整客户模板。外观由 HTML/CSS/JS 和模板标记决定，同一模板可以用于不同业务 AppId；AppId 仍决定业务身份和相应协议内容。

将 `index.html`、`style.css`、`page.js`、`style-option.json` 和 `assets/` 放在同一个可访问目录。宿主读取文件内容，并将 HTML、CSS、JS 通过 `customPage` 传入；`baseUrl` 是模板资产目录的完整 URL。也可用 `customPage.url` 指定 HTML URL。跨域 HTML/CSS/字体资源需要相应 CORS 支持，URL 模式未传 `baseUrl` 时以最终 HTML 响应 URL 为基准。

```js
const [html, css, js, styleOption] = await Promise.all([
  fetch(new URL('index.html', templateBase)).then(r => r.text()),
  fetch(new URL('style.css', templateBase)).then(r => r.text()),
  fetch(new URL('page.js', templateBase)).then(r => r.text()),
  fetch(new URL('style-option.json', templateBase)).then(r => r.json()),
]);
const exampleOptions = { closable: true, useCustomKeyboard: true, agreements: callerAgreements };
const sdk = AssistanceMobileAuth.createAssistanceMobileAuthSdk({
  appId: issuedAppId, authParams: signedMobileParams,
  ...exampleOptions,
  customPage: {
    html, css,
    js: 'window.YuanbaoExampleConfig=' + JSON.stringify(exampleOptions) + ';\n' + js,
    baseUrl: templateBase,
  },
  styleOption,
  onErrorNotice: notice => showNotice(notice.message),
});
const result = await sdk.open({ requestId });
```

`style-option.json` 必须通过 `options.styleOption` 传入，提供官方按钮文案“同意并登录”和支持的协议/按钮外观。模板 CSS 提供渐变、阴影、字重和布局。请保留真实手机号、官方隐私协议、品牌及当前流程需要的授权控件；按钮的点击仍由官方 SDK 元素承担。

`YuanbaoExampleConfig` 是此示例自身的一次性配置，脚本读取后删除。宿主把 `closable`、`useCustomKeyboard`、`agreements` 同时传给 SDK 和示例脚本，使模板关闭入口、原生输入/屏幕键盘与追加协议勾选保持一致。它不属于 JSSDK 公共接口；自定义客户页可以自行实现同类配置。追加协议通过 `setCallerAgreementChecked(index, checked)` 上报，协议名称使用文本节点显示，链接仍是调用方给出的地址。

页面脚本只使用局部 `AssistanceCustomPage` 的 `register`、`setIdLast4`、`setCallerAgreementChecked`、`close`。数字/X/删除、收起/再编辑、完整输入后的手势与错误提示由模板处理；提交和成功判定由官方 SDK 与认证运行时处理。`dispose` 解除页面监听。客户 JS 在认证 iframe 的 origin 下运行，应当是接入方信任的代码。

示例宿主为 `test-custom-page-0.3.0.html`。请填写真实发放的业务 AppId 和完整已签名移动认证参数。示例不会生成签名、模拟手机号或制造成功结果。自动化浏览器中的官方服务替身用于交互回归，真实号码、官方控件与认证能力仍须在真机网络环境联调。
