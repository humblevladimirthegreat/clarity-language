/**
 * Agebon root letter inventory and root shape, with no Node dependencies so the browser parser can use it.
 */

/** Agebon root vowels (phonology inventory). */
export const AGEBON_VOWELS = ["a", "e", "o", "u"] as const;

/**
 * Agebon root consonants. The glide is `y`. Mid-word `x` is never a root letter.
 */
export const AGEBON_CONSONANTS = [
  "b",
  "d",
  "g",
  "v",
  "z",
  "m",
  "n",
  "h",
  "w",
  "y",
  "l",
  "r",
] as const;

/**
 * Whether `root` is a legal place-name root (singability.md#place-name-roots): a vowel first and last,
 * consonant runs between single vowels, no **-l** / **-m** + `r` seam, and either a cluster or at least
 * seven letters ending in `n` + a vowel.
 */
export function isPlaceRootShape(root: string): boolean {
  if (!/^[aeou]([bdgvzmnhwylr]+[aeou])+$/.test(root) || /[lm]r/.test(root)) return false;
  return /[^aeou]{2}/.test(root) || (root.length >= 7 && root.at(-2) === "n");
}

/** A published root of either shape: ordinary V(CV)+ or a place-name root. */
export function isAnyRootShape(root: string): boolean {
  return isAgebonRootShape(root) || isPlaceRootShape(root);
}

/**
 * Whether `root` is a legal ordinary content root: V(CV)+ using the phonology letter inventory.
 */
export function isAgebonRootShape(root: string): boolean {
  if (root.length === 0 || root.length % 2 === 0) {
    return false;
  }
  for (let i = 0; i < root.length; i++) {
    const ch = root[i]!;
    if (i % 2 === 0) {
      if (!(AGEBON_VOWELS as readonly string[]).includes(ch)) {
        return false;
      }
    } else if (!(AGEBON_CONSONANTS as readonly string[]).includes(ch)) {
      return false;
    }
  }
  return true;
}
