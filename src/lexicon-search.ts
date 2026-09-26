import MiniSearch from "minisearch";

import { parseCsv } from "./csv.js";
import type { CompoundRow } from "./lexicon-compounds.js";

export const ROLE_LETTERS = ["z", "d", "b", "v", "g", "w", "h", "th", "y", "x"] as const;

export type RoleLetter = (typeof ROLE_LETTERS)[number];

const ROLE_LETTER_SET = new Set<string>(ROLE_LETTERS);

const POS_ENGLISH_LEMMA_RE = /^[a-z]+(?:-[a-z]+)*$/;
const POS_ENGLISH_PIECE_RE = /^(m\.)?(th|[zdbvgwhyx]):([a-z]+(?:-[a-z]+)*)$/;

export type PosEnglishMap = {
  concrete: Partial<Record<RoleLetter, string>>;
  abstract: Partial<Record<RoleLetter, string>>;
};

export type PublishedRow = {
  emoji: string;
  concrete: string;
  clarity: string;
  abstract: string;
  mnemonic: string;
  englishByPos: string;
  posEnglish: PosEnglishMap;
};

export const OVERLAY_KINDS = [
  "need",
  "ability",
  "join_act",
  "join_relation",
  "evidential",
  "residue",
  "former_climate",
  "may",
  "notional",
  "plan",
  "predict",
  "decision",
  "cause",
  "clause_pole",
  "universality",
  "emotion_act",
  "emotion_locus",
  "identity",
  "benchmark",
  "locative",
  "similative",
  "of_relation",
  "exchange",
  "proxy",
  "stimulus",
  "deontic",
] as const;

export type OverlayKind = (typeof OVERLAY_KINDS)[number];

const OVERLAY_KIND_SET = new Set<string>(OVERLAY_KINDS);

export function isJoinOverlayKind(kind: OverlayKind): boolean {
  return kind === "join_act" || kind === "join_relation";
}

export type OverlayRow = {
  senseForm: string;
  pos: string;
  emoji: string;
  kind: OverlayKind;
  gloss: string;
  definition: string;
  mnemonic: string;
  /** Home section (`page.md#heading-id`) that teaches this overlay. */
  anchor: string;
};

export type LexiconSearchResult = PublishedRow & {
  score: number;
  matchFields: string[];
  overlays: OverlayRow[];
  overlayOnly?: boolean;
  compoundOnly?: boolean;
};

type IndexedDoc = PublishedRow & {
  id: number;
  concreteTokens: string;
  posEnglishLemmas: string;
};

type CompoundIndexedDoc = {
  id: number;
  emoji: string;
  stem: string;
  concrete: string;
  concreteTokens: string;
  abstract: string;
  mnemonic: string;
};

type OverlayIndexedDoc = {
  id: number;
  senseForm: string;
  pos: string;
  emoji: string;
  root: string;
  kind: string;
  gloss: string;
  definition: string;
  mnemonic: string;
};

export { parseCompoundCsv, type CompoundRow } from "./lexicon-compounds.js";

const PUBLISHED_HEADERS = [
  "emoji",
  "concrete",
  "clarity",
  "abstract",
  "mnemonic",
  "english_by_pos",
] as const;
const OVERLAY_HEADERS = [
  "sense_form",
  "pos",
  "emoji",
  "kind",
  "gloss",
  "definition",
  "mnemonic",
  "anchor",
] as const;

/** PoS prefixes (single letters plus `th`) used when a query is a full spelled word. */
const POS_PREFIXES = new Set(["z", "d", "b", "g", "v", "w", "h", "th", "y", "x"]);

const SEARCH_FIELDS = [
  "concrete",
  "concreteTokens",
  "clarity",
  "abstract",
  "mnemonic",
  "posEnglishLemmas",
] as const;
const COMPOUND_SEARCH_FIELDS = ["concrete", "concreteTokens", "stem", "abstract", "mnemonic"] as const;
const OVERLAY_SEARCH_FIELDS = [
  "senseForm",
  "root",
  "pos",
  "kind",
  "gloss",
  "definition",
  "mnemonic",
] as const;

const FIELD_BOOSTS: Record<(typeof SEARCH_FIELDS)[number], number> = {
  concrete: 2,
  abstract: 2,
  clarity: 1.5,
  concreteTokens: 1.5,
  posEnglishLemmas: 1.8,
  mnemonic: 1,
};

const COMPOUND_FIELD_BOOSTS: Record<(typeof COMPOUND_SEARCH_FIELDS)[number], number> = {
  concrete: 2,
  abstract: 2,
  stem: 1.5,
  concreteTokens: 1.5,
  mnemonic: 1,
};

