/**
 * Free English lines on grammar pages ([glosses.md § sentence and note](../../docs/meta/glosses.md#free-english-sentence-and-note)):
 * a loose sentence in `"…"` (italics `*…*` in a checkpoint), then at most one plain-English note
 * in parentheses after it. The extractor returns every free English line with the Agazan it
 * translates; the lint checks the shape, parentheses inside the sentence, and what a note may hold.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { looksLikeMorphLine, morphGlossLine } from "../parse/morph-gloss.js";
import { practiceItems, type PracticeItem } from "./practice-items.js";
import { glossLabels } from "./terminology-docs.js";

/**
 * Where the line sits: an example blockquote, or a converted checkpoint item. `en-ag`, `pick`,
 * and `fix` lines are the English prompt; an `ag-en` line is the English answer.
 */
export type FreeEnglishKind = "example" | "en-ag" | "ag-en" | "pick" | "fix";

export type FreeEnglishLine = {
  kind: FreeEnglishKind;
  /** The Agazan it translates (a dialogue block's lines joined), or null when the item has none. */
  agazan: string | null;
  morph: string | null;
  /** The line as written: the quote or italics and anything after them. */
  text: string;
  /** Char index of `text`. */
  index: number;
  /** `"` for an example, `*` for a checkpoint. */
  delimiter: '"' | "*";
  /** Sentence and note, or null when the line has any other shape. */
  split: FreeEnglishSplit | null;
};

/**
 * A line's English parts and note. `parts` are the quoted (or italic) pieces as written: one for a
 * plain line, several for alternative renderings (`"A" / "B"`) or dialogue turns (`"A" "B"`).
 * `sentence` is the first alternative, or the turns joined by a space.
 */
export type FreeEnglishSplit = {
  sentence: string;
  note: string | null;
  parts: string[];
  join: "one" | "alternatives" | "turns";
};

/** One blockquote whose first non-empty row is Agazan, with its free English rows. */
export type ExampleBlock = {
  agazan: string;
  morph: string | null;
  /** Line index of the first Agazan row. */
  line: number;
  free: { text: string; index: number }[];
};

function balanced(text: string): boolean {
  let depth = 0;
  for (const ch of text) {
    if (ch === "(") depth += 1;
    else if (ch === ")" && --depth < 0) return false;
  }
  return depth === 0;
}

/** End of the closing `*` of a leading `*…*` (not `**`), or -1. */
function italicEnd(text: string): number {
  if (!/^\*[^*\s]/.test(text)) return -1;
  for (let i = 1; i < text.length; i++) {
    if (text[i] === "*" && text[i + 1] !== "*" && text[i - 1] !== "*") return i;
  }
  return -1;
}

/**
 * Split a free English line into its parts and note: `"<sentence>" (<note>)`, alternatives
 * `"<a>" / "<b>" (<note>)`, or dialogue turns `"<a>" "<b>" (<note>)`; with `delimiter` `*`, italics
 * in place of the quotes. Returns null for any other shape, including a period after the note.
 */
export function splitFreeEnglish(line: string, delimiter: '"' | "*" = '"'): FreeEnglishSplit | null {
  let rest = line.trim();
  const parts: string[] = [];
  let join: FreeEnglishSplit["join"] = "one";
  for (;;) {
    if (!rest.startsWith(delimiter)) return null;
    const close = delimiter === '"' ? rest.indexOf('"', 1) : italicEnd(rest);
    if (close < 0) return null;
    const part = rest.slice(1, close).trim();
    if (!part) return null;
    parts.push(part);
    rest = rest.slice(close + 1).trim();
    const slash = rest.startsWith("/");
    const next = slash ? rest.slice(1).trim() : rest;
    if (!next.startsWith(delimiter)) break;
    const kind = slash ? "alternatives" : "turns";
    if (join !== "one" && join !== kind) return null;
    join = kind;
    rest = next;
  }
  const sentence = join === "turns" ? parts.join(" ") : parts[0]!;
  if (!rest) return { sentence, note: null, parts, join };
  const m = /^\((.*)\)$/.exec(rest);
  if (!m || !balanced(m[1]!) || !m[1]!.trim()) return null;
  return { sentence, note: m[1]!.trim(), parts, join };
}

