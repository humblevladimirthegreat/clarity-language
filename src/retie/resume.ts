import type { Ending, MorphWord, MorphWordFamily } from "../parse/types.js";

/**
 * How the old spellings read a word. A content **-r** spells its antecedent's whole stem
 * ([pronouns.md](../../docs/grammar/pronouns.md#resume-r)), so it respells exactly like its root.
 */
export type ResumeScope = {
  /** The shape the classifier reads under the old spellings (a lateral the word grammar saw as a sake). */
  reshape?: (word: MorphWord) => MorphWord;
};

type StemWord = {
  ending?: Ending;
  family: MorphWordFamily;
};

/** Roots a later `-r` can point back to (skip resume words themselves). */
export function antecedentStemRoots(word: StemWord): string[] {
  if (word.ending === "r") {
    return [];
  }
  return contentStemRoots(word);
}

export function contentStemRoots(word: StemWord): string[] {
  const family = word.family;
  if (family.kind === "content") return family.roots;
  if (family.kind === "x" && family.xFamily === "compound") {
    return [...family.leftRoots, ...(family.rightRoots ?? [])];
  }
  if (family.kind === "x" && family.xFamily === "numeric") return family.leftRoots;
  return [];
}
