import { expect, type Frame, type Page } from '@playwright/test'
import { triggerShowAuthPageSuccess, triggerInitControlAuthReady } from './mobile-auth-flow-helpers'
import { installCustomOfficialStub } from './custom-page-helpers'

export const mediaDirectory = process.env.DUODIAN_MEDIA_DIR ?? 'test-results/duodian-health-0.3.0'
export async function installDuodianOfficialStub(page: Page, options: { agreementReader?: boolean } = {}) {
  if (!process.env.PLAYWRIGHT_LIVE_HOST_URL) {
    // Test the deployable SDK bytes, serving their configured shared loader from this build.
    await page.route('https://ginkgo.chinaums.com/sign-pay-pro-temp/assist/**', async route => {
      const url = new URL(route.request().url())
      const response = await route.fetch({ url: new URL(`${url.pathname}${url.search}`, page.url()).href })
      await route.fulfill({ response })
    })
  }
  await installCustomOfficialStub(page, { agreementReader: options.agreementReader ?? true })
  await page.addInitScript(() => {
    window.addEventListener('message', event => {
      if (event.source !== parent || event.data?.source !== 'assistance-mobile-auth' || event.data.type !== 'ASSISTANCE_AUTH_CUSTOM_BOOT') return
      const query = new URLSearchParams(location.search)
      if (event.data.sessionId !== query.get('sessionId') || event.origin !== query.get('parentOrigin') || event.data.payload?.config?.mode !== 'authorization') return
      const sdk = (window as any).YDRZAuthSF
      const init = sdk.initControl.bind(sdk)
      const update = sdk.updateSubmitBtnStatus.bind(sdk)
      let activeStyle: any
      function applySubmitStyle(disabled: boolean) {
        const slot = document.getElementById('ydrzSubmitControl')
        const style = activeStyle?.[disabled ? 'submitBtnDisabledStyle' : 'submitBtnStyle']
        if (!slot || !style) return
        for (const [key, value] of Object.entries(style)) {
          const property = ({ bgColor: 'backgroundColor', fontColor: 'color' } as Record<string, string>)[key] ?? key
          if (property in slot.style && typeof value === 'string') (slot.style as any)[property] = value
        }
      }
      sdk.initControl = (request: any) => {
        init(request)
        activeStyle = request.styleOption
        // Match primary 1.0.6 createPhoneControl/createSubmitControl DOM.
        // Only the provider double changes; preserve its trusted listener and loading-before-validation order.
        const phone = document.getElementById('ydrzPhoneControl')!
        const masked = phone.textContent!
        phone.classList.add('ydrz-maskphone-wrap')
        phone.style.cssText = 'width:100%;font-size:14px;color:#8d8d92;'
        const paragraph = document.createElement('p'); paragraph.id = 'ydrzMaskphone'; paragraph.className = 'ydrz-maskphone'
        for (const character of masked) { const span = document.createElement('span'); span.textContent = character; paragraph.append(span) }
        phone.replaceChildren(paragraph)
        const slot = document.getElementById('ydrzSubmitControl')!
        const control = slot.querySelector<HTMLElement>('[data-sdk-stub-click-target]')!
        slot.classList.add('ydrz-submitbtn-wrap')
        control.classList.remove('ydrz-submitbtn-wrap'); control.classList.add('submit-btn')
        control.style.removeProperty('background')
        applySubmitStyle(true); update({ disabled: true, loading: false })
        const agreementStyle = request.styleOption.agreeStyle
        document.querySelectorAll<HTMLElement>('#ydrzAgreementControl, #ydrzAgreementControl p, #ydrzAgreementControl a').forEach(node => {
          if (agreementStyle?.fontSize) node.style.fontSize = agreementStyle.fontSize
        })
        document.querySelectorAll<HTMLElement>('#ydrzAgreementControl a').forEach(link => { link.style.color = agreementStyle?.hrefColor ?? '' })
      }
      sdk.updateSubmitBtnStatus = (state: any) => {
        update(state)
        if (typeof state.disabled === 'boolean') applySubmitStyle(state.disabled)
      }
    })
  })
}
export async function openDuodianPage(page: Page, input: { format?: 'esm' | 'umd'; appId?: string; closable?: boolean;
  useCustomKeyboard?: boolean; agreements?: Array<{ name: string; link: string }> } = {}): Promise<Frame> {
  const { format = 'esm', ...options } = input
  const host = new URL(`test-duodian-health-0.3.0.html?format=${format}`, 'http://127.0.0.1:4184/sign-pay-pro-temp/').href
  if (page.url() !== host) await page.goto(host)
  await expect.poll(() => page.evaluate(() => typeof (window as any).__duodianOpen)).toBe('function')
  await page.evaluate(options => (window as any).__duodianOpen(options), options)
  const element = page.locator('iframe[data-assistance-auth-frame]')
  await expect(element).toHaveCount(1)
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Customer built iframe unavailable')
  await expect.poll(() => frame.evaluate(() => typeof (window as any).__mobileAuthHarness?.lastShowAuthPageRequest?.success)).toBe('function')
  return frame
}

