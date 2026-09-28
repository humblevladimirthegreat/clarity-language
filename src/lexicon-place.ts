/**
 * Published-lexicon placement from the lexicon-revamp dry run
 * (scripts/prototype-lexicon-revamp.ts): frequency priority, regret among ties,
 * and annealed three-letter roots for overlay-backed and marked rows.
 * Everything else takes a five-letter root.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { echo, loadPron } from "./echo-metric.ts";
import { isJoinOverlayKind, type OverlayRow } from "./lexicon-search.ts";
import { longRootCandidates } from "./word-converter.ts";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const FREQ_FILE = join(rootDir, "tmp", "en_50k.txt");
const FREQ_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt";
const UNLISTED = 50001;
const V = ["a", "e", "o", "u"];
const C = ["b", "d", "g", "h", "y", "l", "m", "n", "r", "v", "w", "z"];
const CANDIDATE_LIMIT = 400;
const ECHO_W = 100;

/** Rows the dry run forces onto a three-letter root (emoji → position slot). */
const MARKED: Record<string, string> = { "🤝": "pronoun", "😐": "pronoun", "🎤": "pronoun", "🎧": "pronoun" };
/** Lower number is placed earlier. Glasses outranks every frequency rank. */
const PRIORITY_OVERRIDES: Record<string, number> = { "👓": 0 };
const JUDGMENT = new Set(["☯️", "🐹", "🪞", "👥", "🥼", "🌐"]);

export type PlaceRow = {
  emoji: string;
  concrete: string;
  abstract: string;
  englishByPos: string;
};

export type Placement = {
  emoji: string;
  root: string;
  /** Three-letter annealed root, or a five-letter root from regret order. */
  length: 3 | 5;
};

function forms(n: number): string[] {
  let out = [""];
  for (let i = 0; i < n; i++) out = out.flatMap((p) => (i % 2 ? C : V).map((letter) => p + letter));
  return out;
}

