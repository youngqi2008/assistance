// @vitest-environment-options {"runScripts":"dangerously"}
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CustomPageApi, NormalizedCustomPage } from '../custom-page/types'
import { sdkControlIds } from '../sdk/slots'
import { createCustomerApi } from './customerApi'
import { loadCustomerPage } from './customerPage'
import { resolveCustomerResource, waitCustomerResources } from './resources'

declare global { interface Window { __testOrder?: string[]; AssistanceCustomPage?: CustomPageApi } }
let document: Document
let window: Window
let frame: HTMLIFrameElement
beforeEach(() => {
  frame = globalThis.document.createElement('iframe')
  globalThis.document.body.append(frame)
  document = frame.contentDocument!
  window = frame.contentWindow!
})
const cleanups: Array<() => void> = []
function slotHtml(): string { return sdkControlIds.map(id => `<div id="${id}"></div>`).join('') }
function apiFixture() { return createCustomerApi({ onIdLast4: vi.fn(), onCallerAgreement: vi.fn(), callerAgreementCount: 1, onClose: vi.fn(), onError: vi.fn() }) }
function customerContext(): Parameters<typeof loadCustomerPage>[1] {
  const controller = new AbortController()
  const api = apiFixture()
  cleanups.push(() => { controller.abort(); api.dispose() })
  return { document, signal: controller.signal, deadline: Date.now() + 1000, api: api.api, sealRegistration: api.sealRegistration, onNotice: vi.fn() }
}
function orderedScriptPageFixture(): NormalizedCustomPage {
  return { kind: 'html', html: `<script>window.__testOrder=['inline-1'];</script><script>window.__testOrder.push('inline-2'); window.AssistanceCustomPage.register({ready:Promise.resolve().then(()=>{document.querySelector('[data-custom-root]').insertAdjacentHTML('beforeend', ${JSON.stringify(slotHtml())})})});</script>`, js: `window.__testOrder.push('extra');` }
}
async function load(page: NormalizedCustomPage, ctx = customerContext()) {
  const result = await loadCustomerPage(page, ctx)
  cleanups.push(result.dispose)
  return result
}
afterEach(() => { cleanups.splice(0).reverse().forEach(fn => fn()); frame.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers() })

