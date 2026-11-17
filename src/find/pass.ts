/**
 * One find pass over one file: argument parsing, query matching, and the
 * per-file scan the CLI runs over each file. `scanFile` returns plain records,
 * which the CLI merges in walk order.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

import type { ClassifyTables } from "../parse/classify.js";
import { loadDefaultTables } from "../parse/index.js";
import { type Example } from "./examples.js";
import { hitWord, matchesTerm, matchSequence, parseTerm, TERM_KEYS, type HitWord, type Term } from "./query.js";
import {
  mergeMaps,
  parseMap,
  rewriteExample,
  rewriteMarkdownSpans,
  rewritePlainSpans,
  type FieldMaps,
} from "./rewrite.js";
import { collectFileSpans, isFindTestFile, listFindFiles, skipWorthListing, type FindQuery } from "./walk.js";

export type FindOutput = "text" | "json" | "count";

/** Everything the CLI arguments say. `args` is the command line `queries` were built from. */
export type FindOptions = {
  args: string[];
  queries: FindQuery[];
  paths: string[];
  output: FindOutput;
  maps: FieldMaps | undefined;
  write: boolean;
  writeTests: boolean;
  checkAmbiguity: boolean;
};

export type FindResult = { file: string; line: number; index: number; text: string; shown: string; words: HitWord[] };
export type FindReplacement = { file: string; line: number; from: string; to: string };
export type FindSkip = { file: string; line: number; text: string };
export type FindReview = { file: string; line: number; raw: string; message: string };
export type FindParseError = { file: string; line: number; reason: string; span: string };

/** What one file contributes to a pass, in the file's own order. */
export type FileRecord = {
  results: FindResult[];
  replacements: FindReplacement[];
  skips: FindSkip[];
  reviews: FindReview[];
  /** `--write` spans that did not reparse; the file's other patches are still written. */
  parseErrors: FindParseError[];
};

/** A bad command line; the CLI prints the message with the usage line and exits with `code`. */
export class FindUsageError extends Error {
  constructor(
    message: string,
    readonly code = 2,
  ) {
    super(message);
  }
}

export const FIND_USAGE = `usage: find.mjs [--word TERM] [--seq TERM TERM…] [--construction ID|prefix*|/regex/] [--map field=from:to[,…]] [--write] [--tests] [--check-ambiguity] [--json|--count] [paths…]\n  TERM is key=regex[,key!=regex…]; keys: ${TERM_KEYS.join(" ")}; each regex matches the whole value`;

/** `--construction` pattern: `/regex/` (unanchored), `prefix*`, or an exact ID. */
function constructionTest(pattern: string): (id: string) => boolean {
  const regex = /^\/(.+)\/$/s.exec(pattern);
  if (regex) {
    let re: RegExp;
    try {
      re = new RegExp(regex[1]!, "u");
    } catch (error) {
      throw new FindUsageError(`bad --construction regex: ${(error as Error).message}`);
    }
    return (id) => re.test(id);
  }
  if (pattern.endsWith("*")) return (id) => id.startsWith(pattern.slice(0, -1));
  return (id) => id === pattern;
}

function term(text: string): Term {
  try {
    return parseTerm(text);
  } catch (error) {
    throw new FindUsageError((error as Error).message);
  }
}

/** Parses find's command line (without `node` and the script). Throws `FindUsageError`. */
export function parseFindArgs(args: string[]): FindOptions {
  const options: FindOptions = {
    args,
    queries: [],
    paths: [],
    output: "text",
    maps: undefined,
    write: false,
    writeTests: false,
    checkAmbiguity: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--word") {
      if (!args[i + 1]) throw new FindUsageError("--word needs a term");
      options.queries.push({ kind: "word", term: term(args[++i]!) });
    } else if (arg === "--seq") {
      const terms: Term[] = [];
      while (args[i + 1] && args[i + 1]!.includes("=") && !args[i + 1]!.startsWith("--")) terms.push(term(args[++i]!));
      if (terms.length === 0) throw new FindUsageError("--seq needs at least one term");
      options.queries.push({ kind: "seq", terms });
    } else if (arg === "--construction") {
      if (!args[i + 1]) throw new FindUsageError("--construction needs an ID");
      options.queries.push({ kind: "construction", test: constructionTest(args[++i]!) });
    } else if (arg === "--map") {
      if (!args[i + 1]) throw new FindUsageError("--map needs field=from:to");
      try {
        options.maps = mergeMaps(options.maps ?? {}, parseMap(args[++i]!));
      } catch (error) {
        throw new FindUsageError((error as Error).message);
      }
    } else if (arg === "--write") options.write = true;
    else if (arg === "--tests") options.writeTests = true;
    else if (arg === "--check-ambiguity") options.checkAmbiguity = true;
    else if (arg === "--json") options.output = "json";
    else if (arg === "--count") options.output = "count";
    else if (arg === "--help" || arg === "-h") throw new FindUsageError("Search docs examples by parse.", 0);
    else if (arg.startsWith("--")) throw new FindUsageError(`unknown flag ${arg}`);
    else options.paths.push(arg);
  }
  if (options.queries.length === 0) throw new FindUsageError("give at least one --word, --seq, or --construction");
  if (options.write && !options.maps) throw new FindUsageError("--write needs --map");
  if (options.writeTests && !options.write) throw new FindUsageError("--tests needs --write");
  return options;
}

