import { CstParser, type IToken } from "chevrotain";
import { LLStarLookaheadStrategy } from "./allstar/all-star-lookahead.js";
import { allTokens, type WGroupName, type WTarget } from "./tokens.js";
import { ambiguityReports, errorMessageProvider, type NpSlot, type ParserRule } from "./sentence-shapes.js";
import type { npRules } from "./grammar/np-rules.js";
import { defineClauseRules } from "./grammar/clause-rules.js";
import { defineUnitRules } from "./grammar/unit-rules.js";
import { defineNpRules } from "./grammar/np-rules.js";
import { defineVpRules } from "./grammar/vp-rules.js";
import { defineModifierRules } from "./grammar/modifier-rules.js";
import { definePackageRules } from "./grammar/package-rules.js";

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
    defineClauseRules(this.dsl);
    defineUnitRules(this.dsl);
    defineNpRules(this.dsl);
    defineVpRules(this.dsl);
    defineModifierRules(this.dsl);
    definePackageRules(this.dsl);
    this.performSelfAnalysis();
  }

  /** The rule definers' view of this parser: its rule fields and the `CstParser` DSL methods they call (protected there). */
  public get dsl(): GrammarParser {
    return this as unknown as GrammarParser;
  }

  public document!: ParserRule;
  public sentence!: ParserRule;
  public turnWord!: ParserRule;
  public leftEdgeForce!: ParserRule;
  public leftEdgeTurn!: ParserRule;
  public leftEdgeOther!: ParserRule;
  public leftEdgeTag!: ParserRule;
  public bodyClause!: ParserRule;
  public bodyClauseNoGlue!: ParserRule;
  public bodyClauseAfterTurn!: ParserRule;
  public clause!: ParserRule;
  public clauseNoGlue!: ParserRule;
  public clauseAfterTurn!: ParserRule;
  public clauseAfterCross!: ParserRule;
  public clauseItemAfterCross!: ParserRule;
  public clauseRest!: ParserRule;
  public clauseItem!: ParserRule;
  public clauseItemNoGlue!: ParserRule;
  public clauseItemAfterTurn!: ParserRule;
  public unit!: ParserRule;
  public unitAfterCross!: ParserRule;
  public unitNoGlue!: ParserRule;
  public unitAfterTurn!: ParserRule;
  public unitOpen!: ParserRule;
  public unitAfterZ!: ParserRule;
  public unitAfterZOpen!: ParserRule;
  public unitAfterZShared!: ParserRule;
  public unitAfterZBare!: ParserRule;
  public unitAfterD!: ParserRule;
  public unitAfterDOpen!: ParserRule;
  public unitAfterDShared!: ParserRule;
  public unitAfterDBare!: ParserRule;
  public unitAfterB!: ParserRule;
  public unitAfterBOpen!: ParserRule;
  public unitAfterBShared!: ParserRule;
  public unitAfterBBare!: ParserRule;
  public unitAfterZFree!: ParserRule;
  public unitAfterZFreeOpen!: ParserRule;
  public unitAfterZFreeShared!: ParserRule;
  public unitAfterZFreeBare!: ParserRule;
  public unitAfterDFree!: ParserRule;
  public unitAfterDFreeOpen!: ParserRule;
  public unitAfterDFreeShared!: ParserRule;
  public unitAfterDFreeBare!: ParserRule;
  public unitAfterBFree!: ParserRule;
  public unitAfterBFreeOpen!: ParserRule;
  public unitAfterBFreeShared!: ParserRule;
  public unitAfterBFreeBare!: ParserRule;
  public unitAfterV!: ParserRule;
  public unitAfterVOpen!: ParserRule;
  public unitAfterG!: ParserRule;
  public unitAfterGOpen!: ParserRule;
  public unitAfterH!: ParserRule;
  public unitAfterHOpen!: ParserRule;
  public hookChain!: ParserRule;
  public islandUnit!: ParserRule;
  public citation!: ParserRule;
  public npSets!: Record<NpSlot, ReturnType<typeof npRules>>;
  public vpCoord!: ParserRule;
  public vpTailAfterEndClosed!: ParserRule;
  public vpTailAfterMoreClosed!: ParserRule;
  public vpCoordPartFirstEndClosed!: ParserRule;
  public vpCoordPartFirstMore!: ParserRule;
  public vpCoordPartAloneEndClosed!: ParserRule;
  public vpCoordPartAloneMore!: ParserRule;
  public vpCoordPartEndClosed!: ParserRule;
  public vpCoordPartMore!: ParserRule;
  public vpVerb!: ParserRule;
  public vpItemsStart!: ParserRule;
  public vpItemsAfterD!: ParserRule;
  public vpItemsAfterB!: ParserRule;
  public vpItemsAfterH!: ParserRule;
  public vpItemsAfterHook!: ParserRule;
  public vpItemUnitD!: ParserRule;
  public vpItemUnitB!: ParserRule;
  public vpItemUnitH!: ParserRule;
  public vpItemUnitHook!: ParserRule;
  public vpItemUnitHSingle!: ParserRule;
  public vJoinCloseEndClosed!: ParserRule;
  public vJoinCloseMore!: ParserRule;
  public gCoord!: ParserRule;
  public gCoordLead!: ParserRule;
  public gCoordJoinLead!: ParserRule;
  public gCoordPlainLead!: ParserRule;
  public gCoordPart!: ParserRule;
  public gCoordPartPlain!: ParserRule;
  public gCoordPartLead!: ParserRule;
  public gCoordPartJoin!: ParserRule;
  public gSingleOpen!: ParserRule;
  public gSingleClosed!: ParserRule;
  public gJoinClose!: ParserRule;
  public gJoinCloseRespectively!: ParserRule;
  public hCoord!: ParserRule;
  public hCoordPart!: ParserRule;
  public hSingle!: ParserRule;
  public hSingleOpen!: ParserRule;
  public hSingleClosed!: ParserRule;
  public hGrounds!: ParserRule;
  public hJoinClose!: ParserRule;
  public hUnitRule!: ParserRule;
  public hUnitOpen!: ParserRule;
  public hUnitClosed!: ParserRule;
  public barUnit!: ParserRule;
  public fenceBarUnit!: ParserRule;
  public barsGrounds!: ParserRule;
  public barStandIn!: ParserRule;
  public hStandIn!: ParserRule;
  public trailingAdjRun!: ParserRule;
  public hookUnitPlain!: ParserRule;
  public hookUnitOpen!: ParserRule;
  public hookUnitClosed!: ParserRule;
  public zoneUnitOpen!: ParserRule;
  public zoneUnitClosed!: ParserRule;
  public sameRolePair!: ParserRule;
  public asOfWPairs!: Record<WTarget | WGroupName, ParserRule>;
  public gPackageOpen!: ParserRule;
  public gPackageClosed!: ParserRule;
  public gLoneOpen!: ParserRule;
  public gLoneClosed!: ParserRule;
  public gSharedOpen!: ParserRule;
  public gSharedClosed!: ParserRule;
  public gListItem!: ParserRule;
  public gRespItem!: ParserRule;
  public glPackageZ!: ParserRule;
  public glPackageD!: ParserRule;
  public glPackageB!: ParserRule;
  public glPackageTurn!: ParserRule;
  public glPackageCitation!: ParserRule;
  public boundJoinTail!: ParserRule;
  public sharedAdjOpen!: ParserRule;
  public sharedAdjClosed!: ParserRule;
  public sharedScale!: ParserRule;
  public sharedScaleOpen!: ParserRule;
  public hScaleOpen!: ParserRule;
  public hScaleClosed!: ParserRule;
}

