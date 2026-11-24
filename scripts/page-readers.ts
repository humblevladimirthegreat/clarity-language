/**
 * Read-by blocks on grammar pages: one generated comment per page under docs/grammar/ (not
 * .vitepress/), after the frontmatter and before the H1, saying what reads the page.
 *
 * Run: npm run page-readers [-- --write | --strip]
 *
 * Without flags it is a check that fails on a missing, stale or misplaced block; `--write` refreshes
 * every block; `--strip` removes every block. Each registry in REGISTRIES is turned around, from row →
 * section to section → rows, and written as one line per section with a count per registry
 * (Claritish lessons get a `Named by data:` line). A registry anchor that resolves to no id fails, and
 * so does a registry this script does not read: a data CSV with an `anchor` column, a docs/meta table
 * with an Anchor column, or a src file with `anchor: "…md#…"` strings. A new registry joins with one
 * entry in REGISTRIES and its rows in `registryRefs`.
 *
 * Shape lines come from the contracts in src/page-contracts.ts, each with the files that import it as
 * its readers; a contract no file imports fails, and so does a covered page that lacks the contract's
 * part. A contract on every page or every stage page is listed once, in grammar-docs.md's whole-site
 * block (between SITE_OPEN and SITE_CLOSE), with WHOLE_SITE, the tools that read every page alike; a
 * stage page that carries a marker contract's markers also gets a counted line. A source file that
 * names a grammar path in code (GRAMMAR_PATH_RE, comments skipped, tests left out) must import a
 * contract, read a registry here, or be on WHOLE_SITE.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

import { loadClosedWords } from "../src/closed-words.js";
import { parseCsv } from "../src/csv.js";
import { anchorTags, grammarHeadings } from "../src/lint/grammar-anchors.js";
import { parseOverlayCsv } from "../src/lexicon-search.js";
import { CLASSES } from "../src/interpret/classes.js";
import { FAMILY_TERMS } from "../src/interpret/inspect-notes.js";
import { CONSTRUCTIONS, REJECTIONS } from "../src/parse/constructions.js";
import { FRAME_KEYS, PAIR_ROWS } from "../src/parse/scope.js";
import { boundaryCells } from "../src/parse/boundaries.js";
import { PROFILES } from "../src/parse/scope-profiles.js";
import { GRAMMAR_DIR, readData, REPO_ROOT } from "../src/repo-paths.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";
import * as pageContracts from "../src/page-contracts.ts";
import { coversPage, type PageContract } from "../src/page-contracts.ts";
import { clip } from "./lib/build-output.ts";
import { parseClassTable } from "./lib/class-row.ts";
import { pageKeyFile, pageKeyOf, resolveLinkPage } from "./lib/link-rewrite.ts";
import { importersOf, projectSourceFiles, readProject } from "./lib/deps.ts";
import {
  invertRegistries,
  isWholeSite,
  namesGrammarPath,
  partCount,
  partLabel,
  refreshPage,
  refreshSiteBlock,
  renderBlock,
  renderSiteBody,
  shapeLine,
  SITE_OPEN,
  SITE_CLOSE,
  stripBlock,
  type ContractInfo,
  type Registry,
  type RegistryRef,
} from "./lib/page-readers.ts";
import { pageIds } from "./lint-anchors.ts";

const CLARITISH = "claritish";
const INTERPRETER = "docs/meta/interpreter.md";
const CHEAT_SHEET = `${CLARITISH}/cheat-sheet.md`;
const SKIP_DIRS = new Set([".vitepress", "node_modules", "public"]);
const GRAMMAR_DOCS = "docs/meta/grammar-docs.md";
const MAX_PRINTED = 40;

/** Registries in the fixed order their counts are written. */
const REGISTRIES: readonly Registry[] = [
  { name: "constructions", kind: "section", singular: "construction home", plural: "construction homes" },
  { name: "rejections", kind: "section", singular: "rejection", plural: "rejections" },
  { name: "closed-words", kind: "section", singular: "closed word", plural: "closed words" },
  { name: "overlays", kind: "section", singular: "overlay row", plural: "overlay rows" },
  { name: "interpreter", kind: "section", singular: "interpreter row", plural: "interpreter rows" },
  { name: "classes", kind: "section", singular: "interpreter class", plural: "interpreter classes" },
  { name: "frame-keys", kind: "section", singular: "frame key", plural: "frame keys" },
  { name: "pair-rows", kind: "section", singular: "pair-table rule", plural: "pair-table rules" },
  { name: "boundaries", kind: "section", singular: "boundary cell", plural: "boundary cells" },
  { name: "terms", kind: "section", singular: "inspect term", plural: "inspect terms" },
  { name: "cues", kind: "page", singular: "cue (claritish-triggers.csv)", plural: "cues (claritish-triggers.csv)" },
  { name: "flows", kind: "page", singular: "flow (claritish-flows.json)", plural: "flows (claritish-flows.json)" },
  { name: "cheat-sheet", kind: "page", singular: "cheat-sheet row", plural: "cheat-sheet rows" },
];

