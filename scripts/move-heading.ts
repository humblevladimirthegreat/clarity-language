/**
 * Move H3 clusters from one existing sitting into another existing sitting.
 *
 * Run: npm run move-heading -- --from intermediate/a.md --ids x,y --into intermediate/b.md (--after <id> | --before <id> | --end) [--write]
 *      npm run move-heading -- --record-only --from a.md --ids x,old:new --into b.md [--write]
 *
 * Dry run (default) prints the cut clusters, where they land, the hash rows, and every link it
 * would rewrite. `--write` applies them: the two pages, `page.md#id` links repo-wide (see
 * scripts/lib/link-rewrite.ts), and one hash-redirect.ts row per moved id (`a.html#x` → `b.html#x`),
 * repointing older rows so no chain forms. `--end` lands just before `### Practice`.
 *
 * `--record-only` writes only the hash rows, for moves already made by hand: no cut, no link
 * rewrite. Its `--ids` may rename (`old:new`); every new id must exist on `--into`, and no old id
 * may still exist on `--from`.
 *
 * Never touches Practice, the allowlist, the sidebar or level reviews; those stay hand work.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { idsIn } from "./lib/heading-clusters.ts";
import { hashRedirects } from "../docs/grammar/.vitepress/lib/hash-redirect.js";
import { applyHashMoves, writeHashRedirects, type HashMove } from "./lib/hash-rows.ts";
import { rewriteRepo } from "./lib/link-rewrite.ts";
import { moveHeadings, type Placement } from "./lib/move-heading.ts";
import { grammarFile, REPO_ROOT } from "../src/repo-paths.js";

const hashPath = join(REPO_ROOT, "docs", "grammar", ".vitepress", "lib", "hash-redirect.ts");

const USAGE =
  "Usage: npm run move-heading -- --from intermediate/a.md --ids x,y --into intermediate/b.md (--after <id> | --before <id> | --end) [--write]\n" +
  "       npm run move-heading -- --record-only --from a.md --ids x,old:new --into b.md [--write]";

type Options = {
  from: string;
  into: string;
  ids: { id: string; toId: string }[];
  placement?: Placement;
  recordOnly: boolean;
  write: boolean;
};

function parseArgs(argv: string[]): Options {
  let from = "";
  let into = "";
  let ids: { id: string; toId: string }[] = [];
  const placements: Placement[] = [];
  let recordOnly = false;
  let write = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const value = () => {
      const next = argv[++i];
      if (!next || next.startsWith("--")) throw new Error(`${arg} needs a value\n${USAGE}`);
      return next;
    };
    if (arg === "--write") write = true;
    else if (arg === "--record-only") recordOnly = true;
    else if (arg === "--end") placements.push({ end: true });
    else if (arg === "--from") from = normalizePage(value());
    else if (arg === "--into") into = normalizePage(value());
    else if (arg === "--after") placements.push({ after: value() });
    else if (arg === "--before") placements.push({ before: value() });
    else if (arg === "--ids") {
      ids = value()
        .split(",")
        .map((s) => s.trim().replace(/^#/, ""))
        .filter(Boolean)
        .map((pair) => {
          const [id, toId] = pair.split(":");
          return { id: id!, toId: toId || id! };
        });
    } else throw new Error(`Unknown argument: ${arg}\n${USAGE}`);
  }
  if (!from || !into || ids.length === 0) throw new Error(USAGE);
  if (!recordOnly && ids.some((p) => p.id !== p.toId)) throw new Error("old:new id renames need --record-only");
  if (!recordOnly && placements.length !== 1) throw new Error(`pass exactly one of --after, --before, --end\n${USAGE}`);
  if (recordOnly && placements.length) throw new Error("--record-only takes no placement");
  return { from, into, ids, placement: placements[0], recordOnly, write };
}

function normalizePage(value: string): string {
  return `${value.replace(/^.*\//, "").replace(/\.(?:md|html)$/, "")}.md`;
}

function printHashRows(moves: HashMove[]): ReturnType<typeof applyHashMoves> {
  const result = applyHashMoves(hashRedirects, moves);
  console.log("Hash rows (hash-redirect.ts):");
  for (const note of result.notes) console.log(`  ${note}`);
  return result;
}

function recordOnly(options: Options): void {
  const intoPath = grammarFile(options.into);
  if (!existsSync(intoPath)) throw new Error(`missing ${relative(REPO_ROOT, intoPath)}`);
  const intoIds = new Set(idsIn(readFileSync(intoPath, "utf8")));
  const fromPath = grammarFile(options.from);
  const fromIds = existsSync(fromPath) ? new Set(idsIn(readFileSync(fromPath, "utf8"))) : new Set<string>();
  const missing = options.ids.filter((p) => !intoIds.has(p.toId)).map((p) => p.toId);
  if (missing.length) throw new Error(`${options.into} has no #${missing.join(", #")}`);
  const live = options.ids.filter((p) => fromIds.has(p.id) && !(options.from === options.into && p.id === p.toId));
  if (live.length) {
    throw new Error(`${options.from} still has #${live.map((p) => p.id).join(", #")}; a row would hide a live section`);
  }
  const result = printHashRows(options.ids.map((p) => ({ from: options.from, id: p.id, into: options.into, toId: p.toId })));
  if (!options.write) {
    console.log("\nDry run. Pass --write to apply.");
    return;
  }
  writeFileSync(hashPath, writeHashRedirects(readFileSync(hashPath, "utf8"), result.rows));
  console.log(`Wrote ${result.notes.length} hash-row change(s).`);
}

function move(options: Options): void {
  const fromPath = grammarFile(options.from);
  const intoPath = grammarFile(options.into);
  for (const path of [fromPath, intoPath]) {
    if (!existsSync(path)) throw new Error(`missing ${relative(REPO_ROOT, path)}`);
  }
  const fromMarkdown = readFileSync(fromPath, "utf8");
  const intoMarkdown = readFileSync(intoPath, "utf8");
  const result = moveHeadings({
    fromPage: options.from,
    fromMarkdown,
    intoPage: options.into,
    intoMarkdown,
    ids: options.ids.map((p) => p.id),
    placement: options.placement!,
  });

  console.log(`Cut from ${options.from}:`);
  for (const c of result.clusters) console.log(`  line ${c.line}: ### ${c.title} {#${c.id}}`);
  console.log(`Land: ${result.landing}`);
  console.log(`Moved ids: ${result.movedIds.join(", ")}`);
  const crossing = count(result.from, `](${options.into}#`) - count(fromMarkdown, `](${options.into}#`);
  if (crossing > 0) console.log(`${options.from}: ${crossing} same-page link(s) now point to ${options.into}`);
  const hash = printHashRows(result.movedIds.map((id) => ({ from: options.from, id, into: options.into, toId: id })));

  const skip = new Set([fromPath, intoPath, hashPath]);
  const rewrites = rewriteRepo(result.linkMap, new Map(), { skip, write: options.write });
  console.log(`Links (${rewrites.length} file(s)):`);
  for (const { file, changes } of rewrites) {
    const tally = new Map<string, number>();
    for (const c of changes) tally.set(`${c.from} → ${c.to}`, (tally.get(`${c.from} → ${c.to}`) ?? 0) + 1);
    for (const [change, n] of tally) console.log(`  ${file}: ${change}${n > 1 ? ` (×${n})` : ""}`);
  }
  console.log("Not touched: Practice, the allowlist, the sidebar, level reviews, AGENTS.md Owns lines.");

  if (!options.write) {
    console.log("\nDry run. Pass --write to apply.");
    return;
  }
  writeFileSync(fromPath, result.from);
  writeFileSync(intoPath, result.into);
  writeFileSync(hashPath, writeHashRedirects(readFileSync(hashPath, "utf8"), hash.rows));
  console.log(`Wrote ${options.from}, ${options.into}, hash-redirect.ts, and ${rewrites.length} linked file(s).`);
}

function count(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.recordOnly) recordOnly(options);
  else move(options);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
