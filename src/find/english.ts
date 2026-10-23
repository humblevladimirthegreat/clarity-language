/**
 * Search the docs by English phrase: the English-side counterpart of find.mjs.
 *
 * Indexes the English the grammar pages already pair with Ageben: each
 * example's quoted English, each word's parser gloss, table rows with an
 * Ageben column and an English column, and translation-practice prompts.
 * Hits are grouped by the section that owns them, best section first.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { extractTeachBlocks, morphGlossWords } from "../parse/morph-gloss.js";
import { extractTranslationExercises } from "../lint/morph-gloss-docs.js";
import { pageSections, sectionAt, type Band } from "../lint/learning-order.js";
import { fillSelf } from "../learner-name.js";
import { posEnglishLemmaList, type PublishedRow } from "../lexicon-search.js";

export const ENTRY_KINDS = ["gloss", "example", "table", "practice", "root"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export type EnglishEntry = {
  /** English as the doc writes it (markdown kept). */
  english: string;
  /** Ageben form the English is paired with. */
  form: string;
  kind: EntryKind;
  page: string;
  /** 1-based line. */
  line: number;
  slug: string;
  title: string;
  band?: Band;
  /** Search tokens of `english`. */
  tokens: string[];
  /** Root entries only: the cue is a search-only `english_aliases` synonym, not a sense. */
  alias?: boolean;
  /** Table rows only: the first link in a `Teach` column (`hooks.md#extra-noun`), relative to the page. */
  teach?: string;
  /**
   * Table rows only: the English words the row answers. Under `#many-jobs` they are the italic
   * words of the `###` heading (`### *by*`); elsewhere, the italic words of the first `English…`
   * cell before its parenthetical (`*in* / *into* (*runs into a train*)`).
   */
  cues?: string[];
};

/** Page label for entries that come from the published lexicon, not a grammar page. */
export const LEXICON_PAGE = "data/lexicon-published.csv";

/**
 * One entry per English cue of each published root: concrete, abstract, per-PoS
 * lemmas, and `english_aliases` synonyms (flagged `alias`). Each root is its own section.
 */
export function collectRootEntries(rows: readonly PublishedRow[]): EnglishEntry[] {
  const entries: EnglishEntry[] = [];
  rows.forEach((row, i) => {
    const title = `${row.emoji} ${row.root}`.trim();
    const cues: { english: string; alias: boolean }[] = [
      { english: row.concrete, alias: false },
      { english: row.abstract, alias: false },
      ...posEnglishLemmaList(row.posEnglish).map((english) => ({ english, alias: false })),
      ...(row.englishAliases ?? []).map((english) => ({ english, alias: true })),
    ];
    const seen = new Set<string>();
    for (const { english, alias } of cues) {
      const toks = tokens(english);
      if (toks.length === 0 || seen.has(english)) continue;
      seen.add(english);
      entries.push({ english, form: row.root, kind: "root", page: LEXICON_PAGE, line: i + 2, slug: row.root, title, tokens: toks, ...(alias ? { alias } : {}) });
    }
  });
  return entries;
}

/**
 * Cues the docs word differently. Keep it short: each group must name the
 * same thing, or the tool hides gaps by matching too much.
 */
export const SYNONYMS: readonly (readonly string[])[] = [
  ["last time", "previous", "penultimate", "2nd from the end"],
  ["late", "early"],
  ["as of", "back then"],
];

const STOP_WORDS = new Set(["a", "an", "the", "to", "of", "is", "it"]);
const FORM_HEADER = /^(ageben|form|ageben job)$/i;
const ENGLISH_HEADER = /^(english\b.*|use|reading|you mean|meaning|gloss|for english like|.* sense)$/i;
/** Columns that are neither the form nor English: mnemonics, pronunciation, notes. */
const OTHER_HEADER = /^(cue|ipa|same root as|teach|anatomy|notes|why|example|examples)$/i;
const TEACH_HEADER = /^teach$/i;
/** The English column whose italics are the cue words (`English`, `English itch`, `English *will*`). */
const CUE_HEADER = /^english\b/i;
/** The recipe section whose `###` headings name the English cue of each table under them. */
export const MANY_JOBS_ID = "many-jobs";
const ROLE_PREFIX = /^(th|[zdbvgwhxy])-/;

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  for (const suffix of ["ing", "ed", "es", "ly", "s"]) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) return word.slice(0, -suffix.length);
  }
  return word;
}

