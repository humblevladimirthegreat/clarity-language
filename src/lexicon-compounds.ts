import { escapeCsvField, parseCsv } from "./csv.js";
import { isExtraNounHook } from "./parse/hook-compounds.js";
import { isAgebonRootShape } from "./root-shape.js";

export const COMPOUND_HEADERS = [
  "stem",
  "left",
  "join",
  "right",
  "concrete",
  "abstract",
  "mnemonic",
  "core",
] as const;

export type CompoundJoin = "l" | "m" | "n" | "r";

/** A tail-suffix row has no join: `left + suffix`. */
export type CompoundRowJoin = CompoundJoin | "";

export type CompoundRow = {
  stem: string;
  left: string;
  join: CompoundRowJoin;
  /** A published root, a two-letter extra-noun hook, or (with an empty join) a tail suffix. */
  right: string;
  concrete: string;
  abstract: string;
  mnemonic: string;
  /** Core vocabulary: anchor of the checkpoint that introduces this stem; empty when not core. */
  core?: string;
};

export type CompoundValidationError = {
  row?: number;
  stem?: string;
  reason: string;
};

export type CompoundRetieChange = {
  row: number;
  field: "left" | "right" | "stem";
  from: string;
  to: string;
};

/** Remap published member roots and recompute `stem = left + join + right`. */
export function retieCompoundRows(
  rows: CompoundRow[],
  map: ReadonlyMap<string, string>,
): { rows: CompoundRow[]; changes: CompoundRetieChange[] } {
  const changes: CompoundRetieChange[] = [];
  const next = rows.map((row, index) => {
    const left = map.get(row.left) ?? row.left;
    const right = isExtraNounHook(row.right) || isTailSuffix(row.right) ? row.right : (map.get(row.right) ?? row.right);
    const stem = `${left}${row.join}${right}`;
    const rowNum = index + 2;
    if (left !== row.left) {
      changes.push({ row: rowNum, field: "left", from: row.left, to: left });
    }
    if (right !== row.right) {
      changes.push({ row: rowNum, field: "right", from: row.right, to: right });
    }
    if (stem !== row.stem) {
      changes.push({ row: rowNum, field: "stem", from: row.stem, to: stem });
    }
    if (left === row.left && right === row.right && stem === row.stem) {
      return row;
    }
    return { ...row, left, right, stem };
  });
  return { rows: next, changes };
}

export function serializeCompoundCsv(rows: CompoundRow[]): string {
  const headers = [...COMPOUND_HEADERS];
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

const JOIN_LETTERS = new Set<string>(["l", "m", "n", "r"]);

/**
 * Tail-suffix heads: a kind consonant plus a job vowel (src/root-tails.ts). No `l` / `m` (the
 * hook-compound clash) or `r` (counting wants a specific head).
 */
const SUFFIX_CONSONANTS = new Set<string>(["z", "y", "b", "v", "h", "d", "w", "g", "n"]);
const SUFFIX_VOWELS = new Set<string>(["a", "o", "e", "u"]);

/** A two-letter kind + job tail that heads a listed compound on a five-letter left root. */
export function isTailSuffix(right: string): boolean {
  return right.length === 2 && SUFFIX_CONSONANTS.has(right[0]!) && SUFFIX_VOWELS.has(right[1]!);
}

/** Two three-letter members: never a listed shape, since that stem is also five letters + suffix. */
function isShortPair(left: string, right: string): boolean {
  return left.length === 3 && right.length === 3;
}

/** Content roots are `V(CV)+` and not a bare single vowel (join / reviser shape). */
export function isCompoundMemberRoot(root: string): boolean {
  return isAgebonRootShape(root) && root.length >= 3;
}

export type CompoundSplit = { left: string; join: CompoundJoin; right: string };

/** Every `left + join + right` reading of an x-less stem whose members pass `isRoot`. */
export function potentialCompoundSplits(
  stem: string,
  isRoot: (root: string) => boolean,
): CompoundSplit[] {
  const splits: CompoundSplit[] = [];
  for (let i = 1; i < stem.length - 1; i++) {
    const join = stem[i]!;
    if (!JOIN_LETTERS.has(join)) continue;
    const left = stem.slice(0, i);
    const right = stem.slice(i + 1);
    if (!isCompoundMemberRoot(left) || !isRoot(left)) continue;
    if (!isExtraNounHook(right) && (!isCompoundMemberRoot(right) || !isRoot(right))) continue;
    if (isShortPair(left, right)) continue;
    splits.push({ left, join: join as CompoundJoin, right });
  }
  return splits;
}

export function parseCompoundCsv(text: string): CompoundRow[] {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== COMPOUND_HEADERS.join(",")) {
    throw new Error(`Unexpected compound CSV header: ${headers.join(",")}`);
  }

  return rows.map((row) => ({
    stem: row.stem ?? "",
    left: row.left ?? "",
    join: (row.join ?? "") as CompoundRowJoin,
    right: row.right ?? "",
    concrete: row.concrete ?? "",
    abstract: row.abstract ?? "",
    mnemonic: row.mnemonic ?? "",
    core: row.core ?? "",
  }));
}

