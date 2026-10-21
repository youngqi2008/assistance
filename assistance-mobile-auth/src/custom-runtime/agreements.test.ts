import { afterEach, describe, expect, it, vi } from 'vitest'
import { HAIKE_V2_APP_ID, TIANTIANYOUBAO_V2_APP_ID } from '../agreements/appAgreementRegistry'
import type { CustomAuthorizationConfig } from '../custom-page/types'
import { createAssistanceAuthMessage } from '../wrapper/verificationBridge'
import { createCustomAgreementController } from './agreements'

const handles: Array<{ dispose(): void }> = []
afterEach(() => { handles.splice(0).forEach(h => h.dispose()); document.body.replaceChildren(); vi.restoreAllMocks() })
function fixture(appId = 'customer') {
  const config: CustomAuthorizationConfig = {
    mode: 'authorization', sessionId: 'reader-session', parentOrigin: 'https://top.example', appId,
    page: { kind: 'html', html: '<p></p>', baseUrl: 'https://customer.example/assets/' },
    request: { scene: 'native-number' }, agreements: [{ name: '《第三方共享个人信息清单》', link: 'https://customer.test/terms' }],
    iframeOptions: { closable: true, useCustomKeyboard: true, heightMode: 'auto' }, trustedBusinessBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro-temp/',
    deadline: Date.now() + 15000, beforeLoginNotificationEnabled: false, stateChangeEnabled: true,
  }
  const c = createCustomAgreementController(config, '/* same runtime */', { css: '.customer{}', urls: ['https://customer.test/style.css'], rootAttributes: { 'data-theme': 'orange' } })
  handles.push(c)
  const states: boolean[] = []
  c.observe(document.body, value => states.push(value))
  function reader(url = c.agreeArr[0].link!, sdk = true) {
    const panel = document.createElement('div'); if (sdk) panel.className = 'ydrz-confirm-iframe'
    const frame = document.createElement('iframe'); frame.src = url; panel.append(frame); document.body.append(panel)
    const boot = vi.spyOn(frame.contentWindow!, 'postMessage')
    return { panel, frame, boot }
  }
  function send(frame: HTMLIFrameElement, type = 'ASSISTANCE_AUTH_READY', override: Partial<MessageEventInit> = {}) {
    window.dispatchEvent(new MessageEvent('message', { origin: window.location.origin, source: frame.contentWindow,
      data: createAssistanceAuthMessage(type as 'ASSISTANCE_AUTH_READY', config.sessionId), ...override }))
  }
  return { c, config, states, reader, send }
}
describe('custom SDK reader controller', () => {
  it('RF3 retains four built-ins then every caller, rewriting only registered internal links', () => {
    const f = fixture()
    expect(f.c.childArr).toHaveLength(5)
    expect(f.c.childArr[4].link).toBe('https://customer.test/terms')
    expect(f.c.agreeArr[0].name).toBe('《用户信息授权协议》')
    for (const entry of f.c.childArr.slice(0, 4)) {
      const url = new URL(entry.link!)
      expect(url.origin).toBe(window.location.origin)
      expect(url.searchParams.get('role')).toBe('agreement')
      expect(url.searchParams.get('parentOrigin')).toBe(window.location.origin)
      expect(url.searchParams.has('appId')).toBe(false)
    }
  })
  it('preserves the three-document business exception', () => { expect(fixture(TIANTIANYOUBAO_V2_APP_ID).c.childArr).toHaveLength(4) })
  it('RF5 accepts early READY only from actual SDK iframe at its exact registered URL', () => {
    const f = fixture(); const r = f.reader(); f.send(r.frame)
    expect(r.boot).toHaveBeenCalledTimes(1)
    const message = r.boot.mock.calls[0][0]
    expect(message.payload.runtimeSource).toBe('/* same runtime */')
    expect(message.payload.config).toMatchObject({ mode: 'agreement', docKey: 'entry', parentOrigin: window.location.origin })
    expect(message.payload.config).not.toHaveProperty('authParams')
    expect(message.payload.config).not.toHaveProperty('keyA')
    expect(message.payload.config).not.toHaveProperty('page')
    expect(message.payload.config.entries).toHaveLength(5)
    expect(r.boot.mock.calls[0][1]).toBe(window.location.origin)
  })
  it('rejects foreign origin, window, session, source and unregistered target', () => {
    const f = fixture(); const r = f.reader()
    f.send(r.frame, undefined, { origin: 'https://evil.example' })
    f.send(r.frame, undefined, { source: window })
    f.send(r.frame, undefined, { data: createAssistanceAuthMessage('ASSISTANCE_AUTH_READY', 'wrong') })
    f.send(r.frame, undefined, { data: { ...createAssistanceAuthMessage('ASSISTANCE_AUTH_READY', f.config.sessionId), source: 'evil' } })
    const outsider = f.reader(undefined, false); f.send(outsider.frame)
    const other = f.reader(`${r.frame.src}&extra=1`); f.send(other.frame)
    expect(r.boot).not.toHaveBeenCalled(); expect(outsider.boot).not.toHaveBeenCalled(); expect(other.boot).not.toHaveBeenCalled()
  })
  it('registers nested Haike documents and sends the original table model', () => {
    const f = fixture(HAIKE_V2_APP_ID); const r = f.reader(f.c.childArr[3].link!); f.send(r.frame)
    const config = r.boot.mock.calls[0][0].payload.config
    expect(config.docKey).toBe('haike-v2-third-party-sharing')
    expect(config.docs['haike-v2-privacy-policy']).toBeDefined()
    expect(config.docs['haike-v2-cmcc-privacy-policy']).toBeDefined()
    expect(config.docs['haike-v2-third-party-sharing'].blocks.some((b: { kind: string }) => b.kind === 'table')).toBe(true)
  })
  it('reader CLOSE restores input focus and reports closed without touching its value', async () => {
    const f = fixture(); const input = document.createElement('input'); input.value = '123X'; document.body.append(input); input.focus()
    const r = f.reader(); f.send(r.frame); r.frame.focus()
    f.send(r.frame, 'ASSISTANCE_AUTH_CLOSE'); await Promise.resolve()
    expect(r.panel.isConnected).toBe(false); expect(f.states.at(-1)).toBe(false)
    expect(input.value).toBe('123X'); expect(document.activeElement).toBe(input)
  })
  it('forwards one nonterminal reader resource notice and permits closing', () => {
    const f = fixture(); const r = f.reader(); const post = vi.spyOn(window.parent, 'postMessage')
    const data = createAssistanceAuthMessage('ASSISTANCE_AUTH_ERROR_NOTICE', f.config.sessionId, { message: '阅读资源加载失败', phase: 'agreementReader' })
    f.send(r.frame, undefined, { data }); f.send(r.frame, undefined, { data })
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][0].type).toBe('ASSISTANCE_AUTH_ERROR_NOTICE')
    expect(r.panel.isConnected).toBe(true)
    f.send(r.frame, 'ASSISTANCE_AUTH_CLOSE'); expect(r.panel.isConnected).toBe(false)
  })
  it('disconnects observer/messages on disposal and ignores subsequent READY', () => {
    const f = fixture(); const r = f.reader(); f.c.dispose(); f.send(r.frame)
    expect(r.boot.mock.calls.some(([m]) => m.type === 'ASSISTANCE_AUTH_CUSTOM_BOOT')).toBe(false)
  })
  it('does not BOOT a reader after the parent disposes during open-state notification', () => {
    const f = fixture(); f.c.observe(document.body, open => { if (open) f.c.dispose() })
    const r = f.reader(); f.send(r.frame)
    expect(r.boot.mock.calls.some(([m]) => m.type === 'ASSISTANCE_AUTH_CUSTOM_BOOT')).toBe(false)
  })
})
