import { expect, test, type Frame, type Page, type TestInfo } from '@playwright/test'

import {
  expectInitControlReady,
  installMobileAssistantRoutes,
  installMobileAuthSdkStub,
  installSessionRoutes,
  triggerInitControlSuccess,
  triggerShowAuthPageSuccess,
  waitForAssistanceSdkFactory,
  type StubSubmitElementTag,
} from './mobile-auth-flow-helpers'

const haikeAppId = '8a9481c79c05c8bd019ed8d7ab571df3'

type HaikeInlineSession = {
  frame: Frame
  frameElement: ReturnType<Page['locator']>
  renderTo: ReturnType<Page['getByTestId']>
  initialContainerMetrics: { width: number; height: number }
  initialFrameMetrics: { width: number; height: number }
}

async function openHaikeInline(
  page: Page,
  width: number,
  submitElementTag: StubSubmitElementTag = 'button',
): Promise<HaikeInlineSession> {
  await installMobileAuthSdkStub(page, {
    agreementFixture: 'v23-production',
    agreementOverlay: true,
    submitElementTag,
  })
  await installSessionRoutes(page)
  await installMobileAssistantRoutes(page, 'success')
  await page.goto('/sign-pay-pro/test-page-hk')
  await waitForAssistanceSdkFactory(page)

  await expect(page.getByTestId('haike-inline-test-trigger')).toBeVisible()
  await expect(page.locator('.vc-switch')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Haike JSSDK 状态与结果' })).toHaveClass(/\brr-block\b/)
  await expect(page.getByRole('log', { name: 'Haike 回调日志' })).toHaveClass(/\brr-block\b/)
  const rrwebMonitor = page.getByRole('region', { name: 'rrweb 事件监视器' })
  await expect(rrwebMonitor).toHaveClass(/\brr-block\b/)
  const rrwebAttachCount = Number(await page.getByTestId('rrweb-iframe-attach-events').textContent())

  const fixture = page.getByTestId('haike-inline-test-fixture')
  const renderTo = page.getByTestId('haike-inline-test-render-to')
  await fixture.evaluate((element, fixtureWidth) => {
    element.setAttribute('style', [
      'position: fixed',
      'z-index: 10',
      'top: 80px',
      'left: 0',
      `width: ${fixtureWidth}px`,
      'background: transparent',
    ].join(';'))
  }, width)

  await page.getByTestId('haike-inline-test-trigger').click()

  const frameElement = renderTo.locator('iframe[data-assistance-auth-frame="true"]')
  await expect(frameElement).toBeVisible()
  await expect.poll(async () => Number(await page.getByTestId('rrweb-iframe-attach-events').textContent())).toBeGreaterThan(rrwebAttachCount)
  const initialContainerMetrics = await renderTo.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect()
    return { width, height }
  })
  const initialFrameMetrics = await frameElement.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect()
    return { width, height }
  })
  expect(initialFrameMetrics).toEqual(initialContainerMetrics)
  const frame = await (await frameElement.elementHandle())?.contentFrame()
  if (!frame) {
    throw new Error('Haike inline verification iframe did not expose a content frame')
  }

  await frame.waitForLoadState('domcontentloaded')
  await expect(frame.locator('.vc-switch')).toBeVisible()
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(frame.getByTestId('haike-inline-root')).toBeVisible()
  await expect(page.getByRole('log', { name: 'Haike 回调日志' })).toContainText('onPhoneReady · 182****2222')

  return { frame, frameElement, renderTo, initialContainerMetrics, initialFrameMetrics }
}

