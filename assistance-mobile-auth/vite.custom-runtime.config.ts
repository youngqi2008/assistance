import { defineConfig } from 'vite'
import path from 'node:path'
import { productionConsoleCalls } from './scripts/productionConsole'

export default defineConfig({
  publicDir: false,
  esbuild: { pure: productionConsoleCalls },
  build: {
    target: 'chrome98', write: false,
    lib: {
      entry: path.resolve(__dirname, 'src/custom-runtime/entry.ts'),
      name: 'AssistanceInjectedRuntime', formats: ['iife'], fileName: 'custom-runtime',
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