const OVERLAY_FIELD_BOOSTS: Record<(typeof OVERLAY_SEARCH_FIELDS)[number], number> = {
  senseForm: 2,
  root: 1.5,
  gloss: 2,
  definition: 2,
  kind: 1.5,
  mnemonic: 1,
  pos: 1,
};

const SEARCH_OPTIONS = {
  boost: FIELD_BOOSTS,
  fuzzy: 0.2,
  prefix: true,
};

const COMPOUND_SEARCH_OPTIONS = {
  boost: COMPOUND_FIELD_BOOSTS,
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
  concrete: "concrete",
  concreteTokens: "concrete",
  clarity: "clarity",
  abstract: "abstract",
  mnemonic: "mnemonic",
  posEnglishLemmas: "english_by_pos",
  englishByPos: "english_by_pos",
  emoji: "emoji",
  senseForm: "sense_form",
  root: "sense_form",
  pos: "pos",
  kind: "kind",
  gloss: "gloss",
  stem: "stem",
  definition: "definition",
};

export function emptyPosEnglish(): PosEnglishMap {
  return { concrete: {}, abstract: {} };
}

export function posEnglishLemmaList(map: PosEnglishMap): string[] {
  const lemmas: string[] = [];
  for (const letter of ROLE_LETTERS) {
    const lit = map.concrete[letter];
    if (lit) lemmas.push(lit);
    const met = map.abstract[letter];
    if (met) lemmas.push(met);
  }
  return lemmas;
}

export function formatEnglishByPos(map: PosEnglishMap): string {
  const pieces: string[] = [];
  for (const letter of ROLE_LETTERS) {
    const lit = map.concrete[letter];
    if (lit) pieces.push(`${letter}:${lit}`);
  }
  for (const letter of ROLE_LETTERS) {
    const met = map.abstract[letter];
    if (met) pieces.push(`m.${letter}:${met}`);
  }
  return pieces.join("; ");
}

/**
 * Packed role-English packaging: `v:see; m.v:intuit; m.h:inside`.
 * Bare keys are concrete-sense mismatches; `m.` keys are abstract-sense mismatches.
 * Neither copies onto the other sense.
 */
export function parseEnglishByPos(
  raw: string,
  opts?: { concrete?: string; abstract?: string; label?: string },
): PosEnglishMap {
  const packed = raw.trim();
  const map = emptyPosEnglish();
  if (!packed) return map;

  const label = opts?.label ? `${opts.label}: ` : "";
  const concreteSense = (opts?.concrete ?? "").trim().toLowerCase();
  const abstractSense = (opts?.abstract ?? "").trim().toLowerCase();
  const seenLit = new Set<RoleLetter>();
  const seenMet = new Set<RoleLetter>();

  for (const chunk of packed.split(";")) {
    const piece = chunk.trim();
    if (!piece) {
      throw new Error(`${label}empty piece in english_by_pos`);
    }
    const match = piece.match(POS_ENGLISH_PIECE_RE);
    if (!match) {
      throw new Error(
        `${label}bad english_by_pos piece "${piece}" (want v:see or m.v:intuit)`,
      );
    }
    const metaphor = Boolean(match[1]);
    const pos = match[2] as RoleLetter;
    const lemma = match[3]!;
    if (!ROLE_LETTER_SET.has(pos) || !POS_ENGLISH_LEMMA_RE.test(lemma)) {
      throw new Error(`${label}bad english_by_pos piece "${piece}"`);
    }
    if (metaphor) {
      if (!abstractSense) {
        throw new Error(`${label}m.${pos} packing needs an abstract sense`);
      }
      if (lemma === abstractSense) {
        throw new Error(
          `${label}m.${pos}:${lemma} matches the abstract field; omit transparent conversions`,
        );
      }
      if (seenMet.has(pos)) {
        throw new Error(`${label}duplicate m.${pos} in english_by_pos`);
      }
      seenMet.add(pos);
      map.abstract[pos] = lemma;
    } else {
      if (concreteSense && lemma === concreteSense) {
        throw new Error(
          `${label}${pos}:${lemma} matches the literal field; omit transparent conversions`,
        );
      }
      if (seenLit.has(pos)) {
        throw new Error(`${label}duplicate ${pos} in english_by_pos`);
      }
      seenLit.add(pos);
      map.concrete[pos] = lemma;
    }
  }

  return map;
}

