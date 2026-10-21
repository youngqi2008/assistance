import { productionConsoleCalls } from './scripts/productionConsole'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { customRuntimeBundlePlugin } from './scripts/custom-page/runtimeBundlePlugin'

const projectRoot = __dirname
const staticRoot = path.resolve(projectRoot, 'src/static')

function resolveStaticViteBase() {
  const raw = process.env.VITE_SFT_PUBLIC_BASE_PATH?.trim() || '/sign-pay-pro/'
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`
  return `${withLeadingSlash.replace(/\/+$/, '')}/`
}

export default defineConfig(({ command }) => ({
  esbuild: { pure: command === 'build' ? productionConsoleCalls : [] },
  root: staticRoot,
  base: resolveStaticViteBase(),
  publicDir: path.resolve(staticRoot, 'public'),
  plugins: [react(), tailwindcss(), ...(process.env.VITEST ? [] : [customRuntimeBundlePlugin()])],
  define: {
    __STATIC_RESOURCE_RELEASE__: 'true',
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, './src'),
      ...(process.env.VITEST ? { 'virtual:assistance-custom-runtime': path.resolve(projectRoot, 'src/test/fixtures/customRuntimeSource.ts') } : {}),
    },
  },
  build: {
    target: 'chrome98',
    outDir: path.resolve(projectRoot, 'dist-static'),
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: path.resolve(projectRoot, 'src/test/setup.ts'),
  },
}))
