const DEFAULT_PUBLIC_ORIGIN = 'https://ginkgo.chinaums.com'
const DEFAULT_PUBLIC_BASE_PATH = '/sign-pay-pro/'

function normalizeBasePath(value: string | undefined): string {
  const raw = value?.trim()
  if (!raw || raw === '/') {
    return DEFAULT_PUBLIC_BASE_PATH
  }

  const pathname = /^https?:\/\//i.test(raw) ? new URL(raw).pathname : raw
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${withLeadingSlash.replace(/\/+$/, '')}/`
}

function normalizeBaseUrl(value: string | undefined, basePath: string): string {
  const raw = value?.trim()
  if (raw) {
    return `${new URL(raw).toString().replace(/\/+$/, '')}/`
  }

  return new URL(basePath.replace(/^\/+/, ''), `${DEFAULT_PUBLIC_ORIGIN}/`).toString()
}

const envBasePath =
  import.meta.env.VITE_SFT_PUBLIC_BASE_PATH?.trim() ||
  (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/' ? import.meta.env.BASE_URL : '')

export const SFT_PUBLIC_BASE_PATH = normalizeBasePath(envBasePath)
export const SFT_PUBLIC_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_SFT_PUBLIC_BASE_URL, SFT_PUBLIC_BASE_PATH)

export function createSftPublicPath(path: string) {
  return `${SFT_PUBLIC_BASE_PATH}${path.replace(/^\/+/, '')}`
}

export function createSftPublicUrl(path: string) {
  return new URL(path.replace(/^\/+/, ''), SFT_PUBLIC_BASE_URL).toString()
}
