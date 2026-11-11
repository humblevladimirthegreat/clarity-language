/**
 * Section-level comparison of a grammar page against an earlier version of itself.
 *
 * A section is an H2 or H3 heading and its body up to the next H2 / H3 (H4+ stay inside).
 * Its id is the heading's `{#id}`, else the site slug (see grammar-anchors.ts). Text
 * before the first H2 / H3 is the page lead, id `(lead)`.
 *
 * - `changedSections`: which sections a later review must read (changed, new, moved,
 *   or the section right after one of those, since its lead may lean on it).
 * - `wordingProblems`: what a wording-only edit must keep: headings, anchors, fences,
 *   Practice, generated blocks, and per section the code spans, link targets, and
 *   morph-gloss lines.
 */
import { anchorTags, grammarHeadings } from "./grammar-anchors.js";
import { PRACTICE_H3_RE, isPracticeBoundary } from "./practice-sections.js";

export const LEAD_ID = "(lead)";

export type Section = {
  id: string;
  level: number;
  /** 0-based line of the heading (0 for the lead). */
  line: number;
  /** 0-based end line, exclusive. */
  end: number;
  lines: string[];
};

export type PageSections = { lead: Section; sections: Section[] };

function splitLines(markdown: string): string[] {
  const lines = markdown.split("\n");
  if (lines.length > 1 && lines.at(-1) === "") lines.pop();
  return lines;
}

/** The page lead and its H2 / H3 sections, in page order. */
export function pageSections(markdown: string): PageSections {
  const lines = splitLines(markdown);
  const heads = grammarHeadings(markdown).filter((h) => h.level === 2 || h.level === 3);
  const first = heads[0]?.line ?? lines.length;
  const lead: Section = { id: LEAD_ID, level: 0, line: 0, end: first, lines: lines.slice(0, first) };
  const sections = heads.map((h, i) => {
    const end = heads[i + 1]?.line ?? lines.length;
    return { id: h.id, level: h.level, line: h.line, end, lines: lines.slice(h.line, end) };
  });
  return { lead, sections };
}

function sectionText(section: Section): string {
  return section.lines.join("\n").replace(/\s+$/, "");
}

// ---------------------------------------------------------------------------
// changed-sections

export type ChangeReason = "changed" | "new" | "moved" | "context";

export type SectionChange = {
  id: string;
  /** 1-based heading line in the new page. */
  line: number;
  reason: ChangeReason;
  /** For `moved`: the page the id was on at the old revision. */
  from?: string;
};

/**
 * Sections of `newMd` to review against `oldMd` (null when the page is new).
 * `elsewhere(id)` names another page that had the id at the old revision, if any.
 * The lead is listed (id `(lead)`) when its text changed, but never as context.
 */
export function changedSections(
  oldMd: string | null,
  newMd: string,
  elsewhere: (id: string) => string | undefined = () => undefined,
): SectionChange[] {
  const now = pageSections(newMd);
  const before = oldMd == null ? null : pageSections(oldMd);
  const oldById = new Map<string, Section>();
  const oldPrev = new Map<string, string>();
  if (before) {
    before.sections.forEach((s, i) => {
      oldById.set(s.id, s);
      oldPrev.set(s.id, i === 0 ? LEAD_ID : before.sections[i - 1]!.id);
    });
  }
  const out: SectionChange[] = [];
  const leadChanged = before == null || sectionText(before.lead) !== sectionText(now.lead);
  if (leadChanged && now.lead.lines.some((l) => l.trim())) {
    out.push({ id: LEAD_ID, line: 1, reason: "changed" });
  }
  let prevId = LEAD_ID;
  let prevTouched = leadChanged;
  for (const s of now.sections) {
    const old = oldById.get(s.id);
    let change: SectionChange | null = null;
    if (!old) {
      const from = elsewhere(s.id);
      change = from ? { id: s.id, line: s.line + 1, reason: "moved", from } : { id: s.id, line: s.line + 1, reason: "new" };
    } else if (sectionText(old) !== sectionText(s)) {
      change = { id: s.id, line: s.line + 1, reason: "changed" };
    } else if (prevTouched || oldPrev.get(s.id) !== prevId) {
      change = { id: s.id, line: s.line + 1, reason: "context" };
    }
    if (change) out.push(change);
    prevTouched = change != null && change.reason !== "context";
    prevId = s.id;
  }
  return out;
}

export function formatChange(page: string, change: SectionChange): string {
  const reason = change.reason === "moved" ? `moved from ${change.from}` : change.reason;
  return `${page}:${change.line} ${change.id} ${reason}`;
}

// ---------------------------------------------------------------------------
// wording-only

export type WordingProblem = { line: number; message: string };

/** Longest-common-subsequence diff of two lists: indexes only in `a`, only in `b`. */
export function listDiff<T>(a: readonly T[], b: readonly T[]): { removed: number[]; added: number[] } {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const removed: number[] = [];
  const added: number[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) removed.push(i++);
    else added.push(j++);
  }
  while (i < n) removed.push(i++);
  while (j < m) added.push(j++);
  return { removed, added };
}

