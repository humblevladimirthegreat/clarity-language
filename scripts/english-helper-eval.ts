#!/usr/bin/env tsx
/**
 * Phase 5 of the English helper's quality loop ([english-helper-quality.md](../docs/proposals/english-helper-quality.md)):
 * the model eval. For each sampled English → Ageben checkpoint item, build the helper's
 * `--llm-prompt` with the item's own answers held out of the examples, have a small model write
 * the Ageben, check the draft for free (exact match with an accepted answer, parse, unknown
 * words, `--verify` checks), back-translate it with the Ageben → English prompt, and have a
 * stronger model judge the draft against the item's English. Each miss is read against the free
 * metrics: was the sentence self-contained, and was each reference word the draft did not use
 * in the prompt (word), shown as a pattern, or missing (coverage.ts)?
 *
 * Shortcuts: a draft equal to an accepted answer is right with no further call, and a draft
 * that does not parse is wrong with no further call. Calls `claude -p`, so it costs money and is
 * not part of `npm test`.
 *
 * Output goes to `tmp/english-helper-eval/` (gitignored): `results.jsonl` (one row per item; a
 * rerun with the same settings reuses rows whose prompt is unchanged), `report.md`, `report.json`.
 *
 * Run: npm run english-helper-eval -- [--n 100] [--seed 1] [--concurrency 2]
 *      [--translator claude-haiku-5-5] [--back claude-haiku-5-5] [--judge claude-opus-5-5] [--fresh]
 *      npm run english-helper-eval -- --only page.md:line[,page.md:line …]   (those items, no sampling)
 *      npm run english-helper-eval -- --dry   (list the sample and prompt sizes; no model calls)
 *
 * The sample is spread evenly over the three levels (beginner, intermediate, advanced), not in
 * proportion to the pool, so every level shows its misses in a small batch.
 */
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

import { analyzeEnglish } from "../src/english-helper/analyze.js";
import { coverWord, promptShows, treeWords, type Coverage } from "../src/english-helper/coverage.js";
import { buildHelperPrompt } from "../src/english-helper/llm-prompt.js";
import { loadHelperData } from "../src/english-helper/load.js";
import { verifyDraft } from "../src/english-helper/verify.js";
import { fillSelf } from "../src/learner-name.js";
import { BANDS, pageSections, type Band } from "../src/lint/learning-order.js";
import { practiceItems } from "../src/lint/practice-items.js";
import { loadDefaultTables, parseWithTables } from "../src/parse/index.js";
import { promptForPassage } from "../src/parse/llm-passage.js";
import { loadPromptContext } from "../src/parse/llm-examples.js";
import { featureWeights, type PromptContext } from "../src/parse/llm-prompt.js";
import { morphGlossLine } from "../src/parse/morph-gloss.js";
import { listMarkdown } from "../src/markdown-files.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import { claude, rng, shuffle, withRetry, type CallResult } from "./lib/claude-cli.js";

// ---------------------------------------------------------------------------------------------
// Options

function flag(name: string, fallback: string): string {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1]! : fallback;
}
const N = Number(flag("n", "100"));
const SEED = Number(flag("seed", "1"));
const CONCURRENCY = Number(flag("concurrency", "2"));
// Full model IDs: the CLI's `haiku` alias can resolve to an older model.
const TRANSLATOR = flag("translator", "claude-haiku-5-5");
const BACK = flag("back", "claude-haiku-5-5");
const JUDGE = flag("judge", "claude-opus-5-5");
const FRESH = process.argv.includes("--fresh");
const ONLY = flag("only", "").split(",").filter(Boolean);
const DRY = process.argv.includes("--dry");

const OUT = join(REPO_ROOT, "tmp", "english-helper-eval");
const EMPTY = join(OUT, "empty");
const RESULTS = join(OUT, "results.jsonl");
const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");

// ---------------------------------------------------------------------------------------------
// Items

type Item = { source: string; band: Band | "none"; english: string; answers: string[] };

const tables = loadDefaultTables();
const data = loadHelperData();
const context = loadPromptContext(tables);
const backWeights = featureWeights(context.index);

