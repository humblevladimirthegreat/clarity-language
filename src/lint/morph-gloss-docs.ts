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
  source: "blockquote" | "table";
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

export type MorphGlossFinding = MorphMismatch | MorphAmbiguity;

const SKIP_CELL = /(?:^|[^\w])(?:…|\.\.\.)(?:[^\w]|$)/;

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
  return pairs;
}

export function lintMorphGlossMarkdown(
  text: string,
  tables: ClassifyTables,
): MorphGlossFinding[] {
  const findings: MorphGlossFinding[] = [];
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

export type MorphGlossReportFile = {
  relpath: string;
  findings: MorphGlossFinding[];
};

export function formatMorphGlossReport(files: MorphGlossReportFile[]): string {
  const ambiguities: string[] = [];
  const mismatches: string[] = [];

  for (const file of files) {
    for (const finding of file.findings) {
      const loc = `${file.relpath}:${finding.line}`;
      if (finding.kind === "ambiguity") {
        const c = finding.conflict;
        ambiguities.push(
          [
            `### \`${c.surface}\` — ${loc}`,
            "",
            `- agalan: \`${finding.agalan}\``,
            `- stage: ${c.stage}`,
            `- sources: ${c.sources.join(", ")}`,
            `- detail: ${c.detail}`,
            "- why no winner: leftover `--check-ambiguity` hit; grammar does not name a unique reading.",
            "",
          ].join("\n"),
        );
      } else {
        mismatches.push(
          [
            `### ${loc}`,
            "",
            "```",
            `${loc}  morph gloss mismatch`,
            `  agalan: \`${finding.agalan}\``,
            `  documented: ${finding.documented}`,
            `  parser:     ${finding.parser}`,
            "```",
            "",
          ].join("\n"),
        );
      }
    }
  }

  const lines = [
    "# Morph-gloss report",
    "",
    "Editor inventory from `npm run lint:agalan`. Grammar morph lines are **not** auto-retied.",
    "Leftover `--check-ambiguity` hits fail CI. Suspected wrong grammar morph lines are listed here only.",
    "",
    "## Leftover `--check-ambiguity`",
    "",
  ];

  if (ambiguities.length === 0) {
    lines.push("_None._", "");
  } else {
    lines.push(...ambiguities);
  }

  lines.push("## Suspected wrong grammar morph lines", "");
  if (mismatches.length === 0) {
    lines.push("_None._", "");
  } else {
    lines.push(...mismatches);
  }

  return lines.join("\n").trimEnd() + "\n";
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
    const headerLine = lines[i]!;
    const headerAbs = i;
    const header = splitRow(headerLine);
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
    void headerAbs;
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
