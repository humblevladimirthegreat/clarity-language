/**
 * terminology.md staleness checks (docs/meta/grammar-docs.md): the SMALLCAPS label table
 * matches the labels morph lines print, each label's example shows it, every Agazan form on
 * the page appears on the page it links to, and every link anchor resolves.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { MORPH_GLOSS_LABELS, morphGlossLine } from "../parse/morph-gloss.js";
import { isAgazanRootShape } from "../root-shape.js";
import { classifyAgazanSpan, decodeEntities, walkAgazanSpans } from "./agazan-docs.js";
import { grammarHeadings } from "./grammar-anchors.js";
import { anchorLinks, pageSections } from "./learning-order.js";

export const TERMINOLOGY_PAGE = "terminology.md";

export type TerminologyFinding = { index: number; detail: string };

const LABEL_RE = /^[A-Z]{2,}(?:-[A-Z]+)*/;

/** Every SMALLCAPS label a morph line can print: the glosser's own tables plus overlay gloss heads. */
export function glossLabels(overlays: Iterable<{ gloss: string }>): Set<string> {
  const out = new Set(MORPH_GLOSS_LABELS);
  for (const row of overlays) {
    const head = LABEL_RE.exec(row.gloss)?.[0];
    if (head) out.add(head);
  }
  return out;
}

function hasLabel(gloss: string, label: string): boolean {
  return new RegExp(`(?<![A-Za-z])${label}(?![A-Za-z])`).test(gloss);
}

