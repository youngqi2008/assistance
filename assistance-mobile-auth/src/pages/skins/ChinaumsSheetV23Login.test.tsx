import { fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ChinaumsSheetV23Login } from './ChinaumsSheetV23Login'
import type { IdentityLoginSkinProps } from './identityLoginShared'

const v23Css = readFileSync(resolve(process.cwd(), 'src/pages/skins/chinaumsSheetV23.css'), 'utf8')

function createProps(overrides: Partial<IdentityLoginSkinProps> = {}): IdentityLoginSkinProps {
  return {
    topImage: null,
    bottomImage: null,
    idLast4: '',
    heightMode: 'auto',
    contentMeasureRef: createRef<HTMLElement | null>(),
    keyboardVisible: true,
    toast: null,
    authorizeDisabled: false,
    authorizing: false,
    sdkSubmitActive: true,
    controlReady: true,
    sdkLoadState: 'ready',
    sdkErrorKind: null,
    sdkErrorText: null,
    sdkErrorCode: null,
    sdkErrorSteps: null,
    sdkErrorVisible: false,
    useCustomKeyboard: true,
    nativeInputFocusColor: '#ff4a19',
    showCloseControl: true,
    themeColor: '#ff4a19',
    uiConfig: {},
    customAgreementChecks: {},
    onContentSizeChange: vi.fn(),
    onIdLast4Change: vi.fn(),
    onNativeInputFocus: vi.fn(),
    onNativeInputBlur: vi.fn(),
    onAuthorize: vi.fn(),
    onClose: vi.fn(),
    onRetry: vi.fn(),
    onToggleCustomAgreement: vi.fn(),
    onOpenCustomAgreement: vi.fn(),
    ...overrides,
  }
}

