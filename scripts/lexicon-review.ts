#!/usr/bin/env node
/**
 * LLM-driven lexicon review with a local model (LM Studio).
 *
 * The model only sees English: every check is one atomic question about a concrete / abstract /
 * mnemonic tuple or a word pair. Results are a triage queue for a human; nothing here edits
 * the lexicon CSVs. Plan: docs/meta/lexicon-review.md.
 *
 *   ping [--smoke-test]
 *   calibrate <check,…> [--sample N --seed S]     write gold.jsonl skeleton, or score labeled gold
 *   run <check> [--limit N] [--only A,B] [--single-pass | --full] [--model ID] [--reasoning none|low|medium|high|default]
 *       default: adaptive (pass 2 only near the flag boundary); reasoning none unless LEXICON_REVIEW_REASONING is set
 *   pairs [--embed] [--scan] [--min-sim 0.85] [--max-pairs 300] [--max-overlay 100]
 *   report <check> [--worst N]
 *   triage
 *   status
 *
 * Env: LM_STUDIO_BASE_URL, LM_STUDIO_MODEL (or LEXICON_REVIEW_MODEL), LEXICON_REVIEW_EMBED_MODEL.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";

import { concreteAbstractCollide } from "../src/lexicon-published-lint.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import {
  chatCompletion,
  chatCompletionJson,
  checkLlmHealth,
  embedTexts,
  resolveLlmConfig,
  type LlmClientConfig,
} from "./lib/llm-client.js";
import { loadProjectEnv } from "./lib/load-env.js";
import { CHECKS, getCheck } from "./lib/lexicon-review-checks.js";
import { goldPath, readGold, sampleForGold, scoreCalibration } from "./lib/lexicon-review-calibrate.js";
import {
  clusterMessages,
  clusterPairs,
  countByKind,
  embeddingPairs,
  exactPairs,
  parseClusterResponse,
} from "./lib/lexicon-review-pairs.js";
import {
  buildTriage,
  evaluate,
  formatWorst,
  readTriage,
  serializeTriage,
  triagePath,
  withBiasTags,
  type Finding,
} from "./lib/lexicon-review-report.js";
import { llmAsk, modelTag, runCheck, selectSubjects, type Reasoning } from "./lib/lexicon-review-runner.js";
import { ReviewStore } from "./lib/lexicon-review-store.js";
import {
  REVIEW_DIR,
  allSubjects,
  loadLexiconData,
  pairsPath,
} from "./lib/lexicon-review-subjects.js";
import type { Check, Subject } from "./lib/lexicon-review-types.js";

loadProjectEnv(REPO_ROOT);

type Args = { command: string; positional: string[]; flags: Map<string, string | true> };

function parseArgs(argv: string[]): Args {
  const [command = "", ...rest] = argv.slice(2);
  const positional: string[] = [];
  const flags = new Map<string, string | true>();
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i]!;
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const [name, inline] = token.slice(2).split("=", 2) as [string, string | undefined];
    if (inline !== undefined) flags.set(name, inline);
    else if (rest[i + 1] !== undefined && !rest[i + 1]!.startsWith("--")) flags.set(name, rest[++i]!);
    else flags.set(name, true);
  }
  return { command, positional, flags };
}

const flagStr = (a: Args, name: string): string | undefined => {
  const v = a.flags.get(name);
  return typeof v === "string" ? v : undefined;
};
const flagNum = (a: Args, name: string, fallback: number): number => {
  const v = flagStr(a, name);
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`--${name} must be a number`);
  return n;
};

function config(args: Args): LlmClientConfig {
  const base = resolveLlmConfig();
  const model = (flagStr(args, "model") ?? process.env.LEXICON_REVIEW_MODEL ?? base.model).trim();
  if (!model) {
    throw new Error("Set LM_STUDIO_MODEL (e.g. qwen/qwen3.8-27b) or pass --model. `ping` lists loaded models.");
  }
  return { ...base, model };
}

const REASONING: Reasoning[] = ["none", "low", "medium", "high", "default"];

/** `none` skips the thinking trace (about 6x faster); calibrate before trusting it over `default`. */
function reasoningOf(args: Args): Reasoning {
  const value = flagStr(args, "reasoning") ?? process.env.LEXICON_REVIEW_REASONING ?? "none";
  if (!REASONING.includes(value as Reasoning)) throw new Error(`--reasoning must be one of ${REASONING.join(", ")}`);
  return value as Reasoning;
}

/** Model id plus reasoning setting: the tag results are cached and looked up under. */
function tagOf(args: Args, cfg: LlmClientConfig): string {
  return modelTag(cfg.model, reasoningOf(args));
}

function checksFrom(arg: string | undefined): Check[] {
  if (!arg) throw new Error(`Name a check: ${CHECKS.map((c) => c.id).join(", ")}`);
  return arg === "all" ? CHECKS : arg.split(",").map((id) => getCheck(id.trim()));
}

