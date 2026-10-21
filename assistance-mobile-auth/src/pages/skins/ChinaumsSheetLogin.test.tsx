import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ChinaumsSheetLogin } from './ChinaumsSheetLogin'
import type { IdentityLoginSkinProps } from './identityLoginShared'

function createProps(overrides: Partial<IdentityLoginSkinProps> = {}): IdentityLoginSkinProps {
  return {
    topImage: null,
    bottomImage: null,
    idLast4: '',
    heightMode: 'auto',
    contentMeasureRef: createRef<HTMLElement | null>(),
    keyboardVisible: false,
    toast: null,
    authorizeDisabled: true,
    authorizing: false,
    sdkSubmitActive: false,
    controlReady: true,
    sdkLoadState: 'ready',
    sdkErrorKind: null,
    sdkErrorText: null,
    sdkErrorCode: null,
    sdkErrorSteps: null,
    sdkErrorVisible: false,
    useCustomKeyboard: true,
    nativeInputFocusColor: '#f75110',
    showCloseControl: true,
    themeColor: '#f75110',
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

describe('ChinaumsSheetLogin', () => {
  it('渲染两段式主标题与掩码手机号副标题结构', () => {
    render(<ChinaumsSheetLogin {...createProps()} />)
    // 两段式标题（两个 span），accessible name 计算可能在段间插入空格，用正则容错
    const heading = screen.getByRole('heading', { name: /输入您的\s*身份证后四位/ })
    expect(heading).toBeInTheDocument()
    expect(screen.getByTestId('chinaums-phone-subtitle')).toHaveTextContent('用于验证您')
    expect(screen.getByTestId('chinaums-phone-subtitle')).toHaveTextContent('的实名信息')
  })

  it('ready 态渲染四分格输入', () => {
    render(<ChinaumsSheetLogin {...createProps()} />)
    expect(screen.getByLabelText('身份证后四位第 1 位')).toBeInTheDocument()
    expect(screen.getByLabelText('身份证后四位第 4 位')).toBeInTheDocument()
  })

  it('SDK 全部 slots 常驻 DOM（loading 态也不缺）', () => {
    const { container } = render(
      <ChinaumsSheetLogin {...createProps({ sdkLoadState: 'loading', controlReady: false })} />,
    )
    for (const slotId of [
      'ydrzPhoneControl',
      'ydrzStateControl',
      'ydrzAgreementControl',
      'ydrzTipsControl',
      'ydrzSubmitControl',
    ]) {
      expect(container.querySelector(`#${slotId}`)).not.toBeNull()
    }
  })

  it('兜底授权按钮按 authorizeDisabled 禁用，可点击时触发 onAuthorize', () => {
    const onAuthorize = vi.fn()
    const { rerender } = render(
      <ChinaumsSheetLogin {...createProps({ authorizeDisabled: true, onAuthorize })} />,
    )
    const button = screen.getByRole('button', { name: '同意并授权' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onAuthorize).not.toHaveBeenCalled()

    rerender(<ChinaumsSheetLogin {...createProps({ authorizeDisabled: false, onAuthorize })} />)
    fireEvent.click(screen.getByRole('button', { name: '同意并授权' }))
    expect(onAuthorize).toHaveBeenCalledTimes(1)
  })

  it('sdkSubmitActive 时隐藏兜底按钮、展示 SDK submit 壳', () => {
    render(<ChinaumsSheetLogin {...createProps({ sdkSubmitActive: true })} />)
    expect(screen.queryByRole('button', { name: '同意并授权' })).not.toBeInTheDocument()
    expect(document.querySelector('.chinaums-submit-shell #ydrzSubmitControl')).not.toBeNull()
  })

  it('X 关闭按钮触发 onClose；showCloseControl=false 时不渲染', () => {
    const onClose = vi.fn()
    const { rerender } = render(<ChinaumsSheetLogin {...createProps({ onClose })} />)
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(<ChinaumsSheetLogin {...createProps({ showCloseControl: false })} />)
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
  })

  it('安全键盘含 X 键，点击写入 idLast4', () => {
    const onIdLast4Change = vi.fn()
    render(
      <ChinaumsSheetLogin
        {...createProps({ keyboardVisible: true, idLast4: '12', onIdLast4Change })}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '输入 X' }))
    expect(onIdLast4Change).toHaveBeenCalledWith('12X')
  })

  it('useCustomKeyboard=false 时聚焦真实 text input，并把 12x9 归一化为 12X9', () => {
    const onIdLast4Change = vi.fn()
    render(
      <ChinaumsSheetLogin
        {...createProps({ useCustomKeyboard: false, onIdLast4Change })}
      />,
    )

    const input = screen.getByRole('textbox', { name: '身份证后四位' })
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'text')
    fireEvent.click(screen.getByRole('group', { name: '身份证后四位输入' }))
    expect(input).toHaveFocus()
    fireEvent.change(input, { target: { value: '12x9' } })
    expect(onIdLast4Change).toHaveBeenLastCalledWith('12X9')
    expect(screen.queryByRole('button', { name: '输入 X' })).not.toBeInTheDocument()
  })

  it('系统键盘输入组件 ready 后只自动聚焦一次，blur 后不抢回焦点', () => {
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
    const { rerender } = render(
      <ChinaumsSheetLogin {...createProps({ useCustomKeyboard: false })} />,
    )

    const input = screen.getByRole('textbox', { name: '身份证后四位' })
    expect(input).toHaveFocus()
    expect(focusSpy).toHaveBeenCalledTimes(1)

    rerender(
      <ChinaumsSheetLogin
        {...createProps({ useCustomKeyboard: false, idLast4: '1' })}
      />,
    )
    expect(focusSpy).toHaveBeenCalledTimes(1)

    fireEvent.blur(input)
    rerender(
      <ChinaumsSheetLogin
        {...createProps({ useCustomKeyboard: false, idLast4: '12' })}
      />,
    )
    expect(focusSpy).toHaveBeenCalledTimes(1)
    focusSpy.mockRestore()
  })

  it('同一弹窗在 ready 重新出现输入组件后不再次自动聚焦', () => {
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
    const onNativeInputFocus = vi.fn()
    const onNativeInputBlur = vi.fn()
    const { rerender } = render(
      <ChinaumsSheetLogin
        {...createProps({ useCustomKeyboard: false, onNativeInputFocus, onNativeInputBlur })}
      />,
    )

    expect(focusSpy).toHaveBeenCalledTimes(1)
    expect(onNativeInputFocus).toHaveBeenCalledTimes(1)

    rerender(
      <ChinaumsSheetLogin
        {...createProps({
          useCustomKeyboard: false,
          sdkLoadState: 'loading',
          controlReady: false,
          onNativeInputFocus,
          onNativeInputBlur,
        })}
      />,
    )
    expect(screen.queryByRole('textbox', { name: '身份证后四位' })).not.toBeInTheDocument()
    expect(onNativeInputBlur).toHaveBeenCalledTimes(1)

    rerender(
      <ChinaumsSheetLogin
        {...createProps({ useCustomKeyboard: false, onNativeInputFocus, onNativeInputBlur })}
      />,
    )
    const retryInput = screen.getByRole('textbox', { name: '身份证后四位' })
    expect(retryInput).toBeInTheDocument()
    expect(focusSpy).toHaveBeenCalledTimes(1)
    expect(onNativeInputBlur).toHaveBeenCalledTimes(1)

    fireEvent.focus(retryInput)
    expect(onNativeInputFocus).toHaveBeenCalledTimes(2)
    focusSpy.mockRestore()
  })

  it('自定义键盘模式不尝试聚焦真实 input', () => {
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus')
    render(<ChinaumsSheetLogin {...createProps({ useCustomKeyboard: true })} />)

    expect(screen.queryByRole('textbox', { name: '身份证后四位' })).not.toBeInTheDocument()
    expect(focusSpy).not.toHaveBeenCalled()
    focusSpy.mockRestore()
  })

  it('提前挂载手指图片，第四位完成时切换为可见状态，删除后恢复隐藏', () => {
    const { rerender } = render(
      <ChinaumsSheetLogin {...createProps({ idLast4: '', useCustomKeyboard: false })} />,
    )
    const hand = screen.getByTestId('chinaums-hand-cue')

    expect(hand).toHaveAttribute('data-visible', 'false')
    expect(hand).toHaveAttribute('loading', 'eager')
    expect(hand).toHaveAttribute('fetchpriority', 'high')
    expect(hand).toHaveAttribute('decoding', 'async')

    for (const value of ['1', '12', '123']) {
      rerender(
        <ChinaumsSheetLogin {...createProps({ idLast4: value, useCustomKeyboard: false })} />,
      )
      expect(screen.getByTestId('chinaums-hand-cue')).toHaveAttribute('data-visible', 'false')
    }

    rerender(
      <ChinaumsSheetLogin {...createProps({ idLast4: '1234', useCustomKeyboard: false })} />,
    )
    expect(screen.getByTestId('chinaums-hand-cue')).toHaveAttribute('data-visible', 'true')

    rerender(
      <ChinaumsSheetLogin {...createProps({ idLast4: '123', useCustomKeyboard: false })} />,
    )
    expect(screen.getByTestId('chinaums-hand-cue')).toHaveAttribute('data-visible', 'false')
  })

  it('SDK 未 ready 时手指图片保持预载但不可见', () => {
    render(
      <ChinaumsSheetLogin
        {...createProps({
          idLast4: '1234',
          sdkLoadState: 'loading',
          controlReady: false,
        })}
      />,
    )

    expect(screen.getByTestId('chinaums-hand-cue')).toHaveAttribute('data-visible', 'false')
  })

  it.each([
    { sdkSubmitActive: true, expectedTag: 'DIV' },
    { sdkSubmitActive: false, expectedTag: 'BUTTON' },
  ] as const)('用同一图片壳承载 $expectedTag 提交路径', ({ sdkSubmitActive, expectedTag }) => {
    render(
      <ChinaumsSheetLogin
        {...createProps({ sdkSubmitActive, authorizeDisabled: false })}
      />,
    )
    const root = screen.getByTestId('chinaums-sheet-root')
    const shell = screen.getByTestId('chinaums-submit-shell')

    expect(root.getAttribute('style')).toContain('--chinaums-button-bg')
    expect(shell.tagName).toBe(expectedTag)
    expect(shell).toHaveClass('chinaums-submit-shell')
    expect(shell).toHaveClass(sdkSubmitActive ? 'chinaums-submit-sdk' : 'chinaums-submit-fallback')
  })

  it('caller 自定义协议仍渲染勾选行（authorize 门不死锁）', () => {
    const onToggleCustomAgreement = vi.fn()
    render(
      <ChinaumsSheetLogin
        {...createProps({
          uiConfig: { agreements: [{ title: '客户附加协议', url: 'https://example.com/x' }] },
          onToggleCustomAgreement,
        })}
      />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: '同意客户附加协议' }))
    expect(onToggleCustomAgreement).toHaveBeenCalledWith(0)
  })

  it('SDK 错误态渲染错误面板、折叠主内容', () => {
    render(
      <ChinaumsSheetLogin
        {...createProps({
          sdkErrorVisible: true,
          sdkErrorKind: 'network-timeout',
          sdkErrorText: '网络异常，请重试',
        })}
      />,
    )
    expect(screen.getByText('网络异常，请重试')).toBeInTheDocument()
    expect(screen.queryByLabelText('身份证后四位第 1 位')).not.toBeInTheDocument()
  })
})
