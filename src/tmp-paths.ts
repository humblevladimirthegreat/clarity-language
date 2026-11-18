/**
 * Where local files live under `tmp/` (gitignored). Each top-level folder is a tier, named for
 * how long its files must last; nothing sits at the top of `tmp/` itself.
 *
 * - `scratch/`: one-off probes, edit scripts, dry runs, subagent briefs, checkpoint packs. Every
 *   top-level entry whose newest file is older than a week is deleted when `npm run build` or
 *   `npm test` starts ({@link sweepScratch}).
 * - `logs/`: the last run's full log (build, test, verify). Overwritten by each run.
 * - `out/`: reports a script rebuilds. Overwritten when it reruns.
 * - `cache/`: downloads and derived caches, rebuilt on demand. Safe to delete at any time.
 * - `state/`: files a later step reads, or results that cost money or hand work to redo (the
 *   verify baseline, the retie map, eval results, hand ratings). Never cleaned automatically.
 * - `prototypes/`: standalone experiments that are not repo tooling. Never cleaned automatically.
 *
 * `npm run build` warns about anything outside these tiers ({@link strayTmpEntries}).
 *
 * Imports node built-ins only, so plain-node scripts (`scripts/build.mjs`, `scripts/test.mjs`)
 * can load it as well as `tsx`.
 */
import { existsSync, lstatSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const TMP_TIERS = ["scratch", "logs", "out", "cache", "state", "prototypes"] as const;
export type TmpTier = (typeof TMP_TIERS)[number];

/** How long a top-level entry in `tmp/scratch/` lasts after its newest file was written. */
export const SCRATCH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** The nearest directory above this module with a package.json: the repo, whether run from src/ or a dist/ bundle. */
function findRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(dir, "package.json"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("repo root not found: no package.json above src/tmp-paths.ts");
    dir = parent;
  }
  return dir;
}

export const TMP_ROOT = join(findRepoRoot(), "tmp");

/** An absolute path inside one tier: `tmpPath("cache", "cmudict.dict")`. */
export function tmpPath(tier: TmpTier, ...parts: string[]): string {
  return join(TMP_ROOT, tier, ...parts);
}

/** The repo-relative spelling of {@link tmpPath}, for messages: `tmp/logs/build-last.log`. */
export function tmpRel(tier: TmpTier, ...parts: string[]): string {
  return ["tmp", tier, ...parts].join("/");
}

/** The newest modification time of a file or of anything inside a directory. */
function newestMtime(path: string): number {
  const stat = lstatSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let newest = stat.mtimeMs;
  for (const name of readdirSync(path)) newest = Math.max(newest, newestMtime(join(path, name)));
  return newest;
}

/**
 * Delete each top-level entry of `tmp/scratch/` whose newest file is older than
 * {@link SCRATCH_MAX_AGE_MS}, so a folder still in use is never half-deleted. Returns the names removed.
 */
export function sweepScratch(now = Date.now(), dir = join(TMP_ROOT, "scratch")): string[] {
  if (!existsSync(dir)) return [];
  const removed: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    try {
      if (now - newestMtime(path) <= SCRATCH_MAX_AGE_MS) continue;
      rmSync(path, { recursive: true, force: true });
      removed.push(name);
    } catch {
      // A file another process removed or holds open: leave it for the next sweep.
    }
  }
  return removed;
}

/** Top-level entries of `tmp/` that are not a tier folder. */
export function strayTmpEntries(dir = TMP_ROOT): string[] {
  if (!existsSync(dir)) return [];
  const tiers = new Set<string>(TMP_TIERS);
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !(entry.isDirectory() && tiers.has(entry.name)))
    .map((entry) => entry.name)
    .sort();
}
