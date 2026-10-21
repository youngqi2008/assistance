import type {
  MobileAuthSdkAgreeStyle,
  MobileAuthSdkCheckboxStyle,
  MobileAuthSdkStyleOption,
  MobileAuthSdkTextStyle,
} from './types'

type CompleteMobileAuthSdkStyleOption = Required<
  Pick<
    MobileAuthSdkStyleOption,
    | 'submitBtnStyle'
    | 'submitBtnDisabledStyle'
    | 'submitBtnLoadingStyle'
    | 'phoneStyle'
    | 'localTipStyle'
    | 'unlocalTipStyle'
    | 'stateStyle'
    | 'authTextStyle'
    | 'authExpireStyle'
    | 'checkboxStyle'
  >
>

type MobileAuthSdkStyleOptionOverrides = {
  submitBtnStyle?: Partial<MobileAuthSdkTextStyle>
  submitBtnDisabledStyle?: Partial<MobileAuthSdkTextStyle>
  submitBtnLoadingStyle?: Partial<MobileAuthSdkTextStyle>
  phoneStyle?: Partial<MobileAuthSdkTextStyle>
  localTipStyle?: Partial<MobileAuthSdkTextStyle>
  unlocalTipStyle?: Partial<MobileAuthSdkTextStyle>
  stateStyle?: Partial<MobileAuthSdkTextStyle>
  authTextStyle?: Partial<MobileAuthSdkTextStyle>
  authExpireStyle?: Partial<MobileAuthSdkTextStyle>
  checkboxStyle?: Partial<MobileAuthSdkCheckboxStyle>
  agreeStyle?: MobileAuthSdkAgreeStyle
}

const baseMobileAuthStyleOption: CompleteMobileAuthSdkStyleOption = {
  submitBtnStyle: {
    width: '100%',
    height: '48px',
    bgColor: '#ff2d55',
    borderRadius: '10px',
    fontSize: '16px',
    fontColor: '#FFFFFF',
    name: '确认',
    textAlign: 'center',
  },
  submitBtnDisabledStyle: {
    bgColor: '#F5F6F8',
    fontColor: '#8A8F98',
  },
  submitBtnLoadingStyle: {
    height: '48px',
  },
  phoneStyle: {
    bgColor: '#FFFFFF',
    fontColor: '#8A8F98',
    fontSize: '14px',
    borderRadius: '0',
    textAlign: 'left',
    width: 'auto',
  },
  localTipStyle: {
    fontColor: '#8A8F98',
    fontSize: '12px',
    textAlign: 'left',
  },
  unlocalTipStyle: {
    fontColor: '#8A8F98',
    fontSize: '12px',
    textAlign: 'left',
  },
  stateStyle: {
    width: '100%',
    bgColor: '#FFFFFF',
    fontColor: '#334155',
    fontSize: '14px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  authTextStyle: {
    fontColor: '#334155',
    bgColor: '#FFFFFF',
    borderRadius: '12px',
    textAlign: 'center',
  },
  authExpireStyle: {
    fontColor: '#8A8F98',
    fontSize: '14px',
  },
  checkboxStyle: {
    width: '18px',
    height: '18px',
    checkedColor: '#ff2d55',
    borderColor: '#c8ccd1',
  },
}

export function createMobileAuthStyleOption(
  overrides: MobileAuthSdkStyleOptionOverrides = {},
): MobileAuthSdkStyleOption {
  return {
    submitBtnStyle: {
      ...baseMobileAuthStyleOption.submitBtnStyle,
      ...overrides.submitBtnStyle,
    },
    submitBtnDisabledStyle: {
      ...baseMobileAuthStyleOption.submitBtnDisabledStyle,
      ...overrides.submitBtnDisabledStyle,
    },
    submitBtnLoadingStyle: {
      ...baseMobileAuthStyleOption.submitBtnLoadingStyle,
      ...overrides.submitBtnLoadingStyle,
    },
    phoneStyle: {
      ...baseMobileAuthStyleOption.phoneStyle,
      ...overrides.phoneStyle,
    },
    localTipStyle: {
      ...baseMobileAuthStyleOption.localTipStyle,
      ...overrides.localTipStyle,
    },
    unlocalTipStyle: {
      ...baseMobileAuthStyleOption.unlocalTipStyle,
      ...overrides.unlocalTipStyle,
    },
    stateStyle: {
      ...baseMobileAuthStyleOption.stateStyle,
      ...overrides.stateStyle,
    },
    authTextStyle: {
      ...baseMobileAuthStyleOption.authTextStyle,
      ...overrides.authTextStyle,
    },
    authExpireStyle: {
      ...baseMobileAuthStyleOption.authExpireStyle,
      ...overrides.authExpireStyle,
    },
    checkboxStyle: {
      ...baseMobileAuthStyleOption.checkboxStyle,
      ...overrides.checkboxStyle,
    },
    // 仅在调用方显式传入时输出 agreeStyle，避免影响 SDK 默认运营商协议渲染。
    ...(overrides.agreeStyle ? { agreeStyle: overrides.agreeStyle } : {}),
  }
}

// 递归剥掉所有函数字段，得到可经 postMessage（结构化克隆）/ JSON 安全搬运的纯数据。
// 结构化克隆遇到函数会直接抛 DataCloneError，因此弹层模式透传客户 styleOption 前必须先剥函数。
// 副作用：agreeStyle 协议条目里的 customEvent 这类回调会被丢弃 —— 弹层模式不支持自定义协议点击回调。
function stripFunctions(value: unknown): unknown {
  if (typeof value === 'function') {
    return undefined
  }
  if (value === null) {
    return null
  }
  if (Array.isArray(value)) {
    return value.map(stripFunctions).filter((item) => item !== undefined)
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const sanitized = stripFunctions(child)
      if (sanitized !== undefined) {
        out[key] = sanitized
      }
    }
    return out
  }
  return value
}

export function sanitizeStyleOptionForTransport(
  styleOption: unknown,
): MobileAuthSdkStyleOption | undefined {
  if (!styleOption || typeof styleOption !== 'object') {
    return undefined
  }
  return stripFunctions(styleOption) as MobileAuthSdkStyleOption
}

// 把客户（经剥函数后的）styleOption 合并进我方默认：客户只覆盖非协议分组（按钮 / 号码 / 复选框等），
// 协议区 agreeStyle 永远用我方默认（保护三勾选框对齐），顶 / 底图走 React <img>（不进 SDK styleOption）故丢弃。
export function mergeCustomerStyleOption(
  customer: MobileAuthSdkStyleOption | null | undefined,
  agreeStyle: MobileAuthSdkAgreeStyle,
): MobileAuthSdkStyleOption {
  const {
    agreeStyle: _ignoredCustomerAgreeStyle,
    topImageStyle: _ignoredTopImage,
    bottomImageStyle: _ignoredBottomImage,
    ...rest
  } = customer ?? {}

  return createMobileAuthStyleOption({
    ...(rest as MobileAuthSdkStyleOptionOverrides),
    agreeStyle,
  })
}
