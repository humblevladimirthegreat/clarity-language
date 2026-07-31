#!/usr/bin/env node
/**
 * Phase 5: two-pass LLM metaphor assignment (Approach B — target lemma).
 *
 * propose — Pass 1 (random chunks → pool 50) + Pass 2 (top 5 + mnemonics)
 * review  — print top-5 table for human
 * apply   — write human accept decision to lexicon-published.csv
 *
 * Env: OPENAI_BASE_URL, OPENAI_API_KEY, METAPHOR_ASSIGN_MODEL
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsvField, parseCsv } from "./collapse-variants.js";
import {
  chunkEmptyRowsRandom,
  enrichPass2Candidates,
  getEmptyRows,
  getUsedMetaphors,
  isValidLemma,
  loadPublishedRows,
  mergePass1Picks,
  normalizeLemma,
  publishedPath,
  selectGoldExamples,
  slugLemma,
  stagingPathForLemma,
  validateApply,
  type Pass1Pick,
  type StagingFile,
} from "./lib/metaphor-assign-data.js";
import {
  chatCompletionJson,
  loadLlmConfig,
  type LlmClientConfig,
} from "./lib/llm-client.js";
import {
  parsePass1Response,
  parsePass2Response,
  pass1SystemPrompt,
  pass1UserPrompt,
  pass2SystemPrompt,
  pass2UserPrompt,
} from "./lib/metaphor-assign-prompts.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const assignDir = join(rootDir, "data", "phase5-assign");

type CliArgs = {
  command: "propose" | "review" | "apply";
  lemma: string;
  seed: number;
  chunks: number;
  perChunk: number;
  pass: "1" | "2" | "all";
  dryRun: boolean;
};

function parseArgs(argv: string[]): CliArgs {
  const tokens = argv.slice(2);
  const command = tokens[0];
  if (command !== "propose" && command !== "review" && command !== "apply") {
    throw new Error(
      "Usage: npm run metaphor-assign -- <propose|review|apply> --lemma=WORD [options]",
    );
  }

  let lemma = "";
  let seed = 42;
  let chunks = 5;
  let perChunk = 10;
  let pass: "1" | "2" | "all" = "all";
  let dryRun = false;

  for (const token of tokens.slice(1)) {
    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }
    const eq = token.indexOf("=");
    if (eq === -1) continue;
    const key = token.slice(0, eq);
    const value = token.slice(eq + 1);
    switch (key) {
      case "--lemma":
        lemma = value;
        break;
      case "--seed":
        seed = Number(value);
        break;
      case "--chunks":
        chunks = Number(value);
        break;
      case "--per-chunk":
        perChunk = Number(value);
        break;
      case "--pass":
        if (value === "1" || value === "2" || value === "all") pass = value;
        else throw new Error('--pass must be "1", "2", or "all"');
        break;
      default:
        break;
    }
  }

  if (!lemma) throw new Error("--lemma=WORD is required");
  if (!Number.isInteger(seed)) throw new Error("--seed must be an integer");
  if (!Number.isInteger(chunks) || chunks < 1) throw new Error("--chunks must be >= 1");
  if (!Number.isInteger(perChunk) || perChunk < 1) throw new Error("--per-chunk must be >= 1");

  return { command, lemma, seed, chunks, perChunk, pass, dryRun };
}

function loadStaging(lemma: string): StagingFile | null {
  const path = stagingPathForLemma(lemma);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as StagingFile;
}

function saveStaging(lemma: string, staging: StagingFile): string {
  mkdirSync(assignDir, { recursive: true });
  const path = stagingPathForLemma(lemma);
  writeFileSync(path, `${JSON.stringify(staging, null, 2)}\n`, "utf8");
  return path;
}

function emptyStaging(lemma: string, model: string, seed: number): StagingFile {
  return {
    lemma: normalizeLemma(lemma),
    model,
    seed,
    pass1: { chunk_count: 0, per_chunk_top: 0, chunks: [], pool: [] },
    pass2: { candidates: [], gold_examples: [], recommend_review: false },
    human: { decision: null, chosen_rank: null, mnemonic_final: null, notes: "" },
  };
}

async function runPass1(
  config: LlmClientConfig,
  staging: StagingFile,
  chunkCount: number,
  perChunkTop: number,
): Promise<void> {
  const rows = loadPublishedRows();
  const empty = getEmptyRows(rows);
  if (empty.length === 0) {
    throw new Error("No empty metaphorical rows in lexicon-published.csv");
  }

  const rowByEmoji = new Map(rows.map((r) => [r.emoji, r]));
  const chunks = chunkEmptyRowsRandom(empty, staging.seed, chunkCount);

  console.log(
    `Pass 1: ${empty.length} empty rows → ${chunks.length} chunks (seed=${staging.seed})`,
  );

  const chunkResults: Array<{
    chunk_index: number;
    row_count: number;
    picks: Pass1Pick[];
  }> = [];

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunkRows = chunks[chunkIndex]!;
    const used = [...getUsedMetaphors(rows)];
    const messages = [
      { role: "system" as const, content: pass1SystemPrompt() },
      {
        role: "user" as const,
        content: pass1UserPrompt(staging.lemma, chunkRows, perChunkTop, used),
      },
    ];
    const picks = await chatCompletionJson(
      config,
      messages,
      { temperature: 0.5 },
      parsePass1Response,
    );
    console.log(`  chunk ${chunkIndex + 1}/${chunks.length}: ${picks.length} picks`);
    chunkResults.push({
      chunk_index: chunkIndex,
      row_count: chunkRows.length,
      picks,
    });
  }

  const allPicks: Pass1Pick[] = chunkResults.flatMap((c) => c.picks);
  const pool = mergePass1Picks(allPicks, rowByEmoji, 50);

  staging.pass1 = {
    chunk_count: chunkCount,
    per_chunk_top: perChunkTop,
    chunks: chunkResults,
    pool,
  };

  console.log(`Pass 1 pool: ${pool.length} rows (from ${allPicks.length} raw picks)`);
}

async function runPass2(config: LlmClientConfig, staging: StagingFile): Promise<void> {
  const pool = staging.pass1.pool;
  if (pool.length === 0) {
    throw new Error("Pass 1 pool is empty — run propose --pass=1 first");
  }

  const rows = loadPublishedRows();
  const rowByEmoji = new Map(rows.map((r) => [r.emoji, r]));
  const filled = rows.filter((r) => r.metaphorical);
  const gold = selectGoldExamples(filled, staging.lemma, staging.seed, 5);
  const used = [...getUsedMetaphors(rows)];

  const messages = [
    { role: "system" as const, content: pass2SystemPrompt() },
    {
      role: "user" as const,
      content: pass2UserPrompt(staging.lemma, pool, gold, used),
    },
  ];

  const response = await chatCompletionJson(
    config,
    messages,
    { temperature: 0.15 },
    parsePass2Response,
  );

  const candidates = enrichPass2Candidates(response.candidates, rowByEmoji);
  staging.pass2 = {
    candidates,
    gold_examples: gold,
    recommend_review: response.recommend_review,
  };

  console.log(`Pass 2: ${candidates.length} candidates (recommend_review=${response.recommend_review})`);
}

function cmdReview(lemma: string): void {
  const staging = loadStaging(lemma);
  if (!staging) {
    throw new Error(`No staging file for lemma "${lemma}" (${stagingPathForLemma(lemma)})`);
  }

  console.log(`Lemma: ${staging.lemma}`);
  console.log(`Model: ${staging.model}  Seed: ${staging.seed}`);
  console.log(`Pass 1 pool size: ${staging.pass1.pool.length}`);
  if (staging.pass2.recommend_review) {
    console.log("Model recommends REVIEW (no strong fit)");
  }
  console.log("");

  const header = ["rank", "emoji", "literal", "subgroup", "teach", "mnemonic"];
  const widths = [4, 4, 18, 16, 5, 50];
  console.log(header.map((h, i) => h.padEnd(widths[i]!)).join("  "));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));

  for (const c of staging.pass2.candidates) {
    const cols = [
      String(c.rank),
      c.emoji,
      c.literal.slice(0, widths[2]!),
      c.subgroup.slice(0, widths[3]!),
      String(c.teachability),
      c.mnemonic.slice(0, widths[5]!),
    ];
    console.log(cols.map((v, i) => v.padEnd(widths[i]!)).join("  "));
  }

  console.log("");
  console.log("Human review: edit staging JSON — set human.chosen_rank (1-5),");
  console.log('human.decision to "accept" or "REVIEW", optional human.mnemonic_final.');
  console.log(`File: ${stagingPathForLemma(lemma)}`);
}

function writePublishedCsv(rows: Record<string, string>[], fieldnames: string[]): void {
  const out = [
    fieldnames.join(","),
    ...rows.map((row) => fieldnames.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ].join("\n");
  writeFileSync(publishedPath(), `${out}\n`, "utf8");
}

function cmdApply(lemma: string, dryRun: boolean): void {
  const staging = loadStaging(lemma);
  if (!staging) {
    throw new Error(`No staging file for lemma "${lemma}"`);
  }

  const content = readFileSync(publishedPath(), "utf8");
  const { rows } = parseCsv(content);
  const fieldnames = ["emoji", "literal", "clarity", "metaphorical", "mnemonic"];
  const published = loadPublishedRows();
  const validation = validateApply(staging, published);

  for (const w of validation.warnings) {
    console.warn(`Warning: ${w}`);
  }

  if (!validation.ok) {
    throw new Error(validation.errors.join("; "));
  }

  if (staging.human.decision === "REVIEW") {
    console.log(`Lemma "${staging.lemma}": human decision is REVIEW — no CSV changes.`);
    return;
  }

  const emoji = validation.emoji!;
  const mnemonic = validation.mnemonic!;
  let updated = false;

  for (const row of rows) {
    if ((row.emoji ?? "") === emoji) {
      row.metaphorical = staging.lemma;
      row.mnemonic = mnemonic;
      updated = true;
      break;
    }
  }

  if (!updated) {
    throw new Error(`Row not found for emoji ${emoji}`);
  }

  if (dryRun) {
    console.log(`[dry-run] Would set ${emoji} metaphorical=${staging.lemma} mnemonic=${mnemonic}`);
    return;
  }

  writePublishedCsv(rows, fieldnames);
  console.log(`Applied ${staging.lemma} → ${emoji} in ${publishedPath()}`);
}

async function cmdPropose(args: CliArgs): Promise<void> {
  const lemma = normalizeLemma(args.lemma);
  if (!isValidLemma(lemma)) {
    throw new Error(`Invalid lemma format: ${lemma} (expected lowercase word or hyphenated lemma)`);
  }

  const rows = loadPublishedRows();
  const used = getUsedMetaphors(rows);
  if (used.has(lemma)) {
    throw new Error(`Lemma "${lemma}" is already assigned in lexicon-published.csv`);
  }

  const config = loadLlmConfig();
  const existing = loadStaging(lemma);
  const staging =
    existing ??
    emptyStaging(lemma, config.model, args.seed);

  staging.lemma = lemma;
  staging.model = config.model;
  if (args.pass === "1" || args.pass === "all") {
    staging.seed = args.seed;
  }

  if (args.pass === "1" || args.pass === "all") {
    await runPass1(config, staging, args.chunks, args.perChunk);
  }

  if (args.pass === "2" || args.pass === "all") {
    if (args.pass === "2" && staging.pass1.pool.length === 0) {
      throw new Error("Pass 1 pool empty — run propose --pass=1 first");
    }
    await runPass2(config, staging);
    staging.human = { decision: null, chosen_rank: null, mnemonic_final: null, notes: "" };
  }

  const path = saveStaging(lemma, staging);
  console.log(`Wrote ${path}`);
  console.log(`Run: npm run metaphor-assign -- review --lemma=${slugLemma(lemma)}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  switch (args.command) {
    case "propose":
      await cmdPropose(args);
      break;
    case "review":
      cmdReview(args.lemma);
      break;
    case "apply":
      cmdApply(args.lemma, args.dryRun);
      break;
    default:
      throw new Error(`Unknown command: ${args.command}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
