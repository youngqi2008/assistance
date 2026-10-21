import { afterEach, expect, test, vi } from 'vitest'
import { createCustomerApi } from '../../custom-runtime/customerApi'
import type { CustomPageState } from '../../custom-page/types'
import type { AssistanceMobileAuthSdkOptions } from '../../wrapper'
import { createDuodianPage } from './page.ts'
import { createAssistanceMobileAuthSdk } from './index'

const { factory } = vi.hoisted(() => ({ factory: vi.fn((options: unknown) => options) }))
vi.mock('../../wrapper', () => ({ createAssistanceMobileAuthSdk: factory,
  getAssistanceMobileAuthOfficialCssAsset: vi.fn(), injectAssistanceMobileAuthOfficialCss: vi.fn() }))
// Vitest disables CSS imports by default, including ?raw. Exercise the actual
// shipped stylesheet in jsdom rather than its empty test-transform placeholder.
vi.mock('./style.css?raw', async () => ({ default: (await import('node:fs')).readFileSync('src/customers/duodian-health/style.css', 'utf8') }))
const disposers: Array<() => void> = []
afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
  document.body.replaceChildren()
  Reflect.deleteProperty(window, 'AssistanceCustomPage')
  Reflect.deleteProperty(window, 'visualViewport')
  factory.mockClear()
})

function mount(options: { closable?: boolean; useCustomKeyboard?: boolean; agreements?: Array<{ name: string; link: string }> } = {}) {
  const page = createDuodianPage({ closable: false, useCustomKeyboard: true, agreements: [], ...options })
  const parsed = new DOMParser().parseFromString(page.html!, 'text/html')
  const root = document.createElement('div')
  root.dataset.customRoot = ''; root.dataset.customTemplate = 'duodian-health'
  root.append(...parsed.body.childNodes)
  const style = document.createElement('style'); style.textContent = page.css!
  root.prepend(style); document.body.append(root)
  let state: CustomPageState = { phase: 'initializing', idLast4: '', inputError: null, message: null, agreementReaderOpen: false }
  const inputs: string[] = []; const checks: Array<[number, boolean]> = []; const closes = vi.fn()
  const errors: Error[] = []
  const customer = createCustomerApi({ callerAgreementCount: options.agreements?.length ?? 0,
    onIdLast4(value) { inputs.push(value); state = { ...state, idLast4: value }; customer.publish(state) },
    onCallerAgreement(index, checked) { checks.push([index, checked]) }, onClose: closes,
    onError(error) { errors.push(error) },
  })
  const register = vi.spyOn(customer.api, 'register')
  Object.defineProperty(window, 'AssistanceCustomPage', { configurable: true, value: customer.api })
  window.eval(page.js!)
  disposers.push(customer.dispose)
  function publish(next: Partial<CustomPageState>) { state = { ...state, ...next }; customer.publish(state) }
  function node<T extends HTMLElement = HTMLElement>(selector: string) {
    const element = root.querySelector<T>(selector)
    expect(element, `missing customer control ${selector}`).not.toBeNull()
    return element!
  }
  function key(value: string) { node(`[data-key="${value}"]`).click() }
  function digits() { return [...root.querySelectorAll('[data-digit]')].map(box => box.textContent).join('') }
  return { page, root, node, key, digits, publish, inputs, checks, closes, register, errors, dispose: customer.dispose }
}

// Missing grid editing, wrong normalization/length, and arbitrary insertion break this flow.
test('opens the collapsed keyboard from any box and appends normalized digits with a following caret', () => {
  const f = mount(); f.publish({ phase: 'ready' })
  expect(f.node('[data-keyboard]').hidden).toBe(true)
  const proxy = f.node<HTMLInputElement>('[data-id-value]')
  expect(proxy.readOnly).toBe(true); expect(proxy.inputMode).toBe('none')
  expect(document.activeElement).not.toBe(proxy)
  expect(f.root.querySelectorAll('[data-id-box]')).toHaveLength(4)
  f.node('[data-id-box]:nth-child(4)').click()
  expect(f.node('[data-keyboard]').hidden).toBe(false)
  expect(f.node('[data-id-box]').dataset.active).toBe('true')
  f.key('1'); f.node('[data-key="X"]').dataset.key = 'x'; f.key('x'); f.key('2'); f.key('3')
  expect(f.inputs).toEqual(['1', '1X', '1X2', '1X23'])
  expect(f.digits()).toBe('1X23')
  expect([...f.root.querySelectorAll<HTMLElement>('[data-caret]')].every(caret => caret.hidden)).toBe(true)
  expect(f.node('[data-keyboard]').hidden).toBe(true)
  f.node('[data-id-box]').click(); f.key('9')
  expect(f.inputs).toHaveLength(4)
  f.key('delete')
  expect(f.digits()).toBe('1X2')
  expect(f.node('[data-id-box]:nth-child(4)').dataset.active).toBe('true')
  f.node('[data-collapse]').click(); f.node('[data-id-box]:nth-child(2)').click(); f.key('4')
  expect(f.digits()).toBe('1X24')
  expect(f.errors).toEqual([])
})

