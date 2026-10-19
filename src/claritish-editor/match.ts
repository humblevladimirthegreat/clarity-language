// Cue matching for the Claritish editor: sentences, tokens, cue patterns, and the one mark
// per sentence. Pure and browser-safe; the trigger rows come from data/claritish-triggers.csv
// through the editor data (data.ts).
import { findDropIns } from "./read-back.js";

export type Span = { from: number; to: number };

export type Token = Span & { text: string; norm: string; word: boolean };

export type Sentence = Span & { text: string; tokens: Token[] };

/** One pattern token: alternatives (lowercase, `*` matches any letters), maybe optional. */
type PatternToken = { alts: string[]; optional: boolean };

export type Pattern = PatternToken[];

/** The fields of a trigger row the matcher needs. */
export type MatchTrigger = {
  id: string;
  lesson: string;
  /** Patterns, any of which raises the cue. */
  cues: string[];
  /** Patterns that, overlapping a cue, mean it is not the trap (*thanks to the rain*). */
  exclude: string[];
};

export type Cue = Span & {
  trigger: string;
  lesson: string;
  /** The matched English, as written. */
  text: string;
  sentence: Sentence;
};

export type Mark = {
  /** The cue that carries the underline: the earliest lesson in track order. */
  cue: Cue;
  /** The other cues in the same sentence, shown under *Also here*. */
  also: Cue[];
};

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*/uy;

export function normalize(text: string): string {
  return text.toLowerCase().replace(/’/g, "'");
}

/** Words and single punctuation characters, with offsets into the original text. */
export function tokenize(text: string, offset = 0): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i]!)) {
      i++;
      continue;
    }
    WORD_RE.lastIndex = i;
    const m = WORD_RE.exec(text);
    const raw = m ? m[0] : String.fromCodePoint(text.codePointAt(i)!);
    tokens.push({ from: offset + i, to: offset + i + raw.length, text: raw, norm: normalize(raw), word: Boolean(m) });
    i += raw.length;
  }
  return tokens;
}

/**
 * Sentences: a line break, or `.` `!` `?` (with any closing quotes) followed by a space, ends one.
 * Text inside quotation marks or code spans is someone else's words or not prose: its tokens are
 * dropped, so no cue can match there.
 */
export function sentences(text: string): Sentence[] {
  const out: Sentence[] = [];
  const quoted = quotedSpans(text);
  const re = /[^\n]+?(?:[.!?…]+["”’')\]]*(?=\s|$)|$)/gm;
  for (const m of text.matchAll(re)) {
    const raw = m[0];
    if (!raw.trim()) continue;
    const lead = raw.length - raw.trimStart().length;
    const from = m.index! + lead;
    const body = raw.trim();
    const tokens = tokenize(body, from).filter((t) => !quoted.some((q) => t.from >= q.from && t.to <= q.to));
    out.push({ from, to: from + body.length, text: body, tokens });
  }
  return out;
}

/** Quoted runs (straight or curly double quotes) and code spans, including their marks. */
export function quotedSpans(text: string): Span[] {
  const out: Span[] = [];
  for (const m of text.matchAll(/`[^`\n]*`|"[^"\n]*"|“[^”\n]*”/g)) out.push({ from: m.index!, to: m.index! + m[0].length });
  return out;
}

/**
 * `I (just) think/guess (that)`: space-separated tokens, `a/b` alternatives, `(…)` optional,
 * `*` inside a token for any letters (`*ing`). Punctuation is its own token (`sorry ?`, `; )`).
 */
export function parsePattern(src: string): Pattern {
  const out: Pattern = [];
  for (const raw of src.trim().split(/\s+/)) {
    const optional = raw.startsWith("(") && raw.endsWith(")");
    const body = optional ? raw.slice(1, -1) : raw;
    // A bracket is literal only in a token of punctuation alone (`; )`).
    if (!body || (/[()]/.test(body) && /[\p{L}\p{N}]/u.test(body))) throw new Error(`bad pattern token \`${raw}\` in \`${src}\``);
    out.push({ alts: body.split("/").map(normalize), optional });
  }
  if (!out.some((t) => !t.optional)) throw new Error(`pattern \`${src}\` has no required token`);
  return out;
}

function tokenMatches(alt: string, token: Token): boolean {
  if (!alt.includes("*")) return alt === token.norm;
  const re = new RegExp(`^${alt.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[\\p{L}']*")}$`, "u");
  return re.test(token.norm);
}

/** End index (exclusive) of the longest match of `pattern` at `tokens[start]`, or -1. */
export function matchAt(pattern: Pattern, tokens: readonly Token[], start: number): number {
  function go(p: number, t: number): number {
    if (p === pattern.length) return t;
    const pt = pattern[p]!;
    const token = tokens[t];
    let best = -1;
    if (token && pt.alts.some((alt) => tokenMatches(alt, token))) best = go(p + 1, t + 1);
    if (pt.optional) best = Math.max(best, go(p + 1, t));
    return best;
  }
  return go(0, start);
}

export type CompiledTrigger = MatchTrigger & { patterns: Pattern[]; exclusions: Pattern[] };

