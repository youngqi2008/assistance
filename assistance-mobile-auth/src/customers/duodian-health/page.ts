import html from './page.html?raw'
import css from './style.css?raw'
import js from './page.js?raw'
import securityImage from './assets/security.jpg?inline'
import identityImage from './assets/identity.jpg?inline'
import type { CustomPage } from '../../custom-page/types'

export function createDuodianPage(options: { closable: boolean; useCustomKeyboard: boolean;
  agreements: Array<{ name: string; link: string }> }): CustomPage {
  return {
    html: html.replace('__DUODIAN_SECURITY_IMAGE__', securityImage).replace('__DUODIAN_IDENTITY_IMAGE__', identityImage),
    css,
    js: `window.DuodianHealthPageConfig = ${JSON.stringify({
      closable: options.closable, useCustomKeyboard: options.useCustomKeyboard, agreements: options.agreements,
    })};\n${js}`,
  }
}
