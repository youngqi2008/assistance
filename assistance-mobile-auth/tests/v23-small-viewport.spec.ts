import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { expect, test, type Frame, type Page, type TestInfo } from '@playwright/test'

import {
  expectInitControlReady,
  installMobileAssistantRoutes,
  installMobileAuthSdkStub,
  installSessionRoutes,
  triggerShowAuthPageSuccess,
  waitForAssistanceSdkFactory,
} from './mobile-auth-flow-helpers'

const tempBaseUrl = 'https://ginkgo.chinaums.com/sign-pay-pro-temp/'
const siteDirectory = process.env.V23_SITE_DIR
  ? path.resolve(process.env.V23_SITE_DIR)
  : null

test.use({
  hasTouch: true,
  isMobile: true,
  launchOptions: process.env.V23_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.V23_CHROMIUM_EXECUTABLE }
    : {},
})

const profiles = [
  {
    key: 'zidingyi',
    buttonName: '测试银联三要素皮肤（zidingyi）',
  },
  {
    key: 'yuanbao',
    buttonName: '测试元保三要素皮肤',
  },
] as const

function contentTypeFor(file: string): string {
  const types: Record<string, string> = {
    '.cjs': 'application/javascript',
    '.css': 'text/css',
    '.gif': 'image/gif',
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  }
  return types[path.extname(file)] ?? 'application/octet-stream'
}

async function installBuiltSite(page: Page): Promise<void> {
  if (!siteDirectory) return

  await page.route(`${tempBaseUrl}**`, async (route) => {
    const requestUrl = new URL(route.request().url())
    const relative = decodeURIComponent(
      requestUrl.pathname.slice('/sign-pay-pro-temp/'.length),
    )
    if (relative.startsWith('api/')) {
      await route.continue()
      return
    }

    const requestedFile = path.resolve(siteDirectory, relative)
    if (
      requestedFile !== siteDirectory
      && !requestedFile.startsWith(`${siteDirectory}${path.sep}`)
    ) {
      await route.abort()
      return
    }

    const target = relative === ''
      || relative.endsWith('test-page')
      || relative.endsWith('verification')
      ? path.join(siteDirectory, 'index.html')
      : requestedFile

    try {
      await route.fulfill({
        body: await readFile(target),
        contentType: contentTypeFor(target),
      })
    } catch {
      await route.fulfill({ status: 404, body: 'Missing built resource' })
    }
  })
}

async function openCard(page: Page, buttonName: string): Promise<Frame> {
  // Playwright's transpiled init functions reference this helper in Chromium 98.
  await page.addInitScript(
    'window.__name = window.__name || function (fn) { return fn; };',
  )
  await installBuiltSite(page)
  await installMobileAuthSdkStub(page, {
    preserveWrapper: true,
    agreementFixture: 'v23-production',
    agreementOverlay: true,
  })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')

  await page.goto(`${tempBaseUrl}test-page`)
  await waitForAssistanceSdkFactory(page)
  await page.getByRole('button', { name: buttonName, exact: true }).click()
  await expect.poll(
    () => page.frames().some((frame) => frame.url().includes('/verification?')),
  ).toBe(true)
  const frame = page.frames().find((candidate) =>
    candidate.url().includes('/verification?'))
  if (!frame) throw new Error('V23 verification frame is missing')
  await frame.waitForLoadState('domcontentloaded')
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(page.locator('#assistance-mobile-auth-frame-shell')).toHaveCSS(
    'opacity',
    '1',
  )
  return frame
}

async function enlargeAgreementCopy(frame: Frame): Promise<void> {
  await frame
    .locator('.chinaums-v23-agreements, .chinaums-v23-agreements *')
    .evaluateAll((nodes) => {
      for (const node of nodes) {
        const element = node as HTMLElement
        element.style.setProperty('font-size', '14px', 'important')
        element.style.setProperty('line-height', '22px', 'important')
      }
    })
}

