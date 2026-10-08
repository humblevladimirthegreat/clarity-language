/**
 * Compare this checkout's parser with the parser at a git ref, over every Agazan sentence and
 * phrase span in this checkout's docs/grammar/. Both parsers read the same spans, so a difference
 * is a parser change, never a doc change. Exits 1 when any span parses differently.
 *
 * The ref's src/, data/ and package.json are extracted to tmp/parse-ref/<sha>/ and bundled once.
 *
 * With `--drop-one` (one word deleted) and / or `--swap` (two neighboring words swapped), it compares variants of each
 * span instead: inputs beyond the docs, where a parser change can alter a tree or a rejection that no doc sentence shows.
 *
 * Each difference is classed: a tree changed, an input now parses or now fails, a named rejection changed, or only a
 * raw parser message changed (listed with `--raw`; those name token types, so they change with any token split).
 *
 * Run: npm run parse-snapshot -- [--ref main] [--limit 40] [--drop-one] [--swap] [--raw]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { buildSync } from "esbuild";

import { docSpans, spanVariants } from "../src/grammar-check/corpus.js";
import { loadDefaultTables, parseWithTables } from "../src/parse/index.js";
import { REPO_ROOT } from "../src/repo-paths.js";

type Parse = (text: string) => unknown;

const args = process.argv.slice(2);
const ref = args.includes("--ref") ? args[args.indexOf("--ref") + 1]! : "main";
const limit = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : 40;
const dropOne = args.includes("--drop-one");
const swap = args.includes("--swap");
const rawToo = args.includes("--raw");

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

const variantKinds = [...(dropOne ? ["drop" as const] : []), ...(swap ? ["swap" as const] : [])];
const spans = variantKinds.length ? spanVariants(docSpans(), variantKinds) : docSpans();
/** A raw parser message (`Expecting …`) names token types, so it changes with any token split; a named rejection does not. */
const isRaw = (result: string) => result.startsWith("error:") && !/ — \S+\.md#/.test(result);
let changed = 0;
const counts = new Map<string, number>();
for (const { file, text } of spans) {
  const before = outcome(base.parse, text);
  const after = outcome(current, text);
  if (before === after) continue;
  changed += 1;
  const what =
    before.startsWith("error:") && !after.startsWith("error:") ? "now parses"
    : !before.startsWith("error:") && after.startsWith("error:") ? "now fails"
    : !before.startsWith("error:") ? "tree changed"
    : isRaw(before) && isRaw(after) ? "raw message changed"
    : "rejection changed";
  counts.set(what, (counts.get(what) ?? 0) + 1);
  if (changed > limit || (what === "raw message changed" && !rawToo)) continue;
  const detail = what === "now fails" ? ` (${after.slice(7)})` : what === "rejection changed" ? ` (${before.slice(7, 80)} → ${after.slice(7, 80)})` : "";
  console.log(`${file}: \`${text}\` — ${what}${detail}`);
}
console.log(`${spans.length} ${variantKinds.length ? `variants (${variantKinds.join(", ")})` : "doc spans"}: ${changed} parse differently from ${ref} (${base.sha})`);
for (const [what, n] of counts) console.log(`  ${n} ${what}${what === "raw message changed" && !rawToo ? " (listed with --raw)" : ""}`);
if (changed > 0) process.exit(1);
