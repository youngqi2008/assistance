import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __STATIC_RESOURCE_RELEASE__: 'false',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'virtual:assistance-custom-runtime': path.resolve(__dirname, 'src/test/fixtures/customRuntimeSource.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{js,ts}'],
    exclude: ['tests/**'],
  },
})
