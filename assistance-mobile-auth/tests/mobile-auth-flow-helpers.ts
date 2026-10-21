import { expect, type Frame, type Page } from '@playwright/test'

export type StubbedIdentityMode = 'success' | 'pending' | 'token-missing' | 'backend-failed'
export type StubSubmitElementTag = 'button' | 'a' | 'div' | 'input' | 'nested' | 'official-nested'

type MobileAuthSdkStubOptions = {
  agreementFixture?: 'minimal' | 'v23-production'
  agreementOverlay?: boolean
  preserveWrapper?: boolean
  submitElementTag?: StubSubmitElementTag
  emulateOfficialSubmitState?: boolean
}

const verificationFrameSelector = 'iframe[title="移动认证验证窗口"]'
const officialMobileAuthSdkUrl = 'https://authsafe.cmpassport.com/h5/js/jssdk_sf/jssdk-1.0.6.min.js'

export async function installVisualViewportMock(
  page: Page,
  initialHeight: number,
) {
  await page.addInitScript(({ height }) => {
    const state = { height, offsetTop: 0 }
    const viewport = new EventTarget() as VisualViewport
    Object.defineProperties(viewport, {
      height: { configurable: true, get: () => state.height },
      offsetTop: { configurable: true, get: () => state.offsetTop },
    })
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    })
    ;(window as Window & {
      __setAssistanceVisualViewport?: (nextHeight: number, offsetTop?: number) => void
    }).__setAssistanceVisualViewport = (nextHeight, offsetTop = 0) => {
      state.height = nextHeight
      state.offsetTop = offsetTop
      viewport.dispatchEvent(new Event('resize'))
      viewport.dispatchEvent(new Event('scroll'))
    }
  }, { height: initialHeight })
}

export async function setVisualViewportHeight(
  page: Page,
  height: number,
  offsetTop = 0,
) {
  await page.evaluate(({ nextHeight, nextOffsetTop }) => {
    const setter = (window as Window & {
      __setAssistanceVisualViewport?: (height: number, offsetTop?: number) => void
    }).__setAssistanceVisualViewport
    if (!setter) {
      throw new Error('visual viewport mock was not installed')
    }
    setter(nextHeight, nextOffsetTop)
  }, { nextHeight: height, nextOffsetTop: offsetTop })
}

export async function waitForAssistanceSdkFactory(page: Page) {
  await expect.poll(
    () => page.evaluate(() => (
      typeof window.AssistanceMobileAuth?.createAssistanceMobileAuthSdk
    )),
    {
      message: 'AssistanceMobileAuth wrapper factory did not become ready',
      timeout: 5000,
    },
  ).toBe('function')
}

