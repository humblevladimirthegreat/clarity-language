/**
 * Stage checkpoint sections on grammar pages (docs/meta/translation-exercises.md#template).
 * A converted checkpoint is `### Practice {#<band>-practice}`; a legacy one, not yet replaced
 * onto the current standard, is `### Translation practice {#<band>-translation-practice}`.
 * Checks for the current standard run on converted sections only.
 */

/** Either checkpoint heading. */
export const PRACTICE_H3_RE = /^### (?:Translation p|P)ractice\b/;

const CONVERTED_H3_RE = /^### Practice\b/;

/** Section titles (heading text) of either checkpoint heading. */
export const PRACTICE_TITLE_RE = /^(?:translation )?practice\b/i;

export type PracticeRange = { start: number; end: number; converted: boolean };

export function isConvertedPracticeHeading(line: string): boolean {
  return CONVERTED_H3_RE.test(line);
}

/** An H2 or H3 ends a checkpoint section. */
export function isPracticeBoundary(line: string): boolean {
  return (/^## /.test(line) && !/^### /.test(line)) || (/^### /.test(line) && !/^#### /.test(line));
}

/** Line ranges of checkpoint sections: `start` is the heading, `end` the next H2 / H3 or end of file. */
export function practiceRanges(lines: readonly string[]): PracticeRange[] {
  const ranges: PracticeRange[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!PRACTICE_H3_RE.test(lines[i]!)) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (isPracticeBoundary(lines[j]!)) {
        end = j;
        break;
      }
    }
    ranges.push({ start: i, end, converted: isConvertedPracticeHeading(lines[i]!) });
  }
  return ranges;
}
