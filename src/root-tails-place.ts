/**
 * Root-tails placer: each five-letter row's tail comes from its kind and shape, and its onset is chosen
 * so that few roots of the same kind share its first two letters, and to start with the English label's
 * first consonant. A row's size steers its middle vowel. Rows are placed greedily in CSV order, then annealed. Learning order plays no part
 * (a checkpoint lint keeps look-alikes apart in teaching). `placePublishedRoots` (src/lexicon-place.ts) calls it.
 */
import { echo } from "./echo-metric.ts";
import type { CompoundRow } from "./lexicon-compounds.ts";
import { isExtraNounHook } from "./parse/hook-compounds.ts";
import { PHONEME_MAP } from "./pronunciation-map.ts";
import { KIND_LETTERS, onsetClash, SHAPE_VOWELS, SIZE_VOWELS, type Kind, type Shape, type Size } from "./root-tails.ts";

const V = "aeou";
const C = "bdghylmnrvwz";
const RADIX = [4, 12, 4, 12, 4] as const;
const FORMS = 4 * 12 * 4 * 12 * 4;
const JOINS = new Set(["l", "m", "n", "r"]);

/**
 * A first consonant that isn't the English label's first consonant (the echo the onset can carry; the
 * tail fixes the rest). Each confusing pair (same kind, same first two letters) costs 1, so at 2 a root
 * gives up its English first consonant only to avoid two or more confusing pairs.
 */
const FIRST_W = 2;
/**
 * A middle vowel that isn't the row's size vowel. Confusing pairs ignore the middle vowel, so this trades
 * only against the echo below it and the first consonant above it; it is given up only in a crowded cell.
 */
const SIZE_W = 0.01;
/** Tie-breaks, far below any pair cost: the full English echo, then fewer stops (which decide only within 0.01 of echo). */
const ECHO_W = 0.002;
const STOP_W = 0.00001;
const HARD = 1000;

export type TailPlaceRow = {
  /** The row's tail; a fixed row needs none. */
  kind?: Kind;
  shape?: Shape;
  /** Preferred middle vowel, by size; none leaves it to the echo. */
  size?: Size;
  /** CMU pronunciation of the label; empty loses only the echo tie-break. */
  cmu: string;
  /** A root kept as it is: the row is not placed, but its root counts against the others. */
  fixed?: string;
};

/** A listed compound by member: a row index (five-letter, placed here) or a fixed three-letter root. */
export type TailCompound = { left: number | string; join: string; right: number | string };

export type TailPlaceInput = {
  rows: TailPlaceRow[];
  /** Published three-letter roots, which keep their spelling. */
  shortRoots: ReadonlySet<string>;
  /** `/th/` holder host forms (`holderHostForms`): no root may start with one. */
  holderHosts?: ReadonlySet<string>;
  /** Spellings no placed root may take (join-overlay sense forms, compound stems). */
  blocked?: ReadonlySet<string>;
  compounds: TailCompound[];
  steps?: number;
  seed?: number;
};

export type TailPlacement = {
  roots: string[];
  /** Checks the placement could not satisfy. */
  unmet: string[];
};

export function encode(root: string): number {
  let code = 0;
  for (let i = 0; i < 5; i++) code = code * RADIX[i]! + (i % 2 ? C : V).indexOf(root[i]!);
  return code;
}

export function decode(code: number): string {
  const out: string[] = [];
  for (let i = 4; i >= 0; i--) {
    out.unshift((i % 2 ? C : V)[code % RADIX[i]!]!);
    code = Math.floor(code / RADIX[i]!);
  }
  return out.join("");
}

/** Codes of the other roots with the same first two letters and the same kind: any middle vowel, any final vowel. */
function siblings(code: number): number[] {
  const middle = Math.floor(code / 48) % 4;
  const final = code % 4;
  const base = code - middle * 48 - final;
  const out: number[] = [];
  for (let b = 0; b < 4; b++) for (let e = 0; e < 4; e++) {
    const other = base + b * 48 + e;
    if (other !== code) out.push(other);
  }
  return out;
}

/** Every root a row may take: its tail, any onset, minus the hook and holder checks and blocked spellings. */
function candidates(row: TailPlaceRow, shortRoots: ReadonlySet<string>, holderHosts?: ReadonlySet<string>, blocked?: ReadonlySet<string>): number[] {
  if (!row.kind || !row.shape) throw new Error("a placed five-letter row needs a kind and shape");
  const consonant = KIND_LETTERS[row.kind];
  const vowels = SHAPE_VOWELS[row.shape];
  const out: number[] = [];
  for (const a of V) for (const c of C) for (const b of V) for (const e of vowels) {
    const root = a + c + b + consonant + e;
    if (!onsetClash(root, shortRoots, holderHosts) && !blocked?.has(root)) out.push(encode(root));
  }
  return out;
}