function ham(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

/** Rarest word in a label; unlisted words rank {@link UNLISTED}. */
export function englishRank(label: string, freqRank: Map<string, number>): number {
  const words = label.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (words.length === 0) return UNLISTED;
  return Math.max(...words.map((word) => freqRank.get(word) ?? UNLISTED));
}

export function loadFrequencyRanks(): Map<string, number> {
  const freqRank = new Map<string, number>();
  readFileSync(FREQ_FILE, "utf8").split("\n").forEach((line, index) => {
    const word = line.split(" ")[0];
    if (word && !freqRank.has(word)) freqRank.set(word, index + 1);
  });
  return freqRank;
}

export async function ensureFrequencyFile(): Promise<void> {
  if (existsSync(FREQ_FILE)) return;
  mkdirSync(dirname(FREQ_FILE), { recursive: true });
  const res = await fetch(FREQ_URL);
  if (!res.ok) throw new Error(`fetch ${FREQ_URL}: ${res.status}`);
  writeFileSync(FREQ_FILE, await res.text());
}

function sensesOf(row: PlaceRow): string[] {
  const fromPos = row.englishByPos.split(";").map((piece) => piece.split(":").slice(1).join(":"));
  return [row.concrete, row.abstract, ...fromPos].map((sense) => sense.trim()).filter(Boolean);
}

/** Most frequent sense. Overrides replace that rank. */
export function rowPriority(row: PlaceRow, freqRank: Map<string, number>): number {
  const override = PRIORITY_OVERRIDES[row.emoji];
  if (override !== undefined) return override;
  return Math.min(...sensesOf(row).map((sense) => englishRank(sense, freqRank)));
}

type Indexed = {
  row: PlaceRow;
  index: number;
  groups: Set<string>;
  eligible: boolean;
  priority: number;
  cmu: string;
};

function indexRows(rows: PlaceRow[], overlays: OverlayRow[], pron: Map<string, string>, freqRank: Map<string, number>): Indexed[] {
  const byEmoji = new Map<string, Indexed>();
  const indexed: Indexed[] = rows.map((row, index) => {
    const cmu = pron.get(row.concrete);
    if (!cmu) throw new Error(`no pronunciation for ${row.concrete}: rerun scripts/echo-pronunciation.ts`);
    const item: Indexed = {
      row,
      index,
      groups: new Set(),
      eligible: false,
      priority: rowPriority(row, freqRank),
      cmu,
    };
    if (row.emoji) byEmoji.set(row.emoji, item);
    return item;
  });
  for (const overlay of overlays) {
    if (isJoinOverlayKind(overlay.kind) || !overlay.emoji) continue;
    const item = byEmoji.get(overlay.emoji);
    if (!item) continue;
    const judgment = overlay.kind === "benchmark" && JUDGMENT.has(overlay.emoji);
    const sake = overlay.kind === "benchmark" && !judgment;
    const sub = judgment ? "/judgment" : sake ? "/sake" : "";
    item.groups.add(`kind:${overlay.pos}/${overlay.kind}${sub}`);
    item.groups.add(`pos:${overlay.pos}`);
  }
  for (const item of indexed) {
    const slot = MARKED[item.row.emoji];
    if (slot) item.groups.add(`pos:${slot}`);
    item.eligible = item.groups.size > 0;
  }
  return indexed;
}

type PairRule = { a: number; b: number; kind: boolean; bench: boolean; pos: boolean };

function pairHard(pair: PairRule, x: string, y: string): number {
  let violations = 0;
  const distance = ham(x, y);
  if (distance === 0) violations++;
  if (pair.kind && (distance < 2 || x[1] === y[1])) violations++;
  if (pair.bench && (distance < 2 || x.slice(0, 2) === y.slice(0, 2))) violations++;
  return violations;
}

/**
 * Anneal three-letter roots. Frequent rows weigh echo more (up to 2×).
 * Grammatical-group floors stay hard; domain and sibling spacing stay off (echo-first).
 */
export function annealShortRoots(
  items: Indexed[],
  blocked: Set<string>,
  options: { restarts?: number; steps?: number } = {},
): Map<Indexed, string> {
  if (items.length === 0) return new Map();
  const restarts = options.restarts ?? 6;
  const steps = options.steps ?? 400_000;
  const pool = forms(3).filter((form) => !blocked.has(form));
  if (items.length > pool.length) {
    throw new Error(`short roots: ${items.length} eligible rows and ${pool.length} free VCV shapes`);
  }
  const shortRanks = items.map((item) => item.priority).sort((a, b) => a - b);
  const echoScale = (item: Indexed) => 2 - shortRanks.indexOf(item.priority) / Math.max(1, shortRanks.length - 1);
  const unary = items.map((item) => {
    const costs = new Map<string, number>();
    for (const form of pool) costs.set(form, ECHO_W * echoScale(item) * 4.5 * (1 - echo(form, item.cmu)));
    return costs;
  });
  const pairs: PairRule[] = [];
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      const shared = [...items[a]!.groups].filter((group) => items[b]!.groups.has(group));
      const bench =
        [...items[a]!.groups].some((group) => /benchmark\/(judgment|sake)/.test(group)) &&
        [...items[b]!.groups].some((group) => /benchmark\/(judgment|sake)/.test(group)) &&
        [...items[a]!.groups].some((group) => group.endsWith("judgment")) !==
          [...items[b]!.groups].some((group) => group.endsWith("judgment"));
      const pair: PairRule = {
        a,
        b,
        bench,
        kind: shared.some((group) => group.startsWith("kind:")),
        pos: shared.some((group) => group.startsWith("pos:")),
      };
      if (pair.kind || pair.bench || pair.pos) pairs.push(pair);
    }
  }
  const byVar: PairRule[][] = items.map(() => []);
  for (const pair of pairs) {
    byVar[pair.a]!.push(pair);
    byVar[pair.b]!.push(pair);
  }
  const unique = items.map((_, i) => items.map((__, j) => j).filter((j) => j !== i));
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const assign = items.map((_, i) => [...unary[i]!.entries()].sort((a, b) => a[1] - b[1])[0]![0]);
  const localCost = (i: number, form: string) => {
    let hard = 0;
    let soft = unary[i]!.get(form)!;
    for (const pair of byVar[i]!) {
      const other = pair.a === i ? pair.b : pair.a;
      hard += pairHard(pair, form, assign[other]!);
    }
    for (const j of unique[i]!) {
      if (assign[j] === form && !byVar[i]!.some((pair) => pair.a === j || pair.b === j)) hard++;
    }
    return 1000 * hard + soft;
  };
  let best = [...assign];
  let bestCost = Infinity;
  const total = () => {
    let sum = 0;
    for (let i = 0; i < items.length; i++) sum += localCost(i, assign[i]!);
    return sum;
  };
  for (let restart = 0; restart < restarts; restart++) {
    let temperature = 50;
    for (let step = 0; step < steps; step++) {
      const i = Math.floor(rnd() * items.length);
      const form = pool[Math.floor(rnd() * pool.length)]!;
      const delta = localCost(i, form) - localCost(i, assign[i]!);
      if (delta <= 0 || rnd() < Math.exp(-delta / temperature)) assign[i] = form;
      temperature = Math.max(0.05, temperature * 0.99997);
    }
    const cost = total();
    if (cost < bestCost) {
      bestCost = cost;
      best = [...assign];
    }
    for (let i = 0; i < items.length; i++) assign[i] = best[i]!;
  }
  const seen = new Set<string>();
  const placed = new Map<Indexed, string>();
  items.forEach((item, i) => {
    const root = best[i]!;
    if (seen.has(root)) throw new Error(`short-root collision on ${root}`);
    seen.add(root);
    placed.set(item, root);
  });
  return placed;
}

