#!/usr/bin/env tsx
/**
 * Phase 3 of the translation prompt ([llm-gloss-prompt.md](../docs/proposals/llm-gloss-prompt.md#evaluation)):
 * sample doc pairs (example blocks, table rows, checkpoint answers), build the real prompt for each
 * with its own gloss held out of the example pool, translate with an isolated small model, judge
 * the reply against the doc English with a stronger model, and report the miss rate per
 * construction ID and per label. Calls `claude -p`, so it costs money and is not part of `npm test`.
 *
 * Output goes to `tmp/llm-eval/` (gitignored): `results.jsonl` (one row per pair; a rerun with the
 * same settings reuses rows whose prompt is unchanged), `report.md`, and `report.json`.
 *
 * Run: npm run llm-eval -- [--n 200] [--seed 1] [--concurrency 4]
 *      [--translator claude-haiku-5-5] [--judge claude-opus-5-5] [--fresh]
 *      npm run llm-eval -- --only page.md:line[,page.md:line …]   (spot check those pairs, no sampling)
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

import { loadDefaultTables } from "../src/parse/index.js";
import { buildTestSet, docExamples, loadPromptContext } from "../src/parse/llm-examples.js";
import { buildPrompt, featureWeights, normalizeGloss, type ExamplePair } from "../src/parse/llm-prompt.js";
import { REPO_ROOT } from "../src/repo-paths.js";

// ---------------------------------------------------------------------------------------------
// Options

function flag(name: string, fallback: string): string {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1]! : fallback;
}
const N = Number(flag("n", "200"));
const SEED = Number(flag("seed", "1"));
const CONCURRENCY = Number(flag("concurrency", "4"));
// Full model IDs: the CLI's `haiku` alias can resolve to an older model.
const TRANSLATOR = flag("translator", "claude-haiku-5-5");
const JUDGE = flag("judge", "claude-opus-5-5");
const FRESH = process.argv.includes("--fresh");
const ONLY = flag("only", "").split(",").filter(Boolean);

const OUT = join(REPO_ROOT, "tmp", "llm-eval");
const EMPTY = join(OUT, "empty");
const RESULTS = join(OUT, "results.jsonl");
const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");

// ---------------------------------------------------------------------------------------------
// Sample

type Kind = "block" | "table" | "checkpoint";
type Item = { kind: Kind; pair: ExamplePair };

/** Mulberry32: a seeded shuffle, so a rerun samples the same pairs. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const tables = loadDefaultTables();
const context = loadPromptContext(tables);
const weights = featureWeights(context.index);

const blockSources = new Set(
  readdirSync(GRAMMAR_DIR)
    .filter((name) => name.endsWith(".md"))
    .flatMap((page) => docExamples(readFileSync(join(GRAMMAR_DIR, page), "utf8")).map((example) => `${page}:${example.line}`)),
);
const pools: Record<Kind, ExamplePair[]> = {
  block: context.index.filter((pair) => blockSources.has(pair.source)),
  table: context.index.filter((pair) => !blockSources.has(pair.source)),
  checkpoint: buildTestSet(GRAMMAR_DIR, tables),
};
const total = Object.values(pools).reduce((sum, pool) => sum + pool.length, 0);
const random = rng(SEED);
// Proportional to each pool, largest remainder, so the shares add up to N.
const kindsList = Object.keys(pools) as Kind[];
const quota = new Map(kindsList.map((kind) => [kind, Math.floor((N * pools[kind].length) / total)]));
const remainder = (kind: Kind) => (N * pools[kind].length) / total - quota.get(kind)!;
for (const kind of [...kindsList].sort((a, b) => remainder(b) - remainder(a)).slice(0, N - [...quota.values()].reduce((a, b) => a + b, 0))) {
  quota.set(kind, quota.get(kind)! + 1);
}
const sampled: Item[] = kindsList.flatMap((kind) =>
  shuffle(pools[kind], random)
    .slice(0, quota.get(kind))
    .map((pair) => ({ kind, pair })),
);
const sample: Item[] = ONLY.length
  ? kindsList.flatMap((kind) => pools[kind].filter((pair) => ONLY.includes(pair.source)).map((pair) => ({ kind, pair })))
  : sampled;
if (ONLY.length && sample.length !== ONLY.length) {
  const found = new Set(sample.map((item) => item.pair.source));
  throw new Error(`--only: no pair at ${ONLY.filter((source) => !found.has(source)).join(", ")}`);
}

// ---------------------------------------------------------------------------------------------
// Model calls

type CallResult = { text: string; structured?: unknown; models: string[]; cost: number };

/** One isolated `claude -p` call from an empty directory: no tools, settings, MCP, or project files. */
function claude(model: string, system: string, prompt: string, schema?: object): Promise<CallResult> {
  const args = [
    "-p",
    "--model", model,
    "--tools", "",
    "--setting-sources", "",
    "--strict-mcp-config",
    "--no-session-persistence",
    "--system-prompt", system,
    "--output-format", "json",
  ];
  if (schema) args.push("--json-schema", JSON.stringify(schema));
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, { cwd: EMPTY, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), 300_000);
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const json = JSON.parse(stdout) as {
          is_error?: boolean;
          result?: string;
          structured_output?: unknown;
          modelUsage?: Record<string, unknown>;
          total_cost_usd?: number;
        };
        if (json.is_error) throw new Error(json.result ?? "is_error");
        const models = Object.keys(json.modelUsage ?? {});
        // The CLI may spend a little on a helper model; the answer must come from the one asked for.
        if (!models.includes(model)) throw new Error(`asked for ${model}, got ${models.join(", ")}`);
        resolve({ text: json.result ?? "", structured: json.structured_output, models, cost: json.total_cost_usd ?? 0 });
      } catch (error) {
        reject(new Error(`claude exited ${code}: ${error instanceof Error ? error.message : error}\n${stderr.slice(0, 500)}`));
      }
    });
    child.stdin.end(prompt);
  });
}

