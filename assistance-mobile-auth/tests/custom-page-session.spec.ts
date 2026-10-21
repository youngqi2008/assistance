import { expect, test } from '@playwright/test'
import { installCustomOfficialStub, openCustomPage, readCustomBootConfig } from './custom-page-helpers'
import { readShowAuthPageData, triggerShowAuthPageSuccess, triggerInitControlAuthReady } from './mobile-auth-flow-helpers'

test.beforeEach(async ({ page }) => { await installCustomOfficialStub(page) })

test('real wrapper embeds runtime, sends BOOT and exposes only after official authReady', async ({ page }) => {
  const frame = await openCustomPage(page, {
    appId: 'customer-public-id',
    authParams: { version: '3.0', appId: 'mobile-provider-id', sign: 'provider-signature', traceId: 'trace', timestamp: '20261008000000000', authType: '0', scope: '3ElementsAuthAssistFill' },
  })
  const config = await readCustomBootConfig(frame)
  expect(config.appId).toBe('customer-public-id')
  await expect.poll(() => readShowAuthPageData(frame)).toMatchObject({ appId: 'mobile-provider-id' })
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCSS('opacity', '0')
  await triggerShowAuthPageSuccess(frame)
  await triggerInitControlAuthReady(frame)
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCSS('opacity', '1')
  expect(await page.evaluate(() => (window as Window & { __customPageSession: { result: unknown } }).__customPageSession.result)).toBeUndefined()
  await page.evaluate(() => (window as Window & { __customPageSdk: { close(): void } }).__customPageSdk.close())
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
})

test('inline custom close removes the real runtime window', async ({ page }) => {
  const frame = await openCustomPage(page, { display: 'inline' })
  await readCustomBootConfig(frame)
  await page.evaluate(() => (window as Window & { __customPageSdk: { destroy(): void } }).__customPageSdk.destroy())
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
})
