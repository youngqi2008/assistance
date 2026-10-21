import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.', testMatch: 'duodian-health032-release.spec.ts',
  workers: 1, timeout: 45000,
  outputDir: '../test-results/duodian032-browser',
  use: { trace: 'off', screenshot: 'only-on-failure', video: 'off' },
  projects: [{ name: 'chromium-390x844', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } }],
})