async function swipeUp(page: Page, frame: Frame): Promise<void> {
  const rect = await frame.locator('.chinaums-v23-dialog').boundingBox()
  if (!rect) throw new Error('V23 card is missing')

  const client = await page.context().newCDPSession(page)
  const x = rect.x + rect.width / 2
  const start = rect.y + rect.height * 0.8
  const end = rect.y + rect.height * 0.25
  try {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y: start }],
    })
    for (let step = 1; step <= 10; step += 1) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: start + ((end - start) * step) / 10 }],
      })
      await page.waitForTimeout(20)
    }
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
  } finally {
    await client.detach()
  }
}

async function expectV23Geometry(frame: Frame): Promise<void> {
  const geometry = await frame.evaluate(() => {
    const card = document.querySelector('.chinaums-v23-dialog')!.getBoundingClientRect()
    const keyboard = document.querySelector('.chinaums-v23-keyboard')!.getBoundingClientRect()
    const keys = [...document.querySelectorAll('.chinaums-v23-key')]
    return {
      yuanbao: document.querySelector('[data-yuanbao-feedback="true"]') !== null,
      top: card.top,
      gap: keyboard.top - card.bottom,
      keyboardBottom: keyboard.bottom,
      viewportHeight: window.innerHeight,
      keyCount: keys.length,
      rows: new Set(keys.map((element) =>
        Math.round(element.getBoundingClientRect().top))).size,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }
  })

  expect(geometry.top).toBeGreaterThanOrEqual(geometry.yuanbao ? 0 : 15.9)
  expect(geometry.gap).toBeGreaterThan(0)
  expect(geometry.keyboardBottom).toBeLessThanOrEqual(geometry.viewportHeight + 0.5)
  expect(geometry.keyCount).toBe(12)
  expect(geometry.rows).toBe(4)
  expect(geometry.horizontalOverflow).toBe(false)
}

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.screenshot({ path: testInfo.outputPath(name), fullPage: false })
}

for (const profile of profiles) {
  test(`${profile.key} content growth stays reachable with profile layout`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 393, height: 640 })
    const frame = await openCard(page, profile.buttonName)
    await enlargeAgreementCopy(frame)

    const card = frame.locator('.chinaums-v23-dialog')
    await expect.poll(() =>
      card.evaluate((element) => element.getBoundingClientRect().top),
    ).toBeGreaterThanOrEqual(profile.key === 'yuanbao' ? 0 : 15.9)
    if (profile.key === 'yuanbao') {
      expect(await card.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
    } else {
      expect(await card.evaluate((element) => getComputedStyle(element).maxHeight))
        .not.toBe('none')
      expect(await card.evaluate((element) =>
        element.scrollHeight > element.clientHeight)).toBe(true)
      await expectV23Geometry(frame)

      await swipeUp(page, frame)
      await expect.poll(() => card.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0)
    }
    await expectV23Geometry(frame)
    await expect(frame.getByRole('button', { name: '关闭', exact: true }))
      .toBeInViewport()
    expect(await frame.evaluate(() =>
      (window as Window & {
        __mobileAuthHarness?: { providerTokenRequests: number }
      }).__mobileAuthHarness?.providerTokenRequests,
    )).toBe(0)

    if (profile.key === 'yuanbao') {
      await frame.locator('#ydrzAgreementControl a').first().click()
      await expect(frame.locator('.ydrz-confirm-iframe')).toBeVisible()
      await frame.locator('.ydrz-confirm-iframe .ydrz-confirm-header em').click()
      await expect(frame.getByLabel('安全键盘')).toHaveAttribute('aria-hidden', 'false')
      await frame.getByRole('button', { name: '输入 1', exact: true }).click()
      await expect(frame.locator('.chinaums-v23-id-box').first()).toHaveText('1')
      await frame.getByRole('button', { name: '删除', exact: true }).click()
      await expect(frame.locator('.chinaums-v23-id-box').first()).toHaveText('')
    }

    const other = frame.getByRole('button', {
      name: '选择其他方式',
      exact: true,
    })
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (await other.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return rect.top >= 0 && rect.bottom <= window.innerHeight
      })) break
      await swipeUp(page, frame)
    }
    const bottomSpace = await frame.evaluate(() => {
      const cardRect = document.querySelector('.chinaums-v23-dialog')!
        .getBoundingClientRect()
      const otherRect = document.querySelector('.chinaums-v23-other')!
        .getBoundingClientRect()
      return cardRect.bottom - otherRect.bottom
    })
    expect(bottomSpace).toBeGreaterThan(0)
    await other.click({ trial: true })
    await capture(page, testInfo, `${profile.key}-small-viewport.png`)
    await other.click()
    await expect(page.locator('iframe[data-assistance-auth-frame="true"]'))
      .toHaveCount(0)
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })
}

