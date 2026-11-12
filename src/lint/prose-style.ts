/**
 * Wording checks for learner-facing grammar pages (docs/meta/doc-style.md#what-the-build-checks).
 *
 * Errors are exact rules and fail the build. Warnings are heuristics: the build prints one count
 * per rule, and `npm run lint:prose -- --report` lists every one. A page's warning count per rule
 * may not rise above its entry in `prose-style-baseline.json` (the ratchet).
 */
import { pageBand } from "./learning-order.js";

export type ProseRule =
  | "link-filename"
  | "throat-clearing"
  | "empty-warmth"
  | "exclamation"
  | "cue-first"
  | "editor-path"
  | "legacy-name"
  | "jargon"
  | "long-paragraph"
  | "bold-density"
  | "beginner-lead"
  | "voice";

export type ProseIssue = {
  rule: ProseRule;
  severity: "error" | "warning";
  /** 1-based line in the page. */
  line: number;
  message: string;
};

/** What each rule asks for, shown once under its issues. */
export const RULE_FIX: Record<ProseRule, string> = {
  "link-filename": "link text is the page or section title, or the job in plain words, never a filename",
  "throat-clearing": "cut the phrase; a sentence adds mechanism or consequence",
  "empty-warmth": "cut the phrase; reassurance must change what the learner does or expects",
  exclamation: "no exclamation marks in teaching prose (examples and translations may have them)",
  "cue-first": "state the rule first; the cue follows it or goes in the Cue column",
  "editor-path": "grammar pages never mention docs/meta/ or docs/proposals/",
  "legacy-name": "the language is Ageben",
  jargon: "say it in everyday English, or gloss the term in the same sentence",
  "long-paragraph": "split a paragraph of more than five sentences, or move part of it into a table",
  "bold-density": "bold sparingly: more than four bold phrases in one paragraph",
  "beginner-lead": "a Beginner lead takes two to four short sentences before the first example",
  voice:
    "address the learner as you; no maintainer we, and author I only in Acknowledgments and the purpose page's Criticisms",
};

