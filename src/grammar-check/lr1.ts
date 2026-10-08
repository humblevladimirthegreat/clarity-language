/**
 * Canonical LR(1) analysis of a {@link Bnf}. A grammar with no conflicts is LR(1), and every LR(1)
 * grammar is unambiguous: each input has at most one tree. A conflict does not prove ambiguity on
 * its own; it names a point where one token of lookahead cannot choose (see {@link findLr1Conflicts}).
 */
import { type Bnf, type Production } from "./bnf.js";

const END = "$";
const AUGMENTED = "S'";

export type GrammarSets = { nullable: Set<string>; first: Map<string, Set<string>>; shortest: Map<string, string[]> };

/** Nullable nonterminals, FIRST sets, and one shortest terminal string per symbol. */
export function grammarSets(bnf: Bnf): GrammarSets {
  const nullable = new Set<string>();
  const first = new Map<string, Set<string>>();
  for (const n of bnf.nonterminals) first.set(n, new Set());
  for (let changed = true; changed; ) {
    changed = false;
    for (const p of bnf.productions) {
      const target = first.get(p.lhs)!;
      const before = target.size;
      let allNullable = true;
      for (const s of p.rhs) {
        if (bnf.terminals.has(s)) {
          target.add(s);
          allNullable = false;
          break;
        }
        for (const t of first.get(s) ?? []) target.add(t);
        if (!nullable.has(s)) {
          allNullable = false;
          break;
        }
      }
      if (allNullable && !nullable.has(p.lhs)) {
        nullable.add(p.lhs);
        changed = true;
      }
      if (target.size !== before) changed = true;
    }
  }

  const shortest = new Map<string, string[]>();
  for (const t of bnf.terminals) shortest.set(t, [t]);
  for (let changed = true; changed; ) {
    changed = false;
    for (const p of bnf.productions) {
      if (!p.rhs.every((s) => shortest.has(s))) continue;
      const yieldOf = p.rhs.flatMap((s) => shortest.get(s)!);
      const known = shortest.get(p.lhs);
      if (!known || yieldOf.length < known.length) {
        shortest.set(p.lhs, yieldOf);
        changed = true;
      }
    }
  }
  return { nullable, first, shortest };
}

function firstOfSequence(bnf: Bnf, sets: GrammarSets, symbols: string[], lookahead: string): Set<string> {
  const out = new Set<string>();
  for (const s of symbols) {
    if (bnf.terminals.has(s)) {
      out.add(s);
      return out;
    }
    for (const t of sets.first.get(s)!) out.add(t);
    if (!sets.nullable.has(s)) return out;
  }
  out.add(lookahead);
  return out;
}

type ItemSet = Map<string, Set<string>>; // "prodId.dot" → lookaheads

export type Lr1State = { id: number; items: ItemSet; edges: Map<string, number> };

export type Lr1Conflict = {
  state: number;
  lookahead: string;
  /** Productions that could be reduced on this lookahead. */
  reduces: Production[];
  /** Productions whose next symbol is the lookahead (shift). */
  shifts: Production[];
};

export type Lr1Result = {
  states: Lr1State[];
  conflicts: Lr1Conflict[];
  productions: Production[];
  sets: GrammarSets;
  /** Symbols leading from the start state to each state (shortest). */
  pathTo: (state: number) => string[];
};

