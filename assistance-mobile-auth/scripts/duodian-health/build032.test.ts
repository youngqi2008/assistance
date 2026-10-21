// @vitest-environment node
import { build, type Rollup } from 'vite'
import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
// @ts-expect-error JavaScript build helper has no declaration file.
import * as builder from './build.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const chunks = (result: Rollup.RollupOutput | Rollup.RollupOutput[]) =>
  (Array.isArray(result) ? result : [result]).flatMap(item => item.output).filter(item => item.type === 'chunk')

test('032 routes probes and loaders independently in formal and TEMP environments', () => {
  expect(builder.resolveDuodianBuildOptions(['--sdk-version', '0.3.2'])).toMatchObject({
    outputName: 'duodian-health032', publicBasePath: '/sign-pay-pro/assist/0.3.2/',
    publicBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/',
    loaderUrl: 'https://ginkgo.chinaums.com/sign-pay-pro/assist/0.3.2/custom-verification.html',
  })
  const temp = builder.resolveDuodianBuildOptions(['--sdk-version', '0.3.2', '--base-path', '/sign-pay-pro-temp/', '--base-url', 'https://ginkgo.chinaums.com/sign-pay-pro-temp/'])
  expect(temp).toMatchObject({ publicBasePath: '/sign-pay-pro-temp/assist/0.3.2/',
    publicBaseUrl: 'https://ginkgo.chinaums.com/sign-pay-pro-temp/assist/0.3.2/',
    loaderUrl: 'https://ginkgo.chinaums.com/sign-pay-pro-temp/assist/0.3.2/custom-verification.html' })
  expect(builder.createDuodianLoaderBuildOptions(temp).build.outDir).toBe(path.join(root, 'dist-duodian-health032-temp/.loader'))
})

test('032 ESM/UMD carry the exact clear JPEG and embedded runtime retains supplied-only SDK trees', async () => {
  const configPath = path.join(root, 'vite.duodian-health032.config.ts')
  const { default: config, duodian032RuntimeAliases } = await import(/* @vite-ignore */ configPath)
  const source = readFileSync(path.join(root, 'src/customers/duodian-health/assets/identity-0.3.2.jpg'))
  const image = 'data:image/jpeg;base64,' + source.toString('base64')
  const wrapper = chunks(await build({ ...config, configFile: false, logLevel: 'silent', build: { ...config.build, write: false } }) as Rollup.RollupOutput[])
  expect(wrapper.map(item => item.fileName).sort()).toEqual(['assistance-mobile-auth.duodian-health.0.3.2.js', 'assistance-mobile-auth.duodian-health.0.3.2.umd.cjs'])
  const runtime = chunks(await build({ root, envDir: false, logLevel: 'silent', configFile: path.join(root, 'vite.custom-runtime.config.ts'),
    resolve: { alias: duodian032RuntimeAliases }, define: config.define,
    build: { write: false, lib: { entry: path.join(root, 'src/customers/duodian-health/runtime.ts'), name: 'AssistanceInjectedRuntime' } },
  }) as Rollup.RollupOutput)
  expect(runtime).toHaveLength(1)
  expect(runtime[0].imports).toEqual([]); expect(runtime[0].dynamicImports).toEqual([])
  expect(runtime.flatMap(item => Object.keys(item.modules)).some(id => id.endsWith('/suppliedSdk.ts'))).toBe(true)
  for (const output of [wrapper, runtime]) {
    const modules = output.flatMap(item => Object.keys(item.modules))
    expect(modules.filter(id => /mobileAuthSignature|testHostParams|sftSignature|signParams|duodian031AuthParams/i.test(id))).toEqual([])
  }
  // Page HTML is transferred by wrapper boot; runtime consumes it rather than importing page.ts.
  for (const item of wrapper) expect(item.code.includes(image), item.fileName + ' carries exact JPEG').toBe(true)
}, 30000)

test('032 iframe retains 031 iframe-only parameter signing', async () => {
  const options = builder.createDuodianLoaderBuildOptions(builder.resolveDuodianBuildOptions(['--sdk-version', '0.3.2']))
  const output = chunks(await build({ ...options, logLevel: 'silent', build: { ...options.build, write: false } }) as Rollup.RollupOutput)
  const modules = output.flatMap(item => Object.keys(item.modules))
  expect(modules.some(id => id.endsWith('/duodian031AuthParams.ts'))).toBe(true)
  expect(modules.some(id => id.endsWith('/mobileAuthSignature.ts'))).toBe(true)
})
