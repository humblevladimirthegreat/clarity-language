/**
 * Error keys for `npm run verify`: split build output into jobs by their `✓` / `✗ label (12.3s)`
 * lines, then turn each failed job's lines into stable keys (`job | context | line`), with line
 * numbers, durations and header counts stripped, so a key survives edits elsewhere on the page.
 */

export type ErrorKey = string;

/** Labels whose status line closes a job in build.mjs output. test.mjs shard lines are not jobs. */
const STATUS = /^([✓✗]) (.+?) \(\d+(?:\.\d+)?s\)$/;
const SHARD = /^shard \d+\/\d+:/;
const NOISE = [/: \d+ checked, /, /morph gloss\(es\) compared to parser$/, /^> /, /^build (?:FAILED|ok) in /, /^failed: /];
const PATH_LINE = /^(\S+?\.(?:md|ts|tsx|vue|csv|tsv|json|mjs|js))(?::\d+(?::\d+)?|\(\d+,\d+\))?:?(\s|$)/;

export type JobResult = { label: string; ok: boolean; lines: string[] };

export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u001b\[[0-9;]*m/g, "");
}

/** Jobs in build output, each with the lines printed since the previous job's status line. */
export function splitJobs(output: string): JobResult[] {
  const jobs: JobResult[] = [];
  let pending: string[] = [];
  for (const raw of stripAnsi(output).split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const status = STATUS.exec(line);
    if (status && !SHARD.test(status[2]!)) {
      jobs.push({ label: status[2]!, ok: status[1] === "✓", lines: pending });
      pending = [];
      continue;
    }
    pending.push(line);
  }
  return jobs;
}

/** Stable keys for one failed job's lines. */
export function jobKeys(job: JobResult): ErrorKey[] {
  if (job.ok) return [];
  const keys = job.label === "test" ? testKeys(job.lines) : lintKeys(job.label, job.lines);
  if (keys.length) return [...new Set(keys)];
  const last = [...job.lines].reverse().find((l) => l.trim() && !NOISE.some((re) => re.test(l)));
  return [`${job.label} | (failed) | ${last ? digitsToN(last.trim()) : "no output"}`];
}

function testKeys(lines: readonly string[]): ErrorKey[] {
  const out: ErrorKey[] = [];
  for (const line of lines) {
    const spec = /^\s*✖ (.+?)(?: \(\d+(?:\.\d+)?m?s\))?$/.exec(line);
    const tap = /^\s*not ok \d+ - (.+)$/.exec(line);
    const name = spec?.[1] ?? tap?.[1];
    if (!name || name === "failing tests:") continue;
    out.push(`test | ${name}`);
  }
  return out;
}

function lintKeys(label: string, lines: readonly string[]): ErrorKey[] {
  const out: ErrorKey[] = [];
  let header = "";
  for (const line of lines) {
    if (!line.trim() || NOISE.some((re) => re.test(line))) continue;
    if (/^\s/.test(line)) {
      const body = line.trim().replace(/^\d+:\d+\s+/, "");
      out.push(`${label} | ${header} | ${stripLineNumbers(body)}`);
      continue;
    }
    const path = PATH_LINE.exec(line);
    if (path) {
      header = path[1]!;
      const rest = line.slice(path[0].length).trim();
      out.push(`${label} | ${path[1]} | ${stripLineNumbers(rest)}`);
      continue;
    }
    header = shortHeader(digitsToN(line.trim()));
    out.push(`${label} | ${header}`);
  }
  return out;
}

/** `file.md:12` → `file.md`; `(12,3)` → ``. */
export function stripLineNumbers(text: string): string {
  return text.replace(/(\.\w+):\d+(?::\d+)?\b/g, "$1").replace(/\(\d+,\d+\)/g, "");
}

/** A header's first clause (`N construction(s) not exercised by their anchor page`), as context. */
function shortHeader(text: string): string {
  const cut = text.search(/[.:;](?:\s|$)/);
  const head = cut > 0 ? text.slice(0, cut) : text;
  return head.length > 90 ? `${head.slice(0, 87)}...` : head;
}

function digitsToN(text: string): string {
  return text.replace(/\d+/g, "N");
}

const GENERATE_KIND = /practice|checkpoint|word-bank|core-vocabulary|drill/i;

/**
 * True when a key sits on an allowlist row marked **generate**: its subject page (the file it
 * names, or for drill-generation.md the first other page) is a generate page, and the key is
 * about a checkpoint (practice, checkpoint, word bank, core vocabulary, drill coverage).
 */
export function onGenerateRow(key: ErrorKey, generatePages: ReadonlySet<string>): boolean {
  if (!GENERATE_KIND.test(key)) return false;
  const afterJob = key.slice(jobOf(key).length);
  const subject = [...afterJob.matchAll(/([\w.-]+\.md)\b/g)].map((m) => m[1]!).find((p) => p !== "drill-generation.md");
  return subject !== undefined && generatePages.has(subject);
}

export type Comparison = {
  fresh: ErrorKey[];
  resolved: ErrorKey[];
  unchecked: number;
  generate: number;
};

/** Compare `now` with `baseline`. Baseline keys whose job did not run count as unchecked, not resolved. */
export function compare(
  now: readonly ErrorKey[],
  baseline: readonly ErrorKey[],
  ranJobs: ReadonlySet<string>,
  generatePages: ReadonlySet<string> | undefined,
): Comparison {
  const base = new Set(baseline);
  const current = new Set(now);
  let generate = 0;
  const fresh: ErrorKey[] = [];
  for (const key of current) {
    if (generatePages && onGenerateRow(key, generatePages)) {
      generate += 1;
      continue;
    }
    if (!base.has(key)) fresh.push(key);
  }
  const resolved: ErrorKey[] = [];
  let unchecked = 0;
  for (const key of base) {
    if (current.has(key)) continue;
    if (ranJobs.has(jobOf(key))) resolved.push(key);
    else unchecked += 1;
  }
  return { fresh, resolved, unchecked, generate };
}

export function jobOf(key: ErrorKey): string {
  return key.split(" | ", 1)[0]!;
}
