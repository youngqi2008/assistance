import { expect, test, type Frame, type Page } from '@playwright/test'

import {
  expectInitControlReady,
  installMobileAssistantRoutes,
  installMobileAuthSdkStub,
  installSessionRoutes,
  triggerShowAuthPageSuccess,
  waitForAssistanceSdkFactory,
  type StubSubmitElementTag,
} from './mobile-auth-flow-helpers'

type NotificationTestMode =
  | 'absent'
  | 'before-login-only'
  | 'state-change-only'
  | 'both'
  | 'throw'
  | 'reject'

type NotificationLogEntry = {
  callback: 'onBeforeLogin' | 'onStateChange'
  event: 'idLast4Complete' | 'idLast4Incomplete'
  calls: number
}

type NotificationHarness = {
  onBeforeLoginCalls: number
  onStateChangeCalls: number
  log: NotificationLogEntry[]
}

async function openV23(
  page: Page,
  submitElementTag: StubSubmitElementTag = 'button',
  mode: NotificationTestMode = 'absent',
  agreementFixture: 'minimal' | 'v23-production' = 'minimal',
): Promise<Frame> {
  await installMobileAuthSdkStub(page, { agreementFixture, submitElementTag })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto('/')
  await waitForAssistanceSdkFactory(page)
  await page.getByRole('combobox', { name: '通知回调观察模式' }).selectOption(mode)
  await page.getByRole('button', { name: '测试银联三要素皮肤（zidingyi）' }).click()

  const frameElement = page.locator('iframe[title="银杏助填版本23"]')
  await expect(frameElement).toBeVisible()
  const frame = await (await frameElement.elementHandle())?.contentFrame()
  if (!frame) {
    throw new Error('V23 verification iframe did not expose a content frame')
  }

  await frame.waitForLoadState('domcontentloaded')
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(frame.getByTestId('chinaums-sheet-v23-root')).toBeVisible()
  return frame
}

async function enterVirtualIdLast4(frame: Frame, value: string) {
  for (const character of value) {
    await frame.getByRole('button', { name: `输入 ${character.toUpperCase()}` }).click()
  }
}

async function readBeforeSubmitResults(frame: Frame): Promise<boolean[]> {
  return frame.evaluate(
    () =>
      (
        window as Window & {
          __mobileAuthHarness?: { beforeSubmitResults: boolean[] }
        }
      ).__mobileAuthHarness?.beforeSubmitResults ?? [],
  )
}

async function readSubmitEvidence(frame: Frame): Promise<{
  beforeSubmitResults: boolean[]
  submitClickEvents: Array<{ isTrusted: boolean; targetInsideOfficialControl: boolean }>
  submitKeyboardActivationEvents: Array<{ key: string; isTrusted: boolean }>
  syntheticSubmitClickCalls: number
}> {
  return frame.evaluate(() => {
    const harness = (
      window as Window & {
        __mobileAuthHarness?: {
          beforeSubmitResults: boolean[]
          submitClickEvents: Array<{
            isTrusted: boolean
            targetInsideOfficialControl: boolean
          }>
          submitKeyboardActivationEvents: Array<{ key: string; isTrusted: boolean }>
          syntheticSubmitClickCalls: number
        }
      }
    ).__mobileAuthHarness

    return {
      beforeSubmitResults: harness?.beforeSubmitResults ?? [],
      submitClickEvents: harness?.submitClickEvents ?? [],
      submitKeyboardActivationEvents: harness?.submitKeyboardActivationEvents ?? [],
      syntheticSubmitClickCalls: harness?.syntheticSubmitClickCalls ?? 0,
    }
  })
}

async function readNotificationHarness(page: Page): Promise<NotificationHarness> {
  return page.evaluate(() => {
    const harness = (
      window as Window & {
        __assistanceNotificationHarness?: NotificationHarness
      }
    ).__assistanceNotificationHarness

    return harness
      ? {
          onBeforeLoginCalls: harness.onBeforeLoginCalls,
          onStateChangeCalls: harness.onStateChangeCalls,
          log: harness.log,
        }
      : {
        onBeforeLoginCalls: 0,
        onStateChangeCalls: 0,
        log: [],
      }
  })
}

