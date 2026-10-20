import { collectAmbiguity } from "../parse/ambiguity.js";
import type { ClassifyTables } from "../parse/classify.js";
import {
  compareMorphGloss,
  extractExampleBlocks,
  extractTeachBlocks,
  looksLikeMorphLine,
  morphRedundantWithLoose,
} from "../parse/morph-gloss.js";
import { lineNumberAt } from "../retie/tokens.js";
import type { AmbiguityConflict } from "../parse/types.js";
import { SPEECH_MARK } from "./number-speech-docs.js";
import { isPracticeBoundary, practiceRanges } from "./practice-sections.js";
import { practiceItems, RULE_RE } from "./practice-items.js";

export type MorphPair = {
  agebon: string;
  morph: string;
  index: number;
  source: "blockquote" | "table" | "exercise";
};

export type MorphMismatch = {
  kind: "mismatch";
  line: number;
  agebon: string;
  documented: string;
  parser: string;
};

export type MorphAmbiguity = {
  kind: "ambiguity";
  line: number;
  agebon: string;
  conflict: AmbiguityConflict;
};

export type MorphMissingGloss = {
  kind: "missing-gloss";
  line: number;
  agebon: string;
  scope: "teach" | "exercise";
};

export type MorphCoverageGap = {
  kind: "coverage-gap";
  line: number;
  message: string;
};

export type MorphParseError = {
  kind: "parse-error";
  line: number;
  agebon: string;
  message: string;
};

export type MorphGlossFinding =
  | MorphMismatch
  | MorphAmbiguity
  | MorphMissingGloss
  | MorphCoverageGap
  | MorphParseError;

const SKIP_CELL = /(?:^|[^\w])(?:…|\.\.\.)(?:[^\w]|$)/;
const GLOSS_COMMENT_RE = /<!--\s*gloss:\s*([\s\S]*?)-->/i;
const ITEM_START_RE = /^\*\*(\d+)\.\*\*(.*)$/;

export function extractMorphPairs(markdown: string): MorphPair[] {
  const pairs: MorphPair[] = [];
  for (const block of extractExampleBlocks(markdown)) {
    pairs.push({
      agebon: block.agebon,
      morph: block.morph,
      index: lineIndexToCharIndex(markdown, block.agebonIndex),
      source: "blockquote",
    });
  }
  pairs.push(...extractMorphTables(markdown));
  for (const item of extractTranslationExercises(markdown)) {
    if (item.morph != null) {
      pairs.push({
        agebon: item.agebon,
        morph: item.morph,
        index: item.index,
        source: "exercise",
      });
    }
  }
  return pairs;
}

export type MorphGlossLintResult = {
  findings: MorphGlossFinding[];
  /** Morph-gloss pairs compared to the parser (teach blocks, tables, exercises). */
  checked: number;
  /** Teach blocks and exercises that have in-block loose English. */
  withLooseEnglish: number;
  /** Those items with an explicit morph compared to the parser. */
  comparedWithLoose: number;
  /** Those items with no morph where parser output matches loose English. */
  redundantOmitted: number;
};

function requireMorphForLoose(
  agebon: string,
  morph: string | null,
  loose: string | null,
  tables: ClassifyTables,
): boolean {
  if (loose == null) return false;
  if (morph != null) return false;
  return !morphRedundantWithLoose(agebon, loose, tables);
}

export function lintMorphGlossMarkdown(
  text: string,
  tables: ClassifyTables,
): MorphGlossLintResult {
  const findings: MorphGlossFinding[] = [];
  const pairs = extractMorphPairs(text);

  let withLooseEnglish = 0;
  let comparedWithLoose = 0;
  let redundantOmitted = 0;

  for (const block of extractTeachBlocks(text)) {
    if (block.loose == null) continue;
    withLooseEnglish += 1;
    const line = lineNumberAt(text, lineIndexToCharIndex(text, block.agebonIndex));
    if (block.morph != null) {
      comparedWithLoose += 1;
    } else if (morphRedundantWithLoose(block.agebon, block.loose, tables)) {
      redundantOmitted += 1;
    } else if (requireMorphForLoose(block.agebon, block.morph, block.loose, tables)) {
      findings.push({
        kind: "missing-gloss",
        line,
        agebon: block.agebon,
        scope: "teach",
      });
    }
  }

  for (const item of extractTranslationExercises(text)) {
    if (item.loose == null) continue;
    withLooseEnglish += 1;
    const line = lineNumberAt(text, item.index);
    if (item.morph != null) {
      comparedWithLoose += 1;
    } else if (morphRedundantWithLoose(item.agebon, item.loose, tables)) {
      redundantOmitted += 1;
    } else if (requireMorphForLoose(item.agebon, item.morph, item.loose, tables)) {
      findings.push({
        kind: "missing-gloss",
        line,
        agebon: item.agebon,
        scope: "exercise",
      });
    }
  }

  if (comparedWithLoose + redundantOmitted !== withLooseEnglish) {
    findings.push({
      kind: "coverage-gap",
      line: 1,
      message: `morph coverage invariant failed: ${comparedWithLoose} compared + ${redundantOmitted} redundant != ${withLooseEnglish} with loose English`,
    });
  }

  for (const pair of pairs) {
    const line = lineNumberAt(text, pair.index);
    const compare = compareMorphGloss(pair.agebon, pair.morph, tables);
    if (compare.parseError) {
      findings.push({ kind: "parse-error", line, agebon: pair.agebon, message: compare.parseError });
    } else if (!compare.ok) {
      findings.push({
        kind: "mismatch",
        line,
        agebon: pair.agebon,
        documented: compare.expected,
        parser: compare.actual,
      });
    }
    for (const conflict of collectAmbiguity(pair.agebon, tables)) {
      findings.push({
        kind: "ambiguity",
        line,
        agebon: pair.agebon,
        conflict,
      });
    }
  }
  return {
    findings,
    checked: pairs.length,
    withLooseEnglish,
    comparedWithLoose,
    redundantOmitted,
  };
}

