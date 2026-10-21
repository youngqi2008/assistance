// 尽力而为的网络类型探测，用于在 precheck 的 ambiguous 场景（ALL_CARRIERS_FAILED / 103111）
// 区分「WiFi」与「在蜂窝但非移动号码」。分层来源（命中即止）：
//   1) 微信内置浏览器：wx.getNetworkType（异步回调，带超时兜底）
//   2) Network Information API：navigator.connection.type（Android Chromium 系）
//   3) 兜底 unknown（iOS Safari / 桌面 Safari / Firefox 等均无可靠来源）
// 注意：这是概率性增强，并非 100% 可靠——iOS WebKit 拿不到网络类型，统一返回 unknown。

export type DetectedNetworkType = 'wifi' | 'cellular' | 'unknown'

interface WeixinBridge {
  getNetworkType?: (opts: {
    success?: (res: { networkType?: string }) => void
    fail?: () => void
    complete?: () => void
  }) => void
}

const WECHAT_TIMEOUT_MS = 600

// 微信 networkType: wifi / 2g / 3g / 4g / 5g / none / unknown
function mapWeChatNetworkType(value: string | undefined): DetectedNetworkType | null {
  if (!value) {
    return null
  }
  const v = value.toLowerCase()
  if (v === 'wifi') {
    return 'wifi'
  }
  if (v === '2g' || v === '3g' || v === '4g' || v === '5g') {
    return 'cellular'
  }
  return null // none / unknown：不作判定，交给下一层
}

function detectFromWeChat(): Promise<DetectedNetworkType | null> {
  const wx = typeof window !== 'undefined' ? (window as unknown as { wx?: WeixinBridge }).wx : undefined
  if (!wx || typeof wx.getNetworkType !== 'function') {
    return Promise.resolve(null)
  }
  return new Promise((resolve) => {
    let settled = false
    const done = (v: DetectedNetworkType | null) => {
      if (!settled) {
        settled = true
        resolve(v)
      }
    }
    const timer = setTimeout(() => done(null), WECHAT_TIMEOUT_MS)
    try {
      wx.getNetworkType!({
        success: (res) => {
          clearTimeout(timer)
          // success 回调在 try 之外异步触发；map 抛错时仍要 settle，否则 Promise 永挂（timer 已清）。
          let mapped: DetectedNetworkType | null = null
          try {
            mapped = mapWeChatNetworkType(res?.networkType)
          } catch {
            mapped = null
          }
          done(mapped)
        },
        fail: () => {
          clearTimeout(timer)
          done(null)
        },
      })
    } catch {
      clearTimeout(timer)
      done(null)
    }
  })
}

function detectFromConnectionApi(): DetectedNetworkType {
  if (typeof navigator === 'undefined') {
    return 'unknown'
  }
  const conn = (navigator as unknown as { connection?: { type?: string } }).connection
  const type = conn?.type
  if (type === 'wifi') {
    return 'wifi'
  }
  if (type === 'cellular') {
    return 'cellular'
  }
  return 'unknown'
}

export async function detectNetworkType(): Promise<DetectedNetworkType> {
  const fromWeChat = await detectFromWeChat()
  if (fromWeChat) {
    return fromWeChat
  }
  return detectFromConnectionApi()
}
