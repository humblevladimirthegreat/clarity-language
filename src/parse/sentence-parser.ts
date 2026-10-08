import { CstParser, EOF, tokenMatcher, type CstNode, type IToken, type ParserMethod, type TokenType } from "chevrotain";
import { LLStarLookaheadStrategy } from "chevrotain-allstar";

import {
  allTokens,
  Bang,
  B,
  D,
  Force,
  G,
  GGl,
  GPlain,
  H,
  HostedB,
  HostedBNoun,
  HostedBNumber,
  HostedBJoined,
  HostedOdo,
  HSharedV,
  LateOdo,
  HPlain,
  HTh,
  Amount,
  Factor,
  HScale,
  HFrame,
  BScale,
  Bar,
  BarPlain,
  FenceBar,
  Citation,
  TagB,
  TagD,
  TagZ,
  IslandClose,
  IslandOpen,
  JoinB,
  JoinD,
  JoinG,
  JoinH,
  JoinTh,
  JoinV,
  JoinX,
  JoinZ,
  lexWordFromToken,
  Linker,
  Odo,
  OdoB,
  OdoD,
  OdoZ,
  Period,
  Polar,
  QMark,
  Hook,
  HookHosting,
  HookPlain,
  ItemHook,
  V,
  VPlain,
  VCont,
  Vocative,
  Interjection,
  W,
  WAsOf,
  WPairing,
  WPlain,
  WritingSpanB,
  WritingSpanD,
  WritingSpanZ,
  Z,
} from "./tokens.js";
import { isNamedStandIn, isStandIn } from "./classify.js";
import { assignHookJobs } from "./hook-jobs.js";
import { topicEffect } from "./linkers.js";
import { BAR_SERIES, isScaleStem, RANK_SERIES } from "./series.js";
import type {
  BodyClause,
  Clause,
  CoordShared,
  GCoord,
  GItem,
  GPackage,
  TurnWordMods,
  Hosted,
  HUnit,
  ImpliedForce,
  IslandUnit,
  LeftEdge,
  NpCoord,
  NpItem,
  NpPackage,
  OdoDependent,
  ParseResult,
  PunctKind,
  Unit,
  Utterance,
  VpCoord,
  BoundJoin,
} from "./types.js";
import type { LexWord, NumberMarker } from "./types.js";

export class SentenceParseError extends Error {
  readonly parserErrors: unknown[];

  constructor(message: string, parserErrors: unknown[] = []) {
    super(message);
    this.name = "SentenceParseError";
    this.parserErrors = parserErrors;
  }
}

/** The token is one of these types, or a member of one of these categories (`W`, `Odo`). */
function tokenIs(token: IToken, ...types: TokenType[]): boolean {
  return types.some((type) => tokenMatcher(token, type));
}

type NpSlot = "z" | "d" | "b";
const NP_SLOTS = ["z", "d", "b"] as const;

/** What the last unit of a clause was, which limits the next one (see the `unit` rules). */
type ChainState = "start" | NpSlot | "v" | "g" | "h";
/**
 * How a unit ends: `open` when a plain adjective right after it would describe it, `shared` when it is a list whose
 * join shares an adjective, `closed` otherwise.
 */
type UnitEnd = "closed" | "open" | "shared";
type ParserRule = ParserMethod<[], CstNode>;

/** The head tokens of a noun phrase at each slot: a noun, a stand-in, or a written span. */
const NP_HEAD = {
  z: { noun: Z, standIn: OdoZ, span: WritingSpanZ, tag: TagZ },
  d: { noun: D, standIn: OdoD, span: WritingSpanD, tag: TagD },
  b: { noun: B, standIn: OdoB, span: WritingSpanB, tag: TagB },
} as const;

/** A label-scope verb that names a pair hosts the `/b/` right after it (predication.md#scope-relative). */
function isScopeThoVerb(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  const v = family?.kind === "x" && family.xFamily === "scope" ? family.stanceVowel : undefined;
  return tokenIs(token, V) && (v === "o" || v === "ao" || v === "uo");
}

function isAsOfWToken(token: IToken): boolean {
  return tokenIs(token, WAsOf);
}


function joinSeries(token: IToken): string {
  const family = (token.payload as LexWord | undefined)?.family;
  return family?.kind === "joinMarker" ? family.series : "";
}

function laAfterW(parser: AgazanSentenceParser, from = 1): number {
  let i = from;
  while (true) {
    const tok = parser.lookahead(i);
    if (!tokenIs(tok, W)) return i;
    const ending = (tok.payload as LexWord | undefined)?.ending;
    i += 1;
    if (isAsOfWToken(tok) && ending !== "r") {
      const next = parser.lookahead(i);
      if (tokenIs(next, B, Odo)) i += 1;
    }
  }
}

/**
 * An adjective run closed by respectively `wazem` and a `/ɡ/` join (`gelavam gamazam wazem gal`): a list of its own,
 * so its first adjective is not the SHARED one after a noun join (joins.md § Respectively).
 */
function respectivelyAdjListAhead(parser: AgazanSentenceParser): boolean {
  let i = 1;
  let marked = false;
  while (true) {
    const tok = parser.lookahead(i);
    if (tok.tokenType === JoinG) return marked;
    if (!tokenIs(tok, G, W)) return false;
    marked = tokenIs(tok, W) && (tok.payload as LexWord | undefined)?.overlay?.kind === "pairing";
    i += 1;
  }
}

/** The join token that closes a list at each noun-phrase level. */
const NP_JOIN = { z: JoinZ, d: JoinD, b: JoinB } as const;

function isStanceWord(token: IToken): boolean {
  return token.tokenType === HTh;
}

/** `uem` *contrary to*: a `/th/` stance right after it is its opposing frame (sakes.md#contrary-to-stance). */
function isFrameHook(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  return tokenIs(token, Hook) && family?.kind === "hook" && family.form === "uem";
}


/**
 * A `/th/` stance word right before a closed or open rank join of a noun list (`zel` / `zuel` / `zoel`, -l or -m) is that
 * fence's bar (comparatives.md § bars), after the list's items. Its hosted tail (`/b/`, a `/b/` join, an offset amount,
 * `barl`) may sit between; so may a second stance word, which enforce rejects.
 */
function barTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  if (!isStanceWord(tokens[at]!)) return undefined;
  // The list the bar sits in: the item before it (past what describes the item, or an earlier bar), or a closed fence.
  let before = at - 1;
  let afterBar = false;
  for (; before >= 0; before -= 1) {
    const tok = tokens[before]!;
    // An item hook (`em bamun`) rides on the item before it.
    if (tok.tokenType === B && tokens[before - 1] && tokenIs(tokens[before - 1]!, Hook)) before -= 1;
    else if (isStanceWord(tok)) afterBar = true;
    else if (!tokenIs(tok, W, G, HostedB, HostedOdo)) break;
  }
  const prev = tokens[before];
  const level = prev && NP_SLOTS.find((slot) => tokenIs(prev, NP_JOIN[slot], ...Object.values(NP_HEAD[slot])));
  if (!level) return undefined;
  // After a closed fence, only a universal `ua` fence is ranked as one item (comparatives.md § every bar).
  const fence = prev.tokenType === NP_JOIN[level];
  if (fence && joinSeries(prev) !== "ua") return undefined;
  // After the bar's `/b/`, a plain adjective describes that noun (*than tired learners*, clause.md § complex chaining).
  let bound = false;
  for (let i = at; i < tokens.length; i++) {
    const tok = tokens[i]!;
    if (tok.tokenType === NP_JOIN[level]) {
      const ending = (tok.payload as LexWord | undefined)?.ending;
      if (!BAR_SERIES.has(joinSeries(tok)) || (ending !== "l" && ending !== "m")) return undefined;
      // The first bar after the fence; a later one follows a bar like any other.
      return fence && !afterBar ? FenceBar : BarPlain;
    }
    const payload = tok.payload as LexWord | undefined;
    const number = payload?.family?.kind === "number";
    const landmarkAdj = bound && tok.tokenType === GPlain;
    if (!(isStanceWord(tok) || tokenIs(tok, W, B, HostedB, JoinB, Odo, HostedOdo, LateOdo, Amount) || (tokenIs(tok, G) && number) || landmarkAdj)) return undefined;
    if (tokenIs(tok, HostedB)) bound = true;
  }
  return undefined;
}

/**
 * ALL(*) ambiguity reports, collected instead of printed (the default `console.log` would corrupt
 * the CLI's JSON). A decision is reported only the first time a sentence reaches it.
 */
const ambiguityReports: string[] = [];

/** Return and clear the ambiguity reports collected so far (grammar-check reads them). */
export function takeAmbiguityReports(): string[] {
  return ambiguityReports.splice(0);
}

class AgazanSentenceParser extends CstParser {
  public lookahead(index: number): IToken {
    return this.LA(index);
  }

  constructor() {
    super(allTokens, {
      recoveryEnabled: false,
      lookaheadStrategy: new LLStarLookaheadStrategy({ logging: (message) => ambiguityReports.push(message) }),
    });
    this.performSelfAnalysis();
  }

  /** Sentences separated by periods; which sentences share an utterance is read after parsing ({@link buildUtterances}). */
  public document = this.RULE("document", () => {
    this.SUBRULE(this.sentence);
    this.MANY(() => {
      this.CONSUME(Period);
      this.OPTION(() => {
        this.SUBRULE2(this.sentence);
      });
    });
    this.CONSUME(EOF);
  });

  /**
   * A sentence: a left edge, a body, or both. A hook at the front is glue (in the left edge) unless a `/b/` word comes
   * right after it ({@link HookHosting}), so a body with no act word before it does not open with a plain hook. After a
   * call or reaction, a plain adjective describes it (speech-moves.md#vocative), so the body does not open with one there.
   */
  public sentence = this.RULE("sentence", () => {
    this.OR([
      {
        ALT: () => {
          this.SUBRULE(this.leftEdgeForce, { LABEL: "leftEdge" });
          this.OPTION(() => this.SUBRULE(this.bodyClause, { LABEL: "edgeBody" }));
        },
      },
      {
        ALT: () => {
          this.SUBRULE2(this.leftEdgeTurn, { LABEL: "leftEdge" });
          this.OPTION2(() => this.SUBRULE2(this.bodyClauseAfterTurn, { LABEL: "edgeBody" }));
        },
      },
      {
        ALT: () => {
          this.SUBRULE3(this.leftEdgeOther, { LABEL: "leftEdge" });
          this.OPTION3(() => this.SUBRULE3(this.bodyClauseNoGlue, { LABEL: "edgeBody" }));
        },
      },
      { ALT: () => this.SUBRULE5(this.leftEdgeTag, { LABEL: "leftEdge" }) },
      { ALT: () => this.SUBRULE4(this.bodyClauseNoGlue, { LABEL: "bodyClause" }) },
    ]);
  });

  /**
   * A call (or a greeting bid) or a reaction, with what describes it: a `gl-` adjective before it, `/w/` right before it,
   * and plain `/ɡ/` words after it (`yohun galuden`, `glelavam yezul`, `welavam yezum`; speech-moves.md#describe-turn-word).
   */
  public turnWord = this.RULE("turnWord", () => {
    this.OPTION(() => this.SUBRULE(this.glPackage, { LABEL: "glAdj" }));
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.OR([{ ALT: () => this.CONSUME(Vocative) }, { ALT: () => this.CONSUME(Interjection) }]);
    this.trailingAdjs(5);
  });

  /**
   * The left edge, by how it ends: with an act word (`Force`, any body may follow), with a call or reaction (`Turn`),
   * or with a polar or glue hook (`Other`). Each item is a call or reaction, a polar, or a glue hook.
   */
  public leftEdgeForce = this.leftEdgeRule("leftEdgeForce", "force");
  public leftEdgeTurn = this.leftEdgeRule("leftEdgeTurn", "turn");
  public leftEdgeOther = this.leftEdgeRule("leftEdgeOther", "other");

  private leftEdgeRule(name: string, ending: "force" | "turn" | "other") {
    return this.RULE(name, () => {
      // A hook that glues the sentence to prior talk, after any `/w/` that details it (hooks.md#discourse-hooks).
      const glue = (k: number) => {
        this.many(k + 10, () => this.consume(k + 10, W));
        this.consume(k + 10, HookPlain, { LABEL: "Hook" });
      };
      const item = (k: number) =>
        this.or(k, [
          { ALT: () => this.subrule(k, this.turnWord) },
          { ALT: () => this.consume(k, Polar) },
          { ALT: () => glue(k) },
        ]);
      const items = (k: number) => this.many(k, () => item(k));
      if (ending === "turn") {
        items(1);
        this.subrule(2, this.turnWord);
        return;
      }
      if (ending === "other") {
        items(1);
        this.or(2, [{ ALT: () => this.consume(2, Polar) }, { ALT: () => glue(3) }]);
        return;
      }
      this.OR([
        {
          ALT: () => {
            this.AT_LEAST_ONE(() => item(4));
            this.OPTION2(() => this.CONSUME3(Force, { LABEL: "LeadForce" }));
            this.CONSUME(Force);
          },
        },
        {
          ALT: () => {
            // A force pair (`yul yul`, `yal yol`): which pairs are legal is decided by enforce (FORCE_PAIRS).
            this.OPTION3(() => this.CONSUME4(Force, { LABEL: "LeadForce" }));
            this.CONSUME2(Force);
          },
        },
      ]);
    });
  }