for (const submitElementTag of [
  'button',
  'a',
  'div',
  'input',
  'nested',
  'official-nested',
] as const) {
  test(`V23 CTA 直接触发一次 SDK ${submitElementTag} provider`, async ({ page }) => {
    const frame = await openV23(page, submitElementTag)
    await enterVirtualIdLast4(frame, '12X9')

    const cta = frame.getByTestId('chinaums-v23-submit')
    const officialSlot = frame.locator('#ydrzSubmitControl')
    const officialClickTarget = frame.locator('[data-sdk-stub-click-target]')
    await expect(frame.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'true')
    await expect(cta).toContainText('同意并登录')
    await expect(cta.locator('#ydrzSubmitControl')).toHaveCount(1)
    await expect(frame.locator('.chinaums-v23-provider-submit')).toHaveCount(0)
    expect(await frame.getByRole('button', { name: '同意并登录' }).count()).toBe(
      submitElementTag === 'button' || submitElementTag === 'nested' || submitElementTag === 'div'
        || submitElementTag === 'input'
        ? 1
        : 0,
    )

    const [ctaBox, slotBox, targetBox] = await Promise.all([
      cta.boundingBox(),
      officialSlot.boundingBox(),
      officialClickTarget.boundingBox(),
    ])
    expect(ctaBox).not.toBeNull()
    expect(slotBox).not.toBeNull()
    expect(targetBox).not.toBeNull()
    for (const box of [slotBox!, targetBox!]) {
      expect(box.x).toBeCloseTo(ctaBox!.x, 0)
      expect(box.y).toBeCloseTo(ctaBox!.y, 0)
      expect(box.width).toBeCloseTo(ctaBox!.width, 0)
      expect(box.height).toBeCloseTo(ctaBox!.height, 0)
    }

    await cta.click()

    await expect.poll(() => readSubmitEvidence(frame)).toEqual({
      beforeSubmitResults: [true],
      submitClickEvents: [{ isTrusted: true, targetInsideOfficialControl: true }],
      submitKeyboardActivationEvents: [],
      syntheticSubmitClickCalls: 0,
    })
    await expect(officialClickTarget).toHaveAttribute('aria-disabled', 'true')
    await expect(frame.getByRole('status', { name: '加载中' })).toBeVisible()
    await expect(frame.getByRole('button', { name: '输入 1' })).toBeDisabled()
  })
}

