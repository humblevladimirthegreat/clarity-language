/**
 * Scope order of whole-clause frames (clause.md#which-covers-which).
 *
 * Two tables copied as data from `docs/meta/interpreter.md`, never re-derived:
 * - {@link FRAME_KEYS}: the frame rows of the classification table (key → family, and whether the form reaches the
 *   whole clause).
 * - {@link PAIR_ROWS}: the pair table, one row per pair of families, with the anchor of its rule.
 *
 * {@link clauseScopes} reads each clause's whole-clause frames off the tree and emits, for every two of them, the
 * order the pair table gives: the earlier over the later by text order (the decided rule), a fixed order where a
 * row states one, nothing where the pair commutes, and an `unordered` entry where the pair is still unsettled.
 */
import { overlayKey, type ClassifyTables } from "./classify.js";
import { stackKind } from "./series.js";
import { isGreeting } from "./ast-walk.js";
import type { BodyClause, Clause, HUnit, LeftEdge, LexWord, NpCoord, NpPackage, ToneRecord, Unit, Utterance } from "./types.js";

export type FrameFamily =
  | "force"
  | "polarity"
  | "say"
  | "stance"
  | "holder"
  | "hinge"
  | "intention"
  | "ability"
  | "phase"
  | "residue"
  | "notional"
  | "mirative"
  | "contrary"
  | "occasion"
  | "sake"
  | "attitude"
  | "bar"
  | "quote"
  | "binder"
  | "call"
  | "unknown";

/** How far a frame form reaches: only `clause` forms pair. */
export type FrameReach = "clause" | "adjective" | "list" | "noun" | "word" | "nested";

export type FrameKeyRow = { family: FrameFamily; reach: FrameReach; anchor: string };

/** The frame rows of the classification table (interpreter.md#classification-table). */
export const FRAME_KEYS: Readonly<Record<string, FrameKeyRow>> = {
  "unit:writingSpan": { family: "quote", reach: "nested", anchor: "spans.md#writing" },
  "hookJob:zone": { family: "contrary", reach: "clause", anchor: "contrary-to.md#contrary-to-stance" },
  "lexReading:sake": { family: "sake", reach: "clause", anchor: "sakes.md#word-shape" },
  "lexReading:sake:g": { family: "sake", reach: "noun", anchor: "for-a-sake.md#whose-stake" },
  "lexReading:ability": { family: "ability", reach: "clause", anchor: "can-and-cant.md#ability" },
  "lexReading:greeting": { family: "force", reach: "clause", anchor: "word-endings.md#greeting" },
  "lexReading:restrictor": { family: "occasion", reach: "clause", anchor: "restrictors.md#only-when-never-hal" },
  "lexReading:restrictor:w": { family: "occasion", reach: "adjective", anchor: "restrictors.md#on-the-following-adjective-w" },
  "lexReading:number:th": { family: "stance", reach: "clause", anchor: "number-roles.md#number-as-stance-by-marker" },
  "lexReading:unknown": { family: "unknown", reach: "nested", anchor: "" },
  "wordFamily:say": { family: "say", reach: "clause", anchor: "permission-consent.md#say-words" },
  "xFamily:sake": { family: "sake", reach: "clause", anchor: "sakes.md#word-shape" },
  "xFamily:holder": { family: "holder", reach: "clause", anchor: "holder.md#naming-a-holder" },
  "xFamily:ability": { family: "ability", reach: "word", anchor: "can-and-cant.md#ability" },
  "overlay:sake:th": { family: "sake", reach: "clause", anchor: "sakes.md#word-shape" },
  "overlay:sake:w": { family: "sake", reach: "adjective", anchor: "sakes.md#personal-possession" },
  "overlay:evidential:th": { family: "stance", reach: "clause", anchor: "knowing.md#live-vs-memory" },
  "overlay:evidential:w": { family: "stance", reach: "adjective", anchor: "universality.md#mood-on-one-adjective" },
  "overlay:mirative:th": { family: "mirative", reach: "clause", anchor: "mirative.md#mirative" },
  "overlay:residue:h": { family: "residue", reach: "clause", anchor: "residue-and-former.md#residue-and-former-climate" },
  "overlay:residue:w": { family: "residue", reach: "adjective", anchor: "universality.md#mood-on-one-adjective" },
  "overlay:former_climate:h": { family: "residue", reach: "clause", anchor: "residue-and-former.md#residue-and-former-climate" },
  "overlay:former_climate:w": { family: "residue", reach: "adjective", anchor: "universality.md#mood-on-one-adjective" },
  "overlay:plan:th": { family: "intention", reach: "clause", anchor: "intention.md#plan" },
  "overlay:decision:th": { family: "intention", reach: "clause", anchor: "want-and-decide.md#decision-revisability" },
  "overlay:may:th": { family: "stance", reach: "clause", anchor: "knowing.md#may" },
  "overlay:may:w": { family: "stance", reach: "adjective", anchor: "universality.md#mood-on-one-adjective" },
  "overlay:notional:th": { family: "notional", reach: "clause", anchor: "notional.md#notional-as-if-framing" },
  "overlay:notional:w": { family: "notional", reach: "adjective", anchor: "universality.md#mood-on-one-adjective" },
  "overlay:ability:h": { family: "ability", reach: "clause", anchor: "can-and-cant.md#ability-fallback" },
  "overlay:ability:w": { family: "ability", reach: "adjective", anchor: "can-and-cant.md#ability-fallback" },
  "overlay:clause_hinge:th": { family: "hinge", reach: "clause", anchor: "causation.md#if" },
  "overlay:clause_hinge:g": { family: "hinge", reach: "noun", anchor: "causation.md#if" },
  "overlay:clause_hinge:h": { family: "hinge", reach: "clause", anchor: "dependents.md#hinges" },
  "overlay:cause:th": { family: "hinge", reach: "clause", anchor: "cause.md#cause" },
  "overlay:cause:w": { family: "hinge", reach: "adjective", anchor: "cause.md#cause" },
  "overlay:stimulus:g": { family: "sake", reach: "noun", anchor: "sakes.md#personal-possession" },
  "overlay:phasal:h": { family: "phase", reach: "clause", anchor: "already-still-yet.md#stage-of-change" },
  "overlay:phasal:w": { family: "phase", reach: "adjective", anchor: "already-still-yet.md#stage-of-change" },
  "overlay:phasal:th": { family: "phase", reach: "clause", anchor: "already-still-yet.md#stage-of-change" },
  "overlay:attempt:h": { family: "intention", reach: "clause", anchor: "try.md#trying" },
  "overlay:want:th": { family: "intention", reach: "clause", anchor: "want-and-decide.md#want" },
  "joinSeries:u": { family: "polarity", reach: "list", anchor: "joins.md#negation-u" },
  "joinSeries:u:standalone": { family: "polarity", reach: "clause", anchor: "verb-and-stance-joins.md#standalone-stance-joins" },
  "joinSeries:ua": { family: "binder", reach: "clause", anchor: "joins.md#everything-ua" },
  "slot:newMember": { family: "binder", reach: "clause", anchor: "joins.md#everything-ua" },
  "joinSeries:uo": { family: "binder", reach: "clause", anchor: "rank-joins.md#invert-u-stacks" },
  "joinSeries:ue": { family: "polarity", reach: "list", anchor: "set-joins.md#exclusivity-and-denying-a-whole-list" },
  "ask:yesNo": { family: "force", reach: "clause", anchor: "questions.md#question" },
  "ask:fillAsk": { family: "force", reach: "clause", anchor: "questions.md#fill-ask" },
  "ask:rhetorical": { family: "force", reach: "clause", anchor: "more-turn-words.md#rhetorical" },
  "slot:bar": { family: "bar", reach: "nested", anchor: "bars.md#bars" },
  "slot:th": { family: "attitude", reach: "clause", anchor: "feelings.md#speaker-attitude" },
  "edge:vocative": { family: "call", reach: "clause", anchor: "speech-moves.md#vocative" },
  "edge:interjection": { family: "attitude", reach: "clause", anchor: "speech-moves.md#interjections-reactions" },
  "edge:force": { family: "force", reach: "clause", anchor: "speech-moves.md#speech-act-statement-question-command" },
  "edge:tone": { family: "attitude", reach: "clause", anchor: "tone-marks.md#showing-your-tone" },
  "reading:bareQuestion": { family: "force", reach: "clause", anchor: "questions.md#question" },
  "reading:greeting": { family: "force", reach: "clause", anchor: "word-endings.md#greeting" },
};

