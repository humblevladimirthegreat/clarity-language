/**
 * CMU Pronouncing Dictionary lookup for the root converter.
 * The file is tmp/cmudict.dict (pinned download in scripts/echo-pronunciation.ts).
 * Variants, overrides, and the parser live in src/cmu-lookup.ts so the browser can share them.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { lookupPronunciationIn, parseCmuDict } from "./cmu-lookup.ts";
import { REPO_ROOT } from "./repo-paths.ts";

export { CMU_OVERRIDES, CMU_VARIANTS, lookupPronunciationIn, parseCmuDict } from "./cmu-lookup.ts";

export const CMU_PATH = join(REPO_ROOT, "tmp", "cmudict.dict");

let cached: Map<string, string[]> | undefined;

/** word → chosen CMU phones (`|` is a word break inside an override). */
export function loadCmu(): Map<string, string[]> {
  if (cached) return cached;
  if (!existsSync(CMU_PATH)) {
    throw new Error(`${CMU_PATH} missing: run node scripts/echo-pronunciation.ts`);
  }
  return (cached = parseCmuDict(readFileSync(CMU_PATH, "utf8")));
}

/**
 * CMU phones for an English label, `|` between words. Exact entry, else each
 * hyphen- or space-separated part. No spelling fallback.
 */
export function lookupPronunciation(label: string): string {
  const found = lookupPronunciationIn(loadCmu(), label);
  if (found === undefined) throw new Error(`no CMU pronunciation for "${label}"`);
  return found;
}