for (const submitElementTag of ['a', 'div'] as const) {
  test(`V23 ${submitElementTag} provider 处理中阻止第二次指针与键盘提交`, async ({ page }) => {
    const frame = await openV23(page, submitElementTag)
    await enterVirtualIdLast4(frame, '1234')

    const cta = frame.getByTestId('chinaums-v23-submit')
    const officialClickTarget = frame.locator('[data-sdk-stub-click-target]')
    await cta.click()
    await expect.poll(() => readBeforeSubmitResults(frame)).toEqual([true])
    await expect(cta).toHaveAttribute('inert')

    // Remove the visual loading shield so the assertion is specifically about
    // the CTA's native interaction lock, not an overlay intercepting the pointer.
    await frame.locator('.chinaums-v23-loading-mask').evaluate((element) => element.remove())
    await officialClickTarget.click({ force: true })
    await officialClickTarget.focus()
    expect(await officialClickTarget.evaluate((element) => document.activeElement === element)).toBe(false)
    await officialClickTarget.press('Enter')
    await officialClickTarget.press('Space')

    await expect.poll(() => readSubmitEvidence(frame)).toEqual({
      beforeSubmitResults: [true],
      submitClickEvents: [{ isTrusted: true, targetInsideOfficialControl: true }],
      submitKeyboardActivationEvents: [],
      syntheticSubmitClickCalls: 0,
    })
  })
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 558, height: 1004 },
] as const) {
  test(`${viewport.width}x${viewport.height} V23 无横向溢出且键盘持续可见`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const frame = await openV23(
      page,
      'official-nested',
      'absent',
      viewport.width === 390 || viewport.width === 558 ? 'v23-production' : 'minimal',
    )
    const dialog = frame.locator('.chinaums-v23-dialog')
    const header = frame.locator('.chinaums-v23-header')
    const middle = frame.locator('.chinaums-v23-middle')
    const grid = frame.locator('.chinaums-v23-id-grid')
    const boxes = frame.locator('.chinaums-v23-id-box')
    const keyboard = frame.getByLabel('安全键盘', { selector: 'section' })
    const keys = keyboard.locator('button')
    const outerFrame = page.locator('iframe[title="银杏助填版本23"]')
    const bottomRowKeys = [
      frame.getByRole('button', { name: '输入 X' }),
      frame.getByRole('button', { name: '输入 0' }),
      frame.getByRole('button', { name: '删除' }),
    ]

    await expect(boxes).toHaveCount(4)
    await expect(dialog).toHaveCount(1)
    await expect(keyboard).toBeVisible()
    await expect(frame.getByTestId('chinaums-v23-submit')).toBeVisible()

    const [
      dialogBox,
      headerBox,
      middleBox,
      gridBox,
      keyboardBox,
      firstKeyBox,
      secondKeyBox,
      thirdKeyBox,
      fourthKeyBox,
    ] = await Promise.all([
      dialog.boundingBox(),
      header.boundingBox(),
      middle.boundingBox(),
      grid.boundingBox(),
      keyboard.boundingBox(),
      keys.nth(0).boundingBox(),
      keys.nth(1).boundingBox(),
      keys.nth(2).boundingBox(),
      keys.nth(3).boundingBox(),
    ])
    expect(dialogBox).not.toBeNull()
    expect(headerBox).not.toBeNull()
    expect(middleBox).not.toBeNull()
    expect(gridBox).not.toBeNull()
    expect(keyboardBox).not.toBeNull()
    expect(firstKeyBox).not.toBeNull()
    expect(secondKeyBox).not.toBeNull()
    expect(thirdKeyBox).not.toBeNull()
    expect(fourthKeyBox).not.toBeNull()
    expect(dialogBox!.x).toBeGreaterThanOrEqual(-1)
    expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(viewport.width + 1)
    expect(headerBox!.x).toBeCloseTo(dialogBox!.x, 0)
    expect(headerBox!.width).toBeCloseTo(dialogBox!.width, 0)
    expect(middleBox!.x).toBeCloseTo(dialogBox!.x, 0)
    expect(middleBox!.width).toBeCloseTo(dialogBox!.width, 0)
    expect(gridBox!.x).toBeGreaterThanOrEqual(dialogBox!.x - 1)
    expect(gridBox!.x + gridBox!.width).toBeLessThanOrEqual(dialogBox!.x + dialogBox!.width + 1)
    expect(keyboardBox!.x).toBeCloseTo(0, 0)
    expect(keyboardBox!.width).toBeCloseTo(viewport.width, 0)
    expect(firstKeyBox!.x).toBeGreaterThan(0)
    expect(thirdKeyBox!.x + thirdKeyBox!.width).toBeLessThan(viewport.width)
    expect(firstKeyBox!.x).toBeCloseTo(
      viewport.width - (thirdKeyBox!.x + thirdKeyBox!.width),
      0,
    )
    const responsiveScale = dialogBox!.width / 290
    expect(keyboardBox!.y - (dialogBox!.y + dialogBox!.height)).toBeCloseTo(28 * responsiveScale, 0)
    expect(dialogBox!.y).toBeGreaterThan(0)
    expect(secondKeyBox!.x - (firstKeyBox!.x + firstKeyBox!.width)).toBeGreaterThan(1)
    expect(fourthKeyBox!.y - (firstKeyBox!.y + firstKeyBox!.height)).toBeGreaterThan(1)
    expect(
      await keyboard.evaluate((element) => {
        const keyboardStyle = getComputedStyle(element)
        const firstKey = element.querySelector<HTMLElement>('.chinaums-v23-key')
        const deleteKey = element.querySelector<HTMLElement>('.chinaums-v23-key[data-key="delete"]')
        if (!firstKey || !deleteKey) {
          return false
        }
        const firstKeyStyle = getComputedStyle(firstKey)
        const deleteKeyStyle = getComputedStyle(deleteKey)
        return (
          keyboardStyle.backgroundColor === 'rgb(232, 232, 232)' &&
          firstKeyStyle.backgroundColor === 'rgb(255, 255, 255)' &&
          firstKeyStyle.borderRadius !== '0px' &&
          deleteKeyStyle.backgroundColor === 'rgba(0, 0, 0, 0)' &&
          deleteKey.querySelector('svg') !== null
        )
      }),
    ).toBe(true)
    expect(
      await outerFrame.evaluate((element) => {
        const style = getComputedStyle(element)
        return (
          style.backgroundColor === 'rgba(0, 0, 0, 0)' &&
          style.borderRadius === '0px' &&
          style.boxShadow === 'none'
        )
      }),
    ).toBe(true)
    for (const key of bottomRowKeys) {
      const keyBox = await key.boundingBox()
      expect(keyBox).not.toBeNull()
      expect(keyBox!.y + keyBox!.height).toBeLessThanOrEqual(viewport.height + 1)
    }
    expect(
      await frame.evaluate(
        () =>
          document.documentElement.scrollWidth <= document.documentElement.clientWidth &&
          document.documentElement.scrollHeight <= document.documentElement.clientHeight,
      ),
    ).toBe(true)

    if (viewport.width === 390 || viewport.width === 558) {
      const bottomSpacing = await frame.locator('.chinaums-v23-other').evaluate((other) => {
        const dialog = other.closest<HTMLElement>('.chinaums-v23-dialog')
        if (!dialog) {
          throw new Error('V23 other-method control is not inside the dialog')
        }
        const textRange = document.createRange()
        textRange.selectNodeContents(other)
        const dialogBox = dialog.getBoundingClientRect()
        const textBox = textRange.getBoundingClientRect()
        return {
          dialogHeight: dialogBox.height,
          dialogWidth: dialogBox.width,
          expected: (25 / 475) * dialogBox.width,
          paddingBottom: Number.parseFloat(getComputedStyle(dialog).paddingBottom),
          textBottomGap: dialogBox.bottom - textBox.bottom,
        }
      })
      expect(bottomSpacing.paddingBottom).toBeCloseTo(bottomSpacing.expected, 0)
      expect(bottomSpacing.textBottomGap).toBeGreaterThanOrEqual(bottomSpacing.expected - 3)
    }

    if (viewport.width === 558) {
      const [submitBox, agreementBox, otherBox] = await Promise.all([
        frame.locator('.chinaums-v23-submit').boundingBox(),
        frame.locator('.chinaums-v23-agreements').boundingBox(),
        frame.locator('.chinaums-v23-other').boundingBox(),
      ])
      expect(submitBox).not.toBeNull()
      expect(agreementBox).not.toBeNull()
      expect(otherBox).not.toBeNull()
      expect(dialogBox!.x).toBeCloseTo(41.5, 0)
      expect(dialogBox!.width).toBeCloseTo(475, 0)
      expect(dialogBox!.height).toBeGreaterThanOrEqual(577)
      expect(dialogBox!.height).toBeLessThanOrEqual(584)
      expect(dialogBox!.y + dialogBox!.height).toBeCloseTo(606, 0)
      expect(gridBox!.width / dialogBox!.width).toBeCloseTo(0.72, 2)
      expect(submitBox!.width / dialogBox!.width).toBeCloseTo(0.845, 2)
      expect(keyboardBox!.y).toBeCloseTo(652, 0)
      expect(keyboardBox!.y + keyboardBox!.height).toBeCloseTo(1004, 0)
      expect(agreementBox!.y).toBeGreaterThan(submitBox!.y + submitBox!.height)
      expect(otherBox!.y + otherBox!.height).toBeLessThanOrEqual(
        dialogBox!.y + dialogBox!.height,
      )
    }

    if (viewport.width === 558 && process.env.PLAYWRIGHT_V23_SCREENSHOT_PATH) {
      await page.screenshot({
        animations: 'disabled',
        path: process.env.PLAYWRIGHT_V23_SCREENSHOT_PATH,
      })
    }
    if (viewport.width === 390 && process.env.PLAYWRIGHT_V23_PHONE_SCREENSHOT_PATH) {
      await page.screenshot({
        animations: 'disabled',
        path: process.env.PLAYWRIGHT_V23_PHONE_SCREENSHOT_PATH,
      })
    }
  })
}

