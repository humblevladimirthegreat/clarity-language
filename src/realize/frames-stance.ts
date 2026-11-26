/**
 * Stance words for the realizer (knowing.md#may, evidentiality.md#evidentiality): MAY and the channels as `/th/` words,
 * a dated or sourced channel with its `bl-` word right after it, each placed by which framed nouns cover it.
 */

import type { ClassifyTables } from "../parse/classify.js";
import type { MeaningFrame, MeaningReading } from "./meaning.js";
import { landmarkOf, unit, Unrealized } from "./terms.js";

/** The stance frames this file writes: MAY (knowing.md#may) and the channels (evidentiality.md#evidentiality, knowing.md#live-vs-memory). */
const STANCE_WORDS = new Set(["overlay:may:th", "overlay:evidential:th"]);

/** True when the frame is a MAY or channel word with nothing on it but its gloss, ending and a hosted `bl-` word. */
export function isStanceWord(frame: MeaningFrame): boolean {
  if (frame.family !== "stance" || !STANCE_WORDS.has(frame.key)) return false;
  if (frame.party || frame.content || frame.inner?.length || frame.details?.length || frame.occasions || frame.holderHost) return false;
  return Object.keys(frame.values).every((key) => key === "gloss" || key === "ending");
}

/**
 * A MAY or channel word: `th-` and the reader's gloss of its sense, which holds its ending's meaning (`PATTERN.weak`,
 * `MAY-who-knows`, evidentiality.md#evidence-strength, knowing.md#follow-up-endings-may); a hosted source or offset is
 * its `bl-` word right after it (evidentiality.md#source, dated-channel.md#counting-from-now).
 */
export function stanceWordGloss(frame: MeaningFrame, tables: ClassifyTables): string {
  const gloss = frame.values.gloss;
  if (!gloss) throw new Unrealized("missingValue", `a ${frame.key} frame with no gloss`);
  const word = `th-${gloss}`;
  return frame.hosted ? unit([word, landmarkOf(frame.hosted, tables)]) : word;
}

/** Where a stance word goes: `early`, first in the body, or `late`, after the roles and right before the verb. */
export type StancePlace = "early" | "late";

/**
 * A stance word's place (clause.md#stance-th: "place it anywhere"; clause.md#which-covers-which: the earlier word
 * covers the later): `early` when it covers a framed noun (`framed`, frame indices), else `late`, after the roles as
 * the pages write it; a stance word covered by one framed noun and covering another fits neither slot, so it is a gap.
 */
export function stancePlace(view: MeaningReading, index: number, framed: ReadonlySet<number>): StancePlace {
  const pairs = [...view.order.map((p) => [p.over, p.under] as const), ...view.unordered];
  const coveredBy = pairs.some(([over, under]) => under === index && framed.has(over));
  const covers = pairs.some(([over, under]) => over === index && framed.has(under));
  if (coveredBy && covers) throw new Unrealized("noRule", "a stance word between two framed nouns");
  return covers ? "early" : "late";
}

/** The stance words' indices in the order they cover each other; an unordered pair keeps its text order. */
export function stanceOrder(view: MeaningReading, indices: readonly number[]): number[] {
  const set = new Set(indices);
  const rank = new Map(indices.map((i) => [i, 0]));
  for (const pair of view.order) if (set.has(pair.over) && set.has(pair.under)) rank.set(pair.under, rank.get(pair.under)! + 1);
  for (const [a, b] of view.unordered) if (set.has(a) && set.has(b)) rank.set(b, rank.get(b)! + 1);
  return [...indices].sort((a, b) => rank.get(a)! - rank.get(b)! || a - b);
}
