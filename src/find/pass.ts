/**
 * One find pass over one file: argument parsing, query matching, and the
 * per-file scan the CLI runs over each file. `scanFile` returns plain records,
 * which the CLI merges in walk order.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

import type { ClassifyTables } from "../parse/classify.js";
import { loadDefaultTables } from "../parse/index.js";
import { type Example, type FindParse } from "./examples.js";
import { parseWithTables } from "../parse/parse-core.js";
import { matchScopeQuery, scopeStrings, type ScopeParser, type ScopeRecord } from "./scope-diff.js";
import {
  fieldValues,
  hitWord,
  matchesTerm,
  matchSequenceHits,
  parseTerm,
  SEQ_GAP,
  TERM_KEYS,
  type HitWord,
  type Term,
  type TermKey,
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
  /** `--same-clause`: every word of a `--seq` hit sits in one clause. */
  sameClause: boolean;
  /** `--values KEY` or `--constructions`: tally values over the matching examples instead of listing hits. */
  list: { kind: "values"; key: TermKey } | { kind: "constructions" } | undefined;
  /** `--diff REV`: compare each matching example's scope order under the parser at REV with the current one. */
  diff: string | undefined;
  /** `--jobs N`: worker threads for the pass; undefined is one per spare core, 1 scans inline. */
  jobs: number | undefined;
};

export type FindResult = {
  file: string;
  line: number;
  index: number;
  text: string;
  shown: string;
  words: HitWord[];
  /** Clause numbers of the hit words, ascending, without -1. */
  clauses: number[];
};
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
  /** `--values` / `--constructions`: how many words (values) or examples (construction IDs) carry each value. */
  tally: Record<string, number>;
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

export const FIND_USAGE = `usage: find.mjs [--word TERM] [--seq TERM|... TERM…] [--same-clause] [--construction ID|prefix*|/regex/] [--over F] [--under G] [--unordered] [--diff REV] [--values KEY | --constructions] [--map field=from:to[,…]] [--write] [--tests] [--check-ambiguity] [--jobs N] [--json|--count] [paths…]\n  TERM is key=regex[,key!=regex…]; keys: ${TERM_KEYS.join(" ")}; --help lists each key and flag`;