  /**
   * An asking tag (`yol yael.`, `yom yaol.`; questions.md#tags): an act word (or a force pair) and polar words, a turn
   * of its own with no body. Enforce allows one polar word.
   */
  public leftEdgeTag = this.RULE("leftEdgeTag", () => {
    this.OPTION(() => this.CONSUME(Force, { LABEL: "LeadForce" }));
    this.CONSUME2(Force);
    this.AT_LEAST_ONE(() => this.CONSUME(Polar));
  });

  /**
   * A sentence body. Its first clause opens as the sentence before it allows (see {@link sentence}): any way after an
   * act word (`bodyClause`), with no plain hook (`NoGlue`), or with neither a plain hook nor a plain adjective
   * (`AfterTurn`). After a topic word or a cross-period join, the clause opens any way.
   */
  public bodyClause = this.bodyClauseRule("bodyClause", "any");
  public bodyClauseNoGlue = this.bodyClauseRule("bodyClauseNoGlue", "noGlue");
  public bodyClauseAfterTurn = this.bodyClauseRule("bodyClauseAfterTurn", "afterTurn");

  private bodyClauseRule(name: string, opening: "any" | "noGlue" | "afterTurn") {
    return this.RULE(name, () => {
      const first = { any: this.clause, noGlue: this.clauseNoGlue, afterTurn: this.clauseAfterTurn }[opening];
      // Sentence-initial clause join before a clause: joins the prior sentence to this whole one (joins.md § clause joins).
      const crossOrClause = (k: number, clause: ParserRule) =>
        this.or(k, [
          {
            ALT: () => {
              this.consume(k, JoinX, { LABEL: "crossJoin" });
              this.subrule(k, this.clauseAfterCross, { LABEL: "clause" });
            },
          },
          { ALT: () => this.subrule(k, clause, { LABEL: "clause" }) },
        ]);
      this.OR({
        DEF: [
          // A topic word may be the whole sentence (`xazawan.`, pronouns.md#topic).
          { ALT: () => this.CONSUME2(Linker) },
          {
            // A marked topic span may be the whole sentence too (`glelel x<odoga>.`).
            ALT: () => {
              this.CONSUME2(GGl, { LABEL: "topicMarker" });
              this.CONSUME3(Linker);
            },
          },
          {
            ALT: () => {
              // A mention marker before a topic span (`glelel x<odoga> …`, spans.md#mention).
              this.OPTION4(() => this.CONSUME(GGl, { LABEL: "topicMarker" }));
              this.CONSUME(Linker);
              crossOrClause(2, this.clause);
            },
          },
          { ALT: () => crossOrClause(3, first) },
        ],
      });
    });
  }

  /**
   * `/x/` joins go between clauses: item, join, item, … (joins.md § clause joins). A join word with no clause before
   * it is a clause item of its own (`xam xar`). A join with nothing after it parses, so its check can name the rule.
   * After a cross-period join the first clause opens with neither a hook nor an `/x/` word: a sentence-initial `/x/`
   * before those is a clause of its own (`xual ul …`).
   */
  public clause = this.clauseRule("clause", () => this.SUBRULE(this.clauseItem));
  public clauseNoGlue = this.clauseRule("clauseNoGlue", () => this.SUBRULE(this.clauseItemNoGlue, { LABEL: "clauseItem" }));
  public clauseAfterTurn = this.clauseRule("clauseAfterTurn", () => this.SUBRULE(this.clauseItemAfterTurn, { LABEL: "clauseItem" }));
  public clauseAfterCross = this.clauseRule("clauseAfterCross", () =>
    this.SUBRULE(this.clauseItemAfterCross, { LABEL: "clauseItem" }),
  );

  public clauseItemAfterCross = this.RULE("clauseItemAfterCross", () => {
    this.SUBRULE(this.unitAfterCross, { LABEL: "unit" });
  });

  private clauseRule(name: string, first: () => void) {
    return this.RULE(name, () => {
      first();
      this.MANY(() => {
        this.CONSUME(JoinX, { LABEL: "midJoin" });
        this.SUBRULE2(this.clauseItem);
      });
      this.OPTION(() => this.CONSUME2(JoinX, { LABEL: "midJoin" }));
    });
  }

  /**
   * A clause, or a standalone `/x/` word as a stand-in clause (optionally `xual ul …` with a hook). The first item of a
   * body opens as {@link bodyClause} allows (`NoGlue`, `AfterTurn`).
   */
  public clauseItem = this.clauseItemRule("clauseItem", () => this.unit);
  public clauseItemNoGlue = this.clauseItemRule("clauseItemNoGlue", () => this.unitNoGlue);
  public clauseItemAfterTurn = this.clauseItemRule("clauseItemAfterTurn", () => this.unitAfterTurn);

