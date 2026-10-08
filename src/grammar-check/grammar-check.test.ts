import assert from "node:assert/strict";
import { test } from "node:test";

import { createToken, CstParser, EOF } from "chevrotain";
import { LLStarLookaheadStrategy } from "chevrotain-allstar";

import { type Bnf, gastToBnf, type Production } from "./bnf.js";
import { spanVariants } from "./corpus.js";
import { countDerivations } from "./derivations.js";
import { buildLr1, groupConflicts } from "./lr1.js";

function bnf(start: string, rules: Record<string, string[][]>): Bnf {
  const productions: Production[] = [];
  for (const [lhs, alts] of Object.entries(rules)) {
    alts.forEach((rhs, i) => productions.push({ id: productions.length, lhs, rhs, branch: `alt ${i}` }));
  }
  const nonterminals = new Set(Object.keys(rules));
  const terminals = new Set(productions.flatMap((p) => p.rhs).filter((s) => !nonterminals.has(s)));
  const byLhs = new Map<string, Production[]>();
  for (const p of productions) byLhs.set(p.lhs, [...(byLhs.get(p.lhs) ?? []), p]);
  return { start, productions, byLhs, terminals, nonterminals };
}

// Dangling else: `if c if c x else x` has two trees.
const danglingElse = bnf("S", {
  S: [["if", "c", "S"], ["if", "c", "S", "else", "S"], ["x"]],
});

test("LR(1) flags the dangling else as one shift/reduce decision", () => {
  const groups = groupConflicts(buildLr1(danglingElse));
  assert.equal(groups.length, 1);
  assert.equal(groups[0]!.kind, "shift/reduce");
  assert.deepEqual([...groups[0]!.lookaheads], ["else"]);
});

test("derivation count finds both dangling-else trees and the fork", () => {
  const result = countDerivations(danglingElse, ["if", "c", "if", "c", "x", "else", "x"]);
  assert.equal(result.count, 2);
  assert.equal(result.forks[0]!.lhs, "S");
  assert.equal(countDerivations(danglingElse, ["if", "c", "x", "else", "x"]).count, 1);
  assert.equal(countDerivations(danglingElse, ["else"]).count, 0);
});

test("an unambiguous list grammar has no conflicts", () => {
  const list = bnf("L", { L: [["a", "T"]], T: [[], [",", "a", "T"]] });
  assert.equal(buildLr1(list).conflicts.length, 0);
  assert.equal(countDerivations(list, ["a", ",", "a"]).count, 1);
});

test("two optional runs of the same token split one run two ways", () => {
  // The `W* (asOf)? W*` shape: with no as-of pair, `W W G` splits its W run three ways.
  const runs = bnf("P", { P: [["A", "B", "g"]], A: [[], ["w", "A"]], B: [[], ["w", "B"]] });
  assert.ok(buildLr1(runs).conflicts.length > 0);
  const result = countDerivations(runs, ["w", "w", "g"]);
  assert.equal(result.count, 2);
  assert.deepEqual(result.forks.map((f) => f.lhs), ["P"]);
});

test("gastToBnf names decisions after the rule and DSL call", () => {
  const A = createToken({ name: "A" });
  const B = createToken({ name: "B" });
  class Toy extends CstParser {
    constructor() {
      super([A, B]);
      this.performSelfAnalysis();
    }
    public top = this.RULE("top", () => {
      this.MANY(() => this.CONSUME(A));
      this.OPTION2(() => this.CONSUME(B));
      this.CONSUME(EOF);
    });
  }
  const grammar = gastToBnf(new Toy().getGAstProductions(), "top", [A, B]);
  assert.deepEqual(grammar.byLhs.get("top")![0]!.rhs, ["top.MANY", "top.OPTION2", "EOF"]);
  assert.deepEqual(grammar.byLhs.get("top.MANY")!.map((p) => p.branch), ["stop", "repeat"]);
  assert.equal(buildLr1(grammar).conflicts.length, 0);
});

test("gastToBnf expands a token category into its members, with no reduction between", () => {
  const W = createToken({ name: "W" });
  const WPlain = createToken({ name: "WPlain", categories: [W] });
  const WAsOf = createToken({ name: "WAsOf", categories: [W] });
  const G = createToken({ name: "G" });
  const H = createToken({ name: "H" });
  class Toy extends CstParser {
    constructor() {
      super([W, WPlain, WAsOf, G, H], { lookaheadStrategy: new LLStarLookaheadStrategy() });
      this.performSelfAnalysis();
    }
    public top = this.RULE("top", () => {
      this.OR([{ ALT: () => this.SUBRULE(this.adj) }, { ALT: () => this.SUBRULE(this.adv) }]);
      this.CONSUME(EOF);
    });
    public adj = this.RULE("adj", () => {
      this.MANY(() => this.CONSUME(WPlain));
      this.CONSUME(G);
    });
    public adv = this.RULE("adv", () => {
      this.MANY(() => this.CONSUME(W));
      this.CONSUME(H);
    });
  }
  const grammar = gastToBnf(new Toy().getGAstProductions(), "top", [W, WPlain, WAsOf, G, H]);
  assert.deepEqual(grammar.byLhs.get("adv.MANY")!.map((p) => p.rhs), [[], ["WPlain", "adv.MANY"], ["WAsOf", "adv.MANY"]]);
  assert.ok(!grammar.nonterminals.has("W*"));
  assert.equal(countDerivations(grammar, ["WPlain", "WAsOf", "H", "EOF"]).count, 1);
});

test("span variants drop one word or swap two neighbors, keep the period, and skip doc spans", () => {
  const spans = [
    { file: "a.md", text: "za vo da." },
    { file: "a.md", text: "vo da." },
  ];
  assert.deepEqual(
    spanVariants(spans, ["drop", "swap"]).map((s) => s.text),
    ["za da.", "za vo.", "da.", "vo.", "vo za da.", "za da vo.", "da vo."],
  );
});
