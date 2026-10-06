// Generated blocks on cheat sheets (docs/proposals/grammar-cheat-sheets.md, layer 1).
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
//   the `sakes` source shows them by root.
// - `sakes` — one row per sake root, as the `/th/` word for *serves* and *detracts from*.
// - `closed-words` — closed-root words with a fixed reading (special pronouns,
//   sentence linkers), spelled from src/closed-roots.ts.
// - `compounds` — data/lexicon-compounds.csv, as citation forms.
//
// Every row links to the section that teaches it, with that section's stage.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { CLOSED, type ClosedName } from "../src/closed-roots.js";
import { parseCompoundCsv } from "../src/lexicon-compounds.js";
import { parseOverlayCsv, type OverlayRow } from "../src/lexicon-search.js";
import { isExtraNounHook } from "../src/parse/hook-compounds.js";
import { pageSections, type Band, type PageSections } from "../src/lint/learning-order.js";
import { lineNumberAt } from "../src/retie/tokens.js";
import { readData, REPO_ROOT } from "../src/repo-paths.js";

const grammarDir = join(REPO_ROOT, "docs", "grammar");

export const BLOCK_RE = /(<!--\s*generated:\s*([\w-]+)((?:\s+[\w-]+=\S+)*)\s*-->\n)([\s\S]*?)(<!--\s*\/generated\s*-->)/g;

const STAGE: Record<Band, string> = { beginner: "B", intermediate: "I", advanced: "A" };

type Params = Record<string, string[]>;

// ---------------------------------------------------------------- sections

const pageCache = new Map<string, { title: string; sections: PageSections }>();

function page(file: string) {
  if (!pageCache.has(file)) {
    const markdown = readFileSync(join(grammarDir, file), "utf8");
    const title = /^#\s+(.+?)(?:\s*\{#[^}]+\})?\s*$/m.exec(markdown)?.[1] ?? file;
    pageCache.set(file, { title, sections: pageSections(file, markdown) });
  }
  return pageCache.get(file)!;
}

const plain = (s: string) => s.replace(/[*`]/g, "").replace(/\s*\{#[^}]+\}$/, "").trim();

/** `[Section title](page.md#id)` and the section's stage letter. */
function sectionCell(anchor: string): { link: string; stage: string } {
  const [file, id] = anchor.split("#") as [string, string | undefined];
  const p = page(file);
  const section = id ? p.sections.anchors.get(id) : undefined;
  if (id && !section) throw new Error(`anchor ${anchor} lands in no section`);
  const title = !section || section.level <= 2 ? plain(p.title) : plain(section.title);
  return { link: `[${title}](${anchor})`, stage: section?.band ? STAGE[section.band] : "" };
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
  const rows = overlays()
    .filter((o) => (!pos || pos.includes(o.pos)) && (kind ? kind.includes(o.kind) : o.kind !== "sake"))
    .map((o) => ({ form: o.pos + o.senseForm, o }))
    .sort((a, b) => a.form.localeCompare(b.form));
  return table(
    ["Agazan", "English", "Taught in", "Stage"],
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

/** Closed-root words with a fixed reading. English and anchor live here; the root comes from closed-roots.ts. */
const CLOSED_WORDS: ReadonlyArray<{ name: ClosedName; form: (root: string) => string; english: string; anchor: string }> = [
  { name: "microphone", form: (r) => `${r}n`, english: "*I* (the speaker)", anchor: "pronouns.md#special-pronouns" },
  { name: "headphones", form: (r) => `${r}n`, english: "*you* (the listener)", anchor: "pronouns.md#special-pronouns" },
  { name: "handshake", form: (r) => `${r}n`, english: "*we* (you and I)", anchor: "pronouns.md#special-pronouns" },
  { name: "neutral", form: (r) => `${r}n`, english: "*someone*", anchor: "pronouns.md#special-pronouns" },
  { name: "person", form: (r) => `${r}n`, english: "*one*, generic *you*, *people*", anchor: "pronouns.md#generic-pronoun" },
  { name: "star", form: (r) => `${r}n`, english: "*the topic*", anchor: "pronouns.md#topic-pronoun" },
  { name: "east", form: (r) => `x${r}m`, english: "*therefore*", anchor: "dependents.md#sentence-linkers" },
  { name: "east", form: (r) => `x${r}l`, english: "*it follows that*", anchor: "dependents.md#sentence-linkers" },
  { name: "zebra", form: (r) => `x${r}m`, english: "*however*", anchor: "dependents.md#sentence-linkers" },
  { name: "zebra", form: (r) => `x${r}l`, english: "*nevertheless*, *even so*", anchor: "dependents.md#sentence-linkers" },
  { name: "clock", form: (r) => `x${r}m`, english: "*meanwhile*", anchor: "dependents.md#sentence-linkers" },
  { name: "film", form: (r) => `x${r}m`, english: "*next*", anchor: "dependents.md#sentence-linkers" },
  { name: "construction", form: (r) => `x${r}m`, english: "*but*", anchor: "dependents.md#sentence-linkers" },
  { name: "construction", form: (r) => `x${r}l`, english: "*on the contrary*", anchor: "dependents.md#sentence-linkers" },
  { name: "fries", form: (r) => `x${r}m`, english: "*by the way*", anchor: "dependents.md#sentence-linkers" },
];

function closedWordRows(): string {
  return table(
    ["Agazan", "English", "Taught in", "Stage"],
    CLOSED_WORDS.map((w) => ({ ...w, spelled: w.form(CLOSED[w.name]) }))
      .sort((a, b) => a.spelled.localeCompare(b.spelled))
      .map((w) => {
        const { link, stage } = sectionCell(w.anchor);
        return [`\`${w.spelled}\``, w.english, link, stage];
      }),
  );
}

function compoundRows(): string {
  const rows = parseCompoundCsv(readData("lexicon-compounds.csv"))
    .map((c) => {
      const hook = isExtraNounHook(c.right);
      const concrete = hook ? c.stem : `${c.stem}l`;
      const abstract = c.abstract && !hook ? `\`${c.stem}m\` *${c.abstract}*` : "";
      return { concrete, cells: [`\`${concrete}\``, `*${c.concrete}*`, abstract] };
    })
    .sort((a, b) => a.concrete.localeCompare(b.concrete));
  return table(["Agazan", "English", "Abstract (**-m**)"], rows.map((r) => r.cells));
}

const SOURCES: Record<string, (params: Params) => string> = {
  overlays: overlayRows,
  sakes: sakeRows,
  "closed-words": closedWordRows,
  compounds: compoundRows,
};

// ---------------------------------------------------------------- main

function parseParams(text: string): Params {
  const out: Params = {};
  for (const m of text.matchAll(/([\w-]+)=(\S+)/g)) out[m[1]!] = m[2]!.split("|");
  return out;
}

function sheetFiles(): string[] {
  return readdirSync(grammarDir).filter((f) => f.endsWith(".md"));
}

const write = process.argv.includes("--write");
const problems: string[] = [];
let blocks = 0;

for (const file of sheetFiles()) {
  const path = join(grammarDir, file);
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
