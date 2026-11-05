/**
 * H3 clusters on a one-sitting grammar page: select, cut, and list ids.
 * Shared by peel-headings (cluster → new sitting) and move-heading (cluster → existing sitting).
 */
import { anchorTags, grammarHeadings, type Heading } from "../../src/lint/grammar-anchors.js";

export const PRACTICE_TITLE = /^(?:translation )?practice$/i;

export type Range = { start: number; end: number; heading: Heading };

/** Each `--ids` entry's heading subtree, outermost only, in page order. `h3Only` refuses H4s. */
export function selectedRanges(markdown: string, ids: readonly string[], opts: { h3Only?: boolean } = {}): Range[] {
  const headings = grammarHeadings(markdown);
  const roots: Heading[] = [];
  for (const id of ids) {
    const heading = headingForId(markdown, headings, id);
    if (PRACTICE_TITLE.test(heading.title)) {
      throw new Error(`#${id} is a Practice heading; split drills by hand`);
    }
    if (heading.level < 3 || (opts.h3Only && heading.level !== 3)) {
      throw new Error(`#${id} is H${heading.level}; ${opts.h3Only ? "move H3 clusters" : "peel H3 clusters (or nested H4s)"}`);
    }
    roots.push(heading);
  }
  const unique = [...new Map(roots.map((h) => [h.offset, h])).values()].sort((a, b) => a.offset - b.offset);
  const top = unique.filter(
    (h) => !unique.some((other) => other.offset < h.offset && subtreeEnd(headings, other, markdown.length) > h.offset),
  );
  return top.map((heading) => ({
    start: heading.offset,
    end: subtreeEnd(headings, heading, markdown.length),
    heading,
  }));
}

export function headingForId(markdown: string, headings: readonly Heading[], id: string): Heading {
  const heading = headings.find((h) => h.id === id);
  if (heading) return heading;
  const tag = anchorTags(markdown).find((a) => a.id === id);
  if (!tag) throw new Error(`no heading or <a id> #${id}`);
  const containing = [...headings].reverse().find((h) => h.offset <= tag.offset);
  if (!containing) throw new Error(`#${id} sits before every heading`);
  return containing;
}

/** Offset of the next heading at the same level or above (H3 → next H3, H2 or H1). */
export function subtreeEnd(headings: readonly Heading[], heading: Heading, docEnd: number): number {
  return headings.find((h) => h.offset > heading.offset && h.level <= heading.level)?.offset ?? docEnd;
}

/** Headings in `[start, end)` without a `{#id}`, as `Title {#slug}` hints. */
export function headingsWithoutId(markdown: string, start: number, end: number): string[] {
  return grammarHeadings(markdown)
    .filter((h) => h.offset >= start && h.offset < end && !h.custom)
    .map((h) => `line ${h.line + 1}: "${h.title}" needs {#${h.id}}`);
}

export function hasTaughtH3(markdown: string): boolean {
  return grammarHeadings(markdown).some((h) => h.level === 3 && !PRACTICE_TITLE.test(h.title));
}

export function idsIn(markdown: string): string[] {
  return [...grammarHeadings(markdown).map((h) => h.id), ...anchorTags(markdown).map((a) => a.id)];
}

export function idsInRange(markdown: string, start: number, end: number): string[] {
  const headingIds = grammarHeadings(markdown)
    .filter((h) => h.offset >= start && h.offset < end)
    .map((h) => h.id);
  const tagIds = anchorTags(markdown)
    .filter((a) => a.offset >= start && a.offset < end)
    .map((a) => a.id);
  return [...new Set([...headingIds, ...tagIds])];
}

/** Drop ranges in one pass so later cuts do not see shifted offsets. */
export function cutRanges(markdown: string, ranges: readonly Range[]): string {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let out = markdown.slice(0, sorted[0]!.start);
  for (let i = 0; i < sorted.length; i++) {
    const end = sorted[i]!.end;
    const next = sorted[i + 1]?.start ?? markdown.length;
    out += markdown.slice(end, next);
  }
  return out.replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "").replace(/\n+$/, "\n");
}

/** Rewrite same-page `](#id)` links through `dest`; ids it returns undefined for stay. */
export function rewriteLocalLinks(text: string, dest: (id: string) => string | undefined): string {
  return text.replace(/\]\(#([^)\s]+)\)/g, (whole, id: string) => {
    const to = dest(id);
    return to ? `](${to})` : whole;
  });
}