export function parsePublishedCsv(text: string): PublishedRow[] {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== PUBLISHED_HEADERS.join(",")) {
    throw new Error(`Unexpected CSV header: ${headers.join(",")}`);
  }

  return rows.map((row, index) => {
    const concrete = row.concrete ?? "";
    const abstract = row.abstract ?? "";
    const englishByPos = (row.english_by_pos ?? "").trim();
    const label = `lexicon-published.csv row ${index + 2}`;
    return {
      emoji: row.emoji ?? "",
      concrete,
      clarity: row.clarity ?? "",
      abstract,
      mnemonic: row.mnemonic ?? "",
      englishByPos,
      posEnglish: parseEnglishByPos(englishByPos, { concrete, abstract, label }),
    };
  });
}

/** Join-act / join-relation sense-forms are vowel-series, not hosted on a published root. */
export const JOIN_SENSE_FORMS = new Set([
  "an",
  "on",
  "aon",
  "un",
  "uan",
  "uon",
  "en",
  "aen",
  "oen",
  "uen",
]);

export type OverlayHostError = {
  row?: number;
  senseForm: string;
  pos: string;
  emoji: string;
  reason: string;
};

const ROLE_PREFIX = /^[aeuo]x/;

/**
 * Hosted overlays must spell a published root (same emoji; sense_form starts with
 * that root). Join-series rows are exempt.
 */
