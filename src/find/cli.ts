/**
 * Search docs examples by parse, not spelling. With `--map`, rewrite matched
 * letter slots (dry run by default; `--write` patches spans and morph glosses).
 *
 *   node scripts/find.mjs --word role=v,ending=r
 *   node scripts/find.mjs --seq role=w role=g docs/grammar/clause.md
 *   node scripts/find.mjs --word 'raw=.*em,family=hook'
 *   node scripts/find.mjs --seq family=hook,raw=em 'role!=[zdb]' role=b
 *   node scripts/find.mjs --construction 'overlay.egega*' --count
 *   node scripts/find.mjs --construction '/^sentence\.hUnitRule\./'
 *   node scripts/find.mjs --word family=joinMarker,series=e --count
 *   node scripts/find.mjs --word family=say,answer=e --json
 *   node scripts/find.mjs --word marker=re --count
 *   node scripts/find.mjs --word family=joinMarker,series=e|o --map series=e:o,o:e
 *   node scripts/find.mjs --word family=joinMarker,series=e|o --map series=e:o,o:e --write
 *   node scripts/find.mjs --word xFamily=pointer --map pointer=a:o --write --tests
 *
 * Terms are `key=regex[,key=regex]` with keys role / ending / root / family /
 * overlay / unit / raw / series / form / marker / xFamily / reading / scope /
 * answer / stance / pointer / locus. Each regex must match the whole field (`raw=em` is the
 * word `em`, `raw=.*em` any word ending in `em`); `key!=regex` negates. `--seq`
 * takes terms until the next flag and matches adjacent words. `--construction`
 * takes an exact ID, a `prefix*`, or a `/regex/`. Several flags must all match.
 * `--map field=from:to,from:to` rewrites those letters on matched words from the
 * original parse (a swap is one map). Paths default to docs/grammar and docs/examples;
 * pass `src`, `scripts`, or a `.tsv` to walk string literals and TSV cells. `--count`
 * is always matching examples, with or without `--map`. `--write` patches docs, TSV,
 * and non-test source; `*.test.ts` needs `--tests` (assertions next to a literal stay).
 * `--write` leaves a span that does not reparse and still writes the rest of the file.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

import { loadDefaultTables } from "../parse/index.js";
import { type Example } from "./examples.js";
import {
  hitWord,
  matchesTerm,
  matchSequence,
  parseTerm as parseTermStrict,
  TERM_KEYS,
  type HitWord,
  type Term,
} from "./query.js";
import {
  mergeMaps,
  parseMap,
  rewriteExample,
  rewriteMarkdownSpans,
  rewritePlainSpans,
  type FieldMaps,
} from "./rewrite.js";
import { collectFileSpans, isFindTestFile, listFindFiles, skipWorthListing, type FindQuery } from "./walk.js";

type Query = FindQuery;

/** `--construction` pattern: `/regex/` (unanchored), `prefix*`, or an exact ID. */
function constructionTest(pattern: string): (id: string) => boolean {
  const regex = /^\/(.+)\/$/s.exec(pattern);
  if (regex) {
    let re: RegExp;
    try {
      re = new RegExp(regex[1]!, "u");
    } catch (error) {
      usage(`bad --construction regex: ${(error as Error).message}`);
    }
    return (id) => re.test(id);
  }
  if (pattern.endsWith("*")) return (id) => id.startsWith(pattern.slice(0, -1));
  return (id) => id === pattern;
}

function usage(message: string, code = 2): never {
  console.error(
    `${message}\nusage: find.mjs [--word TERM] [--seq TERM TERM…] [--construction ID|prefix*|/regex/] [--map field=from:to[,…]] [--write] [--tests] [--check-ambiguity] [--json|--count] [paths…]\n  TERM is key=regex[,key!=regex…]; keys: ${TERM_KEYS.join(" ")}; each regex matches the whole value`,
  );
  process.exit(code);
}

function parseTerm(text: string): Term {
  try {
    return parseTermStrict(text);
  } catch (error) {
    usage((error as Error).message);
  }
}

