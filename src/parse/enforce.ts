/**
 * Rejections the grammar docs decide (docs/proposals/parser-strictness.md, phase 2).
 *
 * The grammar productions already refuse shapes no rule licenses; these checks
 * narrow the productions that do license a shape, where the condition depends on
 * the lexicon (hinges, needs), on the clause as a whole, or on resolve. Each one
 * throws a {@link ConstructionError} that names the rule and the page teaching it.
 *
 * This file is the entry point: `enforceTokens` runs the word-shape checks (enforce-word.ts) before the grammar,
 * `enforceResult` the structure checks on the tree (enforce-structure.ts) and the binding checks on resolve
 * (enforce-binding.ts); retired shapes are one table (enforce-retired.ts). `diagnoseParseError` names a grammar failure.
 */
import { tokenMatcher, type IToken, type TokenType } from "chevrotain";

import type { ClassifyTables } from "./classify.js";
import { REJECTIONS, type RejectionId } from "./constructions.js";
import { topicEffect } from "./linkers.js";
import { isVerbListAt, markContext } from "./mark-context.js";
import { SentenceParseError } from "./sentence-shapes.js";
import {
  B,
  Bang,
  classifyTokenBranch,
  D,
  Amount,
  G,
  GGl,
  GPlain,
  Citation,
  Force,
  Interjection,
  Vocative,
  HostedB,
  HostedOdo,
  IslandClose,
  IslandOpen,
  isLexWordPayload,
  JoinB,
  JoinD,
  JoinG,
  JoinV,
  JoinZ,
  Linker,
  OdoB,
  OdoBList,
  OdoD,
  OdoDList,
  OdoZ,
  OdoZList,
  Period,
  Polar,
  SameRolePair,
  QMark,
  TagB,
  TagD,
  TagZ,
  Tone,
  type TokenPayload,
  V,
  VPlainEnd,
  W,
  WBefore,
  WPairing,
  WritingSpanB,
  WritingSpanD,
  WritingSpanZ,
  Z,
} from "./tokens.js";
import { visitResult } from "./ast-walk.js";
import { actWord } from "./series.js";
import type { LexWord, ParseResult } from "./types.js";
import { enforceWord, enforceStackedHookR, enforceSameRoleEndings, enforceLocks } from "./enforce-word.js";
import { enforceBindings } from "./enforce-binding.js";
import { DIRECTIVE_ACT, enforceOffsets, enforceHandDepthChannel, enforceForcePair, enforceTurnWordMods, structureVisitor, enforceTagHost, enforceFenceTag, enforceSaySpeaker, enforceDirectiveRemarks, enforceGlLeans, enforceVerbPredicate } from "./enforce-structure.js";

export class ConstructionError extends SentenceParseError {
  readonly rejection: RejectionId;
  readonly anchor: string;

  constructor(rejection: RejectionId, detail: string) {
    const entry = REJECTIONS[rejection];
    super(`${detail}: ${entry.summary} — ${entry.anchor}`);
    this.name = "ConstructionError";
    this.rejection = rejection;
    this.anchor = entry.anchor;
  }
}

/** Word- and slot-level checks over the token stream, before the sentence grammar runs. */
export function enforceTokens(tokens: IToken[], tables: ClassifyTables): void {
  tokens.forEach((token, i) => {
    if (token.tokenType === QMark || token.tokenType === Bang) {
      throw new ConstructionError("sentenceEndMark", `"${token.image}"`);
    }
    if (token.tokenType === Linker && i > 0 && tokens[i - 1]!.tokenType !== Linker) {
      const prev = tokens[i - 1]!;
      const prevWord = prev.payload as TokenPayload | undefined;
      // A linker opens a body: after a sentence end, or right after the turn cluster.
      const branch = prevWord && isLexWordPayload(prevWord) ? classifyTokenBranch(prevWord).branch : undefined;
      const opensBody =
        prev.image === "." ||
        branch === "force" ||
        branch === "polar" ||
        branch === "yVocative" ||
        branch === "yInterjection" ||
        branch === "greeting" ||
        branch === "hook" ||
        (prevWord && isLexWordPayload(prevWord) && prevWord.reading === "mention");
      if (!opensBody) throw new ConstructionError("linkerMidSentence", token.image);
    }
    const payload = token.payload as TokenPayload | undefined;
    if (!payload || !isLexWordPayload(payload)) return;
    enforceWord(payload, tables);
    enforceStackedHookR(payload, tokens, i);
  });
  enforceSameRoleEndings(tokens, tables);
  enforceLocks(markContext(tokens));
}

