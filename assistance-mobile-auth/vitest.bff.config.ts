import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['bff/src/**/*.test.ts'],
    exclude: ['tests/**'],
  },
})
