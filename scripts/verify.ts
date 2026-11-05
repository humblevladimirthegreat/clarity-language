/**
 * One quiet check per item: cheat-sheet blocks, build, and tests, compared with a saved baseline.
 *
 * Run: npm run verify -- --baseline          save the current errors to tmp/verify-baseline.json
 *      npm run verify                        print PASS/FAIL, errors new since the baseline, and a resolved count
 *      npm run verify -- --allow-generate    also treat checkpoint errors on allowlist **generate** rows as expected
 *      npm run verify -- --fast              skip tests (cheat-sheet blocks and build only)
 *
 * Steps: `cheat-sheet-blocks --write`, then `node scripts/build.mjs` (which runs `npm test` as one
 * of its jobs, so tests run once). Output stays under about 30 lines; the full log is in
 * tmp/verify-last.log. Exit code 0 means no new errors.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { allowlistRows } from "../src/lint/checkpoint-inventory.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import { compare, jobKeys, jobOf, splitJobs, stripAnsi, type ErrorKey } from "./lib/verify.ts";

const TMP = join(REPO_ROOT, "tmp");
const BASELINE = join(TMP, "verify-baseline.json");
const LAST_LOG = join(TMP, "verify-last.log");
const ALLOWLIST = join(REPO_ROOT, "docs", "meta", "drill-generation.md");
const SHOW = 22;

type Baseline = { saved: string; fast: boolean; keys: ErrorKey[] };

function parseArgs(argv: string[]) {
  const flags = new Set(argv);
  for (const flag of flags) {
    if (!["--baseline", "--allow-generate", "--fast"].includes(flag)) {
      throw new Error(`Unknown argument: ${flag}\nUsage: npm run verify -- [--baseline] [--allow-generate] [--fast]`);
    }
  }
  return { baseline: flags.has("--baseline"), allowGenerate: flags.has("--allow-generate"), fast: flags.has("--fast") };
}

function sh(command: string, env: NodeJS.ProcessEnv = {}): { code: number; out: string } {
  const result = spawnSync("sh", ["-c", `${command} 2>&1`], {
    cwd: REPO_ROOT,
    env: { ...process.env, FORCE_COLOR: "0", ...env },
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return { code: result.status ?? 1, out: stripAnsi(result.stdout ?? "") };
}

function generatePages(): Set<string> {
  return new Set(
    allowlistRows(readFileSync(ALLOWLIST, "utf8"))
      .filter((row) => row.status === "generate")
      .map((row) => row.file.replace(/^.*\//, "")),
  );
}

function run(fast: boolean): { keys: ErrorKey[]; ran: Set<string>; failedJobs: string[] } {
  const blocks = sh("node_modules/.bin/tsx scripts/cheat-sheet-blocks.ts --write");
  const build = sh("node scripts/build.mjs", fast ? { BUILD_SKIP_TEST: "1" } : {});
  mkdirSync(TMP, { recursive: true });
  writeFileSync(LAST_LOG, `$ cheat-sheet-blocks --write (exit ${blocks.code})\n${blocks.out}\n$ build (exit ${build.code})\n${build.out}`);

  const jobs = splitJobs(build.out);
  const label = "cheat-sheet-blocks --write";
  jobs.unshift({ label, ok: blocks.code === 0, lines: blocks.out.split("\n") });
  const keys = jobs.flatMap(jobKeys);
  if (build.code !== 0 && !jobs.slice(1).some((j) => !j.ok)) {
    keys.push(`build | (failed) | exit ${build.code} with no failed job line; see tmp/verify-last.log`);
  }
  return { keys, ran: new Set(jobs.map((j) => j.label)), failedJobs: jobs.filter((j) => !j.ok).map((j) => j.label) };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const started = Date.now();
  const { keys, ran, failedJobs } = run(options.fast);
  const secs = `${Math.round((Date.now() - started) / 1000)}s`;
  const failedNote = failedJobs.length ? `failed jobs: ${failedJobs.join(", ")}` : "every job passed";

  if (options.baseline) {
    const generate = generatePages();
    const onGenerate = compare(keys, [], ran, generate).generate;
    const baseline: Baseline = { saved: new Date().toISOString(), fast: options.fast, keys };
    writeFileSync(BASELINE, `${JSON.stringify(baseline, null, 2)}\n`);
    console.log(`verify: BASELINE saved, ${keys.length} error key(s), ${onGenerate} on generate rows (${failedNote}; ${secs})`);
    console.log("  tmp/verify-baseline.json; full log tmp/verify-last.log");
    return;
  }

  let baseline: Baseline = { saved: "none", fast: false, keys: [] };
  if (existsSync(BASELINE)) baseline = JSON.parse(readFileSync(BASELINE, "utf8")) as Baseline;
  const result = compare(keys, baseline.keys, ran, options.allowGenerate ? generatePages() : undefined);
  const pass = result.fresh.length === 0;
  const parts = [
    `${result.fresh.length} new`,
    `${result.resolved.length} resolved`,
    `${baseline.keys.length - result.resolved.length - result.unchecked} baseline still open`,
  ];
  if (options.allowGenerate) parts.push(`${result.generate} on generate rows (expected)`);
  if (result.unchecked) parts.push(`${result.unchecked} not checked (job skipped)`);
  console.log(`verify: ${pass ? "PASS" : "FAIL"}, ${parts.join(", ")} (${failedNote}; ${secs})`);
  if (baseline.saved === "none") console.log("  no baseline: run npm run verify -- --baseline first; every error counts as new");
  const byJob = new Map<string, ErrorKey[]>();
  for (const key of result.fresh) byJob.set(jobOf(key), [...(byJob.get(jobOf(key)) ?? []), key]);
  let shown = 0;
  for (const [, list] of byJob) {
    for (const key of list) {
      if (shown >= SHOW) break;
      console.log(`  ${key.length > 220 ? `${key.slice(0, 217)}...` : key}`);
      shown += 1;
    }
  }
  if (result.fresh.length > shown) console.log(`  ... ${result.fresh.length - shown} more new; see tmp/verify-last.log`);
  if (!pass) console.log("  full log: tmp/verify-last.log");
  process.exit(pass ? 0 : 1);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
