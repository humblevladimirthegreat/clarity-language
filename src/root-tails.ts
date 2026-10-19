/**
 * Root tails (proposal `root-tails.md`, phase 1): a five-letter root `V C V | C V` ends in a tail,
 * the second consonant naming the row's kind and the final vowel its shape. `data/lexicon-tails.csv`
 * holds the kind, shape and placed root of every published five-letter row, beside the live lexicon.
 * This file owns the letter map, the CSV, and the checks {@link validateTails} runs.
 */
import { escapeCsvField, parseCsv } from "./csv.ts";
import { factorizationsForStem, retieCompoundRows, type CompoundRow } from "./lexicon-compounds.ts";
import type { PublishedRow } from "./lexicon-search.ts";
import { isExtraNounHook } from "./parse/hook-compounds.ts";

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
  named: "n",
} as const;

/** Shape → final vowel. Named rows have none: their final vowel is free. */
export const SHAPE_VOWELS = {
  holds: "a",
  one: "o",
  line: "e",
  "takes-away": "u",
} as const;

export type Kind = keyof typeof KIND_LETTERS;
export type Shape = keyof typeof SHAPE_VOWELS;

/** The kind whose final vowel is free. */
export const FREE_VOWEL_KIND: Kind = "named";

export const TAILS_HEADERS = ["emoji", "concrete", "kind", "shape", "root"] as const;

export type TailRow = { emoji: string; concrete: string; kind: string; shape: string; root: string };

export function isKind(value: string): value is Kind {
  return Object.hasOwn(KIND_LETTERS, value);
}

export function isShape(value: string): value is Shape {
  return Object.hasOwn(SHAPE_VOWELS, value);
}

/** Tail letters for a row: consonant + vowel, or the consonant alone for a named row. */
export function tailOf(kind: Kind, shape: Shape | ""): string {
  return KIND_LETTERS[kind] + (shape ? SHAPE_VOWELS[shape] : "");
}

/** Key shared with the published row: emoji, and the concrete label for a seedless row. */
export function tailKey(row: { emoji: string; concrete: string }): string {
  return `${row.emoji.trim()}\t${row.concrete.trim()}`;
}

export function parseTailsCsv(text: string): TailRow[] {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== TAILS_HEADERS.join(",")) {
    throw new Error(`Unexpected lexicon-tails.csv header: ${headers.join(",")}`);
  }
  return rows.map((row) => ({
    emoji: row.emoji ?? "",
    concrete: row.concrete ?? "",
    kind: row.kind ?? "",
    shape: row.shape ?? "",
    root: row.root ?? "",
  }));
}

export function serializeTailsCsv(rows: readonly TailRow[]): string {
  const lines = [TAILS_HEADERS.join(","), ...rows.map((row) => TAILS_HEADERS.map((h) => escapeCsvField(row[h])).join(","))];
  return `${lines.join("\n")}\n`;
}

const HOOK_JOINS = new Set(["l", "m"]);

/**
 * A five-letter root with **l** / **m** second whose onset is a three-letter root: with an **-l** / **-m**
 * ending it spells that root + join + a two-letter hook (hook compounds by shape).
 */
export function hookClash(root: string, shortRoots: ReadonlySet<string>): boolean {
  return root.length === 5 && HOOK_JOINS.has(root[3]!) && shortRoots.has(root.slice(0, 3));
}

/** Old published root → tails root, for every five-letter row that has one; three-letter roots map to themselves. */
export function tailsRootMap(published: readonly PublishedRow[], tails: readonly TailRow[]): Map<string, string> {
  const byKey = new Map(tails.filter((row) => row.root).map((row) => [tailKey(row), row.root]));
  const map = new Map<string, string>();
  for (const row of published) {
    if (!row.root) continue;
    const next = row.root.length === 5 ? byKey.get(tailKey(row)) : row.root;
    if (next) map.set(row.root, next);
  }
  return map;
}

export type TailError = { key: string; reason: string };

/**
 * Checks `npm test` runs over `lexicon-tails.csv`: one row per published five-letter row and no
 * other; kind and shape from their closed sets (no shape on a named row); every placed root unique,
 * in its tail, clear of the hook check; every listed compound, spelled with the new roots, splits one way.
 * An empty root is a row added since the last `convert-word -- --tails` run and is not checked.
 */