async function withRetry<T>(run: () => Promise<T>, tries = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      if (attempt >= tries) throw error;
      await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Translate and judge

const TRANSLATOR_SYSTEM = "You translate glossed sentences into English. Follow the instructions in the message exactly.";

/** `ENGLISH: "…" (…)`, lenient about curly quotes; the last such line wins. */
function parseReply(text: string): { sentence: string; note: string | null } | null {
  const lines = text.replace(/[“”]/g, '"').split("\n").filter((line) => /^\s*`?ENGLISH:/.test(line));
  const line = lines.at(-1)?.replace(/`/g, "").trim();
  const m = line && /^ENGLISH:\s*"(.*)"\s*(?:\((.*)\))?\s*\.?$/.exec(line);
  if (!m) return null;
  return { sentence: m[1]!.trim(), note: m[2]?.trim() || null };
}

const SENTENCE = ["same", "partly", "wrong"] as const;
const NOTE = ["carried", "partly", "missing", "wrong", "none", "extra-ok", "extra-wrong", "not-scored"] as const;
type Verdict = {
  sentence: (typeof SENTENCE)[number];
  misread: string[];
  sentenceWhy: string;
  note: (typeof NOTE)[number];
  noteWhy: string;
};
const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    sentence: { type: "string", enum: SENTENCE },
    misread: { type: "array", items: { type: "string" } },
    sentenceWhy: { type: "string" },
    note: { type: "string", enum: NOTE },
    noteWhy: { type: "string" },
  },
  required: ["sentence", "misread", "sentenceWhy", "note", "noteWhy"],
  additionalProperties: false,
};

const JUDGE_SYSTEM = "You are a careful, strict judge of translations. Answer only with the requested structured verdict.";

function judgePrompt(item: Item, prompt: string, reply: { sentence: string; note: string | null }): string {
  const doc = item.pair.note == null ? `"${item.pair.sentence}"` : `"${item.pair.sentence}" (${item.pair.note})`;
  const noteRule =
    item.kind === "checkpoint"
      ? 'NOTE: not scored for this pair (the reference is a learner answer that never requires a note). Set note to "not-scored".'
      : item.pair.note != null
        ? 'NOTE: the reference has a note. Does the reply carry the same point, in its note or in its sentence? "carried" = yes; "partly" = some of it; "missing" = not carried at all; "wrong" = the reply says something that contradicts it.'
        : 'NOTE: the reference has no note. If the reply has no note, "none". If it has one, "extra-ok" when the note is true of the gloss (even if unnecessary), "extra-wrong" when it states something false or not in the gloss.';
  return [
    "A model that has never seen this constructed language was given the translation prompt below (between the markers) and replied with an English translation. Judge the reply against the reference English from the language's documentation.",
    "",
    "<<<PROMPT",
    prompt.trimEnd(),
    "PROMPT>>>",
    "",
    `Gloss: ${item.pair.gloss}`,
    `Reference: ${doc}`,
    `Reply: ${reply.note == null ? `"${reply.sentence}"` : `"${reply.sentence}" (${reply.note})`}`,
    "",
    'SENTENCE: does the reply sentence make the same claim as the reference sentence? Judge meaning, not wording: "walks if it rains" matches "walks if there is rain"; a different but natural tense is fine when the gloss leaves tense open. "same" = same claim; "partly" = the core is right but a piece of meaning is lost, added, or shifted (who, negation, stance, scope, count, list closure); "wrong" = a different claim. In misread, list the gloss pieces (copied verbatim from the gloss, e.g. "th-CLUES-Uzazon" or "z-rank/more") that the reply misread; empty when same. sentenceWhy: one short sentence.',
    noteRule,
    "noteWhy: one short sentence (empty when none or not-scored).",
  ].join("\n");
}

