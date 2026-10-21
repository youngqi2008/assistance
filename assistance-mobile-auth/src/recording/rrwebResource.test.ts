import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  RRWEB_CDN_INTEGRITY,
  RRWEB_CDN_URL,
  RRWEB_LOCAL_PATH,
  RRWEB_LOCAL_SHA256,
  RRWEB_VERSION,
  loadRrwebResource,
  resetRrwebResourceForTests,
  type RrwebApi,
} from './rrwebResource'

const record = vi.fn()

function installRrwebGlobal() {
  window.rrweb = { record } satisfies RrwebApi
}

function getScript(id: string) {
  return document.getElementById(id) as HTMLScriptElement | null
}

describe('rrwebResource', () => {
  beforeEach(() => {
    record.mockReset()
    resetRrwebResourceForTests()
    document.head.innerHTML = ''
    delete window.rrweb
  })

  afterEach(() => {
    resetRrwebResourceForTests()
    document.head.innerHTML = ''
    delete window.rrweb
  })

  it('pins the customer-approved version and fallback checksum', () => {
    expect(RRWEB_VERSION).toBe('2.0.0-alpha.4')
    expect(RRWEB_CDN_URL).toBe(
      'https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js',
    )
    expect(RRWEB_CDN_INTEGRITY).toBe(
      'sha384-UpKcjeLZtEcYxELLISURK3MAcN3KQdTx8iygewcEWVl8LqgVrftgiMtuMHod7D8e',
    )
    expect(RRWEB_LOCAL_PATH).toBe('/sign-pay-pro/assistance-mobile-auth/vendor/rrweb.min.js')

    const localFile = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../static/public/assistance-mobile-auth/vendor/rrweb.min.js',
    )
    const sha256 = createHash('sha256').update(readFileSync(localFile)).digest('hex')
    expect(sha256).toBe(RRWEB_LOCAL_SHA256)
  })

  it('derives the assist-layer fallback path when VITE_SFT_PUBLIC_BASE_PATH is set', async () => {
    vi.stubEnv('VITE_SFT_PUBLIC_BASE_PATH', '/sign-pay-pro/assist/')
    vi.resetModules()
    try {
      const mod = await import('./rrwebResource')
      expect(mod.RRWEB_LOCAL_PATH).toBe(
        '/sign-pay-pro/assist/assistance-mobile-auth/vendor/rrweb.min.js',
      )
    } finally {
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })

  it('loads the CDN with SRI and does not request the fallback on success', async () => {
    const resultPromise = loadRrwebResource()
    const cdn = getScript('assistance-rrweb-cdn')

    expect(cdn?.src).toBe(RRWEB_CDN_URL)
    expect(cdn?.integrity).toBe(RRWEB_CDN_INTEGRITY)
    expect(cdn?.crossOrigin).toBe('anonymous')
    expect(cdn?.async).toBe(true)

    installRrwebGlobal()
    cdn?.dispatchEvent(new Event('load'))

    await expect(resultPromise).resolves.toMatchObject({ status: 'ready', source: 'cdn' })
    expect(getScript('assistance-rrweb-local')).toBeNull()
  })

  it('loads the local file after a CDN or integrity failure', async () => {
    const resultPromise = loadRrwebResource()
    getScript('assistance-rrweb-cdn')?.dispatchEvent(new Event('error'))

    await vi.waitFor(() => expect(getScript('assistance-rrweb-local')).not.toBeNull())
    const local = getScript('assistance-rrweb-local')
    expect(local?.src).toBe(new URL(RRWEB_LOCAL_PATH, window.location.href).toString())
    expect(local?.integrity ?? '').toBe('')

    installRrwebGlobal()
    local?.dispatchEvent(new Event('load'))

    await expect(resultPromise).resolves.toMatchObject({ status: 'ready', source: 'local' })
  })

  it('returns unavailable and warns once when both resources fail', async () => {
    const warn = vi.fn()
    const first = loadRrwebResource({ warn })
    const second = loadRrwebResource({ warn })

    expect(second).toBe(first)
    getScript('assistance-rrweb-cdn')?.dispatchEvent(new Event('error'))
    await vi.waitFor(() => expect(getScript('assistance-rrweb-local')).not.toBeNull())
    getScript('assistance-rrweb-local')?.dispatchEvent(new Event('error'))

    await expect(first).resolves.toMatchObject({ status: 'unavailable' })
    await expect(second).resolves.toMatchObject({ status: 'unavailable' })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(document.querySelectorAll('#assistance-rrweb-cdn')).toHaveLength(1)
    expect(document.querySelectorAll('#assistance-rrweb-local')).toHaveLength(1)
  })

  it('falls back when a loaded script does not register window.rrweb.record', async () => {
    const resultPromise = loadRrwebResource({ warn: vi.fn() })
    getScript('assistance-rrweb-cdn')?.dispatchEvent(new Event('load'))

    await vi.waitFor(() => expect(getScript('assistance-rrweb-local')).not.toBeNull())
    getScript('assistance-rrweb-local')?.dispatchEvent(new Event('load'))

    await expect(resultPromise).resolves.toMatchObject({ status: 'unavailable' })
  })
})
