import { expect, test, type Frame } from '@playwright/test'
import { HAIKE_V2_APP_ID, YUANBAO_APP_ID } from '../src/agreements/appAgreementRegistry'
import { installCustomOfficialStub, openCustomPage, readCustomBootConfig } from './custom-page-helpers'
import { triggerShowAuthPageSuccess, triggerInitControlAuthReady } from './mobile-auth-flow-helpers'

test.beforeEach(async ({ page }) => { await installCustomOfficialStub(page, { agreementReader: true }) })

async function openReader(frame: Frame): Promise<Frame> {
  await triggerShowAuthPageSuccess(frame); await triggerInitControlAuthReady(frame)
  await frame.locator('#ydrzAgreementControl a').filter({ hasText: '用户信息授权协议' }).click()
  const element = frame.locator('.ydrz-confirm-iframe iframe')
  await expect(element).toBeAttached()
  const reader = await (await element.elementHandle())!.contentFrame()
  if (!reader) throw new Error('Actual provider reader iframe unavailable')
  await expect(reader.locator('[data-agreement-reader]')).toBeVisible()
  return reader
}
async function sdkCounts(frame: Frame) {
  return frame.evaluate(() => {
    const harness = (window as Window & { __mobileAuthHarness: { showAuthPageCalls: unknown[]; initControlCalls: unknown[] } }).__mobileAuthHarness
    return { show: harness.showAuthPageCalls.length, init: harness.initControlCalls.length }
  })
}

test('Yuanbao actual SDK reader shows four plus caller, opens genuine third-party body, returns and closes', async ({ page }) => {
  const auth = await openCustomPage(page, { appId: YUANBAO_APP_ID, agreements: [{ name: '客户协议', link: 'https://customer.example/terms' }] })
  await readCustomBootConfig(auth)
  const reader = await openReader(auth)
  await expect(reader.locator('nav a')).toHaveCount(5)
  await expect(reader.getByRole('link', { name: '客户协议', exact: true })).toHaveAttribute('href', 'https://customer.example/terms')
  await reader.getByRole('link', { name: '《第三方共享个人信息清单》', exact: true }).click()
  await expect(reader.locator('h1').first()).toHaveText('《第三方共享个人信息清单》')
  await expect(reader.locator('article')).toContainText('中移互联网有限公司')
  await reader.getByRole('button', { name: '返回', exact: true }).click()
  await expect(reader.locator('nav a')).toHaveCount(5)
  await auth.locator('.ydrz-confirm-header em').click()
  await expect(auth.locator('.ydrz-confirm-iframe')).toHaveCount(0)
  expect(await sdkCounts(auth)).toEqual({ show: 1, init: 1 })
  expect(await page.evaluate(() => (window as Window & { __customPageSession: { result: unknown; error: unknown } }).__customPageSession)).toMatchObject({ result: undefined, error: undefined })
})

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`Yuanbao reader keeps one list header and one SDK backdrop at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const auth = await openCustomPage(page, { appId: YUANBAO_APP_ID, agreements: [{ name: '客户协议', link: 'https://customer.example/terms' }] })
    await readCustomBootConfig(auth)
    const reader = await openReader(auth)
    const header = auth.locator('.ydrz-confirm-header')
    const close = header.locator('em')
    await expect(header).toHaveText('用户信息授权协议')
    await expect(header).toHaveCSS('height', '56px')
    await expect.soft(reader.locator('header')).toBeHidden()
    await expect(reader.locator('nav a')).toHaveCount(5)
    await expect(reader.locator('nav')).toHaveCSS('padding-bottom', '50px')
    await expect.soft(auth.locator('.ydrz-confirm-bg-wrap')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(auth.locator('.ydrz-confirm-bg')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.5)')
    await expect(close).toHaveCSS('width', '28px')
    await expect(close).toHaveCSS('height', '28px')
    await expect(close).toHaveCSS('left', '16px')
    // The SDK's header border leaves a 55px padding box in Chromium; 50% resolves to 27.5px.
    await expect(close).toHaveCSS('top', '27.5px')
    await expect(close).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -14)')
    expect(await close.evaluate(element => getComputedStyle(element).backgroundImage)).toMatch(/^url\(/)
    const panelBounds = (await auth.locator('.ydrz-confirm-iframe').boundingBox())!
    expect(panelBounds.height).toBeCloseTo(viewport.height / 2, 0)
    expect(panelBounds.y).toBeCloseTo(viewport.height / 2, 0)
    await reader.getByRole('link', { name: '《第三方共享个人信息清单》', exact: true }).click()
    await expect(reader.locator('header')).toBeVisible()
    await expect(reader.locator('header > h1')).toHaveText('《第三方共享个人信息清单》')
    await expect(reader.locator('article')).toContainText('中移互联网有限公司')
    await expect(reader.getByRole('button', { name: '关闭协议', exact: true })).toBeVisible()
    await reader.getByRole('button', { name: '返回', exact: true }).click()
    await expect(reader.locator('header')).toBeHidden()
    await close.focus(); await page.keyboard.press('Enter')
    await expect(auth.locator('.ydrz-confirm-iframe')).toHaveCount(0)
    expect(await sdkCounts(auth)).toEqual({ show: 1, init: 1 })
  })
}

test('same Yuanbao template reads genuine Haike table and nested document without restarting parent', async ({ page }) => {
  const auth = await openCustomPage(page, { appId: HAIKE_V2_APP_ID }); await readCustomBootConfig(auth)
  const reader = await openReader(auth)
  await reader.getByRole('link', { name: '《第三方共享个人信息清单》', exact: true }).click()
  await expect(reader.locator('td[colspan="7"]')).toBeVisible()
  for (let i = 0; i < 2; i++) {
    await reader.locator('a[data-doc-key="haike-v2-privacy-policy"]').click()
    await expect(reader.locator('h1').first()).toHaveText('《蓝鲸保隐私政策》')
    await expect(reader.locator('article')).toContainText('海客（天津）保险经纪有限公司')
    await reader.getByRole('button', { name: '返回', exact: true }).click()
    await expect(reader.locator('table')).toBeVisible()
  }
  await reader.getByRole('button', { name: '关闭协议', exact: true }).click()
  await expect(auth.locator('.ydrz-confirm-iframe')).toHaveCount(0)
  expect(await sdkCounts(auth)).toEqual({ show: 1, init: 1 })
})
