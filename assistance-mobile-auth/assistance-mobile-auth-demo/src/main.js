/**
 * 演示页面胶水代码（host glue）
 *
 * 这里只负责「页面」：抓 DOM、绑按钮、把结果画到屏幕上。
 * 所有 JSSDK / 接口的接入逻辑都在 ./assistanceAuth.js（演示主角），
 * 本文件对它一无所知，只调用它暴露的 startAssistanceAuth()。
 */

import { startAssistanceAuth } from './assistanceAuth.js'
import { startH5RedirectAuth } from './h5Redirect.js'

/* 页面元素 */
const els = {
  startButton: document.getElementById('start-button'),
  redirectButton: document.getElementById('redirect-button'),
  statusCard: document.getElementById('status-card'),
  statusTitle: document.getElementById('status-title'),
  statusDescription: document.getElementById('status-description'),
  resultSection: document.getElementById('result-section'),
  identityBlock: document.getElementById('identity-block'),
  identityName: document.getElementById('identity-name'),
  identityMobile: document.getElementById('identity-mobile'),
  identityIdCard: document.getElementById('identity-idcard'),
  resultPayload: document.getElementById('result-payload'),
  noticeSection: document.getElementById('notice-section'),
  noticeList: document.getElementById('notice-list'),
}

/** 更新状态行。tone：waiting | success | cancelled | error */
function setStatus(tone, title, description) {
  els.statusCard.hidden = false
  els.statusCard.dataset.tone = tone
  els.statusTitle.textContent = title
  els.statusDescription.textContent = description
}

/** 追加一条实时提示（来自 onErrorNotice 回调，非终态） */
function appendNotice(payload) {
  els.noticeSection.hidden = false
  const item = document.createElement('li')
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  const code = payload && payload.code ? `[${payload.code}] ` : ''
  const message = (payload && payload.message) || '验证窗口提示'
  item.textContent = `${time} ${code}${message}`
  els.noticeList.appendChild(item)
}

/** 展示脱敏身份信息 + 原始返回值 */
function showResult(identity, payload) {
  els.resultSection.hidden = false
  els.identityBlock.hidden = false
  els.identityName.textContent = identity.displayName
  els.identityMobile.textContent = identity.maskedMobile
  els.identityIdCard.textContent = identity.maskedIdCard
  els.resultPayload.textContent = JSON.stringify(payload ?? null, null, 2)
}

/** 每次重新发起前，清空上一轮的结果与提示 */
function resetResultAreas() {
  els.resultSection.hidden = true
  els.identityBlock.hidden = true
  els.noticeSection.hidden = true
  els.noticeList.innerHTML = ''
}

async function handleStart() {
  resetResultAreas()
  els.startButton.disabled = true

  try {
    const { result, identity } = await startAssistanceAuth({
      onStatus: setStatus,
      onNotice: appendNotice,
    })
    showResult(identity, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    // 用户取消 / 关闭窗口 vs 真正的失败，按 message 区分（约定见 README）。
    if (message.includes('cancelled') || message.includes('closed')) {
      setStatus('cancelled', '已取消验证', '用户已关闭或取消本次身份验证，可重新点击按钮发起。')
    } else {
      setStatus('error', '验证失败', message)
    }
  } finally {
    els.startButton.disabled = false
  }
}

els.startButton.addEventListener('click', handleStart)

/**
 * H5 转跳方式：调用 startH5RedirectAuth() 后浏览器会整页跳转到我方托管授权页，
 * 正常情况下本页随即被替换。只有在跳转前（如 /create 失败）才会回到这里，
 * 此时把错误展示到状态行；按钮在等待期间置灰避免重复点击。
 */
async function handleRedirect() {
  resetResultAreas()
  els.redirectButton.disabled = true
  setStatus('waiting', '正在发起转跳', '正在申请 launchToken，随后将跳转到我方托管授权页……')

  try {
    await startH5RedirectAuth()
    // 成功时浏览器已离开本页，这里通常不会执行到。
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setStatus('error', '发起转跳失败', message)
    els.redirectButton.disabled = false
  }
}

els.redirectButton.addEventListener('click', handleRedirect)
