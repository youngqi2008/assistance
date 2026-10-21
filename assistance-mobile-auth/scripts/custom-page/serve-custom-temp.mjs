import http from 'node:http'
import { readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'

const [distDir, portValue] = process.argv.slice(2)
const port = Number(portValue)
if (!distDir || !Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Usage: node scripts/custom-page/serve-custom-temp.mjs <distDir> <port>')
}
const root = await realpath(path.resolve(distDir))
const prefix = '/sign-pay-pro-temp/'
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.cjs': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' }
http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405).end(); return }
    const url = new URL(request.url, 'http://127.0.0.1')
    if (!url.pathname.startsWith(prefix)) { response.writeHead(404).end(); return }
    const fixtureRedirect = url.pathname === `${prefix}test-fixtures/customer-redirect.html`
    const verificationIndex = url.pathname === `${prefix}verification` ? `${prefix}index.html`
      : url.pathname === `${prefix}test-fixtures/legacy/verification` ? `${prefix}test-fixtures/legacy/index.html` : undefined
    const resourcePath = fixtureRedirect ? `${prefix}test-fixtures/final/index.html` : verificationIndex ?? url.pathname
    const relative = decodeURIComponent(resourcePath.slice(prefix.length))
    const candidate = path.resolve(root, relative)
    if (!candidate.startsWith(`${root}${path.sep}`)) { response.writeHead(404).end(); return }
    const actual = await realpath(candidate)
    if (!actual.startsWith(`${root}${path.sep}`) || !(await stat(actual)).isFile()) { response.writeHead(404).end(); return }
    if (fixtureRedirect) { response.writeHead(302, { Location: resourcePath, 'Cache-Control': 'no-store' }).end(); return }
    const bytes = await readFile(actual)
    response.writeHead(200, { 'Content-Type': mime[path.extname(actual)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
    response.end(request.method === 'HEAD' ? undefined : bytes)
  } catch { response.writeHead(404).end() }
}).listen(port, '127.0.0.1', () => console.log(`Custom TEMP files: http://127.0.0.1:${port}${prefix}`))
