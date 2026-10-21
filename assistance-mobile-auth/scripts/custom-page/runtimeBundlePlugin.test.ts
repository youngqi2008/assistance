// @vitest-environment node
import { build, type Rollup } from 'vite'
import { expect, test } from 'vitest'
import { customRuntimeBundlePlugin } from './runtimeBundlePlugin'

test('runtimeEntry compiles each variant as a single self-contained runtime', async () => {
  const compiled: string[] = []
  for (const variant of ['first', 'second']) {
    const result = await build({
      configFile: false, logLevel: 'silent', publicDir: false,
      plugins: [
        { name: 'test-runtime-consumer', resolveId(id) { if (id.endsWith('/test-runtime-consumer')) return '\0test-runtime-consumer' },
          load(id) { if (id === '\0test-runtime-consumer') return "import runtime from 'virtual:assistance-custom-runtime';export default runtime" } },
        customRuntimeBundlePlugin({ runtimeEntry: 'tests/fixtures/custom-runtime-variant-entry.ts', runtimeDefine: { __CUSTOM_TEST_RUNTIME_VARIANT__: JSON.stringify(variant) } }),
      ],
      build: { write: false, lib: { entry: 'test-runtime-consumer', name: 'TestRuntimeConsumer', formats: ['iife'] } },
    }) as Rollup.RollupOutput | Rollup.RollupOutput[]
    const chunks = (Array.isArray(result) ? result : [result]).flatMap(output => output.output).filter(item => item.type === 'chunk')
    expect(chunks).toHaveLength(1)
    expect(chunks[0].imports).toEqual([])
    expect(chunks[0].dynamicImports).toEqual([])
    compiled.push(chunks[0].code)
  }
  expect(compiled[0]).not.toBe(compiled[1])
})
