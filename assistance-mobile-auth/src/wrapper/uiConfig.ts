export const MAX_CUSTOM_AGREEMENTS = 50

export type AssistanceUiTextKey = 'headerTitle' | 'idTitle' | 'phoneTopNotice' | 'footerNote'
export type AssistanceUiImageFit = 'cover' | 'contain'

export interface AssistanceUiTextConfig {
  text?: string
  fontSize?: string
  color?: string
  bold?: boolean
}

export interface AssistanceUiImageConfig {
  url: string
  alt?: string
  height?: number | string
  fit?: AssistanceUiImageFit
}

export type AssistanceUiImageInput = string | AssistanceUiImageConfig

export interface AssistanceUiAgreementConfig {
  title: string
  url: string
}

export interface AssistanceMobileAuthUiConfig {
  themeColor?: string
  texts?: Partial<Record<AssistanceUiTextKey, AssistanceUiTextConfig>>
  images?: {
    top?: AssistanceUiImageInput
    bottom?: AssistanceUiImageInput
  }
  agreements?: AssistanceUiAgreementConfig[]
}

export interface NormalizedAssistanceUiImageConfig {
  url: string
  alt?: string
  height?: string
  fit?: AssistanceUiImageFit
}

export interface NormalizedAssistanceMobileAuthUiConfig {
  themeColor?: string
  texts?: Partial<Record<AssistanceUiTextKey, AssistanceUiTextConfig>>
  images?: {
    top?: NormalizedAssistanceUiImageConfig
    bottom?: NormalizedAssistanceUiImageConfig
  }
  agreements?: AssistanceUiAgreementConfig[]
}

export interface AssistanceUiConfigWarning {
  path: string
  reason: string
}

export type AssistanceUiConfigWarn = (warning: AssistanceUiConfigWarning) => void

const textKeys = ['headerTitle', 'idTitle', 'phoneTopNotice', 'footerNote'] as const
const colorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const fontSizePattern = /^(?:[1-9]\d?(?:\.\d+)?px|(?:0?\.\d+|[1-9]\d?(?:\.\d+)?)rem)$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function warn(options: { warn?: AssistanceUiConfigWarn } | undefined, path: string, reason: string) {
  options?.warn?.({ path, reason })
}

function normalizeNonEmptyString(value: unknown, path: string, options?: { warn?: AssistanceUiConfigWarn }) {
  if (typeof value !== 'string') {
    warn(options, path, 'Expected a string.')
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    warn(options, path, 'Expected a non-empty string.')
    return undefined
  }

  return trimmed
}

function normalizeColor(value: unknown, path: string, options?: { warn?: AssistanceUiConfigWarn }) {
  const normalized = normalizeNonEmptyString(value, path, options)
  if (!normalized) {
    return undefined
  }

  if (!colorPattern.test(normalized)) {
    warn(options, path, 'Expected #RGB or #RRGGBB.')
    return undefined
  }

  return normalized
}

function normalizeFontSize(value: unknown, path: string, options?: { warn?: AssistanceUiConfigWarn }) {
  const normalized = normalizeNonEmptyString(value, path, options)
  if (!normalized) {
    return undefined
  }

  if (!fontSizePattern.test(normalized)) {
    warn(options, path, 'Expected a px or rem font size.')
    return undefined
  }

  return normalized
}

function normalizeHttpUrl(value: unknown, path: string, options?: { warn?: AssistanceUiConfigWarn }) {
  const normalized = normalizeNonEmptyString(value, path, options)
  if (!normalized) {
    return undefined
  }

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      warn(options, path, 'Expected an http or https URL.')
      return undefined
    }
    return parsed.toString()
  } catch {
    warn(options, path, 'Expected a valid URL.')
    return undefined
  }
}

function normalizeHeight(value: unknown, path: string, options?: { warn?: AssistanceUiConfigWarn }) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return `${value}px`
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    const pxValue = /^(?:0|[1-9]\d*)(?:\.\d+)?px$/.test(trimmed)
      ? Number(trimmed.slice(0, -2))
      : Number.NaN
    if (Number.isFinite(pxValue) && pxValue > 0) {
      return trimmed
    }
  }

  warn(options, path, 'Expected a positive px height.')
  return undefined
}

function normalizeTextConfig(
  value: unknown,
  path: string,
  options?: { warn?: AssistanceUiConfigWarn },
): AssistanceUiTextConfig | undefined {
  if (!isRecord(value)) {
    warn(options, path, 'Expected an object.')
    return undefined
  }

  const text = value.text === undefined ? undefined : normalizeNonEmptyString(value.text, `${path}.text`, options)
  const fontSize = value.fontSize === undefined ? undefined : normalizeFontSize(value.fontSize, `${path}.fontSize`, options)
  const color = value.color === undefined ? undefined : normalizeColor(value.color, `${path}.color`, options)
  let bold: boolean | undefined

  if (value.bold !== undefined) {
    if (typeof value.bold === 'boolean') {
      bold = value.bold
    } else {
      warn(options, `${path}.bold`, 'Expected a boolean.')
    }
  }

  const normalized = { text, fontSize, color, bold }
  const entries = Object.entries(normalized).filter(([, entryValue]) => entryValue !== undefined)

  return entries.length ? Object.fromEntries(entries) as AssistanceUiTextConfig : undefined
}

