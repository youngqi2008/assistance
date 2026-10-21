# 移动认证 H5 与 JSSDK

基于 React 19、TypeScript、Vite 6 与 NestJS 的移动认证接入项目。当前源码版本为 **0.3.2**，包含 H5 授权页、iframe wrapper、自定义页面运行时、客户示例和 BFF。

## 开发

使用 Node.js 22 或更新版本及 Python 3。

```sh
npm ci
cp .env.example .env
npm run dev
```

根据接入环境填写 `.env`。密钥只配置在服务端，不能写入源码或前端构建变量。示例项目位于 `assistance-mobile-auth-demo/`；演示接入也需要自行配置服务端凭据。

## 构建与测试

```sh
npm run build:h5
npm run build:wrapper
npm run build:bff
npm run build:custom-temp
npm run build:duodian-health032
npm test -- --run
npm run test:bff
npx playwright test --config playwright.custom-page.config.ts
```

自定义页面浏览器回归先准备本地产物：

```sh
VITE_SFT_PUBLIC_BASE_URL=http://127.0.0.1:4183/sign-pay-pro-temp/ npm run build:custom-temp
node --import tsx scripts/custom-page/build-test-runtime-variants.mjs
CUSTOM_PAGE_TEST_DIST=dist-custom-compat npx playwright test --config playwright.custom-page.config.ts
```

浏览器测试默认使用模拟运营商响应；`npm run test:e2e -- <测试文件>` 可选择具体场景。发布产物测试需要先构建并指定本地产物目录。真实手机认证需要相应业务环境及服务凭据。

## 静态发布

```sh
npm run release:static -- --bump none
```

输出为 `release/static-mobile-auth-0.3.2/` 及同名压缩包，部署前缀为 `/sign-pay-pro/`。发布脚本会组装 H5、ESM/UMD wrapper、版本化资源和 nginx 配置；BFF 单独部署。生产环境使用中国移动官方 CDN 的 JSSDK 1.0.6。

`release-frozen/` 包含当前发布命令依赖的兼容资源。所有目录继续通过已有逐文件校验验证；维护资源时需同步已有校验清单，并保留各版本目录及公共路径。

静态 H5 使用 `src/static` 为构建根目录；请保留 `src/styles/globals.css` 中的 `@source "../";`，以确保授权页样式被扫描。

## 目录

- `src/`：H5、SDK 适配、wrapper、自定义页面及内置协议。
- `bff/`：会话、身份核验与后端对接服务。
- `scripts/`：构建、打包、调试与协议提取工具。
- `tests/`：浏览器测试与本地测试宿主。
- `examples/`：自定义页面接入示例。
- `docs/`：接入说明及协议原文。

协议内容已包含在源码中，常规构建不依赖外部 Word 文件。客户协议提取使用 `docs/1-协议原文/app-profiles/` 中的原文。更新通用协议时，将当前敏感个人信息规则、个人信息收集清单和用户认证服务隐私政策放入 `docs/1-协议原文/`，文件名见 `scripts/extract-agreement-docx.py`；这些外部提供的原文不随仓库分发。

## 接入文档

- [JSSDK 接入说明](docs/assistance-mobile-auth-jssdk-integration.md)
- [后端 check/query 调用说明](docs/chinaums-check-query-call-guide.md)
