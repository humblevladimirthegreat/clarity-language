import { contentMatch, letterPrefix } from "../parse/resolve.js";
import type { Ending, MorphWord, MorphWordFamily } from "../parse/types.js";

/** File / span context so `-r` follows the antecedent, not a colliding mapped prefix. */
export type ResumeScope = {
  /** Content roots of non-resume words in the same document. */
  stems: ReadonlySet<string>;
  /** Antecedent roots from parser bind in this code span, when known. */
  boundAntecedentRoots?: readonly string[];
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

/**
 * Longer same-file stem this short resume prefixes, if any.
 * Prefers the longest letter-match so `uhu`+`-r` after `uhubu` stays Uhubun
 * when `uhu` is also a mapped published root.
 */
export function pickResumeAntecedent(
  pronounRoots: readonly string[],
  stems: ReadonlySet<string>,
): string[] | null {
  const chosen: string[] = [];
  let foundLonger = false;
  for (const root of pronounRoots) {
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
    return contentMatch(root, matched) === "letter" ? letterPrefix(mapped) : mapped;
  });
}

export function resumeAntecedentRoots(
  pronounRoots: readonly string[],
  scope: ResumeScope | undefined,
): string[] | null {
  if (!scope) {
    return null;
  }
  if (scope.boundAntecedentRoots && scope.boundAntecedentRoots.length > 0) {
    return [...scope.boundAntecedentRoots];
  }
  return pickResumeAntecedent(pronounRoots, scope.stems);
}

export function isContentResume(word: MorphWord): boolean {
  return word.ending === "r" && word.family.kind === "content";
}
