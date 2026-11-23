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

/**
 * Bare `page.md#id` refs, keyed by folder: `claritish/page.md#id` (any path ending in that folder)
 * is the lesson, any other is the stage page. With `from` (the file the text sits in), a ref inside
 * a Markdown link `](…)` resolves from that file instead, as {@link resolveLinkPage} does.
 */
export function rewriteAnchorRefs(
  text: string,
  map: Map<string, string>,
  from?: string,
): { text: string; changes: { from: string; to: string }[] } {
  const changes: { from: string; to: string }[] = [];
  const here = from === undefined ? "" : pageKeyOf(from);
  const textOut = text.replace(
    /(\]\()?((?:[\w.-]+\/)*)([\w.-]+\.md)#([A-Za-z0-9_-]+)(?![A-Za-z0-9_-])(\))?/g,
    (whole, linkOpen: string | undefined, dir: string, page: string, id: string, linkClose: string | undefined) => {
      const key =
        linkOpen && from !== undefined
          ? resolveLinkPage(from, `${dir}${page}`)
          : KEYED_DIRS.has(lastFolder(dir))
            ? `${lastFolder(dir)}/${page}`
            : page;
      const to = map.get(`${key}#${id}`);
      if (!to) return whole;
      const [toPage, toId] = splitAnchor(to);
      const href = `${retargetDir(dir, key!, toPage, linkOpen ? here : "")}${leafOf(toPage)}`;
      const next = toId ? `${href}#${toId}` : href;
      const replaced = `${linkOpen ?? ""}${next}${linkClose ?? ""}`;
      if (replaced !== whole) changes.push({ from: `${page}#${id}`, to });
      return replaced;
    },
  );
  return { text: textOut, changes };
}

/**
 * Markdown links `](href#id)` whose page and id are in `map`. `currentPage` is the file the text
 * sits in, as a path or a page key (`feelings.md`, `claritish/feelings.md`); each href resolves
 * from it ({@link resolveLinkPage}).
 */
