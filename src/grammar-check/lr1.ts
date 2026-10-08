/**
 * Canonical LR(1) analysis of a {@link Bnf}. A grammar with no conflicts is
 * LR(1), and every LR(1) grammar is unambiguous: each input has at most one tree. A conflict does not prove ambiguity
 * on its own; it names a point where one token of lookahead cannot choose.
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

export type Lr1Conflict = {
  state: number;
  lookahead: string;
  /** Productions that could be reduced on this lookahead. */
  reduces: Production[];
  /** Productions whose next symbol is the lookahead (shift). */
  shifts: Production[];
};

export type Lr1Result = {
  /** How many states the automaton has. */
  states: number;
  conflicts: Lr1Conflict[];
  productions: Production[];
  sets: GrammarSets;
  /** Symbols leading from the start state to each state (shortest). */
  pathTo: (state: number) => string[];
};

/** A set of terminals as a bitset over the terminal index. */
type Bits = Uint32Array;

export function buildLr1(bnf: Bnf): Lr1Result {
  const augmented: Production = { id: bnf.productions.length, lhs: AUGMENTED, rhs: [bnf.start], branch: "start" };
  const productions = [...bnf.productions, augmented];
  const sets = grammarSets(bnf);

  const terminals = [...bnf.terminals, END];
  const terminalIndex = new Map(terminals.map((t, i) => [t, i]));
  const words = Math.ceil(terminals.length / 32);
  const bitsOf = (symbols: Iterable<string>): Bits => {
    const bits = new Uint32Array(words);
    for (const t of symbols) {
      const i = terminalIndex.get(t)!;
      bits[i >>> 5]! |= 1 << (i & 31);
    }
    return bits;
  };
  /** OR `from` into `into`; true when `into` changed. */
  const orInto = (into: Bits, from: Bits): boolean => {
    let changed = false;
    for (let w = 0; w < words; w++) {
      const v = into[w]! | from[w]!;
      if (v !== into[w]) {
        into[w] = v;
        changed = true;
      }
    }
    return changed;
  };
  const members = (bits: Bits): string[] => terminals.filter((_, i) => (bits[i >>> 5]! >>> (i & 31)) & 1);
  const firstBits = new Map([...sets.first].map(([n, f]) => [n, bitsOf(f)]));

  // Items are numbered: production p's item with the dot at d is base[p] + d.
  const base: number[] = [];
  let itemCount = 0;
  for (const p of productions) {
    base[p.id] = itemCount;
    itemCount += p.rhs.length + 1;
  }
  const itemProduction = new Int32Array(itemCount);
  const itemDot = new Int32Array(itemCount);
  for (const p of productions) {
    for (let d = 0; d <= p.rhs.length; d++) {
      itemProduction[base[p.id]! + d] = p.id;
      itemDot[base[p.id]! + d] = d;
    }
  }
  const nextSymbol = (item: number): string | undefined => productions[itemProduction[item]!]!.rhs[itemDot[item]!];
  // FIRST of what follows the next symbol, and whether all of it can be empty (then the item's own lookahead follows).
  const restFirst: Bits[] = [];
  const restNullable: boolean[] = [];
  for (let item = 0; item < itemCount; item++) {
    const rhs = productions[itemProduction[item]!]!.rhs;
    const bits = new Uint32Array(words);
    let nullable = true;
    for (const symbol of rhs.slice(itemDot[item]! + 1)) {
      if (bnf.terminals.has(symbol)) {
        orInto(bits, bitsOf([symbol]));
        nullable = false;
        break;
      }
      orInto(bits, firstBits.get(symbol)!);
      if (!sets.nullable.has(symbol)) {
        nullable = false;
        break;
      }
    }
    restFirst.push(bits);
    restNullable.push(nullable);
  }
  const startItems = new Map<string, number[]>();
  for (const [lhs, list] of bnf.byLhs) startItems.set(lhs, list.map((p) => base[p.id]!));

  function closure(kernel: Map<number, Bits>): Map<number, Bits> {
    const items = new Map([...kernel].map(([item, las]) => [item, las.slice()]));
    const work = [...items.keys()];
    while (work.length > 0) {
      const item = work.pop()!;
      const next = nextSymbol(item);
      if (next === undefined || bnf.terminals.has(next)) continue;
      const lookaheads = restFirst[item]!.slice();
      if (restNullable[item]) orInto(lookaheads, items.get(item)!);
      for (const start of startItems.get(next) ?? []) {
        const existing = items.get(start);
        if (!existing) {
          items.set(start, lookaheads.slice());
          work.push(start);
        } else if (orInto(existing, lookaheads)) work.push(start);
      }
    }
    return items;
  }

  type State = { kernel: Map<number, Bits>; from: number; symbol: string };
  const states: State[] = [];
  const index = new Map<string, number>();
  // A state is its kernel's closure, and closure adds only dot-0 items, so two states differ exactly when their
  // kernels (items and lookaheads) do: key on the kernel and close only new states.
  const intern = (kernel: Map<number, Bits>, from: number, symbol: string): number => {
    const key = [...kernel.keys()]
      .sort((a, b) => a - b)
      .map((item) => `${item}:${kernel.get(item)!.join(",")}`)
      .join("|");
    const known = index.get(key);
    if (known !== undefined) return known;
    states.push({ kernel, from, symbol });
    index.set(key, states.length - 1);
    return states.length - 1;
  };

  intern(new Map([[base[augmented.id]!, bitsOf([END])]]), -1, "");
  for (let s = 0; s < states.length; s++) {
    const kernels = new Map<string, Map<number, Bits>>();
    for (const [item, las] of closure(states[s]!.kernel)) {
      const next = nextSymbol(item);
      if (next === undefined) continue;
      const kernel = kernels.get(next) ?? new Map<number, Bits>();
      const moved = kernel.get(item + 1);
      if (moved) orInto(moved, las);
      else kernel.set(item + 1, las.slice());
      kernels.set(next, kernel);
    }
    for (const [symbol, kernel] of kernels) intern(kernel, s, symbol);
  }

  const conflicts: Lr1Conflict[] = [];
  states.forEach((state, id) => {
    const reducesOn = new Map<string, Production[]>();
    const shiftsOn = new Map<string, Production[]>();
    for (const [item, las] of closure(state.kernel)) {
      const p = productions[itemProduction[item]!]!;
      const next = nextSymbol(item);
      if (next === undefined) {
        if (p === augmented) continue;
        for (const la of members(las)) reducesOn.set(la, [...(reducesOn.get(la) ?? []), p]);
      } else if (bnf.terminals.has(next)) {
        shiftsOn.set(next, [...(shiftsOn.get(next) ?? []), p]);
      }
    }
    for (const [la, reduces] of reducesOn) {
      const shifts = shiftsOn.get(la) ?? [];
      if (reduces.length + (shifts.length > 0 ? 1 : 0) > 1) conflicts.push({ state: id, lookahead: la, reduces, shifts });
    }
  });

  const pathTo = (state: number): string[] => {
    const path: string[] = [];
    for (let s = state; s > 0; s = states[s]!.from) path.unshift(states[s]!.symbol);
    return path;
  };
  return { states: states.length, conflicts, productions, sets, pathTo };
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
  // A production copied by ε-elimination (normalize.ts) reports as the export's production it came from; two copies
  // of one production stay two entries, since that is itself the conflict.
  const shown = (p: Production) => (p as Production & { source?: Production }).source ?? p;
  for (const c of result.conflicts) {
    const sources = c.reduces.map(shown);
    const reduces = new Set(sources).size < sources.length ? sources : [...new Set(sources)].sort((a, b) => a.id - b.id);
    const shiftIn = [...new Set(c.shifts.map((p) => shown(p).lhs))].sort();
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
