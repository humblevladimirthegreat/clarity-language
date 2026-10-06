// Keep cheat sheets in step with the pages they summarize
// (docs/proposals/grammar-cheat-sheets.md, layers 2 and 3). Generated blocks
// (layer 1) are skipped here: scripts/cheat-sheet-blocks.ts holds them to the data.
//
// Grammar sheets:
// - Every table row links to an owning section: in the row itself, the table's
//   header row, or the prose between the nearest heading and the table.
// - Every Agazan word, phrase, or sentence in a row appears in one of those
//   linked sections (heading to the end of its subtree), verbatim or, for one
//   word, with its -l / -m / -r ending swapped. Templates and English are skipped.
// - A table on a grammar page marked `<!-- cheat-sheet: ID -->` is opted in:
//   every Agazan form in it must be on sheet ID.
//
// Claritish sheet: every drop-in in a lesson table appears on the sheet, and
// every drop-in on the sheet comes from a lesson (verbatim, or with its ending
// swapped). The feelings lesson is exempt from the first check: the sheet
// teaches the feeling-word pattern with one worked example, not the lesson's
// vocabulary.
import { readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";

import { classifyAgazanSpan } from "../src/lint/agazan-docs.js";
import { pageSections, type PageSections } from "../src/lint/learning-order.js";
import { lineNumberAt } from "../src/retie/tokens.js";
import { REPO_ROOT } from "../src/repo-paths.js";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const sheetsDir = "cheat-sheets";
const claritishDir = join(grammarDir, "claritish");

/** Grammar sheets in docs/grammar/cheat-sheets/, by the ID owning pages use in `<!-- cheat-sheet: ID -->`. */
const SHEETS: Record<string, string> = {
  "sounds-spelling": "sounds-spelling.md",
  "word-shape-clause": "word-shape-clause.md",
  "people-pointing": "people-pointing.md",
  talking: "talking.md",
  "knowing-intending": "knowing-intending.md",
  "why-allowed": "why-allowed.md",
  "restrictors-spans": "restrictors-spans.md",
  "joins-hooks": "joins-hooks.md",
  "agazan-english": "agazan-english.md",
  exceptions: "exceptions.md",
};

const CLARITISH_SHEET = "cheat-sheet.md";
const CLARITISH_NOT_LESSONS = new Set(["index.md", "learn-agazan.md", CLARITISH_SHEET]);
const CLARITISH_PATTERN_ONLY = new Set(["feelings.md"]);

const MARKER_RE = /<!--\s*cheat-sheet:\s*(\S+)\s*-->/g;

const problems: string[] = [];

function spans(text: string): string[] {
  return [...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]!);
}

/** Spans the lint holds to a source: words, phrases, and sentences, not templates or English. */
function formSpans(text: string): string[] {
  return spans(text).filter((s) => ["word", "phrase", "sentence"].includes(classifyAgazanSpan(s)));
}

const swapEnding = (span: string) =>
  /[lmr]$/.test(span) ? ["l", "m", "r"].map((e) => span.slice(0, -1) + e) : [span];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `form` occurs in `text` as whole words (whitespace-insensitive). */
function occursIn(form: string, text: string): boolean {
  const pattern = form.trim().split(/\s+/).map(escape).join("\\s+");
  return new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, "u").test(text);
}

function variants(form: string): string[] {
  return /\s/.test(form.trim()) ? [form] : swapEnding(form);
}

// ---------------------------------------------------------------- grammar

type Table = { header: string; rows: { text: string; index: number }[]; index: number; intro: string };

