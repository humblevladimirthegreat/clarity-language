# KittenTTS ONNX (Apache-2.0)

In-browser neural TTS for Agalan **Speak**. Agalan IPA from our G2P is mapped to Kitten `TextCleaner` token ids — **no** English eSpeak / G2P on Agalan orthography.

| File | Role |
|------|------|
| `kitten_tts_nano_v0_8.onnx` | Nano int8 checkpoint (~24 MB) from [KittenML/kitten-tts-nano-0.8-int8](https://huggingface.co/KittenML/kitten-tts-nano-0.8-int8) |
| `voices.npz` | Style vectors; default voice **Bella** (`expr-voice-2-f`, row 0) |

ONNX Runtime Web WASM/worker files are **not** stored here — they are served from `node_modules/onnxruntime-web/dist` in dev and copied into `dist/grammar/tts/ort/` at build time (`ort-wasm-plugin.ts`).

Large binaries are **not** committed. Run `npm run fetch:tts` (or `npm run dev` / `docs:build`, which fetch if missing).

TextCleaner symbol table is vendored in `src/tts/kitten-ids.ts` (Apache-2.0, from [kitten-tts-js](https://github.com/Algiras/kitten-tts-js)).

Prefetch starts when the **Inspect** page loads; synthesis is 24 kHz PCM via Web Audio.
