import { build as viteBuild } from 'vite'
import { cp, copyFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))

export async function assembleDuodianTemp({ loaderDir, wrapperDir, outDir, sdkVersion = '0.3.0' }) {
  if (!['0.3.0', '0.3.1', '0.3.2'].includes(sdkVersion)) throw new Error('Unsupported --sdk-version')
  const loaderTarget = path.join(outDir, `assist/${sdkVersion}`)
  const wrapperTarget = path.join(loaderTarget, 'assistance-mobile-auth')
  // Only the customer's generated version subtree is replaced on repeated local builds.
  await rm(loaderTarget, { recursive: true, force: true })
  await mkdir(wrapperTarget, { recursive: true })
  await cp(loaderDir, loaderTarget, { recursive: true })
  for (const extension of ['js', 'umd.cjs']) await copyFile(
    path.join(wrapperDir, `assistance-mobile-auth.duodian-health.${sdkVersion}.${extension}`),
    path.join(wrapperTarget, `assistance-mobile-auth.duodian-health.${sdkVersion}.${extension}`),
  )
  await cp(path.join(wrapperDir, 'vendor'), path.join(wrapperTarget, 'vendor'), { recursive: true })
  if (sdkVersion === '0.3.0') await copyFile(path.join(projectRoot, 'tests/manual/test-duodian-health-0.3.0.html'),
    path.join(outDir, 'test-duodian-health-0.3.0.html'))
}

export function resolveDuodianBuildOptions(args) {
  const values = { '--sdk-version': '0.3.0', '--base-path': '/sign-pay-pro-temp/', '--base-url': 'https://ginkgo.chinaums.com/sign-pay-pro-temp/', '--loader-url': '' }
  for (let i = 0; i < args.length; i += 2) {
    if (!(args[i] in values) || !args[i + 1]) throw new Error('Supported options: --sdk-version 0.3.0|0.3.1|0.3.2 --base-path PATH --base-url URL --loader-url URL')
    values[args[i]] = args[i + 1]
  }
  const sdkVersion = values['--sdk-version']
  if (!['0.3.0', '0.3.1', '0.3.2'].includes(sdkVersion)) throw new Error('Unsupported --sdk-version; expected 0.3.0, 0.3.1 or 0.3.2')
  if (sdkVersion !== '0.3.0') {
    if (!args.includes('--base-path')) values['--base-path'] = '/sign-pay-pro/'
    if (!args.includes('--base-url')) values['--base-url'] = 'https://ginkgo.chinaums.com/sign-pay-pro/'
  }
  const strippedBasePath = values['--base-path'].replace(/^\/+|\/+$/g, '')
  const basePath = strippedBasePath ? `/${strippedBasePath}/` : '/'
  const baseUrl = `${new URL(values['--base-url']).href.replace(/\/+$/, '')}/`
  const loaderUrl = new URL(values['--loader-url'] || `assist/${sdkVersion}/custom-verification.html`, baseUrl).href
  return { sdkVersion, basePath, baseUrl, loaderUrl,
    outputName: sdkVersion === '0.3.0' ? 'duodian-health' : `duodian-health${sdkVersion.replaceAll('.', '')}`,
    publicBasePath: sdkVersion !== '0.3.0' ? `${basePath}assist/${sdkVersion}/` : basePath,
    publicBaseUrl: sdkVersion !== '0.3.0' ? new URL(`assist/${sdkVersion}/`, baseUrl).href : baseUrl }
}

export function createDuodianLoaderBuildOptions(options) {
  return { root: path.join(projectRoot, 'src/custom-loader'), configFile: false, envDir: false, envPrefix: [],
    publicDir: false, base: `${options.basePath}assist/${options.sdkVersion}/`,
    define: { __DUODIAN_IFRAME_AUTO_PARAMS__: options.sdkVersion !== '0.3.0' ? 'true' : 'false' },
    build: { target: 'chrome98', outDir: path.join(projectRoot, `dist-${options.outputName}-temp/.loader`), emptyOutDir: true,
      rollupOptions: { input: path.join(projectRoot, 'src/custom-loader/custom-verification.html') } },
  }
}

async function build(args) {
  const options = resolveDuodianBuildOptions(args)
  await viteBuild({ root: projectRoot, configFile: path.join(projectRoot, `vite.${options.outputName}.config.ts`),
    define: { 'import.meta.env.VITE_SFT_PUBLIC_BASE_PATH': JSON.stringify(options.publicBasePath),
      'import.meta.env.VITE_SFT_PUBLIC_BASE_URL': JSON.stringify(options.publicBaseUrl), __CUSTOM_LOADER_URL__: JSON.stringify(options.loaderUrl) },
  })
  // Keep version-specific loader outputs separate from all generic build directories.
  const loaderOptions = createDuodianLoaderBuildOptions(options)
  const loaderDir = loaderOptions.build.outDir
  await viteBuild(loaderOptions)
  await assembleDuodianTemp({ loaderDir, sdkVersion: options.sdkVersion,
    wrapperDir: path.join(projectRoot, `dist-${options.outputName}`),
    outDir: path.join(projectRoot, `dist-${options.outputName}-temp`) })
  await rm(loaderDir, { recursive: true, force: true })
  console.log(`Duodian Health ${options.sdkVersion} resources assembled in dist-${options.outputName}-temp`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await build(process.argv.slice(2))