  private clauseItemRule(name: string, unit: () => ParserRule) {
    return this.RULE(name, () => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(JoinX, { LABEL: "standIn" });
            // `xual ul …`: a hook after the stand-in clause (joins.md#clause-joins).
            this.OPTION(() => this.SUBRULE(this.hookChain, { LABEL: "unit" }));
          },
        },
        {
          ALT: () => {
            this.SUBRULE2(unit(), { LABEL: "unit" });
          },
        },
      ]);
    });
  }

  /**
   * A clause's units, as a chain: each unit rule holds one unit and the rest of the clause (labeled `unit`), read by
   * {@link chainUnits}. The rule for what may follow depends on the unit before (clause.md, joins.md):
   * - Two noun phrases of one slot, or two verb phrases, never stand side by side; more than one goes in a join.
   *   A forward stand-in ends its phrase, so the next sentence may open with a noun of that slot.
   * - A joined `/ɡ/` or `/h/` list takes every adjective or adverb right before its join, so no list follows
   *   another `/ɡ/` or `/h/` unit. Unjoined adjectives and adverbs are separate units.
   * - A plain adjective describes the word before it (clause.md#adjectives-ɡ). So after a unit that ends **open**
   *   (a noun and its adjectives, a list's join, a hosted `/b/` that adjectives describe), no unit starts with a plain
   *   adjective: that adjective would describe the unit. Only a `/ɡ/` list that opens with its join word, or a
   *   respectively list, follows there (`*Open` rules).
   * - After a list whose join shares an adjective (`*Shared` rules), a respectively `/ɡ/` list does not follow: its
   *   adjectives start right at the join, so the first one is not shared (joins.md#respectively).
   */
  public unit = this.unitChainRule("unit", "start", "closed");
  /** The first clause item after a cross-period join: a unit chain that does not open with a hook. */
  public unitAfterCross = this.unitChainRule("unitAfterCross", "start", "closed", "none");
  /** The first unit of a body that may not open with a plain hook (see {@link sentence}), or a plain adjective either. */
  public unitNoGlue = this.unitChainRule("unitNoGlue", "start", "closed", "hosting");
  public unitAfterTurn = this.unitChainRule("unitAfterTurn", "start", "open", "hosting");
  public unitOpen = this.unitChainRule("unitOpen", "start", "open");
  public unitAfterZ = this.unitChainRule("unitAfterZ", "z", "closed");
  public unitAfterZOpen = this.unitChainRule("unitAfterZOpen", "z", "open");
  public unitAfterZShared = this.unitChainRule("unitAfterZShared", "z", "shared");
  public unitAfterD = this.unitChainRule("unitAfterD", "d", "closed");
  public unitAfterDOpen = this.unitChainRule("unitAfterDOpen", "d", "open");
  public unitAfterDShared = this.unitChainRule("unitAfterDShared", "d", "shared");
  public unitAfterB = this.unitChainRule("unitAfterB", "b", "closed");
  public unitAfterBOpen = this.unitChainRule("unitAfterBOpen", "b", "open");
  public unitAfterBShared = this.unitChainRule("unitAfterBShared", "b", "shared");
  public unitAfterV = this.unitChainRule("unitAfterV", "v", "closed");
  public unitAfterG = this.unitChainRule("unitAfterG", "g", "closed");
  public unitAfterGOpen = this.unitChainRule("unitAfterGOpen", "g", "open");
  public unitAfterH = this.unitChainRule("unitAfterH", "h", "closed");
  public unitAfterHOpen = this.unitChainRule("unitAfterHOpen", "h", "open");

  private unitChain(state: ChainState, end: UnitEnd): ParserRule {
    const rules: Record<UnitEnd, Partial<Record<ChainState, ParserRule>>> = {
      closed: {
        start: this.unit,
        z: this.unitAfterZ,
        d: this.unitAfterD,
        b: this.unitAfterB,
        v: this.unitAfterV,
        g: this.unitAfterG,
        h: this.unitAfterH,
      },
      open: {
        start: this.unitOpen,
        z: this.unitAfterZOpen,
        d: this.unitAfterDOpen,
        b: this.unitAfterBOpen,
        g: this.unitAfterGOpen,
        h: this.unitAfterHOpen,
      },
      shared: { z: this.unitAfterZShared, d: this.unitAfterDShared, b: this.unitAfterBShared },
    };
    return rules[end][state]!;
  }

  /**
   * Every kind of unit: its rule, the CST label builders read it by, the state it leaves the chain in, and how it
   * ends (see the `unit` rules). Where the gate-free grammar still allows two readings, ALL(*) takes the first
   * alternative, so each closed form (which takes a shared word or a join) comes before its open form, as the greedy
   * rules did. `after` lists the endings of the unit before that a kind may follow, when not all of them.
   */
  private unitKinds(): {
    rule: ParserRule;
    label: string;
    state: ChainState;
    end: UnitEnd;
    kind: ChainState | "list";
    after?: UnitEnd[];
  }[] {
    const np = (level: NpSlot) => {
      const r = this.np(level);
      const unit = { label: `${level}Coord`, kind: level };
      return [
        { ...unit, rule: r.coordClosed, state: level, end: "closed" as const },
        { ...unit, rule: r.coordShared, state: level, end: "shared" as const },
        { ...unit, rule: r.coordOpen, state: level, end: "open" as const },
        { ...unit, rule: r.grounds, state: "start" as const, end: "closed" as const },
        { ...unit, rule: r.nounTagged, state: level, end: "closed" as const },
        { ...unit, rule: r.noun, state: level, end: "open" as const },
        { ...unit, rule: r.tag, state: level, end: "open" as const },
        { ...unit, rule: r.standInTagged, state: "start" as const, end: "closed" as const },
        { ...unit, rule: r.standIn, state: "start" as const, end: "open" as const },
      ];
    };
    const notOpen: UnitEnd[] = ["closed", "shared"];
    return [
      { rule: this.islandUnit, label: "islandUnit", state: "start", end: "closed", kind: "start" },
      ...np("z"),
      ...np("d"),
      ...np("b"),
      { rule: this.citation, label: "zCoord", state: "start", end: "open", kind: "start" },
      { rule: this.vpCoord, label: "vpCoord", state: "v", end: "closed", kind: "v" },
      { rule: this.vpVerb, label: "vpCoord", state: "v", end: "closed", kind: "v" },
      { rule: this.gCoord, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["closed"] },
      { rule: this.gCoordPlainLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["shared"] },
      { rule: this.gCoordLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["open"] },
      { rule: this.gSingleClosed, label: "gCoord", state: "g", end: "closed", kind: "list", after: notOpen },
      { rule: this.gSingleOpen, label: "gCoord", state: "g", end: "open", kind: "list", after: notOpen },
      { rule: this.hCoord, label: "hCoord", state: "h", end: "closed", kind: "h" },
      { rule: this.hSingleClosed, label: "hCoord", state: "h", end: "closed", kind: "list" },
      { rule: this.hSingleOpen, label: "hCoord", state: "h", end: "open", kind: "list" },
      { rule: this.hGrounds, label: "hCoord", state: "start", end: "closed", kind: "list" },
      { rule: this.hookUnitPlain, label: "hookUnit", state: "start", end: "closed", kind: "start" },
      { rule: this.hookUnitClosed, label: "hookUnit", state: "start", end: "closed", kind: "start" },
      { rule: this.hookUnitOpen, label: "hookUnit", state: "start", end: "open", kind: "start" },
    ];
  }

  /** `hooks`: which hook units may start the chain (`hosting`: only one with a `/b/` or frame right after the hook). */
  private unitChainRule(name: string, state: ChainState, end: UnitEnd, hooks: "all" | "none" | "hosting" = "all") {
    return this.RULE(name, () => {
      const kinds = this.unitKinds().filter(
        (kind) =>
          (state === "start" || kind.kind !== state) &&
          (!kind.after || kind.after.includes(end)) &&
          !(kind.label === "hookUnit" && (hooks === "none" || (hooks === "hosting" && kind.rule === this.hookUnitPlain))),
      );
      this.or(
        1,
        kinds.map((kind, i) => ({
          ALT: () => {
            this.subrule(i + 1, kind.rule, { LABEL: kind.label });
            this.option(i + 1, () => {
              this.subrule(i + 1, this.unitChain(kind.state, kind.end), { LABEL: "unit" });
            });
          },
        })),
      );
    });
  }

  /** A unit chain that starts with a hook (read by {@link chainUnits} like any `unit` rule). */
  public hookChain = this.RULE("hookChain", () => {
    this.SUBRULE(this.hookUnit);
    this.OPTION(() => this.SUBRULE(this.unit));
  });

  public islandUnit = this.RULE("islandUnit", () => {
    this.CONSUME(IslandOpen);
    this.OPTION(() => this.SUBRULE(this.unit));
    this.CONSUME(IslandClose);
  });

  /** A word with no role letter, with what describes it (`ohun galuden`, word-endings.md#citation-forms). */
  public citation = this.RULE("citation", () => {
    this.npPackageBody([{ type: Citation, label: "Citation" }]);
  });

  /**
   * Noun-phrase lists, one set of rules per slot (`/z/`, `/d/`, `/b/`). The shape is the same at each slot; only the
   * head and join tokens differ, so a phrase can only be read at the slot its words carry. A list unit comes in an
   * `Open` and a `Closed` form by how its last part ends (see the `unit` rules); a list inside a verb item takes either.
   */
  public zCoord = this.npCoordRule("z", "any");
  public dCoord = this.npCoordRule("d", "any");
  public bCoord = this.npCoordRule("b", "any");
  public zCoordOpen = this.npCoordRule("z", "open");
  public dCoordOpen = this.npCoordRule("d", "open");
  public bCoordOpen = this.npCoordRule("b", "open");
  public zCoordClosed = this.npCoordRule("z", "closed");
  public zCoordShared = this.npCoordRule("z", "shared");
  public dCoordClosed = this.npCoordRule("d", "closed");
  public dCoordShared = this.npCoordRule("d", "shared");
  public bCoordClosed = this.npCoordRule("b", "closed");
  public bCoordShared = this.npCoordRule("b", "shared");
  public zCoordGrounds = this.npCoordRule("z", "grounds");
  public dCoordGrounds = this.npCoordRule("d", "grounds");
  public bCoordGrounds = this.npCoordRule("b", "grounds");
  public zCoordPart = this.npCoordPartRule("z", "any");
  public dCoordPart = this.npCoordPartRule("d", "any");
  public bCoordPart = this.npCoordPartRule("b", "any");
  public zCoordPartOpen = this.npCoordPartRule("z", "open");
  public dCoordPartOpen = this.npCoordPartRule("d", "open");
  public bCoordPartOpen = this.npCoordPartRule("b", "open");
  public zCoordPartClosed = this.npCoordPartRule("z", "closed");
  public zCoordPartShared = this.npCoordPartRule("z", "shared");
  public dCoordPartClosed = this.npCoordPartRule("d", "closed");
  public dCoordPartShared = this.npCoordPartRule("d", "shared");
  public bCoordPartClosed = this.npCoordPartRule("b", "closed");
  public bCoordPartShared = this.npCoordPartRule("b", "shared");
  public zCoordPartGrounds = this.npCoordPartRule("z", "grounds");
  public dCoordPartGrounds = this.npCoordPartRule("d", "grounds");
  public bCoordPartGrounds = this.npCoordPartRule("b", "grounds");
  public zPackage = this.npPackageRule("z", "Package");
  public dPackage = this.npPackageRule("d", "Package");
  public bPackage = this.npPackageRule("b", "Package");
  public zNoun = this.npPackageRule("z", "Noun");
  public dNoun = this.npPackageRule("d", "Noun");
  public bNoun = this.npPackageRule("b", "Noun");
  public zNounTagged = this.npPackageRule("z", "NounTagged");
  public dNounTagged = this.npPackageRule("d", "NounTagged");
  public bNounTagged = this.npPackageRule("b", "NounTagged");
  public zStandIn = this.npPackageRule("z", "StandIn");
  public dStandIn = this.npPackageRule("d", "StandIn");
  public bStandIn = this.npPackageRule("b", "StandIn");
  public zStandInTagged = this.npPackageRule("z", "StandInTagged");
  public dStandInTagged = this.npPackageRule("d", "StandInTagged");
  public bStandInTagged = this.npPackageRule("b", "StandInTagged");
  public zTag = this.npPackageRule("z", "Tag");
  public dTag = this.npPackageRule("d", "Tag");
  public bTag = this.npPackageRule("b", "Tag");
  public zJoinClose = this.npJoinCloseRule("z", "any");
  public dJoinClose = this.npJoinCloseRule("d", "any");
  public bJoinClose = this.npJoinCloseRule("b", "any");
  public zJoinCloseOpen = this.npJoinCloseRule("z", "open");
  public dJoinCloseOpen = this.npJoinCloseRule("d", "open");
  public bJoinCloseOpen = this.npJoinCloseRule("b", "open");
  public zJoinCloseClosed = this.npJoinCloseRule("z", "closed");
  public zJoinCloseShared = this.npJoinCloseRule("z", "shared");
  public dJoinCloseClosed = this.npJoinCloseRule("d", "closed");
  public dJoinCloseShared = this.npJoinCloseRule("d", "shared");
  public bJoinCloseClosed = this.npJoinCloseRule("b", "closed");
  public bJoinCloseShared = this.npJoinCloseRule("b", "shared");

  private np(level: NpSlot) {
    return {
      z: {
        coord: this.zCoord,
        coordOpen: this.zCoordOpen,
        coordClosed: this.zCoordClosed,
        coordShared: this.zCoordShared,
        grounds: this.zCoordGrounds,
        part: this.zCoordPart,
        partOpen: this.zCoordPartOpen,
        partClosed: this.zCoordPartClosed,
        partShared: this.zCoordPartShared,
        partGrounds: this.zCoordPartGrounds,
        pkg: this.zPackage,
        noun: this.zNoun,
        nounTagged: this.zNounTagged,
        standIn: this.zStandIn,
        standInTagged: this.zStandInTagged,
        tag: this.zTag,
        close: this.zJoinClose,
        closeOpen: this.zJoinCloseOpen,
        closeClosed: this.zJoinCloseClosed,
        closeShared: this.zJoinCloseShared,
      },
      d: {
        coord: this.dCoord,
        coordOpen: this.dCoordOpen,
        coordClosed: this.dCoordClosed,
        coordShared: this.dCoordShared,
        grounds: this.dCoordGrounds,
        part: this.dCoordPart,
        partOpen: this.dCoordPartOpen,
        partClosed: this.dCoordPartClosed,
        partShared: this.dCoordPartShared,
        partGrounds: this.dCoordPartGrounds,
        pkg: this.dPackage,
        noun: this.dNoun,
        nounTagged: this.dNounTagged,
        standIn: this.dStandIn,
        standInTagged: this.dStandInTagged,
        tag: this.dTag,
        close: this.dJoinClose,
        closeOpen: this.dJoinCloseOpen,
        closeClosed: this.dJoinCloseClosed,
        closeShared: this.dJoinCloseShared,
      },
      b: {
        coord: this.bCoord,
        coordOpen: this.bCoordOpen,
        coordClosed: this.bCoordClosed,
        coordShared: this.bCoordShared,
        grounds: this.bCoordGrounds,
        part: this.bCoordPart,
        partOpen: this.bCoordPartOpen,
        partClosed: this.bCoordPartClosed,
        partShared: this.bCoordPartShared,
        partGrounds: this.bCoordPartGrounds,
        pkg: this.bPackage,
        noun: this.bNoun,
        nounTagged: this.bNounTagged,
        standIn: this.bStandIn,
        standInTagged: this.bStandInTagged,
        tag: this.bTag,
        close: this.bJoinClose,
        closeOpen: this.bJoinCloseOpen,
        closeClosed: this.bJoinCloseClosed,
        closeShared: this.bJoinCloseShared,
      },
    }[level];
  }

  /**
   * A list: one or more parts, each closed by its join. The last part decides how the list ends (`open` / `closed`).
   * In a `grounds` list the last part's bar hosts `barl`, so the main clause ends with the list and the next sentence
   * is the grounds (comparatives.md#bars).
   */
  private npCoordRule(level: NpSlot, variant: "any" | "open" | "closed" | "shared" | "grounds") {
    const suffix = { any: "", open: "Open", closed: "Closed", shared: "Shared", grounds: "Grounds" }[variant];
    return this.RULE(`${level}Coord${suffix}`, () => {
      const part = () => this.SUBRULE(this.np(level).part);
      if (variant === "any") {
        this.AT_LEAST_ONE(part);
        return;
      }
      const { partOpen, partClosed, partShared, partGrounds } = this.np(level);
      this.MANY(part);
      const last = { open: partOpen, closed: partClosed, shared: partShared, grounds: partGrounds }[variant];
      this.SUBRULE2(last, { LABEL: `${level}CoordPart` });
    });
  }

  /**
   * One part of a list: items, then any bars, then the join, then a tag naming the list. It ends like its join
   * (`open`, `shared`), or `closed` at a scale, a factor, or the tag.
   */
  private npCoordPartRule(level: NpSlot, variant: "any" | "open" | "closed" | "shared" | "grounds") {
    const suffix = { any: "", open: "Open", closed: "Closed", shared: "Shared", grounds: "Grounds" }[variant];
    return this.RULE(`${level}CoordPart${suffix}`, () => {
      const { pkg, tag, close, closeOpen, closeClosed, closeShared } = this.np(level);
      const groupTag = NP_HEAD[level].tag;
      // The join and a tag **-l** right after it, which names the whole list (`zodogal zagadul zam zwal`, pronouns.md#tag-pronouns).
      const ending = (k: number, label: string) => {
        if (variant === "open" || variant === "shared") {
          this.subrule(k, variant === "open" ? closeOpen : closeShared, { LABEL: label });
        } else if (variant === "closed") {
          this.or(k + 20, [
            {
              ALT: () => {
                this.subrule(k, closeClosed, { LABEL: label });
                this.option(k + 20, () => this.consume(k + 20, groupTag, { LABEL: "groupTag" }));
              },
            },
            {
              ALT: () => {
                this.or(k + 40, [
                  { ALT: () => this.subrule(k, closeOpen, { LABEL: label }) },
                  { ALT: () => this.subrule(k, closeShared, { LABEL: label }) },
                ]);
                this.consume(k + 30, groupTag, { LABEL: "groupTag" });
              },
            },
          ]);
        } else {
          this.subrule(k, close, { LABEL: label });
          this.option(k + 20, () => this.consume(k + 20, groupTag, { LABEL: "groupTag" }));
        }
      };
      // Items, then any bars, then the join; `k` keeps each alternative's DSL calls distinct.
      const items = (k: number, first: () => void) => {
        first();
        this.many(k, () => this.subrule(k, pkg, { LABEL: "npConjunct" }));
        // A hook + `/b/` right before the join word, or before a rank fence's bar, belongs to the last item (joins.md § SHARED after the join).
        this.option(k, () => {
          this.consume(k, ItemHook, { LABEL: "itemHook" });
          this.consume(k, B, { LABEL: "itemHookBound" });
        });
        // A stance word before a rank join is the comparee: the bar (comparatives.md § bars).
        this.many(k + 1, () => this.subrule(k, this.barUnit, { LABEL: "bar" }));
        // A CLUES or PATTERN bar may host `barl`: the next sentence is the grounds (comparatives.md#bars).
        if (variant === "grounds") this.subrule(k, this.barStandIn, { LABEL: "bar" });
        ending(k, "npJoinClose");
      };
      if (variant === "grounds") {
        this.OR1([
          { ALT: () => items(5, () => this.SUBRULE(tag, { LABEL: "npConjunct" })) },
          { ALT: () => items(7, () => this.SUBRULE(pkg, { LABEL: "npConjunct" })) },
        ]);
        return;
      }
      this.OR([
        { ALT: () => ending(1, "standaloneJoin") },
        {
          // A bar right after a closed `ua` fence (`zuam gagadul thobam zel …`): the whole fence is the one ranked item,
          // nested by right-close (comparatives.md § every bar, joins.md § fence nesting).
          ALT: () => {
            this.SUBRULE2(this.fenceBarUnit, { LABEL: "bar" });
            this.MANY3(() => {
              this.SUBRULE3(this.barUnit, { LABEL: "bar" });
            });
            ending(3, "npJoinClose");
          },
        },
        // A new tag listed with other items goes first (`zwal zodogal zam`, pronouns.md#tag-pronouns).
        { ALT: () => items(5, () => this.SUBRULE(tag, { LABEL: "npConjunct" })) },
        { ALT: () => items(7, () => this.SUBRULE(pkg, { LABEL: "npConjunct" })) },
      ]);
    });
  }

  /**
   * A list's join word, and what the join shares (joins.md#shared-after-the-join): an adjective after any join, a
   * scale after a rank join ({@link HScale}, {@link BScale}), then the factor after an equative's scale. `open`: nothing
   * shared, or an adjective whose hosted `/b/` the adjectives after it describe; `shared`: any other adjective;
   * `closed`: a scale, or a factor.
   */
  private npJoinCloseRule(level: NpSlot, variant: "any" | "open" | "closed" | "shared") {
    const suffix = { any: "", open: "Open", closed: "Closed", shared: "Shared" }[variant];
    return this.RULE(`${level}JoinClose${suffix}`, () => {
      // A `/w/` right before the join word details the list (respectively `wazem`, joins.md § Respectively).
      this.MANY(() => {
        this.CONSUME(W);
      });
      this.CONSUME(NP_JOIN[level]);
      const label = { LABEL: "sharedAfterJoin" };
      if (variant === "open") {
        this.OPTION(() =>
          this.OR([
            { ALT: () => this.SUBRULE(this.sharedAdjOpen, label) },
            { ALT: () => this.SUBRULE(this.sharedScaleOpen, label) },
          ]),
        );
      } else if (variant === "shared") {
        this.SUBRULE(this.sharedAdjClosed, label);
      } else if (variant === "closed") {
        // Factor right after an equative's shared scale: `oe` + `h+2` = *twice as … as* (comparatives.md § factor).
        this.OR([
          {
            ALT: () => {
              this.SUBRULE(this.sharedScale, label);
              this.OPTION2(() => this.CONSUME(Factor, { LABEL: "factor" }));
            },
          },
          {
            ALT: () => {
              this.SUBRULE2(this.sharedAdjClosed, label);
              this.CONSUME2(Factor, { LABEL: "factor" });
            },
          },
        ]);
      } else {
        this.OPTION3(() => {
          this.SUBRULE3(this.sharedAfterJoin);
          this.OPTION4(() => this.CONSUME3(Factor, { LABEL: "factor" }));
        });
      }
    });
  }

  /**
   * A verb list: parts, each closed by its `/v/` join. An item is a verb and the `/h/`, `/d/` and `/b/` words before it,
   * so an item ends at its verb; the first item is a bare verb, since words before every verb are the clause's own and
   * cover every item (join-across-roles.md#vp-clause-forms).
   */
  public vpCoord = this.RULE("vpCoord", () => {
    this.SUBRULE(this.vpCoordPartFirst, { LABEL: "vpCoordPart" });
    // A `/w/` starts a part only before its join word (respectively `wazem`); any other `/w/` is not a verb part.
    this.MANY(() => this.SUBRULE(this.vpCoordPart));
  });

  public vpCoordPartFirst = this.vpCoordPartRule("vpCoordPartFirst", true);
  public vpCoordPart = this.vpCoordPartRule("vpCoordPart", false);

  private vpCoordPartRule(name: string, first: boolean) {
    return this.RULE(name, () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.vJoinClose, { LABEL: "standaloneJoin" }) },
        {
          ALT: () => {
            // A verb, and the `/b/` a pair-scope verb hosts.
            const verb = (k: number, type: TokenType) => {
              this.consume(k, type, { LABEL: "V" });
              this.option(k, () => {
                this.consume(k, HostedB, { LABEL: "B" });
              });
            };
            if (first) verb(1, VPlain);
            else {
              this.MANY(() => this.SUBRULE(this.vpItemUnit));
              verb(1, V);
            }
            // Later items: their `/h/`, `/d/` and `/b/` words, then the verb.
            this.MANY2(() => {
              this.MANY3(() => this.SUBRULE2(this.vpItemUnit));
              verb(2, VCont);
            });
            this.SUBRULE2(this.vJoinClose);
          },
        },
      ]);
    });
  }

  /**
   * A verb with no join: one verb, and the `/b/` a pair-scope verb hosts. A {@link VCont} is never a lone verb: a second
   * verb in the clause takes a join (joins.md#right-close).
   */
  public vpVerb = this.RULE("vpVerb", () => {
    this.CONSUME(VPlain, { LABEL: "V" });
    this.OPTION(() => {
      this.CONSUME(HostedB, { LABEL: "B" });
    });
  });

  public vpItemUnit = this.RULE("vpItemUnit", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.dCoord) },
      { ALT: () => this.SUBRULE(this.dNoun, { LABEL: "dCoord" }) },
      { ALT: () => this.SUBRULE(this.dStandIn, { LABEL: "dCoord" }) },
      { ALT: () => this.SUBRULE(this.bCoord) },
      { ALT: () => this.SUBRULE(this.bNoun, { LABEL: "bCoord" }) },
      { ALT: () => this.SUBRULE(this.bStandIn, { LABEL: "bCoord" }) },
      { ALT: () => this.SUBRULE(this.hCoord) },
      { ALT: () => this.SUBRULE(this.hSingle, { LABEL: "hCoord" }) },
    ]);
  });

  public vJoinClose = this.RULE("vJoinClose", () => {
    // A `/w/` right before the join word is respectively `wazem` (joins.md § Respectively).
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.CONSUME(JoinV);
    // Only a shared /h/ follows a verb join (it covers every verb); a /ɡ/ there is not shared, and a /th/ there is on the claim.
    this.OPTION(() => this.SUBRULE(this.sharedAdverb, { LABEL: "sharedAfterJoin" }));
  });

  public gCoord = this.RULE("gCoord", () => {
    this.AT_LEAST_ONE(() => this.SUBRULE(this.gCoordPart));
  });

  /**
   * A `/ɡ/` list right after an open unit: its first part is a lone join word (`zazawan godogol gul`), or a
   * respectively list (`zalahen zal gelavam gamazam wazem gal`, joins.md#respectively). Any other first adjective
   * would describe the unit before.
   */
  public gCoordLead = this.RULE("gCoordLead", () => {
    this.SUBRULE(this.gCoordPartLead, { LABEL: "gCoordPart" });
    this.MANY(() => this.SUBRULE(this.gCoordPart));
  });

  /**
   * A `/ɡ/` list after a list that shares an adjective: its first part is not a respectively list, whose first
   * adjective would sit right after the noun join (joins.md#respectively).
   */
  public gCoordPlainLead = this.RULE("gCoordPlainLead", () => {
    this.SUBRULE(this.gCoordPartPlain, { LABEL: "gCoordPart" });
    this.MANY(() => this.SUBRULE(this.gCoordPart));
  });

  /** One part of a `/ɡ/` list: its items and join (`plain`, `respectively`, or either), or a lone join word. */
  public gCoordPart = this.gCoordPartRule("gCoordPart", "any");
  public gCoordPartPlain = this.gCoordPartRule("gCoordPartPlain", "plain");
  public gCoordPartLead = this.gCoordPartRule("gCoordPartLead", "respectively");

  private gCoordPartRule(name: string, close: "any" | "plain" | "respectively") {
    return this.RULE(name, () => {
      const alts = [
        { ALT: () => this.SUBRULE(this.gJoinClose, { LABEL: "standaloneJoin" }) },
        {
          ALT: () => {
            this.AT_LEAST_ONE(() => this.SUBRULE(this.gListItem, { LABEL: "gPackage" }));
            const respectively = () => this.SUBRULE(this.gJoinCloseRespectively, { LABEL: "gJoinClose" });
            if (close === "plain") this.SUBRULE2(this.gJoinClose);
            else if (close === "respectively") respectively();
            else {
              this.OR2([
                { ALT: () => this.SUBRULE3(this.gJoinClose) },
                { ALT: respectively },
              ]);
            }
          },
        },
      ];
      this.OR(alts);
    });
  }

  /** An adjective with no join, as its own unit: one whose hosted `/b/` the adjectives after it describe (`Open`), or any other. */
  public gSingleOpen = this.RULE("gSingleOpen", () => {
    this.SUBRULE(this.gPackageOpen, { LABEL: "gPackage" });
  });

  public gSingleClosed = this.RULE("gSingleClosed", () => {
    this.SUBRULE(this.gPackageClosed, { LABEL: "gPackage" });
  });

  public gJoinClose = this.RULE("gJoinClose", () => {
    // Nothing modifies a list of adjectives (a following /ɡ/ is its own unit); only respectively `wazem` sits before the join.
    this.MANY(() => {
      this.CONSUME(WPlain, { LABEL: "W" });
    });
    this.CONSUME(JoinG);
  });

  public gJoinCloseRespectively = this.RULE("gJoinCloseRespectively", () => {
    this.CONSUME(WPairing, { LABEL: "W" });
    this.CONSUME(JoinG);
  });

  public hCoord = this.RULE("hCoord", () => {
    // A `/w/` after a `/th/` or `/h/` word grades whatever it sits before; it opens another part only before `/h/`.
    this.AT_LEAST_ONE(() => this.SUBRULE(this.hCoordPart));
  });

  // Standalone stance `/th/` join (`thul` *no judgment*, fill-ask `thar` *why?*). No standalone `/h/` join:
  // plain `/h/` forms are restrictors.
  public hCoordPart = this.RULE("hCoordPart", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.hJoinClose, { LABEL: "standaloneJoin" }) },
      {
        ALT: () => {
          this.AT_LEAST_ONE(() => this.SUBRULE(this.hUnitRule));
          this.SUBRULE2(this.hJoinClose);
          // `thugum thoyem thul barl …`: a stance join may sit between the last open host and its `barl`,
          // so it closes the stance words while the next sentence still fills the host (join-across-roles.md#stance-join-before-barl).
          this.OPTION2(() => this.CONSUME(LateOdo, { LABEL: "lateBound" }));
        },
      },
    ]);
  });

  /**
   * An adverb or stance word with no join, as its own unit (clause.md#adverbs-h): any (`hSingle`, inside a verb item),
   * one whose hosted `/b/` the adjectives after it describe (`Open`), or any other.
   */
  public hSingle = this.RULE("hSingle", () => {
    this.SUBRULE(this.hUnitRule);
  });

  public hSingleOpen = this.RULE("hSingleOpen", () => {
    this.SUBRULE(this.hUnitOpen, { LABEL: "hUnitRule" });
  });

  public hSingleClosed = this.RULE("hSingleClosed", () => {
    this.SUBRULE(this.hUnitClosed, { LABEL: "hUnitRule" });
  });

  /** An `/h/` or `/th/` word hosting a stand-in, as its own unit: the main clause ends with it. */
  public hGrounds = this.RULE("hGrounds", () => {
    this.SUBRULE(this.hStandIn, { LABEL: "hUnitRule" });
  });

  // Nothing is SHARED after a /h/ or /th/ join; `/w/` before the join word grades the list.
  public hJoinClose = this.RULE("hJoinClose", () => {
    this.CONSUME(JoinH);
  });

  /**
   * An `/h/` or `/th/` word and its hosted `/b/` (clause.md#extra-nouns): any shape (`hUnitRule`), one whose `/b/` the
   * plain adjectives after it describe (`hUnitOpen`), or any other (`hUnitClosed`).
   */
  public hUnitRule = this.hUnitRuleOf("hUnitRule", "any");
  public hUnitOpen = this.hUnitRuleOf("hUnitOpen", "open");
  public hUnitClosed = this.hUnitRuleOf("hUnitClosed", "closed");

  private hUnitRuleOf(name: string, variant: "any" | "open" | "closed") {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(W);
      });
      const alts: { ALT: () => void }[] = [];
      if (variant !== "open") {
        alts.push({
          ALT: () => {
            this.consume(1, HTh, { LABEL: "H" });
            this.option(1, () => {
              this.landmarkHosted(10, "closed", true);
            });
          },
        });
        alts.push({
          ALT: () => {
            this.consume(5, HPlain, { LABEL: "H" });
            this.option(5, () => {
              this.landmarkHosted(30, "closed");
            });
          },
        });
      }
      if (variant !== "closed") {
        alts.push({
          ALT: () => {
            this.consume(6, H, { LABEL: "H" });
            this.landmarkHosted(60, "open");
          },
        });
      }
      if (alts.length === 1) alts[0]!.ALT();
      else this.or(1, alts);
    });
  }

  /** A rank fence's bar. Inside the fence no predicate can come before the join, so a `/ɡ/` after its `/b/` describes that noun. */
  /** A rank fence's bar and what it hosts; `fenceBarUnit` is the first bar after a closed `ua` fence. */
  public barUnit = this.barRule("barUnit", Bar);
  public fenceBarUnit = this.barRule("fenceBarUnit", FenceBar);

  private barRule(name: string, bar: TokenType) {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(W);
      });
      this.CONSUME(bar, { LABEL: "H" });
      this.OPTION(() => this.landmarkHosted(10, "any"));
    });
  }

  /** A CLUES or PATTERN bar hosting `barl`: the next sentence is the grounds (comparatives.md#bars). */
  public barStandIn = this.RULE("barStandIn", () => {
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.CONSUME(Bar, { LABEL: "H" });
    this.CONSUME(HostedOdo, { LABEL: "Odo" });
  });

  /** An `/h/` or `/th/` word hosting a forward stand-in: the next sentence fills it (dependents.md#dependent-clauses). */
  public hStandIn = this.RULE("hStandIn", () => {
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.CONSUME(H);
    this.CONSUME(HostedOdo, { LABEL: "Odo" });
  });

  /**
   * What follows a host's hosted `/b/` (clause.md § Complex chaining): a join filling the slot, a measure amount, then
   * plain adjectives that describe the landmark. The adjectives are part of the host's rule, so nothing has to look
   * back to find the host. Each helper takes `k`, the base of its DSL indices (it uses `k` to `k + 9`).
   *
   * `closedTail`: a join filling the slot, then the amount; no adjective describes this `/b/`.
   */
  private closedTail(k: number): void {
    // A number word right after the hosted /b/ is its amount (measure phrase, e.g. a signed offset).
    // An ordinal (a place, or a kin generation) or a label (a year, `bavawem g_1962`) is an adjective on
    // the landmark instead, free to host its own /b/.
    this.option(k + 1, () => this.consume(k, Amount, { LABEL: "G" }));
  }

  /**
   * A host's `/b/`: an `open` one is a noun with no join, which the plain adjectives after it describe (so a plain
   * adjective after the host would be one more of them); a `closed` one has a join, or is a number. With `grounds`
   * (a `/th/` host), `barl` may follow a number: a channel's offset, then the grounds (knowing.md#evidence-clause).
   */
  private landmarkHosted(k: number, shape: "open" | "closed" | "any", grounds = false): void {
    const open = () => {
      this.consume(k, HostedBNoun, { LABEL: "B" });
      this.option(k, () => this.consume(k, Amount, { LABEL: "G" }));
      this.trailingAdjs(k + 1);
    };
    if (shape === "open") {
      open();
      return;
    }
    const alts = [
      {
        ALT: () => {
          this.joinedHosted(k + 3);
          if (grounds) this.option(k + 9, () => this.consume(k + 9, LateOdo, { LABEL: "Odo" }));
        },
      },
      {
        ALT: () => {
          this.consume(k + 4, HostedBNumber, { LABEL: "B" });
          this.closedTail(k + 4);
          if (grounds) this.option(k + 8, () => this.consume(k + 8, LateOdo, { LABEL: "Odo" }));
        },
      },
    ];
    this.or(k, shape === "any" ? [...alts, { ALT: open }] : alts);
  }

  /** A hosted `/b/` that heads a list filling the slot (`hazam bedehal bezedel bal`), then the amount. */
  private joinedHosted(k: number): void {
    this.consume(k, HostedBJoined, { LABEL: "B" });
    this.subrule(k, this.boundJoinTail);
    this.closedTail(k);
  }

  /**
   * Plain adjectives after a word, each describing it (clause.md#adjectives-ɡ). Only the last may end open (its hosted
   * `/b/` takes the adjectives after it, clause.md#complex-chaining), so the run itself always ends open.
   */
  private trailingAdjs(k: number): void {
    this.many(k, () => this.subrule(k, this.gPackageClosed, { LABEL: "gPackage" }));
    this.option(k + 1, () => this.subrule(k, this.gPackageOpen, { LABEL: "gPackage" }));
  }

  /**
   * A hook, and the stance `uem` holds as its frame (sakes.md#contrary-to-stance): any frame (`hookUnit`), one whose
   * hosted `/b/` the adjectives after it describe (`Open`), or any other (`Closed`). A `Plain` hook has no `/b/` or
   * frame right after it ({@link HookPlain}).
   */
  public hookUnit = this.hookUnitRule("hookUnit", "any");
  public hookUnitPlain = this.hookUnitRule("hookUnitPlain", "plain");
  public hookUnitOpen = this.hookUnitRule("hookUnitOpen", "open");
  public hookUnitClosed = this.hookUnitRule("hookUnitClosed", "closed");
  public frameUnit = this.frameRule("frameUnit", "any");
  public frameUnitOpen = this.frameRule("frameUnitOpen", "open");
  public frameUnitClosed = this.frameRule("frameUnitClosed", "closed");

  private hookUnitRule(name: string, shape: "any" | "plain" | "open" | "closed") {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(W);
      });
      if (shape === "plain") {
        this.CONSUME(HookPlain, { LABEL: "Hook" });
        return;
      }
      this.CONSUME(shape === "any" ? Hook : HookHosting, { LABEL: "Hook" });
      const frame = { any: this.frameUnit, open: this.frameUnitOpen, closed: this.frameUnitClosed }[shape];
      if (shape === "open") this.SUBRULE(frame, { LABEL: "frame" });
      else this.OPTION(() => this.SUBRULE2(frame, { LABEL: "frame" }));
    });
  }

  /** The frame stance, with what it hosts, as a `/th/` host takes it. */
  private frameRule(name: string, shape: "any" | "open" | "closed") {
    return this.RULE(name, () => {
      this.CONSUME(HFrame, { LABEL: "H" });
      this.hostedOrStandIn(shape, true);
    });
  }

  /** A host's `/b/` (see {@link landmarkHosted}), or a stand-in it hosts (closed); optional unless `open`. */
  private hostedOrStandIn(shape: "any" | "open" | "closed", grounds: boolean): void {
    if (shape === "open") {
      this.landmarkHosted(10, "open");
      return;
    }
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.landmarkHosted(20, shape, grounds) },
        { ALT: () => this.CONSUME(HostedOdo, { LABEL: "Odo" }) },
      ]);
    });
  }

  /**
   * A noun package: any head in a list (`Package`). A lone phrase is a noun or written span (`Noun`), a forward
   * stand-in (`StandIn`), which ends its sentence's main clause, or a bare tag **-l** as a new referent (`Tag`).
   * A tag **-l** right after the head and its adjectives names that phrase (pronouns.md#tag-pronouns); a lone noun
   * or stand-in with one is `…Tagged`, since a plain adjective after the tag no longer describes the noun.
   */
  private npPackageRule(level: NpSlot, variant: "Package" | "Noun" | "NounTagged" | "StandIn" | "StandInTagged" | "Tag") {
    const head = NP_HEAD[level];
    const noun = { type: head.noun, label: undefined };
    const standIn = { type: head.standIn, label: "Odo" };
    const span = { type: head.span, label: "WritingSpan" };
    const tag = { type: head.tag, label: level.toUpperCase() };
    const heads = {
      Package: [noun, standIn, span],
      Noun: [noun, span],
      NounTagged: [noun, span],
      StandIn: [standIn],
      StandInTagged: [standIn],
      Tag: [tag],
    }[variant];
    const tagged = { Package: "optional", NounTagged: "required", StandInTagged: "required" } as const;
    return this.RULE(`${level}${variant}`, () =>
      this.npPackageBody(heads, { tag: head.tag, tagged: variant in tagged ? tagged[variant as keyof typeof tagged] : "none" }),
    );
  }

  private npPackageBody(
    heads: { type: TokenType; label: string | undefined }[],
    { tag, tagged = "none" }: { tag?: TokenType; tagged?: "none" | "optional" | "required" } = {},
  ): void {
    this.OPTION(() => this.SUBRULE(this.glPackage, { LABEL: "gPackage" }));
    this.or(
      1,
      heads.map(({ type, label }, i) => ({ ALT: () => this.consume(i + 1, type, label ? { LABEL: label } : undefined) })),
    );
    // A `gl-` adjective leans on the next noun, so it ends this package (clause.md#left-bound-adjectives).
    this.trailingAdjs(1);
    if (tag && tagged === "optional") this.OPTION3(() => this.CONSUME(tag, { LABEL: "tag" }));
    if (tag && tagged === "required") this.CONSUME2(tag, { LABEL: "tag" });
  }

  public asOfWPair = this.RULE("asOfWPair", () => {
    this.CONSUME(WAsOf, { LABEL: "W" });
    // The as-of bound is a /b/ noun, never a stand-in (relations.md § as-of).
    this.OPTION(() => this.CONSUME(B));
  });

  /**
   * Adjective packages, one rule per shape (each keeps its `/w/` words and hosted `/b/`):
   * - `gPackage`: a plain adjective, any shape; `gPackageOpen`: one whose hosted `/b/` the adjectives after it describe;
   *   `gPackageClosed`: any other.
   * - `gListItem`: an item of a joined `/ɡ/` list, where a plain adjective after its `/b/` is the next item.
   * - `glPackage`: a `gl-` adjective, which leans on the noun or call after it (clause.md#left-bound-adjectives).
   */
  public gPackage = this.gPackageRule("gPackage", GPlain, "any");
  public gPackageOpen = this.gPackageRule("gPackageOpen", GPlain, "open");
  public gPackageClosed = this.gPackageRule("gPackageClosed", GPlain, "closed");
  public gListItem = this.gPackageRule("gListItem", GPlain, "item");
  public glPackage = this.gPackageRule("glPackage", GGl, "any");

  private gPackageRule(name: string, head: TokenType, shape: "any" | "open" | "closed" | "item") {
    return this.RULE(name, () => {
      // Plain `/w/` words, then at most one as-of pair, which more plain `/w/` words may follow.
      this.MANY(() => {
        this.CONSUME(WPlain, { LABEL: "W" });
      });
      this.OPTION(() => {
        this.SUBRULE(this.asOfWPair);
        this.MANY2(() => {
          this.CONSUME2(WPlain, { LABEL: "W" });
        });
      });
      this.CONSUME(head, { LABEL: "G" });
      if (shape === "open") {
        this.landmarkHosted(10, "open");
      } else if (shape === "item") {
        this.OPTION2(() => {
          this.OR([
            { ALT: () => this.joinedHosted(20) },
            {
              ALT: () => {
                this.OR2([
                  { ALT: () => this.CONSUME2(HostedBNoun, { LABEL: "B" }) },
                  { ALT: () => this.CONSUME3(HostedBNumber, { LABEL: "B" }) },
                ]);
                this.closedTail(10);
              },
            },
          ]);
        });
      } else {
        this.OPTION2(() => this.landmarkHosted(10, shape));
      }
    });
  }

  // The one hosted /b/ slot may hold a join: more /b/ members closed by a /b/ join word.
  public boundJoinTail = this.RULE("boundJoinTail", () => {
    this.MANY(() => this.CONSUME(B));
    this.CONSUME(JoinB);
  });

  /** What a noun list's join shares: an adjective, or the scale after a rank join. */
  public sharedAfterJoin = this.RULE("sharedAfterJoin", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.gPackage) },
      { ALT: () => this.scaleBody(1) },
    ]);
  });

  public sharedAdjOpen = this.RULE("sharedAdjOpen", () => {
    this.SUBRULE(this.gPackageOpen, { LABEL: "gPackage" });
  });

  public sharedAdjClosed = this.RULE("sharedAdjClosed", () => {
    this.SUBRULE(this.gPackageClosed, { LABEL: "gPackage" });
  });

  /** A rank join's scale: an `/h/` or `/th/` word (with its hosted `/b/` or stand-in), or a digitless `/b/` number. */
  public sharedScale = this.RULE("sharedScale", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.hScaleClosed, { LABEL: "hUnitRule" }) },
      { ALT: () => this.CONSUME(BScale, { LABEL: "scale" }) },
    ]);
  });

  public sharedScaleOpen = this.RULE("sharedScaleOpen", () => {
    this.SUBRULE(this.hScaleOpen, { LABEL: "hUnitRule" });
  });

  private scaleBody(k: number): void {
    this.or(k, [
      { ALT: () => this.subrule(k, this.hScale, { LABEL: "hUnitRule" }) },
      { ALT: () => this.consume(k, BScale, { LABEL: "scale" }) },
    ]);
  }

  /** An `/h/` or `/th/` scale word and what it hosts, in any shape, `Open` or `Closed` (see {@link landmarkHosted}). */
  public hScale = this.hScaleRule("hScale", "any");
  public hScaleOpen = this.hScaleRule("hScaleOpen", "open");
  public hScaleClosed = this.hScaleRule("hScaleClosed", "closed");

  private hScaleRule(name: string, shape: "any" | "open" | "closed") {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(W);
      });
      this.CONSUME(HScale, { LABEL: "H" });
      this.hostedOrStandIn(shape, false);
    });
  }

  /** The adverb a verb list's join shares (it covers every verb). */
  public sharedAdverb = this.RULE("sharedAdverb", () => this.SUBRULE(this.hSharedUnit, { LABEL: "hUnitRule" }));

  /** The shared adverb and what it hosts, as any `/h/` word takes it. */
  public hSharedUnit = this.RULE("hSharedUnit", () => {
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.CONSUME(HSharedV, { LABEL: "H" });
    this.hostedOrStandIn("any", false);
  });
}

