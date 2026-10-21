import 'reflect-metadata'
import 'dotenv/config'

import { existsSync } from 'node:fs'
import path from 'node:path'

import { NestFactory } from '@nestjs/core'
import type { Request, Response } from 'express'
import express from 'express'

import { AppModule } from './app.module.js'
import { readMobileAssistantBffConfig } from './config.js'

function normalizeRoutePrefix(value: string) {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.replace(/\/+$/, '')
}

function resolvePath(value: string) {
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value)
}

export function applyVerificationFrameHeaders(response: Response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  response.setHeader('Content-Security-Policy', "frame-ancestors 'self' https: http://localhost:* http://127.0.0.1:*")
}

const staticAssetPrefixes = ['/assets/', '/assistance-mobile-auth/']
const verificationFallbackRelativePath = '/verification'
const hiddenIndexRelativePath = '/index.html'
const legacyVerificationRelativePaths = new Set(['/assistance-mobile-auth/verification'])
const supportedAppRelativePaths = new Set([
  verificationFallbackRelativePath,
  '/auth',
  '/test-page',
  '/test-page-hk',
  '/test-callback',
])
const staticAssetExtensions = new Set([
  '.css',
  '.cjs',
  '.gif',
  '.html',
  '.ico',
  '.jpeg',
  '.jpg',
  '.js',
  '.json',
  '.map',
  '.png',
  '.svg',
  '.txt',
  '.webp',
])

function getStaticBaseRelativePath(requestPath: string, staticBase: string): string | null {
  const normalizedBase = normalizeRoutePrefix(staticBase)
  if (requestPath !== normalizedBase && !requestPath.startsWith(`${normalizedBase}/`)) {
    return null
  }

  return requestPath.slice(normalizedBase.length) || '/'
}

function isStaticAssetRequest(relativePath: string): boolean {
  if (
    relativePath === verificationFallbackRelativePath
    || relativePath === hiddenIndexRelativePath
    || legacyVerificationRelativePaths.has(relativePath)
  ) {
    return false
  }

  if (staticAssetPrefixes.some((prefix) => relativePath.startsWith(prefix))) {
    return true
  }

  return staticAssetExtensions.has(path.extname(relativePath).toLowerCase())
}

export function shouldServeStaticAppFallback(requestPath: string, staticBase: string): boolean {
  const relativePath = getStaticBaseRelativePath(requestPath, staticBase)

  if (!relativePath || isStaticAssetRequest(relativePath)) {
    return false
  }

  return supportedAppRelativePaths.has(relativePath)
}

export function shouldRedirectToVerificationFallback(requestPath: string, staticBase: string): boolean {
  const relativePath = getStaticBaseRelativePath(requestPath, staticBase)

  if (!relativePath || shouldServeStaticAppFallback(requestPath, staticBase) || isStaticAssetRequest(relativePath)) {
    return false
  }

  return true
}

export function createVerificationFallbackRedirectUrl(originalUrl: string, staticBase: string): string {
  const queryStart = originalUrl.indexOf('?')
  const query = queryStart >= 0 ? originalUrl.slice(queryStart) : ''

  return `${normalizeRoutePrefix(staticBase)}${verificationFallbackRelativePath}${query}`
}

export function getStaticContentTypeOverride(filePath: string): string | undefined {
  if (path.basename(filePath) === 'verification') {
    return 'text/html; charset=utf-8'
  }

  return path.extname(filePath).toLowerCase() === '.cjs' ? 'text/javascript; charset=utf-8' : undefined
}

function mountStaticApp(app: Awaited<ReturnType<typeof NestFactory.create>>, config: ReturnType<typeof readMobileAssistantBffConfig>) {
  const staticRoot = resolvePath(config.staticRoot)
  const indexHtml = path.join(staticRoot, 'index.html')

  if (!existsSync(indexHtml)) {
    console.warn(`Static H5 root not found at ${staticRoot}; only BFF API will be served.`)
    return
  }

  const staticBase = normalizeRoutePrefix(config.staticBase)
  const adapter = app.getHttpAdapter()
  const expressApp = adapter.getInstance()
  const withVerificationFrameHeaders = (_request: Request, response: Response, next: () => void) => {
    applyVerificationFrameHeaders(response)
    next()
  }

  expressApp.get(`${staticBase}${hiddenIndexRelativePath}`, withVerificationFrameHeaders, (request: Request, response: Response) => {
    response.redirect(302, createVerificationFallbackRedirectUrl(request.originalUrl, staticBase))
  })

  expressApp.use(
    staticBase,
    withVerificationFrameHeaders,
    express.static(staticRoot, {
      index: false,
      setHeaders(response, filePath) {
        const contentType = getStaticContentTypeOverride(filePath)
        if (contentType) {
          response.setHeader('Content-Type', contentType)
        }
      },
    }),
  )
  expressApp.get([staticBase, `${staticBase}/`, `${staticBase}/*path`], withVerificationFrameHeaders, (request: Request, response: Response, next: () => void) => {
    if (shouldServeStaticAppFallback(request.path, staticBase)) {
      response.sendFile(indexHtml)
      return
    }

    if (shouldRedirectToVerificationFallback(request.path, staticBase)) {
      response.redirect(302, createVerificationFallbackRedirectUrl(request.originalUrl, staticBase))
      return
    }

    next()
  })
}

async function bootstrap() {
  const config = readMobileAssistantBffConfig()
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix(normalizeRoutePrefix(config.apiPrefix).replace(/^\/+/, ''))
  mountStaticApp(app, config)

  await app.listen(config.port, '0.0.0.0')
  console.log(`Mobile assistant BFF listening on 0.0.0.0:${config.port}${config.apiPrefix}`)
}

if (process.env.NODE_ENV !== 'test') {
  void bootstrap()
}
