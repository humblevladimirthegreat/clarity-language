/**
 * Compare intended cheat-sheet pages (`<PageBreak />` slices) to Chromium's PDF.
 * Docs: docs/proposals/cheat-sheet-print.md (pilot: consonants).
 */

export type Slice = {
  first: string;
  /** Leading blocks; Chromium's PDF may skip a floated control or the H1. */
  firsts: string[];
  last: string;
  heading: string;
  heightPx: number;
};

export type TableInfo = {
  firstRow: string;
  lastRow: string;
  heading: string;
  heightPx: number;
};

export type PdfPage = {
  text: string;
  leftoverPt: number;
};

export type SheetLayout = {
  id: string;
  slices: Slice[];
  tables: TableInfo[];
  pdfPages: PdfPage[];
  pageContentPx: number;
};

export type FindingKind = "unexpected-break" | "split-table" | "table-too-tall";

export type Finding = {
  kind: FindingKind;
  detail: string;
};

const PAGE_IN = 11;
const MARGIN_IN = 0.4;
export const PAGE_CONTENT_IN = PAGE_IN - 2 * MARGIN_IN;
export const PAGE_CONTENT_PX = PAGE_CONTENT_IN * 96;

/** Letters and digits only, for matching DOM innerText to PDF extraction. */
export function fingerprint(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function snippet(text: string, max = 60): string {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length <= max ? compact : `${compact.slice(0, max - 1)}…`;
}

function prefix(text: string, n = 32): string {
  const fp = fingerprint(text);
  return fp.slice(0, Math.min(n, fp.length));
}

/** True when `needle` is at the start of the PDF page, not merely somewhere on it. */
export function pageStartsWith(pageText: string, needle: string): boolean {
  const page = fingerprint(pageText);
  const key = prefix(needle, 32);
  if (key.length < 8 || page.length === 0) return false;
  const at = page.indexOf(key);
  if (at === -1) {
    const short = prefix(needle, 16);
    if (short.length < 8) return false;
    const at2 = page.indexOf(short);
    return at2 !== -1 && at2 <= Math.floor(page.length * 0.15);
  }
  return at <= Math.max(4, Math.floor(page.length * 0.12));
}

function hitsFor(pages: readonly string[], needle: string): number[] {
  const key = prefix(needle, 32);
  if (key.length < 8) return [];
  const hits: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (fingerprint(pages[i]!).includes(key)) hits.push(i);
  }
  if (hits.length > 0) return hits;
  const short = prefix(needle, 16);
  if (short.length < 8) return [];
  const shortHits: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (fingerprint(pages[i]!).includes(short)) shortHits.push(i);
  }
  return shortHits;
}

/** 0-based page index that contains `needle`, or null. Prefers a unique hit. */
export function pageIndexOf(pages: readonly string[], needle: string, prefer?: number | null): number | null {
  const hits = hitsFor(pages, needle);
  if (hits.length === 0) return null;
  if (hits.length === 1) return hits[0]!;
  if (prefer != null) {
    if (hits.includes(prefer)) return prefer;
    const before = hits.filter((h) => h <= prefer);
    if (before.length > 0) return before[before.length - 1]!;
  }
  return hits[0]!;
}

export function findingsFor(sheet: SheetLayout): Finding[] {
  const findings: Finding[] = [];
  const pages = sheet.pdfPages.map((p) => p.text);
  const intended = sheet.slices.length;

  if (intended === 0) {
    findings.push({ kind: "unexpected-break", detail: `${sheet.id}: no .vp-doc slices` });
    return findings;
  }

  if (pages.length > intended) {
    for (let i = intended; i < pages.length; i++) {
      findings.push({
        kind: "unexpected-break",
        detail: `${sheet.id}: PDF page ${i + 1} has no <PageBreak /> (starts with ${snippet(pages[i]!)})`,
      });
    }
  }

  for (let i = 0; i < intended; i++) {
    const slice = sheet.slices[i]!;
    const page = pages[i];
    if (page == null) {
      findings.push({
        kind: "unexpected-break",
        detail: `${sheet.id}: slice ${i + 1} (${slice.heading || snippet(slice.first)}) has no PDF page (PDF ${pages.length}, intended ${intended})`,
      });
      continue;
    }
    const starts = (slice.firsts.length ? slice.firsts : [slice.first]).some((text) => pageStartsWith(page, text));
    if (!starts) {
      findings.push({
        kind: "unexpected-break",
        detail: `${sheet.id}: PDF page ${i + 1} does not start with slice ${i + 1} «${snippet(slice.first)}»; page starts «${snippet(page)}»`,
      });
    }
    const lastOn = pageIndexOf(pages, slice.last);
    if (lastOn != null && lastOn !== i) {
      findings.push({
        kind: "unexpected-break",
        detail: `${sheet.id}: slice ${i + 1} (${slice.heading || snippet(slice.first)}) last text is on PDF page ${lastOn + 1}, not ${i + 1}`,
      });
    } else if (lastOn == null && prefix(slice.last, 16).length >= 8) {
      const onThis = fingerprint(page).includes(prefix(slice.last, 16));
      if (!onThis) {
        findings.push({
          kind: "unexpected-break",
          detail: `${sheet.id}: slice ${i + 1} last text not found on PDF page ${i + 1} («${snippet(slice.last)}»)`,
        });
      }
    }
  }

  const seenTable = new Set<string>();
  for (const table of sheet.tables) {
    const last = pageIndexOf(pages, table.lastRow);
    const first = pageIndexOf(pages, table.firstRow, last);
    if (first != null && last != null && first !== last) {
      const key = `${first}:${last}:${table.firstRow}`;
      if (seenTable.has(key)) continue;
      seenTable.add(key);
      const atTop = pages[first] != null && pageStartsWith(pages[first]!, table.firstRow);
      findings.push({
        kind: atTop ? "table-too-tall" : "split-table",
        detail: `${sheet.id}: table ${table.heading ? `«${table.heading}» ` : ""}first row on page ${first + 1}, last on ${last + 1} (${snippet(table.firstRow)})`,
      });
    } else if (table.heightPx > sheet.pageContentPx + 8) {
      const key = `tall:${table.firstRow}`;
      if (seenTable.has(key)) continue;
      seenTable.add(key);
      findings.push({
        kind: "table-too-tall",
        detail: `${sheet.id}: table ${table.heading ? `«${table.heading}» ` : ""}is ${Math.round(table.heightPx)}px, page content is ${Math.round(sheet.pageContentPx)}px (${snippet(table.firstRow)})`,
      });
    }
  }

  return findings;
}
