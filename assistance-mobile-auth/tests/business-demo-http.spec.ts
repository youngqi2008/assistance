import { expect, test } from '@playwright/test'
import { completeStubbedMobileAuth, getVerificationFrame, installMobileAuthSdkStub, installMobileAssistantRoutes, installSessionRoutes, waitForAssistanceSdkFactory } from './mobile-auth-flow-helpers'

const liveBase = process.env.PLAYWRIGHT_LIVE_TEMP_BASE_URL

test('internal check query retain HTTP errors business failures and network diagnostics', async ({ page }, testInfo) => {
  await installMobileAuthSdkStub(page, { preserveWrapper: Boolean(liveBase) })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.route('**/api/business-demo/check', (route) => route.fulfill({
    status: 502, contentType: 'application/json', body: JSON.stringify({ message: '查询上游暂不可用', code: 'UPSTREAM_502' }),
  }))
  let queryCount = 0
  await page.route('**/api/business-demo/query', (route) => {
    queryCount += 1
    if (queryCount === 1) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ kind: 'identity-failed', message: '系统异常', action: 'retry-fetch', code: 'QUERY_500' }) })
    if (queryCount === 2) return route.fulfill({ status: 503, contentType: 'text/html', body: '<html>diagnostic text response</html>' })
    return route.abort('failed')
  })
  await page.goto(liveBase ? `${liveBase.replace(/\/$/, '')}/test-page` : '/')
  await waitForAssistanceSdkFactory(page)
  await page.getByRole('button', { name: '立即支付-jssdk', exact: true }).click()
  const frame = await getVerificationFrame(page)
  await completeStubbedMobileAuth(frame, 'diagnostic-test-token')
  await page.getByRole('button', { name: '调用 check', exact: true }).click()
  const check = page.getByRole('region', { name: 'check HTTP 诊断' })
  await expect(check).toContainText('HTTP 502')
  await check.getByText('响应正文', { exact: true }).click()
  await expect(check.locator('pre')).toContainText('UPSTREAM_502')
  await expect(check).toHaveAttribute('data-rrweb-sensitive', 'true')
  await expect(check).toHaveClass(/rr-block/)
  await page.getByRole('button', { name: '调用 query', exact: true }).click()
  const query = page.getByRole('region', { name: 'query HTTP 诊断' })
  await expect(query).toContainText('HTTP 200')
  await expect(query).toContainText('业务 code：QUERY_500')
  await page.screenshot({ path: testInfo.outputPath('http-and-business-errors.png'), fullPage: true })
  await page.getByRole('button', { name: '调用 query', exact: true }).click()
  await expect(query).toContainText('HTTP 503')
  await query.getByText('响应正文', { exact: true }).click()
  await expect(query.locator('pre')).toHaveText('<html>diagnostic text response</html>')
  await expect(query.locator('html')).toHaveCount(0)
  await page.getByRole('button', { name: '调用 query', exact: true }).click()
  await expect(query).toContainText('未收到 HTTP 响应')
  await expect(query).toContainText('Failed to fetch')
  await expect(query).not.toContainText('503')
  await expect(query.locator('pre')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('network-error.png'), fullPage: true })
})
