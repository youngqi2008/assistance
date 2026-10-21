import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import {
  installMobileAuthSdkStub, installSessionRoutes, installMobileAssistantRoutes,
  waitForAssistanceSdkFactory, triggerShowAuthPageSuccess, expectInitControlReady,
} from './mobile-auth-flow-helpers'

const dist = path.resolve(process.env.STATIC_RELEASE_DIST ?? 'release/static-mobile-auth-0.2.6/dist')
const origin = 'https://ginkgo.chinaums.com'
const base = '/sign-pay-pro/assist/0.2.6/'

for (const useCustomKeyboard of [true, false]) {
  test(`0.2.6 packaged wrapper and H5 preserve themed focus and keyboard reentry (custom=${useCustomKeyboard})`, async ({ page }) => {
    await page.route(`${origin}/sign-pay-pro/**`, async route => {
      const pathname = new URL(route.request().url()).pathname
      const relative = pathname.slice('/sign-pay-pro/'.length).replace(/\/verification$/, '/index.html')
      const file = path.resolve(dist, relative)
      if (!file.startsWith(`${dist}${path.sep}`)) return route.abort()
      const contentType = ({ '.html': 'text/html', '.js': 'application/javascript', '.cjs': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.gif': 'image/gif' } as Record<string, string>)[path.extname(file)] ?? 'application/octet-stream'
      try { await route.fulfill({ body: await readFile(file), contentType }) }
      catch { await route.fulfill({ status: 404, body: 'Missing packaged resource' }) }
    })
    await installMobileAuthSdkStub(page, { preserveWrapper: true })
    await installSessionRoutes(page)
    await installMobileAssistantRoutes(page, 'success')
    await page.route(`${origin}/package-check`, route => route.fulfill({
      contentType: 'text/html',
      body: `<html><body><script src="${base}assistance-mobile-auth/assistance-mobile-auth.0.2.6.umd.cjs"></script></body></html>`,
    }))
    await page.goto(`${origin}/package-check`)
    await waitForAssistanceSdkFactory(page)
    await page.evaluate(useCustomKeyboard => {
      const sdk = window.AssistanceMobileAuth!.createAssistanceMobileAuthSdk({
        appId: 'static-026-default-test', useCustomKeyboard, ui: { themeColor: '#1677ff' },
      })
      void sdk.openVerification().catch(() => undefined)
    }, useCustomKeyboard)
    const iframe = page.locator('iframe[data-assistance-auth-frame="true"]')
    await expect(iframe).toBeAttached()
    const frame = await (await iframe.elementHandle())!.contentFrame()
    if (!frame) throw new Error('Missing packaged verification iframe')
    expect(new URL(frame.url()).pathname).toBe(`${base}verification`)
    await triggerShowAuthPageSuccess(frame)
    await expectInitControlReady(frame)
    await expect(iframe).toBeVisible()
    const active = frame.locator('[data-active-digit="true"]')
    const input = frame.getByRole('textbox', { name: '身份证后四位', exact: true })
    if (!useCustomKeyboard) await input.focus()
    await expect(active).toHaveCSS('border-color', 'rgb(22, 119, 255)')
    await expect(active).toHaveCSS('box-shadow', 'rgb(22, 119, 255) 0px 0px 0px 1px inset')
    await expect(frame.getByText('示例品牌服务协议')).toHaveCount(0)
    if (useCustomKeyboard) {
      for (const key of '123X') await frame.getByRole('button', { name: `输入 ${key}`, exact: true }).click()
      await expect(frame.locator('section[aria-label="安全键盘"]')).toHaveAttribute('aria-hidden', 'true')
      await expect(active).toHaveCount(0)
      await frame.getByLabel('身份证后四位第 2 位', { exact: true }).click()
      await expect(active).toHaveCount(1)
      await frame.getByRole('button', { name: '删除', exact: true }).click()
      await expect(frame.getByLabel('身份证后四位第 4 位', { exact: true })).toHaveText('')
    } else {
      await input.fill('123X')
      await expect(input).not.toBeFocused()
      await expect(active).toHaveCount(0)
      await input.click()
      await expect(input).toBeFocused()
      await expect(active).toHaveCount(1)
    }
  })
}
