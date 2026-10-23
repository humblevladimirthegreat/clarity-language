/**
 * Respell an English person or place name as a place-name root (singability.md#place-name-roots).
 * Same algorithm as `convert-word --kind named`. No file access.
 */
import { lookupPronunciationIn } from "./cmu-lookup.ts";
import { stripFlagSuffix } from "./flag-label.ts";
import type { PublishedRow } from "./lexicon-search.ts";
import { mappedSourceLetters } from "./letter-map.ts";
import { finishPlaceLetters, placeRoot } from "./place-root.ts";
import { PLACE_KIND } from "./root-tails.ts";

export type NamePiece = {
  source: string;
  root: string;
  /** Named citation: root + **-n**. */
  citation: string;
  /** `cmu` matches convert-word; `letters` is a spelling fallback when CMU has no entry. */
  via: "cmu" | "letters";
};

export type PublishedName = {
  root: string;
  citation: string;
  emoji: string;
  concrete: string;
  abstract: string;
};

export type NameRespell = {
  query: string;
  /** One name for the whole input (a country, a hyphenated given name). */
  whole: NamePiece;
  /** Space-separated given + family, when that is not already a published place. */
  fullName?: { given: NamePiece; family: NamePiece[] };
  published: PublishedName | null;
};

function citationOf(root: string): string {
  return `${root}n`;
}

function pieceFromCmu(source: string, phones: string): NamePiece {
  const root = placeRoot(phones);
  return { source, root, citation: citationOf(root), via: "cmu" };
}

function pieceFromLetters(source: string): NamePiece {
  const root = finishPlaceLetters(mappedSourceLetters(source).join(""));
  return { source, root, citation: citationOf(root), via: "letters" };
}

function pieceOf(source: string, cmu: Map<string, string[]> | null): NamePiece {
  const phones = cmu ? lookupPronunciationIn(cmu, source) : undefined;
  if (phones) return pieceFromCmu(source, phones);
  return pieceFromLetters(source);
}

function toPublished(row: PublishedRow): PublishedName {
  return {
    root: row.root,
    citation: citationOf(row.root),
    emoji: row.emoji,
    concrete: row.concrete,
    abstract: row.abstract,
  };
}

function normKey(text: string): string {
  return text.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

/** A published `named` row for this query, or null. */
export function matchNamedRow(query: string, rows: readonly PublishedRow[]): PublishedRow | null {
  const q = normKey(query);
  if (!q) return null;
  const qSpaced = q.replace(/-/g, " ");
  for (const row of rows) {
    if (row.kind !== PLACE_KIND || !row.root) continue;
    const label = normKey(stripFlagSuffix(row.concrete));
    if (label === q || label === qSpaced || normKey(row.concrete) === q || row.root === query.trim().toLowerCase()) {
      return row;
    }
    if ((row.englishAliases ?? []).some((alias) => normKey(alias) === q || alias.toLowerCase() === qSpaced)) {
      return row;
    }
  }
  return null;
}

/**
 * Respell `query` as a place-name root. `cmu` null uses the letter fallback for every piece.
 */
export function respellEnglishName(
  query: string,
  cmu: Map<string, string[]> | null,
  rows: readonly PublishedRow[] = [],
): NameRespell {
  const trimmed = query.trim();
  if (!trimmed) throw new Error("Type a name");
  const publishedRow = matchNamedRow(trimmed, rows);
  const whole = pieceOf(trimmed, cmu);
  const words = trimmed.split(/\s+/).filter(Boolean);
  let fullName: NameRespell["fullName"];
  if (!publishedRow && words.length >= 2 && !trimmed.includes("-")) {
    fullName = {
      given: pieceOf(words[0]!, cmu),
      family: words.slice(1).map((word) => pieceOf(word, cmu)),
    };
  }
  return {
    query: trimmed,
    whole,
    fullName,
    published: publishedRow ? toPublished(publishedRow) : null,
  };
}
