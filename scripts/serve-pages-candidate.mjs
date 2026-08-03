#!/usr/bin/env node

import { createReadStream, lstatSync, realpathSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.woff2', 'font/woff2'],
])

export function resolveCandidateRequest(root, requestPath) {
  const decoded = decodeURIComponent(requestPath)
  if (decoded.includes('\0') || decoded.includes('\\')) {
    throw new Error('Unsafe request path')
  }

  const relativePath = decoded.replace(/^\/+/, '') || 'index.html'
  if (isAbsolute(relativePath) || relativePath.split('/').includes('..')) {
    throw new Error('Unsafe request path')
  }

  const candidatePath = resolve(root, relativePath)
  const relation = relative(root, candidatePath)
  if (relation.startsWith(`..${sep}`) || relation === '..' || isAbsolute(relation)) {
    throw new Error('Request escaped candidate root')
  }

  return candidatePath
}

function assertRegularFileWithinRoot(root, filePath) {
  const metadata = lstatSync(filePath)
  if (metadata.isSymbolicLink() || !metadata.isFile()) {
    throw new Error('Candidate server only serves regular files')
  }

  const realFile = realpathSync(filePath)
  const relation = relative(root, realFile)
  if (relation.startsWith(`..${sep}`) || relation === '..' || isAbsolute(relation)) {
    throw new Error('Resolved file escaped candidate root')
  }
}

export function createCandidateServer({ root }) {
  const absoluteRoot = realpathSync(resolve(root))
  if (!statSync(absoluteRoot).isDirectory()) {
    throw new Error(`Candidate root is not a directory: ${absoluteRoot}`)
  }

  return createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' })
      response.end()
      return
    }

    let pathname
    try {
      pathname = new URL(request.url ?? '/', 'http://candidate.invalid').pathname
      const requested = resolveCandidateRequest(absoluteRoot, pathname)
      let filePath = requested
      let status = 200

      try {
        assertRegularFileWithinRoot(absoluteRoot, filePath)
      } catch {
        filePath = join(absoluteRoot, '404.html')
        assertRegularFileWithinRoot(absoluteRoot, filePath)
        status = 404
      }

      const metadata = statSync(filePath)
      const contentType = MIME_TYPES.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream'
      response.writeHead(status, {
        'Cache-Control': 'no-cache',
        'Content-Length': metadata.size,
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      })

      if (request.method === 'HEAD') {
        response.end()
      } else {
        createReadStream(filePath).pipe(response)
      }
    } catch (error) {
      response.writeHead(400, {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      })
      response.end(`Bad request: ${error instanceof Error ? error.message : 'invalid path'}\n`)
    }
  })
}

function parseArguments(argv) {
  const options = { host: '127.0.0.1', port: 4187, root: '' }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--root') options.root = argv[++index] ?? ''
    else if (argument === '--host') options.host = argv[++index] ?? ''
    else if (argument === '--port') options.port = Number.parseInt(argv[++index] ?? '', 10)
    else throw new Error(`Unknown argument: ${argument}`)
  }

  if (!options.root) throw new Error('--root <candidate-directory> is required')
  if (!options.host) throw new Error('--host must not be empty')
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65_535) {
    throw new Error('--port must be an integer from 0 through 65535')
  }
  return options
}

function isDirectExecution() {
  return process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
}

if (isDirectExecution()) {
  try {
    const options = parseArguments(process.argv.slice(2))
    const server = createCandidateServer(options)
    server.listen(options.port, options.host, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : options.port
      process.stdout.write(`Serving ${realpathSync(resolve(options.root))} at http://${options.host}:${port}\n`)
    })
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