/** Subjects with `bias-image` inputs filled in from the current `bias-prone` results. */
function subjectsFor(model: string): Subject[] {
  const subjects = allSubjects(loadLexiconData());
  const biasStore = new ReviewStore("bias-prone");
  const findings = evaluate(getCheck("bias-prone"), subjects, model, biasStore);
  return withBiasTags(subjects, findings);
}

async function cmdPing(args: Args): Promise<void> {
  const cfg = resolveLlmConfig();
  const health = await checkLlmHealth(cfg);
  console.log(`Base URL: ${health.baseUrl}\nModel: ${cfg.model || "(not set)"}\nHealth: ${health.ok ? "ok" : "failed"}`);
  for (const id of health.models) console.log(`  - ${id}${id === cfg.model ? " *" : ""}`);
  if (health.error) throw new Error(health.error);
  if (args.flags.has("smoke-test")) {
    const reply = await chatCompletion(
      config(args),
      [{ role: "user", content: 'Reply with exactly: {"status":"ok"}' }],
      { temperature: 0, maxTokens: 512 },
    );
    console.log(`Smoke test: ${reply.slice(0, 120)}`);
  }
}

function status(args: Args): void {
  const cfg = config(args);
  const subjects = subjectsFor(tagOf(args, cfg));
  console.log("check".padEnd(24), "subjects".padStart(8), "flagged".padStart(8), "unstable".padStart(9), "missing".padStart(8), "error".padStart(6));
  for (const check of CHECKS) {
    const findings = evaluate(check, subjects, tagOf(args, cfg), new ReviewStore(check.id));
    const n = (s: string) => findings.filter((f) => f.result.status === s).length;
    console.log(
      check.id.padEnd(24),
      String(findings.length).padStart(8),
      String(n("flagged")).padStart(8),
      String(n("unstable")).padStart(9),
      String(n("missing")).padStart(8),
      String(n("error")).padStart(6),
    );
  }
}

async function cmdRun(args: Args): Promise<void> {
  const cfg = config(args);
  const check = checksFrom(args.positional[0])[0]!;
  const store = new ReviewStore(check.id);
  const only = flagStr(args, "only");
  const limit = flagStr(args, "limit");
  const subjects = subjectsFor(tagOf(args, cfg));
  const singlePass = args.flags.has("single-pass");
  const full = args.flags.has("full");
  const variants: Array<0 | 1> = singlePass ? [0] : [0, 1];
  const mode = singlePass ? "single pass" : full ? "2 passes" : "adaptive 2nd pass";
  const picked = selectSubjects({ check, subjects });
  if (picked.length === 0) {
    const hint = check.kind === "pair" ? " Run `pairs` first." : check.id === "bias-image" ? " Run `run bias-prone` first." : "";
    throw new Error(`No subjects for ${check.id}.${hint}`);
  }
  console.log(`${check.id}: ${picked.length} subjects, ${mode}, model ${tagOf(args, cfg)}`);
  const summary = await runCheck({
    check,
    subjects,
    model: tagOf(args, cfg),
    store,
    ask: llmAsk(cfg, reasoningOf(args)),
    variants,
    adaptive: !singlePass && !full,
    limit: limit ? Number(limit) : undefined,
    only: only ? new Set(only.split(",")) : undefined,
    onProgress: ({ done, total, etaMs }) => {
      if (done % 25 === 0 || done === total) {
        console.log(`  ${done}/${total}  eta ${(etaMs / 60000).toFixed(1)} min`);
      }
    },
  });
  console.log(`done: asked ${summary.asked}, cached ${summary.cached}, errors ${summary.errors}`);
}

