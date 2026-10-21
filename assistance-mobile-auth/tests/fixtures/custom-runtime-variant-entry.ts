import { start as productionStart } from '../../src/custom-runtime/entry'
import type { CustomBootConfig, CustomRuntimeContext, CustomRuntimeHandle } from '../../src/custom-page/types'

declare const __CUSTOM_TEST_RUNTIME_VARIANT__: 'first' | 'second'

export async function start(config: CustomBootConfig, context: CustomRuntimeContext): Promise<CustomRuntimeHandle> {
  const handle = await productionStart(config, context)
  if (config.mode === 'authorization' && !context.signal.aborted) {
    document.querySelector<HTMLElement>('[data-custom-root]')!.dataset.runtimeVariant = __CUSTOM_TEST_RUNTIME_VARIANT__
  }
  return handle
}
