/**
 * Peel named H3 clusters off a one-sitting grammar page onto a new file.
 * Keeps `{#id}`s; rewrites same-page links that now cross files.
 */
import { pageBand, type Band } from "../../src/lint/learning-order.js";
import { anchorTags, grammarHeadings, headingSlug, type Heading } from "../../src/lint/grammar-anchors.js";
import type { HashRedirect } from "../../docs/grammar/.vitepress/lib/hash-redirect.js";
import type { HoldingSitting } from "../../docs/grammar/.vitepress/lib/holding-list.js";
import type { PeelResult } from "./peel-band.ts";

const PRACTICE_TITLE = /^(?:translation )?practice$/i;

export type PeelHeadingsInput = {
  parentPage: string;
  parentMarkdown: string;
  ids: string[];
  newPage: string;
  title: string;
  band: Band;
  h1Id?: string;
};

export function peelHeadings(input: PeelHeadingsInput): PeelResult {
  const { parentPage, parentMarkdown, newPage, title, band } = input;
  if (!pageBand(parentMarkdown)) {
    throw new Error(`${parentPage} has no front matter band:; peel-headings is for one-sitting files`);
  }
  if (parentPage === newPage) throw new Error("new sitting slug must differ from the parent");
  if (input.ids.length === 0) throw new Error("pass at least one --ids heading");

  const ranges = selectedRanges(parentMarkdown, input.ids);
  if (ranges.length === 0) throw new Error("no headings matched --ids");

  const slices = ranges.map((r) => parentMarkdown.slice(r.start, r.end).replace(/\n+$/, "\n"));
  const body = slices.join("\n").replace(/^\n+/, "").replace(/\n+$/, "\n");
  const taken = idsIn(body);
  const h1Id = pickH1Id(input.h1Id, title, newPage, taken);
  const sitting = `---\nband: ${band}\n---\n\n# ${title} {#${h1Id}}\n\n${body}`;

  const movedIds = ranges.flatMap((r) => idsInRange(parentMarkdown, r.start, r.end));
  let parent = cutRanges(parentMarkdown, ranges);
  if (!hasTaughtH3(parent)) {
    throw new Error(`${parentPage} would have no taught H3 left after peeling ${input.ids.join(", ")}`);
  }

  const linkMap = new Map<string, string>();
  const homeMap = new Map<string, string>();
  for (const id of movedIds) {
    const dest = `${newPage}#${id}`;
    linkMap.set(`${parentPage}#${id}`, dest);
    homeMap.set(`${parentPage}#${id}`, dest);
  }

  const keptIds = new Set(idsIn(parent));
  parent = rewriteLocalLinks(parent, (id) => (movedIds.includes(id) ? `${newPage}#${id}` : undefined));
  const sittingOut = rewriteLocalLinks(sitting, (id) => (keptIds.has(id) ? `${parentPage}#${id}` : undefined));

  const hashRedirects: HashRedirect[] = [];
  return {
    parent,
    sitting: sittingOut,
    movedIds,
    hashRedirects,
    holding: { parent: parentPage, page: newPage, band, title },
    linkMap,
    homeMap,
  };
}

type Range = { start: number; end: number; heading: Heading };

function selectedRanges(markdown: string, ids: readonly string[]): Range[] {
  const headings = grammarHeadings(markdown);
  const roots: Heading[] = [];
  for (const id of ids) {
    const heading = headingForId(markdown, headings, id);
    if (PRACTICE_TITLE.test(heading.title)) {
      throw new Error(`#${id} is a Practice heading; split drills by hand`);
    }
    if (heading.level < 3) {
      throw new Error(`#${id} is H${heading.level}; peel H3 clusters (or nested H4s)`);
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

function headingForId(markdown: string, headings: readonly Heading[], id: string): Heading {
  const heading = headings.find((h) => h.id === id);
  if (heading) return heading;
  const tag = anchorTags(markdown).find((a) => a.id === id);
  if (!tag) throw new Error(`no heading or <a id> #${id}`);
  const containing = [...headings].reverse().find((h) => h.offset <= tag.offset);
  if (!containing) throw new Error(`#${id} sits before every heading`);
  return containing;
}

function subtreeEnd(headings: readonly Heading[], heading: Heading, docEnd: number): number {
  return headings.find((h) => h.offset > heading.offset && h.level <= heading.level)?.offset ?? docEnd;
}

function hasTaughtH3(markdown: string): boolean {
  return grammarHeadings(markdown).some((h) => h.level === 3 && !PRACTICE_TITLE.test(h.title));
}

function idsIn(markdown: string): string[] {
  return [...grammarHeadings(markdown).map((h) => h.id), ...anchorTags(markdown).map((a) => a.id)];
}

function idsInRange(markdown: string, start: number, end: number): string[] {
  const headingIds = grammarHeadings(markdown)
    .filter((h) => h.offset >= start && h.offset < end)
    .map((h) => h.id);
  const tagIds = anchorTags(markdown)
    .filter((a) => a.offset >= start && a.offset < end)
    .map((a) => a.id);
  return [...new Set([...headingIds, ...tagIds])];
}

/** Drop ranges in one pass so later cuts do not see shifted offsets. */
function cutRanges(markdown: string, ranges: readonly Range[]): string {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let out = markdown.slice(0, sorted[0]!.start);
  for (let i = 0; i < sorted.length; i++) {
    const end = sorted[i]!.end;
    const next = sorted[i + 1]?.start ?? markdown.length;
    out += markdown.slice(end, next);
  }
  return out.replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "").replace(/\n+$/, "\n");
}

function rewriteLocalLinks(text: string, dest: (id: string) => string | undefined): string {
  return text.replace(/\]\(#([^)\s]+)\)/g, (whole, id: string) => {
    const to = dest(id);
    return to ? `](${to})` : whole;
  });
}

function pickH1Id(explicit: string | undefined, title: string, newPage: string, taken: readonly string[]): string {
  if (explicit) {
    if (taken.includes(explicit)) {
      throw new Error(`H1 id {#${explicit}} collides with a heading in the slice; pass --h1-id`);
    }
    return explicit;
  }
  const stem = newPage.replace(/\.md$/, "");
  const id = [headingSlug(title), stem, `${headingSlug(title)}-sitting`].find((candidate) => !taken.includes(candidate));
  if (!id) throw new Error(`H1 id collides with a heading in the slice; pass --h1-id`);
  return id;
}
