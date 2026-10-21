import { expect, test, type Frame, type Page } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { installMobileAuthSdkStub, installSessionRoutes, installMobileAssistantRoutes, waitForAssistanceSdkFactory, triggerShowAuthPageSuccess, triggerShowAuthPageError, expectInitControlReady, type StubSubmitElementTag } from './mobile-auth-flow-helpers'

const appId = '10037e6f9d903f86019ed8cfb6320365'
const liveBase = process.env.PLAYWRIGHT_LIVE_TEMP_BASE_URL
test.use({ video: 'on', browserName: process.env.YUANBAO_FIT_BROWSER === 'webkit' ? 'webkit' : 'chromium' })

async function openYuanbao(page: Page, submitElementTag: StubSubmitElementTag = 'official-nested', caller = false, emulateOfficialSubmitState = false): Promise<Frame> {
  await installMobileAuthSdkStub(page, { agreementFixture: 'v23-production', agreementOverlay: true, submitElementTag, preserveWrapper: Boolean(liveBase), emulateOfficialSubmitState })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto(liveBase ? `${liveBase.replace(/\/$/, '')}/test-page` : '/')
  await waitForAssistanceSdkFactory(page)
  if (caller) {
    await page.evaluate((id) => {
      const sdk = window.AssistanceMobileAuth!.createAssistanceMobileAuthSdk({
        appId: id, authWindowTitle: '元保调用方协议验证',
        agreements: [
          { name: '测试调用方补充协议', link: 'https://merchant.example/yuanbao-agreement' },
          ...Array.from({ length: 16 }, (_, i) => ({ name: `测试长列表协议 ${i + 1}`, link: `https://merchant.example/agreement-${i + 1}` })),
        ],
      })
      void sdk.openVerification().catch(() => undefined)
    }, appId)
  } else {
    await page.getByRole('button', { name: '测试元保三要素皮肤', exact: true }).click()
  }
  const iframe = page.locator('iframe[data-assistance-auth-frame="true"]')
  await expect(iframe).toBeAttached()
  const frame = await (await iframe.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Missing Yuanbao iframe')
  await frame.waitForLoadState('domcontentloaded')
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(iframe).toBeVisible()
  await expect(page.locator('#assistance-mobile-auth-frame-shell')).toHaveCSS('opacity', '1')
  await expect(frame.getByTestId('chinaums-sheet-v23-root')).toHaveAttribute('data-yuanbao-feedback', 'true')
  expect(new URL(frame.url()).searchParams.get('appId')).toBe(appId)
  return frame
}

async function enter(frame: Frame, value: string) {
  for (const key of value) await frame.getByRole('button', { name: `输入 ${key}`, exact: true }).click()
}

test.describe('Yuanbao current wrapper feedback', () => {
  for (const height of [844, 400]) {
    test(`provider title and state stay purple with close at top right at 390x${height}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height })
      const frame = await openYuanbao(page, 'official-nested', false, true)
      await frame.addStyleTag({ content: readFileSync(new URL('../src/wrapper/vendor/new-control-style.css', import.meta.url), 'utf8') })
      const colors = frame.locator('#ydrzTipsControl, #ydrzTipsControl *, #ydrzAgreementControl, #ydrzAgreementControl *, #ydrzStateControl, #ydrzStateControl *')
      for (const node of await colors.all()) await expect(node).toHaveCSS('color', 'rgb(132, 138, 180)')
      // Match a later provider update rather than checking only the first paint.
      await frame.locator('#ydrzTipsControl .auth-tips-title').evaluate((node) => { node.textContent += '（更新）'; (node as HTMLElement).style.color = '#8A8F98' })
      await expect(frame.locator('#ydrzTipsControl .auth-tips-title')).toHaveCSS('color', 'rgb(132, 138, 180)')
      const card = (await frame.locator('.chinaums-v23-dialog').boundingBox())!
      const close = (await frame.getByRole('button', { name: '关闭', exact: true }).boundingBox())!
      expect(close.x + close.width / 2).toBeGreaterThan(card.x + card.width * 0.85)
      expect(close.x + close.width).toBeLessThanOrEqual(card.x + card.width)
      expect(close.y).toBeGreaterThanOrEqual(card.y)
      expect(close.y + close.height).toBeLessThanOrEqual(card.y + card.width * 0.16)
      await page.screenshot({ path: testInfo.outputPath('provider-colors-close.png') })
      await writeFile(testInfo.outputPath('provider-colors-close.json'), JSON.stringify({ card, close }, null, 2))
      await frame.getByRole('button', { name: '关闭', exact: true }).click()
      await expect(page.locator('iframe[data-assistance-auth-frame="true"]')).toHaveCount(0)
    })
  }

  for (const size of [{ width: 393, height: 700 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
    test(`error DOM toggles without changing keyboard height at ${size.width}x${size.height}`, async ({ page }, testInfo) => {
      await page.setViewportSize(size)
      const frame = await openYuanbao(page)
      const measure = () => frame.evaluate(() => {
        const rect = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector)!
          const box = element.getBoundingClientRect()
          return { top: box.top, height: box.height, bottom: box.bottom }
        }
        const card = document.querySelector<HTMLElement>('.chinaums-v23-dialog')!
        return {
          card: rect('.chinaums-v23-dialog'), submit: rect('.chinaums-v23-submit'),
          keyboard: rect('.chinaums-v23-keyboard'), key: rect('.chinaums-v23-key'),
          scrollRange: card.scrollHeight - card.clientHeight,
        }
      })
      const normal = await measure()
      await expect(frame.getByRole('alert')).toHaveCount(0)
      await page.screenshot({ path: testInfo.outputPath('normal.png') })
      await frame.locator('[data-sdk-stub-click-target]').click()
      await expect(frame.getByRole('alert')).toHaveText('!请完整输入身份证后4位数字')
      const error = await measure()
      await page.screenshot({ path: testInfo.outputPath('error.png') })
      await enter(frame, '1234')
      await expect(frame.getByRole('alert')).toHaveCount(0)
      const cleared = await measure()
      const measurementPath = testInfo.outputPath('error-row-geometry.json')
      await writeFile(measurementPath, JSON.stringify({ viewport: size, normal, error, cleared }, null, 2))
      await testInfo.attach('error-row-geometry', { contentType: 'application/json', path: measurementPath })
      for (const state of [error, cleared]) {
        expect(state.card.top).toBeGreaterThanOrEqual(0)
        expect(state.keyboard.height).toBeCloseTo(normal.keyboard.height, 1)
        expect(state.submit.top).toBeCloseTo(normal.submit.top, 1)
        expect(state.scrollRange).toBe(normal.scrollRange)
      }
      const row = frame.locator('.chinaums-v23-inline-error')
      await expect(row).toHaveCount(0)
      await expect(frame.getByLabel('安全键盘').locator('button')).toHaveCount(12)
      await expect(frame.getByRole('button', { name: '输入 X', exact: true })).toBeInViewport()
      await expect(frame.getByRole('button', { name: '删除', exact: true })).toBeInViewport()
      if (size.height >= 700) {
        expect(normal.scrollRange).toBe(0)
        await expect(frame.getByRole('button', { name: '选择其他方式', exact: true })).toBeInViewport()
      }
    })
  }

  test('official 1.0.6 loading-before-validation restores label and retries after incomplete input', async ({ page }, testInfo) => {
    const frame = await openYuanbao(page, 'official-nested', false, true)
    const submit = frame.locator('[data-sdk-stub-click-target]')
    const label = frame.locator('.ydrz-submitbtn-text')
    await enter(frame, '11')
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await submit.click()
      await expect(frame.getByRole('alert')).toHaveText('!请完整输入身份证后4位数字')
      await page.screenshot({ path: testInfo.outputPath(`incomplete-attempt-${attempt}.png`) })
      await expect(label).toHaveText('同意并登录')
      await expect(label).not.toHaveClass(/loading/)
      expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.beforeSubmitResults)).toEqual(Array(attempt).fill(false))
      expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.providerTokenRequests)).toBe(0)
      // Keep the official SDK's existing 1s throttle; do not synthesize clicks.
      await page.waitForTimeout(1100)
    }
    await frame.getByRole('button', { name: '删除', exact: true }).click()
    await enter(frame, '23X')
    await expect(frame.getByRole('alert')).toHaveCount(0)
    await expect(label).toHaveText('同意并登录')
    await page.waitForTimeout(2100)
    await page.screenshot({ path: testInfo.outputPath('complete-ready.png') })
    expect(await frame.evaluate(() => {
      const slot = document.getElementById('ydrzSubmitControl')
      ;(window as Window & { __yuanbaoOfficialSubmitSlot?: Element | null }).__yuanbaoOfficialSubmitSlot = slot
      return slot !== null
    })).toBe(true)
    await submit.click()
    const status = frame.getByRole('status', { name: '加载中' })
    await expect(status).toHaveText('同意并登录')
    await expect(frame.locator('.chinaums-v23-loading-card')).toHaveCount(0)
    await expect(frame.locator('.chinaums-v23-submit')).toHaveCSS('background-color', 'rgb(153, 153, 153)')
    await expect(frame.getByRole('button', { name: '输入 1', exact: true })).toBeDisabled()
    await expect(frame.getByRole('button', { name: '选择其他方式', exact: true })).toBeDisabled()
    const officialVisibility = await frame.locator('#ydrzSubmitControl').evaluate((slot) => {
      const rect = slot.getBoundingClientRect()
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)
      const target = slot.querySelector('[data-sdk-stub-click-target]')!
      return {
        slotOpacity: getComputedStyle(slot).opacity,
        slotVisibility: getComputedStyle(slot).visibility,
        targetOpacity: getComputedStyle(target).opacity,
        targetVisibility: getComputedStyle(target).visibility,
        inert: Boolean(slot.closest('[inert]')),
        centerHitsOfficialControl: slot === hit || slot.contains(hit),
      }
    })
    expect(officialVisibility).toEqual({
      slotOpacity: '1', slotVisibility: 'visible', targetOpacity: '1', targetVisibility: 'visible',
      inert: false, centerHitsOfficialControl: true,
    })
    const image = status.locator('img')
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true)
    const group = (await status.boundingBox())!
    const spinner = (await image.boundingBox())!
    expect(spinner.x).toBeGreaterThan(group.x + group.width / 2)
    await page.screenshot({ path: testInfo.outputPath('yuanbao-pending.png') })
    expect(await frame.evaluate(() => document.getElementById('ydrzSubmitControl') === (
      window as Window & { __yuanbaoOfficialSubmitSlot?: Element | null }
    ).__yuanbaoOfficialSubmitSlot)).toBe(true)

    const agreementBox = await frame.locator('#ydrzAgreementControl a').first().boundingBox()
    const otherBox = await frame.getByRole('button', { name: '选择其他方式', exact: true }).boundingBox()
    if (!agreementBox || !otherBox) throw new Error('Yuanbao pending controls are missing')
    await page.mouse.click(agreementBox.x + agreementBox.width / 2, agreementBox.y + agreementBox.height / 2)
    await page.mouse.click(otherBox.x + otherBox.width / 2, otherBox.y + otherBox.height / 2)
    await expect(frame.locator('.ydrz-confirm-iframe')).toHaveCount(0)
    const pendingSubmitBox = await submit.boundingBox()
    if (!pendingSubmitBox) throw new Error('Yuanbao pending submit control is missing')
    const pendingCounts = await frame.evaluate(() => ({
      officialClicks: (window as any).__mobileAuthHarness.submitClickEvents.length,
      providerTokenRequests: (window as any).__mobileAuthHarness.providerTokenRequests,
    }))
    // Keep the official 1.0.6 throttle elapsed, then use a physical pointer
    // event at the real submit control. Parent capture must stop the repeated click
    // without hiding or covering the provider control checked by official 1.0.6.
    await page.waitForTimeout(1100)
    await page.mouse.click(
      pendingSubmitBox.x + pendingSubmitBox.width / 2,
      pendingSubmitBox.y + pendingSubmitBox.height / 2,
    )
    await page.waitForTimeout(100)
    expect(await frame.evaluate(() => ({
      officialClicks: (window as any).__mobileAuthHarness.submitClickEvents.length,
      providerTokenRequests: (window as any).__mobileAuthHarness.providerTokenRequests,
    }))).toEqual(pendingCounts)
    expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.beforeSubmitResults)).toEqual([false, false, false, true])

    await frame.evaluate(() => {
      ;(window.parent as Window & { __yuanbaoLateResult?: ((payload: Record<string, unknown>) => void) | undefined }).__yuanbaoLateResult = (
        window as Window & {
          __mobileAuthHarness?: { lastInitControlRequest?: { success?: (payload: Record<string, unknown>) => void } }
        }
      ).__mobileAuthHarness?.lastInitControlRequest?.success
    })
    await frame.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(page.locator('iframe[data-assistance-auth-frame="true"]')).toHaveCount(0)
    await page.evaluate(() => {
      ;(window as Window & { __yuanbaoLateResult?: (payload: Record<string, unknown>) => void }).__yuanbaoLateResult?.({
        code: '103000',
        token: 'late-token',
      })
    })
    await page.waitForTimeout(100)
    await expect(page.locator('iframe[data-assistance-auth-frame="true"]')).toHaveCount(0)
  })

  for (const failure of ['sdk-error', 'timeout']) {
    test(`initialization ${failure} leaves host usable, never flashes and restores retry`, async ({ page }) => {
      await installMobileAuthSdkStub(page, { preserveWrapper: Boolean(liveBase) })
      await page.goto(liveBase ? `${liveBase.replace(/\/$/, '')}/test-page` : '/')
      await waitForAssistanceSdkFactory(page)
      await page.clock.install()
      await page.getByRole('button', { name: '测试元保三要素皮肤', exact: true }).click()
      const iframe = page.locator('iframe[data-assistance-auth-frame="true"]')
      await expect(iframe).toBeAttached()
      const frame = await (await iframe.elementHandle())!.contentFrame()
      if (!frame) throw new Error('Missing initializing iframe')
      await expect.poll(() => frame.evaluate(() => Boolean((window as any).__mobileAuthHarness?.lastShowAuthPageRequest))).toBe(true)
      await expect(page.locator('#assistance-mobile-auth-frame-shell')).toHaveCSS('opacity', '0')
      await expect(page.locator('#assistance-mobile-auth-frame-shell')).toHaveCSS('pointer-events', 'none')
      expect(await page.locator('body').evaluate((body) => body.style.overflow)).toBe('')
      await page.evaluate(() => {
        const button = document.createElement('button')
        button.textContent = '宿主页交互探针'
        button.style.cssText = 'position:fixed;top:0;left:0;z-index:1'
        button.onclick = () => { button.textContent = '宿主页仍可交互' }
        document.body.append(button)
      })
      await page.getByRole('button', { name: '宿主页交互探针' }).click()
      await expect(page.getByRole('button', { name: '宿主页仍可交互' })).toBeVisible()
      if (failure === 'sdk-error') await triggerShowAuthPageError(frame, '103119', 'AppID配置异常')
      else await page.clock.fastForward(15000)
      await page.clock.fastForward(500)
      await expect(iframe).toHaveCount(0)
      await expect(page.getByRole('button', { name: '测试元保三要素皮肤', exact: true })).toBeEnabled()
      if (failure === 'timeout') await expect(page.getByText(/认证页面初始化超时/).first()).toBeVisible()
    })
  }

  for (const size of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
    test(`persistent error, hand and half reader at ${size.width}x${size.height}`, async ({ page }, testInfo) => {
      await page.setViewportSize(size)
      const frame = await openYuanbao(page)
      const card = frame.locator('.chinaums-v23-dialog')
      const normalTop = (await card.boundingBox())!.y
      expect(normalTop).toBeGreaterThanOrEqual(16)
      for (const agreement of await frame.locator('#ydrzAgreementControl, #ydrzAgreementControl a, #ydrzTipsControl').all()) {
        await expect(agreement).toHaveCSS('color', 'rgb(132, 138, 180)')
      }
      await expect(frame.getByRole('button', { name: '关闭', exact: true })).toBeVisible()
      const boxes = frame.locator('.chinaums-v23-id-box')
      const box = boxes.first()
      await expect(box).toHaveCSS('background-color', 'rgb(254, 249, 245)')
      await expect(box).toHaveCSS('border-top-color', 'rgb(255, 187, 109)')
      await expect(box).toHaveCSS('box-shadow', /rgb\(255, 187, 109\).*inset/)
      await expect(boxes.nth(1)).toHaveCSS('border-top-color', 'rgb(233, 238, 246)')
      await expect(boxes.nth(1)).toHaveCSS('box-shadow', 'none')
      await expect(box).toHaveCSS('font-weight', '700')
      await expect(frame.getByTestId('chinaums-v23-id-caret')).toHaveCSS('background-color', 'rgb(0, 130, 255)')
      await page.waitForTimeout(1000)
      // Capture the natural visible half of the blink without changing UI styles.
      await frame.waitForFunction(() => {
        const caret = document.querySelector('.chinaums-v23-id-caret')
        const animation = caret?.getAnimations()[0]
        return caret && getComputedStyle(caret).opacity === '1' && Number(animation?.currentTime) % 1000 < 250
      })
      await page.screenshot({ path: testInfo.outputPath('normal.png') })
      await enter(frame, '1')
      await expect(box).toHaveAttribute('data-active', 'false')
      await expect(box).toHaveCSS('border-top-color', 'rgb(233, 238, 246)')
      await expect(boxes.nth(1)).toHaveAttribute('data-active', 'true')
      await expect(boxes.nth(1)).toHaveCSS('border-top-color', 'rgb(255, 187, 109)')
      await expect(boxes.nth(1).getByTestId('chinaums-v23-id-caret')).toBeVisible()
      await frame.getByRole('button', { name: '删除', exact: true }).click()
      await expect(box.getByTestId('chinaums-v23-id-caret')).toBeVisible()
      await expect(box).toHaveCSS('border-top-color', 'rgb(255, 187, 109)')
      const submit = frame.locator('[data-sdk-stub-click-target]')
      await submit.click()
      await expect(frame.getByRole('alert')).toHaveText('!请完整输入身份证后4位数字')
      await page.waitForTimeout(2500)
      await expect(frame.getByRole('alert')).toHaveText('!请完整输入身份证后4位数字')
      await enter(frame, '12')
      await frame.getByRole('button', { name: '删除', exact: true }).click()
      await submit.click()
      await expect(submit).toHaveText('同意并登录')
      await expect(frame.getByRole('alert')).toBeVisible()
      for (const inputBox of await boxes.all()) {
        await expect(inputBox).toHaveCSS('background-color', 'rgb(255, 245, 245)')
        await expect(inputBox).toHaveCSS('border-top-color', 'rgb(255, 109, 109)')
        await expect(inputBox).toHaveCSS('box-shadow', /rgb\(255, 109, 109\).*inset/)
        await expect(inputBox).toHaveCSS('color', 'rgb(255, 52, 0)')
      }
      const warning = frame.locator('.chinaums-v23-warning-icon')
      await expect(warning).toHaveCSS('background-color', 'rgb(255, 52, 0)')
      await expect(warning).toHaveCSS('color', 'rgb(255, 255, 255)')
      await expect(warning).toHaveCSS('border-top-width', '0px')
      await expect(warning).toHaveAttribute('aria-hidden', 'true')
      expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.beforeSubmitResults)).toEqual([false, false])
      const errorTop = (await card.boundingBox())!.y
      expect(errorTop).toBeGreaterThanOrEqual(0)
      const errorBounds = (await frame.getByRole('alert').boundingBox())!
      const gridBounds = (await frame.locator('.chinaums-v23-id-grid').boundingBox())!
      expect(Math.abs(errorBounds.x - gridBounds.x)).toBeLessThan(1)
      expect(Math.abs(errorBounds.width - gridBounds.width)).toBeLessThan(1)
      await page.waitForTimeout(1000)
      await page.screenshot({ path: testInfo.outputPath('error.png') })
      if (size.height === 568) {
        await expect(card).toHaveCSS('overflow-y', 'visible')
        await card.evaluate((element) => { element.scrollTop = element.scrollHeight })
        await expect(frame.getByRole('button', { name: '选择其他方式', exact: true })).toBeInViewport()
        await expect(frame.getByRole('button', { name: '关闭', exact: true })).toBeInViewport()
        await expect(frame.getByRole('button', { name: '输入 2', exact: true })).toBeInViewport()
        await page.screenshot({ path: testInfo.outputPath('error-scrolled.png') })
        await card.evaluate((element) => { element.scrollTop = 0 })
      }
      await enter(frame, '23X')
      await expect(frame.getByRole('alert')).toHaveCount(0)
      for (const index of [0, 1, 2]) {
        await expect(boxes.nth(index)).toHaveCSS('background-color', 'rgb(240, 244, 253)')
        await expect(boxes.nth(index)).toHaveCSS('color', 'rgb(51, 51, 51)')
      }
      await expect(boxes.nth(3)).toHaveCSS('background-color', 'rgb(254, 249, 245)')
      await expect(boxes.nth(3)).toHaveCSS('color', 'rgb(51, 51, 51)')
      await expect(box).toHaveCSS('border-top-color', 'rgb(233, 238, 246)')
      await expect(box).toHaveCSS('box-shadow', 'none')
      await expect(boxes.nth(3)).toHaveCSS('border-top-color', 'rgb(255, 187, 109)')
      await expect(frame.getByTestId('chinaums-v23-id-caret')).toHaveCount(0)
      const hand = frame.getByTestId('chinaums-v23-hand')
      await expect(hand).toHaveAttribute('data-visible', 'true')
      await expect(hand).toHaveCSS('animation-duration', '1s')
      await expect(hand).toHaveCSS('animation-timing-function', 'cubic-bezier(0.66, 0, 0.34, 1)')
      const keyframes = await hand.evaluate((element) => {
        const tap = element.getAnimations().find((animation) => animation instanceof CSSAnimation && animation.animationName === 'yuanbao-hand-tap')!
        return (tap.effect as KeyframeEffect).getKeyframes().map(({ offset, transform }) => {
          const matrix = new DOMMatrix(String(transform))
          return { offset, x: matrix.e, y: matrix.f, scaleX: matrix.a, scaleY: matrix.d }
        })
      })
      const tapDistance = await frame.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.4)
      expect(keyframes.map(({ offset }) => offset)).toEqual([0, 0.5, 1])
      for (const keyframe of keyframes) {
        const distance = keyframe.offset === 0.5 ? 0 : tapDistance
        expect(keyframe.x).toBeCloseTo(distance, 5)
        expect(keyframe.y).toBeCloseTo(distance, 5)
        expect(keyframe.scaleX).toBe(1)
        expect(keyframe.scaleY).toBe(1)
      }
      await page.waitForTimeout(2500)
      await page.screenshot({ path: testInfo.outputPath('complete.png') })
      await frame.getByRole('link', { name: '用户信息授权协议', exact: true }).click()
      await expect(frame.getByLabel('安全键盘')).toHaveAttribute('aria-hidden', 'true')
      const panel = frame.locator('.ydrz-confirm-iframe')
      const bounds = (await panel.boundingBox())!
      const readerClose = frame.locator('.ydrz-confirm-header').getByRole('button', { name: '关闭协议', exact: true })
      // Provider inline positioning must not pull the close control back to the corner.
      await readerClose.evaluate((element) => {
        element.style.top = '0px'
        element.style.bottom = '0px'
        element.style.margin = '0px'
        element.style.left = '12px'
        element.style.transform = 'none'
      })
      await expect(readerClose).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -14)')
      const closeBounds = (await readerClose.boundingBox())!
      const headerBounds = (await frame.locator('.ydrz-confirm-header').boundingBox())!
      expect(closeBounds.width).toBe(28)
      expect(closeBounds.height).toBe(28)
      expect(Math.abs(closeBounds.x - headerBounds.x - 16)).toBeLessThan(1)
      expect(Math.abs(closeBounds.y + closeBounds.height / 2 - headerBounds.y - headerBounds.height / 2)).toBeLessThan(1)
      const headerInnerHeight = await frame.locator('.ydrz-confirm-header').evaluate((element) => element.clientHeight)
      // Absolute 50% uses the padding box, excluding the SDK's bottom border.
      expect(closeBounds.y - headerBounds.y).toBeCloseTo((headerInnerHeight - closeBounds.height) / 2, 1)
      expect(closeBounds.y).toBeGreaterThanOrEqual(headerBounds.y)
      expect(closeBounds.y + closeBounds.height).toBeLessThanOrEqual(headerBounds.y + headerBounds.height)
      expect(Math.abs(bounds.height - size.height / 2)).toBeLessThan(2)
      expect(Math.abs(bounds.y + bounds.height - size.height)).toBeLessThan(2)
      const reader = frame.frameLocator('iframe[title="用户信息授权协议内容"]')
      await expect(reader.getByRole('list')).toBeVisible()
      const list = reader.getByRole('list')
      const expectedAgreements = ['《用户认证服务隐私政策》', '《个人信息收集清单》', '《敏感个人信息处理规则》', '《第三方共享个人信息清单》']
      await expect(list.getByRole('button')).toHaveText(expectedAgreements)
      const sdkAgreements = await frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls[0].styleOption.agreeStyle.childArr)
      expect(sdkAgreements.map((entry: { name: string }) => entry.name)).toEqual(expectedAgreements)
      expect(sdkAgreements[3].link).toContain('doc=third-party-sharing-list')
      const listBottomGap = await list.evaluate((ul) => {
        const scroll = ul.parentElement!
        scroll.scrollTop = scroll.scrollHeight
        return window.innerHeight - ul.getBoundingClientRect().bottom
      })
      expect(Math.abs(listBottomGap - 50)).toBeLessThan(2)
      await testInfo.attach('pdf-measurements', {
        contentType: 'application/json',
        body: JSON.stringify({ source: liveBase || 'local source', appId, viewport: size, normalTop, errorTop, errorLeftOffset: errorBounds.x - gridBounds.x, readerHeight: bounds.height, readerBottom: bounds.y + bounds.height, listBottomGap, closeBounds, headerBounds, sdkAgreements, handKeyframes: keyframes }, null, 2),
      })
      await page.waitForTimeout(1000)
      await page.screenshot({ path: testInfo.outputPath('agreement.png') })
      for (const name of expectedAgreements) {
        await reader.getByRole('button', { name, exact: true }).click()
        await expect(reader.getByRole('button', { name: '返回协议列表', exact: true })).toBeVisible()
        if (name === '《第三方共享个人信息清单》') {
          await expect(reader.getByRole('table')).toBeVisible()
          await page.screenshot({ path: testInfo.outputPath('fourth-agreement.png') })
        }
        await reader.getByRole('button', { name: '返回协议列表', exact: true }).click()
        await expect(reader.getByRole('list')).toBeVisible()
      }
      if (size.width === 390) await readerClose.click()
      else await readerClose.press('Enter')
      await expect(frame.getByLabel('安全键盘')).toHaveAttribute('aria-hidden', 'false')
      await expect(frame.getByLabel('身份证后四位第 4 位')).toHaveText('X')
      await expect(hand).toHaveAttribute('data-visible', 'true')
      await page.waitForTimeout(1000)
      expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(1)
    })
  }

  for (const tag of ['button', 'a', 'div', 'input', 'nested', 'official-nested'] as const) {
    test(`CTA ${tag} retains typography, one shadow and repeat validation`, async ({ page }) => {
      const frame = await openYuanbao(page, tag)
      const submit = frame.locator('[data-sdk-stub-click-target]')
      await expect(submit).toHaveCSS('font-weight', '700')
      await expect(submit).toHaveCSS('box-shadow', 'none')
      await expect(frame.getByTestId('chinaums-v23-submit')).toHaveCSS('box-shadow', 'rgba(255, 157, 149, 0.35) 0px 11px 22px 0px')
      await submit.click()
      await submit.click()
      expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.beforeSubmitResults)).toEqual([false, false])
      await enter(frame, '1234')
      await submit.click()
      await expect(frame.getByRole('status', { name: '加载中' })).toBeVisible()
      expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.beforeSubmitResults)).toEqual([false, false, true])
    })
  }

  test('reduced motion stays static and actual wrapper caller agreements reach initControl and reader', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const frame = await openYuanbao(page, 'official-nested', true)
    await enter(frame, '1234')
    await expect(frame.getByTestId('chinaums-v23-hand')).toHaveCSS('animation-name', 'none')
    await expect(frame.getByTestId('chinaums-v23-hand')).toHaveCSS('transition-property', 'none')
    await expect(frame.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'true')
    const transform = await frame.getByTestId('chinaums-v23-hand').evaluate((element) => getComputedStyle(element).transform)
    await page.waitForTimeout(1100)
    await expect(frame.getByTestId('chinaums-v23-hand')).toHaveCSS('transform', transform)
    await page.screenshot({ path: testInfo.outputPath('reduced-motion.png') })
    const agreements = await frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls[0].styleOption.agreeStyle.childArr)
    expect(agreements).toContainEqual({ name: '测试调用方补充协议', link: 'https://merchant.example/yuanbao-agreement' })
    await frame.getByRole('link', { name: '用户信息授权协议', exact: true }).click()
    const reader = frame.frameLocator('iframe[title="用户信息授权协议内容"]')
    await expect(reader.getByRole('button', { name: '测试调用方补充协议' })).toBeVisible()
    const gap = await reader.getByRole('list').evaluate((ul) => {
      const scroll = ul.parentElement!
      scroll.scrollTop = scroll.scrollHeight
      return window.innerHeight - ul.getBoundingClientRect().bottom
    })
    expect(Math.abs(gap - 50)).toBeLessThan(2)
  })
})
