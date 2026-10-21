import { expect, type Frame, type Page } from '@playwright/test'
import type { CustomAuthorizationConfig, CustomPage } from '../src/custom-page/types'
import type { MobileAuthSdkShowAuthPageData } from '../src/sdk/types'
import type { MobileAuthSdkInitControlRequest } from '../src/sdk/types'
import { installMobileAuthSdkStub } from './mobile-auth-flow-helpers'
import { triggerShowAuthPageSuccess, expectInitControlReady } from './mobile-auth-flow-helpers'

async function loadCompiledWrapper(page: Page, relative: string): Promise<void> {
  await page.evaluate(async relative => {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = new URL(relative, location.href).href
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Compiled compatibility fixture missing: ${relative}`))
      document.head.append(script)
    })
  }, relative)
}

export async function openRuntimeVariant(page: Page, variant: 'first' | 'second'): Promise<Frame> {
  if (!page.url().endsWith('/sign-pay-pro-temp/test-custom-page-0.3.0.html')) await page.goto('http://127.0.0.1:4183/sign-pay-pro-temp/test-custom-page-0.3.0.html')
  await loadCompiledWrapper(page, `test-fixtures/${variant}/assistance-mobile-auth.umd.cjs`)
  const loaderResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/sign-pay-pro-temp/assist/0.3.0/custom-verification.html')
  const frame = await openCustomPage(page)
  const bytes = (await (await loaderResponse).body()).toString('base64')
  await page.evaluate(bytes => {
    const target = window as Window & { __customTestEvidence?: { loaderResponses: string[] } }
    target.__customTestEvidence ??= { loaderResponses: [] }
    target.__customTestEvidence.loaderResponses.push(bytes)
  }, bytes)
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  return frame
}

export async function openLegacyPage(page: Page, input: { appId: string; version: '0.2.6' }): Promise<Frame> {
  // Preserve archived resource bytes and their configured URLs while serving them locally.
  const legacyBase = 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.2.6/'
  await page.route(legacyBase + '**', async route => {
    const url = new URL(route.request().url())
    const relative = url.pathname.slice(new URL(legacyBase).pathname.length)
    const local = new URL(`test-fixtures/legacy/${relative}${url.search}`, 'http://127.0.0.1:4183/sign-pay-pro-temp/')
    const response = await route.fetch({ url: local.href })
    await route.fulfill({ response })
  })
  return openCompiledDefaultPage(page, input, `test-fixtures/legacy/assistance-mobile-auth/assistance-mobile-auth.umd.cjs`)
}

export async function openDefaultPage(page: Page, input: { appId: string; closable?: boolean; useCustomKeyboard?: boolean; display?: 'inline' }): Promise<Frame> {
  return openCompiledDefaultPage(page, input, 'assist/0.3.0/assistance-mobile-auth/assistance-mobile-auth.0.3.0.umd.cjs')
}

async function openCompiledDefaultPage(page: Page, input: { appId: string; closable?: boolean; useCustomKeyboard?: boolean; display?: 'inline' }, wrapper: string): Promise<Frame> {
  await page.goto('http://127.0.0.1:4183/sign-pay-pro-temp/test-custom-page-0.3.0.html')
  await loadCompiledWrapper(page, wrapper)
  await page.evaluate(options => {
    const state = { result: undefined as unknown, error: undefined as unknown }
    const renderTo = options.display === 'inline' ? document.body.appendChild(document.createElement('section')) : undefined
    const sdk = window.AssistanceMobileAuth!.createAssistanceMobileAuthSdk({ ...options, renderTo })
    Object.assign(window, { __compatState: state, __compatSdk: sdk })
    void sdk.open({ requestId: 'compatibility-browser' }).then(result => { state.result = result }, error => { state.error = String(error) })
  }, input)
  const element = page.locator('iframe[data-assistance-auth-frame]').last()
  await expect(element).toBeAttached()
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Legacy compatibility iframe unavailable')
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  return frame
}

export async function installCustomOfficialStub(page: Page, options: { agreementReader?: boolean } = {}): Promise<void> {
  await installMobileAuthSdkStub(page, { preserveWrapper: true, emulateOfficialSubmitState: true, submitElementTag: 'official-nested', agreementFixture: 'v23-production' })
  await page.addInitScript(({ agreementReader }) => {
    window.addEventListener('message', event => {
      const message = event.data
      if (event.source !== window.parent || message?.source !== 'assistance-mobile-auth' || message.type !== 'ASSISTANCE_AUTH_CUSTOM_BOOT') return
      const config = message.payload?.config
      const query = new URLSearchParams(location.search)
      if (config?.mode === 'authorization' && message.sessionId === query.get('sessionId') &&
        event.origin === query.get('parentOrigin')) {
        ;(window as Window & { __customBootConfig?: CustomAuthorizationConfig }).__customBootConfig = config
        if (agreementReader) {
          // This extends only the provider double. The wrapper, loader and reader runtime remain real.
          const sdk = (window as Window & { YDRZAuthSF: { initControl(request: MobileAuthSdkInitControlRequest): void } }).YDRZAuthSF
          const init = sdk.initControl.bind(sdk)
          sdk.initControl = request => {
            init(request)
            const slot = document.getElementById('ydrzAgreementControl')
            const entry = request.styleOption.agreeStyle?.agreeArr?.[0]
            if (!slot || !entry?.link) return
            const link = slot.querySelector<HTMLAnchorElement>('p a[href="#user-agreement"]')
            if (!link) throw new Error('Provider agreement paragraph is missing its user agreement anchor')
            link.href = entry.link
            link.addEventListener('click', event => {
              event.preventDefault()
              if (document.querySelector('.ydrz-confirm-iframe')) return
              const overlay = document.createElement('div'); overlay.className = 'ydrz-confirm-bg-wrap'
              const background = document.createElement('div'); background.className = 'ydrz-confirm-bg'
              const panel = document.createElement('div'); panel.className = 'ydrz-confirm-iframe'
              panel.style.cssText = 'width:92%;height:92.8%;font-family:PingFangSC-Medium, PingFang SC;font-size:16px;color:rgba(51,51,51,1);border-radius:30px 30px 0 0'
              const header = document.createElement('p'); header.className = 'ydrz-confirm-header'
              header.textContent = '用户信息授权协议'
              const close = document.createElement('em'); close.addEventListener('click', () => overlay.remove())
              header.append(close)
              const reader = document.createElement('iframe'); reader.src = entry.link!
              reader.title = '用户信息授权协议内容'
              panel.append(header, reader); background.append(panel); overlay.append(background); document.body.append(overlay)
            })
          }
        }
      }
    })
  }, options)
}

export async function openCustomPage(page: Page, input: {
  appId?: string
  authParams?: MobileAuthSdkShowAuthPageData
  display?: 'modal' | 'inline'
  closable?: boolean
  useCustomKeyboard?: boolean
  templateMode?: 'html' | 'url'
  customPage?: CustomPage
  agreements?: Array<{ name: string; link: string }>
} = {}): Promise<Frame> {
  if (!page.url().endsWith('/sign-pay-pro-temp/test-custom-page-0.3.0.html')) await page.goto('http://127.0.0.1:4183/sign-pay-pro-temp/test-custom-page-0.3.0.html')
  await page.evaluate(async options => {
    const existing = (window as Window & { __customPageSdk?: { close(): void }; __customPagePromise?: Promise<unknown> })
    existing.__customPageSdk?.close()
    await existing.__customPagePromise?.catch(() => {})
    const base = new URL('assist/0.3.0/', location.href)
    if (!window.AssistanceMobileAuth) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = new URL('assistance-mobile-auth/assistance-mobile-auth.0.3.0.umd.cjs', base).href
        script.onload = () => resolve(); script.onerror = () => reject(new Error('Custom wrapper failed to load'))
        document.head.append(script)
      })
    }
    const templateBase = new URL('examples/yuanbao/', base)
    const loadText = async (name: string) => {
      const response = await fetch(new URL(name, templateBase))
      if (!response.ok) throw new Error(`Customer resource ${name} failed: ${response.status}`)
      return response.text()
    }
    const [html, css, js, styleText] = await Promise.all(['index.html', 'style.css', 'page.js', 'style-option.json'].map(loadText))
    const exampleOptions = { closable: options.closable ?? true, useCustomKeyboard: options.useCustomKeyboard ?? true, agreements: options.agreements ?? [] }
    const exampleJs = `window.YuanbaoExampleConfig=${JSON.stringify(exampleOptions)};\n${js}`
    const target = options.display === 'inline' ? document.body.appendChild(document.createElement('section')) : undefined
    const state = { result: undefined as unknown, error: undefined as unknown, notices: [] as unknown[], beforeLogin: 0, changes: [] as unknown[] }
    const sdk = window.AssistanceMobileAuth!.createAssistanceMobileAuthSdk({
      appId: options.appId ?? 'customer-app',
      authParams: options.authParams ?? { version: '3.0', appId: 'mobile-provider-id', sign: 'provider-test-signature', traceId: 'trace', timestamp: '20261008000000000', authType: '0', scope: '3ElementsAuthAssistFill' },
      display: options.display, renderTo: target,
      closable: options.closable, useCustomKeyboard: options.useCustomKeyboard,
      customPage: options.customPage ?? (options.templateMode === 'url' ? { url: new URL('index.html', templateBase).href, css, js: exampleJs, baseUrl: templateBase.href } : { html, css, js: exampleJs, baseUrl: templateBase.href }),
      agreements: options.agreements,
      styleOption: JSON.parse(styleText),
      onErrorNotice: notice => state.notices.push(notice),
      onBeforeLogin: () => { state.beforeLogin++ }, onStateChange: event => state.changes.push(event),
    })
    Object.assign(window, { __customPageSdk: sdk, __customPageSession: state })
    const promise = sdk.open({ requestId: 'custom-page-browser' }).then(result => { state.result = result }, error => { state.error = String(error) })
    Object.assign(window, { __customPagePromise: promise })
  }, input)
  const element = page.locator('iframe[data-assistance-auth-frame]').last()
  await expect(element).toBeAttached()
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Custom iframe window is unavailable')
  return frame
}

export async function readCustomBootConfig(frame: Frame): Promise<CustomAuthorizationConfig> {
  await expect.poll(() => frame.evaluate(() => (window as Window & { __customBootConfig?: CustomAuthorizationConfig }).__customBootConfig?.mode)).toBe('authorization')
  return frame.evaluate(() => (window as Window & { __customBootConfig: CustomAuthorizationConfig }).__customBootConfig)
}
