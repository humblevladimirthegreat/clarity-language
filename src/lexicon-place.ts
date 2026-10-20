/**
 * Published-lexicon placement: annealed three-letter roots for overlay-backed and marked rows, with
 * frequency priority, and root-tails five-letter roots (src/root-tails-place.ts) for everything else.
 * A row with a root keeps its length; a new row takes three letters only when it is eligible.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { echo, loadPron } from "./echo-metric.ts";
import { buildPronunciationCache } from "./echo-pronunciation.ts";
import type { CompoundRow } from "./lexicon-compounds.ts";
import { isJoinOverlayKind, type OverlayRow } from "./lexicon-search.ts";
import { REPO_ROOT } from "./repo-paths.ts";
import { holderHostForms, tailFieldsError, type Kind, type Shape } from "./root-tails.ts";
import { placeTailRoots, tailCompounds, type TailPlaceRow } from "./root-tails-place.ts";

const FREQ_FILE = join(REPO_ROOT, "tmp", "en_50k.txt");
const FREQ_URL = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt";
const UNLISTED = 50001;
const V = ["a", "e", "o", "u"];
const C = ["b", "d", "g", "h", "y", "l", "m", "n", "r", "v", "w", "z"];
const ECHO_W = 100;

/** Rows forced onto a three-letter root (emoji → position slot). */
const MARKED: Record<string, string> = { "🤝": "pronoun", "😐": "pronoun", "🎤": "pronoun", "🎧": "pronoun", "⭐": "pronoun", "🧑": "pronoun" };

/** A root that stays put this run, with its overlay groups, so new short roots keep their spacing from it. */
export type FixedRoot = { root: string; groups: Set<string> };

export type PlaceRow = {
  emoji: string;
  concrete: string;
  abstract: string;
  englishByPos: string;
  /** Current root, if any: its length is kept. */
  root?: string;
  /** Root tail (`kind`, `shape` columns); a five-letter row needs both, a named row only `kind`. */
  kind?: string;
  shape?: string;
};

