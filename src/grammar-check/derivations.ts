/**
 * Count the trees a {@link Bnf} gives one token sequence (0, 1, or "2 or more"), and find where
 * two trees part ways. With the BNF taken from the parser, this is the gate-free grammar: a
 * sentence the parser reads with more than one tree here is one where a gate made the choice.
 */
import { type Bnf, type Production } from "./bnf.js";

/** Counts saturate at 2: we only need none / one / several. */
const MANY = 2;
const sat = (n: number) => (n > MANY ? MANY : n);

export type Fork = {
  /** The nonterminal (decision) with more than one way to cover the span. */
  lhs: string;
  start: number;
  end: number;
  /** The ways, by production branch; the same branch twice means two ways to split the span. */
  branches: string[];
};

export type Derivations = { count: number; forks: Fork[]; cyclic: boolean };

export function countDerivations(bnf: Bnf, tokens: string[]): Derivations {
  const n = tokens.length;
  const memo = new Map<string, number>();
  const busy = new Set<string>();
  let cyclic = false;

  function count(symbol: string, i: number, j: number): number {
    if (bnf.terminals.has(symbol)) return j === i + 1 && tokens[i] === symbol ? 1 : 0;
    const key = `${symbol}|${i}|${j}`;
    const known = memo.get(key);
    if (known !== undefined) return known;
    if (busy.has(key)) {
      cyclic = true;
      return 0;
    }
    busy.add(key);
    let total = 0;
    for (const p of bnf.byLhs.get(symbol) ?? []) {
      total = sat(total + seq(p.rhs, 0, i, j));
      if (total === MANY) break;
    }
    busy.delete(key);
    memo.set(key, total);
    return total;
  }

  const seqMemo = new Map<string, number>();
  function seq(rhs: string[], k: number, i: number, j: number): number {
    if (k === rhs.length) return i === j ? 1 : 0;
    if (k === rhs.length - 1) return count(rhs[k]!, i, j);
    const key = `${rhs.join(" ")}|${k}|${i}|${j}`;
    const known = seqMemo.get(key);
    if (known !== undefined) return known;
    let total = 0;
    const symbol = rhs[k]!;
    const maxEnd = bnf.terminals.has(symbol) ? Math.min(i + 1, j) : j;
    for (let m = i; m <= maxEnd; m++) {
      const head = count(symbol, i, m);
      if (head === 0) continue;
      total = sat(total + head * seq(rhs, k + 1, m, j));
      if (total === MANY) break;
    }
    seqMemo.set(key, total);
    return total;
  }

  /** Every way to split `i..j` over `rhs` with each child covering its piece at least once (capped). */
  function splits(rhs: string[], i: number, j: number, limit = 8): [number, number][][] {
    const out: [number, number][][] = [];
    const walk = (k: number, at: number, acc: [number, number][]) => {
      if (out.length >= limit) return;
      if (k === rhs.length) {
        if (at === j) out.push(acc);
        return;
      }
      for (let m = at; m <= j; m++) {
        if (count(rhs[k]!, at, m) === 0 || seq(rhs, k + 1, m, j) === 0) continue;
        walk(k + 1, m, [...acc, [at, m]]);
      }
    };
    walk(0, i, []);
    return out;
  }

  const total = count(bnf.start, 0, n);
  const forks: Fork[] = [];
  if (total >= MANY) {
    const seen = new Set<string>();
    const visit = (symbol: string, i: number, j: number) => {
      if (bnf.terminals.has(symbol)) return;
      const key = `${symbol}|${i}|${j}`;
      if (seen.has(key) || count(symbol, i, j) < MANY) return;
      seen.add(key);
      const ways: { p: Production; parts: [number, number][] }[] = [];
      for (const p of bnf.byLhs.get(symbol) ?? []) {
        if (seq(p.rhs, 0, i, j) === 0) continue;
        for (const parts of splits(p.rhs, i, j)) ways.push({ p, parts });
      }
      if (ways.length >= 2) forks.push({ lhs: symbol, start: i, end: j, branches: ways.map((w) => w.p.branch) });
      for (const w of ways) w.p.rhs.forEach((s, k) => visit(s, w.parts[k]![0], w.parts[k]![1]));
    };
    visit(bnf.start, 0, n);
  }
  return { count: total, forks, cyclic };
}
