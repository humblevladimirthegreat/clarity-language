/**
 * Carried frames (evidentiality.md#carry-forward): a channel, a holder or NOTIONAL on one of your statements goes on
 * over your later statements that have none of their own, until a new frame, a written statement word, *by the way*,
 * or a goodbye ends it.
 *
 * Read off the resolve stage's scope records ({@link clauseScopes}); never re-derived. The record names, for each later
 * bare statement, the word that set each frame; the reader turns each into a `carriedFrame` link.
 *
 * What the pages settle, and this file follows:
 * - Starts: a whole-clause channel, NOTIONAL or holder seam on a statement's main clause, never one in a dependent or on
 *   one clause-join member, which neither starts nor ends a frame (evidentiality.md#carry-forward,
 *   notional.md#notional-as-if-framing, holder.md#holder). A holder seam carries with the channel or NOTIONAL it sits on.
 *   A dated channel keeps its offset (dated-channel.md#dated-channel).
 * - Takes it: a statement with no such frame of its own, including one after a call, a reaction or an answer word, one
 *   with a linker or a topic word, and one with MAY or MIRATIVE (evidentiality.md#carry-forward, mirative.md#mirative).
 * - Neither takes nor ends: a question, a command, a request (the act word that is the real act, more-turn-words.md#stacked-acts);
 *   a hello.
 * - Ends: a new channel, NOTIONAL or holder (it replaces the frame); a written statement word as the real act;
 *   *by the way* (`xavedam`); a goodbye (word-endings.md#greeting, as the resolve stage tells it from a hello).
 */
import { offsetSign } from "./enforce.js";
import { linkerEnglish } from "./linkers.js";
import type { ClauseScope, ScopeFrame } from "./scope.js";
import { actWord } from "./series.js";
import type { BodyCarry, BodyClause, CarriedFrame, CarryKind, HUnit, LexWord, Utterance } from "./types.js";

/** The scope-frame keys that start a carry, and the kind each starts. */
const CARRY_KEYS: Readonly<Record<string, CarryKind>> = {
  "overlay:evidential:th": "channel",
  "overlay:notional:th": "notional",
  "xFamily:holder": "holder",
};

/** The real act is a statement: no written act word, or a statement word (`yal`, `yam`, `yar`) as the outer one. */
function writtenAct(utterance: Utterance): "statement" | "other" | undefined {
  const act = actWord(utterance.left);
  if (!act) return undefined;
  return act.family.kind === "joinMarker" && act.family.series === "a" ? "statement" : "other";
}

function hUnitOf(body: BodyClause, word: LexWord): HUnit | undefined {
  for (const unit of body.clause.units) if (unit.kind === "h" && unit.unit.word === word) return unit.unit;
  return undefined;
}

function offsetOf(unit: HUnit | undefined): CarriedFrame["offset"] {
  const hosted = unit?.hosted;
  if (!hosted || !offsetSign(hosted.bound, hosted.amount)) return undefined;
  return { bound: hosted.bound, ...(hosted.amount ? { amount: hosted.amount } : {}) };
}

/**
 * The carried frames a body sets: each channel, NOTIONAL and holder among its own clause's whole-clause frames. A MAY
 * under a holder seam carries nothing of its own (MAY does not carry, evidentiality.md#carry-forward); its holder does.
 */
function ownCarry(scope: ClauseScope | undefined, body: BodyClause, utteranceIndex: number, bodyIndex: number): CarriedFrame[] {
  const out: CarriedFrame[] = [];
  for (const frame of scope?.frames ?? []) {
    const kind = CARRY_KEYS[frame.key];
    if (!kind || (kind === "channel" && frame.member !== "channel")) continue;
    const offset = kind === "channel" ? offsetOf(hUnitOf(body, frame.word)) : undefined;
    out.push({ kind, word: frame.word, utteranceIndex, bodyIndex, ...(offset ? { offset } : {}) });
  }
  return out;
}

function isGreetingScope(scope: ClauseScope | undefined): boolean {
  return (scope?.frames ?? []).some((frame: ScopeFrame) => frame.key === "reading:greeting");
}

/**
 * For each sentence body that inherits a frame, the frames it inherits. `scopes` are the resolve stage's scope records;
 * `goodbyes` the utterances and bodies the resolve stage reads as a goodbye.
 */
export function carriedFrames(utterances: readonly Utterance[], scopes: readonly ClauseScope[], goodbyes: ReadonlySet<object>): BodyCarry[] {
  const byClause = new Map(scopes.filter((s) => !s.bodiless).map((s) => [s.clause, s]));
  const out: BodyCarry[] = [];
  let carry: CarriedFrame[] = [];
  utterances.forEach((utterance, utteranceIndex) => {
    const act = writtenAct(utterance);
    // A written statement word as the real act: back in your own voice (evidentiality.md#carry-forward).
    if (act === "statement" || goodbyes.has(utterance)) carry = [];
    // A question, command or request neither takes the frame nor ends it.
    if (act === "other") return;
    utterance.bodies.forEach((body, bodyIndex) => {
      const scope = byClause.get(body.clause);
      if (goodbyes.has(body)) {
        carry = [];
        return;
      }
      if (body.linker && linkerEnglish(body.linker) === "by-the-way") carry = [];
      const own = ownCarry(scope, body, utteranceIndex, bodyIndex);
      if (own.length > 0) {
        carry = own;
        return;
      }
      if (carry.length > 0 && !isGreetingScope(scope)) out.push({ utteranceIndex, bodyIndex, frames: carry });
    });
  });
  return out;
}