export function buildLr1(bnf: Bnf): Lr1Result {
  const augmented: Production = { id: bnf.productions.length, lhs: AUGMENTED, rhs: [bnf.start], branch: "start" };
  const productions = [...bnf.productions, augmented];
  const byLhs = new Map(bnf.byLhs);
  const sets = grammarSets(bnf);

  function closure(kernel: ItemSet): ItemSet {
    const items: ItemSet = new Map([...kernel].map(([k, v]) => [k, new Set(v)]));
    const work = [...items.keys()];
    while (work.length > 0) {
      const key = work.pop()!;
      const [pid, dot] = key.split(".").map(Number) as [number, number];
      const p = productions[pid]!;
      const next = p.rhs[dot];
      if (next === undefined || bnf.terminals.has(next)) continue;
      const rest = p.rhs.slice(dot + 1);
      const lookaheads = new Set<string>();
      for (const la of items.get(key)!) for (const t of firstOfSequence(bnf, sets, rest, la)) lookaheads.add(t);
      for (const q of byLhs.get(next) ?? []) {
        const qKey = `${q.id}.0`;
        const existing = items.get(qKey);
        if (!existing) {
          items.set(qKey, new Set(lookaheads));
          work.push(qKey);
          continue;
        }
        const size = existing.size;
        for (const t of lookaheads) existing.add(t);
        if (existing.size !== size) work.push(qKey);
      }
    }
    return items;
  }

  const signature = (items: ItemSet) =>
    [...items]
      .map(([k, v]) => `${k}:${[...v].sort().join(",")}`)
      .sort()
      .join("|");

  const states: Lr1State[] = [];
  const index = new Map<string, number>();
  const parent: { from: number; symbol: string }[] = [];
  const intern = (items: ItemSet, from: number, symbol: string): number => {
    const sig = signature(items);
    const known = index.get(sig);
    if (known !== undefined) return known;
    const id = states.length;
    states.push({ id, items, edges: new Map() });
    index.set(sig, id);
    parent.push({ from, symbol });
    return id;
  };

  intern(closure(new Map([[`${augmented.id}.0`, new Set([END])]])), -1, "");
  for (let s = 0; s < states.length; s++) {
    const state = states[s]!;
    const kernels = new Map<string, ItemSet>();
    for (const [key, las] of state.items) {
      const [pid, dot] = key.split(".").map(Number) as [number, number];
      const next = productions[pid]!.rhs[dot];
      if (next === undefined) continue;
      const kernel = kernels.get(next) ?? new Map();
      kernel.set(`${pid}.${dot + 1}`, new Set(las));
      kernels.set(next, kernel);
    }
    for (const [symbol, kernel] of kernels) state.edges.set(symbol, intern(closure(kernel), s, symbol));
  }

  const conflicts: Lr1Conflict[] = [];
  for (const state of states) {
    const reducesOn = new Map<string, Production[]>();
    const shiftsOn = new Map<string, Production[]>();
    for (const [key, las] of state.items) {
      const [pid, dot] = key.split(".").map(Number) as [number, number];
      const p = productions[pid]!;
      const next = p.rhs[dot];
      if (next === undefined) {
        if (p === augmented) continue;
        for (const la of las) reducesOn.set(la, [...(reducesOn.get(la) ?? []), p]);
      } else if (bnf.terminals.has(next)) {
        shiftsOn.set(next, [...(shiftsOn.get(next) ?? []), p]);
      }
    }
    for (const [la, reduces] of reducesOn) {
      const shifts = shiftsOn.get(la) ?? [];
      if (reduces.length + (shifts.length > 0 ? 1 : 0) > 1) conflicts.push({ state: state.id, lookahead: la, reduces, shifts });
    }
  }

  const pathTo = (state: number): string[] => {
    const path: string[] = [];
    for (let s = state; s > 0; s = parent[s]!.from) path.unshift(parent[s]!.symbol);
    return path;
  };
  return { states, conflicts, productions, sets, pathTo };
}

export type ConflictGroup = {
  key: string;
  kind: "shift/reduce" | "reduce/reduce";
  reduces: Production[];
  /** Nonterminals whose productions would shift. */
  shiftIn: string[];
  states: number;
  lookaheads: Set<string>;
  /** Shortest token prefix reaching one such state, then the lookahead. */
  example: { prefix: string[]; lookahead: string };
};

/**
 * Group conflicts by the decision behind them: the productions that could reduce and the
 * nonterminals that could shift. LR(1) duplicates states per lookahead context, so one decision
 * usually shows up in many states.
 */
export function groupConflicts(result: Lr1Result): ConflictGroup[] {
  const groups = new Map<string, ConflictGroup>();
  for (const c of result.conflicts) {
    const reduces = [...new Map(c.reduces.map((p) => [p.id, p])).values()].sort((a, b) => a.id - b.id);
    const shiftIn = [...new Set(c.shifts.map((p) => p.lhs))].sort();
    const kind = shiftIn.length > 0 ? "shift/reduce" : "reduce/reduce";
    const key = `${reduces.map((p) => p.id).join(",")}|${shiftIn.join(",")}`;
    let group = groups.get(key);
    const prefix = result.pathTo(c.state).flatMap((s) => result.sets.shortest.get(s) ?? [`<${s}>`]);
    if (!group) {
      group = { key, kind, reduces, shiftIn, states: 0, lookaheads: new Set(), example: { prefix, lookahead: c.lookahead } };
      groups.set(key, group);
    }
    group.states += 1;
    group.lookaheads.add(c.lookahead);
    if (prefix.length < group.example.prefix.length) group.example = { prefix, lookahead: c.lookahead };
  }
  return [...groups.values()].sort((a, b) => b.states - a.states);
}