/** Clause- and discourse-level checks on a parsed and resolved result. */
export function enforceResult(result: ParseResult, tables: ClassifyTables): void {
  for (const { left, bodies } of result.utterances) {
    // A command, request or prohibition may name a time without a channel (dated-channel.md#counting-from-now).
    const directive = DIRECTIVE_ACT.test(actWord(left)?.raw ?? "");
    for (const body of bodies) {
      // A linker joins the sentence before it to the one it starts, so a clause follows it (sentence-linkers.md#sentence-linkers).
      if (body.linker && body.clause.units.length === 0 && topicEffect(body.linker) === "none") {
        throw new ConstructionError("linkerAlone", body.linker.raw);
      }
      // A reply turn of one citation opens with a statement word (`yal azozon.`, `yam azozon.`, questions.md#fill-ask).
      const act = actWord(left);
      const statement = act?.family.kind === "joinMarker" && act.family.series === "a";
      if (body.fragment && act && !statement) throw new ConstructionError("citationTurn", act.raw);
      enforceOffsets(body.clause.units, directive);
      enforceHandDepthChannel(body.clause.units);
    }
    enforceForcePair(left);
    enforceTurnWordMods(left);
  }
  const places = { seen: new Set<LexWord>(), shaped: new Set<LexWord>() };
  visitResult(result, structureVisitor(tables, places));
  visitResult(result, {
    enter(node) {
      enforceTagHost(node);
      enforceFenceTag(node);
    },
  });
  enforceSaySpeaker(result);
  enforceDirectiveRemarks(result);
  enforceGlLeans(result);
  for (const word of places.seen) if (!places.shaped.has(word)) throw new ConstructionError("degreePlaceShape", word.raw);
  for (const { bodies } of result.utterances) for (const body of bodies) enforceVerbPredicate(body.clause.units);
  enforceBindings(result.resolve?.anaphors ?? [], tables);
}

/** The words that head a phrase of each slot, and the join that closes a list of them. */
const PHRASE_SLOTS: { heads: TokenType[]; join: TokenType }[] = [
  { heads: [Z, OdoZ, OdoZList, WritingSpanZ, TagZ], join: JoinZ },
  { heads: [D, OdoD, OdoDList, WritingSpanD, TagD], join: JoinD },
  { heads: [B, OdoB, OdoBList, WritingSpanB, TagB], join: JoinB },
  { heads: [V], join: JoinV },
];

/** What a `gl-` adjective may lean on: a noun-phrase head, a word with no role letter, or a call or reaction. */
const LEAN_HEADS = [...PHRASE_SLOTS.slice(0, 3).flatMap((slot) => slot.heads), Citation, Vocative, Interjection];

export const isAny = (token: IToken, types: TokenType[]): boolean => types.some((type) => tokenMatcher(token, type));
/** Words that describe the phrase before them, so they sit between its head and the next phrase. */
const DESCRIBING = [G, W, HostedB];

/**
 * Name the rule behind a parse failure: a `/b/` after a word with no `/b/` slot (measures-and-percent.md#measure-phrases), a
 * `gl-` adjective with nothing to lean on (left-bound-adjectives.md#left-bound-adjectives), respectively `wazem` away from a join word,
 * or
 * a noun or verb right after a phrase of the same slot (joins.md#right-close): a join word before its conjuncts, or
 * two nouns of one role (or two verbs) with no join after them.
 */