/** `--help`: every key with what it holds and sample values, every flag, and how a construction ID is built. */
export const FIND_HELP = `find.mjs: search docs examples by parse, not spelling; with --map, rewrite matched letter slots.

Keys (TERM is key=regex[,key!=regex…]; each regex must match a whole value; key!=regex: no value matches):
  role         the word's PoS letter, "" outside a role: z, v, th
  ending       the word ending: l, n, rl
  root         content roots, the roots around mid-word x: azozo, alazu, owuro
  family       word family (an x word also its x family): content, joinMarker, hook
  overlay      sense form of the overlay or host overlay: ubol, ahum, ohem
  overlayKind  kind of that overlay in lexicon-overlays.csv: evidential, may, phasal
  frame        whole-clause frame the word carries (resolve.scope), FAMILY and FAMILY/MEMBER: stance, stance/channel, binder
  unit         kind of the clause unit the word sits in: np, vp, hook
  raw          the spelling as parsed: zazozon, blarl, yel
  series       join-series vowels of a join word: a, ua, uo
  form         hook form, of a hook or the hook in a compound or join: el, ul, oel
  marker       number marker, writing glyph and speech twin both: +, ra, #
  xFamily      mid-word x family: sake, pointer, holder
  reading      how the word is read: ordinary, overlay, restrictor
  scope        reach vowel of an x word, stance vowel of a scope word, reach of a say word: u, o, uo
  answer       answer vowel of a say word: a, o, e
  stance       stance vowel of an x word: a, u, o
  pointer      pointer vowel of an x word: e, o, a
  locus        locus vowels of an x word: e, oe, ua

Flags:
  --word TERM            some word matches TERM
  --seq TERM|... …       neighboring words match the terms in order; ... matches zero or more words
  --same-clause          every word of a --seq hit sits in one clause (the innermost Clause node: body
                         clause, clause-join member, or dependent; words outside every clause never match)
  --construction ID      the parse uses construction ID: an exact ID, a prefix*, or a /regex/
  --over F --under G     some clause's scope order (resolve.scope) puts frame F over frame G; F and G are
                         FAMILY or FAMILY/MEMBER as --values frame lists them; highlights both words; one
                         side alone matches any partner; each pair is one more query
  --unordered            some clause has a frame pair no rule orders yet (resolve.scope unordered)
  --diff REV             parse the current docs with the parser at commit REV and with the current one, and
                         list each example whose scope order differs: - pairs only at REV, + pairs only now;
                         other query flags pick the examples (current parse); --count, --json work; REV must
                         include src/parse/scope.ts (ff43d91d or later)
  --values KEY           count each value KEY takes (by word) over the matching examples, or every example
  --constructions        count each construction ID (by example) over the matching examples, or every example
  --map field=from:to,…  rewrite those letters on matched words (dry run; a swap is one map)
  --write                patch docs, TSV and non-test source; a span that does not reparse is left
  --tests                with --write, patch *.test.ts too
  --check-ambiguity      with --write, refuse a patch that gives two trees
  --jobs N               worker threads, capped at the file count (default 1: scan inline); output is
                         the same with any N
  --json                 print hits as JSON: each word with its key fields, constructions, overlayKind,
                         frame and clause; each hit with its clause numbers
  --count                print the number of matching examples (or of values with --values)
  paths…                 files or folders; default docs/grammar and docs/examples; pass src, scripts or a
                         .tsv to walk string literals and TSV cells
Several query flags must all match.

Construction IDs are dotted: a head, then parts. Word IDs come from the word alone: word.family.<family>,
word.reading.<reading>, word.ending.<ending>, word.xFamily.<xFamily>, and overlay.<sense form>.<pos>
(overlay.ubol.th). Parse IDs name a rule or a slot: sentence.* (grammar rules), join.<series>,
restrictor.<job>, hook.<form>, number.*, role.*, pointer.*, scope.*, force.*, sake.*, tone.*, resolve.*
(bindings). List them all with --constructions.

Examples:
  node scripts/find.mjs --word role=v,ending=r
  node scripts/find.mjs --seq family=hook,raw=em 'role!=[zdb]' role=b
  node scripts/find.mjs --same-clause --seq 'frame=binder|occasion' ... overlayKind=evidential --count
  node scripts/find.mjs --construction '/^sentence\\.hUnitRule\\./'
  node scripts/find.mjs --values overlayKind
  node scripts/find.mjs --over stance/channel --under occasion
  node scripts/find.mjs --diff HEAD~1 --count
  node scripts/find.mjs --word family=joinMarker,series=e|o --map series=e:o,o:e --write`;

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
    sameClause: false,
    list: undefined,
    diff: undefined,
    jobs: undefined,
  };
  /** The scope query the previous flag opened, so `--over F --under G` is one pair. */
  let openScope: Extract<FindQuery, { kind: "scope" }> | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--over" || arg === "--under") {
      const value = args[i + 1];
      if (!value || value.startsWith("--")) throw new FindUsageError(`${arg} needs a frame: FAMILY or FAMILY/MEMBER`);
      i++;
      const side = arg === "--over" ? "over" : "under";
      if (openScope && openScope[side] === undefined) {
        openScope[side] = value;
        openScope = undefined;
      } else {
        openScope = { kind: "scope", [side]: value };
        options.queries.push(openScope);
      }
      continue;
    }
    openScope = undefined;
    if (arg === "--unordered") options.queries.push({ kind: "unordered" });
    else if (arg === "--diff") {
      if (!args[i + 1] || args[i + 1]!.startsWith("--")) throw new FindUsageError("--diff needs a commit");
      options.diff = args[++i]!;
    } else if (arg === "--word") {
      if (!args[i + 1]) throw new FindUsageError("--word needs a term");
      options.queries.push({ kind: "word", term: term(args[++i]!) });
    } else if (arg === "--seq") {
      const terms: Term[] = [];
      while (args[i + 1] && (args[i + 1] === "..." || (args[i + 1]!.includes("=") && !args[i + 1]!.startsWith("--")))) {
        const next = args[++i]!;
        terms.push(next === "..." ? SEQ_GAP : term(next));
      }
      if (!terms.some((t) => t !== SEQ_GAP)) throw new FindUsageError("--seq needs at least one term");
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
    } else if (arg === "--values") {
      const key = args[i + 1] as TermKey | undefined;
      if (!key || !(TERM_KEYS as readonly string[]).includes(key)) {
        throw new FindUsageError(`--values needs a key: ${TERM_KEYS.join(" ")}`);
      }
      i++;
      options.list = { kind: "values", key };
    } else if (arg === "--constructions") options.list = { kind: "constructions" };
    else if (arg === "--jobs") {
      const value = args[++i];
      if (!value || !/^[1-9]\d*$/.test(value)) throw new FindUsageError("--jobs needs a positive whole number");
      options.jobs = Number(value);
    } else if (arg === "--same-clause") options.sameClause = true;
    else if (arg === "--write") options.write = true;
    else if (arg === "--tests") options.writeTests = true;
    else if (arg === "--check-ambiguity") options.checkAmbiguity = true;
    else if (arg === "--json") options.output = "json";
    else if (arg === "--count") options.output = "count";
    else if (arg === "--help" || arg === "-h") throw new FindUsageError(FIND_HELP, 0);
    else if (arg.startsWith("--")) throw new FindUsageError(`unknown flag ${arg}`);
    else options.paths.push(arg);
  }
  if (options.queries.length === 0 && !options.list && !options.diff) {
    throw new FindUsageError(
      "give at least one --word, --seq, --construction, --over/--under or --unordered (or --values KEY / --constructions / --diff REV)",
    );
  }
  if (options.diff && (options.maps || options.list)) {
    throw new FindUsageError("--diff does not take --map, --values or --constructions");
  }
  if (options.list && options.maps) throw new FindUsageError("--values and --constructions do not take --map");
  if (options.write && !options.maps) throw new FindUsageError("--write needs --map");
  if (options.writeTests && !options.write) throw new FindUsageError("--tests needs --write");
  return options;
}

