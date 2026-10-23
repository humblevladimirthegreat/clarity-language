/**
 * Root tails: a root ends in a tail, the last consonant naming the row's kind and the final vowel
 * its job. A five-letter root is `V C V | C V`; a three-letter root is `V | C V` (no size). The
 * `kind` and `shape` columns of `data/lexicon-published.csv` record each row's tail; the `size`
 * column steers a five-letter row's middle vowel. This file owns the letter map and the checks
 * {@link validateRootTails} runs; the placer is src/root-tails-place.ts. A `named` row (a country or
 * territory) takes a place-name root instead (src/place-root.ts), with no tail.
 */
import { ENGLISH_IN_CODE } from "./english-in-code.ts";
import { isFlagLabel } from "./flag-label.ts";
import { isPlaceRootShape } from "./root-shape.ts";
import type { OverlayRow, PublishedRow } from "./lexicon-search.ts";
import { HOLDER_HOST_KINDS } from "./parse/classify.ts";

/** Kind → second consonant. */
export const KIND_LETTERS = {
  creature: "z",
  person: "y",
  mind: "m",
  body: "b",
  doing: "v",
  place: "h",
  nature: "l",
  food: "d",
  tool: "w",
  sign: "g",
  counting: "r",
  title: "n",
} as const;

/** Job → final vowel. */
export const SHAPE_VOWELS = {
  holds: "a",
  one: "e",
  order: "o",
  "takes-away": "u",
} as const;

/** Size → middle vowel. A placement preference, not a check: the placer gives up a size vowel only in a crowded cell. `none` is anything you can't measure: a stuff, an act, a mark, a time. */
export const SIZE_VOWELS = {
  big: "a",
  medium: "o",
  small: "e",
  none: "u",
} as const;

export type Kind = keyof typeof KIND_LETTERS;
export type Shape = keyof typeof SHAPE_VOWELS;
export type Size = keyof typeof SIZE_VOWELS;

/** Kinds with no size: every feeling would be `none`, which says nothing the consonant hasn't. Every other kind needs one. */
export const UNSIZED_KINDS: ReadonlySet<Kind> = new Set(["mind"]);

/** The `kind` of a country or territory row, which takes a place-name root and no tail. */
export const PLACE_KIND = "named";

export function isKind(value: string): value is Kind {
  return Object.hasOwn(KIND_LETTERS, value);
}

export function isShape(value: string): value is Shape {
  return Object.hasOwn(SHAPE_VOWELS, value);
}

export function isSize(value: string): value is Size {
  return Object.hasOwn(SIZE_VOWELS, value);
}

/** Tail letters for a row: consonant + vowel. */
export function tailOf(kind: Kind, shape: Shape): string {
  return KIND_LETTERS[kind] + SHAPE_VOWELS[shape];
}

/** Keep a three-letter root's first vowel; rewrite the tail from kind and shape. */
export function shortRootWithTail(root: string, kind: Kind, shape: Shape): string {
  if (root.length !== 3) throw new Error(`shortRootWithTail needs a three-letter root (got ${root})`);
  return root[0] + tailOf(kind, shape);
}

/** Last vowel each shape currently uses on published three- and five-letter roots. */
export function shapeLastVowelsFromRoots(rows: readonly { root: string; shape?: string }[]): Map<Shape, string> {
  const found = new Map<Shape, string>();
  for (const row of rows) {
    if (!row.shape || !isShape(row.shape)) continue;
    const root = row.root.trim();
    if (root.length !== 3 && root.length !== 5) continue;
    const vowel = root.at(-1)!;
    const prev = found.get(row.shape);
    if (prev && prev !== vowel) {
      throw new Error(`shape ${row.shape} has mixed last vowels ${prev} and ${vowel}`);
    }
    found.set(row.shape, vowel);
  }
  return found;
}

