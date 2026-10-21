export type CustomerResourceWait = { signal: AbortSignal; deadline: number; onNotice(message: string): void }

export function resolveCustomerResource(value: string, baseUrl?: string): string {
  const address = value.trim()
  if (!address || address.startsWith('#')) return address
  if (!baseUrl && !/^[a-z][a-z\d+.-]*:/i.test(address)) {
    throw new TypeError('Relative customer resources require baseUrl')
  }
  return new URL(address, baseUrl).toString()
}

export function assertCustomerActive(input: Pick<CustomerResourceWait, 'signal' | 'deadline'>): void {
  if (input.signal.aborted) throw new DOMException('Customer page aborted', 'AbortError')
  if (Date.now() >= input.deadline) throw new Error('Customer page startup deadline exceeded')
}

// Race every startup stage against the SAME absolute deadline and cancellation.
export function withinCustomerDeadline<T>(promise: PromiseLike<T>, input: Pick<CustomerResourceWait, 'signal' | 'deadline'>): Promise<T> {
  return new Promise((resolve, reject) => {
    try { assertCustomerActive(input) } catch (error) { reject(error); return }
    const finish = (action: () => void) => { clearTimeout(timer); input.signal.removeEventListener('abort', abort); action() }
    const abort = () => finish(() => reject(new DOMException('Customer page aborted', 'AbortError')))
    const timer = setTimeout(() => finish(() => reject(new Error('Customer page startup deadline exceeded'))), Math.max(0, input.deadline - Date.now()))
    input.signal.addEventListener('abort', abort, { once: true })
    Promise.resolve(promise).then(value => finish(() => {
      try { assertCustomerActive(input); resolve(value) } catch (error) { reject(error) }
    }), error => finish(() => reject(error)))
  })
}

const resourceResults = new WeakMap<Element, { source: string; loaded: boolean }>()
const trackedStyleRoots = new WeakSet<HTMLElement>()
function resourceSource(element: Element): string {
  return element.tagName === 'STYLE' ? element.textContent ?? ''
    : ['href', 'rel', 'src', 'srcset'].map(attribute => element.getAttribute(attribute) ?? '').join('\n')
}
function recordResource(element: Element, loaded: boolean): void {
  resourceResults.set(element, { source: resourceSource(element), loaded })
}

export function observeCustomerStyles(root: HTMLElement): () => void {
  // Capture reaches new descendants even when their load/error finishes during
  // the customer's ready promise, before the final resource pass starts.
  const record = (event: Event) => {
    const element = event.target as Element | null
    if (element?.matches?.('style, link[rel~="stylesheet"]')) recordResource(element, event.type === 'load')
  }
  trackedStyleRoots.add(root)
  root.addEventListener('load', record, true)
  root.addEventListener('error', record, true)
  return () => {
    trackedStyleRoots.delete(root)
    root.removeEventListener('load', record, true)
    root.removeEventListener('error', record, true)
  }
}

function waitElement(element: Element, input: CustomerResourceWait): Promise<boolean> {
  const previous = resourceResults.get(element)
  // A completed import must not satisfy a later edit of the same style/link.
  if (previous?.source === resourceSource(element)) return Promise.resolve(previous.loaded)
  return new Promise((resolve, reject) => {
    try { assertCustomerActive(input) } catch (error) { reject(error); return }
    const cleanup = () => {
      clearTimeout(timer)
      element.removeEventListener('load', load)
      element.removeEventListener('error', error)
      input.signal.removeEventListener('abort', abort)
    }
    const load = () => { cleanup(); recordResource(element, true); resolve(true) }
    const error = () => { cleanup(); recordResource(element, false); resolve(false) }
    const abort = () => { cleanup(); reject(new DOMException('Customer page aborted', 'AbortError')) }
    const timer = setTimeout(() => { cleanup(); reject(new Error('Customer page startup deadline exceeded')) }, Math.max(0, input.deadline - Date.now()))
    element.addEventListener('load', load, { once: true })
    element.addEventListener('error', error, { once: true })
    input.signal.addEventListener('abort', abort, { once: true })
  })
}

