#!/usr/bin/env node

import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import { constants } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const bundledRrwebPath = path.join(scriptDir, 'vendor', 'rrweb.min.js')
const repoRrwebPath = path.resolve(scriptDir, '../../src/static/public/assistance-mobile-auth/vendor/rrweb.min.js')

function printUsage() {
  console.log('用法: node rrweb-events-to-video.mjs <events.json> [output.mp4|output.webm]')
  console.log('示例: node rrweb-events-to-video.mjs ./events.json ./replay.mp4')
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} 退出码 ${code}`))
    })
  })
}

async function findRrwebBundle() {
  for (const candidate of [bundledRrwebPath, repoRrwebPath]) {
    try {
      await access(candidate, constants.R_OK)
      return candidate
    } catch {
      // Try the next known location.
    }
  }
  throw new Error('找不到固定版本 rrweb.min.js；请确认 Demo 包中的 vendor/rrweb.min.js 存在。')
}

function normalizeEvents(parsed) {
  const events = Array.isArray(parsed) ? parsed : parsed?.events
  if (!Array.isArray(events) || events.length < 2) {
    throw new Error('events.json 必须是 rrweb 事件数组，或包含 events 数组的导出对象。')
  }
  if (!events.every((event) => event && Number.isFinite(event.timestamp))) {
    throw new Error('events.json 中存在缺少 timestamp 的无效事件。')
  }
  return events
}

function resolveViewport(events) {
  const meta = events.find((event) => event.type === 4 && event.data)
  const width = Number(meta?.data?.width)
  const height = Number(meta?.data?.height)
  return {
    width: Number.isFinite(width) && width > 0 ? Math.min(Math.round(width), 1920) : 390,
    height: Number.isFinite(height) && height > 0 ? Math.min(Math.round(height), 1080) : 844,
  }
}

function createReplayHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body, #replay { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #fff; }
    #replay > div { position: relative; width: 100% !important; height: 100% !important; }
    #replay iframe { position: absolute; inset: 0; border: 0; }
    #replay canvas, #replay .replayer-mouse { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
  </style>
</head>
<body>
  <div id="replay"></div>
  <script src="/rrweb.min.js"></script>
  <script>
    window.__replayFinished = false
    window.__replayError = null
    ;(async () => {
      try {
        const events = await fetch('/events.json').then((response) => response.json())
        const replayer = new window.rrweb.Replayer(events, {
          root: document.getElementById('replay'),
          speed: 1,
          skipInactive: false,
          showWarning: false,
        })
        replayer.on(window.rrweb.ReplayerEvents.Finish, () => {
          window.__replayFinished = true
        })
        replayer.play()
      } catch (error) {
        window.__replayError = error instanceof Error ? error.message : String(error)
      }
    })()
  </script>
</body>
</html>`
}

async function startReplayServer(events, rrwebSource) {
  const html = Buffer.from(createReplayHtml())
  const rrweb = await readFile(rrwebSource)
  const eventBody = Buffer.from(JSON.stringify(events))
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
    if (pathname === '/rrweb.min.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' })
      response.end(rrweb)
      return
    }
    if (pathname === '/events.json') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      response.end(eventBody)
      return
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(html)
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('无法启动本地回放服务。')
  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

async function recordWebm(events, outputPath, viewport, rrwebSource) {
  const videoDir = await mkdtemp(path.join(tmpdir(), 'rrweb-video-'))
  const server = await startReplayServer(events, rrwebSource)
  let browser
  let context
  let page
  try {
    browser = await chromium.launch({ headless: true })
    context = await browser.newContext({ viewport, recordVideo: { dir: videoDir, size: viewport } })
    page = await context.newPage()
    const video = page.video()
    await page.goto(server.url, { waitUntil: 'networkidle' })
    const duration = Math.max(0, events.at(-1).timestamp - events[0].timestamp)
    await page.waitForFunction(
      () => window.__replayFinished === true || window.__replayError !== null,
      undefined,
      { timeout: Math.max(30_000, duration + 30_000) },
    )
    const replayError = await page.evaluate(() => window.__replayError)
    if (replayError) throw new Error(`rrweb 回放失败：${replayError}`)
    await page.waitForTimeout(500)
    await page.close()
    if (!video) throw new Error('Playwright 没有生成视频。')
    await video.saveAs(outputPath)
  } finally {
    if (page && !page.isClosed()) await page.close().catch(() => undefined)
    if (context) await context.close().catch(() => undefined)
    if (browser) await browser.close().catch(() => undefined)
    await server.close()
    await rm(videoDir, { recursive: true, force: true })
  }
}

async function main() {
  const [, , inputArg, outputArg = 'rrweb-replay.mp4'] = process.argv
  if (!inputArg || inputArg === '--help' || inputArg === '-h') {
    printUsage()
    process.exitCode = inputArg ? 0 : 1
    return
  }

  const inputPath = path.resolve(inputArg)
  const outputPath = path.resolve(outputArg)
  const extension = path.extname(outputPath).toLowerCase()
  if (!['.mp4', '.webm'].includes(extension)) {
    throw new Error('输出文件扩展名只支持 .mp4 或 .webm。')
  }

  const parsed = JSON.parse(await readFile(inputPath, 'utf8'))
  const events = normalizeEvents(parsed)
  const viewport = resolveViewport(events)
  const rrwebSource = await findRrwebBundle()
  const tempWebm = extension === '.webm'
    ? outputPath
    : path.join(await mkdtemp(path.join(tmpdir(), 'rrweb-convert-')), 'replay.webm')

  console.log(`rrweb 事件: ${events.length} 条，画面: ${viewport.width}x${viewport.height}`)
  await recordWebm(events, tempWebm, viewport, rrwebSource)

  if (extension === '.mp4') {
    try {
      await run('ffmpeg', [
        '-y', '-i', tempWebm,
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        outputPath,
      ])
    } catch (error) {
      throw new Error(`MP4 转换失败，请确认已安装 ffmpeg。${error.message}`)
    } finally {
      await rm(path.dirname(tempWebm), { recursive: true, force: true })
    }
  }

  console.log(`已生成: ${outputPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
