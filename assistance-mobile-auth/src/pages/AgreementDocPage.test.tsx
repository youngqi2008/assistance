import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgreementDocPage } from './AgreementDocPage'
import { buildUserServiceChildArr } from '../agreements/agreementAggregation'
import {
  DONGFANGDADI_V2_APP_ID,
  HAIKE_V2_APP_ID,
  HENGDA_V2_APP_ID,
  TIANTIANYOUBAO_V2_APP_ID,
} from '../agreements/appAgreementRegistry'

const originalLocation = window.location

function setDoc(key: string, extraParams: Record<string, string> = {}) {
  const params = new URLSearchParams({ flow: 'agreement', doc: key, ...extraParams })
  window.history.replaceState({}, '', `/?${params.toString()}`)
}

function mockWindowLocation(value: Partial<Location>) {
  const current = window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: current.href,
      origin: current.origin,
      pathname: current.pathname,
      search: current.search,
      assign: vi.fn(),
      replace: vi.fn(),
      ...value,
    },
    writable: true,
    configurable: true,
  })
}

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
    configurable: true,
  })
  window.history.replaceState({}, '', '/')
})

describe('AgreementDocPage', () => {
  it('scopes Yuanbao reader layout and clears its document marker on teardown', () => {
    setDoc('entry', { appId: '10037e6f9d903f86019ed8cfb6320365' })
    const { unmount } = render(<AgreementDocPage />)
    expect(document.documentElement).toHaveAttribute('data-assistance-yuanbao-feedback', 'true')
    expect(document.querySelector('.yuanbao-agreement-list')).toContainElement(screen.getByRole('list'))
    fireEvent.click(screen.getByRole('button', { name: '《敏感个人信息处理规则》' }))
    expect(screen.getByRole('button', { name: '返回协议列表' })).toBeInTheDocument()
    unmount()
    expect(document.documentElement).not.toHaveAttribute('data-assistance-yuanbao-feedback')
  })

  it('Yuanbao receives the complete SDK list without duplicate built-ins or losing same-title external callers', async () => {
    const appId = '10037e6f9d903f86019ed8cfb6320365'
    setDoc('entry', { appId })
    render(<AgreementDocPage />)
    const builtIn = buildUserServiceChildArr({ appId })
    await act(async () => {
      window.dispatchEvent(new MessageEvent('message', { data: { option: [...builtIn, { name: '《第三方共享个人信息清单》', link: 'https://merchant.example/privacy' }] } }))
    })
    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(screen.getAllByRole('button', { name: '《敏感个人信息处理规则》' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: '《第三方共享个人信息清单》' })).toHaveLength(2)
  })
  it('marks the document as an agreement flow so the iframe page can fill the SDK modal width', () => {
    setDoc('entry')
    render(<AgreementDocPage />)

    expect(document.documentElement).toHaveAttribute('data-app-flow', 'agreement')
  })

  it('renders the legacy SFT doc for compatibility', () => {
    setDoc('sft')
    render(<AgreementDocPage />)
    expect(screen.getByText('《收付通用户信息认证授权协议》')).toBeInTheDocument()
    expect(screen.getByText('用户信息认证授权协议')).toBeInTheDocument()
  })

  it('renders the legacy CMCC doc for compatibility', () => {
    setDoc('cmcc')
    render(<AgreementDocPage />)
    expect(screen.getByText('《中国移动认证梧桐数盾隐私政策》')).toBeInTheDocument()
  })

  it('renders built-in child agreements on the user information authorization entry page for doc=entry', () => {
    setDoc('entry')
    render(<AgreementDocPage />)
    expect(screen.queryByText('《用户信息授权协议》')).not.toBeInTheDocument()
    expect(screen.getByText('《敏感个人信息处理规则》')).toBeInTheDocument()
    expect(screen.queryByText('《第三方共享个人信息清单》')).toBeInTheDocument()
    expect(screen.getByText('《个人信息收集清单》')).toBeInTheDocument()
    expect(screen.getByText('《用户认证服务隐私政策》')).toBeInTheDocument()
    expect(screen.queryByText('请阅读以下协议内容。')).not.toBeInTheDocument()
  })

  it('renders built-in child agreements in the confirmed order without list divider classes', () => {
    setDoc('entry')
    render(<AgreementDocPage />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])

    const list = screen.getByRole('list')
    expect(list.className).not.toContain('divide-y')
    expect(list.className).not.toContain('border-y')
  })

  it('renders the Haike entry with its fourth third-party-sharing agreement', () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID })
    render(<AgreementDocPage />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])
  })

  it('renders the Tiantianyoubao entry without its third-party-sharing agreement', () => {
    setDoc('entry', { appId: TIANTIANYOUBAO_V2_APP_ID })
    render(<AgreementDocPage />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
    ])
    expect(screen.queryByText('《第三方共享个人信息清单》')).not.toBeInTheDocument()
  })

  it('renders the Dongfangdadi entry with its fourth third-party-sharing agreement', () => {
    setDoc('entry', { appId: DONGFANGDADI_V2_APP_ID })
    render(<AgreementDocPage />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])

    fireEvent.click(screen.getByRole('button', { name: '《第三方共享个人信息清单》' }))
    expect(screen.getByText('东方大地（武汉）保险经纪有限公司')).toBeInTheDocument()
    expect(screen.getByText('doc@dfdadi.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《隐私政策》' })).toBeInTheDocument()
  })

  it('renders the Anxingtianxia entry with four agreements and opens both nested privacy policies', () => {
    const appId = '8a9481c79c05c8bd019f8e3061ce25ee'
    setDoc('entry', { appId })
    render(<AgreementDocPage />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])

    fireEvent.click(screen.getByRole('button', { name: '《第三方共享个人信息清单》' }))
    expect(window.location.search).toContain('childDoc=anxingtianxia-v2-third-party-sharing')
    expect(screen.getByRole('button', { name: '《安行天下个人信息保护政策》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '《安行天下个人信息保护政策》' }))
    expect(window.location.search).toContain('nestedDoc=anxingtianxia-v2-privacy-policy')
    expect(screen.getByRole('heading', { name: '《安行天下个人信息保护政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))
    fireEvent.click(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' }))
    expect(window.location.search).toContain('nestedDoc=anxingtianxia-v2-cmcc-privacy-policy')
    expect(screen.getByRole('heading', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()
  })

  it('renders the Hengda entry with four agreements and opens both nested privacy policies', () => {
    setDoc('entry', { appId: HENGDA_V2_APP_ID })
    render(<AgreementDocPage />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      '《用户认证服务隐私政策》',
      '《个人信息收集清单》',
      '《敏感个人信息处理规则》',
      '《第三方共享个人信息清单》',
    ])

    fireEvent.click(screen.getByRole('button', { name: '《第三方共享个人信息清单》' }))
    expect(window.location.search).toContain('childDoc=hengda-v2-third-party-sharing')
    expect(screen.getByText('恒大保险经纪有限公司')).toBeInTheDocument()
    expect(screen.getByText('0769-33551837')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《恒大保险经纪隐私政策》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '《恒大保险经纪隐私政策》' }))
    expect(window.location.search).toContain('nestedDoc=hengda-v2-privacy-policy')
    expect(screen.getByRole('heading', { name: '《恒大保险经纪隐私政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))
    fireEvent.click(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' }))
    expect(window.location.search).toContain('nestedDoc=hengda-v2-cmcc-privacy-policy')
    expect(screen.getByRole('heading', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()
  })

  it('adds the default fourth agreement for an unconfigured app entry', () => {
    setDoc('entry', { appId: 'unknown-app' })
    render(<AgreementDocPage />)

    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.queryByText('《第三方共享个人信息清单》')).toBeInTheDocument()
  })

  it('appends child agreements sent by the mobile SDK iframe postMessage', async () => {
    setDoc('entry')
    render(<AgreementDocPage />)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          _type: 'agreement',
          option: [{ name: '《甲方协议》', link: 'https://x.example/a' }],
        },
      }))
    })

    await waitFor(() => {
      expect(screen.getByText('《甲方协议》')).toBeInTheDocument()
    })
  })

  it('keeps Haike inline built-ins once when the SDK sends its complete agreement list', async () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID, layout: 'inline' })
    render(<AgreementDocPage />)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          option: [
            'user-auth-privacy-policy',
            'personal-info-collection-list',
            'sensitive-info-rules',
            'haike-v2-third-party-sharing',
          ].map((doc) => ({
            name: `SDK ${doc}`,
            link: `/?flow=agreement&doc=${doc}&appId=${HAIKE_V2_APP_ID}&layout=inline`,
          })),
        },
      }))
    })

    await waitFor(() => {
      expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
        '《用户认证服务隐私政策》',
        '《个人信息收集清单》',
        '《敏感个人信息处理规则》',
        '《第三方共享个人信息清单》',
      ])
    })
  })

  it('uses a complete Haike inline SDK list to append only unique caller agreements in order', async () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID, layout: 'inline' })
    render(<AgreementDocPage />)

    const completeList = [
      { name: 'SDK 内置协议', link: `/?flow=agreement&doc=user-auth-privacy-policy&appId=${HAIKE_V2_APP_ID}&layout=inline` },
      { name: ' 《甲方协议》 ', link: 'https://caller.example/a' },
      { name: '《甲方协议》', link: 'https://caller.example/a' },
      { name: '《甲方协议》', link: 'https://caller.example/b' },
      { name: '《乙方协议》', link: '/caller-relative' },
    ]
    const postCompleteList = () => act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { option: completeList } }))
    })

    postCompleteList()
    postCompleteList()

    await waitFor(() => {
      expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
        '《用户认证服务隐私政策》',
        '《个人信息收集清单》',
        '《敏感个人信息处理规则》',
        '《第三方共享个人信息清单》',
        '《甲方协议》',
        '《甲方协议》',
        '《乙方协议》',
      ])
    })
  })

  it('keeps a Haike inline caller agreement whose built-in title has a different external URL', async () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID, layout: 'inline' })
    render(<AgreementDocPage />)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          option: [{
            name: '《第三方共享个人信息清单》',
            link: 'https://caller.example/third-party-sharing',
          }],
        },
      }))
    })

    await waitFor(() => {
      expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
        '《用户认证服务隐私政策》',
        '《个人信息收集清单》',
        '《敏感个人信息处理规则》',
        '《第三方共享个人信息清单》',
        '《第三方共享个人信息清单》',
      ])
    })
  })

  it('keeps the last valid Haike inline SDK list when an unrelated object message arrives', async () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID, layout: 'inline' })
    render(<AgreementDocPage />)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { option: [{ name: '《甲方协议》', link: 'https://caller.example/a' }] },
      }))
      window.dispatchEvent(new MessageEvent('message', { data: { _type: 'unrelated' } }))
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '《甲方协议》' })).toBeInTheDocument()
    })
  })

  it('clears Haike inline caller agreements when the SDK explicitly sends an empty list', async () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID, layout: 'inline' })
    render(<AgreementDocPage />)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { option: [{ name: '《甲方协议》', link: 'https://caller.example/a' }] },
      }))
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '《甲方协议》' })).toBeInTheDocument()
    })

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { option: [] } }))
    })
    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(4)
      expect(screen.queryByRole('button', { name: '《甲方协议》' })).not.toBeInTheDocument()
    })
  })

  it('does not treat a Haike modal SDK list as a complete inline list', async () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID })
    render(<AgreementDocPage />)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          option: [{
            name: 'SDK 内置协议',
            link: `/?flow=agreement&doc=user-auth-privacy-policy&appId=${HAIKE_V2_APP_ID}`,
          }],
        },
      }))
    })

    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(5)
    })
  })

  it('opens a new built-in child agreement in the entry iframe when tapped', () => {
    setDoc('entry')
    render(<AgreementDocPage />)

    fireEvent.click(screen.getByRole('button', { name: '《敏感个人信息处理规则》' }))

    expect(window.location.search).toContain('childDoc=sensitive-info-rules')
    expect(screen.getByRole('heading', { name: '《敏感个人信息处理规则》' })).toBeInTheDocument()
    expect(screen.getByText('敏感个人信息处理规则')).toBeInTheDocument()
  })

  it('opens both third-party table privacy policies as nested documents', () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID })
    render(<AgreementDocPage />)

    fireEvent.click(screen.getByRole('button', { name: '《第三方共享个人信息清单》' }))
    expect(screen.getByRole('button', { name: '《蓝鲸保隐私政策》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '《蓝鲸保隐私政策》' }))
    expect(window.location.search).toContain('childDoc=haike-v2-third-party-sharing')
    expect(window.location.search).toContain('nestedDoc=haike-v2-privacy-policy')
    expect(screen.getByRole('heading', { name: '《蓝鲸保隐私政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))
    fireEvent.click(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' }))
    expect(window.location.search).toContain('nestedDoc=haike-v2-cmcc-privacy-policy')
    expect(screen.getByRole('heading', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()
  })

  it('keeps the Tiantianyoubao third-party document available by direct childDoc URL', () => {
    setDoc('entry', {
      appId: TIANTIANYOUBAO_V2_APP_ID,
      childDoc: 'tiantianyoubao-v2-third-party-sharing',
    })
    render(<AgreementDocPage />)

    expect(screen.getByText('天天有保（湖南）保险经纪服务有限公司')).toBeInTheDocument()
    expect(screen.getByText('010-87227385')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《个人隐私协议》' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' }))
      .toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '《个人隐私协议》' }))
    expect(window.location.search).toContain(
      'childDoc=tiantianyoubao-v2-third-party-sharing',
    )
    expect(window.location.search).toContain(
      'nestedDoc=tiantianyoubao-v2-privacy-policy',
    )
    expect(screen.getByRole('heading', { name: '《个人隐私协议》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))
    fireEvent.click(
      screen.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' }),
    )
    expect(window.location.search).toContain(
      'nestedDoc=tiantianyoubao-v2-cmcc-privacy-policy',
    )
    expect(screen.getByRole('heading', {
      name: '《中国移动认证梧桐数盾隐私政策》',
    })).toBeInTheDocument()
  })

  it('returns from a nested privacy policy to the third-party table, then to the entry list', () => {
    setDoc('entry', { appId: HAIKE_V2_APP_ID })
    render(<AgreementDocPage />)

    fireEvent.click(screen.getByRole('button', { name: '《第三方共享个人信息清单》' }))
    fireEvent.click(screen.getByRole('button', { name: '《蓝鲸保隐私政策》' }))
    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))

    expect(window.location.search).not.toContain('nestedDoc=')
    expect(screen.getByRole('button', { name: '《蓝鲸保隐私政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))
    expect(window.location.search).not.toContain('childDoc=')
    expect(screen.getByRole('button', { name: '《第三方共享个人信息清单》' })).toBeInTheDocument()
  })

  it('restores nested agreement navigation from URL and popstate changes', () => {
    setDoc('entry', {
      appId: HAIKE_V2_APP_ID,
      childDoc: 'haike-v2-third-party-sharing',
      nestedDoc: 'haike-v2-cmcc-privacy-policy',
    })
    render(<AgreementDocPage />)

    expect(screen.getByRole('heading', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeInTheDocument()

    act(() => {
      window.history.pushState({}, '', `/?flow=agreement&doc=entry&appId=${HAIKE_V2_APP_ID}&childDoc=haike-v2-third-party-sharing`)
      window.dispatchEvent(new Event('popstate'))
    })

    expect(screen.queryByRole('heading', { name: '《中国移动认证梧桐数盾隐私政策》' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '《蓝鲸保隐私政策》' })).toBeInTheDocument()
  })

  it('fails safely for an unknown nested document key', () => {
    setDoc('entry', {
      appId: HAIKE_V2_APP_ID,
      childDoc: 'haike-v2-third-party-sharing',
      nestedDoc: 'not-a-document',
    })
    render(<AgreementDocPage />)

    expect(screen.getByText('协议不存在')).toBeInTheDocument()
  })

  it('fails safely when a known nested document is not linked by the selected child agreement', () => {
    setDoc('entry', {
      childDoc: 'sensitive-info-rules',
      nestedDoc: 'cmcc',
    })
    render(<AgreementDocPage />)

    expect(screen.getByText('协议不存在')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '《中国移动认证梧桐数盾隐私政策》' })).not.toBeInTheDocument()
  })

  it('returns from a built-in child agreement to the entry menu by removing childDoc', () => {
    setDoc('entry')
    render(<AgreementDocPage />)

    fireEvent.click(screen.getByRole('button', { name: '《敏感个人信息处理规则》' }))
    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))

    expect(window.location.search).not.toContain('childDoc=')
    expect(screen.queryByRole('heading', { name: '《敏感个人信息处理规则》' })).not.toBeInTheDocument()
    expect(screen.getByText('《用户认证服务隐私政策》')).toBeInTheDocument()
    expect(screen.getByText('《个人信息收集清单》')).toBeInTheDocument()
    expect(screen.getByText('《敏感个人信息处理规则》')).toBeInTheDocument()
    expect(screen.getByText('《第三方共享个人信息清单》')).toBeInTheDocument()
  })

  it('opens an entry child agreement directly from the childDoc query and can return to the menu', () => {
    setDoc('entry', { childDoc: 'user-auth-privacy-policy' })
    render(<AgreementDocPage />)

    expect(screen.getByRole('heading', { name: '《用户认证服务隐私政策》' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '返回协议列表' }))

    expect(window.location.search).not.toContain('childDoc=')
    expect(screen.queryByRole('heading', { name: '《用户认证服务隐私政策》' })).not.toBeInTheDocument()
    expect(screen.getByText('《用户认证服务隐私政策》')).toBeInTheDocument()
  })

  it('syncs the selected entry child agreement from popstate URL changes', () => {
    setDoc('entry')
    render(<AgreementDocPage />)

    act(() => {
      window.history.pushState({}, '', '/?flow=agreement&doc=entry&childDoc=sensitive-info-rules')
      window.dispatchEvent(new Event('popstate'))
    })

    expect(screen.getByRole('heading', { name: '《敏感个人信息处理规则》' })).toBeInTheDocument()

    act(() => {
      window.history.pushState({}, '', '/?flow=agreement&doc=entry')
      window.dispatchEvent(new Event('popstate'))
    })

    expect(screen.queryByRole('heading', { name: '《敏感个人信息处理规则》' })).not.toBeInTheDocument()
    expect(screen.getByText('《敏感个人信息处理规则》')).toBeInTheDocument()
  })

  it('treats caller agreements as external links', () => {
    setDoc('entry')
    mockWindowLocation({ href: window.location.href })
    render(<AgreementDocPage />)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          _type: 'agreement',
          option: [{ name: '《甲方协议》', link: 'https://x.example/a' }],
        },
      }))
    })

    fireEvent.click(screen.getByRole('button', { name: '《甲方协议》' }))

    expect(window.location.href).toBe('https://x.example/a')
  })

  it('renders a fallback empty state for an unknown doc', () => {
    setDoc('nope')
    render(<AgreementDocPage />)
    expect(screen.getByText('协议不存在')).toBeInTheDocument()
  })
})
