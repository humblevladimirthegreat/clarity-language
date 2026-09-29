/**
 * Lexicon-side retie steps for `convert-word --lexicon`: respelling overlay sense forms,
 * choosing `--only` rows, and checking compound parts still name their rows.
 */
import type { CompoundRow, CompoundValidationError } from "../lexicon-compounds.js";
import { retieCore } from "./rebuild.js";

/**
 * Respell an overlay sense form through the word grammar, the same way the docs are retied:
 * `uxerenel` (role vowel + `x` + root) keeps its role vowel and moves only the root.
 * `null` when the form does not spell `oldRoot` where the parser finds it.
 */
export function retieSenseForm(senseForm: string, pos: string, oldRoot: string, newRoot: string): string | null {
  if (!oldRoot || oldRoot === newRoot) {
    return senseForm;
  }
  // Parsed with its PoS, as it is written in a sentence (a bare `uxerenel` is not a word).
  const next = retieCore(`${pos}${senseForm}`, new Map([[oldRoot, newRoot]]));
  return next?.startsWith(pos) ? next.slice(pos.length) : null;
}

/** Whether a lexicon CSV row is one `--only` names (by concrete label, emoji or root); every row when none are given. */
export function rowMatchesOnly(row: Record<string, string>, only: string[]): boolean {
  if (only.length === 0) {
    return true;
  }
  const literal = (row.concrete ?? "").trim();
  const emoji = (row.emoji ?? "").trim();
  const root = (row.root ?? "").trim();
  return only.some((filter) => filter === literal || filter === emoji || filter === root);
}

/**
 * Compound parts that no longer name the same published row: each part's old root belonged to
 * an emoji, and after the retie the part must be that emoji's new root (catches chained substitution).
 */
export function compoundPartDrift(
  before: CompoundRow[],
  after: CompoundRow[],
  emojiByOldRoot: ReadonlyMap<string, string>,
  rows: Record<string, string>[],
): CompoundValidationError[] {
  const rootByEmoji = new Map(rows.map((row) => [(row.emoji ?? "").trim(), (row.root ?? "").trim()]));
  const errors: CompoundValidationError[] = [];
  before.forEach((row, i) => {
    for (const field of ["left", "right"] as const) {
      const emoji = emojiByOldRoot.get(row[field]);
      if (!emoji) continue;
      const expected = rootByEmoji.get(emoji);
      const got = after[i]![field];
      if (expected && got !== expected) {
        errors.push({ row: i + 2, stem: after[i]!.stem, reason: `${field} ${row[field]} (${emoji}) became ${got}, expected ${expected}` });
      }
    }
  });
  return errors;
}