type Row = {
  key: string;
  kind: Kind;
  source: string;
  gloss: string;
  docSentence: string;
  docNote: string | null;
  constructions: string[];
  labels: string[];
  examples: string[];
  replyRaw: string;
  reply: { sentence: string; note: string | null } | null;
  verdict: Verdict | null;
  translator: string;
  judge: string;
  cost: number;
  error?: string;
};

function keyOf(item: Item, prompt: string): string {
  return createHash("sha256").update([TRANSLATOR, JUDGE, item.kind, item.pair.source, prompt].join("\0")).digest("hex").slice(0, 16);
}

/** The prompt for one pair, with every pool example sharing its gloss held out. */
function promptFor(item: Item): { prompt: string; examples: string[] } {
  const own = normalizeGloss(item.pair.gloss);
  const index = context.index.filter((pair) => normalizeGloss(pair.gloss) !== own);
  const prompt = buildPrompt([item.pair.gloss], item.pair.constructions, { ...context, index, weights });
  const examples = index.filter((pair) => prompt.includes(`Gloss: ${pair.gloss}\n`)).map((pair) => pair.source);
  return { prompt, examples };
}

async function evaluate(item: Item, prompt: string, examples: string[]): Promise<Row> {
  const row: Row = {
    key: keyOf(item, prompt),
    kind: item.kind,
    source: item.pair.source,
    gloss: item.pair.gloss,
    docSentence: item.pair.sentence,
    docNote: item.pair.note,
    constructions: item.pair.constructions,
    labels: item.pair.labels,
    examples,
    replyRaw: "",
    reply: null,
    verdict: null,
    translator: TRANSLATOR,
    judge: JUDGE,
    cost: 0,
  };
  try {
    const translated = await withRetry(() => claude(TRANSLATOR, TRANSLATOR_SYSTEM, prompt));
    row.cost += translated.cost;
    row.replyRaw = translated.text;
    row.reply = parseReply(translated.text);
    if (!row.reply) {
      // An unreadable reply fails the sentence; no judge call needed.
      row.verdict = { sentence: "wrong", misread: [], sentenceWhy: "reply is not in the ENGLISH: format", note: item.kind === "checkpoint" ? "not-scored" : item.pair.note ? "missing" : "none", noteWhy: "" };
      return row;
    }
    const reply = row.reply;
    const judged = await withRetry(() => claude(JUDGE, JUDGE_SYSTEM, judgePrompt(item, prompt, reply), VERDICT_SCHEMA));
    row.cost += judged.cost;
    const verdict = judged.structured as Verdict | undefined;
    if (!verdict || !SENTENCE.includes(verdict.sentence) || !NOTE.includes(verdict.note)) throw new Error(`bad verdict: ${judged.text.slice(0, 300)}`);
    row.verdict = verdict;
  } catch (error) {
    row.error = error instanceof Error ? error.message : String(error);
  }
  return row;
}

// ---------------------------------------------------------------------------------------------
// Run

mkdirSync(EMPTY, { recursive: true });
const previous = new Map<string, Row>();
if (!FRESH && existsSync(RESULTS)) {
  for (const line of readFileSync(RESULTS, "utf8").split("\n").filter(Boolean)) {
    const row = JSON.parse(line) as Row;
    if (!row.error) previous.set(row.key, row);
  }
}
writeFileSync(RESULTS, "");

