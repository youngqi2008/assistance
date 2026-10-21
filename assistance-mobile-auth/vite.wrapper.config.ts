import { productionConsoleCalls } from './scripts/productionConsole'
import { defineConfig, type Plugin } from 'vite'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { customRuntimeBundlePlugin } from './scripts/custom-page/runtimeBundlePlugin'

const wrapperOutDir = 'dist-wrapper'
const isStaticResourceRelease = process.env.VITE_STATIC_RESOURCE_RELEASE === '1'
// Prod (1.0.6) JS is loaded at runtime from the official CDN via <script src=...> in
// src/wrapper/index.ts:loadRemoteOfficialJssdk(); CSS is shipped as a
// caller-required-local-asset alongside the wrapper bundle.
const vendorFiles = ['new-control-style.css'] as const

function copyWrapperVendorAssets(): Plugin {
  let targetRoot = path.resolve(__dirname, wrapperOutDir)
  return {
    name: 'copy-wrapper-vendor-assets',
    configResolved(config) { targetRoot = path.resolve(config.root, config.build.outDir) },
    closeBundle() {
      const sourceDir = path.resolve(__dirname, 'src/wrapper/vendor')
      const targetDir = path.resolve(targetRoot, 'vendor')

      mkdirSync(targetDir, { recursive: true })

      for (const fileName of vendorFiles) {
        const sourcePath = path.resolve(sourceDir, fileName)

        if (!existsSync(sourcePath)) {
          throw new Error(`Wrapper vendor asset missing: ${sourcePath}`)
        }

        copyFileSync(sourcePath, path.resolve(targetDir, fileName))
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  esbuild: { pure: command === 'build' ? productionConsoleCalls : [] },
  define: {
    __STATIC_RESOURCE_RELEASE__: isStaticResourceRelease ? 'true' : 'false',
    ...(isStaticResourceRelease && process.env.VITE_SFT_PUBLIC_BASE_URL ? {
      __CUSTOM_LOADER_URL__: JSON.stringify(new URL('custom-verification.html', process.env.VITE_SFT_PUBLIC_BASE_URL).href),
    } : {}),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [customRuntimeBundlePlugin(), copyWrapperVendorAssets()],
  build: {
    target: 'chrome98',
    outDir: 'dist-wrapper',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/wrapper/index.ts'),
      name: 'AssistanceMobileAuth',
      fileName: 'assistance-mobile-auth',
      formats: ['es', 'umd'],
    },
  },
}))
