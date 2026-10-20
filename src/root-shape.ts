/**
 * Egabon root letter inventory and root shape, with no Node dependencies so the browser parser can use it.
 */

/** Egabon root vowels (phonology inventory). */
export const EGABON_VOWELS = ["a", "e", "o", "u"] as const;

/**
 * Egabon root consonants. The glide is `y`. Mid-word `x` is never a root letter.
 */
export const EGABON_CONSONANTS = [
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
export function isEgabonRootShape(root: string): boolean {
  if (root.length === 0 || root.length % 2 === 0) {
    return false;
  }
  for (let i = 0; i < root.length; i++) {
    const ch = root[i]!;
    if (i % 2 === 0) {
      if (!(EGABON_VOWELS as readonly string[]).includes(ch)) {
        return false;
      }
    } else if (!(EGABON_CONSONANTS as readonly string[]).includes(ch)) {
      return false;
    }
  }
  return true;
}
