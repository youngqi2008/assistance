import { expect, test, type Frame } from '@playwright/test'
import { copyFile, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import type { MobileAuthSdkShowAuthPageData } from '../src/sdk/types'
import { installCustomOfficialStub, openCustomPage, readCustomBootConfig } from './custom-page-helpers'
import { readShowAuthPageData, triggerShowAuthPageSuccess, triggerInitControlAuthReady, triggerShowAuthPageError, triggerInitControlError, triggerInitControlSuccess } from './mobile-auth-flow-helpers'

function firstMobileParamsFixture(): MobileAuthSdkShowAuthPageData {
  return { version: '3.0', appId: 'provider-issued-a', sign: 'signed-fixture-a', traceId: 'trace-a', timestamp: '20261008010101000', authType: '0', scope: '3ElementsAuthAssistFill' }
}
function secondMobileParamsFixture(): MobileAuthSdkShowAuthPageData {
  return { version: '3.0', appId: 'provider-issued-b', sign: 'signed-fixture-b', traceId: 'trace-b', timestamp: '20261008020202000', authType: '0', scope: '3ElementsAuthAssistFill' }
}
test.beforeEach(async ({ page }) => { await installCustomOfficialStub(page, { agreementReader: true }) })
async function ready(frame: Frame) { await readCustomBootConfig(frame); await triggerShowAuthPageSuccess(frame); await triggerInitControlAuthReady(frame) }
async function enter(frame: Frame, value = '123X') { for (const key of value) await frame.locator(`[data-key="${key}"]`).click() }

function staticSlots(): string {
  return '<p id="async-css-proof">customer</p><div id="ydrzPhoneControl"></div><div id="ydrzTipsControl"></div><div id="ydrzStateControl"></div><div id="ydrzSubmitControl"></div><div id="ydrzAgreementControl"></div><div id="ydrzYZMControl"></div><div id="ydrzYZMBtnControl"></div>'
}

test('ready-created CSS already loaded before readiness reaches the real provider once', async ({ page }) => {
  let requests = 0
  const cssUrl = 'http://127.0.0.1:4183/sign-pay-pro-temp/async-ready.css'
  await page.route(cssUrl, route => { requests++; return route.fulfill({ contentType: 'text/css', body: '#async-css-proof{color:rgb(0,128,0)}' }) })
  const frame = await openCustomPage(page, { customPage: { html: staticSlots(), js: `
    window.AssistanceCustomPage.register({ready:new Promise((resolve,reject)=>{
      const style=document.createElement('style');
      style.onload=()=>{window.__readyCssDone=true;resolve();};
      style.onerror=()=>reject(new Error('ready CSS failed'));
      style.textContent=String.fromCharCode(64,105,109,112,111,114,116,32)+${JSON.stringify(JSON.stringify(cssUrl))}+';';
      document.querySelector('[data-custom-root]').append(style);
    })});` } })
  await expect.poll(() => frame.evaluate(() => (window as Window & { __readyCssDone?: boolean }).__readyCssDone)).toBe(true)
  await expect(frame.locator('#async-css-proof')).toHaveCSS('color', 'rgb(0, 128, 0)')
  await expect.poll(() => readShowAuthPageData(frame)).toBeTruthy()
  await ready(frame)
  expect(requests).toBe(1)
  expect(await frame.evaluate(() => [window.__mobileAuthHarness!.showAuthPageCalls.length, window.__mobileAuthHarness!.initControlCalls.length])).toEqual([1, 1])
})

test('enforced CSP refusal of customer JS fails once before provider initialization', async ({ page }) => {
  await page.goto('/sign-pay-pro-temp/test-custom-page-0.3.0.html')
  let releaseHtml!: () => void
  const held = new Promise<void>(resolve => { releaseHtml = resolve })
  let requested!: () => void
  const requestStarted = new Promise<void>(resolve => { requested = resolve })
  const policyMessages: string[] = []
  page.on('console', message => { if (/Content Security Policy|script-src/i.test(message.text())) policyMessages.push(message.text()) })
  await page.route('**/customer-policy.html', async route => {
    requested(); await held
    await route.fulfill({ contentType: 'text/html', body: staticSlots() })
  })
  await page.evaluate(params => {
    const evidence = { errors: [] as unknown[], notices: [] as unknown[], rejected: 0, presentations: 0 }
    Object.assign(window, { __policyEvidence: evidence })
    window.addEventListener('message', event => { if (event.data?.type === 'ASSISTANCE_AUTH_PRESENTATION_READY') evidence.presentations++ })
    const sdk = window.AssistanceMobileAuth!.createAssistanceMobileAuthSdk({
      appId: 'customer-policy-test', authParams: params,
      customPage: { url: new URL('customer-policy.html', location.href).href, js: 'window.__deniedCustomerRan=true;' },
      onError: error => evidence.errors.push(error), onErrorNotice: error => evidence.notices.push(error),
    })
    void sdk.open().catch(() => { evidence.rejected++ })
  }, firstMobileParamsFixture())
  const element = page.locator('iframe[data-assistance-auth-frame]')
  await expect(element).toBeAttached()
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('CSP fixture frame unavailable')
  try {
    await requestStarted // The built injected runtime is already running and awaiting customer HTML.
    await frame.evaluate(() => {
      const evidence = (window.parent as Window & { __policyEvidence: Record<string, unknown> }).__policyEvidence
      evidence.providerShows = window.__mobileAuthHarness!.showAuthPageCalls
      evidence.providerInits = window.__mobileAuthHarness!.initControlCalls
      const policy = document.createElement('meta')
      policy.httpEquiv = 'Content-Security-Policy'
      policy.content = "script-src 'self'; style-src 'self' 'unsafe-inline'"
      document.head.append(policy)
    })
  } finally { releaseHtml() }
  await expect(element).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => (window as Window & { __policyEvidence: { rejected: number } }).__policyEvidence.rejected)).toBe(1)
  expect(await page.evaluate(() => (window as Window & { __policyEvidence: unknown }).__policyEvidence)).toMatchObject({ errors: [expect.anything()], notices: [], rejected: 1, presentations: 0, providerShows: [], providerInits: [] })
  expect(policyMessages.some(message => /inline|script-src/.test(message))).toBe(true)
})