/** Top-level `(…)` groups in a sentence. */
export function parenGroups(sentence: string): number {
  let depth = 0;
  let groups = 0;
  for (const ch of sentence) {
    if (ch === "(" && depth++ === 0) groups += 1;
    else if (ch === ")" && depth > 0) depth -= 1;
  }
  return groups;
}

/** Aside spans in a morph line. */
export function asideSpans(gloss: string): number {
  return gloss.split("ASIDE[").length - 1;
}

/**
 * Parentheses inside the sentence beyond what the gloss allows: one group per aside span or scope
 * island (`SCOPE[…]`), plus any `(A)` letter group naming a tag the gloss sets (`tag.A`)
 * ([glosses.md § parentheses inside the quotes](../../docs/meta/glosses.md#inside-parentheses)).
 */
export function extraParens(sentence: string, gloss: string): number {
  const tags = new Set([...gloss.matchAll(/(?<!←)tag\.([A-Z](?:\+[A-Z])*)/g)].flatMap((m) => m[1]!.split("+")));
  const letters = [...sentence.matchAll(/\(([A-Z])\)/g)].filter((m) => tags.has(m[1]!)).length;
  const spans = asideSpans(gloss) + (gloss.split("SCOPE[").length - 1);
  return Math.max(0, parenGroups(sentence) - letters - spans);
}

/** Agazan in a backtick span (optionally followed by `.`), or in `<code>` with entities. */
function unwrapCode(text: string): string | null {
  const m = text.match(/^`([^`]+)`\.?$/);
  if (m) return m[1]!;
  const html = text.match(/^<code>([^<]+)<\/code>\.?$/);
  return html ? html[1]!.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : null;
}

/**
 * Example blockquotes: one or more Agazan rows first (a dialogue block has several), then any
 * morph line and quoted free English rows. Spoken (🔊) rows are skipped.
 */
export function exampleBlocks(markdown: string): ExampleBlock[] {
  const out: ExampleBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let offset = 0;
  const starts = lines.map((line) => {
    const at = offset;
    offset += line.length + 1;
    return at;
  });
  let i = 0;
  while (i < lines.length) {
    if (!/^[ \t]*>/.test(lines[i]!)) {
      i += 1;
      continue;
    }
    const rows: { text: string; index: number; line: number }[] = [];
    while (i < lines.length && /^[ \t]*>/.test(lines[i]!)) {
      const raw = lines[i]!;
      const text = raw.replace(/^[ \t]*>[ \t]?/, "").trim();
      if (text && !text.startsWith("🔊")) rows.push({ text, index: starts[i]! + raw.indexOf(text), line: i });
      i += 1;
    }
    const agazan: string[] = [];
    for (const row of rows) {
      const code = unwrapCode(row.text);
      if (code == null) break;
      agazan.push(code);
    }
    if (agazan.length === 0) continue;
    const morphRow = rows.slice(agazan.length).find((row) => looksLikeMorphLine(row.text));
    out.push({
      agazan: agazan.join(" "),
      morph: morphRow?.text ?? null,
      line: rows[0]!.line,
      free: rows.filter((row) => row.text.startsWith('"')).map(({ text, index }) => ({ text, index })),
    });
  }
  return out;
}

/** The English at the start of a checkpoint prompt: the italics and any note, up to the first form or comment. */
function promptEnglish(item: PracticeItem, markdown: string): { text: string; index: number } | null {
  const line = markdown.slice(item.prompt.start, item.prompt.end);
  const m = /^\*\*\d+\.\*\*\s*/.exec(line);
  if (!m) return null;
  const rest = line.slice(m[0].length);
  if (!rest.startsWith("*")) return null;
  const cut = rest.search(/`|<!--|<code>/);
  const text = (cut < 0 ? rest : rest.slice(0, cut)).trim();
  return text ? { text, index: item.prompt.start + m[0].length } : null;
}

