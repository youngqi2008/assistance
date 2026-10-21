import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { ID_LAST4_LENGTH, SecureKeyboard, normalizeIdLast4Input } from './identityLoginShared'

describe('identityLoginShared', () => {
  it('ID_LAST4_LENGTH 为 4', () => {
    expect(ID_LAST4_LENGTH).toBe(4)
  })

  it('normalizeIdLast4Input 过滤非法字符、统一大写 X、截断到 4 位', () => {
    expect(normalizeIdLast4Input('ab12x')).toBe('12X')
    expect(normalizeIdLast4Input('123456')).toBe('1234')
    expect(normalizeIdLast4Input('98x7X')).toBe('98X7')
    expect(normalizeIdLast4Input('')).toBe('')
  })

  it('虚拟键盘使用 52px 到 56px 的响应式触控高度并避开底部系统安全区', () => {
    render(createElement(SecureKeyboard, {
      onInput: () => undefined,
      onDelete: () => undefined,
      visible: true,
    }))

    const keyboard = screen.getByLabelText('安全键盘')
    expect(keyboard).toHaveClass('max-h-[288px]')
    expect(keyboard).toHaveStyle({
      paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
    })
    const keys = screen.getAllByRole('button')
    expect(keys).toHaveLength(12)
    keys.forEach((key) => {
      expect(key).toHaveStyle({ height: 'clamp(52px, 6.5dvh, 56px)' })
    })
  })
})