/**
 * Among pending rows that share the best (lowest) priority, pick the one that
 * loses the most rank by missing its best free candidate.
 */
export function pickByRegret<T>(pending: T[], priorityOf: (item: T) => number, freeAt: (item: T, from: number) => number): T {
  let pick: T | undefined;
  let pickKey: [number, number] = [-Infinity, 0];
  const top = Math.min(...pending.map((item) => priorityOf(item)));
  for (const item of pending) {
    if (priorityOf(item) !== top) continue;
    const best = freeAt(item, 0);
    const next = best === Infinity ? Infinity : freeAt(item, best + 1);
    const regret = next === Infinity ? 1e6 : next - best;
    if (regret > pickKey[0] || (regret === pickKey[0] && best < pickKey[1])) {
      pick = item;
      pickKey = [regret, best];
    }
  }
  if (!pick) throw new Error("regret order found no row");
  return pick;
}

function placeLongRoots(items: Indexed[], taken: Set<string>): Map<Indexed, string> {
  const lists = new Map<Indexed, string[]>(
    items.map((item) => [item, longRootCandidates(item.cmu).slice(0, CANDIDATE_LIMIT)]),
  );
  const pending = new Set(items);
  const placed = new Map<Indexed, string>();
  const nextFree = (item: Indexed, from: number) => {
    const list = lists.get(item)!;
    for (let k = from; k < list.length; k++) if (!taken.has(list[k]!)) return k;
    return Infinity;
  };
  while (pending.size) {
    const item = pickByRegret([...pending], (row) => row.priority, nextFree);
    pending.delete(item);
    const rank = nextFree(item, 0);
    const root = lists.get(item)?.[rank];
    if (rank === Infinity || !root) {
      throw new Error(`no free five-letter root for ${item.row.concrete}`);
    }
    taken.add(root);
    placed.set(item, root);
  }
  return placed;
}

/**
 * Place every row that has a concrete label.
 * `skip` rows keep their current root and block that spelling.
 */
export async function placePublishedRoots(
  rows: PlaceRow[],
  overlays: OverlayRow[],
  options: {
    skip?: Set<string>;
    blocked?: Iterable<string>;
    annealRestarts?: number;
    annealSteps?: number;
  } = {},
): Promise<Placement[]> {
  await ensureFrequencyFile();
  const pron = loadPron();
  const freqRank = loadFrequencyRanks();
  const indexed = indexRows(rows, overlays, pron, freqRank);
  const skip = options.skip ?? new Set<string>();
  const taken = new Set(options.blocked ?? []);
  for (const overlay of overlays) {
    if (isJoinOverlayKind(overlay.kind) && overlay.senseForm) taken.add(overlay.senseForm);
  }
  const targets = indexed.filter((item) => item.row.concrete.trim() && !skip.has(item.row.emoji) && !skip.has(item.row.concrete));
  const short = annealShortRoots(
    targets.filter((item) => item.eligible),
    taken,
    { restarts: options.annealRestarts, steps: options.annealSteps },
  );
  for (const root of short.values()) taken.add(root);
  const long = placeLongRoots(targets.filter((item) => !item.eligible), taken);
  return targets.map((item) => {
    const root = item.eligible ? short.get(item)! : long.get(item)!;
    return { emoji: item.row.emoji, root, length: item.eligible ? 3 : 5 };
  });
}
