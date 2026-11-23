/**
 * Line counts per grammar page: total, teaching body, Practice, See also, and
 * taught H3 count *S* (docs/meta/procedures/drill-generation.md).
 */
import { grammarHeadings, type Heading } from "./grammar-anchors.js";
import { pageBand, type Band } from "./learning-order.js";
import { PRACTICE_TITLE_RE, practiceRanges } from "./practice-sections.js";

const SEE_ALSO_RE = /^## See also\b/i;

/** Opens the generated read-by block (scripts/page-readers.ts), which line counts leave out. */
export const READ_BY_OPEN = "<!-- read-by";

/** Lines of the read-by block placed before the H1, with the blank line that sets it off; 0 without one. */
export function readByLines(lines: readonly string[]): number {
  const start = lines.findIndex((l) => l.startsWith(READ_BY_OPEN));
  if (start < 0 || lines.slice(0, start).some((l) => /^#\s/.test(l))) return 0;
  const end = lines.indexOf("-->", start);
  return end < 0 ? 0 : end - start + 2;
}

export type HeadingLines = {
  id: string;
  title: string;
  /** 0-based line of the heading. */
  line: number;
  lines: number;
};

export type PageLineCount = {
  lines: number;
  teach: number;
  practice: number;
  seeAlso: number;
  /** Taught `###` headings, not counting Practice. */
  S: number;
  band?: Band;
  headings: HeadingLines[];
};

/** Editor / `wc -l` line count for a file that normally ends with a newline. */
export function fileLines(text: string): string[] {
  if (text === "") return [];
  const lines = text.split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

function covered(ranges: readonly { start: number; end: number }[]): number {
  let n = 0;
  for (const range of ranges) n += Math.max(0, range.end - range.start);
  return n;
}

function clusterLines(heading: Heading, headings: readonly Heading[], lineCount: number): number {
  const end = headings.find((h) => h.line > heading.line && h.level <= heading.level)?.line ?? lineCount;
  return end - heading.line;
}

export function countPageLines(markdown: string): PageLineCount {
  const lines = fileLines(markdown);
  const headings = grammarHeadings(markdown);
  const taught = headings.filter((h) => h.level === 3 && !PRACTICE_TITLE_RE.test(h.title));
  const practice = practiceRanges(lines);
  const seeAlso: { start: number; end: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!SEE_ALSO_RE.test(lines[i]!)) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^## /.test(lines[j]!) && !/^### /.test(lines[j]!)) {
        end = j;
        break;
      }
    }
    seeAlso.push({ start: i, end });
  }
  const practiceLines = covered(practice);
  const seeAlsoLines = covered(seeAlso);
  const total = lines.length - readByLines(lines);
  return {
    lines: total,
    teach: total - practiceLines - seeAlsoLines,
    practice: practiceLines,
    seeAlso: seeAlsoLines,
    S: taught.length,
    band: pageBand(markdown),
    headings: taught.map((h) => ({
      id: h.id,
      title: h.title,
      line: h.line,
      lines: clusterLines(h, headings, lines.length),
    })),
  };
}
