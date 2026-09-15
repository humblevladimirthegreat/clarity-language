import { collectAmbiguity } from "../parse/ambiguity.js";
import type { ClassifyTables } from "../parse/classify.js";
import {
  compareMorphGloss,
  extractExampleBlocks,
  looksLikeMorphLine,
} from "../parse/morph-gloss.js";
import { lineNumberAt } from "../retie/tokens.js";
import type { AmbiguityConflict } from "../parse/types.js";

export type MorphPair = {
  agalan: string;
  morph: string;
  index: number;
  source: "blockquote" | "table" | "exercise";
};

export type MorphMismatch = {
  kind: "mismatch";
  line: number;
  agalan: string;
  documented: string;
  parser: string;
};

export type MorphAmbiguity = {
  kind: "ambiguity";
  line: number;
  agalan: string;
  conflict: AmbiguityConflict;
};

export type MorphMissingGloss = {
  kind: "missing-gloss";
  line: number;
  agalan: string;
};

export type MorphGlossFinding = MorphMismatch | MorphAmbiguity | MorphMissingGloss;

const SKIP_CELL = /(?:^|[^\w])(?:…|\.\.\.)(?:[^\w]|$)/;
const GLOSS_COMMENT_RE = /<!--\s*gloss:\s*([\s\S]*?)-->/i;
const HAS_GLOSS_COMMENT_RE = /<!--\s*gloss:/i;
const ITEM_START_RE = /^\*\*(\d+)\.\*\*(.*)$/;
const PRACTICE_H3_RE = /^### Translation practice\b/;

export function extractMorphPairs(markdown: string): MorphPair[] {
  const pairs: MorphPair[] = [];
  for (const block of extractExampleBlocks(markdown)) {
    pairs.push({
      agalan: block.agalan,
      morph: block.morph,
      index: lineIndexToCharIndex(markdown, block.agalanIndex),
      source: "blockquote",
    });
  }
  pairs.push(...extractMorphTables(markdown));
  for (const item of extractTranslationExercises(markdown)) {
    if (item.morph != null) {
      pairs.push({
        agalan: item.agalan,
        morph: item.morph,
        index: item.index,
        source: "exercise",
      });
    }
  }
  return pairs;
}

export function lintMorphGlossMarkdown(
  text: string,
  tables: ClassifyTables,
): MorphGlossFinding[] {
  const findings: MorphGlossFinding[] = [];
  const requireExerciseGloss = HAS_GLOSS_COMMENT_RE.test(text);

  for (const item of extractTranslationExercises(text)) {
    if (item.morph == null) {
      if (requireExerciseGloss) {
        findings.push({
          kind: "missing-gloss",
          line: lineNumberAt(text, item.index),
          agalan: item.agalan,
        });
      }
      continue;
    }
  }

  for (const pair of extractMorphPairs(text)) {
    const line = lineNumberAt(text, pair.index);
    const compare = compareMorphGloss(pair.agalan, pair.morph, tables);
    if (!compare.parseError && !compare.ok) {
      findings.push({
        kind: "mismatch",
        line,
        agalan: pair.agalan,
        documented: compare.expected,
        parser: compare.actual,
      });
    }
    for (const conflict of collectAmbiguity(pair.agalan, tables)) {
      findings.push({
        kind: "ambiguity",
        line,
        agalan: pair.agalan,
        conflict,
      });
    }
  }
  return findings;
}

export type TranslationExercise = {
  agalan: string;
  morph: string | null;
  index: number;
};

export function extractTranslationExercises(markdown: string): TranslationExercise[] {
  const items: TranslationExercise[] = [];
  const lines = markdown.split(/\r?\n/);
  for (const range of translationPracticeRanges(lines)) {
    let i = range.start + 1;
    while (i < range.end) {
      const match = ITEM_START_RE.exec(lines[i]!);
      if (!match) {
        i += 1;
        continue;
      }
      const itemStart = i;
      i += 1;
      while (i < range.end && !ITEM_START_RE.test(lines[i]!) && !isPracticeBoundary(lines[i]!)) {
        i += 1;
      }
      const itemLines = lines.slice(itemStart, i);
      const parsed = parseExerciseItem(itemLines);
      if (!parsed) continue;
      items.push({
        agalan: parsed.agalan,
        morph: parsed.morph,
        index: lineIndexToCharIndex(markdown, itemStart + parsed.agalanLineOffset),
      });
    }
  }
  return items;
}

function translationPracticeRanges(lines: string[]): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!PRACTICE_H3_RE.test(lines[i]!)) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (isPracticeBoundary(lines[j]!)) {
        end = j;
        break;
      }
    }
    ranges.push({ start: i, end });
  }
  return ranges;
}

function isH2(line: string): boolean {
  return /^## /.test(line) && !/^### /.test(line);
}

function isH3(line: string): boolean {
  return /^### /.test(line) && !/^#### /.test(line);
}

