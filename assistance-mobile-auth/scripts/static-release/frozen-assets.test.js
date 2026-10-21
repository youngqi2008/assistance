import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  computeDirectoryChecksums,
  listFrozenFiles,
  verifyChecksums,
  verifyFrozenAssets,
} from './frozen-assets.mjs'

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'frozen-'))
  mkdirSync(path.join(root, 'dist', 'sub'), { recursive: true })
  writeFileSync(path.join(root, 'dist', 'a.txt'), 'alpha')
  writeFileSync(path.join(root, 'dist', 'sub', 'b.txt'), 'beta')
  writeFileSync(path.join(root, 'dist', '.DS_Store'), 'junk')
  return root
}

describe('frozen assets', () => {
  it('lists files recursively, sorted, ignoring .DS_Store', () => {
    const root = createFixture()
    expect(listFrozenFiles(path.join(root, 'dist'))).toEqual(['a.txt', 'sub/b.txt'])
  })

  it('computes stable sha256 checksums', () => {
    const root = createFixture()
    const sums = computeDirectoryChecksums(path.join(root, 'dist'))
    expect(Object.keys(sums)).toEqual(['a.txt', 'sub/b.txt'])
    expect(sums['a.txt']).toMatch(/^[0-9a-f]{64}$/)
  })

  it('verifyChecksums reports missing and modified files', () => {
    const root = createFixture()
    const sums = Object.fromEntries(
      Object.entries(computeDirectoryChecksums(path.join(root, 'dist')))
        .map(([rel, sha]) => [`dist/${rel}`, sha]),
    )
    expect(verifyChecksums(root, sums)).toEqual([])

    writeFileSync(path.join(root, 'dist', 'a.txt'), 'tampered')
    const errors = verifyChecksums(root, sums)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('Frozen file modified: dist/a.txt')
  })

  it('verifyFrozenAssets validates checksums.json and detects extra files', () => {
    const root = createFixture()
    const sums = Object.fromEntries(
      Object.entries(computeDirectoryChecksums(path.join(root, 'dist')))
        .map(([rel, sha]) => [`dist/${rel}`, sha]),
    )
    writeFileSync(path.join(root, 'checksums.json'), JSON.stringify(sums))
    expect(verifyFrozenAssets(root)).toEqual([])

    writeFileSync(path.join(root, 'dist', 'extra.txt'), 'sneaky')
    expect(verifyFrozenAssets(root)).toEqual(['Unexpected file in frozen dist: dist/extra.txt'])
  })

  it('verifyFrozenAssets fails without checksums.json', () => {
    const root = createFixture()
    expect(verifyFrozenAssets(root)).toEqual(['Frozen checksums file missing: checksums.json'])
  })
})
