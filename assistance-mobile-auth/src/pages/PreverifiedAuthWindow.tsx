import { useMemo, useState } from 'react'

import { AgreementReaderModal } from '../components/feedback/AgreementReaderModal'
import {
  CMCC_PRIVACY_AGREEMENT,
  SFT_USER_AUTH_AGREEMENT,
  type AgreementDoc,
} from '../agreements/agreementContent'
import { ASSISTANCE_AUTH_CANCEL, createAssistanceAuthMessage } from '../wrapper/verificationBridge'

const MASKED_PHONE = '182****5610'

export function PreverifiedAuthWindow() {
  const [agreementDoc, setAgreementDoc] = useState<AgreementDoc | null>(null)

  const assistanceAuthSessionId = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return new URLSearchParams(window.location.search).get('assistanceAuthSessionId') ?? ''
  }, [])

  function handleClose() {
    if (typeof window === 'undefined') {
      return
    }

    window.parent.postMessage(
      createAssistanceAuthMessage(ASSISTANCE_AUTH_CANCEL, assistanceAuthSessionId, { message: '用户取消验证' }),
      '*',
    )
  }

  function handleConfirm() {
    // 占位：本期仅 UI，按钮点击不接后端 / 不发 success bridge。
    console.info('[PreverifiedAuthWindow] 确认授权 clicked (placeholder)')
  }

  return (
    <main
      className="flex h-dvh min-h-0 flex-col bg-white text-[var(--color-text-primary)]"
      aria-label="确认身份信息"
    >
      <header className="grid min-h-11 shrink-0 grid-cols-[56px_1fr_56px] items-center px-6 pt-3">
        <button
          type="button"
          aria-label="关闭"
          onClick={handleClose}
          className="flex h-11 w-11 items-center justify-start text-[30px] leading-none text-[#111827]"
        >
          ×
        </button>
        <h1 className="text-center text-[22px] font-semibold leading-8">确认身份信息</h1>
        <span aria-hidden="true" />
      </header>

      <section className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-5 pt-8">
        <p
          className="w-full text-center text-[22px] font-semibold leading-tight text-[#0F172A]"
          aria-label={`手机号码 ${MASKED_PHONE}`}
        >
          {MASKED_PHONE}
        </p>

        <p className="mt-6 text-center text-[16px] leading-7 text-[var(--color-text-primary)]">
          您的身份证后四位已校验通过
        </p>

        <p className="mt-8 px-1 text-center text-[13px] leading-6 text-[var(--color-text-secondary)]">
          我已阅读并同意
          <button
            type="button"
            onClick={() => setAgreementDoc(SFT_USER_AUTH_AGREEMENT)}
            className="text-[#ff2d55] underline-offset-2 hover:underline"
          >
            {SFT_USER_AUTH_AGREEMENT.title}
          </button>
          <button
            type="button"
            onClick={() => setAgreementDoc(CMCC_PRIVACY_AGREEMENT)}
            className="text-[#ff2d55] underline-offset-2 hover:underline"
          >
            {CMCC_PRIVACY_AGREEMENT.title}
          </button>
        </p>
      </section>

      <div className="shrink-0 border-t border-[#edf0f2] bg-white px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
        <button
          type="button"
          onClick={handleConfirm}
          className="flex min-h-[52px] w-full items-center justify-center rounded-[10px] bg-[#ff2d55] px-4 text-[17px] font-semibold text-white shadow-[0_3px_0_rgba(191,23,65,0.28)] active:translate-y-px"
        >
          确认授权
        </button>
      </div>

      <AgreementReaderModal doc={agreementDoc} onClose={() => setAgreementDoc(null)} />
    </main>
  )
}
