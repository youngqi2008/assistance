import type { ReactNode } from 'react'

import { sdkControlSlotMap } from '../../sdk/slots'
import type { NormalizedAssistanceMobileAuthUiConfig } from '../../wrapper/uiConfig'
import { createConfiguredTextStyle } from './identityLoginShared'

export interface DefaultAgreementDisplayProps {
  themeColor: string
  uiConfig: NormalizedAssistanceMobileAuthUiConfig
  customAgreementChecks: Record<number, boolean>
  onToggleCustomAgreement(index: number): void
  onOpenCustomAgreement(url: string): void
  children?: ReactNode
}

/**
 * The default agreement DOM is shared verbatim with skins that must retain the
 * existing SDK agreement/tips slots and caller-provided agreement behaviour.
 */
export function DefaultAgreementDisplay({
  themeColor,
  uiConfig,
  customAgreementChecks,
  onToggleCustomAgreement,
  onOpenCustomAgreement,
  children,
}: DefaultAgreementDisplayProps) {
  const footerNote = uiConfig.texts?.footerNote
  const customAgreements = uiConfig.agreements ?? []

  return (
    <section
      className="w-full px-1 text-[12px] leading-5 text-[#8A8F98]"
      data-slot="agreement"
      data-testid="compact-agreement-panel"
      aria-label="协议说明"
    >
      <div className="compact-agreement-copy">
        <div id={sdkControlSlotMap.agreement} data-sdk-control-slot="agreement" />
        <div id={sdkControlSlotMap.tips} data-sdk-control-slot="tips" className="w-full" />
      </div>

      {customAgreements.map((agreement, index) => {
        const checked = customAgreementChecks[index] === true
        const checkboxId = `custom-agreement-${index}`

        return (
          <div
            key={`${agreement.title}-${agreement.url}-${index}`}
            className="mt-2 flex items-start gap-2 leading-5"
            data-testid={`custom-agreement-row-${index}`}
          >
            <input
              id={checkboxId}
              type="checkbox"
              checked={checked}
              onChange={() => onToggleCustomAgreement(index)}
              aria-label={checked ? `已同意${agreement.title}` : `同意${agreement.title}`}
              className="mt-1 shrink-0"
              style={{ accentColor: themeColor }}
            />
            <span>
              <label htmlFor={checkboxId}>已阅读并同意</label>
              <button
                type="button"
                className="inline text-left"
                style={{ color: themeColor }}
                onClick={() => onOpenCustomAgreement(agreement.url)}
              >
                {agreement.title}
              </button>
            </span>
          </div>
        )
      })}

      {footerNote?.text ? (
        <p
          className="mt-3 leading-5"
          style={createConfiguredTextStyle(footerNote, { fontSize: '12px', color: '#9aa0a6', bold: false })}
        >
          {footerNote.text}
        </p>
      ) : null}

      {children}
    </section>
  )
}
