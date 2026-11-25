/**
 * The settled-to-passing grade of a `/th/` stance overlay (`sakes.md#settled-to-passing`): `-l` settled,
 * `-m` default, `-r` passing. Derived from the sense form's ending, not stored in `lexicon-overlays.csv`;
 * each kind keeps its own gloss (`MEMORY.strong`, `WANT-passing`).
 */
import type { OverlayKind } from "../lexicon-search.js";

export type StanceGrade = "settled" | "default" | "passing";

/** The grade each scale ending names. */
export const STANCE_GRADE_BY_ENDING: Readonly<Record<"l" | "m" | "r", StanceGrade>> = {
  l: "settled",
  m: "default",
  r: "passing",
};

/** Overlay kinds whose `/th/` `-l` / `-m` / `-r` rows read the grade. */
export const GRADED_STANCE_KINDS: ReadonlySet<OverlayKind> = new Set<OverlayKind>([
  "evidential",
  "mirative",
  "phasal",
  "want",
  "decision",
  "plan",
  "may",
  "notional",
]);

/** Sense forms of graded kinds that take no grade: `ogem` DECISION *modifiable* is a claim, not the default. */
export const UNGRADED_STANCE_FORMS: ReadonlySet<string> = new Set(["ogem"]);

/** The grade of an overlay row, or undefined when the row is not a graded `/th/` stance. */
export function stanceGrade(row: { pos: string; kind: OverlayKind; senseForm: string }): StanceGrade | undefined {
  if (row.pos !== "th" || !GRADED_STANCE_KINDS.has(row.kind) || UNGRADED_STANCE_FORMS.has(row.senseForm)) return undefined;
  const ending = row.senseForm.slice(-1);
  return ending === "l" || ending === "m" || ending === "r" ? STANCE_GRADE_BY_ENDING[ending] : undefined;
}