/** Invert {@link shapeLastVowelsFromRoots}: last vowel → shape. */
export function invertShapeLastVowels(shapeToVowel: ReadonlyMap<Shape, string>): Map<string, Shape> {
  const out = new Map<string, Shape>();
  for (const [shape, vowel] of shapeToVowel) {
    const prev = out.get(vowel);
    if (prev && prev !== shape) {
      throw new Error(`last vowel ${vowel} maps to both ${prev} and ${shape}`);
    }
    out.set(vowel, shape);
  }
  return out;
}

export type ShortLastVowelPair = {
  emoji: string;
  literal: string;
  oldRoot: string;
  newRoot: string;
};

type ShortLastVowelRow = {
  root: string;
  kind?: string;
  shape?: string;
  emoji?: string;
  concrete?: string;
};

/**
 * Plan a simultaneous last-vowel rewrite for three-letter tails. First vowel stays.
 * `blocked` is overlay sense forms and other spellings no dest may take unless its
 * occupant is itself leaving. English-in-code dests fail unless they already hold that root.
 */
export function planShortLastVowels(
  rows: readonly ShortLastVowelRow[],
  blocked: ReadonlySet<string> = new Set(),
): { pairs: ShortLastVowelPair[]; destByOld: Map<string, string> } {
  const items: ShortLastVowelPair[] = [];
  for (const row of rows) {
    const oldRoot = row.root.trim();
    if (oldRoot.length !== 3) continue;
    if (tailFieldsError(row.kind ?? "", row.shape ?? "")) continue;
    const newRoot = shortRootWithTail(oldRoot, row.kind as Kind, row.shape as Shape);
    items.push({
      emoji: (row.emoji ?? "").trim(),
      literal: (row.concrete ?? "").trim(),
      oldRoot,
      newRoot,
    });
  }
  const leaving = new Set(items.filter((item) => item.oldRoot !== item.newRoot).map((item) => item.oldRoot));
  const byDest = new Map<string, ShortLastVowelPair[]>();
  for (const item of items) {
    const group = byDest.get(item.newRoot) ?? [];
    group.push(item);
    byDest.set(item.newRoot, group);
  }
  const errors: string[] = [];
  for (const [dest, group] of byDest) {
    const olds = [...new Set(group.map((item) => item.oldRoot))];
    if (olds.length > 1) errors.push(`short last-vowel dest ${dest} claimed by ${olds.join(", ")}`);
    const incoming = group.some((item) => item.oldRoot !== dest);
    if (incoming && ENGLISH_IN_CODE.has(dest)) {
      errors.push(`short last-vowel dest ${dest} is English in code`);
    }
    if (incoming && blocked.has(dest) && !leaving.has(dest)) {
      errors.push(`short last-vowel dest ${dest} is blocked`);
    }
  }
  if (errors.length > 0) throw new Error(errors.join("\n"));
  return {
    pairs: items.filter((item) => item.oldRoot !== item.newRoot),
    destByOld: new Map(items.map((item) => [item.oldRoot, item.newRoot])),
  };
}

/** Why a kind / shape pair can't spell a tail, or null when it can. */
export function tailFieldsError(kind: string, shape: string): string | null {
  if (kind === PLACE_KIND) return `a ${PLACE_KIND} row takes a place-name root, not a tail`;
  if (!isKind(kind)) return `kind must be one of ${Object.keys(KIND_LETTERS).join(", ")} (got ${kind || "(empty)"})`;
  return isShape(shape) ? null : `shape must be one of ${Object.keys(SHAPE_VOWELS).join(", ")} (got ${shape || "(empty)"})`;
}

/** Why a five-letter row's size doesn't fit its kind, or null when it does. */
export function sizeFieldError(kind: Kind, size: string): string | null {
  if (size && !isSize(size)) return `size must be one of ${Object.keys(SIZE_VOWELS).join(", ")} (got ${size})`;
  if (UNSIZED_KINDS.has(kind)) return size ? `a ${kind} row has no size (got ${size})` : null;
  if (!size) return `a ${kind} row needs a size`;
  return null;
}

