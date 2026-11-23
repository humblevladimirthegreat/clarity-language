/**
 * List every reference to a grammar page, or to one id on it.
 *
 * Run: npm run page-refs -- PAGE [--id ID]
 *
 * PAGE is the page's path under docs/grammar/: a stage page by its filename (`feelings.md`; any band
 * folder is dropped), a Claritish lesson as `claritish/feelings.md`. The scan is link-rewrite.ts's,
 * with links resolved by folder: a bare `feelings.md` link inside `claritish/` is the lesson,
 * elsewhere the stage page. Prints `file:line`, link text and the text around it, grouped by id
 * (the page itself first), with a total. A long list goes to tmp/logs/page-refs.log, with a summary.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";

import { REPO_ROOT } from "../src/repo-paths.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";
import { clip } from "./lib/build-output.ts";
import { pageKeyArg, pageKeyFile, rewriteTargets } from "./lib/link-rewrite.ts";
import { findPageReferences } from "./lib/retarget-id.ts";

const USAGE = "Usage: npm run page-refs -- PAGE [--id ID]   (PAGE: feelings.md, claritish/feelings.md)";
const MAX_PRINTED = 60;
const NO_ID = "(page)";

function parseArgs(argv: string[]): { page: string; id: string | undefined } {
  let page = "";
  let id: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--id") {
      const next = argv[++i];
      if (!next || next.startsWith("--")) throw new Error(`--id needs a value\n${USAGE}`);
      id = next.replace(/^#/, "");
    } else if (arg.startsWith("--") || page) throw new Error(`Unknown argument: ${arg}\n${USAGE}`);
    else page = pageKeyArg(arg);
  }
  if (!page) throw new Error(USAGE);
  return { page, id };
}

function main(): void {
  const { page, id } = parseArgs(process.argv.slice(2));
  const pagePath = pageKeyFile(page);
  if (!existsSync(pagePath)) throw new Error(`missing ${relative(REPO_ROOT, pagePath)}`);
  const files = rewriteTargets();
  if (!files.includes(pagePath)) files.push(pagePath);

  const groups = new Map<string, string[]>();
  for (const file of files.sort()) {
    const rel = relative(REPO_ROOT, file);
    for (const ref of findPageReferences(readFileSync(file, "utf8"), file, page)) {
      if (id !== undefined && ref.id !== id) continue;
      const key = ref.id ?? NO_ID;
      const text = ref.linkText === undefined ? "(bare)" : `[${ref.linkText}]`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(`${rel}:${ref.line}  ${text}  ${ref.context}`);
    }
  }
  const order = [...groups.keys()].sort((a, b) => (a === NO_ID ? -1 : b === NO_ID ? 1 : a.localeCompare(b)));
  const lines: string[] = [];
  let total = 0;
  for (const key of order) {
    const refs = groups.get(key)!;
    total += refs.length;
    lines.push(`${key === NO_ID ? NO_ID : `#${key}`} (${refs.length})`, ...refs.map((ref) => `  ${ref}`), "");
  }
  const what = id === undefined ? page : `${page}#${id}`;
  const summary = `${total} reference(s) to ${what}${id === undefined ? ` under ${order.length} id(s)` : ""}.`;
  if (total <= MAX_PRINTED) {
    for (const line of lines) console.log(clip(line));
    console.log(summary);
    return;
  }
  const log = tmpPath("logs", "page-refs.log");
  mkdirSync(dirname(log), { recursive: true });
  writeFileSync(log, `${lines.join("\n")}${summary}\n`);
  for (const key of order) console.log(clip(`${key === NO_ID ? NO_ID : `#${key}`}  ${groups.get(key)!.length}`));
  console.log(`${summary} Full list: ${tmpRel("logs", "page-refs.log")}`);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
