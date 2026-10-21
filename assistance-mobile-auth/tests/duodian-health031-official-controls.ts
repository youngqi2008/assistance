import { readFileSync } from 'node:fs'
import { expect, type Frame } from '@playwright/test'

let sourcePromise: Promise<string> | undefined
function officialSource() {
  sourcePromise ??= (async () => {
    if (process.env.DUODIAN_OFFICIAL_SOURCE) return readFileSync(process.env.DUODIAN_OFFICIAL_SOURCE, 'utf8')
    const response = await fetch('https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js', { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error('Official 1.0.6 renderer download failed: ' + response.status)
    return response.text()
  })()
  return sourcePromise
}

// Identical instrumentation to the 030 formal-release suite: official 1.0.6
// builds submit/tips/agreements and handles trusted clicks. Only carrier I/O is simulated.
export async function install031OfficialControls(frame: Frame) {
  await frame.evaluate(() => { (window as any).__mockInit = (window as any).YDRZAuthSF.initControl })
  const source = await officialSource()
  const marker = 'var _0x39b7ec='
  expect(source.includes(marker), 'Official 1.0.6 instrumentation point').toBe(true)
  await frame.addScriptTag({ content: source.replace(marker,
    'window.__auditControl=_0x11307e;window.__auditOptions=_0x40375d;window.__auditData=_0x50f6a5;window.__useControl=function(c){_0x46c3a1=c};var _0x39b7ec=') })
  await frame.evaluate(() => {
    const w = window as any
    w.__beforeCalls = 0; w.__tokenCalls = 0; w.__trustedClicks = []
    w.__installOfficialControl = () => {
      const request = w.__mobileAuthHarness.lastInitControlRequest
      const control = Object.create(w.__auditControl.prototype)
      control._elements = []
      control._tips_div = document.getElementById('ydrzTipsControl')!
      control._agreement_div = document.getElementById('ydrzAgreementControl')!
      control._submit_div = document.getElementById('ydrzSubmitControl')!
      control._tips_div.replaceChildren(); control._agreement_div.replaceChildren(); control._submit_div.replaceChildren()
      control._layerOpt = { ...request.styleOption,
        submitBtnLoadingStyle: { ...request.styleOption.submitBtnLoadingStyle, url: '', animationName: 'ydrz-rotate360',
          animationDuration: '1s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' },
        agreeStyle: { ...request.styleOption.agreeStyle, checkboxStyle: {} } }
      w.__auditData.authDetaiItem = { identity: '授权获取您的姓名、身份证号码及手机号码，用于身份核验' }
      Object.assign(w.__auditOptions, { elementInfo: {},
        rzPolicyInfo: { contentCM: '《中国移动认证服务条款》', linkCM: 'https://wap.cmpassport.com/resources/html/sfContract.html' },
        isLocalMsisdn: '0',
        authTips: { businessNameTrue: { notNative: {
          authTipsPrefix: '为方便您快速完成实名认证，您同意授权通信运营商和/或其关联公司核验您提供的本机手机号码和身份信息，',
          businessName: '', authTipsSuffix: '并授权银联商务在合作商户相关支付和金融场景下，根据您的本机手机号码获取您的姓名及身份证件号。',
        } } },
        scopeInfo: { identity: { expireTime: '30天' } }, authType: '0', operator: 'CM',
        beforeSubmit: () => { w.__beforeCalls++; return request.beforeSubmit() } })
      control.getToken = () => { w.__tokenCalls++ }
      w.__useControl(control)
      control.createSubmitControl()
      if (!control._submit_div.__trustedObserver) {
        control._submit_div.__trustedObserver = true
        control._submit_div.addEventListener('click', (event: Event) => { w.__trustedClicks.push(event.isTrusted) }, true)
      }
      control.createTipsControl(); control.createAgreementsControl()
    }
    w.YDRZAuthSF.initControl = (request: any) => { w.__mockInit(request); w.__installOfficialControl() }
    w.__installOfficialControl()
  })
}
