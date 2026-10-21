import { sdkControlSlotMap } from '../../sdk/slots'

function SdkSeamNodes() {
  return (
    <section className="space-y-4" aria-label="移动认证授权控件">
      <div data-slot="phone" className="min-h-[58px] rounded-[20px] bg-white">
        <div id={sdkControlSlotMap.phone} data-sdk-control-slot="phone" />
      </div>
      <div data-slot="tips" className="min-h-6 text-center">
        <div id={sdkControlSlotMap.tips} data-sdk-control-slot="tips" />
      </div>
      <div data-slot="state" className="min-h-[52px] rounded-2xl bg-[#f5f6f8]">
        <div id={sdkControlSlotMap.state} data-sdk-control-slot="state" />
      </div>

      <div data-slot="submit" className="min-h-[52px]">
        <div id={sdkControlSlotMap.submit} data-sdk-control-slot="submit" />
      </div>

      <div className="sr-only" aria-hidden="true" data-sdk-hidden-seams>
        <div id={sdkControlSlotMap['sms-input']} data-sdk-control-slot="sms-input" />
        <div id={sdkControlSlotMap['sms-button']} data-sdk-control-slot="sms-button" />
        <div data-slot="sdk-mount" />
      </div>
    </section>
  )
}

export function VerificationBlock() {
  return <SdkSeamNodes />
}
