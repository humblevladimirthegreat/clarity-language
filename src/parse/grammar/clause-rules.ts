/** Sentence-parser rules for the document, sentences, their left edge, body clauses, clauses and clause items. */

import { EOF } from "chevrotain";
import {
  Force,
  GGlBefore,
  JoinX,
  Linker,
  Period,
  Polar,
  HookHosting,
  HookPlain,
  Vocative,
  Interjection,
  WBefore,
} from "../tokens.js";
import { type ParserRule } from "../sentence-shapes.js";
import type { GrammarParser } from "../sentence-grammar.js";
import { trailingAdjs } from "./modifier-rules.js";

export function defineClauseRules(p: GrammarParser): void {
  /** Sentences separated by periods; which sentences share an utterance is read after parsing ({@link buildUtterances}). */
  p.document = p.RULE("document", () => {
    p.SUBRULE(p.sentence);
    p.MANY(() => {
      p.CONSUME(Period);
      p.OPTION(() => {
        p.SUBRULE2(p.sentence);
      });
    });
    p.CONSUME(EOF);
  });

  /**
   * A sentence: a left edge, a body, or both. A hook at the front is glue (in the left edge) unless a `/b/` word comes
   * right after it ({@link HookHosting}), so a body with no act word before it does not open with a plain hook. After a
   * call or reaction, a plain adjective describes it (speech-moves.md#vocative), so the body does not open with one there.
   */
  p.sentence = p.RULE("sentence", () => {
    p.OR([
      {
        ALT: () => {
          p.SUBRULE(p.leftEdgeForce, { LABEL: "leftEdge" });
          // A reply turn may be one citation phrase (`yal azozon.`, questions.md#fill-ask).
          p.OPTION(() =>
            p.OR6([
              { ALT: () => p.SUBRULE(p.bodyClause, { LABEL: "edgeBody" }) },
              { ALT: () => p.SUBRULE2(p.citation, { LABEL: "fragment" }) },
            ]),
          );
        },
      },
      {
        ALT: () => {
          p.SUBRULE2(p.leftEdgeTurn, { LABEL: "leftEdge" });
          p.OPTION2(() => p.SUBRULE2(p.bodyClauseAfterTurn, { LABEL: "edgeBody" }));
        },
      },
      {
        ALT: () => {
          p.SUBRULE3(p.leftEdgeOther, { LABEL: "leftEdge" });
          p.OPTION3(() => p.SUBRULE3(p.bodyClauseNoGlue, { LABEL: "edgeBody" }));
        },
      },
      { ALT: () => p.SUBRULE5(p.leftEdgeTag, { LABEL: "leftEdge" }) },
      { ALT: () => p.SUBRULE4(p.bodyClauseNoGlue, { LABEL: "bodyClause" }) },
      // One citation phrase is a sentence of its own: a fill answer, a greeting, a name (questions.md#fill-ask).
      { ALT: () => p.SUBRULE(p.citation, { LABEL: "fragment" }) },
    ]);
  });

  /**
   * A call (or a greeting bid) or a reaction, with what describes it: a `gl-` adjective before it, `/w/` right before it,
   * and plain `/ɡ/` words after it (`yohun galuden`, `glelavam yezul`, `welavam yezum`; more-turn-words.md#describe-turn-word).
   */
  p.turnWord = p.RULE("turnWord", () => {
    p.OPTION(() => p.SUBRULE(p.glPackageTurn, { LABEL: "glAdj" }));
    p.MANY(() => {
      p.CONSUME(WBefore.Turn, { LABEL: "W" });
    });
    p.OR([{ ALT: () => p.CONSUME(Vocative) }, { ALT: () => p.CONSUME(Interjection) }]);
    trailingAdjs(p, 5);
  });

  /**
   * The left edge, by how it ends: with an act word (`Force`, any body may follow), with a call or reaction (`Turn`),
   * or with a polar or glue hook (`Other`). Each item is a call or reaction, a polar, or a glue hook.
   */
  p.leftEdgeForce = leftEdgeRule(p, "leftEdgeForce", "force");

  p.leftEdgeTurn = leftEdgeRule(p, "leftEdgeTurn", "turn");

  p.leftEdgeOther = leftEdgeRule(p, "leftEdgeOther", "other");

  /**
   * A check-back (`yel yael.`, `yem yaol.`; polar-inventory.md#check-backs): an act word (or a force pair) and polar words, a turn
   * of its own with no body. Enforce allows one polar word.
   */
  p.leftEdgeTag = p.RULE("leftEdgeTag", () => {
    p.OPTION(() => p.CONSUME(Force, { LABEL: "LeadForce" }));
    p.CONSUME2(Force);
    p.AT_LEAST_ONE(() => p.CONSUME(Polar));
  });

  /**
   * A sentence body. Its first clause opens as the sentence before it allows (see {@link sentence}): any way after an
   * act word (`bodyClause`), with no plain hook (`NoGlue`), or with neither a plain hook nor a plain adjective
   * (`AfterTurn`). After a topic word or a cross-period join, the clause opens any way.
   */
  p.bodyClause = bodyClauseRule(p, "bodyClause", "any");

  p.bodyClauseNoGlue = bodyClauseRule(p, "bodyClauseNoGlue", "noGlue");

  p.bodyClauseAfterTurn = bodyClauseRule(p, "bodyClauseAfterTurn", "afterTurn");

  /**
   * `/x/` joins go between clauses: item, join, item, … (joins.md § clause joins). A join word with no clause before
   * it is a clause item of its own (`xam xar`). A join with nothing after it parses, so its check can name the rule.
   * After a cross-period join the first clause opens with neither a hook nor an `/x/` word: a sentence-initial `/x/`
   * before those is a clause of its own (`xual ul …`).
   */
  p.clause = clauseRule(p, "clause", () => p.SUBRULE(p.clauseItem));

  p.clauseNoGlue = clauseRule(p, "clauseNoGlue", () => p.SUBRULE(p.clauseItemNoGlue, { LABEL: "clauseItem" }));

  p.clauseAfterTurn = clauseRule(p, "clauseAfterTurn", () => p.SUBRULE(p.clauseItemAfterTurn, { LABEL: "clauseItem" }));

  p.clauseAfterCross = clauseRule(p, "clauseAfterCross", () =>
    p.SUBRULE(p.clauseItemAfterCross, { LABEL: "clauseItem" }),
  );

  p.clauseItemAfterCross = p.RULE("clauseItemAfterCross", () => {
    p.SUBRULE(p.unitAfterCross, { LABEL: "unit" });
  });

  /** A join and the clause items after it, right-recursive (read back by `clauseParts`): the last join may end the clause. */
  p.clauseRest = p.RULE("clauseRest", () => {
    p.CONSUME(JoinX, { LABEL: "midJoin" });
    p.OPTION(() => {
      p.SUBRULE(p.clauseItem);
      p.OPTION2(() => p.SUBRULE(p.clauseRest));
    });
  });

  /**
   * A clause, or a standalone `/x/` word as a stand-in clause (optionally `xual ul …` with a hook). The first item of a
   * body opens as {@link bodyClause} allows (`NoGlue`, `AfterTurn`).
   */
  p.clauseItem = clauseItemRule(p, "clauseItem", () => p.unit);

  p.clauseItemNoGlue = clauseItemRule(p, "clauseItemNoGlue", () => p.unitNoGlue);

  p.clauseItemAfterTurn = clauseItemRule(p, "clauseItemAfterTurn", () => p.unitAfterTurn);
}