/** Egabon letter for the first consonant of a CMU pronunciation's first word; null when it has none. */
export function firstConsonant(cmu: string): string | null {
  const phone = cmu.split("|")[0]!.trim().split(/\s+/).find((p) => p && !/\d$/.test(p));
  return phone ? (PHONEME_MAP[phone] ?? null) : null;
}

function stops(root: string): number {
  let n = 0;
  for (const letter of root) if (letter === "b" || letter === "d" || letter === "g") n++;
  return n;
}

/** Deterministic LCG in [0, 1). */
function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1103515245) + 12345) >>> 0) / 0x100000000);
}

export function placeTailRoots(input: TailPlaceInput): TailPlacement {
  const { rows, shortRoots, holderHosts } = input;
  const n = rows.length;
  const sibs = Array.from({ length: FORMS }, (_, code) => siblings(code));
  const cands = rows.map((row) => (row.fixed ? [] : candidates(row, shortRoots, holderHosts, input.blocked)));
  const free = rows.flatMap((row, i) => (row.fixed ? [] : [i]));
  const unary = rows.map((row, i) => {
    const first = firstConsonant(row.cmu);
    const costs = new Map<number, number>();
    for (const code of cands[i]!) {
      const root = decode(code);
      const miss = first !== null && root[1] !== first ? FIRST_W : 0;
      const sizeMiss = row.size && root[2] !== SIZE_VOWELS[row.size] ? SIZE_W : 0;
      costs.set(code, miss + sizeMiss + STOP_W * stops(root) + ECHO_W * (1 - (row.cmu ? echo(root, row.cmu) : 0)));
    }
    return costs;
  });

  const occupant = new Int32Array(FORMS).fill(-1);
  const codes = new Int32Array(n).fill(-1);

  // Listed compounds: current stems, and nine-letter stems indexed by their five-letter ends.
  const compounds = input.compounds;
  const memberOf: number[][] = rows.map(() => []);
  compounds.forEach((c, index) => {
    for (const side of [c.left, c.right]) if (typeof side === "number") memberOf[side]!.push(index);
  });
  const stems: (string | null)[] = compounds.map(() => null);
  const byEnd = new Map<string, Set<number>>();
  const indexStem = (index: number, add: boolean) => {
    const stem = stems[index];
    if (!stem || stem.length !== 9) return;
    for (const end of [stem.slice(0, 5), stem.slice(4)]) {
      const set = byEnd.get(end) ?? new Set<number>();
      if (add) set.add(index);
      else set.delete(index);
      byEnd.set(end, set);
    }
  };
  const memberRoot = (side: number | string) => (typeof side === "string" ? side : codes[side]! < 0 ? null : decode(codes[side]!));
  const restem = (index: number) => {
    indexStem(index, false);
    const c = compounds[index]!;
    const left = memberRoot(c.left);
    const right = memberRoot(c.right);
    stems[index] = left && right ? left + c.join + right : null;
    indexStem(index, true);
  };
  const isLong = (root: string) => occupant[encode(root)]! >= 0;
  /** A nine-letter stem that reads both 3 + join + 5 and 5 + join + 3 with current roots. */
  const splitsTwice = (stem: string | null) =>
    !!stem && stem.length === 9 &&
    shortRoots.has(stem.slice(0, 3)) && JOINS.has(stem[3]!) && isLong(stem.slice(4)) &&
    isLong(stem.slice(0, 5)) && JOINS.has(stem[5]!) && shortRoots.has(stem.slice(6));

  const setCode = (i: number, code: number) => {
    if (codes[i]! >= 0 && occupant[codes[i]!] === i) occupant[codes[i]!] = -1;
    codes[i] = code;
    if (code >= 0) occupant[code] = i;
    for (const index of memberOf[i]!) restem(index);
  };

  const compoundBreaks = (i: number) => {
    let count = 0;
    for (const index of memberOf[i]!) if (splitsTwice(stems[index]!)) count++;
    const root = decode(codes[i]!);
    for (const index of byEnd.get(root) ?? []) {
      if (!memberOf[i]!.includes(index) && splitsTwice(stems[index]!)) count++;
    }
    return count;
  };

  const localCost = (i: number) => {
    const code = codes[i]!;
    let cost = unary[i]!.get(code)!;
    // Each confusing pair costs 1.
    for (const other of sibs[code]!) {
      const j = occupant[other]!;
      if (j >= 0 && j !== i) cost++;
    }
    return cost + HARD * compoundBreaks(i);
  };

  rows.forEach((row, i) => {
    if (!row.fixed) return;
    const code = encode(row.fixed);
    if (occupant[code]! >= 0) throw new Error(`fixed root ${row.fixed} is given twice`);
    setCode(i, code);
  });

  // Greedy, in CSV order.
  for (const i of free) {
    let best = -1;
    let bestCost = Infinity;
    for (const code of cands[i]!) {
      if (occupant[code]! >= 0) continue;
      setCode(i, code);
      const cost = localCost(i);
      if (cost < bestCost) {
        bestCost = cost;
        best = code;
      }
    }
    if (best < 0) throw new Error(`no free root in the tail of row ${i}`);
    setCode(i, best);
  }

  // Anneal: move one row to another onset in its tail, or swap two rows that can take each other's root.
  const steps = input.steps ?? 1_500_000;
  const rnd = rng(input.seed ?? 12345);
  /** A row may take a code: it is in the row's tail, and the row is not fixed. */
  const allowed = (k: number, code: number) => unary[k]!.has(code);
  let temperature = 0.5;
  const cooling = Math.pow(0.000001 / temperature, 1 / Math.max(1, steps));
  for (let step = 0; step < steps && free.length > 0; step++, temperature *= cooling) {
    const i = free[Math.floor(rnd() * free.length)]!;
    const list = cands[i]!;
    const code = list[Math.floor(rnd() * list.length)]!;
    const from = codes[i]!;
    if (code === from) continue;
    const k = occupant[code]!;
    if (k >= 0 && !allowed(k, from)) continue;
    const before = localCost(i) + (k >= 0 ? localCost(k) : 0);
    if (k >= 0) {
      occupant[from] = -1;
      setCode(k, from);
    }
    setCode(i, code);
    const after = localCost(i) + (k >= 0 ? localCost(k) : 0);
    const delta = after - before;
    if (delta <= 0 || rnd() < Math.exp(-delta / temperature)) continue;
    occupant[code] = -1;
    setCode(i, from);
    if (k >= 0) setCode(k, code);
  }

  // Repair: a row can be left breaking a hard rule (a listed compound's second split) that random moves don't reach.
  // For each such row, try every root in its tail: free, swapped with its holder, or with the holder moved to a free root.
  const breaks = (i: number) => localCost(i) >= HARD;
  for (let round = 0; round < 20; round++) {
    let fixed = false;
    for (const i of free) {
      if (!breaks(i)) continue;
      const from = codes[i]!;
      let best: { code: number; k: number; to: number } | null = null;
      let bestDelta = 0;
      const tryMove = (code: number, k: number, to: number) => {
        const before = localCost(i) + (k >= 0 ? localCost(k) : 0);
        if (k >= 0) setCode(k, to);
        setCode(i, code);
        const delta = localCost(i) + (k >= 0 ? localCost(k) : 0) - before;
        setCode(i, from);
        if (k >= 0) setCode(k, code);
        if (delta < bestDelta) {
          bestDelta = delta;
          best = { code, k, to };
        }
      };
      for (const code of cands[i]!) {
        if (code === from) continue;
        const k = occupant[code]!;
        if (k < 0) {
          tryMove(code, -1, -1);
          continue;
        }
        if (allowed(k, from)) tryMove(code, k, from);
        for (const to of cands[k]!) if (occupant[to]! < 0) tryMove(code, k, to);
      }
      if (best) {
        const { code, k, to } = best as { code: number; k: number; to: number };
        if (k >= 0) setCode(k, to);
        setCode(i, code);
        fixed = true;
      }
    }
    if (!fixed) break;
  }

  const roots = [...codes].map(decode);
  const unmet: string[] = [];
  compounds.forEach((c, index) => {
    if (splitsTwice(stems[index]!)) unmet.push(`compound ${stems[index]} splits two ways`);
  });
  return { roots, unmet };
}

/** Resolve listed compounds to row indices: `rowOfRoot` maps a current five-letter root to its row. */
export function tailCompounds(compounds: readonly CompoundRow[], rowOfRoot: ReadonlyMap<string, number>, shortRoots: ReadonlySet<string>): TailCompound[] {
  const side = (root: string) => rowOfRoot.get(root) ?? (shortRoots.has(root) ? root : null);
  return compounds.flatMap((c) => {
    if (isExtraNounHook(c.right)) return [];
    const left = side(c.left);
    const right = side(c.right);
    return left === null || right === null ? [] : [{ left, join: c.join, right }];
  });
}
