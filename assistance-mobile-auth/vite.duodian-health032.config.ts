import { defineConfig, type Plugin } from 'vite'
import path from 'node:path'
import customerConfig from './vite.duodian-health031.config'
import { duodianRuntimeAliases } from './vite.duodian-health.config'
import { customRuntimeBundlePlugin } from './scripts/custom-page/runtimeBundlePlugin'

// Match the complete import, including ?inline, in both independently built trees.
export const duodian032RuntimeAliases = {
  ...duodianRuntimeAliases,
  './assets/identity.jpg?inline':
    path.resolve(import.meta.dirname, 'src/customers/duodian-health/assets/identity-0.3.2.jpg') + '?inline',
}

export default defineConfig({
  ...customerConfig,
  resolve: { ...customerConfig.resolve, alias: { '@': path.resolve(import.meta.dirname, 'src'), ...duodian032RuntimeAliases } },
  plugins: customerConfig.plugins!.map(plugin => (plugin as Plugin).name === 'assistance-custom-runtime-bundle'
    ? customRuntimeBundlePlugin({ runtimeEntry: 'src/customers/duodian-health/runtime.ts', runtimeAliases: duodian032RuntimeAliases })
    : plugin),
  define: {
    ...customerConfig.define,
    __CUSTOM_LOADER_URL__: JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/custom-verification.html'),
    'import.meta.env.VITE_SFT_PUBLIC_BASE_PATH': JSON.stringify('/sign-pay-pro/assist/0.3.2/'),
    'import.meta.env.VITE_SFT_PUBLIC_BASE_URL': JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/'),
  },
  build: {
    ...customerConfig.build,
    outDir: 'dist-duodian-health032',
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/customers/duodian-health/index.ts'),
      name: 'AssistanceMobileAuth', formats: ['es', 'umd'],
      fileName: format => `assistance-mobile-auth.duodian-health.0.3.2.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
  },
})