/** All published-root splits `L + join + R` that equal `stem`. */
export function factorizationsForStem(
  stem: string,
  publishedRoots: ReadonlySet<string>,
): Array<{ left: string; join: CompoundJoin; right: string }> {
  const hits: Array<{ left: string; join: CompoundJoin; right: string }> = [];
  for (let i = 1; i < stem.length - 1; i++) {
    const join = stem[i]!;
    if (!JOIN_LETTERS.has(join)) continue;
    const left = stem.slice(0, i);
    const right = stem.slice(i + 1);
    if (!publishedRoots.has(left) || !publishedRoots.has(right)) continue;
    if (!isCompoundMemberRoot(left) || !isCompoundMemberRoot(right)) continue;
    hits.push({ left, join: join as CompoundJoin, right });
  }
  return hits;
}

/**
 * `publishedSenses` (lowercase concrete and abstract glosses of the published rows) lets the check
 * catch a compound that only repeats a word the lexicon already has.
 */
export function validateCompoundRows(
  rows: CompoundRow[],
  publishedRoots: ReadonlySet<string>,
  publishedSenses: ReadonlySet<string> = new Set(),
): CompoundValidationError[] {
  const errors: CompoundValidationError[] = [];
  const seenStems = new Set<string>();
  const seenSenses = new Map<string, string>();

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!;
    const rowNum = index + 2;
    const stem = row.stem.trim();
    const left = row.left.trim();
    const right = row.right.trim();
    const join = row.join.trim();

    if (!stem) {
      errors.push({ row: rowNum, reason: "missing stem" });
      continue;
    }

    if (seenStems.has(stem)) {
      errors.push({ row: rowNum, stem, reason: `duplicate stem ${stem}` });
    }
    seenStems.add(stem);

    const suffix = !join && isTailSuffix(right);
    if (!JOIN_LETTERS.has(join) && !suffix) {
      errors.push({ row: rowNum, stem, reason: `join must be l, m, n, or r (got ${join || "(empty)"})` });
    }

    const expected = `${left}${join}${right}`;
    if (stem !== expected) {
      errors.push({
        row: rowNum,
        stem,
        reason: `stem must equal left+join+right (${expected})`,
      });
    }

    if (!publishedRoots.has(left)) {
      errors.push({ row: rowNum, stem, reason: `left root not published: ${left}` });
    }
    if (!isCompoundMemberRoot(left)) {
      errors.push({ row: rowNum, stem, reason: `left is not a content root: ${left}` });
    }

    const hookRight = isExtraNounHook(right);
    if (suffix) {
      if (left.length !== 5) {
        errors.push({ row: rowNum, stem, reason: `a tail suffix takes a five-letter left root (got ${left})` });
      }
    } else if (hookRight) {
      if (join !== "l" && join !== "m") {
        errors.push({
          row: rowNum,
          stem,
          reason: `hook compound join must be l or m (got ${join})`,
        });
      }
    } else {
      if (!publishedRoots.has(right)) {
        errors.push({ row: rowNum, stem, reason: `right root not published: ${right}` });
      }
      if (!isCompoundMemberRoot(right)) {
        errors.push({ row: rowNum, stem, reason: `right is not a content root: ${right}` });
      }
      if (isShortPair(left, right)) {
        errors.push({ row: rowNum, stem, reason: "3 + join + 3 is not a listed shape (use a tail suffix or a five-letter member)" });
      }
    }

    if (publishedRoots.has(stem)) {
      errors.push({ row: rowNum, stem, reason: "stem is already a published simple root" });
    }

    if (!hookRight && !suffix) {
      const factorizations = factorizationsForStem(stem, publishedRoots);
      if (factorizations.length === 0) {
        errors.push({ row: rowNum, stem, reason: "no legal published-root factorization" });
      } else if (factorizations.length > 1) {
        const alts = factorizations.map((f) => `${f.left}+${f.join}+${f.right}`).join(", ");
        errors.push({ row: rowNum, stem, reason: `ambiguous factorization (${alts})` });
      } else {
        const only = factorizations[0]!;
        if (only.left !== left || only.join !== join || only.right !== right) {
          errors.push({
            row: rowNum,
            stem,
            reason: `declared parts do not match unique factorization (${only.left}+${only.join}+${only.right})`,
          });
        }
      }
    }

    if (left && left === right) {
      errors.push({ row: rowNum, stem, reason: `left and right are the same root (${left})` });
    }

    if (!row.concrete.trim()) {
      errors.push({ row: rowNum, stem, reason: "missing literal gloss" });
    }
    if (!row.mnemonic.trim()) {
      errors.push({ row: rowNum, stem, reason: "missing mnemonic" });
    }

    for (const sense of [row.concrete, row.abstract]) {
      const key = sense.trim().toLowerCase();
      if (!key) continue;
      if (publishedSenses.has(key)) {
        errors.push({ row: rowNum, stem, reason: `gloss "${key}" is already a published sense` });
      }
      const earlier = seenSenses.get(key);
      if (earlier && earlier !== stem) {
        errors.push({ row: rowNum, stem, reason: `gloss "${key}" is already the sense of ${earlier}` });
      }
      seenSenses.set(key, stem);
    }
  }

  return errors;
}
