/**
 * Retarget links to an H3 id that was split in place into new H3s on the same page.
 *
 * Run: npm run retarget-id -- --page beginner/a.md --id old --to new [--except file:line=id,…] [--list] [--write]
 *
 * `--page` is the page's path under docs/grammar/: a stage page by its filename (any band folder is
 * dropped), a Claritish lesson as `claritish/a.md`. Links resolve by folder (link-rewrite.ts).
 *
 * Preconditions: `--id` no longer exists on `--page`; `--to` and every `--except` target do.
 * `--list` prints each reference to `a.md#old` repo-wide (also `.html`, `/a#old` and same-page
 * `](#old)` links), one per line: `file:line`, link text, and the text around it. The scan is
 * link-rewrite.ts's (proposals get link rewrites only).
 * Dry run (default) prints every rewrite and the hash row. `--write` rewrites each reference to
 * `--to`, or to its `--except` target by `file:line` (path from the repo root), and adds one
 * hash-redirect.ts row `a.html#old` → `a.html#to`, repointing older rows so no chain forms.
 *
 * A line holding two references that mean different H3s is fixed by hand after `--write`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { hashRedirects } from "../docs/grammar/.vitepress/lib/hash-redirect.js";
import { applyHashMoves, writeHashRedirects } from "./lib/hash-rows.ts";
import { idsIn } from "./lib/heading-clusters.ts";
import { pageKeyArg, pageKeyFile, rewriteTargets } from "./lib/link-rewrite.ts";
import { findReferences, parseExceptions, retargetText } from "./lib/retarget-id.ts";
import { REPO_ROOT } from "../src/repo-paths.js";

const hashPath = join(REPO_ROOT, "docs", "grammar", ".vitepress", "lib", "hash-redirect.ts");

const USAGE =
  "Usage: npm run retarget-id -- --page beginner/a.md --id old --to new [--except file:line=id,…] [--list] [--write]";

type Options = { page: string; id: string; to: string; except: Map<string, string>; list: boolean; write: boolean };

function parseArgs(argv: string[]): Options {
  const options: Options = { page: "", id: "", to: "", except: new Map(), list: false, write: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const value = () => {
      const next = argv[++i];
      if (!next || next.startsWith("--")) throw new Error(`${arg} needs a value\n${USAGE}`);
      return next;
    };
    if (arg === "--write") options.write = true;
    else if (arg === "--list") options.list = true;
    else if (arg === "--page") options.page = pageKeyArg(value());
    else if (arg === "--id") options.id = value().replace(/^#/, "");
    else if (arg === "--to") options.to = value().replace(/^#/, "");
    else if (arg === "--except") options.except = parseExceptions(value());
    else throw new Error(`Unknown argument: ${arg}\n${USAGE}`);
  }
  if (!options.page || !options.id || !options.to) throw new Error(USAGE);
  if (options.list && options.write) throw new Error("--list and --write do not combine");
  if (options.id === options.to) throw new Error("--id and --to must differ");
  return options;
}

function checkPreconditions(options: Options, pagePath: string): void {
  if (!existsSync(pagePath)) throw new Error(`missing ${relative(REPO_ROOT, pagePath)}`);
  const ids = new Set(idsIn(readFileSync(pagePath, "utf8")));
  if (ids.has(options.id)) {
    throw new Error(`${options.page} still has #${options.id}; split the H3 and remove the old id first`);
  }
  const targets = new Set([options.to, ...options.except.values()]);
  const missing = [...targets].filter((id) => !ids.has(id));
  if (missing.length) throw new Error(`${options.page} has no #${missing.join(", #")}`);
}

function main(options: Options): void {
  const pagePath = pageKeyFile(options.page);
  checkPreconditions(options, pagePath);
  const files = rewriteTargets().filter((file) => file !== hashPath);
  if (!files.includes(pagePath)) files.push(pagePath);

  if (options.list) {
    let total = 0;
    for (const file of files) {
      const rel = relative(REPO_ROOT, file);
      for (const ref of findReferences(readFileSync(file, "utf8"), file, options.page, options.id)) {
        total += ref.count;
        const texts = ref.linkTexts.length ? ref.linkTexts.map((t) => `[${t}]`).join(" ") : "(bare)";
        const many = ref.count > 1 ? ` (×${ref.count})` : "";
        console.log(`${rel}:${ref.line}${many}  ${texts}  ${ref.context}`);
      }
    }
    console.log(`\n${total} reference(s) to ${options.page}#${options.id}.`);
    return;
  }

  const used = new Set<string>();
  const writes: { file: string; text: string }[] = [];
  let total = 0;
  console.log(`Rewrites (default #${options.to}):`);
  for (const file of files) {
    const rel = relative(REPO_ROOT, file);
    const original = readFileSync(file, "utf8");
    const { text, edits } = retargetText(original, file, options.page, options.id, (line) => {
      const key = `${rel}:${line}`;
      return options.except.get(key) ?? options.to;
    });
    for (const edit of edits) {
      const key = `${rel}:${edit.line}`;
      if (options.except.has(key)) used.add(key);
      total += edit.count;
      console.log(`  ${key}: #${options.id} → #${edit.to}${edit.count > 1 ? ` (×${edit.count})` : ""}`);
      if (edit.count > 1) console.log(`    ${key} holds ${edit.count} references; fix by hand if they mean different H3s`);
    }
    if (text !== original) writes.push({ file, text });
  }
  const unused = [...options.except.keys()].filter((key) => !used.has(key));
  if (unused.length) throw new Error(`--except names lines with no reference: ${unused.join(", ")}`);

  const hash = applyHashMoves(hashRedirects, [
    { from: options.page, id: options.id, into: options.page, toId: options.to },
  ]);
  console.log("Hash rows (hash-redirect.ts):");
  for (const note of hash.notes) console.log(`  ${note}`);

  if (!options.write) {
    console.log(`\n${total} reference(s) in ${writes.length} file(s). Dry run. Pass --write to apply.`);
    return;
  }
  for (const { file, text } of writes) writeFileSync(file, text);
  writeFileSync(hashPath, writeHashRedirects(readFileSync(hashPath, "utf8"), hash.rows));
  console.log(`Wrote ${total} reference(s) in ${writes.length} file(s), and hash-redirect.ts.`);
}

try {
  main(parseArgs(process.argv.slice(2)));
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
