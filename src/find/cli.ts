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

import { FIND_USAGE, FindUsageError, parseFindArgs, passFiles, runPass, type FindOptions } from "./pass.js";

function usage(message: string, code = 2): never {
  console.error(`${message}\n${FIND_USAGE}`);
  process.exit(code);
}

let options: FindOptions;
try {
  options = parseFindArgs(process.argv.slice(2));
} catch (error) {
  if (error instanceof FindUsageError) usage(error.message, error.code);
  throw error;
}
const { output, maps } = options;

const { results, replacements, skips, reviews, parseErrors } = runPass(passFiles(options.paths), options);
for (const error of parseErrors) console.error(`${error.file}:${error.line}  ${error.reason}: ${error.span}`);

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

if (parseErrors.length) process.exit(1);
