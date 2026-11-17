/**
 * Word-level queries over parsed examples: which words a parse contains, in
 * surface order, and whether they match a `key=value,…` term.
 */
import { wordConstructions } from "../parse/construction-trace.js";
import type { ClauseScope } from "../parse/scope.js";
import type { LexWord, NumberMarker, NumberStem, ParseResult } from "../parse/types.js";

/** One word of a parsed example, tagged with its clause unit and surface position. */
export type FoundWord = {
  word: LexWord;
  /** `kind` of the clause unit the word sits in (`np`, `vp`, `h`, `hook`, …), or "" outside one. */
  unit: string;
  /** Index among the example's whitespace chunks, or -1 when the raw form was not found. */
  position: number;
  /** Walk-order number of the innermost `Clause` node the word sits in; absent (or -1) outside every clause. */
  clause?: number;
  /** Whole-clause frames the word carries in `resolve.scope`: `family` and, with a member, `family/member`. */
  frames?: string[];
};

export const TERM_KEYS = [
  "role",
  "ending",
  "root",
  "family",
  "overlay",
  "overlayKind",
  "frame",
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
  "locus",
] as const;
export type TermKey = (typeof TERM_KEYS)[number];
/** One `key=regex` (or negated `key!=regex`) condition; the regex must match a whole field value. */
export type Condition = { key: TermKey; value: string; negate: boolean; pattern: RegExp };
/** One `--seq` slot. `parseTerm` never returns an empty term, so in a sequence `[]` is `...`, a gap of zero or more words. */
export type Term = Condition[];

/** The `...` slot of a `--seq`. */
export const SEQ_GAP: Term = [];

export function isSeqGap(term: Term): boolean {
  return term.length === 0;
}

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
  locus: string | null;
  overlayKind: string | null;
  frame: string[];
  /** Innermost clause number, or -1 outside every clause. */
  clause: number;
  /** Construction IDs the word carries on its own (`word.*`, `overlay.*`). */
  constructions: string[];
};

/** A comma that starts the next `key=` / `key!=` condition (a regex may hold other commas, e.g. `{2,3}`). */
const CONDITION_SPLIT = new RegExp(`,(?=(?:${TERM_KEYS.join("|")})!?=)`);
const TERM_PART = new RegExp(`^(${TERM_KEYS.join("|")})(!?)=(.*)$`, "s");

/** Writing glyph ↔ speech letters for one number-marker job (`#` / `ro` are both ordinal-from-start). */
const MARKER_TWIN: Record<string, string> = {
  "+": "ra",
  ra: "+",
  "-": "ru",
  ru: "-",
  "#": "ro",
  ro: "#",
  "#-": "ruo",
  ruo: "#-",
  "#_": "rue",
  rue: "#_",
  "+-": "rua",
  rua: "+-",
  _: "re",
  re: "_",
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

/** Keys under which the tree holds a `Clause` node: a body clause, a clause-join member, a dependent. */
const CLAUSE_KEYS = new Set(["clause", "first"]);

function isClauseNode(key: string, node: unknown): boolean {
  return CLAUSE_KEYS.has(key) && typeof node === "object" && node !== null && Array.isArray((node as { units?: unknown }).units);
}

/** `family` and `family/member` for each whole-clause frame a word carries, by word identity. */
function frameValues(scope: ClauseScope[] | undefined): Map<LexWord, string[]> {
  const out = new Map<LexWord, string[]>();
  for (const record of scope ?? []) {
    for (const frame of record.frames) {
      const values = out.get(frame.word) ?? [];
      for (const value of [frame.family, frame.member ? `${frame.family}/${frame.member}` : undefined]) {
        if (value && !values.includes(value)) values.push(value);
      }
      out.set(frame.word, values);
    }
  }
  return out;
}

/**
 * Every word in a parse result, in surface order. `chunks` are the example's
 * whitespace chunks with punctuation peeled, used to place each word. Each word
 * gets the walk-order number of the innermost clause it sits in and the
 * whole-clause frames `resolve.scope` gives it.
 */
export function flattenWords(result: unknown, chunks: string[]): FoundWord[] {
  const found: FoundWord[] = [];
  const seen = new Set<object>();
  let clauses = 0;
  const walk = (node: unknown, unit: string, clause: number): void => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child, unit, clause);
      return;
    }
    if (typeof node !== "object" || node === null || seen.has(node)) return;
    seen.add(node);
    if (isLexWord(node)) {
      found.push({ word: node, unit, position: -1, clause, frames: [] });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "units" && Array.isArray(child)) {
        for (const u of child) walk(u, typeof u?.kind === "string" ? u.kind : unit, clause);
      } else if (isClauseNode(key, child) && !seen.has(child as object)) {
        walk(child, unit, clauses++);
      } else {
        walk(child, unit, clause);
      }
    }
  };
  walk(result, "", -1);

  const frames = frameValues((result as Partial<ParseResult> | null)?.resolve?.scope);
  for (const item of found) item.frames = frames.get(item.word) ?? [];

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

