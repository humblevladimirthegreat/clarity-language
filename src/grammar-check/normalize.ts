/**
 * Remove empty productions from a {@link Bnf} without changing how many trees any input has.
 *
 * The export turns every `MANY` and `OPTION` into a nullable nonterminal, so an LR(1) table built straight from it
 * has to reduce an empty run before it has seen the word that tells two runs apart (the `/w/` run before an adjective
 * or before an adverb). That is a limit of one token of lookahead on this encoding, not a second tree. The standard
 * fix is ε-elimination: each production that holds nullable symbols is copied once for each subset of them left out,
 * and the empty productions are dropped.
 *
 * Trees of the new grammar correspond one to one with trees of the old one (delete the empty subtrees) exactly when
 * every nullable nonterminal derives the empty string in **one** way. {@link emptyDerivations} checks that; a
 * nullable symbol with two empty derivations is an ambiguity of its own and is reported as one.
 */
import { type Bnf, type Production } from "./bnf.js";
import { grammarSets } from "./lr1.js";

/** A production of the normalized grammar, with the export's production it was copied from. */
export type NormalizedProduction = Production & { source: Production };

/** For each nullable nonterminal, how many ways it derives the empty string (saturating at 2; a cycle counts as 2). */
export function emptyDerivations(bnf: Bnf): Map<string, number> {
  const { nullable } = grammarSets(bnf);
  const memo = new Map<string, number>();
  const busy = new Set<string>();
  const count = (symbol: string): number => {
    if (!nullable.has(symbol)) return 0;
    const known = memo.get(symbol);
    if (known !== undefined) return known;
    if (busy.has(symbol)) return 2;
    busy.add(symbol);
    let total = 0;
    for (const p of bnf.byLhs.get(symbol) ?? []) {
      let ways = 1;
      for (const s of p.rhs) ways = Math.min(2, ways * count(s));
      total = Math.min(2, total + ways);
    }
    busy.delete(symbol);
    memo.set(symbol, total);
    return total;
  };
  return new Map([...nullable].map((n) => [n, count(n)]));
}

export function eliminateEmpty(bnf: Bnf): Bnf & { productions: NormalizedProduction[] } {
  const { nullable } = grammarSets(bnf);
  if (nullable.has(bnf.start)) throw new Error(`start symbol ${bnf.start} derives the empty string`);
  let productions: NormalizedProduction[] = [];
  for (const p of bnf.productions) {
    const optional = p.rhs.flatMap((s, i) => (nullable.has(s) ? [i] : []));
    for (let mask = 0; mask < 1 << optional.length; mask++) {
      const drop = new Set(optional.filter((_, bit) => mask & (1 << bit)));
      const rhs = p.rhs.filter((_, i) => !drop.has(i));
      // The same right-hand side twice (from two productions, or two subsets of one) is two trees for one input;
      // both copies stay, so LR(1) reports them as a reduce/reduce conflict.
      if (rhs.length === 0) continue;
      productions.push({ id: productions.length, lhs: p.lhs, rhs, branch: p.branch, source: p });
    }
  }
  // A nonterminal that derives only the empty string has no productions left, so every copy that keeps it is dead.
  for (let changed = true; changed; ) {
    const live = new Set(productions.map((p) => p.lhs));
    const kept = productions.filter((p) => p.rhs.every((s) => bnf.terminals.has(s) || live.has(s)));
    changed = kept.length < productions.length;
    productions = kept;
  }
  productions = productions.map((p, id) => ({ ...p, id }));
  const byLhs = new Map<string, Production[]>();
  for (const p of productions) byLhs.set(p.lhs, [...(byLhs.get(p.lhs) ?? []), p]);
  return { start: bnf.start, productions, byLhs, terminals: bnf.terminals, nonterminals: new Set(byLhs.keys()) };
}