export function diagnoseParseError(input: IToken[], error: unknown): void {
  if (!(error instanceof SentenceParseError)) return;
  const failed = (error.parserErrors[0] as { token?: IToken } | undefined)?.token;
  const tokens = markContext(input);
  const at = tokens.findIndex((token) => failed && token.payload === failed.payload);
  // Braces pair up within one sentence (scope-islands.md#scope-islands).
  let depth = 0;
  for (const token of tokens) {
    if (tokenMatcher(token, IslandOpen)) depth += 1;
    else if (tokenMatcher(token, IslandClose) && --depth < 0) throw new ConstructionError("islandStrayClose", token.image);
    else if (isAny(token, [Period, QMark, Bang]) && depth > 0) throw new ConstructionError("islandUnclosed", "{");
  }
  if (depth > 0) throw new ConstructionError("islandUnclosed", "{");
  enforceCitationSentences(tokens);
  // A same-role word opens a body only with the blank it asks for (`yel abam zar …`), so no A comes before it.
  const opening = tokens.findIndex(
    (token, i) => (token.payload as LexWord | undefined)?.reading === "sameRole" && !tokenMatcher(token, SameRolePair) && (i === 0 || isAny(tokens[i - 1]!, [Period, Force, Polar, Vocative, Interjection])),
  );
  if (opening >= 0) throw new ConstructionError("sameRoleSides", tokens.slice(opening, opening + 2).map((token) => token.image).join(" "));
  // Every other host takes the `/b/` or stand-in right after it, so a failure there is an amount or a factor.
  if (at > 0 && isAny(tokens[at]!, [HostedB, HostedOdo])) {
    throw new ConstructionError("slotlessHost", `${tokens[at - 1]!.image} ${tokens[at]!.image}`);
  }
  // A check-back (`yel yaol.`) is a turn of its own: nothing follows its polar word (polar-inventory.md#check-backs).
  let polar = at - 1;
  while (polar >= 0 && tokenMatcher(tokens[polar]!, Polar)) polar -= 1;
  if (at > 0 && polar < at - 1 && polar >= 0 && tokenMatcher(tokens[polar]!, Force)) {
    throw new ConstructionError("checkBackBody", tokens.slice(polar, at).map((token) => token.image).join(" "));
  }
  // *Respectively* (`wazem`) sits only right before a join word (list-structure.md#respectively).
  const pairing = tokens.findIndex((token, i) => tokenMatcher(token, WPairing) && !isAny(tokens[i + 1] ?? token, [JoinZ, JoinD, JoinB, JoinG, JoinV]));
  if (pairing >= 0) throw new ConstructionError("joinDetail", tokens[pairing]!.image);
  // A `gl-` adjective leans on the noun or call after its hosted `/b/` (left-bound-adjectives.md#left-bound-adjectives). The parser
  // stops at the adjective (or a `/w/` before it) when no unit can start there, or at the word after it.
  let gl = -1;
  for (let i = at; i >= 0 && i < tokens.length && isAny(tokens[i]!, [W, GGl]); i += 1) if (tokenMatcher(tokens[i]!, GGl)) gl = i;
  if (gl < 0) for (gl = (at < 0 ? tokens.length : at) - 1; gl >= 0 && isAny(tokens[gl]!, [HostedB, Amount, JoinB, B]); ) gl -= 1;
  let failAt = at;
  if (gl >= 0 && tokenMatcher(tokens[gl]!, GGl)) {
    let head = gl + 1;
    while (head < tokens.length && isAny(tokens[head]!, [HostedB, Amount, JoinB, B, W, GPlain])) head += 1;
    if (!tokens[head] || !isAny(tokens[head]!, LEAN_HEADS)) throw new ConstructionError("glNoNoun", tokens[gl]!.image);
    // With a noun to lean on, the phrase is what failed.
    if (at <= gl) failAt = head;
  }
  const previous = (from: number): number => {
    let i = from;
    while (i >= 0 && isAny(tokens[i]!, DESCRIBING)) i -= 1;
    return i;
  };
  /** A phrase head right after a join of its slot with no item before the join, or after a phrase of its slot. */
  const sideBySide = (at: number, slot: (typeof PHRASE_SLOTS)[number]): void => {
    const i = previous(at - 1);
    const before = tokens[i];
    if (!before) return;
    const run = `${before.image} ${tokens[at]!.image}`;
    if (tokenMatcher(before, slot.join)) {
      const item = tokens[previous(i - 1)];
      if (!item || !isAny(item, [...slot.heads, slot.join])) throw new ConstructionError("leftFence", before.image);
      throw new ConstructionError("joinlessRun", run);
    }
    if (isAny(before, slot.heads)) throw new ConstructionError("joinlessRun", run);
  };
  const slot = PHRASE_SLOTS.find((s) => s.join !== JoinV && failAt > 0 && isAny(tokens[failAt]!, s.heads));
  if (slot) sideBySide(failAt, slot);
  // A verb list must close with a join right after its last verb (joins.md#right-close). The parser may stop anywhere
  // from the list's first verb on, so find the first list that does not close, from a verb that goes on a list.
  for (let c = 0; c < tokens.length; c += 1) {
    if (!tokenMatcher(tokens[c]!, V) || !isVerbListAt(tokens.slice(0, c)) || verbListCloses(tokens, c)) continue;
    let verb = c - 1;
    while (verb > 0 && !isAny(tokens[verb]!, [V, JoinV])) verb -= 1;
    if (verb === c - 1 && tokenMatcher(tokens[verb]!, JoinV)) sideBySide(c, PHRASE_SLOTS.find((s) => s.join === JoinV)!);
    throw new ConstructionError("joinlessRun", `${tokens[verb]!.image}${verb === c - 1 ? "" : " …"} ${tokens[c]!.image}`);
  }
  // Last, the broad shapes where the parse stopped; the checks above name the narrower rules first.
  // A `/w/` word with nothing it can grade after it (clause.md#adjective-detail-w).
  if (at >= 0 && tokenMatcher(tokens[at]!, WBefore.Other)) throw new ConstructionError("wNoHost", tokens[at]!.image);
  // A `/y/` word after a body word starts the next turn, which needs a period first (speech-moves.md#turn-y).
  const TURN_WORDS = [Force, Polar, Vocative, Interjection];
  if (at > 0 && isAny(tokens[at]!, TURN_WORDS) && !isAny(tokens[at - 1]!, TURN_WORDS)) {
    throw new ConstructionError("turnMidSentence", `${tokens[at - 1]!.image} ${tokens[at]!.image}`);
  }
}

