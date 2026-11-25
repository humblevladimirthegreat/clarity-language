/**
 * The turn's opening `/y/` words (speech-moves.md, firm-soft.md): act words, calls and reactions, each written from its
 * frame in the meaning view. An act word's gloss is read off the gloss index by its series and ending, so the realizer
 * names no act itself.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { seriesGlossIndex } from "../parse/gloss-inverse.js";
import type { MeaningDetail, MeaningFrame, MeaningLink } from "./meaning.js";
import { leaf } from "./words.js";
import { leafOf, marked, ownFrames, plainWord, thingLeaf, unit, Unrealized, withPlural } from "./terms.js";

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

const actGlosses = new WeakMap<ClassifyTables, Map<string, string>>();

/**
 * Each act word's or polar word's surface (`yel`, `yaol`) → its leaf gloss (`y-question`, `y-yes`), from the gloss index's
 * closed join forms.
 */
function actGlossOf(surface: string, tables: ClassifyTables): string | undefined {
  let map = actGlosses.get(tables);
  if (!map) {
    map = new Map();
    for (const [gloss, surfaces] of seriesGlossIndex(tables).forms) {
      for (const form of surfaces) if (/^y[aeou]{1,2}r?[lmr]$/.test(form) && !map.has(form)) map.set(form, gloss);
    }
    actGlosses.set(tables, map);
  }
  return map.get(surface);
}

/**
 * An act word (speech-moves.md#speech-act-beginner, firm-soft.md#firm-or-soft-act, firm-soft.md#act-for-now): `y`,
 * the act's vowel and the ending that stands behind it, offers it softly or holds it for now. The question type
 * (`ask`) is read off the body, so the word does not write it.
 */
export function actGloss(frame: MeaningFrame, tables: ClassifyTables): string {
  const { series, ending, ask, ...rest } = frame.values;
  void ask;
  if (Object.keys(rest).length || frame.party || frame.content || frame.hosted || ownFrames(frame.inner).length || frame.details?.length) {
    throw noRule("an act word with its own parts");
  }
  const gloss = series && ending ? actGlossOf(`y${series}${ending}`, tables) : undefined;
  if (!gloss) throw noRule(`an act word of series ${series ?? "?"} on -${ending ?? "?"}`);
  // A mark on the act word colors that word only (tone-marks.md#showing-your-tone).
  return marked(frame.inner, gloss);
}

/**
 * A polar word (questions.md#polar-particle, polar-inventory.md): `y`, its two vowels and its ending, from the polar
 * link's values. It stands after the act words and before the body.
 */
export function polarGloss(link: MeaningLink, tables: ClassifyTables): string {
  const { series, ending, gloss, ...rest } = link.values ?? {};
  void gloss;
  if (Object.keys(rest).length || link.frame) throw noRule("a polar word with its own parts");
  const found = series && ending ? actGlossOf(`y${series}${ending}`, tables) : undefined;
  if (!found) throw noRule(`a polar word of series ${series ?? "?"} on -${ending ?? "?"}`);
  return found;
}

/** The first act word's default body order (speech-moves.md#act-word-order). */
export type ActOrder = "statement" | "question" | "command";

export function actOrder(acts: readonly MeaningFrame[]): ActOrder {
  const series = acts[0]?.values.series;
  return series === "e" ? "question" : series === "o" ? "command" : "statement";
}

/**
 * A call's or a reaction's own describing words (speech-moves.md#vocative, more-turn-words.md#describe-turn-word):
 * `gl-` and `/w/` words before the `/y/` word, `/ɡ/` words after it.
 */
function described(head: string, details: readonly MeaningDetail[] | undefined, tables: ClassifyTables): string {
  const before: string[] = [];
  const after: string[] = [];
  for (const detail of details ?? []) {
    if (detail.key === "slot:gl") before.push(plainWord(detail, "gl", detail.values.root, tables));
    else if (detail.key === "slot:w") before.push(plainWord(detail, "w", detail.values.root, tables));
    else if (detail.key === "slot:adj" && detail.values.ending === "n" && detail.values.root && !detail.details?.length) {
      // A name after a name (`yalon golowon`, a family name): its gloss is the name itself (glosses.md#word-shape).
      const root = detail.values.root;
      after.push(leaf("g", root, "n", tables) ?? `g-${root.charAt(0).toUpperCase()}${root.slice(1)}n`);
    } else if (detail.key === "slot:adj") after.push(plainWord(detail, "g", detail.values.root, tables));
    else throw noRule(`${detail.key} on a /y/ word`);
  }
  return unit([...before, head, ...after]);
}

/** A call (speech-moves.md#vocative): `/y/` and the one called, a name or a kind as a title. */
export function callGloss(frame: MeaningFrame, tables: ClassifyTables): string {
  const party = frame.party;
  if (party?.kind !== "thing" || party.details.length || party.frames?.length) throw noRule("a call to a party that is not one thing");
  if (frame.values.stanceVowel || frame.inner?.length || frame.content || frame.hosted) throw noRule("a call with a built word or its own frame");
  return described(withPlural(thingLeaf(party, "y", undefined, tables), party.values), frame.details, tables);
}

/** A reaction (speech-moves.md#interjections-reactions): its root under `/y/` on its ordinary ending. */
export function interjectionGloss(frame: MeaningFrame, tables: ClassifyTables): string {
  const { root, ending, ...rest } = frame.values;
  if (Object.keys(rest).length || ownFrames(frame.inner).length || frame.content || frame.hosted || frame.party) throw noRule("a reaction with its own frame");
  if (!root) throw new Unrealized("missingValue", "a reaction with no root in the view");
  if (ending !== "l" && ending !== "m") throw noRule(`a reaction on -${ending ?? "?"}`);
  return described(marked(frame.inner, leafOf("y", root, ending, tables)), frame.details, tables);
}