export function compileTrigger<T extends MatchTrigger>(trigger: T): T & CompiledTrigger {
  return { ...trigger, patterns: trigger.cues.map(parsePattern), exclusions: trigger.exclude.map(parsePattern) };
}

function matches(patterns: readonly Pattern[], tokens: readonly Token[]): Span[] {
  const out: Span[] = [];
  for (let i = 0; i < tokens.length; i++) {
    for (const pattern of patterns) {
      const end = matchAt(pattern, tokens, i);
      if (end > i) out.push({ from: i, to: end });
    }
  }
  return out;
}

const overlaps = (a: Span, b: Span) => a.from < b.to && b.from < a.to;
const within = (inner: Span, outer: Span) => inner.from >= outer.from && inner.to <= outer.to;

/** Every cue in one sentence, before filtering by lesson or dismissals. */
export function sentenceCues(sentence: Sentence, triggers: readonly CompiledTrigger[]): Cue[] {
  const { tokens } = sentence;
  const found: Cue[] = [];
  for (const trigger of triggers) {
    const excluded = matches(trigger.exclusions, tokens);
    for (const span of matches(trigger.patterns, tokens)) {
      if (excluded.some((x) => overlaps(x, span))) continue;
      const from = tokens[span.from]!.from;
      const to = tokens[span.to - 1]!.to;
      const text = sentence.text.slice(from - sentence.from, to - sentence.from);
      found.push({ trigger: trigger.id, lesson: trigger.lesson, from, to, text, sentence });
    }
  }
  // A match inside a longer one from the same lesson (`sorry` in `I'm sorry`) is the same cue.
  const kept: Cue[] = [];
  for (const cue of found.sort((a, b) => b.to - b.from - (a.to - a.from))) {
    if (!kept.some((other) => other.lesson === cue.lesson && within(cue, other))) kept.push(cue);
  }
  return kept.sort((a, b) => a.from - b.from);
}

/** One mark per sentence: the cue from the earliest lesson in `lessonOrder`, the rest under *Also here*. */
export function marksFor(cues: readonly Cue[], lessonOrder: readonly string[]): Mark[] {
  const bySentence = new Map<number, Cue[]>();
  for (const cue of cues) {
    const list = bySentence.get(cue.sentence.from) ?? [];
    list.push(cue);
    bySentence.set(cue.sentence.from, list);
  }
  const rank = (cue: Cue) => {
    const i = lessonOrder.indexOf(cue.lesson);
    return i < 0 ? lessonOrder.length : i;
  };
  return [...bySentence.values()].map((list) => {
    const sorted = [...list].sort((a, b) => rank(a) - rank(b) || a.from - b.from);
    return { cue: sorted[0]!, also: sorted.slice(1) };
  });
}

export type ScanOptions = {
  /** Lessons whose cues mark text. */
  enabled: ReadonlySet<string>;
  /** Normalized cue phrases the writer never wants flagged. */
  never: ReadonlySet<string>;
  /** `dismissKey` values of marks the writer left in English. */
  dismissed: ReadonlySet<string>;
  /** Forms each lesson can produce: a sentence that already has one is not flagged for that lesson. */
  formsByLesson: ReadonlyMap<string, ReadonlySet<string>>;
};

/** Key for *Leave it*: the sentence as written and the trigger, so an edit to the sentence brings the mark back. */
export function dismissKey(cue: Cue): string {
  return `${cue.trigger}\u0000${cue.sentence.text}`;
}

function hasForm(sentence: Sentence, forms: ReadonlySet<string> | undefined): boolean {
  return Boolean(forms?.size) && findDropIns(sentence.text, forms!).length > 0;
}

/**
 * Cue scanning over a whole text, re-matching only paragraphs whose text changed.
 * Returns marks with document offsets, in text order.
 */
export function createScanner(triggers: readonly CompiledTrigger[], lessonOrder: readonly string[]) {
  const cache = new Map<string, Cue[]>();
  function paragraphCues(text: string): Cue[] {
    let cues = cache.get(text);
    if (!cues) {
      cues = sentences(text).flatMap((s) => sentenceCues(s, triggers));
      cache.set(text, cues);
      if (cache.size > 500) cache.delete(cache.keys().next().value!);
    }
    return cues;
  }
  return function scan(text: string, options: ScanOptions): Mark[] {
    const cues: Cue[] = [];
    let offset = 0;
    for (const paragraph of text.split("\n")) {
      for (const cue of paragraphCues(paragraph)) cues.push(shift(cue, offset));
      offset += paragraph.length + 1;
    }
    const shown = cues.filter(
      (cue) =>
        options.enabled.has(cue.lesson) &&
        !options.never.has(normalize(cue.text)) &&
        !options.dismissed.has(dismissKey(cue)) &&
        !hasForm(cue.sentence, options.formsByLesson.get(cue.lesson)),
    );
    return marksFor(shown, lessonOrder).sort((a, b) => a.cue.from - b.cue.from);
  };
}

function shift(cue: Cue, by: number): Cue {
  if (by === 0) return cue;
  const sentence = { ...cue.sentence, from: cue.sentence.from + by, to: cue.sentence.to + by, tokens: cue.sentence.tokens.map((t) => ({ ...t, from: t.from + by, to: t.to + by })) };
  return { ...cue, from: cue.from + by, to: cue.to + by, sentence };
}
