import type { NormalizedCustomPage } from './types'
import type { AgreementDocKey } from '../agreements/agreementContent'
import { parseAssistanceAuthParentOrigin } from '../wrapper/verificationBridge'

export function createCustomVerificationUrl(input: {
  loaderUrl: string
  mode: 'authorization' | 'agreement'
  sessionId: string
  parentOrigin: string
  docKey?: AgreementDocKey | 'entry'
}): string {
  const url = new URL(input.loaderUrl)
  if (!['http:', 'https:'].includes(url.protocol) || !input.sessionId.trim() ||
    parseAssistanceAuthParentOrigin(input.parentOrigin) !== input.parentOrigin) {
    throw new TypeError('Invalid custom verification identity or loader URL')
  }
  url.search = ''
  url.hash = ''
  url.searchParams.set('sessionId', input.sessionId)
  url.searchParams.set('parentOrigin', input.parentOrigin)
  url.searchParams.set('role', input.mode)
  if (input.docKey) url.searchParams.set('doc', input.docKey)
  return url.href
}

function resolvePageUrl(value: string, hostBaseUrl: string): string {
  const url = new URL(value, hostBaseUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('customPage addresses must use HTTP or HTTPS')
  }
  return url.toString()
}

export function normalizeCustomPage(value: unknown, hostBaseUrl: string): NormalizedCustomPage {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('customPage must be an object')
  }
  const input = value as Record<string, unknown>
  const hasHtml = input.html !== undefined
  const hasUrl = input.url !== undefined
  if (hasHtml === hasUrl) {
    throw new TypeError('customPage must provide exactly one of html or url')
  }
  const source = hasHtml ? input.html : input.url
  if (typeof source !== 'string' || !source.trim()) {
    throw new TypeError('customPage html or url must be a non-empty string')
  }

  const page: NormalizedCustomPage = hasHtml
    ? { kind: 'html', html: source }
    : { kind: 'url', url: resolvePageUrl(source, hostBaseUrl) }

  for (const field of ['css', 'js', 'baseUrl'] as const) {
    const option = input[field]
    if (option === undefined) continue
    if (typeof option !== 'string') {
      throw new TypeError(`customPage ${field} must be a string`)
    }
    if (field === 'baseUrl') {
      if (!option.trim()) throw new TypeError('customPage baseUrl must be non-empty')
      page.baseUrl = resolvePageUrl(option, hostBaseUrl)
    } else {
      page[field] = option
    }
  }
  return page
}
