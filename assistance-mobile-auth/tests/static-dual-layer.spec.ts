import { spawn, type ChildProcess } from 'node:child_process'
import { readFile } from 'node:fs/promises'

import { expect, test } from '@playwright/test'

// This file spins up a single shared release server on a fixed port via
// beforeAll/afterAll. With `fullyParallel: true` (playwright.config.ts),
// Playwright can otherwise split this file's tests across multiple workers,
// each spawning/killing its own server instance on the same port — causing
// ECONNREFUSED races when one worker's afterAll kills the port out from under
// another worker's still-running tests. Serial mode pins all tests in this
// file to one worker so there is exactly one server lifecycle.
test.describe.configure({ mode: 'serial' })

const PORT = 4180
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 10000
const READY_POLL_INTERVAL_MS = 200
let server: ChildProcess

async function waitForServerReady(): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/sign-pay-pro/verification`)
      if (response.status === 200) {
        return
      }
    } catch {
      // server not listening yet, keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_INTERVAL_MS))
  }
  throw new Error(
    `Static release server did not become ready at ${BASE}/sign-pay-pro/verification within ${READY_TIMEOUT_MS}ms. ` +
      "Ensure 'release/static-mobile-auth-0.2.0/dist' exists — run 'npm run release:static -- --version 0.2.0' first.",
  )
}

test.beforeAll(async () => {
  server = spawn(
    'node',
    ['scripts/serve-release.mjs', 'release/static-mobile-auth-0.2.0/dist', String(PORT)],
    { stdio: 'ignore' },
  )
  await waitForServerReady()
})

test.afterAll(() => {
  server.kill()
})

test('frozen 0.1.4 verification page renders at the root layer', async ({ page }) => {
  await page.goto(`${BASE}/sign-pay-pro/verification`)
  await expect(page.locator('#root > *').first()).toBeVisible()
})

test('0.2.0 assist verification page renders with a matched app profile', async ({ page }) => {
  await page.goto(`${BASE}/sign-pay-pro/assist/0.2.0/verification?appId=demo-brand-001`)
  await expect(page.locator('#root > *').first()).toBeVisible()
  await expect(page.locator('body')).toContainText('示例品牌身份核验')
})

test('0.2.0 assist verification page falls back to default for unmatched appId', async ({ page }) => {
  await page.goto(`${BASE}/sign-pay-pro/assist/0.2.0/verification?appId=no-such-app`)
  await expect(page.locator('#root > *').first()).toBeVisible()
  await expect(page.locator('body')).not.toContainText('示例品牌身份核验')
})

test('assist wrapper files are served', async ({ request }) => {
  const esm = await request.get(
    `${BASE}/sign-pay-pro/assist/0.2.0/assistance-mobile-auth/assistance-mobile-auth.0.2.0.js`,
  )
  expect(esm.status()).toBe(200)

  const rrweb = await request.get(
    `${BASE}/sign-pay-pro/assist/0.2.0/assistance-mobile-auth/vendor/rrweb.min.js`,
  )
  expect(rrweb.status()).toBe(200)
})

test('assist wrapper bundle contains no 1.0.7 test vendor literal', async () => {
  const bundle = await readFile(
    'release/static-mobile-auth-0.2.0/dist/assist/0.2.0/assistance-mobile-auth/assistance-mobile-auth.js',
    'utf8',
  )
  expect(bundle).not.toContain('jssdk-1.0.7')
})

test('0.2.0 assist verification renders chinaums-sheet skin for the current appId', async ({ page }) => {
  await page.goto(`${BASE}/sign-pay-pro/assist/0.2.0/verification?appId=8a9481c79c05c8bd019f6f42956924a0`)
  await expect(page.getByTestId('chinaums-sheet-root')).toBeAttached()
  await expect(page.getByRole('heading', { name: /输入您的\s*身份证后四位/ })).toBeVisible()
  await expect(page.getByTestId('chinaums-id-last4-shell')).toBeAttached()
  await expect(page.locator('#ydrzAgreementControl')).toBeAttached()
})

test('frozen 0.1.4 root layer never serves the chinaums-sheet skin', async ({ page }) => {
  await page.goto(`${BASE}/sign-pay-pro/verification?appId=8a9481c79c05c8bd019f6f42956924a0`)
  await expect(page.locator('#root > *').first()).toBeVisible()
  await expect(page.getByTestId('chinaums-sheet-root')).not.toBeAttached()
})
