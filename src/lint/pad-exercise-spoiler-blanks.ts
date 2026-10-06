/**
 * Ensure blank lines in translation spoilers so morph gloss and answers render separately.
 */

import { practiceRanges } from "./practice-sections.js";

function isAgazanLine(trimmed: string): boolean {
  return /^`[^`]+`$/.test(trimmed);
}

function isMorphLine(trimmed: string): boolean {
  if (!trimmed || isAgazanLine(trimmed)) return false;
  if (/^\*[^*].*\*$/.test(trimmed)) return false;
  if (/^[A-Za-z][A-Za-z0-9-]*$/.test(trimmed)) return true;
  return /\s\|\s/.test(trimmed);
}

function isLooseEnglish(trimmed: string): boolean {
  return trimmed.startsWith("*") && trimmed.endsWith("*");
}

function needsBlankBetween(current: string, next: string): boolean {
  const t = current.trim();
  const n = next.trim();
  if (!t || !n) return false;
  if (isAgazanLine(t) && isMorphLine(n)) return true;
  if (isMorphLine(t) && isLooseEnglish(n)) return true;
  return false;
}

export function padExerciseSpoilerBlanks(content: string): string {
  const lines = content.split(/\r?\n/);
  const out: string[] = [];
  const ranges = practiceRanges(lines);
  let inDetails = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const range = ranges.find((r) => i > r.start && i < r.end);

    const trimmed = line.trim();
    if (range && /^::: details\b/.test(trimmed)) {
      inDetails = true;
      out.push(line);
      continue;
    }
    if (inDetails && /^:::$/.test(trimmed)) {
      inDetails = false;
      out.push(line);
      continue;
    }

    out.push(line);

    if (range && inDetails && i + 1 < lines.length) {
      const next = lines[i + 1]!;
      const nextTrimmed = next.trim();
      if (nextTrimmed === "" || /^:::$/.test(nextTrimmed)) continue;
      // Converted checkpoints: every spoiler line (answer, morph, why, Also correct) is its own paragraph.
      if (range.converted ? trimmed !== "" : needsBlankBetween(line, next)) out.push("");
    }
  }

  return out.join("\n");
}
