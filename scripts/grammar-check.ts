/**
 * Check that the sentence grammar gives every input at most one tree. It reports each finding and fails (exit 1) on any of: a `GATE` or `IGNORE_AMBIGUITIES` in sentence-parser.ts, a nullable symbol with two empty derivations, an
 * LR(1) conflict, a doc sentence with two gate-free trees or none, or an ALL(*) ambiguity report.
 *
 * 1. Exports the parser's grammar as BNF with every gate deleted (src/grammar-check/bnf.ts).
 * 2. Removes empty productions (src/grammar-check/normalize.ts; each nullable symbol must be empty in one way, so no
 *    tree count changes), builds canonical LR(1) tables, and groups the conflicts by decision. No conflicts proves one
 *    tree per input over the token types `markContext` assigns.
 * 3. Counts the gate-free trees of every doc sentence the parser accepts. More than one tree is a
 *    concrete sentence where a gate chose; zero means the export lost something the parser does
 *    in code (an `ACTION`, a rule argument), so the export is not faithful there.
 *
 * 4. Lists the ALL(*) ambiguity reports the parser collected over the doc corpus: decisions whose
 *    alternatives the token types alone do not separate, so a gate or payload check decides.
 *
 * 5. With `--variants`, does step 3 over each doc span with one word deleted or two neighboring words swapped, and
 *    also lists inputs the parser rejects that the gate-free grammar accepts: a gate (or a check after parsing)
 *    rejected them.
 *
 * Run: npm run grammar-check -- [--json tmp/grammar-check.json] [--examples N] [--no-lr1] [--variants]
 * (`--no-lr1` skips the LR(1) build for a quicker doc-corpus pass; it then proves nothing.)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { gastToBnf, showProduction } from "../src/grammar-check/bnf.js";
import { docSpans, spanVariants } from "../src/grammar-check/corpus.js";
import { countDerivations } from "../src/grammar-check/derivations.js";
import { buildLr1, groupConflicts } from "../src/grammar-check/lr1.js";
import { eliminateEmpty, emptyDerivations } from "../src/grammar-check/normalize.js";
import { enforceTokens, enforceTones } from "../src/parse/enforce.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { markContext, parseSentenceTokens, SentenceParseError, sentenceGrammar, takeAmbiguityReports } from "../src/parse/sentence-parser.js";
import { allTokens } from "../src/parse/tokens.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import { tokenizeUtterance } from "../src/parse/tokenize.js";

const args = process.argv.slice(2);
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : undefined;
const examples = args.includes("--examples") ? Number(args[args.indexOf("--examples") + 1]) : 2;
const skipLr1 = args.includes("--no-lr1");
const withVariants = args.includes("--variants");

// Gates: the grammar must decide by structure and token types, so no gate may choose a tree.
const parserSource = readFileSync(join(REPO_ROOT, "src", "parse", "sentence-parser.ts"), "utf8");
const gateSites = (parserSource.match(/\bGATE\b|IGNORE_AMBIGUITIES/g) ?? []).length;
console.log(`GATE / IGNORE_AMBIGUITIES sites in sentence-parser.ts: ${gateSites}`);

const bnf = gastToBnf(sentenceGrammar(), "document", allTokens);
console.log(`Grammar: ${bnf.nonterminals.size} nonterminals, ${bnf.productions.length} productions, ${bnf.terminals.size} token types`);

// Empty runs: each must be empty in one way, so removing them keeps every tree count (normalize.ts).
const emptyTwice = [...emptyDerivations(bnf)].filter(([, n]) => n > 1).map(([symbol]) => symbol);
console.log(`Nullable symbols with two ways to be empty: ${emptyTwice.length}${emptyTwice.length ? ` (${emptyTwice.join(", ")})` : ""}`);

// LR(1), on the grammar with its empty productions removed
const t0 = performance.now();
const lr1 = skipLr1 ? undefined : buildLr1(eliminateEmpty(bnf));
const groups = lr1 ? groupConflicts(lr1) : [];
if (lr1) console.log(`LR(1): ${lr1.states} states, ${lr1.conflicts.length} conflicts in ${groups.length} decisions (${Math.round(performance.now() - t0)} ms)\n`);
for (const g of groups) {
  console.log(`${g.kind} on ${[...g.lookaheads].sort().join(" ")}  (${g.states} states)`);
  for (const p of g.reduces) console.log(`  reduce ${showProduction(p)}`);
  if (g.shiftIn.length) console.log(`  shift in ${g.shiftIn.join(", ")}`);
  console.log(`  e.g. ${g.example.prefix.join(" ")} • ${g.example.lookahead}`);
}

// Doc corpus (and, with --variants, inputs beyond it) under the gate-free grammar
const tables = loadDefaultTables();
takeAmbiguityReports(); // Start from a clean list.
type ForkSummary = { decision: string; branches: string; sentences: number; examples: string[] };
type RejectSummary = { message: string; inputs: number; examples: string[] };

/**
 * Compare the parser with the gate-free grammar over `spans`. A span the parser accepts with two or more gate-free
 * trees is one where a gate chose. A span the parser rejects (past tokenizing and the token checks) that the gate-free
 * grammar accepts is one that a gate, or a check after parsing, rejected.
 */