function normalizeImageConfig(
  value: unknown,
  path: string,
  options?: { warn?: AssistanceUiConfigWarn },
): NormalizedAssistanceUiImageConfig | undefined {
  if (typeof value === 'string') {
    const url = normalizeHttpUrl(value, `${path}.url`, options)
    return url ? { url } : undefined
  }

  if (!isRecord(value)) {
    warn(options, path, 'Expected a URL string or image object.')
    return undefined
  }

  const url = normalizeHttpUrl(value.url, `${path}.url`, options)
  if (!url) {
    return undefined
  }

  const alt = value.alt === undefined ? undefined : normalizeNonEmptyString(value.alt, `${path}.alt`, options)
  const height = value.height === undefined ? undefined : normalizeHeight(value.height, `${path}.height`, options)
  const fit = value.fit === 'cover' || value.fit === 'contain' ? value.fit : undefined

  if (value.fit !== undefined && fit === undefined) {
    warn(options, `${path}.fit`, 'Expected cover or contain.')
  }

  return {
    url,
    ...(alt ? { alt } : {}),
    ...(height ? { height } : {}),
    ...(fit ? { fit } : {}),
  }
}

function normalizeAgreement(
  value: unknown,
  index: number,
  options?: { warn?: AssistanceUiConfigWarn },
): AssistanceUiAgreementConfig | undefined {
  const path = `agreements[${index}]`
  if (!isRecord(value)) {
    warn(options, path, 'Expected an object.')
    return undefined
  }

  const title = normalizeNonEmptyString(value.title, `${path}.title`, options)
  const url = normalizeHttpUrl(value.url, `${path}.url`, options)

  return title && url ? { title, url } : undefined
}

export function normalizeAssistanceUiConfig(
  input: unknown,
  options: { warn?: AssistanceUiConfigWarn } = {},
): NormalizedAssistanceMobileAuthUiConfig {
  if (input == null) {
    return {}
  }

  if (!isRecord(input)) {
    warn(options, 'ui', 'Expected an object.')
    return {}
  }

  const themeColor = input.themeColor === undefined ? undefined : normalizeColor(input.themeColor, 'themeColor', options)

  const texts: NormalizedAssistanceMobileAuthUiConfig['texts'] = {}
  if (input.texts !== undefined) {
    if (isRecord(input.texts)) {
      const rawTexts = input.texts
      textKeys.forEach((key) => {
        if (key in rawTexts) {
          const normalized = normalizeTextConfig(rawTexts[key], `texts.${key}`, options)
          if (normalized) {
            texts[key] = normalized
          }
        }
      })
    } else {
      warn(options, 'texts', 'Expected an object.')
    }
  }

  const images: NormalizedAssistanceMobileAuthUiConfig['images'] = {}
  if (input.images !== undefined) {
    if (isRecord(input.images)) {
      const top = input.images.top === undefined ? undefined : normalizeImageConfig(input.images.top, 'images.top', options)
      const bottom = input.images.bottom === undefined ? undefined : normalizeImageConfig(input.images.bottom, 'images.bottom', options)
      if (top) {
        images.top = top
      }
      if (bottom) {
        images.bottom = bottom
      }
    } else {
      warn(options, 'images', 'Expected an object.')
    }
  }

  let agreements: AssistanceUiAgreementConfig[] | undefined
  if (input.agreements !== undefined) {
    if (Array.isArray(input.agreements)) {
      const validAgreements = input.agreements
        .map((agreement, index) => normalizeAgreement(agreement, index, options))
        .filter((agreement): agreement is AssistanceUiAgreementConfig => agreement !== undefined)

      agreements = validAgreements.slice(0, MAX_CUSTOM_AGREEMENTS)
      if (validAgreements.length > MAX_CUSTOM_AGREEMENTS) {
        warn(options, 'agreements', `Only the first ${MAX_CUSTOM_AGREEMENTS} valid agreements are used.`)
      }
    } else {
      warn(options, 'agreements', 'Expected an array.')
    }
  }

  return {
    ...(themeColor ? { themeColor } : {}),
    ...(Object.keys(texts).length ? { texts } : {}),
    ...(Object.keys(images).length ? { images } : {}),
    ...(agreements && agreements.length ? { agreements } : {}),
  }
}

export function hasAssistanceUiConfig(config: NormalizedAssistanceMobileAuthUiConfig): boolean {
  return Boolean(
    config.themeColor ||
      (config.texts && Object.keys(config.texts).length > 0) ||
      (config.images && Object.keys(config.images).length > 0) ||
      (config.agreements && config.agreements.length > 0),
  )
}

/** profile 基底 + 调用方覆盖的合并：override 逐字段优先，texts/images 按 key 浅合并，agreements 整体替换。 */
export function mergeAssistanceUiConfigs(
  base: NormalizedAssistanceMobileAuthUiConfig,
  override: NormalizedAssistanceMobileAuthUiConfig,
): NormalizedAssistanceMobileAuthUiConfig {
  const themeColor = override.themeColor ?? base.themeColor
  const texts = { ...base.texts, ...override.texts }
  const images = { ...base.images, ...override.images }
  const agreements = override.agreements?.length ? override.agreements : base.agreements

  return {
    ...(themeColor ? { themeColor } : {}),
    ...(Object.keys(texts).length ? { texts } : {}),
    ...(Object.keys(images).length ? { images } : {}),
    ...(agreements?.length ? { agreements } : {}),
  }
}

export function warnAssistanceUiConfigToConsole(warning: AssistanceUiConfigWarning): void {
  console.warn(`[AssistanceMobileAuth] Ignored invalid ui config at ${warning.path}: ${warning.reason}`)
}
