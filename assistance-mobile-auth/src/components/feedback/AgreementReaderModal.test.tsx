import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AgreementReaderModal } from './AgreementReaderModal'
import type { AgreementDoc } from '../../agreements/agreementContent'

const sampleDoc: AgreementDoc = {
  title: '《示例协议》',
  blocks: [
    { kind: 'h1', text: '示例协议' },
    { kind: 'h2', text: '一、总则' },
    { kind: 'b', text: '加粗段落' },
    { kind: 'p', text: '普通正文段落。' },
    { kind: 'li', text: '列表项一' },
    { kind: 'table', rows: [['表头A', '表头B'], ['值1', '值2']] },
  ],
}

describe('AgreementReaderModal', () => {
  it('renders nothing when doc is null', () => {
    const { container } = render(<AgreementReaderModal doc={null} onClose={() => undefined} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the title and every block kind when a doc is provided', () => {
    render(<AgreementReaderModal doc={sampleDoc} onClose={() => undefined} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '《示例协议》' })).toBeInTheDocument()
    expect(screen.getByText('一、总则')).toBeInTheDocument()
    expect(screen.getByText('加粗段落')).toBeInTheDocument()
    expect(screen.getByText('普通正文段落。')).toBeInTheDocument()
    expect(screen.getByText('列表项一')).toBeInTheDocument()
    expect(screen.getByText('表头A')).toBeInTheDocument()
    expect(screen.getByText('值2')).toBeInTheDocument()
  })

  it('invokes onClose when the dismiss button is clicked', () => {
    const onClose = vi.fn()
    render(<AgreementReaderModal doc={sampleDoc} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: '我已阅读并知晓' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