const parserInstance = new AgazanSentenceParser();
let lastCst: CstNode | undefined;

function punctFromToken(token: IToken): PunctKind {
  if (token.tokenType === Period) return "period";
  if (token.tokenType === QMark) return "qmark";
  return "bang";
}

function npPackages(coord: NpCoord): NpPackage[] {
  return coord.parts.flatMap((part) =>
    part.items.filter((item): item is { kind: "package"; package: NpPackage } => item.kind === "package").map((item) => item.package),
  );
}

/** The stand-in a host's hosted slot holds: its `/b/`, or the grounds `barl` after an offset. */
function hostedStandIn(hosted: Hosted): LexWord | undefined {
  const stand = hosted.grounds ?? hosted.bound;
  return isStandIn(stand) ? stand : undefined;
}

/** The forward stand-in a unit holds (a noun's head, or an `/h/` host's or a bar's hosted `/b/`): the slot the next sentence fills. */
function standInIn(unit: Unit): LexWord | undefined {
  if (unit.kind === "np") {
    const head = npPackages(unit.coord).find((pkg) => isStandIn(pkg.head))?.head;
    if (head) return head;
    for (const part of unit.coord.parts) {
      for (const item of part.items) if (item.kind === "bar" && item.bar.hosted) return hostedStandIn(item.bar.hosted);
    }
    return undefined;
  }
  if (unit.kind === "h" && unit.unit.hosted) return hostedStandIn(unit.unit.hosted);
  return undefined;
}

