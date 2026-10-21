import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Frame, type Page, type Route } from '@playwright/test'
import { installDuodianOfficialStub, enterId, openDuodianReader, waitForDuodianPresentation, expectCleanHost } from './duodian-health-helpers'
import { readCustomBootConfig } from './custom-page-helpers'
import { triggerShowAuthPageSuccess, triggerInitControlAuthReady, triggerInitControlError, triggerInitControlSuccess } from './mobile-auth-flow-helpers'

const formalBase = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.0/'
const formalLoader = formalBase + 'custom-verification.html'
const customerOrigin = 'https://formal-customer.example'
const officialUrl = 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js'
// Read the extracted final package, its dist, or the version dist directly. Never build here.
function versionDist() {
  const input = process.env.FORMAL_RELEASE_DIST
  if (!input) throw new Error('Set FORMAL_RELEASE_DIST to the actual extracted formal package or dist')
  const result = [path.join(input, 'dist/assist/0.3.0'), path.join(input, 'assist/0.3.0'), input]
    .find(candidate => existsSync(path.join(candidate, 'custom-verification.html')))
  if (!result) throw new Error('Formal archive has no 0.3.0 custom-verification.html')
  return path.resolve(result)
}
let sourcePromise: Promise<string> | undefined
function officialSource() {
  sourcePromise ??= (async () => {
    if (process.env.DUODIAN_OFFICIAL_SOURCE) return readFileSync(process.env.DUODIAN_OFFICIAL_SOURCE, 'utf8')
    const response = await fetch(officialUrl, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error('Official 1.0.6 renderer download failed: ' + response.status)
    return response.text()
  })()
  return sourcePromise
}
function hostFixture(format: 'esm' | 'umd', generic = false) {
  const name = generic ? 'assistance-mobile-auth.0.3.0.' : 'assistance-mobile-auth.duodian-health.0.3.0.'
  const genericPage = {
    html: '<main data-smoke>Generic customPage<div id="ydrzPhoneControl"></div><div id="ydrzTipsControl"></div><div id="ydrzStateControl"></div><div id="ydrzYZMControl" hidden></div><div id="ydrzYZMBtnControl" hidden></div><div id="ydrzSubmitControl"></div><div id="ydrzAgreementControl"></div></main>',
    css: '', js: 'window.AssistanceCustomPage.register({});',
  }
  return [
    '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><p>Formal artifact fixture</p><script type="module">',
    'let module;',
    format === 'esm' ? 'module = await import("/sdk/' + name + 'js");' :
      'await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src="/sdk/' + name + 'umd.cjs";script.onload=resolve;script.onerror=reject;document.head.append(script)}); module=window.AssistanceMobileAuth;',
    'window.__openFormal=()=>{window.__formalSdk?.destroy();const state={result:null,error:null,success:0,cancel:0,close:0,notices:0};window.__formalState=state;',
    'window.__formalSdk=module.createAssistanceMobileAuthSdk({authParams:{version:"3.0",appId:"MOCK_ONLY_PROVIDER_ID",sign:"MOCK_ONLY_INVALID",traceId:"MOCK_ONLY_TRACE",timestamp:"MOCK_ONLY_TIMESTAMP",authType:"0",scope:"3ElementsAuthAssistFill"},closable:true,',
    generic ? 'appId:"8a9481c79c05c8bd019f6a0a6c002457",customPage:' + JSON.stringify(genericPage) + ',' : '',
    'onSuccess:()=>state.success++,onCancel:()=>state.cancel++,onClose:()=>state.close++,onErrorNotice:()=>state.notices++});',
    'window.__formalPromise=window.__formalSdk.open({requestId:"MOCK_ONLY_FORMAL_BROWSER"}).then(result=>state.result=result,error=>state.error=error.message);};',
    '</script></body></html>',
  ].join('\n')
}
async function setupArtifactRoutes(page: Page, format: 'esm' | 'umd', generic = false) {
  const root = versionDist(), loaded: string[] = [], failed: string[] = []
  page.on('requestfailed', request => failed.push(request.url()))
  await page.route('**/*', route => route.abort())
  await installDuodianOfficialStub(page, { agreementReader: false })
  // The authentic renderer logs control events. Keep that external dependency
  // local to this network-simulated test rather than uploading fixture payloads.
  await page.route('https://log-h5.cmpassport.com:9443/log/logReport', route => route.fulfill({
    status: route.request().method() === 'OPTIONS' ? 204 : 200,
    body: route.request().method() === 'OPTIONS' ? '' : '{}',
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': '*' },
  }))
  const serve = async (route: Route, relative: string) => {
    const file = path.resolve(root, relative)
    expect(file.startsWith(root + path.sep), 'Read only extracted version resources').toBe(true)
    expect(existsSync(file), 'Archive resource: ' + relative).toBe(true)
    loaded.push(relative)
    const extension = path.extname(file)
    await route.fulfill({ body: readFileSync(file), contentType: extension === '.html' ? 'text/html' :
      extension === '.css' ? 'text/css' : 'application/javascript', headers: { 'access-control-allow-origin': customerOrigin } })
  }
  await page.route(formalBase + '**', async route => {
    const url = new URL(route.request().url())
    // Check the actual requested address before reading physical archive bytes.
    if (url.pathname.endsWith('/custom-verification.html')) expect(url.origin + url.pathname).toBe(formalLoader)
    await serve(route, decodeURIComponent(url.pathname.slice(new URL(formalBase).pathname.length)))
  })
  await page.route(customerOrigin + '/sdk/**', route =>
    serve(route, 'assistance-mobile-auth/' + new URL(route.request().url()).pathname.slice('/sdk/'.length)))
  await page.route(customerOrigin + '/', route => route.fulfill({ contentType: 'text/html', body: hostFixture(format, generic) }))
  return { loaded, failed }
}
async function openFormal(page: Page): Promise<Frame> {
  await expect.poll(() => page.evaluate(() => typeof (window as any).__openFormal)).toBe('function')
  await page.evaluate(() => (window as any).__openFormal())
  const element = page.locator('iframe[data-assistance-auth-frame]')
  await expect(element).toHaveCount(1)
  const src = new URL(await element.getAttribute('src') as string)
  expect(src.origin + src.pathname).toBe(formalLoader)
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Actual formal archive iframe unavailable')
  await expect.poll(() => frame.evaluate(() => typeof (window as any).__mobileAuthHarness?.lastShowAuthPageRequest?.success)).toBe('function')
  await triggerShowAuthPageSuccess(frame)
  await expect.poll(() => frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(1)
  return frame
}
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

for (const format of ['esm', 'umd'] as const) test(format + ': actual formal SDK, official controls, recovery, agreements and callbacks', async ({ page }, info) => {
  const requests: string[] = []
  page.on('request', request => requests.push(request.url()))
  const evidence = await setupArtifactRoutes(page, format)
  await page.goto(customerOrigin + '/')
  const frame = await openFormal(page)
  expect((await readCustomBootConfig(frame)).trustedBusinessBaseUrl).toBe('https://ginkgo.chinaums.com/sign-pay-pro/')
  expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.lastShowAuthPageRequest.data.appId)).toBe('MOCK_ONLY_PROVIDER_ID')
  await installAuthenticControls(frame)
  const button = frame.locator('#ydrzSubmitControl')
  const disabled = async (value: boolean) => {
    if (value) await expect(button).toHaveClass(/disabled/)
    else await expect(button).not.toHaveClass(/disabled/)
    await expect(button).toHaveCSS('background-color', value ? 'rgb(226, 230, 226)' : 'rgb(25, 190, 0)')
  }
  await triggerInitControlAuthReady(frame)
  await waitForDuodianPresentation(page)
  await expect(frame.locator('[data-custom-template="duodian-health"]')).toBeVisible()
  const images = await frame.locator('[data-security-title],[data-identity-guide]').evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).src))
  expect(images).toHaveLength(2)
  images.forEach(image => expect(image).toMatch(/^data:image\/jpeg;base64,/))
  await disabled(true)
  await enterId(frame, '0000'); await disabled(false)
  await frame.locator('[data-id-grid]').click()
  await frame.locator('[data-key="delete"]').click(); await disabled(true)
  await enterId(frame, '0'); await disabled(false)
  const reader = await openDuodianReader(frame)
  await expect(reader.locator('nav a')).toHaveCount(4)
  for (const title of ['《用户认证服务隐私政策》', '《个人信息收集清单》', '《敏感个人信息处理规则》', '《第三方共享个人信息清单》']) {
    await reader.getByRole('link', { name: title, exact: true }).click()
    await expect(reader.locator('article')).not.toBeEmpty()
    if (title === '《第三方共享个人信息清单》') {
      await reader.locator('article a[data-doc-key]').first().click()
      await expect(reader.locator('article')).not.toBeEmpty()
      await reader.getByRole('button', { name: '返回', exact: true }).click()
      await expect(reader.locator('table')).toBeVisible()
    }
    await reader.getByRole('button', { name: '返回', exact: true }).click()
  }
  await reader.getByRole('button', { name: '关闭协议', exact: true }).click()
  await expect(frame.locator('.ydrz-confirm-bg-wrap')).toHaveCount(0)
  await expect(frame.locator('[data-id-value]')).toHaveValue('0000')
  await disabled(false)
  const sizes = await frame.locator('#ydrzAgreementControl, #ydrzAgreementControl *, #ydrzTipsControl, #ydrzTipsControl *')
    .evaluateAll(nodes => nodes.filter(node => node.textContent?.trim()).map(node => getComputedStyle(node).fontSize))
  expect(sizes.length).toBeGreaterThan(4)
  sizes.forEach(size => expect(size).toBe('12px'))
  await page.screenshot({ path: info.outputPath('formal-ready.png') })
  await frame.evaluate(() => { (window as any).__oldAttempt = (window as any).__mobileAuthHarness.lastInitControlRequest })
  await button.click(); await button.click()
  expect(await frame.evaluate(() => ({ before: (window as any).__beforeCalls, tokens: (window as any).__tokenCalls }))).toEqual({ before: 1, tokens: 1 })
  await expect(frame.locator('[data-id-grid]')).toHaveAttribute('aria-disabled', 'true')
  await triggerInitControlError(frame, '105999', 'MOCK_ONLY_RECOVERABLE')
  await disabled(true)
  await expect.poll(() => page.evaluate(() => (window as any).__formalState.notices)).toBe(1)
  await frame.evaluate(() => (window as any).__oldAttempt.authReady({ code: '103000' }))
  await disabled(true)
  await triggerInitControlAuthReady(frame); await disabled(false)
  await button.click()
  expect(await frame.evaluate(() => ({ before: (window as any).__beforeCalls, tokens: (window as any).__tokenCalls,
    trusted: (window as any).__trustedClicks.every(Boolean) }))).toEqual({ before: 2, tokens: 2, trusted: true })
  await triggerInitControlSuccess(frame, 'MOCK_ONLY_TOKEN', 'MOCK_ONLY_KEY')
  await expectCleanHost(page)
  await expect.poll(() => page.evaluate(() => (window as any).__formalState.result)).toEqual({
    status: 'success', token: 'MOCK_ONLY_TOKEN', idLast4: '0000', keyA: 'MOCK_ONLY_KEY', requestId: 'MOCK_ONLY_FORMAL_BROWSER', message: '验证完成',
  })
  expect(await page.evaluate(() => ({ success: (window as any).__formalState.success, cancel: (window as any).__formalState.cancel }))).toEqual({ success: 1, cancel: 0 })
  const cancelled = await openFormal(page)
  await installAuthenticControls(cancelled); await triggerInitControlAuthReady(cancelled)
  await waitForDuodianPresentation(page)
  await cancelled.locator('[data-close]').click()
  await expectCleanHost(page)
  await expect.poll(() => page.evaluate(() => ({ success: (window as any).__formalState.success, cancel: (window as any).__formalState.cancel }))).toEqual({ success: 0, cancel: 1 })
  expect(evidence.loaded).toContain('custom-verification.html')
  expect(evidence.loaded).toContain('assistance-mobile-auth/vendor/new-control-style.css')
  expect(evidence.loaded.some(relative => /^assets\/.+\.js$/.test(relative))).toBe(true)
  expect(evidence.failed).toEqual([])
  expect(requests.some(url => url.includes('/sign-pay-pro-temp/'))).toBe(false)
  await info.attach('formal-resources', { body: JSON.stringify({ loaded: evidence.loaded, requests }, null, 2), contentType: 'application/json' })
})

test('generic frozen wrapper requests the exact formal customPage loader', async ({ page }) => {
  await setupArtifactRoutes(page, 'umd', true)
  await page.goto(customerOrigin + '/')
  await expect.poll(() => page.evaluate(() => typeof (window as any).__openFormal)).toBe('function')
  await page.evaluate(() => (window as any).__openFormal())
  const iframe = page.locator('iframe[data-assistance-auth-frame]')
  await expect(iframe).toHaveCount(1)
  const src = new URL(await iframe.getAttribute('src') as string)
  expect(src.origin + src.pathname).toBe(formalLoader)
  const frame = await (await iframe.elementHandle())!.contentFrame()
  await expect.poll(() => frame!.evaluate(() => typeof (window as any).__mobileAuthHarness?.lastShowAuthPageRequest?.success)).toBe('function')
  await page.evaluate(() => (window as any).__formalSdk.close())
  await expectCleanHost(page)
})