export async function installMobileAuthSdkStub(
  page: Page,
  options: MobileAuthSdkStubOptions = {},
) {
  const agreementFixture = options.agreementFixture ?? 'minimal'
  const submitElementTag = options.submitElementTag ?? 'button'
  const agreementOverlay = options.agreementOverlay === true
  const emulateOfficialSubmitState = options.emulateOfficialSubmitState === true

  if (!options.preserveWrapper) {
    await page.route('**/assistance-mobile-auth/assistance-mobile-auth*.umd.cjs', async (route) => {
      const request = route.request()

      if (request.frame() !== page.mainFrame()) {
        await route.continue()
        return
      }

      const requestUrl = new URL(request.url())
      const wrapperModuleUrl = new URL(
        '/sign-pay-pro/src/wrapper/index.ts',
        requestUrl.origin,
      ).toString()

      await route.fulfill({
        contentType: 'application/javascript',
        body: `
          import(${JSON.stringify(wrapperModuleUrl)}).then((module) => {
            window.AssistanceMobileAuth = {
              createAssistanceMobileAuthSdk: module.createAssistanceMobileAuthSdk,
            };
          });
        `,
      })
    })
  }

  await page.route(officialMobileAuthSdkUrl, async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__mobileAuthSdkScriptLoaded = true;',
    })
  })

  await page.route('**/__mobile_auth_stub__.js', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__mobileAuthSdkScriptLoaded = true;',
    })
  })

  await page.addInitScript(({ agreementFixture, agreementOverlay, submitElementTag, emulateOfficialSubmitState }) => {
    type Harness = {
      showAuthPageCalls: Array<{ data: Record<string, string> }>
      initControlCalls: Array<{ styleOption?: Record<string, unknown> }>
      clearControlCalls: Array<string | null>
      submitButtonStates: Array<{ disabled?: boolean; loading?: boolean }>
      beforeSubmitResults: boolean[]
      providerTokenRequests: number
      submitClickEvents: Array<{
        isTrusted: boolean
        targetInsideOfficialControl: boolean
      }>
      submitKeyboardActivationEvents: Array<{ key: string; isTrusted: boolean }>
      syntheticSubmitClickCalls: number
      lastShowAuthPageRequest?: {
        success?: (payload: Record<string, unknown>) => void
        error?: (payload: Record<string, unknown>) => void
      }
      lastInitControlRequest?: {
        authReady?: (payload: Record<string, unknown>) => void
        success?: (payload: Record<string, unknown>) => void
        error?: (payload: Record<string, unknown>) => void
        beforeSubmit?: () => boolean
      }
    }
    const targetWindow = window as Window & {
      __mobileAuthHarness?: Harness
      YDRZAuthSF?: {
        showAuthPage(request: NonNullable<Harness['lastShowAuthPageRequest']> & { data: Record<string, string> }): void
        initControl(request: NonNullable<Harness['lastInitControlRequest']> & { styleOption?: Record<string, unknown> }): void
        clearControl(targetId?: string): void
        getAuthResult(): void
        updateSubmitBtnStatus(state: { disabled?: boolean; loading?: boolean }): void
      }
    }
    const harness: Harness = {
      showAuthPageCalls: [],
      initControlCalls: [],
      clearControlCalls: [],
      submitButtonStates: [],
      beforeSubmitResults: [],
      providerTokenRequests: 0,
      submitClickEvents: [],
      submitKeyboardActivationEvents: [],
      syntheticSubmitClickCalls: 0,
    }

    const nativeElementClick = HTMLElement.prototype.click
    HTMLElement.prototype.click = function patchedMobileAuthClick() {
      if (this.closest('#ydrzSubmitControl')) {
        harness.syntheticSubmitClickCalls += 1
      }
      Reflect.apply(nativeElementClick, this, [])
    }

    targetWindow.__mobileAuthHarness = harness
    let configuredSubmitLabel = ''
    let lastProviderClick = -Infinity
    const applyOfficialSubmitState = (state: { disabled?: boolean; loading?: boolean }) => {
      const slot = document.getElementById('ydrzSubmitControl')
      const label = slot?.querySelector<HTMLElement>('.ydrz-submitbtn-text')
      if (!slot || !label) return
      if (typeof state.disabled === 'boolean') slot.classList.toggle('disabled', state.disabled)
      if (typeof state.loading === 'boolean') {
        label.classList.toggle('loading', state.loading)
        label.textContent = state.loading ? '' : configuredSubmitLabel
      }
    }
    targetWindow.YDRZAuthSF = {
      showAuthPage(request) {
        harness.showAuthPageCalls.push({ data: { ...request.data } })
        harness.lastShowAuthPageRequest = request
      },
      initControl(request) {
        harness.initControlCalls.push({ styleOption: { ...(request.styleOption ?? {}) } })
        harness.lastInitControlRequest = request
        const phoneSlot = document.getElementById('ydrzPhoneControl')
        const agreementSlot = document.getElementById('ydrzAgreementControl')
        const tipsSlot = document.getElementById('ydrzTipsControl')

        if (agreementFixture === 'v23-production') {
          if (phoneSlot) {
            phoneSlot.style.cssText =
              'display:flex;width:100%;font-size:14px;line-height:20px;color:#475569;background:#fff'
            const phoneText = document.createElement('span')
            phoneText.style.cssText = 'font-size:14px;line-height:20px;color:#475569'
            phoneText.textContent = '182****2222'
            phoneSlot.replaceChildren(phoneText)
          }

          if (agreementSlot) {
            agreementSlot.style.cssText =
              'display:flex;width:100%;font-size:13px;line-height:20px;color:#475569;background:#fff'
            const agreementParagraph = document.createElement('p')
            agreementParagraph.style.cssText =
              'display:block;margin:0;font-size:13px;line-height:20px;color:#475569'
            const userAgreement = document.createElement('a')
            userAgreement.href = '#user-agreement'
            userAgreement.style.cssText =
              'font-size:13px;line-height:20px;color:#ff4a19;font-weight:400'
            userAgreement.textContent = '《用户信息授权协议》'
            if (agreementOverlay) {
              const agreementUrl = new URL(window.location.href)
              agreementUrl.searchParams.set('flow', 'agreement')
              agreementUrl.searchParams.set('doc', 'entry')
              agreementUrl.searchParams.delete('childDoc')
              agreementUrl.searchParams.delete('nestedDoc')
              userAgreement.href = agreementUrl.toString()
              userAgreement.addEventListener('click', (event) => {
                event.preventDefault()
                if (document.querySelector('.ydrz-confirm-bg-wrap')) {
                  return
                }

                const overlay = document.createElement('div')
                overlay.className = 'ydrz-confirm-bg-wrap'
                const background = document.createElement('div')
                background.className = 'ydrz-confirm-bg'
                const panel = document.createElement('div')
                panel.className = 'ydrz-confirm-iframe'
                // Official 1.0.6 openConfirm applies these default layer options
                // and uses a p header. Keep the visual fixture faithful too.
                panel.style.cssText = 'width:92%;height:92.8%;font-family:PingFangSC-Medium, PingFang SC;font-size:16px;color:rgba(51,51,51,1);border-radius:30px 30px 0 0'
                const header = document.createElement('p')
                header.className = 'ydrz-confirm-header'
                header.textContent = '用户信息授权协议'
                const close = document.createElement('em')
                close.setAttribute('role', 'button')
                close.setAttribute('aria-label', '关闭')
                close.tabIndex = 0
                close.addEventListener('click', () => overlay.remove())
                header.append(close)
                const reader = document.createElement('iframe')
                reader.title = '用户信息授权协议内容'
                reader.src = agreementUrl.toString()
                reader.addEventListener('load', () => {
                  const agreeStyle = request.styleOption?.agreeStyle as { childArr?: unknown[] } | undefined
                  reader.contentWindow?.postMessage({ option: agreeStyle?.childArr ?? [] }, window.location.origin)
                })
                panel.append(header, reader)
                background.append(panel)
                overlay.append(background)
                document.body.append(overlay)
              })
            }
            const operatorAgreement = document.createElement('a')
            operatorAgreement.href = '#operator-agreement'
            operatorAgreement.dataset.name = '中国移动认证服务条款'
            operatorAgreement.style.cssText =
              'font-size:13px;line-height:20px;color:#ff4a19;font-weight:400'
            operatorAgreement.textContent = '《中国移动认证服务条款》'
            agreementParagraph.append(
              document.createTextNode('已阅读并同意 '),
              userAgreement,
              document.createTextNode(' '),
              operatorAgreement,
              document.createTextNode('。'),
            )
            agreementSlot.replaceChildren(agreementParagraph)
          }

          if (tipsSlot) {
            tipsSlot.style.cssText =
              'display:block;width:100%;font-size:13px;line-height:20px;color:#475569;background:#fff'
            const tipsParagraph = document.createElement('p')
            tipsParagraph.className = 'auth-tips-title'
            tipsParagraph.style.cssText =
              'display:block;margin:0;font-size:13px;line-height:20px;color:#475569'
            tipsParagraph.textContent =
              '为方便您快速完成实名认证，您同意授权通信运营商和/或其关联公司核验您提供的本机手机号码和身份信息，并授权银联商务在合作商户相关支付和金融场景下，根据您的本机手机号码获取您的姓名及身份证件号。'
            tipsSlot.replaceChildren(tipsParagraph)
          }
        } else {
          phoneSlot?.replaceChildren(document.createTextNode('138****8000'))
          tipsSlot?.replaceChildren(document.createTextNode('中国移动认证服务'))
        }
        const stateSlot = document.getElementById('ydrzStateControl')
        if (stateSlot) {
          const state = document.createElement('div')
          state.className = 'auth-tips-wrap'
          const detail = document.createElement('p')
          detail.className = 'auth-tips'
          const copy = document.createElement('span')
          copy.textContent = '授权获取必要身份信息'
          const expiry = document.createElement('span')
          expiry.className = 'expire-span'
          expiry.textContent = '授权有效期30天；'
          detail.append(copy, expiry)
          state.append(detail)
          stateSlot.replaceChildren(state)
        }

        const submitSlot = document.getElementById('ydrzSubmitControl')
        const submitControl = document.createElement(
          submitElementTag === 'nested' || submitElementTag === 'official-nested'
            ? 'div'
            : submitElementTag,
        )
        const clickTarget = submitElementTag === 'nested'
          ? document.createElement('button')
          : submitControl
        const styleOption = request.styleOption as { submitBtnStyle?: { name?: string } } | undefined
        const submitLabel = styleOption?.submitBtnStyle?.name ?? '确认并提交验证'
        configuredSubmitLabel = submitLabel

        submitControl.dataset.sdkStubSubmit = 'true'
        submitControl.style.background = 'rgb(255, 0, 0)'
        clickTarget.dataset.sdkStubClickTarget = 'true'
        clickTarget.style.background = 'rgb(255, 0, 0)'
        if (submitElementTag === 'official-nested') {
          const label = document.createElement('span')
          submitControl.classList.add('ydrz-submitbtn-wrap')
          label.classList.add('ydrz-submitbtn-text')
          label.dataset.sdkStubLabel = 'true'
          label.textContent = submitLabel
          submitControl.append(label)
          if (submitSlot) {
            submitSlot.style.fontFamily = 'Arial'
            submitSlot.style.fontSize = '16px'
            submitSlot.style.fontWeight = '400'
          }
        } else if (clickTarget instanceof HTMLInputElement) {
          clickTarget.type = 'button'
          clickTarget.value = submitLabel
        } else {
          clickTarget.textContent = submitLabel
        }
        if (clickTarget instanceof HTMLButtonElement) {
          clickTarget.type = 'button'
        }
        if (clickTarget instanceof HTMLAnchorElement) {
          clickTarget.href = '#submit'
        }
        if (clickTarget instanceof HTMLDivElement && submitElementTag === 'div') {
          clickTarget.role = 'button'
          clickTarget.tabIndex = 0
        }
        const runBeforeSubmit = () => {
          if (emulateOfficialSubmitState) {
            // Official 1.0.6: throttle, guard disabled/loading, enter loading,
            // then beforeSubmit. False does NOT restore the label/loading.
            if (Date.now() - lastProviderClick < 1000) return
            lastProviderClick = Date.now()
            if (submitSlot?.classList.contains('disabled') || submitSlot?.querySelector('.ydrz-submitbtn-text.loading')) return
            applyOfficialSubmitState({ loading: true })
          }
          const result = request.beforeSubmit?.() ?? true
          harness.beforeSubmitResults.push(result)
          if (emulateOfficialSubmitState && result) harness.providerTokenRequests += 1
        }
        clickTarget.addEventListener('click', (event) => {
          event.preventDefault()
          harness.submitClickEvents.push({
            isTrusted: event.isTrusted,
            targetInsideOfficialControl:
              event.target instanceof Node && submitSlot?.contains(event.target) === true,
          })
          runBeforeSubmit()
        })
        if (
          clickTarget instanceof HTMLAnchorElement
          || (clickTarget instanceof HTMLDivElement && submitElementTag === 'div')
        ) {
          clickTarget.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
              return
            }
            event.preventDefault()
            harness.submitKeyboardActivationEvents.push({
              key: event.key,
              isTrusted: event.isTrusted,
            })
            runBeforeSubmit()
          })
        }
        if (clickTarget !== submitControl) {
          submitControl.append(clickTarget)
        }
        submitSlot?.replaceChildren(submitControl)
      },
      clearControl(targetId) {
        harness.clearControlCalls.push(targetId ?? null)
      },
      getAuthResult() {},
      updateSubmitBtnStatus(state) {
        harness.submitButtonStates.push({ ...state })
        if (emulateOfficialSubmitState) applyOfficialSubmitState(state)
        const submitControl = document.querySelector<HTMLElement>('[data-sdk-stub-click-target]')

        if (submitControl) {
          const disabled = state.disabled === true || state.loading === true
          submitControl.setAttribute('aria-disabled', String(disabled))
          if (submitControl instanceof HTMLButtonElement) {
            submitControl.disabled = disabled
          }
        }
      },
    }
  }, { agreementFixture, agreementOverlay, submitElementTag, emulateOfficialSubmitState })
}

