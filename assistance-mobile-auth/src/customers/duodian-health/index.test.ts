import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { AssistanceMobileAuthSdkOptions } from '../../wrapper'
import { createAssistanceMobileAuthSdk } from './index'

// Inspect the wrapper boundary: opening an actual iframe belongs to wrapper tests.
const { factory } = vi.hoisted(() => ({ factory: vi.fn((options: unknown) => options) }))
vi.mock('../../wrapper', () => ({ createAssistanceMobileAuthSdk: factory,
  getAssistanceMobileAuthOfficialCssAsset: vi.fn(), injectAssistanceMobileAuthOfficialCss: vi.fn() }))
const signed = { version: 'MOCK_ONLY_VERSION', appId: 'MOCK_ONLY_SIGNED_APP_ID', sign: 'MOCK_ONLY_INVALID_SIGN',
  traceId: 'MOCK_ONLY_TRACE', timestamp: 'MOCK_ONLY_TIMESTAMP', authType: '0', scope: '3ElementsAuthAssistFill' }
beforeEach(() => factory.mockClear())
afterEach(() => { document.body.replaceChildren(); Reflect.deleteProperty(window, 'AssistanceCustomPage') })

test('customer defaults keep the signed identity while selecting its own business identity and input mode', () => {
  createAssistanceMobileAuthSdk({ authParams: signed })
  const factoryInput = factory.mock.calls[0][0] as AssistanceMobileAuthSdkOptions
  expect(factoryInput.authParams).toEqual(signed)
  expect(factoryInput.appId).toBe('8a9481c79c05c8bd019f6a0a6c002457')
  expect(factoryInput.closable).toBe(false)
  expect(factoryInput.useCustomKeyboard).toBe(true)
  expect(factoryInput.customPage?.html).toContain('ydrzSubmitControl')
})

test('explicit business and display options survive without allowing caller appearance replacement', () => {
  createAssistanceMobileAuthSdk({ appId: 'MOCK_ONLY_BUSINESS_OVERRIDE', closable: true, useCustomKeyboard: false,
    authParams: signed, customPage: { html: '<p>caller replacement</p>' } } as never)
  const input = factory.mock.calls[0][0] as AssistanceMobileAuthSdkOptions
  expect(input.appId).toBe('MOCK_ONLY_BUSINESS_OVERRIDE')
  expect(input.authParams).toEqual(signed)
  expect(input.closable).toBe(true)
  expect(input.useCustomKeyboard).toBe(false)
  expect(input.customPage?.html).not.toContain('caller replacement')
})

test('reserved caller agreement is filtered once while ordinary duplicates retain checkbox indexes', () => {
  const duplicate = { name: '《MOCK_ONLY_CALLER》', link: 'https://example.invalid/agreement' }
  createAssistanceMobileAuthSdk({ agreements: [duplicate,
    { name: '  《第三方共享个人信息清单》  ', link: 'https://example.invalid/reserved' }, duplicate] })
  const input = factory.mock.calls[0][0] as AssistanceMobileAuthSdkOptions
  expect(input.agreements).toEqual([duplicate, duplicate])
  const parsed = new DOMParser().parseFromString(input.customPage!.html!, 'text/html')
  const root = document.createElement('div'); root.dataset.customRoot = ''; root.dataset.customTemplate = 'duodian-health'
  root.append(...parsed.body.childNodes); document.body.append(root)
  const checks: Array<[number, boolean]> = []
  Object.defineProperty(window, 'AssistanceCustomPage', { configurable: true, value: {
    register() {}, setIdLast4() {}, close() {}, setCallerAgreementChecked(index: number, checked: boolean) { checks.push([index, checked]) },
  } })
  window.eval(input.customPage!.js!)
  const boxes = [...root.querySelectorAll<HTMLInputElement>('[data-caller-agreements] input')]
  expect(boxes).toHaveLength(2)
  expect([...root.querySelectorAll('[data-caller-agreements] a')].map(link => link.textContent)).toEqual(['《MOCK_ONLY_CALLER》', '《MOCK_ONLY_CALLER》'])
  boxes[1].checked = true; boxes[1].dispatchEvent(new Event('change'))
  expect(checks).toEqual([[1, true]])
})