describe('customer DOM loading', () => {
  it('RF3 resolves relative customer resources against final redirect URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, url: 'https://cdn.customer.test/new/page.html', text: async () => '<base href="https://evil.test/"><img src="a.png"><style>.x{background:url(b.png)}</style>' + slotHtml() }))
    const promise = load({ kind: 'url', url: 'https://customer.test/old' })
    await vi.waitFor(() => expect(document.querySelector('img')).not.toBeNull())
    document.querySelector('img')!.dispatchEvent(new Event('load'))
    const { root } = await promise
    expect(root.querySelector('img')!.src).toBe('https://cdn.customer.test/new/a.png')
    expect(root.querySelector('style')!.textContent).toContain('https://cdn.customer.test/new/b.png')
    expect(document.querySelector('base')).toBeNull()
    expect(document.baseURI).not.toContain('evil.test')
  })

  it('waits async registered slots and executes html scripts then extra js once', async () => {
    const result = await load(orderedScriptPageFixture())
    expect(window.__testOrder).toEqual(['inline-1', 'inline-2', 'extra'])
    expect(result.root.querySelectorAll('#ydrzSubmitControl')).toHaveLength(1)
  })

  it('retains full document styles and class/data attributes with extra css last', async () => {
    const { root, styles } = await load({ kind: 'html', html: `<html><head><style>.x{color:red}</style></head><body class="customer" data-theme="orange" title="excluded">${slotHtml()}</body></html>`, css: '.x{color:blue}' })
    expect(root.className).toBe('customer')
    expect(styles.rootAttributes).toEqual({ class: 'customer', 'data-theme': 'orange' })
    expect(styles.css).toBe('.x{color:red}\n.x{color:blue}')
    expect([...root.querySelectorAll('style')].map(s => s.textContent)).toEqual(['.x{color:red}', '.x{color:blue}'])
  })

  it('extra CSS wins over styles appended by executing async ready', async () => {
    const { root } = await load({ kind: 'html', html: `<p class="ready-target">customer</p>${slotHtml()}`,
      css: '.ready-target{color:blue}', js: `window.AssistanceCustomPage.register({ready:Promise.resolve().then(()=>{
        const style=document.createElement('style'); style.textContent='.ready-target{color:red}';
        document.querySelector('[data-custom-root]').append(style);
      })})` })
    expect(window.getComputedStyle(root.querySelector('.ready-target')!).color).toBe('rgb(0, 0, 255)')
  })

  it('extra CSS imports after async ready share the remaining startup deadline', async () => {
    vi.useFakeTimers()
    const ctx = customerContext()
    ctx.deadline = Date.now() + 40
    const pending = load({ kind: 'html', html: slotHtml(), css: '@import "https://customer.test/extra.css";',
      js: `window.AssistanceCustomPage.register({ready:new Promise(resolve=>setTimeout(()=>{
        window.__testOrder=['ready']; resolve();
      },30))})` }, ctx)
    const rejected = expect(pending).rejects.toThrow(/deadline|timeout/i)
    await vi.advanceTimersByTimeAsync(39)
    const orderBeforeDeadline = window.__testOrder
    await vi.advanceTimersByTimeAsync(1)
    await rejected
    expect(orderBeforeDeadline).toEqual(['ready'])
    expect(document.body.children).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('explicit base wins and rewrites srcset poster href inline styles and CSS imports preserving data URI', async () => {
    const ctx = customerContext()
    const pending = load({ kind: 'html', baseUrl: 'https://static.customer.test/assets/', html: `<link rel="stylesheet" href="site.css"><a href="terms.html">terms</a><video poster="cover.png"></video><source srcset="a.png 1x, b.png 2x"><div style="background:url(bg.png)"></div><style>@import 'theme.css';.x{background:url(data:image/png;base64,AAAA)}</style>${slotHtml()}` }, ctx)
    await vi.waitFor(() => expect(document.querySelector('link')).not.toBeNull())
    document.querySelector('link')!.dispatchEvent(new Event('load'))
    document.querySelector('style')!.dispatchEvent(new Event('load'))
    const { root, styles } = await pending
    expect(root.querySelector('a')!.href).toBe('https://static.customer.test/assets/terms.html')
    expect(root.querySelector('video')!.poster).toBe('https://static.customer.test/assets/cover.png')
    expect(root.querySelector('source')!.srcset).toBe('https://static.customer.test/assets/a.png 1x, https://static.customer.test/assets/b.png 2x')
    expect(root.querySelector('[style*="bg.png"]')!.getAttribute('style')).toContain('https://static.customer.test/assets/bg.png')
    expect(styles.urls).toEqual(['https://static.customer.test/assets/site.css'])
    expect(styles.css).toContain('https://static.customer.test/assets/theme.css')
    expect(styles.css).toContain('data:image/png;base64,AAAA')
  })

  it.each(['<img src="a.png">', '<style>.x{background:url(a.png)}</style>'])('rejects string relative resources without base: %s', async html => {
    await expect(load({ kind: 'html', html: html + slotHtml() })).rejects.toThrow(/base/i)
    expect(document.querySelector('[data-custom-root]')).toBeNull()
  })

  it.each(['<script src="https://customer.test/a.js"></script>', '<script type="module">import "./a.js"</script>', '<script>import("https://customer.test/a.js")</script>'])('rejects unsupported customer scripts before execution: %s', async html => {
    await expect(load({ kind: 'html', html: html + slotHtml() })).rejects.toThrow(/script|module|import/i)
    expect(document.querySelector('[data-custom-root]')).toBeNull()
  })

  it('allows CSS import strings and comments while executing classic code once', async () => {
    await load({ kind: 'html', html: slotHtml(), js: `
      const css = '@import "https://customer.test/theme.css";';
      // import('https://customer.test/comment.js')
      /* import external from 'https://customer.test/comment.js' */
      const literal = \`import('https://customer.test/template.js')\`;
      window.__testOrder = [css, literal];
    ` })
    expect(window.__testOrder).toEqual(['@import "https://customer.test/theme.css";', "import('https://customer.test/template.js')"])
  })

  it.each([
    `import external from 'https://customer.test/a.js';`,
    `import /* comment */ ('https://customer.test/a.js').catch(() => {});`,
    'const value = `${import("https://customer.test/a.js")}`;',
    'const value = `literal ${`nested ${import("https://customer.test/a.js")}`}`;',
  ])('rejects actual module imports including template expressions: %s', async js => {
    const outcome = await load({ kind: 'html', html: slotHtml(), js }).then(() => 'loaded', error => error.message)
    expect(outcome).toMatch(/module import/i)
    expect(document.querySelector('[data-custom-root]')).toBeNull()
  })

  it.each(['load', 'error'])('retains a ready-created stylesheet %s outcome before final resource wait', async outcome => {
    const ctx = customerContext()
    ctx.deadline = Date.now() + 80
    const pending = load({ kind: 'html', html: slotHtml(), js: `
      window.AssistanceCustomPage.register({ready: Promise.resolve().then(() => {
        const style = document.createElement('style');
        style.textContent = String.fromCharCode(64,105,109,112,111,114,116,32) + '"https://customer.test/ready.css";';
        document.querySelector('[data-custom-root]').append(style);
        style.dispatchEvent(new Event(${JSON.stringify(outcome)}));
        window.__testOrder = ['ready-completed'];
      })});
    ` }, ctx)
    if (outcome === 'error') {
      await expect(pending).rejects.toThrow(/CSS|stylesheet/i)
      expect(document.body.children).toHaveLength(0)
    } else {
      expect((await pending).styles.css).toContain('ready.css')
    }
    expect(window.__testOrder).toEqual(['ready-completed'])
  })

  it('waits again when ready changes a previously loaded stylesheet import', async () => {
    const pending = load({ kind: 'html', html: `<style>@import "https://customer.test/first.css";</style>${slotHtml()}`, js: `
      const style=document.querySelector('[data-custom-root] style');
      style.textContent=String.fromCharCode(64,105,109,112,111,114,116,32)+'"https://customer.test/second.css";';
      window.__testOrder=['style-changed'];
    ` })
    document.querySelector('style')!.dispatchEvent(new Event('load'))
    let done = false
    const result = pending.then(value => { done = true; return value })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(window.__testOrder).toEqual(['style-changed'])
    expect(done).toBe(false)
    document.querySelector('style')!.dispatchEvent(new Event('load'))
    expect((await result).styles.css).toContain('second.css')
  })

  it('fails when an inserted customer script never executes and restores the prior API', async () => {
    const prior = apiFixture().api
    window.AssistanceCustomPage = prior
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((name, options) => {
      const element = createElement(name, options)
      // jsdom does not enforce CSP; emulate only its refused execution boundary.
      if (name === 'script') (element as HTMLScriptElement).type = 'application/json'
      return element
    })
    const outcome = await load({ kind: 'html', html: slotHtml(), js: 'window.__testOrder=["must-not-run"]' }).then(() => 'loaded', error => error.message)
    expect(outcome).toMatch(/script.*execut|policy/i)
    expect(window.__testOrder).toBeUndefined()
    expect(document.body.children).toHaveLength(0)
    expect(window.AssistanceCustomPage).toBe(prior)
  })

  it.each([['', /slot/i], [slotHtml() + '<div id="ydrzSubmitControl"></div>', /duplicate|unique/i], [slotHtml() + '<p id="x"></p><p id="x"></p>', /duplicate|unique/i]])('fails missing or duplicate IDs without legacy fallback', async (html, expected) => {
    await expect(load({ kind: 'html', html })).rejects.toThrow(expected)
    expect(document.body.children).toHaveLength(0)
  })

  it('fails ready rejection and synchronous execution errors and restores prior API', async () => {
    const prior = apiFixture().api
    window.AssistanceCustomPage = prior
    await expect(load({ kind: 'html', html: slotHtml(), js: `window.AssistanceCustomPage.register({ready:Promise.reject(new Error('ready rejected'))})` })).rejects.toThrow('ready rejected')
    expect(window.AssistanceCustomPage).toBe(prior)
    await expect(load({ kind: 'html', html: slotHtml(), js: `throw new Error('execution failed')` })).rejects.toThrow('execution failed')
    expect(document.body.children).toHaveLength(0)
    delete window.AssistanceCustomPage
  })

  it('CSS errors are terminal while image and font errors merge into one notice', async () => {
    const ctx = customerContext()
    const failure = load({ kind: 'html', html: '<link rel="stylesheet" href="https://customer.test/site.css">' + slotHtml() }, ctx)
    await vi.waitFor(() => expect(document.querySelector('link')).not.toBeNull())
    document.querySelector('link')!.dispatchEvent(new Event('error'))
    await expect(failure).rejects.toThrow(/CSS|stylesheet/i)
    expect(document.body.children).toHaveLength(0)
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.reject(new Error('font failed')) } })
    const result = load({ kind: 'html', html: '<img src="https://customer.test/a.png"><img src="https://customer.test/b.png">' + slotHtml() }, ctx)
    await vi.waitFor(() => expect(document.querySelectorAll('img')).toHaveLength(2))
    // Native network load/error events run in a task, after startup microtasks.
    await new Promise(resolve => setTimeout(resolve, 0))
    document.querySelectorAll('img').forEach(img => img.dispatchEvent(new Event('error')))
    await result
    expect(ctx.onNotice).toHaveBeenCalledTimes(1)
    Reflect.deleteProperty(document, 'fonts')
  })

  it('waits inline CSS imports and treats an import error as terminal', async () => {
    let completed = false
    const result = load({ kind: 'html', html: `<style>@import "https://customer.test/theme.css";</style>${slotHtml()}` }).then(value => { completed = true; return value })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(completed).toBe(false)
    document.querySelector('style')!.dispatchEvent(new Event('error'))
    await expect(result).rejects.toThrow(/CSS|stylesheet/i)
    expect(document.body.children).toHaveLength(0)
  })

  it('reports CSS failure immediately without waiting for another stalled stylesheet', async () => {
    const result = load({ kind: 'html', html: '<link rel="stylesheet" href="https://customer.test/failed.css"><link rel="stylesheet" href="https://customer.test/stalled.css">' + slotHtml() })
    document.querySelector('link')!.dispatchEvent(new Event('error'))
    const outcome = await Promise.race([result.then(() => 'loaded', error => error.message), new Promise<string>(resolve => setTimeout(() => resolve('still waiting'), 20))])
    expect(outcome).toMatch(/CSS|stylesheet/)
    expect(document.body.children).toHaveLength(0)
  })

  it('RF2 aborts late fetch without attaching new DOM or executing customer scripts', async () => {
    let resolve!: (value: unknown) => void
    const fetchMock = vi.fn(() => new Promise(r => { resolve = r }))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    const ctx = { ...customerContext(), signal: controller.signal }
    const result = load({ kind: 'url', url: 'https://customer.test/page.html' }, ctx)
    controller.abort()
    await expect(result).rejects.toThrow(/abort/i)
    resolve({ ok: true, url: 'https://customer.test/page.html', text: async () => `<script>window.__testOrder=['late']</script>${slotHtml()}` })
    await Promise.resolve(); await Promise.resolve()
    expect(document.body.children).toHaveLength(0)
    expect(window.__testOrder).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('https://customer.test/page.html', { signal: controller.signal })
  })

  it('cancels mounted pending CSS and removes listeners before late load', async () => {
    const controller = new AbortController()
    const ctx = { ...customerContext(), signal: controller.signal }
    const result = load({ kind: 'html', html: `<link rel="stylesheet" href="https://customer.test/a.css">${slotHtml()}`, js: 'window.__testOrder=["late"]' }, ctx)
    const link = document.querySelector('link')!
    controller.abort()
    await expect(result).rejects.toThrow(/abort/i)
    link.dispatchEvent(new Event('load'))
    expect(document.body.children).toHaveLength(0)
    expect(window.__testOrder).toBeUndefined()
    expect(window.AssistanceCustomPage).toBeUndefined()
  })

  it('explicit URL base overrides redirect and no CSS fetch/CORS inspection is required', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, url: 'https://redirect.test/path/page.html', text: async () => '<link rel="stylesheet" href="theme.css">' + slotHtml() })
    vi.stubGlobal('fetch', fetchMock)
    const pending = load({ kind: 'url', url: 'https://customer.test/page.html', baseUrl: 'https://assets.test/static/' })
    await vi.waitFor(() => expect(document.querySelector('link')).not.toBeNull())
    document.querySelector('link')!.dispatchEvent(new Event('load'))
    const { styles } = await pending
    expect(styles.urls).toEqual(['https://assets.test/static/theme.css'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('the resources after ready use only the time remaining on the startup deadline', async () => {
    vi.useFakeTimers()
    const ctx = customerContext()
    ctx.deadline = Date.now() + 40
    const result = load({ kind: 'html', html: `<img src="https://customer.test/a.png">${slotHtml()}`, js: 'window.AssistanceCustomPage.register({ready:new Promise(resolve=>setTimeout(resolve,30))})' }, ctx)
    const rejected = expect(result).rejects.toThrow(/deadline|timeout/i)
    await vi.advanceTimersByTimeAsync(39)
    expect(document.querySelector('[data-custom-root]')).not.toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    await rejected
    expect(document.body.children).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps data srcset URI commas while resolving following relative candidates', async () => {
    const { root } = await load({ kind: 'html', baseUrl: 'https://assets.test/', html: `<source srcset="data:image/png;base64,AAAA 1x, b.png 2x">${slotHtml()}` })
    expect(root.querySelector('source')!.srcset).toBe('data:image/png;base64,AAAA 1x, https://assets.test/b.png 2x')
  })

  it('ready uses remaining absolute deadline and abort cleans pending mounted root', async () => {
    vi.useFakeTimers()
    const ctx = customerContext()
    ctx.deadline = Date.now() + 40
    const pending = load({ kind: 'html', html: slotHtml(), js: `window.AssistanceCustomPage.register({ready:new Promise(()=>{})})` }, ctx)
    const rejected = expect(pending).rejects.toThrow(/deadline|timeout/i)
    await vi.advanceTimersByTimeAsync(40)
    await rejected
    expect(document.body.children).toHaveLength(0)
  })

  it('dispose removes own DOM/styles/scripts and restores global once', async () => {
    const result = await load({ kind: 'html', html: slotHtml() + '<style>.x{color:red}</style>', js: 'window.__testOrder=["ran"]' })
    expect(window.AssistanceCustomPage).toBeDefined()
    result.dispose(); result.dispose()
    expect(document.body.children).toHaveLength(0)
    expect(window.AssistanceCustomPage).toBeUndefined()
  })
})

