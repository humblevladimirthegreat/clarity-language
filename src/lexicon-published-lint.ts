import { normalizeEnglish } from "./lint/word-bank-docs.js";
import type { PublishedRow } from "./lexicon-search.js";

const INFLECTION_SUFFIXES = ["ing", "ed", "es", "s"] as const;
const MIN_STEM_LENGTH = 3;

export type PublishedSenseCollisionKind = "exact" | "related";

export type PublishedSenseError = {
  row: number;
  emoji: string;
  literal: string;
  metaphorical: string;
  kind: PublishedSenseCollisionKind;
  reason: string;
};

function addInflectionalForms(piece: string, into: Set<string>): void {
  into.add(piece);
  for (const suffix of INFLECTION_SUFFIXES) {
    if (piece.length > suffix.length + MIN_STEM_LENGTH - 1 && piece.endsWith(suffix)) {
      into.add(piece.slice(0, -suffix.length));
    }
  }
}

/** Citation lemmas plus inflectional alternates on the full string and each hyphen segment. */
export function englishCitationForms(lemma: string): Set<string> {
  const normalized = normalizeEnglish(lemma);
  const forms = new Set<string>();
  if (!normalized) {
    return forms;
  }
  addInflectionalForms(normalized, forms);
  for (const segment of normalized.split("-")) {
    if (segment) {
      addInflectionalForms(segment, forms);
    }
  }
  return forms;
}

export function literalMetaphorCollide(
  literal: string,
  metaphorical: string,
): { kind: PublishedSenseCollisionKind } | null {
  const litNorm = normalizeEnglish(literal);
  const metNorm = normalizeEnglish(metaphorical);
  if (!litNorm || !metNorm) {
    return null;
  }
  if (litNorm === metNorm) {
    return { kind: "exact" };
  }

  const litForms = englishCitationForms(literal);
  const metForms = englishCitationForms(metaphorical);
  for (const form of litForms) {
    if (metForms.has(form)) {
      return { kind: "related" };
    }
  }
  return null;
}

export function validatePublishedSenseSeparation(rows: PublishedRow[]): PublishedSenseError[] {
  const errors: PublishedSenseError[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!;
    const metaphorical = row.metaphorical.trim();
    if (!metaphorical) {
      continue;
    }

    const hit = literalMetaphorCollide(row.literal, metaphorical);
    if (!hit) {
      continue;
    }

    const reason =
      hit.kind === "exact"
        ? "metaphorical matches literal (same citation lemma)"
        : "metaphorical shares a citation form with literal (inflection or hyphen segment)";

    errors.push({
      row: index + 2,
      emoji: row.emoji,
      literal: row.literal,
      metaphorical,
      kind: hit.kind,
      reason,
    });
  }

  return errors;
}