export function validateOverlayPublishedHosts(
  overlays: OverlayRow[],
  published: PublishedRow[],
): OverlayHostError[] {
  const byEmoji = new Map<string, PublishedRow>();
  for (const row of published) {
    const emoji = row.emoji.trim();
    if (emoji && !byEmoji.has(emoji)) {
      byEmoji.set(emoji, row);
    }
  }

  const errors: OverlayHostError[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < overlays.length; index++) {
    const overlay = overlays[index]!;
    if (isJoinOverlayKind(overlay.kind)) {
      continue;
    }

    const rowNum = index + 2;
    const key = `${overlay.senseForm}\0${overlay.emoji}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const emoji = overlay.emoji.trim();
    if (!emoji) {
      errors.push({
        row: rowNum,
        senseForm: overlay.senseForm,
        pos: overlay.pos,
        emoji,
        reason: `hosted overlay ${overlay.senseForm} has no emoji and no published host`,
      });
      continue;
    }

    const host = byEmoji.get(emoji);
    if (!host) {
      errors.push({
        row: rowNum,
        senseForm: overlay.senseForm,
        pos: overlay.pos,
        emoji,
        reason: `overlay ${overlay.senseForm} (${emoji}) has no published lexicon row for that emoji`,
      });
      continue;
    }

    const root = host.clarity.trim();
    if (!root) {
      errors.push({
        row: rowNum,
        senseForm: overlay.senseForm,
        pos: overlay.pos,
        emoji,
        reason: `published host for ${emoji} has an empty root`,
      });
      continue;
    }

    // A role-compound overlay (`uxerenel`) spells the root after its role vowel + `x`.
    if (!overlay.senseForm.replace(ROLE_PREFIX, "").startsWith(root)) {
      errors.push({
        row: rowNum,
        senseForm: overlay.senseForm,
        pos: overlay.pos,
        emoji,
        reason: `overlay ${overlay.senseForm} does not start with published root ${root} (${emoji} ${host.concrete})`,
      });
    }
  }

  return errors;
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

    const kindRaw = (row.kind ?? "").trim();
    if (!OVERLAY_KIND_SET.has(kindRaw)) {
      throw new Error(`Unknown overlay kind for ${senseForm} + ${pos}: ${kindRaw || "(empty)"}`);
    }
    const kind = kindRaw as OverlayKind;
    const gloss = (row.gloss ?? "").trim();
    if (!gloss) {
      throw new Error(`Overlay ${senseForm} + ${pos} is missing gloss`);
    }
    const anchor = (row.anchor ?? "").trim();
    if (!anchor) {
      throw new Error(`Overlay ${senseForm} + ${pos} is missing anchor`);
    }

    overlays.push({
      senseForm,
      pos,
      emoji: (row.emoji ?? "").trim(),
      kind,
      gloss,
      definition: (row.definition ?? "").trim(),
      mnemonic: (row.mnemonic ?? "").trim(),
      anchor,
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

/**
 * If the query looks like a spelled Agelan word (PoS + vowel-initial sense-form
 * ending in a reference letter), return that PoS and the sense-form stem.
 * Otherwise pos is null and stem is the whole query.
 */
export function splitPosPrefixedQuery(query: string): { pos: string | null; stem: string } {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { pos: null, stem: q };
  const pos = q.startsWith("th") ? "th" : q[0]!;
  const stem = q.slice(pos.length);
  if (POS_PREFIXES.has(pos) && /^[aeiou].*[lmnr]$/.test(stem)) {
    return { pos, stem };
  }
  return { pos: null, stem: q };
}

export function tokenizeConcrete(literal: string): string {
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
      ...(row.abstract ? [[`${row.clarity}\0m`, "m"] as [string, string]] : []),
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

export function createCompoundIndex(rows: CompoundRow[]): MiniSearch<CompoundIndexedDoc> {
  const docs: CompoundIndexedDoc[] = rows.map((row, id) => ({
    id,
    emoji: row.emoji,
    stem: row.stem.toLowerCase(),
    concrete: row.concrete.toLowerCase(),
    concreteTokens: tokenizeConcrete(row.concrete),
    abstract: row.abstract.toLowerCase(),
    mnemonic: row.mnemonic.toLowerCase(),
  }));

  const index = new MiniSearch<CompoundIndexedDoc>({
    fields: [...COMPOUND_SEARCH_FIELDS],
    storeFields: ["emoji", "stem", "concrete", "abstract", "mnemonic"],
    searchOptions: COMPOUND_SEARCH_OPTIONS,
  });

  index.addAll(docs);
  return index;
}

export function createLexiconIndex(rows: PublishedRow[]): MiniSearch<IndexedDoc> {
  const docs: IndexedDoc[] = rows.map((row, id) => ({
    id,
    emoji: row.emoji,
    concrete: row.concrete.toLowerCase(),
    concreteTokens: tokenizeConcrete(row.concrete),
    clarity: row.clarity.toLowerCase(),
    abstract: row.abstract.toLowerCase(),
    mnemonic: row.mnemonic.toLowerCase(),
    englishByPos: row.englishByPos,
    posEnglish: row.posEnglish,
    posEnglishLemmas: posEnglishLemmaList(row.posEnglish).join(" "),
  }));

  const index = new MiniSearch<IndexedDoc>({
    fields: [...SEARCH_FIELDS],
    storeFields: ["emoji", "concrete", "clarity", "abstract", "mnemonic", "englishByPos"],
    searchOptions: SEARCH_OPTIONS,
  });

  index.addAll(docs);
  return index;
}

export function createOverlayIndex(overlays: OverlayRow[]): MiniSearch<OverlayIndexedDoc> {
  const docs: OverlayIndexedDoc[] = overlays.map((overlay, id) => ({
    id,
    senseForm: overlay.senseForm.toLowerCase(),
    pos: overlay.pos.toLowerCase(),
    emoji: overlay.emoji,
    root: senseFormRoot(overlay.senseForm).toLowerCase(),
    kind: overlay.kind,
    gloss: overlay.gloss.toLowerCase(),
    definition: overlay.definition.toLowerCase(),
    mnemonic: overlay.mnemonic.toLowerCase(),
  }));

  const index = new MiniSearch<OverlayIndexedDoc>({
    fields: [...OVERLAY_SEARCH_FIELDS],
    storeFields: ["senseForm", "pos", "emoji", "root", "kind", "gloss", "definition", "mnemonic"],
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

  if (row.concrete.toLowerCase() === q) {
    boost += 100;
    fields.push("concrete");
  }
  if (row.clarity.toLowerCase() === q) {
    boost += 100;
    fields.push("clarity");
  }
  if (row.abstract.toLowerCase() === q) {
    boost += 100;
    fields.push("abstract");
  }
  if (row.mnemonic.toLowerCase() === q) {
    boost += 50;
    fields.push("mnemonic");
  }
  if (posEnglishLemmaList(row.posEnglish).some((lemma) => lemma === q)) {
    boost += 90;
    fields.push("english_by_pos");
  }

  return { boost, fields };
}

function exactOverlayBoost(
  overlay: OverlayRow,
  query: string,
  split: { pos: string | null; stem: string },
): { boost: number; fields: string[] } {
  const q = query.toLowerCase();
  let boost = 0;
  const fields: string[] = [];
  const sense = overlay.senseForm.toLowerCase();
  const pos = overlay.pos.toLowerCase();

  if (split.pos && pos === split.pos && sense === split.stem) {
    boost += 140;
    fields.push("sense_form", "pos");
  } else if (sense === q || sense === split.stem) {
    boost += 120;
    fields.push("sense_form");
  }
  if (overlay.gloss.toLowerCase() === q) {
    boost += 90;
    fields.push("gloss");
  }
  if (overlay.kind === q) {
    boost += 70;
    fields.push("kind");
  }
  if (overlay.definition.toLowerCase() === q) {
    boost += 80;
    fields.push("definition");
  }
  if (overlay.mnemonic.toLowerCase() === q) {
    boost += 50;
    fields.push("mnemonic");
  }
  if (pos === q) {
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
    concrete: overlay.definition,
    clarity: overlay.senseForm,
    abstract: "",
    mnemonic: overlay.mnemonic,
    englishByPos: "",
    posEnglish: emptyPosEnglish(),
    score,
    matchFields,
    overlays: [overlay],
    overlayOnly: true,
  };
}

function exactCompoundBoost(row: CompoundRow, query: string): { boost: number; fields: string[] } {
  const q = query.toLowerCase();
  let boost = 0;
  const fields: string[] = [];

  if (row.concrete.toLowerCase() === q) {
    boost += 100;
    fields.push("concrete");
  }
  if (row.stem.toLowerCase() === q) {
    boost += 100;
    fields.push("stem");
  }
  if (row.abstract.toLowerCase() === q) {
    boost += 100;
    fields.push("abstract");
  }
  if (row.mnemonic.toLowerCase() === q) {
    boost += 50;
    fields.push("mnemonic");
  }

  return { boost, fields };
}

function compoundResultFromRow(
  row: CompoundRow,
  score: number,
  matchFields: string[],
): LexiconSearchResult {
  return {
    emoji: row.emoji,
    concrete: row.concrete,
    clarity: row.stem,
    abstract: row.abstract,
    mnemonic: row.mnemonic,
    englishByPos: "",
    posEnglish: emptyPosEnglish(),
    score,
    matchFields,
    overlays: [],
    compoundOnly: true,
  };
}

export function searchLexicon(
  index: MiniSearch<IndexedDoc>,
  rows: PublishedRow[],
  query: string,
  opts?: {
    limit?: number;
    overlays?: OverlayRow[];
    overlayIndex?: MiniSearch<OverlayIndexedDoc>;
    compoundRows?: CompoundRow[];
    compoundIndex?: MiniSearch<CompoundIndexedDoc>;
  },
): LexiconSearchResult[] {
  const trimmed = query.trim();
  const limit = opts?.limit;
  const overlays = opts?.overlays ?? [];
  const overlayIndex = opts?.overlayIndex;
  const compoundRows = opts?.compoundRows ?? [];
  const compoundIndex = opts?.compoundIndex;
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
  const compoundKey = (stem: string) => `c:${stem}`;

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

  if (compoundIndex && compoundRows.length > 0) {
    for (const hit of compoundIndex.search(trimmed, COMPOUND_SEARCH_OPTIONS)) {
      const row = compoundRows[hit.id as number]!;
      const exact = exactCompoundBoost(row, trimmed);
      const key = compoundKey(row.stem);
      merged.set(
        key,
        compoundResultFromRow(
          row,
          hit.score + exact.boost,
          [...new Set([...normalizeMatchFields(hit.match), ...exact.fields])].sort(),
        ),
      );
    }

    for (const row of compoundRows) {
      const exact = exactCompoundBoost(row, trimmed);
      if (exact.boost > 0) {
        const key = compoundKey(row.stem);
        const existing = merged.get(key);
        merged.set(
          key,
          compoundResultFromRow(
            row,
            Math.max(existing?.score ?? 0, exact.boost),
            [...new Set([...(existing?.matchFields ?? []), ...exact.fields])].sort(),
          ),
        );
      }
    }
  }

  if (overlayIndex) {
    const split = splitPosPrefixedQuery(trimmed);
    const overlayQueries = new Set<string>([trimmed.toLowerCase()]);
    if (split.pos) overlayQueries.add(split.stem);

    for (const overlayQuery of overlayQueries) {
      const fromStem = Boolean(split.pos && overlayQuery === split.stem);
      for (const hit of overlayIndex.search(overlayQuery, OVERLAY_SEARCH_OPTIONS)) {
        const overlay = overlays[hit.id as number]!;
        if (fromStem && overlay.pos.toLowerCase() !== split.pos) continue;

        const exact = exactOverlayBoost(overlay, trimmed, split);
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
  }

  const sorted = [...merged.values()].sort((a, b) => b.score - a.score);
  const effectiveLimit = limit ?? 20;
  return sorted.slice(0, effectiveLimit);
}