/** Which member of a family a frame is, where a pair row tells members apart. */
/** `repeat`: either word of a doubled act word (more-turn-words.md#doubled-act). */
export type FrameMember = "channel" | "may" | "number" | "residue" | "former" | "repeat";

export type ScopeFrame = {
  family: FrameFamily;
  /** Its classification-table key (a key of {@link FRAME_KEYS}). */
  key: string;
  /** The word that carries it: text, gloss, and position (`word.at`). */
  word: LexWord;
  member?: FrameMember;
  /** A holder's stance, NOTIONAL or intention: the frame the holder seam sits on (holder.md#naming-a-holder). */
  holderHost?: true;
  /**
   * A tone mark before the rest of the sentence (tone-marks.md#showing-your-tone). No word carries it: `word` is the first
   * word it colors, and its place in the text is just before that word.
   */
  tone?: ToneRecord;
};

export type PairKind = "rule" | "wordShape";

/** `over` covers `under`. */
export type ScopeOrder = { over: ScopeFrame; under: ScopeFrame; kind: PairKind; anchors: string[] };

/** A pair no rule orders yet: no reader, consumer, or host picks an order for it. */
export type ScopeUnordered = { frames: [ScopeFrame, ScopeFrame]; anchors: string[] };

export type ClauseScope = {
  clause: Clause;
  utteranceIndex: number;
  /** Whole-clause frames in text order. */
  frames: ScopeFrame[];
  order: ScopeOrder[];
  unordered: ScopeUnordered[];
  /** The record of a turn with no body: its `clause` is empty, and the reader matches it by `utteranceIndex`. */
  bodiless?: true;
};

const TEXT_ORDER = "clause.md#which-covers-which";
const MAY_BEFORE = "already-still-yet.md#stage-of-change";
const HOLDER = "holder.md#what-the-holder-covers";

/** One case of a pair row: `over` names the family that covers, `textOrder` the earlier over the later. */
type PairCase =
  | { order: "textOrder"; anchors: string[]; when?: Partial<Record<FrameFamily, FrameMember[]>> }
  | { order: "over"; over: FrameFamily; anchors: string[]; when?: Partial<Record<FrameFamily, FrameMember[]>> }
  | { order: "commutes"; anchors: string[]; when?: Partial<Record<FrameFamily, FrameMember[]>> }
  | { order: "unsettled"; anchors: string[]; when?: Partial<Record<FrameFamily, FrameMember[]>> };

