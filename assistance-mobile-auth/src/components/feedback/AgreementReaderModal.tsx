import type { AgreementDoc } from '../../agreements/agreementContent'
import { AgreementBlocks } from './AgreementBlocks'

interface Props {
  doc: AgreementDoc | null
  onClose(): void
}

export function AgreementReaderModal({ doc, onClose }: Props) {
  if (!doc) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agreement-reader-modal-title"
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 px-4 py-8 sm:items-center"
    >
      <div className="flex max-h-[82vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="shrink-0 px-5 pb-3 pt-5">
          <h2
            id="agreement-reader-modal-title"
            className="text-[16px] font-semibold leading-tight text-[var(--color-text-primary)]"
          >
            {doc.title}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <AgreementBlocks blocks={doc.blocks} />
        </div>

        <div className="shrink-0 border-t border-[#eef1f4] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#ff2d55] text-[15px] font-semibold text-white active:translate-y-px"
          >
            我已阅读并知晓
          </button>
        </div>
      </div>
    </div>
  )
}