async function expectHaikeAgreementOverlayFillsAuthorizationFrame(frame: Frame) {
  const bounds = await frame.evaluate(() => {
    const overlay = document.querySelector<HTMLElement>('.ydrz-confirm-bg-wrap')
    const panel = document.querySelector<HTMLElement>('.ydrz-confirm-iframe')
    if (!overlay || !panel) {
      throw new Error('Missing Haike agreement overlay or reading panel')
    }

    const toBounds = (element: HTMLElement) => {
      const { left, top, width, height } = element.getBoundingClientRect()
      return { left, top, width, height }
    }

    return {
      viewport: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      overlay: toBounds(overlay),
      panel: toBounds(panel),
    }
  })

  for (const surface of [bounds.overlay, bounds.panel]) {
    expect(surface.left).toBeCloseTo(0, 3)
    expect(surface.top).toBeCloseTo(0, 3)
    expect(surface.width).toBeCloseTo(bounds.viewport.width, 3)
    expect(surface.height).toBeCloseTo(bounds.viewport.height, 3)
  }
}

test('Haike inline agreement reader fills the existing iframe and preserves the ready card after close', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const {
    frame,
    frameElement,
    renderTo,
    initialContainerMetrics,
    initialFrameMetrics,
  } = await openHaikeInline(page, 390)
  const input = frame.getByRole('textbox', { name: '身份证后四位' })
  await input.fill('12x9')
  await expect(frame.getByTestId('haike-inline-submit')).toHaveAttribute('data-disabled', 'false')
  const initialInitControlCalls = await frame.evaluate(() => (
    (window as Window & { __mobileAuthHarness?: { initControlCalls: unknown[] } })
      .__mobileAuthHarness?.initControlCalls.length ?? 0
  ))

  await frame.getByText('《用户信息授权协议》', { exact: true }).click()
  const overlay = frame.locator('.ydrz-confirm-bg-wrap')
  const readerElement = overlay.getByTitle('用户信息授权协议内容')
  await expect(overlay).toBeVisible()
  await expect(readerElement).toBeVisible()
  await expect(overlay).toHaveCSS('position', 'fixed')
  await expectHaikeAgreementOverlayFillsAuthorizationFrame(frame)
  expect(await readerElement.evaluate((element) => {
    const style = getComputedStyle(element)
    const panel = element.parentElement!
    const header = panel.querySelector<HTMLElement>('.ydrz-confirm-header')!
    return {
      minHeight: style.minHeight,
      readerHeight: element.getBoundingClientRect().height,
      panelHeight: panel.getBoundingClientRect().height,
      headerHeight: header.getBoundingClientRect().height,
    }
  })).toEqual(expect.objectContaining({ minHeight: '0px' }))
  expect(await readerElement.evaluate((element) => {
    const panel = element.parentElement!
    const header = panel.querySelector<HTMLElement>('.ydrz-confirm-header')!
    return Math.abs(
      element.getBoundingClientRect().height + header.getBoundingClientRect().height
        - panel.getBoundingClientRect().height,
    ) < 1
  })).toBe(true)
  await expect(frame.evaluate(() => {
    const hand = document.querySelector<HTMLElement>('[data-testid="haike-inline-hand"]')
    if (!hand) {
      throw new Error('Missing Haike hand image')
    }
    const rect = hand.getBoundingClientRect()
    return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      ?.closest('.ydrz-confirm-bg-wrap') !== null
  })).resolves.toBe(true)

  const reader = await (await readerElement.elementHandle())?.contentFrame()
  if (!reader) {
    throw new Error('Haike agreement reader iframe did not expose a content frame')
  }
  await expect(reader.getByRole('button')).toHaveText([
    '《用户认证服务隐私政策》',
    '《个人信息收集清单》',
    '《敏感个人信息处理规则》',
    '《第三方共享个人信息清单》',
  ])
  await reader.getByRole('button', { name: '《第三方共享个人信息清单》' }).click()
  await expect(reader.getByRole('button', { name: '《蓝鲸保隐私政策》' })).toBeVisible()
  await reader.getByRole('button', { name: '《蓝鲸保隐私政策》' }).click()
  await expect(reader.getByRole('heading', { name: '《蓝鲸保隐私政策》' })).toBeVisible()
  await reader.getByRole('button', { name: '返回协议列表' }).click()
  await expect(reader.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeVisible()
  await expect(reader.locator('main > div')).toHaveCSS('overflow-y', 'auto')
  await attachVisualArtifact(page, testInfo, 'haike-inline-agreement-open')

  await overlay.getByRole('button', { name: '关闭' }).click()
  await expect(overlay).toHaveCount(0)
  await expect(input).toHaveValue('12X9')
  await expect(frame.getByTestId('haike-inline-submit')).toHaveAttribute('data-disabled', 'false')
  expect(await frame.evaluate(() => (
    (window as Window & { __mobileAuthHarness?: { initControlCalls: unknown[] } })
      .__mobileAuthHarness?.initControlCalls.length ?? 0
  ))).toBe(initialInitControlCalls)
  expect(await frameElement.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect()
    return { width, height }
  })).toEqual(initialFrameMetrics)
  expect(await renderTo.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect()
    return { width, height }
  })).toEqual(initialContainerMetrics)
  await attachVisualArtifact(page, testInfo, 'haike-inline-agreement-closed')

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 430, height: 932 },
  ]) {
    await page.setViewportSize(viewport)
    const session = await openHaikeInline(page, viewport.width)
    await session.frame.getByText('《用户信息授权协议》', { exact: true }).click()
    await expectHaikeAgreementOverlayFillsAuthorizationFrame(session.frame)
    await session.frame.getByRole('button', { name: '关闭' }).click()
    expect(await session.frameElement.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect()
      return { width, height }
    })).toEqual(session.initialFrameMetrics)
    expect(await session.renderTo.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect()
      return { width, height }
    })).toEqual(session.initialContainerMetrics)
  }
})