export async function installSessionRoutes(page: Page) {
  await page.route('**/api/sdk/session/create', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'created',
        launchToken: 'sft_launch_test',
        expiresInSeconds: 600,
        message: 'JSSDK 验证会话已创建。',
      }),
    })
  })

  await page.route('**/api/sdk/session/resolve', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'ready',
        params: {
          appId: '300013215094',
          sign: 'mock-sign',
          traceId: 'mock-trace',
          timestamp: '20260508010101001',
          authType: '0',
          scope: '3ElementsAuthAssistFill',
        },
        expiresInSeconds: 600,
        message: '移动 JSSDK 参数已准备就绪（mock）。',
        mock: true,
      }),
    })
  })

  await page.route('**/api/sdk/session/complete', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'completed',
        authResultId: 'sft_result_test',
        authCode: 'sft_code_test',
        expiresInSeconds: 600,
        message: '认证已完成。',
      }),
    })
  })

  await page.route('**/api/sdk/session/result', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'identity-ready',
        message: '测试页已通过 mock 查询接口获取认证结果。',
        identity: {
          displayName: '张三',
          maskedMobile: '138****0000',
          maskedIdCard: '110101********1234',
        },
        mock: true,
      }),
    })
  })
}

export async function installMobileAssistantRoutes(page: Page, mode: StubbedIdentityMode) {
  await page.route('**/api/mobile-assistant/verify', async (route) => {
    if (mode === 'backend-failed') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'backend failed' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ kind: 'verified', message: '核验通过' }),
    })
  })

  await page.route('**/api/mobile-assistant/identity', async (route) => {
    if (mode === 'pending') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identity-pending',
          message: '结果处理中',
          action: 'refresh-result',
        }),
      })
      return
    }

    if (mode === 'backend-failed') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'backend failed' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'identity-ready',
        message: '身份信息已返回',
        identity: {
          displayName: '张三',
          maskedMobile: '138****0000',
          maskedIdCard: '110101********1234',
        },
      }),
    })
  })
}

