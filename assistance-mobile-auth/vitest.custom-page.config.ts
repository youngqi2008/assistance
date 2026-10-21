import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config'

export default defineConfig(mergeConfig(
  baseConfig,
  { test: { environment: 'jsdom' } },
))
