/**
 * Frame notes for the inspector: what the frame words of a parsed text do, by token. Reads the readings
 * (docs/meta/interpreter.md#parse-or-reading), never the parse tree. Browser-safe: no Node APIs.
 *
 * Per frame word: its family as the learner term from `docs/grammar/terminology.md` and the frame's owning section, how
 * far it reaches, and which frames it covers. Per sentence with two or more whole-clause frames (carried frames count):
 * what covers what, which pairs are not settled, and which frames carry over from an earlier sentence. The notes copy
 * the reading's `order`, `unordered` and `carriedFrame` links; they never order a pair themselves
 * (interpreter.md#reader-rules).
 */
import type { FrameReach } from "../parse/scope.js";
import type { InspectToken } from "../parse/inspect.js";
import type { LexWord, ParseResult } from "../parse/types.js";
import { classOf } from "./classes.js";
import { readParse, type ReadOptions } from "./read.js";
import type { Detail, Frame, FrameFamily, Reading, ReadingId, StanceList, Term } from "./types.js";

/** A learner term: the heading text in `terminology.md` and its anchor there. */
export type FamilyTerm = { term: string; anchor: string };

/**
 * The learner term for each frame family (interpreter.md#frame-families), from a heading or closed label in
 * `docs/grammar/terminology.md`. A family absent here has no term on that page yet; its notes carry no `term`.
 */
export const FAMILY_TERMS: Readonly<Partial<Record<FrameFamily, FamilyTerm>>> = {
  force: { term: "Speech act", anchor: "terminology.md#speech-act" },
  polarity: { term: "Negation", anchor: "terminology.md#negation" },
  say: { term: "Say word", anchor: "terminology.md#say-word" },
  stance: { term: "Stance", anchor: "terminology.md#stance" },
  holder: { term: "Holder", anchor: "terminology.md#holder" },
  hinge: { term: "Clause hinge", anchor: "terminology.md#clause-hinge-np-hinge" },
  intention: { term: "Intention", anchor: "terminology.md#intention" },
  ability: { term: "Ability / incapability", anchor: "terminology.md#ability-incapability" },
  phase: { term: "Already / still / not yet / no longer", anchor: "terminology.md#already-still-not-yet-no-longer" },
  residue: { term: "Residue / former climate", anchor: "terminology.md#residue-former-climate" },
  notional: { term: "NOTIONAL", anchor: "terminology.md#mood-labels" },
  mirative: { term: "MIRATIVE", anchor: "terminology.md#mood-labels" },
  contrary: { term: "Contrary to", anchor: "terminology.md#contrary-to" },
  occasion: { term: "Restrictor", anchor: "terminology.md#restrictor" },
  sake: { term: "Sakes", anchor: "terminology.md#sakes" },
  bar: { term: "Bar", anchor: "terminology.md#bar" },
  quote: { term: "Span", anchor: "terminology.md#span-span-open" },
  attitude: { term: "Speaker attitude", anchor: "terminology.md#speaker-attitude" },
  binder: { term: "Domain / generic / every K", anchor: "terminology.md#domain-generic-every-k" },
  call: { term: "Vocative", anchor: "terminology.md#vocative" },
};

/** How far each reach goes, in words for the hover. */
export const REACH_LINES: Readonly<Record<FrameReach, string>> = {
  clause: "the whole clause",
  adjective: "only the adjective right after it",
  list: "only the items of its list",
  noun: "only its noun",
  word: "only its own word",
  nested: "only the words it holds",
};

/** One frame on one or more words of the text. Token indices are into `InspectResult.tokens`. */
export type FrameNote = {
  /** The frame's first word. */
  tokenIndex: number;
  /** Every word of the frame (a fused or multi-word frame), in its order. */
  tokenIndices: number[];
  family: FrameFamily;
  /** The learner term; absent when terminology.md has none for the family. */
  term?: string;
  /** `terminology.md#…` for `term`. */
  termAnchor?: string;
  /** The frame's owning grammar section, `page.md#heading`. */
  anchor: string;
  /** How far the form reaches (classification table); absent for a key with no reach. */
  reach?: FrameReach;
  /** `reach` in words. */
  reachLine?: string;
  /** First-word token indices of the frames this one covers (`Reading.order`). */
  covers: number[];
  /** First-word token indices of the frames that cover this one. */
  coveredBy: number[];
  /** The reading the frame sits in. */
  reading: ReadingId;
};