/** Pipe tables, each with the prose between the nearest heading above it and the table. */
function tables(markdown: string): Table[] {
  const out: Table[] = [];
  const lines = markdown.split("\n");
  let offset = 0;
  let intro: string[] = [];
  let current: Table | undefined;
  let generated = false;
  for (const line of lines) {
    // Generated blocks are owned by the data and checked by cheat-sheet-blocks.ts.
    if (/^<!--\s*generated:/.test(line)) generated = true;
    else if (/^<!--\s*\/generated\s*-->/.test(line)) generated = false;
    if (generated) {
      current = undefined;
    } else if (line.startsWith("|")) {
      if (!current) {
        current = { header: line, rows: [], index: offset, intro: intro.join("\n") };
        out.push(current);
      } else if (!/^\|[\s|:-]+\|?\s*$/.test(line)) {
        current.rows.push({ text: line, index: offset });
      }
    } else {
      if (current) intro = [];
      current = undefined;
      if (/^#{1,6}\s/.test(line)) intro = [];
      else intro.push(line);
    }
    offset += line.length + 1;
  }
  return out;
}

/** Link targets (`page.md`, `page.md#id`, `#id`) in a line of the sheet, outside code. */
function linkTargets(text: string): string[] {
  const blanked = text.replace(/`[^`\n]*`/g, "");
  return [...blanked.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1]!)
    .filter((t) => !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(t));
}

const pageCache = new Map<string, { markdown: string; sections: PageSections } | null>();

function loadPage(page: string) {
  if (!pageCache.has(page)) {
    let markdown: string;
    try {
      markdown = readFileSync(join(grammarDir, page), "utf8");
    } catch {
      pageCache.set(page, null);
      return null;
    }
    pageCache.set(page, { markdown, sections: pageSections(page, markdown) });
  }
  return pageCache.get(page)!;
}

/** Text of the section a link on `sheet` lands in (the whole page when it has no anchor). */
function linkedText(target: string, sheet: string): string | undefined {
  const [file, id] = target.split("#");
  const page = loadPage(file ? posix.join(posix.dirname(sheet), file) : sheet);
  if (!page) return undefined;
  if (!id) return page.markdown;
  const section = page.sections.anchors.get(id);
  return section ? page.markdown.slice(section.offset, section.end) : undefined;
}

function lintGrammarSheet(file: string): void {
  const sheet = posix.join(sheetsDir, file);
  const markdown = readFileSync(join(grammarDir, sheet), "utf8");
  for (const table of tables(markdown)) {
    const shared = [...linkTargets(table.header), ...linkTargets(table.intro)];
    let previous: string[] = [];
    for (const row of table.rows) {
      const where = `${sheet}:${lineNumberAt(markdown, row.index)}`;
      // A row with an empty first cell continues the row above.
      const own = /^\|\s*\|/.test(row.text) ? previous : linkTargets(row.text);
      previous = own;
      const targets = [...new Set([...own, ...shared])];
      const forms = formSpans(row.text);
      if (targets.length === 0) {
        problems.push(`${where}: row links to no owning section (in the row, the header, or the prose above the table)`);
        continue;
      }
      const texts: string[] = [];
      for (const t of targets) {
        const text = linkedText(t, sheet);
        if (text === undefined) problems.push(`${where}: link \`${t}\` lands in no section`);
        else texts.push(text);
      }
      for (const form of forms) {
        if (!variants(form).some((v) => texts.some((t) => occursIn(v, t)))) {
          problems.push(`${where}: \`${form}\` is not in the linked section(s) ${targets.join(", ")}`);
        }
      }
    }
  }
}

/** Opted-in tables on grammar pages: every form must be on the named sheet. */
function lintCoverage(): void {
  const sheetText = new Map<string, string>();
  for (const [id, file] of Object.entries(SHEETS)) sheetText.set(id, readFileSync(join(grammarDir, sheetsDir, file), "utf8"));
  for (const page of readdirSync(grammarDir).filter((f) => f.endsWith(".md"))) {
    const markdown = readFileSync(join(grammarDir, page), "utf8");
    for (const m of markdown.matchAll(MARKER_RE)) {
      const where = `${page}:${lineNumberAt(markdown, m.index!)}`;
      const id = m[1]!;
      const sheet = sheetText.get(id);
      if (sheet === undefined) {
        problems.push(`${where}: unknown cheat sheet \`${id}\` (known: ${Object.keys(SHEETS).join(", ")})`);
        continue;
      }
      const after = markdown.slice(m.index! + m[0].length);
      const table = /^\s*\n((?:\|.*(?:\n|$))+)/.exec(after);
      if (!table) {
        problems.push(`${where}: cheat-sheet marker is not right before a table`);
        continue;
      }
      for (const form of new Set(formSpans(table[1]!))) {
        if (!occursIn(form, sheet)) problems.push(`${where}: \`${form}\` is not on the ${sheetsDir}/${SHEETS[id]} cheat sheet`);
      }
    }
  }
}

// ---------------------------------------------------------------- Claritish

function tableSpans(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .flatMap(spans);
}

function lintClaritish(): number {
  const lessons = readdirSync(claritishDir).filter((f) => f.endsWith(".md") && !CLARITISH_NOT_LESSONS.has(f));
  const sheetSpans = new Set(spans(readFileSync(join(claritishDir, CLARITISH_SHEET), "utf8")));
  const lessonSpans = new Set<string>();
  for (const file of lessons) {
    const text = readFileSync(join(claritishDir, file), "utf8");
    for (const span of spans(text)) lessonSpans.add(span);
    if (CLARITISH_PATTERN_ONLY.has(file)) continue;
    for (const span of tableSpans(text)) {
      if (!sheetSpans.has(span)) problems.push(`claritish/${file}: \`${span}\` is not on the cheat sheet`);
    }
  }
  for (const span of sheetSpans) {
    if (!swapEnding(span).some((s) => lessonSpans.has(s))) {
      problems.push(`claritish/${CLARITISH_SHEET}: \`${span}\` is not taught by any lesson`);
    }
  }
  return lessons.length;
}

// ---------------------------------------------------------------- main

for (const file of Object.values(SHEETS)) lintGrammarSheet(file);
lintCoverage();
const lessonCount = lintClaritish();

if (problems.length) {
  console.error(`Cheat sheets are out of step with their pages (${problems.length}):`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${Object.keys(SHEETS).length} grammar cheat sheet(s) and the Claritish sheet (${lessonCount} lessons) match their pages.`);
}
