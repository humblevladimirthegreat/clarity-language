// Generated blocks on cheat sheets (docs/meta/grammar-docs.md, "Cheat sheets").
//
// A sheet marks a block the data owns:
//
//   <!-- generated: SOURCE [key=value …] -->
//   …table…
//   <!-- /generated -->
//
// and this script rebuilds the table from the data. Without flags it is a check
// (the build runs it) and fails when a block is stale; `--write` refreshes every
// block in place.
//
// Sources:
// - `overlays` — rows of data/lexicon-overlays.csv, filtered by `pos=` and
//   `kind=` (`|`-separated). Sake rows are left out unless `kind=` names them;
//   the `sakes` source shows them by root. `skip=` / `take=` slice the sorted
//   rows so a too-tall table can split across `<PageBreak />` (same columns).
// - `sakes` — one row per sake root, as the `/th/` word for *serves* and *detracts from*.
// - `closed-words` — closed-root words with a fixed reading (special pronouns,
//   sentence linkers), read from data/closed-words.csv (kinds `pronoun` and `linker`).
//
// Every row links to the section that teaches it, with that section's stage.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadClosedWords } from "../src/closed-words.js";
import { parseOverlayCsv, type OverlayRow } from "../src/lexicon-search.js";
import { overlaySpelling } from "../src/parse/classify.js";
import { pageSections, type Band, type PageSections } from "../src/lint/learning-order.js";
import { lineNumberAt } from "../src/retie/tokens.js";
import { pageRelPath } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { grammarFile, readData, REPO_ROOT } from "../src/repo-paths.js";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const sheetsDir = join(grammarDir, "cheat-sheets");

export const BLOCK_RE = /(<!--\s*generated:\s*([\w-]+)((?:\s+[\w-]+=\S+)*)\s*-->\n)([\s\S]*?)(<!--\s*\/generated\s*-->)/g;

const STAGE: Record<Band, string> = { beginner: "B", intermediate: "I", advanced: "A" };

type Params = Record<string, string[]>;

// ---------------------------------------------------------------- sections

const pageCache = new Map<string, { title: string; sections: PageSections }>();

function page(file: string) {
  if (!pageCache.has(file)) {
    const markdown = readFileSync(grammarFile(file), "utf8");
    const title = /^#\s+(.+?)(?:\s*\{#[^}]+\})?\s*$/m.exec(markdown)?.[1] ?? file;
    pageCache.set(file, { title, sections: pageSections(file, markdown) });
  }
  return pageCache.get(file)!;
}