/** Stored marker plus its writing/speech twin; calendar `roe` is not the `#` / `ro` pair. */
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
  if (family.kind === "joinMarker" && family.hook) forms.push(family.hook);
  if (family.kind === "x" && family.hook) forms.push(family.hook);
  if (word.hookCompound) forms.push(word.hookCompound.hook);
  return forms;
}

/** `kind` of the word's overlay and host overlay (lexicon-overlays.csv). */
export function overlayKinds(word: LexWord): string[] {
  const kinds: string[] = [];
  if (word.overlay) kinds.push(word.overlay.kind);
  if (word.hostOverlay) kinds.push(word.hostOverlay.kind);
  return kinds;
}

export function locusValue(word: LexWord): string | undefined {
  return word.family.kind === "x" ? word.family.locus : undefined;
}

export function scopeValue(word: LexWord): string | undefined {
  const { family } = word;
  if (family.kind === "say") return family.reach;
  if (family.kind !== "x") return undefined;
  if (family.xFamily === "scope") return family.stanceVowel;
  return family.reachVowel;
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
    locus: locusValue(word) ?? null,
    overlayKind: first(overlayKinds(word)),
    frame: item.frames ?? [],
    clause: item.clause ?? -1,
    constructions: wordConstructions(word),
  };
}

/** The values a condition's regex is tested against (a word may have several roots or overlays). */
export function fieldValues(item: FoundWord, key: TermKey): string[] {
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
    case "overlayKind":
      return overlayKinds(word);
    case "frame":
      return item.frames ?? [];
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
    case "locus":
      return locusValue(word) ? [locusValue(word)!] : [];
  }
}

function matchesCondition(item: FoundWord, condition: Condition): boolean {
  const hit = fieldValues(item, condition.key).some((value) => condition.pattern.test(value));
  return condition.negate ? !hit : hit;
}

export function matchesTerm(item: FoundWord, term: Term): boolean {
  return term.every((condition) => matchesCondition(item, condition));
}

/**
 * Every match of `terms` over the placed surface words, as indexes into `words`.
 * Terms match neighboring words; a `...` slot (`SEQ_GAP`) matches zero or more
 * words. With `sameClause`, every matched word sits in one clause. One match per
 * start word: the one that ends earliest.
 */
export function matchSequenceHits(words: FoundWord[], terms: Term[], sameClause = false): number[][] {
  const placed = words.filter((w) => w.position >= 0);
  const matches: number[][] = [];
  const step = (t: number, from: number, adjacentTo: number | null, clause: number | null, taken: FoundWord[]): FoundWord[] | null => {
    if (t === terms.length) return taken;
    const term = terms[t]!;
    if (isSeqGap(term)) {
      for (let j = from; j <= placed.length; j++) {
        const done = step(t + 1, j, null, clause, taken);
        if (done) return done;
      }
      return null;
    }
    const item = placed[from];
    if (!item) return null;
    if (adjacentTo !== null && item.position !== adjacentTo + 1) return null;
    if (!matchesTerm(item, term)) return null;
    const itemClause = item.clause ?? -1;
    if (sameClause && (itemClause < 0 || (clause !== null && itemClause !== clause))) return null;
    return step(t + 1, from + 1, item.position, clause ?? itemClause, [...taken, item]);
  };
  const lead = terms.findIndex((term) => !isSeqGap(term));
  if (lead < 0) return [];
  for (let i = 0; i < placed.length; i++) {
    const hit = step(lead, i, null, null, []);
    if (hit) matches.push(hit.map((w) => words.indexOf(w)));
  }
  return matches;
}

/** Start indexes (into `words`) where the terms match; see `matchSequenceHits`. */
export function matchSequence(words: FoundWord[], terms: Term[], sameClause = false): number[] {
  return matchSequenceHits(words, terms, sameClause).map((hit) => hit[0]!);
}