/** Every English → Ageben checkpoint item with its accepted answers and its level. */
function checkpointItems(): Item[] {
  const out: Item[] = [];
  for (const file of listMarkdown(GRAMMAR_DIR)) {
    const page = basename(file);
    const markdown = readFileSync(file, "utf8");
    const sections = pageSections(page, markdown).sections;
    for (const item of practiceItems(markdown, { review: page === "review.md" }).items) {
      if (item.type !== "en-ag" || !item.promptEnglish) continue;
      const main = item.spoiler.find((line) => line.kind === "ageben");
      if (!main) continue;
      const line = markdown.slice(0, item.index).split("\n").length;
      const band = sections.filter((s) => s.offset <= item.index && item.index < s.end).at(-1)?.band ?? "none";
      out.push({ source: `${page}:${line}`, band, english: item.promptEnglish, answers: [main.text, ...item.alsoCorrect.map((span) => span.text)].map((a) => fillSelf(a)) });
    }
  }
  return out;
}

const pool = checkpointItems();
/** Round-robin over the levels, each shuffled, so a small batch covers all three. */
function sampleItems(): Item[] {
  if (ONLY.length) {
    const picked = pool.filter((item) => ONLY.includes(item.source));
    const found = new Set(picked.map((item) => item.source));
    const absent = ONLY.filter((source) => !found.has(source));
    if (absent.length) throw new Error(`--only: no item at ${absent.join(", ")}`);
    return picked;
  }
  const random = rng(SEED);
  const queues = [...BANDS, "none" as const].map((band) => shuffle(pool.filter((item) => item.band === band), random)).filter((q) => q.length);
  const out: Item[] = [];
  while (out.length < Math.min(N, pool.length)) for (const queue of queues) if (queue.length && out.length < N) out.push(queue.shift()!);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Prompts

/** Lowercase, one space between words, no final period: what two spellings of one answer share. */
const normalize = (ageben: string) => ageben.toLowerCase().replace(/\s+/g, " ").trim().replace(/\s*\.$/, "");
const wordsOf = (ageben: string) => normalize(ageben).split(/[\s.,;:!?]+/).filter(Boolean);

/** The example pool without any pair that shows this item's English or one of its answers. */
function heldOut(item: Item): PromptContext {
  const answers = new Set(item.answers.map(normalize));
  const english = item.english.trim().toLowerCase();
  const index = context.index.filter((pair) => !answers.has(normalize(pair.ageben)) && pair.sentence.trim().toLowerCase() !== english);
  return { ...context, index };
}

function glossOf(ageben: string): string | null {
  try {
    return morphGlossLine(/[.]$/.test(ageben) ? ageben : `${ageben}.`, tables, { strict: true });
  } catch {
    return null;
  }
}

/** The helper prompt, and the free metrics: is each word of the closest accepted answer in it? */
function promptFor(item: Item) {
  const analysis = analyzeEnglish(data, item.english);
  const ctx = heldOut(item);
  const prompt = buildHelperPrompt([{ english: item.english, analysis }], data, ctx);
  const shows = promptShows(prompt, [analysis]);
  const coverage = new Map<string, Map<string, Coverage>>();
  for (const answer of item.answers) {
    try {
      const words = treeWords(parseWithTables(answer, tables, { constructions: true }));
      coverage.set(answer, new Map(words.map((w) => [w.raw, coverWord(w, shows)])));
    } catch {
      // An answer the parser rejects is scored by the recall report; here it only drops out.
    }
  }
  return { analysis, prompt, ctx, coverage };
}

// ---------------------------------------------------------------------------------------------
// Translate, back-translate, judge

const TRANSLATOR_SYSTEM = "You translate English into a constructed language. Follow the instructions in the message exactly.";
const BACK_SYSTEM = "You translate glossed sentences into English. Follow the instructions in the message exactly.";
const JUDGE_SYSTEM = "You are a careful, strict judge of translations. Answer only with the requested structured verdict.";

/**
 * `AGEBEN: <sentence> (<note>)`, lenient about backticks; the last such line wins. Ageben writes
 * parentheses itself (`th(…)`), so the note starts at the first parenthesis after a sentence's
 * final period, and may hold parentheses of its own.
 */
function parseDraft(text: string): { ageben: string; note: string | null } | null {
  const line = text.split("\n").filter((l) => /^\s*`?AGEBEN:/.test(l)).at(-1)?.replace(/`/g, "").trim();
  if (!line) return null;
  const m = /^AGEBEN:\s*(.*?[.?!])\s+\((.*)\)\s*$/.exec(line) ?? /^AGEBEN:\s*(.*?)\s*(?:\(([^()]*)\))?\s*$/.exec(line);
  if (!m || !m[1]) return null;
  return { ageben: m[1], note: m[2]?.trim() || null };
}

/** `ENGLISH: "…"`, lenient about curly quotes; the last such line wins. */
function parseEnglish(text: string): string | null {
  const line = text.replace(/[“”]/g, '"').split("\n").filter((l) => /^\s*`?ENGLISH:/.test(l)).at(-1)?.replace(/`/g, "").trim();
  return (line && /^ENGLISH:\s*"(.*)"/.exec(line)?.[1]?.trim()) || null;
}

const SENTENCE = ["same", "partly", "wrong"] as const;
type Verdict = { sentence: (typeof SENTENCE)[number]; lost: string[]; badWords: string[]; why: string };
const VERDICT_SCHEMA = {
  type: "object",
  properties: {
    sentence: { type: "string", enum: SENTENCE },
    lost: { type: "array", items: { type: "string" } },
    badWords: { type: "array", items: { type: "string" } },
    why: { type: "string" },
  },
  required: ["sentence", "lost", "badWords", "why"],
  additionalProperties: false,
};

function judgePrompt(item: Item, draft: string, back: string | null): string {
  const glossed = (ageben: string) => `${ageben}\n  Gloss: ${glossOf(ageben) ?? "(does not parse)"}`;
  return [
    "A model that has never seen this constructed language translated an English sentence into it, from an analyzer's suggestions. Judge whether its draft says what the English says.",
    "",
    `English: "${item.english}"`,
    "",
    "Accepted answers from the language's documentation (any one is right; others may be too):",
    ...item.answers.map((a) => `- ${glossed(a)}`),
    "",
    `Draft: ${glossed(draft)}`,
    `A second model, reading only the draft, translated it back as: ${back == null ? "(no readable reply)" : `"${back}"`}`,
    "",
    'SENTENCE: does the draft make the same claim as the English? Judge meaning, not wording: a different root with the same meaning, a different but valid word order, or an equally natural tense is fine. Use the glosses; the back-translation is one reader\'s view and may itself be wrong. "same" = same claim; "partly" = the core is right but a piece of meaning is lost, added, or shifted (who, negation, stance, scope, count, tense the English insists on); "wrong" = a different claim.',
    "lost: the English words or phrases (copied verbatim from the English) whose meaning the draft lost or changed; empty when same.",
    "badWords: the draft words (copied verbatim from the draft) that are wrong: a wrong root or sense, a wrong role letter or ending, or a word with no reading; empty when same.",
    "why: one short sentence.",
  ].join("\n");
}

type Step = "translate" | "back" | "judge";
type Outcome = "exact" | "same" | "partly" | "wrong" | "no-parse" | "unreadable";
type Row = {
  key: string;
  source: string;
  band: string;
  english: string;
  answers: string[];
  promptChars: number;
  /** Free metrics on the prompt: every word of some accepted answer is word or pattern. */
  selfContained: boolean;
  draftRaw: string;
  draft: string | null;
  note: string | null;
  parses: boolean;
  unknown: string[];
  checks: string[];
  /** The accepted answer sharing most words with the draft, and its words the draft did not use, with their coverage. */
  closest: string | null;
  diverged: { word: string; coverage: Coverage }[];
  /** English words the analyzer had no suggestion for. */
  gaps: string[];
  back: string | null;
  verdict: Verdict | null;
  outcome: Outcome | null;
  models: Record<Step, string>;
  cost: Record<Step, number>;
  tokens: Record<Step, { input: number; output: number }>;
  error?: string;
};

function keyOf(item: Item, prompt: string): string {
  return createHash("sha256").update([TRANSLATOR, BACK, JUDGE, item.source, item.answers.join("\n"), prompt].join("\0")).digest("hex").slice(0, 16);
}

/**
 * One item. A `cached` row for the same prompt lends its draft, and its back-translation and
 * verdict when the draft reads the same, so a rerun re-scores stored replies for free.
 */
async function evaluate(item: Item, job: ReturnType<typeof promptFor>, cached?: Row): Promise<{ row: Row; spent: number }> {
  const { analysis, prompt, ctx, coverage } = job;
  const row: Row = {
    key: keyOf(item, prompt),
    source: item.source,
    band: item.band,
    english: item.english,
    answers: item.answers,
    promptChars: prompt.length,
    selfContained: [...coverage.values()].some((words) => [...words.values()].every((c) => c !== "missing")),
    draftRaw: "",
    draft: null,
    note: null,
    parses: false,
    unknown: [],
    checks: [],
    closest: null,
    diverged: [],
    gaps: analysis.gaps.map((g) => g.word),
    back: null,
    verdict: null,
    outcome: null,
    models: { translate: TRANSLATOR, back: BACK, judge: JUDGE },
    cost: { translate: 0, back: 0, judge: 0 },
    tokens: { translate: { input: 0, output: 0 }, back: { input: 0, output: 0 }, judge: { input: 0, output: 0 } },
  };
  let spent = 0;
  const spend = (step: Step, call: CallResult) => {
    spent += call.cost;
    row.cost[step] += call.cost;
    row.tokens[step].input += call.tokens.input;
    row.tokens[step].output += call.tokens.output;
  };
  try {
    if (cached) {
      row.draftRaw = cached.draftRaw;
      row.cost.translate = cached.cost.translate;
      row.tokens.translate = cached.tokens.translate;
    } else {
      const translated = await withRetry(() => claude(EMPTY, TRANSLATOR, TRANSLATOR_SYSTEM, prompt));
      spend("translate", translated);
      row.draftRaw = translated.text;
    }
    const reply = parseDraft(row.draftRaw);
    if (!reply) {
      row.outcome = "unreadable";
      return { row, spent };
    }
    row.draft = reply.ageben;
    row.note = reply.note;

    // Free checks.
    const verified = verifyDraft(item.english, reply.ageben, tables, data, analysis);
    row.parses = !verified.error;
    row.unknown = verified.unknown.map((u) => u.raw);
    row.checks = (verified.words ?? []).filter((w) => w.check).map((w) => `${w.raw} (${w.check})`);
    const drafted = new Set(wordsOf(reply.ageben));
    const overlap = (answer: string) => wordsOf(answer).filter((w) => drafted.has(w)).length;
    row.closest = [...coverage.keys()].sort((a, b) => overlap(b) - overlap(a))[0] ?? null;
    if (row.closest) {
      row.diverged = [...coverage.get(row.closest)!].filter(([word]) => !drafted.has(word)).map(([word, c]) => ({ word, coverage: c }));
    }
    if (item.answers.some((a) => normalize(a) === normalize(reply.ageben))) {
      row.outcome = "exact";
      return { row, spent };
    }
    if (!row.parses) {
      row.outcome = "no-parse";
      return { row, spent };
    }

    if (cached?.verdict && cached.draft === reply.ageben) {
      for (const step of ["back", "judge"] as const) [row.cost[step], row.tokens[step]] = [cached.cost[step], cached.tokens[step]];
      row.back = cached.back;
      row.verdict = cached.verdict;
      row.outcome = cached.verdict.sentence;
      return { row, spent };
    }
    const backPrompt = promptForPassage([reply.ageben], tables, { ...ctx, weights: backWeights }, { loose: true });
    const backed = await withRetry(() => claude(EMPTY, BACK, BACK_SYSTEM, backPrompt));
    spend("back", backed);
    row.back = parseEnglish(backed.text);

    const judged = await withRetry(() => claude(EMPTY, JUDGE, JUDGE_SYSTEM, judgePrompt(item, reply.ageben, row.back), VERDICT_SCHEMA));
    spend("judge", judged);
    const verdict = judged.structured as Verdict | undefined;
    if (!verdict || !SENTENCE.includes(verdict.sentence)) throw new Error(`bad verdict: ${judged.text.slice(0, 300)}`);
    row.verdict = verdict;
    row.outcome = verdict.sentence;
  } catch (error) {
    row.error = error instanceof Error ? error.message : String(error);
  }
  return { row, spent };
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

const jobs = sampleItems().map((item) => ({ item, job: promptFor(item) }));
if (DRY) {
  for (const { item, job } of jobs) {
    const cached = previous.has(keyOf(item, job.prompt)) ? " (cached)" : "";
    console.log(`${item.source}\t${item.band}\t${job.prompt.length} chars${cached}\t${item.english}`);
  }
  process.exit(0);
}
writeFileSync(RESULTS, "");
const STEPS: Step[] = ["translate", "back", "judge"];
const rows: Row[] = [];
/** What this run's own calls cost, apart from rows reused from the last run. */
let spentNow = 0;
let done = 0;
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const { item, job } = jobs[next++]!;
    const cached = previous.get(keyOf(item, job.prompt));
    const { row, spent } = await evaluate(item, job, cached);
    rows.push(row);
    appendFileSync(RESULTS, JSON.stringify(row) + "\n");
    done++;
    spentNow += spent;
    process.stderr.write(`[${done}/${jobs.length}] ${row.source} ${row.error ? "ERROR" : row.outcome} $${spent.toFixed(3)}${cached ? " (reused draft)" : ""}\n`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// ---------------------------------------------------------------------------------------------
// Report

const MISS: Record<Outcome, number> = { exact: 0, same: 0, partly: 0.5, wrong: 1, "no-parse": 1, unreadable: 1 };
const scored = rows.filter((row) => row.outcome);
const failed = rows.filter((row) => row.error);
const miss = (row: Row) => MISS[row.outcome!];
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const money = (x: number) => `$${x.toFixed(3)}`;
const costOf = (row: Row) => STEPS.reduce((sum, step) => sum + row.cost[step], 0);
const total = rows.reduce((sum, row) => sum + costOf(row), 0);
const perItem = rows.length ? total / rows.length : 0;

const groupBy = (key: (row: Row) => string) => {
  const by = new Map<string, Row[]>();
  for (const row of scored) by.set(key(row), [...(by.get(key(row)) ?? []), row]);
  return [...by].map(([group, members]) => ({ group, n: members.length, miss: mean(members.map(miss)) }));
};
const outcomes = Object.fromEntries((Object.keys(MISS) as Outcome[]).map((o) => [o, scored.filter((row) => row.outcome === o).length]));
const byBand = groupBy((row) => row.band).sort((a, b) => [...BANDS, "none"].indexOf(a.group) - [...BANDS, "none"].indexOf(b.group));
const bySelf = groupBy((row) => (row.selfContained ? "self-contained" : "not self-contained"));
/** Reference words the draft did not use, by their free coverage label, in hits and in misses. */
const divergence = (["word", "pattern", "missing"] as Coverage[]).map((c) => ({
  coverage: c,
  inMisses: scored.filter((row) => miss(row) > 0).flatMap((row) => row.diverged).filter((d) => d.coverage === c).length,
  inHits: scored.filter((row) => miss(row) === 0).flatMap((row) => row.diverged).filter((d) => d.coverage === c).length,
}));
const steps = STEPS.map((step) => {
  const called = rows.filter((row) => row.cost[step] > 0);
  return {
    step,
    model: rows[0]?.models[step] ?? "",
    calls: called.length,
    cost: called.reduce((sum, row) => sum + row.cost[step], 0),
    input: mean(called.map((row) => row.tokens[step].input)),
    output: mean(called.map((row) => row.tokens[step].output)),
  };
});

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const md: string[] = [
  "# English helper model evaluation",
  "",
  `Translator \`${TRANSLATOR}\`, back-translator \`${BACK}\`, judge \`${JUDGE}\`, seed ${SEED}, ${rows.length} items (${scored.length} scored, ${failed.length} errors). Cost ${money(total)} (this run's own calls ${money(spentNow)}), ${money(perItem)} per item; ${N} items at this rate: about ${money(perItem * N)}.`,
  "",
  `Miss per item: exact or same 0, partly 0.5, wrong, no parse or unreadable 1. Overall miss: **${pct(mean(scored.map(miss)))}**.`,
  "",
  `Outcomes: ${Object.entries(outcomes).map(([k, v]) => `${k} ${v}`).join(", ")}. Drafts with an unknown word: ${scored.filter((row) => row.unknown.length).length}; with a \`--verify\` check: ${scored.filter((row) => row.checks.length).length}.`,
  "",
  "## Cost by step",
  "",
  "| Step | Model | Calls | Cost | Per call | Input tokens / call | Output tokens / call |",
  "|---|---|---|---|---|---|---|",
  ...steps.map((s) => `| ${s.step} | \`${s.model}\` | ${s.calls} | ${money(s.cost)} | ${money(s.calls ? s.cost / s.calls : 0)} | ${Math.round(s.input)} | ${Math.round(s.output)} |`),
  "",
  "## By level",
  "",
  "| Level | Pool | Sampled | Miss |",
  "|---|---|---|---|",
  ...byBand.map((g) => `| ${g.group} | ${pool.filter((item) => item.band === g.group).length} | ${g.n} | ${pct(g.miss)} |`),
  "",
  "## Free metrics against the model",
  "",
  "Does the free *self-contained* score predict the model's result?",
  "",
  "| Prompt | n | Miss |",
  "|---|---|---|",
  ...bySelf.map((g) => `| ${g.group} | ${g.n} | ${pct(g.miss)} |`),
  "",
  "Words of the closest accepted answer that the draft did not use, by how the prompt covered them. A word can differ and still be right (another root, another order), so read the hit column as the baseline.",
  "",
  "| Coverage | In misses | In hits |",
  "|---|---|---|",
  ...divergence.map((d) => `| ${d.coverage} | ${d.inMisses} | ${d.inHits} |`),
  "",
  "## Items",
  "",
  ...[...scored]
    .sort((a, b) => miss(b) - miss(a) || a.source.localeCompare(b.source))
    .flatMap((row) => [
      `### ${row.source} (${row.band}): ${row.outcome}`,
      "",
      `- English: "${row.english}"`,
      `- Accepted: ${row.answers.map((a) => `\`${a}\``).join(", ")}`,
      `- Draft: ${row.draft ? `\`${row.draft}\`${row.note ? ` (${row.note})` : ""}` : `unreadable: \`${cell(row.draftRaw.slice(0, 200))}\``}`,
      ...(row.back ? [`- Back: "${row.back}"`] : []),
      ...(row.verdict && row.verdict.sentence !== "same"
        ? [`- Judge: ${row.verdict.why}${row.verdict.lost.length ? ` Lost: ${row.verdict.lost.map((p) => `*${p}*`).join(", ")}.` : ""}${row.verdict.badWords.length ? ` Bad words: ${row.verdict.badWords.map((w) => `\`${w}\``).join(", ")}.` : ""}`]
        : []),
      `- Prompt: ${row.selfContained ? "self-contained" : "not self-contained"}, ${row.promptChars} chars${row.gaps.length ? `, gaps: ${row.gaps.join(", ")}` : ""}`,
      ...(row.diverged.length ? [`- Not used from \`${row.closest}\`: ${row.diverged.map((d) => `\`${d.word}\` (${d.coverage})`).join(", ")}`] : []),
      ...(row.unknown.length || row.checks.length ? [`- Verify: ${[...row.unknown.map((w) => `\`${w}\` unknown`), ...row.checks.map((c) => `\`${c}\``)].join(", ")}`] : []),
      `- Cost: ${money(costOf(row))}`,
      "",
    ]),
  ...(failed.length ? ["## Errors", "", ...failed.map((row) => `- ${row.source}: ${cell(row.error!.slice(0, 300))}`)] : []),
];
writeFileSync(join(OUT, "report.md"), md.join("\n") + "\n");
writeFileSync(
  join(OUT, "report.json"),
  JSON.stringify({ translator: TRANSLATOR, back: BACK, judge: JUDGE, seed: SEED, overall: mean(scored.map(miss)), outcomes, byBand, bySelf, divergence, steps, cost: total, perItem }, null, 2),
);
console.log(`${scored.length} scored, ${failed.length} errors, overall miss ${pct(mean(scored.map(miss)))}, ${money(total)} (${money(perItem)} per item; this run ${money(spentNow)}). Report: ${join(OUT, "report.md")}`);
if (failed.length) process.exitCode = 1;