function spoilerAnswer(item: PracticeItem): { agazan: string | null; morph: string | null } {
  const at = item.spoiler.findIndex((line) => line.kind === "agazan");
  if (at < 0) return { agazan: null, morph: null };
  const next = item.spoiler.slice(at + 1).find((line) => line.kind !== "speech");
  const morph = next?.kind === "text" && looksLikeMorphLine(next.text) ? next.text : null;
  return { agazan: item.spoiler[at]!.text, morph };
}

/** Checkpoint English: prompts of English → Agazan, Pick one, and Fix it; answers of Agazan → English. */
function checkpointLines(markdown: string): FreeEnglishLine[] {
  const out: FreeEnglishLine[] = [];
  for (const item of practiceItems(markdown).items) {
    if (item.type === "changes") continue;
    if (item.type === "ag-en") {
      const morphLine = item.spoiler.find((line) => line.kind === "text" && looksLikeMorphLine(line.text));
      const answer = item.spoiler.find((line) => line.kind === "english" || (line.kind === "text" && italicEnd(line.text) > 0));
      if (!answer) continue;
      out.push(line("ag-en", item.promptSpans.map((s) => s.text).join(" ") || null, morphLine?.text ?? null, answer.text, answer.index, "*"));
      continue;
    }
    const english = promptEnglish(item, markdown);
    if (!english) continue;
    const { agazan, morph } = spoilerAnswer(item);
    out.push(line(item.type, agazan, morph, english.text, english.index, "*"));
  }
  return out;
}

function line(
  kind: FreeEnglishKind,
  agazan: string | null,
  morph: string | null,
  text: string,
  index: number,
  delimiter: '"' | "*",
): FreeEnglishLine {
  return { kind, agazan, morph, text, index, delimiter, split: splitFreeEnglish(text, delimiter) };
}

/** Every free English line on a page, in page order. */
export function extractFreeEnglish(markdown: string): FreeEnglishLine[] {
  const out: FreeEnglishLine[] = [];
  for (const block of exampleBlocks(markdown)) {
    for (const free of block.free) out.push(line("example", block.agazan, block.morph, free.text, free.index, '"'));
  }
  out.push(...checkpointLines(markdown));
  return out.sort((a, b) => a.index - b.index);
}

/**
 * Grammar terms a note never uses ([glosses.md § note contents](../../docs/meta/glosses.md#note-contents)).
 * A note says what the marking means (*the surprise is Azawan's*), not what it is called. Each
 * entry matches as a whole word or phrase, case-insensitively, with an optional plural `s`.
 * Plain words that also name a feature (*topic*, *list*, *open*, *closed*, *cause*, *pattern*,
 * *addressee*) are left out: a note uses them in their everyday sense.
 */
export const NOTE_GRAMMAR_TERMS: readonly string[] = [
  // Word shape and gloss metalanguage
  "morph", "gloss", "prefix", "suffix", "ending", "root", "stem", "citation", "citation form",
  "role letter", "PoS", "part of speech", "compound", "x-compound", "seam", "hinge", "overlay",
  "loan verb", "loan adjective", "loan noun",
  // Word classes and clause roles
  "noun", "verb", "adjective", "adverb", "particle", "pronoun", "clause", "subject", "object",
  "predicate", "copula", "hook", "discourse hook", "range hook", "restrictor", "subordinator",
  "linker", "relative clause", "role pointer", "pointer", "resume", "antecedent", "tag pronoun",
  "topic pronoun", "generic pronoun", "vocative", "interjection", "speech act", "stand-in",
  // Joins and spans
  "join", "open join", "closed join", "fence", "aside span", "span", "scope island", "arity",
  // Stance, evidence, mood
  "holder", "holder seam", "mirative", "evidential", "evidentiality", "residue", "notional",
  "universality", "habitual", "mood", "tense", "aspect", "whose-now", "polar", "stance particle",
  "stance bar", "tone mark", "lateral", "viewpoint lateral", "gravity",
  // Number and comparison
  "plural", "associative", "clusivity", "inclusive we", "exclusive we", "collective",
  "comparative", "superlative", "equative", "similative",
];

