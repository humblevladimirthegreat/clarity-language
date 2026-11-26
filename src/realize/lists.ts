/**
 * Lists for the realizer (docs/meta/realizer.md#canonical-choices): a `list` term as its members, then one join word
 * that closes the fence (joins.md#right-close), then the words every member shares (list-structure.md#shared-after-the-join).
 * The join's word is written from the list's `values.series` and `values.ending`; a list with no members is the
 * standalone join (joins.md#standalone-phrase).
 */
import type { MeaningDetail, MeaningFrame, MeaningTerm } from "./meaning.js";
import { attempt, PLACEHOLDER, skip, Unrealized } from "./gaps.js";
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

/**
 * A hooked join's hook (hooked-joins.md#hooked-joins-hooks), by the free hook's spelling the reader records in the
 * join's `values.hook`: its extra-noun job, `-l` the exact relation and `-m` the zone. The point-back hooks on `r` take
 * no `bl-` word, and their landmark is not in the view's bound, so they have no row.
 */
const HOOK: Record<string, string> = {
  al: "in",
  am: "amid",
  ael: "on",
  aem: "over",
  el: "at",
  em: "near",
  oel: "toward",
  oem: "in-the-direction-of",
  ul: "from",
  um: "away-from",
  ual: "out-of",
  uam: "out-from-among",
  uel: "through",
  uem: "by-way-of",
  ol: "for",
  om: "used-by",
  aol: "using",
  aom: "by",
  uol: "against",
  uom: "contrary-to",
};

/**
 * How a realized list writes its parts: `standalone` false writes a join with no items by its listed job; a list in
 * `respectively` takes `w-respectively` right before its join (list-structure.md#respectively); a term in `tags` takes
 * its tag right after it (tag-pronouns.md#naming-with-a-tag).
 */
export type ListStyle = {
  standalone: boolean;
  respectively?: ReadonlySet<MeaningTerm>;
  /** The claim's assigning tags by the term each names (tags.ts); a term's writer takes its tag out when it writes it. */
  tags?: Map<MeaningTerm, string>;
};

/**
 * The join word's leaf under `pos`: its series' job, `.open` on **-m** (an open `e` is *or*), `.named` on **-n**; a
 * hooked join's hook before the seam (`z-at-x-everything`, hooked-joins.md#hooked-joins).
 */
export function joinLeaf(values: Record<string, string>, pos: string, standalone: boolean): string {
  const { series, ending, hook } = values;
  const job = (series && standalone ? STANDALONE_JOB[series] : undefined) ?? (series ? JOB[series] : undefined);
  if (!job || !series) throw noRule(`a join of series ${series ?? "?"}`);
  const front = hookFront(pos, hook);
  if (ending === "l") return `${front}-${job}`;
  if (ending === "m") return `${front}-${series === "e" ? "or" : job}.open`;
  throw noRule(`a join on -${ending ?? "?"}`);
}

/** A join's front: its letter, with a hooked join's hook before the seam (`z-at-x`, hooked-joins.md#hooked-joins). */
export function hookFront(pos: string, hook: string | undefined): string {
  if (hook === undefined) return pos;
  if (!HOOK[hook]) throw noRule(`a hooked join on the hook ${hook}`);
  return `${pos}-${HOOK[hook]}-x`;
}

/** A list-reach frame the join word itself brings: keyed by the join's series, with the join's values and nothing else. */
function ownFrame(frame: MeaningFrame, values: Record<string, string>): boolean {
  if (frame.key !== `joinSeries:${values.series}` || frame.party || frame.content || frame.hosted || frame.inner?.length || frame.details?.length) return false;
  const keys = Object.keys(frame.values);
  return keys.length === Object.keys(values).length && keys.every((k) => frame.values[k] === values[k]);
}

/** What writes one member under the list's role letter: a role term, a verb or a predicate word. */
export type MemberWriter = (member: MeaningTerm, ending: Ending | undefined) => string;

/** What writes the list's other words: a SHARED word after the join, and a hooked join's landmark as a `bl-` word. */
export type ListWriters = { member: MemberWriter; shared: (detail: MeaningDetail) => string; landmark: (term: MeaningTerm) => string };

/**
 * A hooked join's bound (hooked-joins.md#hooked-joins): the hook rides in the join word (`joinLeaf`, from the list's
 * `values.hook`), and the landmark is the `bl-` word right after it.
 */
