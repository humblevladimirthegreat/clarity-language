/**
 * Move named H3 clusters from one existing sitting into another. Pure transform; the CLI writes files.
 * A cluster is the H3 and everything under it up to the next H3, H2 or `### Practice`.
 * Keeps every `{#id}` and `<a id>`; rewrites same-page links that now cross files.
 */
import { grammarHeadings } from "../../src/lint/grammar-anchors.js";
import {
  cutRanges,
  hasTaughtH3,
  headingsWithoutId,
  idsIn,
  idsInRange,
  PRACTICE_TITLE,
  rewriteLocalLinks,
  selectedRanges,
  subtreeEnd,
} from "./heading-clusters.ts";
import { rewriteMarkdownLinks } from "./peel-band.ts";

export type Placement = { after: string } | { before: string } | { end: true };

export type MoveInput = {
  fromPage: string;
  fromMarkdown: string;
  intoPage: string;
  intoMarkdown: string;
  ids: string[];
  placement: Placement;
};

export type MoveResult = {
  from: string;
  into: string;
  /** Every id the clusters carry (H3s, nested headings, `<a id>`s). */
  movedIds: string[];
  /** Cut clusters: H3 id, title, 1-based line on the source page. */
  clusters: { id: string; title: string; line: number }[];
  /** Where the clusters land, for the dry run. */
  landing: string;
  /** In-repo `from.md#id` → `into.md#id`. */
  linkMap: Map<string, string>;
};

export function moveHeadings(input: MoveInput): MoveResult {
  const { fromPage, intoPage, fromMarkdown, intoMarkdown } = input;
  if (fromPage === intoPage) throw new Error("--from and --into must differ");
  if (input.ids.length === 0) throw new Error("pass at least one --ids heading");

  const ranges = selectedRanges(fromMarkdown, input.ids, { h3Only: true });
  const missingIds = ranges.flatMap((r) => headingsWithoutId(fromMarkdown, r.start, r.end));
  if (missingIds.length) {
    throw new Error(`${fromPage}: add a {#id} to every heading you move:\n  ${missingIds.join("\n  ")}`);
  }

  const movedIds = ranges.flatMap((r) => idsInRange(fromMarkdown, r.start, r.end));
  const intoIds = new Set(idsIn(intoMarkdown));
  const clash = movedIds.filter((id) => intoIds.has(id));
  if (clash.length) throw new Error(`${intoPage} already has #${clash.join(", #")}`);

  let from = cutRanges(fromMarkdown, ranges);
  if (!hasTaughtH3(from)) {
    throw new Error(`${fromPage} would have no taught H3 left after moving ${input.ids.join(", ")}`);
  }

  const keptIds = new Set(idsIn(from));
  const moved = new Set(movedIds);
  const slices = ranges.map((r) =>
    rewriteLocalLinks(fromMarkdown.slice(r.start, r.end).replace(/\n+$/, "\n"), (id) =>
      keptIds.has(id) && !moved.has(id) ? `${fromPage}#${id}` : undefined,
    ),
  );
  const block = slices.join("\n").replace(/^\n+/, "").replace(/\n+$/, "\n");

  const { offset, landing } = insertionPoint(intoMarkdown, intoPage, input.placement);
  const before = intoMarkdown.slice(0, offset).replace(/\n+$/, "");
  const after = intoMarkdown.slice(offset).replace(/^\n+/, "");
  let into = `${before}\n\n${block}${after ? `\n${after}` : ""}`.replace(/\n{3,}/g, "\n\n");
  if (!into.endsWith("\n")) into += "\n";

  const linkMap = new Map(movedIds.map((id) => [`${fromPage}#${id}`, `${intoPage}#${id}`]));
  from = rewriteMarkdownLinks(from, fromPage, linkMap);
  into = rewriteMarkdownLinks(into, intoPage, linkMap);
  into = selfLinksToLocal(into, intoPage, new Set([...intoIds, ...movedIds]));

  return {
    from,
    into,
    movedIds,
    clusters: ranges.map((r) => ({ id: r.heading.id, title: r.heading.title, line: r.heading.line + 1 })),
    landing,
    linkMap,
  };
}

function insertionPoint(markdown: string, page: string, placement: Placement): { offset: number; landing: string } {
  const headings = grammarHeadings(markdown);
  if ("end" in placement) {
    const practice = headings.find((h) => h.level === 3 && PRACTICE_TITLE.test(h.title));
    if (practice) return { offset: practice.offset, landing: `${page}: before ### ${practice.title} (line ${practice.line + 1})` };
    return { offset: markdown.length, landing: `${page}: end of page (no Practice)` };
  }
  const id = "after" in placement ? placement.after : placement.before;
  const anchor = headings.find((h) => h.id === id);
  if (!anchor) throw new Error(`${page} has no heading #${id}`);
  if (anchor.level !== 3 || PRACTICE_TITLE.test(anchor.title)) {
    throw new Error(`#${id} on ${page} is not a taught H3; place clusters next to an H3 (or use --end)`);
  }
  if (!anchor.custom) throw new Error(`${page}: line ${anchor.line + 1}: "${anchor.title}" needs {#${anchor.id}}`);
  if ("before" in placement) {
    return { offset: anchor.offset, landing: `${page}: before ### ${anchor.title} (line ${anchor.line + 1})` };
  }
  const end = subtreeEnd(headings, anchor, markdown.length);
  return { offset: end, landing: `${page}: after ### ${anchor.title} (line ${anchor.line + 1})` };
}

/** `](into.md#id)` on the into page → `](#id)` for ids that live there. */
function selfLinksToLocal(markdown: string, page: string, ids: ReadonlySet<string>): string {
  const stem = page.replace(/\.md$/, "");
  const re = new RegExp(`\\]\\((?:\\./)?(?:${escape(page)}|${escape(stem)}(?:\\.html)?)#([^)\\s]+)\\)`, "g");
  return markdown.replace(re, (whole, id: string) => (ids.has(id) ? `](#${id})` : whole));
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
