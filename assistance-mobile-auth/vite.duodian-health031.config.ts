import { defineConfig } from 'vite'
import path from 'node:path'
import customerConfig, { duodianRuntimeAliases } from './vite.duodian-health.config'

// Preserve supplied-only aliases in both the wrapper and its embedded runtime.
export const duodian031RuntimeAliases = duodianRuntimeAliases

export default defineConfig({
  ...customerConfig,
  define: {
    ...customerConfig.define,
    __CUSTOM_LOADER_URL__: JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/custom-verification.html'),
    'import.meta.env.VITE_SFT_PUBLIC_BASE_PATH': JSON.stringify('/sign-pay-pro/assist/0.3.1/'),
    'import.meta.env.VITE_SFT_PUBLIC_BASE_URL': JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/'),
  },
  build: {
    ...customerConfig.build,
    outDir: 'dist-duodian-health031',
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/customers/duodian-health/index.ts'),
      name: 'AssistanceMobileAuth', formats: ['es', 'umd'],
      fileName: format => `assistance-mobile-auth.duodian-health.0.3.1.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
  },
})
