import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import process from 'node:process'

const releaseDist = path.resolve(process.argv[2] ?? 'release/static-mobile-auth-0.2.0/dist')
const port = Number(process.argv[3] ?? 4180)

const mimeByExt = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.cjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

function resolveFile(pathname) {
  if (pathname === '/sign-pay-pro/verification') {
    return path.join(releaseDist, 'index.html')
  }
  const versionedVerification = pathname.match(
    /^\/sign-pay-pro\/assist\/(\d+\.\d+\.\d+)(?:\/verification|\/)$/,
  )
  if (versionedVerification) {
    return path.join(releaseDist, 'assist', versionedVerification[1], 'index.html')
  }
  if (pathname.startsWith('/sign-pay-pro/')) {
    return path.join(releaseDist, pathname.slice('/sign-pay-pro/'.length))
  }
  return null
}

createServer((req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
  const file = resolveFile(pathname)

  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    res.statusCode = 404
    res.end('not found')
    return
  }

  res.setHeader('content-type', mimeByExt[path.extname(file)] ?? 'application/octet-stream')
  createReadStream(file).pipe(res)
}).listen(port, () => {
  console.log(`[serve-release] serving ${releaseDist} at http://127.0.0.1:${port}/sign-pay-pro/verification`)
})
