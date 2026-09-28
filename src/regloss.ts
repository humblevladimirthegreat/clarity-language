/**
 * Regenerate documented morph glosses from the parser emitter
 * ([glosses.md § Phrase brackets](../docs/meta/glosses.md#phrase-brackets)).
 * Covers blockquote lines, `Morph` table cells, and translation-exercise gloss lines —
 * the same pairs `lint:agazan` checks.
 */
import { extractMorphPairs, type MorphPair } from "./lint/morph-gloss-docs.js";
import type { ClassifyTables } from "./parse/classify.js";
import { morphGlossLine, normalizeMorphLine } from "./parse/morph-gloss.js";

export const sepMorph = (line: string): string =>
  normalizeMorphLine(line.replace(/\s+·\s+/g, " | ").replace(/\s+;\s+/g, " | "));

export type ReglossEdit = { line: number; from: string; to: string };

export type ReglossResult = {
  text: string;
  edits: ReglossEdit[];
  /** Pairs whose documented line could not be found to replace (0-based line of the Agazan). */
  unplaced: ReglossEdit[];
};

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
    if (sepMorph(text) === old) {
      cells[c] = ` \`${next.replace(/\|/g, "\\|")}\` `;
      return cells.join("|");
    }
  }
  return null;
}

/**
 * Rewrite each documented morph line to the parser's line.
 * `keep(pair, index)` limits which pairs are rewritten (index = position in `extractMorphPairs`).
 */
export function reglossMarkdown(
  markdown: string,
  tables: ClassifyTables,
  keep: (pair: MorphPair, index: number) => boolean = () => true,
): ReglossResult {
  const lines = markdown.split(/\r?\n/);
  const edits: ReglossEdit[] = [];
  const unplaced: ReglossEdit[] = [];
  extractMorphPairs(markdown).forEach((pair, index) => {
    if (!keep(pair, index)) return;
    let next: string;
    try {
      next = morphGlossLine(pair.agazan, tables);
    } catch {
      return;
    }
    const old = sepMorph(pair.morph);
    if (old === next) return;
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
        if (sepMorph(body) !== old) continue;
        lines[i] = comment ? `${m[1]}${comment[1]}${next}${comment[3]}` : `${m[1]}${next}`;
        placed = true;
        break;
      }
    }
    (placed ? edits : unplaced).push({ line: start, from: old, to: next });
  });
  return { text: lines.join("\n"), edits, unplaced };
}

/** Whether each morph pair on the page matches the parser (by `extractMorphPairs` order). */
export function morphPairsMatching(markdown: string, tables: ClassifyTables): boolean[] {
  return extractMorphPairs(markdown).map((pair) => {
    try {
      return sepMorph(pair.morph) === morphGlossLine(pair.agazan, tables);
    } catch {
      return false;
    }
  });
}
