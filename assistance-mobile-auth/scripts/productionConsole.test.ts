// @vitest-environment node
import { build } from 'esbuild'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { loadConfigFromFile } from 'vite'
import { expect, it, vi } from 'vitest'

it.each(['vite.config.ts', 'vite.static.config.ts', 'vite.wrapper.config.ts'])(
  '%s removes production output while preserving side effects, callbacks and host console', async (configFile) => {
    for (const command of ['build', 'serve'] as const) {
      const loaded = await loadConfigFromFile({ command, mode: command === 'build' ? 'production' : 'development' }, resolve(configFile))
      const esbuild = loaded!.config.esbuild
      const result = await build({
        stdin: {
          contents: `
            import { loadRrwebResource } from './src/recording/rrwebResource';
            import { startRrwebRecorder } from './src/recording/rrwebRecorder';
            export { loadRrwebResource, startRrwebRecorder };
            export const effects = [];
            const effect = value => { effects.push(value); return value; };
            console.log(effect('log'));
            console.info(effect('info'));
            console.warn(effect('warn'));
            console.error(effect('error'));
            console.debug(effect('debug'));
          `,
          resolveDir: process.cwd(),
        },
        bundle: true, write: false, format: 'cjs', platform: 'node',
        pure: esbuild ? esbuild.pure : undefined,
        minify: true,
        define: { 'import.meta.env': '{}' },
      })
      const hostConsole = { log: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
      const references = { ...hostConsole }
      const module = { exports: {} as { effects: string[]; loadRrwebResource: (options: object) => Promise<unknown>; startRrwebRecorder: (options: object) => Promise<unknown> } }
      runInNewContext(result.outputFiles[0].text, { module, exports: module.exports, console: hostConsole, URL })
      expect(module.exports.effects).toEqual(['log', 'info', 'warn', 'error', 'debug'])
      for (const method of Object.keys(hostConsole) as Array<keyof typeof hostConsole>) {
        expect(hostConsole[method]).toBe(references[method])
        expect(hostConsole[method]).toHaveBeenCalledTimes(command === 'build' ? 0 : 1)
      }
      const failingDocument = {
        createElement() {
          return { onError: () => {}, addEventListener(name: string, callback: () => void) { if (name === 'error') this.onError = callback } }
        },
        head: { appendChild(script: { onError(): void }) { queueMicrotask(() => script.onError()) } },
      }
      const targetWindow = { location: { href: 'https://caller.example/' } }
      const options = { targetWindow, targetDocument: failingDocument }
      await expect(module.exports.loadRrwebResource(options)).resolves.toMatchObject({ status: 'unavailable' })
      await module.exports.loadRrwebResource(options)
      expect(hostConsole.warn).toHaveBeenCalledTimes(command === 'build' ? 0 : 2)
      const warn = vi.fn()
      const explicit = { ...options, targetWindow: { ...targetWindow }, warn }
      await module.exports.loadRrwebResource(explicit)
      await module.exports.loadRrwebResource(explicit)
      expect(warn).toHaveBeenCalledTimes(1)
      await expect(module.exports.startRrwebRecorder({ ...options, targetWindow: { ...targetWindow }, emit() {} })).resolves.toMatchObject({ status: 'unavailable' })
      expect(hostConsole.warn).toHaveBeenCalledTimes(command === 'build' ? 0 : 3)
    }
  },
)
