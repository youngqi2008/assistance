import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const pageSource = readFileSync(resolve(process.cwd(), 'scripts/biz-debug.html'), 'utf8')

function extractCredentialPersistenceBlock() {
  const match = pageSource.match(/\/\/ ───── appId\/appKey 本地记忆 ─────(?<code>[\s\S]*?)\/\/ ───── appId\/appKey 本地记忆结束 ─────/)
  if (!match?.groups?.code) {
    throw new Error('biz-debug.html missing appId/appKey persistence block')
  }
  return match.groups.code
}

function createHarness(initialStorage = {}) {
  const elements = new Map()
  const storage = new Map(Object.entries(initialStorage))
  const listeners = new Map()

  const appId = {
    value: '',
    addEventListener(type, handler) {
      listeners.set(`appId:${type}`, handler)
    },
  }
  const appKey = {
    value: '',
    addEventListener(type, handler) {
      listeners.set(`appKey:${type}`, handler)
    },
  }
  elements.set('appId', appId)
  elements.set('appKey', appKey)

  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null
    },
    setItem(key, value) {
      storage.set(key, String(value))
    },
    removeItem(key) {
      storage.delete(key)
    },
  }

  const block = extractCredentialPersistenceBlock()
  new Function('$', 'localStorage', block)((id) => elements.get(id), localStorage)

  return { appId, appKey, storage, listeners }
}

describe('biz-debug credential localStorage persistence', () => {
  it('uses scoped storage keys for appId and appKey', () => {
    expect(pageSource).toContain('biz-debug:appId')
    expect(pageSource).toContain('biz-debug:appKey')
  })

  it('restores appId/appKey from localStorage on page load', () => {
    const { appId, appKey } = createHarness({
      'biz-debug:appId': 'stored-app-id',
      'biz-debug:appKey': 'stored-app-key',
    })

    expect(appId.value).toBe('stored-app-id')
    expect(appKey.value).toBe('stored-app-key')
  })

  it('saves edited appId/appKey values and removes cleared values', () => {
    const { appId, appKey, storage, listeners } = createHarness()

    appId.value = 'new-app-id'
    listeners.get('appId:input')()
    appKey.value = 'new-app-key'
    listeners.get('appKey:input')()

    expect(storage.get('biz-debug:appId')).toBe('new-app-id')
    expect(storage.get('biz-debug:appKey')).toBe('new-app-key')

    appKey.value = ''
    listeners.get('appKey:input')()
    expect(storage.has('biz-debug:appKey')).toBe(false)
  })
})