const queries: Query[] = [];
const paths: string[] = [];
let output: "text" | "json" | "count" = "text";
let maps: FieldMaps | undefined;
let write = false;
let writeTests = false;
let checkAmbiguity = false;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === "--word") {
    if (!args[i + 1]) usage("--word needs a term");
    queries.push({ kind: "word", term: parseTerm(args[++i]!) });
  } else if (arg === "--seq") {
    const terms: Term[] = [];
    while (args[i + 1] && args[i + 1]!.includes("=") && !args[i + 1]!.startsWith("--")) terms.push(parseTerm(args[++i]!));
    if (terms.length === 0) usage("--seq needs at least one term");
    queries.push({ kind: "seq", terms });
  } else if (arg === "--construction") {
    if (!args[i + 1]) usage("--construction needs an ID");
    queries.push({ kind: "construction", test: constructionTest(args[++i]!) });
  } else if (arg === "--map") {
    if (!args[i + 1]) usage("--map needs field=from:to");
    try {
      maps = mergeMaps(maps ?? {}, parseMap(args[++i]!));
    } catch (error) {
      usage((error as Error).message);
    }
  } else if (arg === "--write") write = true;
  else if (arg === "--tests") writeTests = true;
  else if (arg === "--check-ambiguity") checkAmbiguity = true;
  else if (arg === "--json") output = "json";
  else if (arg === "--count") output = "count";
  else if (arg === "--help" || arg === "-h") usage("Search docs examples by parse.", 0);
  else if (arg.startsWith("--")) usage(`unknown flag ${arg}`);
  else paths.push(arg);
}
if (queries.length === 0) usage("give at least one --word, --seq, or --construction");
if (write && !maps) usage("--write needs --map");
if (writeTests && !write) usage("--tests needs --write");

/** Indexes of the words a query highlights, or null when it does not match. */
export function matchQuery(example: Example, query: Query): number[] | null {
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

const tables = loadDefaultTables();
const results: { file: string; line: number; index: number; text: string; shown: string; words: HitWord[] }[] = [];
const replacements: { file: string; line: number; from: string; to: string }[] = [];
const skips: { file: string; line: number; text: string }[] = [];
const reviews: { file: string; line: number; raw: string; message: string }[] = [];
let writeFailed = false;

for (const root of paths.length ? paths : ["docs/grammar", "docs/examples"].filter((dir) => existsSync(dir))) {
  for (const file of listFindFiles(root)) {
    const original = readFileSync(file, "utf8");
    const rel = relative(process.cwd(), file);
    const { examples, unparsed } = collectFileSpans(file, original, tables);
    const lineOf = (index: number) => original.slice(0, index).split("\n").length;
    if (maps) {
      for (const span of unparsed) {
        if (skipWorthListing(span, queries, maps, tables)) {
          skips.push({ file: rel, line: lineOf(span.index), text: span.text });
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
      results.push({
        file: rel,
        line,
        index: example.index,
        text: example.text,
        shown: highlight(example, hits),
        words: [...hits].sort((a, b) => a - b).map((i) => hitWord(example.words[i]!)),
      });
      if (!maps) continue;
      if (skipTestWrite) {
        const rewritten = rewriteExample(example, [...hits], maps);
        if (rewritten.nextSource !== example.source) skippedTestPatch = true;
        continue;
      }
      const rewritten = rewriteExample(example, [...hits], maps);
      for (const review of rewritten.reviews) {
        reviews.push({ file: rel, line, raw: review.raw, message: review.message });
      }
      for (const change of rewritten.replacements) {
        replacements.push({ file: rel, line, from: change.from, to: change.to });
      }
      if (rewritten.nextSource !== example.source) {
        filePatches.push({ example, nextSource: rewritten.nextSource });
      }
    }
    if (skippedTestPatch) {
      skips.push({ file: rel, line: 1, text: "test file; pass --tests" });
    }
    if (write && maps && filePatches.length) {
      const out = file.endsWith(".md")
        ? rewriteMarkdownSpans(original, filePatches, tables, checkAmbiguity)
        : rewritePlainSpans(original, filePatches, tables, checkAmbiguity);
      if (out.parseErrors.length) {
        writeFailed = true;
        for (const error of out.parseErrors) {
          console.error(`${rel}:${error.line}  ${error.reason}: ${error.span}`);
        }
      }
      for (const gloss of out.unplacedGloss) {
        reviews.push({ file: rel, line: gloss.line, raw: gloss.from, message: `unplaced gloss → ${gloss.to}` });
      }
      if (out.text !== original) writeFileSync(file, out.text);
    }
  }
}

if (output === "json") {
  if (maps) {
    console.log(JSON.stringify({ replacements, skips, reviews }, null, 2));
  } else {
    console.log(JSON.stringify(results.map(({ shown: _, ...r }) => r), null, 2));
  }
} else if (output === "count") {
  console.log(results.length);
} else if (maps) {
  for (const r of replacements) console.log(`${r.file}:${r.line}  ${r.from} → ${r.to}`);
  for (const s of skips) console.error(`${s.file}:${s.line}  skip: ${s.text}`);
  for (const r of reviews) console.error(`${r.file}:${r.line}  review: ${r.raw} (${r.message})`);
} else {
  for (const r of results) console.log(`${r.file}:${r.line}  ${r.shown}`);
}

if (writeFailed) process.exit(1);
