import type { CustomBootConfig, CustomRuntimeContext, CustomRuntimeHandle } from '../../custom-page/types'
import { startAuthorization } from '../../custom-runtime/authSession'
import { startAgreementReader } from '../../custom-runtime/agreementReader'

export async function start(config: CustomBootConfig, context: CustomRuntimeContext): Promise<CustomRuntimeHandle> {
  if (config.mode === 'agreement') return startAgreementReader(config, context)
  return startAuthorization(config, context, { recoverableSubmitErrors: true, safeErrorNotices: true, syncSubmitState: true })
}