type Item = { text: string; line: number };

function fenceMask(lines: readonly string[]): boolean[] {
  let inFence = false;
  return lines.map((l) => {
    if (/^\s*```/.test(l)) {
      inFence = !inFence;
      return true;
    }
    return inFence;
  });
}

function headingItems(markdown: string): Item[] {
  const lines = splitLines(markdown);
  return grammarHeadings(markdown).map((h) => ({ text: lines[h.line]!.trimEnd(), line: h.line }));
}

function lineAt(markdown: string, offset: number): number {
  let line = 0;
  for (let i = 0; i < offset && i < markdown.length; i++) if (markdown[i] === "\n") line++;
  return line;
}

function anchorItems(markdown: string): Item[] {
  const items: (Item & { offset: number })[] = [];
  for (const h of grammarHeadings(markdown)) {
    if (h.custom) items.push({ text: h.id, line: h.line, offset: h.offset });
  }
  for (const a of anchorTags(markdown)) items.push({ text: a.id, line: lineAt(markdown, a.offset), offset: a.offset });
  return items.sort((x, y) => x.offset - y.offset);
}

function fenceItems(lines: readonly string[]): Item[] {
  const out: Item[] = [];
  let start = -1;
  lines.forEach((l, i) => {
    if (!/^\s*```/.test(l)) return;
    if (start < 0) start = i;
    else {
      out.push({ text: lines.slice(start, i + 1).join("\n"), line: start });
      start = -1;
    }
  });
  if (start >= 0) out.push({ text: lines.slice(start).join("\n"), line: start });
  return out;
}

function practiceItems(lines: readonly string[]): Item[] {
  const out: Item[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!PRACTICE_H3_RE.test(lines[i]!)) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (isPracticeBoundary(lines[j]!)) {
        end = j;
        break;
      }
    }
    out.push({ text: lines.slice(i, end).join("\n").replace(/\s+$/, ""), line: i });
  }
  return out;
}

const GENERATED_OPEN = /^<!--\s*generated\b/;
const GENERATED_CLOSE = /^<!--\s*\/generated\s*-->/;

function generatedItems(lines: readonly string[]): Item[] {
  const out: Item[] = [];
  let start = -1;
  lines.forEach((l, i) => {
    if (start < 0 && GENERATED_OPEN.test(l.trim())) start = i;
    else if (start >= 0 && GENERATED_CLOSE.test(l.trim())) {
      out.push({ text: lines.slice(start, i + 1).join("\n"), line: start });
      start = -1;
    }
  });
  if (start >= 0) out.push({ text: lines.slice(start).join("\n"), line: start });
  return out;
}

/** Inline code spans outside fences (CommonMark backtick runs), and the text with them blanked out. */
export function codeSpans(lines: readonly string[], firstLine = 0): { spans: Item[]; prose: string } {
  const mask = fenceMask(lines);
  const spans: Item[] = [];
  const prose: string[] = [];
  lines.forEach((raw, i) => {
    if (mask[i]) {
      prose.push("");
      return;
    }
    let rest = "";
    let k = 0;
    while (k < raw.length) {
      if (raw[k] === "\\" && raw[k + 1] === "`") {
        rest += "\\`";
        k += 2;
        continue;
      }
      if (raw[k] !== "`") {
        rest += raw[k];
        k++;
        continue;
      }
      let run = 0;
      while (raw[k + run] === "`") run++;
      const ticks = "`".repeat(run);
      let close = -1;
      for (let p = raw.indexOf(ticks, k + run); p >= 0; p = raw.indexOf(ticks, p + 1)) {
        if (raw[p - 1] !== "`" && raw[p + run] !== "`") {
          close = p;
          break;
        }
      }
      if (close < 0) {
        rest += ticks;
        k += run;
        continue;
      }
      let content = raw.slice(k + run, close);
      if (/^ .* $/.test(content) && content.trim()) content = content.slice(1, -1);
      spans.push({ text: content, line: firstLine + i });
      rest += " ";
      k = close + run;
    }
    prose.push(rest);
  });
  return { spans, prose: prose.join("\n") };
}

