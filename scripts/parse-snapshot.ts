/**
 * Compare this checkout's parser with the parser at a git ref, over every Agazan sentence and
 * phrase span in this checkout's docs/grammar/. Both parsers read the same spans, so a difference
 * is a parser change, never a doc change. Exits 1 when any span parses differently.
 *
 * The ref's src/, data/ and package.json are extracted to tmp/parse-ref/<sha>/ and bundled once.
 *
 * With `--drop-one`, it compares every variant of each span with one word deleted instead: inputs beyond the docs,
 * where a parser change can alter a tree or a rejection that no doc sentence shows.
 *
 * Run: npm run parse-snapshot -- [--ref main] [--limit 40] [--drop-one]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { buildSync } from "esbuild";

import { docSpans } from "../src/grammar-check/corpus.js";
import { loadDefaultTables, parseWithTables } from "../src/parse/index.js";
import { REPO_ROOT } from "../src/repo-paths.js";

type Parse = (text: string) => unknown;

const args = process.argv.slice(2);
const ref = args.includes("--ref") ? args[args.indexOf("--ref") + 1]! : "main";
const limit = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : 40;
const dropOne = args.includes("--drop-one");

async function refParser(ref: string): Promise<{ sha: string; parse: Parse }> {
  const sha = execFileSync("git", ["rev-parse", "--short", ref], { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  const dir = join(REPO_ROOT, "tmp", "parse-ref", sha);
  const bundle = join(dir, "parse.bundle.mjs");
  if (!existsSync(bundle)) {
    mkdirSync(dir, { recursive: true });
    const tar = execFileSync("git", ["archive", sha, "src", "data", "package.json"], { cwd: REPO_ROOT, maxBuffer: 1 << 30 });
    execFileSync("tar", ["-x", "-C", dir], { input: tar });
    buildSync({
      entryPoints: [join(dir, "src", "parse", "index.ts")],
      bundle: true,
      platform: "node",
      format: "esm",
      packages: "external",
      outfile: bundle,
      logLevel: "warning",
    });
  }
  const mod = await import(pathToFileURL(bundle).href);
  const tables = mod.loadDefaultTables();
  return { sha, parse: (text) => mod.parseWithTables(text, tables) };
}

function outcome(parse: Parse, text: string): string {
  try {
    return JSON.stringify(parse(text));
  } catch (error) {
    return `error: ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`;
  }
}

const base = await refParser(ref);
const tables = loadDefaultTables();
const current: Parse = (text) => parseWithTables(text, tables);

/** Each span with one word deleted (the final period kept), once per distinct text. */
function dropOneVariants(spans: { file: string; text: string }[]): { file: string; text: string }[] {
  const seen = new Set<string>();
  const out: { file: string; text: string }[] = [];
  for (const { file, text } of spans) {
    const period = text.endsWith(".");
    const words = (period ? text.slice(0, -1) : text).split(" ");
    if (words.length < 2) continue;
    for (let i = 0; i < words.length; i++) {
      const variant = words.filter((_, j) => j !== i).join(" ") + (period ? "." : "");
      if (seen.has(variant)) continue;
      seen.add(variant);
      out.push({ file, text: variant });
    }
  }
  return out;
}

const spans = dropOne ? dropOneVariants(docSpans()) : docSpans();
let changed = 0;
for (const { file, text } of spans) {
  const before = outcome(base.parse, text);
  const after = outcome(current, text);
  if (before === after) continue;
  changed += 1;
  if (changed > limit) continue;
  const what =
    before.startsWith("error:") && !after.startsWith("error:") ? "now parses"
    : !before.startsWith("error:") && after.startsWith("error:") ? `now fails (${after.slice(7)})`
    : "tree changed";
  console.log(`${file}: \`${text}\` — ${what}`);
}
console.log(`${spans.length} ${dropOne ? "one-word-deleted variants" : "doc spans"}: ${changed} parse differently from ${ref} (${base.sha})`);
if (changed > 0) process.exit(1);
