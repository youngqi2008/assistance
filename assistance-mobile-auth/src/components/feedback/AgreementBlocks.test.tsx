import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { AgreementBlock } from '../../agreements/agreementContent'
import { AgreementBlocks } from './AgreementBlocks'

describe('AgreementBlocks', () => {
  it('opens a typed table document link through its callback', () => {
    const onOpenDoc = vi.fn()

    render(
      <AgreementBlocks
        blocks={[{
          kind: 'table',
          rows: [[{
            kind: 'doc-link',
            text: '《蓝鲸保隐私政策》',
            docKey: 'haike-v2-privacy-policy',
          }]],
        }]}
        onOpenDoc={onOpenDoc}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '《蓝鲸保隐私政策》' }))

    expect(onOpenDoc).toHaveBeenCalledWith('haike-v2-privacy-policy')
  })

  it('shows a safe fallback when a table document link cannot be opened', () => {
    render(
      <AgreementBlocks
        blocks={[{
          kind: 'table',
          rows: [[{
            kind: 'doc-link',
            text: '《蓝鲸保隐私政策》',
            docKey: 'haike-v2-privacy-policy',
          }]],
        }]}
      />,
    )

    expect(screen.getByText('协议不存在')).toBeInTheDocument()
  })

  it('renders a source merged table cell with its declared column span', () => {
    const blocks = [{
      kind: 'table',
      rows: [[{
        kind: 'text',
        text: '合作方',
        colSpan: 7,
      }]],
    }] as unknown as AgreementBlock[]

    render(<AgreementBlocks blocks={blocks} />)

    expect(screen.getByRole('cell', { name: '合作方' })).toHaveAttribute('colspan', '7')
  })
})
