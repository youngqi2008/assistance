import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Frame, type Page, type Route } from '@playwright/test'
import { installDuodianOfficialStub, enterId, openDuodianReader, expectCleanHost } from './duodian-health-helpers'
import { readCustomBootConfig } from './custom-page-helpers'
import { triggerShowAuthPageSuccess, triggerShowAuthPageError, triggerInitControlAuthReady,
  triggerInitControlError, triggerInitControlSuccess } from './mobile-auth-flow-helpers'
import { install031OfficialControls } from './duodian-health031-official-controls'

// Private artifact-test override; production defaults and public SDK options are unchanged.
const formalBase = process.env.DUODIAN031_RESOURCE_BASE_URL || 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/'
const resourceRoot = new URL('../../', formalBase)
const forbiddenPrefix = resourceRoot.pathname === '/sign-pay-pro-temp/' ? '/sign-pay-pro/' : '/sign-pay-pro-temp/'
const formalLoader = formalBase + 'custom-verification.html'
const customerOrigin = 'https://url-only-customer.example'
const routeEvidence = new WeakMap<Page, { loaded: string[]; failed: string[]; errors: string[]; requests: string[] }>()

function artifactRoot() {
  const input = process.env.FORMAL_RELEASE_DIST
  if (!input) throw new Error('Set FORMAL_RELEASE_DIST to the actual extracted 031 package or dist')
  const result = [path.join(input, 'dist'), input].find(candidate =>
    existsSync(path.join(candidate, 'assist/0.3.1/custom-verification.html')) &&
    existsSync(path.join(candidate, 'assist/0.3.1/index.html')))
  if (!result) throw new Error('Actual 031 archive must include both loader and versioned standard H5/probe')
  return path.resolve(result)
}

// Customer compatibility fixture: the unchanged old options and precheck→open
// sequence. No appId/authParams/helper/backend-parameter endpoint is injected.
function hostFixture(format: 'esm' | 'umd') {
  const sdkBase = formalBase + 'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.1.'
  return [
    '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><p>MOCK_ONLY: carrier simulation, actual 031 artifact</p><script type="module">',
    'let module;',
    format === 'esm' ? `module = await import(${JSON.stringify(sdkBase + 'js')});` :
      `await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=${JSON.stringify(sdkBase + 'umd.cjs')};s.onload=resolve;s.onerror=reject;document.head.append(s)});module=window.AssistanceMobileAuth;`,
    'const state={ready:0,success:0,cancel:0,error:0,close:0,backend:[],precheck:null,result:null,rejected:null};window.__customerState=state;',
    'const existingBackendSpy=payload=>state.backend.push(payload);',
    'const sdk=module.createAssistanceMobileAuthSdk({closable:true,authWindowHeight:"72vh",authWindowMaxHeight:"82vh",useCustomKeyboard:true,',
    'onReady:()=>state.ready++,onSuccess:r=>{state.success++;existingBackendSpy({token:r.token,idLast4:r.idLast4,keyA:r.keyA})},onCancel:()=>state.cancel++,onError:()=>state.error++,onClose:()=>state.close++});',
    'window.__customerSdk=sdk;',
    'window.__startCustomer=()=>{window.__customerPromise=sdk.precheck({scene:"native-number"}).then(r=>{state.precheck=r;if(r.eligible)return sdk.open({scene:"native-number"})}).then(r=>state.result=r,e=>state.rejected=String(e));};',
    // Optional explicit parameters are exercised separately, never by __startCustomer.
    'window.__createOptionalSdk=options=>module.createAssistanceMobileAuthSdk(options);',
    '</script></body></html>',
  ].join('\n')
}

