/**
 * Search the docs by English phrase: the English-side counterpart of find.mjs.
 *
 * Indexes the English the grammar pages already pair with Agazan: each
 * example's quoted English, each word's parser gloss, table rows with an
 * Agazan column and an English column, and translation-practice prompts.
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
  /** Agazan form the English is paired with. */
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
const FORM_HEADER = /^(agazan|form|agazan job)$/i;
const ENGLISH_HEADER = /^(english\b.*|use|reading|you mean|meaning|gloss|for english like|.* sense)$/i;
/** Columns that are neither the form nor English: mnemonics, pronunciation, notes. */
const OTHER_HEADER = /^(cue|ipa|same root as|teach|anatomy|notes|why|example|examples)$/i;
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
 * The form column: an `Agazan` / `Form` header, else the first other column
 * whose rows are mostly backticked Agazan (`| English | Bar |`, `| Marker | Use | English |`).
 */
function formColumn(header: string[], body: string[][]): number {
  const named = header.findIndex((h) => FORM_HEADER.test(h));
  if (named >= 0) return named;
  return header.findIndex(
    (h, c) =>
      !ENGLISH_HEADER.test(h) &&
      !OTHER_HEADER.test(h) &&
      body.filter((row) => /`[^`]+`/.test(row[c] ?? "")).length * 2 >= body.length,
  );
}

/** Table rows with an Agazan column and at least one English column. */
function tableRows(lines: string[]): { form: string; english: string; line: number }[] {
  const rows: { form: string; english: string; line: number }[] = [];
  for (let i = 0; i + 1 < lines.length; i++) {
    if (!isTableRow(lines[i]!) || !isDividerRow(lines[i + 1]!) || (i > 0 && isTableRow(lines[i - 1]!))) continue;
    const header = splitRow(lines[i]!).map(plainText);
    let end = i + 2;
    while (end < lines.length && isTableRow(lines[end]!)) end++;
    const body = lines.slice(i + 2, end).map(splitRow);
    const formCol = formColumn(header, body);
    const englishCols = header.flatMap((h, c) => (c !== formCol && ENGLISH_HEADER.test(h) ? [c] : []));
    if (formCol >= 0 && englishCols.length > 0) {
      body.forEach((cells, r) => {
        const form = tableForm(cells[formCol] ?? "");
        const english = englishCols.map((c) => cells[c] ?? "").filter((c) => plainText(c)).join(" — ");
        if (form && english) rows.push({ form, english, line: i + 3 + r });
      });
    }
    i = end - 1;
  }
  return rows;
}

function glossEnglish(gloss: string): string {
  return gloss.replace(ROLE_PREFIX, "").replace(/[-.]/g, " ").trim();
}

/** Every English ↔ Agazan pairing on one page. See-also sections are skipped. */
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
  const add = (kind: EntryKind, form: string, english: string, offset: number) => {
    const section = sectionAt(sections, offset);
    if (section.ignored) return;
    const toks = tokens(english);
    if (toks.length === 0) return;
    if (kind === "gloss") {
      const key = `${section.slug}\u0000${form}\u0000${english}`;
      if (seenGloss.has(key)) return;
      seenGloss.add(key);
    }
    entries.push({ english, form, kind, page, line: lineOf(offset), slug: section.slug, title: section.title, band: section.band, tokens: toks });
  };
  const addGlosses = (agazan: string, offset: number) => {
    let words: { raw: string; gloss: string }[];
    try {
      words = morphGlossWords(agazan, tables);
    } catch {
      // The docs lint reports spans that do not parse.
      return;
    }
    for (const { raw, gloss } of words) add("gloss", raw, glossEnglish(gloss), offset);
  };

  for (const block of extractTeachBlocks(text)) {
    const offset = lineStarts[block.agazanIndex] ?? 0;
    if (block.loose) add("example", block.agazan, block.loose, offset);
    addGlosses(block.agazan, offset);
  }
  for (const item of extractTranslationExercises(text)) {
    if (item.loose) add("practice", item.agazan, item.loose, item.index);
    addGlosses(item.agazan, item.index);
  }
  for (const row of tableRows(text.split("\n"))) add("table", row.form, row.english, lineStarts[row.line - 1]!);
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
  return sections.sort((a, b) => b.score - a.score || byEntry(a.hits[0]!, b.hits[0]!));
}
