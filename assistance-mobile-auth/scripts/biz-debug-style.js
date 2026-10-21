// biz-debug 样式调试纯逻辑（schema 校验 / 最终生效样式计算）。
// 浏览器与 Vitest 共用的 plain ESM，无构建依赖。
// ⚠️ 字段 / 类型 / 默认值变更时需同步：src/sdk/types.ts、src/sdk/styleOption.ts。

const TEXT_FIELDS = ['bgColor', 'borderRadius', 'fontColor', 'fontSize', 'height', 'name', 'textAlign', 'width']
const CHECKBOX_FIELDS = ['width', 'height', 'checkedColor', 'borderColor', 'checkBgImg', 'checkedBgImg']
const IMAGE_FIELDS = ['src', 'width', 'height']
const AGREE_FIELDS = ['width', 'fontFamily', 'fontSize', 'textAlign', 'fontColor', 'hrefColor', 'CMText', 'childArr', 'agreeArr', 'setChainAgreement', 'checkboxStyle']

export const STYLE_GROUPS = {
  submitBtnStyle: { kind: 'text', fields: TEXT_FIELDS },
  submitBtnDisabledStyle: { kind: 'text', fields: TEXT_FIELDS },
  submitBtnLoadingStyle: { kind: 'text', fields: TEXT_FIELDS },
  phoneStyle: { kind: 'text', fields: TEXT_FIELDS },
  localTipStyle: { kind: 'text', fields: TEXT_FIELDS },
  unlocalTipStyle: { kind: 'text', fields: TEXT_FIELDS },
  stateStyle: { kind: 'text', fields: TEXT_FIELDS },
  authTextStyle: { kind: 'text', fields: TEXT_FIELDS },
  authExpireStyle: { kind: 'text', fields: TEXT_FIELDS },
  checkboxStyle: { kind: 'checkbox', fields: CHECKBOX_FIELDS },
  agreeStyle: { kind: 'agree', fields: AGREE_FIELDS },
  topImageStyle: { kind: 'image', fields: IMAGE_FIELDS },
  bottomImageStyle: { kind: 'image', fields: IMAGE_FIELDS },
}

// 弹窗模式下真正被授权页强制丢弃的分组。仅 agreeStyle —— mergeCustomerStyleOption 把协议区
// 永远换成我方默认（保护三勾选框对齐）。topImageStyle / bottomImageStyle 已改为随 styleOption
// 走 postMessage 透传、由授权页渲染顶/底图，故不再属于"被忽略"。
export const DROPPED_IN_POPUP = ['agreeStyle']

export const UNIT_FIELDS = ['fontSize', 'width', 'height', 'borderRadius']

// 对齐 src/sdk/styleOption.ts baseMobileAuthStyleOption（仅 createMobileAuthStyleOption 设默认的 10 组）。
export const BASE_DEFAULTS = {
  submitBtnStyle: { width: '100%', height: '48px', bgColor: '#ff2d55', borderRadius: '10px', fontSize: '16px', fontColor: '#FFFFFF', name: '确认', textAlign: 'center' },
  submitBtnDisabledStyle: { bgColor: '#F5F6F8', fontColor: '#8A8F98' },
  submitBtnLoadingStyle: { height: '48px' },
  phoneStyle: { bgColor: '#FFFFFF', fontColor: '#8A8F98', fontSize: '14px', borderRadius: '0', textAlign: 'left', width: 'auto' },
  localTipStyle: { fontColor: '#8A8F98', fontSize: '12px', textAlign: 'left' },
  unlocalTipStyle: { fontColor: '#8A8F98', fontSize: '12px', textAlign: 'left' },
  stateStyle: { width: '100%', bgColor: '#FFFFFF', fontColor: '#334155', fontSize: '14px', borderRadius: '12px', textAlign: 'center' },
  authTextStyle: { fontColor: '#334155', bgColor: '#FFFFFF', borderRadius: '12px', textAlign: 'center' },
  authExpireStyle: { fontColor: '#8A8F98', fontSize: '14px' },
  checkboxStyle: { width: '18px', height: '18px', checkedColor: '#ff2d55', borderColor: '#c8ccd1' },
}

// 示例：含一个 agreeStyle 故意演示"弹窗模式被丢弃"。
// 不放 topImageStyle/bottomImageStyle —— 顶/底图的 src 会被编进 verification iframe 的 URL 查询参数，
// 查询串里嵌外部 URL 会触发 ginkgo 云 WAF 拦截（461）；agreeStyle 仅在合并时丢弃、不进 URL，演示安全。
export const SAMPLE_STYLE_OPTION = {
  submitBtnStyle: { bgColor: '#0a84ff', name: '同意并提交' },
  phoneStyle: { fontColor: '#0a84ff' },
  checkboxStyle: { checkedColor: '#0a84ff' },
  agreeStyle: { fontColor: '#0a84ff' },
}

function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function validateStyleOption(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    return { ok: false, parsed: null, issues: [{ level: 'error', path: '(root)', message: 'JSON 语法错误：' + e.message }] }
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, parsed: null, issues: [{ level: 'error', path: '(root)', message: 'styleOption 应为对象 {}' }] }
  }

  const issues = []
  const legalGroups = Object.keys(STYLE_GROUPS).join(' / ')

  for (const [group, value] of Object.entries(parsed)) {
    const spec = STYLE_GROUPS[group]
    if (!spec) {
      issues.push({ level: 'warn', path: group, message: '未知分组（合法分组：' + legalGroups + '）' })
      continue
    }
    if (DROPPED_IN_POPUP.includes(group)) {
      issues.push({ level: 'drop', path: group, message: '弹窗模式被忽略（协议区永远用我方默认）' })
      continue
    }
    if (!isPlainObject(value)) {
      issues.push({ level: 'error', path: group, message: '应为对象 {}' })
      continue
    }
    for (const [field, fieldVal] of Object.entries(value)) {
      const path = group + '.' + field
      if (!spec.fields.includes(field)) {
        issues.push({ level: 'warn', path, message: '未知字段（合法字段：' + spec.fields.join(' / ') + '）' })
        continue
      }
      if (typeof fieldVal !== 'string') {
        if (typeof fieldVal === 'number' && UNIT_FIELDS.includes(field)) {
          issues.push({ level: 'error', path, message: "缺单位，应为字符串如 '16px'" })
        } else {
          issues.push({ level: 'error', path, message: '应为字符串' })
        }
      }
    }
  }

  const ok = !issues.some((i) => i.level === 'error')
  return { ok, parsed, issues }
}

// 复刻授权页 mergeCustomerStyleOption + createMobileAuthStyleOption：
// 客户非协议分组覆盖我方默认；agreeStyle / 顶底图丢弃；agreeStyle 运行时由授权页注入。
export function computeEffectiveStyle(parsed) {
  const customer = parsed && typeof parsed === 'object' ? parsed : {}
  const dropped = DROPPED_IN_POPUP.filter((g) => g in customer)

  const effective = {}
  for (const [group, base] of Object.entries(BASE_DEFAULTS)) {
    const override = customer[group]
    effective[group] = override && typeof override === 'object' && !Array.isArray(override)
      ? { ...base, ...override }
      : { ...base }
  }
  effective.agreeStyle = '(运行时由授权页注入我方默认，你的传入被忽略)'

  return {
    effective,
    dropped,
    note: dropped.length ? '以下分组在弹窗模式被忽略：' + dropped.join('、') : '',
  }
}