const TERM_RES = NOTE_GRAMMAR_TERMS.map((term) => ({
  term,
  re: new RegExp(`(?<![\\w-])${term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}s?(?![\\w-])`, "i"),
}));

export type FreeEnglishFinding = {
  index: number;
  kind: "shape" | "inside-parens" | "note-form" | "note-label" | "note-term";
  detail: string;
};

/** Labels and grammar terms in a note, as findings without an index. */
export function noteFindings(note: string, labels: ReadonlySet<string>): Omit<FreeEnglishFinding, "index">[] {
  const out: Omit<FreeEnglishFinding, "index">[] = [];
  if (/`|<code>/.test(note)) out.push({ kind: "note-form", detail: "the note quotes an Agazan form; say what it means in plain English" });
  if (/(?<!\S)\/[a-zɡθ]{1,3}\/(?!\w)/.test(note)) out.push({ kind: "note-form", detail: "the note names a sound class (`/…/`)" });
  for (const m of note.matchAll(/(?<![A-Za-z])[A-Z][A-Z-]*[A-Z](?![A-Za-z])/g)) {
    if (labels.has(m[0])) out.push({ kind: "note-label", detail: `the note uses the gloss label ${m[0]}` });
  }
  // A longer term that matches covers the shorter ones inside it (*loan verb*, not also *verb*).
  const terms = TERM_RES.filter(({ re }) => re.test(note)).map(({ term }) => term.toLowerCase());
  for (const term of terms) {
    if (terms.some((other) => other !== term && other.includes(term))) continue;
    out.push({ kind: "note-term", detail: `the note uses the grammar term "${term}"` });
  }
  return out;
}

/** The Agazan's morph line, or null when it does not parse. */
function glossOf(agazan: string, tables: ClassifyTables, cache: Map<string, string | null>): string | null {
  if (!cache.has(agazan)) {
    let gloss: string | null;
    try {
      gloss = morphGlossLine(agazan, tables, { strict: true });
    } catch {
      gloss = null;
    }
    cache.set(agazan, gloss);
  }
  return cache.get(agazan)!;
}

/**
 * Shape, inside-parentheses, and note findings for one page. Parentheses inside the sentence are
 * allowed up to {@link extraParens}: asides, scope islands, and tag letters (an aside may also come
 * out as commas).
 */
export function lintFreeEnglish(markdown: string, tables: ClassifyTables): FreeEnglishFinding[] {
  const labels = glossLabels(tables.overlays.values());
  const cache = new Map<string, string | null>();
  const out: FreeEnglishFinding[] = [];
  for (const free of extractFreeEnglish(markdown)) {
    const { split, index } = free;
    if (!split) {
      const open = free.delimiter === '"' ? '"…"' : "*…*";
      out.push({
        index,
        kind: "shape",
        detail: `free English is ${open} (or alternatives ${open} / ${open}, or turns ${open} ${open}) plus at most one (note) after it, nothing else: ${free.text}`,
      });
      continue;
    }
    if (free.agazan != null && split.parts.some((part) => part.includes("("))) {
      const gloss = glossOf(free.agazan, tables, cache);
      const extra = gloss == null ? 0 : extraParens(split.parts.join(" "), gloss);
      if (extra > 0) {
        out.push({
          index,
          kind: "inside-parens",
          detail: `${extra} (…) inside the sentence beyond its asides, scope islands, and tag letters; move the note after the sentence: ${free.text}`,
        });
      }
    }
    if (split.note != null) for (const finding of noteFindings(split.note, labels)) out.push({ index, ...finding });
  }
  return out;
}
