/**
 * Planted errors, for scoring `--verify` (scripts/english-helper-recall.ts): drafts that differ
 * from a correct answer in one word, each a mistake `--verify` should flag.
 *
 *   side        a word whose root the English suggested, on the other side's ending (-l ↔ -m)
 *   alias-side  a word the English reached only through an alias, on the other side's ending
 *   row-ending  a word a grammar row spells, with the other ending
 *
 * Only words `--verify` passes on the correct answer are planted as `side` or `row-ending`, so a
 * flag on the draft comes from the planted change.
 */
import type { Verified, WordSense } from "./verify.js";

export const PLANT_KINDS = ["side", "alias-side", "row-ending"] as const;
export type PlantKind = (typeof PLANT_KINDS)[number];
export type Plant = { kind: PlantKind; draft: string; from: string; to: string; side: WordSense["side"]; english?: string };

const ENDING = { concrete: "l", abstract: "m" } as const;

function plantKind(w: WordSense): PlantKind | undefined {
  if (w.check === "alias") return "alias-side";
  if (w.check) return undefined;
  return w.row ? "row-ending" : "side";
}

/** One draft per word of the answer that can carry a planted error. */
export function plantErrors(agebon: string, words: readonly WordSense[]): Plant[] {
  const out: Plant[] = [];
  const seen = new Set<string>();
  for (const w of words) {
    const kind = plantKind(w);
    if (!kind || seen.has(w.raw) || !w.raw.endsWith(ENDING[w.side])) continue;
    seen.add(w.raw);
    const to = `${w.raw.slice(0, -1)}${w.side === "concrete" ? ENDING.abstract : ENDING.concrete}`;
    const at = new RegExp(`(?<![a-z])${w.raw}(?![a-z])`);
    if (!at.test(agebon)) continue;
    out.push({ kind, draft: agebon.replace(at, to), from: w.raw, to, side: w.side, ...(w.english ? { english: w.english } : {}) });
  }
  return out;
}

/**
 * Whether `--verify` flags the planted word: the lexicon check rejects it, or its sense line has a
 * check. Undefined when the draft does not parse or the word did not move to the other side, so
 * the plant says nothing about the sense check.
 */
export function plantFlagged(v: Verified, plant: Plant): boolean | undefined {
  if (v.error) return undefined;
  if (v.unknown.some((u) => u.raw === plant.to)) return true;
  const word = v.words?.find((w) => w.raw === plant.to);
  if (word && word.side === plant.side) return undefined;
  return !!word?.check;
}
