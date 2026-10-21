import { defineConfig } from '@playwright/test'

const external = process.env.PLAYWRIGHT_LIVE_HOST_URL
const port = Number(process.env.PLAYWRIGHT_FORMAL_HOST_PORT ?? '4197')
export default defineConfig({
  testDir: './tests',
  testMatch: 'duodian-health-formal-host.spec.ts',
  outputDir: 'test-results/duodian-formal-host',
  workers: 2,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: external ? undefined : {
    command: `node scripts/custom-page/serve-custom-temp.mjs tests/manual ${port}`,
    url: `http://127.0.0.1:${port}/sign-pay-pro-temp/test-duodian-health-formal-0.3.0.html`,
    reuseExistingServer: false,
  },
  projects: ['chromium', 'webkit'].flatMap(browserName => [
    { name: `${browserName}-390x844`, use: { browserName: browserName as 'chromium' | 'webkit', viewport: { width: 390, height: 844 } } },
    { name: `${browserName}-320x568`, use: { browserName: browserName as 'chromium' | 'webkit', viewport: { width: 320, height: 568 } } },
  ]),
})
