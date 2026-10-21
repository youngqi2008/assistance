# 通用 JSSDK 测试环境简单 Demo

- umd.html：script 加载 UMD，通过 window.AssistanceMobileAuth 获取工厂。
- esm.html：script type="module" 中 import ESM 工厂。
- 每个页面均提供弹窗、指定容器内嵌 iframe 两种方式，以及关闭按钮。

将文件放到你已有的 HTTP/HTTPS 页面服务中访问，填写已分配的 appId。不要用 file:// 验证真实认证链路。此目录不需要 npm 安装或构建。

两种展示均调用 sdk.open({ scene: 'native-number' })。
弹窗使用 display:'modal'；内嵌使用 display:'inline' 与 renderTo:'#auth-container'。
SDK 创建 iframe，业务方无需手写 iframe。当前通用包默认按内容调整内嵌 iframe 高度；示例容器提供最小高度。弹窗打开后，通过弹窗内的关闭入口退出；页面上的关闭按钮适用于内嵌场景或业务程序调用。

示例不新增 authParams 或后端接口；认证成功后，在代码注释处接入你原有的业务结果处理。不要在页面或日志输出 token 等敏感字段。
真实认证请用已开通的 appId 与支持的移动网络环境。页面引用的是测试环境通用包，未指定固定客户样式。
