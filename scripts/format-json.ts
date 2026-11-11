// Canonical JSON for hand-edited data files (docs/meta/claritish-editor-data.md#json-format).
// Canonical form is JSON.stringify(data, null, 2) + "\n". Scope: data/*.json only.
//
//   npm run format-json           rewrite every data/*.json into canonical form
//   npm run format-json -- --check  list non-canonical files and exit non-zero
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { REPO_ROOT } from "../src/repo-paths.js";

const ANCHOR = "docs/meta/claritish-editor-data.md#json-format";
const DATA = join(REPO_ROOT, "data");

export function canonical(text: string): string {
  return `${JSON.stringify(JSON.parse(text), null, 2)}\n`;
}

const check = process.argv.includes("--check");
const files = readdirSync(DATA).filter((f) => f.endsWith(".json")).sort();
const stale: string[] = [];

for (const file of files) {
  const path = join(DATA, file);
  const text = readFileSync(path, "utf8");
  let want: string;
  try {
    want = canonical(text);
  } catch (e) {
    console.error(`data/${file}:1 is not valid JSON: ${(e as Error).message}`);
    process.exitCode = 1;
    continue;
  }
  if (want === text) continue;
  if (check) stale.push(`data/${file}`);
  else {
    writeFileSync(path, want);
    console.log(`formatted data/${file}`);
  }
}

if (stale.length) {
  console.error(`${stale.length} data JSON file(s) are not canonical:`);
  for (const f of stale) console.error(`${f}:1`);
  console.error(`run npm run format-json (rule: ${ANCHOR})`);
  process.exitCode = 1;
} else if (check && !process.exitCode) {
  console.log(`OK: ${files.length} data JSON file(s) canonical.`);
}
