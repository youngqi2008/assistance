import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.', testMatch: 'duodian-health-formal-release.spec.ts',
  fullyParallel: false, workers: 1, timeout: 45000,
  outputDir: '../test-results/duodian-formal-release',
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: ['chromium', 'webkit'].flatMap(browserName => [
    { width: 390, height: 844 }, { width: 320, height: 568 },
  ].map(viewport => ({
    name: browserName + '-' + viewport.width + 'x' + viewport.height,
    use: { browserName: browserName as 'chromium' | 'webkit', viewport },
  }))),
})