async function readSubmitEvidence(frame: Frame) {
  return frame.evaluate(() => {
    const harness = (window as Window & {
      __mobileAuthHarness?: {
        beforeSubmitResults: boolean[]
        submitClickEvents: Array<{ isTrusted: boolean; targetInsideOfficialControl: boolean }>
        syntheticSubmitClickCalls: number
      }
    }).__mobileAuthHarness

    return {
      beforeSubmitResults: harness?.beforeSubmitResults ?? [],
      submitClickEvents: harness?.submitClickEvents ?? [],
      syntheticSubmitClickCalls: harness?.syntheticSubmitClickCalls ?? 0,
    }
  })
}

async function attachVisualArtifact(page: Page, testInfo: TestInfo, name: string) {
  const artifactDirectory = process.env.HAIKE_INLINE_ARTIFACT_DIR
  const path = artifactDirectory
    ? `${artifactDirectory}/${name}.png`
    : testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage: true })
  await testInfo.attach(name, { path, contentType: 'image/png' })
}

async function expectHaikeCardSurfacesWithinVisibleBounds(frame: Frame) {
  const visibility = await frame.evaluate(() => {
    const card = document.querySelector<HTMLElement>('[data-testid="haike-inline-card"]')
    if (!card) {
      throw new Error('Missing Haike inline card')
    }

    const cardRect = card.getBoundingClientRect()
    const iframeRect = {
      left: 0,
      top: 0,
      right: document.documentElement.clientWidth,
      bottom: document.documentElement.clientHeight,
    }
    const isWithin = (element: HTMLElement, boundary: DOMRect | typeof iframeRect) => {
      const rect = element.getBoundingClientRect()
      const tolerance = 0.5
      return (
        rect.left >= boundary.left - tolerance
        && rect.top >= boundary.top - tolerance
        && rect.right <= boundary.right + tolerance
        && rect.bottom <= boundary.bottom + tolerance
      )
    }
    const requiredSurfaces = {
      phone: '[data-testid="haike-inline-phone"]',
      idGrid: '[aria-label="身份证后四位输入"]',
      submit: '[data-testid="haike-inline-submit"]',
      hand: '[data-testid="haike-inline-hand"]',
      agreementTail: '#ydrzTipsControl',
    }

    return Object.fromEntries(Object.entries(requiredSurfaces).map(([name, selector]) => {
      const element = document.querySelector<HTMLElement>(selector)
      if (!element) {
        throw new Error(`Missing Haike inline surface: ${name}`)
      }

      return [name, {
        withinCard: isWithin(element, cardRect),
        withinIframe: isWithin(element, iframeRect),
      }]
    }))
  })

  expect(visibility).toEqual({
    phone: { withinCard: true, withinIframe: true },
    idGrid: { withinCard: true, withinIframe: true },
    submit: { withinCard: true, withinIframe: true },
    hand: { withinCard: true, withinIframe: true },
    agreementTail: { withinCard: true, withinIframe: true },
  })
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const) {
  test(`${viewport.width}px Haike inline renders ready empty and filled card without overflow`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const {
      frame,
      frameElement,
      renderTo,
      initialContainerMetrics,
      initialFrameMetrics,
    } = await openHaikeInline(page, viewport.width)

    await expect(renderTo.locator(':scope > iframe[data-assistance-auth-frame="true"]')).toHaveCount(1)
    await expect(frameElement).toHaveAttribute('data-assistance-auth-inline', 'true')
    expect(new URL(await frameElement.getAttribute('src') ?? '').searchParams.get('appId')).toBe(haikeAppId)
    expect(new URL(await frameElement.getAttribute('src') ?? '').searchParams.get('layout')).toBe('inline')
    await expect(page.locator('[data-assistance-auth-overlay="true"]')).toHaveCount(0)
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
    expect(await frameElement.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect()
      return { width, height }
    })).toEqual(initialFrameMetrics)
    expect(await renderTo.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect()
      return { width, height }
    })).toEqual(initialContainerMetrics)
    expect(await frameElement.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        background: style.backgroundColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        borderWidth: style.borderWidth,
      }
    })).toEqual({
      background: 'rgba(0, 0, 0, 0)',
      borderRadius: '0px',
      boxShadow: 'none',
      borderWidth: '0px',
    })

    const card = frame.getByTestId('haike-inline-card')
    const input = frame.getByRole('textbox', { name: '身份证后四位' })
    await expect(card).toHaveCount(1)
    expect(await frame.evaluate(() => {
      const backgroundColor = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector)
        if (!element) {
          throw new Error(`Missing Haike inline surface: ${selector}`)
        }

        return getComputedStyle(element).backgroundColor
      }

      return {
        html: getComputedStyle(document.documentElement).backgroundColor,
        body: getComputedStyle(document.body).backgroundColor,
        root: backgroundColor('#root'),
        windowRoot: backgroundColor('[data-app="mobile-auth-verification-window"][data-haike-inline="true"]'),
        haikeRoot: backgroundColor('[data-testid="haike-inline-root"]'),
        measure: backgroundColor('.haike-inline-measure'),
        card: backgroundColor('[data-testid="haike-inline-card"]'),
      }
    })).toEqual({
      html: 'rgba(0, 0, 0, 0)',
      body: 'rgba(0, 0, 0, 0)',
      root: 'rgba(0, 0, 0, 0)',
      windowRoot: 'rgba(0, 0, 0, 0)',
      haikeRoot: 'rgba(0, 0, 0, 0)',
      measure: 'rgba(0, 0, 0, 0)',
      card: 'rgb(255, 255, 255)',
    })
    await expect(frame.getByRole('heading', { name: /输入本人\s*身份证后四位/ })).toHaveCount(0)
    await expect(frame.getByTestId('haike-title-arrow-left')).toHaveCount(0)
    await expect(frame.getByTestId('haike-title-arrow-right')).toHaveCount(0)
    await expect(frame.getByLabel('保障开通进度')).toHaveCount(0)
    await expect(frame.getByTestId('haike-inline-phone')).toBeVisible()
    await expect(frame.locator('#ydrzPhoneControl')).toBeVisible()
    await expect(frame.locator('#ydrzPhoneControl')).toContainText('182****2222')
    await expect(frame.getByLabel('身份证后四位输入').locator('[aria-label^="身份证后四位第"]')).toHaveCount(4)
    await expect(frame.getByTestId('haike-inline-submit')).toContainText('立即保障')
    await expect(frame.getByTestId('haike-inline-hand')).toHaveAttribute('data-visible', 'true')
    await expect(frame.getByTestId('compact-agreement-panel')).toBeVisible()
    expect(await frame.locator('#ydrzPhoneControl span').evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        textAlign: style.textAlign,
      }
    })).toEqual({
      color: 'rgb(255, 99, 63)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      textAlign: 'center',
    })
    await expect(frame.getByText('《用户信息授权协议》', { exact: true })).toBeVisible()
    await expect(frame.getByText('《中国移动认证服务条款》', { exact: true })).toBeVisible()
    await expect(frame.getByText(/为方便您快速完成实名认证/)).toBeVisible()
    expect(await frame.evaluate(() => {
      const typography = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector)
        if (!element) {
          throw new Error(`Missing injected Haike agreement surface: ${selector}`)
        }

        const style = getComputedStyle(element)
        return { fontSize: style.fontSize, lineHeight: style.lineHeight }
      }

      return {
        agreement: typography('#ydrzAgreementControl'),
        agreementText: typography('#ydrzAgreementControl p'),
        agreementLink: typography('#ydrzAgreementControl a'),
        tips: typography('#ydrzTipsControl'),
        tipsText: typography('#ydrzTipsControl p'),
      }
    })).toEqual({
      agreement: { fontSize: '12px', lineHeight: '20px' },
      agreementText: { fontSize: '12px', lineHeight: '20px' },
      agreementLink: { fontSize: '12px', lineHeight: '20px' },
      tips: { fontSize: '12px', lineHeight: '20px' },
      tipsText: { fontSize: '12px', lineHeight: '20px' },
    })
    expect(await frame.getByRole('button', { name: '关闭' }).count()).toBe(0)
    expect(await frame.getByText('选择其他方式', { exact: true }).count()).toBe(0)
    expect(await frame.getByRole('button', { name: /输入 [0-9X]|删除/ }).count()).toBe(0)
    expect(await frame.evaluate(() => document.activeElement?.getAttribute('aria-label'))).not.toBe('身份证后四位')
    await expect(frame.getByLabel('身份证后四位第 1 位')).toHaveAttribute('data-state', 'empty')
    await expectHaikeCardSurfacesWithinVisibleBounds(frame)
    await attachVisualArtifact(page, testInfo, `haike-inline-${viewport.width}-ready-empty`)

    await input.fill('0x9A1!2')
    await expect(input).toHaveValue('0X91')
    await expect(page.getByRole('log', { name: 'Haike 回调日志' })).toContainText('onStateChange · idLast4Complete')
    await expect(page.getByRole('log', { name: 'Haike 回调日志' })).toContainText('onBeforeLogin')
    await expect(frame.getByLabel('身份证后四位第 1 位')).toHaveText('0')
    await expect(frame.getByLabel('身份证后四位第 2 位')).toHaveText('X')
    await expect(frame.getByLabel('身份证后四位第 3 位')).toHaveText('9')
    await expect(frame.getByLabel('身份证后四位第 4 位')).toHaveText('1')
    await expectHaikeCardSurfacesWithinVisibleBounds(frame)
    await attachVisualArtifact(page, testInfo, `haike-inline-${viewport.width}-filled`)

    expect(await frameElement.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect()
      return { width, height }
    })).toEqual(initialFrameMetrics)
    expect(await renderTo.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect()
      return { width, height }
    })).toEqual(initialContainerMetrics)

    expect(await frame.evaluate(() => ({
      documentHorizontal: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      bodyHorizontal: document.body.scrollWidth <= document.body.clientWidth,
      documentVertical: document.documentElement.scrollHeight <= document.documentElement.clientHeight,
      bodyVertical: document.body.scrollHeight <= document.body.clientHeight,
    }))).toEqual({
      documentHorizontal: true,
      bodyHorizontal: true,
      documentVertical: true,
      bodyVertical: true,
    })
  })
}

