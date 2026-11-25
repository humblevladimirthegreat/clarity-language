/**
 * The context report (`npm run context-report`): every grammar example's tokens through the passes of `markContext`
 * (`CONTEXT_PASSES` in `mark-context.ts`), recording each decision a pass makes from a word's neighbors and how many
 * tokens past the word it needed to see before the decision stopped changing.
 *
 * "Ahead" is measured by rerunning the passes on every prefix of the sentence: it is the smallest k such that every
 * prefix reaching k or more tokens past the word gives the word its final type. A decision with ahead 0 is settled by
 * the word and what came before it. A pass that picks between two types (a verb that ends a list or has more after it)
 * defaults to one when nothing follows, so the default side can read 0 while a listener still waits as long as the
 * other side's ahead to know it.
 */
import { readFileSync } from "node:fs";

import type { IToken } from "chevrotain";

import { withLexiconClosedRoots } from "../closed-roots.js";
import { passFiles } from "../find/pass.js";
import { collectFileSpans } from "../find/walk.js";
import type { ClassifyTables } from "./classify.js";
import { enforceTones } from "./enforce.js";
import { CONTEXT_PASSES } from "./mark-context.js";
import { tokenizeUtterance } from "./tokenize.js";

/** What settles a decision: the word before it (`itself`), the next word by design (`word`), or a join later on (`join`). */
export type Settles = "itself" | "word" | "join";

/**
 * Where each pass's decisions settle, the one place this is written down. A pass is `word` or `join` as a whole
 * (`all`), or only for the listed target types; a decision the table does not name settles at `itself`. A `join`
 * decision with ahead 0 (nothing waited on) reads `itself`.
 */
const SETTLES: Record<string, { all?: Settles; join?: readonly string[]; word?: readonly string[] }> = {
  sameRolePair: { word: ["SameRolePair"] },
  hosted: { word: ["HookHosting"], join: ["HostedBJoined"] },
  bar: { all: "join" },
  itemHook: { all: "join" },
  verbEnd: { join: ["VPlainMore"] },
  hRun: { join: ["HThList"] },
  gRun: { join: ["GInList", "GInRespList"] },
  glLean: { all: "word" },
  wLeaf: { all: "word" },
};

/** Where a decision of `pass` to type `to` settles (see {@link SETTLES}); `ahead` is the measured spread. */
export function settlesAt(pass: string, to: string, ahead: number): Settles {
  const entry = SETTLES[pass];
  const fixed: Settles = entry?.all ?? (entry?.join?.includes(to) ? "join" : entry?.word?.includes(to) ? "word" : "itself");
  return fixed === "join" && ahead === 0 ? "itself" : fixed;
}

/** One decision of one pass on one token: a retype, or a token the pass left as it was only because of what follows. */
export type ContextDecision = {
  pass: string;
  from: string;
  to: string;
  /** The token's index in the sentence. */
  at: number;
  /** Tokens past this one the decision needed (see the file comment). */
  ahead: number;
  /** The decision needed every token to the end of the input. */
  toEnd: boolean;
  /** What settles it (see {@link SETTLES}). */
  settles: Settles;
};

const typeNames = (tokens: IToken[]): string[] => tokens.map((t) => t.tokenType.name);

/**
 * Every context decision on one token list (the input `markContext` gets). Each pass is measured on its own: it reruns
 * on prefixes of the tokens the earlier passes left on the whole sentence, so a word an earlier pass decided from
 * later words does not count again in every pass after it.
 */
export function measureDecisions(tokens: IToken[]): ContextDecision[] {
  const n = tokens.length;
  const out: ContextDecision[] = [];
  let input = tokens;
  for (const pass of CONTEXT_PASSES) {
    const result = pass.run(input);
    const from = typeNames(input);
    const to = typeNames(result);
    const prefixes = input.map((_, last) => typeNames(pass.run(input.slice(0, last + 1))));
    for (let i = 0; i < n; i++) {
      let k = n - 1 - i;
      while (k > 0 && prefixes[i + k - 1]![i] === to[i]) k--;
      if (from[i] === to[i] && k === 0) continue;
      out.push({ pass: pass.name, from: from[i]!, to: to[i]!, at: i, ahead: k, toEnd: k > 0 && k === n - 1 - i, settles: settlesAt(pass.name, to[i]!, k) });
    }
    input = result;
  }
  return out;
}

/** The tokens of one example as `markContext` gets them (tone marks already taken out). */
export function contextTokens(text: string, tables: ClassifyTables): IToken[] {
  return withLexiconClosedRoots(tables.published, () => enforceTones(tokenizeUtterance(text, tables)).tokens);
}

export type ContextSample = { text: string; file: string; ahead: number };

/** One row of the report: a pass's decision from one type to another. */
export type ContextRow = {
  key: string;
  pass: string;
  from: string;
  to: string;
  count: number;
  texts: number;
  buckets: Record<AheadBucket, number>;
  toEnd: number;
  max: number;
  /** Where the row's decisions settle; not in the saved counts. */
  settles: Settles;
  samples: ContextSample[];
};

export const AHEAD_BUCKETS = ["0", "1", "2", "3-5", "6+"] as const;
export type AheadBucket = (typeof AHEAD_BUCKETS)[number];

export function aheadBucket(ahead: number): AheadBucket {
  if (ahead <= 2) return String(ahead) as AheadBucket;
  return ahead <= 5 ? "3-5" : "6+";
}

export type ContextWalk = { examples: number; skipped: string[]; rows: ContextRow[] };

/** Mark the decided token in a sample: the tokens with `«…»` around the one at `at`. */
function marked(tokens: IToken[], at: number): string {
  return tokens.map((t, i) => (i === at ? `«${t.image}»` : t.image)).join(" ");
}