test('V23 压制 SDK 注入的冲突字号和主题色并保持 Figma 排版', async ({ page }) => {
  const frame = await openV23(page, 'official-nested', 'absent', 'v23-production')

  const typography = await frame.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('.chinaums-v23-dialog')!
    const phone = getComputedStyle(document.getElementById('ydrzPhoneControl')!)
    const agreementRoot = document.getElementById('ydrzAgreementControl')!
    const tipsRoot = document.getElementById('ydrzTipsControl')!
    const agreement = getComputedStyle(agreementRoot)
    const styledAgreementNodes = [agreementRoot, tipsRoot]
      .flatMap((root) => [root, ...root.querySelectorAll<HTMLElement>('p, span')])
      .map((element) => {
        const style = getComputedStyle(element)
        return [style.fontSize, style.lineHeight, style.color, style.fontWeight] as const
      })
    const styledLinks = Array.from(
      agreementRoot.querySelectorAll<HTMLAnchorElement>('a'),
      (element) => {
        const style = getComputedStyle(element)
        return [style.fontSize, style.lineHeight, style.color, style.fontWeight] as const
      },
    )
    const submit = getComputedStyle(document.querySelector<HTMLElement>('.chinaums-v23-submit')!)
    const other = getComputedStyle(document.querySelector<HTMLElement>('.chinaums-v23-other')!)
    return {
      dialogWidth: dialog.getBoundingClientRect().width,
      phone: [
        Number.parseFloat(phone.fontSize),
        Number.parseFloat(phone.lineHeight),
        phone.color,
        phone.backgroundColor,
      ] as const,
      agreement: [
        Number.parseFloat(agreement.fontSize),
        Number.parseFloat(agreement.lineHeight),
        agreement.color,
      ] as const,
      styledAgreementNodes,
      styledLinks,
      submit: [Number.parseFloat(submit.fontSize), submit.fontWeight] as const,
      other: [
        Number.parseFloat(other.fontSize),
        Number.parseFloat(other.lineHeight),
        other.color,
      ] as const,
    }
  })

  expect(typography.phone[0] / typography.dialogWidth).toBeCloseTo(12 / 290, 4)
  expect(typography.phone[1] / typography.dialogWidth).toBeCloseTo(12 / 290, 4)
  expect(typography.phone.slice(2)).toEqual(['rgb(62, 66, 75)', 'rgba(0, 0, 0, 0)'])
  expect(typography.agreement[0] / typography.dialogWidth).toBeCloseTo(10 / 290, 4)
  expect(typography.agreement[1] / typography.dialogWidth).toBeCloseTo(15.263158 / 290, 4)
  expect(typography.agreement[2]).toBe('rgb(51, 51, 51)')
  expect(typography.styledAgreementNodes).toEqual(
    Array.from({ length: typography.styledAgreementNodes.length }, () => [
      `${typography.agreement[0]}px`,
      `${typography.agreement[1]}px`,
      'rgb(51, 51, 51)',
      '400',
    ]),
  )
  expect(typography.styledLinks).toHaveLength(2)
  expect(typography.styledLinks).toEqual(
    Array.from({ length: 2 }, () => [
      `${typography.agreement[0]}px`,
      `${typography.agreement[1]}px`,
      'rgb(51, 51, 51)',
      '600',
    ]),
  )
  expect(typography.submit[0] / typography.dialogWidth).toBeCloseTo(16 / 290, 4)
  expect(typography.submit[1]).toBe('600')
  await expect(frame.locator('[data-sdk-stub-click-target]')).toHaveCSS('font-weight', '700')
  expect(typography.other[0] / typography.dialogWidth).toBeCloseTo(12 / 290, 4)
  expect(typography.other[1] / typography.dialogWidth).toBeCloseTo(14 / 290, 4)
  expect(typography.other[2]).toBe('rgb(1, 131, 255)')
})

