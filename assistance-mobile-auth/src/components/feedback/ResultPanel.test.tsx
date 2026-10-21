import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ResultPanel } from './ResultPanel'

describe('ResultPanel', () => {
  it('renders a token subsection with business-safe labels and never shows a raw token string', () => {
    const props: any = {
      tokenSection: {
        title: '授权凭证已接收',
        description: '授权已完成，系统将继续校验身份信息。',
        statusLabel: '凭证状态',
        summaryValue: '授权凭证已接收',
        rawToken: 'token-raw-secret-value',
      },
    }

    render(<ResultPanel {...props} />)

    expect(screen.getByRole('heading', { name: '查看授权结果' })).toBeInTheDocument()
    expect(screen.getAllByText('授权凭证已接收').length).toBeGreaterThan(0)
    expect(screen.getByText('凭证状态')).toBeInTheDocument()
    expect(screen.queryByText('token-raw-secret-value')).not.toBeInTheDocument()
  })

  it('renders identity fields in the approved order using display-ready masked values only', () => {
    const props: any = {
      identitySection: {
        title: '身份信息已返回',
        description: '授权结果已同步到当前页面。',
        fields: [
          { label: '姓名', value: '张三' },
          { label: '手机号', value: '138****0000' },
          { label: '身份证号', value: '110101********1234' },
        ],
      },
    }

    render(<ResultPanel {...props} />)

    const identitySection = screen.getByText('身份信息已返回').closest('section')
    const sectionText = identitySection?.textContent ?? ''

    expect(sectionText.indexOf('姓名')).toBeLessThan(sectionText.indexOf('手机号'))
    expect(sectionText.indexOf('手机号')).toBeLessThan(sectionText.indexOf('身份证号'))
    expect(screen.getByText('张三')).toBeInTheDocument()
    expect(screen.getByText('138****0000')).toBeInTheDocument()
    expect(screen.getByText('110101********1234')).toBeInTheDocument()
    expect(screen.queryByText('110101199001011234')).not.toBeInTheDocument()
  })

  it('renders one subordinate recovery action row for pending and failure states', () => {
    const pendingProps: any = {
      title: '结果处理中',
      description: '身份信息正在处理中，请稍后刷新结果。',
      action: { label: '刷新结果' },
    }

    const { rerender } = render(<ResultPanel {...pendingProps} />)

    expect(screen.getByRole('button', { name: '重新获取结果' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: '确认授权并继续' })).not.toBeInTheDocument()
    expect(screen.queryByText('DebugResponsePanel')).not.toBeInTheDocument()

    const failedProps: any = {
      title: '身份信息暂未返回',
      description: '当前服务繁忙，请稍后重试获取信息。',
      action: { label: '重试获取信息' },
    }

    rerender(<ResultPanel {...failedProps} />)

    expect(screen.getByRole('button', { name: '重新获取结果' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})
