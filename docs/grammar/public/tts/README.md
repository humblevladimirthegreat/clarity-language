# eSpeak-NG WASM (GPL-3.0)

Bundled from [espeakng.js](https://github.com/espeak-ng/espeak-ng/tree/master/emscripten) for in-browser Agalan learner TTS. The worker and voice pack (`espeakng.worker.js`, `espeakng.worker.data`) come from the [jsDelivr 1.49.0 build](https://cdn.jsdelivr.net/espeakng.js/1.49.0/). All three files must be served from this folder; the glue script cannot synthesize without the worker.

These binaries are GPL-3.0. The rest of this repository's TypeScript tooling is separate; do not treat this folder as changing that license.

Loaded lazily on first **Speak Agalan** click. Not part of the critical docs render path.