/** Links to sibling grammar pages, with or without an anchor (`[Joins](joins.md)`). */
function pageLinks(markdown: string): { index: number; page: string }[] {
  const blanked = markdown.replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
  return [...blanked.matchAll(/\]\(([a-z][a-z0-9-]*\.md)(?:#[^)\s]*)?\)/g)].map((m) => ({ index: m.index!, page: m[1]! }));
}

type Entry = { index: number; end: number; pages: Set<string> };

/** Label-table rows and A–Z sections, each with the pages it links to. */
function entries(markdown: string): Entry[] {
  const out: Entry[] = [];
  let offset = 0;
  for (const line of markdown.split("\n")) {
    if (/^\|\s*\*\*[A-Z]/.test(line)) out.push({ index: offset, end: offset + line.length, pages: new Set() });
    offset += line.length + 1;
  }
  const headings = grammarHeadings(markdown);
  headings.forEach((h, k) => {
    if (h.level !== 3) return;
    const end = headings[k + 1]?.offset ?? markdown.length;
    out.push({ index: h.offset, end, pages: new Set() });
  });
  for (const link of pageLinks(markdown)) {
    for (const e of out) if (link.index >= e.index && link.index < e.end) e.pages.add(link.page);
  }
  // A same-page link (`[as-for](#as-for)`) borrows the pages that entry links.
  const own = pageSections(TERMINOLOGY_PAGE, markdown);
  const blanked = markdown.replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
  const borrowed: [Entry, Set<string>][] = [];
  for (const m of blanked.matchAll(/\]\(#([^)\s]+)\)/g)) {
    const section = own.anchors.get(m[1]!);
    const target = section && out.find((e) => e.index === section.offset);
    if (!target) continue;
    for (const e of out) if (m.index! >= e.index && m.index! < e.end) borrowed.push([e, target.pages]);
  }
  for (const [e, pages] of borrowed) for (const p of pages) e.pages.add(p);
  // Rows sit inside a section; a form in a row answers to the row's links, not the section's.
  return out.sort((a, b) => b.index - a.index);
}

function entryAt(list: Entry[], index: number): Entry | undefined {
  return list.find((e) => index >= e.index && index < e.end);
}

type LabelRow = { label: string; example: string; page: string; index: number };

function labelRows(markdown: string): LabelRow[] {
  const out: LabelRow[] = [];
  let offset = 0;
  for (const line of markdown.split("\n")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    const label = /^\*\*([A-Z][A-Z-]*)\*\*$/.exec(cells[0] ?? "")?.[1];
    if (label && cells.length === 4) {
      out.push({
        label,
        example: /^`([^`]+)`$/.exec(cells[2]!)?.[1] ?? /^(<code>[^<]+<\/code>)$/.exec(cells[2]!)?.[1] ?? "",
        page: pageLinks(cells[3]!)[0]?.page ?? "",
        index: offset,
      });
    }
    offset += line.length + 1;
  }
  return out;
}

/**
 * `pages` maps each grammar page (`clause.md`) to its markdown. `labels` is {@link glossLabels}.
 */
export function lintTerminology(
  markdown: string,
  pages: ReadonlyMap<string, string>,
  tables: ClassifyTables,
  labels: ReadonlySet<string>,
  /** Sidebar name per page (`roles.md` → `Role compounds`); teach links must use it. */
  names: ReadonlyMap<string, string> = new Map(),
): TerminologyFinding[] {
  const findings: TerminologyFinding[] = [];
  const text = (page: string) => pages.get(page) ?? "";

  const rows = labelRows(markdown);
  const listed = new Set(rows.map((r) => r.label));
  for (const label of [...labels].sort()) {
    if (!listed.has(label)) findings.push({ index: 0, detail: `morph lines print ${label}; add a row to the label table` });
  }
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.label)) findings.push({ index: row.index, detail: `${row.label} is listed twice` });
    seen.add(row.label);
    const teach = text(row.page);
    if (!row.page || !teach) {
      findings.push({ index: row.index, detail: `${row.label}: the Teach cell must link a grammar page` });
      continue;
    }
    if (!row.example) {
      findings.push({ index: row.index, detail: `${row.label}: the Example cell must be one Agazan code span` });
      continue;
    }
    if (!teach.includes(row.example)) {
      findings.push({ index: row.index, detail: `${row.label}: example \`${row.example}\` does not appear on ${row.page}` });
    }
    if (labels.has(row.label)) {
      let gloss = "";
      try {
        gloss = morphGlossLine(decodeEntities(row.example.replace(/<\/?code>/g, "")), tables);
      } catch (err) {
        findings.push({ index: row.index, detail: `${row.label}: example \`${row.example}\` does not parse (${(err as Error).message.split("\n")[0]})` });
        continue;
      }
      if (!hasLabel(gloss, row.label)) {
        findings.push({ index: row.index, detail: `${row.label}: example \`${row.example}\` glosses as ${gloss}, without ${row.label}` });
      }
    } else if (!new RegExp(`\\b${row.label}\\b`).test(teach.replace(/\|.*\|/g, ""))) {
      findings.push({
        index: row.index,
        detail: `${row.label}: no morph line prints it and ${row.page} prose does not use it; drop the row`,
      });
    }
  }

  const list = entries(markdown);
  const rowLines = new Set(rows.map((r) => r.index));
  walkAgazanSpans(markdown, {
    text: (span, index) => {
      const trimmed = span.trim();
      const entry = entryAt(list, index);
      if (entry && rowLines.has(entry.index)) return; // label rows: checked above
      const pagesLinked = entry ? [...entry.pages] : [];
      if (/^[a-z]{3,}$/.test(trimmed) && isAgazanRootShape(trimmed)) {
        // A bare root is current only if a page it links cites that root too.
        if (pagesLinked.some((p) => text(p).includes(`\`${trimmed}\``))) return;
        findings.push({
          index,
          detail: `bare root \`${trimmed}\` is not cited on ${pagesLinked.join(" or ") || "a linked page"}; write the form the lesson uses`,
        });
        return;
      }
      const cls = classifyAgazanSpan(trimmed);
      if (cls !== "word" && cls !== "phrase" && cls !== "sentence") return;
      if (!entry || entry.pages.size === 0) return;
      const escaped = trimmed.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      if ([...entry.pages].some((p) => text(p).includes(trimmed) || text(p).includes(escaped))) return;
      findings.push({ index, detail: `\`${trimmed}\` does not appear on ${[...entry.pages].join(" or ")}` });
    },
  });

  // Bold SMALLCAPS in entries: a listed label, or a term the linked page itself uses.
  for (const m of markdown.matchAll(/\*\*([A-Z][A-Z-]*[A-Z])\*\*/g)) {
    const label = m[1]!;
    if (listed.has(label)) continue;
    const entry = entryAt(list, m.index!);
    if (entry && [...entry.pages].some((p) => new RegExp(`(?<![A-Za-z])${label}(?![A-Za-z])`).test(text(p)))) continue;
    findings.push({ index: m.index!, detail: `**${label}** is not a label-table row and its linked page does not use it` });
  }

  // Teach lines and cells (nothing but links) name each page as the sidebar does.
  let lineStart = 0;
  for (const line of markdown.split("\n")) {
    const cells = line.startsWith("|") ? line.split("|").slice(1, -1) : [line];
    let cellStart = lineStart + (line.startsWith("|") ? 1 : 0);
    for (const cell of cells) {
      const links = [...cell.matchAll(/\[([^\]]+)\]\(([a-z][a-z0-9-]*\.md)(?:#[^)\s]*)?\)/g)];
      const rest = cell.replace(/\[[^\]]+\]\([^)]*\)/g, "").replace(/[\s,·]/g, "");
      if (links.length > 0 && rest === "") {
        const named = new Set<string>();
        for (const m of links) {
          // A second link to the same page names a section of it.
          if (named.has(m[2]!)) continue;
          named.add(m[2]!);
          const name = names.get(m[2]!);
          if (name && m[1]!.toLowerCase() !== name.toLowerCase()) {
            findings.push({ index: cellStart + m.index!, detail: `link text "${m[1]}" should name ${m[2]} as the sidebar does: "${name}"` });
          }
        }
      }
      cellStart += cell.length + 1;
    }
    lineStart += line.length + 1;
  }

  for (const link of pageLinks(markdown)) {
    if (!text(link.page)) findings.push({ index: link.index, detail: `link to missing page ${link.page}` });
  }
  for (const link of anchorLinks(TERMINOLOGY_PAGE, markdown)) {
    const target = text(link.page);
    if (!target) continue;
    if (!pageSections(link.page, target).anchors.has(link.anchor)) {
      findings.push({ index: link.index, detail: `${link.page}#${link.anchor} is not an anchor on that page` });
    }
  }
  return findings.sort((a, b) => a.index - b.index);
}
