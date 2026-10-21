import { writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import {
  FROZEN_CHECKSUMS_FILE,
  FROZEN_DIR_NAME,
  FROZEN_VERSION,
  computeDirectoryChecksums,
  frozenDirectoryName,
} from './frozen-assets.mjs'

const projectRoot = process.cwd()
const versionArgIndex = process.argv.indexOf('--version')
const version =
  versionArgIndex >= 0 ? process.argv[versionArgIndex + 1] : FROZEN_VERSION
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Invalid frozen version: ${version}`)
}
const frozenDirName =
  version === FROZEN_VERSION ? FROZEN_DIR_NAME : frozenDirectoryName(version)
const frozenRoot = path.join(projectRoot, 'release-frozen', frozenDirName)
const distChecksums = computeDirectoryChecksums(path.join(frozenRoot, 'dist'))
const checksums = Object.fromEntries(
  Object.entries(distChecksums).map(([relative, sha]) => [`dist/${relative}`, sha]),
)

writeFileSync(
  path.join(frozenRoot, FROZEN_CHECKSUMS_FILE),
  `${JSON.stringify(checksums, null, 2)}\n`,
)
console.log(`[freeze] wrote ${Object.keys(checksums).length} checksums to ${frozenRoot}`)
