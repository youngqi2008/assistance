import CryptoJS from 'crypto-js'

declare global {
  interface Window {
    CryptoJS?: typeof CryptoJS
  }
}

/**
 * The vendored mobile JSSDK (`src/wrapper/vendor/jssdk-1.0.6.min.js`) references
 * a global `CryptoJS` inside `aesEncrypt` and friends. Both the H5 in-app SDK
 * loader (`resourceLoader.ts`) and the standalone wrapper (`wrapper/index.ts`)
 * call this before any code path that may eventually invoke the SDK.
 *
 * Idempotent — host pages that already provided `window.CryptoJS` are left
 * untouched.
 */
export function ensureGlobalCryptoJs(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (window.CryptoJS) {
    return
  }

  window.CryptoJS = CryptoJS
}
