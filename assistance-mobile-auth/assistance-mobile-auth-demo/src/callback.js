/**
 * 回跳页胶水代码（callback glue）
 *
 * 只负责「页面」：抓 DOM、把回跳结果画到屏幕上。
 * 所有接口逻辑都在 ./h5Redirect.js，本文件只调用它暴露的
 * resolveRedirectResult()，不含任何 /create、fetch 或 SDK 细节。
 */

import { resolveRedirectResult } from './h5Redirect.js'

/* 页面元素 */
const els = {
  statusCard: document.getElementById('status-card'),
  statusTitle: document.getElementById('status-title'),
  statusDescription: document.getElementById('status-description'),
  resultSection: document.getElementById('result-section'),
  identityName: document.getElementById('identity-name'),
  identityMobile: document.getElementById('identity-mobile'),
  identityIdCard: document.getElementById('identity-idcard'),
  resultPayload: document.getElementById('result-payload'),
}

/** 更新状态行。tone：waiting | success | error | cancelled */
function setStatus(tone, title, description) {
  els.statusCard.dataset.tone = tone
  els.statusTitle.textContent = title
  els.statusDescription.textContent = description
}

/** 展示脱敏身份信息 + 原始返回值 */
function showResult(identity, payload) {
  els.resultSection.hidden = false
  els.identityName.textContent = identity.displayName
  els.identityMobile.textContent = identity.maskedMobile
  els.identityIdCard.textContent = identity.maskedIdCard
  els.resultPayload.textContent = JSON.stringify(payload ?? null, null, 2)
}

async function handleLoad() {
  setStatus('waiting', '正在查询授权结果', '正在用回跳带回的 authToken 查询脱敏身份信息……')

  try {
    const outcome = await resolveRedirectResult()

    if (outcome.status === 'missing-token') {
      // URL 上没有 authToken：通常是直接打开了回跳页，而非从授权页正常回跳。
      setStatus('cancelled', '缺少 authToken', '当前地址未携带 authToken，请从发起页走 H5 转跳流程再回到本页。')
      return
    }

    showResult(outcome.identity, outcome.result)
    setStatus('success', '验证成功', outcome.message)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setStatus('error', '查询失败', message)
  }
}

handleLoad()
