import { contentMatch, letterPrefix } from "../parse/resolve.js";
import type { Ending, MorphWord, MorphWordFamily } from "../parse/types.js";

/** File / span context so `-r` follows the antecedent, not a colliding mapped prefix. */
export type ResumeScope = {
  /** Content roots of non-resume words in the same document. */
  stems: ReadonlySet<string>;
  /** Antecedent roots from parser bind in this code span, when known. */
  boundAntecedentRoots?: readonly string[];
  /**
   * Parser bind for a resume nested in a writing-span payload (`th(zazar …)`), by its spelling.
   * Each call consumes the next bind for that spelling, in text order.
   */
  boundFor?: (raw: string) => readonly string[] | undefined;
  /** Content roots in page order, so an unbound resume follows the nearest earlier match. */
  occurrences?: readonly StemOccurrence[];
  /** Where the resume sits in the page. */
  at?: number;
  /**
   * True when an **-r** word is a closed overlay (evidence-strength weak, hold, changeability)
   * under the old spellings: only its root moves; it is not rebuilt as a resume.
   */
  isOverlay?: (word: MorphWord) => boolean;
  /** The shape the classifier reads under the old spellings (a lateral the word grammar saw as a sake). */
  reshape?: (word: MorphWord) => MorphWord;
};

export type StemOccurrence = { root: string; index: number };

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

/**
 * Longer same-file stem this short resume prefixes, if any.
 * Prefers the longest letter-match so `aha`+`-r` after `ahabe` stays Ahaben
 * when `uhu` is also a mapped published root.
 */
export function pickResumeAntecedent(
  pronounRoots: readonly string[],
  stems: ReadonlySet<string>,
  near?: { occurrences: readonly StemOccurrence[]; at: number },
): string[] | null {
  const chosen: string[] = [];
  let foundLonger = false;
  for (const root of pronounRoots) {
    // The nearest earlier word on the page that this short stem cuts, as a reader would bind it.
    let nearest: StemOccurrence | undefined;
    for (const o of near?.occurrences ?? []) {
      if (o.index >= near!.at) break;
      if (contentMatch(root, o.root) === "letter") nearest = o;
    }
    if (nearest) {
      foundLonger = true;
      chosen.push(nearest.root);
      continue;
    }
    const longer: string[] = [];
    for (const stem of stems) {
      if (contentMatch(root, stem) === "letter") {
        longer.push(stem);
      }
    }
    if (longer.length > 0) {
      foundLonger = true;
      longer.sort((a, b) => b.length - a.length || a.localeCompare(b));
      chosen.push(longer[0]!);
    } else {
      chosen.push(root);
    }
  }
  return foundLonger ? chosen : null;
}

export function mappedResumeRoots(
  pronounRoots: readonly string[],
  antecedentRoots: readonly string[],
  map: ReadonlyMap<string, string>,
): string[] {
  return pronounRoots.map((root, index) => {
    const matched =
      antecedentRoots.find((stem) => contentMatch(root, stem) != null) ??
      antecedentRoots[index] ??
      root;
    const mapped = map.get(matched) ?? matched;
    // Keep the resume's kind. A two-syllable root's short cut is the whole root (`eje` → `vejer`),
    // so test the cut, not equality: the rebuilt short resume is cut from the new root.
    return root === letterPrefix(matched) ? letterPrefix(mapped) : mapped;
  });
}

export function resumeAntecedentRoots(
  pronounRoots: readonly string[],
  scope: ResumeScope | undefined,
  raw?: string,
): string[] | null {
  if (!scope) {
    return null;
  }
  if (scope.boundAntecedentRoots && scope.boundAntecedentRoots.length > 0) {
    return [...scope.boundAntecedentRoots];
  }
  const bound = raw ? scope.boundFor?.(raw) : undefined;
  if (bound && bound.length > 0) {
    return [...bound];
  }
  const near = scope.occurrences && scope.at !== undefined ? { occurrences: scope.occurrences, at: scope.at } : undefined;
  return pickResumeAntecedent(pronounRoots, scope.stems, near);
}

export function isContentResume(word: MorphWord): boolean {
  return word.ending === "r" && word.family.kind === "content";
}
