import { expect, test, type Page, type Frame } from '@playwright/test'
import { copyFile, mkdir } from 'node:fs/promises'
import { readCustomBootConfig } from './custom-page-helpers'
import { triggerShowAuthPageSuccess, triggerInitControlAuthReady, triggerInitControlError, triggerInitControlSuccess,
  installVisualViewportMock, setVisualViewportHeight } from './mobile-auth-flow-helpers'
import { openDuodianPage, readyDuodian, enterId, readHarness, expectCleanHost, openDuodianReader,
  waitForDuodianPresentation, mediaDirectory, installDuodianOfficialStub } from './duodian-health-helpers'

test.beforeEach(async ({ page }) => {
  await installDuodianOfficialStub(page)
  await mkdir(mediaDirectory, { recursive: true })
})
async function screenshot(page: Page, size: string, state: string) {
  await waitForDuodianPresentation(page)
  const element = page.locator('iframe[data-assistance-auth-frame]')
  const frame = await (await element.elementHandle())!.contentFrame()
  console.info('DUODIAN_GEOMETRY', size, state, JSON.stringify({ iframe: await element.boundingBox(),
    nodes: await frame!.locator('[data-custom-root],[data-stage],[data-card],[data-keyboard]').evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect(); return { selector: node.getAttribute('data-custom-root') !== null ? 'root' : node.hasAttribute('data-stage') ? 'stage' : node.hasAttribute('data-card') ? 'card' : 'keyboard',
        height: rect.height, scrollHeight: node.scrollHeight, width: rect.width }
    })) }))
  await page.screenshot({ path: `${mediaDirectory}/${size}-${state}.png` })
  await page.waitForTimeout(750) // Preserve an observable state in the acceptance video.
}
async function saveVideo(page: Page, name: string) {
  const video = page.video()
  await page.close()
  if (!video) throw new Error('Acceptance recording missing')
  await copyFile(await video.path(), `${mediaDirectory}/${name}.webm`)
}
async function submit(frame: Frame) { await frame.locator('[data-sdk-stub-click-target]').click() }
async function rememberAttempt(frame: Frame) { await frame.evaluate(() => { (window as any).__oldAttempt = (window as any).__mobileAuthHarness.lastInitControlRequest }) }
async function lateAttempt(frame: Frame) {
  await frame.evaluate(() => {
    const old = (window as any).__oldAttempt
    old.authReady?.({ code: '103000' }); old.success?.({ code: '103000', token: 'MOCK_ONLY_STALE_TOKEN', encryptPublicKey: 'MOCK_ONLY_STALE_KEY' })
    old.error?.({ code: '103101', message: 'MOCK_ONLY_STALE_ERROR' })
  })
}
const formats = ['esm', 'umd'] as const
for (const format of formats) {
  test(`${format}: default and override identity retain embedded UI and only approved runtime requests`, async ({ page }) => {
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    for (const appId of [undefined, '10037e6f9d903f86019ed8cfb6320365']) {
      const frame = await openDuodianPage(page, { format, appId })
      const boot = await readCustomBootConfig(frame)
      expect(boot.appId).toBe(appId ?? '8a9481c79c05c8bd019f6a0a6c002457')
      expect(boot.authParams?.appId).toBe('MOCK_ONLY_SIGNED_APP_ID')
      await readyDuodian(page, frame)
      await expect(frame.locator('[data-custom-template="duodian-health"]')).toBeVisible()
      await expect(frame.locator('[data-close]')).toBeHidden()
      await expect(frame.locator('[data-keyboard]')).toBeHidden()
      const images = await frame.locator('[data-security-title],[data-identity-guide]').evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).src))
      expect(images).toHaveLength(2); images.forEach(src => expect(src).toMatch(/^data:image\/jpeg;base64,/))
      const h = await readHarness(frame)
      expect(h.show[0].data.appId).toBe('MOCK_ONLY_SIGNED_APP_ID')
      expect(h.init[0].styleOption.submitBtnStyle.name).toBe('授权登录')
      await expect(frame.locator('#ydrzSubmitControl.ydrz-submitbtn-wrap .submit-btn .ydrz-submitbtn-text')).toHaveText('授权登录')
      await expect(frame.locator('#ydrzSubmitControl')).toHaveCSS('background-color', 'rgb(226, 230, 226)')
      await enterId(frame, '0000')
      await expect(frame.locator('#ydrzSubmitControl')).toHaveCSS('background-color', 'rgb(25, 190, 0)')
      await expect(frame.locator('.ydrz-submitbtn-text')).toHaveCSS('color', 'rgb(255, 255, 255)')
      expect(await frame.getByText('授权登录', { exact: true }).count()).toBe(1)
      await page.evaluate(() => (window as any).__duodianSdk.close()); await expectCleanHost(page)
    }
    const official = 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js'
    const allowed = requests.every(url => url === official || /^http:\/\/127\.0\.0\.1:4184\/sign-pay-pro-temp\/(?:test-duodian-health-0\.3\.0\.html|assist\/0\.3\.0\/(?:custom-verification\.html|assets\/[^/]+\.js|assistance-mobile-auth\/(?:assistance-mobile-auth\.duodian-health\.0\.3\.0\.(?:js|umd\.cjs)|vendor\/new-control-style\.css)))(?:[?#].*)?$/.test(url) || /^https:\/\/ginkgo\.chinaums\.com\/sign-pay-pro-temp\/assist\/0\.3\.0\/(?:custom-verification\.html|assets\/[^/]+\.js|assistance-mobile-auth\/vendor\/new-control-style\.css)(?:[?#].*)?$/.test(url))
    expect(requests, 'No external customer assets, signing helper, Yuanbao resources or authentication network requests').not.toEqual([])
    expect(allowed, requests.join('\n')).toBe(true)
    expect(requests).toContain(official)
  })

  test(`${format}: hidden startup accepts host clicks/scroll; close destroy reopen rejects stale source origin session`, async ({ page }) => {
    const first = await openDuodianPage(page, { format })
    const sessionId = new URL(first.url()).searchParams.get('sessionId')!
    const frameOrigin = new URL(first.url()).origin
    await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCSS('opacity', '0')
    await page.locator('#open').click(); await page.locator('#open').click()
    expect(await page.evaluate(() => (window as any).__duodianHostClicks)).toBe(2)
    await page.mouse.wheel(0, 240); await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
    for (const invalid of ['origin', 'session', 'source']) {
      await page.evaluate(({ sessionId, frameOrigin, invalid }) => {
        const frameWindow = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame]')!.contentWindow
        const message = { source: 'assistance-mobile-auth', sessionId: invalid === 'session' ? 'old-session' : sessionId,
          type: 'ASSISTANCE_AUTH_PRESENTATION_READY' }
        dispatchEvent(new MessageEvent('message', { data: message, source: invalid === 'source' ? window : frameWindow,
          origin: invalid === 'origin' ? 'https://wrong.invalid' : frameOrigin }))
      }, { sessionId, frameOrigin, invalid })
      await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCSS('opacity', '0')
    }
    await page.evaluate(() => {
      (window as any).__closedWindow = document.querySelector('iframe')!.contentWindow
      ;(window as any).__duodianSdk.close(); (window as any).__duodianSdk.destroy()
    })
    await expectCleanHost(page)
    const next = await openDuodianPage(page, { format, closable: true })
    await page.evaluate(({ sessionId, frameOrigin }) => {
      dispatchEvent(new MessageEvent('message', { data: { source: 'assistance-mobile-auth', sessionId,
        type: 'ASSISTANCE_AUTH_SUCCESS', payload: { token: 'MOCK_ONLY_OLD_SESSION_TOKEN' } },
        source: (window as any).__closedWindow, origin: frameOrigin }))
    }, { sessionId, frameOrigin })
    await readyDuodian(page, next)
    expect(await page.evaluate(() => (window as any).__duodianState.result)).toBeNull()
    await expect(next.locator('[data-close]')).toBeVisible(); await next.locator('[data-close]').click()
    await expectCleanHost(page)
  })

  test(`${format}: native input normalizes x and preserves repeated caller titles with ordinary agreement filtering`, async ({ page }) => {
    const agreements = [{ name: '客户服务协议', link: 'https://customer.invalid/one' }, { name: '客户服务协议', link: 'https://customer.invalid/two' },
      { name: ' 《第三方共享个人信息清单》 ', link: 'https://customer.invalid/reserved' }]
    const frame = await openDuodianPage(page, { format, useCustomKeyboard: false, agreements })
    await readyDuodian(page, frame)
    await frame.locator('[data-id-value]').fill('1x20'); await expect(frame.locator('[data-id-value]')).toHaveValue('1X20')
    await expect(frame.locator('[data-keyboard]')).toBeHidden()
    await expect(frame.locator('[data-caller-agreements] input')).toHaveCount(2)
    await submit(frame)
    expect((await readHarness(frame)).before).toEqual([])
    await expect(frame.locator('.ydrz-submitbtn-text')).toHaveText('授权登录')
    const checks = frame.locator('[data-caller-agreements] input'); await checks.nth(0).check(); await checks.nth(1).check()
    await frame.waitForTimeout(1050); await submit(frame)
    expect((await readHarness(frame)).tokens).toBe(1)
    await page.evaluate(() => (window as any).__duodianSdk.destroy()); await expectCleanHost(page)
  })
}

