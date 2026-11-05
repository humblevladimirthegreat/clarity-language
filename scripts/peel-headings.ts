/**
 * Peel named H3 clusters off a one-sitting grammar page onto a new file.
 *
 * Run: npm run peel-headings -- --parent speech-acts.md --ids speech-act --to firm-soft.md --title "Firm and soft" --band beginner
 *      npm run peel-headings -- --parent speech-acts.md --ids speech-act --to firm-soft.md --title "Firm and soft" --band beginner --write
 *
 * Dry run prints the new sitting, moved ids, sidebar row, hash rows, and construction homes.
 * `--write` applies them. Split Practice by hand. Then:
 * `npm run cheat-sheet-blocks -- --write` and `npm run build`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { BANDS, type Band } from "../src/lint/learning-order.js";
import { grammarFile, REPO_ROOT } from "../src/repo-paths.js";
import { hashRedirects } from "../docs/grammar/.vitepress/lib/hash-redirect.js";
import { applyHashMoves, writeHashRedirects } from "./lib/hash-rows.ts";
import { rewriteRepo } from "./lib/link-rewrite.ts";
import { addAllowlistRow, appendObjectToExportedArray } from "./lib/peel-band.ts";
import { peelHeadings } from "./lib/peel-headings.ts";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const readingOrderPath = join(grammarDir, ".vitepress", "lib", "reading-order.ts");
const allowlistPath = join(REPO_ROOT, "docs", "meta", "drill-generation.md");
const hashPath = join(grammarDir, ".vitepress", "lib", "hash-redirect.ts");

const LESSON_EXPORT: Record<Band, string> = {
  beginner: "beginnerLessons",
  intermediate: "intermediateLessons",
  advanced: "advancedLessons",
};


type Options = {
  parent: string;
  ids: string[];
  band: Band;
  to: string;
  title: string;
  h1Id?: string;
  write: boolean;
};

function parseArgs(argv: string[]): Options {
  let parent = "";
  let ids: string[] = [];
  let band: Band | undefined;
  let to = "";
  let title = "";
  let h1Id: string | undefined;
  let write = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--parent" && argv[i + 1]) parent = normalizePage(argv[++i]!);
    else if (arg === "--ids" && argv[i + 1]) {
      ids = argv[++i]!.split(",").map((id) => id.trim()).filter(Boolean);
    } else if (arg === "--band" && argv[i + 1]) {
      const value = argv[++i]!.toLowerCase();
      if (!BANDS.includes(value as Band)) throw new Error(`--band must be ${BANDS.join(" / ")}`);
      band = value as Band;
    } else if (arg === "--to" && argv[i + 1]) to = normalizePage(argv[++i]!);
    else if (arg === "--title" && argv[i + 1]) title = argv[++i]!;
    else if (arg === "--h1-id" && argv[i + 1]) h1Id = argv[++i]!;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!parent || ids.length === 0 || !band || !to || !title) {
    throw new Error(
      'Usage: npm run peel-headings -- --parent speech-acts.md --ids speech-act --to firm-soft.md --title "Firm and soft" --band beginner [--h1-id id] [--write]',
    );
  }
  return { parent, ids, band, to, title, h1Id, write };
}

function normalizePage(value: string): string {
  return `${value.replace(/^.*\//, "").replace(/\.(?:md|html)$/, "")}.md`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const parentPath = grammarFile(options.parent);
  const sittingPath = join(grammarDir, options.band, options.to);
  if (!existsSync(parentPath)) throw new Error(`missing ${relative(REPO_ROOT, parentPath)}`);
  if (existsSync(sittingPath)) throw new Error(`${options.to} already exists`);

  const result = peelHeadings({
    parentPage: options.parent,
    parentMarkdown: readFileSync(parentPath, "utf8"),
    ids: options.ids,
    newPage: options.to,
    title: options.title,
    band: options.band,
    h1Id: options.h1Id,
  });

  console.log(`Sitting ${options.to} (${options.band}):`);
  console.log(`  H1 ${options.title}`);
  console.log(`  moved ids: ${result.movedIds.join(", ") || "(none)"}`);
  console.log(`Sidebar: append ${result.holding.page} to ${options.band} (${result.holding.title})`);
  const hashRows = applyHashMoves(
    hashRedirects,
    result.movedIds.map((id) => ({ from: options.parent, id, into: options.to, toId: id })),
  );
  console.log("Hash rows (hash-redirect.ts):");
  for (const note of hashRows.notes) console.log(`  ${note}`);
  console.log("Construction homes:");
  for (const [from, to] of result.homeMap) console.log(`  ${from} → ${to}`);
  console.log("Split Practice by hand. Update the AGENTS.md Owns line if a job left the parent.");
  console.log(`Allowlist: add ${options.to} as **generate** (docs/meta/drill-generation.md); the build fails until it has a checkpoint or a **skip** reason.`);
  console.log("Then: npm run cheat-sheet-blocks -- --write && npm run build");

  if (!options.write) {
    console.log("\nDry run. Pass --write to apply.");
    return;
  }

  mkdirSync(dirname(sittingPath), { recursive: true });
  writeFileSync(sittingPath, result.sitting);
  writeFileSync(parentPath, result.parent);
  writeFileSync(
    readingOrderPath,
    appendObjectToExportedArray(readFileSync(readingOrderPath, "utf8"), LESSON_EXPORT[options.band], {
      text: options.title,
      link: `/${options.to.replace(/\.md$/, "")}`,
    }),
  );

  writeFileSync(
    allowlistPath,
    addAllowlistRow(readFileSync(allowlistPath, "utf8"), { page: options.to, parent: options.parent, band: options.band }),
  );

  writeFileSync(hashPath, writeHashRedirects(readFileSync(hashPath, "utf8"), hashRows.rows));

  const skip = new Set([parentPath, sittingPath, readingOrderPath, hashPath]);
  for (const { file, changes } of rewriteRepo(result.linkMap, result.homeMap, { skip, write: true })) {
    console.log(`Rewrote ${file} (${changes.length || "links"})`);
  }
  console.log(`Wrote ${relative(REPO_ROOT, sittingPath)} and updated ${options.parent}.`);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