const plain = (s: string) => s.replace(/[*`]/g, "").replace(/\s*\{#[^}]+\}$/, "").trim();

/** `[Section title](../band/page.md#id)` (sheets sit one folder down) and the section's stage letter. */
function sectionCell(anchor: string): { link: string; stage: string } {
  const [file, id] = anchor.split("#") as [string, string | undefined];
  const p = page(file);
  const section = id ? p.sections.anchors.get(id) : undefined;
  if (id && !section) throw new Error(`anchor ${anchor} lands in no section`);
  const title = !section || section.level <= 2 ? plain(p.title) : plain(section.title);
  const href = `/${file.replace(/\.md$/, "")}${id ? `#${id}` : ""}`;
  return { link: `[${title}](${href})`, stage: section?.band ? STAGE[section.band] : "" };
}

// ---------------------------------------------------------------- sources

const cell = (s: string) => s.replace(/\|/g, "\\|");

function table(header: string[], rows: string[][]): string {
  const line = (r: string[]) => `| ${r.join(" | ")} |`;
  const rule = `|${header.map((h) => "-".repeat(h.length + 2)).join("|")}|`;
  return [line(header), rule, ...rows.map(line)].join("\n") + "\n";
}

const overlays = () => parseOverlayCsv(readData("lexicon-overlays.csv"));

function overlayRows(params: Params): string {
  const pos = params.pos;
  const kind = params.kind;
  const skip = Number((params.skip ?? ["0"])[0]);
  const takeRaw = params.take?.[0];
  const take = takeRaw == null ? undefined : Number(takeRaw);
  if (!Number.isInteger(skip) || skip < 0) throw new Error(`skip= needs a non-negative integer`);
  if (take != null && (!Number.isInteger(take) || take < 0)) throw new Error(`take= needs a non-negative integer`);
  const rows = overlays()
    .filter((o) => (!pos || pos.includes(o.pos)) && (kind ? kind.includes(o.kind) : o.kind !== "sake"))
    .map((o) => ({ form: overlaySpelling(o), o }))
    .sort((a, b) => a.form.localeCompare(b.form))
    .slice(skip, take == null ? undefined : skip + take);
  return table(
    ["Ageben", "English", "Taught in", "Stage"],
    rows.map(({ form, o }) => {
      const { link, stage } = sectionCell(o.anchor);
      return [`\`${form}\``, cell(o.definition || o.gloss), link, stage];
    }),
  );
}

function sakeRows(): string {
  const byRoot = new Map<string, OverlayRow>();
  for (const o of overlays()) {
    if (o.kind === "sake" && o.pos === "th") byRoot.set(o.senseForm.replace(/[lmnr]$/, ""), o);
  }
  return table(
    ["Serves", "Detracts from", "Sake", "Taught in", "Stage"],
    [...byRoot]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([root, o]) => {
        const { link, stage } = sectionCell(o.anchor);
        return [`\`th${root}tham\``, `\`th${root}thum\``, cell(o.definition.replace(/ sake\b/, "")), link, stage];
      }),
  );
}

/** Kinds of data/closed-words.csv rows the cheat sheets show. */
const SHOWN_CLOSED_KINDS: ReadonlySet<string> = new Set(["pronoun", "linker"]);

function closedWordRows(): string {
  return table(
    ["Ageben", "English", "Taught in", "Stage"],
    loadClosedWords()
      .filter((w) => SHOWN_CLOSED_KINDS.has(w.kind))
      .sort((a, b) => a.form.localeCompare(b.form))
      .map((w) => {
        const { link, stage } = sectionCell(w.anchor);
        return [`\`${w.form}\``, w.english, link, stage];
      }),
  );
}

const SOURCES: Record<string, (params: Params) => string> = {
  overlays: overlayRows,
  sakes: sakeRows,
  "closed-words": closedWordRows,
};

// ---------------------------------------------------------------- main

function parseParams(text: string): Params {
  const out: Params = {};
  for (const m of text.matchAll(/([\w-]+)=(\S+)/g)) out[m[1]!] = m[2]!.split("|");
  return out;
}

function sheetFiles(): string[] {
  return readdirSync(sheetsDir).filter((f) => f.endsWith(".md"));
}

const write = process.argv.includes("--write");
const problems: string[] = [];
let blocks = 0;

for (const file of sheetFiles()) {
  const path = join(sheetsDir, file);
  const markdown = readFileSync(path, "utf8");
  if (!markdown.includes("<!-- generated:")) continue;
  let stale = false;
  const next = markdown.replace(BLOCK_RE, (whole, open: string, source: string, paramText: string, body: string, close: string, index: number) => {
    blocks++;
    const where = `${file}:${lineNumberAt(markdown, index)}`;
    const make = SOURCES[source];
    if (!make) {
      problems.push(`${where}: unknown generated source \`${source}\` (known: ${Object.keys(SOURCES).join(", ")})`);
      return whole;
    }
    let fresh: string;
    try {
      fresh = make(parseParams(paramText));
    } catch (e) {
      problems.push(`${where}: ${(e as Error).message}`);
      return whole;
    }
    if (fresh === body) return whole;
    stale = true;
    if (!write) problems.push(`${where}: generated \`${source}\` block is stale`);
    return open + fresh + close;
  });
  if (stale && write) {
    writeFileSync(path, next);
    console.log(`refreshed ${file}`);
  }
}

if (problems.length) {
  console.error(`Cheat sheet generated blocks (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  if (!write) console.error("Run `npm run cheat-sheet-blocks -- --write` to refresh.");
  process.exitCode = 1;
} else {
  console.log(`OK: ${blocks} generated cheat sheet block(s) ${write ? "written" : "up to date"}.`);
}
