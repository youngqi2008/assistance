import { expect, test } from '@playwright/test'

const liveTempBaseUrl = process.env.PLAYWRIGHT_LIVE_TEMP_BASE_URL
const deployCheck = process.env.PLAYWRIGHT_DEPLOY_CHECK
const haikeAppId = '8a9481c79c05c8bd019ed8d7ab571df3'
const tiantianyoubaoAppId = '8a9481c79c05c8bd019f6f42956924a0'

test('deployed Haike appId exposes all four agreements and nested privacy navigation', async ({ page }) => {
  test.skip(!liveTempBaseUrl, 'PLAYWRIGHT_LIVE_TEMP_BASE_URL is required for live deployment smoke coverage')

  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(`${liveTempBaseUrl}/test-page?deployCheck=${deployCheck}`)
  await expect(page.getByText('测试海客四协议（指定 appId）', { exact: true })).toBeHidden()

  const agreementUrl = new URL(`${liveTempBaseUrl}/verification`)
  agreementUrl.searchParams.set('flow', 'agreement')
  agreementUrl.searchParams.set('doc', 'entry')
  agreementUrl.searchParams.set('appId', haikeAppId)
  agreementUrl.searchParams.set('deployCheck', deployCheck ?? '')
  await page.goto(agreementUrl.toString())

  const entryAgreements = [
    '《用户认证服务隐私政策》',
    '《个人信息收集清单》',
    '《敏感个人信息处理规则》',
    '《第三方共享个人信息清单》',
  ]
  await expect(page.getByRole('button')).toHaveText(entryAgreements)

  await page.getByRole('button', { name: '《第三方共享个人信息清单》' }).click()
  await expect(page.getByRole('heading', { name: '《第三方共享个人信息清单》' })).toBeVisible()
  const sharingTable = page.getByRole('table')
  await expect(sharingTable.getByText('海客（天津）保险经纪有限公司', { exact: true })).toBeVisible()
  await expect(sharingTable.getByText('4000-161-100', { exact: true })).toBeVisible()
  await expect(sharingTable.getByRole('button', { name: '《蓝鲸保隐私政策》' })).toBeVisible()
  await expect(sharingTable.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeVisible()

  await page.getByRole('button', { name: '《蓝鲸保隐私政策》' }).click()
  await expect(page.getByRole('heading', { name: '《蓝鲸保隐私政策》' })).toBeVisible()
  await expect(page).toHaveURL(/nestedDoc=haike-v2-privacy-policy/)
  await page.getByRole('button', { name: '返回协议列表' }).click()
  await expect(page.getByRole('heading', { name: '《第三方共享个人信息清单》' })).toBeVisible()

  await page.getByRole('button', { name: '《中国移动认证梧桐数盾隐私政策》' }).click()
  await expect(page.getByRole('heading', { name: '《中国移动认证梧桐数盾隐私政策》' })).toBeVisible()
  await expect(page).toHaveURL(/nestedDoc=haike-v2-cmcc-privacy-policy/)
  await page.getByRole('button', { name: '返回协议列表' }).click()
  await expect(page.getByRole('heading', { name: '《第三方共享个人信息清单》' })).toBeVisible()

  await page.getByRole('button', { name: '返回协议列表' }).click()
  await expect(page.getByRole('button')).toHaveText(entryAgreements)
  expect(pageErrors).toEqual([])
})

test('deployed zidingyi appId exposes the Tiantianyoubao agreement profile', async ({ page }) => {
  test.skip(!liveTempBaseUrl, 'PLAYWRIGHT_LIVE_TEMP_BASE_URL is required for live deployment smoke coverage')

  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await page.goto(`${liveTempBaseUrl}/test-page?deployCheck=${deployCheck}`)
  await expect(page.getByRole('button', {
    name: '测试银联三要素皮肤（zidingyi）',
  })).toBeVisible()

  const agreementUrl = new URL(`${liveTempBaseUrl}/assist/0.2.0/verification`)
  agreementUrl.searchParams.set('flow', 'agreement')
  agreementUrl.searchParams.set('doc', 'entry')
  agreementUrl.searchParams.set('appId', tiantianyoubaoAppId)
  agreementUrl.searchParams.set('deployCheck', deployCheck ?? '')
  await page.goto(agreementUrl.toString())

  const entryAgreements = [
    '《用户认证服务隐私政策》',
    '《个人信息收集清单》',
    '《敏感个人信息处理规则》',
    '《第三方共享个人信息清单》',
  ]
  await expect(page.getByRole('button')).toHaveText(entryAgreements)

  await page.getByRole('button', { name: '《第三方共享个人信息清单》' }).click()
  await expect(page.getByRole('heading', {
    name: '《第三方共享个人信息清单》',
  })).toBeVisible()
  const sharingTable = page.getByRole('table')
  await expect(sharingTable.getByText(
    '天天有保（湖南）保险经纪服务有限公司',
    { exact: true },
  )).toBeVisible()
  await expect(sharingTable.getByText('010-87227385', { exact: true })).toBeVisible()
  await expect(sharingTable.getByRole('button', { name: '《个人隐私协议》' }))
    .toBeVisible()
  await expect(sharingTable.getByRole('button', {
    name: '《中国移动认证梧桐数盾隐私政策》',
  })).toBeVisible()

  await page.getByRole('button', { name: '《个人隐私协议》' }).click()
  await expect(page.getByRole('heading', { name: '《个人隐私协议》' })).toBeVisible()
  await expect(page).toHaveURL(/nestedDoc=tiantianyoubao-v2-privacy-policy/)
  await expect(page.getByText('天天有保（湖南）保险经纪服务有限公司', {
    exact: false,
  })).toBeVisible()
  await page.getByRole('button', { name: '返回协议列表' }).click()

  await page.getByRole('button', {
    name: '《中国移动认证梧桐数盾隐私政策》',
  }).click()
  await expect(page.getByRole('heading', {
    name: '《中国移动认证梧桐数盾隐私政策》',
  })).toBeVisible()
  await expect(page).toHaveURL(/nestedDoc=tiantianyoubao-v2-cmcc-privacy-policy/)

  expect(pageErrors).toEqual([])
})
