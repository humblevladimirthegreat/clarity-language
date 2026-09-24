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
import type {
  BodyClause,
  Clause,
  ClauseCoord,
  CoordShared,
  GPackage,
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
} from "./types.js";
import type { LexWord } from "./types.js";

export class SentenceParseError extends Error {
  readonly parserErrors: unknown[];

  constructor(message: string, parserErrors: unknown[] = []) {
    super(message);
    this.name = "SentenceParseError";
    this.parserErrors = parserErrors;
  }
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

function isAsOfWToken(token: IToken): boolean {
  return token.tokenType === W && isAsOfOverlay((token.payload as LexWord) ?? {});
}

function laAfterW(parser: CstParser, from = 1): number {
  let i = from;
  while (true) {
    const tok = parser.LA(i);
    if (tok.tokenType !== W) return i;
    const ending = (tok.payload as LexWord | undefined)?.ending;
    i += 1;
    if (isAsOfWToken(tok) && ending !== "r") {
      const next = parser.LA(i);
      if (next.tokenType === B || next.tokenType === Odo) i += 1;
    }
  }
}

function isNpSlotLookahead(parser: CstParser, slot: NpSlot): boolean {
  if (npSlot(parser.LA(1)) === slot) return true;
  if (isGlHead(parser.LA(1)) && npSlot(parser.LA(2)) === slot) return true;
  const i = laAfterW(parser);
  return isGlHead(parser.LA(i)) && npSlot(parser.LA(i + 1)) === slot;
}

class AgelanSentenceParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: false, maxLookahead: 3 });
    this.performSelfAnalysis();
  }

  public document = this.RULE("document", () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.utterance);
    });
    this.CONSUME(EOF);
  });

  public utterance = this.RULE("utterance", () => {
    this.OR([
      {
        GATE: () => {
          if (tokenIs(this.LA(1), Polar, Vocative, Force, Hook)) return true;
          return this.LA(laAfterW(this)).tokenType === Hook;
        },
        ALT: () => {
          this.SUBRULE(this.leftEdge);
          this.OPTION(() => {
            this.SUBRULE(this.bodyClause);
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
      this.OPTION2(() => {
        this.SUBRULE3(this.bodyClause);
      });
    });
    this.OPTION3(() => {
      this.OR2([
        { ALT: () => this.CONSUME(QMark) },
        { ALT: () => this.CONSUME(Bang) },
      ]);
    });
  });

  public leftEdge = this.RULE("leftEdge", () => {
    this.OR([
      {
        ALT: () => {
          this.AT_LEAST_ONE(() => {
            this.OR2([
              { ALT: () => this.CONSUME(Vocative) },
              { ALT: () => this.CONSUME(Polar) },
              {
                ALT: () => {
                  this.MANY(() => {
                    this.CONSUME(W);
                  });
                  this.CONSUME(Hook);
                },
              },
            ]);
          });
          this.OPTION(() => {
            this.CONSUME(Force);
          });
        },
      },
      { ALT: () => this.CONSUME2(Force) },
    ]);
  });

  public bodyClause = this.RULE("bodyClause", () => {
    this.OPTION(() => {
      this.CONSUME(Linker);
    });
    this.SUBRULE(this.clause);
  });

  public clause = this.RULE("clause", () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.clausePart);
    });
  });

  public clausePart = this.RULE("clausePart", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinX,
        ALT: () => {
          this.SUBRULE(this.xJoinClose);
        },
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE(() => {
            this.SUBRULE(this.unit);
          });
          this.OPTION(() => {
            this.SUBRULE2(this.xJoinClose);
          });
        },
      },
    ]);
  });

  public xJoinClose = this.RULE("xJoinClose", () => {
    this.CONSUME(JoinX);
    this.OPTION(() => {
      this.SUBRULE(this.sharedAfterJoin);
    });
  });

  public unit = this.RULE("unit", () => {
    this.OR([
      { GATE: () => this.LA(1).tokenType === IslandEdge, ALT: () => this.SUBRULE(this.islandUnit) },
      { GATE: () => this.LA(1).tokenType === SpanOpen, ALT: () => this.SUBRULE(this.spanUnit) },
      {
        GATE: () => isNpSlotLookahead(this, "z"),
        ALT: () => this.SUBRULE(this.zCoord),
      },
      {
        GATE: () => isNpSlotLookahead(this, "d"),
        ALT: () => this.SUBRULE(this.dCoord),
      },
      {
        GATE: () => isNpSlotLookahead(this, "b"),
        ALT: () => this.SUBRULE(this.bCoord),
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
        GATE: () => tokenIs(this.LA(laAfterW(this)), H, JoinH),
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
    this.MANY(() => {
      this.SUBRULE(this.clause);
    });
    this.CONSUME(SpanClose);
  });

  public zCoord = this.RULE("zCoord", () => {
    this.AT_LEAST_ONE({
      GATE: () => isNpSlotLookahead(this, "z"),
      DEF: () => {
        this.SUBRULE(this.zCoordPart);
      },
    });
  });

  public dCoord = this.RULE("dCoord", () => {
    this.AT_LEAST_ONE({
      GATE: () => isNpSlotLookahead(this, "d"),
      DEF: () => {
        this.SUBRULE(this.dCoordPart);
      },
    });
  });

  public bCoord = this.RULE("bCoord", () => {
    this.AT_LEAST_ONE({
      GATE: () => isNpSlotLookahead(this, "b"),
      DEF: () => {
        this.SUBRULE(this.bCoordPart);
      },
    });
  });

  public zCoordPart = this.RULE("zCoordPart", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinZ,
        ALT: () => {
          this.SUBRULE(this.npJoinClose);
        },
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => isNpSlotLookahead(this, "z") && this.LA(1).tokenType !== JoinZ,
            DEF: () => {
              this.SUBRULE(this.npConjunct);
            },
          });
          this.OPTION({
            GATE: () => this.LA(1).tokenType === JoinZ,
            DEF: () => {
              this.SUBRULE2(this.npJoinClose);
            },
          });
        },
      },
    ]);
  });

  public dCoordPart = this.RULE("dCoordPart", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinD,
        ALT: () => {
          this.SUBRULE(this.npJoinClose);
        },
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => isNpSlotLookahead(this, "d") && this.LA(1).tokenType !== JoinD,
            DEF: () => {
              this.SUBRULE(this.npConjunct);
            },
          });
          this.OPTION({
            GATE: () => this.LA(1).tokenType === JoinD,
            DEF: () => {
              this.SUBRULE2(this.npJoinClose);
            },
          });
        },
      },
    ]);
  });

  public bCoordPart = this.RULE("bCoordPart", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinB,
        ALT: () => {
          this.SUBRULE(this.npJoinClose);
        },
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => isNpSlotLookahead(this, "b") && this.LA(1).tokenType !== JoinB,
            DEF: () => {
              this.SUBRULE(this.npConjunct);
            },
          });
          this.OPTION({
            GATE: () => this.LA(1).tokenType === JoinB,
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
    this.OR([
      { ALT: () => this.CONSUME(JoinZ) },
      { ALT: () => this.CONSUME(JoinD) },
      { ALT: () => this.CONSUME(JoinB) },
    ]);
    this.OPTION(() => {
      this.SUBRULE(this.sharedAfterJoin);
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
        ALT: () => this.SUBRULE(this.vJoinClose),
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE(() => {
            this.CONSUME(V);
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
    this.OPTION(() => {
      this.SUBRULE(this.sharedAfterJoin);
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
        ALT: () => this.SUBRULE(this.gJoinClose),
      },
      {
        ALT: () => {
          this.AT_LEAST_ONE({
            GATE: () => this.LA(laAfterW(this)).tokenType === G,
            DEF: () => {
              this.SUBRULE(this.gPackage);
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
    this.CONSUME(JoinG);
    this.OPTION(() => {
      this.SUBRULE(this.sharedAfterJoin);
    });
  });

  public hCoord = this.RULE("hCoord", () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.hCoordPart);
    });
  });

  public hCoordPart = this.RULE("hCoordPart", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === JoinH,
        ALT: () => this.SUBRULE(this.hJoinClose),
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

  public hJoinClose = this.RULE("hJoinClose", () => {
    this.CONSUME(JoinH);
    this.OPTION(() => {
      this.SUBRULE(this.sharedAfterJoin);
    });
  });

  public hUnitRule = this.RULE("hUnitRule", () => {
    this.MANY(() => {
      this.CONSUME(W);
    });
    this.CONSUME(H);
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(B) },
        { ALT: () => this.CONSUME(Odo) },
      ]);
    });
  });

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
  });

  public asOfWPair = this.RULE("asOfWPair", () => {
    this.CONSUME(W);
    this.OPTION({
      GATE: () => tokenIs(this.LA(1), B, Odo),
      DEF: () => {
        this.OR([{ ALT: () => this.CONSUME(B) }, { ALT: () => this.CONSUME(Odo) }]);
      },
    });
  });

  public gPackage = this.RULE("gPackage", () => {
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
      this.CONSUME2(B);
    });
  });

  public sharedAfterJoin = this.RULE("sharedAfterJoin", () => {
    this.OR([
      { GATE: () => this.LA(laAfterW(this)).tokenType === G, ALT: () => this.SUBRULE(this.gPackage) },
      { GATE: () => tokenIs(this.LA(laAfterW(this)), H), ALT: () => this.SUBRULE(this.hUnitRule) },
    ]);
  });
}

