import { describe, expect, it } from 'vitest'
import {
  USER_SERVICE_AGREEMENT_ENTRY_NAME,
  buildUserServiceAgreeArr,
  buildUserServiceChildArr,
} from './agreementAggregation'
import {
  ANXINGTIANXIA_V2_APP_ID,
  DONGFANGDADI_V2_APP_ID,
  HAIKE_V2_APP_ID,
  HENGDA_V2_APP_ID,
  TIANTIANYOUBAO_V2_APP_ID,
  YUANBAO_APP_ID,
} from './appAgreementRegistry'

describe('agreement aggregation', () => {
  it('uses optional custom resolver only for built-ins, preserving reserved external callers', () => {
    const resolve = (key: string) => `https://auth.example/reader?doc=${key}`
    expect(buildUserServiceAgreeArr('app', resolve)[0].link).toBe('https://auth.example/reader?doc=entry')
    const entries = buildUserServiceChildArr({ appId: HAIKE_V2_APP_ID, docUrlResolver: resolve,
      preserveReservedCallerAgreement: true, callerAgreements: [{ name: '《第三方共享个人信息清单》', link: 'https://customer.example/doc' }] })
    expect(entries[3].link).toBe('https://auth.example/reader?doc=haike-v2-third-party-sharing')
    expect(entries[4].link).toBe('https://customer.example/doc')
  })
  it('keeps the new Yuanbao identity in the same four agreement URLs', () => {
    const appId = '8a9481c79c05c8bd019ed8d49fb81df2'
    const entries = buildUserServiceChildArr({ appId })
    expect(entries).toHaveLength(4)
    expect(entries[3].link).toContain('doc=third-party-sharing-list')
    expect(entries.map(({ name }) => name)).toEqual(buildUserServiceChildArr({ appId: YUANBAO_APP_ID }).map(({ name }) => name))
    for (const entry of entries) expect(entry.link).toContain(`appId=${appId}`)
  })
  it('restores Yuanbao historical fourth agreement and preserves caller additions', () => {
    const entries = buildUserServiceChildArr({ appId: YUANBAO_APP_ID })
    expect(entries.map(({ name }) => name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
    expect(entries[3].link).toContain('doc=third-party-sharing-list')
    expect(entries[3].link).toContain(`appId=${YUANBAO_APP_ID}`)
    const external = { name: '《第三方共享个人信息清单》', link: 'https://merchant.example/privacy' }
    expect(buildUserServiceChildArr({ appId: YUANBAO_APP_ID, callerAgreements: [external], preserveReservedCallerAgreement: true }))
      .toEqual([...entries, external])
  })
  it('builds one first-level entry and preserves the trimmed appId in its url', () => {
    const agreeArr = buildUserServiceAgreeArr(` ${HAIKE_V2_APP_ID} `)

    expect(USER_SERVICE_AGREEMENT_ENTRY_NAME).toBe('《用户信息授权协议》')
    expect(agreeArr).toHaveLength(1)
    expect(agreeArr[0]).toMatchObject({ name: '《用户信息授权协议》' })
    expect(agreeArr[0]?.link).toContain('flow=agreement')
    expect(agreeArr[0]?.link).toContain('doc=entry')
    expect(agreeArr[0]?.link).toContain(`appId=${HAIKE_V2_APP_ID}`)
  })

  it('adds the Haike third-party list after the three fixed agreements', () => {
    const childArr = buildUserServiceChildArr({ appId: HAIKE_V2_APP_ID })

    expect(childArr.map((item) => item.name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
    expect(childArr[0]?.link).toContain('doc=user-auth-privacy-policy')
    expect(childArr[1]?.link).toContain('doc=personal-info-collection-list')
    expect(childArr[2]?.link).toContain('doc=sensitive-info-rules')
    expect(childArr[3]?.link).toContain('doc=haike-v2-third-party-sharing')
    for (const agreement of childArr) {
      expect(agreement.link).toContain(`appId=${HAIKE_V2_APP_ID}`)
    }
  })

  it('keeps only the three fixed agreements for the Tiantianyoubao appId', () => {
    const childArr = buildUserServiceChildArr({ appId: TIANTIANYOUBAO_V2_APP_ID })

    expect(childArr.map((item) => item.name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
    ])
    for (const agreement of childArr) {
      expect(agreement.link).toContain(`appId=${TIANTIANYOUBAO_V2_APP_ID}`)
    }
  })

  it('adds the Dongfangdadi third-party list after the three fixed agreements', () => {
    const childArr = buildUserServiceChildArr({ appId: DONGFANGDADI_V2_APP_ID })

    expect(childArr.map((item) => item.name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
    expect(childArr[3]?.link).toContain('doc=dongfangdadi-v2-third-party-sharing')
    for (const agreement of childArr) {
      expect(agreement.link).toContain(`appId=${DONGFANGDADI_V2_APP_ID}`)
    }
  })

  it('adds the Anxingtianxia third-party list after the three fixed agreements', () => {
    const childArr = buildUserServiceChildArr({ appId: ANXINGTIANXIA_V2_APP_ID })

    expect(childArr.map((item) => item.name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
    expect(childArr[3]?.link).toContain('doc=anxingtianxia-v2-third-party-sharing')
    for (const agreement of childArr) {
      expect(agreement.link).toContain(`appId=${ANXINGTIANXIA_V2_APP_ID}`)
    }
  })

  it('adds the Hengda third-party list after the three fixed agreements', () => {
    const childArr = buildUserServiceChildArr({ appId: HENGDA_V2_APP_ID })

    expect(childArr.map((item) => item.name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
    expect(childArr[3]?.link).toContain('doc=hengda-v2-third-party-sharing')
    for (const agreement of childArr) {
      expect(agreement.link).toContain(`appId=${HENGDA_V2_APP_ID}`)
    }
  })

  it.each([undefined, null, '', 'unknown-app'])('defaults to the generic fourth agreement for appId %s', (appId) => {
    const entries = buildUserServiceChildArr({ appId })
    expect(entries.map((item) => item.name)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
    expect(entries[3].link).toContain('doc=third-party-sharing-list')
  })

  it('appends other caller agreements after built-ins', () => {
    const childArr = buildUserServiceChildArr({
      appId: HAIKE_V2_APP_ID,
      callerAgreements: [
        { name: '《甲方协议》', link: 'https://x.example/a' },
      ],
    })

    expect(childArr.at(-1)).toEqual({
      name: '《甲方协议》',
      link: 'https://x.example/a',
    })
  })

  it.each([
    HAIKE_V2_APP_ID,
    TIANTIANYOUBAO_V2_APP_ID,
    DONGFANGDADI_V2_APP_ID,
    ANXINGTIANXIA_V2_APP_ID,
    HENGDA_V2_APP_ID,
    'unknown-app',
  ])(
    'filters the reserved third-party name for configured and unconfigured appId %s',
    (appId) => {
      const childArr = buildUserServiceChildArr({
        appId,
        callerAgreements: [
          { name: ' 《第三方共享个人信息清单》 ', link: 'https://x.example/override' },
          { name: '《甲方协议》', link: 'https://x.example/a' },
        ],
      })

      expect(childArr.filter((item) => item.name.trim() === '《第三方共享个人信息清单》'))
        .toHaveLength(
          appId === TIANTIANYOUBAO_V2_APP_ID ? 0 : 1,
        )
      expect(childArr.at(-1)).toEqual({
        name: '《甲方协议》',
        link: 'https://x.example/a',
      })
    },
  )

  it('omits appId from built-in links when it is empty', () => {
    for (const agreement of buildUserServiceChildArr()) {
      expect(agreement.link).not.toContain('appId=')
    }
  })
})
