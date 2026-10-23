/**
 * Word-level queries over parsed examples: which words a parse contains, in
 * surface order, and whether they match a `key=value,…` term.
 */
import type { LexWord, NumberMarker, NumberStem } from "../parse/types.js";

/** One word of a parsed example, tagged with its clause unit and surface position. */
export type FoundWord = {
  word: LexWord;
  /** `kind` of the clause unit the word sits in (`np`, `vp`, `h`, `hook`, …), or "" outside one. */
  unit: string;
  /** Index among the example's whitespace chunks, or -1 when the raw form was not found. */
  position: number;
};

export const TERM_KEYS = [
  "role",
  "ending",
  "root",
  "family",
  "overlay",
  "unit",
  "raw",
  "series",
  "form",
  "marker",
  "xFamily",
  "reading",
  "scope",
  "answer",
  "stance",
  "pointer",
] as const;
export type TermKey = (typeof TERM_KEYS)[number];
/** One `key=regex` (or negated `key!=regex`) condition; the regex must match a whole field value. */
export type Condition = { key: TermKey; value: string; negate: boolean; pattern: RegExp };
export type Term = Condition[];

/** JSON projection of one matched word; absent letter fields are `null`. */
export type HitWord = {
  raw: string;
  role: string | null;
  family: string;
  series: string | null;
  form: string | null;
  marker: string | null;
  xFamily: string | null;
  reading: string;
  scope: string | null;
  answer: string | null;
  stance: string | null;
  pointer: string | null;
};

/** A comma that starts the next `key=` / `key!=` condition (a regex may hold other commas, e.g. `{2,3}`). */
const CONDITION_SPLIT = new RegExp(`,(?=(?:${TERM_KEYS.join("|")})!?=)`);
const TERM_PART = new RegExp(`^(${TERM_KEYS.join("|")})(!?)=(.*)$`, "s");

/** Writing glyph ↔ speech letters for one number-marker job (`#` / `re` are both ordinal-from-start). */
const MARKER_TWIN: Record<string, string> = {
  "+": "ra",
  ra: "+",
  "-": "ru",
  ru: "-",
  "#": "re",
  re: "#",
  "#-": "rue",
  rue: "#-",
  "#_": "ruo",
  ruo: "#_",
  "+-": "rua",
  rua: "+-",
  _: "ro",
  ro: "_",
};

/**
 * Parse `role=v,ending=r` into its conditions. Each value is a regular expression
 * matched against the whole field (`raw=em` is exactly `em`; `raw=.*em` ends in `em`).
 * `key!=value` matches words where no value of that field matches.
 */
export function parseTerm(text: string): Term {
  return text.split(CONDITION_SPLIT).map((part) => {
    const m = TERM_PART.exec(part);
    const key = m?.[1] as TermKey | undefined;
    if (!m || !key) {
      throw new Error(`bad term "${part}": expected key=regex or key!=regex with key one of ${TERM_KEYS.join(", ")}`);
    }
    const value = m[3]!;
    let pattern: RegExp;
    try {
      pattern = new RegExp(`^(?:${value})$`, "u");
    } catch (error) {
      throw new Error(`bad regex in "${part}": ${(error as Error).message}`);
    }
    return { key, value, negate: m[2] === "!", pattern };
  });
}

function isLexWord(value: unknown): value is LexWord {
  return typeof value === "object" && value !== null && "raw" in value && "family" in value;
}

/**
 * Every word in a parse result, in surface order. `chunks` are the example's
 * whitespace chunks with punctuation peeled, used to place each word.
 */
export function flattenWords(result: unknown, chunks: string[]): FoundWord[] {
  const found: FoundWord[] = [];
  const seen = new Set<object>();
  const walk = (node: unknown, unit: string): void => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child, unit);
      return;
    }
    if (typeof node !== "object" || node === null || seen.has(node)) return;
    seen.add(node);
    if (isLexWord(node)) {
      found.push({ word: node, unit, position: -1 });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "units" && Array.isArray(child)) {
        for (const u of child) walk(u, typeof u?.kind === "string" ? u.kind : unit);
      } else {
        walk(child, unit);
      }
    }
  };
  walk(result, "");

  const used = new Set<number>();
  for (const item of found) {
    const at = chunks.findIndex((chunk, i) => !used.has(i) && chunk === item.word.raw);
    if (at >= 0) {
      used.add(at);
      item.position = at;
    }
  }
  return found.sort((a, b) => a.position - b.position);
}

export function numberStem(word: LexWord): NumberStem | undefined {
  const { family } = word;
  if (family.kind === "number") return family.stem;
  if (family.kind === "x") return family.numberStem;
  return undefined;
}

