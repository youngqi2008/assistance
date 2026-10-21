import { expect, test, type Page } from '@playwright/test'
import {
  expectInitControlReady,
  installMobileAssistantRoutes,
  installMobileAuthSdkStub,
  installSessionRoutes,
  triggerShowAuthPageSuccess,
  waitForAssistanceSdkFactory,
} from './mobile-auth-flow-helpers'

const liveBase = process.env.PLAYWRIGHT_LIVE_TEMP_BASE_URL
test.use({ hasTouch: true, isMobile: true })

async function openDefault(page: Page, useCustomKeyboard: boolean, appId = 'default-test-026', themeColor?: string) {
  await installMobileAuthSdkStub(page, { preserveWrapper: Boolean(liveBase) })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto(liveBase ? `${liveBase.replace(/\/$/, '')}/test-page` : '/')
  await waitForAssistanceSdkFactory(page)
  if (appId === 'default-test-026') {
    await page.getByRole('button', {
      name: useCustomKeyboard ? '立即支付-jssdk' : '测试无关闭X + 系统键盘', exact: true,
    }).click()
  } else {
    await page.evaluate(({ appId, useCustomKeyboard, themeColor }) => {
      const sdk = window.AssistanceMobileAuth!.createAssistanceMobileAuthSdk({ appId, useCustomKeyboard, ...(themeColor ? { ui: { themeColor } } : {}) })
      void sdk.openVerification().catch(() => undefined)
    }, { appId, useCustomKeyboard, themeColor })
  }
  const iframe = page.locator('iframe[data-assistance-auth-frame="true"]')
  await expect(iframe).toBeAttached()
  const frame = await (await iframe.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Missing default verification iframe')
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(iframe).toBeVisible()
  expect(new URL(frame.url()).searchParams.get('appId')).toBe(appId)
  if (appId === 'default-test-026') {
    await expect(frame.getByText('示例品牌服务协议')).toHaveCount(0)
    await expect(frame.getByRole('heading', { name: '确认身份信息', exact: true })).toBeVisible()
  }
  return frame
}

for (const height of [844, 400]) {
  test(`default custom keyboard closes and all four boxes reopen at 390x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height })
    const frame = await openDefault(page, true)
    const keyboard = frame.locator('section[aria-label="安全键盘"]')
    const active = frame.locator('[data-active-digit="true"]')
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('aria-label', '身份证后四位第 1 位')
    await expect(active).toHaveCSS('border-color', 'rgb(255, 45, 85)')
    await expect(active).toHaveCSS('box-shadow', 'rgb(255, 45, 85) 0px 0px 0px 1px inset')
    await page.screenshot({ path: testInfo.outputPath('first-digit-theme-focus.png') })
    for (const key of '123') await frame.getByRole('button', { name: `输入 ${key}`, exact: true }).click()
    await expect(keyboard).toHaveAttribute('aria-hidden', 'false')
    await expect(active).toHaveAttribute('aria-label', '身份证后四位第 4 位')
    await frame.getByRole('button', { name: '输入 X', exact: true }).click()
    await expect(keyboard).toHaveAttribute('aria-hidden', 'true')
    await expect(active).toHaveCount(0)
    await expect.poll(() => keyboard.evaluate(node => node.getBoundingClientRect().height)).toBe(0)
    await expect(frame.locator('#ydrzSubmitControl')).toBeInViewport()
    await page.screenshot({ path: testInfo.outputPath('four-digits-keyboard-closed.png') })
    for (let index = 1; index <= 4; index++) {
      await frame.getByLabel(`身份证后四位第 ${index} 位`, { exact: true }).tap()
      await expect(keyboard).toHaveAttribute('aria-hidden', 'false')
      await expect(active).toHaveCount(1)
      await expect(active).toHaveAttribute('aria-label', '身份证后四位第 4 位')
      await expect(frame.getByLabel('身份证后四位第 4 位', { exact: true })).toHaveText('X')
      await frame.getByRole('button', { name: '删除', exact: true }).click()
      await expect(frame.getByLabel('身份证后四位第 4 位', { exact: true })).toHaveText('')
      await frame.getByRole('button', { name: '输入 X', exact: true }).click()
      await expect(keyboard).toHaveAttribute('aria-hidden', 'true')
    }
  })
}

test('default native input blurs on completion and each box permits editing', async ({ page }) => {
  const frame = await openDefault(page, false)
  const input = frame.getByRole('textbox', { name: '身份证后四位', exact: true })
  await input.fill('123')
  await expect(input).toBeFocused()
  await input.press('x')
  await expect(input).toHaveValue('123X')
  await expect(input).not.toBeFocused()
  for (let index = 0; index < 4; index++) {
    const box = await input.boundingBox()
    if (!box) throw new Error('Missing native input bounds')
    await page.touchscreen.tap(box.x + box.width * (index + 0.5) / 4, box.y + box.height / 2)
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('123X')
    await input.press('End')
    await input.press('Backspace')
    await expect(input).toHaveValue('123')
    await expect(input).toBeFocused()
    await input.press('x')
    await expect(input).not.toBeFocused()
  }
})

test('matched profile using compact skin keeps its existing custom keyboard behavior', async ({ page }) => {
  const frame = await openDefault(page, true, 'demo-brand-001')
  for (const key of '1234') await frame.getByRole('button', { name: `输入 ${key}`, exact: true }).click()
  await expect(frame.locator('section[aria-label="安全键盘"]')).toHaveAttribute('aria-hidden', 'false')
})

for (const useCustomKeyboard of [true, false]) {
  test(`default focus border follows configured SDK theme (custom=${useCustomKeyboard})`, async ({ page }, testInfo) => {
    const frame = await openDefault(page, useCustomKeyboard, 'theme-border-test-026', '#16a34a')
    const active = frame.locator('[data-active-digit="true"]')
    if (!useCustomKeyboard) await frame.getByRole('textbox', { name: '身份证后四位', exact: true }).focus()
    await expect(active).toHaveCount(1)
    await expect(active).toHaveCSS('border-color', 'rgb(22, 163, 74)')
    await expect(active).toHaveCSS('box-shadow', 'rgb(22, 163, 74) 0px 0px 0px 1px inset')
    await page.screenshot({ path: testInfo.outputPath('configured-theme-focus.png') })
    if (!useCustomKeyboard) {
      await frame.getByRole('textbox', { name: '身份证后四位', exact: true }).blur()
      await expect(active).toHaveCount(0)
    }
  })
}
