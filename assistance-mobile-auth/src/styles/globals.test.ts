import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'globals.css')

describe('global SDK visual overrides', () => {
  it('keeps src registered as an explicit Tailwind source for static builds', () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('@source "../";')
    expect(css.indexOf('@source "../";')).toBeGreaterThan(css.indexOf("@import 'tailwindcss';"))
  })

  it('keeps the mobile JSSDK tips control visible for the SDK visibility check', () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('#ydrzTipsControl .auth-tips-title')
    expect(css).not.toContain('#ydrzTipsControl,\n#ydrzStateControl')
    expect(css).toContain('overflow: visible !important;')
    expect(css).toContain('opacity: 1 !important;')
  })

  it('renders compact SDK agreement and tips copy as one inline paragraph', () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.compact-agreement-copy #ydrzAgreementControl p,\n.compact-agreement-copy #ydrzTipsControl p')
    expect(css).toContain('display: inline !important;')
    expect(css).toContain('background-color: transparent !important;')
    expect(css).toContain('border-radius: 0 !important;')
  })

  it('lets agreement iframe pages fill the SDK protocol container width', () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain("html[data-app-flow='agreement'] #root")
    expect(css).toContain('max-width: none;')
    expect(css).toContain('width: 100%;')
    expect(css).toContain('margin: 0;')
  })

  it('forces the mobile JSSDK agreement popup shell to fill the host viewport', () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.ydrz-agreement-popup-show')
    expect(css).toContain('height: 100% !important;')
    expect(css).toContain('width: 100% !important;')
  })

  it('keeps the mobile JSSDK authorization state icon and text compact', () => {
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('#ydrzStateControl .auth-tips-wrap .auth-tips img')
    expect(css).toContain('justify-content: center !important;')
    expect(css).toContain('background-color: #ffffff !important;')
    expect(css).toContain('width: 18px !important;')
    expect(css).toContain('height: 18px !important;')
    expect(css).toContain('#ydrzStateControl .auth-tips-wrap .auth-tips span')
  })
})