/** One pair in a sentence's list, by first-word token index. */
export type CoverNote = { over: number; under: number; kind: "rule" | "wordShape"; anchors: string[] };

/** A frame an earlier sentence set that still covers this one (evidentiality.md#carry-forward). */
export type CarriedNote = {
  /** The carried word in the earlier sentence. */
  tokenIndex: number;
  tokenIndices: number[];
  family?: FrameFamily;
  term?: string;
  termAnchor?: string;
  /** The section that says it carries. */
  anchor: string;
  /** The reading that set it. */
  from?: ReadingId;
  /** This sentence's own attitudes and feeling words that sit over the carried frame. */
  coveredBy: number[];
};

/** The list under a sentence: filled only when it has two or more whole-clause frames, carried ones included. */
export type SentenceNote = {
  reading: ReadingId;
  /** First-word token indices of the reading's whole-clause frames, in the reading's order. */
  frames: number[];
  covers: CoverNote[];
  /** Pairs no rule orders: shown as not settled, never ordered here. */
  unsettled: [number, number][];
  carried: CarriedNote[];
};

export type InspectNotes = { frames: FrameNote[]; sentences: SentenceNote[] };

/**
 * Frame notes for a text whose parse `inspectText` already made: pass its `parsed` and `tokens`. Frames inside a
 * quote are left out (their words are the quote's own parse), as are frames with no word (a tone mark).
 */
export function inspectNotes(parsed: ParseResult, tokens: readonly InspectToken[], options: ReadOptions = {}): InspectNotes {
  const byAt = new Map<number, number>();
  tokens.forEach((token, i) => {
    if (token.kind === "word" && token.word.at !== undefined) byAt.set(token.word.at, i);
  });
  const indices = (words: readonly LexWord[]): number[] =>
    words.flatMap((w) => (w.at !== undefined && byAt.has(w.at) ? [byAt.get(w.at)!] : []));
  return notesFromReadings(readParse(parsed, options), indices);
}

/**
 * The notes for readings already made, with `indices` mapping a frame's words to positions (token indices for the
 * inspector, word positions for the prompt's structure lines). A sentence is listed when it has `minFrames` or more
 * whole-clause frames, carried ones included (default 2).
 */
export function notesFromReadings(
  top: Reading[],
  indices: (words: readonly LexWord[]) => number[],
  minFrames = 2,
): InspectNotes {
  const readings = sentenceReadings(top);
  const notes = new Map<Frame, FrameNote>();
  const frames: FrameNote[] = [];
  const sentences: SentenceNote[] = [];

  for (const reading of readings) {
    for (const frame of readingFrames(reading)) {
      if (notes.has(frame)) continue;
      const at = indices(frame.words);
      if (at.length === 0) continue;
      const reach = classOf(frame.key)?.reach;
      const termOf = FAMILY_TERMS[frame.family];
      const note: FrameNote = {
        tokenIndex: at[0]!,
        tokenIndices: at,
        family: frame.family,
        ...(termOf ? { term: termOf.term, termAnchor: termOf.anchor } : {}),
        anchor: frame.anchor,
        ...(reach ? { reach, reachLine: REACH_LINES[reach] } : {}),
        covers: [],
        coveredBy: [],
        reading: reading.id,
      };
      notes.set(frame, note);
      frames.push(note);
    }
  }

  for (const reading of readings) {
    const covers: CoverNote[] = [];
    for (const o of reading.order) {
      const over = notes.get(o.over);
      const under = notes.get(o.under);
      if (!over || !under) continue;
      over.covers.push(under.tokenIndex);
      under.coveredBy.push(over.tokenIndex);
      covers.push({ over: over.tokenIndex, under: under.tokenIndex, kind: o.kind, anchors: o.anchors });
    }
    const unsettled = reading.unordered.flatMap(([a, b]): [number, number][] => {
      const na = notes.get(a);
      const nb = notes.get(b);
      return na && nb ? [[na.tokenIndex, nb.tokenIndex]] : [];
    });
    const carried = reading.links.flatMap((link): CarriedNote[] => {
      if (link.kind !== "carriedFrame") return [];
      const at = indices(link.frame?.words ?? link.words.slice(0, 1));
      if (at.length === 0) return [];
      const family = link.frame?.family;
      const termOf = family ? FAMILY_TERMS[family] : undefined;
      const coveredBy = (link.coveredBy ?? []).flatMap((f) => (notes.get(f) ? [notes.get(f)!.tokenIndex] : []));
      return [
        {
          tokenIndex: at[0]!,
          tokenIndices: at,
          ...(family ? { family } : {}),
          ...(termOf ? { term: termOf.term, termAnchor: termOf.anchor } : {}),
          anchor: link.anchor,
          ...(link.to ? { from: link.to } : {}),
          coveredBy,
        },
      ];
    });
    const whole = reading.frames.flatMap((f) => {
      const note = notes.get(f);
      return note && note.reach === "clause" ? [note.tokenIndex] : [];
    });
    if (whole.length + carried.length < minFrames) continue;
    sentences.push({ reading: reading.id, frames: whole, covers, unsettled, carried });
  }

  return { frames, sentences };
}

