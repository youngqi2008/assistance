// @vitest-environment node
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, expect, test } from 'vitest'

const temporary: string[] = []
afterEach(async () => { await Promise.all(temporary.splice(0).map(dir => rm(dir, { recursive: true, force: true }))) })

test('assembles the real loader, versioned wrapper, loader-relative provider CSS and complete example', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'custom-temp-assembly-')); temporary.push(root)
  const input = { loaderDir: path.join(root, 'loader'), wrapperDir: path.join(root, 'wrapper'), examplesDir: path.join(root, 'examples'), hostParamsFile: path.join(root, 'test-host-params.js'), outDir: path.join(root, 'output') }
  const fixtures = {
    'test-host-params.js': 'fresh provider signing helper',
    'loader/custom-verification.html': '<html>loader</html>', 'loader/assets/bootstrap.js': 'real bootstrap',
    'wrapper/assistance-mobile-auth.js': 'ESM wrapper', 'wrapper/assistance-mobile-auth.umd.cjs': 'UMD wrapper',
    'wrapper/vendor/new-control-style.css': 'provider CSS', 'examples/yuanbao/index.html': '<html>customer</html>',
    'examples/yuanbao/style.css': 'customer CSS', 'examples/yuanbao/page.js': 'customer script',
    'examples/yuanbao/style-option.json': '{}', 'examples/yuanbao/assets/header.png': 'image bytes',
  }
  for (const [name, bytes] of Object.entries(fixtures)) { const file = path.join(root, name); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, bytes) }
  await mkdir(path.join(input.outDir, 'assist/0.3.0/assets'), { recursive: true })
  await writeFile(path.join(input.outDir, 'assist/0.3.0/assets/obsolete-bootstrap.js'), 'stale previous build')
  const moduleUrl = new URL('./build-custom-temp.mjs', import.meta.url).href
  const { assembleCustomTemp } = await import(/* @vite-ignore */ moduleUrl) as { assembleCustomTemp(value: typeof input): Promise<void> }
  await assembleCustomTemp(input)
  const wanted = {
    'assist/0.3.0/test-host-params.js': 'fresh provider signing helper',
    'assist/0.3.0/custom-verification.html': '<html>loader</html>', 'assist/0.3.0/assets/bootstrap.js': 'real bootstrap',
    'assist/0.3.0/assistance-mobile-auth/assistance-mobile-auth.0.3.0.js': 'ESM wrapper',
    'assist/0.3.0/assistance-mobile-auth/assistance-mobile-auth.0.3.0.umd.cjs': 'UMD wrapper',
    'assist/0.3.0/assistance-mobile-auth/vendor/new-control-style.css': 'provider CSS',
    'assist/0.3.0/examples/yuanbao/index.html': '<html>customer</html>', 'assist/0.3.0/examples/yuanbao/assets/header.png': 'image bytes',
  }
  for (const [name, bytes] of Object.entries(wanted)) expect(await readFile(path.join(input.outDir, name), 'utf8')).toBe(bytes)
  await expect(readFile(path.join(input.outDir, 'assist/0.3.0/assets/obsolete-bootstrap.js'))).rejects.toThrow()
  expect(await readFile(path.join(input.outDir, 'test-custom-page-0.3.0.html'), 'utf8')).toContain('createAssistanceMobileAuthSdk')
})