for (const submitElementTag of [
  'button',
  'input',
  'a',
  'div',
  'nested',
  'official-nested',
] as const) {
  test(`Haike inline ${submitElementTag} provider receives one direct trusted click`, async ({ page }) => {
    const { frame } = await openHaikeInline(page, 390, submitElementTag)
    const submit = frame.getByTestId('haike-inline-submit')
    const officialTarget = frame.locator('[data-sdk-stub-click-target]')
    await expect(submit).toHaveAttribute('data-disabled', 'true')
    await expect(submit).toHaveAttribute('inert', '')
    await expect(officialTarget).toHaveAttribute('aria-disabled', 'true')
    await expect(officialTarget).toHaveCSS('pointer-events', 'none')

    await frame.getByRole('textbox', { name: '身份证后四位' }).fill('12x9')
    await expect(submit).toHaveAttribute('data-disabled', 'false')
    await expect(submit).not.toHaveAttribute('inert', '')
    await expect(officialTarget).toHaveAttribute('aria-disabled', 'false')
    await expect(officialTarget).toHaveCSS('pointer-events', 'auto')

    if (submitElementTag === 'official-nested') {
      expect(await frame.evaluate(() => {
        const readTypography = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector)
          if (!element) {
            throw new Error(`Missing official nested Haike submit surface: ${selector}`)
          }

          const style = getComputedStyle(element)
          return {
            backgroundColor: style.backgroundColor,
            backgroundImage: style.backgroundImage,
            boxShadow: style.boxShadow,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
          }
        }

        return {
          wrapper: readTypography('#ydrzSubmitControl .ydrz-submitbtn-wrap'),
          label: readTypography('#ydrzSubmitControl .ydrz-submitbtn-text'),
        }
      })).toEqual({
        wrapper: {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          backgroundImage: 'none',
          boxShadow: 'none',
          fontFamily: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
          fontSize: '22.62px',
          fontWeight: '800',
          lineHeight: '22.62px',
        },
        label: {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          backgroundImage: 'none',
          boxShadow: 'none',
          fontFamily: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
          fontSize: '22.62px',
          fontWeight: '800',
          lineHeight: '22.62px',
        },
      })
    }

    await submit.click()

    await expect.poll(() => readSubmitEvidence(frame)).toEqual({
      beforeSubmitResults: [true],
      submitClickEvents: [{ isTrusted: true, targetInsideOfficialControl: true }],
      syntheticSubmitClickCalls: 0,
    })
    await expect(officialTarget).toHaveAttribute('aria-disabled', 'true')
  })
}

test('Haike inline retains its terminal iframe, then the dedicated fixture cleans it before a new open', async ({ page }) => {
  const { frame, frameElement, renderTo } = await openHaikeInline(page, 390)
  const previousFrame = await frameElement.elementHandle()
  if (!previousFrame) {
    throw new Error('Expected the original Haike inline iframe before terminal cleanup')
  }
  await frame.getByRole('textbox', { name: '身份证后四位' }).fill('1234')
  await frame.getByTestId('haike-inline-submit').click()
  await triggerInitControlSuccess(frame, 'inline-terminal-token')
  await expect(page.getByRole('log', { name: 'Haike 回调日志' })).toContainText('onSuccess')

  await expect(frameElement).toBeAttached()
  await expect(renderTo.locator('iframe[data-assistance-auth-frame="true"]')).toHaveCount(1)

  const trigger = page.getByTestId('haike-inline-test-trigger')
  await expect(trigger).toBeEnabled()
  await trigger.evaluate((element) => {
    ;(element as HTMLButtonElement).click()
  })
  await expect(renderTo.locator('iframe[data-assistance-auth-frame="true"]')).toHaveCount(1)
  await expect.poll(() => previousFrame.evaluate((element) => element.isConnected)).toBe(false)
})
