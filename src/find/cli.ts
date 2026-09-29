/**
 * Search docs examples by parse, not spelling.
 *
 *   node scripts/find.mjs --word role=v,ending=r
 *   node scripts/find.mjs --seq role=w role=g docs/grammar/clause.md
 *   node scripts/find.mjs --word 'raw=.*em,family=hook'
 *   node scripts/find.mjs --seq family=hook,raw=em 'role!=[zdb]' role=b
 *   node scripts/find.mjs --construction 'overlay.egega*' --count
 *   node scripts/find.mjs --construction '/^sentence\.hUnitRule\./'
 *
 * Terms are `key=regex[,key=regex]` with keys role / ending / root / family /
 * overlay / unit / raw. Each regex must match the whole field (`raw=em` is the
 * word `em`, `raw=.*em` any word ending in `em`); `key!=regex` negates. `--seq`
 * takes terms until the next flag and matches adjacent words. `--construction`
 * takes an exact ID, a `prefix*`, or a `/regex/`. Several flags must all match.
 * Paths default to docs/grammar and docs/examples.
 */
import { readFileSync } from "node:fs";
import { relative } from "node:path";

import { loadDefaultTables } from "../parse/index.js";
import { listMarkdown } from "../markdown-files.js";
import { collectExamples, type Example } from "./examples.js";
import { matchesTerm, matchSequence, parseTerm as parseTermStrict, type Term } from "./query.js";

type Query =
  | { kind: "word"; term: Term }
  | { kind: "seq"; terms: Term[] }
  | { kind: "construction"; test: (id: string) => boolean };

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
  console.error(`${message}\nusage: find.mjs [--word TERM] [--seq TERM TERM…] [--construction ID|prefix*|/regex/] [--json|--count] [paths…]\n  TERM is key=regex[,key!=regex…]; keys: role ending root family overlay unit raw; each regex matches the whole value`);
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
  } else if (arg === "--json") output = "json";
  else if (arg === "--count") output = "count";
  else if (arg === "--help" || arg === "-h") usage("Search docs examples by parse.", 0);
  else if (arg.startsWith("--")) usage(`unknown flag ${arg}`);
  else paths.push(arg);
}
if (queries.length === 0) usage("give at least one --word, --seq, or --construction");

/** Indexes of the words a query highlights, or null when it does not match. */
function matchQuery(example: Example, query: Query): number[] | null {
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
const results: { file: string; line: number; text: string; shown: string }[] = [];
for (const root of paths.length ? paths : ["docs/grammar", "docs/examples"]) {
  for (const file of listMarkdown(root)) {
    const markdown = readFileSync(file, "utf8");
    for (const example of collectExamples(markdown, tables)) {
      const matches = queries.map((q) => matchQuery(example, q));
      if (matches.some((m) => m === null)) continue;
      const hits = new Set(matches.flatMap((m) => m!));
      const line = markdown.slice(0, example.index).split("\n").length;
      results.push({ file: relative(process.cwd(), file), line, text: example.text, shown: highlight(example, hits) });
    }
  }
}

if (output === "json") console.log(JSON.stringify(results.map(({ shown: _, ...r }) => r), null, 2));
else if (output === "count") console.log(results.length);
else for (const r of results) console.log(`${r.file}:${r.line}  ${r.shown}`);
