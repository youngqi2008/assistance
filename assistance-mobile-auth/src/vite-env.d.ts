/// <reference types="vite/client" />

declare const __STATIC_RESOURCE_RELEASE__: boolean
declare const __CUSTOM_LOADER_URL__: string | undefined
declare const __DUODIAN_BOTTOM_SHEET__: boolean
declare const __DUODIAN_IFRAME_AUTO_PARAMS__: boolean

declare module 'virtual:assistance-custom-runtime' {
  const runtimeSource: string
  export default runtimeSource
}

interface ImportMetaEnv {
  readonly VITE_MOBILE_AUTH_SDK_ENABLED?: string
  readonly VITE_MOBILE_AUTH_SDK_MODE?: string
  /** @deprecated Ignored. Mobile official JSSDK JavaScript is locked to the reviewed 1.0.6 CDN URL. */
  readonly VITE_MOBILE_AUTH_SDK_JS_URL?: string
  readonly VITE_MOBILE_AUTH_SDK_CSS_URL?: string
  readonly VITE_MOBILE_AUTH_DEBUG_ENTRY?: string
  readonly VITE_MOBILE_AUTH_VERSION?: string
  readonly VITE_MOBILE_AUTH_APP_ID?: string
  readonly VITE_MOBILE_AUTH_SIGN?: string
  readonly VITE_MOBILE_AUTH_TRACE_ID?: string
  readonly VITE_MOBILE_AUTH_TIMESTAMP?: string
  readonly VITE_MOBILE_AUTH_AUTH_TYPE?: string
  readonly VITE_MOBILE_AUTH_SCOPE?: string
  /** Build classification only; never changes the fixed JSSDK resource or authType policy. */
  readonly VITE_MOBILE_AUTH_ENV?: string
  readonly VITE_MOBILE_ASSISTANT_API_BASE?: string
  readonly VITE_MOBILE_ASSISTANT_TEST_TOKEN?: string
  readonly VITE_SFT_CUSTOMER_APP_ID?: string
  readonly VITE_SFT_CUSTOMER_APP_KEY?: string
  readonly VITE_SFT_SDK_SESSION_API_BASE?: string
  readonly VITE_SFT_PUBLIC_BASE_PATH?: string
  readonly VITE_SFT_PUBLIC_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface AssistanceMobileAuthUmdGlobal {
  createAssistanceMobileAuthSdk(
    options: import('./wrapper').AssistanceMobileAuthSdkOptions,
  ): import('./wrapper').AssistanceMobileAuthSdkInstance
}

interface Window {
  AssistanceMobileAuth?: AssistanceMobileAuthUmdGlobal
  AssistanceInjectedRuntime?: {
    start(config: import('./custom-page/types').CustomBootConfig, context: import('./custom-page/types').CustomRuntimeContext): Promise<import('./custom-page/types').CustomRuntimeHandle>
  }
}
