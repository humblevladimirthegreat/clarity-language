/**
 * Root tails (proposal `root-tails.md`, phase 1): a five-letter root `V C V | C V` ends in a tail,
 * the second consonant naming the row's kind and the final vowel its shape. `data/lexicon-tails.csv`
 * holds the kind, shape and placed root of every published five-letter row, beside the live lexicon.
 * This file owns the letter map, the CSV, and the checks {@link validateTails} runs.
 */
import { escapeCsvField, parseCsv } from "./csv.ts";
import { factorizationsForStem, retieCompoundRows, type CompoundRow } from "./lexicon-compounds.ts";
import type { OverlayRow, PublishedRow } from "./lexicon-search.ts";
import { HOLDER_HOST_KINDS } from "./parse/classify.ts";
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

/**
 * `/th/` sense forms that take a holder after their grade letter (`ugur`, `odor`: host root + **-l / -m / -r**,
 * knowing.md#holder). The classifier reads any `/th/` stem that starts with one and is not a published root
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

/** The onset checks a placed root must pass: the hook check and the holder check. */
export function onsetClash(root: string, shortRoots: ReadonlySet<string>, holderHosts: ReadonlySet<string> = new Set()): boolean {
  return hookClash(root, shortRoots) || holderClash(root, holderHosts);
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
 * in its tail, clear of the hook and holder checks; every listed compound, spelled with the new roots, splits one way.
 * An empty root is a row added since the last `convert-word -- --tails` run and is not checked.
 */
export function validateTails(
  tails: readonly TailRow[],
  published: readonly PublishedRow[],
  compounds: readonly CompoundRow[],
  /** {@link holderHostForms} of the live overlays. */
  holderHosts: ReadonlySet<string> = new Set(),
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
    if (holderClash(row.root, holderHosts)) {
      errors.push({ key: label, reason: `root ${row.root} starts with the holder host ${row.root.slice(0, 4)}: its compounds read as a holder seam on /th/` });
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

/**
 * First-consonant pairs that sound alike: same manner of articulation, differing in place
 * (stops, nasals, approximants, voiced fricatives), and `v` / `b`.
 */
const CONFUSABLE = new Set(["bd", "bg", "dg", "mn", "lr", "rw", "wy", "vz", "bv"]);

export function confusable(a: string, b: string): boolean {
  return CONFUSABLE.has(a < b ? a + b : b + a);
}

export type TailMetrics = {
  /** Same-kind one-letter pairs by the position that differs: first vowel, first consonant, middle vowel, second consonant, final vowel. */
  sameKindAt: number[];
  /** Of the same-kind first-consonant pairs, those between letters that sound alike. */
  confusableFirst: number;
  /** Same-kind two-letter pairs. */
  sameKindNear: number;
  /** One-letter pairs across kinds: told apart by the tail, so not counted as confusing. */
  crossKind: number;
};

/** Pair counts for five-letter roots, each with its row's kind. */
export function tailMetrics(entries: readonly { root: string; kind: string }[]): TailMetrics {
  const sameKindAt = [0, 0, 0, 0, 0];
  let confusableFirst = 0;
  let sameKindNear = 0;
  let crossKind = 0;
  for (let i = 0; i < entries.length; i++) {
    const a = entries[i]!;
    for (let j = i + 1; j < entries.length; j++) {
      const b = entries[j]!;
      let distance = 0;
      let at = -1;
      for (let k = 0; k < 5 && distance < 3; k++) {
        if (a.root[k] !== b.root[k]) {
          distance++;
          at = k;
        }
      }
      const sameKind = a.kind === b.kind;
      if (distance === 1 && !sameKind) crossKind++;
      if (distance === 1 && sameKind) {
        sameKindAt[at]!++;
        if (at === 1 && confusable(a.root[1]!, b.root[1]!)) confusableFirst++;
      }
      if (distance === 2 && sameKind) sameKindNear++;
    }
  }
  return { sameKindAt, confusableFirst, sameKindNear, crossKind };
}