export async function readyDuodian(page: Page, frame: Frame) {
  await triggerShowAuthPageSuccess(frame)
  await expect.poll(() => frame.evaluate(() => (window as any).__mobileAuthHarness.initControlCalls.length)).toBe(1)
  await triggerInitControlAuthReady(frame)
  await waitForDuodianPresentation(page)
}
export async function waitForDuodianPresentation(page: Page) {
  await expect.poll(() => page.locator('iframe[data-assistance-auth-frame]').evaluate(element => {
    const frame = element as HTMLIFrameElement
    const style = getComputedStyle(frame)
    const containers = [frame, frame.parentElement, frame.parentElement?.parentElement].filter(Boolean) as HTMLElement[]
    return { opacity: style.opacity, opaque: containers.every(node => getComputedStyle(node).opacity === '1'), moving: containers.some(node => {
      const value = getComputedStyle(node).transform
      return value !== 'none' && value !== 'matrix(1, 0, 0, 1, 0, 0)'
    }) }
  })).toEqual({ opacity: '1', opaque: true, moving: false })
  const frame = await (await page.locator('iframe[data-assistance-auth-frame]').elementHandle())!.contentFrame()
  await expect.poll(async () => {
    const availableHeight = await page.evaluate(() => Math.floor((visualViewport?.height ?? innerHeight) - 12))
    return frame!.evaluate(limit => {
      const root = document.querySelector<HTMLElement>('[data-custom-root]')!
      const stage = document.querySelector<HTMLElement>('[data-stage]')!
      const naturalHeight = root.getBoundingClientRect().height
      // A synchronized stage alone can still precede the wrapper's pending resize message.
      return Math.abs(stage.getBoundingClientRect().height - Math.min(naturalHeight, innerHeight)) <= 1 &&
        Math.abs(innerHeight - Math.min(Math.ceil(naturalHeight), limit)) <= 1
    }, availableHeight)
  }).toBe(true)
}
export async function enterId(frame: Frame, value: string) {
  await frame.locator('[data-id-grid]').click()
  for (const key of value) await frame.locator(`[data-key="${key}"]`).click()
}
export async function readHarness(frame: Frame) {
  return frame.evaluate(() => {
    const h = (window as any).__mobileAuthHarness
    return { show: h.showAuthPageCalls, init: h.initControlCalls, before: h.beforeSubmitResults,
      tokens: h.providerTokenRequests, clicks: h.submitClickEvents, synthetic: h.syntheticSubmitClickCalls }
  })
}
export async function expectCleanHost(page: Page) {
  await expect(page.locator('iframe[data-assistance-auth-frame]')).toHaveCount(0)
  expect(await page.evaluate(() => ({ body: document.body.style.overflow, root: document.documentElement.style.overflow }))).toEqual({ body: '', root: '' })
}
export async function openDuodianReader(frame: Frame): Promise<Frame> {
  await frame.locator('#ydrzAgreementControl a').filter({ hasText: '用户信息授权协议' }).click()
  const element = frame.locator('.ydrz-confirm-iframe iframe')
  await expect(element).toBeAttached()
  const reader = await (await element.elementHandle())!.contentFrame()
  if (!reader) throw new Error('Reader iframe unavailable')
  await expect(reader.locator('[data-agreement-reader]')).toBeVisible()
  return reader
}
