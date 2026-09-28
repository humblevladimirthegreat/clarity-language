/**
 * Agalan root letter inventory and root shape, with no Node dependencies so the browser parser can use it.
 */

/** Agalan root vowels (phonology inventory). */
export const CLARITY_VOWELS = ["a", "e", "o", "u"] as const;

/**
 * Agalan root consonants. The glide is `y`. Mid-word `x` is never a root letter.
 */
export const CLARITY_CONSONANTS = [
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
 * Whether `root` is a legal ordinary content root: V(CV)+ using the phonology letter inventory.
 */
export function isClarityRootShape(root: string): boolean {
  if (root.length === 0 || root.length % 2 === 0) {
    return false;
  }
  for (let i = 0; i < root.length; i++) {
    const ch = root[i]!;
    if (i % 2 === 0) {
      if (!(CLARITY_VOWELS as readonly string[]).includes(ch)) {
        return false;
      }
    } else if (!(CLARITY_CONSONANTS as readonly string[]).includes(ch)) {
      return false;
    }
  }
  return true;
}
