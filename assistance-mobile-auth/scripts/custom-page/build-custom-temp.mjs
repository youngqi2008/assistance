import { cp, copyFile, mkdir, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build as viteBuild } from 'vite'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))

export async function assembleCustomTemp({ loaderDir, wrapperDir, examplesDir, hostParamsFile = path.join(projectRoot, 'dist-custom-host-params/test-host-params.js'), outDir }) {
  const loaderTarget = path.join(outDir, 'assist/0.3.0')
  const wrapperTarget = path.join(loaderTarget, 'assistance-mobile-auth')
  // Replace only this generated version subtree, so repeated builds cannot ship stale bootstrap/example files.
  await rm(loaderTarget, { recursive: true, force: true })
  await mkdir(wrapperTarget, { recursive: true })
  await cp(loaderDir, loaderTarget, { recursive: true })
  for (const extension of ['js', 'umd.cjs']) {
    await copyFile(path.join(wrapperDir, `assistance-mobile-auth.${extension}`), path.join(wrapperTarget, `assistance-mobile-auth.0.3.0.${extension}`))
  }
  await cp(path.join(wrapperDir, 'vendor'), path.join(wrapperTarget, 'vendor'), { recursive: true })
  await cp(examplesDir, path.join(loaderTarget, 'examples'), { recursive: true })
  await copyFile(hostParamsFile, path.join(loaderTarget, 'test-host-params.js'))
  await copyFile(path.join(projectRoot, 'tests/manual/test-custom-page-0.3.0.html'), path.join(outDir, 'test-custom-page-0.3.0.html'))
}

async function build() {
  const env = { ...process.env }
  env.VITE_SFT_PUBLIC_BASE_PATH ??= '/sign-pay-pro-temp/'
  env.VITE_SFT_PUBLIC_BASE_URL ??= 'https://ginkgo.chinaums.com/sign-pay-pro-temp/'
  const loader = spawnSync('npm', ['run', 'build:custom-loader'], { cwd: projectRoot, env, stdio: 'inherit' })
  if (loader.error) throw loader.error
  if (loader.status !== 0) throw new Error(`build:custom-loader failed (${loader.status})`)
  await viteBuild({
    root: projectRoot,
    configFile: path.join(projectRoot, 'vite.wrapper.config.ts'),
    define: {
      __STATIC_RESOURCE_RELEASE__: 'true',
      __CUSTOM_LOADER_URL__: JSON.stringify(new URL('assist/0.3.0/custom-verification.html', env.VITE_SFT_PUBLIC_BASE_URL).href),
      'import.meta.env.VITE_SFT_PUBLIC_BASE_PATH': JSON.stringify(env.VITE_SFT_PUBLIC_BASE_PATH),
      'import.meta.env.VITE_SFT_PUBLIC_BASE_URL': JSON.stringify(env.VITE_SFT_PUBLIC_BASE_URL),
    },
    build: { outDir: 'dist-custom-wrapper' },
  })
  const hostParamsDir = path.join(projectRoot, 'dist-custom-host-params')
  await viteBuild({
    root: projectRoot, configFile: false,
    build: { outDir: hostParamsDir, emptyOutDir: true,
      lib: { entry: path.join(projectRoot, 'scripts/custom-page/testHostParams.ts'), name: 'AssistanceCustomPageTestHost', formats: ['iife'], fileName: () => 'test-host-params.js' },
    },
  })
  await assembleCustomTemp({ loaderDir: path.join(projectRoot, 'dist-custom-loader'), wrapperDir: path.join(projectRoot, 'dist-custom-wrapper'), examplesDir: path.join(projectRoot, 'examples'), hostParamsFile: path.join(hostParamsDir, 'test-host-params.js'), outDir: path.join(projectRoot, 'dist-custom-temp') })
  console.log('Custom 0.3.0 TEMP resources assembled in dist-custom-temp')
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await build()
}