test('V23 非零安全区随动态 visual viewport 高度与 offset 缩放完整 stage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const frame = await openV23(page, 'official-nested')
  const outerFrame = page.locator('iframe[title="银杏助填版本23"]')
  const viewportLayer = page.locator('[data-assistance-auth-viewport-modal="true"]')

  await frame.evaluate(() => {
    document.documentElement.style.setProperty('--assistance-v23-safe-area-bottom', '24px')
    window.dispatchEvent(new Event('resize'))
  })
  await page.evaluate(() => {
    const viewport = window.visualViewport
    if (!viewport) {
      throw new Error('visualViewport is required for the dynamic V23 test')
    }
    Object.defineProperties(viewport, {
      height: { value: 520, configurable: true },
      offsetTop: { value: 28, configurable: true },
    })
    viewport.dispatchEvent(new Event('resize'))
  })

  await expect(viewportLayer).toHaveCSS('top', '28px')
  await expect(viewportLayer).toHaveCSS('height', '520px')
  await expect(frame.locator('.chinaums-v23-stage')).toHaveAttribute(
    'data-stage-scale-ready',
    'true',
  )
  await expect
    .poll(() =>
      frame.evaluate(
        () => getComputedStyle(document.querySelector('.chinaums-v23-stage-host')!).paddingBottom,
      ),
    )
    .toBe('0px')
  await frame.evaluate(() => {
    const viewport = window.visualViewport
    if (viewport) {
      Object.defineProperties(viewport, {
        width: { value: Number.NaN, configurable: true },
        height: { value: Number.NaN, configurable: true },
      })
    }
    Object.defineProperty(window, 'innerHeight', {
      value: 0,
      configurable: true,
    })
    window.dispatchEvent(new Event('resize'))
  })
  await expect(frame.locator('.chinaums-v23-stage')).toHaveAttribute(
    'data-stage-scale-ready',
    'true',
  )

  const [outerBox, stageBox, dialogBox, keyboardBox, keyboardStyle, keyBoxes] = await Promise.all([
    outerFrame.boundingBox(),
    frame.locator('.chinaums-v23-stage').boundingBox(),
    frame.locator('.chinaums-v23-dialog').boundingBox(),
    frame.getByLabel('安全键盘', { selector: 'section' }).boundingBox(),
    frame
      .getByLabel('安全键盘', { selector: 'section' })
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          background: style.backgroundColor,
          paddingBottom: Number.parseFloat(style.paddingBottom),
        }
      }),
    frame
      .getByLabel('安全键盘', { selector: 'section' })
      .locator('button')
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().toJSON())),
  ])
  expect(outerBox).not.toBeNull()
  expect(stageBox).not.toBeNull()
  expect(dialogBox).not.toBeNull()
  expect(keyboardBox).not.toBeNull()
  expect(keyBoxes).toHaveLength(12)

  const outerBottom = outerBox!.y + outerBox!.height
  expect(stageBox!.y).toBeGreaterThanOrEqual(outerBox!.y - 1)
  expect(stageBox!.y + stageBox!.height).toBeCloseTo(outerBottom, 0)
  expect(dialogBox!.y).toBeGreaterThan(outerBox!.y)
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(outerBottom + 1)
  expect(keyboardBox!.y + keyboardBox!.height).toBeCloseTo(outerBottom, 0)
  expect(keyboardStyle.background).toBe('rgb(232, 232, 232)')
  expect(keyboardStyle.paddingBottom).toBeGreaterThanOrEqual(24)
  for (const keyBox of keyBoxes) {
    expect(outerBox!.y + keyBox.top).toBeGreaterThanOrEqual(outerBox!.y - 1)
    expect(outerBox!.y + keyBox.bottom).toBeLessThanOrEqual(outerBottom - 24 + 1)
  }
})

