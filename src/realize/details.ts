/**
 * Hooks and relations for the realizer (docs/meta/realizer.md#canonical-choices): a claim detail that hosts a phrase.
 * A range (ranges.md#ranges) and an in-clause hook (in-clause-hooks.md#in-clause) sit between two phrases of one kind,
 * right after the first; an extra-noun hook (extra-noun-hooks.md) is its hook and a `/b/` landmark, an extra noun after
 * the verb; a hosted relation (relations.md, locative-relations.md) is its `/h/` word and a `bl-` landmark, an adverb
 * before the verb. A hook's label is written from the reader's `values.series` and `values.ending`; a relation's from
 * its `values.gloss`.
 */
import type { MeaningDetail, MeaningFrame, MeaningTerm } from "./meaning.js";
import { Unrealized } from "./terms.js";
import type { Ending } from "./words.js";

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

/**
 * Each hook's job in a morph gloss (glosses.md#round-trip), by its vowels and ending. The realizer writes the label
 * itself, as it does a join's (lists.ts), so it imports no glosser table; `spell` keeps only a line that glosses back to
 * it, so a label that drifts fails the round trip.
 */
const SPAN: Record<string, string> = {
  oel: "through",
  oem: "through.approx",
  oen: "through.named",
  oer: "some.through",
  uel: "through-excluding",
  uem: "through-excluding.approx",
  uen: "through-excluding.named",
  uer: "some.through-excluding",
  ual: "outside",
  uam: "outside.approx",
  uan: "outside.named",
  uar: "some.outside",
  uol: "strictly-between",
  uom: "strictly-between.approx",
  uon: "strictly-between.named",
  uor: "some.strictly-between",
  aol: "taking-turns",
  aom: "taking-turns.approx",
  aon: "taking-turns.named",
  aor: "some.taking-turns",
};

const IN_CLAUSE: Record<string, string> = {
  al: "including",
  am: "including.open",
  an: "including.named",
  ol: "rather",
  om: "rather.open",
  on: "rather.named",
  el: "instead",
  em: "instead.open",
  en: "instead.named",
  ul: "except",
  um: "except.open",
  un: "except.named",
};

export const EXTRA_NOUN: Record<string, string> = {
  al: "in",
  am: "amid",
  an: "in.named",
  el: "at",
  em: "near",
  en: "at.named",
  ul: "from",
  um: "away-from",
  un: "from.named",
  ol: "for",
  om: "used-by",
  on: "for.named",
  ael: "on",
  aem: "over",
  aen: "on.named",
  oel: "toward",
  oem: "in-the-direction-of",
  oen: "toward.named",
  ual: "out-of",
  uam: "out-from-among",
  uan: "out-of.named",
  uel: "through",
  uem: "by-way-of",
  uen: "through.named",
  aol: "using",
  aom: "by",
  aon: "using.named",
  uol: "against",
  uom: "contrary-to",
  uon: "against.named",
};

/** What writes a detail's parts: a hosted phrase under its role letter, a hook's degree word, a landmark's ending. */
export type DetailWriters = {
  /** A hosted phrase under `part` (`z`, `d`, `b`, `v`), on `ending` where it brings in a new member. */
  phrase: (term: MeaningTerm, part: string, ending: Ending | undefined) => string;
  degree: (detail: MeaningDetail) => string;
  /** The ending a hosted term's new-member frame records. */
  endingOf: (term: MeaningTerm) => Ending | undefined;
};

/**
 * Where the claim's details go: `lead` after the subject and object, `before` right before the verb (adverbs,
 * relations), `after` it (extra nouns), or `attached` right after a part.
 */
export type PlacedDetails = { lead: string[]; before: string[]; after: string[]; attached: Map<string, string[]> };

const unit = (pieces: string[]): string => (pieces.length === 1 ? pieces[0]! : `[${pieces.join(" | ")}]`);

/** A hosted relation (relations.md, locative-relations.md, of-relations.md, join-relations.md): its `/h/` word. */
const isRelation = (detail: MeaningDetail): boolean =>
  detail.key === "lexReading:joinRelation" || (detail.key.startsWith("overlay:") && detail.key.endsWith(":h") && (detail.kind === "place" || detail.kind === "relation"));

