/**
 * Lexicon-side retie steps for `convert-word --lexicon`: respelling overlay sense forms,
 * choosing `--only` rows, and checking compound parts still name their rows.
 */
import type { CompoundRow, CompoundValidationError } from "../lexicon-compounds.js";
import { overlayPrefix } from "../parse/classify.js";
import { retieCore } from "./rebuild.js";

/**
 * Respell an overlay sense form through the word grammar, the same way the docs are retied:
 * `waderenel` (`w` + reach + part + root) keeps its reach and part and moves only the root.
 * `null` when the form does not spell `oldRoot` where the parser finds it.
 */
export function retieSenseForm(senseForm: string, pos: string, oldRoot: string, newRoot: string): string | null {
  if (!oldRoot || oldRoot === newRoot) {
    return senseForm;
  }
  return retieOverlayForm(senseForm, pos, new Map([[oldRoot, newRoot]]));
}

/**
 * An overlay sense form respelled through `map`, parsed as it is written in a sentence: with its PoS letter (a bare
 * `waderenel` is not a word), or bare for a same-role word (`abam`). `null` when nothing in it moves.
 */
export function retieOverlayForm(senseForm: string, pos: string, map: ReadonlyMap<string, string>): string | null {
  const prefix = overlayPrefix(pos);
  const next = retieCore(`${prefix}${senseForm}`, map);
  return next?.startsWith(prefix) ? next.slice(prefix.length) : null;
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