function checkSpans(spans: { file: string; text: string }[]) {
  const forks = new Map<string, ForkSummary>();
  const rejects = new Map<string, RejectSummary>();
  const unfaithful: string[] = [];
  let parsed = 0;
  let ambiguous = 0;
  let cyclic = 0;
  for (const { file, text } of spans) {
    let tokens;
    try {
      tokens = enforceTones(tokenizeUtterance(text, tables)).tokens;
      enforceTokens(tokens, tables);
      if (tokens.length === 0) continue;
    } catch {
      continue; // Rejected before parsing: nothing to compare.
    }
    let error: unknown;
    try {
      parseSentenceTokens(tokens);
    } catch (e) {
      error = e;
    }
    const names = [...markContext(tokens).map((t) => t.tokenType.name), "EOF"];
    const result = countDerivations(bnf, names);
    if (error !== undefined) {
      if (result.count === 0) continue; // The gate-free grammar rejects it too.
      const raw = error instanceof Error ? error.message : String(error);
      const message = error instanceof SentenceParseError ? `parse: ${raw.replace(/'[^']*'/g, "'…'").slice(0, 120)}` : `after parse: ${raw.split(" — ")[0]!.replace(/^[^:]*: /, "")}`;
      const summary = rejects.get(message) ?? { message, inputs: 0, examples: [] };
      summary.inputs += 1;
      if (summary.examples.length < examples) summary.examples.push(`${file}: \`${text}\`  [${names.join(" ")}]`);
      rejects.set(message, summary);
      continue;
    }
    parsed += 1;
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
  return {
    parsed,
    ambiguous,
    cyclic,
    unfaithful,
    forks: [...forks.values()].sort((a, b) => b.sentences - a.sentences),
    rejects: [...rejects.values()].sort((a, b) => b.inputs - a.inputs),
  };
}

function report(label: string, r: ReturnType<typeof checkSpans>, ms: number, showRejects: boolean): void {
  console.log(`\n${label}: ${r.parsed} the parser accepts, checked in ${Math.round(ms)} ms`);
  console.log(`  ${r.parsed - r.ambiguous - r.unfaithful.length} have exactly one gate-free tree`);
  console.log(`  ${r.ambiguous} have two or more (a gate chose); ${r.forks.length} distinct forks:`);
  for (const f of r.forks) {
    console.log(`  ${String(f.sentences).padStart(5)}  ${f.decision}  ${f.branches}`);
    for (const e of f.examples) console.log(`         ${e}`);
  }
  console.log(`  ${r.unfaithful.length} have none (export not faithful)${r.cyclic ? `; ${r.cyclic} hit a nullable cycle` : ""}`);
  for (const u of r.unfaithful.slice(0, 20)) console.log(`         ${u}`);
  if (!showRejects) return;
  const total = r.rejects.reduce((n, x) => n + x.inputs, 0);
  console.log(`  ${total} the parser rejects but the gate-free grammar accepts (a gate or a later check rejected), by message:`);
  for (const x of r.rejects) {
    console.log(`  ${String(x.inputs).padStart(5)}  ${x.message}`);
    for (const e of x.examples) console.log(`         ${e}`);
  }
}

const t1 = performance.now();
const corpus = checkSpans(docSpans());
report("Doc corpus", corpus, performance.now() - t1, false);
const { parsed, ambiguous, unfaithful } = corpus;
const sortedForks = corpus.forks;
let variantResult: ReturnType<typeof checkSpans> | undefined;
if (withVariants) {
  const t2 = performance.now();
  const spans = spanVariants(docSpans(), ["drop", "swap"]);
  variantResult = checkSpans(spans);
  report(`Variants (${spans.length}, one word deleted or two swapped)`, variantResult, performance.now() - t2, true);
}

// ALL(*) runtime reports, one per decision and first sentence that reached it
const ambiguityReports = takeAmbiguityReports();
console.log(`\nALL(*) ambiguity reports on the doc corpus${withVariants ? " and variants" : ""}: ${ambiguityReports.length}`);
for (const r of ambiguityReports) console.log(`  ${compactReport(r)}`);

{
  const failures = [
    gateSites > 0 && `${gateSites} GATE / IGNORE_AMBIGUITIES sites`,
    emptyTwice.length > 0 && `${emptyTwice.length} nullable symbols with two ways to be empty`,
    lr1 && lr1.conflicts.length > 0 && `${lr1.conflicts.length} LR(1) conflicts in ${groups.length} decisions`,
    ambiguous > 0 && `${ambiguous} doc sentences with two or more trees`,
    unfaithful.length > 0 && `${unfaithful.length} doc sentences the export rejects`,
    variantResult && variantResult.ambiguous > 0 && `${variantResult.ambiguous} variants with two or more trees`,
    ambiguityReports.length > 0 && `${ambiguityReports.length} ALL(*) ambiguity reports`,
  ].filter(Boolean);
  console.log(
    failures.length ? `\nFailed: ${failures.join("; ")}` : `\nPassed: one tree per input${skipLr1 ? " (LR(1) skipped, so not proved)" : ""}.`,
  );
  if (failures.length) process.exitCode = 1;
}

if (jsonOut) {
  mkdirSync(dirname(jsonOut), { recursive: true });
  writeFileSync(
    jsonOut,
    JSON.stringify(
      {
        grammar: { nonterminals: bnf.nonterminals.size, productions: bnf.productions.length },
        lr1: lr1 && {
          states: lr1.states,
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
        variants: variantResult,
        ambiguityReports,
      },
      null,
      1,
    ),
  );
}

/** `gPackage.MANY  alts 0 1  on W G V` from allstar's long message (its alt list repeats per path). */
function compactReport(message: string): string {
  const flat = message.replace(/\s+/g, " ").trim();
  const m = /<([\d, ]+)> in <(\w+)> inside <(\w+)> Rule, <([^>]*)>/.exec(flat);
  if (!m) return flat;
  const alts = [...new Set(m[1]!.split(", "))].join(" ");
  return `${m[3]}.${m[2]}  alts ${alts}  on ${m[4]!.split(", ").join(" ")}`;
}
