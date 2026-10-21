import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const sdkUrl = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.2.6/assistance-mobile-auth/assistance-mobile-auth.0.2.6.umd.cjs'
const esmUrl = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.2.6/assistance-mobile-auth/assistance-mobile-auth.0.2.6.js'
const appId = '8a9481c79c05c8bd019eed11ac2b1e79'
const html = readFileSync(new URL('./manual/yuanbao-production-sdk.html', import.meta.url), 'utf8')
const mockSdk = `
  window.calls = []; window.destroyed = 0;
  window.AssistanceMobileAuth = { createAssistanceMobileAuthSdk(options) {
    window.lastOptions = options;
    window.calls.push({ appId: options.appId, display: options.display, useCustomKeyboard: options.useCustomKeyboard });
    return { open(request) { window.calls.at(-1).request = request; return new Promise((resolve, reject) => { window.finish = resolve; window.fail = reject; }); },
      destroy() { window.destroyed++; } };
  } };
`
const mockEsm = `
  export function createAssistanceMobileAuthSdk(options) {
    window.esmOptions = options;
    window.esmDestroyed = (window.esmDestroyed || 0);
    return {
      precheck(request) { window.esmPrecheck = request; return Promise.resolve({ eligible: true, reason: 'ok' }); },
      open(request) { window.esmOpen = request; return new Promise(resolve => { window.esmFinish = resolve; }); },
      destroy() { window.esmDestroyed++; }
    };
  }
`

test.beforeEach(async ({ page }) => {
  await page.route('**/test-yuanbao-production.html', route => route.fulfill({ contentType: 'text/html', body: html }))
})

