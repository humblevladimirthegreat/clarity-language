/**
 * Short failure reports for `npm run build` and `npm test`. The full output goes to a log under
 * tmp/logs/; stdout ends with only the issue lines an agent needs to fix the failure, `file:line` kept.
 * Line classification is shared with `npm run verify` ({@link issueLines}).
 */
import { relative } from "node:path";

import { issueLines, stripAnsi } from "./verify.ts";

export const ISSUE_LIMIT = 30;
export const ASSERTION_LIMIT = 12;
/** A footer line longer than this is cut: a failed `assert.match` prints its whole input on one line. */
export const LINE_WIDTH = 200;

/** A line cut to {@link LINE_WIDTH}, saying how much was cut. */
export function clip(line: string): string {
  return line.length <= LINE_WIDTH ? line : `${line.slice(0, LINE_WIDTH)}… (+${line.length - LINE_WIDTH} chars)`;
}

/** Lines that count or report success: useful in the log, noise in a failure footer. */
const FOOTER_NOISE = [/^OK\b/, /^warning: /, /^[✓✗] shard \d+\/\d+:/, /^[A-Z][\w -]*: \d+ /, /^▶ /, /^ℹ /, /^\s+at /, /^\s*[{}]$/];

/**
 * Footer lines for one failed build job: its issue lines (paths, indented details and the headers
 * over them) up to `limit`, then how many more are in the log, then its summary lines (headers
 * with no details under them, where the lints name the fix and the rule's anchor).
 */
export function jobFooter(label: string, output: string, log: string, limit = ISSUE_LIMIT): string[] {
  const lines = stripAnsi(output).split("\n");
  if (label === "test") return capped(testFailureLines(output), limit, log);
  const issues = issueLines(lines).filter((issue) => !FOOTER_NOISE.some((re) => re.test(issue.text)));
  const body: string[] = [];
  const summaries: string[] = [];
  issues.forEach((issue, i) => {
    if (issue.kind === "header" && issues[i + 1]?.kind !== "detail") summaries.push(issue.text);
    else body.push(clip(issue.text));
  });
  if (!body.length && !summaries.length) return lastLines(lines, 10).map(clip);
  return [...capped(body, limit, log), ...summaries];
}

function capped(lines: string[], limit: number, log: string): string[] {
  if (lines.length <= limit) return lines;
  return [...lines.slice(0, limit), `… ${lines.length - limit} more in ${log}`];
}

function lastLines(lines: string[], n: number): string[] {
  return lines.filter((l) => l.trim()).slice(-n);
}

/** A failing test; `message` holds at most {@link ASSERTION_LIMIT} lines, each clipped, and `more` counts the lines left out. */
export type TestFailure = { name: string; location: string; file: string; message: string[]; more: number };

/**
 * Failing tests from node:test spec-reporter output, read from each shard's `✖ failing tests:`
 * list. The location is the first stack frame inside the repo (the assertion line); tsx shifts the
 * reporter's own `test at` line, so that is only the fallback.
 */
export function parseTestFailures(output: string, root = process.cwd()): TestFailure[] {
  const lines = stripAnsi(output).split("\n");
  const failures: TestFailure[] = [];
  let inList = false;
  let current: (TestFailure & { testAt: string; done: boolean }) | undefined;
  const finish = () => {
    if (!current) return;
    const { name, location, file, message, more, testAt } = current;
    failures.push({
      name,
      location: location || testAt,
      file: file || testAt.replace(/:\d+(?::\d+)?$/, ""),
      message,
      more,
    });
    current = undefined;
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (/^✖ failing tests:$/.test(line)) {
      finish();
      inList = true;
      continue;
    }
    if (!inList) continue;
    if (/^[✓✗] shard \d+\/\d+:/.test(line)) {
      finish();
      inList = false;
      continue;
    }
    const testAt = /^test at (.+)$/.exec(line);
    if (testAt) {
      finish();
      current = { name: "", location: "", file: "", message: [], more: 0, testAt: testAt[1]!, done: false };
      continue;
    }
    const name = /^✖ (.+?)(?: \(\d+(?:\.\d+)?m?s\))?$/.exec(line);
    if (name && current && !current.name) {
      current.name = name[1]!;
      continue;
    }
    if (!current) continue;
    const frame = /^\s+at (?:.*\()?(?:file:\/\/)?([^()\s]+?):(\d+):\d+\)?(?: \{)?$/.exec(line);
    if (frame) {
      current.done = true;
      const path = frame[1]!;
      if (!current.location && !path.startsWith("node:") && !path.includes("node_modules") && path.startsWith(root)) {
        current.file = relative(root, path);
        current.location = `${current.file}:${frame[2]}`;
      }
      continue;
    }
    if (current.done) continue;
    if (!line.trim()) continue;
    if (current.message.length < ASSERTION_LIMIT) current.message.push(clip(line.replace(/^ {2}/, "")));
    else current.more++;
  }
  finish();
  return failures;
}

/** The first assertion line of each failing test, by test name (the first failure wins when a name repeats). */
export function testAssertions(output: string, root = process.cwd()): Map<string, string> {
  const out = new Map<string, string>();
  for (const failure of parseTestFailures(output, root)) {
    if (failure.message.length && !out.has(failure.name)) out.set(failure.name, failure.message[0]!);
  }
  return out;
}

/** Error keys, each `test | name` key followed by its first assertion line (indented, already clipped) when the log has one. */
export function keysWithAssertions(keys: readonly string[], assertions: ReadonlyMap<string, string>): string[] {
  return keys.flatMap((key) => {
    const message = key.startsWith("test | ") ? assertions.get(key.slice("test | ".length)) : undefined;
    return message ? [key, `    ${message}`] : [key];
  });
}

/** One block per failing test: `✖ name`, its location, the assertion, and the command that reruns its file. */
export function testFailureLines(output: string, root = process.cwd()): string[] {
  const failures = parseTestFailures(output, root);
  if (!failures.length) return lastLines(stripAnsi(output).split("\n"), 15);
  return failures.flatMap((f) => [
    `✖ ${f.name}`,
    `  ${f.location}`,
    ...f.message.map((l) => `  ${l}`),
    ...(f.more ? [`  … ${f.more} more lines in the full output`] : []),
    `  rerun: npm test -- ${f.file}`,
  ]);
}

/** The footer for a failed build: each failed job's lines under a `✗ label` line, last on stdout. */
export function buildFooter(failed: readonly { label: string; out: string }[], log: string): string[] {
  const out = [`Failures (full output: ${log}; BUILD_VERBOSE=1 prints it all):`];
  for (const job of failed) {
    out.push(`✗ ${job.label}`);
    for (const line of jobFooter(job.label, job.out, log)) out.push(`  ${line}`);
  }
  out.push(`failed: ${failed.map((j) => j.label).join(", ")}`);
  return out;
}