/**
 * `/th/` sense forms that take a holder after their grade letter (`ugur`, `odor`: host root + **-l / -m / -r**,
 * holder.md#holder). The classifier reads any `/th/` stem that starts with one and is not a published root
 * as a holder seam ([`holderSeam`](parse/classify.ts)).
 */
export function holderHostForms(overlays: Iterable<OverlayRow>): Set<string> {
  const forms = new Set<string>();
  for (const row of overlays) if (row.pos === "th" && HOLDER_HOST_KINDS.has(row.kind)) forms.add(row.senseForm);
  return forms;
}

/**
 * A five-letter root that starts with a holder host form (`ugur` + `u`): every compound and hook compound
 * built on it reads on `/th/` as that host + grade + a holder (`thugurumamol` = DEDUCED.weak of `umamo`).
 * Only an **l / m / r** second consonant can spell a grade, so the second-consonant ban used to rule it out.
 */
export function holderClash(root: string, holderHosts: ReadonlySet<string>): boolean {
  return root.length === 5 && holderHosts.has(root.slice(0, 4));
}

export type TailError = { key: string; reason: string };

/**
 * Checks `npm test` and `check-compounds` run over the published lexicon: every three- or five-letter
 * row has a kind and shape from their closed sets and a root that ends in its tail; a five-letter row
 * also has a size unless its kind is unsized, and clears the holder check; a three-letter row has no
 * size; a `named` row has no shape or size and a place-name root no other place shares. The middle
 * vowel is not checked. Listed compounds that split two ways are `validateCompoundRows`'.
 */
export function validateRootTails(
  published: readonly PublishedRow[],
  /** {@link holderHostForms} of the overlays. */
  holderHosts: ReadonlySet<string> = new Set(),
): TailError[] {
  const errors: TailError[] = [];
  const places = new Map<string, string>();
  for (const row of published) {
    const key = row.emoji || row.concrete;
    const kind = row.kind ?? "";
    const shape = row.shape ?? "";
    const size = row.size ?? "";
    if (kind === PLACE_KIND) {
      if (shape) errors.push({ key, reason: `a ${PLACE_KIND} row has no shape (got ${shape})` });
      if (size) errors.push({ key, reason: `a ${PLACE_KIND} row has no size (got ${size})` });
      if (!isPlaceRootShape(row.root)) errors.push({ key, reason: `root ${row.root} is not a place-name root` });
      const other = places.get(row.root);
      if (other) errors.push({ key, reason: `place-name root ${row.root} is also ${other}'s` });
      places.set(row.root, key);
      continue;
    }
    if (row.root.length === 3) {
      const fields = tailFieldsError(kind, shape);
      if (fields) errors.push({ key, reason: fields });
      else {
        const tail = tailOf(kind as Kind, shape as Shape);
        if (row.root.slice(1) !== tail) errors.push({ key, reason: `root ${row.root} does not end in its tail ${tail}` });
      }
      if (size) errors.push({ key, reason: `a three-letter row has no size (got ${size})` });
      continue;
    }
    if (row.root.length !== 5) {
      errors.push({ key, reason: `a ${row.root.length}-letter root has no kind, shape or size` });
      continue;
    }
    const fields = tailFieldsError(kind, shape);
    if (fields) {
      errors.push({ key, reason: fields });
      continue;
    }
    const sizeError = sizeFieldError(kind as Kind, size);
    if (sizeError) errors.push({ key, reason: sizeError });
    const tail = tailOf(kind as Kind, shape as Shape);
    if (!row.root.slice(3).startsWith(tail)) errors.push({ key, reason: `root ${row.root} does not end in its tail ${tail}` });
    if (holderClash(row.root, holderHosts)) {
      errors.push({ key, reason: `root ${row.root} starts with the holder host ${row.root.slice(0, 4)}: its compounds read as a holder seam on /th/` });
    }
  }
  return errors;
}

