import { build, type Plugin, type ResolvedConfig } from 'vite'
import path from 'node:path'

const virtualId = 'virtual:assistance-custom-runtime'
const resolvedId = `\0${virtualId}`
const projectRoot = path.resolve(import.meta.dirname, '../..')

export function customRuntimeBundlePlugin(input: {
  runtimeEntry?: string
  runtimeDefine?: Record<string, string>
  runtimeAliases?: Record<string, string>
} = {}): Plugin {
  let parent: ResolvedConfig
  let source: Promise<string> | undefined
  async function bundle(): Promise<string> {
    const result = await build({
      root: projectRoot,
      configFile: path.resolve(projectRoot, 'vite.custom-runtime.config.ts'),
      envDir: parent.envDir, mode: parent.mode,
      envPrefix: parent.envPrefix,
      resolve: { alias: input.runtimeAliases },
      define: {
        ...Object.fromEntries(Object.entries(parent.env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])),
        ...parent.define, ...input.runtimeDefine,
      },
      build: {
        write: false,
        ...(input.runtimeEntry ? { lib: { entry: path.resolve(projectRoot, input.runtimeEntry), name: 'AssistanceInjectedRuntime' } } : {}),
      },
    })
    if ('on' in result) throw new Error('Custom runtime must be a finite build')
    const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output)
    const chunks = outputs.filter(item => item.type === 'chunk')
    if (chunks.length !== 1 || chunks[0].imports.length || chunks[0].dynamicImports.length || outputs.length !== 1) {
      throw new Error('Custom runtime must contain exactly one self-contained IIFE without external assets')
    }
    return chunks[0].code
  }
  return {
    name: 'assistance-custom-runtime-bundle',
    configResolved(config) { parent = config },
    resolveId(id) { if (id === virtualId) return resolvedId },
    async load(id) {
      if (id !== resolvedId) return
      source ??= bundle()
      return `export default ${JSON.stringify(await source)};`
    },
  }
}
