import { CstParser, EOF, type IToken, type TokenType } from "chevrotain";
import { LLStarLookaheadStrategy } from "./allstar/all-star-lookahead.js";
import {
  allTokens,
  B,
  Force,
  G,
  GGlBefore,
  GPlain,
  GShareable,
  GAdj,
  GInList,
  GInRespList,
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
  HList,
  HLone,
  HPlainList,
  HPlainLone,
  HThList,
  HThLone,
  Amount,
  Factor,
  HScale,
  HZone,
  HZoneHeld,
  BScale,
  BarPlain,
  FenceBar,
  Citation,
  IslandClose,
  IslandOpen,
  JoinB,
  JoinD,
  JoinG,
  JoinH,
  JoinV,
  JoinX,
  JoinZ,
  Linker,
  Odo,
  Period,
  Polar,
  Hook,
  HookHosting,
  HookPlain,
  ItemHook,
  SameRolePair,
  V,
  VPlainEnd,
  VPlainMore,
  VContEnd,
  VContMore,
  JoinVEnd,
  JoinVMore,
  Vocative,
  Interjection,
  W,
  WBefore,
  WLeaf,
  type WGroupName,
  type WTarget,
} from "./tokens.js";
import {
  CLOSE_ENDS,
  LIST_ENDS,
  NP_HEAD,
  NP_JOIN,
  NP_W_TARGET,
  PART_ENDS,
  ambiguityReports,
  errorMessageProvider,
  wOf,
  wTargetOfHead,
  type ChainState,
  type CloseEnd,
  type ListEnd,
  type NpSlot,
  type ParserRule,
  type PartEnd,
  type PartStart,
  type UnitEnd,
} from "./sentence-shapes.js";

export class AgebenSentenceParser extends CstParser {
  public lookahead(index: number): IToken {
    return this.LA(index);
  }

