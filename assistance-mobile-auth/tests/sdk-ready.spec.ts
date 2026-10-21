import { expect, test } from '@playwright/test'

import {
  expectInitControlReady,
  getVerificationFrame,
  installMobileAuthSdkStub,
  installSessionRoutes,
  installMobileAssistantRoutes,
  openStubbedVerification,
  triggerShowAuthPageSuccess,
  waitForAssistanceSdkFactory,
} from './mobile-auth-flow-helpers'

const forbiddenSelfEnterSmsCopies = ['非本机短信校验', '输入手机号', '发送验证码', '重新获取验证码'] as const
const visibleSdkSlotIds = ['ydrzPhoneControl', 'ydrzTipsControl', 'ydrzSubmitControl'] as const

async function expectMountedSdkSlot(frame: import('@playwright/test').Frame, id: (typeof visibleSdkSlotIds)[number]) {
  const slot = frame.locator(`#${id}`)

  await expect(slot).toBeAttached()
  await expect(slot.locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " sr-only ")]')).toHaveCount(0)
  await expect(slot.locator('xpath=ancestor-or-self::*[@aria-hidden="true"]')).toHaveCount(0)
}

test('sdk-ready smoke keeps the default screen concise and preserves visible sdk seams', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main', { name: '订单支付' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '银商助理测试页' })).toBeVisible()
  await expect(page.getByText('快捷支付签约订单')).toBeVisible()

  await expect(page.getByText(/^SDK Ready$/i)).toHaveCount(0)
  for (const copy of forbiddenSelfEnterSmsCopies) {
    await expect(page.getByText(copy)).toHaveCount(0)
  }
  await expect(page.getByRole('heading', { name: '短信验证', exact: true })).toHaveCount(0)
  await expect(page.getByText('ResultPanel')).toHaveCount(0)
  await expect(page.getByText('DebugResponsePanel')).toHaveCount(0)

  const frame = await openStubbedVerification(page, 'success')

  await expect(frame.getByRole('main', { name: '确认身份信息' })).toBeVisible()
  await expect(frame.getByRole('heading', { name: '示例品牌身份核验' })).toBeVisible()
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(frame.getByLabel('身份证后四位输入')).toBeVisible()

  for (const id of visibleSdkSlotIds) {
    await expectMountedSdkSlot(frame, id)
  }
  await expect(frame.locator('#ydrzStateControl')).toBeAttached()

  await expect(frame.locator('#ydrzYZMControl')).toBeAttached()
  await expect(frame.locator('#ydrzYZMBtnControl')).toBeAttached()
  await expect(frame.locator('#ydrzAgreementControl')).toBeAttached()

  await expect(frame.locator('[data-sdk-meta][data-sdk-debug-entry="enabled"]')).toBeAttached()
  await expect(frame.getByText('非本机短信校验')).toHaveCount(0)
  await expect(frame.getByRole('heading', { name: '短信验证', exact: true })).toHaveCount(0)
  for (const copy of forbiddenSelfEnterSmsCopies) {
    await expect(frame.getByText(copy)).toHaveCount(0)
  }
})

// ── Phase 10 Plan 04: styleOption lock — brand red #ff2d55 + phoneStyle.fontSize 22px ──

test('initControl applies the current demo profile theme and phone style', async ({ page }) => {
  await installMobileAuthSdkStub(page)
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto('/')
  await waitForAssistanceSdkFactory(page)
  await expect(page.getByRole('main', { name: '订单支付' })).toBeVisible()
  await page.getByRole('button', { name: '立即支付-jssdk' }).click()
  await expect(page.locator('[data-assistance-auth-overlay="true"]')).toBeVisible()

  const frame = await getVerificationFrame(page)

  await triggerShowAuthPageSuccess(frame)

  // Wait for initControl to be called
  await expect.poll(() => frame.evaluate(() => {
    return ((window as Window & { __mobileAuthHarness?: { initControlCalls: unknown[] } }).__mobileAuthHarness?.initControlCalls.length ?? 0)
  })).toBe(1)

  // Read the styleOption that was passed to initControl
  const styleOption = await frame.evaluate(() => {
    const harness = (window as Window & {
      __mobileAuthHarness?: { initControlCalls: Array<{ styleOption: Record<string, unknown> }> }
    }).__mobileAuthHarness
    return harness?.initControlCalls[0]?.styleOption
  })

  expect((styleOption?.submitBtnStyle as Record<string, unknown> | undefined)?.bgColor).toBe('#0A6CFF')
  expect((styleOption?.phoneStyle as Record<string, unknown> | undefined)?.fontSize).toBe('14px')
})