test('非目标 appId 保留原有 bottom-sheet outer frame', async ({ page }) => {
  await installMobileAuthSdkStub(page)
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto('/')
  await waitForAssistanceSdkFactory(page)
  await page.evaluate(() => {
    const sdk = window.AssistanceMobileAuth!.createAssistanceMobileAuthSdk({
      appId: '8a9481c79c05c8bd019ed8d7ab571df3',
      authWindowTitle: '海客四协议验收',
      useCustomKeyboard: true,
    })
    void sdk.openVerification().catch(() => undefined)
  })

  const outerFrame = page.locator('iframe[title="海客四协议验收"]')
  await expect(outerFrame).toBeVisible()
  await expect(outerFrame).not.toHaveAttribute('data-assistance-auth-viewport-modal')
  expect(
    await outerFrame.evaluate((element) => {
      const style = getComputedStyle(element)
      return (
        style.backgroundColor === 'rgb(255, 255, 255)' &&
        style.borderRadius === '24px 24px 0px 0px' &&
        style.boxShadow !== 'none'
      )
    }),
  ).toBe(true)

  const frame = await (await outerFrame.elementHandle())?.contentFrame()
  if (!frame) {
    throw new Error('non-target verification iframe did not expose a content frame')
  }
  await frame.waitForLoadState('domcontentloaded')
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  expect(await frame.getByTestId('chinaums-sheet-v23-root').count()).toBe(0)
  await enterVirtualIdLast4(frame, '1234')
  const customAgreements = frame.getByRole('checkbox')
  for (let index = 0; index < (await customAgreements.count()); index += 1) {
    await customAgreements.nth(index).check()
  }
  await frame.locator('[data-sdk-stub-click-target]').click()
  await expect.poll(() => readSubmitEvidence(frame)).toEqual({
    beforeSubmitResults: [true],
    submitClickEvents: [{ isTrusted: true, targetInsideOfficialControl: true }],
    submitKeyboardActivationEvents: [],
    syntheticSubmitClickCalls: 0,
  })
})

