import { productionConsoleCalls } from './scripts/productionConsole'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { customRuntimeBundlePlugin } from './scripts/custom-page/runtimeBundlePlugin'

function resolveViteBase() {
  const raw = process.env.VITE_SFT_PUBLIC_BASE_PATH?.trim() || '/sign-pay-pro/'
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`
  return `${withLeadingSlash.replace(/\/+$/, '')}/`
}

export default defineConfig(({ command }) => ({
  esbuild: { pure: command === 'build' ? productionConsoleCalls : [] },
  base: resolveViteBase(),
  publicDir: path.resolve(__dirname, 'src/static/public'),
  plugins: [react(), tailwindcss(), ...(process.env.VITEST ? [] : [customRuntimeBundlePlugin()])],
  define: {
    __STATIC_RESOURCE_RELEASE__: 'false',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ...(process.env.VITEST ? { 'virtual:assistance-custom-runtime': path.resolve(__dirname, 'src/test/fixtures/customRuntimeSource.ts') } : {}),
    },
  },
  build: {
    target: 'chrome98',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
}))
