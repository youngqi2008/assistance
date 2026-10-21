import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAgreementDocByKey } from '../agreements/agreementContent'
import type { CustomAgreementConfig } from '../custom-page/types'
import { startAgreementReader } from './agreementReader'
import { start } from './entry'

const handles: Array<{ dispose(): void }> = []
afterEach(() => { handles.splice(0).forEach(h => h.dispose()); document.body.replaceChildren(); vi.restoreAllMocks(); vi.useRealTimers() })
function config(docKey: CustomAgreementConfig['docKey'] = 'entry'): CustomAgreementConfig {
  return { mode: 'agreement', sessionId: 'reader-session', parentOrigin: 'https://auth.example', docKey,
    docs: { 'personal-info-collection-list': getAgreementDocByKey('personal-info-collection-list')!,
      'haike-v2-third-party-sharing': getAgreementDocByKey('haike-v2-third-party-sharing')!,
      'haike-v2-privacy-policy': getAgreementDocByKey('haike-v2-privacy-policy')!,
      'haike-v2-cmcc-privacy-policy': getAgreementDocByKey('haike-v2-cmcc-privacy-policy')! },
    entries: [{ name: '《个人信息收集清单》', link: 'https://auth.example/reader?doc=personal-info-collection-list', docKey: 'personal-info-collection-list' },
      { name: '客户协议', link: 'https://customer.example/doc' }], css: '.customer{}', styleUrls: [], rootAttributes: { class: 'orange', 'data-theme': 'orange' } }
}
describe('pure custom agreement reader', () => {
  it('renders actual entry list, leaf paragraphs and return without authentication', async () => {
    const post = vi.spyOn(window.parent, 'postMessage')
    handles.push(await startAgreementReader(config()))
    expect(document.body.textContent).toContain('《用户信息授权协议》')
    const external = document.querySelector<HTMLAnchorElement>('a[href="https://customer.example/doc"]')!
    expect(external.textContent).toBe('客户协议')
    document.querySelector<HTMLAnchorElement>('a[data-doc-key]')!.click()
    expect(document.body.textContent).toContain('《个人信息收集清单》')
    expect(document.querySelector('article')?.textContent).toContain('手机号码')
    document.querySelector<HTMLButtonElement>('button[data-reader-back]')!.click()
    expect(document.body.textContent).toContain('客户协议')
    expect(post.mock.calls.some(([m]) => m.type === 'ASSISTANCE_AUTH_SUCCESS' || m.type === 'ASSISTANCE_AUTH_ERROR')).toBe(false)
  })
  it('renders original table links/text/colSpan and supports nested navigation twice', async () => {
    const c = config('haike-v2-third-party-sharing'); handles.push(await startAgreementReader(c))
    const doc = getAgreementDocByKey('haike-v2-third-party-sharing')!
    const table = doc.blocks.find(b => b.kind === 'table')!
    expect(document.querySelectorAll('tr')).toHaveLength(table.rows.length)
    for (const cell of table.rows.flat()) {
      if (typeof cell === 'string') expect(document.body.textContent).toContain(cell)
      else if (cell.kind === 'text') expect(document.querySelector(`td[colspan="${cell.colSpan}"]`)?.textContent).toContain(cell.text)
    }
    for (let n = 0; n < 2; n++) {
      const link = document.querySelector<HTMLAnchorElement>('a[data-doc-key="haike-v2-privacy-policy"]')!
      expect(link).not.toBeNull(); link.click()
      expect(document.body.textContent).toContain('《蓝鲸保隐私政策》')
      document.querySelector<HTMLButtonElement>('button[data-reader-back]')!.click()
      expect(document.querySelector('table')).not.toBeNull()
    }
  })
  it('entry.start dispatches agreement mode using upstream abort lifetime', async () => {
    const controller = new AbortController()
    handles.push(await start(config(), { runtimeSource: 'runtime', signal: controller.signal }))
    expect(document.querySelector('[data-agreement-reader]')).not.toBeNull()
    controller.abort()
    expect(document.querySelector('[data-agreement-reader]')).toBeNull()
  })
  it('keeps reader active past fifteen seconds and posts CLOSE to direct parent', async () => {
    vi.useFakeTimers(); const post = vi.spyOn(window.parent, 'postMessage')
    handles.push(await startAgreementReader(config()))
    await vi.advanceTimersByTimeAsync(60000)
    document.querySelector<HTMLButtonElement>('button[data-reader-close]')!.click()
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ type: 'ASSISTANCE_AUTH_CLOSE', sessionId: 'reader-session' }), 'https://auth.example')
  })
  it('applies inherited styles, exposes resource failure once, and still closes', async () => {
    const post = vi.spyOn(window.parent, 'postMessage'); const c = config(); c.styleUrls = ['https://customer.example/fail.css', 'https://customer.example/fail2.css']
    handles.push(await startAgreementReader(c))
    expect(document.querySelector('[data-agreement-reader]')?.getAttribute('data-theme')).toBe('orange')
    document.querySelectorAll('link').forEach(link => link.dispatchEvent(new Event('error')))
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('阅读资源加载失败')
    expect(post.mock.calls.filter(([m]) => m.type === 'ASSISTANCE_AUTH_ERROR_NOTICE')).toHaveLength(1)
    document.querySelector<HTMLButtonElement>('button[data-reader-close]')!.click()
    expect(post.mock.calls.at(-1)![0].type).toBe('ASSISTANCE_AUTH_CLOSE')
    expect(post.mock.calls.some(([m]) => m.type === 'ASSISTANCE_AUTH_ERROR')).toBe(false)
  })
  it('missing document remains a closable visible error', async () => {
    const c = config('cmcc'); handles.push(await startAgreementReader(c))
    expect(document.querySelector('[role="alert"]')).not.toBeNull()
    expect(document.querySelector('[data-reader-close]')).not.toBeNull()
  })
})
