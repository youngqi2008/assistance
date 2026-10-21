import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

export const FROZEN_VERSION = '0.1.4'
export const FROZEN_ASSIST_VERSION = '0.2.0'
export const FROZEN_DIR_NAME = `static-mobile-auth-${FROZEN_VERSION}`
export const FROZEN_ASSIST_DIR_NAME = `static-mobile-auth-${FROZEN_ASSIST_VERSION}`
export const FROZEN_CHECKSUMS_FILE = 'checksums.json'

const ignoredBasenames = new Set(['.DS_Store'])
const frozenDirectoryPattern = /^static-mobile-auth-(\d+\.\d+\.\d+)$/

export function frozenDirectoryName(version) {
  return `static-mobile-auth-${version}`
}

function compareSemver(left, right) {
  const leftParts = left.split('.').map(Number)
  const rightParts = right.split('.').map(Number)
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] - rightParts[index]
    }
  }
  return 0
}

export function listFrozenAssistVersions(releaseFrozenRoot) {
  if (!existsSync(releaseFrozenRoot)) {
    return []
  }

  return readdirSync(releaseFrozenRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name.match(frozenDirectoryPattern)?.[1])
    .filter((version) => version && version !== FROZEN_VERSION)
    .sort(compareSemver)
}

export function listFrozenFiles(dir, prefix = '') {
  if (!existsSync(dir)) {
    return []
  }

  const files = []
  for (const entry of readdirSync(dir).sort()) {
    if (ignoredBasenames.has(entry)) {
      continue
    }
    const full = path.join(dir, entry)
    const relative = prefix ? `${prefix}/${entry}` : entry
    const stat = statSync(full)
    if (stat.isDirectory()) {
      files.push(...listFrozenFiles(full, relative))
    } else if (stat.isFile()) {
      files.push(relative)
    }
  }

  return files
}

export function computeDirectoryChecksums(dir) {
  const checksums = {}
  for (const relative of listFrozenFiles(dir)) {
    checksums[relative] = createHash('sha256')
      .update(readFileSync(path.join(dir, relative)))
      .digest('hex')
  }
  return checksums
}

export function readFrozenChecksums(frozenRoot) {
  return JSON.parse(readFileSync(path.join(frozenRoot, FROZEN_CHECKSUMS_FILE), 'utf8'))
}

export function verifyChecksums(targetRoot, checksums) {
  const errors = []
  for (const [relative, expected] of Object.entries(checksums)) {
    const full = path.join(targetRoot, relative)
    if (!existsSync(full)) {
      errors.push(`Frozen file missing: ${relative}`)
      continue
    }
    const actual = createHash('sha256').update(readFileSync(full)).digest('hex')
    if (actual !== expected) {
      errors.push(`Frozen file modified: ${relative} (expected ${expected}, got ${actual})`)
    }
  }
  return errors
}

export function verifyFrozenAssets(frozenRoot) {
  if (!existsSync(path.join(frozenRoot, FROZEN_CHECKSUMS_FILE))) {
    return [`Frozen checksums file missing: ${FROZEN_CHECKSUMS_FILE}`]
  }

  const checksums = readFrozenChecksums(frozenRoot)
  const errors = verifyChecksums(frozenRoot, checksums)

  for (const relative of listFrozenFiles(path.join(frozenRoot, 'dist'))) {
    if (!(`dist/${relative}` in checksums)) {
      errors.push(`Unexpected file in frozen dist: dist/${relative}`)
    }
  }

  return errors
}
