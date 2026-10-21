import { defineConfig } from 'vite'
import path from 'node:path'

const root = path.resolve(__dirname, 'src/custom-loader')

export default defineConfig({
  root,
  base: '/sign-pay-pro-temp/assist/0.3.0/',
  publicDir: false,
  define: { __DUODIAN_IFRAME_AUTO_PARAMS__: 'false' },
  build: {
    target: 'chrome98',
    outDir: path.resolve(__dirname, 'dist-custom-loader'),
    emptyOutDir: true,
    rollupOptions: { input: path.resolve(root, 'custom-verification.html') },
  },
})