/** Indexes of the words a query highlights, or null when it does not match. */
export function matchQuery(example: Example, query: FindQuery): number[] | null {
  switch (query.kind) {
    case "word": {
      const hits = example.words.flatMap((w, i) => (matchesTerm(w, query.term) ? [i] : []));
      return hits.length ? hits : null;
    }
    case "seq": {
      const starts = matchSequence(example.words, query.terms);
      if (!starts.length) return null;
      const placed = example.words.filter((w) => w.position >= 0);
      return starts.flatMap((s) => {
        const from = placed.indexOf(example.words[s]!);
        return placed.slice(from, from + query.terms.length).map((w) => example.words.indexOf(w));
      });
    }
    case "construction":
      return example.constructions.some(query.test) ? [] : null;
  }
}

function highlight(example: Example, hits: Set<number>): string {
  const marked = new Set([...hits].map((i) => example.words[i]!.position));
  return example.text
    .split(/\s+/)
    .map((chunk, i) => (marked.has(i) ? `[${chunk}]` : chunk))
    .join(" ");
}

/**
 * Scans one file: matches every example against all queries and, with `--map`,
 * plans the rewrite. Under `--write` it writes the file itself, so a file must
 * belong to one scanner. `cwd` makes the reported paths relative.
 */
export function scanFile(file: string, options: FindOptions, tables: ClassifyTables, cwd = process.cwd()): FileRecord {
  const { queries, maps, write, writeTests, checkAmbiguity } = options;
  const record: FileRecord = { results: [], replacements: [], skips: [], reviews: [], parseErrors: [] };
  const original = readFileSync(file, "utf8");
  const rel = relative(cwd, file);
  const { examples, unparsed } = collectFileSpans(file, original, tables);
  const lineOf = (index: number) => original.slice(0, index).split("\n").length;
  if (maps) {
    for (const span of unparsed) {
      if (skipWorthListing(span, queries, maps, tables)) {
        record.skips.push({ file: rel, line: lineOf(span.index), text: span.text });
      }
    }
  }
  const filePatches: { example: Example; nextSource: string }[] = [];
  const skipTestWrite = write && !writeTests && isFindTestFile(file);
  let skippedTestPatch = false;
  for (const example of examples) {
    const matches = queries.map((q) => matchQuery(example, q));
    if (matches.some((m) => m === null)) continue;
    const hits = new Set(matches.flatMap((m) => m!));
    const line = lineOf(example.index);
    record.results.push({
      file: rel,
      line,
      index: example.index,
      text: example.text,
      shown: highlight(example, hits),
      words: [...hits].sort((a, b) => a - b).map((i) => hitWord(example.words[i]!)),
    });
    if (!maps) continue;
    const rewritten = rewriteExample(example, [...hits], maps);
    if (skipTestWrite) {
      if (rewritten.nextSource !== example.source) skippedTestPatch = true;
      continue;
    }
    for (const review of rewritten.reviews) {
      record.reviews.push({ file: rel, line, raw: review.raw, message: review.message });
    }
    for (const change of rewritten.replacements) {
      record.replacements.push({ file: rel, line, from: change.from, to: change.to });
    }
    if (rewritten.nextSource !== example.source) {
      filePatches.push({ example, nextSource: rewritten.nextSource });
    }
  }
  if (skippedTestPatch) {
    record.skips.push({ file: rel, line: 1, text: "test file; pass --tests" });
  }
  if (write && maps && filePatches.length) {
    const out = file.endsWith(".md")
      ? rewriteMarkdownSpans(original, filePatches, tables, checkAmbiguity)
      : rewritePlainSpans(original, filePatches, tables, checkAmbiguity);
    for (const error of out.parseErrors) {
      record.parseErrors.push({ file: rel, line: error.line, reason: error.reason, span: error.span });
    }
    for (const gloss of out.unplacedGloss) {
      record.reviews.push({ file: rel, line: gloss.line, raw: gloss.from, message: `unplaced gloss → ${gloss.to}` });
    }
    if (out.text !== original) writeFileSync(file, out.text);
  }
  return record;
}

/** Concatenates file records in the order given (walk order). */
export function mergeRecords(records: FileRecord[]): FileRecord {
  const merged: FileRecord = { results: [], replacements: [], skips: [], reviews: [], parseErrors: [] };
  for (const record of records) {
    merged.results.push(...record.results);
    merged.replacements.push(...record.replacements);
    merged.skips.push(...record.skips);
    merged.reviews.push(...record.reviews);
    merged.parseErrors.push(...record.parseErrors);
  }
  return merged;
}

/** Walk order of the files under `paths` (default docs/grammar and docs/examples), each file once. */
export function passFiles(paths: string[]): string[] {
  const roots = paths.length ? paths : ["docs/grammar", "docs/examples"].filter((dir) => existsSync(dir));
  return [...new Set(roots.flatMap((root) => listFindFiles(root)))];
}

/** Runs one pass over `files` and merges the records in that order. */
export function runPass(files: string[], options: FindOptions, tables: ClassifyTables = loadDefaultTables()): FileRecord {
  return mergeRecords(files.map((file) => scanFile(file, options, tables)));
}
