import { describe, expect, it, vi } from 'vitest'
import { createCustomerApi } from './customerApi'
import type { CustomPageState } from '../custom-page/types'

export function apiFixture() {
  const input = { onIdLast4: vi.fn(), onCallerAgreement: vi.fn(), callerAgreementCount: 1, onClose: vi.fn(), onError: vi.fn() }
  return { ...input, ...createCustomerApi(input) }
}

describe('customer local API', () => {
  it('normalizes X, rejects invalid input and duplicate register', () => {
    const f = apiFixture()
    f.api.setIdLast4('12x')
    expect(f.onIdLast4).toHaveBeenLastCalledWith('12X')
    for (const bad of ['12!', '12345', 123 as unknown as string]) f.api.setIdLast4(bad)
    expect(f.onIdLast4).toHaveBeenCalledTimes(1)
    expect(f.onError).toHaveBeenCalledTimes(3)
    f.api.register({})
    expect(() => f.api.register({})).toThrow()
    expect(() => f.api.setCallerAgreementChecked(1, true)).toThrow()
  })

  it('seals synchronous registration and waits ready before returning', async () => {
    const f = apiFixture()
    let resolve!: () => void
    f.api.register({ ready: new Promise<void>(r => { resolve = r }) })
    let finished = false
    const ready = f.sealRegistration().then(() => { finished = true })
    await Promise.resolve()
    expect(finished).toBe(false)
    expect(() => f.api.register({})).toThrow()
    resolve()
    await ready
    expect(finished).toBe(true)
  })

  it('ready rejection remains a terminal startup failure', async () => {
    const f = apiFixture()
    f.api.register({ ready: Promise.reject(new Error('not ready')) })
    await expect(f.sealRegistration()).rejects.toThrow('not ready')
  })

  it('bad agreement values after startup are recoverable and do not overwrite valid input', async () => {
    const f = apiFixture()
    await f.sealRegistration()
    f.api.setCallerAgreementChecked(0, true)
    for (const index of [-1, 1, 0.5, NaN]) expect(() => f.api.setCallerAgreementChecked(index, false)).not.toThrow()
    expect(() => f.api.setCallerAgreementChecked(0, 'yes' as unknown as boolean)).not.toThrow()
    expect(f.onCallerAgreement).toHaveBeenCalledTimes(1)
    expect(f.onCallerAgreement).toHaveBeenCalledWith(0, true)
    expect(f.onError).toHaveBeenCalledTimes(5)
  })

  it('publishes a fresh snapshot and reports hook errors without mutating state', async () => {
    const f = apiFixture()
    const state: CustomPageState = { phase: 'ready', idLast4: '123X', inputError: null, message: null, agreementReaderOpen: false }
    f.api.register({ onStateChange(snapshot) { snapshot.idLast4 = '0000'; throw new Error('hook failed') } })
    await f.sealRegistration()
    f.publish(state)
    expect(state.idLast4).toBe('123X')
    expect(f.onError.mock.calls[0][0].message).toBe('hook failed')
  })

  it('disposes once even if customer disposal throws and ignores all later calls', () => {
    const f = apiFixture()
    const dispose = vi.fn(() => { throw new Error('dispose failed') })
    f.api.register({ dispose })
    f.dispose(); f.dispose()
    f.api.setIdLast4('12'); f.api.close(); f.api.setCallerAgreementChecked(0, true)
    expect(dispose).toHaveBeenCalledTimes(1)
    expect(f.onError).toHaveBeenCalledTimes(1)
    expect(f.onIdLast4).not.toHaveBeenCalled()
    expect(f.onCallerAgreement).not.toHaveBeenCalled()
    expect(f.onClose).not.toHaveBeenCalled()
  })

  it('distinguishes input misuse from customer hook TypeErrors internally', async () => {
    const f = apiFixture()
    f.api.register({ onStateChange() { throw new TypeError('hook type error') }, dispose() { throw new TypeError('dispose type error') } })
    await f.sealRegistration()
    f.api.setIdLast4('!')
    f.api.setCallerAgreementChecked(2, true)
    f.publish({ phase: 'ready', idLast4: '', inputError: null, message: null, agreementReaderOpen: false })
    f.dispose()
    expect(f.onError.mock.calls.map(([error, origin]) => [error.constructor, origin])).toEqual([
      [TypeError, 'input'], [TypeError, 'input'], [TypeError, 'hook'], [TypeError, 'hook'],
    ])
  })
})
