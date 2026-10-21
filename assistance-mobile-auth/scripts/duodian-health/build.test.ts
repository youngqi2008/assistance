// @vitest-environment node
import { build, type Rollup } from 'vite'
import { afterEach, expect, test } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import customerConfig, { duodianRuntimeAliases } from '../../vite.duodian-health.config'
// @ts-expect-error JavaScript build helper has no declaration file.
import { assembleDuodianTemp } from './build.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const temporary: string[] = []
afterEach(async () => { for (const dir of temporary.splice(0)) await rm(dir, { recursive: true, force: true }) })
const chunks = (result: Rollup.RollupOutput | Rollup.RollupOutput[]) =>
  (Array.isArray(result) ? result : [result]).flatMap(item => item.output).filter(item => item.type === 'chunk')
function assertSuppliedOnly(output: ReturnType<typeof chunks>) {
  const modules = output.flatMap(item => Object.keys(item.modules))
  expect(modules.some(id => id.endsWith('/suppliedSdk.ts'))).toBe(true)
  expect(modules.some(id => id.includes('/crypto-js/'))).toBe(true)
  expect(modules.filter(id => /mobileAuthSignature|testHostParams|sftSignature|signing|signParams/i.test(id))).toEqual([])
  for (const item of output) {
    expect(item.code).not.toMatch(/MOBILE_AUTH_FRONTEND_APP_KEY|VITE_SFT_CUSTOMER_APP_KEY|BEGIN (?:RSA )?PRIVATE KEY|MOCK_ONLY_INVALID_SIGN/)
  }
}

test('customer ESM/UMD and injected runtime exclude the development signing dependency tree', async () => {
  const wrapper = chunks(await build({ ...customerConfig, configFile: false, logLevel: 'silent',
    build: { ...customerConfig.build, write: false } }) as Rollup.RollupOutput[])
  expect(wrapper.map(item => item.fileName).sort()).toEqual([
    'assistance-mobile-auth.duodian-health.0.3.0.js', 'assistance-mobile-auth.duodian-health.0.3.0.umd.cjs',
  ])
  // Wrapper embeds the runtime as a string, so check the runtime's own module tree separately.
  const runtime = chunks(await build({ root, envDir: false, logLevel: 'silent',
    configFile: path.join(root, 'vite.custom-runtime.config.ts'), resolve: { alias: duodianRuntimeAliases },
    define: customerConfig.define,
    build: { write: false, lib: { entry: path.join(root, 'src/customers/duodian-health/runtime.ts'),
      name: 'AssistanceInjectedRuntime' } },
  }) as Rollup.RollupOutput)
  expect(runtime).toHaveLength(1)
  expect(runtime[0].imports).toEqual([])
  expect(runtime[0].dynamicImports).toEqual([])
  assertSuppliedOnly(runtime)
  expect(wrapper.flatMap(item => Object.keys(item.modules)).filter(id => /mobileAuthSignature|testHostParams/i.test(id))).toEqual([])
  for (const item of wrapper) expect(item.code).not.toMatch(/MOBILE_AUTH_FRONTEND_APP_KEY|VITE_SFT_CUSTOMER_APP_KEY|BEGIN (?:RSA )?PRIVATE KEY|MOCK_ONLY_INVALID_SIGN|300013215094|mock-app-id/)
}, 30000)

test('assembly keeps the loader-relative vendor CSS available and ships only customer resources', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'duodian-assembly-')); temporary.push(dir)
  const loaderDir = path.join(dir, 'loader'), wrapperDir = path.join(dir, 'wrapper'), outDir = path.join(dir, 'out')
  await mkdir(loaderDir); await mkdir(path.join(wrapperDir, 'vendor'), { recursive: true })
  await writeFile(path.join(loaderDir, 'custom-verification.html'), 'MOCK_ONLY_LOADER')
  for (const extension of ['js', 'umd.cjs']) await writeFile(path.join(wrapperDir, `assistance-mobile-auth.duodian-health.0.3.0.${extension}`), `MOCK_ONLY_${extension}`)
  await writeFile(path.join(wrapperDir, 'vendor/new-control-style.css'), 'MOCK_ONLY_CSS')
  await assembleDuodianTemp({ loaderDir, wrapperDir, outDir })
  const target = path.join(outDir, 'assist/0.3.0')
  expect((await readdir(target)).sort()).toEqual(['assistance-mobile-auth', 'custom-verification.html'])
  expect(await readFile(path.join(target, 'assistance-mobile-auth/vendor/new-control-style.css'), 'utf8')).toBe('MOCK_ONLY_CSS')
  expect(await readFile(path.join(target, 'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.0.js'), 'utf8')).toBe('MOCK_ONLY_js')
})

test('local assembly copies the mock-only host outside the customer resources', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'duodian-host-')); temporary.push(dir)
  const loaderDir = path.join(dir, 'loader'), wrapperDir = path.join(dir, 'wrapper'), outDir = path.join(dir, 'out')
  await mkdir(loaderDir); await mkdir(path.join(wrapperDir, 'vendor'), { recursive: true })
  await writeFile(path.join(loaderDir, 'custom-verification.html'), 'loader')
  for (const extension of ['js', 'umd.cjs']) await writeFile(path.join(wrapperDir, `assistance-mobile-auth.duodian-health.0.3.0.${extension}`), 'sdk')
  await writeFile(path.join(wrapperDir, 'vendor/new-control-style.css'), 'css')
  await assembleDuodianTemp({ loaderDir, wrapperDir, outDir })
  const host = await readFile(path.join(outDir, 'test-duodian-health-0.3.0.html'), 'utf8')
  expect(host).toContain('模拟官方SDK')
  expect(host).toContain('MOCK_ONLY_INVALID_SIGN')
  expect(host).toContain('format')
  expect(host).not.toMatch(/testHostParams|createTestHostAuthParams|appkey|private key/i)
  expect(await readdir(path.join(outDir, 'assist/0.3.0/assistance-mobile-auth'))).not.toContain('test-duodian-health-0.3.0.html')
})

test('explicit root public path builds a same-origin loader without inherited signing or base environment', async () => {
  await promisify(execFile)(process.execPath, [path.join(root, 'scripts/duodian-health/build.mjs'),
    '--base-path', '/', '--base-url', 'https://example.invalid/'], {
    cwd: root, env: { ...process.env, VITE_SFT_PUBLIC_BASE_PATH: '/MOCK_ONLY_ENV_PATH/',
      VITE_MOBILE_AUTH_SIGN: 'MOCK_ONLY_INVALID_SIGN' },
  })
  const loader = await readFile(path.join(root, 'dist-duodian-health-temp/assist/0.3.0/custom-verification.html'), 'utf8')
  expect(loader).toMatch(/src="\/assist\/0\.3\.0\/assets\//)
  const wrapper = await readFile(path.join(root, 'dist-duodian-health/assistance-mobile-auth.duodian-health.0.3.0.js'), 'utf8')
  expect(wrapper).toContain('https://example.invalid/assist/0.3.0/custom-verification.html')
  expect(wrapper).not.toMatch(/MOCK_ONLY_ENV_PATH|MOCK_ONLY_INVALID_SIGN/)
}, 30000)
