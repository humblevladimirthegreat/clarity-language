import { CstParser, EOF, type CstNode, type IToken } from "chevrotain";

import {
  allTokens,
  Bang,
  B,
  D,
  Force,
  G,
  H,
  IslandEdge,
  JoinB,
  JoinD,
  JoinG,
  JoinH,
  JoinV,
  JoinX,
  JoinZ,
  lexWordFromToken,
  Linker,
  SpanAtom,
  Odo,
  Period,
  Polar,
  QMark,
  Hook,
  SpanClose,
  SpanOpen,
  V,
  Vocative,
  W,
  WritingSpan,
  Z,
} from "./tokens.js";
import { isAsOfOverlay, isNamedStandIn, isStandIn } from "./classify.js";
import { assignHookJobs } from "./hook-jobs.js";
import { isScaleStem, RANK_SERIES } from "./series.js";
import type {
  BodyClause,
  Clause,
  CoordShared,
  GCoord,
  GItem,
  GPackage,
  Hosted,
  HUnit,
  ImpliedForce,
  IslandUnit,
  LeftEdge,
  NpCoord,
  NpItem,
  NpPackage,
  ParseResult,
  PunctKind,
  SpanUnit,
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

function spanCloseFlavor(token: IToken): string | undefined {
  if (token.tokenType !== SpanClose) return undefined;
  const family = (token.payload as LexWord | undefined)?.family;
  return family?.kind === "spanClose" ? family.flavor : undefined;
}

/** Stance `/th/` join word (`thul`, `thar`, …); bare `/h/` joins are not standalone. */
function isStanceJoin(token: IToken): boolean {
  return token.tokenType === JoinH && (token.payload as LexWord | undefined)?.pos === "th";
}

function tokenIs(token: IToken, ...types: { tokenTypeIdx?: number }[]): boolean {
  return types.some((type) => token.tokenType === type);
}

type NpSlot = "z" | "d" | "b";

function npSlot(token: IToken): NpSlot | undefined {
  if (token.tokenType === JoinZ || token.tokenType === Z) return "z";
  if (token.tokenType === JoinD || token.tokenType === D) return "d";
  if (token.tokenType === JoinB || token.tokenType === B) return "b";
  if (token.tokenType === Odo || token.tokenType === WritingSpan) {
    const pos = (token.payload as LexWord | undefined)?.pos;
    if (pos === "z" || pos === "d" || pos === "b") return pos;
  }
  return undefined;
}

function isGlHead(token: IToken): boolean {
  return token.tokenType === G && (token.payload as LexWord).gl === true;
}

/** A label-scope `tho` verb hosts the `/b/` right after it (predication.md#scope-relative). */
function isScopeThoVerb(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  return token.tokenType === V && family?.kind === "x" && family.xFamily === "scope" && family.stanceVowel === "o";
}

function isAsOfWToken(token: IToken): boolean {
  return token.tokenType === W && isAsOfOverlay((token.payload as LexWord) ?? {});
}


function joinSeries(token: IToken): string {
  const family = (token.payload as LexWord | undefined)?.family;
  return family?.kind === "joinMarker" ? family.series : "";
}

function laAfterW(parser: AgazanSentenceParser, from = 1): number {
  let i = from;
  while (true) {
    const tok = parser.lookahead(i);
    if (tok.tokenType !== W) return i;
    const ending = (tok.payload as LexWord | undefined)?.ending;
    i += 1;
    if (isAsOfWToken(tok) && ending !== "r") {
      const next = parser.lookahead(i);
      if (next.tokenType === B || next.tokenType === Odo) i += 1;
    }
  }
}

/** The join token that closes a list at each noun-phrase level. */
const NP_JOIN = { z: JoinZ, d: JoinD, b: JoinB } as const;

function isNpSlotLookahead(parser: AgazanSentenceParser, slot: NpSlot): boolean {
  if (npSlot(parser.lookahead(1)) === slot) return true;
  if (isGlHead(parser.lookahead(1)) && npSlot(parser.lookahead(2)) === slot) return true;
  const i = laAfterW(parser);
  return isGlHead(parser.lookahead(i)) && npSlot(parser.lookahead(i + 1)) === slot;
}

class AgazanSentenceParser extends CstParser {
  public lookahead(index: number): IToken {
    return this.LA(index);
  }

  constructor() {
    super(allTokens, { recoveryEnabled: false, maxLookahead: 2 });
    this.performSelfAnalysis();
  }

  public document = this.RULE("document", () => {
    // A new utterance starts only after a sentence end (dependents.md § periods).
    this.AT_LEAST_ONE({
      GATE: () => tokenIs(this.LA(0), Period, EOF),
      DEF: () => {
        this.SUBRULE(this.utterance);
      },
    });
    this.CONSUME(EOF);
  });

  public utterance = this.RULE("utterance", () => {
    this.OR([
      {
        GATE: () => tokenIs(this.LA(1), Polar, Vocative, Force) || this.discourseHookAhead(),
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
    this.MANY(() => {
      this.CONSUME(Period);
      // After a sentence end, a turn word or hook opens a new utterance instead (the document loop takes it).
      this.OPTION2({
        GATE: () => !tokenIs(this.LA(1), Polar, Force, Vocative, Hook),
        DEF: () => this.SUBRULE3(this.bodyClause, { LABEL: "nextBody" }),
      });
    });
  });

  public leftEdge = this.RULE("leftEdge", () => {
    this.OR([
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => tokenIs(this.LA(1), Vocative, Polar) || this.discourseHookAhead(),
            DEF: () => this.OR2([
              { ALT: () => this.CONSUME(Vocative) },
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
          // Asking tag `yol yael.` (questions.md § polar stance): force + polars with no body.
          this.MANY2({
            GATE: () => tokenIs(this.LA(1), Polar) && this.tagPolarsAhead(),
            DEF: () => this.CONSUME2(Polar),
          });
        },
      },
    ]);
  });

  /** A hook (after any `/w/`) that glues the sentence to prior talk: `/b/` right after it makes it an extra-noun hook instead (hooks.md § Extra noun). */
  private discourseHookAhead(): boolean {
    const at = laAfterW(this);
    return this.LA(at).tokenType === Hook && !tokenIs(this.LA(at + 1), B, JoinB);
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
    this.OPTION(() => {
      this.CONSUME(Linker);
    });
    // Sentence-initial clause join before a clause: joins the prior sentence to this whole one (joins.md § clause joins).
    this.OPTION2({
      GATE: () => this.crossPeriodJoinAhead(),
      DEF: () => this.CONSUME(JoinX, { LABEL: "crossJoin" }),
    });
    this.SUBRULE(this.clause);
  });

  /** `/x/` at sentence start followed by a clause (not `.`, a hook, or another `/x/`). */
  private crossPeriodJoinAhead(): boolean {
    if (this.LA(1).tokenType !== JoinX) return false;
    if (this.LA(laAfterW(this, 2)).tokenType === Hook) return false;
    return !tokenIs(this.LA(2), JoinX, Period, EOF, QMark, Bang, SpanClose, Force, Polar, Linker);
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
    return tokenIs(this.LA(1), Period, EOF, QMark, Bang, SpanClose, Force, Polar, Linker);
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
      { GATE: () => this.LA(1).tokenType === IslandEdge, ALT: () => this.SUBRULE(this.islandUnit) },
      { GATE: () => this.LA(1).tokenType === SpanOpen, ALT: () => this.SUBRULE(this.spanUnit) },
      {
        GATE: () => isNpSlotLookahead(this, "z"),
        ALT: () => this.SUBRULE(this.npCoord, { ARGS: ["z"], LABEL: "zCoord" }),
      },
      {
        GATE: () => isNpSlotLookahead(this, "d"),
        ALT: () => this.SUBRULE2(this.npCoord, { ARGS: ["d"], LABEL: "dCoord" }),
      },
      {
        GATE: () => isNpSlotLookahead(this, "b"),
        ALT: () => this.SUBRULE3(this.npCoord, { ARGS: ["b"], LABEL: "bCoord" }),
      },
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
    this.CONSUME(IslandEdge);
    this.MANY({
      GATE: () => this.LA(1).tokenType !== IslandEdge,
      DEF: () => {
        this.SUBRULE(this.unit);
      },
    });
    this.CONSUME2(IslandEdge);
  });

  public spanUnit = this.RULE("spanUnit", () => {
    this.CONSUME(SpanOpen);
    // EDGE decides the extent; gates read the open just consumed (LA(0)).
    this.OR({
      IGNORE_AMBIGUITIES: true,
      DEF: [
        {
          // Atomic: exactly one following token, whatever its class.
          GATE: () => spanEdgeOf(this.LA(0)) === "o",
          ALT: () => {
            this.CONSUME5(SpanAtom, { LABEL: "atom" });
          },
        },
        {
          // Clause-scoped: runs until the next turn, clause-level `/x/` join, linker, or sentence end.
          GATE: () => spanEdgeOf(this.LA(0)) === "e",
          ALT: () => {
            this.MANY2({
              GATE: () => !tokenIs(this.LA(1), JoinX, Force, Polar, Linker, Period, QMark, Bang),
              DEF: () => {
                this.SUBRULE(this.unit, { LABEL: "scopedUnit" });
              },
            });
          },
        },
        {
          GATE: () => spanEdgeOf(this.LA(0)) === "a",
          ALT: () => {
            this.MANY(() => {
              this.SUBRULE(this.clause);
            });
            this.CONSUME(SpanClose);
            // Written `#|`: editorial close `xuxur`, then close-all `xuxum` (spans.md § Editorial close).
            this.OPTION3({
              GATE: () =>
                spanCloseFlavor(this.LA(0)) === "editorial" && spanCloseFlavor(this.LA(1)) === "closeAll",
              DEF: () => {
                this.CONSUME2(SpanClose, { LABEL: "closeAll" });
              },
            });
          },
        },
        // Empty / resume (EDGE **u**): no interior, no close.
        { ALT: () => {} },
      ],
    });
  });

  /** A noun-phrase list at level `/z/` `/d/` or `/b/` (the same shape at each level; only the slot letter differs). */
  public npCoord = this.RULE("npCoord", (level: NpSlot = "z") => {
    this.AT_LEAST_ONE({
      GATE: () => isNpSlotLookahead(this, level),
      DEF: () => {
        this.SUBRULE(this.npCoordPart, { ARGS: [level] });
      },
    });
  });

  public npCoordPart = this.RULE("npCoordPart", (level: NpSlot = "z") => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === NP_JOIN[level],
        ALT: () => {
          this.SUBRULE(this.npJoinClose, { LABEL: "standaloneJoin" });
        },
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => isNpSlotLookahead(this, level) && this.LA(laAfterW(this)).tokenType !== NP_JOIN[level],
            DEF: () => {
              this.SUBRULE(this.npConjunct);
            },
          });
          this.OPTION({
            GATE: () => this.LA(laAfterW(this)).tokenType === NP_JOIN[level],
            DEF: () => {
              this.SUBRULE2(this.npJoinClose);
            },
          });
        },
      },
    ]);
  });

  public npConjunct = this.RULE("npConjunct", () => {
    this.SUBRULE(this.npPackage);
  });

  public npJoinClose = this.RULE("npJoinClose", () => {
    // A `/w/` right before the join word details the list (respectively `wazagum`, joins.md § Respectively).
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.OR([
      { ALT: () => this.CONSUME(JoinZ) },
      { ALT: () => this.CONSUME(JoinD) },
      { ALT: () => this.CONSUME(JoinB) },
    ]);
    // SHARED /ɡ/ describes every noun; SHARED /h/ or digitless `bral` is only a scale, after a rank / equative / sequence join.
    this.OPTION({
      GATE: () =>
        this.LA(laAfterW(this)).tokenType === G ||
        ((tokenIs(this.LA(laAfterW(this)), H) || scaleNumberAhead(this.LA(1))) && RANK_SERIES.has(joinSeries(this.LA(0)))),
      DEF: () => {
        const series = joinSeries(this.LA(0));
        this.SUBRULE(this.sharedAfterJoin);
        // Factor right after an equative's shared scale: `ae` + `h+2` = *twice as … as* (comparatives.md § factor).
        this.OPTION2({
          GATE: () => series === "ae" && factorAhead(this.LA(1)),
          DEF: () => this.CONSUME(H, { LABEL: "factor" }),
        });
      },
    });
  });

  public vpCoord = this.RULE("vpCoord", () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.vpCoordPart);
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
          this.AT_LEAST_ONE(() => {
            const verb = this.CONSUME(V);
            this.OPTION3({
              GATE: () => isScopeThoVerb(verb) && this.LA(1).tokenType === B,
              DEF: () => {
                this.CONSUME(B);
              },
            });
          });
          this.OPTION(() => {
            this.SUBRULE2(this.vJoinClose);
          });
        },
      },
    ]);
  });

  public vJoinClose = this.RULE("vJoinClose", () => {
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
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.gCoordPart);
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
          this.OPTION(() => {
            this.SUBRULE2(this.gJoinClose);
          });
        },
      },
    ]);
  });

  public gJoinClose = this.RULE("gJoinClose", () => {
    // Nothing modifies a list of adjectives: a following /ɡ/ is its own unit.
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
        },
      },
    ]);
  });

  // Nothing is SHARED after a /h/ or /th/ join; `/w/` before the join word grades the list.
  public hJoinClose = this.RULE("hJoinClose", () => {
    this.CONSUME(JoinH);
  });

  public hUnitRule = this.RULE("hUnitRule", () => {
    this.MANY(() => {
      this.CONSUME(W);
    });
    const host = this.CONSUME(H);
    this.OPTION(() => {
      this.OR([
        {
          ALT: () => {
            const bound = this.CONSUME(B);
            // A `/th/` host's `/b/` is an offset or source, so a later `/ɡ/` stays the predicate.
            this.hostedTail(bound, () => (host.payload as LexWord | undefined)?.pos === "h");
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
    // An ordinal (a place, or a kin generation) is an adjective on the landmark instead, free to host its own /b/.
    this.OPTION6({
      GATE: () => {
        const la = this.LA(1);
        const family = (la.payload as LexWord | undefined)?.family;
        return la.tokenType === G && family?.kind === "number" && !isOrdinalMarker(family.stem.marker);
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
    this.CONSUME(Hook);
  });

  public npPackage = this.RULE("npPackage", () => {
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
    this.OR([
      { ALT: () => this.CONSUME(Z) },
      { ALT: () => this.CONSUME(D) },
      { ALT: () => this.CONSUME(B) },
      { ALT: () => this.CONSUME(Odo) },
      { ALT: () => this.CONSUME(WritingSpan) },
    ]);
    this.MANY({
      GATE: () => this.LA(laAfterW(this)).tokenType === G,
      DEF: () => {
        this.SUBRULE2(this.gPackage);
      },
    });
    // A hook + `/b/` right before a noun join word belongs to the item before it (joins.md § SHARED after the join).
    this.OPTION2({
      GATE: () => this.itemHookAhead(),
      DEF: () => {
        this.CONSUME(Hook, { LABEL: "itemHook" });
        this.CONSUME2(B, { LABEL: "itemHookBound" });
      },
    });
  });

  private itemHookAhead(): boolean {
    if (this.LA(1).tokenType !== Hook || this.LA(2).tokenType !== B) return false;
    const next = this.LA(laAfterW(this, 3));
    return next.tokenType === JoinZ || next.tokenType === JoinD || next.tokenType === JoinB;
  }

  public asOfWPair = this.RULE("asOfWPair", () => {
    this.CONSUME(W);
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
    this.MANY({
      GATE: () => this.LA(1).tokenType === W && !isAsOfWToken(this.LA(1)),
      DEF: () => {
        this.CONSUME(W);
      },
    });
    this.OPTION({
      GATE: () => isAsOfWToken(this.LA(1)),
      DEF: () => {
        this.SUBRULE(this.asOfWPair);
      },
    });
    this.MANY2({
      GATE: () => this.LA(1).tokenType === W && !isAsOfWToken(this.LA(1)),
      DEF: () => {
        this.CONSUME2(W);
      },
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
        GATE: () => this.LA(laAfterW(this)).tokenType === G,
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

/** The forward stand-in a unit holds (a noun's head, or an `/h/` host's hosted `/b/`): the slot the next sentence fills. */
function standInIn(unit: Unit): LexWord | undefined {
  if (unit.kind === "np") return npPackages(unit.coord).find((pkg) => isStandIn(pkg.head))?.head;
  if (unit.kind === "h" && unit.unit.hosted && isStandIn(unit.unit.hosted.bound)) return unit.unit.hosted.bound;
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
  return splitAtStandIn(resolved, orodoIdx, standInIn(resolved[orodoIdx]!)!);
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
function buildHosted(cst: CstNode, bound: IToken | undefined, amount: IToken | undefined): Hosted | undefined {
  if (!bound) return undefined;
  const adjs = childNodes(cst, "gPackage").map(buildGPackage);
  const boundJoin = buildBoundJoin(cst);
  return {
    bound: lexWordFromToken(bound),
    ...(boundJoin ? { boundJoin } : {}),
    ...(amount ? { amount: lexWordFromToken(amount) } : {}),
    ...(adjs.length > 0 ? { adjs } : {}),
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

function buildNpItem(cst: CstNode): NpItem {
  const island = childNodes(cst, "islandUnit")[0];
  if (island) return { kind: "island", island: buildIsland(island) };
  return { kind: "package", package: buildNpPackage(childNodes(cst, "npPackage")[0]!) };
}

function npCoordCst(parent: CstNode): CstNode | undefined {
  return childNodes(parent, "zCoord")[0] ?? childNodes(parent, "dCoord")[0] ?? childNodes(parent, "bCoord")[0];
}

function npCoordParts(cst: CstNode): CstNode[] {
  return childNodes(cst, "npCoordPart");
}

function buildNpCoord(cst: CstNode): NpCoord {
  const parts = npCoordParts(cst);
  const built = parts.map((part) => {
    const close = partJoinClose(part, "npJoinClose");
    const { join, shared, joinModifiers, factor } = joinFromClose(close);
    const items = childNodes(part, "npConjunct").map(buildNpItem);
    return { items, join, shared, ...(joinModifiers ? { joinModifiers } : {}), ...(factor ? { factor } : {}) };
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
  const parts = childNodes(cst, "vpCoordPart");
  return {
    parts: parts.map((part) => {
      const close = partJoinClose(part, "vJoinClose");
      const { join, shared } = joinFromClose(close);
      const verbs = childTokens(part, "V");
      const hostedVerbs = childTokens(part, "B").map((b) => {
        const verb = verbs.filter((v) => v.startOffset < b.startOffset).at(-1)!;
        return { verb: lexWordFromToken(verb), hosted: { bound: lexWordFromToken(b) } };
      });
      const built = { items: verbs.map(lexWordFromToken), join, shared };
      return hostedVerbs.length > 0 ? { ...built, hostedVerbs } : built;
    }),
  };
}

function buildHUnit(cst: CstNode): HUnit {
  const h = childToken(cst, "H")!;
  const hosted = buildHosted(cst, childToken(cst, "B") ?? childToken(cst, "Odo"), childToken(cst, "G"));
  return {
    word: lexWordFromToken(h),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    ...(hosted ? { hosted } : {}),
  };
}

function buildHookUnit(cst: CstNode): { kind: "hook"; word: LexWord; modifiers: LexWord[] } {
  return {
    kind: "hook",
    word: lexWordFromToken(childToken(cst, "Hook")!),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
  };
}

function flattenHUnits(cst: CstNode): Unit[] {
  const parts = childNodes(cst, "hCoordPart");
  const units: Unit[] = [];
  for (const part of parts) {
    const hUnits = childNodes(part, "hUnitRule").map(buildHUnit);
    const close = partJoinClose(part, "hJoinClose");
    const { join } = joinFromClose(close);
    for (const unit of hUnits) units.push({ kind: "h", unit });
    // Keep the fence (`/h/` or stance `thul` / `thol` / …) so it is not silently dropped.
    if (join) units.push({ kind: "h", unit: { word: join, modifiers: [] } });
  }
  return units;
}

function buildGCoord(cst: CstNode): GCoord {
  return {
    parts: childNodes(cst, "gCoordPart").map((part) => {
      const { join, shared } = joinFromClose(partJoinClose(part, "gJoinClose"));
      const items: GItem[] = childNodes(part, "gPackage").map((g) => ({ kind: "adj", adj: buildGPackage(g) }));
      return { items, join, shared };
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

type GToken = GItem | { kind: "join"; join: LexWord; shared: CoordShared[] };

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
      ...(part.join ? [{ kind: "join" as const, join: part.join, shared: part.shared }] : []),
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
      parts.push({ items, join: token.join, shared: token.shared });
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

function buildSpan(cst: CstNode): SpanUnit {
  const open = childToken(cst, "SpanOpen")!;
  const close = childToken(cst, "SpanClose");
  const atom = childToken(cst, "atom");
  const scoped = childNodes(cst, "scopedUnit");
  const content =
    scoped.length > 0 ? [finalizeClause(scoped.flatMap(expandUnits))] : childNodes(cst, "clause").map(buildClause);
  return {
    open: lexWordFromToken(open),
    content,
    ...(atom ? { atom: lexWordFromToken(atom) } : {}),
    ...(close ? { close: lexWordFromToken(close) } : {}),
  };
}

function spanEdgeOf(token: IToken): string | undefined {
  const word = token.payload as LexWord | undefined;
  if (!word || word.family.kind !== "x") return undefined;
  return word.family.edgeVowel;
}

function buildUnit(cst: CstNode): Unit {
  const island = childNodes(cst, "islandUnit")[0];
  if (island) return { kind: "island", island: buildIsland(island) };
  const span = childNodes(cst, "spanUnit")[0];
  if (span) return { kind: "span", span: buildSpan(span) };
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
  const span = childNodes(cst, "spanUnit")[0];
  if (span) return [{ kind: "span", span: buildSpan(span) }];
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

function buildClause(cst: CstNode): Clause {
  const items = childNodes(cst, "clauseItem").map(buildClauseItem);
  const joins = childTokens(cst, "midJoin").map(lexWordFromToken);
  if (joins.length === 0) return items[0]!;
  return {
    units: [
      {
        kind: "clauseCoord",
        coord: { first: items[0], links: joins.map((join, i) => ({ join, clause: items[i + 1] })) },
      },
    ],
  };
}

function impliedForceFromPolars(polars: LexWord[]): ImpliedForce | undefined {
  if (polars.length === 0) return undefined;
  const last = polars[polars.length - 1]!;
  return last.ending === "m" ? "yam" : "yal";
}

function buildLeftEdge(cst: CstNode | undefined): LeftEdge {
  if (!cst) {
    return { vocatives: [], polars: [], impliedForce: "yal" };
  }

  const vocatives = childTokens(cst, "Vocative").map(lexWordFromToken);
  const polars = childTokens(cst, "Polar").map(lexWordFromToken);
  const hookTok = childToken(cst, "Hook");
  const forceTok = childToken(cst, "Force");
  const force = forceTok ? lexWordFromToken(forceTok) : undefined;
  const leadTok = childToken(cst, "LeadForce");
  const impliedForce = force ? undefined : impliedForceFromPolars(polars) ?? "yal";
  const hookModifiers = childTokens(cst, "W").map(lexWordFromToken);

  return {
    vocatives,
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
  const clauseCst = childNodes(cst, "clause")[0]!;
  return {
    linker: linkerTok ? lexWordFromToken(linkerTok) : undefined,
    clause: buildClause(clauseCst),
    punct: trailingPunct ? punctFromToken(trailingPunct) : undefined,
  };
}

function buildUtterance(cst: CstNode): Utterance {
  const left = buildLeftEdge(childNodes(cst, "leftEdge")[0]);
  const bodyCsts = [...childNodes(cst, "edgeBody"), ...childNodes(cst, "bodyClause"), ...childNodes(cst, "nextBody")];
  const periods = childTokens(cst, "Period");
  const trailing = childToken(cst, "QMark") ?? childToken(cst, "Bang");

  const bodies: BodyClause[] = [];
  for (let i = 0; i < bodyCsts.length; i++) {
    let punct: IToken | undefined;
    if (i < bodyCsts.length - 1) {
      punct = periods[i];
    } else if (trailing) {
      punct = trailing;
    } else if (periods[i]) {
      punct = periods[i];
    }
    bodies.push(buildBodyClause(bodyCsts[i]!, punct));
  }

  return { left, bodies };
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

  const utterances = childNodes(cst, "utterance").map(buildUtterance);
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
