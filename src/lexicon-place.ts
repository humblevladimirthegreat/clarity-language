/**
 * Published-lexicon placement: annealed three-letter roots for overlay-backed and marked rows, with
 * frequency priority, place-name roots (src/place-root.ts) for `named` rows, and root-tails five-letter
 * roots (src/root-tails-place.ts) for everything else. A row with a root keeps its length; a new row
 * takes three letters only when it is eligible.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { echo, loadPron } from "./echo-metric.ts";
import { buildPronunciationCache } from "./echo-pronunciation.ts";
import { ENGLISH_IN_CODE } from "./english-in-code.ts";
import { potentialCompoundSplits, type CompoundRow } from "./lexicon-compounds.ts";
import { isJoinOverlayKind, type OverlayRow } from "./lexicon-search.ts";
import { HOLDER_HOST_KINDS } from "./parse/classify.ts";
import { isExtraNounHook } from "./parse/hook-compounds.ts";
import { placeRoot } from "./place-root.ts";
import { REPO_ROOT } from "./repo-paths.ts";
import { holderHostForms, hookClash, PLACE_KIND, sizeFieldError, tailFieldsError, type Kind, type Shape, type Size } from "./root-tails.ts";
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
  /** Root tail (`kind`, `shape` columns); a five-letter row needs both, a `named` row only `kind`. */
  kind?: string;
  shape?: string;
  /** Middle-vowel preference (`size` column), src/root-tails.ts. */
  size?: string;
};

