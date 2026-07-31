import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseCsv } from "../collapse-variants.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");

export type PublishedRow = {
  emoji: string;
  literal: string;
  clarity: string;
  metaphorical: string;
  mnemonic: string;
  group: string;
  subgroup: string;
};

export type Pass1Pick = {
  emoji: string;
  score: number;
  rationale: string;
};

export type PoolEntry = Pass1Pick & {
  literal: string;
  clarity: string;
  subgroup: string;
  group: string;
};

export type Pass2Candidate = {
  rank: number;
  emoji: string;
  literal: string;
  clarity: string;
  subgroup: string;
  mnemonic: string;
  teachability: number;
  rationale: string;
};

export type GoldExample = {
  emoji: string;
  literal: string;
  metaphorical: string;
  mnemonic: string;
  subgroup: string;
};

export type HumanDecision = null | "accept" | "REVIEW";

export type StagingFile = {
  lemma: string;
  model: string;
  seed: number;
  pass1: {
    chunk_count: number;
    per_chunk_top: number;
    chunks: Array<{
      chunk_index: number;
      row_count: number;
      picks: Pass1Pick[];
    }>;
    pool: PoolEntry[];
  };
  pass2: {
    candidates: Pass2Candidate[];
    gold_examples: GoldExample[];
    recommend_review: boolean;
  };
  human: {
    decision: HumanDecision;
    chosen_rank: number | null;
    mnemonic_final: string | null;
    notes: string;
  };
};

const LEMMA_RE = /^[a-z]+(-[a-z]+)?$/;

export function normalizeLemma(raw: string): string {
  return raw.trim().toLowerCase();
}

export function slugLemma(lemma: string): string {
  return normalizeLemma(lemma).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function isValidLemma(lemma: string): boolean {
  return LEMMA_RE.test(normalizeLemma(lemma));
}

export function stagingPathForLemma(lemma: string): string {
  return join(rootDir, "data", "phase5-assign", `${slugLemma(lemma)}.json`);
}

export function publishedPath(): string {
  return join(rootDir, "data", "lexicon-published.csv");
}

export function lexiconPath(): string {
  return join(rootDir, "data", "lexicon.csv");
}

function loadLexiconMeta(): Map<string, { group: string; subgroup: string }> {
  const content = readFileSync(lexiconPath(), "utf8");
  const { rows } = parseCsv(content);
  const map = new Map<string, { group: string; subgroup: string }>();
  for (const row of rows) {
    const emoji = row.emoji ?? "";
    if (!emoji) continue;
    map.set(emoji, {
      group: (row.group ?? "").trim(),
      subgroup: (row.subgroup ?? "").trim(),
    });
  }
  return map;
}

export function loadPublishedRows(): PublishedRow[] {
  const content = readFileSync(publishedPath(), "utf8");
  const { rows } = parseCsv(content);
  const meta = loadLexiconMeta();
  return rows.map((row) => {
    const emoji = row.emoji ?? "";
    const m = meta.get(emoji);
    return {
      emoji,
      literal: (row.literal ?? "").trim(),
      clarity: (row.clarity ?? "").trim(),
      metaphorical: (row.metaphorical ?? "").trim(),
      mnemonic: (row.mnemonic ?? "").trim(),
      group: m?.group ?? "",
      subgroup: m?.subgroup ?? "",
    };
  });
}

export function getEmptyRows(rows: PublishedRow[]): PublishedRow[] {
  return rows.filter((r) => !r.metaphorical);
}

export function getUsedMetaphors(rows: PublishedRow[]): Set<string> {
  const used = new Set<string>();
  for (const row of rows) {
    if (row.metaphorical) used.add(row.metaphorical.toLowerCase());
  }
  return used;
}

/** Mulberry32 PRNG for reproducible shuffles. */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = createSeededRng(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

/** Split items into `chunkCount` contiguous chunks (as equal as possible). */
export function splitIntoChunks<T>(items: T[], chunkCount: number): T[][] {
  if (chunkCount < 1) throw new Error("chunkCount must be >= 1");
  if (items.length === 0) return [];
  const size = Math.ceil(items.length / chunkCount);
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function chunkEmptyRowsRandom(
  emptyRows: PublishedRow[],
  seed: number,
  chunkCount: number,
): PublishedRow[][] {
  const shuffled = seededShuffle(emptyRows, seed);
  return splitIntoChunks(shuffled, chunkCount);
}

export function mergePass1Picks(
  picks: Pass1Pick[],
  rowByEmoji: Map<string, PublishedRow>,
  poolLimit = 50,
): PoolEntry[] {
  const best = new Map<string, Pass1Pick>();
  for (const pick of picks) {
    const emoji = pick.emoji.trim();
    if (!emoji || !rowByEmoji.has(emoji)) continue;
    const score = Number(pick.score);
    if (!Number.isFinite(score)) continue;
    const existing = best.get(emoji);
    if (!existing || score > existing.score) {
      best.set(emoji, {
        emoji,
        score,
        rationale: (pick.rationale ?? "").trim(),
      });
    }
  }

  const pool: PoolEntry[] = [];
  for (const pick of best.values()) {
    const row = rowByEmoji.get(pick.emoji);
    if (!row) continue;
    pool.push({
      ...pick,
      literal: row.literal,
      clarity: row.clarity,
      subgroup: row.subgroup,
      group: row.group,
    });
  }

  pool.sort((a, b) => b.score - a.score || a.literal.localeCompare(b.literal));
  return pool.slice(0, poolLimit);
}

function wordOverlap(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/[^a-z]+/).filter(Boolean));
  const wb = new Set(b.toLowerCase().split(/[^a-z]+/).filter(Boolean));
  let n = 0;
  for (const w of wa) {
    if (wb.has(w)) n += 1;
  }
  return n;
}

export function selectGoldExamples(
  filledRows: PublishedRow[],
  lemma: string,
  seed: number,
  count = 5,
): GoldExample[] {
  const lemmaNorm = normalizeLemma(lemma);
  const scored = filledRows
    .filter((r) => r.metaphorical && r.mnemonic && r.mnemonic !== "REVIEW")
    .map((row) => {
      let score = 0;
      const meta = row.metaphorical.toLowerCase();
      if (meta === lemmaNorm) score += 10;
      if (meta.includes(lemmaNorm) || lemmaNorm.includes(meta)) score += 5;
      score += wordOverlap(lemmaNorm, meta) * 2;
      score += wordOverlap(lemmaNorm, row.literal) * 1;
      return { row, score };
    })
    .sort((a, b) => b.score - a.score || a.row.literal.localeCompare(b.row.literal));

  const chosen: GoldExample[] = [];
  const seenSubgroup = new Set<string>();

  for (const { row } of scored) {
    if (chosen.length >= count) break;
    if (seenSubgroup.has(row.subgroup) && chosen.length >= 3) continue;
    seenSubgroup.add(row.subgroup);
    chosen.push({
      emoji: row.emoji,
      literal: row.literal,
      metaphorical: row.metaphorical,
      mnemonic: row.mnemonic,
      subgroup: row.subgroup,
    });
  }

  if (chosen.length < count) {
    const rng = createSeededRng(seed + 99);
    const rest = filledRows.filter(
      (r) =>
        r.metaphorical &&
        r.mnemonic &&
        r.mnemonic !== "REVIEW" &&
        !chosen.some((c) => c.emoji === r.emoji),
    );
    while (chosen.length < count && rest.length > 0) {
      const idx = Math.floor(rng() * rest.length);
      const row = rest.splice(idx, 1)[0]!;
      if (seenSubgroup.has(row.subgroup) && chosen.length >= 3) continue;
      seenSubgroup.add(row.subgroup);
      chosen.push({
        emoji: row.emoji,
        literal: row.literal,
        metaphorical: row.metaphorical,
        mnemonic: row.mnemonic,
        subgroup: row.subgroup,
      });
    }
  }

  return chosen.slice(0, count);
}

export type ApplyValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  emoji?: string;
  mnemonic?: string;
};

