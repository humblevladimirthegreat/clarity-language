/**
 * Learning order of grammar-page sections (docs/proposals/learning-order-check.md).
 *
 * Global order: every `## Beginner` band in sidebar order, then every
 * `## Intermediate` band, then every `## Advanced` band; within a band,
 * heading order. Only level-2 headings open a band, so `### Beginner forms`
 * stays inside its `## Beginner`. Doc order comes from the sidebar's
 * `readingOrder`, passed in by the caller at run time.
 */
import { headingSlug, headingText } from "./grammar-anchors.js";

export const BANDS = ["beginner", "intermediate", "advanced"] as const;
export type Band = (typeof BANDS)[number];

export type Section = {
  page: string;
  /** Heading slug (or `{#custom}` id); `""` for text before the first heading. */
  slug: string;
  title: string;
  /** Heading level (0 for text before the first heading). */
  level: number;
  /** Offset of the heading line in the page. */
  offset: number;
  /** End of the heading's subtree: the next heading at the same or a higher level. */
  end: number;
  band?: Band;
  /** Index in the global learning order; undefined outside every band or off the reading order. */
  position?: number;
};

export type PageSections = {
  page: string;
  sections: Section[];
  /** Anchor id (heading slug or `<a id>`) → section it lands in. */
  anchors: Map<string, Section>;
};

/** Split a grammar page into heading sections, with bands and anchors. */
export function pageSections(page: string, markdown: string): PageSections {
  const sections: Section[] = [{ page, slug: "", title: "", level: 0, offset: 0, end: markdown.length }];
  const anchors = new Map<string, Section>();
  let band: Band | undefined;
  let inFence = false;
  let offset = 0;
  for (const line of markdown.split("\n")) {
    const lineOffset = offset;
    offset += line.length + 1;
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!heading) continue;
    const level = heading[1]!.length;
    const raw = heading[2]!;
    const custom = /\{#([^}]+)\}\s*$/.exec(raw);
    const title = headingText(raw.replace(/\s*\{#[^}]+\}\s*$/, ""));
    if (level <= 2) {
      const named = BANDS.find((b) => title.toLowerCase() === b);
      band = named ?? (level === 1 ? undefined : band);
    }
    for (const open of sections) {
      if (open.level >= level && open.end === markdown.length && open.level > 0) open.end = lineOffset;
    }
    if (sections[0]!.end === markdown.length) sections[0]!.end = lineOffset;
    const slug = custom ? custom[1]! : headingSlug(title);
    const section: Section = { page, slug, title, level, offset: lineOffset, end: markdown.length, band };
    sections.push(section);
    if (!anchors.has(section.slug)) anchors.set(section.slug, section);
  }
  for (const m of markdown.matchAll(/<a\s+id="([^"]+)"/g)) {
    if (!anchors.has(m[1]!)) anchors.set(m[1]!, sectionAt(sections, m.index!));
  }
  return { page, sections, anchors };
}

/** The section containing `offset` (sections sorted by offset). */
export function sectionAt(sections: readonly Section[], offset: number): Section {
  let found = sections[0]!;
  for (const s of sections) {
    if (s.offset > offset) break;
    found = s;
  }
  return found;
}

export type LearningOrder = {
  pages: Map<string, PageSections>;
  /** Pages in sidebar order. */
  readingOrder: readonly string[];
  /** Banded sections in learning order. */
  ordered: Section[];
};

/**
 * Number every banded section. `readingOrder` is the list of pages (`clause.md`,
 * …) in sidebar order; sections of pages off that list get no position.
 */
export function learningOrder(readingOrder: readonly string[], pages: Map<string, PageSections>): LearningOrder {
  const ordered: Section[] = [];
  for (const band of BANDS) {
    for (const page of readingOrder) {
      for (const s of pages.get(page)?.sections ?? []) if (s.band === band) ordered.push(s);
    }
  }
  ordered.forEach((s, i) => (s.position = i));
  return { pages, readingOrder, ordered };
}

/** Sidebar link (`/`, `/clause`) → page file name (`index.md`, `clause.md`). */
export function sidebarPage(link: string): string {
  const path = link.split(/[?#]/, 1)[0]!.replace(/^\//, "").replace(/\.(?:md|html)$/, "");
  return `${path || "index"}.md`;
}

/** Resolve `page.md#id` to its section, or undefined. */
export function resolveAnchor(order: LearningOrder, anchor: string): Section | undefined {
  const [page, id] = anchor.split("#");
  return order.pages.get(page!)?.anchors.get(id ?? "");
}

/** Whether `inner` lies in `outer`'s heading subtree. */
export function withinSection(outer: Section, inner: Section): boolean {
  return inner.page === outer.page && inner.offset >= outer.offset && inner.offset < outer.end;
}

export function formatSection(s: Section): string {
  return s.slug ? `${s.page}#${s.slug}` : s.page;
}

export type MarkdownLink = { index: number; page: string; anchor: string };

/**
 * Markdown links to a grammar-page anchor (`[x](page.md#id)`, `[x](#id)`,
 * `[x](./page#id)`), outside code. Links with no anchor are not returned.
 */
export function anchorLinks(page: string, markdown: string): MarkdownLink[] {
  const blanked = markdown
    .replace(/^\s*```[\s\S]*?^\s*```/gm, (m) => " ".repeat(m.length))
    .replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
  const out: MarkdownLink[] = [];
  for (const m of blanked.matchAll(/\]\(([^)\s]*)#([^)\s]+)\)/g)) {
    const target = m[1]!;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
    const file = target === "" ? page : target.replace(/^\.\//, "").replace(/^\//, "");
    if (file.includes("/")) continue;
    out.push({ index: m.index!, page: file.endsWith(".md") ? file : `${file.replace(/\.html$/, "")}.md`, anchor: m[2]! });
  }
  return out;
}
