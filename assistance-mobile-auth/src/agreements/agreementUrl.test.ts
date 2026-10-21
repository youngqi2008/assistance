import { describe, expect, it } from 'vitest'
import type { AgreementDocKey } from './agreementContent'
import { buildAgreementDocUrl, buildAgreementEntryUrl } from './agreementUrl'
import { HAIKE_V2_APP_ID } from './appAgreementRegistry'

describe('buildAgreementDocUrl', () => {
  it('builds a same-origin url carrying the flow + doc params', () => {
    const url = buildAgreementDocUrl('sft')
    expect(url).toContain('flow=agreement')
    expect(url).toContain('doc=sft')
    expect(url).toContain(window.location.pathname)
    // 同源：以当前 origin 开头（jsdom 默认 http://localhost）
    expect(url.startsWith(window.location.origin)).toBe(true)
  })

  it('url-encodes special characters in the doc key', () => {
    // 运行期 key 均为 ASCII，但用含特殊字符的值锁定 encodeURIComponent 合约，防未来回归
    const url = buildAgreementDocUrl('a b/c' as AgreementDocKey)
    expect(url).toContain('doc=a%20b%2Fc')
  })

  it('builds the same-origin user service agreement entry url', () => {
    const url = buildAgreementEntryUrl()
    expect(url).toContain('flow=agreement')
    expect(url).toContain('doc=entry')
    expect(url).toContain(window.location.pathname)
    expect(url.startsWith(window.location.origin)).toBe(true)
  })

  it('preserves a trimmed appId on document and entry urls', () => {
    const docUrl = buildAgreementDocUrl('sft', '  app id/with spaces  ')
    const entryUrl = buildAgreementEntryUrl('  app id/with spaces  ')

    expect(docUrl).toContain('appId=app%20id%2Fwith%20spaces')
    expect(entryUrl).toContain('appId=app%20id%2Fwith%20spaces')
  })

  it.each([undefined, null, '', '   '])('omits an empty appId value: %j', (appId) => {
    expect(buildAgreementDocUrl('sft', appId)).not.toContain('appId=')
    expect(buildAgreementEntryUrl(appId)).not.toContain('appId=')
  })

  it('keeps Haike inline layout on generated same-origin agreement links', () => {
    window.history.replaceState(
      {},
      '',
      `/?appId=${HAIKE_V2_APP_ID}&layout=inline`,
    )

    expect(buildAgreementDocUrl('user-auth-privacy-policy', HAIKE_V2_APP_ID))
      .toContain('layout=inline')
    expect(buildAgreementEntryUrl(HAIKE_V2_APP_ID)).toContain('layout=inline')
  })
})
