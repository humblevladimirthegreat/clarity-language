import { parseCsv } from "./csv.js";
import { isClarityRootShape } from "./word-converter.js";

export const COMPOUND_HEADERS = [
  "emoji",
  "stem",
  "left",
  "join",
  "right",
  "literal",
  "metaphorical",
  "mnemonic",
] as const;

export type CompoundJoin = "l" | "m" | "n" | "r";

export type CompoundRow = {
  emoji: string;
  stem: string;
  left: string;
  join: CompoundJoin;
  right: string;
  literal: string;
  metaphorical: string;
  mnemonic: string;
};

export type CompoundValidationError = {
  row?: number;
  stem?: string;
  reason: string;
};

const JOIN_LETTERS = new Set<string>(["l", "m", "n", "r"]);

/** Content roots are `V(CV)+` and not a bare single vowel (join / reviser shape). */
export function isCompoundMemberRoot(root: string): boolean {
  return isClarityRootShape(root) && root.length >= 3;
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
    literal: row.literal ?? "",
    metaphorical: row.metaphorical ?? "",
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
    if (!publishedRoots.has(right)) {
      errors.push({ row: rowNum, stem, reason: `right root not published: ${right}` });
    }
    if (!isCompoundMemberRoot(left)) {
      errors.push({ row: rowNum, stem, reason: `left is not a content root: ${left}` });
    }
    if (!isCompoundMemberRoot(right)) {
      errors.push({ row: rowNum, stem, reason: `right is not a content root: ${right}` });
    }

    if (publishedRoots.has(stem)) {
      errors.push({ row: rowNum, stem, reason: "stem is already a published simple root" });
    }

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

    if (!row.literal.trim()) {
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
