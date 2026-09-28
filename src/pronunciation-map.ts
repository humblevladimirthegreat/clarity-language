/** CMU phoneme → Agazan letter (docs/proposals/echo-metric.md). Shared by the lookup, the metric, and the converter. */

/**
 * Phoneme → Agazan letter. `x` and `th` never occur in roots, so SH / ZH → h and TH / DH → v.
 * Vowels map by quality; stress is kept on the phoneme for the metric.
 */
export const PHONEME_MAP: Record<string, string> = {
  P: "b", B: "b", T: "d", D: "d", K: "g", G: "g", F: "v", V: "v",
  S: "z", Z: "z", SH: "h", ZH: "h", TH: "v", DH: "v", CH: "h", JH: "h",
  HH: "h", W: "w", Y: "y", M: "m", N: "n", NG: "n", L: "l", R: "r",
  AA: "a", AE: "a", AH: "a", AY: "a", AW: "a",
  EH: "e", EY: "e", IH: "e", IY: "e", ER: "e",
  AO: "o", OW: "o", OY: "o",
  UH: "u", UW: "u",
};

/** Agazan sound string; unstressed AH0 ("uh") is written `·` (never scored against a root); `|` (word break) → space. */
export function toAgazan(phones: string[]): string {
  return phones.map((p) => {
    if (p === "|") return " ";
    if (p === "AH0") return "·";
    const letter = PHONEME_MAP[p.replace(/\d$/, "")];
    if (!letter) throw new Error(`unmapped phoneme ${p}`);
    return p.endsWith("1") ? letter.toUpperCase() : letter;
  }).join("");
}
