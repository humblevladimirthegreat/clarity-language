/**
 * Serve ONNX Runtime Web WASM/worker assets from node_modules (dev) and copy into
 * the build output (prod). Do not put ort-wasm*.mjs in public/ — Vite rejects
 * dynamic imports of public assets during dev.
 */

import { copyFileSync, createReadStream, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

const ORT_PREFIX = 'ort-wasm'

function ortFiles(ortDist: string): string[] {
  return readdirSync(ortDist).filter((name) => name.startsWith(ORT_PREFIX))
}

function contentType(name: string): string {
  if (name.endsWith('.wasm')) return 'application/wasm'
  if (name.endsWith('.mjs')) return 'text/javascript'
  return 'application/octet-stream'
}

export function ortWasmPlugin(repoRoot: string, base: string): Plugin {
  const ortDist = join(repoRoot, 'node_modules/onnxruntime-web/dist')
  const route = `${base.replace(/\/$/, '')}/tts/ort/`

  return {
    name: 'agalan-ort-wasm',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith(route)) return next()
        const name = decodeURIComponent(url.slice(route.length))
        if (!name.startsWith(ORT_PREFIX)) return next()
        const file = join(ortDist, name)
        if (!existsSync(file)) return next()
        res.setHeader('Content-Type', contentType(name))
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        createReadStream(file).pipe(res)
      })
    },
    closeBundle() {
      const outDir = join(repoRoot, 'dist/grammar/tts/ort')
      mkdirSync(outDir, { recursive: true })
      for (const name of ortFiles(ortDist)) {
        copyFileSync(join(ortDist, name), join(outDir, name))
      }
    },
  }
}