test('yuanbao error state remains reachable after a short viewport resize', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  const frame = await openCard(page, '测试元保三要素皮肤')
  await frame.locator('[data-sdk-stub-click-target]').click()
  await expect(frame.getByRole('alert')).toHaveText('!请完整输入身份证后4位数字')
  await expectV23Geometry(frame)

  await page.setViewportSize({ width: 393, height: 480 })
  const card = frame.locator('.chinaums-v23-dialog')
  await expect.poll(() =>
    card.evaluate((element) => element.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(15.9)
  await expectV23Geometry(frame)
  await expect(frame.getByRole('button', { name: '关闭', exact: true }))
    .toBeInViewport()
  await frame.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.locator('iframe[data-assistance-auth-frame="true"]')).toHaveCount(0)
})

test('built Yuanbao keeps the pending presentation and GIF asset in the static site', async ({ page }, testInfo) => {
  test.skip(!siteDirectory, 'V23_SITE_DIR is required for built-site validation')
  await page.setViewportSize({ width: 390, height: 844 })
  const frame = await openCard(page, '测试元保三要素皮肤')
  await expect(frame.getByTestId('chinaums-sheet-v23-root')).toHaveAttribute('data-yuanbao-feedback', 'true')
  await capture(page, testInfo, 'yuanbao-built-normal.png')

  const submit = frame.locator('[data-sdk-stub-click-target]')
  await submit.click()
  await expect(frame.getByRole('alert')).toHaveText('!请完整输入身份证后4位数字')
  await capture(page, testInfo, 'yuanbao-built-error.png')

  for (const key of '1234') {
    await frame.getByRole('button', { name: `输入 ${key}`, exact: true }).click()
  }
  const gifResponse = page.waitForResponse((response) => response.url().includes('yuanbao-loading') && response.url().endsWith('.gif'))
  await submit.click()
  const status = frame.getByRole('status', { name: '加载中' })
  await expect(status).toHaveText('同意并登录')
  const image = status.locator('img')
  expect(await image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true)
  expect(await image.getAttribute('src')).toMatch(/yuanbao-loading-[^/]+\.gif$/)
  expect((await gifResponse).headers()['content-type']).toContain('image/gif')
  await capture(page, testInfo, 'yuanbao-built-pending.png')
  await expect(frame.locator('.chinaums-v23-loading-card')).toHaveCount(0)
  await expect(frame.locator('.chinaums-v23-submit')).toHaveCSS('background-color', 'rgb(153, 153, 153)')
})

test('zidingyi keeps its normal composition at 390x844', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const frame = await openCard(page, '测试银联三要素皮肤（zidingyi）')
  await expectV23Geometry(frame)
  const card = frame.locator('.chinaums-v23-dialog')
  expect(await card.evaluate((element) => element.scrollHeight <= element.clientHeight))
    .toBe(true)
  await capture(page, testInfo, 'zidingyi-normal-390x844.png')
  await frame.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.locator('iframe[data-assistance-auth-frame="true"]')).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})