/** Split a clause after unit `index`, whose stand-in `orodo` is filled by the units that follow. */
function splitAtStandIn(units: Unit[], index: number, orodo: LexWord): Clause {
  const rest = units.slice(index + 1);
  return { units: units.slice(0, index + 1), dependent: rest.length > 0 ? { orodo, clause: { units: rest } } : undefined };
}

const IMPLIED_SUBJECT_SERIES = new Set(["e", "u", "ao", "uo", "ua"]);

function verbalDependentIn(unit: Unit): { word: LexWord; coord: VpCoord; stacked: boolean } | undefined {
  if (unit.kind !== "vp" || unit.coord.parts.length === 0) return undefined;
  const lastPart = unit.coord.parts.at(-1)!;
  const lastItem = lastPart.items.at(-1);
  if (!lastPart.join && lastItem?.pos === "v" && isNamedStandIn(lastItem)) {
    return { word: lastItem, coord: unit.coord, stacked: false };
  }
  const join = lastPart.join;
  if (
    lastPart.items.length === 0 &&
    join?.pos === "v" &&
    isNamedStandIn(join)
  ) {
    return { word: join, coord: unit.coord, stacked: true };
  }
  return undefined;
}

function hasSubjectStart(unit: Unit | undefined): boolean {
  return unit?.kind === "np" && unit.coord.level === "z";
}

function allowsImpliedSubject(word: LexWord): boolean {
  if (word.family.kind !== "joinMarker") return false;
  return IMPLIED_SUBJECT_SERIES.has(word.family.series);
}

