/**
 * Lists for the realizer (docs/meta/realizer.md#canonical-choices): a `list` term as its members, then one join word
 * that closes the fence (joins.md#right-close), then the words every member shares (list-structure.md#shared-after-the-join).
 * The join's word is written from the list's `values.series` and `values.ending`; a list with no members is the
 * standalone join (joins.md#standalone-phrase).
 */
import type { MeaningDetail, MeaningFrame, MeaningTerm } from "./meaning.js";
import { Unrealized } from "./terms.js";
import type { Ending } from "./words.js";

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

/**
 * Each join series' job in a morph gloss (glosses.md#round-trip), and the standalone job where a join with no items has
 * its own (*none*, *no*, *everything*). The realizer writes the label itself, as it does a number's, so it imports no
 * glosser table; `spell` keeps only a line that glosses back to it, so a label that drifts fails the round trip.
 */
const JOB: Record<string, string> = {
  a: "and",
  o: "rank/more",
  ao: "in-order",
  u: "not",
  ua: "everything-but",
  uo: "rank/less",
  e: "or-exactly-one",
  ae: "and/or",
  oe: "equal-rank",
  ue: "anything-but",
};
const STANDALONE_JOB: Record<string, string> = { a: "none", e: "no-options", u: "no", ua: "everything" };

/** How a realized list writes its parts: `standalone` false writes a join with no items by its listed job. */
export type ListStyle = { standalone: boolean };

/** The join word's leaf under `pos`: its series' job, `.open` on **-m** (an open `e` is *or*), `.named` on **-n**. */
export function joinLeaf(values: Record<string, string>, pos: string, standalone: boolean): string {
  const { series, ending } = values;
  const job = (series && standalone ? STANDALONE_JOB[series] : undefined) ?? (series ? JOB[series] : undefined);
  if (!job || !series) throw noRule(`a join of series ${series ?? "?"}`);
  if (ending === "l") return `${pos}-${job}`;
  if (ending === "m") return `${pos}-${series === "e" ? "or" : job}.open`;
  throw noRule(`a join on -${ending ?? "?"}`);
}

/** A list-reach frame the join word itself brings: keyed by the join's series, with the join's values and nothing else. */
function ownFrame(frame: MeaningFrame, values: Record<string, string>): boolean {
  if (frame.key !== `joinSeries:${values.series}` || frame.party || frame.content || frame.hosted || frame.inner?.length || frame.details?.length) return false;
  const keys = Object.keys(frame.values);
  return keys.length === Object.keys(values).length && keys.every((k) => frame.values[k] === values[k]);
}

/** What writes one member under the list's role letter: a role term, a verb or a predicate word. */
export type MemberWriter = (member: MeaningTerm, ending: Ending | undefined) => string;

/**
 * A list term's gloss unit: `[members | join | shared words]`. `ending` is the first member's, from the list's
 * new-member frame; a later unnamed member has no ending in the view, a `missingValue` gap.
 */
export function listGloss(
  term: Extract<MeaningTerm, { kind: "list" }>,
  pos: string,
  ending: Ending | undefined,
  member: MemberWriter,
  shared: (detail: MeaningDetail) => string,
  style: ListStyle,
): string {
  // A `u` join's denial reaches only its items (joins.md#negation-u): the join's own frame, which its word writes.
  const other = (term.frames ?? []).filter((frame) => !ownFrame(frame, term.values));
  if (other.length) throw noRule(`a list with the frame ${other[0]!.key}`);
  if (term.bound) throw noRule("a hooked join's bound");
  // A fence of several parts closes each with its own join; the view keeps only the last one's values.
  if (term.parts.length > 1) throw noRule("a list of several fences");
  // Only the first unnamed member's ending is in the view; a later one gets none, and its writer says so.
  let first = true;
  const members = term.members.map((m) => {
    const needs = m.kind === "thing" && !m.named;
    const own = needs && first ? ending : undefined;
    if (needs) first = false;
    return member(m, own);
  });
  const sharedWords = (term.sharedDetails ?? []).map((detail) => {
    if (detail.values.role !== "kind") throw noRule(`a shared ${detail.values.role ?? detail.key}`);
    return shared(detail);
  });
  const join = joinLeaf(term.values, pos, style.standalone && !members.length);
  const pieces = [...members, join, ...sharedWords];
  return pieces.length === 1 ? pieces[0]! : `[${pieces.join(" | ")}]`;
}