export async function installBusinessDemoRoutes(page: Page) {
  await page.route('**/api/business-demo/check', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ kind: 'verified', message: '核验通过' }),
    })
  })

  await page.route('**/api/business-demo/query', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'identity-encrypted',
        message: '查询成功',
        identity: {
          encryptedName: '81e14c9984617e662117ca545d7adf04',
          encryptedMobile: '2148c59fb4a7085a0e1c1224ef025381',
          encryptedIdCard: '67e43ccf0f591daeebaa0789dc4161da',
        },
      }),
    })
  })
}

export async function installStubbedFlow(page: Page, mode: StubbedIdentityMode) {
  await installMobileAuthSdkStub(page)
  await installMobileAssistantRoutes(page, mode)
}

export async function getVerificationFrame(page: Page): Promise<Frame> {
  const frameElement = page.locator(verificationFrameSelector)

  await expect(frameElement).toBeVisible()

  const handle = await frameElement.elementHandle()
  const frame = await handle?.contentFrame()

  if (!frame) {
    throw new Error('Verification iframe did not expose a content frame')
  }

  await frame.waitForLoadState('domcontentloaded')
  return frame
}

export async function openStubbedVerification(page: Page, mode: StubbedIdentityMode) {
  await installStubbedFlow(page, mode)
  await page.goto('/')
  await waitForAssistanceSdkFactory(page)
  await expect(page.getByRole('main', { name: '订单支付' })).toBeVisible()
  await page.getByRole('button', { name: '立即支付-jssdk' }).click()
  await expect(page.locator('[data-assistance-auth-overlay="true"]')).toBeVisible()

  const frame = await getVerificationFrame(page)

  await expect(frame.getByRole('main', { name: '确认身份信息' })).toBeVisible()
  await expect(frame.getByText('输入身份证后4位')).toBeVisible()

  return frame
}