type PairRow = { pair: [FrameFamily, FrameFamily]; kind: "rule" | "wordShape" | "commutes" | "unsettled"; cases: PairCase[] };

const text = (...anchors: string[]): PairCase => ({ order: "textOrder", anchors: [TEXT_ORDER, ...anchors] });
const over = (family: FrameFamily, ...anchors: string[]): PairCase => ({ order: "over", over: family, anchors });
const commutes = (...anchors: string[]): PairCase => ({ order: "commutes", anchors });
const REMARKS = ["mirative.md#mirative", "feelings.md#speaker-attitude", "for-a-sake.md#whose-stake", "contrary-to.md#contrary-to-stance"];
const ACT_EDGE = "speech-moves.md#speech-act-statement-question-command";
const HINGE_LAST = ["dependents.md#hinges", "stand-in-vowels.md#stand-in-back"];
const STANDALONE = "verb-and-stance-joins.md#standalone-stance-joins";
/** A `/th/` word right before a `/th/` join is its item; with words between, it is a frame of its own. */
const REACH = "verb-and-stance-joins.md#stance-join-reach";
const CHANNEL: Partial<Record<FrameFamily, FrameMember[]>> = { stance: ["channel"] };
/** A channel follows text order: first, how you know the whole generalization; after a fence or restrictor, each case. */
const GENERALIZATION = "usually-vs-must.md#generalization";

const CALL = "speech-moves.md#vocative";
/** Every family a call can share a clause with, itself included: a call commutes with each. */
const CALL_PAIRS: readonly FrameFamily[] = [
  "force",
  "polarity",
  "say",
  "stance",
  "holder",
  "hinge",
  "intention",
  "ability",
  "phase",
  "residue",
  "notional",
  "mirative",
  "contrary",
  "occasion",
  "sake",
  "attitude",
  "binder",
  "call",
];

function rule(a: FrameFamily, b: FrameFamily, ...cases: PairCase[]): PairRow {
  return { pair: [a, b], kind: "rule", cases };
}

/**
 * The pair table (interpreter.md#pair-table), one row per pair in the table's order. Same-family pairs other than
 * `stance` × `stance` follow the scope statements: `binder`, `intention` by text order; tone marks commute (never on
 * the tree). Any other pair with no row takes the decided rule, text order.
 */
