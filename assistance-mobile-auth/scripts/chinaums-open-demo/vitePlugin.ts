import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

type AssistantAction = 'check' | 'query'

interface AssistantConfig {
  appId: string
  appKey: string
  privateKey: string
  userNo: string
  requestId: string
  keyA: string
}

interface JavaCliResult {
  httpBody: string
  decryptedData: string
}

interface VendorEnvelope {
  errCode?: string
  errInfo?: string
}

interface VendorBusinessData {
  detailRespCode?: string
  detailRespMsg?: string
  respCode?: string
  respMsg?: string
  idCard?: string
  mobile?: string
}

const DEFAULT_USER_NO = '08'
const DEFAULT_REQUEST_ID = '00139cdb314f45b0a4843a3a5fbd1a18078f120260508093855666'
const DEFAULT_KEY_A = '12345685825822222222222222'
const API_PREFIX = '/sign-pay-pro/api/mobile-assistant'
const JAVA_ROOT = path.resolve(process.cwd(), 'scripts/chinaums-open-demo')
const JAVA_BIN_DIR = path.join(JAVA_ROOT, 'bin')
const JAVA_JAR = path.join(JAVA_ROOT, 'bcprov-jdk15on-1.61.jar')
const JAVA_MAIN = 'com.open.demo.local.ChinaumsAssistantCli'
const DOCKER_JAVA_IMAGE = process.env.CHINAUMS_ASSISTANT_DOCKER_IMAGE?.trim() || 'eclipse-temurin:8-jdk'

function readAssistantConfig(): AssistantConfig | null {
  const appId = process.env.CHINAUMS_ASSISTANT_APP_ID?.trim()
  const appKey = process.env.CHINAUMS_ASSISTANT_APP_KEY?.trim()
  const privateKey = process.env.CHINAUMS_ASSISTANT_PRIVATE_KEY?.trim()

  if (!appId || !appKey || !privateKey) {
    return null
  }

  return {
    appId,
    appKey,
    privateKey,
    userNo: process.env.CHINAUMS_ASSISTANT_USER_NO?.trim() || DEFAULT_USER_NO,
    requestId: process.env.CHINAUMS_ASSISTANT_REQUEST_ID?.trim() || DEFAULT_REQUEST_ID,
    keyA: process.env.CHINAUMS_ASSISTANT_KEY_A?.trim() || DEFAULT_KEY_A,
  }
}

function readRequestBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8')
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json;charset=utf-8')
  response.end(JSON.stringify(payload))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function maskMobile(value: string) {
  return value.length >= 7 ? `${value.slice(0, 3)}****${value.slice(-4)}` : value
}

function maskIdCard(value: string) {
  return value.length >= 8 ? `${value.slice(0, 6)}********${value.slice(-4)}` : value
}

async function ensureJavaCompiled() {
  if (existsSync(path.join(JAVA_BIN_DIR, 'com/open/demo/local/ChinaumsAssistantCli.class'))) {
    return
  }

  await mkdir(JAVA_BIN_DIR, { recursive: true })

  await runProcess('javac', [
    '-encoding',
    'UTF-8',
    '-cp',
    JAVA_JAR,
    '-d',
    JAVA_BIN_DIR,
    path.join(JAVA_ROOT, 'src/com/open/demo/local/Base64.java'),
    path.join(JAVA_ROOT, 'src/com/open/demo/local/SM3.java'),
    path.join(JAVA_ROOT, 'src/com/open/demo/local/SM2.java'),
    path.join(JAVA_ROOT, 'src/com/open/demo/local/ChinaumsAssistantCli.java'),
  ])
}

async function runAssistantCliInDocker(args: string[]): Promise<string> {
  const dockerArgs = [
    'run',
    '--rm',
    '-v',
    `${JAVA_ROOT}:/work`,
    '-w',
    '/work',
    DOCKER_JAVA_IMAGE,
    'sh',
    '-lc',
    [
      'rm -rf bin',
      'mkdir -p bin',
      'javac -encoding UTF-8 -cp bcprov-jdk15on-1.61.jar -d bin $(find src -name "*.java")',
      `java -cp "bin:bcprov-jdk15on-1.61.jar" ${JAVA_MAIN} "$@"`,
    ].join(' && '),
    'chinaums-cli',
    ...args,
  ]

  return runProcess('docker', dockerArgs, { cwd: process.cwd() })
}

function runProcess(command: string, args: string[], options: { cwd?: string } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? JAVA_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8')
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim())
        return
      }

      reject(new Error(stderr.trim() || stdout.trim() || `${command} exited with ${code}`))
    })
  })
}

