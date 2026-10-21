import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.', testMatch: 'duodian-health031-release.spec.ts',
  fullyParallel: false, workers: 1, timeout: 45000,
  outputDir: '../test-results/duodian031-browser',
  // Provider arguments contain signatures: never persist browser protocol traces.
  use: { trace: 'off', screenshot: 'only-on-failure', video: 'on' },
  projects: ['chromium', 'webkit'].flatMap(browserName => [
    { width: 390, height: 844 }, { width: 320, height: 568 },
  ].map(viewport => ({
    name: browserName + '-' + viewport.width + 'x' + viewport.height,
    use: { browserName: browserName as 'chromium' | 'webkit', viewport },
  }))),
})