export const PAIR_ROWS: readonly PairRow[] = [
  rule("force", "say", over("force", ACT_EDGE)),
  rule("force", "sake", over("sake", "for-a-sake.md#whose-stake")),
  rule("force", "attitude", over("attitude", "feelings.md#speaker-attitude")),
  rule("force", "binder", over("force", ACT_EDGE)),
  rule("force", "hinge", over("force", "causation.md#if")),
  rule("force", "stance", over("force", "want-and-decide.md#whose-intention")),
  rule("force", "holder", over("force", HOLDER)),
  rule("force", "intention", over("force", "want-and-decide.md#whose-intention")),
  rule("force", "ability", over("force", ACT_EDGE)),
  rule("force", "phase", over("force", ACT_EDGE)),
  rule("force", "residue", over("force", ACT_EDGE)),
  rule("force", "notional", over("force", ACT_EDGE)),
  rule("force", "mirative", over("mirative", "mirative.md#mirative")),
  rule("force", "contrary", over("force", ACT_EDGE)),
  rule("force", "occasion", over("force", ACT_EDGE)),
  rule("say", "sake", text()),
  rule("say", "attitude", text()),
  rule("say", "binder", text()),
  rule("say", "hinge", text(...HINGE_LAST)),
  rule("say", "stance", text()),
  rule("say", "holder", over("holder", HOLDER)),
  rule("say", "intention", text()),
  rule("say", "ability", text()),
  rule("say", "phase", text()),
  rule("say", "residue", text()),
  rule("say", "notional", text()),
  rule("say", "mirative", text()),
  rule("say", "contrary", text()),
  rule("say", "occasion", text()),
  { pair: ["sake", "attitude"], kind: "commutes", cases: [commutes(...REMARKS)] },
  rule("sake", "binder", text()),
  rule("sake", "hinge", text(...HINGE_LAST)),
  rule("sake", "stance", text(MAY_BEFORE)),
  rule("sake", "holder", { order: "textOrder", anchors: [HOLDER] }),
  rule("sake", "intention", text()),
  rule("sake", "ability", text()),
  rule("sake", "phase", text()),
  rule("sake", "residue", text()),
  rule("sake", "notional", text()),
  { pair: ["sake", "mirative"], kind: "commutes", cases: [commutes(...REMARKS)] },
  { pair: ["sake", "contrary"], kind: "commutes", cases: [commutes(...REMARKS)] },
  rule("sake", "occasion", text()),
  rule("attitude", "binder", text()),
  rule("attitude", "hinge", text(...HINGE_LAST)),
  rule("attitude", "stance", { ...commutes("feelings.md#speaker-attitude"), when: CHANNEL }, text(MAY_BEFORE)),
  rule("attitude", "holder", over("attitude", HOLDER)),
  rule("attitude", "intention", text()),
  rule("attitude", "ability", text()),
  rule("attitude", "phase", text()),
  rule("attitude", "residue", text()),
  rule("attitude", "notional", text()),
  { pair: ["attitude", "mirative"], kind: "commutes", cases: [commutes(...REMARKS)] },
  { pair: ["attitude", "contrary"], kind: "commutes", cases: [commutes(...REMARKS)] },
  rule("attitude", "occasion", text()),
  rule("binder", "hinge", text("dependents.md#hinges")),
  // Text order for every member: a channel first is about the whole generalization, after the binder about each case.
  rule("binder", "stance", text(GENERALIZATION)),
  rule("binder", "holder", over("holder", HOLDER)),
  rule("binder", "intention", text()),
  rule("binder", "ability", text()),
  rule("binder", "phase", text()),
  rule("binder", "residue", text()),
  rule("binder", "notional", text()),
  rule("binder", "mirative", text()),
  rule("binder", "contrary", text()),
  rule("binder", "occasion", text()),
  rule(
    "hinge",
    "stance",
    { ...over("stance", "evidentiality.md#evidence-clause", "usually-vs-must.md#generalization"), when: CHANNEL },
    text(MAY_BEFORE, ...HINGE_LAST),
  ),
  rule("hinge", "holder", { order: "textOrder", anchors: [HOLDER] }),
  rule("hinge", "intention", text(...HINGE_LAST)),
  rule("hinge", "ability", text(...HINGE_LAST)),
  rule("hinge", "phase", text(...HINGE_LAST)),
  rule("hinge", "residue", text(...HINGE_LAST)),
  rule("hinge", "notional", text(...HINGE_LAST)),
  rule("hinge", "mirative", text(...HINGE_LAST)),
  rule("hinge", "contrary", text(...HINGE_LAST)),
  rule("hinge", "occasion", over("occasion", "usually-vs-must.md#generalization")),
  { pair: ["stance", "holder"], kind: "wordShape", cases: [over("holder", HOLDER)] },
  rule("stance", "intention", text(MAY_BEFORE)),
  rule("stance", "ability", text()),
  rule("stance", "phase", text(MAY_BEFORE)),
  rule("stance", "residue", text()),
  rule("stance", "notional", text(MAY_BEFORE)),
  rule("stance", "mirative", { ...commutes("mirative.md#mirative"), when: CHANNEL }, text(MAY_BEFORE)),
  { pair: ["stance", "contrary"], kind: "commutes", cases: [commutes("contrary-to.md#contrary-to-stance")] },
  rule("stance", "occasion", text(GENERALIZATION)),
  { pair: ["holder", "intention"], kind: "wordShape", cases: [over("holder", "want-and-decide.md#whose-intention")] },
  rule("holder", "ability", over("holder", HOLDER)),
  rule("holder", "phase", over("holder", HOLDER)),
  rule("holder", "residue", over("holder", HOLDER)),
  { pair: ["holder", "notional"], kind: "wordShape", cases: [over("holder", "notional.md#follow-up-endings-notional")] },
  rule("holder", "mirative", over("holder", HOLDER)),
  // A holder inside the `uom` zone is the contrary frame's content and never pairs; elsewhere the holder covers
  // everything in its clause, wherever it sits.
  rule("holder", "contrary", over("holder", HOLDER)),
  rule("holder", "occasion", over("holder", HOLDER)),
  rule("intention", "ability", text()),
  rule("intention", "phase", text()),
  rule("intention", "residue", text()),
  rule("intention", "notional", text()),
  rule("intention", "mirative", text()),
  { pair: ["intention", "contrary"], kind: "commutes", cases: [commutes("contrary-to.md#contrary-to-stance")] },
  rule("intention", "occasion", text()),
  rule("ability", "phase", text()),
  rule("ability", "residue", text()),
  rule("ability", "notional", text()),
  rule("ability", "mirative", text()),
  rule("ability", "contrary", text()),
  rule("ability", "occasion", text()),
  rule("phase", "residue", text()),
  rule("phase", "notional", text()),
  rule("phase", "mirative", text()),
  rule("phase", "contrary", text()),
  rule("phase", "occasion", text()),
  rule("residue", "notional", text()),
  rule("residue", "mirative", text()),
  rule("residue", "contrary", text()),
  rule(
    "residue",
    "occasion",
    { ...over("residue", "residue-and-former.md#residue-and-former-climate"), when: { residue: ["former"] } },
    text(),
  ),
  rule("notional", "mirative", text()),
  rule("notional", "contrary", text()),
  rule("notional", "occasion", text()),
  { pair: ["mirative", "contrary"], kind: "commutes", cases: [commutes(...REMARKS)] },
  rule("mirative", "occasion", text()),
  rule("contrary", "occasion", text()),
  rule("stance", "stance", text(MAY_BEFORE)),
  rule("polarity", "force", over("force", ACT_EDGE)),
  rule("polarity", "stance", text(STANDALONE, REACH)),
  rule("polarity", "intention", text(STANDALONE, REACH)),
  rule("polarity", "hinge", text(...HINGE_LAST, STANDALONE, REACH)),
  rule("polarity", "ability", text(STANDALONE)),
  rule("polarity", "say", text(STANDALONE)),
  rule("polarity", "sake", text(STANDALONE, REACH)),
  rule("polarity", "attitude", text(STANDALONE, REACH)),
  rule("polarity", "binder", text()),
  // Under a holder a standalone stance join is the holder's, as a stance word is.
  rule("polarity", "holder", over("holder", HOLDER)),
  rule("polarity", "phase", text(STANDALONE)),
  rule("polarity", "residue", text(STANDALONE)),
  rule("polarity", "notional", text(STANDALONE, REACH)),
  rule("polarity", "mirative", text(STANDALONE, REACH)),
  rule("polarity", "contrary", text(STANDALONE, REACH)),
  rule("polarity", "occasion", text(STANDALONE)),
  // Same-family pairs from the scope statements.
  rule("binder", "binder", text("joins.md#everything-ua")),
  rule("intention", "intention", text("intention.md#plan")),
  // Two act words: a doubled one is the same act, only more insistent; of two different ones the first is the act
  // and the second how it sounds, so the first covers the second.
  rule(
    "force",
    "force",
    { ...commutes("more-turn-words.md#doubled-act"), when: { force: ["repeat"] } },
    { order: "textOrder", anchors: ["more-turn-words.md#stacked-acts"] },
  ),
  // A call names who the turn is for and commutes with every other frame in its clause (speech-moves.md#vocative).
  ...CALL_PAIRS.map((family): PairRow => ({ pair: ["call", family], kind: "commutes", cases: [commutes(CALL)] })),
];

