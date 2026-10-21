import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Frame } from '@playwright/test'
import { triggerShowAuthPageSuccess, triggerInitControlAuthReady } from './mobile-auth-flow-helpers'
import { installDuodianOfficialStub } from './duodian-health-helpers'

const root = path.resolve(process.env.TEMP032_CANDIDATE_DIR || 'test-results/duodian032-temp-candidate')
const origin = 'https://ginkgo.chinaums.com'
const publicRoot = '/sign-pay-pro-temp/'
const base = origin + publicRoot + 'assist/0.3.2/'

test('actual TEMP032 UMD boots exact supplied clear image at 390px and keeps close, submit and keyboard reachable (carrier stub)', async ({ page }, info) => {
  const loaded: string[] = []
  const unexpected: string[] = []
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => { unexpected.push(route.request().url()); return route.abort() })
  // Only the carrier is simulated. Wrapper, loader, page HTML/CSS, probe and images use candidate bytes.
  await installDuodianOfficialStub(page, { agreementReader: false })
  const serve = async (route: import('@playwright/test').Route, relative: string) => {
    const file = path.resolve(root, relative)
    expect(file.startsWith(root + path.sep)).toBe(true)
    expect(existsSync(file), relative).toBe(true)
    loaded.push(relative)
    const type = path.extname(file)
    await route.fulfill({ body: readFileSync(file), contentType: type === '.html' || type === '' ? 'text/html' : type === '.css' ? 'text/css' : 'application/javascript', headers: { 'access-control-allow-origin': '*' } })
  }
  await page.route(origin + publicRoot + '**', route => serve(route, decodeURIComponent(new URL(route.request().url()).pathname.slice(publicRoot.length))))
  await page.route('https://authsafe.cmpassport.com/h5/js/jssdk_sf/css/new-control-style.css', route => serve(route, 'assist/0.3.2/assistance-mobile-auth/vendor/new-control-style.css'))
  await page.route('https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js', route => serve(route, 'assist/0.3.2/assistance-mobile-auth/vendor/rrweb.min.js'))
  await page.goto(origin + publicRoot + 'test-duodian-health-temp-0.3.2.html')
  await page.locator('#open').click()
  const waitProvider = async (frame: Frame) => expect.poll(() => frame.evaluate(() => typeof (window as any).__mobileAuthHarness?.lastShowAuthPageRequest?.success)).toBe('function')
  await expect.poll(() => page.frames().some(frame => new URL(frame.url()).searchParams.get('mode') === 'probe')).toBe(true)
  const probe = page.frames().find(frame => new URL(frame.url()).searchParams.get('mode') === 'probe')!
  expect(new URL(probe.url()).origin + new URL(probe.url()).pathname).toBe(base + 'verification')
  await waitProvider(probe)
  await triggerShowAuthPageSuccess(probe)
  const element = page.locator('iframe[data-assistance-auth-frame]')
  const waitForPresentation = async () => {
    await expect.poll(() => element.evaluate(node => [node, node.parentElement, node.parentElement?.parentElement]
      .filter(Boolean).every(item => {
        const style = getComputedStyle(item as Element)
        return style.opacity === '1' && (style.transform === 'none' || style.transform === 'matrix(1, 0, 0, 1, 0, 0)')
      }))).toBe(true)
    await frame.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  }
  await expect(element).toHaveCount(1)
  const frame = (await (await element.elementHandle())!.contentFrame())!
  expect(new URL(frame.url()).origin + new URL(frame.url()).pathname).toBe(base + 'custom-verification.html')
  await waitProvider(frame)
  await triggerShowAuthPageSuccess(frame)
  await expect.poll(() => frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(1)
  await triggerInitControlAuthReady(frame)
  await expect(element).toHaveCSS('opacity', '1')
  await waitForPresentation()
  const image = frame.locator('[data-identity-guide]')
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth)).toBe(2168)
  const source = await image.evaluate((node: HTMLImageElement) => ({ src: node.src, width: node.naturalWidth, height: node.naturalHeight }))
  expect(source.height).toBe(360)
  const bytes = Buffer.from(source.src.split(',')[1], 'base64')
  expect(bytes.equals(readFileSync(path.resolve('src/customers/duodian-health/assets/identity-0.3.2.jpg')))).toBe(true)
  const rect = await image.boundingBox()
  expect(rect!.width).toBeCloseTo(342, 0)
  expect(rect!.height).toBeCloseTo(342 * 360 / 2168, 0)
  await expect(image).toBeInViewport({ ratio: 1 })
  await expect(frame.locator('[data-close]')).toBeInViewport({ ratio: 1 })
  await expect(frame.locator('[data-sdk-stub-click-target]')).toBeInViewport({ ratio: 1 })
  await page.screenshot({ path: info.outputPath('actual-temp032-clear-image-390x844.png') })
  const collapsed = await frame.locator('[data-stage],[data-card],[data-identity-guide],[data-close],#ydrzSubmitControl').evaluateAll(nodes => nodes.map(node => {
    const r = node.getBoundingClientRect(); return { selector: node.tagName + ':' + node.getAttributeNames().filter(name => name.startsWith('data-')).join(','), x: r.x, y: r.y, width: r.width, height: r.height }
  }))
  await frame.locator('[data-id-grid]').click()
  await expect(frame.locator('[data-keyboard]')).toBeVisible()
  await expect(frame.locator('[data-key="1"]')).toBeInViewport({ ratio: 1 })
  await frame.locator('[data-key="1"]').click()
  await expect(frame.locator('[data-id-value]')).toHaveValue('1')
  await waitForPresentation()
  await page.screenshot({ path: info.outputPath('actual-temp032-keyboard-390x844.png') })
  await frame.locator('[data-collapse]').click()
  await expect(frame.locator('[data-keyboard]')).toBeHidden()
  await frame.locator('[data-close]').click()
  await expect(element).toHaveCount(0)
  await expect(page.locator('#status')).toContainText('取消')
  expect(loaded).toContain('assist/0.3.2/verification')
  expect(loaded).toContain('assist/0.3.2/assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.2.umd.cjs')
  expect(unexpected).toEqual([])
  expect(errors).toEqual([])
  const geometry = JSON.stringify({ naturalWidth: source.width, naturalHeight: source.height, collapsed, simulation: 'Carrier stub only; no real-carrier or backend acceptance' }, null, 2)
  writeFileSync(info.outputPath('geometry.json'), geometry)
  await info.attach('image-geometry-and-scope', { body: geometry, contentType: 'application/json' })
})