export type Placement = {
  emoji: string;
  concrete: string;
  root: string;
  /** Three-letter annealed root, or a five-letter root-tails root. */
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

/** Most frequent sense. */
export function rowPriority(row: PlaceRow, freqRank: Map<string, number>): number {
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

/** Overlay groups per emoji: `kind:` (one overlay kind on one PoS) and `pos:` (one PoS). Join overlays have none. */
export function overlayGroups(overlays: OverlayRow[]): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  for (const overlay of overlays) {
    if (isJoinOverlayKind(overlay.kind) || !overlay.emoji) continue;
    const set = groups.get(overlay.emoji) ?? new Set<string>();
    set.add(`kind:${overlay.pos}/${overlay.kind}`);
    set.add(`pos:${overlay.pos}`);
    groups.set(overlay.emoji, set);
  }
  return groups;
}

function indexRows(rows: PlaceRow[], overlays: OverlayRow[], pron: Map<string, string>, freqRank: Map<string, number>): Indexed[] {
  const byEmoji = new Map<string, Indexed>();
  const indexed: Indexed[] = rows.map((row, index) => {
    const cmu = pron.get(row.concrete) ?? "";
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
  for (const [emoji, groups] of overlayGroups(overlays)) {
    const item = byEmoji.get(emoji);
    if (item) for (const group of groups) item.groups.add(group);
  }
  for (const item of indexed) {
    const slot = MARKED[item.row.emoji];
    if (slot) item.groups.add(`pos:${slot}`);
    const root = item.row.root ?? "";
    item.eligible = root ? root.length === 3 : item.groups.size > 0;
  }
  return indexed;
}

type GroupRule = { kind: boolean; pos: boolean };
type PairRule = GroupRule & { a: number; b: number };

/**
 * Spacing two short roots owe each other. Same overlay group (`kind`): no single-letter
 * difference and a different consonant. Same PoS (`pos`): not identical.
 */
function groupRule(a: Set<string>, b: Set<string>): GroupRule {
  const shared = [...a].filter((group) => b.has(group));
  return {
    kind: shared.some((group) => group.startsWith("kind:")),
    pos: shared.some((group) => group.startsWith("pos:")),
  };
}

function pairHard(pair: GroupRule, x: string, y: string): number {
  let violations = 0;
  const distance = ham(x, y);
  if (distance === 0) violations++;
  if (pair.kind && (distance < 2 || x[1] === y[1])) violations++;
  return violations;
}

/**
 * Anneal three-letter roots. Frequent rows weigh echo more (up to 2×).
 * Grammatical-group floors stay hard; domain and sibling spacing stay off (echo-first).
 */
export function annealShortRoots(
  items: Indexed[],
  blocked: Set<string>,
  options: { restarts?: number; steps?: number; fixed?: FixedRoot[] } = {},
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
    for (const form of pool) costs.set(form, ECHO_W * echoScale(item) * 4.5 * (1 - (item.cmu ? echo(form, item.cmu) : 0)));
    return costs;
  });
  // Roots kept from earlier runs: spacing against them is fixed per form, so it folds into each row's own cost.
  const fixedRules = items.map((item) =>
    (options.fixed ?? []).flatMap((fixed) => {
      const rule = groupRule(item.groups, fixed.groups);
      return rule.kind ? [{ fixed, rule }] : [];
    }),
  );
  const fixedHard = (i: number, form: string) =>
    fixedRules[i]!.reduce((sum, { fixed, rule }) => sum + pairHard(rule, form, fixed.root), 0);
  for (let i = 0; i < items.length; i++) {
    for (const [form, cost] of unary[i]!) unary[i]!.set(form, cost + 1000 * fixedHard(i, form));
  }
  const pairs: PairRule[] = [];
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      const pair: PairRule = { a, b, ...groupRule(items[a]!.groups, items[b]!.groups) };
      if (pair.kind || pair.pos) pairs.push(pair);
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
  const broken = [
    ...pairs.filter((pair) => pairHard(pair, best[pair.a]!, best[pair.b]!) > 0).map((pair) => `${best[pair.a]} ~ ${best[pair.b]}`),
    ...items.flatMap((_, i) =>
      fixedRules[i]!.filter(({ fixed, rule }) => pairHard(rule, best[i]!, fixed.root) > 0).map(({ fixed }) => `${best[i]} ~ ${fixed.root} (kept)`),
    ),
  ];
  if (broken.length > 0) {
    throw new Error(`short roots too close within an overlay group: ${broken.join(", ")}`);
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
 * The pronunciation cache, rebuilt once when it is missing or lacks a label (a new or relabelled row).
 * A label CMU lacks only loses the English cost and tie-breaks.
 */
async function pronunciationsFor(rows: PlaceRow[]): Promise<Map<string, string>> {
  const covers = (pron: Map<string, string>) => rows.every((row) => !row.concrete.trim() || pron.has(row.concrete));
  try {
    const pron = loadPron();
    if (covers(pron)) return pron;
  } catch {
    // no cache yet
  }
  await buildPronunciationCache();
  return loadPron();
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
    /** Rows not being placed (emoji → current root): short ones constrain the anneal by overlay group, long ones the tails. */
    kept?: Iterable<{ emoji: string; root: string }>;
    /** Listed compounds, spelled with current roots: no placement may give one a second split. */
    compounds?: readonly CompoundRow[];
    annealRestarts?: number;
    annealSteps?: number;
    /** Tails annealing steps (src/root-tails-place.ts). */
    tailSteps?: number;
  } = {},
): Promise<Placement[]> {
  await ensureFrequencyFile();
  const pron = await pronunciationsFor(rows);
  const freqRank = loadFrequencyRanks();
  const indexed = indexRows(rows, overlays, pron, freqRank);
  const skip = options.skip ?? new Set<string>();
  const taken = new Set(options.blocked ?? []);
  for (const overlay of overlays) {
    if (isJoinOverlayKind(overlay.kind) && overlay.senseForm) taken.add(overlay.senseForm);
  }
  const targets = indexed.filter((item) => item.row.concrete.trim() && !skip.has(item.row.emoji) && !skip.has(item.row.concrete));
  const kept = [...(options.kept ?? [])];
  const groupsByEmoji = overlayGroups(overlays);
  const fixed: FixedRoot[] = kept.flatMap(({ emoji, root }) => {
    const groups = groupsByEmoji.get(emoji);
    return root.length === 3 && groups ? [{ root, groups }] : [];
  });
  const short = annealShortRoots(
    targets.filter((item) => item.eligible),
    taken,
    { restarts: options.annealRestarts, steps: options.annealSteps, fixed },
  );

  const longTargets = targets.filter((item) => !item.eligible);
  const fieldErrors = longTargets.flatMap((item) => {
    const error = tailFieldsError(item.row.kind ?? "", item.row.shape ?? "");
    return error ? [`${item.row.emoji || item.row.concrete}: ${error}`] : [];
  });
  if (fieldErrors.length > 0) throw new Error(`five-letter rows need a kind and shape:\n  ${fieldErrors.join("\n  ")}`);
  const shortRoots = new Set([...short.values(), ...kept.map((k) => k.root).filter((root) => root.length === 3)]);
  const keptLong = kept.filter((k) => k.root.length === 5);
  const tailRows: TailPlaceRow[] = [
    ...longTargets.map((item) => ({ kind: item.row.kind as Kind, shape: (item.row.shape ?? "") as Shape | "", cmu: item.cmu })),
    ...keptLong.map((k) => ({ kind: "named" as Kind, shape: "" as const, cmu: "", fixed: k.root })),
  ];
  const rowOfRoot = new Map<string, number>();
  longTargets.forEach((item, i) => {
    if (item.row.root) rowOfRoot.set(item.row.root, i);
  });
  keptLong.forEach((k, i) => rowOfRoot.set(k.root, longTargets.length + i));
  const tails = placeTailRoots({
    rows: tailRows,
    shortRoots,
    holderHosts: holderHostForms(overlays),
    blocked: new Set([...taken].filter((form) => form.length === 5 && !rowOfRoot.has(form))),
    compounds: tailCompounds(options.compounds ?? [], rowOfRoot, shortRoots),
    steps: options.tailSteps,
  });
  if (tails.unmet.length > 0) throw new Error(`five-letter placement left checks unmet:\n  ${tails.unmet.join("\n  ")}`);
  const long = new Map(longTargets.map((item, i) => [item, tails.roots[i]!]));
  return targets.map((item) => {
    const root = item.eligible ? short.get(item)! : long.get(item)!;
    return { emoji: item.row.emoji, concrete: item.row.concrete, root, length: item.eligible ? 3 : 5 };
  });
}