/** Families that never pair (interpreter.md#pair-table, "Never in a pair"). */
const NEVER_PAIRS = new Set<FrameFamily>(["bar", "quote", "unknown"]);

function pairKey(a: FrameFamily, b: FrameFamily): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

const PAIRS = new Map<string, PairRow>(PAIR_ROWS.map((row) => [pairKey(row.pair[0], row.pair[1]), row]));

/** The pair table's row for two families, if it has one. */
export function pairRow(a: FrameFamily, b: FrameFamily): PairRow | undefined {
  return PAIRS.get(pairKey(a, b));
}

const DEFAULT_ROW: PairRow = { pair: ["unknown", "unknown"], kind: "rule", cases: [text()] };

function caseMatches(when: PairCase["when"], a: ScopeFrame, b: ScopeFrame): boolean {
  if (!when) return true;
  return Object.entries(when).every(([family, members]) =>
    [a, b].some((frame) => frame.family === family && frame.member !== undefined && members!.includes(frame.member)),
  );
}

/** MAY right before the `/th/` word it covers (already-still-yet.md#stage-of-change). */
function mayRightBefore(earlier: ScopeFrame, later: ScopeFrame): boolean {
  return earlier.member === "may" && later.word.pos === "th" && later.word.at === (earlier.word.at ?? -2) + 1;
}

const position = (frame: ScopeFrame): number => (frame.tone ? frame.tone.at - 0.5 : (frame.word.at ?? -1));

const TONE = "tone-marks.md#showing-your-tone";

function orderPair(a: ScopeFrame, b: ScopeFrame, scope: ClauseScope): void {
  // A holder and the stance, NOTIONAL or intention its seam sits on: fixed by word shape.
  if (a.word === b.word && !a.tone && !b.tone && (a.holderHost || b.holderHost)) {
    const [holder, host] = a.family === "holder" ? [a, b] : [b, a];
    scope.order.push({ over: holder, under: host, kind: "wordShape", anchors: [HOLDER] });
    return;
  }
  // Two tone marks: each colors its own words, and a later free-standing mark takes over from its place on, so the
  // pair commutes (tone-marks.md#showing-your-tone).
  if (a.tone && b.tone) return;
  const row = pairRow(a.family, b.family) ?? DEFAULT_ROW;
  const found = row.cases.find((c) => caseMatches(c.when, a, b));
  if (!found || found.order === "commutes") return;
  if (found.order === "unsettled") {
    scope.unordered.push({ frames: [a, b], anchors: found.anchors });
    return;
  }
  const kind: PairKind = row.kind === "wordShape" ? "wordShape" : "rule";
  if (found.order === "over") {
    const [top, bottom] = a.family === found.over ? [a, b] : [b, a];
    scope.order.push({ over: top, under: bottom, kind, anchors: found.anchors });
    return;
  }
  const [earlier, later] = position(a) <= position(b) ? [a, b] : [b, a];
  const anchors = found.anchors.filter((anchor) => anchor !== MAY_BEFORE || mayRightBefore(earlier, later));
  scope.order.push({ over: earlier, under: later, kind, anchors });
}

// ── Reading frames off the tree ─────────────────────────────────────────────

const TIME_HINGES = new Set(["while", "until", "by", "before", "after", "as-of.ledger", "as-of.bookmark"]);

function frame(key: string, word: LexWord, member?: FrameMember): ScopeFrame | undefined {
  const row = FRAME_KEYS[key];
  if (!row || row.reach !== "clause") return undefined;
  return { family: row.family, key, word, ...(member ? { member } : {}) };
}

function overlayFrame(word: LexWord, kind: string, pos: string): ScopeFrame | undefined {
  if ((kind === "clause_hinge" || kind === "cause") && word.overlay && TIME_HINGES.has(word.overlay.gloss)) return undefined;
  const member: FrameMember | undefined =
    kind === "may" ? "may" : kind === "evidential" ? "channel" : kind === "residue" ? "residue" : kind === "former_climate" ? "former" : undefined;
  return frame(`overlay:${kind}:${pos}`, word, member);
}