/**
 * A word with no role letter fills no slot, so it stands only as a whole sentence of one phrase: the citation and what
 * describes it (questions.md#fill-ask). More than one bare phrase, or a bare word among lettered ones, has no reading.
 */
function enforceCitationSentences(tokens: IToken[]): void {
  const describing = [G, W, HostedB, Tone];
  let start = 0;
  for (let end = 0; end <= tokens.length; end += 1) {
    if (end < tokens.length && !tokenMatcher(tokens[end]!, Period)) continue;
    const sentence = tokens.slice(start, end);
    start = end + 1;
    const citations = sentence.filter((token) => tokenMatcher(token, Citation));
    if (citations.length === 0) continue;
    // An act word may open a reply turn of one citation (`yal azozon.`).
    while (sentence[0] && isAny(sentence[0], [Force, Tone])) sentence.shift();
    const run = sentence.map((token) => token.image).join(" ");
    if (citations.length > 1) throw new ConstructionError("citationFragmentOnePhrase", run);
    if (!sentence.every((token) => isAny(token, [Citation, ...describing]))) throw new ConstructionError("citationInClause", run);
  }
}

/** From a verb on a list, the list's last verb (the first one marked `End`) has a `/v/` join right after it. */
function verbListCloses(tokens: IToken[], from: number): boolean {
  let at = from;
  while (tokens[at] && !tokenMatcher(tokens[at]!, VPlainEnd)) at += 1;
  at += 1;
  if (tokens[at] && tokenMatcher(tokens[at]!, HostedB)) at += 1;
  while (tokens[at] && tokenMatcher(tokens[at]!, W)) at += 1;
  return !!tokens[at] && tokenMatcher(tokens[at]!, JoinV);
}
