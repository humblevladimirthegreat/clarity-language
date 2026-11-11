/**
 * Git helpers for comparing grammar pages with a revision (changed-sections, wording-only).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";

import { REPO_ROOT } from "../../src/repo-paths.js";
import { headingSlug, headingText } from "../../src/lint/grammar-anchors.js";

const GRAMMAR = "docs/grammar/";

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
}

/** Fails loudly when `rev` does not name a commit. */
export function checkRev(rev: string): void {
  const r = spawnSync("git", ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`], { cwd: REPO_ROOT });
  if (r.status !== 0) throw new Error(`not a revision: ${rev}`);
}

function isPage(path: string): boolean {
  return path.startsWith(GRAMMAR) && path.endsWith(".md") && !path.includes("/.vitepress/");
}

/** Grammar pages changed since `rev` (working tree included) plus untracked ones, repo-relative. */
export function changedPages(rev: string, opts: { includeDeleted?: boolean } = {}): string[] {
  const changed = git(["diff", "--name-only", rev, "--", GRAMMAR]).split("\n");
  const untracked = git(["ls-files", "--others", "--exclude-standard", "--", GRAMMAR]).split("\n");
  return [...new Set([...changed, ...untracked])]
    .filter(Boolean)
    .filter(isPage)
    .filter((p) => opts.includeDeleted || existsSync(resolve(REPO_ROOT, p)))
    .sort();
}

/** Repo-relative path for a CLI argument (repo-relative, cwd-relative, or `beginner/x.md`). */
export function pagePath(arg: string): string {
  if (existsSync(resolve(REPO_ROOT, arg))) return relative(REPO_ROOT, resolve(REPO_ROOT, arg));
  if (existsSync(resolve(arg))) return relative(REPO_ROOT, resolve(arg));
  if (existsSync(resolve(REPO_ROOT, GRAMMAR, arg))) return `${GRAMMAR}${arg}`;
  return arg;
}

/** The page's text at `rev`, or null when it did not exist there. */
export function showAt(rev: string, path: string): string | null {
  const r = spawnSync("git", ["show", `${rev}:${path}`], { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
  return r.status === 0 ? r.stdout : null;
}

/** Every H2 / H3 id on every grammar page at `rev` → the pages that had it. */
export function idsAt(rev: string): Map<string, string[]> {
  const r = spawnSync("git", ["grep", "-n", "-E", "^#{2,3} ", rev, "--", GRAMMAR], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  const out = new Map<string, string[]>();
  for (const line of r.stdout.split("\n")) {
    const m = /^[^:]+:([^:]+):\d+:#{2,3}\s+(.*)$/.exec(line);
    if (!m || !isPage(m[1]!)) continue;
    const custom = /\{#([^}]+)\}\s*$/.exec(m[2]!);
    const id = custom ? custom[1]! : headingSlug(headingText(m[2]!));
    out.set(id, [...(out.get(id) ?? []), m[1]!]);
  }
  return out;
}
