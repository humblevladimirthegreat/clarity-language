import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { build } from "vite";

const here = dirname(fileURLToPath(import.meta.url));

/** Every file under a folder, as paths relative to it. */
const files = (dir: string, at = ""): string[] =>
  readdirSync(join(dir, at), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(dir, join(at, e.name)) : [join(at, e.name)]));

describe("solve-browser", () => {
  it("a Vite build of a one-line entry importing it succeeds, with the worker and the wasm as assets", async () => {
    const dir = mkdtempSync(join(tmpdir(), "solve-browser-"));
    try {
      writeFileSync(join(dir, "entry.ts"), `import { follows } from ${JSON.stringify(join(here, "solve-browser.ts"))};\nconsole.log(follows);\n`);
      await build({
        configFile: false,
        root: dir,
        logLevel: "silent",
        // The worker build of clingo-wasm awaits at top level: the target must allow it (es2022), not Vite's default.
        worker: { format: "es" },
        build: { target: "es2022", outDir: join(dir, "out"), emptyOutDir: true, rollupOptions: { input: join(dir, "entry.ts") } },
      });
      const out = files(join(dir, "out"));
      assert.ok(out.some((f) => f.endsWith(".wasm")), out.join(", "));
      assert.ok(out.some((f) => /run\.worker[^/]*\.js$/.test(f)), out.join(", "));
      const entry = readFileSync(join(dir, "out", out.find((f) => /entry[^/]*\.js$/.test(f))!), "utf8");
      assert.doesNotMatch(entry, /clingo\.wasm/, "the solver stays out of the entry chunk until the first call");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