const SAMPLES_PER_ROW = 3;

function addSample(row: ContextRow, sample: ContextSample): void {
  if (row.samples.some((s) => s.text === sample.text)) return;
  row.samples.push(sample);
  row.samples.sort((a, b) => b.ahead - a.ahead);
  row.samples.length = Math.min(row.samples.length, SAMPLES_PER_ROW);
}

/** Walk the grammar examples (each distinct text once) and count the decisions. */
export function walkContext(tables: ClassifyTables, roots: string[] = ["docs/grammar"]): ContextWalk {
  const rows = new Map<string, ContextRow>();
  const seen = new Set<string>();
  const skipped: string[] = [];
  for (const file of passFiles(roots)) {
    for (const example of collectFileSpans(file, readFileSync(file, "utf8"), tables).examples) {
      if (seen.has(example.text)) continue;
      seen.add(example.text);
      let tokens: IToken[];
      try {
        tokens = contextTokens(example.text, tables);
      } catch (e) {
        skipped.push(`${file}: ${example.text}: ${(e as Error).message}`);
        continue;
      }
      const inText = new Set<string>();
      for (const d of measureDecisions(tokens)) {
        const key = `${d.pass} ${d.from}→${d.to}`;
        let row = rows.get(key);
        if (!row) {
          const buckets = Object.fromEntries(AHEAD_BUCKETS.map((b) => [b, 0])) as Record<AheadBucket, number>;
          row = { key, pass: d.pass, from: d.from, to: d.to, count: 0, texts: 0, buckets, toEnd: 0, max: 0, settles: d.settles, samples: [] };
          rows.set(key, row);
        }
        row.count++;
        if (!inText.has(key)) row.texts++;
        inText.add(key);
        row.buckets[aheadBucket(d.ahead)]++;
        if (d.toEnd) row.toEnd++;
        row.max = Math.max(row.max, d.ahead);
        addSample(row, { text: marked(tokens, d.at), file, ahead: d.ahead });
      }
    }
  }
  const order = new Map(CONTEXT_PASSES.map((p, i) => [p.name, i]));
  const sorted = [...rows.values()].sort((a, b) => order.get(a.pass)! - order.get(b.pass)! || b.count - a.count);
  return { examples: seen.size, skipped, rows: sorted };
}

/** Flat counts for `--save` / `--diff`: each row's count and each nonzero ahead bucket. */
export function contextCounts(walk: ContextWalk): Record<string, number> {
  const out: Record<string, number> = { examples: walk.examples };
  for (const row of walk.rows) {
    out[row.key] = row.count;
    for (const b of AHEAD_BUCKETS) if (row.buckets[b]) out[`${row.key} ahead ${b}`] = row.buckets[b];
  }
  return out;
}

export function diffContextCounts(before: Record<string, number>, after: Record<string, number>): string[] {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const lines = keys
    .filter((k) => (before[k] ?? 0) !== (after[k] ?? 0))
    .map((k) => `${k}: ${before[k] ?? 0} → ${after[k] ?? 0}`);
  return lines.length ? lines : ["No change."];
}

function bucketCells(buckets: Record<AheadBucket, number>): string {
  return AHEAD_BUCKETS.map((b) => buckets[b]).join(" | ");
}

/** Per-pass totals for stdout. */
export function formatSummary(walk: ContextWalk): string[] {
  const lines = [`${walk.examples} distinct examples, ${walk.skipped.length} skipped.`, ""];
  lines.push(`| pass | decisions | ${AHEAD_BUCKETS.map((b) => `ahead ${b}`).join(" | ")} | to end | max |`);
  lines.push(`|---|---|${AHEAD_BUCKETS.map(() => "---").join("|")}|---|---|`);
  for (const pass of CONTEXT_PASSES) {
    const rows = walk.rows.filter((r) => r.pass === pass.name);
    const buckets = Object.fromEntries(AHEAD_BUCKETS.map((b) => [b, rows.reduce((s, r) => s + r.buckets[b], 0)])) as Record<AheadBucket, number>;
    const count = rows.reduce((s, r) => s + r.count, 0);
    const toEnd = rows.reduce((s, r) => s + r.toEnd, 0);
    const max = Math.max(0, ...rows.map((r) => r.max));
    lines.push(`| ${pass.name} | ${count} | ${bucketCells(buckets)} | ${toEnd} | ${max} |`);
  }
  return lines;
}

/** The full report: every row with its ahead spread and samples. */
export function formatReport(walk: ContextWalk): string[] {
  const lines = ["# Context report", "", ...formatSummary(walk), ""];
  for (const pass of CONTEXT_PASSES) {
    const rows = walk.rows.filter((r) => r.pass === pass.name);
    if (!rows.length) continue;
    lines.push(`## ${pass.name}`, "");
    lines.push(`| from → to | decisions | texts | ${AHEAD_BUCKETS.map((b) => `ahead ${b}`).join(" | ")} | to end | max | settles at |`);
    lines.push(`|---|---|---|${AHEAD_BUCKETS.map(() => "---").join("|")}|---|---|---|`);
    for (const r of rows) lines.push(`| ${r.from} → ${r.to} | ${r.count} | ${r.texts} | ${bucketCells(r.buckets)} | ${r.toEnd} | ${r.max} | ${r.settles} |`);
    lines.push("");
    for (const r of rows) {
      lines.push(`- **${r.from} → ${r.to}**`);
      for (const s of r.samples) lines.push(`  - ahead ${s.ahead}: \`${s.text}\` (${s.file})`);
    }
    lines.push("");
  }
  if (walk.skipped.length) lines.push("## Skipped", "", ...walk.skipped.map((s) => `- ${s}`));
  return lines;
}
