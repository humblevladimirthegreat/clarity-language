#!/usr/bin/env tsx
/**
 * Regenerate documented morph glosses from the parser emitter
 * ([glosses.md § Phrase brackets](../docs/meta/glosses.md#phrase-brackets)).
 *
 * Dry-run by default; `--write` saves. Covers blockquote lines, `Morph` table
 * cells, and translation-exercise gloss lines — the same pairs `lint:agalan` checks.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadDefaultTables } from "../src/parse/index.js";
import { morphGlossLine, normalizeMorphLine } from "../src/parse/morph-gloss.js";
import { extractMorphPairs } from "../src/lint/morph-gloss-docs.js";

const write = process.argv.includes("--write");
// docs/meta examples omit antecedents on purpose; bracket those by hand.
const roots = ["docs/grammar", "docs/examples"];
const tables = loadDefaultTables();

function markdownFiles(dir: string, into: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) markdownFiles(path, into);
    else if (path.endsWith(".md")) into.push(path);
  }
  return into;
}

const sep = (line: string) => normalizeMorphLine(line.replace(/\s+·\s+/g, " | ").replace(/\s+;\s+/g, " | "));

function lineAt(markdown: string, index: number): number {
  return markdown.slice(0, index).split(/\r?\n/).length - 1;
}

/** Replace a table row's morph cell (the cell whose morph text matches `old`). */
function retable(row: string, old: string, next: string): string | null {
  const cells = row.split(/(?<!\\)\|/);
  for (let c = 0; c < cells.length; c++) {
    const cell = cells[c]!;
    const codes = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
    const text = (codes.length > 0 ? codes.join(" | ") : cell).replace(/\\\|/g, "|");
    if (sep(text) === old) {
      cells[c] = ` \`${next.replace(/\|/g, "\\|")}\` `;
      return cells.join("|");
    }
  }
  return null;
}

let changed = 0;
let unplaced = 0;
for (const root of roots) {
  for (const file of markdownFiles(root)) {
    const markdown = readFileSync(file, "utf8");
    const lines = markdown.split(/\r?\n/);
    const pairs = extractMorphPairs(markdown);
    let edits = 0;
    for (const pair of pairs) {
      let next: string;
      try {
        next = morphGlossLine(pair.agalan, tables);
      } catch {
        continue;
      }
      const old = sep(pair.morph);
      if (old === next) continue;
      const start = lineAt(markdown, pair.index);
      let placed = false;
      if (pair.source === "table") {
        const row = retable(lines[start]!, old, next);
        if (row !== null) {
          lines[start] = row;
          placed = true;
        }
      } else {
        for (let i = start; i < Math.min(lines.length, start + 40); i++) {
          const line = lines[i]!;
          const m = line.match(/^(\s*(?:>\s?)*)(.*?)(\s*)$/)!;
          const comment = m[2]!.match(/^(<!--\s*gloss:\s*)([\s\S]*?)(\s*-->)$/);
          const body = comment ? comment[2]! : m[2]!;
          if (sep(body) !== old) continue;
          lines[i] = comment ? `${m[1]}${comment[1]}${next}${comment[3]}` : `${m[1]}${next}`;
          placed = true;
          break;
        }
      }
      if (placed) {
        edits += 1;
        if (!write) console.log(`${file}:${start + 1}\n  - ${old}\n  + ${next}`);
      } else {
        unplaced += 1;
        console.warn(`${file}:${start + 1} could not place: ${old}`);
      }
    }
    if (edits > 0) {
      changed += edits;
      if (write) writeFileSync(file, lines.join("\n"));
    }
  }
}
console.log(`${write ? "rewrote" : "would rewrite"} ${changed} morph gloss(es); ${unplaced} unplaced`);
