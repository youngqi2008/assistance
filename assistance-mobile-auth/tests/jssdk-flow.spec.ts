import { expect, test } from '@playwright/test'

import {
  completeStubbedMobileAuth,
  expectShowAuthPageCallCount,
  getVerificationFrame,
  installBusinessDemoRoutes,
  installMobileAuthSdkStub,
  installSessionRoutes,
  installMobileAssistantRoutes,
  openStubbedVerification,
  readShowAuthPageData,
  triggerShowAuthPageSuccess,
  triggerInitControlAuthReady,
  triggerInitControlError,
  waitForAssistanceSdkFactory,
  type StubbedIdentityMode,
} from './mobile-auth-flow-helpers'

type SmokeMode = 'stub' | 'live'
type LivePreflightBlockerKind =
  | 'missing-env'
  | 'sdk-resource-unreachable'
  | 'same-origin-backend-unreachable'
  | 'unsupported-live-context'

interface LivePreflightBlocker {
  kind: LivePreflightBlockerKind
  message: string
}

const jssdkFlowUrl = '/'
const smokeMode: SmokeMode = process.env.PLAYWRIGHT_MOBILE_AUTH_MODE === 'live' ? 'live' : 'stub'
const isStubMode = smokeMode === 'stub'
const liveSdkEnvKeys = [
  'VITE_MOBILE_AUTH_SDK_ENABLED',
  'VITE_MOBILE_AUTH_SDK_MODE',
  'VITE_MOBILE_AUTH_SDK_JS_URL',
] as const

function getLivePreflightBlocker(): LivePreflightBlocker | null {
  const missingEnv = liveSdkEnvKeys.filter((key) => {
    const value = process.env[key]
    return typeof value !== 'string' || value.trim() === ''
  })

  if (missingEnv.length > 0) {
    return {
      kind: 'missing-env',
      message: `Missing required live SDK env keys: ${missingEnv.join(', ')}`,
    }
  }

  if (process.env.PLAYWRIGHT_LIVE_SDK_RESOURCE_READY !== 'true') {
    return {
      kind: 'sdk-resource-unreachable',
      message: 'Live SDK resources are not confirmed reachable for this run.',
    }
  }

  if (process.env.PLAYWRIGHT_LIVE_BACKEND_READY !== 'true') {
    return {
      kind: 'same-origin-backend-unreachable',
      message: 'Same-origin backend readiness is not confirmed for this run.',
    }
  }

  if (process.env.PLAYWRIGHT_LIVE_MOBILE_CONTEXT !== 'true') {
    return {
      kind: 'unsupported-live-context',
      message: 'Meaningful live evidence still requires the approved mobile/device or whitelist context.',
    }
  }

  return null
}

async function runStubbedFlow(page: Parameters<typeof openStubbedVerification>[0], mode: StubbedIdentityMode, token: string | null) {
  const frame = await openStubbedVerification(page, mode)
  await expectShowAuthPageCallCount(frame, 1)
  const authData = await readShowAuthPageData(frame)

  await completeStubbedMobileAuth(frame, token)

  return authData
}

test('jssdk-flow live mode reports an explicit classified blocker until live prerequisites are ready', async ({ page }) => {
  test.skip(isStubMode)

  const blocker = getLivePreflightBlocker()

  if (blocker) {
    throw new Error(`[live-preflight:${blocker.kind}] ${blocker.message}`)
  }

  await page.goto(jssdkFlowUrl)
  await expect(page.getByRole('heading', { name: '订单支付' })).toBeVisible()
  await page.getByRole('button', { name: '立即支付' }).click()

  const frame = page.frameLocator('iframe[title="移动认证验证窗口"]')

  await expect(frame.getByRole('heading', { name: '确认身份信息' })).toBeVisible()
  await expect(frame.locator('#ydrzSubmitControl')).toBeAttached()
  await expect(frame.locator('#ydrzAgreementControl')).toBeAttached()
})

test('jssdk-flow returns token idLast4 and keyA to the host without launchToken session ids', async ({ page }) => {
  test.skip(!isStubMode)

  const authData = await runStubbedFlow(page, 'success', 'phase9-token')

  expect(authData).toEqual(
    expect.objectContaining({
      version: '3.0',
      appId: '300013215094',
      authType: '0',
      scope: '3ElementsAuthAssistFill',
      traceId: expect.stringMatching(/^[A-F0-9]{32}$/),
      timestamp: expect.stringMatching(/^\d{17}$/),
      sign: expect.stringMatching(/^[a-f0-9]{32}$/),
    }),
  )

  await expect(page.getByText('验证成功')).toBeVisible()
  await expect(page.getByText('phase9-token')).toBeVisible()
  await expect(page.getByText('1234')).toBeVisible()
  await expect(page.getByText('sdk-key-a')).toBeVisible()
  await expect(page.getByText('sft_result_test')).toHaveCount(0)
  await expect(page.getByText('sft_code_test')).toHaveCount(0)
  await expect(page.locator('iframe[title="移动认证验证窗口"]')).toHaveCount(0)
})

test('base page business-demo check query decrypts encrypted identity with tester SM4 key', async ({ page }) => {
  test.skip(!isStubMode)

  await installBusinessDemoRoutes(page)
  await runStubbedFlow(page, 'success', 'phase9-token')

  await page.getByLabel('SM4 密钥').fill('fda3882b14df6abb4f9142999d57cacf')
  await page.getByRole('button', { name: '调用 check' }).click()
  await expect(page.getByText('核验通过', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: '调用 query' }).click()
  await expect(page.getByText('徐三')).toBeVisible()
  await expect(page.getByText('15971413742')).toBeVisible()
  await expect(page.getByText('530125199203241234')).toBeVisible()
})

