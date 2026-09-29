/**
 * Pronunciation echo metric (docs/proposals/echo-metric.md): how well a root echoes a label, 0–1.
 * The CLI lives in scripts/echo-metric.ts.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseCsv } from "./csv.ts";
import { CMU_PATH } from "./cmu-dict.ts";
import { PHONEME_MAP } from "./pronunciation-map.ts";
import { REPO_ROOT } from "./repo-paths.ts";

const PRON = join(REPO_ROOT, "tmp", "echo-pron", "pron.csv");

export type Weights = {
  /** First consonant of the word. */ start: number;
  /** First consonant of the primary-stress syllable. */ stressOnset: number;
  /** First consonant of any other syllable, and later consonants of any onset cluster. */ onset: number;
  /** Syllable-final consonant. */ coda: number;
  /** Multiplier per English consonant skipped between two matched root consonants. */ decay: number;
  /** Primary-stress vowel. */ vStress: number;
  /** Any other vowel except unstressed AH0 (which counts 0). */ vOther: number;
};
/** Tuned against tmp/echo-pron/ratings.csv (ρ 0.73 → 0.78): codas stay below onsets (editor), stronger decay, vowels halved. */
export const WEIGHTS: Weights = { start: 3, stressOnset: 2, onset: 1, coda: 0.75, decay: 0.4, vStress: 0.5, vOther: 0.25 };

/** A phoneme with its Agazan letter and its role in the metric. */
type Seg = { letter: string; vowel: boolean; kind: "start" | "stressOnset" | "onset" | "coda" | "vStress" | "vOther" | "schwa" };

/** Word-initial consonant clusters found at the start of ≥ 20 CMU words (drops loans such as *ts-*, *vl-*). */
let onsets: Set<string> | undefined;
function legalOnsets(): Set<string> {
  if (onsets) return onsets;
  const counts = new Map<string, number>();
  for (const line of readFileSync(CMU_PATH, "utf8").split("\n")) {
    const phones = line.replace(/\s*#.*$/, "").trim().split(/\s+/).slice(1);
    const k = phones.findIndex((p) => /\d$/.test(p));
    if (k <= 0) continue;
    const cluster = phones.slice(0, k).join(" ");
    counts.set(cluster, (counts.get(cluster) ?? 0) + 1);
  }
  return (onsets = new Set([...counts].filter(([, n]) => n >= 20).map(([c]) => c)));
}

/**
 * Split one word's phonemes into syllables (a consonant cluster between vowels goes to the next
 * syllable as far as English allows it at the start of a word) and label each segment.
 * A cluster's first consonant gets the syllable's onset weight; the rest get `onset`.
 */
function segment(phones: string[], firstWord: boolean): Seg[] {
  const vowelIdx = phones.flatMap((p, i) => (/\d$/.test(p) ? [i] : []));
  const kinds: Seg["kind"][] = phones.map((p) => (p === "AH0" ? "schwa" : p.endsWith("1") ? "vStress" : /\d$/.test(p) ? "vOther" : "coda"));
  const markOnset = (from: number, to: number) => {
    // phones[from..to) is the onset of the syllable whose vowel is phones[to].
    for (let i = from; i < to; i++) {
      const lead = i === from;
      const vowel = phones[to];
      if (!vowel) throw new Error("syllable has no vowel");
      kinds[i] = lead && from === 0 && firstWord ? "start" : lead && vowel.endsWith("1") ? "stressOnset" : "onset";
    }
  };
  const firstVowelAt = vowelIdx[0];
  if (firstVowelAt !== undefined) markOnset(0, firstVowelAt);
  for (let v = 1; v < vowelIdx.length; v++) {
    const prev = vowelIdx[v - 1];
    const next = vowelIdx[v];
    if (prev === undefined || next === undefined) continue;
    const a = prev + 1;
    const b = next;
    let from = b;
    for (let s = a; s < b; s++) if (legalOnsets().has(phones.slice(s, b).join(" "))) { from = s; break; }
    markOnset(from, b);
  }
  return phones.map((p, i) => {
    const letter = PHONEME_MAP[p.replace(/\d$/, "")];
    if (!letter) throw new Error(`unmapped phoneme ${p}`);
    const kind = kinds[i];
    if (!kind) throw new Error(`unlabeled phoneme ${p}`);
    return { letter, vowel: /\d$/.test(p), kind };
  });
}

/** Raw score of `root` (V C V or V C V C V) against segments; `null` letters in the root match anything (the ceiling). */
function raw(root: (string | null)[], segs: Seg[], w: Weights): number {
  const weight = (s: Seg) => w[s.kind === "schwa" ? "vOther" : s.kind] * (s.kind === "schwa" ? 0 : 1);
  // A missing root letter is not a wildcard: only an explicit null (the ceiling) matches anything.
  const eq = (r: string | null | undefined, s: Seg) => r !== undefined && (r === null || r === s.letter);
  const cons = segs.flatMap((s, i) => (s.vowel ? [] : [i]));
  const consAt = (k: number): Seg => {
    const index = cons[k];
    const seg = index === undefined ? undefined : segs[index];
    if (!seg) throw new Error("consonant segment missing");
    return seg;
  };
  const vowelAfter = (i: number) => segs.slice(i + 1).find((s) => s.vowel);
  const vowelCredit = (r: string | null | undefined, s: Seg | undefined) => (s && eq(r, s) ? weight(s) : 0);
  const firstVowel = segs.find((s) => s.vowel);
  let best = 0;
  const c2s = root.length === 5 ? [-1, ...cons.keys()] : [-1];
  for (const k1 of [-1, ...cons.keys()]) {
    const m1 = k1 >= 0 && eq(root[1], consAt(k1));
    if (k1 >= 0 && !m1) continue;
    let pts = vowelCredit(root[0], firstVowel);
    if (m1) pts += weight(consAt(k1)) + vowelCredit(root[2], vowelAfter(cons[k1]!));
    let add2 = 0;
    for (const k2 of c2s) {
      if (k2 < 0 || k2 <= k1 || !eq(root[3], consAt(k2))) continue;
      const decay = m1 ? w.decay ** (k2 - k1 - 1) : 1;
      add2 = Math.max(add2, weight(consAt(k2)) * decay + vowelCredit(root[4], vowelAfter(cons[k2]!)));
    }
    best = Math.max(best, pts + add2);
  }
  return best;
}

/**
 * Echo of `root` against a label's CMU phonemes (`|` between words), 0–1: the best of the joined
 * label and each word, each divided by the best score any root of that length could get for it.
 */
export function echo(root: string, cmu: string, w: Weights = WEIGHTS): number {
  const words = cmu.split("|").map((s) => s.trim().split(/\s+/).filter(Boolean));
  const candidates = [words.flatMap((p, i) => segment(p, i === 0))];
  if (words.length > 1) candidates.push(...words.map((p) => segment(p, true)));
  const letters = [...root];
  const wild = letters.map(() => null);
  return Math.max(...candidates.map((segs) => {
    const ceiling = raw(wild, segs, w);
    return ceiling ? raw(letters, segs, w) / ceiling : 0;
  }));
}

/** concrete label → CMU phonemes, from pron.csv. */
export function loadPron(): Map<string, string> {
  if (!existsSync(PRON)) throw new Error(`${PRON} missing: run node scripts/echo-pronunciation.ts`);
  return new Map(parseCsv(readFileSync(PRON, "utf8")).rows.flatMap((r) => (
    r.concrete && r.cmu ? [[r.concrete, r.cmu] as const] : []
  )));
}
