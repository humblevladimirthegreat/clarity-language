/**
 * Stance words for the realizer (knowing.md#may, evidentiality.md#evidentiality): MAY and the channels as `/th/` words,
 * a dated or sourced channel with its `bl-` word right after it, each placed by which framed nouns cover it.
 */

import type { ClassifyTables } from "../parse/classify.js";
import type { MeaningFrame, MeaningReading, MeaningStanceList } from "./meaning.js";
import { joinLeaf } from "./lists.js";
import { landmarkOf, roleTerm, unit, Unrealized } from "./terms.js";

/** The stance frames this file writes: MAY (knowing.md#may) and the channels (evidentiality.md#evidentiality, knowing.md#live-vs-memory). */
const STANCE_WORDS = new Set(["overlay:may:th", "overlay:evidential:th"]);

/**
 * True when the frame is a MAY or channel word with nothing on it but its gloss, ending and a hosted `bl-` word, or a
 * holder on its seam (holder.md#naming-a-holder), whose `-x` the reader copies onto the word as `plural`.
 */
export function isStanceWord(frame: MeaningFrame): boolean {
  if (frame.family !== "stance" || !STANCE_WORDS.has(frame.key)) return false;
  if (frame.party || frame.content || frame.inner?.length || frame.details?.length || frame.occasions) return false;
  return Object.keys(frame.values).every((key) => key === "gloss" || key === "ending" || (key === "plural" && frame.holderHost));
}

/**
 * Each holder frame by the stance frame it sits on (holder.md#naming-a-holder): the `wordShape` pair puts the holder
 * over the channel or MAY word whose seam it joins.
 */
export function holderHosts(view: MeaningReading): Map<number, number> {
  const hosts = new Map<number, number>();
  for (const pair of view.order) {
    if (pair.kind === "wordShape" && view.frames[pair.over]?.family === "holder" && view.frames[pair.under]?.holderHost) hosts.set(pair.under, pair.over);
  }
  return hosts;
}

/**
 * A holder's label on its seam (holder.md#naming-a-holder): the noun for that person as a subject would be written,
 * without its role letter (`Azozon`, `←Azozon`, `person-x`, `ONE`).
 */
export function holderLabel(holder: MeaningFrame, tables: ClassifyTables): string {
  if (!holder.party) throw new Unrealized("missingValue", "a holder frame with no party");
  const word = roleTerm(holder.party, "z", undefined, tables);
  if (!word.startsWith("z-") || /[\s|[\]]/.test(word)) throw new Unrealized("noRule", "a holder that is more than one word");
  return word.slice(2);
}

/**
 * A MAY or channel word: `th-` and the reader's gloss of its sense, which holds its ending's meaning (`PATTERN.weak`,
 * `MAY-who-knows`, evidentiality.md#evidence-strength, knowing.md#follow-up-endings-may); a hosted source or offset is
 * its `bl-` word right after it (evidentiality.md#source, dated-channel.md#counting-from-now).
 */
export function stanceWordGloss(frame: MeaningFrame, tables: ClassifyTables, holder?: MeaningFrame): string {
  const gloss = frame.values.gloss;
  if (!gloss) throw new Unrealized("missingValue", `a ${frame.key} frame with no gloss`);
  if (frame.holderHost && !holder) throw new Unrealized("missingValue", "a holder seam with no holder frame");
  const word = holder ? `th-${gloss}-${holderLabel(holder, tables)}` : `th-${gloss}`;
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
  const pairs = coverPairs(view);
  const coveredBy = pairs.some(([over, under]) => under === index && framed.has(over));
  const covers = pairs.some(([over, under]) => over === index && framed.has(under));
  if (coveredBy && covers) throw new Unrealized("noRule", "a stance word between two framed nouns");
  return covers ? "early" : "late";
}

/** The stance words' indices in the order they cover each other; an unordered pair keeps its text order. */
export function stanceOrder(view: MeaningReading, indices: readonly number[]): number[] {
  const set = new Set(indices);
  const rank = new Map(indices.map((i) => [i, 0]));
  for (const [a, b] of coverPairs(view)) if (set.has(a) && set.has(b)) rank.set(b, rank.get(b)! + 1);
  return [...indices].sort((a, b) => rank.get(a)! - rank.get(b)! || a - b);
}

/**
 * The reading's ordered and unordered frame pairs, with a holder counted as the stance word it is written in
 * (holder.md#naming-a-holder) and the pair that joins them left out.
 */
function coverPairs(view: MeaningReading): (readonly [number, number])[] {
  const inWord = new Map([...holderHosts(view)].map(([host, holder]) => [holder, host]));
  const word = (index: number): number => inWord.get(index) ?? index;
  return [...view.order.map((p) => [p.over, p.under] as const), ...view.unordered]
    .map(([over, under]) => [word(over), word(under)] as const)
    .filter(([over, under]) => over !== under);
}

/**
 * A stance list (verb-and-stance-joins.md#stance-joins): its stance words, then its `/th/` join right after them, with
 * nothing between (verb-and-stance-joins.md#stance-join-reach). The join's polarity frame is the join word itself.
 * Each member's index in `frames` goes into `members`, so the claim does not write it again.
 */
export function stanceListGloss(view: MeaningReading, list: MeaningStanceList, tables: ClassifyTables, members: Set<number>): string {
  if (list.details?.length) throw new Unrealized("noRule", "a stance list with a /w/ word before its join");
  if (list.inner?.some((frame) => frame.key !== list.key || frame.family !== "polarity")) throw new Unrealized("noRule", "a stance list with a frame on its join");
  const words = list.members.map((member) => {
    const index = "family" in member ? view.frames.indexOf(member) : -1;
    if (index < 0 || !isStanceWord(member as MeaningFrame)) throw new Unrealized("noRule", "a stance list member that is not a MAY or channel word");
    members.add(index);
    return stanceWordGloss(member as MeaningFrame, tables);
  });
  const own = new Set(members);
  if (coverPairs(view).some(([a, b]) => own.has(a) !== own.has(b))) throw new Unrealized("noRule", "a stance list ordered against another frame");
  return unit([...words, joinLeaf(list.values, "th", false)]);
}

/** True when the frame is a standalone stance join (verb-and-stance-joins.md#standalone-stance-joins): `thul`, *no judgment*. */
export function isStandaloneJoin(frame: MeaningFrame): boolean {
  return frame.family === "polarity" && frame.key === "joinSeries:u:standalone";
}

/**
 * A standalone stance join, written last in the body as the page writes it (`zazozon vowurol thul`), after the verb,
 * so no stance word stands right before it (verb-and-stance-joins.md#stance-join-reach). Written last, it covers
 * nothing, so a join the reading has covering another frame is a gap.
 */
export function standaloneJoinGloss(view: MeaningReading, index: number): string {
  if (coverPairs(view).some(([over]) => over === index)) throw new Unrealized("noRule", "a standalone stance join that covers another frame");
  return joinLeaf(view.frames[index]!.values, "th", false);
}
