import type {
  AssistanceMobileAuthSdkInstance,
  AssistanceMobileAuthSdkOptions,
} from './index'
import { createSftPublicPath } from '../config/publicBase'

export interface AssistanceMobileAuthEsmModule {
  createAssistanceMobileAuthSdk(
    options: AssistanceMobileAuthSdkOptions,
  ): AssistanceMobileAuthSdkInstance
}

export function getAssistanceMobileAuthEsmSdkUrl() {
  return createSftPublicPath(
    'assist/0.2.3/assistance-mobile-auth/assistance-mobile-auth.0.2.3.js',
  )
}

export async function loadAssistanceMobileAuthEsmModule(): Promise<AssistanceMobileAuthEsmModule> {
  const module = await import(/* @vite-ignore */ getAssistanceMobileAuthEsmSdkUrl()) as Partial<AssistanceMobileAuthEsmModule>

  if (typeof module.createAssistanceMobileAuthSdk !== 'function') {
    throw new Error('ESM JSSDK 已加载但未导出 createAssistanceMobileAuthSdk。')
  }

  return module as AssistanceMobileAuthEsmModule
}
