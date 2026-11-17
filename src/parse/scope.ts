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
import type { BodyClause, Clause, HUnit, LeftEdge, LexWord, Utterance } from "./types.js";

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
  "xFamily:holder": { family: "holder", reach: "clause", anchor: "holder.md#holder" },
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
  "overlay:phasal:h": { family: "phase", reach: "clause", anchor: "already-still-yet.md#phasal" },
  "overlay:phasal:w": { family: "phase", reach: "adjective", anchor: "already-still-yet.md#phasal" },
  "overlay:phasal:th": { family: "phase", reach: "clause", anchor: "already-still-yet.md#phasal" },
  "overlay:attempt:h": { family: "intention", reach: "clause", anchor: "try.md#try" },
  "overlay:want:th": { family: "intention", reach: "clause", anchor: "want-and-decide.md#want" },
  "joinSeries:u": { family: "polarity", reach: "list", anchor: "joins.md#negation-u" },
  "joinSeries:u:standalone": { family: "polarity", reach: "clause", anchor: "verb-and-stance-joins.md#standalone-stance-joins" },
  "joinSeries:ua": { family: "binder", reach: "clause", anchor: "joins.md#everything-ua" },
  "joinSeries:uo": { family: "binder", reach: "clause", anchor: "rank-joins.md#invert-u-stacks" },
  "joinSeries:ue": { family: "polarity", reach: "list", anchor: "set-joins.md#exclusivity-and-denying-a-whole-list" },
  "ask:yesNo": { family: "force", reach: "clause", anchor: "questions.md#question" },
  "ask:fillAsk": { family: "force", reach: "clause", anchor: "questions.md#fill-ask" },
  "ask:rhetorical": { family: "force", reach: "clause", anchor: "more-turn-words.md#rhetorical" },
  "slot:bar": { family: "bar", reach: "nested", anchor: "bars.md#bars" },
  "slot:th": { family: "attitude", reach: "clause", anchor: "feelings.md#speaker-attitude" },
  "edge:vocative": { family: "force", reach: "clause", anchor: "speech-moves.md#vocative" },
  "edge:interjection": { family: "attitude", reach: "clause", anchor: "speech-moves.md#interjections-reactions" },
  "edge:force": { family: "force", reach: "clause", anchor: "speech-moves.md#speech-act-statement-question-command" },
  "edge:tone": { family: "attitude", reach: "clause", anchor: "tone-marks.md#tone-marks" },
  "reading:frequencyScale": { family: "occasion", reach: "clause", anchor: "more-occasions.md" },
  "reading:bareQuestion": { family: "force", reach: "clause", anchor: "questions.md#question" },
  "reading:greeting": { family: "force", reach: "clause", anchor: "word-endings.md#greeting" },
  "reading:feelingStake": { family: "sake", reach: "clause", anchor: "feelings.md#feeling-whose-stake" },
};

/** Which member of a family a frame is, where a pair row tells members apart. */
export type FrameMember = "channel" | "may" | "number" | "residue" | "former";

export type ScopeFrame = {
  family: FrameFamily;
  /** Its classification-table key (a key of {@link FRAME_KEYS}). */
  key: string;
  /** The word that carries it: text, gloss, and position (`word.at`). */
  word: LexWord;
  member?: FrameMember;
  /** A holder's stance, NOTIONAL or intention: the frame the holder seam sits on (holder.md#holder). */
  holderHost?: true;
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
};

const TEXT_ORDER = "clause.md#which-covers-which";
const MAY_BEFORE = "already-still-yet.md#phasal";
const HOLDER = "holder.md#holder";

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
  rule("binder", "stance", { ...over("stance", "usually-vs-must.md#generalization"), when: CHANNEL }, text()),
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
  rule("stance", "occasion", { ...over("stance", "usually-vs-must.md#generalization"), when: CHANNEL }, text()),
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
  { pair: ["polarity", "holder"], kind: "unsettled", cases: [{ order: "unsettled", anchors: [HOLDER, REACH] }] },
  rule("polarity", "phase", text(STANDALONE)),
  rule("polarity", "residue", text(STANDALONE)),
  rule("polarity", "notional", text(STANDALONE, REACH)),
  rule("polarity", "mirative", text(STANDALONE, REACH)),
  rule("polarity", "contrary", text(STANDALONE, REACH)),
  rule("polarity", "occasion", text(STANDALONE)),
  // Same-family pairs from the scope statements.
  rule("binder", "binder", text("joins.md#everything-ua")),
  rule("intention", "intention", text("intention.md#plan")),
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

/** MAY right before the `/th/` word it covers (already-still-yet.md#phasal). */
function mayRightBefore(earlier: ScopeFrame, later: ScopeFrame): boolean {
  return earlier.member === "may" && later.word.pos === "th" && later.word.at === (earlier.word.at ?? -2) + 1;
}

const position = (frame: ScopeFrame): number => frame.word.at ?? -1;

function orderPair(a: ScopeFrame, b: ScopeFrame, scope: ClauseScope): void {
  // A holder and the stance, NOTIONAL or intention its seam sits on: fixed by word shape.
  if (a.word === b.word && (a.holderHost || b.holderHost)) {
    const [holder, host] = a.family === "holder" ? [a, b] : [b, a];
    scope.order.push({ over: holder, under: host, kind: "wordShape", anchors: [HOLDER] });
    return;
  }
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

/** The holder seam's host row: an evidential, MAY or NOTIONAL `/th/` overlay (holder.md#holder). */
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

function clauseFrames(clause: Clause, tables: ClassifyTables | undefined): ScopeFrame[] {
  const frames: ScopeFrame[] = [];
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
  const act = left.leadForce ?? left.force;
  if (act) frames.push(...[frame("edge:force", act)].filter((f) => f !== undefined));
  for (const word of left.interjections) {
    const attitude = frame("edge:interjection", word);
    if (attitude) frames.push(attitude);
  }
  return frames;
}

function scopeOf(clause: Clause, utteranceIndex: number, inherited: ScopeFrame[], tables: ClassifyTables | undefined): ClauseScope {
  const frames = [...inherited, ...clauseFrames(clause, tables)]
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
  out: ClauseScope[],
): void {
  out.push(scopeOf(clause, utteranceIndex, inherited, tables));
  for (const unit of clause.units) {
    // One reading per member of a clause join (reader rule 1); the turn's edge frames reach each member.
    if (unit.kind === "clauseCoord") {
      const members = [unit.coord.first, ...unit.coord.links.map((link) => link.clause)];
      for (const member of members) if (member) collectClause(member, utteranceIndex, inherited, tables, out);
    }
  }
  // A dependent is a nested reading with its own frames (reader rule 2).
  if (clause.dependent) collectClause(clause.dependent.clause, utteranceIndex, [], tables, out);
}

/**
 * Scope records for every clause of the parse, in text order: each clause's whole-clause frames and the order of
 * every two of them. `tables` names a holder's host; without them a holder word gives the holder frame alone.
 */
export function clauseScopes(utterances: Utterance[], tables?: ClassifyTables): ClauseScope[] {
  const out: ClauseScope[] = [];
  utterances.forEach((utterance, utteranceIndex) => {
    const edge = edgeFrames(utterance.left);
    utterance.bodies.forEach((body: BodyClause) => collectClause(body.clause, utteranceIndex, edge, tables, out));
  });
  return out.filter((scope) => scope.frames.length > 0);
}
