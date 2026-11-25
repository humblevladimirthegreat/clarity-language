/** The sentence parser's shared head: its error class, token test, slot types and consts, `/w/` targets, error messages, and ambiguity reports. */

import {
  EOF,
  tokenLabel,
  tokenMatcher,
  type CstNode,
  type IParserErrorMessageProvider,
  type IToken,
  type ParserMethod,
  type TokenType,
} from "chevrotain";
import {
  B,
  D,
  GGlBefore,
  type GlTarget,
  TagB,
  TagD,
  TagZ,
  JoinB,
  JoinD,
  JoinZ,
  OdoB,
  OdoD,
  OdoZ,
  OdoZList,
  OdoDList,
  OdoBList,
  WritingSpanB,
  WritingSpanD,
  WritingSpanZ,
  WGroup,
  W_GROUPS,
  WLeaf,
  type WGroupName,
  type WKind,
  type WTarget,
  Z,
} from "./tokens.js";

export class SentenceParseError extends Error {
  readonly parserErrors: unknown[];

  constructor(message: string, parserErrors: unknown[] = []) {
    super(message);
    this.name = "SentenceParseError";
    this.parserErrors = parserErrors;
  }
}

/** The token is one of these types, or a member of one of these categories (`W`, `Odo`). */
export function tokenIs(token: IToken, ...types: TokenType[]): boolean {
  return types.some((type) => tokenMatcher(token, type));
}

export type NpSlot = "z" | "d" | "b";
export const NP_SLOTS = ["z", "d", "b"] as const;

/**
 * What the last unit of a clause was, which limits the next one (see the `unit` rules). `zFree` (and `dFree`, `bFree`):
 * the main clause ended with a stand-in or `barl` of that slot and no tag, so the next sentence starts as at `start`,
 * except with a bare tag of that slot, which would name the phrase before it (tag-pronouns.md#naming-with-a-tag).
 */
export type ChainState = "start" | NpSlot | "v" | "g" | "h" | "zFree" | "dFree" | "bFree";
/**
 * How a unit ends: `open` when a plain adjective right after it would describe it, `shared` when it is a list whose
 * join shares an adjective, `bare` when it is a list whose join shares nothing (a plain adjective right after it would
 * be shared), `closed` otherwise.
 */
export type UnitEnd = "closed" | "open" | "shared" | "bare";
export type ParserRule = ParserMethod<[], CstNode>;

/** How a noun list's join ends (see {@link AgebenSentenceParser.npJoinCloseRule}). */
export const CLOSE_ENDS = ["Bare", "Open", "Shared", "Closed"] as const;
export type CloseEnd = (typeof CLOSE_ENDS)[number];
/** How a list part ends: as its join, `Tagged` by a group tag, and `Grounds…` when its last bar hosts `barl`. */
export type PartEnd = CloseEnd | "Tagged" | `Grounds${CloseEnd | "Tagged"}`;
export const PART_ENDS: PartEnd[] = [...CLOSE_ENDS, "Tagged", ...([...CLOSE_ENDS, "Tagged"] as const).map((end) => `Grounds${end}` as const)];
/** How a list ends: as its last part (`Closed` covers `Tagged`). */
export const LIST_ENDS = [...CLOSE_ENDS, ...CLOSE_ENDS.map((end) => `Grounds${end}` as const)] as const;
export type ListEnd = CloseEnd | `Grounds${CloseEnd}`;
/** Where a list part stands (see {@link AgebenSentenceParser.npCoordPartRule}). */
export type PartStart = "First" | "Rest" | "Free";

/** The head tokens of a noun phrase at each slot: a noun, a stand-in, or a written span. */
export const NP_HEAD = {
  z: { noun: Z, standIn: OdoZ, standInList: OdoZList, span: WritingSpanZ, tag: TagZ },
  d: { noun: D, standIn: OdoD, standInList: OdoDList, span: WritingSpanD, tag: TagD },
  b: { noun: B, standIn: OdoB, standInList: OdoBList, span: WritingSpanB, tag: TagB },
} as const;

/** The join token that closes a list at each noun-phrase level. */
export const NP_JOIN = { z: JoinZ, d: JoinD, b: JoinB } as const;
/** The `/w/` target (or group of targets) an adjective rule's head names. */
export function wTargetOfHead(head: TokenType): WTarget | WGroupName {
  const gl = (Object.entries(GGlBefore) as [GlTarget, TokenType][]).find(([, type]) => type === head)?.[0];
  if (gl) return `Gl${gl}` as WTarget;
  const plain = { GPlain: "G", GShareable: "Shareable", GAdj: "GAdj", GInList: "GInList", GInRespList: "GInRespList" } as const;
  return plain[head.name as keyof typeof plain];
}

/** One kind's `/w/` words before a target or a group of targets. */
export function wOf(kind: WKind, target: WTarget | WGroupName): TokenType {
  return target in W_GROUPS ? WGroup[kind][target as WGroupName] : WLeaf[kind][target as WTarget];
}

/** The `/w/` words before each noun-phrase join word. */
export const NP_W_TARGET = { z: "JoinZ", d: "JoinD", b: "JoinB" } as const;


/**
 * ALL(*) ambiguity reports, collected instead of printed (the default `console.log` would corrupt
 * the CLI's JSON). A decision is reported only the first time a sentence reaches it.
 */
export const ambiguityReports: string[] = [];

/** Return and clear the ambiguity reports collected so far (grammar-check reads them). */
export function takeAmbiguityReports(): string[] {
  return ambiguityReports.splice(0);
}

/** How many expected tokens a parse error lists before it counts the rest. */
const EXPECTED_SHOWN = 8;

function quoted(token: IToken): string {
  return token.tokenType === EOF ? "the end" : `\`${token.image}\``;
}

/** `found `x` after `y` in rule`: where the parse stopped. */
function stoppedAt(actual: IToken, previous: IToken, ruleName: string): string {
  const after = previous.tokenType === EOF ? "" : ` after ${quoted(previous)}`;
  return `found ${quoted(actual)}${after} in ${ruleName}`;
}

function expectedList(types: TokenType[]): string {
  const labels = [...new Set(types.map(tokenLabel))];
  const extra = labels.length - EXPECTED_SHOWN;
  return labels.slice(0, EXPECTED_SHOWN).join(", ") + (extra > 0 ? `, … (+${extra} more)` : "");
}

/**
 * One-line parse errors. Chevrotain's default lists every expected token sequence,
 * which for this grammar runs to thousands of lines; the named rejections in
 * `diagnoseParseError` (enforce.ts) carry the learner-facing wording.
 */
export const errorMessageProvider: IParserErrorMessageProvider = {
  buildMismatchTokenMessage: ({ expected, actual, previous, ruleName }) =>
    `${stoppedAt(actual, previous, ruleName)}; expected ${tokenLabel(expected)}`,
  buildNotAllInputParsedMessage: ({ firstRedundant, ruleName }) =>
    `nothing reads ${quoted(firstRedundant)} and what follows, after the end of ${ruleName}`,
  buildNoViableAltMessage: ({ expectedPathsPerAlt, actual, previous, ruleName }) =>
    `${stoppedAt(actual[0]!, previous, ruleName)}; expected one of: ${expectedList(expectedPathsPerAlt.flat().map((path) => path[0]!))}`,
  buildEarlyExitMessage: ({ expectedIterationPaths, actual, previous, ruleName }) =>
    `${stoppedAt(actual[0]!, previous, ruleName)}; expected at least one of: ${expectedList(expectedIterationPaths.map((path) => path[0]!))}`,
};
