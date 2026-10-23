/**
 * Peel one `## Beginner` / `## Intermediate` / `## Advanced` sitting off a parent
 * grammar page. Pure transforms; the CLI writes files.
 */
import { BANDS, pageBand, parseFrontMatter, type Band } from "../../src/lint/learning-order.js";
import { anchorTags, grammarHeadings, headingSlug } from "../../src/lint/grammar-anchors.js";
import type { HashRedirect } from "../../docs/grammar/.vitepress/lib/hash-redirect.js";
import type { HoldingSitting } from "../../docs/grammar/.vitepress/lib/holding-list.js";

const BAND_TITLE = new Set<string>(BANDS);
const PRACTICE_TITLE = /^(?:translation )?practice$/i;

export type PeelInput = {
  parentPage: string;
  parentMarkdown: string;
  band: Band;
  newPage: string;
  title: string;
  h1Id?: string;
};

export type PeelResult = {
  parent: string;
  sitting: string;
  movedIds: string[];
  hashRedirects: HashRedirect[];
  holding: HoldingSitting;
  /** In-repo `page.md#id` → new sitting or remaining parent (band fragments drop the hash). */
  linkMap: Map<string, string>;
  /** Construction homes on a retired band fragment → first taught H3 (or H1). */
  homeMap: Map<string, string>;
};

export function peelBand(input: PeelInput): PeelResult {
  const { parentPage, band, newPage, title } = input;
  if (pageBand(input.parentMarkdown)) {
    throw new Error(`${parentPage} already has front matter band:; it is one sitting`);
  }
  if (parentPage === newPage) throw new Error("new sitting slug must differ from the parent");

  const headings = grammarHeadings(input.parentMarkdown);
  const bandH2 = headings.find((h) => h.level === 2 && h.title.toLowerCase() === band);
  if (!bandH2) throw new Error(`${parentPage} has no ## ${capitalize(band)} heading to peel`);

  const end =
    headings.find((h) => h.offset > bandH2.offset && h.level <= 2)?.offset ?? input.parentMarkdown.length;
  const subtree = input.parentMarkdown.slice(bandH2.offset, end);
  const body = subtree.replace(/^.*\n/, "").replace(/^\n+/, "").replace(/\n+$/, "\n");

  const taken = idsIn(body);
  const h1Id = pickH1Id(input.h1Id, title, newPage, taken);
  const sitting = `---\nband: ${band}\n---\n\n# ${title} {#${h1Id}}\n\n${body}`;

  const movedIds = idsInRange(input.parentMarkdown, bandH2.offset, end).filter((id) => id !== bandH2.id);
  let parent = cutRange(input.parentMarkdown, bandH2.offset, end);

  const remaining = remainingBands(parent);
  const hashRedirects: HashRedirect[] = [{ page: parentPage, hash: band, to: newPage }];
  const linkMap = new Map<string, string>();
  const homeMap = new Map<string, string>();

  for (const id of movedIds) linkMap.set(`${parentPage}#${id}`, `${newPage}#${id}`);
  linkMap.set(`${parentPage}#${bandH2.id}`, newPage);
  homeMap.set(`${parentPage}#${bandH2.id}`, `${newPage}#${firstTaughtId(sitting)}`);

  if (remaining.length === 1) {
    const last = remaining[0]!;
    parent = dropBandH2(parent, last);
    parent = setBandFrontMatter(parent, last);
    hashRedirects.push({ page: parentPage, hash: last, to: parentPage });
    linkMap.set(`${parentPage}#${last}`, parentPage);
    homeMap.set(`${parentPage}#${last}`, `${parentPage}#${firstTaughtId(parent)}`);
  } else if (remaining.length === 0) {
    throw new Error(`${parentPage} would have no band left after peeling ${band}`);
  }

  const keptIds = new Set(idsIn(parent));
  parent = rewriteLocalLinks(parent, (id) => (movedIds.includes(id) ? `${newPage}#${id}` : undefined));
  const sittingOut = rewriteLocalLinks(sitting, (id) => (keptIds.has(id) ? `${parentPage}#${id}` : undefined));

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

export function firstTaughtId(markdown: string): string {
  const headings = grammarHeadings(markdown);
  const h3 = headings.find((h) => h.level === 3 && !PRACTICE_TITLE.test(h.title));
  if (h3) return h3.id;
  return headings.find((h) => h.level === 1)?.id ?? "";
}

export function setBandFrontMatter(markdown: string, band: Band): string {
  const attrs = parseFrontMatter(markdown);
  if (!FRONT_MATTER_START.test(markdown)) return `---\nband: ${band}\n---\n\n${markdown}`;
  if (attrs.band) {
    return markdown.replace(/^band:\s*\S+\s*$/m, `band: ${band}`);
  }
  return markdown.replace(/^---\s*$/m, `---\nband: ${band}`);
}

export function rewriteAnchorRefs(text: string, map: Map<string, string>): { text: string; changes: { from: string; to: string }[] } {
  const changes: { from: string; to: string }[] = [];
  const textOut = text.replace(
    /(\]\()?((?:[\w.-]+\/)*)([\w.-]+\.md)#([A-Za-z0-9_-]+)(?![A-Za-z0-9_-])(\))?/g,
    (whole, linkOpen: string | undefined, dir: string, page: string, id: string, linkClose: string | undefined) => {
      const to = map.get(`${page}#${id}`);
      if (!to) return whole;
      const next = retargetPath(dir, to);
      const replaced = `${linkOpen ?? ""}${next}${linkClose ?? ""}`;
      if (replaced !== whole) changes.push({ from: `${page}#${id}`, to });
      return replaced;
    },
  );
  return { text: textOut, changes };
}

export function rewriteMarkdownLinks(
  text: string,
  currentPage: string,
  map: Map<string, string>,
): string {
  return text.replace(/\]\(([^)\s]*)#([^)\s]+)\)/g, (whole, href: string, id: string) => {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return whole;
    const page = hrefToPage(href, currentPage);
    if (!page) return whole;
    const to = map.get(`${page}#${id}`);
    if (!to) return whole;
    const [toPage, toId] = splitAnchor(to);
    const nextHref = retargetHref(href, currentPage, toPage);
    return toId ? `](${nextHref}#${toId})` : `](${nextHref})`;
  });
}

