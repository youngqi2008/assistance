import { expect, test, type Frame, type Page } from '@playwright/test'

import {
  expectInitControlReady,
  installMobileAssistantRoutes,
  installMobileAuthSdkStub,
  installSessionRoutes,
  triggerShowAuthPageSuccess,
  waitForAssistanceSdkFactory,
} from './mobile-auth-flow-helpers'

const liveTempBaseUrl = process.env.PLAYWRIGHT_LIVE_TEMP_BASE_URL
const deployCheck = process.env.PLAYWRIGHT_DEPLOY_CHECK
const runLocalWrapperRegression = process.env.PLAYWRIGHT_LOCAL_WRAPPER_REGRESSION === 'true'

type NotificationTestMode =
  | 'absent'
  | 'before-login-only'
  | 'state-change-only'
  | 'both'
  | 'throw'
  | 'reject'

type NotificationHarness = {
  onBeforeLoginCalls: number
  onStateChangeCalls: number
  log: Array<{
    callback: 'onBeforeLogin' | 'onStateChange'
    event: 'idLast4Complete' | 'idLast4Incomplete'
    calls: number
  }>
}

test('preserveWrapper keeps the browser-served UMD instead of importing source', async ({ page }) => {
  test.skip(!runLocalWrapperRegression, 'PLAYWRIGHT_LOCAL_WRAPPER_REGRESSION=true is required for helper coverage')

  const sourceWrapperRequests: string[] = []

  await page.route('**/assistance-mobile-auth/assistance-mobile-auth.umd.cjs', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.AssistanceMobileAuth = {
          createAssistanceMobileAuthSdk: () => ({}),
        };
      `,
    })
  })
  await page.route('**/sign-pay-pro/src/wrapper/index.ts', async (route) => {
    sourceWrapperRequests.push(route.request().url())
    await route.fulfill({ status: 404 })
  })
  await installMobileAuthSdkStub(page, { preserveWrapper: true })
  await page.goto('/sign-pay-pro/test-page')

  await waitForAssistanceSdkFactory(page)
  expect(sourceWrapperRequests).toEqual([])
})

test('preserveWrapper keeps the injected SDK stub when the official JSSDK loads', async ({ page }) => {
  test.skip(!runLocalWrapperRegression, 'PLAYWRIGHT_LOCAL_WRAPPER_REGRESSION=true is required for helper coverage')

  await page.route('**/assistance-mobile-auth/assistance-mobile-auth.umd.cjs', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.AssistanceMobileAuth = {
          createAssistanceMobileAuthSdk: () => ({}),
        };
      `,
    })
  })
  await page.route('https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: 'window.YDRZAuthSF = { showAuthPage() {} };',
    })
  })
  await installMobileAuthSdkStub(page, { preserveWrapper: true })
  await page.goto('/sign-pay-pro/test-page')
  await waitForAssistanceSdkFactory(page)
  await page.addScriptTag({
    url: 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js',
  })

  expect(await page.evaluate(() => {
    const targetWindow = window as Window & {
      YDRZAuthSF?: { showAuthPage(request: { data: Record<string, string> }): void }
      __mobileAuthHarness?: { lastShowAuthPageRequest?: unknown }
    }

    targetWindow.YDRZAuthSF?.showAuthPage({ data: {} })
    return targetWindow.__mobileAuthHarness?.lastShowAuthPageRequest != null
  })).toBe(true)
})

async function openLiveChinaumsSheet(
  page: Page,
  {
    notificationMode = 'absent',
    pauseBeforeSdkSuccess = false,
  }: {
    notificationMode?: NotificationTestMode
    pauseBeforeSdkSuccess?: boolean
  } = {},
): Promise<Frame> {
  await installMobileAuthSdkStub(page, {
    agreementFixture: 'v23-production',
    preserveWrapper: true,
    submitElementTag: 'official-nested',
  })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto(`${liveTempBaseUrl}/test-page?deployCheck=${deployCheck}`)
  await waitForAssistanceSdkFactory(page)
  await page.getByRole('combobox', { name: '通知回调观察模式' })
    .selectOption(notificationMode)
  await page.getByRole('button', { name: '测试银联三要素皮肤（zidingyi）' }).click()

  const frameElement = page.locator('iframe[title="银杏助填版本23"]')
  await expect(frameElement).toBeVisible()
  const frame = await (await frameElement.elementHandle())?.contentFrame()

  if (!frame) {
    throw new Error('live V23 verification iframe did not expose a content frame')
  }

  await frame.waitForLoadState('domcontentloaded')
  if (pauseBeforeSdkSuccess) {
    return frame
  }
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  return frame
}

