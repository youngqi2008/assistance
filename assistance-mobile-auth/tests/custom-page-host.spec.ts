import { expect, test, type Frame, type Page } from '@playwright/test'
import { installCustomOfficialStub, readCustomBootConfig } from './custom-page-helpers'
import { readShowAuthPageData, triggerShowAuthPageSuccess, triggerShowAuthPageError, triggerInitControlAuthReady, triggerInitControlError, triggerInitControlSuccess } from './mobile-auth-flow-helpers'

test.beforeEach(async ({ page }) => {
  await installCustomOfficialStub(page)
  await page.goto('/sign-pay-pro-temp/test-custom-page-0.3.0.html')
})

async function hostFrame(page: Page, ready = true): Promise<Frame> {
  const element = page.locator('iframe[data-assistance-auth-frame]')
  await expect(element).toHaveCount(1)
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Built host did not create its authorization frame')
  await readCustomBootConfig(frame)
  if (!ready) {
    await expect.poll(() => readShowAuthPageData(frame)).toBeTruthy()
    return frame
  }
  await triggerShowAuthPageSuccess(frame)
  await triggerInitControlAuthReady(frame)
  await expect(frame.locator('[data-card]')).toBeVisible()
  return frame
}

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`built order host opens Yuanbao and keyboard without JSON (mocked provider) ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await expect(page.getByRole('heading', { name: '银商助理测试页' })).toBeVisible()
    await expect(page.locator('#advanced')).not.toHaveAttribute('open')
    await expect(page.locator('#open')).toBeInViewport()
    await expect(page.locator('#authParams')).toHaveValue('')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`host-${viewport.width}x${viewport.height}.png`), fullPage: true })
    await page.locator('#open').click()
    const frame = await hostFrame(page)
    expect((await readCustomBootConfig(frame)).appId).toBe('10037e6f9d903f86019ed8cfb6320365')
    expect(await readShowAuthPageData(frame)).toMatchObject({ appId: '300013215094', authType: '0', scope: '3ElementsAuthAssistFill' })
    await expect(frame.locator('[data-keyboard]')).toBeVisible()
    await expect(frame.locator('[data-key="0"]')).toBeInViewport()
    await expect(frame.locator('[data-key="delete"]')).toBeInViewport()
    expect(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    // Visibility also passes midway through the wrapper's 220ms entry fade.
    // Wait for its actual computed opacity before capturing the opaque customer card.
    await expect(page.locator('[data-assistance-auth-overlay]')).toHaveCSS('opacity', '1')
    await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCSS('opacity', '1')
    await expect(frame.locator('[data-card]')).toHaveCSS('opacity', '1')
    await expect(frame.locator('[data-keyboard]')).toHaveCSS('opacity', '1')
    await testInfo.attach('settled-modal-styles', {
      contentType: 'application/json',
      body: JSON.stringify({
        overlayOpacity: await page.locator('[data-assistance-auth-overlay]').evaluate(element => getComputedStyle(element).opacity),
        customer: await frame.evaluate(() => ['[data-card]', '[data-keyboard]'].map(selector => {
          const style = getComputedStyle(document.querySelector(selector)!)
          return { selector, opacity: style.opacity, background: style.backgroundColor }
        })),
      }),
    })
    await page.screenshot({ path: testInfo.outputPath(`yuanbao-${viewport.width}x${viewport.height}.png`) })
  })
}

test('built host rapid clicks, cancel and provider success reopen with fresh signatures (mocked provider)', async ({ page }) => {
  const logs: string[] = []
  page.on('console', message => logs.push(message.text()))
  await page.locator('#open').evaluate((button: HTMLButtonElement) => { button.click(); button.click(); button.click() })
  const first = await hostFrame(page)
  const firstParams = await readShowAuthPageData(first)
  await expect(page.locator('#open')).toBeDisabled()
  await expect(page.locator('#native')).toBeDisabled()
  await first.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.locator('#open')).toBeEnabled()
  await page.locator('#open').click()
  const second = await hostFrame(page)
  const secondParams = await readShowAuthPageData(second)
  expect(secondParams!.traceId).not.toBe(firstParams!.traceId)
  expect(secondParams!.sign).not.toBe(firstParams!.sign)
  for (const key of '123X') await second.locator(`[data-key="${key}"]`).click()
  await second.locator('[data-sdk-stub-click-target]').click()
  await triggerInitControlSuccess(second, 'MOCK_ONLY_PRIVATE_TOKEN', 'MOCK_ONLY_PRIVATE_KEY')
  await expect(page.locator('#status')).toHaveText('验证完成')
  await expect(page.locator('#open')).toBeEnabled()
  const evidence = await page.evaluate(() => ({ text: document.body.textContent, local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage) }))
  for (const secret of ['MOCK_ONLY_PRIVATE_TOKEN', 'MOCK_ONLY_PRIVATE_KEY']) {
    expect(JSON.stringify(evidence)).not.toContain(secret)
    expect(logs.join('\n')).not.toContain(secret)
  }
  await page.locator('#open').click()
  const third = await hostFrame(page)
  await triggerInitControlError(third, '500', '模拟运营商可重试错误')
  await expect(page.locator('#status')).toContainText('模拟运营商可重试错误')
  await expect(page.locator('#open')).toBeDisabled()
  await third.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.locator('#open')).toBeEnabled()
  await page.locator('#open').click()
  const startup = await hostFrame(page, false)
  await triggerShowAuthPageError(startup, '500', '模拟运营商初始化失败')
  await expect(page.locator('#open')).toBeEnabled()
  await expect(page.locator('#status')).toContainText('验证失败（错误码 500）')
  await page.locator('#open').click()
  await hostFrame(page)
})

test('built host native shortcut and advanced URL/agreement settings reach actual template (mocked provider)', async ({ page }) => {
  await page.locator('#advanced summary').click()
  await page.locator('#mode').selectOption('url')
  await page.locator('#agreements').fill(JSON.stringify([{ name: '客户追加协议', link: 'https://customer.example/terms' }]))
  await page.locator('#native').click()
  const frame = await hostFrame(page)
  const config = await readCustomBootConfig(frame)
  expect(config).toMatchObject({ iframeOptions: { closable: false, useCustomKeyboard: false }, agreements: [{ name: '客户追加协议' }] })
  expect(config.page).toMatchObject({ kind: 'url' })
  await expect(frame.getByRole('button', { name: '关闭', exact: true })).toBeHidden()
  await expect(frame.locator('[data-keyboard]')).toBeHidden()
  await frame.locator('[data-id-value]').fill('123x')
  await expect(frame.locator('[data-id-value]')).toHaveValue('123X')
  await expect(frame.getByRole('checkbox', { name: '同意客户追加协议' })).toBeVisible()
})

test('built host recovers after missing customer resources and malformed override (mocked provider)', async ({ page }) => {
  await page.route('**/assist/0.3.0/examples/yuanbao/style.css', route => route.fulfill({ status: 503, body: 'test-only resource failure' }))
  await page.locator('#open').click()
  await expect(page.locator('#status')).toHaveText('资源加载失败：style.css')
  await expect(page.locator('#open')).toBeEnabled()
  await expect(page.locator('#native')).toBeEnabled()
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
  await page.unroute('**/assist/0.3.0/examples/yuanbao/style.css')
  await page.locator('#advanced summary').click()
  await page.locator('#authParams').fill('{invalid JSON')
  await page.locator('#open').click()
  await expect(page.locator('#status')).toContainText(/JSON|Unexpected/)
  await expect(page.locator('#open')).toBeEnabled()
  await page.locator('#authParams').fill('')
  await page.locator('#open').click()
  await hostFrame(page)
})