export function appendObjectToExportedArray(
  source: string,
  exportName: string,
  item: Record<string, string>,
): string {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`missing ${marker}`);
  const assign = source.indexOf("=", start);
  if (assign < 0) throw new Error(`${exportName} has no assignment`);
  const open = source.indexOf("[", assign);
  if (open < 0) throw new Error(`${exportName} is not an array`);
  let depth = 0;
  let close = -1;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (c === "[") depth += 1;
    else if (c === "]") {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close < 0) throw new Error(`unclosed ${exportName}`);
  const inner = source.slice(open + 1, close);
  const literal = `{ ${Object.entries(item)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ")} },`;
  const trimmed = inner.trim();
  const nextInner = trimmed === "" ? `\n  ${literal}\n` : `${inner.replace(/\s*$/, "")}\n  ${literal}\n`;
  return `${source.slice(0, open + 1)}${nextInner}${source.slice(close)}`;
}

const FRONT_MATTER_START = /^---\s*$/m;

function remainingBands(markdown: string): Band[] {
  return grammarHeadings(markdown)
    .filter((h) => h.level === 2 && BAND_TITLE.has(h.title.toLowerCase()))
    .map((h) => h.title.toLowerCase() as Band);
}

function dropBandH2(markdown: string, band: Band): string {
  const h = grammarHeadings(markdown).find((heading) => heading.level === 2 && heading.title.toLowerCase() === band);
  if (!h) return markdown;
  const lineEnd = markdown.indexOf("\n", h.offset);
  const cut = lineEnd < 0 ? markdown.length : lineEnd + 1;
  return `${markdown.slice(0, h.offset)}${markdown.slice(cut).replace(/^\n+/, "\n")}`;
}

function cutRange(markdown: string, start: number, end: number): string {
  const before = markdown.slice(0, start).replace(/\n+$/, "\n");
  const after = markdown.slice(end).replace(/^\n+/, "\n");
  return `${before}${before.endsWith("\n") ? "" : "\n"}${after}`;
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

function rewriteLocalLinks(text: string, dest: (id: string) => string | undefined): string {
  return text.replace(/\]\(#([^)\s]+)\)/g, (whole, id: string) => {
    const to = dest(id);
    return to ? `](${to})` : whole;
  });
}

function splitAnchor(anchor: string): [string, string | undefined] {
  const i = anchor.indexOf("#");
  return i < 0 ? [anchor, undefined] : [anchor.slice(0, i), anchor.slice(i + 1)];
}

function retargetPath(dir: string, to: string): string {
  const [toPage, toId] = splitAnchor(to);
  return toId ? `${dir}${toPage}#${toId}` : `${dir}${toPage}`;
}

function hrefToPage(href: string, currentPage: string): string | undefined {
  if (href === "") return currentPage;
  const path = href.replace(/^\.\//, "").replace(/^\//, "");
  const leaf = path.split("/").pop() ?? path;
  const stem = leaf.replace(/\.(?:md|html)$/, "");
  if (!stem) return currentPage;
  return `${stem}.md`;
}

function retargetHref(href: string, currentPage: string, toPage: string): string {
  if (href === "") return toPage === currentPage ? "" : toPage;
  const newStem = toPage.replace(/\.md$/, "");
  return href.replace(/[^/]+$/, (leaf) => {
    if (leaf.endsWith(".html")) return `${newStem}.html`;
    if (leaf.endsWith(".md")) return toPage;
    return newStem;
  });
}

function pickH1Id(explicit: string | undefined, title: string, newPage: string, taken: readonly string[]): string {
  if (explicit) {
    if (taken.includes(explicit)) throw new Error(`H1 id {#${explicit}} collides with a heading in the slice; pass --h1-id`);
    return explicit;
  }
  const stem = newPage.replace(/\.md$/, "");
  const id = [headingSlug(title), stem, `${headingSlug(title)}-sitting`].find((candidate) => !taken.includes(candidate));
  if (!id) throw new Error(`H1 id collides with a heading in the slice; pass --h1-id`);
  return id;
}

function capitalize(band: Band): string {
  return band.charAt(0).toUpperCase() + band.slice(1);
}