for (const size of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`${size.width}x${size.height}: agreement inline layout retains the sentence, typography and reader return`, async ({ page }) => {
    const check = expect.configure({ soft: true, timeout: 400 })
    await page.setViewportSize(size)
    const frame = await openDuodianPage(page, { format: size.width === 390 ? 'esm' : 'umd',
      agreements: [{ name: '客户服务协议', link: 'https://customer.invalid/service' }] })
    await readyDuodian(page, frame)
    const paragraph = frame.locator('#ydrzAgreementControl p')
    const links = paragraph.locator('a')
    await check(links).toHaveCount(2)
    await check(paragraph).toHaveText('已阅读并同意 《用户信息授权协议》 《中国移动认证服务条款》。')
    await check(frame.locator('#ydrzAgreementControl > a')).toHaveCount(0)
    await check(links).toHaveText(['《用户信息授权协议》', '《中国移动认证服务条款》'])
    await check(frame.locator('#ydrzAgreementControl a').filter({ hasText: '中国移动认证服务条款' })).toHaveAttribute('href', '#operator-agreement')
    for (const selector of ['#ydrzAgreementControl', '#ydrzAgreementControl p', '#ydrzTipsControl', '#ydrzTipsControl p']) {
      const text = frame.locator(selector)
      await check(text).toHaveCSS('font-size', '12px')
      await check(text).toHaveCSS('line-height', '20px')
      await check(text).toHaveCSS('font-weight', '400')
      await check(text).toHaveCSS('color', 'rgb(141, 141, 146)')
      await check(text).toHaveCSS('text-align', 'left')
    }
    const state = frame.locator('#ydrzStateControl p')
    await check(state).toHaveCSS('font-size', '12px')
    await check(state).toHaveCSS('line-height', '21.6px')
    await check(state).toHaveCSS('font-weight', '400')
    await check(state).toHaveCSS('color', 'rgb(141, 141, 146)')
    await check(state).toHaveCSS('text-align', 'left')
    for (const link of await frame.locator('#ydrzAgreementControl a').all()) {
      await check(link).toHaveCSS('display', 'inline')
      await check(link).toHaveCSS('font-size', '12px')
      await check(link).toHaveCSS('line-height', '20px')
      await check(link).toHaveCSS('font-weight', '400')
      await check(link).toHaveCSS('color', 'rgb(119, 119, 126)')
    }
    await check(frame.locator('#ydrzTipsControl')).toHaveText('为方便您快速完成实名认证，您同意授权通信运营商和/或其关联公司核验您提供的本机手机号码和身份信息，并授权银联商务在合作商户相关支付和金融场景下，根据您的本机手机号码获取您的姓名及身份证件号。')
    await check(frame.locator('#ydrzStateControl')).toBeVisible()
    await check(state).toHaveText('授权获取必要身份信息授权有效期30天；')
    await check(state.locator('.expire-span')).toBeVisible()
    const flow = await frame.locator('[data-agreements]').evaluate(element => {
      const box = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      const characters: Array<{ slot: string; text: string; x: number; y: number; right: number; width: number }> = []
      for (const slot of ['ydrzAgreementControl', 'ydrzTipsControl']) {
        const walker = document.createTreeWalker(element.querySelector(`#${slot}`)!, NodeFilter.SHOW_TEXT)
        let node: Node | null
        while ((node = walker.nextNode())) {
          for (let offset = 0; offset < (node.textContent?.length ?? 0); offset++) {
            const text = node.textContent![offset]
            if (/\s/.test(text)) continue
            const range = document.createRange(); range.setStart(node, offset); range.setEnd(node, offset + 1)
            for (const rect of range.getClientRects()) characters.push({ slot, text, x: rect.x, y: rect.y, right: rect.right, width: rect.width })
          }
        }
      }
      return { characters, left: box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft),
        right: box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight),
        stateTop: element.querySelector('#ydrzStateControl')!.getBoundingClientRect().top,
        overflow: document.documentElement.scrollWidth - innerWidth }
    })
    const agreementEnd = flow.characters.filter(character => character.slot === 'ydrzAgreementControl').at(-1)!
    const tipsStart = flow.characters.find(character => character.slot === 'ydrzTipsControl')!
    const tipsEnd = flow.characters.at(-1)!
    const fits = agreementEnd.right + tipsStart.width <= flow.right + 1
    console.info('DUODIAN_FLOW_BOUNDARY', size.width, JSON.stringify({ agreementEnd, tipsStart, availableRight: flow.right, fits }))
    check(tipsStart.text).toBe('为')
    if (fits) check(Math.abs(tipsStart.y - agreementEnd.y), 'Tips must continue on the agreement row when their first glyph fits').toBeLessThanOrEqual(1)
    else {
      check(tipsStart.y).toBeGreaterThan(agreementEnd.y + 1)
      check(Math.abs(tipsStart.x - flow.left)).toBeLessThanOrEqual(1)
    }
    check(flow.stateTop).toBeGreaterThan(tipsEnd.y)
    check(flow.overflow).toBeLessThanOrEqual(1)
    check(flow.characters.length).toBeGreaterThan(25)
    const rows = new Set(flow.characters.map(character => Math.round(character.y)))
    check(rows.size).toBeGreaterThan(1)
    for (const [index, character] of flow.characters.entries()) {
      check(character.x).toBeGreaterThanOrEqual(flow.left - 1)
      check(character.right).toBeLessThanOrEqual(flow.right + 1)
      if (index === 0) continue
      const previous = flow.characters[index - 1]
      check(character.y).toBeGreaterThanOrEqual(previous.y - 1)
      if (Math.abs(character.y - previous.y) < 1) check(character.x).toBeGreaterThanOrEqual(previous.right - 1)
      else check(character.x).toBeCloseTo(flow.left, 0)
    }
    await frame.locator('[data-caller-agreements] input').check()
    await expect(frame.locator('[data-caller-agreements] input')).toBeChecked()
    await enterId(frame, '10')
    const reader = await openDuodianReader(frame)
    await expect(reader.locator('nav a')).toHaveCount(5)
    await expect(reader.getByRole('link', { name: '客户服务协议', exact: true })).toHaveAttribute('href', 'https://customer.invalid/service')
    await reader.getByRole('button', { name: '关闭协议', exact: true }).click()
    await waitForDuodianPresentation(page)
    await expect(frame.locator('[data-id-value]')).toHaveValue('10')
    await expect(frame.locator('[data-keyboard]')).toBeVisible()
    await expect(frame.locator('[data-caller-agreements] input')).toBeChecked()
    await expect(frame.locator('#ydrzSubmitControl')).toBeVisible()
    await page.evaluate(() => (window as any).__duodianSdk.close()); await expectCleanHost(page)
  })

  test(`${size.width}x${size.height}: edit reader busy and repeated recoverable retry acceptance media`, async ({ page }) => {
    await page.setViewportSize(size)
    const label = `${size.width}x${size.height}`
    const frame = await openDuodianPage(page, { format: size.width === 390 ? 'esm' : 'umd' }); await readyDuodian(page, frame)
    await expect(frame.locator('[data-keyboard]')).toBeHidden(); await screenshot(page, label, 'collapsed')
    const bounds = (await page.locator('iframe[data-assistance-auth-frame]').boundingBox())!
    expect(bounds.x).toBe(0); expect(bounds.width).toBe(size.width); expect(bounds.y + bounds.height).toBeCloseTo(size.height, 0)
    await frame.locator('[data-id-grid]').click()
    await expect(frame.locator('[data-id-box]').first()).toHaveCSS('border-color', 'rgb(255, 155, 52)')
    await expect(frame.locator('[data-caret]').first()).toHaveCSS('background-color', 'rgb(0, 130, 255)')
    await screenshot(page, label, 'keyboard')
    const expanded = (await page.locator('iframe[data-assistance-auth-frame]').boundingBox())!
    if (size.width === 390) {
      expect(expanded.height).toBeGreaterThan(bounds.height)
      expect(await frame.locator('[data-card]').evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
    }
    await enterId(frame, '10X'); await frame.locator('[data-key="delete"]').click()
    await expect(frame.locator('[data-id-value]')).toHaveValue('10')
    await frame.locator('[data-collapse]').click(); await expect(frame.locator('[data-keyboard]')).toBeHidden()
    await waitForDuodianPresentation(page)
    // The existing 500px media query can choose different spacing after a keyboard resize.
    // Collapsing must release keyboard space and retain the full, bottom-anchored card.
    const collapsed = (await page.locator('iframe[data-assistance-auth-frame]').boundingBox())!
    expect(collapsed.height).toBeLessThan(expanded.height)
    expect(collapsed.height).toBeLessThanOrEqual(size.height)
    expect(collapsed.y + collapsed.height).toBeCloseTo(size.height, 0)
    expect(await frame.locator('[data-card]').evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
    await expect(frame.locator('[data-id-value]')).toHaveValue('10')
    await expect(frame.locator('#ydrzSubmitControl')).toBeInViewport()
    await expect(frame.locator('#ydrzStateControl .expire-span')).toBeInViewport()
    await frame.locator('[data-id-grid]').click(); await expect(frame.locator('[data-keyboard]')).toBeVisible()
    const reader = await openDuodianReader(frame)
    await expect(reader.locator('nav a')).toHaveCount(4)
    for (const title of ['《用户认证服务隐私政策》','《个人信息收集清单》','《敏感个人信息处理规则》','《第三方共享个人信息清单》']) {
      await reader.getByRole('link', { name: title, exact: true }).click()
      await expect(reader.locator('article')).not.toBeEmpty()
      await reader.waitForTimeout(500)
      await reader.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      if (title === '《用户认证服务隐私政策》') expect(await reader.evaluate(() => scrollY)).toBeGreaterThan(0)
      await reader.waitForTimeout(500)
      if (title === '《第三方共享个人信息清单》') {
        const nested = reader.locator('article a[data-doc-key]').first()
        await expect(nested).toBeVisible()
        await nested.click(); await expect(reader.locator('article')).not.toBeEmpty()
        await reader.waitForTimeout(600)
        await reader.getByRole('button', { name: '返回', exact: true }).click()
        await expect(reader.locator('table')).toBeVisible()
      }
      await reader.getByRole('button', { name: '返回', exact: true }).click()
    }
    await reader.getByRole('button', { name: '关闭协议', exact: true }).click()
    await expect(frame.locator('[data-id-value]')).toHaveValue('10')
    await expect(frame.locator('[data-keyboard]')).toBeVisible()
    await screenshot(page, label, 'reader-return')
    // Disabled official clicks cannot enter validation or start loading.
    await submit(frame)
    await expect(frame.locator('.ydrz-submitbtn-text')).toHaveText('授权登录')
    await frame.waitForTimeout(1050); await submit(frame)
    expect((await readHarness(frame)).before).toEqual([])
    await enterId(frame, '2X'); await expect(frame.locator('[data-id-value]')).toHaveValue('102X')
    await expect(frame.locator('[data-keyboard]')).toBeHidden()
    await frame.waitForTimeout(1050); await rememberAttempt(frame); await submit(frame)
    await frame.locator('[data-sdk-stub-click-target]').click({ force: true })
    expect((await readHarness(frame)).tokens).toBe(1)
    await expect(frame.locator('.ydrz-submitbtn-text')).toHaveClass(/loading/)
    await expect(frame.locator('[data-other]')).toBeDisabled()
    await frame.locator('[data-id-grid]').click({ force: true }); await expect(frame.locator('[data-keyboard]')).toBeHidden()
    await screenshot(page, label, 'busy')
    for (const code of ['105999', '103135']) {
      const sentinel = 'MOCK_ONLY_SECRET_110101199001011234_TOKEN_SIGN'
      const logs: string[] = []; page.on('console', message => logs.push(message.text()))
      await triggerInitControlError(frame, code, sentinel)
      await expect.poll(() => frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(code === '105999' ? 2 : 3)
      await lateAttempt(frame)
      await triggerInitControlAuthReady(frame)
      await expect(frame.locator('.ydrz-submitbtn-text')).toHaveText('授权登录')
      await expect(frame.locator('[data-id-value]')).toHaveValue('102X')
      await expect(frame.locator('[data-other]')).toBeEnabled()
      expect(await frame.locator('body').innerText()).not.toContain(sentinel)
      expect(logs.join('\n')).not.toContain(sentinel)
      const publicData = await page.evaluate(() => JSON.stringify({ notices:(window as any).__duodianState.notices,
        events:(window as any).__duodianState.events,local:{...localStorage},session:{...sessionStorage} }))
      expect(publicData).not.toMatch(/MOCK_ONLY_SECRET|MOCK_ONLY_SIGNED|INVALID_SIGN|102X|token|traceId|timestamp/)
      if (code === '105999') await screenshot(page, label, 'retry')
      await frame.waitForTimeout(1050); await submit(frame)
    }
    const h = await readHarness(frame)
    expect(h.tokens).toBe(3); expect(h.synthetic).toBe(0); expect(h.clicks.every((event: any) => event.isTrusted && event.targetInsideOfficialControl)).toBe(true)
    await triggerInitControlSuccess(frame, 'MOCK_ONLY_SUCCESS_TOKEN', 'MOCK_ONLY_SUCCESS_KEY')
    await triggerInitControlSuccess(frame, 'MOCK_ONLY_DUPLICATE_TOKEN', 'MOCK_ONLY_DUPLICATE_KEY')
    await expectCleanHost(page)
    expect(await page.evaluate(() => (window as any).__duodianState.result)).toMatchObject({ status:'success',idLast4:'102X',token:'MOCK_ONLY_SUCCESS_TOKEN' })
    const reopened = await openDuodianPage(page); await readyDuodian(page, reopened)
    await reopened.locator('[data-other]').click(); await expectCleanHost(page)
    expect(await page.evaluate(() => (window as any).__duodianState.error.message)).toContain('cancelled')
    if (size.width === 390) await saveVideo(page, 'mock-edit-reader-retry')
  })
}

test('viewport resize rotation and controlled visualViewport preserve accessible keys and cleanup', async ({ page }) => {
  await installVisualViewportMock(page, 844)
  await page.addInitScript(() => {
    ;(window as any).__resizeMessages = 0
    window.addEventListener('message', event => { if (event.data?.type === 'ASSISTANCE_AUTH_RESIZE') (window as any).__resizeMessages++ })
  })
  const frame = await openDuodianPage(page); await readyDuodian(page, frame); await frame.locator('[data-id-grid]').click()
  for (const size of [{ width:844,height:390 }, { width:320,height:568 }, { width:390,height:844 }]) {
    await page.setViewportSize(size); await setVisualViewportHeight(page, size.height - 40)
    await frame.evaluate(height => (window as any).__setAssistanceVisualViewport(height), size.height - 40)
    await frame.locator('[data-key="0"]').click(); await frame.locator('[data-key="X"]').click()
    await frame.locator('[data-key="delete"]').click(); await frame.locator('[data-key="delete"]').click()
    await expect(frame.locator('[data-id-value]')).toHaveValue('')
    const bounds = (await page.locator('iframe[data-assistance-auth-frame]').boundingBox())!
    expect(bounds.width).toBe(size.width); expect(bounds.height).toBeLessThanOrEqual(size.height)
    await frame.locator('[data-id-grid]').scrollIntoViewIfNeeded(); await expect(frame.locator('[data-id-grid]')).toBeInViewport()
    await frame.locator('[data-sdk-stub-click-target]').scrollIntoViewIfNeeded(); await expect(frame.locator('[data-sdk-stub-click-target]')).toBeInViewport()
  }
  await page.waitForTimeout(250)
  const settled = await page.evaluate(() => (window as any).__resizeMessages)
  await page.waitForTimeout(350)
  expect(await page.evaluate(() => (window as any).__resizeMessages)).toBe(settled)
  await page.evaluate(() => (window as any).__duodianSdk.close()); await expectCleanHost(page)
  await page.waitForTimeout(250)
  expect(await page.evaluate(() => (window as any).__resizeMessages)).toBe(settled)
})

for (const format of formats) test(`${format}: 15 second hidden initialization timeout keeps host usable and fully cleans before reopening`, async ({ page }) => {
  const frame = await openDuodianPage(page, { format })
  await triggerShowAuthPageSuccess(frame) // Never send authReady; the official control stays hidden.
  const started = Date.now()
  for (let step = 0; step < 8; step++) {
    await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCSS('opacity', '0')
    await page.locator('#open').click(); await page.mouse.wheel(0, step % 2 ? -100 : 100)
    // Keep all eight host interactions before the 15s deadline even when scrolling takes time.
    await page.waitForTimeout(Math.min(1400, Math.max(0, 12000 - (Date.now() - started))))
  }
  await expectCleanHost(page)
  expect(Date.now() - started).toBeGreaterThanOrEqual(14000)
  expect(await page.evaluate(() => (window as any).__duodianHostClicks)).toBe(8)
  expect(await page.evaluate(() => (window as any).__duodianState.error.message)).toContain('超时')
  await page.waitForTimeout(1200)
  const next = await openDuodianPage(page, { format:'umd' }); await readyDuodian(page,next)
  await page.waitForTimeout(1200); await page.evaluate(() => (window as any).__duodianSdk.close()); await expectCleanHost(page)
  if (format === 'esm') await saveVideo(page,'mock-timeout-cleanup')
})
