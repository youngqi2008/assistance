import { defineConfig } from '@playwright/test'

const dist = process.env.DUODIAN_TEST_DIST ?? 'dist-duodian-health-temp'
const quotedDist = `'${dist.replaceAll("'", "'\\''")}'`

export default defineConfig({
  testDir: './tests', testMatch: 'duodian-health-official-renderer.spec.ts',
  workers: 1, fullyParallel: false, timeout: 45000,
  outputDir: process.env.DUODIAN_OFFICIAL_OUTPUT ?? 'test-results/duodian-submit-duodian-official/official',
  use: { trace: 'retain-on-failure', video: 'on' },
  webServer: process.env.PLAYWRIGHT_LIVE_HOST_URL ? undefined : {
    command: `node scripts/custom-page/serve-custom-temp.mjs ${quotedDist} 4184`,
    url: 'http://127.0.0.1:4184/sign-pay-pro-temp/test-duodian-health-0.3.0.html',
    reuseExistingServer: false,
  },
  projects: ['chromium', 'webkit'].flatMap(browserName => [
    { width: 390, height: 844 }, { width: 320, height: 568 },
  ].map(viewport => ({
    name: `${browserName}-${viewport.width}x${viewport.height}`,
    use: { browserName: browserName as 'chromium' | 'webkit', viewport },
  }))),
})