/** The holder seam's host row: an evidential, MAY or NOTIONAL `/th/` overlay (holder.md#naming-a-holder). */
function holderFrames(word: LexWord, tables: ClassifyTables | undefined): ScopeFrame[] {
  const holder = frame("xFamily:holder", word);
  if (!holder) return [];
  const family = word.family;
  if (family.kind !== "x" || !tables) return [holder];
  const row = tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade ?? ""}`));
  const host = row ? overlayFrame(word, row.kind, "th") : undefined;
  return host ? [holder, { ...host, holderHost: true }] : [holder];
}

/** Whole-clause frames carried by one `/h/` or `/th/` word. */
function wordFrames(unit: HUnit, tables: ClassifyTables | undefined): ScopeFrame[] {
  const word = unit.word;
  const family = word.family;
  const pos = word.pos ?? "";
  if (family.kind === "say") return [frame("wordFamily:say", word)].filter((f) => f !== undefined);
  if (family.kind === "joinMarker" && word.reading === "join") {
    // A standalone `/th/` `u` join closes no stance words and pairs; one that closes stance words is that list's join
    // (the stance join node, verb-and-stance-joins.md#stance-join-reach).
    if (pos !== "th" || family.series !== "u" || unit.closes?.length !== 0) return [];
    return [frame("joinSeries:u:standalone", word)].filter((f) => f !== undefined);
  }
  if (family.kind === "x" && family.xFamily === "holder") return holderFrames(word, tables);
  let found: ScopeFrame | undefined;
  switch (word.reading) {
    case "overlay":
      found = word.overlay ? overlayFrame(word, word.overlay.kind, pos) : undefined;
      break;
    case "sake":
      found = pos === "th" ? frame("lexReading:sake", word) : undefined;
      break;
    case "ability":
      found = pos === "h" ? frame("lexReading:ability", word) : undefined;
      break;
    case "restrictor":
      found = pos === "h" ? frame("lexReading:restrictor", word) : undefined;
      break;
    case "number":
      found = pos === "th" ? frame("lexReading:number:th", word, "number") : undefined;
      break;
    case "ordinary":
      found = pos === "th" && family.kind === "content" ? frame("slot:th", word) : undefined;
      break;
  }
  return found ? [found] : [];
}

/** A noun that brings in a new member: a plain first mention, concrete `-l` or abstract `-m` (word-endings.md#concrete-l), a dictionary root or an `x` compound. */
function memberNoun(head: LexWord): boolean {
  const kind = head.family.kind === "content" || (head.family.kind === "x" && head.family.xFamily === "compound");
  return kind && !head.bl && head.reading === "ordinary" && (head.ending === "l" || head.ending === "m");
}

/**
 * A measure phrase (measures-and-percent.md#units): a unit noun, the abstract `-m` sense of a root, with its amount as
 * a `/ɡ/` number. It gives an amount, not members. A counted `-l` noun (*three cats*) and an `-m` noun with no number
 * are not measures.
 */
function isMeasure(pkg: NpPackage): boolean {
  return pkg.head.ending === "m" && pkg.adjs.some((adj) => adj.word.pos === "g" && adj.word.family.kind === "number");
}

/** An `a`-series join with no hook: the and-list (`-l`) or its unspecified member (`-r`, joins.md#unspecified-member-r-phrase). */
function memberJoin(join: LexWord | undefined, ending: "l" | "r"): boolean {
  return join?.family.kind === "joinMarker" && join.family.series === "a" && !join.family.hook && join.ending === ending;
}

/**
 * The first word of a role phrase that brings in a new member (joins.md#everything-ua), or undefined: a lone member
 * noun (a tag may name it; its adjectives, a number among them, sit inside the phrase); an and-list of member nouns,
 * fenced or not, which scopes as one phrase at its position; or a phrase with the unspecified member `-r`, whatever its
 * items. A hook's landmark counts like a role phrase (*at a house*). A fill-ask blank in `blanks` asks and brings no
 * member in (questions.md#fill-ask); nor does a measure phrase (measures-and-percent.md#units).
 */
export function newMemberHead(coord: NpCoord, blanks?: ReadonlySet<LexWord>): LexWord | undefined {
  const parts = coord.parts;
  const first = parts[0];
  if (!first) return undefined;
  const lead = first.items[0]?.kind === "package" ? first.items[0].package.head : first.items.length === 0 ? first.join : undefined;
  if (!lead) return undefined;
  if (blanks && isBlankPhrase(coord, blanks)) return undefined;
  const nouns = parts.every((part) => part.items.every((item) => item.kind === "package" && memberNoun(item.package.head) && !isMeasure(item.package)));
  if (parts.length === 1 && !first.join) return first.items.length === 1 && nouns ? lead : undefined;
  if (!parts.every((part) => memberJoin(part.join, "l") || memberJoin(part.join, "r"))) return undefined;
  return parts.some((part) => memberJoin(part.join, "r")) || nouns ? lead : undefined;
}

/** A phrase whose head or join is a fill-ask blank (questions.md#fill-ask). */
function isBlankPhrase(coord: NpCoord, blanks: ReadonlySet<LexWord>): boolean {
  return coord.parts.some(
    (part) => (part.join && blanks.has(part.join)) || part.items.some((item) => item.kind === "package" && blanks.has(item.package.head)),
  );
}

/**
 * The phrases on either side of a titling hook (`-n`, proper-names.md#titled-phrases): the wording of a name, which
 * brings nothing into the clause.
 */
export function titledPhrases(units: readonly Unit[]): Set<NpCoord> {
  const out = new Set<NpCoord>();
  units.forEach((unit, k) => {
    if (unit.kind !== "hook" || unit.word.ending !== "n" || k === 0 || !units[k + 1]) return;
    for (const side of [units[k - 1], units[k + 1]]) if (side?.kind === "np") out.add(side.coord);
  });
  return out;
}

/** The frame row of a `/w/` word on a hook (a restrictor or a mood on one word), if it has one. */
function hookModifierFrame(word: LexWord): FrameKeyRow | undefined {
  const pos = word.pos ?? "";
  if (word.reading === "restrictor") return FRAME_KEYS[pos === "w" ? "lexReading:restrictor:w" : "lexReading:restrictor"];
  if (word.reading === "overlay" && word.overlay) return FRAME_KEYS[`overlay:${word.overlay.kind}:${pos}`];
  return undefined;
}

/**
 * The landmarks of hooks that carry a frame word (`wal al bohehal`, *never in a house*): the frame comes first and
 * reaches only the hook's phrase, so by the earlier-covers-later rule it covers the new member the landmark brings in
 * (clause.md#which-covers-which, joins.md#everything-ua, in-clause-hooks.md#hook-w). Such a landmark binds under that
 * frame, not over the clause.
 */
export function framedLandmarks(units: readonly Unit[]): Set<NpCoord> {
  const out = new Set<NpCoord>();
  units.forEach((unit, k) => {
    const next = units[k + 1];
    if (unit.kind !== "hook" || next?.kind !== "np") return;
    if (unit.modifiers.some((w) => hookModifierFrame(w) !== undefined)) out.add(next.coord);
  });
  return out;
}

/** The role phrases a clause reads itself: its own, and those every verb of a verb list shares (verb-and-stance-joins.md#vp-clause-forms). */
function rolePhrases(clause: Clause): NpCoord[] {
  return clause.units.flatMap((unit): NpCoord[] => {
    if (unit.kind === "np") return [unit.coord];
    if (unit.kind === "vp") return unit.coord.parts.flatMap((part) => (part.sharedUnits ?? []).flatMap((u) => (u.kind === "np" ? [u.coord] : [])));
    return [];
  });
}

function clauseFrames(clause: Clause, tables: ClassifyTables | undefined, blanks: ReadonlySet<LexWord>): ScopeFrame[] {
  const frames: ScopeFrame[] = [];
  const titled = titledPhrases(clause.units);
  const framed = framedLandmarks(clause.units);
  for (const coord of rolePhrases(clause)) {
    const head = titled.has(coord) || framed.has(coord) ? undefined : newMemberHead(coord, blanks);
    const member = head ? frame("slot:newMember", head) : undefined;
    if (member) frames.push(member);
  }
  clause.units.forEach((unit) => {
    if (unit.kind === "h") frames.push(...wordFrames(unit.unit, tables));
    if (unit.kind === "hook" && unit.job === "zone") {
      const contrary = frame("hookJob:zone", unit.word);
      if (contrary) frames.push(contrary);
    }
    if (unit.kind === "np") {
      for (const part of unit.coord.parts) {
        const join = part.join;
        if (join?.family.kind !== "joinMarker") continue;
        const series = join.family.series;
        if (series === "ua" || series === "uo") {
          const binder = frame(`joinSeries:${series}`, join);
          if (binder) frames.push(binder);
        }
      }
    }
  });
  return frames;
}

function edgeFrames(left: LeftEdge): ScopeFrame[] {
  const frames: ScopeFrame[] = [];
  for (const word of left.vocatives) {
    // A bid on the speaker's own named citation, with no `/y/`, is a greeting; under `/y/` it is a call
    // (conversation-length.md#conversation-length).
    const bid = !word.pos && word.reading === "greeting";
    const call = frame(bid ? "reading:greeting" : "edge:vocative", word);
    if (call) frames.push(call);
  }
  // Each act word is a frame of its own: a stack's first word is the act, the second how it sounds
  // (more-turn-words.md#stacked-acts); a doubled word repeats the act (more-turn-words.md#doubled-act).
  const repeat = stackKind(left.leadForce, left.force) === "emphatic" ? "repeat" : undefined;
  for (const act of [left.leadForce, left.force]) {
    const found = act ? frame("edge:force", act, repeat) : undefined;
    if (found) frames.push(found);
  }
  for (const word of left.interjections) {
    const attitude = frame("edge:interjection", word);
    if (attitude) frames.push(attitude);
  }
  return frames;
}

function scopeOf(
  clause: Clause,
  utteranceIndex: number,
  inherited: ScopeFrame[],
  tables: ClassifyTables | undefined,
  blanks: ReadonlySet<LexWord>,
): ClauseScope {
  const frames = [...inherited, ...clauseFrames(clause, tables, blanks)]
    .filter((f) => !NEVER_PAIRS.has(f.family))
    .sort((a, b) => position(a) - position(b));
  const scope: ClauseScope = { clause, utteranceIndex, frames, order: [], unordered: [] };
  for (let i = 0; i < frames.length; i++) {
    for (let j = i + 1; j < frames.length; j++) orderPair(frames[i]!, frames[j]!, scope);
  }
  return scope;
}

function collectClause(
  clause: Clause,
  utteranceIndex: number,
  inherited: ScopeFrame[],
  tables: ClassifyTables | undefined,
  blanks: ReadonlySet<LexWord>,
  out: ClauseScope[],
  tones: readonly BodyTone[] = [],
): void {
  const own = toneFramesIn(clause, tones);
  const reaching = [...inherited, ...own];
  out.push(scopeOf(clause, utteranceIndex, reaching, tables, blanks));
  for (const unit of clause.units) {
    // One reading per member of a clause join (reader rule 1); the turn's edge frames reach each member.
    if (unit.kind === "clauseCoord") {
      const members = [unit.coord.first, ...unit.coord.links.map((link) => link.clause)];
      for (const member of members) if (member) collectClause(member, utteranceIndex, reaching, tables, blanks, out, tones);
    }
  }
  // A dependent is a nested reading with its own frames (reader rule 2).
  if (clause.dependent) collectClause(clause.dependent.clause, utteranceIndex, [], tables, blanks, out, tones);
}

// ── Tone marks over the rest of the sentence ────────────────────────────────

function isWord(value: object): value is LexWord {
  return typeof (value as LexWord).raw === "string" && "family" in value && "reading" in value;
}

/** Every word under `value`, less what sits under the objects in `skip`. */
function wordsUnder(value: unknown, skip: ReadonlySet<object> = new Set(), out = new Set<LexWord>(), seen = new Set<object>()): Set<LexWord> {
  if (value === null || typeof value !== "object" || seen.has(value) || skip.has(value)) return out;
  seen.add(value);
  if (isWord(value)) {
    out.add(value);
    return out;
  }
  for (const child of Array.isArray(value) ? value : Object.values(value)) wordsUnder(child, skip, out, seen);
  return out;
}

/** A clause's own words: not those of its dependent or of its clause-join members, which have readings of their own. */
function ownWords(clause: Clause): Set<LexWord> {
  const skip = new Set<object>();
  if (clause.dependent) skip.add(clause.dependent.clause);
  for (const unit of clause.units) {
    if (unit.kind !== "clauseCoord") continue;
    if (unit.coord.first) skip.add(unit.coord.first);
    for (const link of unit.coord.links) if (link.clause) skip.add(link.clause);
  }
  return wordsUnder(clause, skip);
}

/** A rest-of-sentence tone's frame and the first word it colors inside a sentence body. */
type BodyTone = { frame: ScopeFrame; anchor: LexWord };

/**
 * The tone frames whose first colored body word is this clause's own: a tone that starts in a dependent or a join
 * member frames that clause, and one before the body (on its act word or a call) frames the clause it reaches.
 */
function toneFramesIn(clause: Clause, tones: readonly BodyTone[]): ScopeFrame[] {
  if (tones.length === 0) return [];
  const own = ownWords(clause);
  return tones.filter((tone) => own.has(tone.anchor)).map((tone) => tone.frame);
}

/**
 * Split one turn's sentence-initial free-standing tones (a later one colors only its words, so it is no frame): those
 * that color a body word frame the clause of their first body word; those that color only left-edge words
 * (`! yem.`) frame the turn's edge.
 */
function turnTones(utterance: Utterance, tones: readonly ToneRecord[]): { body: BodyTone[]; edge: ScopeFrame[] } {
  const out: { body: BodyTone[]; edge: ScopeFrame[] } = { body: [], edge: [] };
  const rest = tones.filter((tone) => tone.scope === "rest" && tone.initial);
  if (rest.length === 0) return out;
  const turn = wordsUnder(utterance);
  const bodies = wordsUnder(utterance.bodies);
  for (const tone of rest) {
    if (!turn.has(tone.words[0]!)) continue;
    const found = frame("edge:tone", tone.words[0]!);
    if (!found) continue;
    const toneFrame: ScopeFrame = { ...found, tone };
    const anchor = tone.words.find((word) => bodies.has(word));
    if (anchor) out.body.push({ frame: toneFrame, anchor });
    else out.edge.push(toneFrame);
  }
  return out;
}

/** True when nothing is on the turn's left edge: no act word, call, reaction, polar particle or hook. */
export function isBareEdge(left: LeftEdge): boolean {
  return !left.force && !left.leadForce && !left.hook && [left.vocatives, left.interjections, left.polars].every((words) => words.length === 0);
}

/**
 * The name of a greeting (word-endings.md#greeting): the named citation alone, "exactly as the citation", in a turn
 * with nothing on its left edge. A one-name reply after `yal` is an answer, not a greeting (questions.md#fill-ask).
 * A greeting bid (`alahexon.`) sits on the left edge, so its frame comes from the edge, not here.
 */
export function greetingHead(left: LeftEdge, body: BodyClause): LexWord | undefined {
  if (!isBareEdge(left) || body.linker || body.topicMarker || !isGreeting(body.clause)) return undefined;
  const [unit] = body.clause.units;
  const item = unit?.kind === "np" ? unit.coord.parts[0]?.items[0] : undefined;
  const head = item?.kind === "package" ? item.package.head : undefined;
  return head && head.reading !== "greeting" ? head : undefined;
}

/**
 * Scope records for every clause of the parse, in text order: each clause's whole-clause frames and the order of
 * every two of them. `tables` names a holder's host; without them a holder word gives the holder frame alone.
 * `blanks` are the resolve stage's fill-ask blanks, which bring no new member in. `tones` are the marks
 * `enforceTones` kept: a free-standing one at the start of its sentence is a whole-clause attitude frame
 * (tone-marks.md#showing-your-tone).
 */
export function clauseScopes(
  utterances: Utterance[],
  tables?: ClassifyTables,
  blanks: ReadonlySet<LexWord> = new Set(),
  tones: readonly ToneRecord[] = [],
): ClauseScope[] {
  const out: ClauseScope[] = [];
  utterances.forEach((utterance, utteranceIndex) => {
    const toned = turnTones(utterance, tones);
    const edge = [...toned.edge, ...edgeFrames(utterance.left)];
    // A turn with no body (a bare question, a call): one record for its edge frames, matched by utterance.
    if (utterance.bodies.length === 0) out.push({ ...scopeOf({ units: [] }, utteranceIndex, edge, tables, blanks), bodiless: true });
    utterance.bodies.forEach((body: BodyClause) => {
      const head = greetingHead(utterance.left, body);
      const greeting = head ? frame("reading:greeting", head) : undefined;
      collectClause(body.clause, utteranceIndex, greeting ? [...edge, greeting] : edge, tables, blanks, out, toned.body);
    });
  });
  return out.filter((scope) => scope.frames.length > 0);
}