function boundLandmark(bound: MeaningDetail, writers: ListWriters): string {
  if (!bound.hosted) throw noRule("a hooked join that points back");
  if (bound.details?.length || bound.frames?.length || bound.content) throw noRule("a hooked join's bound with its own detail");
  return writers.landmark(bound.hosted);
}

/**
 * A SHARED word after the join (list-structure.md#shared-after-the-join): the kind every member is (`zual godozel`), or
 * a word that describes each member (`distribute`: a `/ɡ/` after a noun join, an `/h/` after a verb join). A built
 * word has no plain root in the view: a `missingValue` gap.
 */
function sharedWord(detail: MeaningDetail, writers: ListWriters): string {
  const role = detail.values.role;
  // A scale (comparatives.md#comparatives) or equative (comparatives.md#equatives) word is the quality a rank join's
  // members are placed on, written after the join as a kind word is.
  if (role !== "kind" && role !== "distribute" && role !== "scale" && role !== "equative") throw noRule(`a shared ${role ?? detail.key}`);
  if ((detail.key === "slot:adj" || detail.key === "unit:h") && !detail.values.root) {
    throw new Unrealized("missingValue", `a shared ${detail.key} that is a built word: the view has no root for it`);
  }
  return writers.shared(detail);
}

/**
 * A list term's gloss unit: `[members | join | shared words]`. `ending` is the first member's, from the list's
 * new-member frame; a later unnamed member has no ending in the view, a `missingValue` gap.
 */
export function listGloss(term: Extract<MeaningTerm, { kind: "list" }>, pos: string, ending: Ending | undefined, writers: ListWriters, style: ListStyle): string {
  const { member } = writers;
  const parts = term.parts.length ? term.parts : [{ members: term.members }];
  const joins = parts.map((part, i) => part.values ?? (i === parts.length - 1 ? term.values : undefined));
  // A `u` join's denial reaches only its items (joins.md#negation-u): the join's own frame, which its word writes.
  const other = (term.frames ?? []).filter((frame) => !joins.some((values) => values && ownFrame(frame, values)));
  for (const frame of other) skip(frame.key, noRule(`a list with the frame ${frame.key}`));
  // A fence of several parts closes each with its own join, the SHARED words of each right after it
  // (list-structure.md#fence-nesting); one part takes the list's own shared words.
  if (joins.some((values, i) => !values && i < parts.length - 1)) throw noRule("a fence with no join before the last");
  const perPart = parts.some((part) => part.shared);
  if (perPart && parts.reduce((n, part) => n + (part.shared?.length ?? 0), 0) !== (term.sharedDetails?.length ?? 0)) {
    throw new Unrealized("missingValue", "a list whose SHARED words are not all on a part");
  }
  // A hooked join's landmark rides right after the join that holds the hook.
  const hooked = joins.findIndex((values) => values?.hook !== undefined);
  // Only the first unnamed member's ending is in the view; a later one gets none, and its writer says so.
  let first = true;
  // Each later fence closes the ones before it, so they are one unit inside it (`[[z-everything | g-cat] | z-not]`).
  const pieces = parts.reduce<string[]>((before, part, i) => {
    const done = before.length > 1 ? [`[${before.join(" | ")}]`] : before;
    return [...done, ...partPieces(part, i)];
  }, []);
  return pieces.length === 1 ? pieces[0]! : `[${pieces.join(" | ")}]`;

  function partPieces(part: (typeof parts)[number], i: number): string[] {
    const members = part.members.map((m) => {
      const needs = m.kind === "thing" && !m.named;
      const own = needs && first ? ending : undefined;
      if (needs) first = false;
      return member(m, own);
    });
    const values = joins[i];
    if (!values) return members;
    const shared = (perPart ? (part.shared ?? []) : i === parts.length - 1 ? (term.sharedDetails ?? []) : []).map((detail) => attempt(detail.key, () => sharedWord(detail, writers), PLACEHOLDER));
    // Only a first fence with no items is the standalone join; a later fence closes the ones before it.
    const join = joinLeaf(values, pos, style.standalone && i === 0 && !members.length);
    const landmark = term.bound && (i === hooked || (hooked < 0 && i === parts.length - 1)) ? [attempt(term.bound.key, () => boundLandmark(term.bound!, writers), PLACEHOLDER)] : [];
    // *Respectively* sits right before the join word of the later list (list-structure.md#respectively).
    const respectively = style.respectively?.has(term) && i === parts.length - 1 ? ["w-respectively"] : [];
    return [...members, ...respectively, join, ...landmark, ...shared];
  }
}
