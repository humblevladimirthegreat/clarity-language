// Fails on a hand-written .ts / .mjs file over the line ceiling unless the allowlist names it
// (docs/meta/code-layout.md#limits). Each allowlist row holds the file's line count when added.
import { filesOver } from "./lib/deps.js";

const CEILING = 1500;
const ANCHOR = "docs/meta/code-layout.md#limits";

// Remove a row when its file is split; never raise a count.
const ALLOWED: Record<string, number> = {
};

const over = new Map(filesOver(CEILING).map((f) => [f.file, f.lines]));
const problems: string[] = [];

for (const [file, lines] of over) {
  const cap = ALLOWED[file];
  if (cap === undefined) {
    problems.push(`${file}:${CEILING + 1}: ${lines} lines, over the ${CEILING}-line ceiling; split it, or move a section to a new file (${ANCHOR})`);
  } else if (lines > cap) {
    problems.push(`${file}:${cap + 1}: grew from ${cap} to ${lines} lines while on the allowlist; move code out instead of adding (${ANCHOR})`);
  }
}
for (const [file, cap] of Object.entries(ALLOWED)) {
  if (!over.has(file)) {
    problems.push(`scripts/lint-source-size.ts:1: allowlist row ${file} (${cap}) is stale, the file is now under ${CEILING} lines or gone; remove the row (${ANCHOR})`);
  }
}

if (problems.length) {
  console.error(`Source size (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exitCode = 1;
} else {
  console.log(`OK: every source file is within ${CEILING} lines or allowlisted.`);
}
