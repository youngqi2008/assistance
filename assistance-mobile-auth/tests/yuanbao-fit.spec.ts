import { expect, test, type Frame } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { installMobileAuthSdkStub, installSessionRoutes, installMobileAssistantRoutes, waitForAssistanceSdkFactory, triggerShowAuthPageSuccess, expectInitControlReady } from './mobile-auth-flow-helpers'

const liveBase = process.env.PLAYWRIGHT_LIVE_TEMP_BASE_URL
test.use({ browserName: process.env.YUANBAO_FIT_BROWSER === 'webkit' ? 'webkit' : 'chromium', launchOptions: process.env.V23_CHROMIUM_EXECUTABLE ? { executablePath: process.env.V23_CHROMIUM_EXECUTABLE } : {} })

async function metrics(frame: Frame) {
  return frame.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector<HTMLElement>(selector)!
      const r = node.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, scroll: node.scrollHeight - node.clientHeight }
    }
    const card = rect('.chinaums-v23-dialog')
    const boxes = rect('.chinaums-v23-id-grid')
    const submit = rect('.chinaums-v23-submit')
    const slot = document.getElementById('ydrzSubmitControl')!
    const hit = document.elementFromPoint(submit.x + submit.width / 2, submit.y + submit.height / 2)
    return { height: window.innerHeight, card, submit, gap: submit.y - boxes.bottom, keyboard: rect('.chinaums-v23-keyboard'), other: rect('.chinaums-v23-other'), hit: hit === slot || slot.contains(hit), opacity: getComputedStyle(slot).opacity }
  })
}

for (const size of [{ width: 390, height: 844 }, { width: 393, height: 640 }, { width: 390, height: 400 }, { width: 320, height: 400 }, { width: 320, height: 240 }]) {
  test(`Yuanbao full viewport fit at ${size.width}x${size.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(size)
    await page.addInitScript('window.__name = window.__name || function (fn) { return fn; };')
    if (process.env.V23_SITE_DIR) {
      const directory = path.resolve(process.env.V23_SITE_DIR)
      await page.route('https://ginkgo.chinaums.com/sign-pay-pro-temp/**', async (route) => {
        const relative = new URL(route.request().url()).pathname.slice('/sign-pay-pro-temp/'.length)
        if (relative.startsWith('api/')) return route.continue()
        const target = path.resolve(directory, !relative || /(?:test-page|verification)$/.test(relative) ? 'index.html' : relative)
        if (!target.startsWith(`${directory}${path.sep}`)) return route.abort()
        const contentType = ({ '.js': 'application/javascript', '.cjs': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.gif': 'image/gif', '.png': 'image/png', '.svg': 'image/svg+xml' } as Record<string, string>)[path.extname(target)] ?? 'application/octet-stream'
        try { await route.fulfill({ body: await readFile(target), contentType }) }
        catch { await route.fulfill({ status: 404, body: 'Missing built resource' }) }
      })
    }
    await installMobileAuthSdkStub(page, { agreementFixture: 'v23-production', agreementOverlay: true, submitElementTag: 'official-nested', preserveWrapper: Boolean(liveBase), emulateOfficialSubmitState: true })
    await installSessionRoutes(page)
    await installMobileAssistantRoutes(page, 'success')
    await page.goto(liveBase ? `${liveBase.replace(/\/$/, '')}/test-page` : '/')
    await waitForAssistanceSdkFactory(page)
    await page.getByRole('button', { name: '测试元保三要素皮肤', exact: true }).click()
    const iframe = page.locator('iframe[data-assistance-auth-frame="true"]')
    await expect(iframe).toBeAttached()
    const frame = await (await iframe.elementHandle())!.contentFrame()
    if (!frame) throw new Error('Missing Yuanbao frame')
    await triggerShowAuthPageSuccess(frame)
    await expectInitControlReady(frame)
    await expect(iframe).toBeVisible()
    await expect(page.locator('#assistance-mobile-auth-frame-shell')).toHaveCSS('opacity', '1')
    await expect(iframe).toHaveCSS('opacity', '1')
    await expect(frame.locator('.chinaums-v23-inline-error')).toHaveCount(0)
    const captured: Record<string, Awaited<ReturnType<typeof metrics>>> = {}
    async function capture(name: string) {
      await expect.poll(async () => (await metrics(frame!)).card.scroll).toBeLessThanOrEqual(1)
      const value = await metrics(frame!)
      captured[name] = value
      expect(value.card.y).toBeGreaterThanOrEqual(0)
      expect(value.card.bottom).toBeLessThanOrEqual(value.keyboard.y + 1)
      expect(value.other.bottom).toBeLessThanOrEqual(value.card.bottom + 1)
      expect(value.keyboard.bottom).toBeLessThanOrEqual(value.height + 1)
      expect(value.hit).toBe(true)
      expect(value.opacity).toBe('1')
      await page.screenshot({ path: testInfo.outputPath(`${name}.png`) })
      return value
    }
    const normal = await capture('normal')
    expect(normal.gap).toBeCloseTo(15, 0)
    await expect(page.locator('#assistance-mobile-auth-frame-shell')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    const anchors = frame.locator('#ydrzAgreementControl a')
    await expect(anchors).toHaveText(['用户信息授权协议', /^(中国移动认证|移动认证安全基座)服务条款$/])
    await expect(frame.locator('#ydrzAgreementControl')).toContainText('|')
    for (const node of await frame.locator('#ydrzAgreementControl, #ydrzAgreementControl *, #ydrzTipsControl, #ydrzTipsControl *').all()) await expect(node).toHaveCSS('color', 'rgb(132, 138, 180)')
    await frame.locator('[data-sdk-stub-click-target]').click()
    await expect(frame.getByRole('alert')).toBeVisible()
    const error = await capture('error')
    expect(error.keyboard.height).toBeCloseTo(normal.keyboard.height, 1)
    for (const key of '1234') await frame.getByRole('button', { name: `输入 ${key}`, exact: true }).click()
    await expect(frame.locator('.chinaums-v23-inline-error')).toHaveCount(0)
    const cleared = await capture('cleared')
    expect(cleared.keyboard.height).toBeCloseTo(normal.keyboard.height, 1)
    expect(cleared.gap).toBeCloseTo(15, 0)
    if (size.height === 844) {
      await page.setViewportSize({ width: size.width, height: 400 })
      await expect.poll(() => frame.evaluate(() => window.innerHeight)).toBe(400)
      const resized = await capture('resized-short')
      expect(resized.gap).toBeCloseTo(15, 0)
      await page.setViewportSize(size)
      await expect.poll(() => frame.evaluate(() => window.innerHeight)).toBe(size.height)
      await capture('resized-restored')
    }
    await anchors.first().click()
    const reader = frame.frameLocator('iframe[title="用户信息授权协议内容"]')
    await expect(reader.getByRole('list').getByRole('button')).toHaveCount(4)
    await frame.getByRole('button', { name: '关闭协议', exact: true }).click()
    await page.waitForTimeout(1100)
    await frame.locator('[data-sdk-stub-click-target]').click()
    await expect(frame.getByRole('status', { name: '加载中' })).toBeVisible()
    const pending = await capture('pending')
    expect(pending.keyboard.height).toBeCloseTo(normal.keyboard.height, 1)
    expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.providerTokenRequests)).toBe(1)
    await writeFile(testInfo.outputPath('fit-metrics.json'), JSON.stringify(captured, null, 2))
  })
}