for (const js of [undefined, 'window.__allowedCustomerRan=(window.__allowedCustomerRan||0)+1;']) {
  test(`allowed ${js ? 'classic customer JS' : 'static HTML without registration'} initializes normally`, async ({ page }) => {
    const frame = await openCustomPage(page, { customPage: { html: staticSlots(), js } })
    await ready(frame)
    expect(await frame.evaluate(() => (window as Window & { __allowedCustomerRan?: number }).__allowedCustomerRan)).toBe(js ? 1 : undefined)
    expect(await frame.evaluate(() => window.__mobileAuthHarness!.initControlCalls.length)).toBe(1)
  })
}

test('RF4 two insufficient official clicks restore the label; legal double click starts one token request', async ({ page }) => {
  const frame = await openCustomPage(page); await ready(frame)
  const button = frame.locator('[data-sdk-stub-click-target]')
  await enter(frame, '1'); await button.click()
  await expect(frame.getByText('请完整输入身份证后4位数字')).toBeVisible()
  await expect(frame.locator('#ydrzSubmitControl')).not.toHaveClass(/disabled/)
  await expect(button).toContainText('同意并登录')
  await frame.waitForTimeout(1050) // The actual provider throttles trusted clicks for one second.
  await button.click(); await expect(button).toContainText('同意并登录')
  expect(await frame.evaluate(() => window.__mobileAuthHarness!.beforeSubmitResults)).toEqual([false, false])
  expect(await frame.evaluate(() => window.__mobileAuthHarness!.providerTokenRequests)).toBe(0)
  await enter(frame, '23X'); await frame.waitForTimeout(1050); await button.click(); await button.click({ force: true })
  expect(await frame.evaluate(() => window.__mobileAuthHarness!.providerTokenRequests)).toBe(1)
  await expect(frame.locator('[data-busy]')).toBeVisible()
  await expect(frame.locator('[data-hand]')).not.toBeVisible()
  await triggerInitControlSuccess(frame, 'simulated-provider-token', 'simulated-provider-key')
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
  expect(await page.evaluate(() => (window as Window & { __customPageSession: { result: unknown } }).__customPageSession.result)).toMatchObject({ status: 'success', idLast4: '123X', token: 'simulated-provider-token', keyA: 'simulated-provider-key', requestId: 'custom-page-browser', message: '验证完成' })
})