export async function expectShowAuthPageCallCount(frame: Frame, count: number) {
  await expect.poll(() => frame.evaluate(() => {
    return ((window as Window & { __mobileAuthHarness?: { showAuthPageCalls: unknown[] } }).__mobileAuthHarness?.showAuthPageCalls.length ?? 0)
  })).toBe(count)
}

export async function readShowAuthPageData(frame: Frame) {
  return frame.evaluate(() => {
    return (window as Window & {
      __mobileAuthHarness?: { showAuthPageCalls: Array<{ data: Record<string, string> }> }
    }).__mobileAuthHarness?.showAuthPageCalls.at(-1)?.data
  })
}

export async function triggerShowAuthPageSuccess(frame: Frame) {
  await expect.poll(() => frame.evaluate(() => {
    return typeof (window as Window & {
      __mobileAuthHarness?: {
        lastShowAuthPageRequest?: { success?: (payload: Record<string, unknown>) => void }
      }
    }).__mobileAuthHarness?.lastShowAuthPageRequest?.success
  })).toBe('function')

  await frame.evaluate(() => {
    ;(window as Window & {
      __mobileAuthHarness?: {
        lastShowAuthPageRequest?: { success?: (payload: Record<string, unknown>) => void }
      }
    }).__mobileAuthHarness?.lastShowAuthPageRequest?.success?.({ code: '103000' })
  })
}

