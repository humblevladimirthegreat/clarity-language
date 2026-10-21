/**
 * The game's voice: every Agebon line it shows starts as a morph gloss, is spelled by gloss-inverse,
 * and is parsed (one tree, lexicon roots) before it is shown, as doc examples are at build time.
 * Fixed lines arrive spelled from the build ([build.ts](./build.ts)); generated lines are spelled here,
 * with the index grown one root at a time.
 */
import { classify, type ClassifyTables } from "../parse/classify.js";
import { glossToAgebon, indexRootForms, seriesGlossIndex, type GlossIndex } from "../parse/gloss-inverse.js";
import { morphGlossFor } from "../parse/morph-gloss.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { LexWord, ParseResult } from "../parse/types.js";
import { parseWords } from "../parse/word.js";
import type { Spoken } from "./types.js";

export type Voice = {
  /** Spell a gloss, parse it, and list what reading it needs; undefined when it does not spell or parses two ways. */
  say(gloss: string, english: string): Spoken | undefined;
  /** The gloss of one word: role letter + root + ending (`z-←book` for `z`, the book root, `r`). */
  leaf(pos: string, root: string, ending: string): string;
  /** Make the index spell `root` (callers that build glosses from labels, such as a typed gloss). */
  learn(root: string): void;
  index: GlossIndex;
};

/** Content roots a line uses (for gating): each word's stem roots, and the host of a mid-word `x` word. */
export function lineRoots(result: ParseResult): string[] {
  const roots = new Set<string>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(visit);
    const word = value as Partial<LexWord>;
    if (typeof word.raw === "string" && word.family) {
      if (word.family.kind === "content") word.family.roots.forEach((r) => roots.add(r));
      if (word.family.kind === "x") [...word.family.leftRoots, ...(word.family.rightRoots ?? [])].forEach((r) => roots.add(r));
    }
    for (const [key, child] of Object.entries(value)) if (key !== "antecedent" && key !== "resolve") visit(child);
  };
  visit(result.utterances);
  return [...roots];
}

/**
 * Words the lexicon does not know (reading `unknown`). Browser-safe: unlike parse/lexicon-check.ts it does
 * not look inside written spans, which the engine cannot read yet anyway.
 */
export function unknownWordsIn(result: ParseResult): string[] {
  const found = new Set<string>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(visit);
    const word = value as Partial<LexWord>;
    if (typeof word.raw === "string" && word.reading === "unknown" && word.family?.kind !== "foreign" && word.family?.kind !== "writingSpan") found.add(word.raw);
    for (const child of Object.values(value)) visit(child);
  };
  visit(result.utterances);
  return [...found];
}

/** Parse a line the game is about to show; undefined unless it reads one way. */
export function checkLine(agebon: string, gloss: string, english: string, tables: ClassifyTables): Spoken | undefined {
  try {
    const result = parseWithTables(agebon, tables, { constructions: true, checkAmbiguity: true });
    if (result.ambiguity?.length) return undefined;
    return { agebon, gloss, english, constructions: result.constructions ?? [], roots: lineRoots(result) };
  } catch {
    return undefined;
  }
}

export function createVoice(tables: ClassifyTables, spelled: Record<string, string> = {}): Voice {
  const index = seriesGlossIndex(tables);
  const indexed = new Set<string>();
  const learn = (root: string) => {
    if (indexed.has(root)) return;
    indexed.add(root);
    indexRootForms(index, root, tables);
  };
  return {
    index,
    learn,
    leaf(pos, root, ending) {
      learn(root);
      const surface = `${pos}${root}${ending}`;
      const words = parseWords(surface);
      if (words.length !== 1) throw new Error(`not one word: ${surface}`);
      return morphGlossFor(classify(words[0]!, tables), tables, {});
    },
    say(gloss, english) {
      let agebon = spelled[gloss];
      if (agebon === undefined) {
        try {
          agebon = glossToAgebon(gloss, tables, index);
        } catch {
          return undefined;
        }
      }
      return checkLine(/[.?!]$/.test(agebon) ? agebon : `${agebon}.`, gloss, english, tables);
    },
  };
}
