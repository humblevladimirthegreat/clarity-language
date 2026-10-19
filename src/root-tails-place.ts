/**
 * Root-tails placer (proposal `root-tails.md`, phase 1): each five-letter row's tail comes from its
 * kind and shape, and its onset is chosen for distinctiveness against roots of the same kind, and
 * to start with the English label's first consonant. Rows are placed greedily in CSV order, then
 * annealed. Learning order plays no part (the phase 3 lint keeps look-alikes apart in teaching). The live placer
 * (src/lexicon-place.ts) is untouched: its second-consonant ban and echo ranking stay in force.
 */
import { echo } from "./echo-metric.ts";
import type { CompoundRow } from "./lexicon-compounds.ts";
import { isExtraNounHook } from "./parse/hook-compounds.ts";
import { PHONEME_MAP } from "./pronunciation-map.ts";
import { confusable, FREE_VOWEL_KIND, hookClash, KIND_LETTERS, SHAPE_VOWELS, type Kind, type Shape } from "./root-tails.ts";

const V = "aeou";
const C = "bdghylmnrvwz";
const RADIX = [4, 12, 4, 12, 4] as const;
const FORMS = 4 * 12 * 4 * 12 * 4;
const JOINS = new Set(["l", "m", "n", "r"]);
/** Named rows are too many for the in-cell rule (283 rows; at most 192 fit it), so it is only a cost there. */
const NAMED = C.indexOf(KIND_LETTERS[FREE_VOWEL_KIND]);

/**
 * Cost of a one-letter pair of the same kind, by the position that differs: an onset vowel most, then the
 * shape vowel, then the first consonant. A named row's final vowel has no meaning, so it costs as an onset vowel.
 * Roots of different kinds cost nothing: the tail tells them apart.
 */
const POS_W = [2, 0.5, 2, 0, 0.9] as const;
const NAMED_FINAL_W = 2;
/** First consonants that sound alike ({@link confusable}) cost this many times more. */
const CONFUSABLE_W = 3;
/** Two-letter pair of the same kind. */
const NEAR_W = 0.25;
/** WordNet closeness (0–1) adds up to this much to a pair. */
const MEANING_W = 2;
/**
 * A first consonant that isn't the English label's first consonant (the echo the onset can carry; the
 * tail fixes the rest). At 2 it equals one onset-vowel neighbor and outweighs any single first-consonant neighbor
 * (0.5, or 1.5 between letters that sound alike), so a root gives up its English first consonant only to avoid a
 * costlier neighbor or several.
 */
const FIRST_W = 2;
/** Tie-breaks, far below any pair cost: the full English echo, then fewer stops (which decide only within 0.01 of echo). */
const ECHO_W = 0.002;
const STOP_W = 0.00001;
const HARD = 1000;
/** In-cell cost when annealing starts, below the cost of a typical row. */
const IN_CELL_START = 2;

export type TailPlaceRow = {
  kind: Kind;
  shape: Shape | "";
  /** CMU pronunciation of the label; empty loses only the echo tie-break. */
  cmu: string;
};

/** A listed compound by member: a row index (five-letter, placed here) or a fixed three-letter root. */
export type TailCompound = { left: number | string; join: string; right: number | string };