/** A hook's label by its job, with its degree words before it (in-clause-hooks.md#hook-w). */
function hookWord(detail: MeaningDetail, table: Record<string, string>, writers: DetailWriters): string {
  const { series, ending, gloss } = detail.values;
  // A same-role word (same-role-words.md) glosses by its own sense, closed on -l and open on -m.
  const label = gloss ? `${gloss}${{ l: ".closed", m: ".open", n: ".named" }[ending ?? ""] ?? ""}` : table[`${series ?? "?"}${ending ?? "?"}`];
  if (!label) throw noRule(`${detail.key} on the hook ${series ?? "?"}${ending ?? "?"}`);
  const degrees = (detail.details ?? []).map((d) => {
    if (d.key !== "slot:w") throw noRule(`${d.key} on ${detail.key}`);
    return writers.degree(d);
  });
  return unit([...degrees, label]);
}

/** A detail's hosted term, or a gap: a hook with nothing hosted, or one with its own frame. */
function hostedOf(detail: MeaningDetail): MeaningTerm {
  if (!detail.hosted) throw noRule(`${detail.key} with no hosted phrase`);
  if (detail.content || detail.frames?.length) throw noRule(`${detail.key} with its own frame`);
  return detail.hosted;
}

/** A landmark as a `bl-` word, the letter of a word that completes the one before it (relations.md). */
function landmark(term: MeaningTerm, writers: DetailWriters): string {
  if (term.kind === "list") throw noRule("a list landmark");
  return writers.phrase(term, "b", writers.endingOf(term)).replace(/^(\[?)b-/, "$1bl-");
}

/**
 * The claim's details, placed: a plain adverb by `adverb`, a relation before the verb, an extra-noun hook after it, and
 * a range or in-clause hook right after the part whose letter its hosted phrase shares (`values.part`).
 */
export function placeDetails(details: readonly MeaningDetail[], adverb: (detail: MeaningDetail) => string, writers: DetailWriters): PlacedDetails {
  const out: PlacedDetails = { lead: [], before: [], after: [], attached: new Map() };
  const extraNouns: string[][] = [];
  for (const detail of details) {
    if (detail.key === "unit:h" || detail.key === "lexReading:number") {
      out.before.push(adverb(detail));
    } else if (isRelation(detail)) {
      const gloss = detail.values.gloss;
      if (!gloss) throw noRule(`${detail.key} with no gloss`);
      if (detail.details?.length) throw noRule(`${detail.key} with its own detail`);
      out.before.push(unit([`h-${gloss}`, landmark(hostedOf(detail), writers)]));
    } else if (detail.key === "hookJob:extraNoun") {
      if (detail.values.onLeft) throw noRule("an extra-noun hook on the left");
      const piece = unit([hookWord(detail, EXTRA_NOUN, writers), writers.phrase(hostedOf(detail), "b", writers.endingOf(hostedOf(detail)))]);
      // The second hook of *from X to Y* (hooks.md#extra-noun) stays with the first.
      if (detail.values.fromTo && extraNouns.length) extraNouns.at(-1)!.push(piece);
      else extraNouns.push([piece]);
    } else if (detail.key === "hookJob:span" || detail.key === "hookJob:clause") {
      const part = detail.values.part;
      const hosted = hostedOf(detail);
      if (!part) throw new Unrealized("missingValue", `${detail.key} with no part letter in the view`);
      const pieces = out.attached.get(part) ?? out.attached.set(part, []).get(part)!;
      pieces.push(hookWord(detail, detail.key === "hookJob:span" ? SPAN : IN_CLAUSE, writers), writers.phrase(hosted, part, writers.endingOf(hosted)));
    } else throw noRule(`claim detail ${detail.key}`);
  }
  // A hook right after a landmark describes that landmark (ranges.md#ranges), so two extra nouns sit apart: the first
  // before the verb, the second after it.
  if (extraNouns.length > 2) throw noRule("more than two extra-noun hooks");
  if (extraNouns.length === 2) out.lead.push(...extraNouns.shift()!);
  out.after.push(...(extraNouns[0] ?? []));
  return out;
}

/**
 * A contrary-to zone (contrary-to.md#contrary-to-stance): `uom` and the stance word it holds, which the reader keeps as
 * the frame's one inner frame. A holder there is still a gap.
 */
export function zoneGloss(frame: MeaningFrame): string | undefined {
  if (frame.key !== "hookJob:zone") return undefined;
  const label = EXTRA_NOUN[`${frame.values.series ?? "?"}${frame.values.ending ?? "?"}`];
  const [inner, ...rest] = frame.inner ?? [];
  if (!label || frame.party || frame.content || frame.hosted || frame.details?.length || rest.length) throw noRule("a zone that is not one stance");
  if (!inner || inner.party || inner.inner?.length || inner.content || inner.details?.length || !inner.values.gloss) throw noRule("a zone that is not one stance");
  return `[${label} | th-${inner.values.gloss}]`;
}
