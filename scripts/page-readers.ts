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
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

import { loadClosedWords } from "../src/closed-words.js";
import { parseCsv } from "../src/csv.js";
import { anchorTags, grammarHeadings } from "../src/lint/grammar-anchors.js";
import { parseOverlayCsv } from "../src/lexicon-search.js";
import { CONSTRUCTIONS, REJECTIONS } from "../src/parse/constructions.js";
import { GRAMMAR_DIR, readData, REPO_ROOT } from "../src/repo-paths.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";
import { clip } from "./lib/build-output.ts";
import { parseClassTable } from "./lib/class-row.ts";
import { pageKeyFile, pageKeyOf, resolveLinkPage } from "./lib/link-rewrite.ts";
import { invertRegistries, refreshPage, renderBlock, stripBlock, type Registry, type RegistryRef } from "./lib/page-readers.ts";
import { pageIds } from "./lint-anchors.ts";

const CLARITISH = "claritish";
const INTERPRETER = "docs/meta/interpreter.md";
const CHEAT_SHEET = `${CLARITISH}/cheat-sheet.md`;
const SKIP_DIRS = new Set([".vitepress", "node_modules", "public"]);
const MAX_PRINTED = 40;

/** Registries in the fixed order their counts are written. */
const REGISTRIES: readonly Registry[] = [
  { name: "constructions", kind: "section", singular: "construction home", plural: "construction homes" },
  { name: "rejections", kind: "section", singular: "rejection", plural: "rejections" },
  { name: "closed-words", kind: "section", singular: "closed word", plural: "closed words" },
  { name: "overlays", kind: "section", singular: "overlay row", plural: "overlay rows" },
  { name: "interpreter", kind: "section", singular: "interpreter row", plural: "interpreter rows" },
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
]);

/** `anchor: "…md#…"` files not yet classified as a registry or not; the unknown-registry check skips them. */
const NOT_YET_CLASSIFIED = new Set(["src/interpret/classes.ts", "src/parse/scope.ts", "src/interpret/inspect-notes.ts"]);

/** Page-shape lines for a page, from page contracts; none are declared yet. */
function shapeLines(_pageKey: string): string[] {
  return [];
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
  return found.filter((f) => !READ_FILES.has(f) && !NOT_YET_CLASSIFIED.has(f));
}

// ---------------------------------------------------------------- pages

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
  for (const file of pages) {
    const markdown = readFileSync(file, "utf8");
    const key = pageKey(file);
    const block = renderBlock({ pageKey: key, shape: shapeLines(key), registries: REGISTRIES, counts: counts.get(key), idOrder: idOrder(markdown) });
    const { next, problem } = refreshPage(markdown, block);
    if (problem === "misplaced") problems.push(`${rel(file)}: a read-by block sits outside its place (after the frontmatter, before the H1)`);
    else if (problem && !write) problems.push(`${rel(file)}: read-by block ${problem}`);
    else if (problem && write) {
      writeFileSync(file, next);
      changed++;
    }
  }
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
