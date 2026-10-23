/**
 * Which verb of a joined verb list a word belongs to (join-across-roles.md#vp-clause-forms), decided once after the
 * clause is built. The grammar reads a verb list's later items itself; this pass places the rest:
 *
 * - The first item starts at the subject: the `/d/`, `/b/`, `/h/` and hook words between the subject and the first verb
 *   are the first verb's. With no subject, the item reaches back to the start of the clause. Words before the subject
 *   cover every verb, so with the subject after the list nothing before it moves.
 * - The `/d/`, `/b/` and `/h/` words right after the list's last join are SHARED: every verb's.
 *
 * A `/th/` stance word or intention adverb between the first item's words rides in its bracket, as it does in a later
 * item, and still covers the whole claim by its own rule; at the edge of the run it stays outside. Only a list of two or more verbs has items to tell apart.
 */
import { isClauseAdverb } from "./classify.js";
import type { Clause, IslandUnit, LexWord, Unit, VpCoord } from "./types.js";

function isNp(unit: Unit | undefined, level: "z" | "d" | "b"): boolean {
  return unit?.kind === "np" && unit.coord.level === level;
}

function isGenitiveHook(unit: Unit | undefined): boolean {
  return unit?.kind === "hook" && unit.word.family.kind === "hook" && unit.word.family.form === "em";
}

function verbCount(coord: VpCoord): number {
  return coord.parts.reduce((n, part) => n + part.items.length, 0);
}

/** A verb list with items to tell apart: two or more verbs under a join. */
export function isVerbJoin(unit: Unit | undefined): unit is Extract<Unit, { kind: "vp" }> {
  return unit?.kind === "vp" && unit.coord.parts.some((part) => part.join) && verbCount(unit.coord) > 1;
}

/** Can this unit be one of the first item's words? */
function itemWord(units: Unit[], index: number): boolean {
  const unit = units[index]!;
  if (isNp(unit, "d") || isNp(unit, "b") || unit.kind === "h") return true;
  // A lone hook opening the clause is glue to prior talk, not an item word (hooks.md#discourse-hooks).
  if (unit.kind === "hook") return index > 0 || isNp(units[index + 1], "b");
  return false;
}

/** A `/th/` stance word or an intention adverb: on the whole claim wherever it sits (clause.md#intention-adverbs). */
function onClaim(unit: Unit): boolean {
  return unit.kind === "h" && (unit.unit.word.pos === "th" || isClauseAdverb(unit.unit.word));
}

/** A plain `/h/` adverb: not a claim word. */
function plainAdverb(unit: Unit): boolean {
  return unit.kind === "h" && !onClaim(unit);
}

function firstItem(units: Unit[], at: number): Unit[] {
  if (units.slice(at + 1).some((unit) => isNp(unit, "z"))) return units;
  let start = at;
  while (start > 0 && itemWord(units, start - 1)) start -= 1;
  // `em` + `/b/` right after a noun is that noun's (extra-noun-hooks.md#genitive): it stays with the subject. A claim word at
  // the edge of the run is no item word either, so it stays outside the bracket.
  for (;;) {
    if (start < at && isGenitiveHook(units[start])) start += isNp(units[start + 1], "b") ? 2 : 1;
    else if (start < at && onClaim(units[start]!)) start += 1;
    else break;
  }
  if (start === at) return units;
  const vp = units[at] as Extract<Unit, { kind: "vp" }>;
  const first = vp.coord.parts[0]!;
  const verb = first.items[0] as LexWord;
  const moved = units.slice(start, at);
  const own = first.itemUnits?.find((e) => e.verb === verb);
  if (own) own.units.unshift(...moved);
  else first.itemUnits = [{ verb, units: moved }, ...(first.itemUnits ?? [])];
  return [...units.slice(0, start), vp, ...units.slice(at + 1)];
}

function sharedAfter(units: Unit[], at: number): Unit[] {
  let end = at + 1;
  while (end < units.length) {
    const unit = units[end]!;
    if (isNp(unit, "d") || isNp(unit, "b") || plainAdverb(unit)) end += 1;
    // `em` + `/b/` after a shared noun describes that noun.
    else if (end > at + 1 && isGenitiveHook(unit) && isNp(units[end + 1], "b")) end += 2;
    else break;
  }
  if (end === at + 1) return units;
  const vp = units[at] as Extract<Unit, { kind: "vp" }>;
  const last = vp.coord.parts.at(-1)!;
  last.sharedUnits = [...(last.sharedUnits ?? []), ...units.slice(at + 1, end)];
  return [...units.slice(0, at + 1), ...units.slice(end)];
}

/** Place each verb list's words in a unit list (see the module comment). */
export function scopeVerbItems(units: Unit[]): Unit[] {
  let out = units;
  for (let at = 0; at < out.length; at++) {
    if (!isVerbJoin(out[at])) continue;
    out = sharedAfter(out, at);
    const before = out.length;
    out = firstItem(out, at);
    at -= before - out.length;
  }
  return out;
}

/** {@link scopeVerbItems} over a clause and the sentence its stand-in opens. */
export function scopeClause(clause: Clause): Clause {
  const units = scopeVerbItems(clause.units);
  if (clause.dependent) scopeClause(clause.dependent.clause);
  clause.units = units;
  return clause;
}

/** {@link scopeVerbItems} over an island's units. */
export function scopeIsland(island: IslandUnit): IslandUnit {
  island.units = scopeVerbItems(island.units);
  return island;
}

/** Is this `/b/` phrase a recipient: not the landmark of a hook right before it? */
function isRecipient(units: Unit[], index: number): boolean {
  return isNp(units[index], "b") && units[index - 1]?.kind !== "hook";
}

/**
 * A verb with its own object takes no shared one, and a verb with its own recipient no shared recipient
 * (join-across-roles.md#vp-clause-forms): the noun's slot or recipient that would take two. `undefined` when none.
 */
export function doubledVerbSlot(units: Unit[]): { slot: "d" | "b"; vp: VpCoord } | undefined {
  for (const unit of units) {
    if (!isVerbJoin(unit)) continue;
    const items = unit.coord.parts.flatMap((part) => (part.itemUnits ?? []).map((e) => e.units));
    const shared = [units, ...unit.coord.parts.map((part) => part.sharedUnits ?? [])];
    const has = (lists: Unit[][], slot: "d" | "b") =>
      lists.some((list) => list.some((_, i) => (slot === "d" ? isNp(list[i], "d") : isRecipient(list, i))));
    for (const slot of ["d", "b"] as const) if (has(items, slot) && has(shared, slot)) return { slot, vp: unit.coord };
  }
  return undefined;
}
