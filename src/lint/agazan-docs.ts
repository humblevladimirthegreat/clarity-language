import {
  classifiedShape,
  classify,
  knownLexiconRoots,
  lexiconContentRoots,
  missingAbstractSense,
  unknownLexiconContentRoots,
  type ClassifyTables,
} from "../parse/classify.js";
import { peelWordChunk } from "../parse/peel.js";
import { toneRunLength } from "../parse/span-scan.js";
import { wholeStem } from "../parse/resolve.js";
import { wordConstructions } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import { classifyTokenBranch } from "../parse/tokens.js";
import { parseWord, WordParseError } from "../parse/word.js";
import { traceFragment, traceTemplate } from "./template-trace.js";
import { fixPromptRanges } from "./practice-items.js";
import { forEachMarkdownCodeSpan, forEachMarkdownCodeToken, type MarkdownCodeSpan } from "../retie/tokens.js";
import { isAgazanRootShape } from "../root-shape.js";

export type AgazanLintKind = "parse" | "unknown-root";

export type AgazanLintIssue = {
  token: string;
  index: number;
  kind: AgazanLintKind;
  detail: string;
};

/** Letters, digits, and morph glyphs that can appear in a spelled Agazan word. */
const WORD_CHAR_RE = /^[aeouhtwdjybgzmnvlrx0-9+\-#_.,=@~^%±[\]{}()]+$/;

const TEACHING_GLOSS_RE = /^(?:th|[zdbvgwhxy])-(?:[a-z@]+$|[<[{(])/;

/** Mid-word x family fragments (`x`, `xa`, `ax`), not full words. */
const X_FRAGMENT_RE = /^[aeou]?x[aeou]?$/;

/** English that can appear in grammar backticks and also look Agazan-shaped. */
export const ENGLISH_IN_CODE = new Set([
  "are",
  "bare",
  "vowel",
]);

const POS = "zdbvgwhxy";

const BRACKET_PAIRS = [
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
  ["<", ">"],
] as const;

/** Same peel as retie ([peel.ts](../parse/peel.ts)). */
export const peelLintChunk = peelWordChunk;

function withoutForeignPayloads(core: string): string {
  return core.replace(/<[^>]*>/g, "");
}

function unmatchedBrackets(core: string): boolean {
  for (const [open, close] of BRACKET_PAIRS) {
    let depth = 0;
    for (const ch of core) {
      if (ch === open) depth += 1;
      else if (ch === close) {
        depth -= 1;
        if (depth < 0) return true;
      }
    }
    if (depth !== 0) return true;
  }
  return false;
}

function hasMorphGlyph(core: string): boolean {
  return /[x<>[\]{}+#_%]/.test(core);
}

/** PoS + published-shaped root, no ending — lemma citation like `thegera`. */
function prefixedBareRoot(core: string): string | null {
  if (core.length < 4) return null;
  const posLen = core.startsWith("th") ? 2 : POS.includes(core[0]!) ? 1 : 0;
  if (posLen === 0) return null;
  const rest = core.slice(posLen);
  if (isAgazanRootShape(rest) && rest.length >= 3) return rest;
  return null;
}

/**
 * Worth reporting a parse failure: morph glyphs, or PoS/citation + CV body + ending.
 * English in backticks (`and`, `would`, `dog`) does not match.
 */
/** `j` standing where `y` would make a native word (`jal`, `agaja`). Payloads `<…>` keep their own spelling. */
function nativeJIsAgazan(core: string): boolean {
  if (!withoutForeignPayloads(core).includes("j")) return false;
  const asY = core.replace(/<[^>]*>|j/g, (m) => (m === "j" ? "y" : m));
  try {
    parseWord(asY);
    return true;
  } catch {
    return looksLikeFullSpelledWord(asY) || isAgazanRootShape(asY);
  }
}

function looksLikeFullSpelledWord(core: string): boolean {
  if (unmatchedBrackets(core)) return false;
  if (/^(?:th|[zdbvgwhxy])[+#_]$/.test(core)) return false;
  if (hasMorphGlyph(core)) return true;
  if (/^(?:th|[zdbvgwhxy])[aeou](?:[hwdybgzmnvlr][aeou])+(?:ln|[lmnr])x?$/.test(core)) return true;
  if (/^[aeou](?:[hwdybgzmnvlr][aeou])+(?:ln|[lmnr])x?$/.test(core)) return true;
  return false;
}

/** Full-word candidate: skip fragments, IPA, slash PoS, teaching glosses, placeholders. */
export function isAgazanLintCandidate(core: string): boolean {
  if (!core) return false;
  if (core.includes("/")) return false;
  if (core.startsWith("-")) return false;
  if (core === "gl-") return false;
  if (core.includes("…") || core.includes("...")) return false;
  if (TEACHING_GLOSS_RE.test(core)) return false;
  if (X_FRAGMENT_RE.test(core)) return false;
  if (ENGLISH_IN_CODE.has(core)) return false;
  if (unmatchedBrackets(core)) return false;
  const stripped = withoutForeignPayloads(core);
  if (/[A-Z]/.test(stripped)) return false;
  if (!WORD_CHAR_RE.test(stripped)) return false;
  if (!/^(?:th|[zdbvgwhxyjaeou])/.test(core)) return false; // leading j still enters, so the j lint can reject it
  return true;
}

export function lintAgazanToken(
  core: string,
  tables: ClassifyTables,
  known: ReadonlySet<string> = knownLexiconRoots(tables),
  resumeStems: ReadonlySet<string> = new Set(),
): { kind: AgazanLintKind; detail: string } | null {
  if (!isAgazanLintCandidate(core)) {
    return null;
  }
  if (nativeJIsAgazan(core)) {
    return { kind: "parse", detail: "`j` is not a letter; write `y`" };
  }

  if (isAgazanRootShape(core) && core.length >= 3) {
    if (!known.has(core)) {
      return { kind: "unknown-root", detail: `not in the lexicon: ${core}` };
    }
    return null;
  }

  const prefixed = prefixedBareRoot(core);
  if (prefixed) {
    if (!known.has(prefixed)) {
      return { kind: "unknown-root", detail: `not in the lexicon: ${prefixed}` };
    }
    return null;
  }

  let word;
  try {
    word = classifiedShape(parseWord(core), tables);
  } catch (error) {
    if (!looksLikeFullSpelledWord(core)) {
      return null;
    }
    const detail = error instanceof WordParseError ? error.message : String(error);
    return { kind: "parse", detail };
  }

  // A resume (-r) of a stem outside the lexicon is fine when its antecedent appears earlier in the block.
  const missing = unknownLexiconContentRoots(word, known).filter(
    (root) => !(word.ending === "r" && resumeStems.has(root)),
  );
  if (missing.length > 0) {
    return { kind: "unknown-root", detail: `not in the lexicon: ${missing.join(", ")}` };
  }
  const noAbstract = missingAbstractSense(word, tables);
  if (noAbstract && !hasOverlay(word, tables)) {
    return { kind: "unknown-root", detail: `-m on a root with no abstract sense: ${noAbstract}` };
  }
  return null;
}

export function lintAgazanMarkdown(text: string, tables: ClassifyTables): AgazanLintIssue[] {
  const known = knownLexiconRoots(tables);
  const issues: AgazanLintIssue[] = [];

  let currentBlock = -1;
  let resumeStems = new Set<string>();

  forEachMarkdownCodeToken(text, ({ chunk, index, block }) => {
    if (block !== currentBlock) {
      currentBlock = block;
      resumeStems = new Set();
    }
    const { prefix, core } = peelLintChunk(chunk);
    if (!core) {
      return;
    }
    const hit = lintAgazanToken(core, tables, known, resumeStems);
    collectResumeStems(core, known, resumeStems);
    if (!hit) {
      return;
    }
    issues.push({
      token: core,
      index: index + prefix.length,
      kind: hit.kind,
      detail: hit.detail,
    });
  });

  // HTML <code> spans are not markdown code; check their words too.
  for (const match of text.matchAll(HTML_CODE_RE)) {
    const base = match.index! + "<code>".length;
    const htmlStems = new Set<string>();
    for (const chunk of match[1]!.matchAll(/\S+/g)) {
      const { prefix, core } = peelLintChunk(decodeEntities(chunk[0]));
      if (!core) continue;
      const hit = lintAgazanToken(core, tables, known, htmlStems);
      collectResumeStems(core, known, htmlStems);
      if (hit) issues.push({ token: core, index: base + chunk.index! + prefix.length, ...hit });
    }
  }

  return issues;
}

function hasOverlay(word: Parameters<typeof classify>[0], tables: ClassifyTables): boolean {
  return classify(word, tables).overlay !== undefined;
}

/** Whole stems (`owogala` of `vowogalal`) a later **-r** in the block can resume ([pronouns.md](docs/grammar/pronouns.md#resume-r)). */
function collectResumeStems(core: string, known: ReadonlySet<string>, into: Set<string>): void {
  if (!isAgazanLintCandidate(core)) return;
  let word;
  try {
    word = parseWord(core);
  } catch {
    return;
  }
  const roots = lexiconContentRoots(word, known);
  if (roots.length > 0 && roots.every((root) => known.has(root))) into.add(wholeStem(word));
}

/**
 * Whole-span checks ([grammar-docs.md § Marking Agazan](../../docs/meta/grammar-docs.md#marking-agazan)).
 *
 * Every code span gets exactly one class, and no class skips silently:
 * - **sentence**: ends in `.` / `?` / `!` and starts with an Agazan word → must parse as a sentence.
 * - **phrase**: two or more words, all Agazan-shaped, no final mark → must parse (or be marked a fragment).
 * - **template**: has `…` / `...` or an all-caps placeholder (`A am B`, `DIR th ANCHOR`) → slots are filled
 *   with sample words and it must parse ([template-trace.ts](template-trace.ts)).
 * - **word**: one word → the per-word lint ({@link lintAgazanMarkdown}) covers it.
 * - **english**: no Agazan-shaped word at all (placeholders alone, like `ROOT` or `NUM`, count as English).
 * - **marked-fragment**: `<!-- lint: fragment -->` right before the span → parsed with context supplied
 *   around it. `<!-- lint: skip -->` is not allowed.
 * - **marked-error**: `<!-- lint: error -->` right before the wrong form in a **Fix it** prompt
 *   ([practice-items.ts](practice-items.ts)) → need not parse, and its constructions are not used.
 *   Anywhere else the marker fails.
 * Anything else (Agazan and non-Agazan words mixed, no final mark) is **unclassified** and fails.
 * Fenced blocks need an info string: `agazan` (each line is checked like a span) or `text` (notation,
 * not Agazan: a line that reads as an Agazan phrase or sentence fails).
 */
export type AgazanSpanClass =
  | "sentence"
  | "phrase"
  | "template"
  | "word"
  | "english"
  | "marked-fragment"
  | "marked-error"
  | "text-fence";

export type AgazanSpanIssueKind =
  | "sentence"
  | "phrase"
  | "template"
  | "fragment"
  | "unclassified"
  | "unmarked-fence"
  | "agazan-in-text-fence"
  | "bad-marker";

export type AgazanSpanIssue = {
  text: string;
  index: number;
  kind: AgazanSpanIssueKind;
  detail: string;
};

export type AgazanSpanStats = Record<AgazanSpanClass, number>;

export function emptySpanStats(): AgazanSpanStats {
  return {
    sentence: 0,
    phrase: 0,
    template: 0,
    word: 0,
    english: 0,
    "marked-fragment": 0,
    "marked-error": 0,
    "text-fence": 0,
  };
}

export const LINT_MARKER_RE = /^lint:\s*(\S+)$/;
const SPAN_NEUTRAL = new Set(["|"]);
const PLACEHOLDER_RE = /^[A-Z][A-Z0-9₀-₉]*$/;

function spanWords(text: string): string[] {
  return text
    .split(/\s+/)
    // A free-standing tone mark (`%`, `?!`) is prosody, not a word.
    .filter((chunk) => chunk && toneRunLength(chunk, 0) !== chunk.length)
    .map((chunk) => peelLintChunk(chunk.replace(/<[^>]*>/g, "<>").replace(/[[\](){}]/g, "")).core)
    .filter((core) => core && !SPAN_NEUTRAL.has(core));
}

/** Class of one span (or one line of an `agazan` fence), before parsing. */
export function classifyAgazanSpan(text: string): AgazanSpanClass | "unclassified" {
  const trimmed = text.trim();
  const words = spanWords(trimmed);
  if (words.length === 0) return "english";
  const agazan = words.filter(isAgazanLintCandidate);
  if (/[.?!]$/.test(trimmed) && isAgazanLintCandidate(words[0]!)) return "sentence";
  if (/…|\.\.\./.test(trimmed) || words.some((w) => PLACEHOLDER_RE.test(w))) {
    // Placeholders alone (`ROOT`, `NUM`, `…`) name a slot, with no Agazan to trace.
    const rest = trimmed.replace(/…|\.\.\.|[A-Z][A-Z0-9₀-₉]*/g, "");
    return /[a-z]/.test(rest) ? "template" : "english";
  }
  if (agazan.length === 0) return "english";
  if (words.length === 1) return "word";
  if (agazan.length === words.length) return "phrase";
  return "unclassified";
}

/** Receives each construction ID a span exercises, with the span's offset in the page. */
export type ConstructionSink = (id: string, index: number) => void;

function parseFailure(text: string, index: number, tables: ClassifyTables, used?: ConstructionSink): string | null {
  try {
    const result = parseWithTables(text.trim(), tables, { constructions: used !== undefined });
    for (const id of result.constructions ?? []) used!(id, index);
    return null;
  } catch (error) {
    return (error instanceof Error ? error.message : String(error)).split("\n")[0]!;
  }
}

function lintSpanText(
  text: string,
  index: number,
  tables: ClassifyTables,
  stats: AgazanSpanStats,
  issues: AgazanSpanIssue[],
  used?: ConstructionSink,
): void {
  const cls = classifyAgazanSpan(text);
  if (cls === "unclassified") {
    issues.push({
      text,
      index,
      kind: "unclassified",
      detail: "mixes Agazan and other words; fix it, or mark it <!-- lint: fragment -->",
    });
    return;
  }
  stats[cls] += 1;
  if (cls === "word" && used) addWordSpanConstructions(text, index, tables, used);
  if (cls === "template") {
    lintTraced(text, index, "template", () => traceTemplate(text, tables), issues, used);
    return;
  }
  if (cls !== "sentence" && cls !== "phrase") return;
  const failure = parseFailure(text, index, tables, used);
  if (failure == null) return;
  issues.push({
    text,
    index,
    kind: cls,
    detail:
      cls === "phrase"
        ? `${failure}; if this is an intentional fragment, mark it <!-- lint: fragment -->`
        : failure,
  });
}

/** A template or fragment: traced by filling in around it; fails when no filling parses. */
function lintTraced(
  text: string,
  index: number,
  kind: "template" | "fragment",
  trace: () => string[],
  issues: AgazanSpanIssue[],
  used?: ConstructionSink,
): void {
  try {
    for (const id of trace()) used?.(id, index);
  } catch (error) {
    issues.push({ text, index, kind, detail: error instanceof Error ? error.message : String(error) });
  }
}

export const HTML_CODE_RE = /<code>([\s\S]*?)<\/code>/g;

export function decodeEntities(text: string): string {
  return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

/** A single-word span exercises its word-level and slot constructions (`word.*`, `token.*`). */
function addWordSpanConstructions(text: string, index: number, tables: ClassifyTables, used: ConstructionSink): void {
  const { core } = peelLintChunk(text.trim());
  if (!isAgazanLintCandidate(core)) return;
  try {
    const word = classify(parseWord(core), tables);
    used(`token.${classifyTokenBranch(word).branch}`, index);
    for (const id of wordConstructions(word)) used(id, index);
  } catch {
    // The per-word lint reports words that do not parse.
  }
}

/** How {@link walkAgazanSpans} hands out a page's code spans. */
export type AgazanSpanVisitor = {
  /** Span text the lint checks as Agazan: inline spans, `agazan` fence lines, and `<code>` bodies. */
  text: (text: string, index: number) => void;
  /** A span preceded by a `<!-- lint: … -->` marker (`marker` is the text after `lint:`, or undefined if malformed). */
  marked?: (span: MarkdownCodeSpan, marker: string | undefined) => void;
  /** A fence with a non-`agazan` info string. */
  otherFence?: (span: MarkdownCodeSpan) => void;
  /** A fence with no info string. */
  unmarkedFence?: (span: MarkdownCodeSpan) => void;
};

/** Walk a page's code spans the way the docs lint reads them. */
export function walkAgazanSpans(text: string, visit: AgazanSpanVisitor): void {
  forEachMarkdownCodeSpan(text, (span) => {
    if (span.marker?.startsWith("lint:")) {
      visit.marked?.(span, LINT_MARKER_RE.exec(span.marker)?.[1]);
      return;
    }
    if (span.kind === "fence") {
      const info = span.info.split(/\s+/)[0] ?? "";
      if (info === "agazan") {
        let offset = 0;
        for (const line of span.text.split("\n")) {
          if (line.trim()) visit.text(line, span.index + offset);
          offset += line.length + 1;
        }
      } else if (info) {
        visit.otherFence?.(span);
      } else {
        visit.unmarkedFence?.(span);
      }
      return;
    }
    visit.text(span.text, span.index);
  });

  // HTML <code> (used where a span holds `<…>`, which Vue would read as a tag).
  for (const match of text.matchAll(HTML_CODE_RE)) {
    visit.text(decodeEntities(match[1]!), match.index! + "<code>".length);
  }
}

/**
 * Lint code spans. When `used` is given, it receives the construction IDs
 * ([constructions.ts](../parse/constructions.ts)) the page's examples exercise.
 */
export function lintAgazanSpans(
  text: string,
  tables: ClassifyTables,
  stats: AgazanSpanStats = emptySpanStats(),
  used?: ConstructionSink,
): AgazanSpanIssue[] {
  const issues: AgazanSpanIssue[] = [];
  let fixPrompts: { start: number; end: number }[] | undefined;

  walkAgazanSpans(text, {
    text: (body, index) => lintSpanText(body, index, tables, stats, issues, used),
    marked: (span, marker) => {
      if (marker === "fragment") {
        stats["marked-fragment"] += 1;
        lintTraced(span.text, span.index, "fragment", () => traceFragment(span.text, tables), issues, used);
      } else if (marker === "error") {
        fixPrompts ??= fixPromptRanges(text);
        if (fixPrompts.some((r) => span.index >= r.start && span.index < r.end)) {
          stats["marked-error"] += 1;
        } else {
          issues.push({
            text: span.text,
            index: span.index,
            kind: "bad-marker",
            detail: "<!-- lint: error --> is only for the wrong form in a Fix it prompt of a ### Practice checkpoint",
          });
        }
      } else if (marker === "skip") {
        issues.push({
          text: span.text,
          index: span.index,
          kind: "bad-marker",
          detail: "<!-- lint: skip --> is not allowed; make the span parse, or write it another way",
        });
      } else {
        issues.push({ text: span.text, index: span.index, kind: "bad-marker", detail: `unknown marker: ${span.marker}` });
      }
    },
    otherFence: (span) => {
      stats["text-fence"] += 1;
      let offset = 0;
      for (const line of span.text.split("\n")) {
        const cls = line.trim() ? classifyAgazanSpan(line) : "english";
        if (cls === "sentence" || cls === "phrase") {
          issues.push({
            text: line,
            index: span.index + offset,
            kind: "agazan-in-text-fence",
            detail: "reads as Agazan; put it in an ```agazan fence",
          });
        }
        offset += line.length + 1;
      }
    },
    unmarkedFence: (span) => {
      issues.push({
        text: span.text.split("\n")[0] ?? "",
        index: span.index,
        kind: "unmarked-fence",
        detail: "fenced block needs an info string: ```agazan (checked) or ```text (not Agazan)",
      });
    },
  });

  return issues;
}

export type BareRootIssue = { text: string; index: number; root: string };

/**
 * A code span naming a root with no ending (`eze`, or PoS + root `theha`) reads as English to
 * the span lint, so a respelled root would go stale unseen. The root must be published (or a
 * listed compound stem). Single vowels after `th` are the sake / scope seam, not roots.
 */
export function lintBareRoots(text: string, tables: ClassifyTables): BareRootIssue[] {
  const issues: BareRootIssue[] = [];
  walkAgazanSpans(text, {
    text: (span, index) => {
      const m = /^(?:th|[zdbvgwhxy])?([aeou][a-z]+)$/.exec(span.trim());
      const root = m?.[1];
      if (!root || !isAgazanRootShape(root)) return;
      if (tables.published.has(root) || tables.compounds.has(root)) return;
      issues.push({ text: span.trim(), index, root });
    },
  });
  return issues;
}
