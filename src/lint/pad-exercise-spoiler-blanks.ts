/**
 * Ensure blank lines in translation spoilers so morph gloss and answers render separately.
 */

const PRACTICE_H3_RE = /^### Translation practice\b/;

function isPracticeBoundary(line: string): boolean {
  return (/^## /.test(line) && !/^### /.test(line)) || (/^### /.test(line) && !/^#### /.test(line));
}

function isAgalanLine(trimmed: string): boolean {
  return /^`[^`]+`$/.test(trimmed);
}

function isMorphLine(trimmed: string): boolean {
  if (!trimmed || isAgalanLine(trimmed)) return false;
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
  if (isAgalanLine(t) && isMorphLine(n)) return true;
  if (isMorphLine(t) && isLooseEnglish(n)) return true;
  return false;
}

export function padExerciseSpoilerBlanks(content: string): string {
  const lines = content.split(/\r?\n/);
  const out: string[] = [];
  let inPractice = false;
  let inDetails = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (PRACTICE_H3_RE.test(line)) inPractice = true;
    else if (inPractice && isPracticeBoundary(line)) inPractice = false;

    const trimmed = line.trim();
    if (inPractice && /^::: details\b/.test(trimmed)) {
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

    if (inPractice && inDetails && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1]!.trim();
      if (needsBlankBetween(line, lines[i + 1]!) && nextTrimmed !== "") {
        out.push("");
      }
    }
  }

  return out.join("\n");
}
