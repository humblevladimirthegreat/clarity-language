/**
 * Wording checks for learner-facing grammar pages (docs/meta/doc-style.md#what-the-build-checks).
 *
 * Errors are exact rules and fail the build. Warnings are heuristics: the build prints one count
 * per rule, and `npm run lint:prose -- --report` lists every one.
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
  | "beginner-lead";

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

  lines.forEach((line, i) => {
    const kind = lineKind(line);
    if (kind === "blank") return;
    const n = i + 1;

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
