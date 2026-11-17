/**
 * Tone marks on a word, a span, or a scope island (tone-marks.md#tone-marks): the reader puts each one on the place
 * that holds what it colors. A mark before the rest of the sentence is a whole-clause frame the resolve stage already
 * emitted (`src/parse/scope.ts`), copied with the other scope frames.
 *
 * A tone is voice only, so its frame holds no word (`words` is empty): word coverage is unchanged.
 */
import type { LexWord, ToneRecord } from "../parse/types.js";
import { classOf } from "./classes.js";
import type { Detail, Frame, Reading, Term } from "./types.js";

const KEY = "edge:tone";

/** The frame of one tone mark: `values` hold the mark as written, its names, and what it colors. */
export function toneFrame(tone: ToneRecord): Frame {
  const row = classOf(KEY);
  return {
    family: "attitude",
    construction: `tone.scope.${tone.scope}`,
    key: KEY,
    anchor: row?.anchor ?? "",
    words: [],
    values: { mark: tone.mark, names: tone.names.join(" "), scope: tone.scope },
  };
}

/** Is this reading a scope island (or a verb-list item) whose words are exactly the tone's? */
function islandOf(reading: Reading, tone: ToneRecord): boolean {
  if (!/\/[iv]\d+$/.test(reading.id)) return false;
  const words = wordsUnder(reading.source.clause.units);
  return words.size === tone.words.length && tone.words.every((word) => words.has(word));
}

function isWord(value: object): value is LexWord {
  return typeof (value as LexWord).raw === "string" && "family" in value && "reading" in value;
}

/** Every word under a tree node (identity only: which island holds which words). */
function wordsUnder(value: unknown, out = new Set<LexWord>(), seen = new Set<object>()): Set<LexWord> {
  if (value === null || typeof value !== "object" || seen.has(value)) return out;
  seen.add(value);
  if (isWord(value)) out.add(value);
  else for (const child of Array.isArray(value) ? value : Object.values(value)) wordsUnder(child, out, seen);
  return out;
}

function headOf(term: Term): LexWord | undefined {
  return term.kind === "thing" ? term.head : "word" in term ? term.word : undefined;
}

/**
 * Put a word's or a span's tone on each own place of its word: the term it heads or names, the detail or frame it
 * carries. A left-edge word frames every sentence body and join member of its turn, so its tone sits on each copy.
 * Returns how many places took it.
 */
function placeOnWord(readings: Reading[], tone: ToneRecord): number {
  const target = tone.words[0];
  let placed = 0;
  const seen = new Set<object>();
  const placedOn = new Set<object>();
  const add = (into: { frames?: Frame[] }): void => {
    // One place: a term a frame hosts is the same object as the role it fills.
    if (placedOn.has(into)) return;
    placedOn.add(into);
    into.frames = [...(into.frames ?? []), toneFrame(tone)];
    placed++;
  };
  const term = (t: Term | undefined): void => {
    if (!t || seen.has(t)) return;
    seen.add(t);
    switch (t.kind) {
      case "thing":
        if (t.head === target) return add(t);
        t.details.forEach(detail);
        t.frames?.forEach(frame);
        return;
      case "clause":
        return reading(t.reading);
      case "list":
        if (t.join === target || t.parts.some((p) => p.join === target)) return add(t);
        t.members.forEach(term);
        t.frames?.forEach(frame);
        if (t.bound) detail(t.bound);
        t.sharedDetails?.forEach(detail);
        return;
      default:
        if (t.word === target) return add(t);
        if ("details" in t) t.details?.forEach(detail);
    }
  };
  const frame = (f: Frame): void => {
    if (seen.has(f)) return;
    seen.add(f);
    if (f.words.includes(target!)) {
      // A frame that keeps its word and hosts the term that word heads (a new member, a greeting's name, a call's
      // addressee): the tone colors the word, so it sits on that term.
      const named = [f.hosted, f.party].find((t) => t && headOf(t) === target);
      if (named) return add(named as { frames?: Frame[] });
      f.inner = [...(f.inner ?? []), toneFrame(tone)];
      placed++;
      return;
    }
    term(f.party);
    term(f.hosted);
    f.inner?.forEach(frame);
    f.details?.forEach(detail);
    f.content?.forEach(reading);
  };
  const detail = (d: Detail): void => {
    if (seen.has(d)) return;
    seen.add(d);
    if (d.words.includes(target!)) return add(d);
    term(d.hosted);
    d.details?.forEach(detail);
    d.frames?.forEach(frame);
    d.content?.forEach(reading);
  };
  const reading = (r: Reading): void => {
    if (seen.has(r)) return;
    seen.add(r);
    r.frames.forEach(frame);
    const claim = r.claim;
    [claim.verb, ...Object.values(claim.roles), ...claim.predicate, claim.clauses].forEach(term);
    claim.details.forEach(detail);
  };
  readings.forEach(reading);
  return placed;
}

/**
 * Place every word, span and island tone of a parse (reader rule 2: a tone on a word reaches that word only). A tone
 * whose word has no own place (a linker, a polar particle) goes in `unread` as `unplaced`. `all` lists every reading,
 * nested ones included.
 */
export function placeTones(readings: Reading[], all: Reading[], tones: readonly ToneRecord[]): void {
  for (const tone of tones) {
    if (tone.scope === "rest") continue;
    if (tone.scope === "island") {
      const island = all.find((r) => islandOf(r, tone));
      if (island) {
        island.frames.push(toneFrame(tone));
        continue;
      }
    } else if (placeOnWord(readings, tone) > 0) continue;
    const word = tone.words[0];
    const home = all.find((r) => r.links.some((l) => word && l.words.includes(word))) ?? readings[0];
    home?.unread.push({ construction: `tone.scope.${tone.scope}`, key: KEY, ...(word ? { word } : {}), reason: "unplaced" });
  }
}
