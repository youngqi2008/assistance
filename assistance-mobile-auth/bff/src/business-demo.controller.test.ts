import 'reflect-metadata'

import { BadRequestException } from '@nestjs/common'
import { HTTP_CODE_METADATA, METHOD_METADATA, PARAMTYPES_METADATA, PATH_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants.js'
import { mkdtemp, readFile, mkdir, writeFile, rm, symlink } from 'node:fs/promises'
import { execFile as execFileCallback } from 'node:child_process'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BusinessDemoController } from './business-demo.controller.js'

const execFile = promisify(execFileCallback)

describe('BusinessDemoController', () => {
  const service = {
    checkIdentity: vi.fn(),
    queryIdentity: vi.fn(),
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  async function loadRuntimeController() {
    const tempRoot = await mkdtemp(join(tmpdir(), 'business-demo-controller-'))
    try {
      const sourceRoot = join(process.cwd(), 'bff/src')
      await symlink(join(process.cwd(), 'node_modules'), join(tempRoot, 'node_modules'))
      const filesToCompile = [
        'business-demo.controller.ts',
        'business-demo.service.ts',
        'config.ts',
        'chinaums-assistant-client.ts',
        'java-demo-sm2.ts',
      ]

      await Promise.all(
        filesToCompile.map(async (file) => {
          const sourcePath = join(sourceRoot, file)
          const outputPath = join(tempRoot, file.replace(/\.ts$/, '.mjs'))
          await mkdir(dirname(outputPath), { recursive: true })
          const source = await readFile(sourcePath, 'utf8')
          const emitted = ts.transpileModule(source, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2023,
              module: ts.ModuleKind.ESNext,
              experimentalDecorators: true,
              emitDecoratorMetadata: true,
              esModuleInterop: true,
            },
            fileName: sourcePath,
          })
          const outputText = emitted.outputText.replace(/\.js(['"])/g, '.mjs$1')
          await writeFile(outputPath, outputText, 'utf8')
        }),
      )

      const controllerUrl = pathToFileURL(join(tempRoot, 'business-demo.controller.mjs')).href
      const serviceUrl = pathToFileURL(join(tempRoot, 'business-demo.service.mjs')).href
      const script = `
      import assert from 'node:assert/strict'
      const [controllerModule, serviceModule] = await Promise.all([
        import(${JSON.stringify(controllerUrl)}),
        import(${JSON.stringify(serviceUrl)}),
      ])
      assert.deepEqual(Reflect.getMetadata(${JSON.stringify(PARAMTYPES_METADATA)}, controllerModule.BusinessDemoController), [serviceModule.BusinessDemoService])
      assert.equal(Reflect.getMetadata(${JSON.stringify(PATH_METADATA)}, controllerModule.BusinessDemoController), 'business-demo')
      assert.equal(Reflect.getMetadata(${JSON.stringify(METHOD_METADATA)}, controllerModule.BusinessDemoController.prototype.checkIdentity), 1)
      assert.equal(Reflect.getMetadata(${JSON.stringify(PATH_METADATA)}, controllerModule.BusinessDemoController.prototype.checkIdentity), 'check')
      assert.equal(Reflect.getMetadata(${JSON.stringify(HTTP_CODE_METADATA)}, controllerModule.BusinessDemoController.prototype.checkIdentity), 200)
      assert.deepEqual(Reflect.getMetadata(${JSON.stringify(ROUTE_ARGS_METADATA)}, controllerModule.BusinessDemoController, 'checkIdentity'), {
        '3:0': { index: 0, data: undefined, pipes: [] },
      })
      assert.equal(Reflect.getMetadata(${JSON.stringify(METHOD_METADATA)}, controllerModule.BusinessDemoController.prototype.queryIdentity), 1)
      assert.equal(Reflect.getMetadata(${JSON.stringify(PATH_METADATA)}, controllerModule.BusinessDemoController.prototype.queryIdentity), 'query')
      assert.equal(Reflect.getMetadata(${JSON.stringify(HTTP_CODE_METADATA)}, controllerModule.BusinessDemoController.prototype.queryIdentity), 200)
      assert.deepEqual(Reflect.getMetadata(${JSON.stringify(ROUTE_ARGS_METADATA)}, controllerModule.BusinessDemoController, 'queryIdentity'), {
        '3:0': { index: 0, data: undefined, pipes: [] },
      })
    `
      await execFile(process.execPath, ['--input-type=module', '--eval', script], {
        cwd: tempRoot,
      })

      return {
        cleanup: () => rm(tempRoot, { recursive: true, force: true }),
      }
    } catch (error) {
      await rm(tempRoot, { recursive: true, force: true })
      throw error
    }
  }

  function expectBadRequestResponse(error: unknown, expected: { message: string }) {
    expect(error).toBeInstanceOf(BadRequestException)
    expect((error as BadRequestException).getResponse()).toEqual({
      kind: 'request-failed',
      message: expected.message,
      action: 'retry-fetch',
    })
  }

  it('emits runtime Nest metadata for constructor injection and body routes', async () => {
    const { cleanup } = await loadRuntimeController()

    try {
      expect(true).toBe(true)
    } finally {
      await cleanup()
    }
  })

  it('validates and delegates check requests', async () => {
    service.checkIdentity.mockResolvedValue({ kind: 'verified', message: '核验通过' })
    const controller = new BusinessDemoController(service as never)

    await expect(
      controller.checkIdentity({
        token: ' sdk-token ',
        idLast4: ' abcd ',
        keyA: ' sdk-key-a ',
      }),
    ).resolves.toEqual({ kind: 'verified', message: '核验通过' })

    expect(service.checkIdentity).toHaveBeenCalledWith({
      token: 'sdk-token',
      idLast4: 'ABCD',
      keyA: 'sdk-key-a',
    })
  })

  it('rejects check requests missing token, idLast4, or keyA', async () => {
    const controller = new BusinessDemoController(service as never)

    expect(() => controller.checkIdentity({ token: '', idLast4: '1234', keyA: 'key-a' })).toThrow(BadRequestException)
    expect(() => controller.checkIdentity({ token: 'sdk-token', idLast4: '', keyA: 'key-a' })).toThrow(BadRequestException)
    expect(() => controller.checkIdentity({ token: 'sdk-token', idLast4: '1234', keyA: '' })).toThrow(BadRequestException)

    try {
      controller.checkIdentity(undefined)
      throw new Error('Expected BadRequestException')
    } catch (error) {
      expectBadRequestResponse(error, { message: '缺少 token、身份证后四位或 keyA。' })
    }

    try {
      controller.checkIdentity(null)
      throw new Error('Expected BadRequestException')
    } catch (error) {
      expectBadRequestResponse(error, { message: '缺少 token、身份证后四位或 keyA。' })
    }

    for (const body of ['bad-body', 123]) {
      try {
        controller.checkIdentity(body as never)
        throw new Error('Expected BadRequestException')
      } catch (error) {
        expectBadRequestResponse(error, { message: '缺少 token、身份证后四位或 keyA。' })
      }
    }

    expect(service.checkIdentity).not.toHaveBeenCalled()
  })

  it('validates and delegates query requests', async () => {
    service.queryIdentity.mockResolvedValue({
      kind: 'identity-encrypted',
      message: '查询成功',
      identity: {
        encryptedName: 'name-cipher',
        encryptedMobile: 'mobile-cipher',
        encryptedIdCard: 'id-cipher',
      },
    })
    const controller = new BusinessDemoController(service as never)

    await expect(controller.queryIdentity({ token: ' sdk-token ' })).resolves.toEqual({
      kind: 'identity-encrypted',
      message: '查询成功',
      identity: {
        encryptedName: 'name-cipher',
        encryptedMobile: 'mobile-cipher',
        encryptedIdCard: 'id-cipher',
      },
    })
    expect(service.queryIdentity).toHaveBeenCalledWith({ token: 'sdk-token' })
  })

  it('rejects query requests missing token', async () => {
    const controller = new BusinessDemoController(service as never)

    expect(() => controller.queryIdentity({ token: '' })).toThrow(BadRequestException)
    try {
      controller.queryIdentity(undefined)
      throw new Error('Expected BadRequestException')
    } catch (error) {
      expectBadRequestResponse(error, { message: '缺少 token。' })
    }

    try {
      controller.queryIdentity(null)
      throw new Error('Expected BadRequestException')
    } catch (error) {
      expectBadRequestResponse(error, { message: '缺少 token。' })
    }

    for (const body of ['bad-body', 123]) {
      try {
        controller.queryIdentity(body as never)
        throw new Error('Expected BadRequestException')
      } catch (error) {
        expectBadRequestResponse(error, { message: '缺少 token。' })
      }
    }

    expect(service.queryIdentity).not.toHaveBeenCalled()
  })
})