/** Inline link targets `[text](target)` outside code. */
export function linkTargets(prose: string): string[] {
  return [...prose.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map((m) => m[1]!);
}

// Morph-gloss lines (`z-dog | v-walk`) sit in blockquotes and table cells outside backticks.
const ROLE_PREFIX = /(?:^|[\s[])(?:th|[zdbvgwhxy])l?-\S/;
const MORPH_PART = /^["[\]A-Za-z0-9…/'’._#+∞≤≥≠@{}^,←<>!?%&;-]+$/;

/** A line or cell shaped like a morph gloss: role-prefixed tokens split by ` | `, ` · `, ` . `. */
export function isMorphGloss(text: string): boolean {
  const t = text.trim();
  if (!t || t.startsWith("`") || t.startsWith('"') || !ROLE_PREFIX.test(t)) return false;
  const parts = t.split(/\s+(?:\||·|;|[.?!])\s+|\s+[?!.]$/).filter(Boolean);
  return parts.length > 0 && parts.every((p) => MORPH_PART.test(p));
}

function morphItems(lines: readonly string[], firstLine: number): Item[] {
  const mask = fenceMask(lines);
  const out: Item[] = [];
  lines.forEach((raw, i) => {
    if (mask[i]) return;
    const quoted = /^\s*>\s?(.*)$/.exec(raw);
    if (quoted && isMorphGloss(quoted[1]!)) {
      out.push({ text: quoted[1]!.trim(), line: firstLine + i });
      return;
    }
    if (/^\s*\|/.test(raw)) {
      for (const cell of raw.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|(?=(?:[^`]*`[^`]*`)*[^`]*$)/)) {
        if (isMorphGloss(cell)) out.push({ text: cell.trim(), line: firstLine + i });
      }
    }
  });
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `form` appears in `prose` not glued to a letter or digit on either side. */
function appearsBare(form: string, prose: string): boolean {
  if (!form.trim()) return false;
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(form)}(?![\\p{L}\\p{N}])`, "u").test(prose);
}

function short(text: string): string {
  const one = text.replace(/\s*\n\s*/g, " ⏎ ");
  return one.length > 70 ? `${one.slice(0, 67)}…` : one;
}

function compareOrdered(kind: string, oldItems: Item[], newItems: Item[], problems: WordingProblem[], newEnd: number): void {
  const { removed, added } = listDiff(
    oldItems.map((x) => x.text),
    newItems.map((x) => x.text),
  );
  for (const j of added) problems.push({ line: newItems[j]!.line, message: `${kind} added or changed: ${short(newItems[j]!.text)}` });
  for (const i of removed) {
    const near = newItems.find((x) => x.line >= oldItems[i]!.line)?.line ?? newEnd;
    problems.push({ line: near, message: `${kind} removed or changed (was line ${oldItems[i]!.line + 1}): ${short(oldItems[i]!.text)}` });
  }
}

/**
 * Differences a wording-only edit must not make. Lines are 0-based in the new page.
 * Sections are matched by id; a section missing on one side shows up as a heading change only.
 */
export function wordingProblems(oldMd: string, newMd: string): WordingProblem[] {
  const oldLines = splitLines(oldMd);
  const newLines = splitLines(newMd);
  const problems: WordingProblem[] = [];
  const end = Math.max(0, newLines.length - 1);
  compareOrdered("heading", headingItems(oldMd), headingItems(newMd), problems, end);
  compareOrdered("anchor id", anchorItems(oldMd), anchorItems(newMd), problems, end);
  compareOrdered("code fence", fenceItems(oldLines), fenceItems(newLines), problems, end);
  compareOrdered("Practice section", practiceItems(oldLines), practiceItems(newLines), problems, end);
  compareOrdered("generated block", generatedItems(oldLines), generatedItems(newLines), problems, end);

  const before = pageSections(oldMd);
  const now = pageSections(newMd);
  const oldById = new Map([before.lead, ...before.sections].map((s) => [s.id, s]));
  for (const s of [now.lead, ...now.sections]) {
    const old = oldById.get(s.id);
    if (!old) continue;
    const label = s.id === LEAD_ID ? "page lead" : `#${s.id}`;
    const o = codeSpans(old.lines, old.line);
    const n = codeSpans(s.lines, s.line);
    const newForms = new Set(n.spans.map((x) => x.text));
    const oldForms = new Set(o.spans.map((x) => x.text));
    for (const form of oldForms) {
      if (!newForms.has(form)) problems.push({ line: s.line, message: `${label}: code span \`${form}\` removed` });
    }
    const reported = new Set<string>();
    for (const span of n.spans) {
      if (oldForms.has(span.text) || reported.has(span.text)) continue;
      reported.add(span.text);
      if (!appearsBare(span.text, o.prose)) {
        problems.push({ line: span.line, message: `${label}: code span \`${span.text}\` added (a new form)` });
      }
    }
    const oldLinks = new Set(linkTargets(o.prose));
    const newLinks = new Set(linkTargets(n.prose));
    for (const t of oldLinks) if (!newLinks.has(t)) problems.push({ line: s.line, message: `${label}: link to ${t} removed` });
    for (const t of newLinks) if (!oldLinks.has(t)) problems.push({ line: s.line, message: `${label}: link to ${t} added` });
    const oldMorph = morphItems(old.lines, old.line);
    const newMorph = morphItems(s.lines, s.line);
    const oldGloss = new Set(oldMorph.map((x) => x.text));
    const newGloss = new Set(newMorph.map((x) => x.text));
    for (const g of oldGloss) if (!newGloss.has(g)) problems.push({ line: s.line, message: `${label}: morph gloss removed or changed: ${short(g)}` });
    for (const m of newMorph) {
      if (!oldGloss.has(m.text)) problems.push({ line: m.line, message: `${label}: morph gloss added or changed: ${short(m.text)}` });
    }
  }
  return problems.sort((a, b) => a.line - b.line);
}

export const WORDING_FIX =
  "fix: a wording-only edit keeps headings, anchors, fences, Practice, generated blocks, and each section's code spans, link targets and morph glosses; restore them (see docs/meta/doc-style.md)";
