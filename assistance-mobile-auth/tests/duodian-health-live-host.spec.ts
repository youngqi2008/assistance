import { expect, test, type Page } from '@playwright/test'
import { installDuodianOfficialStub, readyDuodian, enterId, openDuodianReader, waitForDuodianPresentation } from './duodian-health-helpers'
import { readCustomBootConfig } from './custom-page-helpers'
import { readShowAuthPageData, triggerInitControlSuccess } from './mobile-auth-flow-helpers'

const hostUrl = process.env.PLAYWRIGHT_LIVE_HOST_URL ?? 'http://127.0.0.1:4190/sign-pay-pro-temp/test-duodian-health-0.3.0.html'
test.beforeEach(async ({ page }) => {
  await installDuodianOfficialStub(page)
  await page.goto(hostUrl)
})
async function frameFor(page: Page) {
  const element = page.locator('iframe[data-assistance-auth-frame]')
  await expect(element).toHaveCount(1)
  const frame = await (await element.elementHandle())!.contentFrame()
  if (!frame) throw new Error('Live SDK iframe unavailable')
  await readyDuodian(page, frame)
  return frame
}
for (const size of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`live order host, embedded UI, continuous paragraph and reader return ${size.width}x${size.height}`, async ({ page }, info) => {
    await page.setViewportSize(size)
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))
    await expect(page.getByRole('heading', { name: '银商助理测试页' })).toBeVisible()
    await expect(page.locator('#authParams')).toHaveValue('')
    await expect(page.locator('#advanced')).not.toHaveAttribute('open')
    await expect(page.locator('#open')).toBeInViewport()
    await page.screenshot({ path: info.outputPath('live-host.png'), fullPage: true })
    await page.locator('#open').click()
    const frame = await frameFor(page)
    expect((await readCustomBootConfig(frame)).appId).toBe('8a9481c79c05c8bd019f6a0a6c002457')
    expect(await readShowAuthPageData(frame)).toMatchObject({ appId: '300013215094', authType: '0' })
    await expect(frame.locator('[data-custom-template="duodian-health"]')).toBeVisible()
    await expect(frame.locator('#ydrzSubmitControl')).toHaveCSS('background-color', 'rgb(226, 230, 226)')
    await expect(frame.locator('[data-keyboard]')).toBeHidden()
    await expect(frame.locator('#ydrzAgreementControl p')).toHaveText('已阅读并同意 《用户信息授权协议》 《中国移动认证服务条款》。')
    for (const selector of ['#ydrzAgreementControl p', '#ydrzTipsControl p']) {
      await expect(frame.locator(selector)).toHaveCSS('color', 'rgb(141, 141, 146)')
      await expect(frame.locator(selector)).toHaveCSS('font-size', '12px')
    }
    const flow = await frame.locator('[data-agreements]').evaluate(element => {
      function glyph(slot: string, last: boolean) {
        const walker = document.createTreeWalker(element.querySelector(slot)!, NodeFilter.SHOW_TEXT)
        const nodes: Text[] = []; let node: Node | null
        while ((node = walker.nextNode())) if (node.textContent?.trim()) nodes.push(node as Text)
        const text = last ? nodes.at(-1)! : nodes[0]
        const offset = last ? text.length - 1 : 0
        const range = document.createRange(); range.setStart(text, offset); range.setEnd(text, offset + 1)
        const rect = range.getBoundingClientRect(); return { x: rect.x, y: rect.y, right: rect.right, width: rect.width }
      }
      return { end: glyph('#ydrzAgreementControl', true), start: glyph('#ydrzTipsControl', false), right: element.getBoundingClientRect().right }
    })
    if (flow.end.right + flow.start.width <= flow.right + 1) expect(Math.abs(flow.start.y - flow.end.y)).toBeLessThanOrEqual(1)
    expect(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: info.outputPath('live-collapsed.png') })
    await enterId(frame, '10X')
    await waitForDuodianPresentation(page)
    await expect(frame.locator('[data-key="delete"]')).toBeInViewport()
    await page.screenshot({ path: info.outputPath('live-keyboard.png') })
    const reader = await openDuodianReader(frame)
    await expect(reader.locator('nav a')).toHaveCount(4)
    await reader.getByRole('button', { name: '关闭协议', exact: true }).click()
    await waitForDuodianPresentation(page)
    await expect(frame.locator('[data-id-value]')).toHaveValue('10X')
    await expect(frame.locator('[data-keyboard]')).toBeVisible()
    await page.screenshot({ path: info.outputPath('live-reader-return.png') })
    expect(requests.some(url => /\/examples\/|\/duodian-health\/.*\.(?:html|css|js)/.test(url))).toBe(false)
  })
}
test('rapid clicks create one session and reopening generates fresh private params', async ({ page }, info) => {
  const logs: string[] = []; page.on('console', message => logs.push(message.text()))
  await page.locator('#open').evaluate((button: HTMLButtonElement) => { button.click(); button.click(); button.click() })
  const first = await frameFor(page); const firstParams = await readShowAuthPageData(first)
  await first.locator('[data-close]').click()
  await expect(page.locator('#open')).toBeEnabled()
  await page.locator('#open').click()
  const second = await frameFor(page); const secondParams = await readShowAuthPageData(second)
  expect(secondParams!.traceId).not.toBe(firstParams!.traceId)
  expect(secondParams!.sign).not.toBe(firstParams!.sign)
  await enterId(second, '123X')
  await second.locator('[data-sdk-stub-click-target]').click()
  await triggerInitControlSuccess(second, 'MOCK_ONLY_PRIVATE_TOKEN', 'MOCK_ONLY_PRIVATE_KEY')
  await expect(page.locator('#status')).toHaveText('验证完成')
  await expect(page.locator('#resultCard')).toBeVisible()
  await expect(page.locator('#result')).toContainText('MOCK_ONLY_PRIVATE_TOKEN')
  await expect(page.locator('#result')).toContainText('MOCK_ONLY_PRIVATE_KEY')
  await expect(page.locator('#result')).toContainText('123X')
  const result = JSON.parse((await page.locator('#result').textContent())!)
  expect(result).toMatchObject({ status: 'success', token: 'MOCK_ONLY_PRIVATE_TOKEN', keyA: 'MOCK_ONLY_PRIVATE_KEY', idLast4: '123X' })
  for (const region of ['#resultCard', '#result', '#noticeCard', '#notices']) {
    await expect(page.locator(region)).toHaveClass(/rr-block/)
    await expect(page.locator(region)).toHaveAttribute('data-rrweb-sensitive', 'true')
  }
  const host = await page.evaluate(() => ({ text: document.body.textContent, local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage) }))
  for (const sign of [firstParams!.sign, secondParams!.sign]) expect(host.text).not.toContain(sign)
  for (const secret of [firstParams!.sign, secondParams!.sign, 'MOCK_ONLY_PRIVATE_TOKEN', 'MOCK_ONLY_PRIVATE_KEY', '123X']) {
    expect(host.local).not.toContain(secret); expect(host.session).not.toContain(secret)
    expect(logs.join('\n')).not.toContain(secret)
  }
  await page.screenshot({ path: info.outputPath('live-success-result.png'), fullPage: true })
})
test('invalid advanced JSON recovers and valid override plus native options reach SDK', async ({ page }) => {
  await page.locator('#advanced summary').click()
  await page.locator('#authParams').fill('{secret-input-invalid')
  await page.locator('#open').click()
  await expect(page.locator('#status')).toHaveText('参数格式有误，请检查高级设置中的 JSON')
  await expect(page.locator('#open')).toBeEnabled()
  await page.locator('#authParams').fill(JSON.stringify({ version: '3.0', appId: '300013215094', sign: 'override-private-sign', traceId: 'override-trace', timestamp: '20261011000000000', authType: '0', scope: '3ElementsAuthAssistFill' }))
  await page.locator('#agreements').fill(JSON.stringify([{ name: '客户追加协议', link: 'https://customer.invalid/terms' }]))
  await page.locator('#native').click()
  const frame = await frameFor(page)
  expect((await readShowAuthPageData(frame))!.traceId).toBe('override-trace')
  await expect(frame.locator('[data-close]')).toBeHidden()
  await expect(frame.locator('[data-keyboard]')).toBeHidden()
  await frame.locator('[data-id-value]').fill('123x')
  await expect(frame.locator('[data-id-value]')).toHaveValue('123X')
  await expect(frame.getByRole('checkbox', { name: '同意客户追加协议' })).toBeVisible()
  await expect(page.locator('#result')).not.toContainText('override-private-sign')
})