export function validateApply(
  staging: StagingFile,
  rows: PublishedRow[],
): ApplyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lemma = normalizeLemma(staging.lemma);

  if (!isValidLemma(lemma)) {
    errors.push(`Invalid lemma format: ${lemma}`);
  }

  const decision = staging.human.decision;
  if (decision === null) {
    errors.push('human.decision is null — set to "accept" or "REVIEW"');
    return { ok: false, errors, warnings };
  }

  if (decision === "REVIEW") {
    return { ok: true, errors, warnings };
  }

  if (decision !== "accept") {
    errors.push(`Invalid human.decision: ${String(decision)}`);
    return { ok: false, errors, warnings };
  }

  const rank = staging.human.chosen_rank;
  if (rank === null || !Number.isInteger(rank)) {
    errors.push("human.chosen_rank must be an integer when decision is accept");
    return { ok: false, errors, warnings };
  }

  const candidate = staging.pass2.candidates.find((c) => c.rank === rank);
  if (!candidate) {
    errors.push(`No pass2 candidate with rank ${rank}`);
    return { ok: false, errors, warnings };
  }

  const used = getUsedMetaphors(rows);
  if (used.has(lemma)) {
    errors.push(`Lemma "${lemma}" is already assigned in lexicon-published.csv`);
  }

  const target = rows.find((r) => r.emoji === candidate.emoji);
  if (!target) {
    errors.push(`Target emoji not found: ${candidate.emoji}`);
    return { ok: false, errors, warnings };
  }

  if (target.metaphorical) {
    errors.push(`Target row already has metaphorical="${target.metaphorical}"`);
  }

  if (target.subgroup === "country-flag" && !lemma.endsWith("an") && !lemma.endsWith("ish")) {
    warnings.push(
      `country-flag row but lemma "${lemma}" does not look like a demonym (heuristic only)`,
    );
  }

  const mnemonic = (staging.human.mnemonic_final ?? candidate.mnemonic).trim();
  if (!mnemonic) {
    errors.push("Mnemonic is empty — set human.mnemonic_final or ensure candidate has mnemonic");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    emoji: candidate.emoji,
    mnemonic,
  };
}

export function enrichPass2Candidates(
  raw: Array<{
    rank: number;
    emoji: string;
    mnemonic: string;
    teachability: number;
    rationale: string;
  }>,
  rowByEmoji: Map<string, PublishedRow>,
): Pass2Candidate[] {
  return raw
    .map((c) => {
      const row = rowByEmoji.get(c.emoji.trim());
      if (!row) return null;
      return {
        rank: c.rank,
        emoji: row.emoji,
        literal: row.literal,
        clarity: row.clarity,
        subgroup: row.subgroup,
        mnemonic: (c.mnemonic ?? "").trim(),
        teachability: Number(c.teachability),
        rationale: (c.rationale ?? "").trim(),
      };
    })
    .filter((c): c is Pass2Candidate => c !== null)
    .sort((a, b) => a.rank - b.rank);
}