async function setupArtifactRoutes(page: Page, format: 'esm' | 'umd') {
  const root = artifactRoot(), loaded: string[] = [], failed: string[] = [], errors: string[] = [], requests: string[] = []
  routeEvidence.set(page, { loaded, failed, errors, requests })
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => {
    requests.push(request.url())
    expect(new URL(request.url()).pathname.startsWith(forbiddenPrefix), 'No other-environment request').toBe(false)
  })
  page.on('requestfailed', request => {
    // A successful probe removes its iframe immediately. Its optional recorder
    // download can then be cancelled normally while all auth resources succeeded.
    if (request.url() === 'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js' &&
      /aborted|cancel/i.test(request.failure()?.errorText ?? '')) return
    failed.push(request.url())
  })
  await page.route('**/*', route => route.abort())
  await installDuodianOfficialStub(page, { agreementReader: false })
  await page.route('https://log-h5.cmpassport.com:9443/log/logReport', route => route.fulfill({
    status: route.request().method() === 'OPTIONS' ? 204 : 200,
    body: route.request().method() === 'OPTIONS' ? '' : '{}', contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': '*' },
  }))
  const serve = async (route: Route, relative: string) => {
    const file = path.resolve(root, relative)
    expect(file.startsWith(root + path.sep), 'Read only extracted release resources').toBe(true)
    expect(existsSync(file), 'Archive resource: ' + relative).toBe(true)
    loaded.push(relative)
    const extension = path.extname(file)
    await route.fulfill({ body: readFileSync(file), contentType: extension === '.html' ? 'text/html' :
      extension === '.css' ? 'text/css' : extension === '.json' ? 'application/json' : 'application/javascript',
      headers: { 'access-control-allow-origin': '*' } })
  }
  // Replay the actual packaged vendor bytes for external resources as well.
  // H5 probe loads the provider stylesheet before showAuthPage; this is not a
  // fake readiness callback or a replacement for the real probe/provider input.
  await page.route('https://authsafe.cmpassport.com/h5/js/jssdk_sf/css/new-control-style.css', route =>
    serve(route, 'assist/0.3.1/assistance-mobile-auth/vendor/new-control-style.css'))
  await page.route('https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js', route =>
    serve(route, 'assist/0.3.1/assistance-mobile-auth/vendor/rrweb.min.js'))
  await page.route(resourceRoot.href + '**', async route => {
    const url = new URL(route.request().url())
    let relative = decodeURIComponent(url.pathname.slice(resourceRoot.pathname.length))
    // This is the existing static server's SPA fallback, serving actual index bytes.
    if (relative === 'assist/0.3.1/verification') relative = 'assist/0.3.1/index.html'
    await serve(route, relative)
  })
  await page.route(customerOrigin + '/', route => route.fulfill({ contentType: 'text/html', body: hostFixture(format) }))
  await page.goto(customerOrigin + '/')
  await expect.poll(() => page.evaluate(() => typeof (window as any).__startCustomer)).toBe('function')
  return { loaded, failed }
}

async function waitProvider(frame: Frame) {
  await expect.poll(() => frame.evaluate(() => typeof (window as any).__mobileAuthHarness?.lastShowAuthPageRequest?.success)).toBe('function')
}