test('rejects invalid keys and cleans native input while keeping native keyboard optional', () => {
  const f = mount(); f.publish({ phase: 'ready' }); f.node('[data-id-box]').click()
  f.node('[data-key="1"]').dataset.key = '!'; f.key('!')
  expect(f.inputs).toEqual([])
  f.dispose(); f.root.remove()
  const native = mount({ useCustomKeyboard: false }); native.publish({ phase: 'ready' })
  native.node('[data-id-box]').click()
  const input = native.node<HTMLInputElement>('[data-id-value]')
  expect(document.activeElement).toBe(input); expect(input.readOnly).toBe(false)
  input.value = '!1x2a345'; input.dispatchEvent(new Event('input'))
  expect(native.digits()).toBe('1X23')
  expect(native.node('[data-keyboard]').hidden).toBe(true)
})

test('keeps other method visible without a close icon and honors the optional close icon', () => {
  const f = mount(); f.publish({ phase: 'ready' })
  expect(f.node('[data-close]').hidden).toBe(true)
  expect(f.node('[data-other]').hidden).toBe(false)
  expect(getComputedStyle(f.node('[data-other]')).display).not.toBe('none')
  f.node('[data-other]').click(); expect(f.closes).toHaveBeenCalledOnce()
  f.node('[data-close]').click(); expect(f.closes).toHaveBeenCalledOnce()
  f.dispose(); f.root.remove()
  const optional = mount({ closable: true }); optional.publish({ phase: 'ready' })
  expect(optional.node('[data-close]').hidden).toBe(false)
  optional.node('[data-close]').click(); expect(optional.closes).toHaveBeenCalledOnce()
})

test('blocks editing, caller checks, cancellation and protocol clicks while busy, then permits error retry', () => {
  const f = mount({ agreements: [{ name: '调用方协议', link: 'https://example.invalid/protocol' }] })
  f.publish({ phase: 'ready' }); f.node('[data-id-box]').click(); f.key('1')
  const check = f.node<HTMLInputElement>('[data-caller-agreements] input')
  check.checked = true; check.dispatchEvent(new Event('change'))
  expect(f.checks).toEqual([[0, true]])
  const link = f.node('[data-caller-agreements] a')
  let protocolOpens = 0; link.addEventListener('click', () => protocolOpens++)
  f.publish({ phase: 'submitting', message: '验证中' })
  f.key('2'); f.node('[data-other]').click()
  check.checked = false; check.dispatchEvent(new Event('change'))
  const event = new MouseEvent('click', { bubbles: true, cancelable: true }); link.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(true); expect(protocolOpens).toBe(0)
  expect(f.inputs).toEqual(['1']); expect(f.checks).toEqual([[0, true]]); expect(f.closes).not.toHaveBeenCalled()
  expect(f.node('[data-keyboard]').hidden).toBe(true)
  expect(f.node('[data-message]').textContent).toBe('验证中')
  f.publish({ phase: 'error', message: '请重试' }); f.node('[data-id-box]').click(); f.key('2')
  expect(f.digits()).toBe('12'); expect(f.node('[data-message]').textContent).toBe('请重试')
  f.publish({ phase: 'completed' }); f.key('3'); f.node('[data-other]').click()
  expect(f.digits()).toBe('12'); expect(f.closes).not.toHaveBeenCalled()
})

test.each([
  ['empty/collapsed', '', false], ['empty/expanded', '', true],
  ['partial/collapsed', '12', false], ['partial/expanded', '12', true],
  ['full/collapsed', '123X', false], ['full/expanded', '123X', true],
] as const)('restores reader input, next-empty cell, focus and prior keyboard for %s', (_name, value, open) => {
  const f = mount(); f.publish({ phase: 'ready', idLast4: value }); f.node('[data-id-box]').click()
  if (!open) f.node('[data-collapse]').click()
  f.node('[data-id-grid]').focus()
  f.publish({ agreementReaderOpen: true }); (document.activeElement as HTMLElement).blur()
  expect(f.node('[data-keyboard]').hidden).toBe(true)
  f.key('3'); expect(f.inputs).toEqual([])
  f.publish({ agreementReaderOpen: false })
  expect(f.digits()).toBe(value); expect(f.node<HTMLInputElement>('[data-id-value]').value).toBe(value)
  expect(f.node('[data-keyboard]').hidden).toBe(!open)
  expect(document.activeElement).toBe(f.node('[data-id-grid]'))
  expect([...f.root.querySelectorAll<HTMLElement>('[data-id-box]')].map(box => box.dataset.active))
    .toEqual([0, 1, 2, 3].map(index => String(open && value.length < 4 && index === value.length)))
})

