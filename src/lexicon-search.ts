import MiniSearch from "minisearch";

import { parseCsv } from "./csv.js";

export type PublishedRow = {
  emoji: string;
  literal: string;
  clarity: string;
  metaphorical: string;
  mnemonic: string;
};

export type OverlayRow = {
  senseForm: string;
  pos: string;
  emoji: string;
  definition: string;
  mnemonic: string;
};

export type LexiconSearchResult = PublishedRow & {
  score: number;
  matchFields: string[];
  overlays: OverlayRow[];
  overlayOnly?: boolean;
};

type IndexedDoc = PublishedRow & {
  id: number;
  literalTokens: string;
};

type OverlayIndexedDoc = {
  id: number;
  senseForm: string;
  writtenForm: string;
  pos: string;
  emoji: string;
  root: string;
  definition: string;
  mnemonic: string;
};

const PUBLISHED_HEADERS = ["emoji", "literal", "clarity", "metaphorical", "mnemonic"] as const;
const OVERLAY_HEADERS = ["sense_form", "pos", "emoji", "definition", "mnemonic"] as const;

const SEARCH_FIELDS = ["literal", "literalTokens", "clarity", "metaphorical", "mnemonic"] as const;
const OVERLAY_SEARCH_FIELDS = ["senseForm", "writtenForm", "root", "pos", "definition", "mnemonic"] as const;

const FIELD_BOOSTS: Record<(typeof SEARCH_FIELDS)[number], number> = {
  literal: 2,
  metaphorical: 2,
  clarity: 1.5,
  literalTokens: 1.5,
  mnemonic: 1,
};

const OVERLAY_FIELD_BOOSTS: Record<(typeof OVERLAY_SEARCH_FIELDS)[number], number> = {
  senseForm: 2,
  writtenForm: 2.5,
  root: 1.5,
  definition: 2,
  mnemonic: 1,
  pos: 1,
};

const SEARCH_OPTIONS = {
  boost: FIELD_BOOSTS,
  fuzzy: 0.2,
  prefix: true,
};

const OVERLAY_SEARCH_OPTIONS = {
  boost: OVERLAY_FIELD_BOOSTS,
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
  senseForm: "sense_form",
  writtenForm: "sense_form",
  root: "sense_form",
  pos: "pos",
  definition: "definition",
};

export function parsePublishedCsv(text: string): PublishedRow[] {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== PUBLISHED_HEADERS.join(",")) {
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

export function parseOverlayCsv(text: string): OverlayRow[] {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== OVERLAY_HEADERS.join(",")) {
    throw new Error(`Unexpected overlay CSV header: ${headers.join(",")}`);
  }

  const seen = new Set<string>();
  const overlays: OverlayRow[] = [];

  for (const row of rows) {
    const senseForm = (row.sense_form ?? "").trim();
    const pos = (row.pos ?? "").trim();
    if (!senseForm || !pos) continue;

    const key = `${senseForm}\0${pos}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate overlay key: ${senseForm} + ${pos}`);
    }
    seen.add(key);

    overlays.push({
      senseForm,
      pos,
      emoji: (row.emoji ?? "").trim(),
      definition: (row.definition ?? "").trim(),
      mnemonic: (row.mnemonic ?? "").trim(),
    });
  }

  return overlays;
}

export function senseFormRoot(senseForm: string): string {
  const match = senseForm.match(/^(.+)([lmnr])$/);
  return match ? match[1]! : senseForm;
}

export function senseFormEnding(senseForm: string): string | null {
  const match = senseForm.match(/([lmnr])$/);
  return match ? match[1]! : null;
}

/** Full spelled overlay word: PoS prefix + sense-form (no PoS in the CSV stem). */
export function overlayWrittenForm(overlay: Pick<OverlayRow, "senseForm" | "pos">): string {
  return `${overlay.pos}${overlay.senseForm}`;
}

export function tokenizeLiteral(literal: string): string {
  const base = literal.trim().toLowerCase();
  if (!base) return "";

  const parts = base.split("-").filter(Boolean);
  if (parts.length <= 1) return base;
  return `${parts.join(" ")} ${base}`;
}

