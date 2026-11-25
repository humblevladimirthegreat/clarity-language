/**
 * Retarget links to an id that left its page: an H3 split in place into new H3s on the same page,
 * or an anchor moved by hand to another page (no heading cluster to cut, so not move-heading).
 *
 * Run: npm run retarget-id -- --page beginner/a.md --id old --to new|b.md#new [--except file:line=id|b.md#id,…] [--list] [--write]
 *
 * `--page` is the page's path under docs/grammar/: a stage page by its filename (any band folder is
 * dropped), a Claritish lesson as `claritish/a.md`. Links resolve by folder (link-rewrite.ts).
 * `--to` and each `--except` target are an id on `--page`, or `b.md#id` on another page (same
 * page keys as `--page`).
 *
 * Preconditions: `--id` no longer exists on `--page`; `--to` and every `--except` target exist on
 * their pages.
 * `--list` prints each reference to `a.md#old` repo-wide (also `.html`, `/a#old` and same-page
 * `](#old)` links), one per line: `file:line`, link text, and the text around it. The scan is
 * link-rewrite.ts's (proposals get link rewrites only).
 * Dry run (default) prints every rewrite and the hash row. `--write` rewrites each reference to
 * `--to`, or to its `--except` target by `file:line` (path from the repo root), and adds one
 * hash-redirect.ts row `a.html#old` → `b.html#to`, repointing older rows so no chain forms.
 * A same-page `](#old)` on `a.md` becomes a link to `b.md`; a link on `b.md` becomes `](#to)`.
 * A rewrite on a stage page that now points to a later stage page is flagged as a possible
 * forward link; the build's `lint:forward-links` decides.
 *
 * A line holding two references that mean different H3s is fixed by hand after `--write`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { hashRedirects } from "../docs/grammar/.vitepress/lib/hash-redirect.js";
import { lessonPages } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { applyHashMoves, writeHashRedirects } from "./lib/hash-rows.ts";
import { idsIn } from "./lib/heading-clusters.ts";
import { pageKeyArg, pageKeyFile, pageKeyOf, rewriteTargets } from "./lib/link-rewrite.ts";
import {
  findReferences,
  parseExceptions,
  parseTarget,
  retargetText,
  targetLabel,
  type Target,
} from "./lib/retarget-id.ts";
import { REPO_ROOT } from "../src/repo-paths.js";

const hashPath = join(REPO_ROOT, "docs", "grammar", ".vitepress", "lib", "hash-redirect.ts");

const USAGE =
  "Usage: npm run retarget-id -- --page beginner/a.md --id old --to new|b.md#new [--except file:line=id|b.md#id,…] [--list] [--write]";

type Options = { page: string; id: string; to: Target; except: Map<string, Target>; list: boolean; write: boolean };

function parseArgs(argv: string[]): Options {
  let page = "";
  let id = "";
  let to = "";
  let except = "";
  let list = false;
  let write = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const value = () => {
      const next = argv[++i];
      if (!next || next.startsWith("--")) throw new Error(`${arg} needs a value\n${USAGE}`);
      return next;
    };
    if (arg === "--write") write = true;
    else if (arg === "--list") list = true;
    else if (arg === "--page") page = pageKeyArg(value());
    else if (arg === "--id") id = value().replace(/^#/, "");
    else if (arg === "--to") to = value();
    else if (arg === "--except") except = value();
    else throw new Error(`Unknown argument: ${arg}\n${USAGE}`);
  }
  if (!page || !id || !to) throw new Error(USAGE);
  if (list && write) throw new Error("--list and --write do not combine");
  const options: Options = { page, id, to: parseTarget(to, page), except: parseExceptions(except, page), list, write };
  if (options.to.page === page && options.to.id === id) throw new Error("--id and --to must differ");
  return options;
}

function checkPreconditions(options: Options, pagePath: string): void {
  if (!existsSync(pagePath)) throw new Error(`missing ${relative(REPO_ROOT, pagePath)}`);
  if (idsIn(readFileSync(pagePath, "utf8")).includes(options.id)) {
    throw new Error(`${options.page} still has #${options.id}; split the H3 or move the anchor, and remove the old id first`);
  }
  const wanted = new Map<string, Set<string>>();
  for (const target of [options.to, ...options.except.values()]) {
    wanted.set(target.page, (wanted.get(target.page) ?? new Set()).add(target.id));
  }
  for (const [page, ids] of wanted) {
    const file = pageKeyFile(page);
    if (!existsSync(file)) throw new Error(`missing ${relative(REPO_ROOT, file)}`);
    const have = new Set(idsIn(readFileSync(file, "utf8")));
    const missing = [...ids].filter((id) => !have.has(id));
    if (missing.length) throw new Error(`${page} has no #${missing.join(", #")}`);
  }
}

const grammarDir = join(REPO_ROOT, "docs", "grammar");

/** A stage page's place in `order` (the reading order), or -1 for any other file. */
function stageIndex(order: readonly string[], file: string): number {
  return file.startsWith(grammarDir) && file.endsWith(".md") ? order.indexOf(pageKeyOf(file)) : -1;
}

function main(options: Options): void {
  const pagePath = pageKeyFile(options.page);
  checkPreconditions(options, pagePath);
  const files = rewriteTargets().filter((file) => file !== hashPath);
  for (const target of [pagePath, pageKeyFile(options.to.page)]) if (!files.includes(target)) files.push(target);

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

  const order = lessonPages().map((item) => item.page);
  const used = new Set<string>();
  const writes: { file: string; text: string }[] = [];
  const forward: string[] = [];
  let total = 0;
  console.log(`Rewrites (default ${targetLabel(options.to, options.page)}):`);
  for (const file of files) {
    const rel = relative(REPO_ROOT, file);
    const original = readFileSync(file, "utf8");
    const { text, edits } = retargetText(original, file, options.page, options.id, (line) => {
      return options.except.get(`${rel}:${line}`) ?? options.to;
    });
    const at = stageIndex(order, file);
    for (const edit of edits) {
      const key = `${rel}:${edit.line}`;
      if (options.except.has(key)) used.add(key);
      total += edit.count;
      const label = targetLabel(edit.to, options.page);
      console.log(`  ${key}: #${options.id} → ${label}${edit.count > 1 ? ` (×${edit.count})` : ""}`);
      if (edit.count > 1) console.log(`    ${key} holds ${edit.count} references; fix by hand if they mean different H3s`);
      if (at >= 0 && order.indexOf(edit.to.page) > at) forward.push(`${key} → ${label}`);
    }
    if (text !== original) writes.push({ file, text });
  }
  const unused = [...options.except.keys()].filter((key) => !used.has(key));
  if (unused.length) throw new Error(`--except names lines with no reference: ${unused.join(", ")}`);
  if (forward.length) {
    console.log("Possible forward links (a later stage page; lint:forward-links decides):");
    for (const line of forward) console.log(`  ${line}`);
  }

  const hash = applyHashMoves(hashRedirects, [
    { from: options.page, id: options.id, into: options.to.page, toId: options.to.id },
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
