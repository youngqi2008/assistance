import { sdkControlSlotMap } from '../../sdk/slots'
import { authReviewContent } from '../../lib/authReviewContent'

interface AgreementBlockProps {
  checked: boolean
  onCheckedChange(next: boolean): void
}

function openAgreement(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

export function AgreementBlock({ checked, onCheckedChange }: AgreementBlockProps) {
  return (
    <section className="px-1" data-slot="agreement" aria-labelledby="agreement-title">
      <h2 id="agreement-title" className="sr-only">
        {authReviewContent.sectionTitles.agreement}
      </h2>

      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        <input
          className="mt-1 h-5 w-5 rounded border border-[var(--color-border)] accent-[var(--color-brand)]"
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span>
          已阅读并同意
          <a href="#service-agreement" onClick={openAgreement} className="mx-1 font-medium text-[var(--color-brand)] underline underline-offset-2">
            《收付通用户信息认证授权协议》
          </a>
          和
          <a href="#mobile-service-agreement" onClick={openAgreement} className="mx-1 font-medium text-[var(--color-brand)] underline underline-offset-2">
            《中国移动认证服务条款》
          </a>
          。本人同意授权通信运营商和/或其关联公司核验身份证后四位并授权收付通获取必要身份信息以完成安全验证。
        </span>
      </label>

      <div id={sdkControlSlotMap.agreement} data-sdk-control-slot="agreement" />
    </section>
  )
}
