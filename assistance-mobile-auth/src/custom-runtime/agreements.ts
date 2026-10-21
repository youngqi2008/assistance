import { buildUserServiceAgreeArr, buildUserServiceChildArr } from '../agreements/agreementAggregation'
import { getAgreementDocByKey, type AgreementDocKey } from '../agreements/agreementContent'
import { createCustomVerificationUrl } from '../custom-page/normalize'
import type { CustomAgreementConfig, CustomAuthorizationConfig } from '../custom-page/types'
import { createAssistanceAuthMessage, isAssistanceAuthMessage } from '../wrapper/verificationBridge'
import type { loadCustomerPage } from './customerPage'

/** Only the real SDK reader, at a registered document URL, receives a document BOOT. */
export function createCustomAgreementController(config: CustomAuthorizationConfig, runtimeSource: string,
  styles: Awaited<ReturnType<typeof loadCustomerPage>>['styles']) {
  const targets = new Map<string, AgreementDocKey>()
  const docs: CustomAgreementConfig['docs'] = {}
  const parentOrigin = window.location.origin
  // A customer <base> or asset base must never become the reader's loader.
  const loaderUrl = window.location.href
  function resolve(docKey: AgreementDocKey): string {
    const link = createCustomVerificationUrl({ loaderUrl, mode: 'agreement', docKey, sessionId: config.sessionId, parentOrigin })
    if (!targets.has(link)) {
      targets.set(link, docKey)
      const doc = getAgreementDocByKey(docKey)
      if (doc) {
        docs[docKey] = doc
        for (const block of doc.blocks) if (block.kind === 'table') {
          for (const cell of block.rows.flat()) if (typeof cell !== 'string' && cell.kind === 'doc-link') resolve(cell.docKey)
        }
      }
    }
    return link
  }
  const agreeArr = buildUserServiceAgreeArr(config.appId, resolve)
  const builtIns = buildUserServiceChildArr({ appId: config.appId, docUrlResolver: resolve })
  const childArr = buildUserServiceChildArr({ appId: config.appId, docUrlResolver: resolve,
    callerAgreements: config.agreements, preserveReservedCallerAgreement: true })
  const entries = childArr.map((entry, index) => ({ name: entry.name, link: entry.link!,
    ...(index < builtIns.length ? { docKey: targets.get(entry.link!)! } : {}) }))
  let root: HTMLElement | undefined
  let observer: MutationObserver | undefined
  let onOpenChange: ((open: boolean) => void) | undefined
  let open = false
  let previousFocus: HTMLElement | undefined
  let disposed = false
  const noticed = new WeakSet<HTMLIFrameElement>()
  const isVisible = (panel: HTMLElement) => {
    for (let node: HTMLElement | null = panel; node; node = node.parentElement) {
      const style = window.getComputedStyle(node)
      if (node.hidden || style.display === 'none' || style.visibility === 'hidden') return false
    }
    return true
  }
  function inspect(): void {
    if (!root || disposed) return
    const panels = [...root.querySelectorAll<HTMLElement>('.ydrz-confirm-iframe')]
    panels.forEach(panel => panel.querySelectorAll<HTMLElement>('.ydrz-confirm-header em').forEach(close => {
      if (close.getAttribute('role') !== 'button') close.setAttribute('role', 'button')
      if (close.getAttribute('aria-label') !== '关闭协议') close.setAttribute('aria-label', '关闭协议')
      if (close.tabIndex !== 0) close.tabIndex = 0
    }))
    const next = panels.some(panel => panel.querySelector('iframe') && isVisible(panel))
    if (next === open) return
    open = next
    if (open) previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    onOpenChange?.(open)
    if (!open && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  }
  function closeReader(frame: HTMLIFrameElement): void {
    frame.contentWindow?.postMessage(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', config.sessionId), parentOrigin)
    const panel = frame.closest('.ydrz-confirm-iframe')!
    const close = panel.querySelector<HTMLElement>('.ydrz-confirm-header em')
    if (close) close.click()
    else (panel.closest('.ydrz-confirm-bg-wrap') ?? panel).remove()
    inspect()
  }
  function onMessage(event: MessageEvent): void {
    if (!root || disposed || event.origin !== parentOrigin || !isAssistanceAuthMessage(event.data, config.sessionId)) return
    // Inspect synchronously for READY arriving before MutationObserver delivery.
    const frame = [...root.querySelectorAll<HTMLIFrameElement>('.ydrz-confirm-iframe iframe')]
      .find(frame => frame.contentWindow === event.source && targets.has(frame.src))
    if (!frame) return
    inspect()
    if (disposed) return
    if (event.data.type === 'ASSISTANCE_AUTH_READY') {
      const docKey = targets.get(frame.src)!
      const reader: CustomAgreementConfig = { mode: 'agreement', sessionId: config.sessionId, parentOrigin, docKey,
        docs, entries, css: styles.css, styleUrls: styles.urls, rootAttributes: styles.rootAttributes }
      frame.contentWindow!.postMessage(createAssistanceAuthMessage('ASSISTANCE_AUTH_CUSTOM_BOOT', config.sessionId,
        { runtimeSource, config: reader }), parentOrigin)
    } else if (event.data.type === 'ASSISTANCE_AUTH_CLOSE') closeReader(frame)
    else if (event.data.type === 'ASSISTANCE_AUTH_ERROR_NOTICE' || event.data.type === 'ASSISTANCE_AUTH_ERROR') {
      // Loader/resource failures belong to reading, never the authentication terminal lane.
      if (noticed.has(frame)) return
      noticed.add(frame)
      const payload = event.data.payload as { message?: unknown } | undefined
      window.parent.postMessage(createAssistanceAuthMessage('ASSISTANCE_AUTH_ERROR_NOTICE', config.sessionId,
        { message: typeof payload?.message === 'string' ? payload.message : '阅读资源加载失败，请关闭后重试。', phase: 'agreementReader' }), config.parentOrigin)
    }
  }
  function onKey(event: KeyboardEvent): void {
    if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement &&
      root?.contains(event.target) && event.target.matches('.ydrz-confirm-iframe .ydrz-confirm-header em')) {
      event.preventDefault(); event.target.click()
    }
  }
  function dispose(): void {
    if (disposed) return
    disposed = true; observer?.disconnect()
    window.removeEventListener('message', onMessage); document.removeEventListener('keydown', onKey)
    for (const frame of root?.querySelectorAll<HTMLIFrameElement>('.ydrz-confirm-iframe iframe') ?? []) {
      if (targets.has(frame.src)) frame.contentWindow?.postMessage(createAssistanceAuthMessage('ASSISTANCE_AUTH_CLOSE', config.sessionId), parentOrigin)
    }
  }
  return { agreeArr, childArr, observe(target: HTMLElement, changed: (open: boolean) => void) {
    if (disposed) return
    observer?.disconnect(); root = target; onOpenChange = changed
    observer = new MutationObserver(inspect)
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'src'] })
    window.addEventListener('message', onMessage); document.addEventListener('keydown', onKey); inspect()
  }, dispose }
}