/** Maintainer *we*. Capitalized `US` (the country) is not matched. */
const MAINTAINER_WE = /\b(?:[Ww]e(?:(?:'|’)(?:re|ve|ll|d))?|[Uu]s|[Oo]urs?|[Oo]urselves)\b/;

/** Author *I*: a capital `I` standing alone (not before a period, as in an initial or a numeral list). */
const AUTHOR_I = /(?<![\w.'’-])I(?:(?:'|’)(?:m|ve|ll|d))?(?![\w.'’-])|\b(?:[Mm]e|[Mm]y|[Mm]ine|[Mm]yself)\b/;

/** Signed sections where author *I* is allowed: page → H2 heading text. */
export const AUTHOR_I_SECTIONS: Record<string, readonly string[]> = {
  "introduction.md": ["Acknowledgments"],
  "purpose.md": ["Criticisms"],
};

export const SENTENCE_CEILING = 5;
export const BOLD_CEILING = 4;

const THROAT_CLEARING: RegExp[] = [
  /\bin this section\b/i,
  /\bon this page,? we\b/i,
  /\bit is (?:important|worth) (?:to note|noting)\b/i,
  /\bit(?:'|’)s (?:important|worth) (?:to note|noting)\b/i,
  /\bwe now\b/i,
  /\bas (?:mentioned|noted) (?:above|earlier|before)\b/i,
  /\bkeep in mind that\b/i,
  /(?:^|[.:]\s+)Note that\b/,
];

const EMPTY_WARMTH: RegExp[] = [
  /\bdon(?:'|’)t worry\b/i,
  /\bno worries\b/i,
  /\b(?:it|this)(?:(?:'|’)s| is) (?:really |very |quite )?easy(?=\s*[.,;:!)]|\s*$)/i,
  /\bgreat job\b/i,
  /\bwell done\b/i,
  /\bcongratulations\b/i,
];

/** Specialist terms doc-style names; a page that glosses one lists it in {@link JARGON_ALLOWED}. */
const JARGON =
  /\b(assertoric|illocution\w*|matrix(?:-final)?|predicative|prosod(?:y|ic)|paradigm\w*|adjuncts?|complement clauses?|morphosynta\w+|right-bound|left-edge|utterances?|deixis|deictic)\b/i;

/** Pages that may use a listed term: the page glosses it where it first appears. */
export const JARGON_ALLOWED: Record<string, readonly string[]> = {};

/** The glossary defines these terms, so the jargon rule skips it. */
const JARGON_EXEMPT = new Set(["terminology.md"]);

const FILENAME_LINK = /\[`?[\w./-]+\.md(?:#[\w-]+)?`?\]\(/;

const FRONT_MATTER_RE = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;

type LineKind = "blank" | "heading" | "table" | "list" | "quote" | "html" | "container" | "prose" | "skip";

function lineKind(line: string): LineKind {
  const text = line.trim();
  if (!text) return "blank";
  if (/^#{1,6}\s/.test(text)) return "heading";
  if (text.startsWith("|")) return "table";
  if (/^(?:[-*+]|\d+\.)\s/.test(text)) return "list";
  if (text.startsWith(">")) return "quote";
  if (text.startsWith(":::")) return "container";
  if (text.startsWith("<")) return "html";
  return "prose";
}

/** Blank out fenced code, HTML comments and front matter, keeping every line in place. */
function blankNonProse(markdown: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, " ");
  return markdown
    .replace(FRONT_MATTER_RE, blank)
    .replace(/^[ \t]*```[\s\S]*?^[ \t]*```[ \t]*$/gm, blank)
    .replace(/<!--[\s\S]*?-->/g, blank);
}

/** The words a learner reads: no code spans, link targets, heading ids or HTML tags. */
function readingText(line: string): string {
  return line
    .replace(/`[^`\n]*`/g, " ")
    .replace(/\]\([^)\s]*\)/g, "]")
    .replace(/\{#[^}]*\}/g, " ")
    .replace(/<[^>\n]*>/g, " ");
}

/** {@link readingText} without the English in italics or quotation marks (examples, translations). */
function ownWords(line: string): string {
  return readingText(line)
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/\*[^*\n]+\*/g, " ")
    .replace(/"[^"\n]*"|“[^”\n]*”/g, " ");
}

/**
 * The page's own words for the voice rule: {@link readingText} without English examples. Drops
 * bold spans (terms and control labels such as **Check me**), italics and quotation marks, and a
 * parenthesized note right after an example (*Here.* (near me)) or a short gloss ((you and I)).
 */
function voiceText(line: string): string {
  return readingText(line)
    .replace(/\*\*[^*\n]+\*\*/g, " ")
    .replace(/\*\*/g, "")
    .replace(/(?:\*[^*\n]+\*|"[^"\n]*"|“[^”\n]*”)\s*\([^()\n]*\)/g, " ")
    .replace(/\*[^*\n]+\*/g, " ")
    .replace(/"[^"\n]*"|“[^”\n]*”/g, " ")
    .replace(/\((?:[^()\s]+\s*){1,6}\)/g, " ");
}

/** Sentences in a run of prose: closing marks, with code, links and parentheses collapsed. */
export function sentenceCount(text: string): number {
  const flat = text
    .replace(/`[^`\n]*`/g, "x")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\([^()]*\)/g, "")
    .replace(/\b(?:e\.g|i\.e|etc|vs)\./gi, "x");
  return (flat.match(/[.?!]["”’*)]*(?=\s|$)/g) ?? []).length;
}

type Paragraph = { line: number; text: string };

function paragraphs(lines: readonly string[]): Paragraph[] {
  const out: Paragraph[] = [];
  let current: Paragraph | undefined;
  lines.forEach((line, i) => {
    if (lineKind(line) === "prose") {
      if (current) current.text += ` ${line.trim()}`;
      else out.push((current = { line: i + 1, text: line.trim() }));
    } else current = undefined;
  });
  return out;
}

/** Prose sentences between a Beginner `###` heading and its first example (quote, fence or table). */
function beginnerLeads(lines: readonly string[], fenced: readonly string[]): { line: number; sentences: number }[] {
  const out: { line: number; sentences: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const heading = /^###\s+(.*)$/.exec(lines[i]!);
    if (!heading || /^Practice\b/i.test(heading[1]!)) continue;
    let text = "";
    let found = false;
    for (let j = i + 1; j < lines.length; j++) {
      const kind = lineKind(lines[j]!);
      if (kind === "heading") break;
      // A fenced block is blank in `lines`; the raw page says where one opens.
      if (kind === "quote" || kind === "table" || /^\s*```/.test(fenced[j]!)) {
        found = true;
        break;
      }
      if (kind === "prose") text += ` ${lines[j]!.trim()}`;
    }
    if (found && text) out.push({ line: i + 1, sentences: sentenceCount(text) });
  }
  return out;
}

/**
 * Wording issues on one grammar page. `page` is its path under docs/grammar/
 * (`beginner/phonology.md`).
 */
export function proseStyleIssues(page: string, markdown: string): ProseIssue[] {
  const issues: ProseIssue[] = [];
  const error = (rule: ProseRule, line: number, message: string) => issues.push({ rule, severity: "error", line, message });
  const warning = (rule: ProseRule, line: number, message: string) =>
    issues.push({ rule, severity: "warning", line, message });

  const rawLines = markdown.split("\n");
  const lines = blankNonProse(markdown).split("\n");
  const name = page.split("/").pop()!;
  const band = pageBand(markdown);
  const allowed = new Set((JARGON_ALLOWED[page] ?? []).map((term) => term.toLowerCase()));

  const signedSections = AUTHOR_I_SECTIONS[page] ?? [];
  let signed = false;
  let answer = false;

  lines.forEach((line, i) => {
    const kind = lineKind(line);
    if (kind === "blank") return;
    const n = i + 1;

    const h2 = /^#{1,2}\s+(.*?)\s*(?:\{#[^}]*\})?\s*$/.exec(line.trim());
    if (h2) signed = signedSections.includes(h2[1]!);
    // A numbered prompt is an example and its note.
    if (/^\s*:::\s*details\b/.test(line)) answer = true;
    else if (/^\s*:::\s*$/.test(line)) answer = false;

    const link = FILENAME_LINK.exec(line.replace(/`[^`\n]*`(?!\])/g, (m) => " ".repeat(m.length)));
    if (link) error("link-filename", n, `link text is a filename: ${link[0]}…`);

    const path = /\bdocs\/(?:meta|proposals)\/|\]\((?:\.\.\/)+meta\//.exec(line);
    if (path) error("editor-path", n, `mentions ${path[0].replace(/^\]\(/, "")}`);

    const reading = readingText(line);
    if (/\bClarity\b/.test(reading)) error("legacy-name", n, "uses the legacy name Clarity");

    // Quoted lines are examples and their translations, not the page's own voice.
    if (kind === "quote") return;
    const own = ownWords(line);

    const throat = THROAT_CLEARING.map((re) => re.exec(own)).find(Boolean);
    if (throat) error("throat-clearing", n, `throat-clearing: "${throat[0].trim()}"`);

    const warm = EMPTY_WARMTH.map((re) => re.exec(own)).find(Boolean);
    if (warm) error("empty-warmth", n, `empty reassurance: "${warm[0]}"`);

    if (kind === "prose" && /[A-Za-z][!](?=\s|$)/.test(own)) error("exclamation", n, "exclamation mark in prose");

    // In an answer, a line with code (or any line in a Claritish answer) is the learner's sentence.
    const answerExample = answer && (page.startsWith("claritish/") || /`/.test(rawLines[i]!));
    if (kind !== "table" && !answerExample && !/^\s*\*\*\d+\.\*\*/.test(line)) {
      const voice = voiceText(line);
      const we = MAINTAINER_WE.exec(voice);
      if (we) error("voice", n, `maintainer "${we[0]}"`);
      const me = signed ? null : AUTHOR_I.exec(voice);
      if (me) error("voice", n, `author "${me[0]}"`);
    }

    if (!JARGON_EXEMPT.has(name)) {
      const term = JARGON.exec(own);
      if (term && !allowed.has(term[0].toLowerCase())) warning("jargon", n, `specialist term "${term[0]}"`);
    }
  });

  for (const paragraph of paragraphs(lines)) {
    const sentences = sentenceCount(paragraph.text);
    if (sentences > SENTENCE_CEILING) warning("long-paragraph", paragraph.line, `${sentences} sentences in one paragraph`);
    const bold = (paragraph.text.match(/\*\*[^*\n]+\*\*/g) ?? []).length;
    if (bold > BOLD_CEILING) warning("bold-density", paragraph.line, `${bold} bold phrases in one paragraph`);
  }

  if (band) {
    // The first sentence under a heading is the rule; a cue there is the cue as the definition.
    for (let i = 0; i < lines.length; i++) {
      if (lineKind(lines[i]!) !== "heading") continue;
      let j = i + 1;
      while (j < lines.length && (lineKind(lines[j]!) === "blank" || /^<a id=/.test(lines[j]!.trim()))) j++;
      if (j >= lines.length || lineKind(lines[j]!) !== "prose") continue;
      const first = lines[j]!.split(/(?<=[.?!])\s/)[0]!;
      if (/\(cue:/i.test(first)) error("cue-first", j + 1, "cue in the first sentence of a section");
    }
  }

  if (band === "beginner") {
    for (const lead of beginnerLeads(lines, rawLines)) {
      if (lead.sentences < 2 || lead.sentences > 4) {
        warning("beginner-lead", lead.line, `${lead.sentences} sentence(s) before the first example`);
      }
    }
  }

  return issues.sort((a, b) => a.line - b.line);
}

/** Warning counts per page (path under docs/grammar/) and rule; zero counts are left out. */
export type WarningCounts = Record<string, Partial<Record<ProseRule, number>>>;

export type BaselineChange = { page: string; rule: ProseRule; baseline: number; current: number };

/** Count each page's warnings by rule. Every page in `pages` gets an entry, empty when clean. */
export function warningCounts(issuesByPage: Record<string, readonly ProseIssue[]>): WarningCounts {
  const out: WarningCounts = {};
  for (const [page, issues] of Object.entries(issuesByPage)) {
    const counts: Partial<Record<ProseRule, number>> = {};
    for (const issue of issues) {
      if (issue.severity === "warning") counts[issue.rule] = (counts[issue.rule] ?? 0) + 1;
    }
    out[page] = counts;
  }
  return out;
}

/**
 * Compare warning counts with the baseline over `pages` (default: the pages in `counts`).
 * A page or rule missing on either side counts as 0. Rises fail the build; falls can be locked in.
 */
export function compareWarningBaseline(
  counts: WarningCounts,
  baseline: WarningCounts,
  pages: readonly string[] = Object.keys(counts),
): { rises: BaselineChange[]; falls: BaselineChange[] } {
  const rises: BaselineChange[] = [];
  const falls: BaselineChange[] = [];
  for (const page of [...new Set(pages)].sort()) {
    const now = counts[page] ?? {};
    const before = baseline[page] ?? {};
    const rules = [...new Set([...Object.keys(now), ...Object.keys(before)])].sort() as ProseRule[];
    for (const rule of rules) {
      const change = { page, rule, baseline: before[rule] ?? 0, current: now[rule] ?? 0 };
      if (change.current > change.baseline) rises.push(change);
      else if (change.current < change.baseline) falls.push(change);
    }
  }
  return { rises, falls };
}

/**
 * The baseline after an update. With `pages`, only those pages' entries change; without, the
 * baseline becomes `counts` (pages that no longer exist drop out).
 */
export function updatedWarningBaseline(
  counts: WarningCounts,
  baseline: WarningCounts,
  pages?: readonly string[],
): WarningCounts {
  const next: WarningCounts = pages ? { ...baseline } : {};
  for (const page of pages ?? Object.keys(counts)) {
    delete next[page];
    const nonzero = Object.entries(counts[page] ?? {}).filter(([, n]) => n! > 0);
    if (nonzero.length) next[page] = Object.fromEntries(nonzero);
  }
  return next;
}

/** Stable JSON for the baseline file: sorted pages and rules, one page per block. */
export function formatWarningBaseline(baseline: WarningCounts): string {
  const sorted: WarningCounts = {};
  for (const page of Object.keys(baseline).sort()) {
    const rules = baseline[page]!;
    sorted[page] = Object.fromEntries(Object.keys(rules).sort().map((rule) => [rule, rules[rule as ProseRule]]));
  }
  return `${JSON.stringify(sorted, null, 2)}\n`;
}
