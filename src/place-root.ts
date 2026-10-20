/**
 * Place-name roots (phonology.md#place-name-roots): a country or territory row's root echoes the
 * English name instead of taking a root tail. It may hold consonant clusters; a root with none is
 * at least seven letters and ends in `n` + a vowel, so it never looks like a three- or five-letter root.
 * The shape check lives in src/root-shape.ts so the browser parser can share it.
 */
export { isPlaceRootShape } from "./root-shape.ts";

/** CMU phoneme → Egabon letters. Seam letters (`x`, `th`) never occur, and diphthongs keep their glide. */
const PLACE_MAP: Record<string, string> = {
  P: "b", B: "b", T: "d", D: "d", K: "g", G: "g", F: "v", V: "v",
  S: "z", Z: "z", SH: "z", ZH: "z", CH: "z", JH: "z", TH: "d", DH: "d",
  HH: "h", W: "w", Y: "y", M: "m", N: "n", NG: "n", L: "l", R: "r",
  AA: "a", AE: "a", AH: "a", AY: "ay", AW: "aw",
  EH: "e", EY: "ey", IH: "e", IY: "e", ER: "er",
  AO: "o", OW: "o", OY: "oy", UH: "u", UW: "u",
};

const VOWEL = /[aeou]/;
const CLUSTER = /[^aeou]{2}/;

function lastVowel(s: string): string {
  return [...s].reverse().find((c) => VOWEL.test(c)) ?? "a";
}

/** The place-name root for a CMU pronunciation (`|` between words, which run together). */
export function placeRoot(cmu: string): string {
  const phones = cmu.split(/\s+/).filter((p) => p && p !== "|");
  if (phones.length === 0) throw new Error("a place-name root needs a pronunciation");
  let s = phones.map((p) => {
    const letters = PLACE_MAP[p.replace(/\d$/, "")];
    if (!letters) throw new Error(`unmapped phoneme ${p}`);
    return letters;
  }).join("");
  // A doubled letter is said once.
  s = s.replace(/(.)\1+/g, "$1");
  // A root starts with a vowel: echo the first one.
  if (!VOWEL.test(s[0]!)) s = (s.match(VOWEL)?.[0] ?? "a") + s;
  // A root ends in a vowel, so the ending stays the last consonant.
  if (!VOWEL.test(s.at(-1)!)) s += lastVowel(s);
  // Two vowels in a row take a glide: `w` beside `u` or `o`, `y` otherwise.
  s = s.replace(/([aeou])(?=([aeou]))/g, (_, v: string, next: string) => v + ("uo".includes(v) || "uo".includes(next) ? "w" : "y"));
  // **-l** / **-m** + `r` is the numeric-derivation seam: split it with the vowel that follows.
  s = s.replace(/([lm])(r)([aeou])/g, "$1$3$2$3");
  // With no cluster the root would look native: give it the place tail, `n` + its last vowel.
  if (!CLUSTER.test(s)) {
    while (!(s.length >= 7 && s.at(-2) === "n")) s += "n" + s.at(-1);
  }
  return s;
}
