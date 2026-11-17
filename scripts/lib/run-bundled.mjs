// Runs a CLI (src/<name>/cli.ts) from a precompiled esbuild bundle, skipping tsx startup.
// The bundle is rebuilt only when a file under src/ is newer than it, after
// regenerating the Peggy word parser if word.peggy is newer than its output.
import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function mtime(path) {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return 0;
  }
}

function newestMtime(dir) {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const time = entry.isDirectory() ? newestMtime(path) : statSync(path).mtimeMs;
    if (time > newest) newest = time;
  }
  return newest;
}

/**
 * Runs dist/<name>/cli.bundle.mjs, rebuilding it first when src/ is newer.
 * `extraEntries` (file names under src/<name>/, such as "worker.ts") are bundled
 * beside it as dist/<name>/<base>.bundle.mjs, so the CLI finds them with
 * `new URL("./<base>.bundle.mjs", import.meta.url)`.
 */
export async function runBundled(name, extraEntries = []) {
  // Lives in dist/<name>/ so src/parse/index.ts's `../..` still finds data/.
  const outdir = join(root, "dist", name);
  const entries = ["cli.ts", ...extraEntries];
  const bundles = entries.map((entry) => join(outdir, entry.replace(/\.ts$/, ".bundle.mjs")));

  const grammar = join(root, "src", "parse", "word.peggy");
  if (mtime(join(root, "src", "generated", "word-parser.js")) < mtime(grammar)) {
    // stdout would mix into the JSON output; send npm's chatter to stderr.
    execSync("npm run -s generate:word", { cwd: root, stdio: ["ignore", 2, 2] });
  }

  if (Math.min(...bundles.map(mtime)) < newestMtime(join(root, "src"))) {
    const { buildSync } = await import("esbuild");
    buildSync({
      entryPoints: entries.map((entry) => join(root, "src", name, entry)),
      bundle: true,
      platform: "node",
      format: "esm",
      packages: "external",
      outdir,
      entryNames: "[name].bundle",
      outExtension: { ".js": ".mjs" },
      logLevel: "warning",
    });
  }

  await import(pathToFileURL(bundles[0]).href);
}