test('registers once and removes input, viewport and protocol listeners on disposal', () => {
  const viewport = new EventTarget() as EventTarget & { height: number }
  viewport.height = 500
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
  const f = mount(); f.publish({ phase: 'ready' }); f.node('[data-id-box]').click(); f.key('1')
  expect(f.register).toHaveBeenCalledOnce()
  expect(f.root.style.getPropertyValue('--duodian-viewport-height')).toBe('500px')
  viewport.height = 400; viewport.dispatchEvent(new Event('resize'))
  expect(f.root.style.getPropertyValue('--duodian-viewport-height')).toBe('400px')
  f.dispose(); f.key('2'); f.node('[data-other]').click()
  viewport.height = 300; viewport.dispatchEvent(new Event('resize'))
  expect(f.root.style.getPropertyValue('--duodian-viewport-height')).toBe('400px')
  expect(f.inputs).toEqual(['1']); expect(f.closes).not.toHaveBeenCalled()
})

test('requests natural card plus visible keyboard height independently of the iframe viewport cap', () => {
  const f = mount(); f.publish({ phase: 'ready' })
  Object.defineProperty(f.node('[data-card]'), 'scrollHeight', { configurable: true, value: 620 })
  vi.spyOn(f.node('[data-keyboard]'), 'getBoundingClientRect').mockReturnValue({ height: 200 } as DOMRect)
  window.dispatchEvent(new Event('resize'))
  expect(f.root.style.minHeight).toBe('620px')
  f.node('[data-id-grid]').click()
  expect(f.root.style.minHeight).toBe('820px')
  f.node('[data-collapse]').click()
  expect(f.root.style.minHeight).toBe('620px')
})

test('remeasures official DOM replacement and stops content observation on disposal', async () => {
  const f = mount(); f.publish({ phase: 'ready' })
  const size = { height: 500 }
  Object.defineProperty(f.node('[data-card]'), 'scrollHeight', { configurable: true, get: () => size.height })
  f.node('#ydrzPhoneControl').append(document.createElement('p'))
  await Promise.resolve()
  expect(f.root.style.minHeight).toBe('500px')
  size.height = 540; f.node('#ydrzSubmitControl').append(document.createElement('div'))
  await Promise.resolve()
  expect(f.root.style.minHeight).toBe('540px')
  f.dispose(); size.height = 620; f.node('#ydrzSubmitControl').append(document.createElement('div'))
  await Promise.resolve()
  expect(f.root.style.minHeight).toBe('540px')
})

test('embeds the two original aspect images, mounts genuine controls and orders other method before formal consent', () => {
  const f = mount()
  const images = [...f.root.querySelectorAll('img')]
  expect(images).toHaveLength(2)
  expect(images.map(img => [img.width, img.height])).toEqual([[318, 47], [649, 120]])
  images.forEach(img => expect(img.getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/))
  expect(f.root.querySelector('link[rel="stylesheet"]')).toBeNull()
  for (const id of ['ydrzPhoneControl', 'ydrzTipsControl', 'ydrzStateControl', 'ydrzYZMControl', 'ydrzYZMBtnControl', 'ydrzSubmitControl', 'ydrzAgreementControl']) {
    const slot = f.node(`#${id}`)
    expect(slot).not.toBeNull(); expect(slot.closest('[hidden]')).toBeNull()
  }
  expect(f.node('[data-other]').compareDocumentPosition(f.node('[data-agreements]')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(f.node('#ydrzPhoneControl').textContent).toBe('')
  expect(f.node('#ydrzSubmitControl').textContent).toBe('')
  expect(f.root.textContent).not.toContain('授权登录')
  expect(f.node('[data-card]').querySelectorAll('button')).toHaveLength(2)
})

test('removes the loader default body margin so the sheet fills the mobile viewport edge', () => {
  mount()
  expect(getComputedStyle(document.body).margin).toBe('0px')
})

test('Chrome 98 fallback resets body margin and constrains the customer reader without has selectors', () => {
  const f = mount()
  const style = f.root.querySelector('style')!
  style.textContent = style.textContent!.replace(/[^{}]*:has[^{}]*\{[^{}]*\}/g, '')
  const reader = document.createElement('div'); reader.className = 'ydrz-confirm-iframe'
  document.body.append(reader)
  expect(getComputedStyle(document.body).margin).toBe('0px')
  expect(getComputedStyle(reader).maxWidth).toBe('100%')
  expect(getComputedStyle(reader).maxHeight).toBe('100%')
})

test('configures the genuine submit label and green shape through styleOption while preserving caller nonvisual settings', () => {
  createAssistanceMobileAuthSdk({ styleOption: { submitBtnStyle: { name: '覆盖文案', bgColor: 'red' }, phoneStyle: { fontSize: '14px' } } })
  const options = factory.mock.calls[0][0] as AssistanceMobileAuthSdkOptions
  expect(options.styleOption?.submitBtnStyle).toMatchObject({ name: '授权登录', bgColor: '#19be00', borderRadius: '16px', width: '100%' })
  expect(options.styleOption?.submitBtnDisabledStyle).toMatchObject({ bgColor: '#e2e6e2' })
  expect(options.styleOption?.phoneStyle?.fontSize).toBe('14px')
})
