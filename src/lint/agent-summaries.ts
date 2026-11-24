/**
 * Agent summaries (docs/meta/grammar-docs.md#agent-summaries): one `<!-- Agent summary: … -->` comment on the line
 * directly under a heading (after any `<a id>` lines), at most one per heading, never under Practice, See also,
 * Gap, Examples or a read-by block. On stage pages, recipe pages and Claritish lessons, every teaching heading
 * has one once the page has any (or always, for a page kind in {@link COVERAGE_REQUIRED}).
 */
import { grammarHeadings, type Heading } from "./grammar-anchors.js";
import { isLessonPage } from "../page-contracts.js";

export const AGENT_SUMMARIES_ANCHOR = "docs/meta/grammar-docs.md#agent-summaries";

/** Page kinds whose teaching headings need summaries. */
export type SummaryPageKind = "stage" | "recipe" | "lesson";

/**
 * Page kinds held to full coverage even when the page has no summary yet. A page of another of these kinds that has
 * any summary is held to full coverage too.
 */
export const COVERAGE_REQUIRED: ReadonlySet<SummaryPageKind> = new Set<SummaryPageKind>([]);

/** A well-formed summary line: the whole comment on one line. */
const SUMMARY_RE = /^<!-- Agent summary: (.*\S)\s*-->\s*$/;
/** Anything that looks like a summary, well formed or not. */
const SUMMARY_LIKE_RE = /<!--\s*agent[\s-]*summary/i;
const ANCHOR_LINE_RE = /^<a id="[^"]*"><\/a>\s*$/;
/** Headings that never get a summary, nor do the headings under them. */
const NO_SUMMARY_TITLES = new Set(["practice", "see also", "gap", "the gap", "examples"]);

/** Page kind for a path under docs/grammar/ (`beginner/clause.md`, `say-tense.md`, `claritish/could-be.md`). */
export function summaryPageKind(key: string): SummaryPageKind | undefined {
  if (/^(?:beginner|intermediate|advanced)\/[^/]+\.md$/.test(key)) return "stage";
  if (key === "english.md" || /^say-[^/]+\.md$/.test(key)) return "recipe";
  if (isLessonPage(key)) return "lesson";
  return undefined;
}

export type HeadingSummary = { heading: Heading; /** 0-based line of the summary, when it has one. */ line?: number; text?: string };

/** Each heading with the summary directly under it, if any. */
export function headingSummaries(markdown: string): HeadingSummary[] {
  const lines = markdown.split("\n");
  return grammarHeadings(markdown).map((heading) => {
    let i = heading.line + 1;
    while (i < lines.length && (lines[i]!.trim() === "" || ANCHOR_LINE_RE.test(lines[i]!.trim()))) i++;
    const match = i < lines.length ? SUMMARY_RE.exec(lines[i]!.trim()) : null;
    return match ? { heading, line: i, text: match[1]!.trim() } : { heading };
  });
}

/** Whether a heading is Practice, See also, Gap or Examples, or sits under one. */
function noSummaryHeadings(headings: Heading[]): Set<Heading> {
  const out = new Set<Heading>();
  let blockedAt: number | undefined;
  for (const h of headings) {
    if (blockedAt !== undefined && h.level <= blockedAt) blockedAt = undefined;
    if (blockedAt === undefined && NO_SUMMARY_TITLES.has(h.title.toLowerCase())) blockedAt = h.level;
    if (blockedAt !== undefined) out.add(h);
  }
  return out;
}

/** The headings that teach, per page kind (docs/meta/grammar-docs.md#agent-summaries). */
export function teachingHeadings(kind: SummaryPageKind, headings: Heading[]): Heading[] {
  const blocked = noSummaryHeadings(headings);
  const open = headings.filter((h) => !blocked.has(h));
  switch (kind) {
    case "stage":
      return open.filter((h) => h.level === 3);
    case "lesson":
      return open.filter((h) => h.level === 2);
    case "recipe":
      // A recipe is an H3 under its English-area H2; an H2 with no H3 under it is a recipe by itself.
      return open.filter((h) => {
        if (h.level === 3) return true;
        if (h.level !== 2) return false;
        const i = headings.indexOf(h);
        const next = headings.slice(i + 1).find((n) => n.level <= 3);
        return !next || next.level !== 3;
      });
  }
}

export type SummaryFinding = { /** 0-based line. */ line: number; kind: "format" | "placement" | "coverage"; detail: string };

/** Findings for one page; `key` is its path under docs/grammar/ (or any path, for format checks only). */
export function lintAgentSummaries(key: string, markdown: string, required: ReadonlySet<SummaryPageKind> = COVERAGE_REQUIRED): SummaryFinding[] {
  const findings: SummaryFinding[] = [];
  const lines = markdown.split("\n");
  const attached = headingSummaries(markdown);
  const placed = new Set(attached.flatMap((a) => (a.line === undefined ? [] : [a.line])));
  const blocked = noSummaryHeadings(attached.map((a) => a.heading));

  let inFence = false;
  lines.forEach((text, line) => {
    if (/^\s*```/.test(text)) inFence = !inFence;
    if (inFence || !SUMMARY_LIKE_RE.test(text)) return;
    if (!SUMMARY_RE.test(text.trim())) {
      findings.push({ line, kind: "format", detail: "write it as one line: `<!-- Agent summary: … -->`" });
    } else if (!placed.has(line)) {
      findings.push({
        line,
        kind: "placement",
        detail: "not on the line directly under a heading (or its <a id> line); a heading gets at most one summary, and the space before the H1 gets none",
      });
    }
  });
  for (const a of attached) {
    if (a.line !== undefined && blocked.has(a.heading)) {
      findings.push({ line: a.line, kind: "placement", detail: `"${a.heading.title}" gets no summary (Practice, See also, Gap and Examples, and the headings under them)` });
    }
  }

  const kind = summaryPageKind(key);
  if (kind && (required.has(kind) || placed.size > 0)) {
    const has = new Set(attached.filter((a) => a.line !== undefined).map((a) => a.heading));
    for (const h of teachingHeadings(kind, attached.map((a) => a.heading))) {
      if (!has.has(h)) {
        findings.push({ line: h.line, kind: "coverage", detail: `${"#".repeat(h.level)} ${h.title}: a teaching heading on a ${kind} page with no summary under it` });
      }
    }
  }
  return findings.sort((a, b) => a.line - b.line);
}

/**
 * The page with everything blanked except the bodies of its agent summaries, so offsets and line numbers still
 * match: the Ageben span checks run on it, since they skip HTML comments.
 */
export function summaryBodiesOnly(markdown: string): string {
  const lines = markdown.split("\n");
  const keep = new Set(headingSummaries(markdown).flatMap((a) => (a.line === undefined ? [] : [a.line])));
  return lines
    .map((text, i) => {
      if (!keep.has(i)) return " ".repeat(text.length);
      const start = text.indexOf("Agent summary:") + "Agent summary:".length;
      const end = text.lastIndexOf("-->");
      return " ".repeat(start) + text.slice(start, end) + " ".repeat(text.length - end);
    })
    .join("\n");
}