function disambiguateClause(units: Unit[]): Unit[] {
  // Verbless `zazawan godogol gul` / `zazawan garedel gumuzem gal`: the joined list is the predicate.
  if (units.length === 1 && units[0]!.kind === "np") {
    const coord = units[0].coord;
    const part = coord.parts[0];
    const item = coord.parts.length === 1 && part && !part.join && part.items.length === 1 ? part.items[0] : undefined;
    if (item?.kind === "package" && item.package.adjCoord) {
      const { adjCoord, ...pkg } = item.package;
      return [
        { kind: "np", coord: { level: coord.level, parts: [{ items: [{ kind: "package", package: { ...pkg, adjs: [] } }], shared: [] }] } },
        { kind: "gCoord", coord: adjCoord },
      ];
    }
  }
  // A trailing `/ɡ/` join fence (`zazawan godogol gul`) closes the predicate, not a second clause part.
  const rest = units.slice(1);
  const onlyGFences = rest.every((u) => u.kind === "predicate" && u.adj.word.family.kind === "joinMarker");
  if (units[0]?.kind !== "np" || !onlyGFences) return units;

  const coord = units[0].coord;
  const part = coord.parts[0];
  if (!part || part.items.length !== 1 || part.join) return units;

  const item = part.items[0]!;
  if (item.kind !== "package") return units;
  const pkg = item.package;
  if (pkg.adjs.length !== 1) return units;
  // A named citation keeps its `/ɡ/` words: `ohun galuden` is a full name, not *Ohu is an Aluden* (word-endings.md#multipart-names).
  if (rest.length === 0 && !pkg.head.pos && pkg.head.ending === "n") return units;

  const adj = pkg.adjs[0]!;
  return [
    {
      kind: "np",
      coord: {
        level: coord.level,
        parts: [{ items: [{ kind: "package", package: { ...pkg, adjs: [] } }], shared: [] }],
      },
    },
    { kind: "predicate", adj },
    ...rest,
  ];
}

function mergeIslandJoins(units: Unit[]): Unit[] {
  const out: Unit[] = [];
  for (let i = 0; i < units.length; i++) {
    const current = units[i]!;
    const island = units[i + 1];
    const closer = units[i + 2];
    const currentIsOpenNp =
      current.kind === "np" && current.coord.parts.every((part) => !part.join);
    const closerIsJoinNp =
      closer?.kind === "np" && closer.coord.parts.some((part) => part.join);
    // Only same-role material merges around an island (`zazawan ^ zunudel zal ^ zam`).
    const sameRole = current.kind === "np" && closer?.kind === "np" && current.coord.level === closer.coord.level;
    if (currentIsOpenNp && island?.kind === "island" && closerIsJoinNp && closer.kind === "np" && sameRole) {
      const leading = current.coord.parts.flatMap((part) => part.items);
      const firstClose = closer.coord.parts[0]!;
      out.push({
        kind: "np",
        coord: {
          level: closer.coord.level,
          parts: [
            {
              items: [...leading, { kind: "island", island: island.island }, ...firstClose.items],
              join: firstClose.join,
              shared: firstClose.shared,
            },
            ...closer.coord.parts.slice(1),
          ],
        },
      });
      i += 2;
      continue;
    }
    out.push(current);
  }
  return out;
}

function finalizeClause(units: Unit[]): Clause {
  const resolved = disambiguateClause(mergeAdjLists(mergeIslandJoins(units)));

  for (let i = 0; i < resolved.length - 1; i++) {
    const host = verbalDependentIn(resolved[i]!);
    const next = resolved[i + 1];
    if (!host || (!hasSubjectStart(next) && !(next?.kind === "vp" && allowsImpliedSubject(host.word)))) continue;
    const dependentWord = { ...host.word, reading: "standIn" as const };
    if (host.stacked) {
      const lastPart = host.coord.parts.at(-1)!;
      lastPart.items.push(dependentWord);
      lastPart.join = undefined;
    } else {
      const lastPart = host.coord.parts.at(-1)!;
      lastPart.items[lastPart.items.length - 1] = dependentWord;
    }
    return splitAtStandIn(resolved, i, dependentWord);
  }

  const orodoIdx = resolved.findIndex((unit) => standInIn(unit));
  if (orodoIdx < 0) return { units: resolved };
  const host = resolved[orodoIdx]!;
  // The stance join between a host and its `barl` stays in the main sentence.
  const splitAt = host.kind === "h" && host.unit.hosted?.afterJoin ? orodoIdx + 1 : orodoIdx;
  return splitAtStandIn(resolved, splitAt, standInIn(host)!);
}

function childNodes(parent: CstNode, key: string): CstNode[] {
  return (parent.children[key] ?? []) as CstNode[];
}

/** Hosted `/b/` continues as a join: zero or more further `/b/` words, then a `/b/` join word. */
/** A digit `/h/` number with a `+` / `-` marker: the ratio after an equative scale. */
/** A digitless `+` number token (`/ɡ/`, `/h/` or `/b/`): the scale after a rank join (comparatives.md § amount / frequency / time scale). */
function scaleNumberAhead(tok: IToken): boolean {
  if (!tokenIs(tok, G, H, B, HScale, BScale)) return false;
  const word = tok.payload as LexWord;
  if (word.family.kind !== "number") return false;
  return isScaleStem(word.family.stem);
}

function factorAhead(tok: IToken): boolean {
  if (!tokenIs(tok, H)) return false;
  const word = tok.payload as LexWord;
  if (word.family.kind !== "number") return false;
  const stem = word.family.stem;
  return (stem.marker === "+" || stem.marker === "-") && stem.groups.length > 0;
}

/** A place in a series (`#` from the start, `#-` from the end), including kin generations. */
function isOrdinalMarker(marker: NumberMarker): boolean {
  return marker === "#" || marker === "re" || marker === "#-" || marker === "rue";
}

function isLabelMarker(marker: NumberMarker): boolean {
  return marker === "_" || marker === "ro" || marker === "#_" || marker === "roe";
}

/**
 * Give words the token their neighbors decide. A word that completes the word right before it (clause.md § extra
 * nouns): a `/b/` after an `/h/`, `/th/` or `/ɡ/` word, or after a label-scope verb that names a pair
 * (predication.md#scope-relative), becomes {@link HostedB}, and a stand-in after an `/h/` or `/th/` word {@link HostedOdo}.
 * A cardinal `/ɡ/` right after a hosted `/b/` is that unit's {@link Amount}, and a signed `/h/` number after an
 * equative's shared scale its {@link Factor}. An `/h/` or digitless `/b/` number right after a rank noun join is its
 * shared scale ({@link HScale}, {@link BScale}), and a stance right after `uem` its frame ({@link HFrame}). Neither has a `/b/` slot, so a `/b/` after one fails to parse (`slotlessHost`).
 * A stance word that is a rank fence's bar becomes {@link Bar}, or {@link FenceBar} as the first bar after a closed `ua` fence.
 */
export function markContext(tokens: IToken[]): IToken[] {
  const retype = (token: IToken, type: TokenType | undefined): IToken =>
    type ? { ...token, tokenType: type, tokenTypeIdx: type.tokenTypeIdx! } : token;
  const out: IToken[] = [];
  for (const [i, token] of tokens.entries()) out.push(retype(token, hostedType(token, out, tokens.slice(i + 1))));
  const barred = out.map((token, i) => retype(token, barTypeAt(out, i)));
  return barred.map((token, i) => retype(token, isItemHookAt(barred, i) ? ItemHook : undefined));
}

/**
 * A hook and its `/b/` right before a noun list's join word, or before its bar, after a noun of that slot and what
 * describes it: the hook belongs to that last item (joins.md#shared-after-the-join), not to the clause.
 */
function isItemHookAt(tokens: IToken[], at: number): boolean {
  if (!tokenIs(tokens[at]!, Hook) || tokens[at + 1]?.tokenType !== B) return false;
  let item = at - 1;
  while (item >= 0 && tokenIs(tokens[item]!, GPlain, HostedB, Amount, W)) item -= 1;
  const head = tokens[item];
  const level = head && NP_SLOTS.find((slot) => tokenIs(head, ...Object.values(NP_HEAD[slot])));
  if (!level || tokenIs(tokens[at - 1]!, W)) return false;
  let next = at + 2;
  while (tokens[next] && tokenIs(tokens[next]!, W)) next += 1;
  return !!tokens[next] && tokenIs(tokens[next]!, NP_JOIN[level], Bar);
}

function hostedType(token: IToken, before: IToken[], after: IToken[]): TokenType | undefined {
  if (tokenIs(token, Hook)) return hostsAhead(token, after) ? HookHosting : undefined;
  const host = before.at(-1);
  if (!host) return undefined;
  if (isStanceWord(token) && isFrameHook(host)) return HFrame;
  if (tokenIs(token, H) && isRankNounJoin(before[skipWBack(before, before.length - 1)])) return HScale;
  if (token.tokenType === HPlain && before[skipWBack(before, before.length - 1)]?.tokenType === JoinV) return HSharedV;
  if (tokenIs(token, V) && isVerbListAt(before)) return VCont;
  if (tokenIs(token, B) && isRankNounJoin(host) && scaleNumberAhead(token)) return BScale;
  if (tokenIs(token, B) && (tokenIs(host, H, G, Amount, Factor, HScale, HSharedV, HFrame) || isScopeThoVerb(host))) {
    if (!isScopeThoVerb(host) && joinClosesAhead(after)) return HostedBJoined;
    return (token.payload as LexWord | undefined)?.family.kind === "number" ? HostedBNumber : HostedBNoun;
  }
  if (tokenIs(token, Odo) && tokenIs(host, H, Factor, HScale, HSharedV, HFrame)) return HostedOdo;
  if (token.tokenType === OdoB && isLateOdoAt(before)) return LateOdo;
  if (isAmountAt(token, before)) return Amount;
  if (isFactorAt(token, before)) return Factor;
  return undefined;
}

/** The words of a verb list's item before its verb (join-across-roles.md#vp-clause-forms). */
const VP_ITEM_MATERIAL = [H, W, D, B, TagD, TagB, HostedB, G];

/** A verb or a `/v/` join before this point, past only item material (or a shared adverb): a verb here goes on that list. */
function isVerbListAt(before: IToken[]): boolean {
  let i = before.length - 1;
  while (before[i] && tokenIs(before[i]!, ...VP_ITEM_MATERIAL, HSharedV)) i -= 1;
  return !!before[i] && tokenIs(before[i]!, V, JoinV);
}

/** A `/b/` word right after the hook (an extra noun, hooks.md#extra-noun), or the stance `uem` holds as its frame. */
function hostsAhead(hook: IToken, after: IToken[]): boolean {
  const next = after[0];
  if (!next) return false;
  return tokenIs(next, B, JoinB, OdoB, TagB, WritingSpanB) || (isFrameHook(hook) && isStanceWord(next));
}

/** `/b/` words, then a `/b/` join: a list that takes the hosted `/b/` before it as its first item (joins.md#right-close). */
function joinClosesAhead(after: IToken[]): boolean {
  let i = 0;
  while (after[i]?.tokenType === B) i += 1;
  return after[i]?.tokenType === JoinB;
}

/**
 * `barl` that fills a `/th/` host from further right: after a stance join that closes a pole with no `/b/` yet
 * (join-across-roles.md#stance-join-before-barl), or after a channel's offset (knowing.md#evidence-clause).
 */
function isLateOdoAt(before: IToken[]): boolean {
  let i = before.length - 1;
  if (before[i]?.tokenType === JoinTh) return before[skipWBack(before, i - 1)]?.tokenType === HTh;
  if (before[i]?.tokenType === Amount) i -= 1;
  if (before[i]?.tokenType === JoinB) {
    i -= 1;
    while (before[i]?.tokenType === B) i -= 1;
  }
  const offset = before[i];
  const number = (offset?.payload as LexWord | undefined)?.family.kind === "number";
  return !!offset && tokenIs(offset, HostedBNumber, HostedBJoined) && number && !!before[i - 1] && tokenIs(before[i - 1]!, HTh, HFrame);
}

/** A cardinal `/ɡ/` right after a hosted `/b/`, or after the join that fills that slot: the measure amount. */
function isAmountAt(token: IToken, before: IToken[]): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  if (!tokenIs(token, G) || family?.kind !== "number") return false;
  if (isOrdinalMarker(family.stem.marker) || isLabelMarker(family.stem.marker)) return false;
  let i = before.length - 1;
  if (before[i]?.tokenType === JoinB) {
    i -= 1;
    while (before[i]?.tokenType === B) i -= 1;
  }
  return !!before[i] && tokenIs(before[i]!, HostedB);
}

/** The index of the last token at or before `i` that is not a `/w/` word. */
function skipWBack(tokens: IToken[], i: number): number {
  while (i >= 0 && tokenIs(tokens[i]!, W)) i -= 1;
  return i;
}

/** A rank, equative or sequence join of a noun list: the word after it may be its shared scale (joins.md#shared-after-the-join). */
function isRankNounJoin(token: IToken | undefined): boolean {
  return !!token && tokenIs(token, JoinZ, JoinD, JoinB) && RANK_SERIES.has(joinSeries(token));
}

/** A signed `/h/` number right after the scale an `oe` join shares (comparatives.md § factor). */
function isFactorAt(token: IToken, before: IToken[]): boolean {
  if (!factorAhead(token) || !before.at(-1) || !tokenIs(before.at(-1)!, G, H, B, HScale, BScale)) return false;
  let i = before.length - 2;
  while (i >= 0 && tokenIs(before[i]!, W)) i -= 1;
  const join = before[i];
  return !!join && tokenIs(join, JoinZ, JoinD, JoinB) && joinSeries(join) === "oe";
}

function buildBoundJoin(parent: CstNode): BoundJoin | undefined {
  const tail = childNodes(parent, "boundJoinTail")[0];
  if (!tail) return undefined;
  return { members: childTokens(tail, "B").map(lexWordFromToken), join: lexWordFromToken(childToken(tail, "JoinB")!) };
}

function childToken(parent: CstNode, key: string, index = 0): IToken | undefined {
  const tok = parent.children[key]?.[index];
  return tok ? (tok as IToken) : undefined;
}

