import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { HaikeInlineLogin } from './HaikeInlineLogin'
import type { IdentityLoginSkinProps } from './identityLoginShared'

const haikeCss = readFileSync(resolve(process.cwd(), 'src/pages/skins/haikeInline.css'), 'utf8')

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
    nativeInputFocusColor: '#f15a2a',
    showCloseControl: true,
    themeColor: '#f15a2a',
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

describe('HaikeInlineLogin', () => {
  it('renders the latest Figma module with official phone, four cells, CTA, hand and existing agreement seam', () => {
    const { container } = render(<HaikeInlineLogin {...createProps()} />)

    expect(screen.getAllByTestId('haike-inline-card')).toHaveLength(1)
    expect(screen.queryByRole('heading', { name: /输入本人\s*身份证后四位/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('保障开通进度')).not.toBeInTheDocument()
    expect(screen.getByTestId('haike-inline-phone')).toContainElement(
      document.getElementById('ydrzPhoneControl'),
    )

    expect(screen.getAllByLabelText(/身份证后四位第 \d 位/)).toHaveLength(4)
    expect(screen.getByTestId('haike-inline-submit')).toContainElement(
      document.getElementById('ydrzSubmitControl'),
    )
    expect(screen.getByTestId('haike-inline-submit')).toHaveTextContent('立即保障')
    expect(screen.getByTestId('haike-inline-hand')).toHaveAttribute('data-visible', 'true')
    expect(screen.getByTestId('compact-agreement-panel')).toContainElement(
      document.getElementById('ydrzAgreementControl'),
    )
    expect(screen.getByTestId('compact-agreement-panel')).toContainElement(
      document.getElementById('ydrzTipsControl'),
    )
    expect(container.querySelectorAll('.haike-inline-card')).toHaveLength(1)
  })

  it('renders the official phone slot but no close, other-method link or custom keyboard', () => {
    render(<HaikeInlineLogin {...createProps()} />)

    expect(screen.queryByText(/用于验证/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '选择其他方式' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('安全键盘')).not.toBeInTheDocument()
    expect(screen.getByTestId('haike-inline-phone')).toContainElement(
      document.getElementById('ydrzPhoneControl'),
    )
    expect(document.getElementById('ydrzStateControl')).toBeInTheDocument()
  })

  it('keeps agreement placement without overriding SDK agreement typography', () => {
    expect(haikeCss).toMatch(
      /\.haike-inline-agreements\s*\{[^}]*margin:\s*clamp\(0\.65rem,\s*3\.5cqi,\s*1rem\)\s+auto\s+0/s,
    )
    expect(haikeCss).not.toMatch(/\.haike-inline-agreements\s+(?:\.compact-agreement-copy|#ydrzAgreementControl|#ydrzTipsControl)/)
  })

  it('shows injected phone content while keeping state and SMS content hidden', () => {
    const { container } = render(<HaikeInlineLogin {...createProps()} />)
    const foldedSlots = container.querySelector<HTMLElement>('.haike-inline-folded-slots')!
    const phoneSlot = document.getElementById('ydrzPhoneControl')!
    const phoneContent = document.createElement('span')
    phoneContent.textContent = '138****8000'
    phoneContent.style.cssText = 'display:block !important; visibility:visible !important;'
    phoneSlot.appendChild(phoneContent)

    expect(screen.getByTestId('haike-inline-phone')).toContainElement(phoneContent)
    expect(screen.getByText('138****8000')).toBeVisible()
    expect(foldedSlots).not.toContainElement(phoneSlot)

    for (const slotId of [
      'ydrzStateControl',
      'ydrzYZMControl',
      'ydrzYZMBtnControl',
    ]) {
      const slot = document.getElementById(slotId)!
      const providerContent = document.createElement('span')
      providerContent.textContent = `${slotId}-provider-content`
      providerContent.style.cssText = 'display:block !important; visibility:visible !important; position:fixed !important;'
      slot.appendChild(providerContent)

      expect(slot).toBeInTheDocument()
      expect(foldedSlots).toContainElement(providerContent)
    }

    expect(foldedSlots).not.toBeVisible()
    expect(foldedSlots).toHaveAttribute('hidden')
    expect(haikeCss).toMatch(/\.haike-inline-folded-slots\s*\{[^}]*display:\s*none\s*!important/s)
    expect(foldedSlots).not.toContainElement(document.getElementById('ydrzAgreementControl'))
    expect(foldedSlots).not.toContainElement(document.getElementById('ydrzTipsControl'))
    expect(foldedSlots).not.toContainElement(document.getElementById('ydrzSubmitControl'))
  })

  it('uses a click-focused native input without autofocus and normalizes lowercase X, invalid text and max length', () => {
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
    const onIdLast4Change = vi.fn()
    render(<HaikeInlineLogin {...createProps({ onIdLast4Change })} />)

    const group = screen.getByRole('group', { name: '身份证后四位输入' })
    const input = within(group).getByRole('textbox', { name: '身份证后四位' })
    expect(input).not.toHaveAttribute('autofocus')
    expect(input).not.toHaveFocus()
    expect(focusSpy).not.toHaveBeenCalled()

    fireEvent.click(group)
    expect(input).toHaveFocus()
    fireEvent.change(input, { target: { value: 'ab12x9z8' } })
    expect(onIdLast4Change).toHaveBeenLastCalledWith('12X9')
    focusSpy.mockRestore()
  })

  it('shows empty, focus and filled cell states and keeps the hand visible in empty and filled ready states', () => {
    const { rerender } = render(<HaikeInlineLogin {...createProps()} />)
    expect(screen.getByLabelText('身份证后四位第 1 位')).toHaveAttribute('data-state', 'empty')
    expect(screen.getByTestId('haike-inline-hand')).toHaveAttribute('data-visible', 'true')

    fireEvent.focus(screen.getByRole('textbox', { name: '身份证后四位' }))
    expect(screen.getByLabelText('身份证后四位第 1 位')).toHaveAttribute('data-state', 'focus')

    rerender(<HaikeInlineLogin {...createProps({ idLast4: '12X9' })} />)
    expect(screen.getByLabelText('身份证后四位第 1 位')).toHaveAttribute('data-state', 'filled')
    expect(screen.getByLabelText('身份证后四位第 4 位')).toHaveAttribute('data-state', 'focus')
    expect(screen.getByTestId('haike-inline-hand')).toHaveAttribute('data-visible', 'true')
  })

  it('locks the native input and visual CTA while authorizing but keeps the ready-state hand visible', () => {
    const onIdLast4Change = vi.fn()
    render(
      <HaikeInlineLogin
        {...createProps({ idLast4: '1234', authorizing: true, onIdLast4Change })}
      />,
    )

    const input = screen.getByRole('textbox', { name: '身份证后四位' })
    expect(input).toBeDisabled()
    fireEvent.change(input, { target: { value: '9999' } })
    expect(onIdLast4Change).not.toHaveBeenCalled()
    expect(screen.getByTestId('haike-inline-submit')).toHaveAttribute('data-authorizing', 'true')
    expect(screen.getByTestId('haike-inline-submit')).toHaveAttribute('inert')
    expect(screen.getByTestId('haike-inline-hand')).toHaveAttribute('data-visible', 'true')
  })

  it('keeps the official CTA disabled until all four identity digits are present', () => {
    const { rerender } = render(
      <HaikeInlineLogin
        {...createProps({ idLast4: '123', authorizeDisabled: true })}
      />,
    )

    const submit = screen.getByTestId('haike-inline-submit')
    expect(submit).toHaveAttribute('data-disabled', 'true')
    expect(submit).toHaveAttribute('aria-disabled', 'true')
    expect(submit).toHaveAttribute('inert')

    rerender(
      <HaikeInlineLogin
        {...createProps({ idLast4: '1234', authorizeDisabled: false })}
      />,
    )
    expect(submit).toHaveAttribute('data-disabled', 'false')
    expect(submit).toHaveAttribute('aria-disabled', 'false')
    expect(submit).not.toHaveAttribute('inert')
  })

  it.each(['button', 'input', 'anchor', 'div', 'nested'] as const)(
    'keeps an injected %s provider control as the direct click target',
    (variant) => {
      const onAuthorize = vi.fn()
      render(<HaikeInlineLogin {...createProps({ onAuthorize })} />)
      const slot = document.getElementById('ydrzSubmitControl')!
      const clickTarget =
        variant === 'button'
          ? document.createElement('button')
          : variant === 'input'
            ? document.createElement('input')
            : variant === 'anchor'
              ? document.createElement('a')
              : document.createElement('div')
      const listener = vi.fn()

      if (variant === 'nested') {
        const nestedButton = document.createElement('button')
        nestedButton.addEventListener('click', listener)
        clickTarget.appendChild(nestedButton)
        slot.appendChild(clickTarget)
        fireEvent.click(nestedButton)
      } else {
        clickTarget.addEventListener('click', listener)
        slot.appendChild(clickTarget)
        fireEvent.click(clickTarget)
      }

      expect(listener).toHaveBeenCalledTimes(1)
      expect(onAuthorize).not.toHaveBeenCalled()
      expect(clickTarget.closest('#ydrzSubmitControl')).toBe(slot)
    },
  )

  it('keeps every SDK slot mounted during loading and renders loading/error/retry in the same card', () => {
    const { container, rerender } = render(
      <HaikeInlineLogin
        {...createProps({ sdkLoadState: 'loading', controlReady: false })}
      />,
    )

    for (const slotId of [
      'ydrzPhoneControl',
      'ydrzStateControl',
      'ydrzAgreementControl',
      'ydrzTipsControl',
      'ydrzSubmitControl',
      'ydrzYZMControl',
      'ydrzYZMBtnControl',
    ]) {
      expect(container.querySelector(`#${slotId}`)).not.toBeNull()
    }
    expect(screen.getByRole('region', { name: '加载中' })).toBeInTheDocument()
    expect(screen.getByTestId('haike-inline-card')).toContainElement(
      screen.getByRole('region', { name: '加载中' }),
    )

    rerender(
      <HaikeInlineLogin
        {...createProps({
          sdkErrorVisible: true,
          sdkErrorKind: 'network-timeout',
          sdkErrorText: '网络异常，请重试',
        })}
      />,
    )
    expect(screen.getByTestId('haike-inline-card')).toContainElement(
      screen.getByText('网络异常，请重试'),
    )
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument()
  })

  it('preserves the default agreement DOM order and caller agreement interactions below the CTA', () => {
    const onToggleCustomAgreement = vi.fn()
    const onOpenCustomAgreement = vi.fn()
    render(
      <HaikeInlineLogin
        {...createProps({
          uiConfig: {
            texts: { footerNote: { text: '客户页脚说明' } },
            agreements: [{ title: '《客户隐私政策》', url: 'https://merchant.example/privacy' }],
          },
          onToggleCustomAgreement,
          onOpenCustomAgreement,
        })}
      />,
    )

    const submit = screen.getByTestId('haike-inline-submit')
    const panel = screen.getByTestId('compact-agreement-panel')
    const agreementSlot = document.getElementById('ydrzAgreementControl')!
    const tipsSlot = document.getElementById('ydrzTipsControl')!
    const row = screen.getByTestId('custom-agreement-row-0')
    const footer = screen.getByText('客户页脚说明')
    expect(submit.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(agreementSlot.compareDocumentPosition(tipsSlot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(tipsSlot.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(row.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    fireEvent.click(screen.getByRole('checkbox', { name: '同意《客户隐私政策》' }))
    fireEvent.click(screen.getByRole('button', { name: '《客户隐私政策》' }))
    expect(onToggleCustomAgreement).toHaveBeenCalledWith(0)
    expect(onOpenCustomAgreement).toHaveBeenCalledWith('https://merchant.example/privacy')
  })

  it('uses fluid container-relative CSS without viewport-specific branches or a scaled design canvas', () => {
    expect(haikeCss).toContain('container-type: inline-size')
    expect(haikeCss).toContain('clamp(')
    expect(haikeCss).toContain('aspect-ratio: 12 / 13')
    expect(haikeCss).not.toContain('@media')
    expect(haikeCss).not.toMatch(/width:\s*(?:320|375|390|430)px/)
    expect(haikeCss).not.toMatch(/\.haike-inline-(?:login|measure|card)[^{]*\{[^}]*transform:\s*scale/s)
    expect(haikeCss).toMatch(/\.haike-inline-hand[^{]*\{[^}]*pointer-events:\s*none/s)
  })

  it('fills the fixed iframe card while using the corrected compact top inset', () => {
    expect(haikeCss).toMatch(/\.haike-inline-card\s*\{[^}]*min-height:\s*100dvh/s)
    expect(haikeCss).toMatch(/\.haike-inline-card\s*\{[^}]*padding:\s*clamp\([^)]*,\s*10cqi,\s*[^)]*\)/s)
    expect(haikeCss).not.toContain('36.5cqi')
  })
})
