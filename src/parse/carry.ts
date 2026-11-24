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
 *   notional.md#notional-as-if-framing, holder.md#naming-a-holder). The boundary table's `carryStart` and `carryEnd`
 *   cells say so (interpreter.md#boundaries). A holder seam carries with the channel or NOTIONAL it sits on.
 *   A dated channel keeps its offset (dated-channel.md#counting-from-now).
 * - Takes it: a statement with no such frame of its own, including one after a call, a reaction or an answer word, one
 *   with a linker or a topic word, and one with MAY or MIRATIVE (evidentiality.md#carry-forward, mirative.md#mirative).
 * - Neither takes nor ends: a question, a command, a request (the act word that is the real act, more-turn-words.md#stacked-acts);
 *   a hello; a statement that only wants, plans or decides (WANT, PLAN, DECISION), which claims nothing
 *   (evidentiality.md#carry-forward, intention.md#plan, want-and-decide.md#want, #decision-revisability).
 * - Under your own stance: a frame carried onto a statement with a speaker attitude or a feeling word on `/th/` sits under
 *   it; the claim takes the frame and the feeling stays yours (evidentiality.md#carry-forward, feelings.md#speaker-attitude,
 *   how-you-feel.md#feeling-word). `BodyCarry.coveredBy` names those words.
 * - Ends: a new channel, NOTIONAL or holder (it replaces the frame); a written statement word as the real act;
 *   *by the way* (`xavedam`); a goodbye (word-endings.md#greeting, as the resolve stage tells it from a hello).
 */
import { offsetSign } from "./enforce.js";
import { boundaryCell, todayOf, type BoundaryColumn, type NestedKind } from "./boundaries.js";
import { linkerEnglish } from "./linkers.js";
import type { ClauseScope, FrameFamily, ScopeFrame } from "./scope.js";
import { membersWhere, type MemberProfile } from "./scope-profiles.js";
import { actWord } from "./series.js";
import type { BodyCarry, BodyClause, CarriedFrame, CarryKind, Clause, HUnit, LexWord, Utterance } from "./types.js";

/** The scope-frame keys that start a carry, and the kind each starts. */
const CARRY_KEYS: Readonly<Record<string, CarryKind>> = {
  "overlay:evidential:th": "channel",
  "overlay:notional:th": "notional",
  "xFamily:holder": "holder",
};

/**
 * The keys of a stance that leaves no claim: its content is not asserted (intention.md#plan, want-and-decide.md#want,
 * #decision-revisability). The family profiles' members with `claims: false`.
 */
const NO_CLAIM_KEYS: ReadonlySet<string> = new Set(membersWhere((m) => m.claims === false).flatMap(({ member }) => member.keys ?? []));

/**
 * The members a carried frame sits under: a speaker attitude, an ordinary root on `/th/` (feelings.md#speaker-attitude),
 * and a feeling word. The family profiles' members that escape `carried`.
 */
const UNDER_OWN = membersWhere((m) => m.escapes?.includes("carried") ?? false);

/** A feeling word: a sake word with its horizon moved mid-word and an urge (how-you-feel.md#feeling-word). Plain sake words are not. */
function isFeelingWord(word: LexWord): boolean {
  return word.family.kind === "x" && word.family.xFamily === "sake" && word.family.horizon !== undefined;
}

/** Whether a frame is a member: of its family, with one of its keys if it names any, and a feeling word if it is one. */
function isMember(frame: ScopeFrame, family: FrameFamily, member: MemberProfile): boolean {
  if (frame.family !== family) return false;
  if (member.keys && !member.keys.includes(frame.key)) return false;
  return !member.feeling || isFeelingWord(frame.word);
}

/** The words of a body's own whole-clause stances that a carried frame sits under (evidentiality.md#carry-forward). */
function ownStanceWords(scope: ClauseScope | undefined): LexWord[] {
  return (scope?.frames ?? [])
    .filter((frame) => !frame.tone && UNDER_OWN.some((own) => isMember(frame, own.family, own.member)))
    .map((frame) => frame.word);
}

/** The real act is a statement: no written act word, or a statement word (`yal`, `yam`, `yar`) as the outer one. */
function writtenAct(utterance: Utterance): "statement" | "other" | undefined {
  const act = actWord(utterance.left);
  if (!act) return undefined;
  return act.family.kind === "joinMarker" && act.family.series === "a" ? "statement" : "other";
}

function hUnitOf(clause: Clause, word: LexWord): HUnit | undefined {
  for (const unit of clause.units) if (unit.kind === "h" && unit.unit.word === word) return unit.unit;
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
function ownCarry(scope: ClauseScope | undefined, clause: Clause, utteranceIndex: number, bodyIndex: number): CarriedFrame[] {
  const out: CarriedFrame[] = [];
  for (const frame of scope?.frames ?? []) {
    const kind = CARRY_KEYS[frame.key];
    if (!kind || (kind === "channel" && frame.member !== "channel")) continue;
    const offset = kind === "channel" ? offsetOf(hUnitOf(clause, frame.word)) : undefined;
    out.push({ kind, word: frame.word, utteranceIndex, bodyIndex, ...(offset ? { offset } : {}) });
  }
  return out;
}

/** A clause's clause-join members and dependents, nested ones included, each with its boundary kind (interpreter.md#boundaries). */
function nestedClauses(clause: Clause, out: { clause: Clause; kind: NestedKind }[] = []): { clause: Clause; kind: NestedKind }[] {
  for (const unit of clause.units) {
    if (unit.kind !== "clauseCoord") continue;
    for (const member of [unit.coord.first, ...unit.coord.links.map((link) => link.clause)]) {
      if (!member) continue;
      out.push({ clause: member, kind: "member" });
      nestedClauses(member, out);
    }
  }
  const dependent = clause.dependent;
  if (dependent) {
    out.push({ clause: dependent.clause, kind: dependent.orodo.reading === "standIn" ? "standInDependent" : "slotDependent" });
    nestedClauses(dependent.clause, out);
  }
  return out;
}

/**
 * The frames a body's nested clauses set, where the boundary table lets `column` (carry start or end) pass out of them
 * (interpreter.md#boundaries). Today every such cell blocks: a channel starts or ends a frame only on the main clause.
 */
function nestedCarry(
  column: BoundaryColumn,
  body: BodyClause,
  byClause: ReadonlyMap<Clause, ClauseScope>,
  utteranceIndex: number,
  bodyIndex: number,
): CarriedFrame[] {
  return nestedClauses(body.clause)
    .filter(({ kind }) => todayOf(boundaryCell(kind, column)) === "passes")
    .flatMap(({ clause }) => ownCarry(byClause.get(clause), clause, utteranceIndex, bodyIndex));
}

function isGreetingScope(scope: ClauseScope | undefined): boolean {
  return (scope?.frames ?? []).some((frame: ScopeFrame) => frame.key === "reading:greeting");
}

/**
 * For each sentence body that inherits a frame, the frames it inherits. `scopes` are the resolve stage's scope records;
 * `goodbyes` the utterances and bodies the resolve stage reads as a goodbye.
 *
 * `speakers` names who says each sentence, in text order (one per body, or per bodiless utterance). Each speaker keeps
 * a frame of their own: another speaker's reply neither takes nor ends it, and it is still in force when its speaker
 * goes on (evidentiality.md#carry-forward). A goodbye ends the conversation, so it ends every speaker's frame. Unset:
 * one speaker.
 */
export function carriedFrames(
  utterances: readonly Utterance[],
  scopes: readonly ClauseScope[],
  goodbyes: ReadonlySet<object>,
  speakers?: readonly string[],
): BodyCarry[] {
  const byClause = new Map(scopes.filter((s) => !s.bodiless).map((s) => [s.clause, s]));
  const out: BodyCarry[] = [];
  const carries = new Map<string, CarriedFrame[]>();
  let sentence = 0;
  const speakerAt = (index: number): string => speakers?.[index] ?? "";
  utterances.forEach((utterance, utteranceIndex) => {
    const first = sentence;
    sentence += Math.max(utterance.bodies.length, 1);
    const act = writtenAct(utterance);
    if (goodbyes.has(utterance)) carries.clear();
    // A written statement word as the real act: back in your own voice (evidentiality.md#carry-forward).
    else if (act === "statement") carries.delete(speakerAt(first));
    // A question, command or request neither takes the frame nor ends it.
    if (act === "other") return;
    utterance.bodies.forEach((body, bodyIndex) => {
      const speaker = speakerAt(first + bodyIndex);
      const scope = byClause.get(body.clause);
      if (goodbyes.has(body)) {
        carries.clear();
        return;
      }
      if (body.linker && linkerEnglish(body.linker) === "by-the-way") carries.delete(speaker);
      const own = [...ownCarry(scope, body.clause, utteranceIndex, bodyIndex), ...nestedCarry("carryStart", body, byClause, utteranceIndex, bodyIndex)];
      if (own.length === 0 && nestedCarry("carryEnd", body, byClause, utteranceIndex, bodyIndex).length > 0) carries.delete(speaker);
      if (own.length > 0) {
        carries.set(speaker, own);
        return;
      }
      // Only wanting, planning or deciding claims nothing: the frame skips it (evidentiality.md#carry-forward).
      if ((scope?.frames ?? []).some((frame) => NO_CLAIM_KEYS.has(frame.key))) return;
      const carry = carries.get(speaker) ?? [];
      if (carry.length > 0 && !isGreetingScope(scope)) {
        const coveredBy = ownStanceWords(scope);
        out.push({ utteranceIndex, bodyIndex, frames: carry, ...(coveredBy.length > 0 ? { coveredBy } : {}) });
      }
    });
  });
  return out;
}