test('V23 不足四位展示精确错误，X 与删除回退保持顺序输入', async ({ page }) => {
  const frame = await openV23(page)
  const boxes = frame.locator('.chinaums-v23-id-box')
  expect(
    await boxes.nth(0).evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        background: style.backgroundColor,
        border: style.borderTopColor,
      }
    }),
  ).toEqual({
    background: 'rgb(254, 249, 245)',
    border: 'rgb(255, 187, 109)',
  })

  await enterVirtualIdLast4(frame, '12X')
  await frame.getByTestId('chinaums-v23-submit').click()
  await expect(frame.getByRole('alert')).toHaveText('请完整输入身份证后4位数字')
  await expect.poll(() => readBeforeSubmitResults(frame)).toEqual([false])
  expect(
    await boxes.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          background: style.backgroundColor,
          border: style.borderTopColor,
        }
      }),
    ),
  ).toEqual(
    Array.from({ length: 4 }, () => ({
      background: 'rgb(255, 245, 245)',
      border: 'rgb(255, 109, 109)',
    })),
  )

  await frame.getByRole('button', { name: '输入 9' }).click()
  await expect(frame.getByRole('alert')).toHaveCount(0)
  await expect(boxes.nth(0)).toHaveCSS('background-color', 'rgb(254, 249, 245)')
  await expect(frame.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'true')
  await frame.getByRole('button', { name: '删除' }).click()
  await expect(frame.getByRole('alert')).toHaveCount(0)
  await expect(frame.getByLabel('身份证后四位第 4 位')).toHaveText('')
  await expect(frame.getByTestId('chinaums-v23-hand')).toHaveAttribute('data-visible', 'false')
})

for (const {
  mode,
  expectedHarness,
} of [
  {
    mode: 'absent',
    expectedHarness: { onBeforeLoginCalls: 0, onStateChangeCalls: 0, log: [] },
  },
  {
    mode: 'before-login-only',
    expectedHarness: {
      onBeforeLoginCalls: 2,
      onStateChangeCalls: 0,
      log: [
        { callback: 'onBeforeLogin', event: 'idLast4Complete', calls: 1 },
        { callback: 'onBeforeLogin', event: 'idLast4Complete', calls: 2 },
      ],
    },
  },
  {
    mode: 'state-change-only',
    expectedHarness: {
      onBeforeLoginCalls: 0,
      onStateChangeCalls: 3,
      log: [
        { callback: 'onStateChange', event: 'idLast4Complete', calls: 1 },
        { callback: 'onStateChange', event: 'idLast4Incomplete', calls: 2 },
        { callback: 'onStateChange', event: 'idLast4Complete', calls: 3 },
      ],
    },
  },
  ...(['both', 'throw', 'reject'] as const).map((mode) => ({
    mode,
    expectedHarness: {
      onBeforeLoginCalls: 2,
      onStateChangeCalls: 3,
      log: [
        { callback: 'onStateChange', event: 'idLast4Complete', calls: 1 },
        { callback: 'onBeforeLogin', event: 'idLast4Complete', calls: 1 },
        { callback: 'onStateChange', event: 'idLast4Incomplete', calls: 2 },
        { callback: 'onStateChange', event: 'idLast4Complete', calls: 3 },
        { callback: 'onBeforeLogin', event: 'idLast4Complete', calls: 2 },
      ],
    },
  })),
] satisfies Array<{ mode: NotificationTestMode; expectedHarness: NotificationHarness }>) {
  test(`notification mode ${mode} 记录 complete/incomplete/complete 且不阻断 provider`, async ({ page }) => {
    const frame = await openV23(page, 'nested', mode)
    await enterVirtualIdLast4(frame, '1234')
    await frame.getByRole('button', { name: '删除' }).click()
    await frame.getByRole('button', { name: '输入 X' }).click()

    await expect.poll(() => readNotificationHarness(page)).toEqual(expectedHarness)
    await frame.getByTestId('chinaums-v23-submit').click()

    await expect.poll(() => readBeforeSubmitResults(frame)).toEqual([true])
  })
}