/** Markdown emphasis, code ticks, links, and tags removed. */
export function plainText(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lowercase, stop words dropped, lightly stemmed. */
export function tokens(text: string): string[] {
  return (plainText(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => !STOP_WORDS.has(w)).map(stem);
}

function isTableRow(line: string): boolean {
  return /^\s*\|/.test(line);
}

function isDividerRow(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}/.test(line);
}

function splitRow(line: string): string[] {
  const t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return t.split(/(?<!\\)\|/).map((cell) => cell.trim());
}

function tableForm(cell: string): string {
  const codes = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  return codes.length ? codes.join(" / ") : plainText(cell);
}

/**
 * The form column: an `Ageben` / `Form` header, else the first other column
 * whose rows are mostly backticked Ageben (`| English | Bar |`, `| Marker | Use | English |`).
 */
function formColumn(header: string[], body: string[][]): number {
  const named = header.findIndex((h) => FORM_HEADER.test(h));
  if (named >= 0) return named;
  return header.findIndex((_, c) => agebenColumn(header, body, c));
}

export type TableRow = { form: string; english: string; line: number; teach?: string; cues?: string[] };

/** Italic words or phrases in a cell, as written (`*in* / *into*` → `in`, `into`). */
export function italicCues(text: string): string[] {
  return [...text.matchAll(/(?<![*\w])\*([^*]+)\*(?![*\w])/g)].map((m) => plainText(m[1]!)).filter(Boolean);
}

/** An English cell's cue words: italics before its first parenthesis. */
function cellCues(cell: string): string[] {
  return italicCues(cell.split("(")[0]!);
}

function firstLink(cell: string): string | undefined {
  return cell.match(/\]\(([^)\s]+)\)/)?.[1];
}

type Heading = { level: number; text: string; id?: string };

function heading(line: string): Heading | undefined {
  const m = line.match(/^(#{1,6})\s+(.*?)\s*(?:\{#([^}]+)\})?\s*$/);
  return m ? { level: m[1]!.length, text: m[2]!, id: m[3] } : undefined;
}

/** One Markdown table with the headings it sits under. */
export type RawTable = { header: string[]; body: string[][]; line: number; h2?: Heading; h3?: Heading };

/** Every table on a page, with its nearest `##` and `###` headings. Fenced code is skipped. */
export function pageTables(lines: string[]): RawTable[] {
  const out: RawTable[] = [];
  let h2: Heading | undefined;
  let h3: Heading | undefined;
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const h = heading(line);
    if (h?.level === 2) [h2, h3] = [h, undefined];
    else if (h?.level === 3) h3 = h;
    if (i + 1 >= lines.length || !isTableRow(line) || !isDividerRow(lines[i + 1]!) || (i > 0 && isTableRow(lines[i - 1]!))) continue;
    let end = i + 2;
    while (end < lines.length && isTableRow(lines[end]!)) end++;
    out.push({ header: splitRow(line).map(plainText), body: lines.slice(i + 2, end).map(splitRow), line: i + 1, h2, h3 });
    i = end - 1;
  }
  return out;
}

/** A column of mostly backticked Ageben that is not named as English or a note. */
function agebenColumn(header: string[], body: string[][], c: number): boolean {
  return !ENGLISH_HEADER.test(header[c] ?? "") && !OTHER_HEADER.test(header[c] ?? "") && body.filter((row) => /`[^`]+`/.test(row[c] ?? "")).length * 2 >= body.length;
}

/**
 * A grid of form / English column pairs (`| **-l** | English | **-m** | English |`): each pair is
 * its own row, so every English column gives cues. The other pairs ride along in the English
 * cell, so a row still shows its partner (`*in* (**-m** `am`: *amid*)`).
 */
function pairedRows(header: string[], body: string[][], line: number): TableRow[] | undefined {
  const pairs = header.flatMap((h, c) => (CUE_HEADER.test(header[c + 1] ?? "") && agebenColumn(header, body, c) ? [c] : []));
  if (pairs.length < 2) return undefined;
  const rows: TableRow[] = [];
  body.forEach((cells, r) => {
    for (const c of pairs) {
      const form = tableForm(cells[c] ?? "");
      const own = cells[c + 1] ?? "";
      if (!form || !plainText(own)) continue;
      const partners = pairs.filter((p) => p !== c && tableForm(cells[p] ?? "")).map((p) => `**${plainText(header[p]!)}** \`${tableForm(cells[p]!)}\`: ${cells[p + 1] ?? ""}`);
      const english = partners.length ? `${own} (${partners.join("; ")})` : own;
      const cues = cellCues(own);
      rows.push({ form, english, line: line + 2 + r, ...(cues.length ? { cues } : {}) });
    }
  });
  return rows;
}