function childTokens(parent: CstNode, key: string): IToken[] {
  return (parent.children[key] ?? []) as IToken[];
}

function buildAsOfPair(cst: CstNode): { word: LexWord; bound?: LexWord } {
  const wTok = childToken(cst, "W")!;
  const boundTok = childToken(cst, "B") ?? childToken(cst, "Odo");
  return {
    word: lexWordFromToken(wTok),
    bound: boundTok ? lexWordFromToken(boundTok) : undefined,
  };
}

/** The hosted `/b/` slot a host rule parsed (its `/b/`, join, amount and landmark adjectives), or `undefined` with no `/b/`. */
function buildHosted(cst: CstNode, bound: IToken | undefined, amount: IToken | undefined, grounds?: IToken): Hosted | undefined {
  if (!bound) return undefined;
  const adjs = childNodes(cst, "gPackage").map(buildGPackage);
  const boundJoin = buildBoundJoin(cst);
  return {
    bound: lexWordFromToken(bound),
    ...(boundJoin ? { boundJoin } : {}),
    ...(amount ? { amount: lexWordFromToken(amount) } : {}),
    ...(adjs.length > 0 ? { adjs } : {}),
    ...(grounds ? { grounds: lexWordFromToken(grounds) } : {}),
  };
}

function buildGPackage(cst: CstNode): GPackage {
  const gTok = childToken(cst, "G")!;
  const asOfCst = childNodes(cst, "asOfWPair")[0];
  const hosted = buildHosted(cst, childToken(cst, "B"), childToken(cst, "G", 1));
  return {
    word: lexWordFromToken(gTok),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    ...(hosted ? { hosted } : {}),
    asOf: asOfCst ? buildAsOfPair(asOfCst) : undefined,
  };
}

function buildNpPackage(cst: CstNode): NpPackage {
  const gPackages = childNodes(cst, "gPackage");
  const firstG = gPackages[0];
  const glAdj =
    firstG && (childToken(firstG, "G")?.payload as LexWord | undefined)?.gl
      ? buildGPackage(firstG)
      : undefined;
  const trailingAdjs = (glAdj ? gPackages.slice(1) : gPackages).map(buildGPackage);
  const headTok =
    childToken(cst, "Z") ??
    childToken(cst, "D") ??
    childToken(cst, "B") ??
    childToken(cst, "Odo") ??
    childToken(cst, "WritingSpan") ??
    childToken(cst, "Citation")!;
  const tag = childToken(cst, "tag");
  return {
    glAdj,
    head: lexWordFromToken(headTok),
    adjs: trailingAdjs,
    ...(tag ? { tag: lexWordFromToken(tag) } : {}),
  };
}

/** Tag a shared `/ɡ/` / `/h/` digitless `+` right after a rank join as the scale. */
function tagScale(join: LexWord | undefined, item: GPackage | HUnit): CoordShared {
  const series = join?.family.kind === "joinMarker" ? join.family.series : "";
  const { family } = item.word;
  return RANK_SERIES.has(series) && family.kind === "number" && isScaleStem(family.stem) ? { ...item, kind: "scale" } : item;
}

function buildShared(cst: CstNode | undefined, join: LexWord | undefined): CoordShared[] {
  if (!cst) return [];
  const scale = childToken(cst, "scale");
  if (scale) return [{ kind: "scale", word: lexWordFromToken(scale), modifiers: [] }];
  const g = childNodes(cst, "gPackage");
  if (g.length > 0) return g.map(buildGPackage).map((item) => tagScale(join, item));
  const h = childNodes(cst, "hUnitRule")[0];
  if (h) return [tagScale(join, buildHUnit(h))];
  return [];
}

/** A part's join close: after its conjuncts, or standing alone (labeled `standaloneJoin`). */
function partJoinClose(part: CstNode, rule: string): CstNode | undefined {
  return childNodes(part, rule)[0] ?? childNodes(part, "standaloneJoin")[0];
}

function joinFromClose(close: CstNode | undefined): { join?: LexWord; shared: CoordShared[]; joinModifiers?: LexWord[]; factor?: LexWord } {
  if (!close) return { shared: [] };
  const joinTok =
    childToken(close, "JoinZ") ??
    childToken(close, "JoinD") ??
    childToken(close, "JoinB") ??
    childToken(close, "JoinV") ??
    childToken(close, "JoinG") ??
    childToken(close, "JoinH") ??
    childToken(close, "JoinX");
  const sharedCst = childNodes(close, "sharedAfterJoin")[0];
  const modifiers = childTokens(close, "W").map(lexWordFromToken);
  const factorTok = childToken(close, "factor");
  const join = joinTok ? lexWordFromToken(joinTok) : undefined;
  return {
    join,
    shared: buildShared(sharedCst, join),
    ...(factorTok ? { factor: lexWordFromToken(factorTok) } : {}),
    ...(modifiers.length > 0 ? { joinModifiers: modifiers } : {}),
  };
}

function buildIsland(cst: CstNode): IslandUnit {
  return { units: chainUnits(cst).flatMap(expandUnits) };
}

/** The unit nodes of a clause or island, in order: each `unit` rule holds one unit and the rest of the chain. */
function chainUnits(parent: CstNode): CstNode[] {
  const units: CstNode[] = [];
  for (let unit = childNodes(parent, "unit")[0]; unit; unit = childNodes(unit, "unit")[0]) units.push(unit);
  return units;
}

/**
 * A list's parts, each closed by its join; a unit with no join (a lone noun, verb, adjective or adverb) is its own
 * single part.
 */
function coordParts(cst: CstNode, coordRule: string, partRule: string): CstNode[] {
  return isCoordRule(cst.name, coordRule) ? childNodes(cst, partRule) : [cst];
}

/** A list rule in any of its forms (`zCoord`, `zCoordOpen`, `gCoordLead`, …). */
function isCoordRule(name: string, coordRule: string): boolean {
  return new RegExp(`^${coordRule}(Open|Closed|Shared|Grounds|Lead|PlainLead)?$`).test(name);
}

function npCoordCst(parent: CstNode): CstNode | undefined {
  return childNodes(parent, "zCoord")[0] ?? childNodes(parent, "dCoord")[0] ?? childNodes(parent, "bCoord")[0];
}

function npCoordParts(cst: CstNode): CstNode[] {
  return coordParts(cst, `${cst.name[0]}Coord`, `${cst.name[0]}CoordPart`);
}

function buildNpCoord(cst: CstNode): NpCoord {
  const parts = npCoordParts(cst);
  const built: NpCoord["parts"] = parts.map((part) => {
    if (part === cst && !isCoordRule(cst.name, `${cst.name[0]}Coord`)) return { items: [{ kind: "package", package: buildNpPackage(part) }], shared: [] };
    const close = partJoinClose(part, "npJoinClose");
    const { join, shared, joinModifiers, factor } = joinFromClose(close);
    const packages = childNodes(part, "npConjunct").map(buildNpPackage);
    // A hook + `/b/` before the join word rides on the last item as a hosted pair, like a `/ɡ/` with its own `/b/`.
    const itemHook = childToken(part, "itemHook");
    const itemHookBound = childToken(part, "itemHookBound");
    if (itemHook && itemHookBound) {
      packages.at(-1)!.adjs.push({ word: lexWordFromToken(itemHook), modifiers: [], hosted: { bound: lexWordFromToken(itemHookBound) } });
    }
    const items: NpItem[] = [
      ...packages.map((pkg): NpItem => ({ kind: "package", package: pkg })),
      ...childNodes(part, "bar").map((bar): NpItem => ({ kind: "bar", bar: buildHUnit(bar) })),
    ];
    const tag = childToken(part, "groupTag");
    return {
      items,
      join,
      shared,
      ...(joinModifiers ? { joinModifiers } : {}),
      ...(factor ? { factor } : {}),
      ...(tag ? { tag: lexWordFromToken(tag) } : {}),
    };
  });
  const joinTok = built.find((part) => part.join)?.join;
  let level: NpCoord["level"] = "z";
  if (joinTok) {
    const pos = joinTok.pos;
    if (pos === "d" || pos === "b") level = pos;
  } else {
    const firstPkg = built.flatMap((p) => p.items).find((i) => i.kind === "package");
    if (firstPkg && firstPkg.kind === "package") {
      const pos = firstPkg.package.head.pos;
      if (pos === "d" || pos === "b" || pos === "z") level = pos;
    }
  }
  return { level, parts: built };
}

function buildVpCoord(cst: CstNode): VpCoord {
  const parts = coordParts(cst, "vpCoord", "vpCoordPart");
  return {
    parts: parts.map((part) => {
      const close = partJoinClose(part, "vJoinClose");
      const { join, shared, joinModifiers } = joinFromClose(close);
      const verbs = childTokens(part, "V");
      const hostedVerbs = childTokens(part, "B").map((b) => {
        const verb = verbs.filter((v) => v.startOffset < b.startOffset).at(-1)!;
        return { verb: lexWordFromToken(verb), hosted: { bound: lexWordFromToken(b) } };
      });
      const items = verbs.map(lexWordFromToken);
      const itemUnits = groupItemUnits(childNodes(part, "vpItemUnit"), verbs, items);
      const built = {
        items,
        join,
        shared,
        ...(joinModifiers ? { joinModifiers } : {}),
        ...(itemUnits.length > 0 ? { itemUnits } : {}),
      };
      return hostedVerbs.length > 0 ? { ...built, hostedVerbs } : built;
    }),
  };
}

function firstOffset(cst: CstNode): number {
  let min = Infinity;
  for (const kids of Object.values(cst.children)) {
    for (const kid of kids) {
      const offset = "image" in kid ? kid.startOffset : firstOffset(kid);
      if (offset < min) min = offset;
    }
  }
  return min;
}

/** Each item unit goes with the first verb after it, in spoken order. */
function groupItemUnits(cstUnits: CstNode[], verbs: IToken[], items: LexWord[]): { verb: LexWord; units: Unit[] }[] {
  const out: { verb: LexWord; units: Unit[] }[] = [];
  for (const cst of [...cstUnits].sort((a, b) => firstOffset(a) - firstOffset(b))) {
    const index = verbs.findIndex((v) => v.startOffset > firstOffset(cst));
    const verb = items[index]!;
    let entry = out.find((e) => e.verb === verb);
    if (!entry) out.push((entry = { verb, units: [] }));
    entry.units.push(...expandUnits(cst));
  }
  return out;
}

function buildHUnit(cst: CstNode): HUnit {
  const h = childToken(cst, "H")!;
  const boundTok = childToken(cst, "B");
  const hosted = buildHosted(cst, boundTok ?? childToken(cst, "Odo"), childToken(cst, "G"), boundTok ? childToken(cst, "Odo") : undefined);
  return {
    word: lexWordFromToken(h),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    ...(hosted ? { hosted } : {}),
  };
}

function buildHookUnit(cst: CstNode): Extract<Unit, { kind: "hook" }> {
  const frame = childNodes(cst, "frame")[0];
  return {
    kind: "hook",
    word: lexWordFromToken(childToken(cst, "Hook")!),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    ...(frame ? { frame: buildHUnit(frame) } : {}),
  };
}

function flattenHUnits(cst: CstNode): Unit[] {
  const parts = coordParts(cst, "hCoord", "hCoordPart");
  const units: Unit[] = [];
  for (const part of parts) {
    const hUnits = childNodes(part, "hUnitRule").map(buildHUnit);
    const close = partJoinClose(part, "hJoinClose");
    const { join } = joinFromClose(close);
    const lateBound = childToken(part, "lateBound");
    const last = hUnits.at(-1);
    if (lateBound && last) last.hosted = { bound: lexWordFromToken(lateBound), afterJoin: true };
    for (const unit of hUnits) units.push({ kind: "h", unit });
    // Keep the fence (`/h/` or stance `thul` / `thol` / …) so it is not silently dropped.
    if (join) units.push({ kind: "h", unit: { word: join, modifiers: [] } });
  }
  return units;
}

function buildGCoord(cst: CstNode): GCoord {
  return {
    parts: coordParts(cst, "gCoord", "gCoordPart").map((part) => {
      const { join, shared, joinModifiers } = joinFromClose(partJoinClose(part, "gJoinClose"));
      const items: GItem[] = childNodes(part, "gPackage").map((g) => ({ kind: "adj", adj: buildGPackage(g) }));
      return { items, join, shared, ...(joinModifiers ? { joinModifiers } : {}) };
    }),
  };
}

/** `/ɡ/` material that can continue an adjective list: an adjective, a `/ɡ/` coord, or an island of those. */
function isGMaterial(unit: Unit | undefined): boolean {
  if (unit?.kind === "predicate" || unit?.kind === "gCoord") return true;
  return unit?.kind === "island" && unit.island.units.length > 0 && unit.island.units.every(isGMaterial);
}

function hasGJoin(unit: Unit): boolean {
  if (unit.kind === "gCoord") return true;
  if (unit.kind === "predicate") return unit.adj.word.family.kind === "joinMarker";
  return unit.kind === "island" && unit.island.units.some(hasGJoin);
}

type GToken = GItem | { kind: "join"; join: LexWord; shared: CoordShared[]; joinModifiers?: LexWord[] };

function gTokens(unit: Unit): GToken[] {
  if (unit.kind === "island") return [{ kind: "island", island: unit.island }];
  if (unit.kind === "predicate") {
    return unit.adj.word.family.kind === "joinMarker"
      ? [{ kind: "join", join: unit.adj.word, shared: [] }]
      : [{ kind: "adj", adj: unit.adj }];
  }
  if (unit.kind === "gCoord") {
    return unit.coord.parts.flatMap((part): GToken[] => [
      ...part.items,
      ...(part.join
        ? [{ kind: "join" as const, join: part.join, shared: part.shared, ...(part.joinModifiers ? { joinModifiers: part.joinModifiers } : {}) }]
        : []),
    ]);
  }
  return [];
}