test('UMD button calls the fixed production SDK and cleans up without concurrency', async ({ page }) => {
  let releaseScript!: () => void
  const gate = new Promise<void>(resolve => { releaseScript = resolve })
  await page.route(sdkUrl, async route => { await gate; await route.fulfill({ contentType: 'application/javascript', body: mockSdk }) })
  await page.goto('/test-yuanbao-production.html', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#sdk-state')).toHaveText('SDK 加载中…')
  await expect(page.locator('button')).toHaveCount(2)
  await expect(page.locator('#test-app')).toBeDisabled()
  await expect(page.locator('#test-esm')).toBeEnabled()
  await expect(page.locator('h1')).toHaveText('正式 SDK 测试')
  releaseScript()
  await expect(page.locator('#sdk-state')).toHaveText('SDK 已就绪')
  await expect(page.locator('script[src]')).toHaveAttribute('src', sdkUrl)
  await expect(page.locator('#sdk-url')).toHaveAttribute('href', sdkUrl)
  await expect(page.locator('#sdk-url')).toHaveText(sdkUrl)
  for (let call = 1; call <= 2; call++) {
    await page.locator('#test-app').click()
    await expect(page.locator('#selected-app')).toHaveText(appId)
    await expect(page.locator('#test-app')).toBeDisabled()
    await expect(page.locator('#result')).toHaveText('等待 SDK 返回…')
    expect(await page.evaluate(() => (window as any).calls.at(-1))).toEqual({ appId, display: 'modal', useCustomKeyboard: true, request: { scene: 'native-number' } })
    await page.evaluate(() => { document.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(await page.evaluate(() => (window as any).calls.length)).toBe(call)
    await page.evaluate(() => (window as any).finish({ token: 'test-token', idLast4: '1234', keyA: '<b>test-key</b>' }))
    await expect(page.locator('#request-state')).toHaveText('授权结果已返回')
    await expect(page.locator('#result')).toContainText('<b>test-key</b>')
    await expect(page.locator('#result b')).toHaveCount(0)
    await expect(page.locator('#test-app')).toBeEnabled()
  }
  expect(await page.evaluate(() => (window as any).destroyed)).toBe(2)
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
})

test('shows original callback error code, ignores stale callbacks and restores controls', async ({ page }) => {
  await page.route(sdkUrl, route => route.fulfill({ contentType: 'application/javascript', body: mockSdk }))
  await page.goto('/test-yuanbao-production.html')
  await page.locator('#test-app').click()
  await page.evaluate(() => {
    const w = window as any
    w.staleError = w.lastOptions.onError
    w.lastOptions.onError({ code: '200100', message: 'SDK 原始错误' })
    w.fail(new Error('普通 Promise 错误'))
  })
  await expect(page.locator('#result')).toContainText('200100')
  await expect(page.locator('#result')).toContainText('SDK 原始错误')
  await page.locator('#test-app').click()
  await expect(page.locator('#result')).toHaveText('等待 SDK 返回…')
  await page.evaluate(() => { const w = window as any; w.staleError({ code: 'OLD', message: '旧回调' }); w.fail(new Error('本次失败')) })
  await expect(page.locator('#result')).toHaveText(JSON.stringify({ message: '本次失败' }, null, 2))
  expect(await page.evaluate(() => (window as any).destroyed)).toBe(2)
  await expect(page.locator('#test-app')).toBeEnabled()
})

test('keeps the button disabled when the production script fails to load', async ({ page }) => {
  await page.route(sdkUrl, route => route.abort())
  await page.goto('/test-yuanbao-production.html')
  await expect(page.locator('#sdk-state')).toContainText('SDK 加载失败')
  await expect(page.locator('#test-app')).toBeDisabled()
  await expect(page.locator('#test-esm')).toBeEnabled()
})

test('ESM button imports the exact version and passes every customer option through precheck and open', async ({ page }) => {
  let esmRequests = 0
  await page.route(sdkUrl, route => route.fulfill({ contentType: 'application/javascript', body: mockSdk }))
  await page.route(esmUrl, route => {
    esmRequests++
    return route.fulfill({ contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: mockEsm })
  })
  await page.goto('/test-yuanbao-production.html')
  await expect(page.locator('#esm-url')).toHaveAttribute('href', esmUrl)
  await expect(page.locator('#esm-code')).toContainText('await import(ESM_URL)')
  await expect(page.locator('#esm-code')).toContainText(`const APP_ID = "${appId}";`)
  await expect(page.locator('#esm-code')).toContainText('createAssistanceMobileAuthSdk({')
  await expect(page.locator('#esm-code')).toContainText('appId: APP_ID,')
  await expect(page.locator('#esm-code')).toContainText("timeoutMs: 3000")
  await expect(page.locator('#esm-code')).toContainText("bgColor: '#3B6EE5'")
  await page.locator('#test-esm').click()
  await expect(page.locator('#esm-sdk-state')).toHaveText('SDK 已加载')
  await expect(page.locator('#test-esm')).toBeDisabled()
  expect(esmRequests).toBe(1)
  const actual = await page.evaluate(() => {
    const w = window as any
    return {
      optionKeys: Object.keys(w.esmOptions).sort(),
      appId: w.esmOptions.appId,
      styleOption: w.esmOptions.styleOption,
      precheck: w.esmPrecheck,
      open: w.esmOpen,
      callbacks: ['onReady', 'onSuccess', 'onCancel', 'onError', 'onClose', 'onErrorNotice'].map(key => typeof w.esmOptions[key])
    }
  })
  expect(actual.optionKeys).toEqual(['appId', 'onCancel', 'onClose', 'onError', 'onErrorNotice', 'onReady', 'onSuccess', 'styleOption'])
  expect(actual.appId).toBe(appId)
  expect(actual.callbacks).toEqual(Array(6).fill('function'))
  expect(actual.styleOption).toEqual({
    submitBtnStyle: { height: '52px', bgColor: '#3B6EE5', fontColor: '#FFFFFF', fontSize: '24px', name: '同意并继续' },
    submitBtnDisabledStyle: { height: '52px', bgColor: '#9A9A9A', fontColor: '#FFFFFF', fontSize: '24px', name: '同意并继续' },
    submitBtnLoadingStyle: { height: '52px', bgColor: '#3B6EE5', fontColor: '#FFFFFF', fontSize: '24px', name: '同意并继续' },
    phoneStyle: { fontColor: '#000000', fontSize: '14px' },
    localTipStyle: { fontColor: '#959595', fontSize: '10px' },
    unlocalTipStyle: { fontColor: '#959595', fontSize: '10px' },
    stateStyle: { fontColor: '#959595', fontSize: '10px', borderRadius: '8px' },
    authTextStyle: { fontColor: '#959595', fontSize: '10px', borderRadius: '8px' },
    authExpireStyle: { fontColor: '#959595', fontSize: '10px', borderRadius: '8px' },
    checkboxStyle: { width: '14px', height: '14px', checkedColor: '#3B6EE5', borderColor: '#959595' }
  })
  expect(actual.precheck).toEqual({ scene: 'native-number', requestId: actual.open.requestId, timeoutMs: 3000 })
  expect(actual.open).toEqual({ scene: 'native-number', requestId: expect.stringMatching(/^[0-9a-f-]{36}-[0-9a-z]+$/) })
  await page.evaluate(() => { document.querySelector<HTMLButtonElement>('#test-esm')!.click() })
  expect(esmRequests).toBe(1)
  await page.evaluate(() => { const w = window as any; w.esmOptions.onErrorNotice({ code: 'NOTICE', message: '<b>提示</b>' }) })
  await expect(page.locator('#esm-request-state')).toHaveText('授权错误')
  await expect(page.locator('#esm-result')).toContainText('<b>提示</b>')
  await expect(page.locator('#esm-result b')).toHaveCount(0)
  await page.evaluate(() => { (window as any).esmFinish({ token: 'test-token', idLast4: '1234', keyA: 'test-key' }) })
  await expect(page.locator('#esm-request-state')).toHaveText('授权结果已返回')
  await expect(page.locator('#test-esm')).toBeEnabled()
  expect(await page.evaluate(() => (window as any).esmDestroyed)).toBe(1)
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])
})

test('ESM import failure stays visible and restores its button', async ({ page }) => {
  await page.route(sdkUrl, route => route.fulfill({ contentType: 'application/javascript', body: mockSdk }))
  await page.route(esmUrl, route => route.abort())
  await page.goto('/test-yuanbao-production.html')
  await page.locator('#test-esm').click()
  await expect(page.locator('#esm-sdk-state')).toHaveText('ESM 加载失败')
  await expect(page.locator('#esm-request-state')).toHaveText('调用未完成')
  await expect(page.locator('#esm-result')).toContainText('Failed to fetch dynamically imported module')
  await expect(page.locator('#test-esm')).toBeEnabled()
  await expect(page.locator('#test-app')).toBeEnabled()
})

test('ESM constructor receives appId and displays its original error', async ({ page }) => {
  await page.route(sdkUrl, route => route.fulfill({ contentType: 'application/javascript', body: mockSdk }))
  await page.route(esmUrl, route => route.fulfill({
    contentType: 'application/javascript',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: 'export function createAssistanceMobileAuthSdk(options) { window.esmConstructorAppId = options.appId; throw Object.assign(new Error("构造器原始错误"), { code: "CONSTRUCTOR_FAILURE" }); }'
  }))
  await page.goto('/test-yuanbao-production.html')
  await page.locator('#test-esm').click()
  await expect(page.locator('#esm-sdk-state')).toHaveText('SDK 已加载')
  await expect(page.locator('#esm-request-state')).toHaveText('调用未完成')
  await expect(page.locator('#esm-result')).toContainText('构造器原始错误')
  await expect(page.locator('#esm-result')).toContainText('CONSTRUCTOR_FAILURE')
  expect(await page.evaluate(() => (window as any).esmConstructorAppId)).toBe(appId)
  await expect(page.locator('#test-esm')).toBeEnabled()
})
