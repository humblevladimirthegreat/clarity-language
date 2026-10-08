import { CstParser, EOF, tokenMatcher, type CstNode, type IToken, type TokenType } from "chevrotain";
import { LLStarLookaheadStrategy } from "chevrotain-allstar";

import {
  allTokens,
  Bang,
  B,
  D,
  Force,
  G,
  H,
  IslandClose,
  IslandOpen,
  JoinB,
  JoinD,
  JoinG,
  JoinH,
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
  V,
  Vocative,
  Interjection,
  W,
  WAsOf,
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

/** Stance `/th/` join word (`thul`, `thar`, …); bare `/h/` joins are not standalone. */
function isStanceJoin(token: IToken): boolean {
  return token.tokenType === JoinH && (token.payload as LexWord | undefined)?.pos === "th";
}

/** The token is one of these types, or a member of one of these categories (`W`, `Odo`). */
function tokenIs(token: IToken, ...types: TokenType[]): boolean {
  return types.some((type) => tokenMatcher(token, type));
}

type NpSlot = "z" | "d" | "b";
const NP_SLOTS = ["z", "d", "b"] as const;

/** The head tokens of a noun phrase at each slot: a noun, a stand-in, or a written span. */
const NP_HEAD = {
  z: { noun: Z, standIn: OdoZ, span: WritingSpanZ },
  d: { noun: D, standIn: OdoD, span: WritingSpanD },
  b: { noun: B, standIn: OdoB, span: WritingSpanB },
} as const;

function npSlot(token: IToken): NpSlot | undefined {
  return NP_SLOTS.find((slot) => {
    const head = NP_HEAD[slot];
    return tokenIs(token, NP_JOIN[slot], head.noun, head.standIn, head.span);
  });
}

function isGlHead(token: IToken): boolean {
  return token.tokenType === G && (token.payload as LexWord).gl === true;
}

/** A label-scope verb that names a pair hosts the `/b/` right after it (predication.md#scope-relative). */
function isScopeThoVerb(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  const v = family?.kind === "x" && family.xFamily === "scope" ? family.stanceVowel : undefined;
  return token.tokenType === V && (v === "o" || v === "ao" || v === "uo");
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
  return token.tokenType === H && (token.payload as LexWord | undefined)?.pos === "th";
}

/** `uem` *contrary to*: a `/th/` stance right after it is its opposing frame (sakes.md#contrary-to-stance). */
function isFrameHook(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  return token.tokenType === Hook && family?.kind === "hook" && family.form === "uem";
}

function isFrameHookAhead(parser: AgazanSentenceParser, at: number): boolean {
  return isFrameHook(parser.lookahead(at)) && isStanceWord(parser.lookahead(at + 1));
}

/**
 * A `/th/` stance word right before a closed or open rank join of this level (`zel` / `zuel` / `zoel`, -l or -m)
 * is that fence's bar (comparatives.md § bars). Its hosted tail (`/b/`, a `/b/` join, an offset amount, `barl`)
 * may sit between; so may a second stance word, which enforce rejects.
 */
function rankBarAhead(parser: AgazanSentenceParser, level: NpSlot, from = 1): boolean {
  let i = laAfterW(parser, from);
  if (!isStanceWord(parser.lookahead(i))) return false;
  // After the bar's `/b/`, a plain adjective describes that noun (*than tired learners*, clause.md § complex chaining).
  let bound = false;
  for (; ; i++) {
    const tok = parser.lookahead(i);
    if (tok.tokenType === NP_JOIN[level]) {
      const ending = (tok.payload as LexWord | undefined)?.ending;
      return BAR_SERIES.has(joinSeries(tok)) && (ending === "l" || ending === "m");
    }
    const payload = tok.payload as LexWord | undefined;
    const number = payload?.family?.kind === "number";
    const landmarkAdj = bound && tok.tokenType === G && !payload?.gl;
    if (!(isStanceWord(tok) || tokenIs(tok, W, B, JoinB, Odo) || (tok.tokenType === G && number) || landmarkAdj)) return false;
    if (tok.tokenType === B) bound = true;
  }
}

/**
 * Inside a verb list closed by a `/v/` join, an `/h/` unit or a `/d/` `/b/` phrase before a later verb belongs to
 * that verb's item (join-across-roles.md#vp-clause-forms). True when such material starts here and the stretch
 * ahead reaches another verb and then the `/v/` join word with nothing else in between.
 */
function vpItemMaterialAhead(parser: AgazanSentenceParser): boolean {
  const first = parser.lookahead(1);
  if (!tokenIs(first, D, B) && parser.lookahead(laAfterW(parser)).tokenType !== H) return false;
  let sawVerb = false;
  for (let i = 1; ; i += 1) {
    const tok = parser.lookahead(i);
    if (tok.tokenType === V) sawVerb = true;
    else if (tok.tokenType === JoinV) return sawVerb;
    else if (!tokenIs(tok, H, W, D, B, G)) return false;
  }
}

function isNpSlotLookahead(parser: AgazanSentenceParser, slot: NpSlot): boolean {
  if (npSlot(parser.lookahead(1)) === slot) return true;
  if (isGlHead(parser.lookahead(1)) && glHeadSlot(parser, 2) === slot) return true;
  const i = laAfterW(parser);
  return isGlHead(parser.lookahead(i)) && glHeadSlot(parser, i + 1) === slot;
}

/**
 * The slot of the noun a `gl-` adjective leans on, from the word after the adjective. A `/b/` there is the
 * adjective's own hosted noun, so the head is the word after it (`glugol bazawan zodogal`); with no head after
 * it, the `/b/` slot is tried and fails.
 */
function glHeadSlot(parser: AgazanSentenceParser, i: number): NpSlot | undefined {
  if (!tokenIs(parser.lookahead(i), B)) return npSlot(parser.lookahead(i));
  return npSlot(parser.lookahead(i + 1)) ?? "b";
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

  public sentence = this.RULE("sentence", () => {
    this.OR([
      {
        GATE: () => tokenIs(this.LA(1), Polar, Force) || this.turnWordAhead() || this.discourseHookAhead(),
        ALT: () => {
          this.SUBRULE(this.leftEdge);
          this.OPTION(() => {
            this.SUBRULE(this.bodyClause, { LABEL: "edgeBody" });
          });
        },
      },
      {
        ALT: () => {
          this.SUBRULE2(this.bodyClause);
        },
      },
    ]);
  });

  /**
   * A call (or a greeting bid) or a reaction, with what describes it: a `gl-` adjective before it, `/w/` right before it,
   * and plain `/ɡ/` words after it (`yohun galuden`, `glelavam yezul`, `welavam yezum`; speech-moves.md#describe-turn-word).
   */
  public turnWord = this.RULE("turnWord", () => {
    this.OPTION({
      GATE: () => {
        const la = this.LA(laAfterW(this));
        return la.tokenType === G && (la.payload as LexWord).gl === true;
      },
      DEF: () => this.SUBRULE(this.gPackage, { LABEL: "glAdj" }),
    });
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.OR([{ ALT: () => this.CONSUME(Vocative) }, { ALT: () => this.CONSUME(Interjection) }]);
    this.MANY2({
      GATE: () => this.plainAdjAhead(),
      DEF: () => this.SUBRULE2(this.gPackage),
    });
  });

  /** A call or reaction ahead, after any `/w/` and any `gl-` adjective (with its hosted `/b/`) that describe it. */
  private turnWordAhead(): boolean {
    let i = laAfterW(this);
    const la = this.LA(i);
    if (la.tokenType === G && (la.payload as LexWord).gl === true) {
      i += 1;
      if (this.LA(i).tokenType === B) i += 1;
    }
    return tokenIs(this.LA(i), Vocative, Interjection);
  }

  public leftEdge = this.RULE("leftEdge", () => {
    this.OR([
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => tokenIs(this.LA(1), Polar) || this.turnWordAhead() || this.discourseHookAhead(),
            DEF: () => this.OR2([
              { GATE: () => this.turnWordAhead(), ALT: () => this.SUBRULE(this.turnWord) },
              { ALT: () => this.CONSUME(Polar) },
              {
                GATE: () => this.discourseHookAhead(),
                ALT: () => {
                  this.MANY(() => {
                    this.CONSUME(W);
                  });
                  this.CONSUME(Hook);
                },
              },
            ]),
          });
          this.OPTION(() => {
            this.OPTION2({
              GATE: () => this.leadForceAhead(),
              DEF: () => this.CONSUME3(Force, { LABEL: "LeadForce" }),
            });
            this.CONSUME(Force);
          });
        },
      },
      {
        ALT: () => {
          // A force pair (`yul yul`, `yal yol`): which pairs are legal is decided by enforce (FORCE_PAIRS).
          this.OPTION3({
            GATE: () => this.leadForceAhead(),
            DEF: () => this.CONSUME4(Force, { LABEL: "LeadForce" }),
          });
          this.CONSUME2(Force);
          // Asking tag `yol yael.` / `yol yaol.` (questions.md § tags): force + polars with no body.
          this.MANY2({
            GATE: () => tokenIs(this.LA(1), Polar) && this.tagPolarsAhead(),
            DEF: () => this.CONSUME2(Polar),
          });
        },
      },
    ]);
  });

  /**
   * A hook (after any `/w/`) that glues the sentence to prior talk: `/b/` right after it makes it an extra-noun hook instead
   * (hooks.md § Extra noun), and a stance right after `uem` its frame (sakes.md#contrary-to-stance).
   */
  private discourseHookAhead(): boolean {
    const at = laAfterW(this);
    return this.LA(at).tokenType === Hook && !tokenIs(this.LA(at + 1), B, JoinB) && !isFrameHookAhead(this, at);
  }

  /** Two act words in a row: the first leads the second (speech-moves.md § Emphatic prohibition, questions.md § rhetorical). */
  private leadForceAhead(): boolean {
    return this.LA(1).tokenType === Force && this.LA(2).tokenType === Force;
  }

  /** Only polars remain before the period (the asking tag has no body). */
  private tagPolarsAhead(): boolean {
    let i = 1;
    while (tokenIs(this.LA(i), Polar)) i++;
    return tokenIs(this.LA(i), Period, EOF);
  }

  public bodyClause = this.RULE("bodyClause", () => {
    this.OR({
      IGNORE_AMBIGUITIES: true,
      DEF: [
        // A topic word may be the whole sentence (`xazawan.`, pronouns.md#topic).
        { GATE: () => this.loneTopicWordAhead(), ALT: () => this.CONSUME2(Linker) },
        {
          // A marked topic span may be the whole sentence too (`glelel x<odoga>.`).
          GATE: () => this.markedLoneTopicAhead(),
          ALT: () => {
            this.CONSUME2(G, { LABEL: "topicMarker" });
            this.CONSUME3(Linker);
          },
        },
        {
          ALT: () => {
            // A mention marker before a topic span (`glelel x<odoga> …`, spans.md#mention).
            this.OPTION4({
              GATE: () => this.markedTopicAhead(),
              DEF: () => this.CONSUME(G, { LABEL: "topicMarker" }),
            });
            this.OPTION(() => {
              this.CONSUME(Linker);
            });
            // Sentence-initial clause join before a clause: joins the prior sentence to this whole one (joins.md § clause joins).
            this.OPTION2({
              GATE: () => this.crossPeriodJoinAhead(),
              DEF: () => this.CONSUME(JoinX, { LABEL: "crossJoin" }),
            });
            this.SUBRULE(this.clause);
          },
        },
      ],
    });
  });

  /** The mention marker right before a topic span (the marker is a `gl-` word, so it would otherwise read as an adjective). */
  private markedTopicAhead(): boolean {
    return (this.LA(1).payload as LexWord | undefined)?.reading === "mention" && this.LA(2).tokenType === Linker;
  }

  private markedLoneTopicAhead(): boolean {
    const word = this.LA(2).payload as LexWord | undefined;
    return this.markedTopicAhead() && !!word && topicEffect(word) !== "none" && tokenIs(this.LA(3), Period, EOF);
  }

  /** A topic word and then the end of the sentence. */
  private loneTopicWordAhead(): boolean {
    const word = this.LA(1).payload as LexWord | undefined;
    return this.LA(1).tokenType === Linker && !!word && topicEffect(word) !== "none" && tokenIs(this.LA(2), Period, EOF);
  }

  /** `/x/` at sentence start followed by a clause (not `.`, a hook, or another `/x/`). */
  private crossPeriodJoinAhead(): boolean {
    if (this.LA(1).tokenType !== JoinX) return false;
    if (this.LA(laAfterW(this, 2)).tokenType === Hook) return false;
    return !tokenIs(this.LA(2), JoinX, Period, EOF, QMark, Bang, Force, Polar, Linker);
  }

  /** `/x/` joins go between clauses: item, join, item, … (joins.md § clause joins). */
  public clause = this.RULE("clause", () => {
    this.SUBRULE(this.clauseItem);
    this.MANY(() => {
      this.CONSUME(JoinX, { LABEL: "midJoin" });
      this.OPTION({
        GATE: () => !this.clauseEndAhead(),
        DEF: () => this.SUBRULE2(this.clauseItem),
      });
    });
  });

  private clauseEndAhead(): boolean {
    return tokenIs(this.LA(1), Period, EOF, QMark, Bang, Force, Polar, Linker);
  }

  /** A clause, or a standalone `/x/` word as a stand-in clause (optionally `xual ul …` with a hook). */
  public clauseItem = this.RULE("clauseItem", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinX,
        ALT: () => {
          this.CONSUME(JoinX, { LABEL: "standIn" });
          this.OPTION({
            GATE: () => this.LA(laAfterW(this)).tokenType === Hook,
            DEF: () => {
              this.AT_LEAST_ONE(() => {
                this.SUBRULE(this.unit);
              });
            },
          });
        },
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE2(() => {
            this.SUBRULE2(this.unit);
          });
        },
      },
    ]);
  });

  public unit = this.RULE("unit", () => {
    this.OR([
      { GATE: () => this.LA(1).tokenType === IslandOpen, ALT: () => this.SUBRULE(this.islandUnit) },
      { GATE: () => isNpSlotLookahead(this, "z"), ALT: () => this.SUBRULE(this.zCoord) },
      { GATE: () => isNpSlotLookahead(this, "d"), ALT: () => this.SUBRULE(this.dCoord) },
      { GATE: () => isNpSlotLookahead(this, "b"), ALT: () => this.SUBRULE(this.bCoord) },
      {
        GATE: () => tokenIs(this.LA(1), V, JoinV),
        ALT: () => this.SUBRULE(this.vpCoord),
      },
      {
        GATE: () => tokenIs(this.LA(laAfterW(this)), G, JoinG),
        ALT: () => this.SUBRULE(this.gCoord),
      },
      {
        GATE: () => this.LA(laAfterW(this)).tokenType === H || isStanceJoin(this.LA(1)),
        ALT: () => this.SUBRULE(this.hCoord),
      },
      {
        GATE: () => this.LA(laAfterW(this)).tokenType === Hook,
        ALT: () => this.SUBRULE(this.hookUnit),
      },
    ]);
  });

  public islandUnit = this.RULE("islandUnit", () => {
    this.CONSUME(IslandOpen);
    this.MANY({
      GATE: () => this.LA(1).tokenType !== IslandClose,
      DEF: () => {
        this.SUBRULE(this.unit);
      },
    });
    this.CONSUME(IslandClose);
  });

  /**
   * Noun-phrase lists, one set of rules per slot (`/z/`, `/d/`, `/b/`). The shape is the same at each slot; only the
   * head and join tokens differ, so a phrase can only be read at the slot its words carry.
   */
  public zCoord = this.npCoordRule("z");
  public dCoord = this.npCoordRule("d");
  public bCoord = this.npCoordRule("b");
  public zCoordPart = this.npCoordPartRule("z");
  public dCoordPart = this.npCoordPartRule("d");
  public bCoordPart = this.npCoordPartRule("b");
  public zPackage = this.npPackageRule("z");
  public dPackage = this.npPackageRule("d");
  public bPackage = this.npPackageRule("b");
  public zJoinClose = this.npJoinCloseRule("z");
  public dJoinClose = this.npJoinCloseRule("d");
  public bJoinClose = this.npJoinCloseRule("b");

  private np(level: NpSlot) {
    return {
      z: { part: this.zCoordPart, pkg: this.zPackage, close: this.zJoinClose },
      d: { part: this.dCoordPart, pkg: this.dPackage, close: this.dJoinClose },
      b: { part: this.bCoordPart, pkg: this.bPackage, close: this.bJoinClose },
    }[level];
  }

  /** The last join word this list closed, so a bar can rank a closed universal fence as its item. */
  private lastNpJoin: IToken | undefined;

  private npCoordRule(level: NpSlot) {
    return this.RULE(`${level}Coord`, () => {
      this.ACTION(() => {
        this.lastNpJoin = undefined;
      });
      this.AT_LEAST_ONE({
        GATE: () => isNpSlotLookahead(this, level) || this.universalFenceBarAhead(level),
        DEF: () => {
          this.SUBRULE(this.np(level).part);
        },
      });
    });
  }

  /**
   * A bar right after a closed `ua` fence (`zuam gagadul thobam zel …`): the whole fence is the one ranked item,
   * nested by right-close (comparatives.md § every bar, joins.md § fence nesting).
   */
  private universalFenceBarAhead(level: NpSlot): boolean {
    return this.lastNpJoin !== undefined && joinSeries(this.lastNpJoin) === "ua" && rankBarAhead(this, level);
  }

  private npCoordPartRule(level: NpSlot) {
    return this.RULE(`${level}CoordPart`, () => {
      const { pkg, close } = this.np(level);
      this.OR([
        {
          GATE: () => this.LA(1).tokenType === NP_JOIN[level],
          ALT: () => {
            this.SUBRULE(close, { LABEL: "standaloneJoin" });
          },
        },
        {
          GATE: () => !isNpSlotLookahead(this, level) && this.universalFenceBarAhead(level),
          ALT: () => {
            this.AT_LEAST_ONE2(() => {
              this.SUBRULE2(this.hUnitRule, { LABEL: "bar", ARGS: [true] });
            });
            this.SUBRULE3(close, { LABEL: "npJoinClose" });
          },
        },
        {
          ALT: () => {
            this.AT_LEAST_ONE({
              GATE: () => isNpSlotLookahead(this, level) && this.LA(laAfterW(this)).tokenType !== NP_JOIN[level],
              DEF: () => {
                this.SUBRULE(pkg, { LABEL: "npConjunct" });
              },
            });
            // A stance word before a rank join is the comparee: the bar (comparatives.md § bars).
            this.MANY({
              GATE: () => rankBarAhead(this, level),
              DEF: () => {
                this.SUBRULE(this.hUnitRule, { LABEL: "bar", ARGS: [true] });
              },
            });
            this.OPTION({
              GATE: () => this.LA(laAfterW(this)).tokenType === NP_JOIN[level],
              DEF: () => {
                this.SUBRULE2(close, { LABEL: "npJoinClose" });
              },
            });
          },
        },
      ]);
    });
  }

  private npJoinCloseRule(level: NpSlot) {
    return this.RULE(`${level}JoinClose`, () => {
      // A `/w/` right before the join word details the list (respectively `wazem`, joins.md § Respectively).
      this.MANY(() => {
        this.CONSUME(W);
      });
      const join = this.CONSUME(NP_JOIN[level]);
      this.ACTION(() => {
        this.lastNpJoin = join;
      });
      // SHARED /ɡ/ describes every noun; SHARED /h/ or digitless `bral` is only a scale, after a rank / equative / sequence join.
      this.OPTION({
        GATE: () =>
          (this.LA(laAfterW(this)).tokenType === G && !respectivelyAdjListAhead(this)) ||
          ((tokenIs(this.LA(laAfterW(this)), H) || scaleNumberAhead(this.LA(1))) && RANK_SERIES.has(joinSeries(this.LA(0)))),
        DEF: () => {
          const series = joinSeries(this.LA(0));
          this.SUBRULE(this.sharedAfterJoin);
          // Factor right after an equative's shared scale: `oe` + `h+2` = *twice as … as* (comparatives.md § factor).
          this.OPTION2({
            GATE: () => series === "oe" && factorAhead(this.LA(1)),
            DEF: () => this.CONSUME(H, { LABEL: "factor" }),
          });
        },
      });
    });
  }

  public vpCoord = this.RULE("vpCoord", () => {
    // A `/w/` starts a part only before its join word (respectively `wazem`); any other `/w/` is not a verb part.
    this.AT_LEAST_ONE({
      GATE: () => this.LA(laAfterW(this)).tokenType === JoinV || this.LA(1).tokenType === V,
      DEF: () => {
        this.SUBRULE(this.vpCoordPart);
      },
    });
  });

  public vpCoordPart = this.RULE("vpCoordPart", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinV,
        ALT: () => this.SUBRULE(this.vJoinClose, { LABEL: "standaloneJoin" }),
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => this.LA(1).tokenType === V || vpItemMaterialAhead(this),
            DEF: () => {
            // An `/h/` or `/d/` `/b/` between verbs of a joined list starts the next verb's item.
            this.MANY({
              GATE: () => vpItemMaterialAhead(this),
              DEF: () => {
                this.SUBRULE(this.vpItemUnit);
              },
            });
            const verb = this.CONSUME(V);
            this.OPTION3({
              GATE: () => isScopeThoVerb(verb) && this.LA(1).tokenType === B,
              DEF: () => {
                this.CONSUME(B);
              },
            });
            },
          });
          this.OPTION({
            GATE: () => this.LA(laAfterW(this)).tokenType === JoinV,
            DEF: () => {
              this.SUBRULE2(this.vJoinClose);
            },
          });
        },
      },
    ]);
  });

  public vpItemUnit = this.RULE("vpItemUnit", () => {
    this.OR([
      { GATE: () => npSlot(this.LA(1)) === "d", ALT: () => this.SUBRULE(this.dCoord) },
      { GATE: () => npSlot(this.LA(1)) === "b", ALT: () => this.SUBRULE(this.bCoord) },
      { ALT: () => this.SUBRULE(this.hCoord) },
    ]);
  });

  public vJoinClose = this.RULE("vJoinClose", () => {
    // A `/w/` right before the join word is respectively `wazem` (joins.md § Respectively).
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.CONSUME(JoinV);
    // Only a shared /h/ follows a verb join (it covers every verb); a /ɡ/ there is not shared.
    this.OPTION({
      GATE: () => tokenIs(this.LA(laAfterW(this)), H),
      DEF: () => {
        this.SUBRULE(this.sharedAfterJoin);
      },
    });
  });

  public gCoord = this.RULE("gCoord", () => {
    this.AT_LEAST_ONE({
      GATE: () => this.LA(laAfterW(this)).tokenType === JoinG || this.LA(laAfterW(this)).tokenType === G,
      DEF: () => {
        this.SUBRULE(this.gCoordPart);
      },
    });
  });

  public gCoordPart = this.RULE("gCoordPart", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinG,
        ALT: () => this.SUBRULE(this.gJoinClose, { LABEL: "standaloneJoin" }),
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => this.LA(laAfterW(this)).tokenType === G,
            DEF: () => {
              this.SUBRULE(this.gPackage, { ARGS: [false] });
            },
          });
          this.OPTION({
            GATE: () => this.LA(laAfterW(this)).tokenType === JoinG,
            DEF: () => {
              this.SUBRULE2(this.gJoinClose);
            },
          });
        },
      },
    ]);
  });

  public gJoinClose = this.RULE("gJoinClose", () => {
    // Nothing modifies a list of adjectives (a following /ɡ/ is its own unit); only respectively `wazem` sits before the join.
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.CONSUME(JoinG);
  });

  public hCoord = this.RULE("hCoord", () => {
    // A `/w/` after a `/th/` or `/h/` word grades whatever it sits before; it opens another part only before `/h/`.
    this.AT_LEAST_ONE({
      GATE: () => isStanceJoin(this.LA(1)) || this.LA(laAfterW(this)).tokenType === H,
      DEF: () => {
        this.SUBRULE(this.hCoordPart);
      },
    });
  });

  // Standalone stance `/th/` join (`thul` *no judgment*, fill-ask `thar` *why?*). No standalone `/h/` join:
  // plain `/h/` forms are restrictors.
  public hCoordPart = this.RULE("hCoordPart", () => {
    this.OR([
      {
        GATE: () => isStanceJoin(this.LA(1)),
        ALT: () => this.SUBRULE(this.hJoinClose, { LABEL: "standaloneJoin" }),
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => this.LA(laAfterW(this)).tokenType === H,
            DEF: () => {
              this.SUBRULE(this.hUnitRule);
            },
          });
          this.OPTION(() => {
            this.SUBRULE2(this.hJoinClose);
          });
          // `thugum thoyem thul barl …`: a stance join may sit between the last open host and its `barl`,
          // so it closes the stance words while the next sentence still fills the host (join-across-roles.md#stance-join-before-barl).
          this.OPTION2({
            GATE: () => isStanceJoin(this.LA(0)) && this.lastHostOpen && tokenIs(this.LA(1), OdoB),
            DEF: () => this.CONSUME(OdoB, { LABEL: "lateBound" }),
          });
        },
      },
    ]);
  });

  /** Whether the last `/h/` or `/th/` host parsed took no `/b/`, so a `barl` after its stance join is its own. */
  private lastHostOpen = false;

  // Nothing is SHARED after a /h/ or /th/ join; `/w/` before the join word grades the list.
  public hJoinClose = this.RULE("hJoinClose", () => {
    this.CONSUME(JoinH);
  });

  public hUnitRule = this.RULE("hUnitRule", (bar = false) => {
    this.MANY(() => {
      this.CONSUME(W);
    });
    const host = this.CONSUME(H);
    this.ACTION(() => {
      this.lastHostOpen = true;
    });
    this.OPTION(() => {
      this.ACTION(() => {
        this.lastHostOpen = false;
      });
      this.OR([
        {
          ALT: () => {
            const bound = this.CONSUME(B);
            // A `/th/` host's `/b/` is an offset or source, so a later `/ɡ/` stays the predicate.
            // Inside a bar fence no predicate can come before the join, so it describes the `/b/` noun.
            this.hostedTail(bound, () => bar || (host.payload as LexWord | undefined)?.pos === "h");
            // A `/th/` channel's offset, then `barl`: the next sentence is the grounds (knowing.md#evidence-clause).
            this.OPTION7({
              GATE: () =>
                (host.payload as LexWord | undefined)?.pos === "th" &&
                (bound.payload as LexWord | undefined)?.family.kind === "number" &&
                tokenIs(this.LA(1), Odo),
              DEF: () => this.CONSUME1(Odo),
            });
          },
        },
        { ALT: () => this.CONSUME(Odo) },
      ]);
    });
  });

  /**
   * What follows a host's hosted `/b/`, one rule for every host (clause.md § Complex chaining):
   * a join filling the slot, a measure amount, then plain adjectives that describe the landmark.
   * The adjectives are consumed here, so nothing has to look back to find the host.
   */
  private hostedTail(bound: IToken, landmarkHost: () => boolean): void {
    let joined = false;
    this.OPTION5({
      GATE: () => boundJoinAhead(this),
      DEF: () => {
        this.SUBRULE5(this.boundJoinTail);
        joined = true;
      },
    });
    // A number word right after the hosted /b/ is its amount (measure phrase, e.g. a signed offset).
    // An ordinal (a place, or a kin generation) or a label (a year, `bavawem g_1962`) is an adjective on
    // the landmark instead, free to host its own /b/.
    this.OPTION6({
      GATE: () => {
        const la = this.LA(1);
        const family = (la.payload as LexWord | undefined)?.family;
        return (
          la.tokenType === G &&
          family?.kind === "number" &&
          !isOrdinalMarker(family.stem.marker) &&
          !isLabelMarker(family.stem.marker)
        );
      },
      DEF: () => this.CONSUME5(G),
    });
    this.MANY5({
      GATE: () => {
        const family = (bound.payload as LexWord | undefined)?.family;
        return !joined && landmarkHost() && family?.kind !== "number" && family?.kind !== "joinMarker" && this.plainAdjAhead();
      },
      DEF: () => this.SUBRULE5(this.gPackage),
    });
  }

  private plainAdjAhead(): boolean {
    const next = this.LA(laAfterW(this));
    return next.tokenType === G && !(next.payload as LexWord).gl;
  }

  public hookUnit = this.RULE("hookUnit", () => {
    this.MANY(() => {
      this.CONSUME(W);
    });
    // `uem` + a `/th/` stance holds the stance as its frame; it does not read on the claim (sakes.md#contrary-to-stance).
    const hook = this.CONSUME(Hook);
    this.OPTION({
      GATE: () => isFrameHook(hook) && isStanceWord(this.LA(1)),
      DEF: () => this.SUBRULE(this.hUnitRule, { LABEL: "frame" }),
    });
  });

  private npPackageRule(level: NpSlot) {
    return this.RULE(`${level}Package`, () => {
      this.OPTION({
        GATE: () => {
          const i = laAfterW(this);
          const la = this.LA(i);
          return la.tokenType === G && (la.payload as LexWord).gl === true;
        },
        DEF: () => {
          this.SUBRULE(this.gPackage);
        },
      });
      const head = NP_HEAD[level];
      this.OR([
        { ALT: () => this.CONSUME(head.noun) },
        { ALT: () => this.CONSUME(head.standIn, { LABEL: "Odo" }) },
        { ALT: () => this.CONSUME(head.span, { LABEL: "WritingSpan" }) },
      ]);
      // A `gl-` adjective leans on the next noun, so it ends this package (clause.md#left-bound-adjectives).
      this.MANY({
        GATE: () => this.plainAdjAhead(),
        DEF: () => {
          this.SUBRULE2(this.gPackage);
        },
      });
      // A hook + `/b/` right before a noun join word, or before a rank fence's bar, belongs to the item before it (joins.md § SHARED after the join).
      this.OPTION2({
        GATE: () => this.itemHookAhead(),
        DEF: () => {
          this.CONSUME(Hook, { LABEL: "itemHook" });
          this.CONSUME2(B, { LABEL: "itemHookBound" });
        },
      });
    });
  }

  private itemHookAhead(): boolean {
    if (this.LA(1).tokenType !== Hook || this.LA(2).tokenType !== B) return false;
    const next = this.LA(laAfterW(this, 3));
    if (next.tokenType === JoinZ || next.tokenType === JoinD || next.tokenType === JoinB) return true;
    // …or right before the fence's bar (comparatives.md § bars).
    return (["z", "d", "b"] as const).some((level) => rankBarAhead(this, level, 3));
  }

  public asOfWPair = this.RULE("asOfWPair", () => {
    this.CONSUME(WAsOf, { LABEL: "W" });
    // The as-of bound is a /b/ noun, never a stand-in (relations.md § as-of).
    this.OPTION({
      GATE: () => this.LA(1).tokenType === B,
      DEF: () => {
        this.CONSUME(B);
      },
    });
  });

  /** `landmark`: plain adjectives after the hosted pair describe the landmark (a joined `/ɡ/` list keeps them as list items). */
  public gPackage = this.RULE("gPackage", (landmark = true) => {
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
    this.CONSUME(G);
    this.OPTION2(() => {
      const bound = this.CONSUME2(B);
      this.hostedTail(bound, () => landmark);
    });
  });

  // The one hosted /b/ slot may hold a join: more /b/ members closed by a /b/ join word.
  public boundJoinTail = this.RULE("boundJoinTail", () => {
    this.MANY({ GATE: () => this.LA(1).tokenType === B, DEF: () => this.CONSUME(B) });
    this.CONSUME(JoinB);
  });

  public sharedAfterJoin = this.RULE("sharedAfterJoin", () => {
    this.OR([
      {
        GATE: () => this.LA(laAfterW(this)).tokenType === G && !respectivelyAdjListAhead(this),
        ALT: () => {
          this.SUBRULE(this.gPackage);
        },
      },
      { GATE: () => tokenIs(this.LA(laAfterW(this)), H), ALT: () => this.SUBRULE(this.hUnitRule) },
      // A `/b/` number is shared only as the time scale after a rank join (how late).
      { GATE: () => scaleNumberAhead(this.LA(1)) && this.LA(1).tokenType === B, ALT: () => this.CONSUME(B, { LABEL: "scale" }) },
    ]);
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

/**
 * A bar's `barl` ends its sentence at the fence (comparatives.md#bars): noun parts the grammar ran on
 * past the fence's scale start the next sentence, so they move to a unit of their own.
 */
function splitAfterBarStandIn(units: Unit[], index: number): void {
  const unit = units[index];
  if (unit?.kind !== "np") return;
  const at = unit.coord.parts.findIndex((part) => part.items.some((item) => item.kind === "bar" && item.bar.hosted && hostedStandIn(item.bar.hosted)));
  if (at < 0 || at === unit.coord.parts.length - 1) return;
  const rest = unit.coord.parts.slice(at + 1);
  units.splice(index, 1, { kind: "np", coord: { ...unit.coord, parts: unit.coord.parts.slice(0, at + 1) } }, { kind: "np", coord: { ...unit.coord, parts: rest } });
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
  splitAfterBarStandIn(resolved, orodoIdx);
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
  if (tok.tokenType !== G && tok.tokenType !== H && tok.tokenType !== B) return false;
  const word = tok.payload as LexWord;
  if (word.family.kind !== "number") return false;
  return isScaleStem(word.family.stem);
}

function factorAhead(tok: IToken): boolean {
  if (tok.tokenType !== H) return false;
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

function boundJoinAhead(parser: AgazanSentenceParser): boolean {
  let i = 1;
  while (parser.lookahead(i).tokenType === B) i++;
  return parser.lookahead(i).tokenType === JoinB;
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
    childToken(cst, "WritingSpan")!;
  // A hook + `/b/` before the join word rides on the item as a hosted pair, like a `/ɡ/` with its own `/b/`.
  const itemHook = childToken(cst, "itemHook");
  const itemHookBound = childToken(cst, "itemHookBound");
  const hookPair: GPackage[] =
    itemHook && itemHookBound
      ? [{ word: lexWordFromToken(itemHook), modifiers: [], hosted: { bound: lexWordFromToken(itemHookBound) } }]
      : [];
  return {
    glAdj,
    head: lexWordFromToken(headTok),
    adjs: [...trailingAdjs, ...hookPair],
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
  return { units: childNodes(cst, "unit").flatMap(expandUnits) };
}

function npCoordCst(parent: CstNode): CstNode | undefined {
  return childNodes(parent, "zCoord")[0] ?? childNodes(parent, "dCoord")[0] ?? childNodes(parent, "bCoord")[0];
}

function npCoordParts(cst: CstNode): CstNode[] {
  return childNodes(cst, `${cst.name[0]}CoordPart`);
}

/** A bare single tag **-l** (`zwal`): assigns a tag, never a describer stack of its own. */
function isTagAssign(item: NpItem | undefined): boolean {
  if (item?.kind !== "package") return false;
  const { head, adjs, glAdj } = item.package;
  return head.family.kind === "tag" && head.ending === "l" && !head.plural && adjs.length === 0 && !glAdj;
}

/**
 * A tag **-l** right after a phrase in the same role names that phrase, so it rides on the phrase's package and is not
 * an item of its own (`zodogal zwal zagadul zwel zam`: two items). A tag with no phrase before it is a new referent.
 */
function foldTags(items: NpItem[]): NpItem[] {
  const out: NpItem[] = [];
  for (const item of items) {
    const prev = out.at(-1);
    if (isTagAssign(item) && item.kind === "package" && prev?.kind === "package" && !prev.package.tag && !isTagAssign(prev)) {
      out[out.length - 1] = { kind: "package", package: { ...prev.package, tag: item.package.head } };
    } else out.push(item);
  }
  return out;
}

function buildNpCoord(cst: CstNode): NpCoord {
  const parts = npCoordParts(cst);
  const built: NpCoord["parts"] = parts.map((part) => {
    const close = partJoinClose(part, "npJoinClose");
    const { join, shared, joinModifiers, factor } = joinFromClose(close);
    const items: NpItem[] = foldTags([
      ...childNodes(part, "npConjunct").map((pkg): NpItem => ({ kind: "package", package: buildNpPackage(pkg) })),
      ...childNodes(part, "bar").map((bar): NpItem => ({ kind: "bar", bar: buildHUnit(bar) })),
    ]);
    return { items, join, shared, ...(joinModifiers ? { joinModifiers } : {}), ...(factor ? { factor } : {}) };
  });
  // A lone tag **-l** after a closed fence names the whole group (`zodogal zagadul zam zwal`).
  const last = built.at(-1);
  const closed = built.at(-2);
  if (last && closed?.join && !last.join && last.items.length === 1 && isTagAssign(last.items[0])) {
    const item = last.items[0]!;
    if (item.kind === "package") {
      built.pop();
      built[built.length - 1] = { ...closed, tag: item.package.head };
    }
  }
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
  const parts = childNodes(cst, "vpCoordPart");
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
  const parts = childNodes(cst, "hCoordPart");
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
    parts: childNodes(cst, "gCoordPart").map((part) => {
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
  const parts = childNodes(cst, "gCoordPart");
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
  const units = childNodes(cst, "unit").flatMap(expandUnits);
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
    if (utterances.length === 0 || edge || tokens[sentence.start]!.tokenType === Hook) {
      utterances.push({ left: buildLeftEdge(edge), bodies: [] });
    }
    const body = childNodes(sentence.cst, "edgeBody")[0] ?? childNodes(sentence.cst, "bodyClause")[0];
    const next = tokens[sentence.end + 1];
    if (body) utterances.at(-1)!.bodies.push(buildBodyClause(body, next && tokenIs(next, Period) ? next : undefined));
  }
  return utterances;
}

export function parseSentenceTokens(tokens: IToken[]): ParseResult {
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
