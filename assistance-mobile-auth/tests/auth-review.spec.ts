import { expect, test } from '@playwright/test'

import {
  expectInitControlReady,
  openStubbedVerification,
  triggerShowAuthPageSuccess,
} from './mobile-auth-flow-helpers'

const selfEnterSmsCopies = ['非本机短信校验', '输入手机号', '发送验证码', '重新获取验证码'] as const
const visibleSdkSlotIds = ['ydrzPhoneControl', 'ydrzTipsControl', 'ydrzSubmitControl'] as const

async function expectMountedSdkSlot(frame: import('@playwright/test').Frame, id: (typeof visibleSdkSlotIds)[number]) {
  const slot = frame.locator(`#${id}`)

  await expect(slot).toBeAttached()
  await expect(slot.locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " sr-only ")]')).toHaveCount(0)
  await expect(slot.locator('xpath=ancestor-or-self::*[@aria-hidden="true"]')).toHaveCount(0)
}

test('auth-review smoke shows a focused auth-first default screen without self-enter sms fallback', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main', { name: '订单支付' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '银商助理测试页' })).toBeVisible()
  await expect(page.getByText('快捷支付签约订单')).toBeVisible()

  await expect(page.getByText(/^SDK Ready$/i)).toHaveCount(0)
  await expect(page.getByText('Phase 2 · SDK Ready')).toHaveCount(0)
  await expect(page.getByText('主操作区')).toHaveCount(0)
  await expect(page.getByText('提交授权操作')).toHaveCount(0)
  for (const copy of selfEnterSmsCopies) {
    await expect(page.getByText(copy)).toHaveCount(0)
  }

  const frame = await openStubbedVerification(page, 'success')

  await expect(frame.getByRole('main', { name: '确认身份信息' })).toBeVisible()
  await expect(frame.getByRole('heading', { name: '确认身份信息' })).toBeVisible()
  await triggerShowAuthPageSuccess(frame)
  await expectInitControlReady(frame)
  await expect(frame.getByRole('heading', { name: '输入身份证后4位' })).toBeVisible()
  await expect(frame.getByLabel('身份证后四位输入')).toBeVisible()

  for (const id of visibleSdkSlotIds) {
    await expectMountedSdkSlot(frame, id)
  }
  await expect(frame.locator('#ydrzStateControl')).toBeAttached()

  await expect(frame.locator('#ydrzAgreementControl')).toBeAttached()

  await expect(frame.locator('#ydrzYZMControl')).toBeAttached()
  await expect(frame.locator('#ydrzYZMBtnControl')).toBeAttached()

  await expect(frame.getByText('非本机短信校验')).toHaveCount(0)
  await expect(frame.getByRole('heading', { name: '短信验证手机号' })).toHaveCount(0)
  await expect(frame.getByRole('heading', { name: '短信验证', exact: true })).toHaveCount(0)
  for (const copy of selfEnterSmsCopies) {
    await expect(frame.getByText(copy)).toHaveCount(0)
  }

  await expect(frame.getByRole('button', { name: /^确认$/ })).toBeVisible()
})