export function rewriteMarkdownLinks(
  text: string,
  currentPage: string,
  map: Map<string, string>,
  changes?: { from: string; to: string }[],
): string {
  const here = pageKeyOf(currentPage);
  return text.replace(/\]\(([^)\s]*)#([^)\s]+)\)/g, (whole, href: string, id: string) => {
    const page = resolveLinkPage(currentPage, href);
    if (!page) return whole;
    const to = map.get(`${page}#${id}`);
    if (!to) return whole;
    const [toPage, toId] = splitAnchor(to);
    const nextHref = retargetHref(href, here, page, toPage);
    const replaced = toId ? `](${nextHref}#${toId})` : `](${nextHref})`;
    if (changes && replaced !== whole) changes.push({ from: `${page}#${id}`, to });
    return replaced;
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

/** Index of the `]` that closes the `[` at `open`. */
function closingBracket(source: string, open: number, what: string): number {
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (c === "[") depth += 1;
    else if (c === "]") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`unclosed ${what}`);
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A string as it may be spelled in a TypeScript literal, in either quote style. */
function literalPattern(value: string): string {
  const single = escapeRegExp(value.replace(/\\/g, "\\\\").replace(/'/g, "\\'"));
  const double = escapeRegExp(JSON.stringify(value).slice(1, -1));
  return `(?:'${single}'|"${double}")`;
}

export const UNIT_EXPORT: Record<Band, string> = {
  beginner: "beginnerUnits",
  intermediate: "intermediateUnits",
  advanced: "advancedUnits",
};

export type UnitPlacement = {
  /** The band's unit array in `reading-order.ts`, e.g. `beginnerUnits`. */
  exportName: string;
  /** The new sidebar row. */
  item: { text: string; link: string };
  /** Link of the parent sitting (`/joins`); the row lands directly after it, in its unit. */
  parentLink?: string;
  /** Unit title; when given, the row lands at the end of that unit instead. */
  unit?: string;
};

/**
 * Add a sitting's sidebar row to a unit of a band's unit array.
 *
 * Default: directly after the parent sitting, in the parent's unit. With
 * `unit`, at the end of the unit of that title. A parent in another band has
 * no unit here, so that case needs `unit`.
 */
export function addSittingToUnit(source: string, placement: UnitPlacement): string {
  const { exportName, item, parentLink, unit } = placement;
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`missing ${marker}`);
  const assign = source.indexOf("=", start);
  const open = assign < 0 ? -1 : source.indexOf("[", assign);
  if (open < 0) throw new Error(`${exportName} is not an array`);
  const close = closingBracket(source, open, exportName);
  const body = source.slice(open, close);
  const literal = `{ text: ${JSON.stringify(item.text)}, link: ${JSON.stringify(item.link)} },`;

  if (new RegExp(`link:\\s*${literalPattern(item.link)}`).test(body)) {
    throw new Error(`${item.link} is already in ${exportName}`);
  }

  if (unit !== undefined) {
    const head = new RegExp(`text:\\s*${literalPattern(unit)}\\s*,\\s*items:\\s*\\[`).exec(body);
    if (!head) throw new Error(`no unit titled "${unit}" in ${exportName}`);
    const itemsOpen = open + head.index + head[0].length - 1;
    const itemsClose = closingBracket(source, itemsOpen, `unit "${unit}"`);
    const inner = source.slice(itemsOpen + 1, itemsClose);
    const lastLine = /(?:^|\n)([ \t]*)\S[^\n]*\s*$/.exec(inner);
    const closeLine = source.slice(source.lastIndexOf("\n", itemsClose) + 1, itemsClose);
    const closeIndent = /^[ \t]*/.exec(closeLine)![0];
    const indent = lastLine ? lastLine[1]! : `${closeIndent}  `;
    const kept = inner.replace(/\s*$/, "");
    const comma = kept.trim() === "" || kept.endsWith(",") ? "" : ",";
    return `${source.slice(0, itemsOpen + 1)}${kept}${comma}\n${indent}${literal}\n${closeIndent}${source.slice(itemsClose)}`;
  }

  if (!parentLink) throw new Error("addSittingToUnit needs a parent link or a unit title");
  const row = new RegExp(`(^|\\n)([ \\t]*)(\\{[^{}\\n]*link:\\s*${literalPattern(parentLink)}[^{}\\n]*\\})(,?)([^\\n]*)`).exec(body);
  if (!row) {
    throw new Error(
      `${parentLink} is not in ${exportName}, so the new sitting has no parent unit there; pass --unit "<title>"`,
    );
  }
  const rowStart = open + row.index;
  const rowEnd = rowStart + row[0].length;
  const parentRow = `${row[1]}${row[2]}${row[3]},${row[5]}`;
  return `${source.slice(0, rowStart)}${parentRow}\n${row[2]}${literal}${source.slice(rowEnd)}`;
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

// ── Page keys: links resolved by folder ──

/** The Claritish lessons' folder under docs/grammar/; with the cheat sheets' folder, the pages keyed by folder. Every other page keys by its flat filename. */
const LESSON_DIR = "claritish";
const SHEET_DIR = "cheat-sheets";
const KEYED_DIRS: ReadonlySet<string | undefined> = new Set([LESSON_DIR, SHEET_DIR]);

/**
 * The page key under docs/grammar/ of a file path or key: `claritish/feelings.md` for a Claritish
 * lesson, `cheat-sheets/roles.md` for a cheat sheet, the bare filename (`feelings.md`) for anything
 * else, stage pages included.
 */
export function pageKeyOf(file: string): string {
  const parts = file.split(/[/\\]/);
  const name = parts.pop() ?? "";
  const folder = parts.at(-1);
  const keyed = KEYED_DIRS.has(folder) && (parts.length === 1 || parts.at(-2) === "grammar");
  return keyed ? `${folder}/${name}` : name;
}

/**
 * The page key a link target means, read from `from` (the file it sits in, as a path or page key).
 * `target` is an href with or without `#id` (`feelings.md`, `../claritish/feelings.html#x`,
 * `/feelings`). A path whose last folder is `claritish` is the lesson, `cheat-sheets` the cheat sheet; a bare name is the lesson
 * inside `claritish/` and the stage page elsewhere; any other path is the stage page. An empty
 * href is `from`'s own page; an external URL is `undefined`.
 */
export function resolveLinkPage(from: string, target: string): string | undefined {
  const href = target.replace(/#.*$/, "");
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return undefined;
  const here = pageKeyOf(from);
  const path = href.replace(/^\.\//, "");
  const parts = path.split("/");
  const stem = (parts.pop() ?? "").replace(/\.(?:md|html)$/, "");
  if (!stem) return here || undefined;
  const dirs = parts.filter((part) => part !== "" && part !== ".");
  if (dirs.at(-1) === SHEET_DIR) return `${SHEET_DIR}/${stem}.md`;
  const lesson = dirs.length ? dirs.at(-1) === LESSON_DIR : !path.startsWith("/") && isLesson(here);
  return lesson ? `${LESSON_DIR}/${stem}.md` : `${stem}.md`;
}

function isLesson(key: string): boolean {
  return key.startsWith(`${LESSON_DIR}/`);
}

function lastFolder(dir: string): string | undefined {
  return dir.split("/").filter((part) => part !== "" && part !== ".").at(-1);
}

/** A key's filename as written in a link: the lesson folder dropped, a stage key as is. */
function leafOf(key: string): string {
  return isLesson(key) ? key.slice(LESSON_DIR.length + 1) : key;
}

/**
 * The folder part of an href once its page moves from `fromKey` to `toKey`; `here` is the key of the
 * file the link sits in (`""` for a bare ref). Unchanged when both keys share a folder.
 */
function retargetDir(dir: string, fromKey: string, toKey: string, here: string): string {
  if (isLesson(fromKey) === isLesson(toKey)) return dir;
  if (isLesson(toKey)) {
    return isLesson(here) && /^(?:\.\.?\/)?$/.test(dir) ? "" : `${dir}${LESSON_DIR}/`;
  }
  const out = dir.replace(new RegExp(`(?:^|(?<=/))${LESSON_DIR}/$`), "");
  return out === "" && isLesson(here) ? "../" : out;
}

function retargetHref(href: string, here: string, fromKey: string, toKey: string): string {
  if (href === "") {
    if (toKey === here) return "";
    return `${retargetDir("", here, toKey, here)}${leafOf(toKey)}`;
  }
  const dirEnd = href.lastIndexOf("/") + 1;
  const dir = retargetDir(href.slice(0, dirEnd), fromKey, toKey, here);
  const toPage = leafOf(toKey);
  const newStem = toPage.replace(/\.md$/, "");
  const leaf = href.slice(dirEnd);
  if (leaf === "") return href;
  if (leaf.endsWith(".html")) return `${dir}${newStem}.html`;
  if (leaf.endsWith(".md")) return `${dir}${toPage}`;
  return `${dir}${newStem}`;
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

const BAND_LABEL: Record<Band, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

/**
 * Add a **generate** row for a new sitting to the drill-generation allowlist
 * (docs/meta/procedures/drill-generation.md#allowlist): right after the parent's row when it sits in the
 * same table, else at the end of the table for the band (Beginner path, or the later table with
 * a Band column). The build fails on **generate** until the checkpoint is written or the row
 * is marked **skip** with a reason. Returns the markdown unchanged when the page has a row.
 */
export function addAllowlistRow(markdown: string, input: { page: string; parent: string; band: Band }): string {
  const lines = markdown.split("\n");
  if (lines.some((l) => l.startsWith("|") && l.includes(`\`${input.page}\``))) return markdown;
  const cellsOf = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim().toLowerCase());
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]!.startsWith("|")) continue;
    if (i > 0 && lines[i - 1]!.startsWith("|")) continue;
    const header = cellsOf(lines[i]!);
    if (!header.includes("file") || !header.includes("status")) continue;
    const hasBand = header.includes("band");
    if (hasBand !== (input.band !== "beginner")) continue;
    let end = i + 2;
    while (end < lines.length && lines[end]!.startsWith("|")) end += 1;
    let at = end;
    for (let j = i + 2; j < end; j++) {
      if (lines[j]!.includes(`\`${input.parent}\``)) at = j + 1;
    }
    const values: Record<string, string> = {
      path: "—",
      file: `\`${input.page}\``,
      band: BAND_LABEL[input.band],
      status: "**generate**",
      setting: "—",
    };
    const row = header.map((h) =>
      values[h] ?? (h.includes("notes") ? `Split off \`${input.parent}\`: fill in what to test, then write the checkpoint (or mark **skip** with a reason)` : "—"),
    );
    lines.splice(at, 0, `| ${row.join(" | ")} |`);
    return lines.join("\n");
  }
  throw new Error(`no allowlist table for ${input.band}`);
}
