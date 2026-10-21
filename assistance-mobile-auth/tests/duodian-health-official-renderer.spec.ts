import { existsSync, readFileSync } from 'node:fs'
import { copyFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test, type Frame } from '@playwright/test'
import { installDuodianOfficialStub, openDuodianPage, enterId, openDuodianReader, waitForDuodianPresentation } from './duodian-health-helpers'
import { triggerShowAuthPageSuccess, triggerInitControlError } from './mobile-auth-flow-helpers'

const officialUrl = 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js'
async function officialSource() {
  const existing = process.env.DUODIAN_OFFICIAL_SOURCE
  if (existing && existsSync(existing)) return readFileSync(existing, 'utf8')
  const response = await fetch(officialUrl, { signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`Official renderer download: HTTP ${response.status}`)
  const source = await response.text()
  const directory = await mkdtemp(join(tmpdir(), 'duodian-official-renderer-'))
  await writeFile(join(directory, 'jssdk-1.0.6.min.js'), source)
  return source
}

// The official submit constructor, active-control setter and trusted listener are real.
// Only external authentication/readiness/getToken are simulated; no auth payload is recorded.
for (const format of ['esm', 'umd'] as const) test(`${format}: authentic submit, recovery and uniform typography`, async ({ page }, info) => {
  const blocked: string[] = []
  const publicHost = process.env.PLAYWRIGHT_LIVE_HOST_URL
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1' || (publicHost && url.origin === new URL(publicHost).origin) ||
      url.protocol === 'data:' || url.protocol === 'blob:') return route.continue()
    blocked.push(url.origin)
    return route.abort()
  })
  await installDuodianOfficialStub(page, { agreementReader: false })
  test.skip(Boolean(publicHost) && format === 'esm', 'Public order host imports UMD; local matrix covers both formats')
  const frame = publicHost ? await (async () => {
    await page.goto(publicHost)
    await page.locator('#open').click()
    const element = page.locator('iframe[data-assistance-auth-frame]')
    await expect(element).toHaveCount(1)
    const loaded = await (await element.elementHandle())!.contentFrame()
    if (!loaded) throw new Error('Public customer iframe unavailable')
    await expect.poll(() => loaded.evaluate(() => typeof (window as any).__mobileAuthHarness?.lastShowAuthPageRequest?.success)).toBe('function')
    return loaded
  })() : await openDuodianPage(page, { format })
  await triggerShowAuthPageSuccess(frame)
  await expect.poll(() => frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(1)
  async function installAuthenticControls(frame: Frame) {
  // Save only the external-auth double, then load genuine 1.0.6 methods.
  await frame.evaluate(() => { (window as any).__mockInit = (window as any).YDRZAuthSF.initControl })
  const source = await officialSource()
  const marker = 'var _0x39b7ec='
  expect(source.includes(marker), 'Official 1.0.6 instrumentation point').toBe(true)
  await frame.addScriptTag({ content: source.replace(marker,
    'window.__auditControl=_0x11307e;window.__auditOptions=_0x40375d;window.__auditData=_0x50f6a5;window.__useControl=function(c){_0x46c3a1=c};var _0x39b7ec=') })
  await frame.evaluate(() => {
    const w = window as any
    w.__beforeCalls = 0; w.__tokenCalls = 0; w.__trustedClicks = []; w.__setterCalls = []
    const update = w.YDRZAuthSF.updateSubmitBtnStatus
    w.YDRZAuthSF.updateSubmitBtnStatus = (state: any) => { w.__setterCalls.push({ ...state }); return update(state) }
    w.__installOfficialControl = () => {
    const request = w.__mobileAuthHarness.lastInitControlRequest
    const control = Object.create(w.__auditControl.prototype)
    control._elements = []
    control._tips_div = document.getElementById('ydrzTipsControl')!
    control._agreement_div = document.getElementById('ydrzAgreementControl')!
    control._submit_div = document.getElementById('ydrzSubmitControl')!
    control._tips_div.replaceChildren()
    control._agreement_div.replaceChildren()
    control._submit_div.replaceChildren()
    control._layerOpt = { ...request.styleOption,
      submitBtnLoadingStyle: { ...request.styleOption.submitBtnLoadingStyle, url: '', animationName: 'ydrz-rotate360',
        animationDuration: '1s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' },
      agreeStyle: { ...request.styleOption.agreeStyle, checkboxStyle: {} } }
    w.__auditData.authDetaiItem = { identity: '授权获取您的姓名、身份证号码及手机号码，用于身份核验' }
    Object.assign(w.__auditOptions, { elementInfo: {},
      rzPolicyInfo: { contentCM: '《中国移动认证服务条款》', linkCM: 'https://wap.cmpassport.com/resources/html/sfContract.html' },
      isLocalMsisdn: '0',
      authTips: { businessNameTrue: { notNative: {
        authTipsPrefix: '为方便您快速完成实名认证，您同意授权通信运营商和/或其关联公司核验您提供的本机手机号码和身份信息，',
        businessName: '', authTipsSuffix: '并授权银联商务在合作商户相关支付和金融场景下，根据您的本机手机号码获取您的姓名及身份证件号。',
      } } },
      scopeInfo: { identity: { expireTime: '30天' } }, authType: '0', operator: 'CM',
      beforeSubmit: () => { w.__beforeCalls++; return request.beforeSubmit() } })
    control.getToken = () => { w.__tokenCalls++ }
    w.__useControl(control)
    control.createSubmitControl()
    if (!control._submit_div.__trustedObserver) {
      control._submit_div.__trustedObserver = true
      control._submit_div.addEventListener('click', (event: Event) => { w.__trustedClicks.push(event.isTrusted) }, true)
    }
    control.createTipsControl()
    control.createAgreementsControl()
    }
    w.YDRZAuthSF.initControl = (request: any) => { w.__mockInit(request); w.__installOfficialControl() }
    w.__installOfficialControl()
  })
  }
  await installAuthenticControls(frame)
  const submit = frame.locator('#ydrzSubmitControl')
  const timeline: Array<Record<string, unknown>> = []
  const capture = async (name: string) => {
    await waitForDuodianPresentation(page)
    timeline.push({ state: name, ...await frame.evaluate(() => {
      const w = window as any, button = document.getElementById('ydrzSubmitControl')!
      return { disabled: button.classList.contains('disabled'), loading: Boolean(button.querySelector('.loading')),
        background: getComputedStyle(button).backgroundColor, beforeCalls: w.__beforeCalls, tokenCalls: w.__tokenCalls,
        inputLength: (document.querySelector('[data-id-value]') as HTMLInputElement).value.length,
        trustedClicks: [...w.__trustedClicks], setterCalls: [...w.__setterCalls] }
    }) })
    await page.screenshot({ path: info.outputPath(`${name}.png`) })
    await page.waitForTimeout(/recovery|edited/.test(name) ? 2500 : 1500) // Keep error and editing observable.
  }
  const expectDisabled = async (disabled: boolean) => {
    if (disabled) await expect(submit).toHaveClass(/disabled/)
    else await expect(submit).not.toHaveClass(/disabled/)
    await expect(submit).toHaveCSS('background-color', disabled ? 'rgb(226, 230, 226)' : 'rgb(25, 190, 0)')
  }
  await expectDisabled(true) // Official initial state before runtime authReady.
  await page.waitForTimeout(1200)
  await frame.evaluate(() => (window as any).__mobileAuthHarness.lastInitControlRequest.authReady({ code: '103000' }))
  await capture('empty-gray'); await expectDisabled(true)
  await enterId(frame, '0000'); await expectDisabled(false); await capture('four-green')
  await frame.locator('[data-id-grid]').click(); await frame.locator('[data-key="delete"]').click()
  await expectDisabled(true); await capture('delete-gray')
  await enterId(frame, 'X'); await expectDisabled(false)
  const reader = await openDuodianReader(frame)
  await expect(reader.locator('[data-agreement-reader]')).toBeVisible()
  await reader.getByRole('button', { name: '关闭协议', exact: true }).click()
  await expect(frame.locator('.ydrz-confirm-bg-wrap')).toHaveCount(0)
  await expect(frame.locator('[data-id-value]')).toHaveValue('000X')
  await expect(frame.locator('[data-keyboard]')).toBeHidden()
  await expectDisabled(false)
  await frame.evaluate(() => { (window as any).__oldOfficialAttempt = (window as any).__mobileAuthHarness.lastInitControlRequest })
  await submit.click(); await capture('busy')
  await submit.click()
  expect(await frame.evaluate(() => ({ before: (window as any).__beforeCalls, tokens: (window as any).__tokenCalls }))).toEqual({ before: 1, tokens: 1 })
  await expect(frame.locator('[data-id-grid]')).toHaveAttribute('aria-disabled', 'true')
  await triggerInitControlError(frame, '105999', 'MOCK_ONLY_RECOVERABLE')
  await expectDisabled(true)
  await capture('recovery-wait-gray')
  await frame.evaluate(() => (window as any).__oldOfficialAttempt.authReady({ code: '103000' }))
  await expectDisabled(true)
  await frame.evaluate(() => (window as any).__mobileAuthHarness.lastInitControlRequest.authReady({ code: '103000' }))
  await expectDisabled(false); await capture('recovery-green')
  await frame.locator('[data-id-grid]').click(); await frame.locator('[data-key="delete"]').click()
  await expectDisabled(true); await capture('edited-delete-gray')
  await enterId(frame, '1'); await expectDisabled(false)
  await capture('edited-retry-green')
  await submit.click(); await capture('retry-busy')
  const clicks = await frame.evaluate(() => ({ before: (window as any).__beforeCalls, tokens: (window as any).__tokenCalls,
    trusted: (window as any).__trustedClicks as boolean[] }))
  expect({ before: clicks.before, tokens: clicks.tokens }).toEqual({ before: 2, tokens: 2 })
  expect(clicks.trusted.length).toBeGreaterThanOrEqual(2)
  expect(clicks.trusted.every(Boolean)).toBe(true)
  const typography = await frame.evaluate(() => {
    const w = window as any
    return {
      viewport: { width: innerWidth, height: innerHeight },
      // Only typography configuration is recorded; no auth payload or signing data.
      agreeStyle: { fontSize: w.__mobileAuthHarness.lastInitControlRequest.styleOption.agreeStyle.fontSize },
      dom: ['ydrzAgreementControl', 'ydrzTipsControl'].map(id => document.getElementById(id)!.outerHTML),
      nodes: [...document.querySelectorAll<HTMLElement>('#ydrzAgreementControl, #ydrzAgreementControl *, #ydrzTipsControl, #ydrzTipsControl *')]
        .filter(node => node.textContent?.trim()).map(node => {
          const style = getComputedStyle(node)
          return { tag: node.tagName, id: node.id, className: node.className, text: node.textContent,
            inlineStyle: node.getAttribute('style'), fontSize: style.fontSize,
            lineHeight: style.lineHeight, fontFamily: style.fontFamily, fontWeight: style.fontWeight,
            color: style.color, display: style.display }
        }),
    }
  })
  await writeFile(info.outputPath('typography.json'), JSON.stringify({ ...typography, host: page.url(), blockedOrigins: [...new Set(blocked)] }, null, 2))
  await page.screenshot({ path: info.outputPath('official-render.png'), fullPage: true })
  await expect(frame.locator('#ydrzAgreementControl a')).toHaveCount(2)
  await expect(frame.locator('#ydrzAgreementControl a').last()).toHaveText('《中国移动认证服务条款》')
  await expect(frame.locator('#ydrzTipsControl .auth-tips-title')).toBeVisible()
  for (const node of typography.nodes) {
    expect.soft(node.fontSize, `${node.id || node.className || node.tag}: ${node.text}`).toBe('12px')
    expect.soft(node.color).toBe(node.tag === 'A' ? 'rgb(119, 119, 126)' : 'rgb(141, 141, 146)')
  }
  const flow = await frame.locator('[data-agreements]').evaluate(element => {
    function glyph(id: string, last: boolean) {
      const walker = document.createTreeWalker(document.getElementById(id)!, NodeFilter.SHOW_TEXT)
      const nodes: Text[] = []; let node: Node | null
      while ((node = walker.nextNode())) if (node.textContent?.trim()) nodes.push(node as Text)
      const text = last ? nodes.at(-1)! : nodes[0]
      const offset = last ? text.length - 1 : 0
      const range = document.createRange(); range.setStart(text, offset); range.setEnd(text, offset + 1)
      const rect = range.getBoundingClientRect()
      return { x: rect.x, y: rect.y, right: rect.right, width: rect.width }
    }
    return { end: glyph('ydrzAgreementControl', true), start: glyph('ydrzTipsControl', false), right: element.getBoundingClientRect().right }
  })
  if (flow.end.right + flow.start.width <= flow.right + 1) expect(Math.abs(flow.start.y - flow.end.y)).toBeLessThanOrEqual(1)
  expect(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(frame.locator('#ydrzSubmitControl')).toBeVisible()
  await expect(frame.locator('[data-id-grid]')).toBeVisible()
  await writeFile(info.outputPath('submit-timeline.json'), JSON.stringify({ format, project: info.project.name,
    host: page.url(), timeline, blockedOrigins: [...new Set(blocked)] }, null, 2))
  // Exercise every caller agreement with another genuine disabled control in the same matrix.
  if (!publicHost) {
    await page.evaluate(() => (window as any).__duodianSdk.close())
    const consentFrame = await openDuodianPage(page, { format, agreements: [
      { name: '客户服务协议', link: 'https://customer.invalid/one' },
      { name: '客户隐私协议', link: 'https://customer.invalid/two' },
    ] })
    await triggerShowAuthPageSuccess(consentFrame)
    await installAuthenticControls(consentFrame)
    await consentFrame.evaluate(() => (window as any).__mobileAuthHarness.lastInitControlRequest.authReady({ code: '103000' }))
    await waitForDuodianPresentation(page)
    await enterId(consentFrame, '0000')
    const consentSubmit = consentFrame.locator('#ydrzSubmitControl')
    const checks = consentFrame.locator('[data-caller-agreements] input')
    await expect(consentSubmit).toHaveClass(/disabled/)
    await checks.nth(0).check(); await expect(consentSubmit).toHaveClass(/disabled/)
    await checks.nth(1).check(); await expect(consentSubmit).not.toHaveClass(/disabled/)
    await checks.nth(0).uncheck(); await expect(consentSubmit).toHaveClass(/disabled/)
    await checks.nth(0).check(); await expect(consentSubmit).not.toHaveClass(/disabled/)
    await consentSubmit.click()
    expect(await consentFrame.evaluate(() => ({ before: (window as any).__beforeCalls, tokens: (window as any).__tokenCalls }))).toEqual({ before: 1, tokens: 1 })
    await page.evaluate(() => (window as any).__duodianSdk.close())
  }
  const video = page.video()
  await page.close()
  if (!video) throw new Error('Authentic submit recording missing')
  if (process.env.DUODIAN_MEDIA_DIR) {
    await mkdir(process.env.DUODIAN_MEDIA_DIR, { recursive: true })
    await copyFile(await video.path(), join(process.env.DUODIAN_MEDIA_DIR, `${format}-${info.project.name}.webm`))
  }
})