const parserInstance = new AgelanSentenceParser();

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

function unitContainsOdo(unit: Unit): boolean {
  if (unit.kind === "np") {
    return npPackages(unit.coord).some((pkg) => isStandIn(pkg.head));
  }
  if (unit.kind === "h" && unit.unit.bound && isStandIn(unit.unit.bound)) return true;
  return false;
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
  const hasVp = units.some((u) => u.kind === "vp");
  if (hasVp || units.length !== 1 || units[0]?.kind !== "np") return units;

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
    if (currentIsOpenNp && island?.kind === "island" && closerIsJoinNp && closer.kind === "np") {
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
  const resolved = disambiguateClause(mergeIslandJoins(units));

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
    return {
      units: resolved.slice(0, i + 1),
      dependent: { orodo: dependentWord, clause: { units: resolved.slice(i + 1) } },
    };
  }

  const orodoIdx = resolved.findIndex(unitContainsOdo);
  if (orodoIdx < 0) return { units: resolved };

  const orodoUnit = resolved[orodoIdx]!;

  if (orodoUnit.kind === "h" && orodoUnit.unit.bound && isStandIn(orodoUnit.unit.bound)) {
    const matrix = resolved.slice(0, orodoIdx + 1);
    const depUnits = resolved.slice(orodoIdx + 1);
    return {
      units: matrix,
      dependent: depUnits.length > 0 ? { orodo: orodoUnit.unit.bound, clause: { units: depUnits } } : undefined,
    };
  }

  let orodoLex: LexWord | undefined;
  if (orodoUnit.kind === "np") {
    for (const pkg of npPackages(orodoUnit.coord)) {
      if (isStandIn(pkg.head)) {
        orodoLex = pkg.head;
        break;
      }
    }
  }

  const matrix = resolved.slice(0, orodoIdx + 1);
  const depUnits = resolved.slice(orodoIdx + 1);
  return {
    units: matrix,
    dependent:
      depUnits.length > 0 && orodoLex
        ? { orodo: orodoLex, clause: { units: depUnits } }
        : undefined,
  };
}

