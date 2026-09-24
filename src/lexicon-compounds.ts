import { escapeCsvField, parseCsv } from "./csv.js";
import { isExtraNounHook } from "./parse/hook-compounds.js";
import { isClarityRootShape } from "./word-converter.js";

export const COMPOUND_HEADERS = [
  "emoji",
  "stem",
  "left",
  "join",
  "right",
  "concrete",
  "abstract",
  "mnemonic",
] as const;

export type CompoundJoin = "l" | "m" | "n" | "r";

export type CompoundRow = {
  emoji: string;
  stem: string;
  left: string;
  join: CompoundJoin;
  right: string;
  concrete: string;
  abstract: string;
  mnemonic: string;
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
    const right = isExtraNounHook(row.right) ? row.right : (map.get(row.right) ?? row.right);
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

/** Content roots are `V(CV)+` and not a bare single vowel (join / reviser shape). */
export function isCompoundMemberRoot(root: string): boolean {
  return isClarityRootShape(root) && root.length >= 3;
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
    emoji: row.emoji ?? "",
    stem: row.stem ?? "",
    left: row.left ?? "",
    join: (row.join ?? "") as CompoundJoin,
    right: row.right ?? "",
    concrete: row.concrete ?? "",
    abstract: row.abstract ?? "",
    mnemonic: row.mnemonic ?? "",
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

export function validateCompoundRows(
  rows: CompoundRow[],
  publishedRoots: ReadonlySet<string>,
): CompoundValidationError[] {
  const errors: CompoundValidationError[] = [];
  const seenStems = new Set<string>();

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

    if (!JOIN_LETTERS.has(join)) {
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
    if (hookRight) {
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
    }

    if (publishedRoots.has(stem)) {
      errors.push({ row: rowNum, stem, reason: "stem is already a published simple root" });
    }

    if (!hookRight) {
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

    if (!row.concrete.trim()) {
      errors.push({ row: rowNum, stem, reason: "missing literal gloss" });
    }
  }

  return errors;
}

export function assertValidCompoundRows(
  rows: CompoundRow[],
  publishedRoots: ReadonlySet<string>,
): void {
  const errors = validateCompoundRows(rows, publishedRoots);
  if (errors.length > 0) {
    const detail = errors.map((e) => `row ${e.row ?? "?"} ${e.stem ?? ""}: ${e.reason}`).join("\n");
    throw new Error(`Invalid lexicon-compounds.csv:\n${detail}`);
  }
}