test('jssdk-flow popup completion does not invoke the legacy identity data lane', async ({ page }) => {
  test.skip(!isStubMode)

  await runStubbedFlow(page, 'pending', 'phase9-token')

  await expect(page.getByText('验证成功')).toBeVisible()
  await expect(page.getByText('phase9-token')).toBeVisible()
  await expect(page.getByText('RESULT_PENDING')).toHaveCount(0)
  await expect(page.locator('iframe[title="移动认证验证窗口"]')).toHaveCount(0)
})

test('jssdk-flow reports token-missing and ignores legacy backend mode in popup completion', async ({ page }) => {
  test.skip(!isStubMode)

  await runStubbedFlow(page, 'token-missing', null)

  await expect(page.getByText('验证失败')).toBeVisible()
  await expect(page.getByText('Assistance auth error: 本次授权未返回有效 token，请重新授权后再试。')).toBeVisible()
  await expect(page.getByText('token', { exact: true })).toHaveCount(0)

  await page.unroute('**/api/mobile-assistant/verify')
  await page.unroute('**/api/mobile-assistant/identity')

  const frame = await openStubbedVerification(page, 'backend-failed')
  await completeStubbedMobileAuth(frame, 'phase9-token')

  await expect(page.getByText('验证成功')).toBeVisible()
  await expect(page.getByText('phase9-token')).toBeVisible()
  await expect(page.locator('iframe[title="移动认证验证窗口"]')).toHaveCount(0)
})

// ── Phase 10 Plan 04: skeleton / authReady / error / retry ──────────────────

async function openFrameForPhase10Tests(page: Parameters<typeof installMobileAuthSdkStub>[0]) {
  await installMobileAuthSdkStub(page)
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto('/')
  await waitForAssistanceSdkFactory(page)
  await expect(page.getByRole('main', { name: '订单支付' })).toBeVisible()
  await page.getByRole('button', { name: '立即支付-jssdk' }).click()
  await expect(page.locator('[data-assistance-auth-overlay="true"]')).toBeVisible()
  return getVerificationFrame(page)
}

test('shows skeleton placeholder before initControl.authReady fires', async ({ page }) => {
  test.skip(!isStubMode)

  const frame = await openFrameForPhase10Tests(page)

  await expect(frame.getByText('输入身份证后4位')).toBeVisible()
  await triggerShowAuthPageSuccess(frame)

  // Wait for initControl to be called (SDK ready, but authReady not yet fired)
  await expect.poll(() => frame.evaluate(() => {
    return ((window as Window & { __mobileAuthHarness?: { initControlCalls: unknown[] } }).__mobileAuthHarness?.initControlCalls.length ?? 0)
  })).toBe(1)

  // Skeleton should be visible (Plan 02: aria-label="加载中")
  await expect(frame.getByRole('region', { name: '加载中' })).toBeVisible()

  // 4-grid input area should not be visible while skeleton is shown
  await expect(frame.locator('[aria-label="身份证后四位输入"]')).not.toBeVisible()
})

test('shows SdkErrorPanel with code 110031 when initControl.error fires with carrier-mismatch code', async ({ page }) => {
  test.skip(!isStubMode)

  const frame = await openFrameForPhase10Tests(page)

  await expect(frame.getByText('输入身份证后4位')).toBeVisible()
  await triggerShowAuthPageSuccess(frame)

  // Wait for initControl to be called
  await expect.poll(() => frame.evaluate(() => {
    return ((window as Window & { __mobileAuthHarness?: { initControlCalls: unknown[] } }).__mobileAuthHarness?.initControlCalls.length ?? 0)
  })).toBe(1)

  // Trigger error with carrier-mismatch code
  await triggerInitControlError(frame, '110031', '号码不在中国移动网络')

  // SdkErrorPanel (role=alert) should appear with error code
  await expect(frame.getByRole('alert')).toBeVisible()
  await expect(frame.getByRole('alert')).toContainText('错误代码 110031')
  await expect(frame.getByRole('alert')).toContainText('中国移动数据网络')
})

test('allows retry after initControl.error by re-triggering showAuthPage', async ({ page }) => {
  test.skip(!isStubMode)

  const frame = await openFrameForPhase10Tests(page)

  await expect(frame.getByText('输入身份证后4位')).toBeVisible()
  await triggerShowAuthPageSuccess(frame)

  // Wait for initControl to be called
  await expect.poll(() => frame.evaluate(() => {
    return ((window as Window & { __mobileAuthHarness?: { initControlCalls: unknown[] } }).__mobileAuthHarness?.initControlCalls.length ?? 0)
  })).toBe(1)

  // Trigger error (Plan 03: resets controlReady=false + hasInitializedControlRef=false)
  await triggerInitControlError(frame, '105999')

  // After error, the explicit retry entry should remain available.
  await expect(frame.getByRole('button', { name: '重试' })).toBeVisible()

  // Retry reloads the SDK resource and starts a fresh showAuthPage attempt.
  await frame.getByRole('button', { name: '重试' }).click()

  // showAuthPage should have been called twice (retry path)
  await expect.poll(() => frame.evaluate(() => {
    return ((window as Window & { __mobileAuthHarness?: { showAuthPageCalls: unknown[] } }).__mobileAuthHarness?.showAuthPageCalls.length ?? 0)
  })).toBe(2)
})