function childNodes(parent: CstNode, key: string): CstNode[] {
  return (parent.children[key] ?? []) as CstNode[];
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

function buildGPackage(cst: CstNode): GPackage {
  const gTok = childToken(cst, "G")!;
  const bTok = childToken(cst, "B");
  const asOfCst = childNodes(cst, "asOfWPair")[0];
  return {
    word: lexWordFromToken(gTok),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    bound: bTok ? lexWordFromToken(bTok) : undefined,
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
  return {
    glAdj,
    head: lexWordFromToken(headTok),
    adjs: trailingAdjs,
  };
}

function buildShared(cst: CstNode | undefined): CoordShared[] {
  if (!cst) return [];
  const g = childNodes(cst, "gPackage")[0];
  if (g) return [buildGPackage(g)];
  const h = childNodes(cst, "hUnitRule")[0];
  if (h) return [buildHUnit(h)];
  return [];
}

function joinFromClose(close: CstNode | undefined): { join?: LexWord; shared: CoordShared[] } {
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
  return {
    join: joinTok ? lexWordFromToken(joinTok) : undefined,
    shared: buildShared(sharedCst),
  };
}

function buildIsland(cst: CstNode): IslandUnit {
  return { units: childNodes(cst, "unit").map(buildUnit) };
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
  const z = childNodes(cst, "zCoordPart");
  if (z.length > 0) return z;
  const d = childNodes(cst, "dCoordPart");
  if (d.length > 0) return d;
  return childNodes(cst, "bCoordPart");
}

function buildNpCoord(cst: CstNode): NpCoord {
  const parts = npCoordParts(cst);
  const built = parts.map((part) => {
    const close = childNodes(part, "npJoinClose")[0];
    const { join, shared } = joinFromClose(close);
    const items = childNodes(part, "npConjunct").map(buildNpItem);
    return { items, join, shared };
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
      const close = childNodes(part, "vJoinClose")[0];
      const { join, shared } = joinFromClose(close);
      return { items: childTokens(part, "V").map(lexWordFromToken), join, shared };
    }),
  };
}

function buildHUnit(cst: CstNode): HUnit {
  const h = childToken(cst, "H")!;
  const bound = childToken(cst, "B") ?? childToken(cst, "Odo");
  return {
    word: lexWordFromToken(h),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    bound: bound ? lexWordFromToken(bound) : undefined,
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
    const close = childNodes(part, "hJoinClose")[0];
    const { join } = joinFromClose(close);
    if (join) {
      for (const unit of hUnits) units.push({ kind: "h", unit });
      continue;
    }
    for (const unit of hUnits) units.push({ kind: "h", unit });
  }
  return units;
}

function flattenGCoord(cst: CstNode): Unit[] {
  const parts = childNodes(cst, "gCoordPart");
  const units: Unit[] = [];
  for (const part of parts) {
    for (const g of childNodes(part, "gPackage")) {
      units.push({ kind: "predicate", adj: buildGPackage(g) });
    }
  }
  return units;
}

function buildSpan(cst: CstNode): SpanUnit {
  const open = childToken(cst, "SpanOpen")!;
  const close = childToken(cst, "SpanClose")!;
  return {
    open: lexWordFromToken(open),
    content: childNodes(cst, "clause").map(buildClause),
    close: lexWordFromToken(close),
  };
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
  if (g) return flattenGCoord(g);
  const h = childNodes(cst, "hCoord")[0];
  if (h) return flattenHUnits(h);
  const hook = childNodes(cst, "hookUnit")[0];
  if (hook) return [buildHookUnit(hook)];
  return [buildUnit(cst)];
}

function buildClause(cst: CstNode): Clause {
  const parts = childNodes(cst, "clausePart");
  const hasJoin = parts.some((part) => childNodes(part, "xJoinClose").length > 0);

  if (!hasJoin) {
    const units = parts.flatMap((part) => childNodes(part, "unit").flatMap(expandUnits));
    return finalizeClause(units);
  }

  const coordParts: { clauses: Clause[]; join: LexWord }[] = [];
  for (const part of parts) {
    const close = childNodes(part, "xJoinClose")[0];
    const joinTok = close ? childToken(close, "JoinX") : undefined;
    const join = joinTok ? lexWordFromToken(joinTok) : undefined;
    const units = childNodes(part, "unit").flatMap(expandUnits);
    if (!join) continue;
    coordParts.push({
      clauses: units.length > 0 ? [finalizeClause(units)] : [],
      join,
    });
  }

  return {
    units: [{ kind: "clauseCoord", coord: { parts: coordParts } }],
  };
}

function impliedForceFromPolars(polars: LexWord[]): ImpliedForce | undefined {
  if (polars.length === 0) return undefined;
  const last = polars[polars.length - 1]!;
  return last.ending === "m" ? "jam" : "jal";
}

function buildLeftEdge(cst: CstNode | undefined): LeftEdge {
  if (!cst) {
    return { vocatives: [], polars: [], impliedForce: "jal" };
  }

  const vocatives = childTokens(cst, "Vocative").map(lexWordFromToken);
  const polars = childTokens(cst, "Polar").map(lexWordFromToken);
  const hookTok = childToken(cst, "Hook");
  const forceTok = childToken(cst, "Force");
  const force = forceTok ? lexWordFromToken(forceTok) : undefined;
  const impliedForce = force ? undefined : impliedForceFromPolars(polars) ?? "jal";
  const hookModifiers = childTokens(cst, "W").map(lexWordFromToken);

  return {
    vocatives,
    polars,
    hook: hookTok ? lexWordFromToken(hookTok) : undefined,
    hookModifiers: hookModifiers.length > 0 ? hookModifiers : undefined,
    force,
    impliedForce,
  };
}

function buildBodyClause(cst: CstNode, trailingPunct?: IToken): BodyClause {
  const linkerTok = childToken(cst, "Linker");
  const clauseCst = childNodes(cst, "clause")[0]!;
  return {
    linker: linkerTok ? lexWordFromToken(linkerTok) : undefined,
    clause: buildClause(clauseCst),
    punct: trailingPunct ? punctFromToken(trailingPunct) : undefined,
  };
}

function buildUtterance(cst: CstNode): Utterance {
  const left = buildLeftEdge(childNodes(cst, "leftEdge")[0]);
  const bodyCsts = childNodes(cst, "bodyClause");
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

function islandHasBinder(island: IslandUnit): boolean {
  const walk = (units: Unit[]): boolean => {
    for (const unit of units) {
      if (unit.kind === "h") return true;
      if (unit.kind === "np" && unit.coord.parts.some((p) => p.join)) return true;
      if (unit.kind === "vp" && unit.coord.parts.some((p) => p.join)) return true;
      if (unit.kind === "clauseCoord") return true;
      if (unit.kind === "island" && walk(unit.island.units)) return true;
      if (unit.kind === "np") {
        for (const part of unit.coord.parts) {
          for (const item of part.items) {
            if (item.kind === "island" && walk(item.island.units)) return true;
          }
        }
      }
    }
    return false;
  };
  return walk(island.units);
}

function validateLeadingJoinFence<T extends { join?: LexWord }>(
  parts: T[],
  isEmpty: (part: T) => boolean,
): void {
  if (parts.length < 2) return;
  const first = parts[0]!;
  if (isEmpty(first) && first.join) {
    throw new SentenceParseError("Illegal left fence: join before conjuncts");
  }
}

function validateNpFences(coord: NpCoord): void {
  const { parts } = coord;
  if (parts.length === 0) return;

  validateLeadingJoinFence(parts, (part) => part.items.length === 0);

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    const next = parts[i + 1]!;
    if (part.items.length === 1 && part.join && next.items.length > 0) {
      throw new SentenceParseError("Illegal infix join: conjuncts must stack before a right-close");
    }
  }
}

function validateVpFences(coord: VpCoord): void {
  validateLeadingJoinFence(coord.parts, (part) => part.items.length === 0);
}

function validateClauseCoordFences(coord: ClauseCoord): void {
  validateLeadingJoinFence(coord.parts, (part) => part.clauses.length === 0);
}

function validateAsOfWord(word: LexWord, bound: LexWord | undefined): void {
  if (!isAsOfOverlay(word)) return;
  if (word.ending === "r" && bound) {
    throw new SentenceParseError("As-of resume does not take /b/");
  }
  if (word.ending !== "r" && !bound) {
    throw new SentenceParseError("As-of introduce needs /b/");
  }
}

function validateGPackageAsOf(pkg: GPackage): void {
  validateAsOfWord(pkg.word, pkg.bound);
  if (pkg.asOf) validateAsOfWord(pkg.asOf.word, pkg.asOf.bound);
}

function validateSharedAsOf(shared: CoordShared[]): void {
  for (const item of shared) {
    if ("modifiers" in item && "word" in item && !("unit" in item)) {
      validateGPackageAsOf(item as GPackage);
    } else if ("word" in item && "modifiers" in item) {
      const h = item as HUnit;
      validateAsOfWord(h.word, h.bound);
    }
  }
}

function validateNpAsOf(coord: NpCoord): void {
  for (const part of coord.parts) {
    for (const item of part.items) {
      if (item.kind === "package") {
        if (item.package.glAdj) validateGPackageAsOf(item.package.glAdj);
        for (const adj of item.package.adjs) validateGPackageAsOf(adj);
      }
    }
    validateSharedAsOf(part.shared);
  }
}

function validateVpAsOf(coord: VpCoord): void {
  for (const part of coord.parts) validateSharedAsOf(part.shared);
}

function validateClauseAsOf(units: Unit[]): void {
  let hAsOf = 0;
  for (const unit of units) {
    if (unit.kind === "h") {
      validateAsOfWord(unit.unit.word, unit.unit.bound);
      if (isAsOfOverlay(unit.unit.word)) hAsOf += 1;
    }
    if (unit.kind === "predicate") validateGPackageAsOf(unit.adj);
    if (unit.kind === "np") validateNpAsOf(unit.coord);
    if (unit.kind === "vp") validateVpAsOf(unit.coord);
    if (unit.kind === "clauseCoord") {
      for (const part of unit.coord.parts) {
        for (const clause of part.clauses) validateClauseAsOf(clause.units);
      }
    }
  }
  if (hAsOf > 1) {
    throw new SentenceParseError("At most one as-of pair per /h/ host");
  }
}

function validateUnits(units: Unit[]): void {
  validateClauseAsOf(units);
  for (const unit of units) {
    if (unit.kind === "np") {
      validateNpFences(unit.coord);
      for (const part of unit.coord.parts) {
        for (const item of part.items) {
          if (item.kind === "island") {
            if (item.island.units.length === 0) {
              throw new SentenceParseError("Empty scope island");
            }
            if (!islandHasBinder(item.island)) {
              throw new SentenceParseError("Illegal binderless scope island");
            }
            validateUnits(item.island.units);
          }
        }
      }
    }
    if (unit.kind === "vp") {
      validateVpFences(unit.coord);
    }
    if (unit.kind === "island") {
      if (unit.island.units.length === 0) {
        throw new SentenceParseError("Empty scope island");
      }
      if (!islandHasBinder(unit.island)) {
        throw new SentenceParseError("Illegal binderless scope island");
      }
      validateUnits(unit.island.units);
    }
    if (unit.kind === "span") {
      for (const clause of unit.span.content) validateUnits(clause.units);
    }
    if (unit.kind === "clauseCoord") {
      validateClauseCoordFences(unit.coord);
      for (const part of unit.coord.parts) {
        for (const clause of part.clauses) validateUnits(clause.units);
      }
    }
  }
}

function validateResult(result: ParseResult): void {
  for (const utterance of result.utterances) {
    if (
      utterance.left.vocatives.length === 0 &&
      utterance.left.polars.length === 0 &&
      !utterance.left.force &&
      !utterance.left.hook &&
      utterance.bodies.length === 0
    ) {
      throw new SentenceParseError("Empty utterance");
    }
    for (const body of utterance.bodies) {
      validateUnits(body.clause.units);
      if (body.clause.dependent) validateUnits(body.clause.dependent.clause.units);
    }
  }
}

export function parseSentenceTokens(tokens: IToken[]): ParseResult {
  parserInstance.input = tokens;
  const cst = parserInstance.document();

  if (parserInstance.errors.length > 0) {
    throw new SentenceParseError(
      parserInstance.errors.map((e) => e.message).join("; "),
      parserInstance.errors,
    );
  }

  const utterances = childNodes(cst, "utterance").map(buildUtterance);
  const result = { utterances };
  validateResult(result);
  return result;
}