async function runAssistantCli(
  action: AssistantAction,
  config: AssistantConfig,
  input: {
    token: string
    idLast4?: string
  },
): Promise<JavaCliResult> {
  await ensureJavaCompiled()

    const cliArgs = [
      action,
      config.appId,
      config.appKey,
      config.privateKey,
      config.requestId,
      input.token,
      config.userNo,
    ]

    if (action === 'check') {
      cliArgs.push(input.idLast4 ?? '', config.keyA)
    }

    const javaArgs = [
      '-cp',
      `${JAVA_BIN_DIR}:${JAVA_JAR}`,
      JAVA_MAIN,
      ...cliArgs,
    ]

  let stdout: string
  try {
    stdout = await runProcess('java', javaArgs)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes('Unable to locate a Java Runtime') && !message.includes('ENOENT')) {
      throw error
    }

    stdout = await runAssistantCliInDocker(cliArgs)
  }
  return JSON.parse(stdout) as JavaCliResult
}

function parseJsonObject<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeVerifyResult(result: JavaCliResult) {
  const envelope = parseJsonObject<VendorEnvelope>(result.httpBody)
  const data = parseJsonObject<VendorBusinessData>(result.decryptedData)

  if (envelope?.errCode !== '20000000') {
    return {
      kind: 'verify-failed',
      message: envelope?.errInfo || '身份核验未通过',
      action: 'retry-fetch',
      code: envelope?.errCode,
    }
  }

  if (data?.respCode === '00' && data.detailRespCode === '0000') {
    return {
      kind: 'verified',
      message: data.respMsg || '身份核验通过',
    }
  }

  return {
    kind: 'verify-failed',
    message: data?.detailRespMsg || data?.respMsg || '身份核验未通过',
    action: 'retry-auth',
    code: data?.detailRespCode || data?.respCode,
  }
}

function normalizeIdentityResult(result: JavaCliResult) {
  const envelope = parseJsonObject<VendorEnvelope>(result.httpBody)
  const data = parseJsonObject<VendorBusinessData>(result.decryptedData)

  if (envelope?.errCode !== '20000000') {
    return {
      kind: 'identity-failed',
      message: envelope?.errInfo || '身份信息暂未返回',
      action: 'retry-fetch',
      code: envelope?.errCode,
    }
  }

  if (data?.respCode === '00' && data.detailRespCode === '0000' && data.mobile && data.idCard) {
    return {
      kind: 'identity-ready',
      message: data.respMsg || '身份信息已返回',
      identity: {
        displayName: '已实名用户',
        maskedMobile: maskMobile(data.mobile),
        maskedIdCard: maskIdCard(data.idCard),
      },
    }
  }

  return {
    kind: 'identity-failed',
    message: data?.detailRespMsg || data?.respMsg || '身份信息暂未返回',
    action: 'retry-auth',
    code: data?.detailRespCode || data?.respCode,
  }
}

async function handleAssistantRequest(
  request: IncomingMessage,
  response: ServerResponse,
  action: AssistantAction,
) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { kind: 'request-failed', message: 'Method Not Allowed' })
    return
  }

  const config = readAssistantConfig()
  if (!config) {
    sendJson(response, 503, {
      kind: 'request-failed',
      message: '本地后端联调参数未配置，请设置 CHINAUMS_ASSISTANT_APP_ID / APP_KEY / PRIVATE_KEY。',
    })
    return
  }

  try {
    const body = await readRequestBody(request)
    const token = isRecord(body) && typeof body.token === 'string' ? body.token.trim() : ''
    const idLast4 = isRecord(body) && typeof body.idLast4 === 'string' ? body.idLast4.trim().toUpperCase() : ''

    if (!token) {
      sendJson(response, 400, { kind: 'request-failed', message: '缺少 token。' })
      return
    }

    if (action === 'check' && !idLast4) {
      sendJson(response, 400, { kind: 'request-failed', message: '缺少身份证后四位。' })
      return
    }

    const result = await runAssistantCli(action, config, { token, idLast4 })
    sendJson(response, 200, action === 'check' ? normalizeVerifyResult(result) : normalizeIdentityResult(result))
  } catch (error) {
    sendJson(response, 502, {
      kind: 'request-failed',
      message: error instanceof Error ? error.message : '后端联调请求失败。',
    })
  }
}

export function chinaumsOpenDemoPlugin(): Plugin {
  return {
    name: 'chinaums-open-demo',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(`${API_PREFIX}/verify`, (request, response) => {
        void handleAssistantRequest(request, response, 'check')
      })
      server.middlewares.use(`${API_PREFIX}/identity`, (request, response) => {
        void handleAssistantRequest(request, response, 'query')
      })
    },
  }
}