export function attachOverlays(rows: PublishedRow[], overlays: OverlayRow[]): Map<number, OverlayRow[]> {
  const byEmoji = new Map<string, OverlayRow[]>();
  const byRootEnding = new Map<string, OverlayRow[]>();

  for (const overlay of overlays) {
    if (overlay.emoji) {
      const list = byEmoji.get(overlay.emoji) ?? [];
      list.push(overlay);
      byEmoji.set(overlay.emoji, list);
    }

    const ending = senseFormEnding(overlay.senseForm);
    const root = senseFormRoot(overlay.senseForm);
    if (ending) {
      const key = `${root}\0${ending}`;
      const list = byRootEnding.get(key) ?? [];
      list.push(overlay);
      byRootEnding.set(key, list);
    }
  }

  const attached = new Map<number, OverlayRow[]>();

  rows.forEach((row, index) => {
    const matched = new Map<string, OverlayRow>();

    if (row.emoji) {
      for (const overlay of byEmoji.get(row.emoji) ?? []) {
        matched.set(`${overlay.senseForm}\0${overlay.pos}`, overlay);
      }
    }

    const keys: Array<[string, string]> = [
      [`${row.clarity}\0l`, "l"],
      ...(row.metaphorical ? [[`${row.clarity}\0m`, "m"] as [string, string]] : []),
    ];

    for (const [key] of keys) {
      for (const overlay of byRootEnding.get(key) ?? []) {
        matched.set(`${overlay.senseForm}\0${overlay.pos}`, overlay);
      }
    }

    if (matched.size > 0) {
      attached.set(
        index,
        [...matched.values()].sort((a, b) => a.senseForm.localeCompare(b.senseForm) || a.pos.localeCompare(b.pos)),
      );
    }
  });

  return attached;
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

export function createOverlayIndex(overlays: OverlayRow[]): MiniSearch<OverlayIndexedDoc> {
  const docs: OverlayIndexedDoc[] = overlays.map((overlay, id) => ({
    id,
    senseForm: overlay.senseForm.toLowerCase(),
    writtenForm: overlayWrittenForm(overlay).toLowerCase(),
    pos: overlay.pos.toLowerCase(),
    emoji: overlay.emoji,
    root: senseFormRoot(overlay.senseForm).toLowerCase(),
    definition: overlay.definition.toLowerCase(),
    mnemonic: overlay.mnemonic.toLowerCase(),
  }));

  const index = new MiniSearch<OverlayIndexedDoc>({
    fields: [...OVERLAY_SEARCH_FIELDS],
    storeFields: ["senseForm", "writtenForm", "pos", "emoji", "root", "definition", "mnemonic"],
    searchOptions: OVERLAY_SEARCH_OPTIONS,
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
      overlays: [],
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

function exactOverlayBoost(overlay: OverlayRow, query: string): { boost: number; fields: string[] } {
  const q = query.toLowerCase();
  let boost = 0;
  const fields: string[] = [];

  if (overlayWrittenForm(overlay).toLowerCase() === q) {
    boost += 140;
    fields.push("sense_form");
  } else if (overlay.senseForm.toLowerCase() === q) {
    boost += 120;
    fields.push("sense_form");
  }
  if (overlay.definition.toLowerCase() === q) {
    boost += 80;
    fields.push("definition");
  }
  if (overlay.mnemonic.toLowerCase() === q) {
    boost += 50;
    fields.push("mnemonic");
  }
  if (overlay.pos.toLowerCase() === q) {
    boost += 40;
    fields.push("pos");
  }

  return { boost, fields };
}

function overlayResultFromPublished(
  row: PublishedRow,
  overlays: OverlayRow[],
  score: number,
  matchFields: string[],
): LexiconSearchResult {
  return {
    ...row,
    score,
    matchFields,
    overlays,
  };
}

function overlayOnlyResult(overlay: OverlayRow, score: number, matchFields: string[]): LexiconSearchResult {
  return {
    emoji: overlay.emoji,
    literal: overlay.definition,
    clarity: overlayWrittenForm(overlay),
    metaphorical: "",
    mnemonic: overlay.mnemonic,
    score,
    matchFields,
    overlays: [overlay],
    overlayOnly: true,
  };
}

export function searchLexicon(
  index: MiniSearch<IndexedDoc>,
  rows: PublishedRow[],
  query: string,
  opts?: { limit?: number; overlays?: OverlayRow[]; overlayIndex?: MiniSearch<OverlayIndexedDoc> },
): LexiconSearchResult[] {
  const trimmed = query.trim();
  const limit = opts?.limit;
  const overlays = opts?.overlays ?? [];
  const overlayIndex = opts?.overlayIndex;
  const attached = attachOverlays(rows, overlays);

  if (!trimmed) {
    const all = rows.map((row, id) => ({
      ...row,
      score: 0,
      matchFields: [] as string[],
      overlays: attached.get(id) ?? [],
    }));
    return limit === undefined ? all : all.slice(0, limit);
  }

  const emojiResults = findEmojiMatches(rows, trimmed);
  const merged = new Map<string, LexiconSearchResult>();

  const publishedKey = (id: number) => `p:${id}`;
  const overlayKey = (senseForm: string, pos: string) => `o:${senseForm}:${pos}`;

  for (const hit of index.search(trimmed, SEARCH_OPTIONS)) {
    const id = hit.id as number;
    const row = rows[id]!;
    const exact = exactMatchBoost(row, trimmed);
    const key = publishedKey(id);
    merged.set(key, overlayResultFromPublished(
      row,
      attached.get(id) ?? [],
      hit.score + exact.boost,
      [...new Set([...normalizeMatchFields(hit.match), ...exact.fields])].sort(),
    ));
  }

  for (const result of emojiResults) {
    const id = rows.findIndex((row) => row.emoji === result.emoji);
    if (id < 0) continue;
    const exact = exactMatchBoost(rows[id]!, trimmed);
    const key = publishedKey(id);
    const boosted = overlayResultFromPublished(
      rows[id]!,
      attached.get(id) ?? [],
      result.score + exact.boost,
      [...new Set([...result.matchFields, ...exact.fields])].sort(),
    );
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        score: Math.max(existing.score, boosted.score),
        matchFields: [...new Set([...existing.matchFields, ...boosted.matchFields])].sort(),
      });
    } else {
      merged.set(key, boosted);
    }
  }

  if (merged.size === 0) {
    rows.forEach((row, id) => {
      const exact = exactMatchBoost(row, trimmed);
      if (exact.boost > 0) {
        merged.set(publishedKey(id), overlayResultFromPublished(row, attached.get(id) ?? [], exact.boost, exact.fields));
      }
    });
  }

  if (overlayIndex) {
    for (const hit of overlayIndex.search(trimmed, OVERLAY_SEARCH_OPTIONS)) {
      const overlay = overlays[hit.id as number]!;
      const exact = exactOverlayBoost(overlay, trimmed);
      const score = hit.score + exact.boost;
      const matchFields = [...new Set([...normalizeMatchFields(hit.match), ...exact.fields])].sort();

      const publishedIndex = rows.findIndex(
        (row) =>
          row.emoji === overlay.emoji ||
          row.clarity === senseFormRoot(overlay.senseForm) ||
          `${row.clarity}${senseFormEnding(overlay.senseForm) ?? ""}` === overlay.senseForm,
      );

      if (publishedIndex >= 0) {
        const key = publishedKey(publishedIndex);
        const row = rows[publishedIndex]!;
        const rowOverlays = attached.get(publishedIndex) ?? [];
        const existing = merged.get(key);
        const next = overlayResultFromPublished(
          row,
          rowOverlays.length > 0 ? rowOverlays : [overlay],
          Math.max(existing?.score ?? 0, score),
          [...new Set([...(existing?.matchFields ?? []), ...matchFields])].sort(),
        );
        merged.set(key, next);
      } else {
        const key = overlayKey(overlay.senseForm, overlay.pos);
        const existing = merged.get(key);
        const next = overlayOnlyResult(overlay, Math.max(existing?.score ?? 0, score), matchFields);
        merged.set(key, next);
      }
    }
  }

  const sorted = [...merged.values()].sort((a, b) => b.score - a.score);
  const effectiveLimit = limit ?? 20;
  return sorted.slice(0, effectiveLimit);
}