function leftEdgeRule(p: GrammarParser, name: string, ending: "force" | "turn" | "other") {
  const rule: ParserRule = p.RULE(name, () => {
    // A hook that glues the sentence to prior talk, after any `/w/` that details it (hooks.md#discourse-hooks).
    const glue = (k: number) => {
      p.many(k + 10, () => p.consume(k + 10, WBefore.HookPlain, { LABEL: "W" }));
      p.consume(k + 10, HookPlain, { LABEL: "Hook" });
    };
    // Right-recursive (read back by `flattenEdge`): which item is the last one shows only after it.
    const item = {
      ALT: () => {
        p.or(1, [
          { ALT: () => p.subrule(1, p.turnWord) },
          { ALT: () => p.consume(1, Polar) },
          { ALT: () => glue(1) },
        ]);
        p.subrule(2, rule, { LABEL: "leftEdgeRest" });
      },
    };
    const last = {
      turn: { ALT: () => p.subrule(3, p.turnWord) },
      other: {
        ALT: () => p.or(4, [{ ALT: () => p.consume(4, Polar) }, { ALT: () => glue(4) }]),
      },
      // An act word, or two stacked act words (`yul yul`, `yel yol`): any pair; a third is a new turn (more-turn-words.md#stacked-acts).
      force: {
        ALT: () => {
          p.option(5, () => p.consume(5, Force, { LABEL: "LeadForce" }));
          p.consume(6, Force);
        },
      },
    }[ending];
    p.OR([item, last]);
  });
  return rule;
}

function bodyClauseRule(p: GrammarParser, name: string, opening: "any" | "noGlue" | "afterTurn") {
  return p.RULE(name, () => {
    const first = { any: p.clause, noGlue: p.clauseNoGlue, afterTurn: p.clauseAfterTurn }[opening];
    // Sentence-initial clause join before a clause: joins the prior sentence to this whole one (joins.md § clause joins).
    const crossOrClause = (k: number, clause: ParserRule) =>
      p.or(k, [
        {
          ALT: () => {
            p.consume(k, JoinX, { LABEL: "crossJoin" });
            p.subrule(k, p.clauseAfterCross, { LABEL: "clause" });
          },
        },
        { ALT: () => p.subrule(k, clause, { LABEL: "clause" }) },
      ]);
    p.OR([
      {
        ALT: () => {
          // A mention marker before a topic span (`glelel x[udozo] …`, spans-as-words.md#mention).
          p.OPTION4(() => p.CONSUME(GGlBefore.Linker, { LABEL: "topicMarker" }));
          p.CONSUME(Linker);
          // A topic word, or a marked topic span, may be the whole sentence (`xazawan.`, `glelel x[udozo].`; topic.md#topic).
          p.OPTION5(() => crossOrClause(2, p.clause));
        },
      },
      { ALT: () => crossOrClause(3, first) },
    ]);
  });
}

function clauseRule(p: GrammarParser, name: string, first: () => void) {
  return p.RULE(name, () => {
    first();
    p.OPTION(() => p.SUBRULE(p.clauseRest));
  });
}

function clauseItemRule(p: GrammarParser, name: string, unit: () => ParserRule) {
  return p.RULE(name, () => {
    p.OR([
      {
        ALT: () => {
          p.CONSUME(JoinX, { LABEL: "standIn" });
          // `xual ul …`: a hook after the stand-in clause (joins.md#clause-joins).
          p.OPTION(() => p.SUBRULE(p.hookChain, { LABEL: "unit" }));
        },
      },
      {
        ALT: () => {
          p.SUBRULE2(unit(), { LABEL: "unit" });
        },
      },
    ]);
  });
}
