/**
 * Word-level queries over parsed examples: which words a parse contains, in
 * surface order, and whether they match a `key=value,…` term.
 */
import type { LexWord } from "../parse/types.js";

/** One word of a parsed example, tagged with its clause unit and surface position. */
export type FoundWord = {
  word: LexWord;
  /** `kind` of the clause unit the word sits in (`np`, `vp`, `h`, `hook`, …), or "" outside one. */
  unit: string;
  /** Index among the example's whitespace chunks, or -1 when the raw form was not found. */
  position: number;
};

const TERM_KEYS = ["role", "ending", "root", "family", "overlay", "unit", "raw"] as const;
export type TermKey = (typeof TERM_KEYS)[number];
/** One `key=regex` (or negated `key!=regex`) condition; the regex must match a whole field value. */
export type Condition = { key: TermKey; value: string; negate: boolean; pattern: RegExp };
export type Term = Condition[];

/** A comma that starts the next `key=` / `key!=` condition (a regex may hold other commas, e.g. `{2,3}`). */
const CONDITION_SPLIT = new RegExp(`,(?=(?:${TERM_KEYS.join("|")})!?=)`);

/**
 * Parse `role=v,ending=r` into its conditions. Each value is a regular expression
 * matched against the whole field (`raw=em` is exactly `em`; `raw=.*em` ends in `em`).
 * `key!=value` matches words where no value of that field matches.
 */
export function parseTerm(text: string): Term {
  return text.split(CONDITION_SPLIT).map((part) => {
    const m = /^([a-z]+)(!?)=(.*)$/s.exec(part);
    const key = m?.[1] as TermKey | undefined;
    if (!m || !key || !TERM_KEYS.includes(key)) {
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
