#!/usr/bin/env tsx
/**
 * Diff guard for the free English page review ([llm-gloss-prompt.md § diff guard](../docs/proposals/llm-gloss-prompt.md#diff-guard)).
 * Compares top-level grammar pages against a base revision (default `HEAD`) and fails when a
 * changed line is out of scope: a heading, a table row other than a word bank row, or an Agebon
 * code span whose rewrite changes the construction IDs (roots may differ). Free English lines
 * and new prose lines directly under an example block pass. Any other changed prose line is
 * listed for review against the subagent's strange-example report.
 *
 * Run: npx tsx scripts/free-english-diff-guard.ts [--base <rev>] [docs/grammar/<page>.md ...]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import { extractFreeEnglish } from "../src/lint/free-english.js";
import { fillSelf } from "../src/learner-name.js";
import { loadDefaultTables, parseWithTables } from "../src/parse/index.js";
import { looksLikeMorphLine } from "../src/parse/morph-gloss.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import { lineNumberAt } from "../src/retie/tokens.js";

const args = process.argv.slice(2);
let base = "HEAD";
const pages: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--base") base = args[++i]!;
  else pages.push(relative(REPO_ROOT, resolve(args[i]!)));
}

const git = (...a: string[]) => execFileSync("git", a, { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 64 << 20 });
const grammarDir = join("docs", "grammar");
const changed = git("diff", "--name-only", base, "--", grammarDir)
  .split("\n")
  .filter(Boolean);
const outside = git("diff", "--name-only", base)
  .split("\n")
  .filter((file) => file && !(dirname(file) === grammarDir && file.endsWith(".md")));
const files = (pages.length ? pages : changed).filter((file) => dirname(file) === grammarDir && changed.includes(file));

const tables = loadDefaultTables();
const constructionCache = new Map<string, string[] | null>();
function constructions(agebon: string): string[] | null {
  if (!constructionCache.has(agebon)) {
    let ids: string[] | null = null;
    try {
      ids = parseWithTables(fillSelf(agebon), tables, { constructions: true }).constructions ?? [];
    } catch {
      ids = null;
    }
    constructionCache.set(agebon, ids);
  }
  return constructionCache.get(agebon)!;
}

/** Construction IDs of the Agebon spans (spans that do not parse are skipped). */
function spanConstructions(spans: string[]): Set<string> {
  const out = new Set<string>();
  for (const span of spans) for (const id of constructions(span) ?? []) out.add(id);
  return out;
}

const codeSpans = (line: string) => [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);

/** An example's Agebon row: a block row, checkpoint prompt, or spoiler line that starts with a code span. */
const isAgebonRow = (line: string) => /^\s*(?:>\s*)?(?:\*\*\d+\.\*\*\s*)?`/.test(line);

type Hunk = { oldStart: number; oldLines: string[]; newStart: number; newLines: string[] };
function hunks(file: string): Hunk[] {
  const out: Hunk[] = [];
  let hunk: Hunk | null = null;
  for (const line of git("diff", "-U0", base, "--", file).split("\n")) {
    const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (m) {
      hunk = { oldStart: Number(m[1]), oldLines: [], newStart: Number(m[2]), newLines: [] };
      out.push(hunk);
    } else if (hunk && line.startsWith("-") && !line.startsWith("---")) hunk.oldLines.push(line.slice(1));
    else if (hunk && line.startsWith("+") && !line.startsWith("+++")) hunk.newLines.push(line.slice(1));
  }
  return out;
}

const isQuote = (line: string) => /^\s*>/.test(line);
const isTable = (line: string) => /^\s*\|/.test(line);

/** True when the table holding line `at` (0-based) is a word bank: its header starts `| English | Agebon`. */
function inWordBank(lines: string[], at: number): boolean {
  let i = at;
  while (i > 0 && isTable(lines[i - 1]!)) i -= 1;
  return /^\s*\|\s*English\s*\|\s*Agebon\s*\|/.test(lines[i]!);
}

/** True when line `at` is prose directly under an example block (blank or other new prose lines between). */
function underBlock(lines: string[], at: number, added: Set<number>): boolean {
  let i = at - 1;
  while (i >= 0 && (lines[i]!.trim() === "" || (added.has(i) && !isQuote(lines[i]!) && !isTable(lines[i]!)))) i -= 1;
  return i >= 0 && isQuote(lines[i]!);
}

let errors = 0;
let review = 0;
for (const file of files) {
  const source = readFileSync(join(REPO_ROOT, file), "utf8");
  const lines = source.split("\n");
  const freeLines = new Set(extractFreeEnglish(source).map((free) => lineNumberAt(source, free.index) - 1));
  const report: string[] = [];
  for (const hunk of hunks(file)) {
    const added = new Set(hunk.newLines.map((_, k) => hunk.newStart - 1 + k));
    const oldCode = hunk.oldLines.filter(isAgebonRow).flatMap(codeSpans);
    const newCode = hunk.newLines.filter(isAgebonRow).flatMap(codeSpans);
    if (oldCode.join("\u0000") !== newCode.join("\u0000")) {
      const before = spanConstructions(oldCode);
      const after = spanConstructions(newCode);
      const lost = [...before].filter((id) => !after.has(id));
      const gained = [...after].filter((id) => !before.has(id));
      const rewrite = `${oldCode.join(" · ") || "(none)"} → ${newCode.join(" · ") || "(none)"}`;
      if (lost.length) {
        errors += 1;
        report.push(`  ERROR ${hunk.newStart}: Agebon rewrite drops constructions (-${lost.join(" -")}${gained.length ? ` +${gained.join(" +")}` : ""}): ${rewrite}`);
      } else if (gained.length) {
        review += 1;
        report.push(`  review ${hunk.newStart}: Agebon rewrite adds constructions (+${gained.join(" +")}): ${rewrite}`);
      } else report.push(`  agebon ${hunk.newStart}: ${rewrite}`);
    }
    for (const at of added) {
      const line = lines[at]!;
      const n = at + 1;
      if (freeLines.has(at) || line.trim() === "") continue;
      if (/^#{1,6}\s/.test(line)) {
        errors += 1;
        report.push(`  ERROR ${n}: heading changed: ${line}`);
      } else if (isTable(line)) {
        if (inWordBank(lines, at)) report.push(`  bank ${n}: ${line.trim()}`);
        else {
          errors += 1;
          report.push(`  ERROR ${n}: table row changed: ${line.trim()}`);
        }
      } else if (isQuote(line)) {
        // Agebon and morph rows inside a block: covered by the construction check above.
        if (!isAgebonRow(line) && !looksLikeMorphLine(line.replace(/^\s*>\s*/, ""))) {
          review += 1;
          report.push(`  review ${n}: block line: ${line.trim()}`);
        }
      } else if (isAgebonRow(line) || looksLikeMorphLine(line.trim())) continue;
      else if (underBlock(lines, at, added)) report.push(`  prose ${n}: ${line.trim()}`);
      else {
        review += 1;
        report.push(`  review ${n}: ${line.trim()}`);
      }
    }
  }
  if (report.length) console.log(`${file}\n${report.join("\n")}`);
}

if (outside.length) console.log(`\nChanged outside top-level grammar pages (main-session follow-ups only):\n  ${outside.join("\n  ")}`);
console.log(`\n${files.length} pages, ${errors} errors, ${review} lines to review`);
process.exit(errors ? 1 : 0);
