import { defineConfig, type Plugin } from 'vite'
import path from 'node:path'
import { copyFileSync, mkdirSync } from 'node:fs'
import { customRuntimeBundlePlugin } from './scripts/custom-page/runtimeBundlePlugin'
import { productionConsoleCalls } from './scripts/productionConsole'

const root = import.meta.dirname
const suppliedSdk = path.resolve(root, 'src/customers/duodian-health/suppliedSdk.ts')
// Match actual source import strings, including imports made by facade/resource modules.
export const duodianRuntimeAliases: Record<string, string> = {
  '../sdk/authParamsProvider': suppliedSdk,
  '../sdk/config': suppliedSdk,
  './config': suppliedSdk,
}

function copyVendorCss(): Plugin {
  let target: string | undefined
  return { name: 'duodian-vendor-css', configResolved(config) {
    if (config.build.write) target = path.resolve(config.root, config.build.outDir, 'vendor')
  }, closeBundle() {
    if (!target) return
    mkdirSync(target, { recursive: true })
    copyFileSync(path.resolve(root, 'src/wrapper/vendor/new-control-style.css'), path.join(target, 'new-control-style.css'))
  } }
}

export default defineConfig({
  root, envDir: false, envPrefix: [], publicDir: false,
  esbuild: { pure: productionConsoleCalls },
  define: {
    __STATIC_RESOURCE_RELEASE__: 'true',
    __DUODIAN_BOTTOM_SHEET__: 'true',
    __CUSTOM_LOADER_URL__: JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro-temp/assist/0.3.0/custom-verification.html'),
    'import.meta.env.VITE_SFT_PUBLIC_BASE_PATH': JSON.stringify('/sign-pay-pro-temp/'),
    'import.meta.env.VITE_SFT_PUBLIC_BASE_URL': JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro-temp/'),
  },
  resolve: { alias: { '@': path.resolve(root, 'src'), ...duodianRuntimeAliases } },
  plugins: [customRuntimeBundlePlugin({ runtimeEntry: 'src/customers/duodian-health/runtime.ts',
    runtimeAliases: duodianRuntimeAliases }), copyVendorCss()],
  build: { target: 'chrome98', outDir: 'dist-duodian-health', emptyOutDir: true,
    lib: { entry: path.resolve(root, 'src/customers/duodian-health/index.ts'), name: 'AssistanceMobileAuth',
      formats: ['es', 'umd'], fileName: format => `assistance-mobile-auth.duodian-health.0.3.0.${format === 'es' ? 'js' : 'umd.cjs'}` },
  },
})