describe('ChinaumsSheetV23Login', () => {
  it('mounts the Yuanbao error row only when needed and removes it after valid input', () => {
    const props = createProps({ enableYuanbaoFeedback: true })
    const { container, rerender } = render(<ChinaumsSheetV23Login {...props} />)
    expect(container.querySelector('.chinaums-v23-inline-error')).toBeNull()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    rerender(<ChinaumsSheetV23Login {...props} inputError="incomplete" />)
    expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
    rerender(<ChinaumsSheetV23Login {...props} idLast4="1234" inputError={null} />)
    expect(container.querySelector('.chinaums-v23-inline-error')).toBeNull()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    rerender(<ChinaumsSheetV23Login {...createProps({ enableZidingyiFeedback: true })} />)
    expect(container.querySelector('.chinaums-v23-inline-error')).toBeNull()
  })

  it('isolates Yuanbao error and hand states, including hidden keyboard and loading', () => {
    const props = createProps({ enableYuanbaoFeedback: true, idLast4: '123X' })
    const { rerender, unmount } = render(<ChinaumsSheetV23Login {...props} />)
    expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'true')
    for (const state of [{ inputError: 'incomplete' as const }, { toast: { title: '请稍后重试' } }, { authorizeDisabled: true }, { authorizing: true }, { keyboardVisible: false }, { controlReady: false }]) {
      rerender(<ChinaumsSheetV23Login {...props} {...state} />)
      expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'false')
    }
    rerender(<ChinaumsSheetV23Login {...props} inputError="incomplete" />)
    expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
    unmount()
  })
  it('uses formHeaderImg first and falls back to the bundled V23 header on load failure', () => {
    render(
      <ChinaumsSheetV23Login
        {...createProps({
          formHeaderImg: 'https://cdn.example.com/customer-header.png',
        })}
      />,
    )

    const header = screen.getByRole('img', { name: '输入您的身份证后四位' })
    expect(header).toHaveAttribute('src', 'https://cdn.example.com/customer-header.png')
    fireEvent.error(header)
    expect(header.getAttribute('src')).toContain('header.png')
  })

  it('mounts the official submit slot inside the only V23 CTA without a React login button', () => {
    const { container } = render(<ChinaumsSheetV23Login {...createProps()} />)

    for (const slotId of [
      'ydrzPhoneControl',
      'ydrzStateControl',
      'ydrzAgreementControl',
      'ydrzTipsControl',
      'ydrzSubmitControl',
    ]) {
      expect(container.querySelector(`#${slotId}`)).not.toBeNull()
    }
    const cta = screen.getByTestId('chinaums-v23-submit')
    expect(cta).toContainElement(container.querySelector('#ydrzSubmitControl'))
    expect(container.querySelector('.chinaums-v23-provider-submit')).toBeNull()
    expect(screen.queryByRole('button', { name: '同意并登录' })).not.toBeInTheDocument()
  })

  it('accepts sequential 0-9/X input, deletes backward and shows the hand only at four characters', () => {
    const onIdLast4Change = vi.fn()
    const { rerender } = render(
      <ChinaumsSheetV23Login {...createProps({ idLast4: '12', onIdLast4Change })} />,
    )

    fireEvent.click(screen.getByRole('button', { name: '输入 X' }))
    expect(onIdLast4Change).toHaveBeenLastCalledWith('12X')
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    expect(onIdLast4Change).toHaveBeenLastCalledWith('1')
    expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'false')

    rerender(<ChinaumsSheetV23Login {...createProps({ idLast4: '12X9', onIdLast4Change })} />)
    expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'true')
  })

  it('applies the approved feedback only when the real appId enables it and keeps all 12 keys', () => {
    const feedbackProps = {
      ...createProps({ idLast4: '12' }),
      enableZidingyiFeedback: true,
    } as IdentityLoginSkinProps
    const { rerender } = render(<ChinaumsSheetV23Login {...feedbackProps} />)

    const root = screen.getByTestId('chinaums-sheet-v23-root')
    expect(root).toHaveAttribute('data-zidingyi-feedback', 'true')
    expect(screen.getByLabelText('身份证后四位第 3 位')).toContainElement(
      screen.getByTestId('chinaums-v23-id-caret'),
    )
    expect(screen.getByLabelText('安全键盘').querySelectorAll('button')).toHaveLength(12)
    expect(v23Css).toContain(
      ".chinaums-sheet-v23[data-zidingyi-feedback='true'] .chinaums-v23-id-box",
    )
    expect(v23Css).toContain('color: #333333')
    expect(v23Css).toContain(
      ".chinaums-sheet-v23[data-zidingyi-feedback='true'] .chinaums-v23-agreements",
    )
    expect(v23Css).toContain('font-weight: 700 !important')
    expect(v23Css).toContain('animation: chinaums-v23-hand-tap 1.2s ease-in-out infinite')
    expect(v23Css).toContain('transform: translateY(0.517241cqi) scale(0.96)')

    rerender(<ChinaumsSheetV23Login {...createProps({ idLast4: '12' })} />)
    expect(screen.getByTestId('chinaums-sheet-v23-root')).not.toHaveAttribute(
      'data-zidingyi-feedback',
    )
    expect(screen.queryByTestId('chinaums-v23-id-caret')).not.toBeInTheDocument()
    expect(screen.getByLabelText('安全键盘').querySelectorAll('button')).toHaveLength(12)
  })

  it('hides the target hand while the SDK submit path is disabled', () => {
    const feedbackProps = {
      ...createProps({ idLast4: '1234', authorizeDisabled: true }),
      enableZidingyiFeedback: true,
    } as IdentityLoginSkinProps

    render(<ChinaumsSheetV23Login {...feedbackProps} />)

    expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'false')
  })

  it('keeps the virtual keyboard visible and locks it while the login gate is pending', () => {
    render(
      <ChinaumsSheetV23Login
        {...createProps({
          idLast4: '1234',
          keyboardVisible: false,
          authorizing: true,
        })}
      />,
    )

    expect(screen.getByLabelText('安全键盘')).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByRole('button', { name: '输入 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled()
    expect(screen.getByRole('status', { name: '加载中' })).toBeInTheDocument()
    expect(screen.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'false')
  })

  it('keeps the Yuanbao submit slot mounted with inline pending text and a usable X', () => {
    const onClose = vi.fn()
    const onIdLast4Change = vi.fn()
    const props = createProps({
      enableYuanbaoFeedback: true,
      idLast4: '123X',
      onClose,
      onIdLast4Change,
    })
    const { container, rerender } = render(<ChinaumsSheetV23Login {...props} />)
    const slot = container.querySelector('#ydrzSubmitControl')!
    const official = document.createElement('button')
    official.textContent = '同意并登录'
    slot.appendChild(official)
    const onOfficialClick = vi.fn()
    official.addEventListener('click', onOfficialClick)
    fireEvent.click(official)
    expect(onOfficialClick).toHaveBeenCalledOnce()

    rerender(<ChinaumsSheetV23Login {...props} authorizing authorizeDisabled />)

    const pending = screen.getByRole('status', { name: '加载中' })
    expect(pending).toHaveTextContent('同意并登录')
    expect(pending.querySelector('img')?.getAttribute('src')).toContain('yuanbao-loading.gif')
    expect(container.querySelector('.chinaums-v23-loading-card')).toBeNull()
    expect(container.querySelector('#ydrzSubmitControl')).toBe(slot)
    expect(slot.firstChild).toBe(official)
    expect(screen.getByTestId('chinaums-v23-submit')).not.toHaveAttribute('inert')
    fireEvent.click(official)
    expect(onOfficialClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: '输入 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '选择其他方式' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '输入 1' }))
    expect(onIdLast4Change).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onClose).toHaveBeenCalledOnce()

    rerender(<ChinaumsSheetV23Login {...props} />)
    expect(screen.queryByRole('status', { name: '加载中' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '选择其他方式' })).toBeEnabled()
    expect(slot.firstChild).toBe(official)
    fireEvent.click(official)
    expect(onOfficialClick).toHaveBeenCalledTimes(2)
  })

  it('renders the exact incomplete-input error without disabling or replacing the official slot', () => {
    const { rerender } = render(
      <ChinaumsSheetV23Login
        {...createProps({
          idLast4: '123',
          toast: { title: '请完整输入身份证后4位数字', icon: '!' },
        })}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('请完整输入身份证后4位数字')
    expect(screen.getByTestId('chinaums-v23-submit')).toContainElement(
      document.getElementById('ydrzSubmitControl'),
    )
    expect(screen.getByTestId('chinaums-v23-submit')).not.toHaveAttribute('inert')
    expect(screen.queryByRole('button', { name: '同意并登录' })).not.toBeInTheDocument()

    rerender(
      <ChinaumsSheetV23Login
        {...createProps({
          idLast4: '1234',
          authorizeDisabled: true,
        })}
      />,
    )
    expect(screen.getByTestId('chinaums-v23-submit')).toHaveAttribute('inert')
  })

  it('uses the Figma normal and active input states, then applies and clears error state', () => {
    const { container, rerender } = render(<ChinaumsSheetV23Login {...createProps()} />)
    const dialog = container.querySelector<HTMLElement>('.chinaums-v23-dialog')!
    const boxes = container.querySelectorAll<HTMLElement>('.chinaums-v23-id-box')

    expect(dialog).toHaveAttribute('data-error', 'false')
    expect(boxes).toHaveLength(4)
    expect(boxes[0]).toHaveAttribute('data-active', 'true')
    expect(v23Css).toContain('background: #fef9f5')
    expect(v23Css).toContain('border-color: #ffbb6d')

    rerender(
      <ChinaumsSheetV23Login
        {...createProps({
          idLast4: '12',
          toast: { title: '请完整输入身份证后4位数字', icon: '!' },
        })}
      />,
    )
    expect(dialog).toHaveAttribute('data-error', 'true')
    expect(v23Css).toContain('background: #fff5f5')
    expect(v23Css).toContain('border-color: #ff6d6d')

    rerender(<ChinaumsSheetV23Login {...createProps({ idLast4: '123' })} />)
    expect(dialog).toHaveAttribute('data-error', 'false')
  })

  it('renders one responsive card and an edge-to-edge four-row keyboard', () => {
    const { container } = render(<ChinaumsSheetV23Login {...createProps()} />)
    const keyboard = screen.getByLabelText('安全键盘')

    expect(container.querySelectorAll('.chinaums-v23-dialog')).toHaveLength(1)
    expect(v23Css).toContain('container-type: size')
    expect(v23Css).toContain('container-type: inline-size')
    expect(v23Css).toContain('--v23-dialog-width:')
    expect(v23Css).toContain('--v23-keyboard-height:')
    expect(v23Css).toContain('padding-inline: 1.433692cqw')
    expect(v23Css.split('/* Yuanbao feedback')[0]).not.toMatch(/\d+(?:\.\d+)?px\b/)
    expect(keyboard).toHaveClass('chinaums-v23-figma-keyboard')
    expect(container.querySelectorAll('.chinaums-v23-key')).toHaveLength(12)
    expect(container.querySelector('.chinaums-v23-key[data-key="delete"] svg')).not.toBeNull()
    expect(keyboard.querySelectorAll('button')).toHaveLength(12)
  })

  it('publishes measured one-percent units for Chromium 98 container-unit fallbacks', () => {
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    rectSpy.mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('chinaums-v23-stage-host')) {
        return { width: 390, height: 844 } as DOMRect
      }
      if (this.classList.contains('chinaums-v23-dialog')) {
        return { width: 290, height: 360 } as DOMRect
      }
      if (this.classList.contains('chinaums-v23-keyboard')) {
        return { width: 390, height: 296 } as DOMRect
      }
      return { width: 0, height: 0 } as DOMRect
    })

    const { container, unmount } = render(<ChinaumsSheetV23Login {...createProps()} />)
    const stageHost = container.querySelector<HTMLElement>('.chinaums-v23-stage-host')!
    const dialog = container.querySelector<HTMLElement>('.chinaums-v23-dialog')!
    const keyboard = container.querySelector<HTMLElement>('.chinaums-v23-keyboard')!

    expect(stageHost.style.getPropertyValue('--v23-stage-cqw')).toBe('3.9px')
    expect(stageHost.style.getPropertyValue('--v23-stage-cqh')).toBe('8.44px')
    expect(dialog.style.getPropertyValue('--v23-dialog-cqi')).toBe('2.9px')
    expect(keyboard.style.getPropertyValue('--v23-keyboard-cqw')).toBe('3.9px')
    expect(keyboard.style.getPropertyValue('--v23-keyboard-cqh')).toBe('2.96px')
    expect(v23Css).toContain('transform: translateX(-50%)')
    expect(v23Css).not.toContain('translate: -50% 0')

    unmount()
    rectSpy.mockRestore()
  })

  it('closes through both X and 选择其他方式', () => {
    const onClose = vi.fn()
    render(<ChinaumsSheetV23Login {...createProps({ onClose })} />)

    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    fireEvent.click(screen.getByRole('button', { name: '选择其他方式' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