export async function waitCustomerStyles(root: HTMLElement, input: CustomerResourceWait): Promise<void> {
  const links = [...root.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"]')]
  const imports = [...root.querySelectorAll<HTMLStyleElement>('style')].filter(style => /@import\b/i.test(style.textContent ?? ''))
  const waits = [
    ...links.map(link => resourceResults.has(link) || trackedStyleRoots.has(root) ? waitElement(link, input) : link.sheet ? Promise.resolve(true) : waitElement(link, input)),
    ...imports.map(style => waitElement(style, input)),
  ]
  await Promise.all(waits.map(async wait => {
    if (!await wait) throw new Error('Customer stylesheet CSS failed to load')
  }))
  assertCustomerActive(input)
}

export async function waitCustomerResources(root: HTMLElement, input: CustomerResourceWait): Promise<void> {
  assertCustomerActive(input)
  await waitCustomerStyles(root, input)
  let missing = false
  const view = root.ownerDocument.defaultView
  const viewportHeight = view?.innerHeight ?? root.ownerDocument.documentElement.clientHeight
  const viewportWidth = view?.innerWidth ?? root.ownerDocument.documentElement.clientWidth
  const images = [...root.querySelectorAll<HTMLImageElement>('img')].filter(img => {
    if (!img.getAttribute('src') && !img.getAttribute('srcset')) return false
    // Use layout, not opacity/inert: startup temporarily hides the whole root.
    const rect = img.getBoundingClientRect()
    return rect.bottom >= 0 && rect.top < viewportHeight && rect.right >= 0 && rect.left < viewportWidth
  })
  const imageWaits = images.map(async image => {
    const loaded = image.complete ? image.naturalWidth > 0 : await waitElement(image, input)
    if (!loaded) missing = true
  })
  const fonts = root.ownerDocument.fonts
  const fontWait = fonts ? withinCustomerDeadline(Promise.resolve(fonts.ready).catch(() => { missing = true }), input) : Promise.resolve()
  await Promise.all([...imageWaits, fontWait])
  assertCustomerActive(input)
  // FontFaceSet.ready resolves after loading even when individual font faces fail.
  fonts?.forEach?.(face => { if (face.status === 'error') missing = true })
  if (missing) input.onNotice('Some customer images or fonts could not load')
}

export function resolveCustomerCss(css: string, baseUrl?: string): string {
  // Preserve data URLs and their commas; rewrite only ordinary CSS resource syntax.
  return css.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi,
    (_match, double: string | undefined, single: string | undefined, bare: string | undefined) => `url("${resolveCustomerResource(double ?? single ?? bare ?? '', baseUrl).replace(/"/g, '%22')}")`)
    .replace(/(@import\s+)(["'])([^"']+)\2/gi,
      (_match, prefix: string, _quote: string, address: string) => `${prefix}"${resolveCustomerResource(address, baseUrl)}"`)
}

function resolveSrcset(value: string, baseUrl?: string): string {
  // A data URL's internal comma belongs to the URL, not the candidate separator.
  const candidates: string[] = []
  let remaining = value.trim()
  while (remaining) {
    const match = /^(\S+)(?:\s+([^,]+))?\s*,?\s*/.exec(remaining)
    if (!match) break
    let address = match[1]
    let descriptor = match[2]?.trim() ?? ''
    let consumed = match[0].length
    if (!address.startsWith('data:') && address.includes(',')) {
      const comma = address.indexOf(',')
      consumed = comma + 1
      address = address.slice(0, comma)
      descriptor = ''
    } else {
      address = address.replace(/,+$/, '')
    }
    candidates.push(`${resolveCustomerResource(address, baseUrl)}${descriptor ? ` ${descriptor}` : ''}`)
    remaining = remaining.slice(consumed).trim()
  }
  return candidates.join(', ')
}

export function resolveCustomerDom(root: HTMLElement, baseUrl?: string): void {
  for (const element of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    for (const attribute of ['src', 'poster', 'href', 'action', 'formaction', 'xlink:href']) {
      const value = element.getAttribute(attribute)
      if (value !== null) {
        const resolved = resolveCustomerResource(value, baseUrl)
        if (resolved !== value) element.setAttribute(attribute, resolved)
      }
    }
    for (const attribute of ['srcset', 'imagesrcset']) {
      const value = element.getAttribute(attribute)
      if (value !== null) {
        const resolved = resolveSrcset(value, baseUrl)
        if (resolved !== value) element.setAttribute(attribute, resolved)
      }
    }
    const style = element.getAttribute('style')
    if (style !== null) {
      const resolved = resolveCustomerCss(style, baseUrl)
      if (resolved !== style) element.setAttribute('style', resolved)
    }
    if (element.tagName === 'STYLE') {
      const css = element.textContent ?? ''
      const resolved = resolveCustomerCss(css, baseUrl)
      if (resolved !== css) element.textContent = resolved
    }
  }
}
