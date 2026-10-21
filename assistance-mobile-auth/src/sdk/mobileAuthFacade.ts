import type {
  MobileAuthSdkGetAuthResultRequest,
  MobileAuthSdkGlobal,
  MobileAuthSdkInitControlRequest,
  MobileAuthSdkShowAuthPageRequest,
  MobileAuthSdkSubmitButtonState,
  SdkControlId,
} from './types'

export class MobileAuthSdkUnavailableError extends Error {
  constructor(
    message: string,
    public readonly methodName?: keyof MobileAuthSdkGlobal,
  ) {
    super(message)
    this.name = 'MobileAuthSdkUnavailableError'
  }
}

export interface MobileAuthSdkFacade {
  showAuthPage(request: MobileAuthSdkShowAuthPageRequest): void
  initControl(request: MobileAuthSdkInitControlRequest): void
  clearControl(targetId?: SdkControlId): void
  getAuthResult(request: MobileAuthSdkGetAuthResultRequest): void
  updateSubmitBtnStatus(state: MobileAuthSdkSubmitButtonState): void
}

function readMobileAuthSdkGlobal(): MobileAuthSdkGlobal {
  const sdk = window.YDRZAuthSF

  if (!sdk) {
    throw new MobileAuthSdkUnavailableError('Mobile auth SDK global unavailable: window.YDRZAuthSF')
  }

  return sdk
}

function requireSdkMethod<TMethodName extends keyof MobileAuthSdkGlobal>(
  methodName: TMethodName,
): NonNullable<MobileAuthSdkGlobal[TMethodName]> {
  const sdk = readMobileAuthSdkGlobal()
  const method = sdk[methodName]

  if (typeof method !== 'function') {
    throw new MobileAuthSdkUnavailableError(
      `Mobile auth SDK method unavailable: ${String(methodName)}`,
      methodName,
    )
  }

  return method as NonNullable<MobileAuthSdkGlobal[TMethodName]>
}

// Stringify SDK params for console diagnostics. Functions (e.g. agreeArr
// customEvent / callbacks) are kept as "[Function]" placeholders so the
// surrounding shape (names, agreeArr entries) stays visible in the log.
function stringifySdkParam(value: unknown): string {
  try {
    return JSON.stringify(
      value,
      (_key, val) => (typeof val === 'function' ? '[Function]' : val),
      2,
    )
  } catch (error) {
    return `[unserializable: ${error instanceof Error ? error.message : String(error)}]`
  }
}

// D-04 boundary: pages and business components must not read window directly.
// All approved SDK access in this phase goes through this facade.
export function createMobileAuthSdkFacade(): MobileAuthSdkFacade {
  return {
    showAuthPage(request) {
      console.info('[MobileAuthSDK→showAuthPage] params:', stringifySdkParam(request))
      requireSdkMethod('showAuthPage')(request)
    },
    initControl(request) {
      console.info('[MobileAuthSDK→initControl] params:', stringifySdkParam(request))
      requireSdkMethod('initControl')(request)
    },
    clearControl(targetId) {
      requireSdkMethod('clearControl')(targetId)
    },
    getAuthResult(request) {
      requireSdkMethod('getAuthResult')(request)
    },
    updateSubmitBtnStatus(state) {
      requireSdkMethod('updateSubmitBtnStatus')(state)
    },
  }
}
