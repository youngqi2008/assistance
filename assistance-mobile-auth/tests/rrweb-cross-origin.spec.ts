import { expect, test, type FrameLocator, type Page } from '@playwright/test'

import {
  installMobileAuthSdkStub,
  installSessionRoutes,
} from './mobile-auth-flow-helpers'

const rrwebCdn = 'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js'
const stagingTestPageUrl = '/sign-pay-pro/test-page'

function crossOriginVerificationUrl(page: Page, query = '') {
  const port = new URL(page.url()).port
  const base = `http://localhost:${port}/sign-pay-pro/verification`
  return query ? `${base}?${query}` : base
}

async function appendCrossOriginVerificationIframe(page: Page, src: string): Promise<FrameLocator> {
  await page.evaluate((iframeSrc) => {
    const iframe = document.createElement('iframe')
    iframe.dataset.rrwebCrossOriginTest = 'true'
    iframe.title = 'rrweb cross-origin verification'
    iframe.src = iframeSrc
    document.body.appendChild(iframe)
  }, src)
  return page.frameLocator('iframe[data-rrweb-cross-origin-test="true"]')
}

test('staging monitor records cross-origin verification events without masking', async ({ page }) => {
  await page.route(rrwebCdn, (route) => route.abort())
  await page.goto(stagingTestPageUrl)

  await expect(page.getByTestId('rrweb-monitor-status')).toContainText('本地 fallback')
  const frame = await appendCrossOriginVerificationIframe(
    page,
    crossOriginVerificationUrl(page, 'flow=agreement&doc=entry'),
  )
  await expect(frame.getByText('《用户认证服务隐私政策》')).toBeVisible()
  await expect.poll(async () => Number(await page.getByTestId('rrweb-iframe-attach-events').textContent()))
    .toBeGreaterThan(0)

  // Recording runs without masking (product decision): both the text inside a
  // data-rrweb-sensitive element and text-input values cross the boundary in clear.
  const secretText = 'rrweb-secret-2468'
  const totalBeforeInteraction = Number(await page.getByTestId('rrweb-total-events').textContent())
  await frame.locator('body').evaluate((body, secret) => {
    const sensitive = document.createElement('div')
    sensitive.dataset.rrwebSensitive = 'true'
    sensitive.textContent = secret
    body.appendChild(sensitive)

    const input = document.createElement('input')
    input.type = 'text'
    input.value = secret
    body.appendChild(input)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, secretText)

  await expect.poll(async () => Number(await page.getByTestId('rrweb-total-events').textContent()))
    .toBeGreaterThan(totalBeforeInteraction)
  await expect.poll(async () =>
    (await page.getByTestId('rrweb-event-json').allTextContents()).join('\n'),
  ).toContain(secretText)
  expect(await page.locator('body').evaluate((body) => body.scrollWidth <= body.clientWidth)).toBe(true)
})

test('verification keeps its committed guard behavior when both rrweb sources fail', async ({ page }) => {
  await page.route(rrwebCdn, (route) => route.abort())
  await page.route('**/assistance-mobile-auth/vendor/rrweb.min.js', (route) => route.abort())
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.addInitScript(() => {
    const target = window as Window & { __bridgeMessages?: Array<{ type?: string; code?: string }> }
    target.__bridgeMessages = []
    window.addEventListener('message', (event) => {
      const data = event.data as
        | { source?: string; type?: string; payload?: { code?: string } }
        | null
      if (data?.source === 'assistance-mobile-auth') {
        target.__bridgeMessages?.push({ type: data.type, code: data.payload?.code })
      }
    })
  })
  await installMobileAuthSdkStub(page)
  await installSessionRoutes(page)

  await page.goto(stagingTestPageUrl)
  await expect(page.getByTestId('rrweb-monitor-status')).toContainText('rrweb 不可用')

  const frame = await appendCrossOriginVerificationIframe(page, crossOriginVerificationUrl(page))
  await expect(frame.getByRole('region', { name: '加载中' })).toBeVisible()

  // A session-less bare iframe keeps its committed guard behavior (AuthVerificationWindow
  // posts exactly one SESSION_MISSING bridge error on SDK-ready). Asserting that guard
  // proves rrweb failure does not alter the page's own behavior.
  await expect.poll(() =>
    page.evaluate(() => {
      const target = window as Window & { __bridgeMessages?: Array<{ type?: string; code?: string }> }
      return (target.__bridgeMessages ?? []).filter(
        (message) => message.type === 'ASSISTANCE_AUTH_ERROR' && message.code === 'SESSION_MISSING',
      ).length
    }),
  ).toBe(1)
  expect(errors.filter((message) => message.includes('rrweb'))).toEqual([])
})