/** Indexes of the words a query highlights, or null when it does not match. */
export function matchQuery(example: Example, query: FindQuery, sameClause = false): number[] | null {
  switch (query.kind) {
    case "word": {
      const hits = example.words.flatMap((w, i) => (matchesTerm(w, query.term) ? [i] : []));
      return hits.length ? hits : null;
    }
    case "seq": {
      const hits = matchSequenceHits(example.words, query.terms, sameClause);
      return hits.length ? hits.flat() : null;
    }
    case "construction":
      return example.constructions.some(query.test) ? [] : null;
    case "scope":
    case "unordered":
      return matchScopeQuery(example, query);
  }
}

function tallyExample(tally: Record<string, number>, example: Example, list: NonNullable<FindOptions["list"]>): void {
  const bump = (value: string) => {
    tally[value] = (tally[value] ?? 0) + 1;
  };
  if (list.kind === "constructions") {
    for (const id of new Set(example.constructions)) bump(id);
    return;
  }
  for (const word of example.words) for (const value of new Set(fieldValues(word, list.key))) bump(value);
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
  const { queries, maps, write, writeTests, checkAmbiguity, sameClause, list } = options;
  const record: FileRecord = { results: [], replacements: [], skips: [], reviews: [], parseErrors: [], tally: {} };
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
    const matches = queries.map((q) => matchQuery(example, q, sameClause));
    if (matches.some((m) => m === null)) continue;
    if (list) {
      tallyExample(record.tally, example, list);
      continue;
    }
    const hits = new Set(matches.flatMap((m) => m!));
    const hitWords = [...hits].sort((a, b) => a - b).map((i) => hitWord(example.words[i]!));
    const line = lineOf(example.index);
    record.results.push({
      file: rel,
      line,
      index: example.index,
      text: example.text,
      shown: highlight(example, hits),
      words: hitWords,
      clauses: [...new Set(hitWords.map((w) => w.clause))].filter((c) => c >= 0).sort((a, b) => a - b),
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
  const merged: FileRecord = { results: [], replacements: [], skips: [], reviews: [], parseErrors: [], tally: {} };
  for (const record of records) {
    merged.results.push(...record.results);
    merged.replacements.push(...record.replacements);
    merged.skips.push(...record.skips);
    merged.reviews.push(...record.reviews);
    merged.parseErrors.push(...record.parseErrors);
    for (const [value, n] of Object.entries(record.tally)) merged.tally[value] = (merged.tally[value] ?? 0) + n;
  }
  return merged;
}

/** Walk order of the files under `paths` (default docs/grammar and docs/examples), each file once. */
export function passFiles(paths: string[]): string[] {
  const roots = paths.length ? paths : ["docs/grammar", "docs/examples"].filter((dir) => existsSync(dir));
  return [...new Set(roots.flatMap((root) => listFindFiles(root)))];
}

/**
 * One `--diff` pass: every example in `files` parsed with `parser`, as scope strings. With `filter`,
 * only examples matching all of `options.queries` (the current pass; the pass at REV keeps every example).
 */
export function scopePass(
  files: string[],
  options: Pick<FindOptions, "queries" | "sameClause">,
  parser: ScopeParser = { tables: loadDefaultTables(), parse: parseWithTables as FindParse },
  filter = true,
  cwd = process.cwd(),
): ScopeRecord[] {
  return files.flatMap((file) => scopeFile(file, options, parser, filter, cwd));
}

/** `scopePass` over one file: what a worker returns for it. */
export function scopeFile(
  file: string,
  options: Pick<FindOptions, "queries" | "sameClause">,
  parser: ScopeParser,
  filter = true,
  cwd = process.cwd(),
): ScopeRecord[] {
  const out: ScopeRecord[] = [];
  const original = readFileSync(file, "utf8");
  const rel = relative(cwd, file);
  const { examples } = collectFileSpans(file, original, parser.tables, parser.parse);
  for (const example of examples) {
    if (filter && options.queries.some((q) => matchQuery(example, q, options.sameClause) === null)) continue;
    const line = original.slice(0, example.index).split("\n").length;
    out.push({ file: rel, line, index: example.index, text: example.text, ...scopeStrings(example) });
  }
  return out;
}

/** Runs one pass over `files` and merges the records in that order. */
export function runPass(files: string[], options: FindOptions, tables: ClassifyTables = loadDefaultTables()): FileRecord {
  return mergeRecords(files.map((file) => scanFile(file, options, tables)));
}
