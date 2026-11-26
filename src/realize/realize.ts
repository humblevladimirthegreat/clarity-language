/**
 * The realizer's entry point (docs/meta/realizer.md#round-trip): a meaning-view reading in, a morph gloss and its
 * Ageben spelling out, or a gap that says why not. Each area's rules come in their own file; until one does, every
 * reading is a `noRule` gap keyed by its first construction.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { checkLine, spell } from "../interpret/reply.js";
import { buildGlossIndex, glossToAgeben, type GlossIndex } from "../parse/gloss-inverse.js";
import { claimGloss } from "./claim.js";
import type { MeaningReading } from "./meaning.js";
import { collecting, PLACEHOLDER, Unrealized, type FoundGap } from "./gaps.js";

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

/** Realize one reading of the meaning view: the bare clause (`claim.ts`), else a gap under the reading's first key. */
export function realize(view: MeaningReading, tables: ClassifyTables): Realized {
  const key = firstKey(view);
  let gloss: string;
  try {
    gloss = claimGloss(view, tables);
  } catch (error) {
    if (!(error instanceof Unrealized)) throw error;
    return { gap: { kind: error.kind, key, detail: `${key}: ${error.message}` } };
  }
  const out = spellGloss(gloss, key, tables);
  if (!("gap" in out)) return out;
  // A join with no items glosses by its standalone job (*none*, *everything*) in a clause, and by its listed job in a
  // bare fragment (`zual.`); when the first does not spell, the second is tried.
  const listed = claimGloss(view, tables, { standalone: false });
  return listed === gloss ? out : "gap" in spellGloss(listed, key, tables) ? out : spellGloss(listed, key, tables);
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

// ── Every gap ──

/** A gloss's units at its top level, split at each `|` outside brackets (`a | [b | c]` → `a`, `[b | c]`). */
function unitsOf(gloss: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < gloss.length; i++) {
    if (gloss[i] === "[") depth++;
    else if (gloss[i] === "]") depth--;
    else if (gloss[i] === "|" && depth === 0) {
      out.push(gloss.slice(from, i).trim());
      from = i + 1;
    }
  }
  return [...out, gloss.slice(from).trim()].filter(Boolean);
}

/** A bracketed unit's inside (`[d-dog | g-big]` → `d-dog | g-big`), or undefined for a word. */
function insideOf(unit: string): string | undefined {
  if (!unit.startsWith("[")) return undefined;
  let depth = 0;
  for (let i = 0; i < unit.length; i++) {
    if (unit[i] === "[") depth++;
    else if (unit[i] === "]" && --depth === 0) return i === unit.length - 1 ? unit.slice(1, -1) : undefined;
  }
  return undefined;
}

/** A word with a part-of-speech letter (`z-dog`, `bl-speaker`, `?d-wh`); a hook's label (`at`) spells only in its unit. */
const hasLetter = (word: string): boolean => /^\W*[a-z]{1,2}-/.test(word);

/**
 * The parts of a unit that do not spell alone: none when it spells; else its parts that do not, a word with no letter
 * only when it stands alone; a unit whose parts each spell is itself the part. A unit holding a placeholder is judged
 * only by its parts.
 */
function unspelled(unit: string, tables: ClassifyTables): string[] {
  if (unit === PLACEHOLDER) return [];
  const gapped = unit.includes(PLACEHOLDER);
  if (!gapped && spellsAlone(unit, tables)) return [];
  const inside = insideOf(unit);
  if (inside === undefined) return [unit];
  const own = unitsOf(inside).flatMap((part) => unspelled(part, tables)).filter(hasLetter);
  return own.length || gapped ? own : [unit];
}

const spelled = new WeakMap<ClassifyTables, Map<string, boolean>>();

/** True when one unit's gloss spells alone against the bare gloss index, as `spellGloss` spells a line. */
function spellsAlone(word: string, tables: ClassifyTables): boolean {
  let seen = spelled.get(tables);
  if (!seen) spelled.set(tables, (seen = new Map()));
  const known = seen.get(word);
  if (known !== undefined) return known;
  let index = indexes.get(tables);
  if (!index) indexes.set(tables, (index = buildGlossIndex(tables)));
  let ok = true;
  try {
    glossToAgeben(word, tables, index);
  } catch {
    ok = false;
  }
  seen.set(word, ok);
  return ok;
}

/**
 * Every gap of one reading (docs/meta/realizer.md#round-trip), where `realize` returns only the first: each item that
 * fails is recorded and written as a placeholder (`collecting`, gaps.ts), and each written word or unit that does not
 * spell alone (`unspelled`) is a `noSpell` gap under the reading's first key, its gloss as the detail. A gloss with no gap that still does not
 * spell or parse as a line, though each word spells, is the line's own gap, as `realize` files it. Empty when the
 * reading realizes.
 */
export function allGaps(view: MeaningReading, tables: ClassifyTables): FoundGap[] {
  const key = firstKey(view);
  const { value: gloss, gaps } = collecting(key, () => claimGloss(view, tables));
  const line = gloss !== undefined && !gaps.length ? realize(view, tables) : undefined;
  if (line && !("gap" in line)) return [];
  const words = gloss === undefined ? [] : unitsOf(gloss).flatMap((unit) => unspelled(unit, tables));
  const noSpell = words.map((word): FoundGap => ({ kind: "noSpell", key, detail: word, nested: false }));
  if (gaps.length || noSpell.length) return [...gaps, ...noSpell];
  return line && "gap" in line ? [{ ...line.gap, nested: false }] : [];
}
