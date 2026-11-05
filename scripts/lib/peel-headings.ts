/**
 * Peel named H3 clusters off a one-sitting grammar page onto a new file.
 * Keeps `{#id}`s; rewrites same-page links that now cross files; one hash row per moved id.
 */
import { pageBand, type Band } from "../../src/lint/learning-order.js";
import { headingSlug } from "../../src/lint/grammar-anchors.js";
import type { HashRedirect } from "../../docs/grammar/.vitepress/lib/hash-redirect.js";
import { cutRanges, hasTaughtH3, idsIn, idsInRange, rewriteLocalLinks, selectedRanges } from "./heading-clusters.ts";
import type { PeelResult } from "./peel-band.ts";

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

  const hashRedirects: HashRedirect[] = movedIds.map((id) => ({ page: parentPage, hash: id, to: newPage, toHash: id }));
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
