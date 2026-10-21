import type { CustomPageApi, CustomPageHooks, CustomPageState } from '../custom-page/types'

export function createCustomerApi(input: {
  onIdLast4(value: string): void
  onCallerAgreement(index: number, checked: boolean): void
  callerAgreementCount: number
  onClose(): void
  onError(error: Error, origin: 'input' | 'hook'): void
}): { api: CustomPageApi; sealRegistration(): Promise<void>; publish(state: CustomPageState): void; dispose(): void } {
  let hooks: CustomPageHooks | undefined
  let sealed = false
  let started = false
  let disposed = false
  let ready: Promise<void> | undefined
  const report = (error: unknown, origin: 'input' | 'hook') => input.onError(error instanceof Error ? error : new Error(String(error)), origin)
  function invalidAgreement(): void {
    const error = new TypeError('Caller agreement index or checked value is invalid')
    if (!started) throw error
    report(error, 'input')
  }
  const api: CustomPageApi = {
    register(value) {
      if (disposed) return
      if (sealed || hooks) throw new Error('Customer hooks must register synchronously, once')
      if (!value || typeof value !== 'object' ||
        (value.onStateChange !== undefined && typeof value.onStateChange !== 'function') ||
        (value.dispose !== undefined && typeof value.dispose !== 'function') ||
        (value.ready !== undefined && typeof value.ready.then !== 'function')) {
        throw new TypeError('Customer hooks are invalid')
      }
      hooks = { ...value }
      // Observe rejected ready immediately; sealRegistration still propagates it.
      ready = Promise.resolve(value.ready)
      void ready.catch(() => {})
    },
    setIdLast4(value) {
      if (disposed) return
      if (typeof value !== 'string' || !/^[0-9xX]{0,4}$/.test(value)) {
        report(new TypeError('Identity input accepts at most four digits or X'), 'input')
        return
      }
      input.onIdLast4(value.toUpperCase())
    },
    setCallerAgreementChecked(index, checked) {
      if (disposed) return
      if (!Number.isInteger(index) || index < 0 || index >= input.callerAgreementCount || typeof checked !== 'boolean') {
        invalidAgreement()
        return
      }
      input.onCallerAgreement(index, checked)
    },
    close() { if (!disposed) input.onClose() },
  }
  return {
    api,
    sealRegistration() {
      sealed = true
      ready ??= Promise.resolve()
      return ready.then(() => { if (!disposed) started = true })
    },
    publish(state) {
      if (disposed) return
      try { hooks?.onStateChange?.({ ...state }) } catch (error) { report(error, 'hook') }
    },
    dispose() {
      if (disposed) return
      disposed = true
      try { hooks?.dispose?.() } catch (error) { report(error, 'hook') }
      finally { hooks = undefined }
    },
  }
}
