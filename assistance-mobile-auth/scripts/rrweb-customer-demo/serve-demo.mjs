#!/usr/bin/env node

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 8080)
const routes = new Map([
  ['/', ['caller-jssdk-rrweb-demo.html', 'text/html; charset=utf-8']],
  ['/caller-jssdk-rrweb-demo.html', ['caller-jssdk-rrweb-demo.html', 'text/html; charset=utf-8']],
  ['/vendor/rrweb.min.js', ['vendor/rrweb.min.js', 'text/javascript; charset=utf-8']],
])

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
  const route = routes.get(pathname)
  if (!route) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }
  const [relativePath, contentType] = route
  const filePath = path.join(root, relativePath)
  try {
    const metadata = await stat(filePath)
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': metadata.size,
      'Cache-Control': 'no-store',
    })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(`Missing demo file: ${relativePath}`)
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Demo 已启动：http://127.0.0.1:${port}/`)
  console.log('按 Ctrl+C 停止。')
})
