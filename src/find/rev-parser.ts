/**
 * `--diff REV`: the parser at REV, from a `git archive` of `src`, `data` and `package.json`
 * (plus the docs module `src/repo-paths.ts` imports) extracted to `tmp/find-rev/<sha>/` and bundled to
 * `<dir>/dist/parse-rev/index.bundle.mjs`, so it reads the old lexicon from `<dir>/data`.
 * Only `parseWithTables` and `loadDefaultTables` are taken from it. The folder is removed by `cleanup`
 * and on SIGINT; unlike a worktree, a killed run leaves nothing in `.git`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import type { ClassifyTables } from "../parse/classify.js";
import { REPO_ROOT } from "../repo-paths.js";
import type { FindParse } from "./examples.js";
import { hasScopeRecord, type ScopeParser } from "./scope-diff.js";

/** The commit that added `resolve.scope`; `--diff` cannot reach before it. */
export const SCOPE_RECORD_COMMIT = "ff43d91d";

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

/** Resolves REV to a commit and refuses one before the scope record. */
export function revCommit(rev: string, cwd = REPO_ROOT): string {
  let sha: string;
  try {
    sha = git(["rev-parse", "--verify", "--quiet", `${rev}^{commit}`], cwd).toString().trim();
  } catch {
    throw new FindDiffError(`--diff: ${rev} is not a commit`);
  }
  if (!gitOk(["cat-file", "-e", `${sha}:src/parse/scope.ts`], cwd)) {
    throw new FindDiffError(
      `--diff: ${rev} predates the scope record (src/parse/scope.ts landed in ${SCOPE_RECORD_COMMIT}); pick a later commit`,
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

/** Loads `parseWithTables` and `loadDefaultTables` from a parser bundle. Throws `FindDiffError` naming `rev`. */
export async function importRevParser(module: string, rev: string): Promise<ImportedParser> {
  const mod = (await import(pathToFileURL(module).href)) as Record<string, unknown>;
  const missing = ["parseWithTables", "loadDefaultTables"].filter((name) => typeof mod[name] !== "function");
  if (missing.length) throw new FindDiffError(`--diff: the parser at ${rev} lacks ${missing.join(" and ")}`);
  const tables = (mod.loadDefaultTables as () => ClassifyTables)();
  const oldParse = mod.parseWithTables as FindParse;
  let saw = false;
  const parse: FindParse = (text, t, options) => {
    const result = oldParse(text, t, options);
    if (!saw && hasScopeRecord(result)) saw = true;
    return result;
  };
  return { tables, parse, sawScope: () => saw };
}

/** Extracts and bundles the parser at REV and loads its two exports. Throws `FindDiffError`. */
export async function loadRevParser(rev: string, cwd = REPO_ROOT): Promise<RevParser> {
  const sha = revCommit(rev, cwd);
  const dir = join(cwd, "tmp", "find-rev", sha);
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
    const { buildSync } = await import("esbuild");
    try {
      buildSync({
        entryPoints: [join(dir, "src", "parse", "index.ts")],
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