export type Placement = {
  emoji: string;
  concrete: string;
  root: string;
  /** Three-letter annealed root, a five-letter root-tails root, or a place-name root of any length. */
  length: number;
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

/** Two short rows that may not hold these forms together: with both, the listed compound `stem` splits two ways. */
export type CompoundConflict = { item: number; form: string; other: string; stem: string };

/** What roots that stay put this run owe the short rows being placed; item numbers index the anneal's rows. */
export type ShortRootGuards = {
  /** Forms no short row may take. */
  blocked: Set<string>;
  /** Forms one row may not take, with the reason. */
  bans: Map<number, Map<string, string>>;
  conflicts: CompoundConflict[];
};

/** A `/th/` holder host spells its row's root + a grade letter; the row's overlays give each grade it takes. */
function holderGrades(row: PlaceRow, overlays: readonly OverlayRow[]): string[] {
  const base = row.root || row.emoji;
  if (!base) return [];
  return overlays
    .filter((o) => o.emoji === row.emoji && o.pos === "th" && HOLDER_HOST_KINDS.has(o.kind) && o.senseForm.startsWith(base))
    .map((o) => o.senseForm.slice(base.length));
}

/**
 * Checks the placed roots must pass against roots that stay put (`staticRoots`: kept rows and
 * place-name roots), as hard rules for the short anneal: the hook check and the holder check against
 * kept five-letter roots, and no listed compound with a second split. Compounds with a five-letter
 * member being re-placed are left to the five-letter placer, which sees the final short roots.
 */
export function shortRootGuards(
  items: readonly Indexed[],
  blocked: ReadonlySet<string>,
  context: { staticRoots: ReadonlySet<string>; keptLong: readonly string[]; overlays: readonly OverlayRow[]; compounds: readonly CompoundRow[] },
): ShortRootGuards {
  const { staticRoots, keptLong } = context;
  const pool = forms(3).filter((form) => !blocked.has(form));
  const poolSet = new Set(pool);
  const guards: ShortRootGuards = { blocked: new Set(), bans: new Map(), conflicts: [] };
  const ban = (i: number, form: string, reason: string) => {
    const reasons = guards.bans.get(i) ?? new Map<string, string>();
    if (!reasons.has(form)) reasons.set(form, reason);
    guards.bans.set(i, reasons);
  };

  // A kept l / m-second root whose onset is a short root reads as that root + join + hook.
  for (const root of keptLong) if (hookClash(root, poolSet)) guards.blocked.add(root.slice(0, 3));

  // A short row's new holder host must not start a kept five-letter root.
  const keptStarts = new Set(keptLong.map((root) => root.slice(0, 4)));
  items.forEach((item, i) => {
    for (const grade of holderGrades(item.row, context.overlays)) {
      for (const form of pool) if (keptStarts.has(form + grade)) ban(i, form, `holder host ${form + grade} starts a kept root`);
    }
  });

  // Listed compounds: a split other than the declared one, made of roots that stay put and short forms.
  const isRoot = (root: string) => staticRoots.has(root) || (root.length === 3 && poolSet.has(root));
  const itemOf = new Map(items.flatMap((item, i) => (item.row.root ? [[item.row.root, i] as const] : [])));
  for (const c of context.compounds) {
    if (isExtraNounHook(c.right)) continue;
    const sides = [c.left, c.right].map((root) => itemOf.get(root) ?? (staticRoots.has(root) ? "static" : null));
    // A member being re-placed as a five-letter root: the five-letter placer checks it.
    if (sides.includes(null)) continue;
    const moving = sides.filter((side) => typeof side === "number").length;
    // Two short members make a 3 + join + 3 stem, which has no other split.
    if (moving === 2) continue;
    for (const form of moving === 0 ? [""] : pool) {
      const left = sides[0] === "static" ? c.left : form;
      const right = sides[1] === "static" ? c.right : form;
      const stem = left + c.join + right;
      const item = sides.find((side): side is number => typeof side === "number");
      for (const split of potentialCompoundSplits(stem, isRoot)) {
        if (split.left === left && split.join === c.join) continue;
        if (!isRoot(split.right)) continue;
        const dynamic = [split.left, split.right].filter((part) => !staticRoots.has(part));
        if (item === undefined) {
          if (dynamic.length === 1) guards.blocked.add(dynamic[0]!);
        } else if (dynamic.length === 0 || (dynamic.length === 1 && dynamic[0] === form)) {
          ban(item, form, `compound ${stem} also reads ${split.left}+${split.join}+${split.right}`);
        } else if (dynamic.length === 1) {
          guards.conflicts.push({ item, form, other: dynamic[0]!, stem });
        }
      }
    }
  }
  return guards;
}

/**
 * Anneal three-letter roots. Frequent rows weigh echo more (up to 2×).
 * Grammatical-group floors stay hard; domain and sibling spacing stay off (echo-first).
 * `guards` ({@link shortRootGuards}) are hard too.
 */
export function annealShortRoots(
  items: Indexed[],
  blocked: Set<string>,
  options: { restarts?: number; steps?: number; fixed?: FixedRoot[]; guards?: ShortRootGuards } = {},
): Map<Indexed, string> {
  if (items.length === 0) return new Map();
  const restarts = options.restarts ?? 6;
  const steps = options.steps ?? 400_000;
  const guards: ShortRootGuards = options.guards ?? { blocked: new Set(), bans: new Map(), conflicts: [] };
  const pool = forms(3).filter((form) => !blocked.has(form) && !guards.blocked.has(form));
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
    const banned = guards.bans.get(i);
    for (const [form, cost] of unary[i]!) unary[i]!.set(form, cost + 1000 * (fixedHard(i, form) + (banned?.has(form) ? 1 : 0)));
  }
  // Compound conflicts by row and form, and by the form the other row holds.
  const conflictsOf = items.map(() => new Map<string, CompoundConflict[]>());
  const conflictsOn = new Map<string, CompoundConflict[]>();
  for (const conflict of guards.conflicts) {
    const mine = conflictsOf[conflict.item]!;
    mine.set(conflict.form, [...(mine.get(conflict.form) ?? []), conflict]);
    conflictsOn.set(conflict.other, [...(conflictsOn.get(conflict.other) ?? []), conflict]);
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
  // How many rows hold each form, for the compound conflicts.
  const holders = new Map<string, number>();
  const hold = (form: string, by: number) => holders.set(form, (holders.get(form) ?? 0) + by);
  for (const form of assign) hold(form, 1);
  const put = (i: number, form: string) => {
    hold(assign[i]!, -1);
    assign[i] = form;
    hold(form, 1);
  };
  const conflictCount = (i: number, form: string) => {
    let count = 0;
    for (const conflict of conflictsOf[i]!.get(form) ?? []) {
      if ((holders.get(conflict.other) ?? 0) - (assign[i] === conflict.other ? 1 : 0) > 0) count++;
    }
    for (const conflict of conflictsOn.get(form) ?? []) {
      if (conflict.item !== i && assign[conflict.item] === conflict.form) count++;
    }
    return count;
  };
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
    hard += conflictCount(i, form);
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
      if (delta <= 0 || rnd() < Math.exp(-delta / temperature)) put(i, form);
      temperature = Math.max(0.05, temperature * 0.99997);
    }
    const cost = total();
    if (cost < bestCost) {
      bestCost = cost;
      best = [...assign];
    }
    for (let i = 0; i < items.length; i++) put(i, best[i]!);
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
  const unguarded = items.flatMap((_, i) => {
    const reason = guards.bans.get(i)?.get(best[i]!);
    const conflicts = (conflictsOf[i]!.get(best[i]!) ?? []).filter((conflict) => best.some((form, j) => j !== i && form === conflict.other));
    return [
      ...(reason ? [`${best[i]}: ${reason}`] : []),
      ...conflicts.map((conflict) => `${conflict.form} ~ ${conflict.other}: compound ${conflict.stem} splits two ways`),
    ];
  });
  if (unguarded.length > 0) {
    throw new Error(`short roots fail checks against kept roots: ${unguarded.join(", ")}`);
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
  // An English word the doc lint reads as English in code can't be a root.
  const taken = new Set([...(options.blocked ?? []), ...ENGLISH_IN_CODE]);
  for (const overlay of overlays) {
    if (isJoinOverlayKind(overlay.kind) && overlay.senseForm) taken.add(overlay.senseForm);
  }
  const targets = indexed.filter((item) => item.row.concrete.trim() && !skip.has(item.row.emoji) && !skip.has(item.row.concrete));
  const kept = [...(options.kept ?? [])];
  const keptLong = kept.filter((k) => k.root.length === 5);
  const groupsByEmoji = overlayGroups(overlays);
  const fixed: FixedRoot[] = kept.flatMap(({ emoji, root }) => {
    const groups = groupsByEmoji.get(emoji);
    return root.length === 3 && groups ? [{ root, groups }] : [];
  });

  // Place-name roots don't depend on the others, so they stay put for the short anneal.
  const placeTargets = targets.filter((item) => !item.eligible && item.row.kind === PLACE_KIND);
  const noPron = placeTargets.filter((item) => !item.cmu).map((item) => item.row.concrete);
  if (noPron.length > 0) throw new Error(`place-name rows need a pronunciation (CMU_OVERRIDES in src/cmu-dict.ts): ${noPron.join(", ")}`);
  const places = new Map(placeTargets.map((item) => [item, placeRoot(item.cmu)]));
  const placeOwner = new Map<string, string>();
  for (const [item, root] of places) {
    const other = placeOwner.get(root);
    if (other) throw new Error(`place-name root ${root} spells both ${other} and ${item.row.concrete}`);
    placeOwner.set(root, item.row.concrete);
  }

  const shortTargets = targets.filter((item) => item.eligible);
  const guards = shortRootGuards(shortTargets, taken, {
    staticRoots: new Set([...kept.map((k) => k.root), ...places.values()]),
    keptLong: keptLong.map((k) => k.root),
    overlays,
    compounds: options.compounds ?? [],
  });
  const short = annealShortRoots(shortTargets, taken, { restarts: options.annealRestarts, steps: options.annealSteps, fixed, guards });

  // The five-letter placer sees the short roots as they are now spelled: holder hosts and compound members.
  const moved = new Map<string, { from: string; to: string }>();
  const movedRoots = new Map<string, string>();
  for (const [item, root] of short) {
    const from = item.row.root || item.row.emoji;
    if (!from || from === root) continue;
    if (item.row.emoji) moved.set(item.row.emoji, { from, to: root });
    if (item.row.root) movedRoots.set(item.row.root, root);
  }
  const holderHosts = holderHostForms(
    overlays.map((overlay) => {
      const respell = moved.get(overlay.emoji);
      return respell && overlay.senseForm.startsWith(respell.from)
        ? { ...overlay, senseForm: respell.to + overlay.senseForm.slice(respell.from.length) }
        : overlay;
    }),
  );
  const compounds = (options.compounds ?? []).map((c) => ({
    ...c,
    left: movedRoots.get(c.left) ?? c.left,
    right: movedRoots.get(c.right) ?? c.right,
  }));

  const longTargets = targets.filter((item) => !item.eligible && item.row.kind !== PLACE_KIND);
  const fieldErrors = longTargets.flatMap((item) => {
    const error = tailFieldsError(item.row.kind ?? "", item.row.shape ?? "") ?? sizeFieldError(item.row.kind as Kind, item.row.size ?? "");
    return error ? [`${item.row.emoji || item.row.concrete}: ${error}`] : [];
  });
  if (fieldErrors.length > 0) throw new Error(`five-letter rows need a kind, a shape and (by kind) a size:\n  ${fieldErrors.join("\n  ")}`);
  const shortRoots = new Set([...short.values(), ...kept.map((k) => k.root).filter((root) => root.length === 3)]);
  const tailRows: TailPlaceRow[] = [
    ...longTargets.map((item) => ({ kind: item.row.kind as Kind, shape: item.row.shape as Shape, size: (item.row.size || undefined) as Size | undefined, cmu: item.cmu })),
    ...keptLong.map((k) => ({ cmu: "", fixed: k.root })),
  ];
  const rowOfRoot = new Map<string, number>();
  longTargets.forEach((item, i) => {
    if (item.row.root) rowOfRoot.set(item.row.root, i);
  });
  keptLong.forEach((k, i) => rowOfRoot.set(k.root, longTargets.length + i));
  const tails = placeTailRoots({
    rows: tailRows,
    shortRoots,
    holderHosts,
    blocked: new Set([...taken].filter((form) => form.length === 5 && !rowOfRoot.has(form))),
    compounds: tailCompounds(compounds, rowOfRoot, shortRoots),
    steps: options.tailSteps,
  });
  if (tails.unmet.length > 0) throw new Error(`five-letter placement left checks unmet:\n  ${tails.unmet.join("\n  ")}`);
  const long = new Map(longTargets.map((item, i) => [item, tails.roots[i]!]));
  return targets.map((item) => {
    const root = item.eligible ? short.get(item)! : places.get(item) ?? long.get(item)!;
    return { emoji: item.row.emoji, concrete: item.row.concrete, root, length: root.length };
  });
}
