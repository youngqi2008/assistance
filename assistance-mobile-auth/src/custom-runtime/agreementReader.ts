import type { AgreementDocKey } from '../agreements/agreementContent'
import { USER_SERVICE_AGREEMENT_ENTRY_NAME } from '../agreements/agreementAggregation'
import { createCustomVerificationUrl } from '../custom-page/normalize'
import type { CustomAgreementConfig, CustomRuntimeContext, CustomRuntimeHandle } from '../custom-page/types'
import { createAssistanceAuthMessage } from '../wrapper/verificationBridge'
import readerCss from './agreementReader.css?inline'

/** Internal context is optional for direct readers; no lifecycle data crosses BOOT. */
export async function startAgreementReader(config: CustomAgreementConfig, context?: Pick<CustomRuntimeContext, 'signal'>): Promise<CustomRuntimeHandle> {
  const controller = new AbortController()
  const root = document.createElement('main')
  let disposed = false
  let noticed = false
  let current = config.docKey
  const history: AgreementDocKey[] = []
  const listeners: Array<() => void> = []
  const post = (type: 'ASSISTANCE_AUTH_CLOSE' | 'ASSISTANCE_AUTH_ERROR_NOTICE', payload?: unknown) => {
    if (!disposed && !controller.signal.aborted) window.parent.postMessage(createAssistanceAuthMessage(type, config.sessionId, payload), config.parentOrigin)
  }
  function notice(): void {
    if (disposed || controller.signal.aborted || noticed) return
    noticed = true
    const alert = document.createElement('p'); alert.setAttribute('role', 'alert')
    alert.textContent = '阅读资源加载失败，请关闭后重试。'; root.prepend(alert)
    post('ASSISTANCE_AUTH_ERROR_NOTICE', { message: alert.textContent, phase: 'agreementReader' })
  }
  for (const [name, value] of Object.entries(config.rootAttributes)) {
    if (name === 'class' || name.startsWith('data-')) root.setAttribute(name, value)
  }
  root.classList.add('custom-agreement-reader'); root.setAttribute('data-agreement-reader', '')
  const style = document.createElement('style'); style.textContent = readerCss
  const customerStyle = document.createElement('style'); customerStyle.textContent = config.css
  function listen(element: Element, event: string, action: EventListener): void {
    element.addEventListener(event, action); listeners.push(() => element.removeEventListener(event, action))
  }
  const links = config.styleUrls.map(url => {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = url; listen(link, 'error', notice); return link
  })
  listen(customerStyle, 'error', notice)
  const header = document.createElement('header')
  const back = document.createElement('button'); back.type = 'button'; back.textContent = '返回'; back.setAttribute('data-reader-back', '')
  const close = document.createElement('button'); close.type = 'button'; close.textContent = '关闭协议'; close.setAttribute('data-reader-close', '')
  const title = document.createElement('h1'); const body = document.createElement('article')
  header.append(back, title, close); root.append(style, ...links, customerStyle, header, body)
  function docLink(text: string, docKey: AgreementDocKey, href?: string): HTMLAnchorElement {
    const a = document.createElement('a'); a.textContent = text; a.dataset.docKey = docKey
    a.href = href ?? createCustomVerificationUrl({ loaderUrl: window.location.href, mode: 'agreement', sessionId: config.sessionId,
      parentOrigin: config.parentOrigin, docKey })
    return a
  }
  function render(key: AgreementDocKey): void {
    if (disposed || controller.signal.aborted) return
    current = key; body.replaceChildren(); back.hidden = key === 'entry' && !history.length
    if (key === 'entry') {
      title.textContent = USER_SERVICE_AGREEMENT_ENTRY_NAME
      const nav = document.createElement('nav'); nav.setAttribute('aria-label', '协议列表')
      for (const entry of config.entries) {
        if (entry.docKey) nav.append(docLink(entry.name, entry.docKey, entry.link))
        else { const a = document.createElement('a'); a.textContent = entry.name; a.href = entry.link; nav.append(a) }
      }
      body.append(nav); return
    }
    const doc = config.docs[key]
    if (!doc) { title.textContent = '协议阅读'; notice(); return }
    title.textContent = doc.title
    for (const block of doc.blocks) {
      if (block.kind === 'table') {
        const table = document.createElement('table')
        for (const row of block.rows) {
          const tr = document.createElement('tr')
          for (const cell of row) {
            const td = document.createElement('td')
            if (typeof cell === 'string') td.textContent = cell
            else if (cell.kind === 'doc-link') td.append(docLink(cell.text, cell.docKey))
            else { td.textContent = cell.text; td.colSpan = cell.colSpan }
            tr.append(td)
          }
          table.append(tr)
        }
        body.append(table)
      } else {
        const element = document.createElement(block.kind === 'b' ? 'p' : block.kind)
        if (block.kind === 'b') { const bold = document.createElement('strong'); bold.textContent = block.text; element.append(bold) }
        else element.textContent = block.text
        body.append(element)
      }
    }
  }
  listen(body, 'click', event => {
    const a = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-doc-key]') : null
    if (!a || !body.contains(a)) return
    event.preventDefault(); history.push(current); render(a.dataset.docKey as AgreementDocKey)
  })
  listen(back, 'click', () => render(history.pop() ?? 'entry'))
  listen(close, 'click', () => post('ASSISTANCE_AUTH_CLOSE'))
  function dispose(): void {
    if (disposed) return
    disposed = true; controller.abort(); context?.signal.removeEventListener('abort', dispose)
    listeners.splice(0).forEach(remove => remove()); root.remove()
  }
  context?.signal.addEventListener('abort', dispose, { once: true })
  if (context?.signal.aborted) dispose()
  else { render(current); document.body.append(root) }
  return { dispose }
}
