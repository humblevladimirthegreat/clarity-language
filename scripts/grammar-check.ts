/**
 * Report where the sentence grammar relies on gates to pick one tree (report only; never fails).
 *
 * 1. Exports the parser's grammar as BNF with every gate deleted (src/grammar-check/bnf.ts).
 * 2. Builds canonical LR(1) tables and groups the conflicts by decision. No conflicts would prove
 *    one tree per sentence.
 * 3. Counts the gate-free trees of every doc sentence the parser accepts. More than one tree is a
 *    concrete sentence where a gate chose; zero means the export lost something the parser does
 *    in code (an `ACTION`, a rule argument), so the export is not faithful there.
 *
 * Run: npm run grammar-check -- [--json tmp/grammar-check.json] [--examples N]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { gastToBnf, showProduction } from "../src/grammar-check/bnf.js";
import { docSpans } from "../src/grammar-check/corpus.js";
import { countDerivations } from "../src/grammar-check/derivations.js";
import { buildLr1, groupConflicts } from "../src/grammar-check/lr1.js";
import { enforceTokens, enforceTones } from "../src/parse/enforce.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { parseSentenceTokens, sentenceGrammar } from "../src/parse/sentence-parser.js";
import { allTokens } from "../src/parse/tokens.js";
import { tokenizeUtterance } from "../src/parse/tokenize.js";

const args = process.argv.slice(2);
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : undefined;
const examples = args.includes("--examples") ? Number(args[args.indexOf("--examples") + 1]) : 2;

const bnf = gastToBnf(sentenceGrammar(), "document", allTokens);
console.log(`Grammar: ${bnf.nonterminals.size} nonterminals, ${bnf.productions.length} productions, ${bnf.terminals.size} token types`);

// LR(1)
const t0 = performance.now();
const lr1 = buildLr1(bnf);
const groups = groupConflicts(lr1);
console.log(`LR(1): ${lr1.states.length} states, ${lr1.conflicts.length} conflicts in ${groups.length} decisions (${Math.round(performance.now() - t0)} ms)\n`);
for (const g of groups) {
  console.log(`${g.kind} on ${[...g.lookaheads].sort().join(" ")}  (${g.states} states)`);
  for (const p of g.reduces) console.log(`  reduce ${showProduction(p)}`);
  if (g.shiftIn.length) console.log(`  shift in ${g.shiftIn.join(", ")}`);
  console.log(`  e.g. ${g.example.prefix.join(" ")} • ${g.example.lookahead}`);
}

// Doc corpus under the gate-free grammar
const tables = loadDefaultTables();
type ForkSummary = { decision: string; branches: string; sentences: number; examples: string[] };
const forks = new Map<string, ForkSummary>();
const unfaithful: string[] = [];
let parsed = 0;
let ambiguous = 0;
let cyclic = 0;
const t1 = performance.now();
for (const { file, text } of docSpans()) {
  let tokens;
  try {
    tokens = enforceTones(tokenizeUtterance(text, tables)).tokens;
    enforceTokens(tokens, tables);
    if (tokens.length === 0) continue;
    parseSentenceTokens(tokens);
  } catch {
    continue; // Rejected by the parser: nothing to compare.
  }
  parsed += 1;
  const names = [...tokens.map((t) => t.tokenType.name), "EOF"];
  const result = countDerivations(bnf, names);
  if (result.cyclic) cyclic += 1;
  if (result.count === 0) {
    unfaithful.push(`${file}: \`${text}\`  [${names.join(" ")}]`);
    continue;
  }
  if (result.count < 2) continue;
  ambiguous += 1;
  const seen = new Set<string>();
  for (const f of result.forks) {
    const branches = [...new Set(f.branches)].sort().join(" | ") + (new Set(f.branches).size < f.branches.length ? " (+ split)" : "");
    const key = `${f.lhs}  ${branches}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const summary = forks.get(key) ?? { decision: f.lhs, branches, sentences: 0, examples: [] };
    summary.sentences += 1;
    if (summary.examples.length < examples) summary.examples.push(`${file}: \`${text}\`  [${names.slice(f.start, f.end).join(" ")}]`);
    forks.set(key, summary);
  }
}
const sortedForks = [...forks.values()].sort((a, b) => b.sentences - a.sentences);
console.log(`\nDoc corpus: ${parsed} sentences the parser accepts, checked in ${Math.round(performance.now() - t1)} ms`);
console.log(`  ${parsed - ambiguous - unfaithful.length} have exactly one gate-free tree`);
console.log(`  ${ambiguous} have two or more (a gate chose); ${forks.size} distinct forks:`);
for (const f of sortedForks) {
  console.log(`  ${String(f.sentences).padStart(5)}  ${f.decision}  ${f.branches}`);
  for (const e of f.examples) console.log(`         ${e}`);
}
console.log(`  ${unfaithful.length} have none (export not faithful)${cyclic ? `; ${cyclic} hit a nullable cycle` : ""}`);
for (const u of unfaithful.slice(0, 20)) console.log(`         ${u}`);

if (jsonOut) {
  mkdirSync(dirname(jsonOut), { recursive: true });
  writeFileSync(
    jsonOut,
    JSON.stringify(
      {
        grammar: { nonterminals: bnf.nonterminals.size, productions: bnf.productions.length },
        lr1: {
          states: lr1.states.length,
          conflicts: lr1.conflicts.length,
          decisions: groups.map((g) => ({
            kind: g.kind,
            lookaheads: [...g.lookaheads].sort(),
            states: g.states,
            reduces: g.reduces.map(showProduction),
            shiftIn: g.shiftIn,
            example: `${g.example.prefix.join(" ")} • ${g.example.lookahead}`,
          })),
        },
        corpus: { parsed, ambiguous, unfaithful, forks: sortedForks },
      },
      null,
      1,
    ),
  );
}
