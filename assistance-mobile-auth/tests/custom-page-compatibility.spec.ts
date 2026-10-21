import { expect, test } from '@playwright/test'
import { installCustomOfficialStub, openDefaultPage, openLegacyPage, openRuntimeVariant } from './custom-page-helpers'
import { installSessionRoutes, installMobileAssistantRoutes, triggerInitControlSuccess } from './mobile-auth-flow-helpers'

const YUANBAO_APP_ID = '10037e6f9d903f86019ed8cfb6320365'

test.beforeEach(async ({ page }) => {
  await installCustomOfficialStub(page)
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
})

// A lost embedded runtime update, changed loader, or wrong legacy branch must fail here.
test('same loader serves two embedded runtimes and legacy remains separate', async ({ page }) => {
  const first = await openRuntimeVariant(page, 'first')
  await expect(first.locator('[data-runtime-variant]')).toHaveAttribute('data-runtime-variant', 'first')
  const second = await openRuntimeVariant(page, 'second')
  await expect(second.locator('[data-runtime-variant]')).toHaveAttribute('data-runtime-variant', 'second')
  const evidence = await page.evaluate(() => (window as Window & { __customTestEvidence: { loaderResponses: string[] } }).__customTestEvidence)
  expect(evidence.loaderResponses).toHaveLength(2)
  expect(evidence.loaderResponses[0]).toBe(evidence.loaderResponses[1])
  const legacy = await openLegacyPage(page, { appId: YUANBAO_APP_ID, version: '0.2.6' })
  await expect(legacy.locator('#ydrzSubmitControl')).toBeVisible()
  expect(legacy.url()).not.toContain('custom-verification.html')
  const current = await openDefaultPage(page, { appId: YUANBAO_APP_ID })
  await expect(current.locator('#ydrzSubmitControl')).toBeVisible()
  expect(current.url()).not.toContain('custom-verification.html')
})

// These actual compiled wrappers exercise the no-customPage route and original options/result.
for (const profile of [
  { name: 'default', appId: 'unmatched-customer', marker: 'main[aria-label="确认身份信息"]' },
  { name: 'yuanbao', appId: YUANBAO_APP_ID, marker: '.chinaums-v23-dialog' },
  { name: 'haike', appId: '8a9481c79c05c8bd019ed8d7ab571df3', marker: '[data-testid="haike-inline-root"]' },
  { name: 'zidingyi', appId: '8a9481c79c05c8bd019f6f42956924a0', marker: '.chinaums-v23-dialog' },
]) {
  test(`current no-customPage preserves ${profile.name} page, options and result`, async ({ page }) => {
    const frame = await openDefaultPage(page, { appId: profile.appId, closable: false, useCustomKeyboard: false, ...(profile.name === 'haike' ? { display: 'inline' as const } : {}) })
    expect(frame.url()).not.toContain('custom-verification.html')
    await expect(frame.locator('#ydrzSubmitControl')).toBeVisible()
    const url = new URL(frame.url())
    expect(url.searchParams.get('appId')).toBe(profile.appId)
    await expect(frame.locator(profile.marker)).toBeVisible()
    const originalV23Keyboard = profile.name === 'yuanbao' || profile.name === 'zidingyi'
    if (originalV23Keyboard) await expect(frame.getByRole('region', { name: '安全键盘' })).toBeVisible()
    else await expect(frame.locator('.chinaums-v23-keyboard')).toHaveCount(0)
    await expect(frame.getByRole('button', { name: '关闭', exact: true })).toBeHidden()
    if (originalV23Keyboard) {
      for (const key of '123X') await frame.getByRole('button', { name: `输入 ${key}`, exact: true }).click()
    } else await frame.getByRole('textbox', { name: '身份证后四位', exact: true }).fill('123X')
    await frame.locator('[data-sdk-stub-click-target]').click()
    await triggerInitControlSuccess(frame, 'compat-provider-token', 'compat-provider-key')
    await expect.poll(() => page.evaluate(() => (window as Window & { __compatState: { result?: unknown } }).__compatState.result)).toMatchObject({ status: 'success', token: 'compat-provider-token', idLast4: '123X', keyA: 'compat-provider-key', requestId: 'compatibility-browser', message: '验证完成' })
  })
}