async function startProbe(page: Page): Promise<Frame> {
  await page.evaluate(() => (window as any).__startCustomer())
  await expect.poll(() => page.frames().some(frame => new URL(frame.url() || 'about:blank').searchParams.get('mode') === 'probe')).toBe(true).catch(async error => {
    const diagnostic = await page.evaluate(() => ({ frames: Array.from(document.querySelectorAll('iframe')).map(frame => frame.src), state: (window as any).__customerState }))
    throw new Error(String(error) + '\nSafe probe state: ' + JSON.stringify(diagnostic) + '\nResources: ' + JSON.stringify(routeEvidence.get(page)))
  })
  const frame = page.frames().find(frame => new URL(frame.url() || 'about:blank').searchParams.get('mode') === 'probe')!
  const url = new URL(frame.url())
  expect(url.origin + url.pathname).toBe(formalBase + 'verification')
  await waitProvider(frame)
  expect(await frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(0)
  expect(await page.evaluate(() => ({ ready: (window as any).__customerState.ready, success: (window as any).__customerState.success,
    cancel: (window as any).__customerState.cancel, error: (window as any).__customerState.error }))).toEqual({ ready: 0, success: 0, cancel: 0, error: 0 })
  return frame
}

async function authorizationFrame(page: Page) {
  const element = page.locator('iframe[data-assistance-auth-frame]')
  await expect(element).toHaveCount(1)
  const src = new URL(await element.getAttribute('src') as string)
  expect(src.origin + src.pathname).toBe(formalLoader)
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Actual 031 authorization iframe missing')
  await waitProvider(frame)
  return frame
}

async function readyAuthorization(page: Page, frame: Frame) {
  await triggerShowAuthPageSuccess(frame)
  await expect.poll(() => frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(1)
  await install031OfficialControls(frame)
  await triggerInitControlAuthReady(frame)
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCSS('opacity', '1')
  await expect.poll(() => page.locator('iframe[data-assistance-auth-frame]').evaluate(node => {
    const containers = [node, node.parentElement, node.parentElement?.parentElement].filter(Boolean) as Element[]
    return containers.every(element => {
      const style = getComputedStyle(element)
      return style.opacity === '1' && ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(style.transform)
    })
  })).toBe(true)
}

async function expectSubmit(frame: Frame, disabled: boolean) {
  const button = frame.locator('#ydrzSubmitControl')
  if (disabled) await expect(button).toHaveClass(/disabled/)
  else await expect(button).not.toHaveClass(/disabled/)
  await expect(button).toHaveCSS('background-color', disabled ? 'rgb(226, 230, 226)' : 'rgb(25, 190, 0)')
}

for (const format of ['esm', 'umd'] as const) {
  test(format + ': URL-only old call executes real probe and iframe signer, official UI and callbacks', async ({ page }, info) => {
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    const evidence = await setupArtifactRoutes(page, format)
    const probe = await startProbe(page)
    // Ephemeral comparison only; traces are off and signed fields are never attached/logged.
    const probeIdentity = await probe.evaluate(() => {
      const data = (window as any).__mobileAuthHarness.showAuthPageCalls[0].data
      return { provider: data.appId === '300013215094', traceId: data.traceId, sign: data.sign }
    })
    expect(probeIdentity.provider).toBe(true)
    await triggerShowAuthPageSuccess(probe)
    const frame = await authorizationFrame(page)
    expect(page.frames().filter(frame => new URL(frame.url() || 'about:blank').searchParams.get('mode') === 'probe')).toHaveLength(0)
    const identity = await frame.evaluate(previous => {
      const data = (window as any).__mobileAuthHarness.showAuthPageCalls[0].data
      return { provider: data.appId === '300013215094', freshTrace: !!data.traceId && data.traceId !== previous.traceId,
        freshSign: !!data.sign && data.sign !== previous.sign, scope: data.scope, authType: data.authType }
    }, probeIdentity)
    expect(identity).toEqual({ provider: true, freshTrace: true, freshSign: true, scope: '3ElementsAuthAssistFill', authType: '0' })
    const boot = await readCustomBootConfig(frame)
    expect(boot.appId).toBe('8a9481c79c05c8bd019f6a0a6c002457')
    expect(boot.authParams).toBeUndefined()
    expect(boot.request.scene).toBe('native-number')
    await readyAuthorization(page, frame)
    await expect(frame.locator('[data-custom-template="duodian-health"]')).toBeVisible()
    const frameSize = await page.locator('iframe[data-assistance-auth-frame]').boundingBox()
    expect(frameSize!.height).toBeLessThanOrEqual(info.project.use.viewport!.height * .82 + 1)
    await expectSubmit(frame, true)
    await enterId(frame, '0000'); await expectSubmit(frame, false)
    await frame.locator('[data-id-grid]').click()
    await frame.locator('[data-key="delete"]').click(); await expectSubmit(frame, true)
    await enterId(frame, '0'); await expectSubmit(frame, false)
    const reader = await openDuodianReader(frame)
    await expect(reader.locator('nav a')).toHaveCount(4)
    await reader.getByRole('link', { name: '《用户认证服务隐私政策》', exact: true }).click()
    await expect(reader.locator('article')).not.toBeEmpty()
    await reader.getByRole('button', { name: '关闭协议', exact: true }).click()
    await expect(frame.locator('.ydrz-confirm-bg-wrap')).toHaveCount(0)
    await expectSubmit(frame, false)
    await page.screenshot({ path: info.outputPath('MOCK_ONLY-031-ready.png') })
    await frame.evaluate(() => { (window as any).__oldAttempt = (window as any).__mobileAuthHarness.lastInitControlRequest })
    const button = frame.locator('#ydrzSubmitControl')
    await button.click(); await button.click()
    expect(await frame.evaluate(() => ({ before: (window as any).__beforeCalls, tokens: (window as any).__tokenCalls,
      trusted: (window as any).__trustedClicks.every(Boolean) }))).toEqual({ before: 1, tokens: 1, trusted: true })
    await expect(frame.locator('[data-id-grid]')).toHaveAttribute('aria-disabled', 'true')
    await triggerInitControlError(frame, '105999', 'MOCK_ONLY_RECOVERABLE')
    await expectSubmit(frame, true)
    await frame.evaluate(() => (window as any).__oldAttempt.authReady({ code: '103000' }))
    await expectSubmit(frame, true)
    await triggerInitControlAuthReady(frame); await expectSubmit(frame, false)
    await button.click()
    expect(await frame.evaluate(() => ({ before: (window as any).__beforeCalls, tokens: (window as any).__tokenCalls }))).toEqual({ before: 2, tokens: 2 })
    await triggerInitControlSuccess(frame, 'MOCK_ONLY_TOKEN', 'MOCK_ONLY_KEY')
    await expectCleanHost(page)
    await expect.poll(() => page.evaluate(() => ({ success: (window as any).__customerState.success,
      backend: (window as any).__customerState.backend }))).toEqual({ success: 1,
      backend: [{ token: 'MOCK_ONLY_TOKEN', idLast4: '0000', keyA: 'MOCK_ONLY_KEY' }] })
    expect(await page.evaluate(() => ({ error: (window as any).__customerState.error, cancel: (window as any).__customerState.cancel,
      status: (window as any).__customerState.result?.status }))).toEqual({ error: 0, cancel: 0, status: 'success' })

    // A new old-call attempt can close and retry without accepting its stale messages.
    const cancelledProbe = await startProbeAfterResult(page)
    await triggerShowAuthPageSuccess(cancelledProbe)
    const cancelled = await authorizationFrame(page)
    await readyAuthorization(page, cancelled)
    const oldBoot = await readCustomBootConfig(cancelled)
    await page.evaluate(() => { (window as any).__oldFrameWindow = document.querySelector<HTMLIFrameElement>('iframe[data-assistance-auth-frame]')!.contentWindow })
    await cancelled.locator('[data-close]').click()
    await expectCleanHost(page)
    await expect.poll(() => page.evaluate(() => (window as any).__customerState.cancel)).toBe(1)
    const reopenedProbe = await startProbeAfterResult(page)
    await triggerShowAuthPageSuccess(reopenedProbe)
    const reopened = await authorizationFrame(page)
    await page.evaluate(sessionId => {
      const event = new MessageEvent('message', {
        origin: 'https://ginkgo.chinaums.com',
        data: { source: 'assistance-mobile-auth', type: 'ASSISTANCE_AUTH_SUCCESS', sessionId,
          payload: { token: 'MOCK_ONLY_STALE', idLast4: '9999', keyA: 'MOCK_ONLY_STALE' } },
      })
      // WebKit's MessageEvent constructor rejects a detached WindowProxy. Keep
      // that exact stale source identity via an own property for this injection.
      Object.defineProperty(event, 'source', { value: (window as any).__oldFrameWindow })
      window.dispatchEvent(event)
    }, oldBoot.sessionId)
    expect(await page.evaluate(() => (window as any).__customerState.success)).toBe(1)
    await readyAuthorization(page, reopened)
    await page.evaluate(() => (window as any).__customerSdk.close())
    await expectCleanHost(page)
    expect(evidence.failed).toEqual([])
    expect(evidence.loaded).toContain('assist/0.3.1/index.html')
    expect(evidence.loaded).toContain('assist/0.3.1/custom-verification.html')
    expect(evidence.loaded).toContain('assist/0.3.1/assistance-mobile-auth/vendor/new-control-style.css')
    expect(requests.some(url => new URL(url).pathname.startsWith(forbiddenPrefix) || /test-host-params|authParams/.test(url))).toBe(false)
    await info.attach('MOCK_ONLY-artifact-resources', { body: JSON.stringify({ loaded: evidence.loaded, requests }), contentType: 'application/json' })
  })

  test(format + ': negative and timed-out actual probe clean up without opening authorization', async ({ page }) => {
    await setupArtifactRoutes(page, format)
    const probe = await startProbe(page)
    await triggerShowAuthPageError(probe, '105999', 'MOCK_ONLY_PROBE_FAILURE')
    await expect.poll(() => page.evaluate(() => (window as any).__customerState.precheck?.eligible)).toBe(false)
    await expect(page.locator('iframe')).toHaveCount(0)
    expect(await page.evaluate(() => ({ ready: (window as any).__customerState.ready, error: (window as any).__customerState.error,
      success: (window as any).__customerState.success }))).toEqual({ ready: 0, error: 0, success: 0 })
    await page.evaluate(() => {
      const w = window as any
      w.__timeoutResult = undefined
      void w.__customerSdk.precheck({ scene: 'native-number', timeoutMs: 1000 }).then((r: any) => { w.__timeoutResult = r })
    })
    await expect.poll(() => page.evaluate(() => (window as any).__timeoutResult)).toEqual({ eligible: false, reason: 'unknown' })
    await expect(page.locator('iframe')).toHaveCount(0)
  })

  test(format + ': optional valid explicit parameters remain accepted inside actual iframe', async ({ page }) => {
    await setupArtifactRoutes(page, format)
    await page.evaluate(() => {
      const w = window as any
      w.__customerSdk.destroy()
      w.__optionalSdk = w.__createOptionalSdk({ closable: true, authParams: {
        version: '3.0', appId: 'MOCK_ONLY_EXPLICIT_PROVIDER', sign: 'MOCK_ONLY_EXPLICIT_SIGNATURE',
        traceId: 'MOCK_ONLY_EXPLICIT_TRACE', timestamp: '20261015000000000', authType: '0', scope: '3ElementsAuthAssistFill',
      } })
      void w.__optionalSdk.open({ scene: 'native-number' }).catch(() => {})
    })
    const frame = await authorizationFrame(page)
    expect(await frame.evaluate(() => {
      const data = (window as any).__mobileAuthHarness.showAuthPageCalls[0].data
      return { provider: data.appId === 'MOCK_ONLY_EXPLICIT_PROVIDER', signature: data.sign === 'MOCK_ONLY_EXPLICIT_SIGNATURE',
        trace: data.traceId === 'MOCK_ONLY_EXPLICIT_TRACE' }
    })).toEqual({ provider: true, signature: true, trace: true })
    await page.evaluate(() => (window as any).__optionalSdk.close())
    await expectCleanHost(page)
  })
}

async function startProbeAfterResult(page: Page): Promise<Frame> {
  await page.evaluate(() => {
    const w = window as any
    w.__customerState.precheck = null
    w.__startCustomer()
  })
  await expect.poll(() => page.frames().some(frame => new URL(frame.url() || 'about:blank').searchParams.get('mode') === 'probe')).toBe(true)
  const frame = page.frames().find(frame => new URL(frame.url() || 'about:blank').searchParams.get('mode') === 'probe')!
  await waitProvider(frame)
  return frame
}