  constructor() {
    super(allTokens, {
      recoveryEnabled: false,
      // ALL(*) decides alternatives itself and ignores this; it only sets how long the
      // expected-token paths in error messages are, which grow combinatorially past 1.
      maxLookahead: 1,
      errorMessageProvider,
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
          // A reply turn may be one citation phrase (`yal azozon.`, questions.md#fill-ask).
          this.OPTION(() =>
            this.OR6([
              { ALT: () => this.SUBRULE(this.bodyClause, { LABEL: "edgeBody" }) },
              { ALT: () => this.SUBRULE2(this.citation, { LABEL: "fragment" }) },
            ]),
          );
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
      // One citation phrase is a sentence of its own: a fill answer, a greeting, a name (questions.md#fill-ask).
      { ALT: () => this.SUBRULE(this.citation, { LABEL: "fragment" }) },
    ]);
  });

  /**
   * A call (or a greeting bid) or a reaction, with what describes it: a `gl-` adjective before it, `/w/` right before it,
   * and plain `/ɡ/` words after it (`yohun galuden`, `glelavam yezul`, `welavam yezum`; more-turn-words.md#describe-turn-word).
   */
  public turnWord = this.RULE("turnWord", () => {
    this.OPTION(() => this.SUBRULE(this.glPackageTurn, { LABEL: "glAdj" }));
    this.MANY(() => {
      this.CONSUME(WBefore.Turn, { LABEL: "W" });
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
    const rule: ParserRule = this.RULE(name, () => {
      // A hook that glues the sentence to prior talk, after any `/w/` that details it (hooks.md#discourse-hooks).
      const glue = (k: number) => {
        this.many(k + 10, () => this.consume(k + 10, WBefore.HookPlain, { LABEL: "W" }));
        this.consume(k + 10, HookPlain, { LABEL: "Hook" });
      };
      // Right-recursive (read back by `flattenEdge`): which item is the last one shows only after it.
      const item = {
        ALT: () => {
          this.or(1, [
            { ALT: () => this.subrule(1, this.turnWord) },
            { ALT: () => this.consume(1, Polar) },
            { ALT: () => glue(1) },
          ]);
          this.subrule(2, rule, { LABEL: "leftEdgeRest" });
        },
      };
      const last = {
        turn: { ALT: () => this.subrule(3, this.turnWord) },
        other: {
          ALT: () => this.or(4, [{ ALT: () => this.consume(4, Polar) }, { ALT: () => glue(4) }]),
        },
        // An act word, or two stacked act words (`yul yul`, `yel yol`): any pair; a third is a new turn (more-turn-words.md#stacked-acts).
        force: {
          ALT: () => {
            this.option(5, () => this.consume(5, Force, { LABEL: "LeadForce" }));
            this.consume(6, Force);
          },
        },
      }[ending];
      this.OR([item, last]);
    });
    return rule;
  }

  /**
   * A check-back (`yel yael.`, `yem yaol.`; polar-inventory.md#check-backs): an act word (or a force pair) and polar words, a turn
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
      this.OR([
        {
          ALT: () => {
            // A mention marker before a topic span (`glelel x[udozo] …`, spans-as-words.md#mention).
            this.OPTION4(() => this.CONSUME(GGlBefore.Linker, { LABEL: "topicMarker" }));
            this.CONSUME(Linker);
            // A topic word, or a marked topic span, may be the whole sentence (`xazawan.`, `glelel x[udozo].`; topic.md#topic).
            this.OPTION5(() => crossOrClause(2, this.clause));
          },
        },
        { ALT: () => crossOrClause(3, first) },
      ]);
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
      this.OPTION(() => this.SUBRULE(this.clauseRest));
    });
  }

  /** A join and the clause items after it, right-recursive (read back by `clauseParts`): the last join may end the clause. */
  public clauseRest = this.RULE("clauseRest", () => {
    this.CONSUME(JoinX, { LABEL: "midJoin" });
    this.OPTION(() => {
      this.SUBRULE(this.clauseItem);
      this.OPTION2(() => this.SUBRULE(this.clauseRest));
    });
  });

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
   *   adjectives start right at the join, so the first one is not shared (list-structure.md#respectively).
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
  public unitAfterZBare = this.unitChainRule("unitAfterZBare", "z", "bare");
  public unitAfterD = this.unitChainRule("unitAfterD", "d", "closed");
  public unitAfterDOpen = this.unitChainRule("unitAfterDOpen", "d", "open");
  public unitAfterDShared = this.unitChainRule("unitAfterDShared", "d", "shared");
  public unitAfterDBare = this.unitChainRule("unitAfterDBare", "d", "bare");
  public unitAfterB = this.unitChainRule("unitAfterB", "b", "closed");
  public unitAfterBOpen = this.unitChainRule("unitAfterBOpen", "b", "open");
  public unitAfterBShared = this.unitChainRule("unitAfterBShared", "b", "shared");
  public unitAfterBBare = this.unitChainRule("unitAfterBBare", "b", "bare");
  public unitAfterZFree = this.unitChainRule("unitAfterZFree", "zFree", "closed");
  public unitAfterZFreeOpen = this.unitChainRule("unitAfterZFreeOpen", "zFree", "open");
  public unitAfterZFreeShared = this.unitChainRule("unitAfterZFreeShared", "zFree", "shared");
  public unitAfterZFreeBare = this.unitChainRule("unitAfterZFreeBare", "zFree", "bare");
  public unitAfterDFree = this.unitChainRule("unitAfterDFree", "dFree", "closed");
  public unitAfterDFreeOpen = this.unitChainRule("unitAfterDFreeOpen", "dFree", "open");
  public unitAfterDFreeShared = this.unitChainRule("unitAfterDFreeShared", "dFree", "shared");
  public unitAfterDFreeBare = this.unitChainRule("unitAfterDFreeBare", "dFree", "bare");
  public unitAfterBFree = this.unitChainRule("unitAfterBFree", "bFree", "closed");
  public unitAfterBFreeOpen = this.unitChainRule("unitAfterBFreeOpen", "bFree", "open");
  public unitAfterBFreeShared = this.unitChainRule("unitAfterBFreeShared", "bFree", "shared");
  public unitAfterBFreeBare = this.unitChainRule("unitAfterBFreeBare", "bFree", "bare");
  public unitAfterV = this.unitChainRule("unitAfterV", "v", "closed");
  public unitAfterVOpen = this.unitChainRule("unitAfterVOpen", "v", "open");
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
        zFree: this.unitAfterZFree,
        dFree: this.unitAfterDFree,
        bFree: this.unitAfterBFree,
      },
      open: {
        start: this.unitOpen,
        v: this.unitAfterVOpen,
        z: this.unitAfterZOpen,
        d: this.unitAfterDOpen,
        b: this.unitAfterBOpen,
        g: this.unitAfterGOpen,
        h: this.unitAfterHOpen,
        zFree: this.unitAfterZFreeOpen,
        dFree: this.unitAfterDFreeOpen,
        bFree: this.unitAfterBFreeOpen,
      },
      shared: {
        z: this.unitAfterZShared,
        d: this.unitAfterDShared,
        b: this.unitAfterBShared,
        zFree: this.unitAfterZFreeShared,
        dFree: this.unitAfterDFreeShared,
        bFree: this.unitAfterBFreeShared,
      },
      bare: {
        z: this.unitAfterZBare,
        d: this.unitAfterDBare,
        b: this.unitAfterBBare,
        zFree: this.unitAfterZFreeBare,
        dFree: this.unitAfterDFreeBare,
        bFree: this.unitAfterBFreeBare,
      },
    };
    return rules[end][state]!;
  }

  /**
   * Every kind of unit: its rule, the CST label builders read it by, the state it leaves the chain in, and how it
   * ends (see the `unit` rules). `after` lists the endings of the unit before that a kind may follow, when not all of
   * them. The grammar is LR(1) (`npm run grammar-check`), so the order of the kinds chooses nothing.
   */
  private unitKinds(): {
    rule: ParserRule;
    label: string;
    state: ChainState;
    end: UnitEnd;
    kind: ChainState | "list";
    after?: UnitEnd[];
    /** At the `…Free` state of its slot, a kind that may open with a bare tag (`never`), or its form that does not (`only`). */
    free?: "only" | "never";
  }[] {
    const np = (level: NpSlot) => {
      const r = this.np(level);
      const unit = { label: `${level}Coord`, kind: level };
      const end = (listEnd: ListEnd) => listEnd.replace(/^Grounds/, "").toLowerCase() as UnitEnd;
      // A list whose last bar hosts `barl` ends the main clause, so the chain goes on as at the start (`…Free`).
      const lists = (start: "First" | "Free") =>
        LIST_ENDS.map((listEnd) => ({
          ...unit,
          rule: r.list[start][listEnd],
          state: listEnd.startsWith("Grounds") ? (`${level}Free` as const) : level,
          end: end(listEnd),
          free: start === "Free" ? ("only" as const) : ("never" as const),
        }));
      return [
        ...lists("First"),
        ...lists("Free"),
        { ...unit, rule: r.nounTagged, state: level, end: "closed" as const },
        { ...unit, rule: r.noun, state: level, end: "open" as const },
        { ...unit, rule: r.tag, state: level, end: "open" as const, free: "never" as const },
        { ...unit, rule: r.standInTagged, state: "start" as const, end: "closed" as const },
        { ...unit, rule: r.standIn, state: `${level}Free` as const, end: "open" as const },
      ];
    };
    const notOpen: UnitEnd[] = ["closed", "shared"];
    return [
      { rule: this.islandUnit, label: "islandUnit", state: "start", end: "closed", kind: "start" },
      ...np("z"),
      ...np("d"),
      ...np("b"),
      { rule: this.vpCoord, label: "vpCoord", state: "v", end: "closed", kind: "v" },
      { rule: this.vpCoordOpen, label: "vpCoord", state: "v", end: "open", kind: "v" },
      { rule: this.vpVerb, label: "vpCoord", state: "v", end: "closed", kind: "v" },
      { rule: this.gCoord, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["closed"] },
      { rule: this.gCoordPlainLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["shared"] },
      { rule: this.gCoordLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["bare"] },
      { rule: this.gCoordJoinLead, label: "gCoord", state: "g", end: "closed", kind: "g", after: ["open"] },
      { rule: this.gSingleClosed, label: "gCoord", state: "g", end: "closed", kind: "list", after: notOpen },
      { rule: this.gSingleOpen, label: "gCoord", state: "g", end: "open", kind: "list", after: notOpen },
      { rule: this.hCoord, label: "hCoord", state: "h", end: "closed", kind: "h" },
      { rule: this.hSingleClosed, label: "hCoord", state: "h", end: "closed", kind: "list" },
      { rule: this.hSingleOpen, label: "hCoord", state: "h", end: "open", kind: "list" },
      { rule: this.hGrounds, label: "hCoord", state: "start", end: "closed", kind: "list" },
      { rule: this.hookUnitPlain, label: "hookUnit", state: "start", end: "closed", kind: "start" },
      { rule: this.hookUnitClosed, label: "hookUnit", state: "start", end: "closed", kind: "start" },
      { rule: this.hookUnitOpen, label: "hookUnit", state: "start", end: "open", kind: "start" },
      { rule: this.sameRolePair, label: "sameRolePair", state: "start", end: "closed", kind: "start" },
    ];
  }

  /**
   * `hooks`: which hook units may start the chain (`hosting`: only one with a `/b/` or zone right after the hook;
   * `only`: the chain starts with a hook).
   */
  private unitChainRule(name: string, state: ChainState, end: UnitEnd, hooks: "all" | "none" | "hosting" | "only" = "all") {
    return this.RULE(name, () => {
      const free = state.endsWith("Free");
      const kinds = this.unitKinds().filter(
        (kind) =>
          (state === "start" || free || kind.kind !== state) &&
          (`${kind.kind}Free` === state ? kind.free !== "never" : kind.free !== "only") &&
          (!kind.after || kind.after.includes(end)) &&
          (hooks !== "only" || kind.label === "hookUnit") &&
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
  public hookChain = this.unitChainRule("hookChain", "start", "closed", "only");

  public islandUnit = this.RULE("islandUnit", () => {
    this.CONSUME(IslandOpen);
    this.OPTION(() => this.SUBRULE(this.unit));
    this.CONSUME(IslandClose);
  });

  /**
   * A word with no role letter, with what describes it (`ohun galuden`, word-endings.md#citation-forms). It fills no
   * slot, so it is never a clause unit: it stands as a whole sentence ({@link sentence}).
   */
  public citation = this.RULE("citation", () => {
    this.npPackageBody([{ type: Citation, label: "Citation" }], { gl: this.glPackageCitation });
  });

  /**
   * Noun-phrase lists and phrases, one set of rules per slot (`/z/`, `/d/`, `/b/`), from {@link npRules}. The shape is
   * the same at each slot; only the head and join tokens differ, so a phrase can only be read at the slot its words carry.
   */
  private npSets = { z: this.npRules("z"), d: this.npRules("d"), b: this.npRules("b") };

  private np(level: NpSlot) {
    return this.npSets[level];
  }

  /**
   * One slot's rules. A list is one or more parts, each closed by its join; it ends as its last part does (see the
   * `unit` rules), and in a `Grounds` list the last part's bar hosts `barl`, so the main clause ends with the list and the
   * next sentence is the grounds (bars.md#bars). The parts after the first come as a right-recursive rest
   * (read back by `npPartNodes`), so a part's end is known before deciding whether more follow:
   * - After a part a group tag closes (`Tagged`), the next part may open with a new tag (`zwal zodogal zam`); after any
   *   other part it may not: a tag right after a join names the whole list (tag-pronouns.md#naming-with-a-tag).
   * - A part that opens with a bar ({@link FenceBar}) follows a closed `ua` fence, so it is never the first part.
   */
  private npRules(level: NpSlot) {
    const starts = ["First", "Rest", "Free"] as const;
    const rules = {
      close: Object.fromEntries(CLOSE_ENDS.map((end) => [end, this.npJoinCloseRule(level, end)])) as Record<CloseEnd, ParserRule>,
      part: Object.fromEntries(
        starts.map((start) => [start, Object.fromEntries(PART_ENDS.map((end) => [end, this.npCoordPartRule(level, start, end)]))]),
      ) as Record<PartStart, Record<PartEnd, ParserRule>>,
      list: Object.fromEntries(
        starts.map((start) => [start, Object.fromEntries(LIST_ENDS.map((end) => [end, this.npCoordRule(level, start, end)]))]),
      ) as Record<PartStart, Record<ListEnd, ParserRule>>,
      pkg: this.npPackageRule(level, "Package"),
      noun: this.npPackageRule(level, "Noun"),
      nounTagged: this.npPackageRule(level, "NounTagged"),
      standIn: this.npPackageRule(level, "StandIn"),
      standInTagged: this.npPackageRule(level, "StandInTagged"),
      tag: this.npPackageRule(level, "Tag"),
    };
    return {
      ...rules,
      coordClosed: rules.list.First.Closed,
      coordShared: rules.list.First.Shared,
      coordOpen: rules.list.First.Open,
      coordBare: rules.list.First.Bare,
    };
  }

  /**
   * A list (`First`), the rest of one after an untagged part (`Rest`), or a list that does not open with a tag (`Free`,
   * see {@link ChainState}), ending as `end`: one part that is the last, or a part and the rest after it.
   */
  private npCoordRule(level: NpSlot, start: PartStart, end: ListEnd) {
    return this.RULE(`${level}Coord${start === "First" ? "" : start}${end}`, () => {
      const { part, list } = this.np(level);
      const parts = part[start];
      const label = { LABEL: `${level}CoordPart` };
      const lastEnds = end === "Closed" ? (["Closed", "Tagged"] as const) : end === "GroundsClosed" ? (["GroundsClosed", "GroundsTagged"] as const) : ([end] as const);
      this.or(1, [
        ...lastEnds.map((last, i) => ({ ALT: () => this.subrule(i + 1, parts[last], label) })),
        ...(["Bare", "Open", "Shared", "Closed", "Tagged"] as const).map((mid, i) => ({
          ALT: () => {
            this.subrule(i + 20, parts[mid], label);
            // After a group tag the rest starts as a list does; after any other part, as `Rest`.
            this.subrule(i + 30, list[mid === "Tagged" ? "First" : "Rest"][end], label);
          },
        })),
      ]);
    });
  }

  /**
   * One part of a list: items, then any bars, then the join, then a tag naming the list. `start`: a list's first part,
   * or one after a group tag (`First`: it may open with a new tag), one after any other part (`Rest`: it may open with
   * a {@link FenceBar}), or the first part of a list that may not open with a tag (`Free`). `end`: as its join (see
   * {@link npJoinCloseRule}), `Tagged` when a group tag closes it; `Grounds…` when its last bar hosts `barl`.
   */
  private npCoordPartRule(level: NpSlot, start: PartStart, end: PartEnd) {
    return this.RULE(`${level}CoordPart${start === "First" ? "" : start}${end}`, () => {
      const { pkg, tag, close } = this.np(level);
      const groupTag = NP_HEAD[level].tag;
      const grounds = end.startsWith("Grounds");
      const shape = end.replace(/^Grounds/, "") as CloseEnd | "Tagged";
      // The join and a tag **-l** right after it, which names the whole list (`zodogal zagadul zam zwal`, tag-pronouns.md#naming-with-a-tag).
      const ending = (k: number, label: string) => {
        if (shape !== "Tagged") {
          this.subrule(k, close[shape], { LABEL: label });
          return;
        }
        this.or(k + 20, CLOSE_ENDS.map((c) => ({ ALT: () => this.subrule(k, close[c], { LABEL: label }) })));
        this.consume(k + 30, groupTag, { LABEL: "groupTag" });
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
        // A stance word before a rank join is the comparee: the bar (comparatives.md § bars). A CLUES or PATTERN bar
        // may host `barl`: the next sentence is the grounds (bars.md#bars).
        if (grounds) this.subrule(k, this.barsGrounds, { LABEL: "bar" });
        else this.many(k + 1, () => this.subrule(k, this.barUnit, { LABEL: "bar" }));
        ending(k, "npJoinClose");
      };
      const alts: { ALT: () => void }[] = [
        { ALT: () => items(7, () => this.SUBRULE(pkg, { LABEL: "npConjunct" })) },
      ];
      // A new tag listed with other items goes first (`zwal zodogal zam`, tag-pronouns.md#naming-with-a-tag).
      if (start === "First") alts.push({ ALT: () => items(5, () => this.SUBRULE(tag, { LABEL: "npConjunct" })) });
      if (!grounds) alts.push({ ALT: () => ending(1, "standaloneJoin") });
      if (start === "Rest" && !grounds) {
        // A bar right after a closed `ua` fence (`zuam gagadul thobam zel …`): the whole fence is the one ranked item,
        // nested by right-close (comparatives.md § every bar, joins.md § fence nesting).
        alts.push({
          ALT: () => {
            this.SUBRULE2(this.fenceBarUnit, { LABEL: "bar" });
            this.MANY3(() => {
              this.SUBRULE3(this.barUnit, { LABEL: "bar" });
            });
            ending(3, "npJoinClose");
          },
        });
      }
      if (alts.length === 1) alts[0]!.ALT();
      else this.OR(alts);
    });
  }

  /**
   * A list's join word, and what the join shares (list-structure.md#shared-after-the-join): an adjective after any join, a
   * scale after a rank join ({@link HScale}, {@link BScale}), then the factor after an equative's scale. `Bare`: nothing
   * shared; `Open`: an adjective or scale whose hosted `/b/` the adjectives after it describe; `Shared`: any other
   * adjective; `Closed`: a scale, or a factor.
   */
  private npJoinCloseRule(level: NpSlot, variant: CloseEnd) {
    return this.RULE(`${level}JoinClose${variant}`, () => {
      // A `/w/` right before the join word details the list (respectively `wazem`, joins.md § Respectively).
      this.MANY(() => {
        this.CONSUME(WBefore[NP_W_TARGET[level]], { LABEL: "W" });
      });
      this.CONSUME(NP_JOIN[level]);
      // A hooked join's landmark: the `bl-` word right after it (hooked-joins.md#hooked-joins).
      this.OPTION3(() => this.CONSUME3(HostedB, { LABEL: "joinLandmark" }));
      const label = { LABEL: "sharedAfterJoin" };
      if (variant === "Open") {
        this.OR([
          { ALT: () => this.SUBRULE(this.sharedAdjOpen, label) },
          { ALT: () => this.SUBRULE(this.sharedScaleOpen, label) },
        ]);
      } else if (variant === "Shared") {
        this.SUBRULE(this.sharedAdjClosed, label);
      } else if (variant === "Closed") {
        // Factor right after an equative's shared scale: `oe` + `h+2` = *twice as … as* (comparatives.md § factor).
        this.OR2([
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
      }
    });
  }

  /**
   * A verb list: parts, each closed by its `/v/` join. An item is a verb and the `/h/`, `/d/` and `/b/` words before it,
   * so an item ends at its verb; the first item is a bare verb, since words before every verb are the clause's own and
   * cover every item (verb-and-stance-joins.md#vp-clause-forms). A verb or join marked `…More` has another verb after its
   * item words ({@link VPlainMore}), so the list goes on past it; one marked `…End` ends its part, or the list.
   *
   * The parts after the first come as a right-recursive tail (read back by `vpPartNodes`): after a join that another
   * verb follows, a part with verbs; after any other join, a lone join word as a part of its own, or nothing.
   */
  public vpCoord = this.vpCoordRule("vpCoord", "Closed");
  public vpCoordOpen = this.vpCoordRule("vpCoordOpen", "Open");
  public vpTailAfterEndClosed = this.vpTailRule("vpTailAfterEndClosed", "alone", "Closed");
  public vpTailAfterEndOpen = this.vpTailRule("vpTailAfterEndOpen", "alone", "Open");
  public vpTailAfterMoreClosed = this.vpTailRule("vpTailAfterMoreClosed", "later", "Closed");
  public vpTailAfterMoreOpen = this.vpTailRule("vpTailAfterMoreOpen", "later", "Open");

  /** A verb list that ends `Open` (its last join shares an adverb whose hosted `/b/` adjectives describe) or `Closed`. */
  private vpCoordRule(name: string, end: "Open" | "Closed") {
    return this.RULE(name, () => this.vpParts("first", end));
  }

  /** The parts after a join: lone join words after an `End` join (`alone`), parts with verbs after a `More` one (`later`). */
  private vpTailRule(name: string, at: "alone" | "later", end: "Open" | "Closed") {
    return this.RULE(name, () => this.vpParts(at, end));
  }

  /**
   * One part, then the rest of the list: the part is the last one (its join `End`, sharing as the list ends), or the
   * tail goes on, after an `End` join with lone join words and after a `More` join with a part with verbs.
   */
  private vpParts(at: "first" | "alone" | "later", end: "Open" | "Closed"): void {
    const parts = {
      first: { EndOpen: this.vpCoordPartFirstEndOpen, EndClosed: this.vpCoordPartFirstEndClosed, More: this.vpCoordPartFirstMore },
      alone: { EndOpen: this.vpCoordPartAloneEndOpen, EndClosed: this.vpCoordPartAloneEndClosed, More: this.vpCoordPartAloneMore },
      later: { EndOpen: this.vpCoordPartEndOpen, EndClosed: this.vpCoordPartEndClosed, More: this.vpCoordPartMore },
    }[at];
    const afterEnd = end === "Open" ? this.vpTailAfterEndOpen : this.vpTailAfterEndClosed;
    const afterMore = end === "Open" ? this.vpTailAfterMoreOpen : this.vpTailAfterMoreClosed;
    this.OR([
      { ALT: () => this.SUBRULE(parts[`End${end}`], { LABEL: "vpCoordPart" }) },
      ...(["EndOpen", "EndClosed"] as const).map((close, i) => ({
        ALT: () => {
          this.subrule(i + 2, parts[close], { LABEL: "vpCoordPart" });
          this.subrule(i + 4, afterEnd, { LABEL: "vpCoordPart" });
        },
      })),
      {
        ALT: () => {
          this.SUBRULE6(parts.More, { LABEL: "vpCoordPart" });
          this.SUBRULE7(afterMore, { LABEL: "vpCoordPart" });
        },
      },
    ]);
  }

  /**
   * One part of a verb list, by where it stands (`First`, a lone join word `Alone`, or later) and its join: `More` when
   * another verb comes after it, else `End`, which shares an `Open` adverb or none or a `Closed` one.
   */
  public vpCoordPartFirstEndOpen = this.vpCoordPartRule("vpCoordPartFirstEndOpen", "first", "EndOpen");
  public vpCoordPartFirstEndClosed = this.vpCoordPartRule("vpCoordPartFirstEndClosed", "first", "EndClosed");
  public vpCoordPartFirstMore = this.vpCoordPartRule("vpCoordPartFirstMore", "first", "More");
  public vpCoordPartAloneEndOpen = this.vpCoordPartRule("vpCoordPartAloneEndOpen", "alone", "EndOpen");
  public vpCoordPartAloneEndClosed = this.vpCoordPartRule("vpCoordPartAloneEndClosed", "alone", "EndClosed");
  public vpCoordPartAloneMore = this.vpCoordPartRule("vpCoordPartAloneMore", "alone", "More");
  public vpCoordPartEndOpen = this.vpCoordPartRule("vpCoordPartEndOpen", "later", "EndOpen");
  public vpCoordPartEndClosed = this.vpCoordPartRule("vpCoordPartEndClosed", "later", "EndClosed");
  public vpCoordPartMore = this.vpCoordPartRule("vpCoordPartMore", "later", "More");

  private vpCoordPartRule(name: string, at: "first" | "alone" | "later", close: "EndOpen" | "EndClosed" | "More") {
    return this.RULE(name, () => {
      const join = { EndOpen: this.vJoinCloseEndOpen, EndClosed: this.vJoinCloseEndClosed, More: this.vJoinCloseMore }[close];
      const alone = { ALT: () => this.SUBRULE(join, { LABEL: "standaloneJoin" }) };
      if (at === "alone") {
        alone.ALT();
        return;
      }
      // A verb, and the `/b/` a pair-reach verb hosts.
      const verb = (k: number, type: TokenType) => {
        this.consume(k, type, { LABEL: "V" });
        this.option(k, () => {
          this.consume(k, HostedB, { LABEL: "B" });
        });
      };
      const items = (k: number) => this.option(k + 10, () => this.subrule(k, this.vpItemsStart, { LABEL: "vpItemUnit" }));
      const verbs = {
        ALT: () => {
          const [end, more] = at === "first" ? [VPlainEnd, VPlainMore] : [VContEnd, VContMore];
          if (at === "later") items(1);
          this.or(2, [
            { ALT: () => verb(1, end) },
            {
              ALT: () => {
                // Each later verb comes after its item's `/h/`, `/d/` and `/b/` words; whether it is the last one shows at the verb.
                verb(2, more);
                items(3);
                this.MANY(() => {
                  verb(3, VContMore);
                  items(4);
                });
                verb(4, VContEnd);
              },
            },
          ]);
          this.SUBRULE2(join, { LABEL: "vJoinClose" });
        },
      };
      if (at === "first") this.OR([alone, verbs]);
      else verbs.ALT();
    });
  }

  /**
   * A verb with no join: one verb, and the `/b/` a pair-reach verb hosts. A {@link VCont} is never a lone verb: a second
   * verb in the clause takes a join (joins.md#right-close).
   */
  public vpVerb = this.RULE("vpVerb", () => {
    this.CONSUME(VPlainEnd, { LABEL: "V" });
    this.OPTION(() => {
      this.CONSUME(HostedB, { LABEL: "B" });
    });
  });

  /**
   * The `/d/`, `/b/` and `/h/` units of a verb's item, as a chain like the clause's (read back by `vpItemNodes`): no
   * two noun phrases of one slot side by side, and no `/h/` list after another `/h/` unit.
   */
  public vpItemsStart = this.vpItemsRule("vpItemsStart", "start");
  public vpItemsAfterD = this.vpItemsRule("vpItemsAfterD", "d");
  public vpItemsAfterB = this.vpItemsRule("vpItemsAfterB", "b");
  public vpItemsAfterH = this.vpItemsRule("vpItemsAfterH", "h");
  public vpItemsAfterHook = this.vpItemsRule("vpItemsAfterHook", "hook");

  private vpItemsRule(name: string, state: "start" | "d" | "b" | "h" | "hook") {
    return this.RULE(name, () => {
      // A hook with its `/b/` (an extra noun) is item material too, so `ul b_9 oel b_17` before a verb is that verb's.
      const kinds = [
        { kind: "d", unit: this.vpItemUnitD, next: () => this.vpItemsAfterD },
        { kind: "b", unit: this.vpItemUnitB, next: () => this.vpItemsAfterB },
        { kind: "h", unit: state === "h" ? this.vpItemUnitHSingle : this.vpItemUnitH, next: () => this.vpItemsAfterH },
        { kind: "hook", unit: this.vpItemUnitHook, next: () => this.vpItemsAfterHook },
      ].filter((k) => k.kind !== state || k.kind === "h" || k.kind === "hook");
      this.or(
        1,
        kinds.map((k, i) => ({
          ALT: () => {
            this.subrule(i + 1, k.unit, { LABEL: "vpItemUnit" });
            this.option(i + 1, () => this.subrule(i + 11, k.next(), { LABEL: "vpItemUnit" }));
          },
        })),
      );
    });
  }

  /** A `/d/` or `/b/` phrase in a verb's item: a list ending any way, or one noun. */
  public vpItemUnitD = this.vpItemNpRule("vpItemUnitD", "d");
  public vpItemUnitB = this.vpItemNpRule("vpItemUnitB", "b");

  private vpItemNpRule(name: string, level: "d" | "b") {
    return this.RULE(name, () => {
      const r = this.np(level);
      const label = { LABEL: `${level}Coord` };
      this.OR(
        [r.coordClosed, r.coordShared, r.coordOpen, r.coordBare, r.noun].map((rule, i) => ({ ALT: () => this.subrule(i + 1, rule, label) })),
      );
    });
  }

  public vpItemUnitH = this.RULE("vpItemUnitH", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.hCoord) },
      { ALT: () => this.SUBRULE(this.hSingle, { LABEL: "hCoord" }) },
    ]);
  });

  /** A hook in a verb's item: an extra-noun hook, whose `/b/` comes next as its own unit (hooks.md#extra-noun). */
  public vpItemUnitHook = this.RULE("vpItemUnitHook", () => {
    this.SUBRULE(this.hookUnitClosed, { LABEL: "hookUnit" });
  });

  public vpItemUnitHSingle = this.RULE("vpItemUnitHSingle", () => {
    this.SUBRULE(this.hSingle, { LABEL: "hCoord" });
  });

  /**
   * A `/v/` join word that another verb follows (`More`), or that ends its part (`End`): sharing an adverb whose hosted
   * `/b/` the adjectives after it describe (`EndOpen`), or no adverb or any other (`EndClosed`).
   */
  public vJoinCloseEndOpen = this.vJoinCloseRule("vJoinCloseEndOpen", JoinVEnd, "open");
  public vJoinCloseEndClosed = this.vJoinCloseRule("vJoinCloseEndClosed", JoinVEnd, "closed");
  public vJoinCloseMore = this.vJoinCloseRule("vJoinCloseMore", JoinVMore, "any");

  private vJoinCloseRule(name: string, join: TokenType, shared: "open" | "closed" | "any") {
    return this.RULE(name, () => {
      // A `/w/` right before the join word is respectively `wazem` (joins.md § Respectively).
      this.MANY(() => {
        this.CONSUME(WBefore.JoinV, { LABEL: "W" });
      });
      this.CONSUME(join, { LABEL: "JoinV" });
      // Only a shared /h/ follows a verb join (it covers every verb); a /ɡ/ there is not shared, and a /th/ there is on the claim.
      const adverb = { open: this.sharedAdverbOpen, closed: this.sharedAdverbClosed, any: this.sharedAdverb }[shared];
      if (shared === "open") this.SUBRULE(adverb, { LABEL: "sharedAfterJoin" });
      else this.OPTION(() => this.SUBRULE2(adverb, { LABEL: "sharedAfterJoin" }));
    });
  }

  public gCoord = this.RULE("gCoord", () => {
    this.AT_LEAST_ONE(() => this.SUBRULE(this.gCoordPart));
  });

  /**
   * A `/ɡ/` list right after a noun join that shares nothing: its first part is a lone join word, or a respectively
   * list (`zalahen zal gelavam gamazam wazem gal`, list-structure.md#respectively). Any other first adjective would be shared.
   */
  public gCoordLead = this.RULE("gCoordLead", () => {
    this.SUBRULE(this.gCoordPartLead, { LABEL: "gCoordPart" });
    this.MANY(() => this.SUBRULE(this.gCoordPart));
  });

  /** A `/ɡ/` list right after a word that plain adjectives describe: its first part is a lone join word. */
  public gCoordJoinLead = this.RULE("gCoordJoinLead", () => {
    this.SUBRULE(this.gCoordPartJoin, { LABEL: "gCoordPart" });
    this.MANY(() => this.SUBRULE(this.gCoordPart));
  });

  /**
   * A `/ɡ/` list after a list that shares an adjective: its first part is not a respectively list, whose first
   * adjective would sit right after the noun join (list-structure.md#respectively).
   */
  public gCoordPlainLead = this.RULE("gCoordPlainLead", () => {
    this.SUBRULE(this.gCoordPartPlain, { LABEL: "gCoordPart" });
    this.MANY(() => this.SUBRULE(this.gCoordPart));
  });

  /** One part of a `/ɡ/` list: its items and join (`plain`, `respectively`, or either), or a lone join word. */
  public gCoordPart = this.gCoordPartRule("gCoordPart", "any");
  public gCoordPartPlain = this.gCoordPartRule("gCoordPartPlain", "plain");
  public gCoordPartLead = this.gCoordPartRule("gCoordPartLead", "respectively");
  public gCoordPartJoin = this.gCoordPartRule("gCoordPartJoin", "none");

  /** Items are {@link GInList} adjectives before a plain join, {@link GInRespList} ones before `wazem` and the join. */
  private gCoordPartRule(name: string, close: "any" | "plain" | "respectively" | "none") {
    return this.RULE(name, () => {
      const plain = {
        ALT: () => {
          this.AT_LEAST_ONE(() => this.SUBRULE(this.gListItem, { LABEL: "gPackage" }));
          this.SUBRULE2(this.gJoinClose);
        },
      };
      const respectively = {
        ALT: () => {
          this.AT_LEAST_ONE2(() => this.SUBRULE(this.gRespItem, { LABEL: "gPackage" }));
          this.SUBRULE(this.gJoinCloseRespectively, { LABEL: "gJoinClose" });
        },
      };
      const alone = { ALT: () => this.SUBRULE(this.gJoinClose, { LABEL: "standaloneJoin" }) };
      const alts = { any: [alone, plain, respectively], plain: [alone, plain], respectively: [alone, respectively], none: [alone] }[close];
      if (alts.length === 1) alone.ALT();
      else this.OR(alts);
    });
  }

  /** An adjective with no join, as its own unit: one whose hosted `/b/` the adjectives after it describe (`Open`), or any other. */
  public gSingleOpen = this.RULE("gSingleOpen", () => {
    this.SUBRULE(this.gLoneOpen, { LABEL: "gPackage" });
  });

  public gSingleClosed = this.RULE("gSingleClosed", () => {
    this.SUBRULE(this.gLoneClosed, { LABEL: "gPackage" });
  });

  public gJoinClose = this.RULE("gJoinClose", () => {
    // Nothing modifies a list of adjectives (a following /ɡ/ is its own unit); only respectively `wazem` sits before the join.
    this.MANY(() => {
      this.CONSUME(WLeaf.Plain.JoinG, { LABEL: "W" });
    });
    this.CONSUME(JoinG);
  });

  public gJoinCloseRespectively = this.RULE("gJoinCloseRespectively", () => {
    this.CONSUME(WLeaf.Pairing.JoinG, { LABEL: "W" });
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
          // so it closes the stance words while the next sentence still fills the host (verb-and-stance-joins.md#stance-join-before-barl).
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
    this.OR([
      { ALT: () => this.SUBRULE(this.hUnitOpen, { LABEL: "hUnitRule" }) },
      { ALT: () => this.SUBRULE(this.hUnitClosed, { LABEL: "hUnitRule" }) },
    ]);
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

  /** `any` is an item of an `/h/` list ({@link HList}); `open` and `closed` are units of their own ({@link HLone}). */
  private hUnitRuleOf(name: string, variant: "any" | "open" | "closed") {
    return this.RULE(name, () => {
      const list = variant === "any";
      const [HTh, HPlain, H] = list ? [HThList, HPlainList, HList] : [HThLone, HPlainLone, HLone];
      this.MANY(() => {
        this.CONSUME(WBefore[list ? "HList" : "HLone"], { LABEL: "W" });
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
  public barUnit = this.barRule("barUnit", BarPlain);
  public fenceBarUnit = this.barRule("fenceBarUnit", FenceBar);

  /** A list part's bars when the last hosts `barl` (right-recursive, read back by `barNodes`): only the last one shows it. */
  public barsGrounds = this.RULE("barsGrounds", () => {
    this.OR([
      {
        ALT: () => {
          this.SUBRULE(this.barUnit, { LABEL: "bar" });
          this.SUBRULE(this.barsGrounds, { LABEL: "bar" });
        },
      },
      { ALT: () => this.SUBRULE(this.barStandIn, { LABEL: "bar" }) },
    ]);
  });

  private barRule(name: string, bar: TokenType) {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(WBefore.Bar, { LABEL: "W" });
      });
      this.CONSUME(bar, { LABEL: "H" });
      this.OPTION(() => this.landmarkHosted(10, "any"));
    });
  }

  /** A CLUES or PATTERN bar hosting `barl`: the next sentence is the grounds (bars.md#bars). */
  public barStandIn = this.RULE("barStandIn", () => {
    this.MANY(() => {
      this.CONSUME(WBefore.Bar, { LABEL: "W" });
    });
    this.CONSUME(BarPlain, { LABEL: "H" });
    this.CONSUME(HostedOdo, { LABEL: "Odo" });
  });

  /** An `/h/` or `/th/` word hosting a forward stand-in: the next sentence fills it (dependents.md#dependent-clauses). */
  public hStandIn = this.RULE("hStandIn", () => {
    this.MANY(() => {
      this.CONSUME(WBefore.HLone, { LABEL: "W" });
    });
    this.CONSUME(HLone, { LABEL: "H" });
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
   * (a `/th/` host), `barl` may follow a number: a channel's offset, then the grounds (evidentiality.md#evidence-clause).
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

  /** A hosted `/b/` that heads a list filling the slot (`hazam bledehal blezedel bal`), then the amount. */
  private joinedHosted(k: number): void {
    this.consume(k, HostedBJoined, { LABEL: "B" });
    this.subrule(k, this.boundJoinTail);
    this.closedTail(k);
  }

  /**
   * Plain adjectives after a word, each describing it (clause.md#adjectives-ɡ). Only the last may end open (its hosted
   * `/b/` takes the adjectives after it, longer-chains.md#complex-chaining), so the run itself always ends open.
   */
  private trailingAdjs(k: number): void {
    this.option(k + 1, () => this.subrule(k, this.trailingAdjRun, { LABEL: "gPackage" }));
  }

  /**
   * The run itself, right-recursive (read back by {@link adjNodes}): whether an adjective is the last of the run is only
   * known at its hosted `/b/`, so the run does not have to decide before it.
   */
  public trailingAdjRun = this.RULE("trailingAdjRun", () => {
    this.OR([
      {
        ALT: () => {
          this.SUBRULE(this.gPackageClosed, { LABEL: "gPackage" });
          this.OPTION(() => this.SUBRULE(this.trailingAdjRun, { LABEL: "gPackage" }));
        },
      },
      { ALT: () => this.SUBRULE(this.gPackageOpen, { LABEL: "gPackage" }) },
    ]);
  });

  /**
   * A hook, and the stance `uom` holds as its zone (contrary-to.md#contrary-to-stance): one whose hosted `/b/` the adjectives
   * after it describe (`Open`), or any other (`Closed`). A `Plain` hook has no `/b/` or zone right after it ({@link HookPlain}).
   */
  public hookUnitPlain = this.hookUnitRule("hookUnitPlain", "plain");
  public hookUnitOpen = this.hookUnitRule("hookUnitOpen", "open");
  public hookUnitClosed = this.hookUnitRule("hookUnitClosed", "closed");
  public zoneUnitOpen = this.zoneRule("zoneUnitOpen", "open");
  public zoneUnitClosed = this.zoneRule("zoneUnitClosed", "closed");

  private hookUnitRule(name: string, shape: "plain" | "open" | "closed") {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(WBefore[shape === "plain" ? "HookPlain" : "HookHosting"], { LABEL: "W" });
      });
      if (shape === "plain") {
        this.CONSUME(HookPlain, { LABEL: "Hook" });
        return;
      }
      this.CONSUME(HookHosting, { LABEL: "Hook" });
      const zone = { open: this.zoneUnitOpen, closed: this.zoneUnitClosed }[shape];
      if (shape === "open") this.SUBRULE(zone, { LABEL: "zone" });
      else this.OPTION(() => this.SUBRULE2(zone, { LABEL: "zone" }));
    });
  }

  /**
   * A same-role word and the fill-ask blank it relates (`abam zar`, same-role-words.md): one unit, so a phrase of the
   * blank's role may follow it. Fronted, the pair takes its A from that phrase.
   */
  public sameRolePair = this.RULE("sameRolePair", () => {
    this.CONSUME(SameRolePair, { LABEL: "Hook" });
    this.OR([
      { ALT: () => this.CONSUME(JoinZ, { LABEL: "Blank" }) },
      { ALT: () => this.CONSUME(JoinD, { LABEL: "Blank" }) },
      { ALT: () => this.CONSUME(JoinV, { LABEL: "Blank" }) },
    ]);
  });

  /** The zone stance, with what it hosts, as a `/th/` host takes it. */
  private zoneRule(name: string, shape: "any" | "open" | "closed") {
    return this.RULE(name, () => {
      this.CONSUME(HZone, { LABEL: "H" });
      this.OPTION9(() => this.CONSUME(HZoneHeld, { LABEL: "Held" }));
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
   * A tag **-l** right after the head and its adjectives names that phrase (tag-pronouns.md#naming-with-a-tag); a lone noun
   * or stand-in with one is `…Tagged`, since a plain adjective after the tag no longer describes the noun.
   */
  private npPackageRule(level: NpSlot, variant: "Package" | "Noun" | "NounTagged" | "StandIn" | "StandInTagged" | "Tag") {
    const head = NP_HEAD[level];
    const noun = { type: head.noun, label: undefined };
    const span = { type: head.span, label: "WritingSpan" };
    const tag = { type: head.tag, label: level.toUpperCase() };
    // A stand-in in a list is one whose run reaches the list's join ({@link OdoZList}); any other is a phrase of its own.
    const heads = {
      Package: [noun, { type: head.standInList, label: "Odo" }, span],
      Noun: [noun, span],
      NounTagged: [noun, span],
      StandIn: [{ type: head.standInLone, label: "Odo" }],
      StandInTagged: [{ type: head.standInLone, label: "Odo" }],
      Tag: [tag],
    }[variant];
    const tagged = { Package: "optional", NounTagged: "required", StandInTagged: "required" } as const;
    return this.RULE(`${level}${variant}`, () =>
      this.npPackageBody(heads, {
        gl: { z: this.glPackageZ, d: this.glPackageD, b: this.glPackageB }[level],
        tag: head.tag,
        tagged: variant in tagged ? tagged[variant as keyof typeof tagged] : "none",
      }),
    );
  }

  private npPackageBody(
    heads: { type: TokenType; label: string | undefined }[],
    { gl, tag, tagged = "none" }: { gl: ParserRule; tag?: TokenType; tagged?: "none" | "optional" | "required" },
  ): void {
    this.OPTION(() => this.SUBRULE(gl, { LABEL: "gPackage" }));
    this.or(
      1,
      heads.map(({ type, label }, i) => ({ ALT: () => this.consume(i + 1, type, label ? { LABEL: label } : undefined) })),
    );
    // A `gl-` adjective leans on the next noun, so it ends this package (left-bound-adjectives.md#left-bound-adjectives).
    this.trailingAdjs(1);
    if (tag && tagged === "optional") this.OPTION3(() => this.CONSUME(tag, { LABEL: "tag" }));
    if (tag && tagged === "required") this.CONSUME2(tag, { LABEL: "tag" });
  }

  /** An as-of `/w/` and its bound, by the adjective it grades (`asOfWPair` before any plain adjective). */
  private asOfWPairs = Object.fromEntries(
    (["G", "Shareable", "GAdj", "GInList", "GInRespList", "GlZ", "GlD", "GlB", "GlTurn", "GlCitation"] as const).map((target) => [
      target,
      this.asOfWPairRule(target === "G" ? "asOfWPair" : `asOfWPair${target}`, target),
    ]),
  ) as Record<WTarget | WGroupName, ParserRule>;

  private asOfWPairRule(name: string, target: WTarget | WGroupName) {
    return this.RULE(name, () => {
      this.CONSUME(wOf("AsOf", target), { LABEL: "W" });
      // The as-of bound is a /b/ noun, never a stand-in (relations.md § as-of).
      this.OPTION(() => this.CONSUME(B));
    });
  }

  /**
   * Adjective packages, one rule per shape (each keeps its `/w/` words and hosted `/b/`):
   * - `gPackageOpen`: a plain adjective whose hosted `/b/` the adjectives after it describe; `gPackageClosed`: any other.
   *   They describe the word before them, whatever their run ({@link GAdj}).
   * - `gLone…`: an adjective unit of its own ({@link GAdj}); `gShared…` / `gPackage` (any shape): the adjective a noun
   *   join shares ({@link GShareable}).
   * - `gListItem` / `gRespItem`: an item of a joined `/ɡ/` list, where a plain adjective after its `/b/` is the next item.
   * - `glPackage`: a `gl-` adjective, which leans on the noun or call after it (left-bound-adjectives.md#left-bound-adjectives).
   */
  public gPackageOpen = this.gPackageRule("gPackageOpen", GPlain, "open");
  public gPackageClosed = this.gPackageRule("gPackageClosed", GPlain, "closed");
  public gLoneOpen = this.gPackageRule("gLoneOpen", GAdj, "open");
  public gLoneClosed = this.gPackageRule("gLoneClosed", GAdj, "closed");
  public gSharedOpen = this.gPackageRule("gSharedOpen", GShareable, "open");
  public gSharedClosed = this.gPackageRule("gSharedClosed", GShareable, "closed");
  public gListItem = this.gPackageRule("gListItem", GInList, "item");
  public gRespItem = this.gPackageRule("gRespItem", GInRespList, "item");
  public glPackageZ = this.gPackageRule("glPackageZ", GGlBefore.Z, "any");
  public glPackageD = this.gPackageRule("glPackageD", GGlBefore.D, "any");
  public glPackageB = this.gPackageRule("glPackageB", GGlBefore.B, "any");
  public glPackageTurn = this.gPackageRule("glPackageTurn", GGlBefore.Turn, "any");
  public glPackageCitation = this.gPackageRule("glPackageCitation", GGlBefore.Citation, "any");

  private gPackageRule(name: string, head: TokenType, shape: "any" | "open" | "closed" | "item") {
    return this.RULE(name, () => {
      // Plain `/w/` words, then at most one as-of pair, which more plain `/w/` words may follow.
      const target = wTargetOfHead(head);
      const asOf = this.asOfWPairs[target];
      this.MANY(() => {
        this.CONSUME(wOf("Plain", target), { LABEL: "W" });
      });
      this.OPTION(() => {
        this.SUBRULE(asOf, { LABEL: "asOfWPair" });
        this.MANY2(() => {
          this.CONSUME2(wOf("Plain", target), { LABEL: "W" });
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

  public sharedAdjOpen = this.RULE("sharedAdjOpen", () => {
    this.SUBRULE(this.gSharedOpen, { LABEL: "gPackage" });
  });

  public sharedAdjClosed = this.RULE("sharedAdjClosed", () => {
    this.SUBRULE(this.gSharedClosed, { LABEL: "gPackage" });
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

  /** An `/h/` or `/th/` scale word and what it hosts, in any shape, `Open` or `Closed` (see {@link landmarkHosted}). */
  public hScaleOpen = this.hScaleRule("hScaleOpen", "open");
  public hScaleClosed = this.hScaleRule("hScaleClosed", "closed");

  private hScaleRule(name: string, shape: "any" | "open" | "closed") {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(WBefore.HScale, { LABEL: "W" });
      });
      this.CONSUME(HScale, { LABEL: "H" });
      this.hostedOrStandIn(shape, false);
    });
  }

  /** The adverb a verb list's join shares (it covers every verb). */
  public sharedAdverb = this.RULE("sharedAdverb", () => this.SUBRULE(this.hSharedUnit, { LABEL: "hUnitRule" }));
  public sharedAdverbOpen = this.RULE("sharedAdverbOpen", () => this.SUBRULE(this.hSharedUnitOpen, { LABEL: "hUnitRule" }));
  public sharedAdverbClosed = this.RULE("sharedAdverbClosed", () => this.SUBRULE(this.hSharedUnitClosed, { LABEL: "hUnitRule" }));

  /** The shared adverb and what it hosts, as any `/h/` word takes it, in any shape, `Open` or `Closed` (see {@link landmarkHosted}). */
  public hSharedUnit = this.hSharedUnitRule("hSharedUnit", "any");
  public hSharedUnitOpen = this.hSharedUnitRule("hSharedUnitOpen", "open");
  public hSharedUnitClosed = this.hSharedUnitRule("hSharedUnitClosed", "closed");

  private hSharedUnitRule(name: string, shape: "any" | "open" | "closed") {
    return this.RULE(name, () => {
      this.MANY(() => {
        this.CONSUME(WBefore.HSharedV, { LABEL: "W" });
      });
      this.CONSUME(HSharedV, { LABEL: "H" });
      this.hostedOrStandIn(shape, false);
    });
  }
}