/** Stored marker plus its writing/speech twin; calendar `roe` is not the `_` / `ro` pair. */
function markerValues(stem: NumberStem | undefined): string[] {
  if (!stem) return [];
  if (stem.calendarOrdinal) return ["roe"];
  const stored: NumberMarker = stem.marker;
  const twin = MARKER_TWIN[stored];
  return twin && twin !== stored ? [stored, twin] : [stored];
}

export function formValues(word: LexWord): string[] {
  const { family } = word;
  const forms: string[] = [];
  if (family.kind === "hook") forms.push(family.form);
  if (family.kind === "hookCompound") forms.push(family.hook);
  if (family.kind === "x" && family.hook) forms.push(family.hook);
  if (word.hookCompound) forms.push(word.hookCompound.hook);
  return forms;
}

export function scopeValue(word: LexWord): string | undefined {
  const { family } = word;
  if (family.kind === "say") return family.scope;
  if (family.kind !== "x") return undefined;
  if (family.xFamily === "scope") return family.stanceVowel;
  return family.scopeVowel;
}

export function stanceValue(word: LexWord): string | undefined {
  const { family } = word;
  if (family.kind !== "x" || family.xFamily === "scope") return undefined;
  return family.stanceVowel;
}

export function seriesValue(word: LexWord): string | undefined {
  return word.family.kind === "joinMarker" ? word.family.series : undefined;
}

export function pointerValue(word: LexWord): string | undefined {
  return word.family.kind === "x" ? word.family.pointerVowel : undefined;
}

function first(values: string[]): string | null {
  return values[0] ?? null;
}

/** Stored fields for `--json`; `marker` is the stem spelling, not the twin. */
export function hitWord(item: FoundWord): HitWord {
  const { word } = item;
  const { family } = word;
  const stem = numberStem(word);
  return {
    raw: word.raw,
    role: word.pos ?? null,
    family: family.kind,
    series: seriesValue(word) ?? null,
    form: first(formValues(word)),
    marker: stem?.calendarOrdinal ? "roe" : (stem?.marker ?? null),
    xFamily: family.kind === "x" ? family.xFamily : null,
    reading: word.reading,
    scope: scopeValue(word) ?? null,
    answer: family.kind === "say" ? family.answer : null,
    stance: stanceValue(word) ?? null,
    pointer: pointerValue(word) ?? null,
  };
}

/** The values a condition's regex is tested against (a word may have several roots or overlays). */
function fieldValues(item: FoundWord, key: TermKey): string[] {
  const { word } = item;
  const { family } = word;
  switch (key) {
    case "role":
      return [word.pos ?? ""];
    case "ending":
      return [word.ending ?? ""];
    case "root":
      if (family.kind === "content") return family.roots;
      if (family.kind === "x") return [...family.leftRoots, ...(family.rightRoots ?? [])];
      if (family.kind === "hookCompound") return [family.leftRoot];
      return [];
    case "family":
      return family.kind === "x" ? [family.kind, family.xFamily] : [family.kind];
    case "overlay":
      return [word.overlay?.senseForm, word.hostOverlay?.senseForm].filter((form): form is string => Boolean(form));
    case "unit":
      return [item.unit];
    case "raw":
      return [word.raw];
    case "series":
      return seriesValue(word) ? [seriesValue(word)!] : [];
    case "form":
      return formValues(word);
    case "marker":
      return markerValues(numberStem(word));
    case "xFamily":
      return family.kind === "x" ? [family.xFamily] : [];
    case "reading":
      return [word.reading];
    case "scope":
      return scopeValue(word) ? [scopeValue(word)!] : [];
    case "answer":
      return family.kind === "say" ? [family.answer] : [];
    case "stance":
      return stanceValue(word) ? [stanceValue(word)!] : [];
    case "pointer":
      return pointerValue(word) ? [pointerValue(word)!] : [];
  }
}

function matchesCondition(item: FoundWord, condition: Condition): boolean {
  const hit = fieldValues(item, condition.key).some((value) => condition.pattern.test(value));
  return condition.negate ? !hit : hit;
}

export function matchesTerm(item: FoundWord, term: Term): boolean {
  return term.every((condition) => matchesCondition(item, condition));
}

/** Start indexes (into `words`) where the terms match consecutive surface words. */
export function matchSequence(words: FoundWord[], terms: Term[]): number[] {
  const placed = words.filter((w) => w.position >= 0);
  const starts: number[] = [];
  for (let i = 0; i + terms.length <= placed.length; i++) {
    const ok = terms.every((term, k) => {
      const item = placed[i + k]!;
      return item.position === placed[i]!.position + k && matchesTerm(item, term);
    });
    if (ok) starts.push(words.indexOf(placed[i]!));
  }
  return starts;
}