export type TranslationExercise = {
  agebon: string;
  morph: string | null;
  loose: string | null;
  index: number;
};

export function extractTranslationExercises(markdown: string): TranslationExercise[] {
  const items: TranslationExercise[] = [];
  const lines = markdown.split(/\r?\n/);
  for (const range of practiceRanges(lines)) {
    // Converted checkpoints carry decision items; read them by item type.
    if (range.converted) continue;
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
        agebon: parsed.agebon,
        morph: parsed.morph,
        loose: parsed.loose,
        index: lineIndexToCharIndex(markdown, itemStart + parsed.agebonLineOffset),
      });
    }
  }
  items.push(...convertedExercises(markdown));
  return items.sort((a, b) => a.index - b.index);
}

/**
 * Morph pairs of converted checkpoint items: translation items as before; **Pick one** and
 * **Fix it** pair the answer form with the morph line under it; **What changes** pairs each
 * prompt sentence with its own morph line. Prompt forms of Pick one and Fix it have no morph.
 */
function convertedExercises(markdown: string): TranslationExercise[] {
  const lines = markdown.split(/\r?\n/);
  const out: TranslationExercise[] = [];
  for (const item of practiceItems(markdown).items) {
    const firstLine = lineNumberAt(markdown, item.index) - 1;
    const itemLines: string[] = [];
    for (let i = firstLine; i < lines.length; i++) {
      if (i > firstLine && (ITEM_START_RE.test(lines[i]!) || /^#{2,4} /.test(lines[i]!))) break;
      itemLines.push(lines[i]!);
    }
    if (item.type === "en-ag" || item.type === "ag-en") {
      const parsed = parseExerciseItem(itemLines);
      if (parsed) out.push({ ...parsed, index: lineIndexToCharIndex(markdown, firstLine + parsed.agebonLineOffset) });
      continue;
    }
    const texts = item.spoiler.filter((line) => line.kind === "text");
    if (item.type === "changes") {
      item.promptSpans.forEach((span, n) => {
        const morph = texts[n] ? normalizeExerciseMorph(texts[n]!.text) : null;
        out.push({ agebon: span.text, morph, loose: null, index: span.index });
      });
      continue;
    }
    const at = item.spoiler.findIndex((line) => line.kind === "agebon");
    if (at < 0) continue;
    const answer = item.spoiler[at]!;
    const next = item.spoiler.slice(at + 1).find((line) => line.kind !== "speech");
    const morph = next?.kind === "text" ? normalizeExerciseMorph(next.text) : null;
    out.push({ agebon: answer.text, morph, loose: item.promptEnglish, index: answer.index });
  }
  return out;
}

function parseExerciseItem(
  itemLines: string[],
): { agebon: string; morph: string | null; loose: string | null; agebonLineOffset: number } | null {
  const prompt = ITEM_START_RE.exec(itemLines[0] ?? "");
  const promptRest = prompt?.[2] ?? "";
  // A spoken → written prompt (🔊 row) is not the example; its answer in the details is.
  const promptCodes = promptRest.trim().startsWith(SPEECH_MARK) ? [] : codeSpans(promptRest);
  const morph = extractExerciseMorph(itemLines, promptCodes.length > 0);
  const loose = looseFromItalic(promptRest) ?? extractExerciseLooseInDetails(itemLines);

  if (promptCodes.length > 0) {
    return {
      agebon: promptCodes.join(" "),
      morph,
      loose,
      agebonLineOffset: 0,
    };
  }

  const fromDetails = detailsAgebon(itemLines);
  if (!fromDetails) return null;
  return {
    agebon: fromDetails.agebon,
    morph,
    loose,
    agebonLineOffset: fromDetails.lineOffset,
  };
}

function looseFromItalic(text: string): string | null {
  const m = text.match(/\*([^*]+)\*/);
  return m ? m[1]!.trim() : null;
}

function extractExerciseLooseInDetails(itemLines: string[]): string | null {
  let inDetails = false;
  for (const line of itemLines) {
    const trimmed = line.trim();
    if (!inDetails) {
      if (/^::: details\b/.test(trimmed)) inDetails = true;
      continue;
    }
    if (/^:::$/.test(trimmed)) break;
    if (RULE_RE.test(trimmed)) continue;
    const fromItalic = looseFromItalic(trimmed);
    if (fromItalic) return fromItalic;
  }
  return null;
}

function extractExerciseMorph(itemLines: string[], agebonOnPrompt: boolean): string | null {
  const body = itemLines.join("\n");
  const glossMatch = GLOSS_COMMENT_RE.exec(body);
  if (glossMatch) {
    return normalizeExerciseMorph(glossMatch[1] ?? "");
  }

  let inDetails = false;
  let agebonLineInDetails = -1;
  for (let i = 0; i < itemLines.length; i++) {
    const trimmed = itemLines[i]!.trim();
    if (!inDetails) {
      if (/^::: details\b/.test(trimmed)) inDetails = true;
      continue;
    }
    if (/^:::$/.test(trimmed)) break;
    if (unwrapCode(trimmed) && agebonLineInDetails < 0) agebonLineInDetails = i;
    const visibleMorph = visibleExerciseMorphLine(trimmed);
    if (!visibleMorph) continue;
    if (agebonOnPrompt) return visibleMorph;
    if (agebonLineInDetails >= 0 && i > agebonLineInDetails) {
      return visibleMorph;
    }
  }
  return null;
}

function visibleExerciseMorphLine(trimmed: string): string | null {
  if (!trimmed || unwrapCode(trimmed) || RULE_RE.test(trimmed)) return null;
  if (/^\*[^*].*\*$/.test(trimmed)) return null;
  const normalized = normalizeExerciseMorph(trimmed);
  if (!normalized) return null;
  if (looksLikeMorphLine(trimmed) || /\s\|\s/.test(trimmed)) return normalized;
  if (/^[A-Za-z][A-Za-z0-9-]*$/.test(trimmed)) return normalized;
  return null;
}

function detailsAgebon(itemLines: string[]): { agebon: string; lineOffset: number } | null {
  let inDetails = false;
  for (let i = 0; i < itemLines.length; i++) {
    const trimmed = itemLines[i]!.trim();
    if (!inDetails) {
      if (/^::: details\b/.test(trimmed)) inDetails = true;
      continue;
    }
    if (/^:::/.test(trimmed)) break;
    const unwrapped = unwrapCode(trimmed);
    if (unwrapped) return { agebon: unwrapped, lineOffset: i };
  }
  return null;
}

function codeSpans(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
}

function unwrapCode(text: string): string | null {
  const m = text.match(/^`([^`]+)`$/);
  if (m) return m[1]!;
  const html = text.match(/^<code>([^<]+)<\/code>$/);
  return html ? html[1]!.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : null;
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
    const agebonCol = header.findIndex((h) => /^(agebon|example)$/i.test(h));
    const usable = morphCol >= 0 && agebonCol >= 0 && morphCol !== agebonCol;

    while (i < lines.length && isTableRow(lines[i]!) && !isDividerRow(lines[i]!)) {
      if (usable) {
        const cells = splitRow(lines[i]!);
        const agebonCell = cells[agebonCol] ?? "";
        const morphCell = cells[morphCol] ?? "";
        if (!SKIP_CELL.test(agebonCell)) {
          const agebon = unwrapCellAgebon(agebonCell);
          const morph = unwrapCellMorph(morphCell);
          if (agebon && morph && looksLikeMorphLine(morph)) {
            pairs.push({
              agebon,
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
  return t.split(/(?<!\\)\|/).map((cell) => cell.trim());
}

function unwrapCellAgebon(cell: string): string | null {
  const codes = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  if (codes.length === 1) return codes[0]!;
  if (codes.length > 1) return codes.join(" ");
  return null;
}

function unwrapCellMorph(cell: string): string | null {
  const codes = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  const raw = (codes.length > 0 ? codes.join(" | ") : cell).replace(/\\\|/g, "|");
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
    const label = finding.scope === "teach" ? "missing teach morph gloss" : "missing exercise morph gloss";
    return `${loc}  ${label}  \`${finding.agebon}\``;
  }
  if (finding.kind === "coverage-gap") {
    return `${loc}  ${finding.message}`;
  }
  if (finding.kind === "parse-error") {
    return `${loc}  sentence does not parse  \`${finding.agebon}\`  (${finding.message.split("\n")[0]})`;
  }
  return [
    `${loc}  morph gloss mismatch`,
    `  agebon: \`${finding.agebon}\``,
    `  documented: ${finding.documented}`,
    `  parser:     ${finding.parser}`,
  ].join("\n");
}
