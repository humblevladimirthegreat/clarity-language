/**
 * Frames for construction search, taken from readings (interpreter.md#parse-or-reading): every frame the reader
 * gives a word, wherever it sits — a reading's whole-clause frames, frames held in another's `inner`, frames on a
 * term or detail (adjective, noun or list reach), a stance list's join frame — in every reading, nested ones included
 * (clause-join members, dependents, islands, verb-list items, quotes). Each frame's reach is where the reader put it
 * (reader rule 2, interpreter.md#reader-rules), read off the reading, never off the parse.
 */
import type { Detail, Frame, Reading, StanceList, Term } from "../interpret/types.js";
import type { LexWord } from "../parse/types.js";

/**
 * Where a frame sits in the readings, so how far it reaches:
 * - `clause`: a reading's own frames, whole-clause (any reading: a member, a dependent, an island, a verb-list item);
 * - `nested`: held in another frame (`inner`): a contrary zone's stance, a frame on a frame word, a fence's denial;
 * - `list`: on a list term, or a stance list's join frame over its list;
 * - `adjective`: on one adjective (an adjective detail's `frames`);
 * - `noun`: on one term's word (a noun, a verb word, a bar);
 * - `word`: on one other word that describes something (a non-adjective detail: an adverb, a shared word, a hook).
 */
export const REACHES = ["clause", "nested", "list", "adjective", "noun", "word"] as const;
export type Reach = (typeof REACHES)[number];

/** One frame on a word: `family` and `family/member`, and where it reaches. */
export type FrameEntry = { values: string[]; reach: Reach };

/** A frame and where the readings put it. */
export type PlacedFrame = { frame: Frame; reach: Reach };

/** `family` and, with a member, `family/member`. */
export function frameNames(frame: Pick<Frame, "family" | "member">): string[] {
  return frame.member ? [frame.family, `${frame.family}/${frame.member}`] : [frame.family];
}

/** Every frame in `readings` and the readings nested in them, each once, in the order met, with its reach. */
export function readingFrames(readings: Reading[]): PlacedFrame[] {
  const out: PlacedFrame[] = [];
  const seen = new Set<object>();
  const once = (node: object): boolean => {
    if (seen.has(node)) return false;
    seen.add(node);
    return true;
  };
  const visitFrame = (frame: Frame, reach: Reach): void => {
    if (!once(frame)) return;
    out.push({ frame, reach });
    frame.inner?.forEach((f) => visitFrame(f, "nested"));
    frame.content?.forEach(visitReading);
    visitTerm(frame.party);
    visitTerm(frame.hosted);
    frame.details?.forEach(visitDetail);
  };
  const visitDetail = (detail: Detail): void => {
    if (!once(detail)) return;
    detail.frames?.forEach((f) => visitFrame(f, detail.kind === "adjective" ? "adjective" : "word"));
    detail.content?.forEach(visitReading);
    visitTerm(detail.hosted);
    detail.details?.forEach(visitDetail);
  };
  const visitTerm = (term: Term | undefined): void => {
    if (!term || !once(term)) return;
    if (term.kind === "clause") return visitReading(term.reading);
    if ("frames" in term) term.frames?.forEach((f) => visitFrame(f, term.kind === "list" ? "list" : "noun"));
    if ("details" in term) term.details?.forEach(visitDetail);
    if (term.kind === "list") {
      term.members.forEach(visitTerm);
      term.sharedDetails?.forEach(visitDetail);
      if (term.bound) visitDetail(term.bound);
    }
    if (term.kind === "quote") term.readings.forEach(visitReading);
  };
  const visitList = (list: StanceList): void => {
    if (!once(list)) return;
    list.inner?.forEach((f) => visitFrame(f, "list"));
    list.details?.forEach(visitDetail);
  };
  const visitReading = (reading: Reading): void => {
    if (!once(reading)) return;
    reading.frames.forEach((f) => visitFrame(f, "clause"));
    reading.stanceLists?.forEach(visitList);
    const { claim } = reading;
    [claim.verb, ...Object.values(claim.roles), ...claim.predicate, claim.clauses].forEach(visitTerm);
    claim.details.forEach(visitDetail);
  };
  readings.forEach(visitReading);
  return out;
}

/** The frames each word carries, by word identity: what `frame=` and `reach=` match. */
export function wordFrames(readings: Reading[]): Map<LexWord, FrameEntry[]> {
  const out = new Map<LexWord, FrameEntry[]>();
  for (const { frame, reach } of readingFrames(readings)) {
    // A tone mark is voice only: its frame holds no word (tone-marks.md#showing-your-tone), so no word carries it.
    const word = frame.words[0];
    if (!word) continue;
    const entries = out.get(word) ?? [];
    const values = frameNames(frame);
    if (!entries.some((e) => e.reach === reach && e.values.join() === values.join())) entries.push({ values, reach });
    out.set(word, entries);
  }
  return out;
}
