import assert from "node:assert/strict";
import { test } from "node:test";

import { getLookaheadPaths, type TokenType } from "chevrotain";

import { sentenceGrammar } from "../sentence-parser.js";
import { buildCallers, firstSet } from "./all-star-lookahead.js";
import { buildATNKey, createATN } from "./atn.js";
import { alternationFirstTokens, type OptionalKind, optionalFirstTokens, ReachableTokens, ruleSites } from "./fast-first.js";

const rules = Object.values(sentenceGrammar());

function names(alts: (TokenType | undefined)[][]): string {
  return alts.map((alt) => alt.map((t) => t?.name ?? "(end)").join(",")).join(" | ");
}

/** Each optional production in the sentence grammar, as (rule, kind, occurrence). */
const sites = rules.flatMap((rule) =>
  [...ruleSites(rule).optionals.keys()].map((key) => {
    const [, kind, occurrence] = /^([A-Za-z]+?)(\d+)$/.exec(key)!;
    return { rule, kind: kind as OptionalKind, occurrence: Number(occurrence) };
  }),
);

test("optional first tokens match chevrotain's getLookaheadPaths for every decision", () => {
  assert.ok(sites.length > 1000, `only ${sites.length} optional productions found`);
  const wrong: string[] = [];
  for (const { rule, kind, occurrence } of sites) {
    const expected = getLookaheadPaths({ maxLookahead: 1, occurrence, prodType: kind, rule }).map((alt) => alt.map((path) => path[0]));
    const actual = optionalFirstTokens(rule, occurrence, kind);
    if (names(actual) !== names(expected)) wrong.push(`${rule.name} ${kind}${occurrence}\n  chevrotain: ${names(expected)}\n  memoized:   ${names(actual)}`);
  }
  assert.deepEqual(wrong.slice(0, 5), [], `${wrong.length} decisions differ`);
});

test("alternation first tokens match chevrotain's getLookaheadPaths for every OR", () => {
  const wrong: string[] = [];
  let checked = 0;
  for (const rule of rules) {
    for (const occurrence of ruleSites(rule).alternations.keys()) {
      const expected = getLookaheadPaths({ maxLookahead: 1, occurrence, prodType: "Alternation", rule }).map((alt) => alt.map((path) => path[0]));
      const actual = alternationFirstTokens(rule, occurrence);
      if (names(actual) !== names(expected)) wrong.push(`${rule.name} Alternation${occurrence}\n  chevrotain: ${names(expected)}\n  memoized:   ${names(actual)}`);
      checked++;
    }
  }
  assert.ok(checked > 100, `only ${checked} alternations found`);
  assert.deepEqual(wrong.slice(0, 5), [], `${wrong.length} alternations differ`);
});

test("reachable tokens match the strategy's firstSet for every optional decision", () => {
  const atn = createATN(rules);
  const callers = buildCallers(atn);
  const reachable = new ReachableTokens(callers);
  const sorted = (s: Set<number>) => [...s].sort((a, b) => a - b);
  let checked = 0;
  for (const { rule, kind, occurrence } of sites) {
    const state = atn.decisionMap[buildATNKey(rule, kind, occurrence)];
    assert.ok(state, `no decision state for ${rule.name} ${kind}${occurrence}`);
    for (const transition of state.transitions) {
      const where = `${rule.name} ${kind}${occurrence}`;
      assert.deepEqual(sorted(reachable.from(transition.target, false)), sorted(firstSet(transition.target)), where);
      assert.deepEqual(sorted(reachable.from(transition.target, true)), sorted(firstSet(transition.target, callers)), where);
      checked++;
    }
  }
  assert.ok(checked > 1000);
});
