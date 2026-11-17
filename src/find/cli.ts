/**
 * Search docs examples by parse, not spelling; with `--map`, rewrite matched
 * letter slots. `node scripts/find.mjs --help` lists every key, flag, and how a
 * construction ID is built.
 */

import { FIND_USAGE, FindUsageError, parseFindArgs, passFiles, type FindOptions } from "./pass.js";
import { poolPass, poolScopeDiff } from "./pool.js";
import { FindDiffError, loadRevParser } from "./rev-parser.js";
import { diffScopeRecords, formatScopeDiff } from "./scope-diff.js";

function usage(message: string, code = 2): never {
  if (code === 0) console.log(message);
  else console.error(`${message}\n${FIND_USAGE}`);
  process.exit(code);
}

let options: FindOptions;
try {
  options = parseFindArgs(process.argv.slice(2));
} catch (error) {
  if (error instanceof FindUsageError) usage(error.message, error.code);
  throw error;
}
const { output, maps, list } = options;
/** The worker bundle `scripts/find.mjs` builds beside this one. */
const workerUrl = new URL("./worker.bundle.mjs", import.meta.url);

if (options.diff) {
  const rev = options.diff;
  const files = passFiles(options.paths);
  let parser;
  try {
    parser = await loadRevParser(rev);
  } catch (error) {
    if (error instanceof FindDiffError) {
      console.error(error.message);
      process.exit(2);
    }
    throw error;
  }
  let now, atRev, sawScope;
  try {
    ({ now, atRev, sawScope } = await poolScopeDiff(files, options, workerUrl, parser));
  } finally {
    parser.cleanup();
  }
  if (!sawScope) {
    console.error(`--diff: the parser at ${rev} returns no resolve.scope record`);
    process.exit(2);
  }
  const diffs = diffScopeRecords(atRev, now);
  if (output === "json") console.log(JSON.stringify(diffs, null, 2));
  else if (output === "count") console.log(diffs.length);
  else for (const diff of diffs) console.log(formatScopeDiff(diff).join("\n"));
  process.exit(0);
}

const { results, replacements, skips, reviews, parseErrors, tally } = await poolPass(passFiles(options.paths), options, workerUrl);
for (const error of parseErrors) console.error(`${error.file}:${error.line}  ${error.reason}: ${error.span}`);

if (list) {
  const rows = Object.entries(tally).sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
  if (output === "json") console.log(JSON.stringify(Object.fromEntries(rows), null, 2));
  else if (output === "count") console.log(rows.length);
  else for (const [value, n] of rows) console.log(`${String(n).padStart(6)}  ${value === "" ? '""' : value}`);
} else if (output === "json") {
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
