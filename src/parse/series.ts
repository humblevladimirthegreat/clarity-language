/**
 * Series and number facts the parser reads in several places, written once
 * (proposals: parser-rule-consolidation B7).
 */
import type { LexWord, NumberStem } from "./types.js";

/** Join series: `english` names the job in word cards, `job` in morph glosses ([joins.md](../../docs/grammar/joins.md)). */
export const JOIN_SERIES: Record<string, { english: string; job: string }> = {
  a: { english: "and", job: "and" },
  o: { english: "exclusive or", job: "or-exactly-one" },
  ao: { english: "and/or", job: "and/or" },
  u: { english: "not / none of", job: "not" },
  ua: { english: "everything but", job: "everything-but" },
  uo: { english: "anything but", job: "anything-but" },
  e: { english: "rank", job: "rank/more" },
  ae: { english: "equal rank", job: "equal-rank" },
  oe: { english: "sequence", job: "in-order" },
  ue: { english: "rank reversal", job: "rank/less" },
};

/** Series whose shared item ranks (`e` / `ue` / `oe`) or equates (`ae`). */
export const RANK_SERIES = new Set(["e", "oe", "ue", "ae"]);
/** Rank fences whose comparee may be a `/th/` stance bar: `e` more, `ue` less, `ae` equal (comparatives.md § bars). */
export const BAR_SERIES = new Set(["e", "ue", "ae"]);
/** The rank series that order rather than equate (`ae` is the equative). */
export const SCALE_SERIES = new Set(["e", "oe", "ue"]);
export const KIND_SERIES = new Set(["ua", "uo"]);

/** Digitless number stem: no digit groups and no exponent shorthand (numbers.md § digitless). */
export function isDigitless(stem: NumberStem): boolean {
  return stem.groups.length === 0 && !stem.digitlessExp;
}

/** Digitless `+` stem: the scale after a rank join (comparatives.md § amount / frequency / time scale). */
export function isScaleStem(stem: NumberStem): boolean {
  return stem.marker === "+" && isDigitless(stem);
}

type ForceShape = { series: string; endings: string[] };

/** Legal stacked act words: `lead` before `force` (speech-moves.md § Emphatic prohibition, questions.md § rhetorical). */
export const FORCE_PAIRS: { kind: "emphatic" | "rhetorical"; lead: ForceShape; force: ForceShape }[] = [
  { kind: "emphatic", lead: { series: "u", endings: ["l"] }, force: { series: "u", endings: ["l"] } },
  { kind: "rhetorical", lead: { series: "a", endings: ["l", "m"] }, force: { series: "o", endings: ["l", "m"] } },
];

function matchesForce(word: LexWord | undefined, shape: ForceShape): boolean {
  return (
    word?.family.kind === "joinMarker" &&
    word.family.series === shape.series &&
    word.ending !== undefined &&
    shape.endings.includes(word.ending)
  );
}

/** Which pair a leading act word opens, read from the lead alone (enforce rejects a lead with the wrong partner). */
export function leadForceKind(lead: LexWord | undefined): "emphatic" | "rhetorical" | undefined {
  return FORCE_PAIRS.find((pair) => matchesForce(lead, pair.lead))?.kind;
}

/** Which legal pair `lead` + `force` forms, if any. */
export function forcePairKind(lead: LexWord | undefined, force: LexWord | undefined): "emphatic" | "rhetorical" | undefined {
  return FORCE_PAIRS.find((pair) => matchesForce(lead, pair.lead) && matchesForce(force, pair.force))?.kind;
}

export function isRhetorical(lead: LexWord | undefined, force: LexWord | undefined): boolean {
  return forcePairKind(lead, force) === "rhetorical";
}