const jobs = sample.map((item) => ({ item, ...promptFor(item) }));
const rows: Row[] = [];
let done = 0;
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++]!;
    const cached = previous.get(keyOf(job.item, job.prompt));
    const row = cached ?? (await evaluate(job.item, job.prompt, job.examples));
    rows.push(row);
    appendFileSync(RESULTS, JSON.stringify(row) + "\n");
    done++;
    const mark = row.error ? "ERROR" : `${row.verdict!.sentence}/${row.verdict!.note}`;
    process.stderr.write(`[${done}/${jobs.length}] ${cached ? "(cached) " : ""}${row.source} ${mark}\n`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// ---------------------------------------------------------------------------------------------
// Report

const SENTENCE_MISS: Record<Verdict["sentence"], number> = { same: 0, partly: 0.5, wrong: 1 };
const NOTE_MISS: Record<Verdict["note"], number | null> = {
  carried: 0, partly: 0.5, missing: 1, wrong: 1, none: 0, "extra-ok": 0, "extra-wrong": 1, "not-scored": null,
};
const scored = rows.filter((row) => row.verdict);
const failed = rows.filter((row) => row.error);
/** A pair's miss: the worse of its sentence and note scores (0, 0.5, 1). */
const miss = (row: Row) => Math.max(SENTENCE_MISS[row.verdict!.sentence], NOTE_MISS[row.verdict!.note] ?? 0);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const overall = mean(scored.map(miss));

type Group = {
  feature: string;
  n: number;
  miss: number;
  sentenceWrong: number;
  sentencePartly: number;
  noteScored: number;
  noteMiss: number;
  extraOk: number;
  /** Share of index examples with this feature that have a note. */
  docNoteShare: number | null;
  misread: [string, number][];
  sources: string[];
};
function groups(featuresOf: (row: Row) => string[], indexFeatures: (pair: ExamplePair) => string[]): Group[] {
  const by = new Map<string, Row[]>();
  for (const row of scored) for (const f of new Set(featuresOf(row))) by.set(f, [...(by.get(f) ?? []), row]);
  return [...by].map(([feature, members]) => {
    const withNote = members.filter((row) => NOTE_MISS[row.verdict!.note] != null && row.kind !== "checkpoint");
    const inIndex = context.index.filter((pair) => indexFeatures(pair).includes(feature));
    const misread = new Map<string, number>();
    for (const row of members) for (const piece of row.verdict!.misread) misread.set(piece, (misread.get(piece) ?? 0) + 1);
    return {
      feature,
      n: members.length,
      miss: mean(members.map(miss)),
      sentenceWrong: members.filter((row) => row.verdict!.sentence === "wrong").length,
      sentencePartly: members.filter((row) => row.verdict!.sentence === "partly").length,
      noteScored: withNote.length,
      noteMiss: withNote.filter((row) => (NOTE_MISS[row.verdict!.note] ?? 0) > 0).length,
      extraOk: members.filter((row) => row.verdict!.note === "extra-ok").length,
      docNoteShare: inIndex.length ? inIndex.filter((pair) => pair.note != null).length / inIndex.length : null,
      misread: [...misread].sort((a, b) => b[1] - a[1]).slice(0, 4),
      sources: members.filter((row) => miss(row) > 0).map((row) => row.source),
    };
  });
}
const MIN_N = 3;
/** Features in more than about a third of the index (weight < 1) are on nearly every pair and say nothing. */
const RARE_WEIGHT = 1;
const rare = (feature: string) => (weights.get(feature) ?? Infinity) >= RARE_WEIGHT;
/** Worst first by misses beyond the overall rate: (miss − overall) × n. */
const rank = (list: Group[]) =>
  list.filter((g) => g.n >= MIN_N && rare(g.feature)).sort((a, b) => (b.miss - overall) * b.n - (a.miss - overall) * a.n || b.miss - a.miss);
const byConstruction = rank(groups((row) => row.constructions, (pair) => pair.constructions));
const byLabel = rank(groups((row) => row.labels.map((label) => `label:${label}`), (pair) => pair.labels.map((label) => `label:${label}`)));
// Phase 1 may have missed a required note: docs rarely note this construction, replies keep adding a correct one.
const noteHints = groups((row) => row.constructions, (pair) => pair.constructions)
  .filter((g) => g.extraOk >= 2 && g.extraOk / g.n >= 0.3 && (g.docNoteShare ?? 0) < 0.2)
  .sort((a, b) => b.extraOk - a.extraOk);

const misreadAll = new Map<string, number>();
for (const row of scored) for (const piece of row.verdict!.misread) misreadAll.set(piece, (misreadAll.get(piece) ?? 0) + 1);

const kinds = (Object.keys(pools) as Kind[]).map((kind) => {
  const members = scored.filter((row) => row.kind === kind);
  return { kind, pool: pools[kind].length, n: members.length, miss: mean(members.map(miss)) };
});
const count = <T extends string>(field: (row: Row) => T) => {
  const out: Record<string, number> = {};
  for (const row of scored) out[field(row)] = (out[field(row)] ?? 0) + 1;
  return out;
};
const cost = rows.reduce((sum, row) => sum + row.cost, 0);

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const groupTable = (list: Group[]) => [
  "| Feature | n | Miss | Excess | Sentence wrong / partly | Note miss / scored | Extra note ok | Doc note share | Misread pieces |",
  "|---|---|---|---|---|---|---|---|---|",
  ...list.map(
    (g) =>
      `| \`${g.feature}\` | ${g.n} | ${pct(g.miss)} | ${((g.miss - overall) * g.n).toFixed(1)} | ${g.sentenceWrong} / ${g.sentencePartly} | ${g.noteMiss} / ${g.noteScored} | ${g.extraOk} | ${g.docNoteShare == null ? "–" : pct(g.docNoteShare)} | ${g.misread.map(([p, c]) => `\`${cell(p)}\` ×${c}`).join(", ")} |`,
  ),
];

const md: string[] = [
  "# LLM prompt evaluation",
  "",
  `Translator \`${TRANSLATOR}\`, judge \`${JUDGE}\`, seed ${SEED}, ${rows.length} pairs (${scored.length} scored, ${failed.length} errors). Cost $${cost.toFixed(2)}.`,
  "",
  `Miss per pair is the worse of its sentence score (same 0, partly 0.5, wrong 1) and note score (carried / none / extra-ok 0, partly 0.5, missing / wrong / extra-wrong 1). Overall miss: **${pct(overall)}**.`,
  "",
  "| Kind | Pool | Sampled | Miss |",
  "|---|---|---|---|",
  ...kinds.map((k) => `| ${k.kind} | ${k.pool} | ${k.n} | ${pct(k.miss)} |`),
  "",
  `Sentence: ${Object.entries(count((row) => row.verdict!.sentence)).map(([k, v]) => `${k} ${v}`).join(", ")}. Note: ${Object.entries(count((row) => row.verdict!.note)).map(([k, v]) => `${k} ${v}`).join(", ")}. Unreadable replies: ${scored.filter((row) => !row.reply).length}.`,
  "",
  `## By construction (n ≥ ${MIN_N}, in a third of the index or fewer, worst excess miss first)`,
  "",
  "Excess miss is (miss − overall) × n: how many pairs' worth of misses the feature adds beyond the overall rate.",
  "",
  ...groupTable(byConstruction),
  "",
  `## By label (n ≥ ${MIN_N}, same ranking)`,
  "",
  ...groupTable(byLabel),
  "",
  "## Possible missed notes",
  "",
  "Constructions whose doc examples rarely have a note while replies keep adding a correct one.",
  "",
  ...(noteHints.length ? groupTable(noteHints) : ["None."]),
  "",
  "## Most misread gloss pieces",
  "",
  ...[...misreadAll].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([piece, c]) => `- \`${cell(piece)}\` ×${c}`),
  "",
  "## Misses",
  "",
  ...scored
    .filter((row) => miss(row) > 0)
    .sort((a, b) => miss(b) - miss(a) || a.source.localeCompare(b.source))
    .flatMap((row) => [
      `### ${row.source} (${row.kind}): sentence ${row.verdict!.sentence}, note ${row.verdict!.note}`,
      "",
      `- Gloss: \`${row.gloss}\``,
      `- Doc: "${row.docSentence}"${row.docNote ? ` (${row.docNote})` : ""}`,
      `- Reply: ${row.reply ? `"${row.reply.sentence}"${row.reply.note ? ` (${row.reply.note})` : ""}` : `\`${cell(row.replyRaw.slice(0, 200))}\``}`,
      `- Sentence: ${row.verdict!.sentenceWhy}${row.verdict!.misread.length ? ` Misread: ${row.verdict!.misread.map((p) => `\`${p}\``).join(", ")}.` : ""}`,
      ...(row.verdict!.noteWhy ? [`- Note: ${row.verdict!.noteWhy}`] : []),
      `- Examples shown: ${row.examples.join(", ") || "none"}`,
      "",
    ]),
  ...(failed.length ? ["## Errors", "", ...failed.map((row) => `- ${row.source}: ${cell(row.error!.slice(0, 300))}`)] : []),
];
writeFileSync(join(OUT, "report.md"), md.join("\n") + "\n");
writeFileSync(
  join(OUT, "report.json"),
  JSON.stringify({ translator: TRANSLATOR, judge: JUDGE, seed: SEED, overall, kinds, cost, byConstruction, byLabel, noteHints }, null, 2),
);
console.log(`${scored.length} scored, ${failed.length} errors, overall miss ${pct(overall)}, $${cost.toFixed(2)}. Report: ${join(OUT, "report.md")}`);
if (failed.length) process.exitCode = 1;
