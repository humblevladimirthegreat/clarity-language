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
  ae: { english: "sequence", job: "in-order" },
  oe: { english: "equal rank", job: "equal-rank" },
  ue: { english: "rank reversal", job: "rank/less" },
};

/** Series whose shared item ranks (`e` / `ue` / `ae`) or equates (`oe`). */
export const RANK_SERIES = new Set(["e", "ae", "ue", "oe"]);
/** Rank fences whose comparee may be a `/th/` stance bar: `e` more, `ue` less, `oe` equal (comparatives.md § bars). */
export const BAR_SERIES = new Set(["e", "ue", "oe"]);
/** The rank series that order rather than equate (`oe` is the equative). */
export const SCALE_SERIES = new Set(["e", "ae", "ue"]);
export const KIND_SERIES = new Set(["ua", "uo"]);

/** A hooked join's hook, as its free form (`ol`, `om`, `or`; hook-compounds.md#hooked-joins); undefined on any other word. */
export function joinHook(word: LexWord | undefined): string | undefined {
  return word?.family.kind === "joinMarker" ? word.family.hook : undefined;
}

/** Hooks whose free **-r** points back (discourse-hooks.md#hook-resume), so a hooked join may take `r` before its seam. */
export const POINT_BACK_HOOKS = new Set(["ar", "aor", "or", "ur", "uor", "er", "aer"]);

/** The hooks an `/h/` hooked join takes: a time reading on the landmark, or a point-back to a time (hook-compounds.md#hooked-joins-time). */
export const TIME_HOOKS = new Set(["al", "ol", "ul", "oel", "om", "ar", "or", "ur"]);

/** The bare restrictors an `/h/` hooked join bounds (restrictors.md): *never*, *always*, and the **-r** occasions. */
export const TIME_JOINS = new Set(["al", "am", "ual", "uam", "ar", "or", "ur", "er"]);

/** Digitless number stem: no digit groups and no exponent shorthand (digitless-exponents.md § digitless). */
export function isDigitless(stem: NumberStem): boolean {
  return stem.groups.length === 0 && !stem.digitlessExp;
}

/** Digitless `+` stem: the scale after a rank join (comparatives.md § amount / frequency / time scale). */
export function isScaleStem(stem: NumberStem): boolean {
  return stem.marker === "+" && isDigitless(stem);
}

/** The kinds of two stacked act words (speech-moves.md § stacked acts, § doubled act). */
export type StackKind = "emphatic" | "rhetorical" | "quiz" | "stack";

function actSeries(word: LexWord | undefined): string | undefined {
  return word?.family.kind === "joinMarker" ? word.family.series : undefined;
}

/**
 * Two opening act words: the same word twice is emphasis; otherwise the outer word is the real act and the inner one how
 * the turn sounds. A statement over a question is the rhetorical question, a question over a statement the quiz
 * (questions.md § rhetorical, § quiz).
 */
export function stackKind(lead: LexWord | undefined, force: LexWord | undefined): StackKind | undefined {
  if (!lead || !force) return undefined;
  if (lead.raw === force.raw) return "emphatic";
  const outer = actSeries(lead);
  const inner = actSeries(force);
  if (outer === "a" && inner === "o") return "rhetorical";
  if (outer === "o" && inner === "a") return "quiz";
  return "stack";
}

/** The act a turn really does: the outer of two stacked act words, or the only one. */
export function actWord(left: { leadForce?: LexWord; force?: LexWord }): LexWord | undefined {
  return left.leadForce ?? left.force;
}
