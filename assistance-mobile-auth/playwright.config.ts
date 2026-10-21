import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = Number(process.env.PLAYWRIGHT_PORT ?? '4173')
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`
const mobileAuthMode = process.env.PLAYWRIGHT_MOBILE_AUTH_MODE === 'live' ? 'live' : 'stub'

const mobileAuthEnvKeys = [
  'VITE_MOBILE_AUTH_SDK_ENABLED',
  'VITE_MOBILE_AUTH_SDK_MODE',
  'VITE_MOBILE_AUTH_SDK_JS_URL',
  'VITE_MOBILE_AUTH_SDK_CSS_URL',
  'VITE_MOBILE_AUTH_DEBUG_ENTRY',
  'VITE_MOBILE_AUTH_APP_ID',
  'VITE_MOBILE_AUTH_SIGN',
  'VITE_MOBILE_AUTH_TRACE_ID',
  'VITE_MOBILE_AUTH_TIMESTAMP',
  'VITE_MOBILE_AUTH_AUTH_TYPE',
  'VITE_MOBILE_AUTH_SCOPE',
] as const

function createSharedServerEnv() {
  const env = { ...process.env } as Record<string, string>

  for (const key of mobileAuthEnvKeys) {
    delete env[key]
  }

  return {
    ...env,
    VITE_SFT_PUBLIC_BASE_URL: new URL('/sign-pay-pro/', baseURL).toString(),
  }
}

function pickAllowedLiveEnv() {
  const env: Record<string, string> = {}

  for (const key of mobileAuthEnvKeys) {
    const value = process.env[key]

    if (typeof value === 'string' && value.length > 0) {
      env[key] = value
    }
  }

  return env
}

function createWebServerEnv() {
  const sharedEnv = createSharedServerEnv()

  if (mobileAuthMode === 'stub') {
    return {
      ...sharedEnv,
      VITE_MOBILE_AUTH_SDK_ENABLED: 'true',
      VITE_MOBILE_AUTH_SDK_MODE: 'live',
      VITE_MOBILE_AUTH_SDK_JS_URL: '/__mobile_auth_stub__.js',
      VITE_MOBILE_AUTH_DEBUG_ENTRY: 'true',
    }
  }

  return {
    ...sharedEnv,
    ...pickAllowedLiveEnv(),
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL,
    viewport: { width: 390, height: 844 },
    trace: mobileAuthMode === 'live' ? 'on-first-retry' : 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host ${host} --port ${port}`,
    url: baseURL,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === 'true',
    env: createWebServerEnv(),
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
})
