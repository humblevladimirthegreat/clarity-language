#!/usr/bin/env node
/**
 * Download KittenTTS nano assets into docs/grammar/public/tts/.
 * ONNX Runtime Web WASM is served from node_modules via ort-wasm-plugin (not public/).
 * Run before dev/build when onnx/npz are missing (not committed — see .gitignore).
 */

import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ttsDir = join(root, 'docs/grammar/public/tts')
const onnxPath = join(ttsDir, 'kitten_tts_nano_v0_8.onnx')
const voicesPath = join(ttsDir, 'voices.npz')

const HF_BASE =
  'https://huggingface.co/KittenML/kitten-tts-nano-0.8-int8/resolve/main'

async function download(url, dest) {
  console.log(`fetch ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  mkdirSync(dirname(dest), { recursive: true })
  await import('node:fs/promises').then((fs) => fs.writeFile(dest, buf))
  console.log(`wrote ${dest} (${buf.length} bytes)`)
}

async function main() {
  const needOnnx = !existsSync(onnxPath)
  const needVoices = !existsSync(voicesPath)

  if (!needOnnx && !needVoices) {
    console.log('KittenTTS assets already present')
    return
  }

  if (needOnnx) await download(`${HF_BASE}/kitten_tts_nano_v0_8.onnx`, onnxPath)
  if (needVoices) await download(`${HF_BASE}/voices.npz`, voicesPath)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