async function enterVirtualIdLast4(frame: Frame, value: string) {
  for (const character of value) {
    await frame.getByRole('button', { name: `输入 ${character.toUpperCase()}` }).click()
  }
}

async function readBeforeSubmitResults(frame: Frame): Promise<boolean[]> {
  return frame.evaluate(() => (
    (window as Window & {
      __mobileAuthHarness?: { beforeSubmitResults: boolean[] }
    }).__mobileAuthHarness?.beforeSubmitResults ?? []
  ))
}

async function readNotificationHarness(page: Page): Promise<NotificationHarness> {
  return page.evaluate(() => {
    const harness = (window as Window & {
      __assistanceNotificationHarness?: NotificationHarness
    }).__assistanceNotificationHarness

    return harness
      ? {
          onBeforeLoginCalls: harness.onBeforeLoginCalls,
          onStateChangeCalls: harness.onStateChangeCalls,
          log: harness.log,
        }
      : {
          onBeforeLoginCalls: 0,
          onStateChangeCalls: 0,
          log: [],
        }
  })
}

test('deployed V23 loads its assets, reports both notifications, and submits once', async ({ page }) => {
  test.skip(!liveTempBaseUrl, 'PLAYWRIGHT_LIVE_TEMP_BASE_URL is required for live deployment smoke coverage')

  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.setViewportSize({ width: 390, height: 844 })
  const frame = await openLiveChinaumsSheet(page, {
    notificationMode: 'both',
    pauseBeforeSdkSuccess: true,
  })
  expect(await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))).toEqual({ width: 390, height: 844 })

  const loading = frame.getByRole('region', { name: '加载中' })
  const keyboard = frame.getByLabel('安全键盘', { selector: 'section' })
  const hand = frame.getByTestId('chinaums-v23-hand')
  const iframe = page.locator('iframe[title="银杏助填版本23"]')
  const shell = page.locator('#assistance-mobile-auth-frame-shell')

  await expect(loading).toBeVisible()
  await expect(keyboard).toHaveAttribute('aria-hidden', 'true')
  await expect(keyboard).toHaveCSS('opacity', '0')
  await expect(shell).toHaveAttribute('aria-hidden', 'true')
  await expect(shell).not.toHaveAttribute('role', 'dialog')
  await expect(shell).toHaveCSS('pointer-events', 'none')
  await expect(iframe).toHaveAttribute('aria-hidden', 'true')
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')

  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(loading).toHaveCount(0)
  const root = frame.getByTestId('chinaums-sheet-v23-root')
  await expect(root).toBeVisible()
  await expect(root).toHaveAttribute('data-zidingyi-feedback', 'true')
  await expect(shell).toHaveAttribute('role', 'dialog')
  await expect(shell).not.toHaveAttribute('aria-hidden', 'true')
  await expect(shell).toHaveCSS('pointer-events', 'auto')
  await expect(iframe).not.toHaveAttribute('aria-hidden', 'true')
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await expect(frame.locator('.chinaums-v23-id-box')).toHaveCount(4)
  await expect(frame.locator('.chinaums-v23-id-box').first()).toHaveCSS('color', 'rgb(51, 51, 51)')
  await expect(frame.getByTestId('chinaums-v23-id-caret')).toHaveCount(1)
  await expect(frame.locator('#ydrzSubmitControl')).toHaveCSS('font-weight', '700')
  await expect(keyboard).toBeVisible()
  await expect(keyboard).toHaveAttribute('aria-hidden', 'false')
  await expect(keyboard).toHaveCSS('opacity', '1')
  await expect(frame.getByRole('textbox', { name: '身份证后四位' })).toHaveCount(0)
  expect(await iframe.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      background: style.backgroundColor,
      borderTopLeftRadius: style.borderTopLeftRadius,
      borderTopRightRadius: style.borderTopRightRadius,
      borderBottomRightRadius: style.borderBottomRightRadius,
      borderBottomLeftRadius: style.borderBottomLeftRadius,
      boxShadow: style.boxShadow,
    }
  })).toEqual({
    background: 'rgba(0, 0, 0, 0)',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    borderBottomRightRadius: '0px',
    borderBottomLeftRadius: '0px',
    boxShadow: 'none',
  })

  const inputKeys = keyboard.getByRole('button')
  await expect(inputKeys).toHaveCount(12)
  const [keyboardBox, firstKeyBox, thirdKeyBox] = await Promise.all([
    keyboard.boundingBox(),
    inputKeys.nth(0).boundingBox(),
    inputKeys.nth(2).boundingBox(),
  ])
  expect(keyboardBox).not.toBeNull()
  expect(firstKeyBox).not.toBeNull()
  expect(thirdKeyBox).not.toBeNull()
  expect(keyboardBox!.x).toBeCloseTo(0, 0)
  expect(keyboardBox!.width).toBeCloseTo(390, 0)
  expect(firstKeyBox!.x).toBeGreaterThan(0)
  expect(thirdKeyBox!.x + thirdKeyBox!.width).toBeLessThan(390)
  expect(firstKeyBox!.x).toBeCloseTo(390 - (thirdKeyBox!.x + thirdKeyBox!.width), 0)
  const keyBoxes = await inputKeys.evaluateAll(
    (buttons) => buttons.map((button) => button.getBoundingClientRect().toJSON()),
  )
  const rowCounts = new Map<number, number>()
  for (const box of keyBoxes) {
    const rowTop = Math.round(box.top)
    rowCounts.set(rowTop, (rowCounts.get(rowTop) ?? 0) + 1)
  }
  expect([...rowCounts.values()]).toEqual([3, 3, 3, 3])

  const visualViewportBottom = await page.evaluate(() => (
    (window.visualViewport?.offsetTop ?? 0)
    + (window.visualViewport?.height ?? window.innerHeight)
  ))
  for (const key of [
    frame.getByRole('button', { name: '输入 X' }),
    frame.getByRole('button', { name: '输入 0' }),
    frame.getByRole('button', { name: '删除' }),
  ]) {
    const box = await key.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y + box!.height).toBeLessThanOrEqual(visualViewportBottom + 1)
  }

  await expect(hand).toHaveJSProperty('complete', true)
  expect(await hand.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
  await expect(hand).toHaveAttribute('data-visible', 'false')

  await enterVirtualIdLast4(frame, '12X9')
  await expect(frame.getByLabel('身份证后四位第 1 位')).toHaveText('1')
  await expect(frame.getByLabel('身份证后四位第 2 位')).toHaveText('2')
  await expect(frame.getByLabel('身份证后四位第 3 位')).toHaveText('X')
  await expect(frame.getByLabel('身份证后四位第 4 位')).toHaveText('9')
  await expect(frame.getByTestId('chinaums-v23-id-caret')).toHaveCount(0)
  await expect(hand).toHaveAttribute('data-visible', 'true')
  await expect(hand).toHaveCSS('animation-name', 'chinaums-v23-hand-tap')
  await expect.poll(() => readNotificationHarness(page)).toEqual({
    onBeforeLoginCalls: 1,
    onStateChangeCalls: 1,
    log: [
      { callback: 'onStateChange', event: 'idLast4Complete', calls: 1 },
      { callback: 'onBeforeLogin', event: 'idLast4Complete', calls: 1 },
    ],
  })
  await frame.getByTestId('chinaums-v23-submit').click()
  await expect.poll(() => readBeforeSubmitResults(frame)).toEqual([true])
  await expect(iframe).toBeVisible()

  expect(pageErrors).toEqual([])
})

