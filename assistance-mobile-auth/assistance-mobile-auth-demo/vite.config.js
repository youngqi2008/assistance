import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, loadEnv } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 本地开发用代理解决跨域，正式接入时业务方自有域名直接调用我方服务端接口（或由业务方服务端转发）。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'https://ginkgo.chinaums.com'

  const proxy = {
    '/sign-pay-pro': {
      target: proxyTarget,
      changeOrigin: true,
    },
  }

  return {
    // 多页应用：两个入口——index.html（发起页）与 callback.html（H5 转跳回跳落地页）。
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          callback: resolve(__dirname, 'callback.html'),
        },
      },
    },
    server: { proxy },
    preview: { proxy },
  }
})
