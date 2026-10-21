import { expect, test, type Page } from '@playwright/test'
import { installDuodianOfficialStub, readyDuodian, enterId, waitForDuodianPresentation } from './duodian-health-helpers'
import { readCustomBootConfig } from './custom-page-helpers'
import { readShowAuthPageData, triggerInitControlSuccess } from './mobile-auth-flow-helpers'

const formalBase = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.0/'
const formalSdk = `${formalBase}assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.0.umd.cjs`
const helperUrl = 'https://ginkgo.chinaums.com/sign-pay-pro-temp/assist/0.3.0/test-host-params.js'
const hostUrl = process.env.PLAYWRIGHT_LIVE_HOST_URL ?? `http://127.0.0.1:${process.env.PLAYWRIGHT_FORMAL_HOST_PORT ?? '4197'}/sign-pay-pro-temp/test-duodian-health-formal-0.3.0.html`

test.beforeEach(async ({ page }) => {
  // Only the carrier is simulated. Remove the existing helper's local TEMP asset forwarding.
  // This suite does not open the agreement reader. Its optional overlay decorator
  // can install twice in same-origin WebKit initial documents and corrupt the double.
  await installDuodianOfficialStub(page, { agreementReader: false })
  await page.unroute('https://ginkgo.chinaums.com/sign-pay-pro-temp/assist/**')
  if (!process.env.PLAYWRIGHT_LIVE_HOST_URL) {
    await page.route('**/assist/0.3.0/test-host-params.js', async route => {
      const response = await route.fetch({ url: helperUrl })
      await route.fulfill({ response })
    })
  }
})

async function openFrame(page: Page) {
  const element = page.locator('iframe[data-assistance-auth-frame]')
  await expect(element).toHaveCount(1)
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Formal SDK iframe unavailable')
  await frame.waitForURL(`${formalBase}custom-verification.html?**`)
  expect(new URL(frame.url()).origin + new URL(frame.url()).pathname).toBe(`${formalBase}custom-verification.html`)
  await readyDuodian(page, frame)
  return frame
}