/** Files that hold a registry this script reads (repo-relative). */
const READ_FILES = new Set([
  "src/parse/constructions.ts",
  "data/closed-words.csv",
  "data/lexicon-overlays.csv",
  INTERPRETER,
  "src/interpret/classes.ts",
  "src/parse/scope.ts",
  "src/parse/scope-profiles.ts",
  "src/parse/boundaries.ts",
  "src/interpret/inspect-notes.ts",
]);

// ---------------------------------------------------------------- page contracts

/** Contracts from src/page-contracts.ts, each with the files that import it (tests included) as readers. */
function contractInfos(): ContractInfo[] {
  const target = join(REPO_ROOT, "src", "page-contracts.ts");
  const importers = importersOf(target, projectSourceFiles(REPO_ROOT), readProject(join(REPO_ROOT, "tsconfig.json")).options);
  const out: ContractInfo[] = [];
  for (const [name, value] of Object.entries(pageContracts)) {
    if (!isContract(value)) continue;
    const readers = importers.filter((imp) => imp.names.includes(name)).map((imp) => rel(imp.file));
    if (!readers.length) problems.push(`src/page-contracts.ts ${name}: no file imports this contract; a reader takes its id or pattern from it`);
    out.push({ name, contract: value, readers });
  }
  out.sort((a, b) => PART_RANK[a.contract.part] - PART_RANK[b.contract.part] || a.name.localeCompare(b.name));
  const names = new Set(out.map((i) => i.name));
  contractImporters = new Set(importers.filter((imp) => imp.names.some((n) => names.has(n))).map((imp) => rel(imp.file)));
  return out;
}

let contractImporters = new Set<string>();

/** The order shape lines are written in: title, ids, then the page's body parts. */
const PART_RANK: Readonly<Record<PageContract["part"], number>> = { h1: 0, anchor: 1, section: 1, links: 2, tables: 3, practice: 4, examples: 5, marker: 6 };

function isContract(value: unknown): value is PageContract {
  return typeof value === "object" && value !== null && "pages" in value && "part" in value && "requires" in value;
}

/**
 * Shape lines for one page, in contract order, and a problem for each covered part the page lacks.
 * Whole-site contracts give a line only for a marker the page carries, with its count.
 */
function shapeLines(infos: readonly ContractInfo[], pageKey: string, markdown: string, ids: ReadonlySet<string>): string[] {
  const lines: string[] = [];
  for (const info of infos) {
    if (!coversPage(info.contract.pages, pageKey)) continue;
    const count = partCount(info.contract, markdown, ids);
    if (isWholeSite(info.contract.pages)) {
      if (info.contract.part === "marker" && count) lines.push(shapeLine(info, count));
      continue;
    }
    if (!count) problems.push(`${pageKey}: no ${partLabel(info.contract)} (${info.name}: ${info.contract.requires})`);
    lines.push(shapeLine(info, info.contract.part === "marker" ? count : undefined));
  }
  return lines;
}

/** Source files that read or rewrite every grammar page alike, with no page contract. */
const WHOLE_SITE = [
  "scripts/cheat-sheet-blocks.ts",
  "scripts/checkpoint-pack.mjs",
  "scripts/core-vocabulary.ts",
  "scripts/english-helper-eval.ts",
  "scripts/english-helper-recall.ts",
  "scripts/free-english-diff-guard.ts",
  "scripts/free-english-review.ts",
  "scripts/lib/grammar-git.ts",
  "scripts/lib/ipa-clips.ts",
  "scripts/lib/link-rewrite.ts",
  "scripts/lib/llms-txt.ts",
  "scripts/lib/page-readers.ts",
  "scripts/lint-agent-summaries.ts",
  "scripts/lint-ageben-docs.ts",
  "scripts/lint-anchors.ts",
  "scripts/lint-cheat-sheet-print.ts",
  "scripts/lint-forward-links.ts",
  "scripts/lint-md-balance.mjs",
  "scripts/lint-prose-style.ts",
  "scripts/lint-sidebar-pages.ts",
  "scripts/llm-eval.ts",
  "scripts/move-heading.ts",
  "scripts/pad-exercise-spoiler-blanks.ts",
  "scripts/page-lines.ts",
  "scripts/page-readers.ts",
  "scripts/peel-band.ts",
  "scripts/peel-headings.ts",
  "scripts/plan-units.ts",
  "scripts/regloss-docs.ts",
  "scripts/rename-language.ts",
  "scripts/retarget-id.ts",
  "scripts/retie-docs.ts",
  "src/find-english/cli.ts",
  "src/find/entries-cache.ts",
  "src/find/pass.ts",
  "src/flashcards.ts",
  "src/game/build.ts",
  "src/grammar-check/corpus.ts",
  "src/interpret/accounting-walk.ts",
  "src/parse/llm-examples.ts",
  "src/repo-paths.ts",
];