/** Right-close parts from a flat run: each join closes the items since the previous join. */
function gCoordFromTokens(tokens: GToken[]): GCoord {
  const parts: GCoord["parts"] = [];
  let items: GItem[] = [];
  for (const token of tokens) {
    if (token.kind === "join") {
      parts.push({ items, join: token.join, shared: token.shared, ...(token.joinModifiers ? { joinModifiers: token.joinModifiers } : {}) });
      items = [];
    } else items.push(token);
  }
  if (items.length > 0) parts.push({ items, shared: [] });
  return { parts };
}

function gCoordAdjs(coord: GCoord): GPackage[] {
  return coord.parts.flatMap((part) =>
    part.items.flatMap((item) =>
      item.kind === "adj"
        ? [item.adj]
        : item.island.units.flatMap((u) => (u.kind === "predicate" || u.kind === "gCoord" ? gTokens(u) : []))
            .flatMap((t) => (t.kind === "adj" ? [t.adj] : [])),
    ),
  );
}

/**
 * Gather a joined `/ɡ/` list into one structure (joins.md § right-close). After a noun whose package already
 * has adjectives, the list is attributive on that package; elsewhere it is one predicate `gCoord` unit.
 */
function mergeAdjLists(units: Unit[]): Unit[] {
  const out: Unit[] = [];
  let i = 0;
  while (i < units.length) {
    const unit = units[i]!;
    let j = i;
    while (j < units.length && isGMaterial(units[j])) j += 1;
    if (j === i) {
      out.push(unit);
      i += 1;
      continue;
    }
    const run = units.slice(i, j);
    if (!run.some(hasGJoin)) {
      out.push(...run);
      i = j;
      continue;
    }
    const prev = out.at(-1);
    const lastPart = prev?.kind === "np" ? prev.coord.parts.at(-1) : undefined;
    const lastItem = lastPart && !lastPart.join ? lastPart.items.at(-1) : undefined;
    // `/ɡ/` right after a noun describes it (as `npPackage` does); a bare leading join (`zodogol gal`) stays apart.
    const first = run[0]!;
    const leadingJoin = first.kind === "gCoord" && first.coord.parts[0]!.items.length === 0;
    const attributive =
      lastItem?.kind === "package" &&
      !lastItem.package.adjCoord &&
      (lastItem.package.adjs.length > 0 || !leadingJoin);
    if (!attributive && run.length === 1 && run[0]!.kind === "gCoord") {
      out.push(run[0]!);
      i = j;
      continue;
    }
    if (attributive && lastItem.kind === "package") {
      const pkg = lastItem.package;
      const tokens: GToken[] = [...pkg.adjs.map((adj): GItem => ({ kind: "adj", adj })), ...run.flatMap(gTokens)];
      const adjCoord = gCoordFromTokens(tokens);
      lastItem.package = { ...pkg, adjs: gCoordAdjs(adjCoord), adjCoord };
    } else {
      out.push({ kind: "gCoord", coord: gCoordFromTokens(run.flatMap(gTokens)) });
    }
    i = j;
  }
  return out;
}

function flattenGCoord(cst: CstNode): Unit[] {
  const parts = coordParts(cst, "gCoord", "gCoordPart");
  const units: Unit[] = [];
  for (const part of parts) {
    for (const g of childNodes(part, "gPackage")) {
      units.push({ kind: "predicate", adj: buildGPackage(g) });
    }
    // Keep the fence (`gul`, `gel`, …) and its shared word so neither is silently dropped.
    const { join, shared } = joinFromClose(partJoinClose(part, "gJoinClose"));
    if (join) units.push({ kind: "predicate", adj: { word: join, modifiers: [] } });
    for (const item of shared) {
      if (item.word.pos === "g") units.push({ kind: "predicate", adj: item as GPackage });
      else if (item.word.pos === "h") units.push({ kind: "h", unit: item as HUnit });
    }
  }
  return units;
}

function buildUnit(cst: CstNode): Unit {
  const island = childNodes(cst, "islandUnit")[0];
  if (island) return { kind: "island", island: buildIsland(island) };
  const np = npCoordCst(cst);
  if (np) return { kind: "np", coord: buildNpCoord(np) };
  const vp = childNodes(cst, "vpCoord")[0];
  if (vp) return { kind: "vp", coord: buildVpCoord(vp) };
  const g = childNodes(cst, "gCoord")[0];
  if (g) {
    const preds = flattenGCoord(g);
    return preds[0] ?? { kind: "predicate", adj: { word: lexWordFromToken(childToken(g, "G")!), modifiers: [] } };
  }
  const h = childNodes(cst, "hCoord")[0];
  if (h) {
    const hs = flattenHUnits(h);
    return hs[0] ?? { kind: "h", unit: { word: lexWordFromToken(childToken(h, "H")!), modifiers: [] } };
  }
  const hook = childNodes(cst, "hookUnit")[0];
  if (hook) return buildHookUnit(hook);
  throw new SentenceParseError(`Unhandled unit: ${Object.keys(cst.children).join(",")}`);
}

function expandUnits(cst: CstNode): Unit[] {
  const island = childNodes(cst, "islandUnit")[0];
  if (island) return [{ kind: "island", island: buildIsland(island) }];
  const np = npCoordCst(cst);
  if (np) return [{ kind: "np", coord: buildNpCoord(np) }];
  const vp = childNodes(cst, "vpCoord")[0];
  if (vp) return [{ kind: "vp", coord: buildVpCoord(vp) }];
  const g = childNodes(cst, "gCoord")[0];
  if (g) {
    const coord = buildGCoord(g);
    return coord.parts.some((part) => part.join) ? [{ kind: "gCoord", coord }] : flattenGCoord(g);
  }
  const h = childNodes(cst, "hCoord")[0];
  if (h) return flattenHUnits(h);
  const hook = childNodes(cst, "hookUnit")[0];
  if (hook) return [buildHookUnit(hook)];
  return [buildUnit(cst)];
}

function buildClauseItem(cst: CstNode): Clause {
  const standInTok = childToken(cst, "standIn");
  const units = chainUnits(cst).flatMap(expandUnits);
  if (!standInTok) return finalizeClause(units);
  const standIn: Unit = { kind: "clauseCoord", coord: { links: [{ join: lexWordFromToken(standInTok) }] } };
  if (units.length === 0) return { units: [standIn] };
  const rest = finalizeClause(units);
  return { ...rest, units: [standIn, ...rest.units] };
}

/** The innermost forward dependent a clause opens: its stand-in's sentence, or that sentence's own. */
function innermostDependent(clause: Clause | undefined): OdoDependent | undefined {
  let dep = clause?.dependent;
  while (dep?.clause.dependent) dep = dep.clause.dependent;
  return dep;
}

/**
 * Join clause items. The sentence after a forward stand-in runs to the end of the written sentence,
 * so clause joins after it stay inside that dependent (dependents.md#dependent-clauses).
 */
function joinClauseItems(items: (Clause | undefined)[], joins: LexWord[]): Clause {
  if (joins.length === 0) return items[0]!;
  const at = items.findIndex((item, i) => i < joins.length && innermostDependent(item));
  if (at >= 0) {
    const dep = innermostDependent(items[at])!;
    dep.clause = joinClauseItems([dep.clause, ...items.slice(at + 1)], joins.slice(at));
    return joinClauseItems(items.slice(0, at + 1), joins.slice(0, at));
  }
  return {
    units: [
      {
        kind: "clauseCoord",
        coord: { first: items[0], links: joins.map((join, i) => ({ join, clause: items[i + 1] })) },
      },
    ],
  };
}

function buildClause(cst: CstNode): Clause {
  const items = childNodes(cst, "clauseItem").map(buildClauseItem);
  const joins = childTokens(cst, "midJoin").map(lexWordFromToken);
  return joinClauseItems(items, joins);
}

function impliedForceFromPolars(polars: LexWord[]): ImpliedForce | undefined {
  if (polars.length === 0) return undefined;
  const last = polars[polars.length - 1]!;
  return last.ending === "m" ? "yam" : "yal";
}

function buildLeftEdge(cst: CstNode | undefined): LeftEdge {
  if (!cst) {
    return { vocatives: [], interjections: [], polars: [], impliedForce: "yal" };
  }

  const words = childNodes(cst, "turnWord");
  const mods = (word: CstNode): TurnWordMods => {
    const glCst = childNodes(word, "glAdj")[0];
    const w = childTokens(word, "W").map(lexWordFromToken);
    return { ...(glCst ? { glAdj: buildGPackage(glCst) } : {}), ...(w.length > 0 ? { w } : {}), adjs: childNodes(word, "gPackage").map(buildGPackage) };
  };
  const described = (list: TurnWordMods[]) => list.some((m) => m.glAdj || m.w || m.adjs.length > 0);
  const calls = words.filter((word) => childToken(word, "Vocative"));
  const reactions = words.filter((word) => childToken(word, "Interjection"));
  const vocatives = calls.map((call) => lexWordFromToken(childToken(call, "Vocative")!));
  const vocativeAdjs = calls.map(mods);
  const interjections = reactions.map((reaction) => lexWordFromToken(childToken(reaction, "Interjection")!));
  const interjectionMods = reactions.map(mods);
  const polars = childTokens(cst, "Polar").map(lexWordFromToken);
  const hookTok = childToken(cst, "Hook");
  const forceTok = childToken(cst, "Force");
  const force = forceTok ? lexWordFromToken(forceTok) : undefined;
  const leadTok = childToken(cst, "LeadForce");
  const impliedForce = force ? undefined : impliedForceFromPolars(polars) ?? "yal";
  const hookModifiers = childTokens(cst, "W").map(lexWordFromToken);

  return {
    vocatives,
    ...(described(vocativeAdjs) ? { vocativeAdjs } : {}),
    interjections,
    ...(described(interjectionMods) ? { interjectionMods } : {}),
    polars,
    hook: hookTok ? lexWordFromToken(hookTok) : undefined,
    hookModifiers: hookModifiers.length > 0 ? hookModifiers : undefined,
    leadForce: leadTok ? lexWordFromToken(leadTok) : undefined,
    force,
    impliedForce,
  };
}

function buildBodyClause(cst: CstNode, trailingPunct?: IToken): BodyClause {
  const linkerTok = childToken(cst, "Linker") ?? childToken(cst, "crossJoin");
  const clauseCst = childNodes(cst, "clause")[0];
  const marker = childToken(cst, "topicMarker");
  return {
    ...(marker ? { topicMarker: lexWordFromToken(marker) } : {}),
    linker: linkerTok ? lexWordFromToken(linkerTok) : undefined,
    clause: clauseCst ? buildClause(clauseCst) : { units: [] },
    punct: trailingPunct ? punctFromToken(trailingPunct) : undefined,
  };
}

/** The tokens under a CST node, in no particular order. */
function cstTokens(cst: CstNode): IToken[] {
  return Object.values(cst.children).flatMap((kids) => kids.flatMap((kid) => ("image" in kid ? [kid] : cstTokens(kid))));
}

/**
 * Group the document's sentences into utterances. A sentence with a left edge opens a new utterance, and so does one
 * that starts with a hook (an extra-noun hook after a sentence end starts a new turn); any other sentence continues
 * the utterance before it. Each body takes the period right after its sentence.
 */
function buildUtterances(cst: CstNode, tokens: IToken[]): Utterance[] {
  const position = new Map(tokens.map((token, i) => [token, i]));
  const sentences = childNodes(cst, "sentence").map((sentence) => {
    const at = cstTokens(sentence).map((token) => position.get(token)!);
    return { cst: sentence, start: Math.min(...at), end: Math.max(...at) };
  });
  const utterances: Utterance[] = [];
  for (const sentence of sentences) {
    const edge = childNodes(sentence.cst, "leftEdge")[0];
    if (utterances.length === 0 || edge || tokenIs(tokens[sentence.start]!, Hook)) {
      utterances.push({ left: buildLeftEdge(edge), bodies: [] });
    }
    const body = childNodes(sentence.cst, "edgeBody")[0] ?? childNodes(sentence.cst, "bodyClause")[0];
    const next = tokens[sentence.end + 1];
    if (body) utterances.at(-1)!.bodies.push(buildBodyClause(body, next && tokenIs(next, Period) ? next : undefined));
  }
  return utterances;
}

export function parseSentenceTokens(input: IToken[]): ParseResult {
  const tokens = markContext(input);
  parserInstance.input = tokens;
  const cst = parserInstance.document();
  lastCst = cst;

  if (parserInstance.errors.length > 0) {
    throw new SentenceParseError(
      parserInstance.errors.map((e) => e.message).join("; "),
      parserInstance.errors,
    );
  }

  const utterances = buildUtterances(cst, tokens);
  const result = { utterances };
  assignHookJobs(result);
  return result;
}

/** Parse and also return the CST (construction tracing reads rule / child keys off it). */
export function parseSentenceTokensWithCst(tokens: IToken[]): { result: ParseResult; cst: CstNode } {
  const result = parseSentenceTokens(tokens);
  return { result, cst: lastCst! };
}

/** Grammar productions keyed by rule name (the sentence-layer construction inventory). */
export function sentenceGrammar(): ReturnType<AgazanSentenceParser["getGAstProductions"]> {
  return parserInstance.getGAstProductions();
}
