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
export type Term = { key: TermKey; value: string }[];

/** Parse `role=v,ending=r` into its conditions. */
export function parseTerm(text: string): Term {
  return text.split(",").map((part) => {
    const eq = part.indexOf("=");
    const key = part.slice(0, eq) as TermKey;
    if (eq < 1 || !TERM_KEYS.includes(key)) {
      throw new Error(`bad term "${part}": expected key=value with key one of ${TERM_KEYS.join(", ")}`);
    }
    return { key, value: part.slice(eq + 1) };
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

function matchesCondition(item: FoundWord, key: TermKey, value: string): boolean {
  const { word } = item;
  switch (key) {
    case "role":
      return (word.pos ?? "") === value;
    case "ending":
      return (word.ending ?? "") === value;
    case "root":
      return "roots" in word.family && (word.family.roots as string[]).includes(value);
    case "family":
      return word.family.kind === value || ("xFamily" in word.family && word.family.xFamily === value);
    case "overlay":
      return word.overlay?.senseForm === value || word.hostOverlay?.senseForm === value;
    case "unit":
      return item.unit === value;
    case "raw":
      return new RegExp(value).test(word.raw);
  }
}

export function matchesTerm(item: FoundWord, term: Term): boolean {
  return term.every(({ key, value }) => matchesCondition(item, key, value));
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
