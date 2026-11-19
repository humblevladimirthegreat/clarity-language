/**
 * `--diff REV`: the parser at REV, from a `git archive` of `src`, `data` and `package.json`
 * (plus the docs module `src/repo-paths.ts` imports) extracted to `tmp/scratch/find-rev/<sha>/` and bundled to
 * `<dir>/dist/parse-rev/index.bundle.mjs`, so it reads the old lexicon from `<dir>/data`.
 * `parseWithTables`, `loadDefaultTables`, and the reader's `readParse` and `allReadings` are taken from it, so both
 * passes read frame order from readings, each with its own commit's reader. The folder is removed by `cleanup`
 * and on SIGINT; unlike a worktree, a killed run leaves nothing in `.git`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import type { ClassifyTables } from "../parse/classify.js";
import { REPO_ROOT } from "../repo-paths.js";
import type { Reading } from "../interpret/types.js";
import type { FindParse, FindRead } from "./examples.js";
import { hasScopeRecord, type ScopeParser } from "./scope-diff.js";

/** The first commit whose reader copies scope order into readings (src/interpret/read.ts); `--diff` cannot reach before it. */
export const READING_ORDER_COMMIT = "a13f294c";

/** A file the reader floor added: in a clone without the floor commit, REV must have it. */
const READER_FILE = "src/interpret/read.ts";

/** `--diff` cannot run: printed without the usage line, exit 2. */
export class FindDiffError extends Error {}

/** Paths taken from REV when they exist there. */
const ARCHIVE_PATHS = ["src", "data", "package.json", "docs/grammar/.vitepress/lib/reading-order.ts"];

function git(args: string[], cwd: string): Buffer {
  return execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 30 });
}

function gitOk(args: string[], cwd: string): boolean {
  try {
    git(args, cwd);
    return true;
  } catch {
    return false;
  }
}

/** Resolves REV to a commit and refuses one before the reader's frame order. */
export function revCommit(rev: string, cwd = REPO_ROOT): string {
  let sha: string;
  try {
    sha = git(["rev-parse", "--verify", "--quiet", `${rev}^{commit}`], cwd).toString().trim();
  } catch {
    throw new FindDiffError(`--diff: ${rev} is not a commit`);
  }
  const floorKnown = gitOk(["cat-file", "-e", `${READING_ORDER_COMMIT}^{commit}`], cwd);
  const after = floorKnown
    ? gitOk(["merge-base", "--is-ancestor", READING_ORDER_COMMIT, sha], cwd)
    : gitOk(["cat-file", "-e", `${sha}:${READER_FILE}`], cwd);
  if (!after) {
    throw new FindDiffError(
      `--diff: ${rev} predates the reader's frame order (${READER_FILE} copies it from ${READING_ORDER_COMMIT}); pick a later commit`,
    );
  }
  return sha;
}

/** A parser taken from a bundle; `sawScope` says whether any parse so far returned a `resolve.scope`-shaped record. */
export type ImportedParser = ScopeParser & { sawScope(): boolean };

export type RevParser = ImportedParser & {
  sha: string;
  dir: string;
  /** The bundle's path; a find worker imports the same parser from it (`importRevParser`). */
  module: string;
  cleanup(): void;
};

/** Loads the parser and reader exports from a REV bundle. Throws `FindDiffError` naming `rev`. */
export async function importRevParser(module: string, rev: string): Promise<ImportedParser> {
  const mod = (await import(pathToFileURL(module).href)) as Record<string, unknown>;
  const missing = ["parseWithTables", "loadDefaultTables", "readParse", "allReadings"].filter((name) => typeof mod[name] !== "function");
  if (missing.length) throw new FindDiffError(`--diff: the parser at ${rev} lacks ${missing.join(", ")}`);
  const tables = (mod.loadDefaultTables as () => ClassifyTables)();
  const oldParse = mod.parseWithTables as FindParse;
  let saw = false;
  const parse: FindParse = (text, t, options) => {
    const result = oldParse(text, t, options);
    if (!saw && hasScopeRecord(result)) saw = true;
    return result;
  };
  const readParse = mod.readParse as (result: unknown, options: { tables: ClassifyTables }) => Reading[];
  const read: FindRead = (result, t) => readParse(result, { tables: t });
  const all = mod.allReadings as (readings: Reading[]) => Reading[];
  return { tables, parse, read, all, sawScope: () => saw };
}

/** Extracts and bundles the parser and reader at REV and loads their exports. Throws `FindDiffError`. */
export async function loadRevParser(rev: string, cwd = REPO_ROOT): Promise<RevParser> {
  const sha = revCommit(rev, cwd);
  const dir = join(cwd, "tmp", "scratch", "find-rev", sha);
  const cleanup = () => {
    rmSync(dir, { recursive: true, force: true });
    process.off("SIGINT", onSigint);
  };
  const onSigint = () => {
    rmSync(dir, { recursive: true, force: true });
    process.exit(130);
  };
  process.on("SIGINT", onSigint);
  try {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const paths = ARCHIVE_PATHS.filter((path) => gitOk(["cat-file", "-e", `${sha}:${path}`], cwd));
    const tar = git(["archive", "--format=tar", sha, ...paths], cwd);
    execFileSync("tar", ["-x", "-C", dir], { input: tar, stdio: ["pipe", "ignore", "pipe"], maxBuffer: 1 << 30 });
    if (existsSync(join(cwd, "node_modules"))) symlinkSync(join(cwd, "node_modules"), join(dir, "node_modules"), "dir");
    const outfile = join(dir, "dist", "parse-rev", "index.bundle.mjs");
    const entry = join(dir, "find-rev-entry.ts");
    writeFileSync(
      entry,
      [
        `export { loadDefaultTables, parseWithTables } from "./src/parse/index.js";`,
        `export { allReadings, readParse } from "./src/interpret/read.js";`,
        "",
      ].join("\n"),
    );
    const { buildSync } = await import("esbuild");
    try {
      buildSync({
        entryPoints: [entry],
        bundle: true,
        platform: "node",
        format: "esm",
        packages: "external",
        // Before 7672fc47 the parser imported the chevrotain-allstar package, since vendored
        // (memoized, same lookahead) as src/parse/allstar/; point old imports at that copy.
        ...(existsSync(join(cwd, "node_modules", "chevrotain-allstar"))
          ? {}
          : { alias: { "chevrotain-allstar": join(cwd, "src", "parse", "allstar", "all-star-lookahead.ts") } }),
        outfile,
        logLevel: "silent",
      });
    } catch (error) {
      throw new FindDiffError(`--diff: the parser at ${rev} does not bundle: ${(error as Error).message.split("\n")[0]}`);
    }
    return { sha, dir, module: outfile, ...(await importRevParser(outfile, rev)), cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}
