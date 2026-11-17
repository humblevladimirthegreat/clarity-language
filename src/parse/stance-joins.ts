/**
 * The stance join node (verb-and-stance-joins.md#stance-join-reach), decided once after the clause is built.
 *
 * A `/th/` join takes the stance words right before it, with nothing between; a hinge keeps its `/bl/` argument, which
 * is part of the hinge's own unit. A `/th/` word with other words between it and the join is a frame of its own, and
 * the join with no stance words right before it is standalone (verb-and-stance-joins.md#standalone-stance-joins).
 * An earlier stance join right before a later one is that fence, closed whole by the later join, as nested fences are.
 */
import type { HUnit, LexWord, Unit } from "./types.js";

/** A `/th/` join word: closes a stance list, or stands alone. */
export function isStanceJoin(word: LexWord): boolean {
  return word.pos === "th" && word.family.kind === "joinMarker" && word.reading === "join";
}

/** Set {@link HUnit.closes} on every `/th/` join word of one unit list. */
export function markStanceJoins(units: Unit[]): void {
  units.forEach((unit, at) => {
    if (unit.kind !== "h" || !isStanceJoin(unit.unit.word)) return;
    const items: number[] = [];
    for (let i = at - 1; i >= 0; i--) {
      const before = units[i]!;
      if (before.kind !== "h" || before.unit.word.pos !== "th" || before.unit.word.at === undefined) break;
      items.unshift(before.unit.word.at);
      if (before.unit.closes) break;
    }
    unit.unit.closes = items;
  });
}
