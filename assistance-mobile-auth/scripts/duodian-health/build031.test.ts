// @vitest-environment node
import { build, type Rollup } from 'vite'
import { afterEach, expect, test } from 'vitest'
import { existsSync } from 'node:fs'
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
// @ts-expect-error JavaScript build helper has no declaration file.
import * as builder from './build.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const temporary: string[] = []
afterEach(async () => { for (const dir of temporary.splice(0)) await rm(dir, { recursive: true, force: true }) })
const chunks = (result: Rollup.RollupOutput | Rollup.RollupOutput[]) =>
  (Array.isArray(result) ? result : [result]).flatMap(item => item.output).filter(item => item.type === 'chunk')

test('031 is explicitly selected; unchanged 030 defaults and version-specific probe/loader roots', () => {
  expect(typeof builder.resolveDuodianBuildOptions).toBe('function')
  const old = builder.resolveDuodianBuildOptions([])
  expect(old).toMatchObject({ sdkVersion: '0.3.0', outputName: 'duodian-health', basePath: '/sign-pay-pro-temp/',
    publicBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro-temp/' })
  expect(builder.resolveDuodianBuildOptions(['--sdk-version', '0.3.1'])).toMatchObject({
    publicBasePath: '/sign-pay-pro/assist/0.3.1/',
    publicBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/',
  })
  const selected = builder.resolveDuodianBuildOptions(['--sdk-version', '0.3.1', '--base-path', '/sign-pay-pro/',
    '--base-url', 'https://ginkgo.chinaums.com/sign-pay-pro/'])
  expect(selected).toMatchObject({ sdkVersion: '0.3.1', outputName: 'duodian-health031',
    publicBasePath: '/sign-pay-pro/assist/0.3.1/', publicBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/',
    loaderUrl: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/custom-verification.html' })
  expect(() => builder.resolveDuodianBuildOptions(['--sdk-version', '0.3.3'])).toThrow(/sdk-version/)
})

test('031 ESM/UMD and embedded runtime retain supplied-only module trees', async () => {
  const configPath = path.join(root, 'vite.duodian-health031.config.ts')
  expect(existsSync(configPath)).toBe(true)
  const { default: config, duodian031RuntimeAliases } = await import('../../vite.duodian-health031.config')
  expect(config.define).toMatchObject({
    'import.meta.env.VITE_SFT_PUBLIC_BASE_PATH': JSON.stringify('/sign-pay-pro/assist/0.3.1/'),
    'import.meta.env.VITE_SFT_PUBLIC_BASE_URL': JSON.stringify('https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.1/'),
  })
  const wrapper = chunks(await build({ ...config, configFile: false, logLevel: 'silent',
    build: { ...config.build, write: false } }) as Rollup.RollupOutput[])
  expect(wrapper.map(item => item.fileName).sort()).toEqual([
    'assistance-mobile-auth.duodian-health.0.3.1.js', 'assistance-mobile-auth.duodian-health.0.3.1.umd.cjs',
  ])
  const runtime = chunks(await build({ root, envDir: false, logLevel: 'silent',
    configFile: path.join(root, 'vite.custom-runtime.config.ts'), resolve: { alias: duodian031RuntimeAliases },
    define: config.define, build: { write: false, lib: { entry: path.join(root, 'src/customers/duodian-health/runtime.ts'),
      name: 'AssistanceInjectedRuntime' } },
  }) as Rollup.RollupOutput)
  expect(runtime).toHaveLength(1)
  expect(runtime[0].imports).toEqual([])
  expect(runtime[0].dynamicImports).toEqual([])
  const modules = runtime.flatMap(item => Object.keys(item.modules))
  expect(modules.some(id => id.endsWith('/suppliedSdk.ts'))).toBe(true)
  for (const output of [wrapper, runtime]) {
    expect(output.flatMap(item => Object.keys(item.modules)).filter(id => /mobileAuthSignature|testHostParams|sftSignature|signParams/i.test(id))).toEqual([])
    for (const item of output) expect(item.code).not.toMatch(/MOBILE_AUTH_FRONTEND_APP_KEY|VITE_SFT_CUSTOMER_APP_KEY|BEGIN (?:RSA )?PRIVATE KEY|sign-pay-pro-temp|MOCK_ONLY_INVALID_SIGN/)
  }
}, 30000)

test('actual 031 iframe tree contains signer and ordinary/030 iframe trees exclude it', async () => {
  expect(typeof builder.createDuodianLoaderBuildOptions).toBe('function')
  for (const version of ['0.3.0', '0.3.1']) {
    const options = builder.createDuodianLoaderBuildOptions(builder.resolveDuodianBuildOptions(['--sdk-version', version]))
    const output = chunks(await build({ ...options, logLevel: 'silent', build: { ...options.build, write: false } }) as Rollup.RollupOutput)
    const modules = output.flatMap(item => Object.keys(item.modules))
    expect(modules.some(id => id.endsWith('/duodian031AuthParams.ts'))).toBe(version === '0.3.1')
    expect(modules.some(id => id.endsWith('/mobileAuthSignature.ts'))).toBe(version === '0.3.1')
  }
  const output = chunks(await build({ configFile: path.join(root, 'vite.custom-loader.config.ts'), logLevel: 'silent',
    build: { write: false } }) as Rollup.RollupOutput)
  expect(output.flatMap(item => Object.keys(item.modules)).filter(id => /duodian031AuthParams|mobileAuthSignature/.test(id))).toEqual([])
}, 30000)

test('031 assembly replaces only its version subtree and does not copy the 030 host/helper', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'duodian031-assembly-')); temporary.push(dir)
  const loaderDir = path.join(dir, 'loader'), wrapperDir = path.join(dir, 'wrapper'), outDir = path.join(dir, 'out')
  await mkdir(loaderDir); await mkdir(path.join(wrapperDir, 'vendor'), { recursive: true })
  await mkdir(path.join(outDir, 'assist/0.3.0'), { recursive: true })
  await writeFile(path.join(outDir, 'assist/0.3.0/preserved'), '030')
  await writeFile(path.join(loaderDir, 'custom-verification.html'), 'MOCK_ONLY_LOADER')
  for (const extension of ['js', 'umd.cjs']) await writeFile(path.join(wrapperDir, `assistance-mobile-auth.duodian-health.0.3.1.${extension}`), `MOCK_ONLY_${extension}`)
  await writeFile(path.join(wrapperDir, 'vendor/new-control-style.css'), 'MOCK_ONLY_CSS')
  await builder.assembleDuodianTemp({ loaderDir, wrapperDir, outDir, sdkVersion: '0.3.1' })
  expect(await readFile(path.join(outDir, 'assist/0.3.0/preserved'), 'utf8')).toBe('030')
  expect((await readdir(outDir)).sort()).toEqual(['assist'])
  const target = path.join(outDir, 'assist/0.3.1')
  expect((await readdir(target)).sort()).toEqual(['assistance-mobile-auth', 'custom-verification.html'])
  expect(await readFile(path.join(target, 'assistance-mobile-auth/vendor/new-control-style.css'), 'utf8')).toBe('MOCK_ONLY_CSS')
  expect(await readFile(path.join(target, 'assistance-mobile-auth/assistance-mobile-auth.duodian-health.0.3.1.js'), 'utf8')).toBe('MOCK_ONLY_js')
})