export function validateTails(
  tails: readonly TailRow[],
  published: readonly PublishedRow[],
  compounds: readonly CompoundRow[],
): TailError[] {
  const errors: TailError[] = [];
  const longKeys = new Set(published.filter((row) => row.root.length === 5).map(tailKey));
  const shortRoots = new Set(published.map((row) => row.root).filter((root) => root.length === 3));
  const seenKeys = new Set<string>();
  const seenRoots = new Map<string, string>();

  for (const row of tails) {
    const key = tailKey(row);
    const label = row.emoji || row.concrete;
    if (seenKeys.has(key)) errors.push({ key: label, reason: "duplicate row" });
    seenKeys.add(key);
    if (!longKeys.has(key)) errors.push({ key: label, reason: "no published five-letter row with this emoji and concrete" });
    if (!isKind(row.kind)) {
      errors.push({ key: label, reason: `kind must be one of ${Object.keys(KIND_LETTERS).join(", ")} (got ${row.kind || "(empty)"})` });
      continue;
    }
    if (row.kind === FREE_VOWEL_KIND ? row.shape !== "" : !isShape(row.shape)) {
      errors.push({
        key: label,
        reason: row.kind === FREE_VOWEL_KIND
          ? `a named row has no shape (got ${row.shape})`
          : `shape must be one of ${Object.keys(SHAPE_VOWELS).join(", ")} (got ${row.shape || "(empty)"})`,
      });
      continue;
    }
    if (!row.root) continue;
    const tail = tailOf(row.kind, row.shape as Shape | "");
    if (!/^[aeou][bdghylmnrvwz][aeou][bdghylmnrvwz][aeou]$/.test(row.root)) {
      errors.push({ key: label, reason: `root ${row.root} is not V C V C V` });
    } else if (!row.root.slice(3).startsWith(tail)) {
      errors.push({ key: label, reason: `root ${row.root} does not end in its tail ${tail}` });
    }
    const earlier = seenRoots.get(row.root);
    if (earlier) errors.push({ key: label, reason: `root ${row.root} is also ${earlier}` });
    seenRoots.set(row.root, label);
    if (hookClash(row.root, shortRoots)) {
      errors.push({ key: label, reason: `root ${row.root} reads as ${row.root.slice(0, 3)} + join + hook before -l / -m` });
    }
  }
  for (const key of longKeys) {
    if (!seenKeys.has(key)) errors.push({ key: key.split("\t").find(Boolean) ?? key, reason: "published five-letter row missing from lexicon-tails.csv" });
  }

  const map = tailsRootMap(published, tails);
  const roots = new Set(map.values());
  const retied = retieCompoundRows(compounds as CompoundRow[], map).rows;
  retied.forEach((row, index) => {
    const original = compounds[index]!;
    // Hook compounds are the hook check's; a compound with an unplaced member is checked once it is placed.
    if (isExtraNounHook(original.right) || !map.has(original.left) || !map.has(original.right)) return;
    const splits = factorizationsForStem(row.stem, roots);
    if (splits.length > 1) {
      const alts = splits.map((s) => `${s.left}+${s.join}+${s.right}`).join(", ");
      errors.push({ key: original.stem, reason: `compound spelled ${row.stem} with the new roots splits two ways (${alts})` });
    }
  });
  return errors;
}

export type TailMetrics = {
  roots: number;
  /** Roots with a published root one letter away. */
  withNeighbor: number;
  corePairs: number;
  /** One-letter pairs by the position that differs: first vowel, first consonant, middle vowel, kind, shape. */
  pairsAt: number[];
};

/** Distinctiveness numbers for a set of five-letter roots; `core` marks the core ones. */
export function tailMetrics(roots: readonly string[], core: ReadonlySet<string>): TailMetrics {
  const set = new Set(roots);
  const neighbors = new Map<string, string[]>();
  for (const root of roots) {
    const out: string[] = [];
    for (let i = 0; i < root.length; i++) {
      for (const letter of i % 2 ? "bdghylmnrvwz" : "aeou") {
        if (letter === root[i]) continue;
        const other = root.slice(0, i) + letter + root.slice(i + 1);
        if (set.has(other)) out.push(other);
      }
    }
    neighbors.set(root, out);
  }
  let withNeighbor = 0;
  let corePairs = 0;
  const pairsAt = [0, 0, 0, 0, 0];
  for (const [root, list] of neighbors) {
    if (list.length > 0) withNeighbor++;
    for (const other of list) {
      if (other <= root) continue;
      if (core.has(root) && core.has(other)) corePairs++;
      pairsAt[[...root].findIndex((letter, i) => letter !== other[i])]!++;
    }
  }
  return { roots: roots.length, withNeighbor, corePairs, pairsAt };
}