/** Source files that name a grammar path in code yet import no contract, read no registry here and are not on WHOLE_SITE. */
function newReaders(): string[] {
  const covered = new Set([...WHOLE_SITE, ...READ_FILES, ...contractImporters, "src/page-contracts.ts"]);
  for (const file of WHOLE_SITE) if (!existsSync(join(REPO_ROOT, file))) problems.push(`scripts/page-readers.ts WHOLE_SITE: ${file} does not exist`);
  return projectSourceFiles(REPO_ROOT)
    .map(rel)
    .filter((f) => !/\.test\.[cm]?[jt]s$/.test(f) && !f.endsWith(".d.ts") && !/\.timestamp-\d+/.test(f) && !covered.has(f))
    .filter((f) => namesGrammarPath(f, readFileSync(join(REPO_ROOT, f), "utf8")))
    .sort();
}

// ---------------------------------------------------------------- registries

const problems: string[] = [];

/**
 * `page.md#id` → page key and id, checked against the page's published ids. With `siblingDir`, a
 * page found there instead (a docs/meta table naming a meta page) is checked with GitHub slugs and
 * counted on no grammar page.
 */
function anchorRef(registry: string, anchor: string, where: string, siblingDir?: string): RegistryRef | undefined {
  const page = resolveLinkPage("", anchor);
  const id = anchor.includes("#") ? anchor.slice(anchor.indexOf("#") + 1) : "";
  const file = page ? pageKeyFile(page) : undefined;
  if (!page || !file || !existsSync(file)) {
    const sibling = siblingDir && join(REPO_ROOT, siblingDir, anchor.replace(/#.*$/, ""));
    if (sibling && existsSync(sibling)) {
      if (id && !pageIds(readFileSync(sibling, "utf8"), true).has(id)) problems.push(`${where}: anchor \`${anchor}\` resolves to no id`);
      return;
    }
    problems.push(`${where}: anchor \`${anchor}\` names no grammar page`);
    return;
  }
  if (id && !pageIds(readFileSync(file, "utf8")).has(id)) {
    problems.push(`${where}: anchor \`${anchor}\` resolves to no id on ${page}`);
    return;
  }
  return { registry, page, id, where };
}

function lessonRef(registry: string, lesson: string, where: string): RegistryRef | undefined {
  const page = `${CLARITISH}/${lesson}.md`;
  if (!existsSync(pageKeyFile(page))) {
    problems.push(`${where}: lesson \`${lesson}\` has no page`);
    return;
  }
  return { registry, page, id: "", where };
}

/** Every `page.md#id` string anywhere in a value, such as a family profile. */
function profileAnchors(value: unknown): string[] {
  if (typeof value === "string") return /\.md#/.test(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(profileAnchors);
  if (value && typeof value === "object") return Object.values(value).flatMap(profileAnchors);
  return [];
}

function registryRefs(): RegistryRef[] {
  const refs: (RegistryRef | undefined)[] = [];
  for (const [id, entry] of CONSTRUCTIONS) refs.push(anchorRef("constructions", entry.anchor, `constructions.ts ${id}`));
  for (const [id, entry] of Object.entries(REJECTIONS)) refs.push(anchorRef("rejections", entry.anchor, `constructions.ts REJECTIONS.${id}`));
  for (const w of loadClosedWords()) refs.push(anchorRef("closed-words", w.anchor, `closed-words.csv ${w.form}`));
  for (const o of parseOverlayCsv(readData("lexicon-overlays.csv"))) {
    refs.push(anchorRef("overlays", o.anchor, `lexicon-overlays.csv ${o.senseForm}.${o.pos}`));
  }
  for (const row of parseClassTable(readFileSync(join(REPO_ROOT, INTERPRETER), "utf8"))) {
    if (row.anchor) refs.push(anchorRef("interpreter", row.anchor, `${INTERPRETER}:${row.line}`, "docs/meta"));
  }
  for (const [key, row] of Object.entries(CLASSES)) {
    if (row.anchor) refs.push(anchorRef("classes", row.anchor, `classes.ts ${key}`, "docs/meta"));
  }
  for (const [key, row] of Object.entries(FRAME_KEYS)) {
    if (row.anchor) refs.push(anchorRef("frame-keys", row.anchor, `scope.ts FRAME_KEYS ${key}`, "docs/meta"));
  }
  for (const row of PAIR_ROWS) {
    for (const c of row.cases) for (const a of c.anchors) if (a) refs.push(anchorRef("pair-rows", a, `scope.ts PAIR_ROWS ${row.pair.join("×")}`, "docs/meta"));
  }
  // Profile anchors no derived row cites (a member's carry escape, say) still name the pages the profiles read.
  const rowAnchors = new Set(PAIR_ROWS.flatMap((row) => row.cases.flatMap((c) => c.anchors)));
  for (const profile of PROFILES) {
    for (const a of new Set(profileAnchors(profile))) if (!rowAnchors.has(a)) refs.push(anchorRef("pair-rows", a, `scope-profiles.ts ${profile.family}`, "docs/meta"));
  }
  // The boundary table's cells name the sections that state what passes into a nested reading.
  for (const { kind, column, cell } of boundaryCells()) {
    if (cell.anchor) refs.push(anchorRef("boundaries", cell.anchor, `boundaries.ts ${kind} ${column}`, "docs/meta"));
  }
  for (const [family, term] of Object.entries(FAMILY_TERMS)) {
    if (term?.anchor) refs.push(anchorRef("terms", term.anchor, `inspect-notes.ts ${family}`, "docs/meta"));
  }
  for (const row of parseCsv(readData("claritish-triggers.csv")).rows) {
    refs.push(lessonRef("cues", row.lesson ?? "", `claritish-triggers.csv ${row.id}`));
  }
  const flows = JSON.parse(readData("claritish-flows.json")) as Record<string, { lesson: string }>;
  for (const [id, flow] of Object.entries(flows)) refs.push(lessonRef("flows", flow.lesson, `claritish-flows.json ${id}`));
  refs.push(...cheatSheetRefs());
  return refs.filter((r): r is RegistryRef => r !== undefined);
}

/** Rows of the Claritish cheat sheet that link a lesson: one ref per row and lesson. */
function cheatSheetRefs(): RegistryRef[] {
  const out: RegistryRef[] = [];
  readFileSync(pageKeyFile(CHEAT_SHEET), "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (!line.startsWith("|")) return;
      const lessons = new Set<string>();
      for (const m of line.matchAll(/\]\(([^)\s]+)\)/g)) {
        const page = resolveLinkPage(CHEAT_SHEET, m[1]!);
        if (page?.startsWith(`${CLARITISH}/`) && page !== CHEAT_SHEET && existsSync(pageKeyFile(page))) lessons.add(page);
      }
      for (const page of lessons) out.push({ registry: "cheat-sheet", page, id: "", where: `${CHEAT_SHEET}:${i + 1}` });
    });
  return out;
}