/** Prefixes a kind spreads over: first vowel × first consonant. */
export const PREFIXES = 4 * 12;

/** Fewest confusing pairs `n` roots of one kind can have: spread evenly over the {@link PREFIXES}. */
export function evenSpreadPairs(n: number): number {
  const q = Math.floor(n / PREFIXES);
  const r = n % PREFIXES;
  return r * ((q + 1) * q) / 2 + (PREFIXES - r) * (q * (q - 1)) / 2;
}

/** Same-kind pairs among `n` roots: every one of these could be confusing if the onsets matched. */
export function possiblePairs(n: number): number {
  return (n * (n - 1)) / 2;
}

/**
 * A confusing pair is two roots of the same kind whose first two letters match. Nothing else counts:
 * roots of different kinds are told apart by the tail.
 */
export type TailMetrics = {
  /** Confusing pairs. */
  confusing: number;
  /** Pairs where both roots are country or territory flags. */
  flag: number;
  /** Pairs where neither root is a flag. */
  nonFlag: number;
  /** Pairs of one flag and one other same-kind root. */
  mixed: number;
  /** Same-kind pairs that could be confusing if their first two letters matched. */
  possible: number;
  flagPossible: number;
  nonFlagPossible: number;
  mixedPossible: number;
  flagRows: number;
  nonFlagRows: number;
  /** Rows and confusing pairs per kind. */
  byKind: Map<string, { rows: number; pairs: number; possible: number }>;
};

export type TailMetricRow = { root: string; kind: string; concrete?: string };

/** Confusing-pair counts for five-letter roots, each with its row's kind. */
export function tailMetrics(entries: readonly TailMetricRow[]): TailMetrics {
  const buckets = new Map<string, { flag: number; other: number }>();
  const split = new Map<string, { flag: number; other: number }>();
  for (const { root, kind, concrete } of entries) {
    const flag = concrete !== undefined && isFlagLabel(concrete);
    const key = `${kind}\t${root.slice(0, 2)}`;
    const bucket = buckets.get(key) ?? { flag: 0, other: 0 };
    if (flag) bucket.flag++;
    else bucket.other++;
    buckets.set(key, bucket);
    const counts = split.get(kind) ?? { flag: 0, other: 0 };
    if (flag) counts.flag++;
    else counts.other++;
    split.set(kind, counts);
  }
  const byKind = new Map<string, { rows: number; pairs: number; possible: number }>();
  let flag = 0;
  let nonFlag = 0;
  let mixed = 0;
  for (const [key, bucket] of buckets) {
    const kind = key.slice(0, key.indexOf("\t"));
    const entry = byKind.get(kind) ?? { rows: 0, pairs: 0, possible: 0 };
    const rows = bucket.flag + bucket.other;
    entry.rows += rows;
    entry.pairs += possiblePairs(rows);
    byKind.set(kind, entry);
    flag += possiblePairs(bucket.flag);
    nonFlag += possiblePairs(bucket.other);
    mixed += bucket.flag * bucket.other;
  }
  let flagRows = 0;
  let nonFlagRows = 0;
  let flagPossible = 0;
  let nonFlagPossible = 0;
  let mixedPossible = 0;
  for (const [kind, counts] of split) {
    const rows = counts.flag + counts.other;
    const entry = byKind.get(kind)!;
    entry.possible = possiblePairs(rows);
    flagRows += counts.flag;
    nonFlagRows += counts.other;
    flagPossible += possiblePairs(counts.flag);
    nonFlagPossible += possiblePairs(counts.other);
    mixedPossible += counts.flag * counts.other;
  }
  return {
    confusing: flag + nonFlag + mixed,
    flag,
    nonFlag,
    mixed,
    possible: flagPossible + nonFlagPossible + mixedPossible,
    flagPossible,
    nonFlagPossible,
    mixedPossible,
    flagRows,
    nonFlagRows,
    byKind,
  };
}
