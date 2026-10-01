#!/usr/bin/env tsx
/**
 * Regenerate documented morph glosses from the parser emitter
 * ([glosses.md § Phrase brackets](../docs/meta/glosses.md#phrase-brackets)).
 *
 * Dry-run by default; `--write` saves. Covers blockquote lines, `Morph` table
 * cells, and translation-exercise gloss lines — the same pairs `lint:agazan` checks.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadDefaultTables } from "../src/parse/index.js";
import { listMarkdown } from "../src/markdown-files.js";
import { reglossMarkdown } from "../src/regloss.js";

const write = process.argv.includes("--write");
// docs/meta examples omit antecedents on purpose; bracket those by hand.
const roots = ["docs/grammar", "docs/examples"].filter((root) => existsSync(root));
const tables = loadDefaultTables();

let changed = 0;
let unplaced = 0;
for (const root of roots) {
  for (const file of listMarkdown(root)) {
    const result = reglossMarkdown(readFileSync(file, "utf8"), tables);
    for (const edit of result.edits) {
      if (!write) console.log(`${file}:${edit.line + 1}\n  - ${edit.from}\n  + ${edit.to}`);
    }
    for (const miss of result.unplaced) {
      unplaced += 1;
      console.warn(`${file}:${miss.line + 1} could not place: ${miss.from}`);
    }
    if (result.edits.length > 0) {
      changed += result.edits.length;
      if (write) writeFileSync(file, result.text);
    }
  }
}
console.log(`${write ? "rewrote" : "would rewrite"} ${changed} morph gloss(es); ${unplaced} unplaced`);
