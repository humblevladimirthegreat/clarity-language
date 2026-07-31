import MiniSearch from "minisearch";

import { parseCsv } from "./csv.js";

export type PublishedRow = {
  emoji: string;
  literal: string;
  clarity: string;
  metaphorical: string;
  mnemonic: string;
};

export type LexiconSearchResult = PublishedRow & {
  score: number;
  matchFields: string[];
};

type IndexedDoc = PublishedRow & {
  id: number;
  literalTokens: string;
};

const SEARCH_FIELDS = ["literal", "literalTokens", "clarity", "metaphorical", "mnemonic"] as const;

const FIELD_BOOSTS: Record<(typeof SEARCH_FIELDS)[number], number> = {
  literal: 2,
  metaphorical: 2,
  clarity: 1.5,
  literalTokens: 1.5,
  mnemonic: 1,
};

const SEARCH_OPTIONS = {
  boost: FIELD_BOOSTS,
  fuzzy: 0.2,
  prefix: true,
};

const EMOJI_QUERY_RE = /\p{Extended_Pictographic}/u;

const MATCH_FIELD_LABELS: Record<string, string> = {
  literal: "literal",
  literalTokens: "literal",
  clarity: "clarity",
  metaphorical: "metaphorical",
  mnemonic: "mnemonic",
  emoji: "emoji",
};

export function parsePublishedCsv(text: string): PublishedRow[] {
  const { headers, rows } = parseCsv(text);
  const expected = ["emoji", "literal", "clarity", "metaphorical", "mnemonic"];
  if (headers.join(",") !== expected.join(",")) {
    throw new Error(`Unexpected CSV header: ${headers.join(",")}`);
  }

  return rows.map((row) => ({
    emoji: row.emoji ?? "",
    literal: row.literal ?? "",
    clarity: row.clarity ?? "",
    metaphorical: row.metaphorical ?? "",
    mnemonic: row.mnemonic ?? "",
  }));
}

export function tokenizeLiteral(literal: string): string {
  const base = literal.trim().toLowerCase();
  if (!base) return "";

  const parts = base.split("-").filter(Boolean);
  if (parts.length <= 1) return base;
  return `${parts.join(" ")} ${base}`;
}

export function createLexiconIndex(rows: PublishedRow[]): MiniSearch<IndexedDoc> {
  const docs: IndexedDoc[] = rows.map((row, id) => ({
    id,
    emoji: row.emoji,
    literal: row.literal.toLowerCase(),
    literalTokens: tokenizeLiteral(row.literal),
    clarity: row.clarity.toLowerCase(),
    metaphorical: row.metaphorical.toLowerCase(),
    mnemonic: row.mnemonic.toLowerCase(),
  }));

  const index = new MiniSearch<IndexedDoc>({
    fields: [...SEARCH_FIELDS],
    storeFields: ["emoji", "literal", "clarity", "metaphorical", "mnemonic"],
    searchOptions: SEARCH_OPTIONS,
  });

  index.addAll(docs);
  return index;
}

function normalizeMatchFields(match: Record<string, unknown> | undefined): string[] {
  if (!match) return [];
  const labels = new Set<string>();
  for (const field of Object.keys(match)) {
    const label = MATCH_FIELD_LABELS[field] ?? field;
    labels.add(label);
  }
  return [...labels].sort();
}

function queryHasEmoji(query: string): boolean {
  return EMOJI_QUERY_RE.test(query);
}

function findEmojiMatches(rows: PublishedRow[], query: string): LexiconSearchResult[] {
  if (!queryHasEmoji(query)) return [];

  return rows
    .map((row, id) => ({ row, id }))
    .filter(({ row }) => row.emoji.includes(query))
    .map(({ row, id }) => ({
      ...row,
      score: 10,
      matchFields: ["emoji"],
    }));
}

function exactMatchBoost(row: PublishedRow, query: string): { boost: number; fields: string[] } {
  const q = query.toLowerCase();
  let boost = 0;
  const fields: string[] = [];

  if (row.literal.toLowerCase() === q) {
    boost += 100;
    fields.push("literal");
  }
  if (row.clarity.toLowerCase() === q) {
    boost += 100;
    fields.push("clarity");
  }
  if (row.metaphorical.toLowerCase() === q) {
    boost += 100;
    fields.push("metaphorical");
  }
  if (row.mnemonic.toLowerCase() === q) {
    boost += 50;
    fields.push("mnemonic");
  }

  return { boost, fields };
}

export function searchLexicon(
  index: MiniSearch<IndexedDoc>,
  rows: PublishedRow[],
  query: string,
  opts?: { limit?: number },
): LexiconSearchResult[] {
  const trimmed = query.trim();
  const limit = opts?.limit;

  if (!trimmed) {
    const all = rows.map((row) => ({
      ...row,
      score: 0,
      matchFields: [] as string[],
    }));
    return limit === undefined ? all : all.slice(0, limit);
  }

  const emojiResults = findEmojiMatches(rows, trimmed);
  const merged = new Map<number, LexiconSearchResult>();

  for (const hit of index.search(trimmed, SEARCH_OPTIONS)) {
    const row = rows[hit.id as number]!;
    const exact = exactMatchBoost(row, trimmed);
    merged.set(hit.id as number, {
      ...row,
      score: hit.score + exact.boost,
      matchFields: [...new Set([...normalizeMatchFields(hit.match), ...exact.fields])].sort(),
    });
  }

  for (const result of emojiResults) {
    const id = rows.findIndex((row) => row.emoji === result.emoji);
    if (id < 0) continue;
    const exact = exactMatchBoost(rows[id]!, trimmed);
    const boosted = {
      ...result,
      score: result.score + exact.boost,
      matchFields: [...new Set([...result.matchFields, ...exact.fields])].sort(),
    };
    const existing = merged.get(id);
    if (existing) {
      merged.set(id, {
        ...existing,
        score: Math.max(existing.score, boosted.score),
        matchFields: [...new Set([...existing.matchFields, ...boosted.matchFields])].sort(),
      });
    } else {
      merged.set(id, boosted);
    }
  }

  // Exact-only rows that MiniSearch may miss on very short queries.
  if (merged.size === 0) {
    rows.forEach((row, id) => {
      const exact = exactMatchBoost(row, trimmed);
      if (exact.boost > 0) {
        merged.set(id, {
          ...row,
          score: exact.boost,
          matchFields: exact.fields,
        });
      }
    });
  }

  const sorted = [...merged.values()].sort((a, b) => b.score - a.score);
  const effectiveLimit = limit ?? 20;
  return sorted.slice(0, effectiveLimit);
}