test('URL template supports native input, closable false and caller check/uncheck submission recovery', async ({ page }) => {
  const frame = await openCustomPage(page, { templateMode: 'url', useCustomKeyboard: false, closable: false, agreements: [{ name: '客户服务协议', link: 'https://customer.example/terms' }] }); await ready(frame)
  await expect(frame.getByRole('button', { name: '关闭', exact: true })).toBeHidden()
  await expect(frame.locator('[data-keyboard]')).toBeHidden()
  const input = frame.locator('[data-id-value]'); await input.fill('123x'); await expect(input).toHaveValue('123X')
  const button = frame.locator('[data-sdk-stub-click-target]'); await button.click()
  await expect(frame.locator('[data-message]')).toHaveText('请先同意全部协议'); await expect(button).toContainText('同意并登录')
  const checkbox = frame.getByRole('checkbox', { name: '同意客户服务协议' }); await checkbox.check(); await checkbox.uncheck(); await checkbox.check()
  await frame.waitForTimeout(1050); await button.click(); await expect(frame.locator('[data-busy]')).toBeVisible()
  expect(await frame.evaluate(() => window.__mobileAuthHarness!.providerTokenRequests)).toBe(1)
})

async function visual(frame: Frame) {
  return frame.evaluate(() => ['[data-custom-template="yuanbao"]', '[data-card]', '[data-submit]', '[data-id-box]', '[data-agreements]'].map(selector => {
    const element = document.querySelector(selector)!; const css = getComputedStyle(element); const rect = element.getBoundingClientRect()
    return { background: css.backgroundColor, image: css.backgroundImage, border: css.borderColor, color: css.color, weight: css.fontWeight, width: rect.width, height: rect.height, x: rect.x, y: rect.y }
  }))
}
test('same template has identical cards, inputs, button and agreements for two appIds while keeping request identity', async ({ page }) => {
  const first = await openCustomPage(page, { appId: 'issued-a', authParams: firstMobileParamsFixture() }); await ready(first)
  const firstVisual = await visual(first)
  const second = await openCustomPage(page, { appId: 'issued-b', authParams: secondMobileParamsFixture() }); await ready(second)
  expect(await visual(second)).toEqual(firstVisual)
  expect((await readCustomBootConfig(second)).appId).toBe('issued-b')
  expect(await readShowAuthPageData(second)).toMatchObject(secondMobileParamsFixture())
})

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`input errors persist until four digits and keyboard can collapse/reopen at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const frame = await openCustomPage(page); await ready(frame)
    const keyboardBounds = await frame.locator('[data-keyboard]').boundingBox()
    expect(keyboardBounds!.x).toBe(0); expect(keyboardBounds!.width).toBe(viewport.width)
    const boxes = frame.locator('[data-id-box]')
    await expect(boxes.nth(1)).toHaveCSS('background-color', 'rgb(240, 244, 253)')
    await expect(boxes.first()).toHaveCSS('background-color', 'rgb(254, 249, 245)')
    await frame.locator('[data-sdk-stub-click-target]').click()
    await expect(boxes.first()).toHaveCSS('background-color', 'rgb(255, 245, 245)')
    await enter(frame, '12'); await expect(frame.locator('[data-input-error]')).toBeVisible()
    await enter(frame, '3X'); await expect(frame.locator('[data-input-error]')).toBeHidden()
    await expect(boxes.first()).toHaveCSS('color', 'rgb(51, 51, 51)')
    await expect(boxes.first()).toHaveCSS('font-weight', '700')
    await expect(frame.locator('[data-keyboard]')).toBeHidden()
    await frame.locator('[data-id-grid]').click(); await expect(frame.locator('[data-keyboard]')).toBeVisible()
    await expect(frame.locator('[data-key="0"]')).toBeInViewport()
    await expect(frame.locator('[data-key="delete"]')).toBeInViewport()
    await frame.locator('[data-key="delete"]').click(); expect((await frame.locator('[data-id-value]').inputValue())).toBe('123')
    await frame.getByRole('button', { name: '收起键盘', exact: true }).click(); await expect(frame.locator('[data-keyboard]')).toBeHidden()
    const card = await frame.locator('[data-card]').boundingBox(); expect(card!.y).toBeGreaterThanOrEqual(16)
    await frame.getByRole('button', { name: '关闭', exact: true }).focus(); await page.keyboard.press('Enter')
    await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
  })
}

test('complete input shows a static hand with reduced motion and reader preserves input/focus without SDK restart', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const frame = await openCustomPage(page); await ready(frame); await enter(frame)
  await expect(frame.locator('[data-hand]')).toBeVisible(); await expect(frame.locator('[data-hand]')).toHaveCSS('animation-name', 'none')
  const link = frame.locator('#ydrzAgreementControl a').filter({ hasText: '用户信息授权协议' }); await link.focus(); await link.click()
  const panel = frame.locator('.ydrz-confirm-iframe'); await expect(panel).toBeVisible()
  expect((await panel.boundingBox())!.height).toBeCloseTo(422, 0)
  const reader = await (await panel.locator('iframe').elementHandle())!.contentFrame()
  await expect(reader!.locator('[data-agreement-reader]')).toBeVisible()
  await frame.locator('.ydrz-confirm-header em').focus(); await page.keyboard.press('Enter')
  await expect(panel).toHaveCount(0); await expect(frame.locator('[data-id-value]')).toHaveValue('123X')
  await expect(link).toBeFocused()
  expect(await frame.evaluate(() => [window.__mobileAuthHarness!.showAuthPageCalls.length, window.__mobileAuthHarness!.initControlCalls.length])).toEqual([1, 1])
})

test('hand uses the approved motion only for complete ready input and hides after provider errors', async ({ page }) => {
  const frame = await openCustomPage(page); await ready(frame); await enter(frame)
  const hand = frame.locator('[data-hand]'); await expect(hand).toBeVisible()
  await expect(hand).toHaveCSS('animation-duration', '1s'); await expect(hand).toHaveCSS('animation-timing-function', 'cubic-bezier(0.66, 0, 0.34, 1)')
  await frame.evaluate(() => window.YDRZAuthSF!.updateSubmitBtnStatus({ disabled: true }))
  await expect(hand).toBeHidden()
  await frame.evaluate(() => window.YDRZAuthSF!.updateSubmitBtnStatus({ disabled: false, loading: false }))
  await expect(hand).toBeVisible()
  await triggerInitControlError(frame, '103101', 'provider temporarily unavailable')
  await expect(hand).toBeHidden()
})

test('initial host scrolls and accepts clicks before any authorization is open', async ({ page }) => {
  await page.goto('/sign-pay-pro-temp/test-custom-page-0.3.0.html')
  await page.locator('#advanced summary').click()
  await page.locator('#appId').fill('customer-editable')
  await page.getByRole('checkbox', { name: '使用屏幕键盘' }).uncheck()
  await page.locator('.explanation').scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0)
  await expect(page.locator('#appId')).toHaveValue('customer-editable')
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
})

test('manual host owns one pending session during rapid clicks and can reopen after every terminal outcome', async ({ page }) => {
  await page.goto('/sign-pay-pro-temp/test-custom-page-0.3.0.html')
  await page.locator('#advanced summary').click()
  await page.locator('#authParams').fill(JSON.stringify(firstMobileParamsFixture()))
  let releaseResources!: () => void
  const held = new Promise<void>(resolve => { releaseResources = resolve })
  let sawRequest!: () => void
  const requested = new Promise<void>(resolve => { sawRequest = resolve })
  let templateRequests = 0
  await page.route('**/assist/0.3.0/examples/yuanbao/index.html', async route => {
    templateRequests++; sawRequest(); await held; await route.continue()
  })
  const openButton = page.locator('#open')
  await openButton.scrollIntoViewIfNeeded()
  const buttonBounds = (await openButton.boundingBox())!
  const x = buttonBounds.x + buttonBounds.width / 2; const y = buttonBounds.y + buttonBounds.height / 2
  try {
    await page.mouse.click(x, y); await requested
    await page.mouse.click(x, y)
    await expect(openButton).toBeDisabled()
    expect(templateRequests).toBe(1)
    await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
  } finally { releaseResources() }
  const currentFrame = async () => {
    const element = page.locator('iframe[data-assistance-auth-frame]')
    await expect(element).toHaveCount(1)
    const frame = await (await element.elementHandle())!.contentFrame()
    if (!frame) throw new Error('Manual host authorization iframe unavailable')
    return frame
  }
  const finished = async () => {
    await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
    await expect(openButton).toBeEnabled()
  }
  const canceled = await currentFrame(); await ready(canceled)
  expect(templateRequests).toBe(1)
  await expect(openButton).toBeDisabled()
  await canceled.getByRole('button', { name: '关闭', exact: true }).click(); await finished()

  await page.locator('#authParams').fill('{invalid JSON')
  await openButton.click(); await expect(page.locator('#status')).toContainText(/JSON|Unexpected/); await finished()

  await page.locator('#authParams').fill(JSON.stringify(firstMobileParamsFixture()))
  await openButton.click()
  const failed = await currentFrame(); await readCustomBootConfig(failed)
  await expect.poll(() => readShowAuthPageData(failed)).toBeTruthy()
  await triggerShowAuthPageError(failed, '103101', 'provider initialization failed'); await finished()

  await openButton.click()
  const completed = await currentFrame(); await ready(completed); await enter(completed)
  await completed.locator('[data-sdk-stub-click-target]').click()
  await triggerInitControlSuccess(completed, 'simulated-host-token', 'simulated-host-key'); await finished()
  await expect(page.locator('#status')).toHaveText('验证完成')
  await expect(page.locator('#result')).not.toContainText(/simulated-host-token|simulated-host-key/)

  await openButton.click()
  const reopened = await currentFrame(); await ready(reopened)
  await reopened.getByRole('button', { name: '关闭', exact: true }).click(); await finished()
})

test('provider initialization failure rejects and removes the actual wrapper session', async ({ page }) => {
  const frame = await openCustomPage(page); await readCustomBootConfig(frame)
  await expect.poll(() => readShowAuthPageData(frame)).toBeTruthy()
  await triggerShowAuthPageError(frame, '103101', 'initialization failed')
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
  expect(await page.evaluate(() => (window as Window & { __customPageSession: { error?: string } }).__customPageSession.error)).toBeTruthy()
})

test('shared 15 second startup deadline cleans up when provider never reports authReady', async ({ page }) => {
  const started = Date.now()
  const frame = await openCustomPage(page); await readCustomBootConfig(frame); await triggerShowAuthPageSuccess(frame)
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0, { timeout: 17000 })
  expect(Date.now() - started).toBeGreaterThanOrEqual(14500)
  expect(Date.now() - started).toBeLessThan(17000)
  expect(await page.evaluate(() => (window as Window & { __customPageSession: { error?: string } }).__customPageSession.error)).toBeTruthy()
})

test('failed reader stylesheet produces a reading notice and leaves main authorization active', async ({ page }) => {
  const templateBase = 'http://127.0.0.1:4183/sign-pay-pro-temp/assist/0.3.0/examples/yuanbao/'
  const html = await (await page.request.get(templateBase + 'index.html')).text()
  const css = await (await page.request.get(templateBase + 'style.css')).text()
  const js = await (await page.request.get(templateBase + 'page.js')).text()
  const fixture = path.resolve(process.env.CUSTOM_PAGE_TEST_DIST ?? 'dist-custom-temp', 'reader-style-test.css')
  await writeFile(fixture, 'body{font-family:system-ui}')
  const frame = await openCustomPage(page, { customPage: { html: html.replace('</head>', '<link rel="stylesheet" href="http://127.0.0.1:4183/sign-pay-pro-temp/reader-style-test.css"></head>'), css, js, baseUrl: templateBase } }); await ready(frame)
  // The actual parent uses the loaded URL; make that resource unavailable only to the reader.
  const { unlink } = await import('node:fs/promises'); await unlink(fixture)
  await frame.locator('#ydrzAgreementControl a').filter({ hasText: '用户信息授权协议' }).click()
  const reader = await (await frame.locator('.ydrz-confirm-iframe iframe').elementHandle())!.contentFrame()
  await expect(reader!.getByRole('alert')).toContainText('阅读资源加载失败')
  await frame.locator('.ydrz-confirm-header em').click()
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(1)
  expect(await page.evaluate(() => (window as Window & { __customPageSession: { result?: unknown; error?: unknown; notices: unknown[] } }).__customPageSession)).toMatchObject({ result: undefined, error: undefined })
})

test('URL redirect resolves real external CSS, image and font from final response directory', async ({ page }) => {
  const dist = path.resolve(process.env.CUSTOM_PAGE_TEST_DIST ?? 'dist-custom-temp')
  const target = path.join(dist, 'test-fixtures/final')
  try {
    await mkdir(target, { recursive: true })
    const template = await readFile('examples/yuanbao/index.html', 'utf8')
    const pageJs = await readFile('examples/yuanbao/page.js', 'utf8')
    await mkdir(path.join(target, 'assets'), { recursive: true })
    for (const name of ['header.png', 'middle.png', 'hand.png', 'loading.png', 'yuanbao-loading.gif']) await copyFile(path.join('examples/yuanbao/assets', name), path.join(target, 'assets', name))
    await copyFile('node_modules/playwright-core/lib/vite/traceViewer/codicon.DCmgc-ay.ttf', path.join(target, 'sample.ttf'))
    const templateCss = await readFile('examples/yuanbao/style.css', 'utf8')
    await writeFile(path.join(target, 'external.css'), `${templateCss}\n@font-face{font-family:BrowserResourceFont;src:url('./sample.ttf')}[data-custom-template="yuanbao"] [data-font-proof]{font-family:BrowserResourceFont}[data-header]{background-image:url('./assets/header.png')}`)
    await writeFile(path.join(target, 'index.html'), template.replace('</head>', '<link rel="stylesheet" href="external.css"></head>').replace('<main data-stage', '<span data-font-proof aria-hidden="true">\uea60</span><main data-stage'))
    const finalUrl = 'http://127.0.0.1:4183/sign-pay-pro-temp/test-fixtures/final/index.html'
    const redirectUrl = 'http://127.0.0.1:4183/sign-pay-pro-temp/test-fixtures/customer-redirect.html'
    const frame = await openCustomPage(page, { customPage: { url: redirectUrl, js: pageJs } }); await ready(frame)
    await expect(frame.locator('[data-header]')).toHaveAttribute('src', finalUrl.replace('index.html', 'assets/header.png'))
    await expect(frame.locator('[data-id-box]').nth(1)).toHaveCSS('background-color', 'rgb(240, 244, 253)')
    expect(await frame.evaluate(() => document.fonts.check('16px BrowserResourceFont', '\uea60'))).toBe(true)
    expect(await frame.evaluate(() => [...document.fonts].find(face => face.family === 'BrowserResourceFont')?.status)).toBe('loaded')
    expect(await frame.locator('[data-header]').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(frame.locator('[data-header]')).toHaveCSS('background-image', 'url("http://127.0.0.1:4183/sign-pay-pro-temp/test-fixtures/final/assets/header.png")')
  } finally {
    // Only the creating test owns this fixture; fullyParallel workers must not
    // delete its in-flight assets from their own afterAll hooks.
    await rm(target, { recursive: true, force: true })
  }
})