test('deployed default appId keeps the original bottom-sheet presentation', async ({ page }) => {
  test.skip(!liveTempBaseUrl, 'PLAYWRIGHT_LIVE_TEMP_BASE_URL is required for live deployment smoke coverage')

  await installMobileAuthSdkStub(page, {
    preserveWrapper: true,
    submitElementTag: 'official-nested',
  })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto(`${liveTempBaseUrl}/test-page?deployCheck=${deployCheck}`)
  await waitForAssistanceSdkFactory(page)
  await page.getByRole('button', { name: '立即支付-jssdk' }).click()

  const shell = page.locator('#assistance-mobile-auth-frame-shell')
  const iframe = page.locator('iframe[title="移动认证验证窗口"]')
  await expect(iframe).toBeVisible()
  await expect(shell).toHaveAttribute('role', 'dialog')
  await expect(shell).not.toHaveAttribute('aria-hidden', 'true')
  expect(await iframe.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      background: style.backgroundColor,
      borderTopLeftRadius: style.borderTopLeftRadius,
      borderTopRightRadius: style.borderTopRightRadius,
      boxShadow: style.boxShadow,
    }
  })).toEqual({
    background: 'rgb(255, 255, 255)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: 'rgba(15, 23, 42, 0.18) 0px -16px 40px 0px',
  })

  const frame = await (await iframe.elementHandle())?.contentFrame()
  if (!frame) {
    throw new Error('live default verification iframe did not expose a content frame')
  }
  await frame.waitForLoadState('domcontentloaded')
  await frame.getByRole('button', { name: '关闭' }).click()
  await expect(iframe).toHaveCount(0)
})