function isPracticeBoundary(line: string): boolean {
  return isH2(line) || isH3(line);
}

function parseExerciseItem(
  itemLines: string[],
): { agalan: string; morph: string | null; agalanLineOffset: number } | null {
  const body = itemLines.join("\n");
  const glossMatch = GLOSS_COMMENT_RE.exec(body);
  const morph = glossMatch ? normalizeExerciseMorph(glossMatch[1] ?? "") : null;

  const prompt = ITEM_START_RE.exec(itemLines[0] ?? "");
  const promptRest = prompt?.[2] ?? "";
  const promptCodes = codeSpans(promptRest);
  if (promptCodes.length > 0) {
    return {
      agalan: promptCodes.join(" "),
      morph,
      agalanLineOffset: 0,
    };
  }

  const fromDetails = detailsAgalan(itemLines);
  if (!fromDetails) return null;
  return {
    agalan: fromDetails.agalan,
    morph,
    agalanLineOffset: fromDetails.lineOffset,
  };
}

function detailsAgalan(itemLines: string[]): { agalan: string; lineOffset: number } | null {
  let inDetails = false;
  for (let i = 0; i < itemLines.length; i++) {
    const trimmed = itemLines[i]!.trim();
    if (!inDetails) {
      if (/^::: details\b/.test(trimmed)) inDetails = true;
      continue;
    }
    if (/^:::/.test(trimmed)) break;
    const unwrapped = unwrapCode(trimmed);
    if (unwrapped) return { agalan: unwrapped, lineOffset: i };
  }
  return null;
}

function codeSpans(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
}

function unwrapCode(text: string): string | null {
  const m = text.match(/^`([^`]+)`$/);
  return m ? m[1]! : null;
}

function normalizeExerciseMorph(raw: string): string | null {
  const morph = raw.trim().replace(/\s+·\s+/g, " | ").replace(/\s+;\s+/g, " | ");
  if (!morph || !looksLikeMorphLine(morph)) return morph || null;
  return morph;
}

function lineIndexToCharIndex(text: string, lineIndex: number): number {
  let offset = 0;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lineIndex && i < lines.length; i++) {
    offset += lines[i]!.length + 1;
  }
  return offset;
}

function extractMorphTables(markdown: string): MorphPair[] {
  const pairs: MorphPair[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    if (!isTableRow(lines[i]!)) {
      i += 1;
      continue;
    }
    const header = splitRow(lines[i]!);
    i += 1;
    if (i < lines.length && isDividerRow(lines[i]!)) i += 1;

    const morphCol = header.findIndex((h) => /^(morph(?:\s+gloss)?)$/i.test(h));
    const agalanCol = header.findIndex((h) => /^(agalan|example)$/i.test(h));
    const usable = morphCol >= 0 && agalanCol >= 0 && morphCol !== agalanCol;

    while (i < lines.length && isTableRow(lines[i]!) && !isDividerRow(lines[i]!)) {
      if (usable) {
        const cells = splitRow(lines[i]!);
        const agalanCell = cells[agalanCol] ?? "";
        const morphCell = cells[morphCol] ?? "";
        if (!SKIP_CELL.test(agalanCell)) {
          const agalan = unwrapCellAgalan(agalanCell);
          const morph = unwrapCellMorph(morphCell);
          if (agalan && morph && looksLikeMorphLine(morph)) {
            pairs.push({
              agalan,
              morph,
              index: lineIndexToCharIndex(markdown, i),
              source: "table",
            });
          }
        }
      }
      i += 1;
    }
  }
  return pairs;
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith("|") && t.includes("|", 1);
}

function isDividerRow(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}/.test(line);
}

function splitRow(line: string): string[] {
  const t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return t.split("|").map((cell) => cell.trim());
}

function unwrapCellAgalan(cell: string): string | null {
  const codes = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  if (codes.length === 1) return codes[0]!;
  if (codes.length > 1) return codes.join(" ");
  return null;
}

function unwrapCellMorph(cell: string): string | null {
  const codes = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  const raw = codes.length > 0 ? codes.join(" | ") : cell;
  return raw.replace(/\s+·\s+/g, " | ").replace(/\s+;\s+/g, " | ").trim() || null;
}

export function formatMorphGlossFinding(
  relpath: string,
  finding: MorphGlossFinding,
): string {
  const loc = `${relpath}:${finding.line}`;
  if (finding.kind === "ambiguity") {
    const c = finding.conflict;
    return `${loc}  leftover ambiguity  \`${c.surface}\`  (${c.detail})`;
  }
  if (finding.kind === "missing-gloss") {
    return `${loc}  missing exercise gloss  \`${finding.agalan}\``;
  }
  return [
    `${loc}  morph gloss mismatch`,
    `  agalan: \`${finding.agalan}\``,
    `  documented: ${finding.documented}`,
    `  parser:     ${finding.parser}`,
  ].join("\n");
}
