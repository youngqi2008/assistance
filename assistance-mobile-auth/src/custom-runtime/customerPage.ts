import type { CustomPageApi, NormalizedCustomPage } from '../custom-page/types'
import { sdkControlIds } from '../sdk/slots'
import { assertCustomerActive, observeCustomerStyles, resolveCustomerCss, resolveCustomerDom, waitCustomerResources, waitCustomerStyles, withinCustomerDeadline } from './resources'

type CustomerContext = {
  document: Document
  signal: AbortSignal
  deadline: number
  api: CustomPageApi
  sealRegistration(): Promise<void>
  onNotice(message: string): void
}

function checkScript(script: HTMLScriptElement): void {
  if (script.hasAttribute('src')) throw new Error('Customer external script src is unsupported')
  const type = script.type.trim().toLowerCase()
  if (type === 'module') throw new Error('Customer module scripts are unsupported')
  if (type && !['text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript'].includes(type)) return
  checkScriptCode(script.textContent ?? '')
}

function checkScriptCode(code: string): void {
  // Ordinary unsupported-syntax check, not a parser or a customer-code sandbox.
  // Keep template expressions as code while skipping their surrounding literal.
  let index = 0
  const quoted = (quote: string) => {
    index++
    while (index < code.length) {
      const char = code[index++]
      if (char === '\\') index++
      else if (char === quote) break
    }
  }
  const scan = (expression = false): string => {
    let result = ''
    let braces = 0
    while (index < code.length) {
      const char = code[index]
      if (char === '"' || char === "'") { quoted(char); result += '""'; continue }
      if (code.startsWith('//', index)) {
        while (index < code.length && !/[\r\n]/.test(code[index])) index++
        result += ' '; continue
      }
      if (code.startsWith('/*', index)) {
        const end = code.indexOf('*/', index + 2)
        index = end < 0 ? code.length : end + 2
        result += ' '; continue
      }
      if (char === '`') {
        index++; result += '""'
        while (index < code.length) {
          if (code[index] === '\\') { index += 2; continue }
          if (code[index] === '`') { index++; break }
          if (code.startsWith('${', index)) { index += 2; result += ` (${scan(true)}) ` }
          else index++
        }
        continue
      }
      if (char === '}' && expression && braces === 0) { index++; break }
      if (char === '{') braces++
      if (char === '}') braces--
      result += char; index++
    }
    return result
  }
  if (/(?<![\w$.])\bimport\s*(?:\(|["'{*]|[\w$]+\s*(?:,|from\b))/.test(scan())) {
    throw new Error('Customer external module import is unsupported')
  }
}

export async function loadCustomerPage(page: NormalizedCustomPage, ctx: CustomerContext): Promise<{
  root: HTMLElement
  styles: { css: string; urls: string[]; rootAttributes: Record<string, string> }
  dispose(): void
}> {
  const view = ctx.document.defaultView
  if (!view) throw new Error('Customer page needs a live document window')
  assertCustomerActive(ctx)
  let html: string
  let baseUrl = page.baseUrl
  if (page.kind === 'url') {
    const response = await withinCustomerDeadline(fetch(page.url, { signal: ctx.signal }), ctx)
    if (!response.ok) throw new Error('Customer HTML fetch failed')
    html = await withinCustomerDeadline(response.text(), ctx)
    baseUrl ??= response.url || page.url
  } else html = page.html
  assertCustomerActive(ctx)
  const parsed = new view.DOMParser().parseFromString(html, 'text/html')
  parsed.querySelectorAll('base').forEach(base => base.remove())
  const root = ctx.document.createElement('div')
  root.setAttribute('data-custom-root', '')
  const rootAttributes: Record<string, string> = {}
  for (const source of [parsed.documentElement, parsed.body]) {
    for (const attribute of source.attributes) {
      if (attribute.name === 'class' || attribute.name.startsWith('data-')) {
        rootAttributes[attribute.name] = attribute.value
        root.setAttribute(attribute.name, attribute.value)
      }
    }
  }
  root.append(...[...parsed.head.childNodes, ...parsed.body.childNodes].map(node => ctx.document.importNode(node, true)))
  const scripts = [...root.querySelectorAll<HTMLScriptElement>('script')]
  scripts.forEach(checkScript)
  if (page.js) checkScriptCode(page.js)
  scripts.forEach(script => script.remove())
  resolveCustomerDom(root, baseUrl)
  const extraCss = page.css ? resolveCustomerCss(page.css, baseUrl) : undefined
  const previousApi = Object.getOwnPropertyDescriptor(view, 'AssistanceCustomPage')
  let installed = false
  let disposed = false
  const resourceController = new AbortController()
  const resourceContext = { ...ctx, signal: resourceController.signal }
  const stopObservingStyles = observeCustomerStyles(root)
  const dispose = () => {
    if (disposed) return
    disposed = true
    resourceController.abort()
    stopObservingStyles()
    ctx.signal.removeEventListener('abort', dispose)
    root.remove()
    if (installed) {
      if (previousApi) Object.defineProperty(view, 'AssistanceCustomPage', previousApi)
      else Reflect.deleteProperty(view, 'AssistanceCustomPage')
    }
  }
  ctx.signal.addEventListener('abort', dispose, { once: true })
  try {
    Object.defineProperty(view, 'AssistanceCustomPage', { configurable: true, writable: true, value: ctx.api })
    installed = true
    root.inert = true
    const previousOpacity = root.style.opacity
    root.style.opacity = '0'
    // Install listeners BEFORE mounting, so cached stylesheet load events cannot be lost.
    const cssReady = waitCustomerStyles(root, resourceContext)
    ctx.document.body.append(root)
    await cssReady
    const execute = (code: string): void => {
      assertCustomerActive(ctx)
      let failure: Error | undefined
      const onError = (event: ErrorEvent) => {
        failure = event.error instanceof Error ? event.error : new Error(event.message)
        event.preventDefault()
      }
      const script = ctx.document.createElement('script')
      const completionKey = '__assistanceCustomerScriptComplete'
      const previousCompletion = Object.getOwnPropertyDescriptor(view, completionKey)
      let completed = false
      view.addEventListener('error', onError)
      try {
        Object.defineProperty(view, completionKey, { configurable: true, value: () => { completed = true } })
        // Classic scripts execute synchronously. A denied insertion emits no
        // synchronous window.error, so require its own last statement to run.
        // Top-level `this` remains the Window, including strict classic scripts.
        script.textContent = `${code}\n;this[${JSON.stringify(completionKey)}]();`
        root.append(script)
        if (failure) throw failure
        if (!completed) throw new Error('Customer script did not execute; check Content Security Policy')
      } finally {
        view.removeEventListener('error', onError)
        if (previousCompletion) Object.defineProperty(view, completionKey, previousCompletion)
        else Reflect.deleteProperty(view, completionKey)
      }
      assertCustomerActive(ctx)
    }
    for (const script of scripts) {
      if (!script.type || /^(?:text|application)\/(?:javascript|ecmascript)$/i.test(script.type.trim())) execute(script.textContent ?? '')
      else root.append(script)
    }
    if (page.js) execute(page.js)
    await withinCustomerDeadline(ctx.sealRegistration(), resourceContext)
    assertCustomerActive(ctx)
    // ready can append customer styles; extra CSS must follow those as well.
    if (extraCss) {
      const extra = ctx.document.createElement('style')
      extra.textContent = extraCss
      root.append(extra)
    }
    const seen = new Set<string>()
    for (const element of root.querySelectorAll('[id]')) {
      if (seen.has(element.id)) throw new Error(`Duplicate customer ID: ${element.id}`)
      seen.add(element.id)
    }
    for (const id of sdkControlIds) if (!seen.has(id)) throw new Error(`Required customer slot missing: ${id}`)
    // ready may create resources as well as slots; apply the same customer base.
    resolveCustomerDom(root, baseUrl)
    await waitCustomerResources(root, resourceContext)
    assertCustomerActive(ctx)
    root.inert = false
    root.style.opacity = previousOpacity
    const styles = {
      css: [...root.querySelectorAll('style')].map(style => style.textContent ?? '').join('\n'),
      urls: [...root.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"]')].map(link => link.href),
      rootAttributes,
    }
    return { root, styles, dispose }
  } catch (error) { dispose(); throw error }
}
