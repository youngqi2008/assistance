import { build, loadConfigFromFile } from 'vite'
import { spawnSync } from 'node:child_process'
import { cp, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { customRuntimeBundlePlugin } from './runtimeBundlePlugin.ts'
import { assembleCustomTemp } from './build-custom-temp.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const outDir = path.join(root, 'dist-custom-compat')
const base = process.env.VITE_SFT_PUBLIC_BASE_URL ?? 'http://127.0.0.1:4183/sign-pay-pro-temp/'
process.env.VITE_SFT_PUBLIC_BASE_PATH ??= '/sign-pay-pro-temp/'
process.env.VITE_SFT_PUBLIC_BASE_URL = base

// Use the ordinary assembled customer package, including its unchanged loader bytes.
await assembleCustomTemp({ loaderDir: path.join(root, 'dist-custom-loader'), wrapperDir: path.join(root, 'dist-custom-wrapper'), examplesDir: path.join(root, 'examples'), outDir })
const h5 = spawnSync('npm', ['run', 'build:h5'], {
  cwd: root, stdio: 'inherit',
  env: { ...process.env, VITE_MOBILE_AUTH_SDK_ENABLED: 'true', VITE_MOBILE_AUTH_SDK_MODE: 'live' },
})
if (h5.error) throw h5.error
if (h5.status !== 0) throw new Error(`Compatibility H5 build failed (${h5.status})`)
await cp(path.join(root, 'dist'), outDir, { recursive: true })
for (const variant of ['first', 'second']) {
  const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, path.join(root, 'vite.wrapper.config.ts'))
  if (!loaded) throw new Error('Wrapper build config could not be loaded')
  const config = loaded.config
  await build({
    ...config, root, configFile: false,
    define: { ...config.define, __STATIC_RESOURCE_RELEASE__: 'true',
      __CUSTOM_LOADER_URL__: JSON.stringify(new URL('assist/0.3.0/custom-verification.html', base).href) },
    plugins: config.plugins.map(plugin => plugin.name === 'assistance-custom-runtime-bundle'
      ? customRuntimeBundlePlugin({ runtimeEntry: 'tests/fixtures/custom-runtime-variant-entry.ts', runtimeDefine: { __CUSTOM_TEST_RUNTIME_VARIANT__: JSON.stringify(variant) } })
      : plugin),
    build: { ...config.build, outDir: path.join(outDir, 'test-fixtures', variant) },
  })
}

// Exercise the retained legacy release bytes without requiring prior Git history.
const legacyTarget = path.join(outDir, 'test-fixtures/legacy')
await mkdir(legacyTarget, { recursive: true })
await cp(path.join(root, 'release-frozen/static-mobile-auth-0.2.6/dist'), legacyTarget, { recursive: true })
console.log(`Compiled compatibility resources: ${outDir}`)