export type TailPlaceInput = {
  rows: TailPlaceRow[];
  /** Published three-letter roots, which keep their spelling. */
  shortRoots: ReadonlySet<string>;
  compounds: TailCompound[];
  /** Closeness of two rows' senses, 0–1 (WordNet). */
  closeness?: (a: number, b: number) => number;
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

/** Codes one letter away (with the position that differs) and two letters away, for every form. */
function neighborTables(): { d1: Int32Array; d1Pos: Int8Array; d1Count: number; d2: Int32Array; d2Count: number } {
  const d1Count = 3 + 11 + 3 + 11 + 3;
  const d2Count = 3 * 11 * 2 + 3 * 3 * 3 + 3 * 11 * 4 + 11 * 11;
  const d1 = new Int32Array(FORMS * d1Count);
  const d1Pos = new Int8Array(FORMS * d1Count);
  const d2 = new Int32Array(FORMS * d2Count);
  const weights = [1, 1, 1, 1, 1];
  for (let i = 3; i >= 0; i--) weights[i] = weights[i + 1]! * RADIX[i + 1]!;
  for (let code = 0; code < FORMS; code++) {
    const digits = RADIX.map((_, i) => Math.floor(code / weights[i]!) % RADIX[i]!);
    let n1 = 0;
    let n2 = 0;
    for (let p = 0; p < 5; p++) {
      for (let a = 0; a < RADIX[p]!; a++) {
        if (a === digits[p]) continue;
        const one = code + (a - digits[p]!) * weights[p]!;
        d1[code * d1Count + n1] = one;
        d1Pos[code * d1Count + n1++] = p;
        for (let q = p + 1; q < 5; q++) {
          for (let b = 0; b < RADIX[q]!; b++) {
            if (b !== digits[q]) d2[code * d2Count + n2++] = one + (b - digits[q]!) * weights[q]!;
          }
        }
      }
    }
  }
  return { d1, d1Pos, d1Count, d2, d2Count };
}

/** Every root a row may take: its tail, any onset, minus the hook check. */
function candidates(row: TailPlaceRow, shortRoots: ReadonlySet<string>): number[] {
  const consonant = KIND_LETTERS[row.kind];
  const vowels = row.kind === FREE_VOWEL_KIND || !row.shape ? V : SHAPE_VOWELS[row.shape];
  const out: number[] = [];
  for (const a of V) for (const c of C) for (const b of V) for (const e of vowels) {
    const root = a + c + b + consonant + e;
    if (!hookClash(root, shortRoots)) out.push(encode(root));
  }
  return out;
}

/** Agazan letter for the first consonant of a CMU pronunciation's first word; null when it has none. */
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
  const { rows, shortRoots } = input;
  const n = rows.length;
  const { d1, d1Pos, d1Count, d2, d2Count } = neighborTables();
  const cands = rows.map((row) => candidates(row, shortRoots));
  const unary = rows.map((row, i) => {
    const first = firstConsonant(row.cmu);
    const costs = new Map<number, number>();
    for (const code of cands[i]!) {
      const root = decode(code);
      const miss = first !== null && root[1] !== first ? FIRST_W : 0;
      costs.set(code, miss + STOP_W * stops(root) + ECHO_W * (1 - (row.cmu ? echo(root, row.cmu) : 0)));
    }
    return costs;
  });

  // Pair weight from meaning; the letters that differ set the rest at use time.
  const pairW = new Float32Array(n * n);
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      pairW[a * n + b] = pairW[b * n + a] = 1 + MEANING_W * (input.closeness?.(a, b) ?? 0);
    }
  }

  const occupant = new Int32Array(FORMS).fill(-1);
  /** Cost of breaking the in-cell rule: hard, except while annealing, where it starts soft so a full cell can repack. */
  let inCellW = HARD;
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

  const pairCost = (i: number, j: number, other: number, pos: number) => {
    const code = codes[i]!;
    const kind = Math.floor(code / 4) % 12;
    if (kind !== Math.floor(other / 4) % 12) return 0;
    const w = pairW[i * n + j]!;
    if (pos < 0) return NEAR_W * w;
    // Inside a tail cell, a one-letter pair must differ in the first consonant.
    if (pos !== 1 && pos !== 4 && kind !== NAMED) return inCellW;
    if (pos === 1) {
      const sound = confusable(C[Math.floor(code / 192) % 12]!, C[Math.floor(other / 192) % 12]!) ? CONFUSABLE_W : 1;
      return POS_W[1] * sound * w;
    }
    return (pos === 4 && kind === NAMED ? NAMED_FINAL_W : POS_W[pos]!) * w;
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
    for (let k = 0; k < d1Count; k++) {
      const other = d1[code * d1Count + k]!;
      const j = occupant[other]!;
      if (j >= 0 && j !== i) cost += pairCost(i, j, other, d1Pos[code * d1Count + k]!);
    }
    for (let k = 0; k < d2Count; k++) {
      const other = d2[code * d2Count + k]!;
      const j = occupant[other]!;
      if (j >= 0 && j !== i) cost += pairCost(i, j, other, -1);
    }
    return cost + HARD * compoundBreaks(i);
  };

  // Greedy, in CSV order.
  for (let i = 0; i < n; i++) {
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
  const allowed = (k: number, code: number) => unary[k]!.has(code);
  let temperature = 0.5;
  const cooling = Math.pow(0.000001 / temperature, 1 / Math.max(1, steps));
  inCellW = IN_CELL_START;
  const stiffening = Math.pow(HARD / IN_CELL_START, 1 / Math.max(1, steps));
  for (let step = 0; step < steps; step++, temperature *= cooling, inCellW *= stiffening) {
    const i = Math.floor(rnd() * n);
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

  inCellW = HARD;

  // Repair: a nearly full cell can leave a row breaking a hard rule that random moves don't reach.
  // For each such row, try every root in its tail: free, swapped with its holder, or with the holder moved to a free root.
  const breaks = (i: number) => localCost(i) >= HARD;
  for (let round = 0; round < 20; round++) {
    let fixed = false;
    for (let i = 0; i < n; i++) {
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
  for (let i = 0; i < n; i++) {
    const code = codes[i]!;
    for (let k = 0; k < d1Count; k++) {
      const j = occupant[d1[code * d1Count + k]!]!;
      if (j > i && d1Pos[code * d1Count + k] !== 1 && code % 48 === codes[j]! % 48 && Math.floor(code / 4) % 12 !== NAMED) {
        unmet.push(`${roots[i]} ~ ${roots[j]}: one letter apart in the same tail cell, not in the first consonant`);
      }
    }
  }
  compounds.forEach((c, index) => {
    if (splitsTwice(stems[index]!)) unmet.push(`compound ${stems[index]} splits two ways`);
  });
  return { roots, unmet };
}

/**
 * Most rows one tail cell can hold under the in-cell rule: per first consonant, onsets with distinct first
 * and distinct middle vowels, minus onsets the hook check blocks. 48 unless the tail consonant is l / m.
 */
export function cellCapacity(kind: Kind, shortRoots: ReadonlySet<string>): number {
  const consonant = KIND_LETTERS[kind];
  const perms = (list: string[]): string[][] =>
    list.length <= 1 ? [list] : list.flatMap((x, i) => perms([...list.slice(0, i), ...list.slice(i + 1)]).map((rest) => [x, ...rest]));
  let total = 0;
  for (const c of C) {
    let best = 0;
    for (const perm of perms([...V])) {
      best = Math.max(best, [...V].filter((a, i) => !hookClash(`${a}${c}${perm[i]}${consonant}o`, shortRoots)).length);
    }
    total += best;
  }
  return total;
}

/** Resolve listed compounds to row indices: `rowOfRoot` maps a live five-letter root to its tails row. */
export function tailCompounds(compounds: readonly CompoundRow[], rowOfRoot: ReadonlyMap<string, number>, shortRoots: ReadonlySet<string>): TailCompound[] {
  const side = (root: string) => rowOfRoot.get(root) ?? (shortRoots.has(root) ? root : null);
  return compounds.flatMap((c) => {
    if (isExtraNounHook(c.right)) return [];
    const left = side(c.left);
    const right = side(c.right);
    return left === null || right === null ? [] : [{ left, join: c.join, right }];
  });
}