export async function triggerInitControlSuccess(frame: Frame, token: string | null, keyA = 'sdk-key-a') {
  await frame.evaluate(({ nextToken, keyA }) => {
    ;(window as Window & {
      __mobileAuthHarness?: {
        lastInitControlRequest?: { success?: (payload: Record<string, unknown>) => void }
      }
    }).__mobileAuthHarness?.lastInitControlRequest?.success?.(
      nextToken == null ? { code: '103000', encryptPublicKey: keyA } : { code: '103000', token: nextToken, encryptPublicKey: keyA },
    )
  }, { nextToken: token, keyA })
}

export async function triggerInitControlAuthReady(frame: Frame) {
  await frame.evaluate(() => {
    ;(window as Window & {
      __mobileAuthHarness?: {
        lastInitControlRequest?: { authReady?: (payload: Record<string, unknown>) => void }
      }
    }).__mobileAuthHarness?.lastInitControlRequest?.authReady?.({ code: '103000' })
  })
}

export async function triggerInitControlError(frame: Frame, code: string, message?: string) {
  await frame.evaluate(({ code, message }) => {
    ;(window as Window & {
      __mobileAuthHarness?: {
        lastInitControlRequest?: { error?: (payload: Record<string, unknown>) => void }
      }
    }).__mobileAuthHarness?.lastInitControlRequest?.error?.({ code, message })
  }, { code, message })
}

export async function triggerShowAuthPageError(frame: Frame, code: string, message?: string) {
  await frame.evaluate(({ code, message }) => {
    ;(window as Window & {
      __mobileAuthHarness?: {
        lastShowAuthPageRequest?: { error?: (payload: Record<string, unknown>) => void }
      }
    }).__mobileAuthHarness?.lastShowAuthPageRequest?.error?.({ code, message })
  }, { code, message })
}

export async function readSubmitButtonStates(frame: Frame) {
  return frame.evaluate(() => {
    return ((window as Window & {
      __mobileAuthHarness?: { submitButtonStates: Array<{ disabled?: boolean; loading?: boolean }> }
    }).__mobileAuthHarness?.submitButtonStates ?? [])
  })
}

export async function expectInitControlReady(frame: Frame) {
  await expect.poll(() => frame.evaluate(() => {
    return ((window as Window & { __mobileAuthHarness?: { initControlCalls: unknown[] } }).__mobileAuthHarness?.initControlCalls.length ?? 0)
  })).toBe(1)
  // Phase 10: trigger authReady before asserting visible controls (skeleton shows until authReady fires)
  await triggerInitControlAuthReady(frame)
  await expect(frame.locator('#ydrzPhoneControl')).toContainText(/1\d{2}\*{4}\d{4}/)
  await expect(frame.locator('#ydrzTipsControl')).toContainText(/.+/)
  await expect(frame.locator('#ydrzStateControl')).toContainText('授权获取必要身份信息')
  await expect(frame.locator('[data-sdk-stub-submit]')).toBeVisible()
}

export async function enterIdLast4(frame: Frame) {
  for (const digit of ['1', '2', '3', '4']) {
    await frame.getByRole('button', { name: `输入 ${digit}` }).click()
  }
}

export async function clickSdkSubmit(frame: Frame) {
  await frame.locator('[data-sdk-stub-click-target]').click()
  await expect.poll(() => frame.evaluate(() => {
    const harness = (window as Window & {
      __mobileAuthHarness?: { beforeSubmitResults: boolean[] }
    }).__mobileAuthHarness

    return harness?.beforeSubmitResults.at(-1) ?? false
  })).toBe(true)
}

export async function completeStubbedMobileAuth(frame: Frame, token: string | null) {
  await expectShowAuthPageCallCount(frame, 1)
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await enterIdLast4(frame)
  const customAgreement = frame.getByRole('checkbox', { name: '同意示例品牌服务协议' })
  if (await customAgreement.count()) {
    await customAgreement.check()
  }
  await clickSdkSubmit(frame)
  await triggerInitControlSuccess(frame, token)
}