// ---------------------------------------------------------------- unknown registries

function walk(dir: string, keep: (name: string) => boolean, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name) && !name.startsWith(".")) walk(full, keep, out);
    } else if (keep(name)) out.push(full);
  }
  return out;
}

const rel = (file: string) => relative(REPO_ROOT, file).split(sep).join("/");

/** Files that look like a section registry this script does not read. */
function unknownRegistries(): string[] {
  const found: string[] = [];
  for (const file of walk(join(REPO_ROOT, "data"), (n) => n.endsWith(".csv"))) {
    const header = readFileSync(file, "utf8").split("\n", 1)[0]!;
    if (header.split(",").some((h) => h.trim().replace(/^"|"$/g, "") === "anchor")) found.push(rel(file));
  }
  for (const file of walk(join(REPO_ROOT, "docs", "meta"), (n) => n.endsWith(".md"))) {
    const tableHeader = readFileSync(file, "utf8")
      .split("\n")
      .some((l) => l.startsWith("|") && l.split("|").some((c) => c.trim().toLowerCase() === "anchor"));
    if (tableHeader) found.push(rel(file));
  }
  for (const file of walk(join(REPO_ROOT, "src"), (n) => n.endsWith(".ts") && !n.endsWith(".test.ts"))) {
    if (/\banchor:\s*["'`][^"'`\n]*\.md#/.test(readFileSync(file, "utf8"))) found.push(rel(file));
  }
  return found.filter((f) => !READ_FILES.has(f));
}

// ---------------------------------------------------------------- pages

/**
 * grammar-docs.md's whole-site block: contracts on every page or stage page, and WHOLE_SITE. Until the
 * page carries the SITE_OPEN / SITE_CLOSE markers, a note says so and nothing fails.
 */
function siteBlock(infos: readonly ContractInfo[]): void {
  const file = join(REPO_ROOT, GRAMMAR_DOCS);
  const markdown = readFileSync(file, "utf8");
  const body = renderSiteBody(infos.filter((i) => isWholeSite(i.contract.pages)), [...WHOLE_SITE].sort());
  const { next, problem } = refreshSiteBlock(markdown, body);
  if (problem === "no marker") console.log(`Note: ${GRAMMAR_DOCS} has no whole-site block (${SITE_OPEN} … ${SITE_CLOSE}); skipped.`);
  else if (problem && write) {
    writeFileSync(file, next);
    changed++;
  } else if (problem) problems.push(`${GRAMMAR_DOCS}: whole-site read-by block stale`);
}

/** The key `npm run page-refs` takes: a lesson as `claritish/x.md`, a cheat sheet by its folder, else the filename. */
function pageKey(file: string): string {
  const path = relative(GRAMMAR_DIR, file).split(sep).join("/");
  return path.startsWith("cheat-sheets/") ? path : pageKeyOf(file);
}

/** Ids in page order: headings and `<a id>` tags by offset. */
function idOrder(markdown: string): string[] {
  return [...grammarHeadings(markdown).map((h) => ({ id: h.id, at: h.offset })), ...anchorTags(markdown).map((a) => ({ id: a.id, at: a.offset }))]
    .sort((a, b) => a.at - b.at)
    .map((x) => x.id);
}

const write = process.argv.includes("--write");
const strip = process.argv.includes("--strip");
const unknownFlag = process.argv.slice(2).find((a) => a !== "--write" && a !== "--strip");
if (unknownFlag || (write && strip)) {
  console.error(`Usage: npm run page-readers [-- --write | --strip]${unknownFlag ? ` (unknown argument ${unknownFlag})` : ""}`);
  process.exit(2);
}

const pages = walk(GRAMMAR_DIR, (n) => n.endsWith(".md")).sort();
let changed = 0;

if (strip) {
  for (const file of pages) {
    const markdown = readFileSync(file, "utf8");
    const next = stripBlock(markdown);
    if (next !== markdown) {
      writeFileSync(file, next);
      changed++;
    }
  }
  console.log(`OK: read-by block removed from ${changed} page(s).`);
} else {
  for (const file of unknownRegistries()) {
    problems.push(`${file}: looks like a section registry (anchor column or \`anchor: "…md#…"\`) that page-readers does not read; add it to REGISTRIES`);
  }
  const counts = invertRegistries(REGISTRIES, registryRefs());
  const infos = contractInfos();
  for (const file of newReaders()) {
    problems.push(`${file}: names a grammar path in code; import its contract from src/page-contracts.ts, or add it to WHOLE_SITE in scripts/page-readers.ts`);
  }
  for (const file of pages) {
    const markdown = readFileSync(file, "utf8");
    const key = pageKey(file);
    const shape = shapeLines(infos, key, markdown, pageIds(markdown));
    const block = renderBlock({ pageKey: key, shape, registries: REGISTRIES, counts: counts.get(key), idOrder: idOrder(markdown) });
    const { next, problem } = refreshPage(markdown, block);
    if (problem === "misplaced") problems.push(`${rel(file)}: a read-by block sits outside its place (after the frontmatter, before the H1)`);
    else if (problem && !write) problems.push(`${rel(file)}: read-by block ${problem}`);
    else if (problem && write) {
      writeFileSync(file, next);
      changed++;
    }
  }
  siteBlock(infos);
  if (problems.length) {
    console.error(`Read-by blocks (${problems.length}):`);
    for (const line of problems.slice(0, MAX_PRINTED)) console.error(`  ${clip(line)}`);
    if (problems.length > MAX_PRINTED) {
      const log = tmpPath("logs", "page-readers.log");
      mkdirSync(dirname(log), { recursive: true });
      writeFileSync(log, problems.join("\n") + "\n");
      console.error(`  … ${problems.length - MAX_PRINTED} more; full list in ${tmpRel("logs", "page-readers.log")}`);
    }
    if (!write) console.error("Fix: run `npm run page-readers -- --write` for a missing or stale block; fix a registry or anchor problem at its source.");
    process.exitCode = 1;
  } else {
    console.log(`OK: ${pages.length} read-by block(s) ${write ? `up to date, ${changed} written` : "up to date"}.`);
  }
}