/** Table rows with an Ageben column and at least one English column. */
function tableRows(lines: string[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const { header, body, line, h2, h3 } of pageTables(lines)) {
    const paired = pairedRows(header, body, line);
    if (paired) {
      rows.push(...paired);
      continue;
    }
    const formCol = formColumn(header, body);
    const englishCols = header.flatMap((h, c) => (c !== formCol && ENGLISH_HEADER.test(h) ? [c] : []));
    if (formCol < 0 || englishCols.length === 0) continue;
    const teachCol = header.findIndex((h) => TEACH_HEADER.test(h));
    const cueCol = header.findIndex((h) => CUE_HEADER.test(h));
    const headingCues = h2?.id === MANY_JOBS_ID && h3 ? italicCues(h3.text) : undefined;
    body.forEach((cells, r) => {
      const form = tableForm(cells[formCol] ?? "");
      const english = englishCols.map((c) => cells[c] ?? "").filter((c) => plainText(c)).join(" — ");
      if (!form || !english) return;
      const teach = teachCol >= 0 ? firstLink(cells[teachCol] ?? "") : undefined;
      const cues = headingCues ?? (cueCol >= 0 ? cellCues(cells[cueCol] ?? "") : undefined);
      rows.push({ form, english, line: line + 2 + r, ...(teach ? { teach } : {}), ...(cues?.length ? { cues } : {}) });
    });
  }
  return rows;
}

function glossEnglish(gloss: string): string {
  return gloss.replace(ROLE_PREFIX, "").replace(/[-.]/g, " ").trim();
}

/** Every English ↔ Ageben pairing on one page. See-also sections are skipped. */
export function collectEnglishEntries(markdown: string, page: string, tables: ClassifyTables): EnglishEntry[] {
  const text = fillSelf(markdown);
  const { sections } = pageSections(page, text);
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (offset: number) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid]! <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const entries: EnglishEntry[] = [];
  const seenGloss = new Set<string>();
  const add = (kind: EntryKind, form: string, english: string, offset: number, extra: Pick<EnglishEntry, "teach" | "cues"> = {}) => {
    const section = sectionAt(sections, offset);
    if (section.ignored) return;
    const toks = tokens(english);
    if (toks.length === 0) return;
    if (kind === "gloss") {
      const key = `${section.slug}\u0000${form}\u0000${english}`;
      if (seenGloss.has(key)) return;
      seenGloss.add(key);
    }
    entries.push({ english, form, kind, page, line: lineOf(offset), slug: section.slug, title: section.title, band: section.band, tokens: toks, ...extra });
  };
  const addGlosses = (ageben: string, offset: number) => {
    let words: { raw: string; gloss: string }[];
    try {
      words = morphGlossWords(ageben, tables);
    } catch {
      // The docs lint reports spans that do not parse.
      return;
    }
    for (const { raw, gloss } of words) add("gloss", raw, glossEnglish(gloss), offset);
  };

  for (const block of extractTeachBlocks(text)) {
    const offset = lineStarts[block.agebenIndex] ?? 0;
    if (block.loose) add("example", block.ageben, block.loose, offset);
    addGlosses(block.ageben, offset);
  }
  for (const item of extractTranslationExercises(text)) {
    if (item.loose) add("practice", item.ageben, item.loose, item.index);
    addGlosses(item.ageben, item.index);
  }
  for (const { form, english, line, teach, cues } of tableRows(text.split("\n"))) {
    add("table", form, english, lineStarts[line - 1]!, { ...(teach ? { teach } : {}), ...(cues ? { cues } : {}) });
  }
  return entries;
}

export type EntryHit = { entry: EnglishEntry; score: number; via?: string };
export type SectionHit = { page: string; slug: string; title: string; band?: Band; score: number; hits: EntryHit[] };
export type SearchOptions = { stage?: Band; kind?: EntryKind; perSection?: number };

