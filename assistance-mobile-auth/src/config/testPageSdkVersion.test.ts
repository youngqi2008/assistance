import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('test-page JSSDK version pin', () => {
  it('loads the fixed 0.2.3 UMD wrapper for every test-page action', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

    expect(html).toContain(
      '%BASE_URL%assist/0.2.3/assistance-mobile-auth/assistance-mobile-auth.0.2.3.umd.cjs',
    )
    expect(html).not.toContain(
      '%BASE_URL%assistance-mobile-auth/assistance-mobile-auth.umd.cjs',
    )
  })
})