describe('customer resource waits', () => {
  it('skips below-fold pending lazy images while still waiting for first-screen images in a transparent root', async () => {
    const root = document.createElement('div')
    root.style.opacity = '0'; root.inert = true
    root.innerHTML = '<img src="https://customer.test/first.png"><img loading="lazy" src="https://customer.test/below.png">'
    document.body.append(root)
    const [first, below] = [...root.querySelectorAll('img')]
    vi.spyOn(first, 'getBoundingClientRect').mockReturnValue({ top: 10, bottom: 110, left: 0, right: 100, width: 100, height: 100, x: 0, y: 10, toJSON() {} })
    vi.spyOn(below, 'getBoundingClientRect').mockReturnValue({ top: 2000, bottom: 2100, left: 0, right: 100, width: 100, height: 100, x: 0, y: 2000, toJSON() {} })
    const controller = new AbortController()
    cleanups.push(() => controller.abort())
    let done = false
    const pending = waitCustomerResources(root, { signal: controller.signal, deadline: Date.now() + 1000, onNotice: vi.fn() }).then(() => { done = true; return 'loaded' })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(done).toBe(false)
    first.dispatchEvent(new Event('load'))
    const outcome = await Promise.race([pending, new Promise<string>(resolve => setTimeout(() => resolve('still waiting'), 20))])
    expect(outcome).toBe('loaded')
    expect(below.complete).toBe(false)
  })

  it('reports failed font faces even when FontFaceSet.ready resolves', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    Object.defineProperty(document, 'fonts', { configurable: true, value: {
      ready: Promise.resolve(), forEach(callback: (face: { status: string }) => void) { callback({ status: 'error' }) },
    } })
    const notice = vi.fn()
    await waitCustomerResources(root, { signal: new AbortController().signal, deadline: Date.now() + 1000, onNotice: notice })
    expect(notice).toHaveBeenCalledTimes(1)
  })

  it('resolves absolute URLs and fragments, refusing accidental iframe relative base', () => {
    expect(resolveCustomerResource('a.png', 'https://customer.test/path/page')).toBe('https://customer.test/path/a.png')
    expect(resolveCustomerResource('data:image/png;base64,AA')).toBe('data:image/png;base64,AA')
    expect(resolveCustomerResource('#local')).toBe('#local')
    expect(() => resolveCustomerResource('/a.png')).toThrow(/base/i)
  })

  it('waits images even while root is transparent and inert, then cleans listeners on abort', async () => {
    const root = document.createElement('div')
    root.style.opacity = '0'; root.inert = true
    root.innerHTML = '<img src="https://customer.test/a.png">'
    document.body.append(root)
    const controller = new AbortController()
    const notice = vi.fn()
    let done = false
    const pending = waitCustomerResources(root, { signal: controller.signal, deadline: Date.now() + 1000, onNotice: notice }).then(() => { done = true })
    await Promise.resolve()
    expect(done).toBe(false)
    controller.abort()
    await expect(pending).rejects.toThrow(/abort/i)
    root.querySelector('img')!.dispatchEvent(new Event('error'))
    expect(notice).not.toHaveBeenCalled()
  })
})