/** The notes on one token: a word may carry more than one frame. */
export function notesForToken(notes: InspectNotes, tokenIndex: number): FrameNote[] {
  return notes.frames.filter((n) => n.tokenIndices.includes(tokenIndex));
}

/** Every reading outside a quote, depth first in text order (clause-join members, dependents, islands). */
function sentenceReadings(top: Reading[]): Reading[] {
  const out: Reading[] = [];
  const seen = new Set<Reading>();
  const visitTerm = (term: Term | undefined): void => {
    if (!term) return;
    if (term.kind === "clause") visit(term.reading);
    if (term.kind === "list") {
      term.members.forEach(visitTerm);
      term.sharedDetails?.forEach(visitDetail);
    }
    if ("details" in term && term.details) term.details.forEach(visitDetail);
  };
  const visitDetail = (detail: Detail): void => {
    detail.content?.forEach(visit);
    visitTerm(detail.hosted);
    detail.details?.forEach(visitDetail);
  };
  const visit = (reading: Reading): void => {
    if (seen.has(reading)) return;
    seen.add(reading);
    out.push(reading);
    for (const frame of reading.frames) if (frame.family !== "quote") frame.content?.forEach(visit);
    const claim = reading.claim;
    [claim.verb, ...Object.values(claim.roles), ...claim.predicate, claim.clauses].forEach(visitTerm);
    claim.details.forEach(visitDetail);
  };
  top.forEach(visit);
  return out;
}

/**
 * The frames that belong to one reading: its own frames and every frame nested in its claim (adjective reach, list
 * reach, a stance list's join frame, frames held inside a frame). Nested readings are left to their own pass.
 */
function readingFrames(reading: Reading): Frame[] {
  const out: Frame[] = [];
  const seen = new Set<Frame>();
  const addFrame = (frame: Frame): void => {
    if (seen.has(frame)) return;
    seen.add(frame);
    out.push(frame);
    frame.inner?.forEach(addFrame);
    frame.details?.forEach(visitDetail);
    frame.occasions?.forEach(visitDetail);
    visitTerm(frame.hosted);
    visitTerm(frame.party);
  };
  const visitDetail = (detail: Detail): void => {
    detail.frames?.forEach(addFrame);
    detail.details?.forEach(visitDetail);
    visitTerm(detail.hosted);
  };
  const visitTerm = (term: Term | undefined): void => {
    if (!term || term.kind === "clause" || term.kind === "quote") return;
    if ("frames" in term) term.frames?.forEach(addFrame);
    if ("details" in term && term.details) term.details.forEach(visitDetail);
    if (term.kind === "list") {
      term.members.forEach(visitTerm);
      term.sharedDetails?.forEach(visitDetail);
      if (term.bound) visitDetail(term.bound);
    }
  };
  const visitList = (list: StanceList): void => {
    list.inner?.forEach(addFrame);
    list.details?.forEach(visitDetail);
  };
  reading.frames.forEach(addFrame);
  reading.stanceLists?.forEach(visitList);
  const claim = reading.claim;
  [claim.verb, ...Object.values(claim.roles), ...claim.predicate].forEach(visitTerm);
  claim.details.forEach(visitDetail);
  return out;
}
