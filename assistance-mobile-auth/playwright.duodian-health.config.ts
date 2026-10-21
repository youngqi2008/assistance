import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4184/sign-pay-pro-temp/'
export default defineConfig({
  testDir: './tests', testMatch: 'duodian-health.spec.ts', fullyParallel: false, workers: 1,
  outputDir: 'test-results/duodian-health-runs', timeout: 60000,
  use: { baseURL, viewport: { width: 390, height: 844 }, trace: 'retain-on-failure', video: 'on' },
  webServer: { command: 'node scripts/custom-page/serve-custom-temp.mjs dist-duodian-health-temp 4184',
    url: `${baseURL}test-duodian-health-0.3.0.html`, reuseExistingServer: false },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }],
})
