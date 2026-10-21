/**
 * IPA clips: the sound files the grammar pages play with <IpaPlay file="…" />, served from
 * docs/grammar/public/ipa/ (sources and licence in ATTRIBUTION.txt there).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { listMarkdown } from "../../src/markdown-files.ts";
import { REPO_ROOT } from "../../src/repo-paths.ts";

export const IPA_DIR = join(REPO_ROOT, "docs/grammar/public/ipa");

/** Every clip a grammar page names, sorted. */
export function ipaClipFiles(): string[] {
  const files = new Set<string>();
  for (const md of listMarkdown(join(REPO_ROOT, "docs/grammar"))) {
    for (const [, file] of readFileSync(md, "utf8").matchAll(/<IpaPlay file="([^"]+)"/g)) files.add(file!);
  }
  return [...files].sort();
}
