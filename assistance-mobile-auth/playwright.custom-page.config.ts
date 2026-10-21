import { defineConfig, devices } from '@playwright/test'

const dist = process.env.CUSTOM_PAGE_TEST_DIST ?? 'dist-custom-temp'
const quotedDist = `'${dist.replaceAll("'", "'\\''")}'`
const baseURL = 'http://127.0.0.1:4183/sign-pay-pro-temp/'

export default defineConfig({
  testDir: './tests', testMatch: 'custom-page*.spec.ts', fullyParallel: true,
  use: { baseURL, viewport: { width: 390, height: 844 }, trace: 'retain-on-failure' },
  webServer: {
    command: `node scripts/custom-page/serve-custom-temp.mjs ${quotedDist} 4183`,
    url: `${baseURL}assist/0.3.0/custom-verification.html`, reuseExistingServer: false,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }],
})