function containsRun(haystack: string[], needle: string[]): boolean {
  outer: for (let i = 0; i + needle.length <= haystack.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

function scoreEntry(entry: EnglishEntry, query: string[]): number {
  const toks = entry.tokens;
  if (containsRun(toks, query)) return toks.length === query.length ? 4 : 3;
  const have = new Set(toks);
  const found = query.filter((q) => have.has(q)).length;
  if (found === query.length) return 2;
  return query.length > 1 ? found / query.length : 0;
}

/** The phrase and the synonyms that stand in for it (`via` names the synonym used). */
function expand(phrase: string): { query: string[]; via?: string }[] {
  const own = tokens(phrase);
  const out: { query: string[]; via?: string }[] = [{ query: own }];
  for (const group of SYNONYMS) {
    if (!group.some((g) => tokens(g).join(" ") === own.join(" "))) continue;
    for (const g of group) {
      const query = tokens(g);
      if (query.join(" ") !== own.join(" ")) out.push({ query, via: g });
    }
  }
  return out.filter((q) => q.query.length > 0);
}

/** Sections that teach the phrase, best first, each with its best entries. */
export function searchEnglish(entries: readonly EnglishEntry[], phrase: string, options: SearchOptions = {}): SectionHit[] {
  const queries = expand(phrase);
  const perSection = options.perSection ?? 3;
  const bySection = new Map<string, SectionHit>();
  for (const entry of entries) {
    if (options.stage && entry.band !== options.stage) continue;
    if (options.kind && entry.kind !== options.kind) continue;
    let best: EntryHit | undefined;
    for (const { query, via } of queries) {
      const score = scoreEntry(entry, query) * (via ? 0.9 : 1) * (entry.alias ? 0.95 : 1);
      if (score > 0 && (!best || score > best.score)) best = { entry, score, via };
    }
    if (!best) continue;
    const key = `${entry.page}#${entry.slug}`;
    let section = bySection.get(key);
    if (!section) {
      section = { page: entry.page, slug: entry.slug, title: entry.title, band: entry.band, score: 0, hits: [] };
      bySection.set(key, section);
    }
    section.hits.push(best);
  }

  const byEntry = (a: EntryHit, b: EntryHit) =>
    b.score - a.score || a.entry.tokens.length - b.entry.tokens.length || a.entry.line - b.entry.line;
  const sections = [...bySection.values()];
  for (const section of sections) {
    section.hits.sort(byEntry);
    const seen = new Set<string>();
    section.hits = section.hits
      .filter((h) => {
        const key = `${h.entry.kind}\u0000${h.entry.form}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, perSection);
    // A section named for the phrase (`### By the way`) is the one that teaches it.
    const titled = queries.some(({ query, via }) => !via && containsRun(tokens(section.title), query));
    section.score = section.hits[0]!.score + (titled ? 0.5 : 0);
  }
  // A cheat sheet repeats its owning pages, so on a tie the owning page comes first.
  const onSheet = (s: SectionHit) => (s.page.includes("/cheat-sheets/") ? 1 : 0);
  return sections.sort((a, b) => b.score - a.score || onSheet(a) - onSheet(b) || byEntry(a.hits[0]!, b.hits[0]!));
}

export type RecipeTableFinding = { page: string; line: number; message: string };

/**
 * The recipe-page structure the English helper reads (english.md, say-*.md): under
 * `#many-jobs` each `###` heading is a list of italic cues and each table is
 * `English itch | Ageben job | Teach` with a link in every `Teach` cell; every other
 * table with Ageben in it has an Ageben and an English column the harvest recognizes.
 * No harvest markers on the tables: the heading, header and `Teach` cell already say everything,
 * and this lint fails the build on a shape the harvest can't read instead of skipping it quietly.
 */
export function lintRecipeTables(markdown: string, page: string): RecipeTableFinding[] {
  const findings: RecipeTableFinding[] = [];
  const lines = markdown.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const h = heading(lines[i]!);
    if (h?.level !== 2 || h.id !== MANY_JOBS_ID) continue;
    for (let j = i + 1; j < lines.length; j++) {
      const sub = heading(lines[j]!);
      if (sub && sub.level <= 2) break;
      if (sub?.level === 3 && !/^\*[^*]+\*(\s*\/\s*\*[^*]+\*)*$/.test(sub.text)) {
        findings.push({ page, line: j + 1, message: `#${MANY_JOBS_ID} heading "${sub.text}" is not a list of italic English cues` });
      }
    }
  }
  for (const table of pageTables(lines)) {
    const where = { page, line: table.line };
    if (table.h2?.id === MANY_JOBS_ID) {
      if (table.header.join(" | ") !== "English itch | Ageben job | Teach") {
        findings.push({ ...where, message: `#${MANY_JOBS_ID} table header is "${table.header.join(" | ")}", not "English itch | Ageben job | Teach"` });
        continue;
      }
      if (!table.h3) findings.push({ ...where, message: `#${MANY_JOBS_ID} table has no \`###\` cue heading` });
      table.body.forEach((cells, r) => {
        if (!firstLink(cells[2] ?? "")) findings.push({ page, line: table.line + 2 + r, message: "Teach cell has no link" });
      });
      continue;
    }
    // A table with no Ageben at all (a page index) is not a recipe table.
    if (!table.body.some((cells) => cells.some((cell) => /`[^`]+`/.test(cell)))) continue;
    const formCol = formColumn(table.header, table.body);
    const englishCol = table.header.findIndex((h, c) => c !== formCol && ENGLISH_HEADER.test(h));
    if (formCol < 0 || englishCol < 0) {
      findings.push({ ...where, message: `table "${table.header.join(" | ")}" has no ${formCol < 0 ? "Ageben" : "English"} column the English harvest recognizes` });
    }
  }
  return findings;
}