test('deployed non-target Haike appId keeps the original bottom-sheet presentation', async ({ page }) => {
  test.skip(!liveTempBaseUrl, 'PLAYWRIGHT_LIVE_TEMP_BASE_URL is required for live deployment smoke coverage')

  await installMobileAuthSdkStub(page, {
    preserveWrapper: true,
    submitElementTag: 'official-nested',
  })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto(`${liveTempBaseUrl}/test-page?deployCheck=${deployCheck}`)
  await waitForAssistanceSdkFactory(page)
  await page.getByText('测试海客四协议（指定 appId）', { exact: true }).evaluate((element) => {
    ;(element as HTMLButtonElement).click()
  })

  const iframe = page.locator('iframe[title="海客四协议验收"]')
  await expect(iframe).toBeVisible()
  expect(await iframe.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      background: style.backgroundColor,
      borderTopLeftRadius: style.borderTopLeftRadius,
      borderTopRightRadius: style.borderTopRightRadius,
      boxShadow: style.boxShadow,
    }
  })).toEqual({
    background: 'rgb(255, 255, 255)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: 'rgba(15, 23, 42, 0.18) 0px -16px 40px 0px',
  })

  const frame = await (await iframe.elementHandle())?.contentFrame()
  if (!frame) {
    throw new Error('live non-target verification iframe did not expose a content frame')
  }
  await frame.waitForLoadState('domcontentloaded')
  await frame.getByRole('button', { name: '关闭' }).click()
  await expect(iframe).toHaveCount(0)
})

for (const notificationMode of ['throw', 'reject'] as const) {
  test(`deployed V23 ${notificationMode} notifications are ignored and provider submits directly`, async ({ page }) => {
    test.skip(!liveTempBaseUrl, 'PLAYWRIGHT_LIVE_TEMP_BASE_URL is required for live deployment smoke coverage')

    const frame = await openLiveChinaumsSheet(page, { notificationMode })
    await enterVirtualIdLast4(frame, '1234')
    await expect.poll(() => readNotificationHarness(page)).toEqual({
      onBeforeLoginCalls: 1,
      onStateChangeCalls: 1,
      log: [
        { callback: 'onStateChange', event: 'idLast4Complete', calls: 1 },
        { callback: 'onBeforeLogin', event: 'idLast4Complete', calls: 1 },
      ],
    })

    await frame.getByTestId('chinaums-v23-submit').click()

    await expect.poll(() => readBeforeSubmitResults(frame)).toEqual([true])
    await expect(frame.getByRole('status', { name: '加载中' })).toBeVisible()
    await expect(frame.getByRole('button', { name: '输入 1' })).toBeDisabled()
  })
}