async function cmdCalibrate(args: Args): Promise<void> {
  const cfg = config(args);
  const checks = checksFrom(args.positional[0]);
  const subjects = subjectsFor(tagOf(args, cfg));
  const sample = flagStr(args, "sample");

  if (sample !== undefined) {
    if (existsSync(goldPath()) && !args.flags.has("force")) {
      throw new Error(`${goldPath()} exists; pass --force to overwrite (this discards labels).`);
    }
    const lines = checks.flatMap((check) => {
      const pool = selectSubjects({ check, subjects });
      const suspect = (s: Subject) =>
        Boolean(s.data.abstract && concreteAbstractCollide(s.data.concrete ?? "", s.data.abstract)) ||
        (s.data.mnemonic ?? "").split(/\s+/).length < 4;
      return sampleForGold(pool, [check.id], Number(sample), flagNum(args, "seed", 1), suspect);
    });
    mkdirSync(REVIEW_DIR, { recursive: true });
    writeFileSync(goldPath(), `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`, "utf8");
    console.log(`Wrote ${lines.length} entries to ${goldPath()}. Set "label" to good | bad | borderline, then rerun without --sample.`);
    return;
  }

  const gold = readGold();
  for (const check of checks) {
    const entries = gold.filter((g) => g.check === check.id && g.label);
    const bySubject = new Map(subjects.filter((s) => s.kind === check.kind).map((s) => [s.key, s]));
    const store = new ReviewStore(check.id);
    const targets = entries.map((e) => bySubject.get(e.key)).filter((s): s is Subject => Boolean(s));
    await runCheck({ check, subjects: targets, model: tagOf(args, cfg), store, ask: llmAsk(cfg, reasoningOf(args)) });
    const findings = new Map(evaluate(check, targets, tagOf(args, cfg), store).map((f) => [f.subject.key, f]));
    const result = scoreCalibration(
      entries.map((e) => ({
        key: e.key,
        label: e.label as "good" | "bad" | "borderline",
        flagged: findings.get(e.key)?.result.status === "flagged",
      })),
    );
    console.log(
      `${check.id}: n=${result.n} accuracy=${result.accuracy.toFixed(2)} recall=${result.recall.toFixed(2)} precision=${result.precision.toFixed(2)} → ${result.verdict}`,
    );
    if (result.falsePositives.length) console.log(`  false positives: ${result.falsePositives.join(" ")}`);
    if (result.misses.length) console.log(`  misses: ${result.misses.join(" ")}`);
  }
}

async function cmdPairs(args: Args): Promise<void> {
  const data = loadLexiconData();
  const map = exactPairs(data);
  console.log(`spelling-based: ${JSON.stringify(countByKind(map))}`);
  const cfg = config(args);

  if (args.flags.has("embed")) {
    const model = process.env.LEXICON_REVIEW_EMBED_MODEL ?? "text-embedding-nomic-embed-text-v1.5";
    await embeddingPairs(
      data,
      (texts) => embedTexts(cfg, model, texts),
      {
        maxRowPairs: flagNum(args, "max-pairs", 300),
        maxOverlayPairs: flagNum(args, "max-overlay", 100),
        minSim: flagNum(args, "min-sim", 0.85),
      },
      map,
    );
    console.log(`after embeddings (${model}): ${JSON.stringify(countByKind(map))}`);
  }

  if (args.flags.has("scan")) {
    const words = [...new Set(data.published.map((r) => r.abstract).filter(Boolean))].sort();
    console.log(`synonym scan: ${words.length} unique abstracts in one prompt`);
    const groups = await chatCompletionJson(
      cfg,
      clusterMessages(words),
      { temperature: 0, maxTokens: 16384, seed: 1, reasoningEffort: reasoningOf(args) === "default" ? undefined : (reasoningOf(args) as "none" | "low" | "medium" | "high") },
      (v) => parseClusterResponse(v, new Set(words)),
    );
    clusterPairs(data, groups, map);
    console.log(`after scan (${groups.length} groups): ${JSON.stringify(countByKind(map))}`);
  }

  mkdirSync(REVIEW_DIR, { recursive: true });
  const lines = [...map.values()].sort((a, b) => a.key.localeCompare(b.key)).map((s) => JSON.stringify(s));
  writeFileSync(pairsPath(), `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${lines.length} pairs to ${pairsPath()}`);
}

function cmdReport(args: Args): void {
  const cfg = config(args);
  const subjects = subjectsFor(tagOf(args, cfg));
  for (const check of checksFrom(args.positional[0])) {
    const findings = evaluate(check, subjects, tagOf(args, cfg), new ReviewStore(check.id));
    console.log(`${formatWorst(check, findings, flagNum(args, "worst", 30))}\n`);
  }
}

function cmdTriage(args: Args): void {
  const cfg = config(args);
  const subjects = subjectsFor(tagOf(args, cfg));
  const perCheck: Array<{ check: Check; findings: Finding[] }> = CHECKS.map((check) => ({
    check,
    findings: evaluate(check, subjects, tagOf(args, cfg), new ReviewStore(check.id)),
  }));
  const rows = buildTriage(perCheck, readTriage());
  mkdirSync(REVIEW_DIR, { recursive: true });
  writeFileSync(triagePath(), serializeTriage(rows), "utf8");
  const subjectsFlagged = new Set(rows.map((r) => r.key)).size;
  console.log(`Wrote ${rows.length} findings for ${subjectsFlagged} subjects to ${triagePath()} (human_decision / notes preserved).`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  switch (args.command) {
    case "ping":
      return cmdPing(args);
    case "run":
      return cmdRun(args);
    case "calibrate":
      return cmdCalibrate(args);
    case "pairs":
      return cmdPairs(args);
    case "report":
      return cmdReport(args);
    case "triage":
      return cmdTriage(args);
    case "status":
      return status(args);
    default:
      throw new Error("Usage: npm run lexicon-review -- <ping|calibrate|run|pairs|report|triage|status> [options]");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