test('formal resources, gray-to-green 0000, full MOCK_ONLY result, cancel, reopen and native settings', async ({ page }, info) => {
  const requests: string[] = []
  const responses: Array<{ url: string; status: number }> = []
  const logs: string[] = []
  page.on('request', request => requests.push(request.url()))
  page.on('response', response => responses.push({ url: response.url(), status: response.status() }))
  page.on('console', message => logs.push(message.text()))
  await page.goto(hostUrl)
  await expect(page.locator('#sdkStatus')).toContainText('已加载')
  await expect(page.locator('#sdkUrl')).toHaveText(formalSdk)
  await expect(page.locator('#sdkVersion')).toHaveText('0.3.0')
  await expect(page.locator('#open')).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('formal-host.png'), fullPage: true })
  await page.locator('#open').evaluate((button: HTMLButtonElement) => { button.click(); button.click() })
  const frame = await openFrame(page)
  expect((await readCustomBootConfig(frame)).appId).toBe('8a9481c79c05c8bd019f6a0a6c002457')
  const params = await readShowAuthPageData(frame)
  expect(params).toMatchObject({ appId: '300013215094', authType: '0' })
  await expect(frame.locator('#ydrzSubmitControl')).toHaveCSS('background-color', 'rgb(226, 230, 226)')
  await expect(frame.locator('[data-sdk-stub-click-target]')).toHaveAttribute('aria-disabled', 'true')
  await page.screenshot({ path: info.outputPath('formal-sheet-gray.png') })
  await enterId(frame, '0000')
  await waitForDuodianPresentation(page)
  await expect(frame.locator('#ydrzSubmitControl')).toHaveCSS('background-color', 'rgb(25, 190, 0)')
  await expect(frame.locator('[data-sdk-stub-click-target]')).toHaveAttribute('aria-disabled', 'false')
  await expect(frame.locator('[data-sdk-stub-click-target]')).toBeInViewport()
  expect(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('formal-0000-green.png') })
  await frame.locator('[data-sdk-stub-click-target]').click()
  await triggerInitControlSuccess(frame, 'MOCK_ONLY_FORMAL_HOST_TOKEN', 'MOCK_ONLY_FORMAL_HOST_KEY')
  await expect(page.locator('#status')).toHaveText('验证完成')
  const result = JSON.parse((await page.locator('#result').textContent())!)
  expect(result).toMatchObject({ status: 'success', token: 'MOCK_ONLY_FORMAL_HOST_TOKEN', keyA: 'MOCK_ONLY_FORMAL_HOST_KEY', idLast4: '0000', requestId: 'duodian-health-test' })
  for (const region of ['#resultCard', '#result', '#noticeCard', '#notices']) {
    await expect(page.locator(region)).toHaveClass(/rr-block/)
    await expect(page.locator(region)).toHaveAttribute('data-rrweb-sensitive', 'true')
  }
  await page.screenshot({ path: info.outputPath('formal-MOCK_ONLY-success.png'), fullPage: true })
  await page.locator('#open').click()
  const second = await openFrame(page)
  expect((await readShowAuthPageData(second))!.traceId).not.toBe(params!.traceId)
  await second.locator('[data-close]').click()
  await expect(page.locator('#status')).toHaveText('验证已取消')
  await expect(page.locator('#resultCard')).toBeVisible()
  await page.screenshot({ path: info.outputPath('formal-cancel.png'), fullPage: true })
  await page.locator('#settings').click()
  await page.locator('#authParams').fill('{invalid')
  await page.locator('#native').click()
  await expect(page.locator('#status')).toContainText('参数格式有误')
  await page.locator('#authParams').fill('')
  await page.locator('#agreements').fill(JSON.stringify([{ name: '客户追加协议', link: 'https://customer.invalid/terms' }]))
  await page.locator('#native').click()
  const native = await openFrame(page)
  await expect(native.locator('[data-close]')).toBeHidden()
  await expect(native.locator('[data-keyboard]')).toBeHidden()
  await expect(native.getByRole('checkbox', { name: '同意客户追加协议' })).toBeVisible()
  await native.locator('[data-id-value]').fill('0000')
  await expect(native.locator('[data-id-value]')).toHaveValue('0000')
  expect(requests).toContain(formalSdk)
  expect(responses.some(item => item.url.startsWith(formalBase) && /\/assets\/.*\.js(?:\?|$)/.test(item.url) && item.status === 200)).toBe(true)
  expect(responses.some(item => item.url.startsWith(formalBase) && /\.css(?:\?|$)/.test(item.url) && item.status === 200)).toBe(true)
  expect(requests.filter(url => new URL(url).pathname.startsWith('/sign-pay-pro-temp/assist/') && !url.endsWith('/test-host-params.js'))).toEqual([])
  const storage = await page.evaluate(() => JSON.stringify({ local: localStorage, session: sessionStorage }))
  for (const secret of [params!.sign, 'MOCK_ONLY_FORMAL_HOST_TOKEN', 'MOCK_ONLY_FORMAL_HOST_KEY']) {
    expect(storage).not.toContain(secret); expect(logs.join('\n')).not.toContain(secret)
  }
  await info.attach('formal-resource-responses.json', { body: JSON.stringify(responses.filter(item => item.url.startsWith(formalBase)), null, 2), contentType: 'application/json' })
})

test('failed formal SDK request keeps exact source diagnostic and buttons recoverable', async ({ page }) => {
  await page.route(formalSdk, route => route.abort('failed'))
  await page.goto(hostUrl)
  await expect(page.locator('#sdkStatus')).toContainText('加载失败')
  await expect(page.locator('#sdkUrl')).toHaveText(formalSdk)
  await page.locator('#open').click()
  await expect(page.locator('#status')).toContainText('SDK 加载失败')
  await expect(page.locator('#open')).toBeEnabled()
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
})
