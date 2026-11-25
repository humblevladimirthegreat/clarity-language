/**
 * The realizer's entry point (docs/meta/realizer.md#round-trip): a meaning-view reading in, a morph gloss and its
 * Ageben spelling out, or a gap that says why not. Each area's rules come in their own file; until one does, every
 * reading is a `noRule` gap keyed by its first construction.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { checkLine, spell } from "../interpret/reply.js";
import { buildGlossIndex, glossToAgeben, type GlossIndex } from "../parse/gloss-inverse.js";
import type { MeaningReading } from "./meaning.js";

/**
 * Why the realizer wrote nothing: `noRule`, no rule for this key yet; `missingValue`, the view lacks what is needed to
 * choose a word (a reader gap); `noSpell`, the gloss does not spell; `noParse`, the spelled line does not parse to one
 * tree.
 */
export type GapKind = "noRule" | "missingValue" | "noSpell" | "noParse";

/** A gap: its kind, the key it is filed under (a frame, detail, stance-list or link key, or `claim`), and a detail. */
export type Gap = { kind: GapKind; key: string; detail: string };

/** A realized reading, or a gap. */
export type Realized = { gloss: string; ageben: string } | { gap: Gap };

/**
 * The key a reading's first unrealized part is filed under: its first frame's key, else its first claim detail's, its
 * first stance list's or its first link's; a reading with none of these is the bare clause, `claim`.
 */
export function firstKey(view: MeaningReading): string {
  return view.frames[0]?.key ?? view.claim.details[0]?.key ?? view.stanceLists?.[0]?.key ?? view.links[0]?.key ?? "claim";
}

/** Realize one reading of the meaning view. */
export function realize(view: MeaningReading, _tables: ClassifyTables): Realized {
  const key = firstKey(view);
  return { gap: { kind: "noRule", key, detail: `no rule realizes ${key} yet` } };
}

const indexes = new WeakMap<ClassifyTables, GlossIndex>();

/**
 * A morph gloss spelled with `spell` (reply.ts), as a realized line; when it does not spell, a `noSpell` gap, and when the
 * spelling does not parse to one tree, a `noParse` gap, each filed under `key`.
 */
export function spellGloss(gloss: string, key: string, tables: ClassifyTables): Realized {
  const ageben = spell({ gloss, english: "" }, tables);
  if (ageben) return { gloss, ageben };
  let index = indexes.get(tables);
  if (!index) indexes.set(tables, (index = buildGlossIndex(tables)));
  let line: string;
  try {
    line = glossToAgeben(gloss, tables, index);
  } catch (error) {
    return { gap: { kind: "noSpell", key, detail: `${gloss}: ${(error as Error).message.split("\n")[0]}` } };
  }
  const check = checkLine(/[.?!]$/.test(line) ? line : `${line}.`, tables);
  return { gap: { kind: "noParse", key, detail: `${gloss} → ${line}: ${check.ok ? "does not spell" : check.why}` } };
}
