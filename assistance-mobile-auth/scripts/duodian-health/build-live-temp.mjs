import { cp, copyFile, mkdir, stat } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build as viteBuild } from 'vite'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const built = spawnSync(process.execPath, [path.join(projectRoot, 'scripts/duodian-health/build.mjs'), ...process.argv.slice(2)], { cwd: projectRoot, stdio: 'inherit' })
if (built.error) throw built.error
if (built.status !== 0) throw new Error(`Customer build failed (${built.status})`)
const hostParamsDir = path.join(projectRoot, 'dist-custom-host-params')
const hostParamsFile = path.join(hostParamsDir, 'test-host-params.js')
if (!(await stat(hostParamsFile).catch(() => undefined))?.isFile()) {
  await viteBuild({ root: projectRoot, configFile: false,
    build: { outDir: hostParamsDir, emptyOutDir: true,
      lib: { entry: path.join(projectRoot, 'scripts/custom-page/testHostParams.ts'), name: 'AssistanceCustomPageTestHost', formats: ['iife'], fileName: () => 'test-host-params.js' } },
  })
}
const outDir = path.join(projectRoot, 'dist-duodian-health-live-temp')
await mkdir(outDir, { recursive: true })
await cp(path.join(projectRoot, 'dist-duodian-health-temp'), outDir, { recursive: true })
await copyFile(hostParamsFile, path.join(outDir, 'assist/0.3.0/test-host-params.js'))
await copyFile(path.join(projectRoot, 'tests/manual/test-duodian-health-0.3.0-live.html'), path.join(outDir, 'test-duodian-health-0.3.0.html'))
console.log('LIVE Duodian TEMP host assembled in dist-duodian-health-live-temp')