/** The parser as the rule definers in `grammar/` see it: its public members plus the DSL methods they call. */
export type GrammarParser = Pick<AgebenSentenceParser, keyof AgebenSentenceParser> & {
  AT_LEAST_ONE: CstParser["AT_LEAST_ONE"];
  AT_LEAST_ONE2: CstParser["AT_LEAST_ONE2"];
  CONSUME: CstParser["CONSUME"];
  CONSUME2: CstParser["CONSUME2"];
  CONSUME3: CstParser["CONSUME3"];
  MANY: CstParser["MANY"];
  MANY2: CstParser["MANY2"];
  MANY3: CstParser["MANY3"];
  OPTION: CstParser["OPTION"];
  OPTION2: CstParser["OPTION2"];
  OPTION3: CstParser["OPTION3"];
  OPTION4: CstParser["OPTION4"];
  OPTION5: CstParser["OPTION5"];
  OPTION9: CstParser["OPTION9"];
  OR: CstParser["OR"];
  OR2: CstParser["OR2"];
  OR6: CstParser["OR6"];
  RULE: CstParser["RULE"];
  SUBRULE: CstParser["SUBRULE"];
  SUBRULE2: CstParser["SUBRULE2"];
  SUBRULE3: CstParser["SUBRULE3"];
  SUBRULE4: CstParser["SUBRULE4"];
  SUBRULE5: CstParser["SUBRULE5"];
  SUBRULE6: CstParser["SUBRULE6"];
  SUBRULE7: CstParser["SUBRULE7"];
  consume: CstParser["consume"];
  many: CstParser["many"];
  option: CstParser["option"];
  or: CstParser["or"];
  subrule: CstParser["subrule"];
};
