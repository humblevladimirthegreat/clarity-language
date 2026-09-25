import {
  classify,
  knownLexiconRoots,
  lexiconContentRoots,
  missingAbstractSense,
  unknownLexiconContentRoots,
  type ClassifyTables,
} from "../parse/classify.js";
import { toneMarkLength, toneRunLength } from "../parse/span-scan.js";
import { letterPrefix } from "../parse/resolve.js";
import { wordConstructions } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import { classifyTokenBranch } from "../parse/tokens.js";
import { parseWord, WordParseError } from "../parse/word.js";
import { traceFragment, traceTemplate } from "./template-trace.js";
import { forEachMarkdownCodeSpan, forEachMarkdownCodeToken } from "../retie/tokens.js";
import { isClarityRootShape } from "../word-converter.js";

export type AgalanLintKind = "parse" | "unknown-root";

export type AgalanLintIssue = {
  token: string;
  index: number;
  kind: AgalanLintKind;
  detail: string;
};

const TRAILING_SENTENCE = new Set([".", "?", "!", ",", ":", ";", '"', "'"]);
const LEADING_QUOTE = new Set(['"', "'"]);

/** Letters, digits, and morph glyphs that can appear in a spelled Agalan word. */
const WORD_CHAR_RE = /^[aeouhtwdjbgzmnvlrx0-9+\-#_.,=@~%±[\]{}()]+$/;

const TEACHING_GLOSS_RE = /^(?:th|[zdbvgwhxj])-(?:[a-z@]+$|[<[{(])/;

/** Mid-word x family fragments (`x`, `xa`, `ax`), not full words. */
const X_FRAGMENT_RE = /^[aeou]?x[aeou]?$/;

/** English that can appear in grammar backticks and also look Agalan-shaped. */
const ENGLISH_IN_CODE = new Set([
  "are",
  "bare",
  "vowel",
]);

const POS = "zdbvgwhxj";

const BRACKET_PAIRS = [
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
  ["<", ">"],
] as const;

export function peelLintChunk(chunk: string): { prefix: string; core: string; suffix: string } {
  let prefix = "";
  let suffix = "";
  let core = chunk;

  while (core.length > 0 && TRAILING_SENTENCE.has(core.at(-1)!)) {
    suffix = core.at(-1)! + suffix;
    core = core.slice(0, -1);
  }
  while (core.length > 0 && LEADING_QUOTE.has(core[0]!)) {
    prefix += core[0]!;
    core = core.slice(1);
  }
  const tone = toneMarkLength(core, 0);
  if (tone && core.length > tone) {
    prefix += core.slice(0, tone);
    core = core.slice(tone);
  }

  for (const [left, right] of [["(", ")"]] as const) {
    if (core.startsWith(left) && core.endsWith(right) && core.length > 2) {
      prefix += left;
      suffix = `${right}${suffix}`;
      core = core.slice(1, -1);
    }
  }

  return { prefix, core, suffix };
}

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
  if (isClarityRootShape(rest) && rest.length >= 3) return rest;
  return null;
}

/**
 * Worth reporting a parse failure: morph glyphs, or PoS/citation + CV body + ending.
 * English in backticks (`and`, `would`, `dog`) does not match.
 */
function looksLikeFullSpelledWord(core: string): boolean {
  if (unmatchedBrackets(core)) return false;
  if (/^(?:th|[zdbvgwhxj])[+#_]$/.test(core)) return false;
  if (hasMorphGlyph(core)) return true;
  if (/^(?:th|[zdbvgwhxj])[aeou](?:[hwdjbgzmnvlr][aeou])+[lmnr]x?$/.test(core)) return true;
  if (/^[aeou](?:[hwdjbgzmnvlr][aeou])+[lmnr]x?$/.test(core)) return true;
  return false;
}

/** Full-word candidate: skip fragments, IPA, slash PoS, teaching glosses, placeholders. */
export function isAgalanLintCandidate(core: string): boolean {
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
  if (!/^(?:th|[zdbvgwhxjaeou])/.test(core)) return false;
  return true;
}

export function lintAgalanToken(
  core: string,
  tables: ClassifyTables,
  known: ReadonlySet<string> = knownLexiconRoots(tables),
  resumeStems: ReadonlySet<string> = new Set(),
): { kind: AgalanLintKind; detail: string } | null {
  if (!isAgalanLintCandidate(core)) {
    return null;
  }

  if (isClarityRootShape(core) && core.length >= 3) {
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
    word = parseWord(core);
  } catch (error) {
    if (!looksLikeFullSpelledWord(core)) {
      return null;
    }
    const detail = error instanceof WordParseError ? error.message : String(error);
    return { kind: "parse", detail };
  }

  // A short resume (-r) is fine when its antecedent appears earlier in the block.
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

export function lintAgalanMarkdown(text: string, tables: ClassifyTables): AgalanLintIssue[] {
  const known = knownLexiconRoots(tables);
  const issues: AgalanLintIssue[] = [];

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
    const hit = lintAgalanToken(core, tables, known, resumeStems);
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
      const hit = lintAgalanToken(core, tables, known, htmlStems);
      collectResumeStems(core, known, htmlStems);
      if (hit) issues.push({ token: core, index: base + chunk.index! + prefix.length, ...hit });
    }
  }

  return issues;
}

function hasOverlay(word: Parameters<typeof classify>[0], tables: ClassifyTables): boolean {
  return classify(word, tables).overlay !== undefined;
}

/** Short-resume stems of known content roots in `core` ([pronouns.md](docs/grammar/pronouns.md)). */
function collectResumeStems(core: string, known: ReadonlySet<string>, into: Set<string>): void {
  if (!isAgalanLintCandidate(core)) return;
  let word;
  try {
    word = parseWord(core);
  } catch {
    return;
  }
  for (const root of lexiconContentRoots(word, known)) {
    if (known.has(root)) into.add(letterPrefix(root));
  }
}

/**
 * Whole-span checks ([grammar-docs.md § Marking Agalan](../../docs/meta/grammar-docs.md#marking-agalan)).
 *
 * Every code span gets exactly one class, and no class skips silently:
 * - **sentence**: ends in `.` / `?` / `!` and starts with an Agalan word → must parse as a sentence.
 * - **phrase**: two or more words, all Agalan-shaped, no final mark → must parse (or be marked a fragment).
 * - **template**: has `…` / `...` or an all-caps placeholder (`A am B`, `DIR th ANCHOR`) → slots are filled
 *   with sample words and it must parse ([template-trace.ts](template-trace.ts)).
 * - **word**: one word → the per-word lint ({@link lintAgalanMarkdown}) covers it.
 * - **english**: no Agalan-shaped word at all (placeholders alone, like `ROOT` or `NUM`, count as English).
 * - **marked-fragment**: `<!-- lint: fragment -->` right before the span → parsed with context supplied
 *   around it. `<!-- lint: skip -->` is not allowed.
 * Anything else (Agalan and non-Agalan words mixed, no final mark) is **unclassified** and fails.
 * Fenced blocks need an info string: `agalan` (each line is checked like a span) or `text` (notation,
 * not Agalan: a line that reads as an Agalan phrase or sentence fails).
 */
export type AgalanSpanClass =
  | "sentence"
  | "phrase"
  | "template"
  | "word"
  | "english"
  | "marked-fragment"
  | "text-fence";

export type AgalanSpanIssueKind =
  | "sentence"
  | "phrase"
  | "template"
  | "fragment"
  | "unclassified"
  | "unmarked-fence"
  | "agalan-in-text-fence"
  | "bad-marker";

export type AgalanSpanIssue = {
  text: string;
  index: number;
  kind: AgalanSpanIssueKind;
  detail: string;
};

export type AgalanSpanStats = Record<AgalanSpanClass, number>;

export function emptySpanStats(): AgalanSpanStats {
  return {
    sentence: 0,
    phrase: 0,
    template: 0,
    word: 0,
    english: 0,
    "marked-fragment": 0,
    "text-fence": 0,
  };
}

const LINT_MARKER_RE = /^lint:\s*(\S+)$/;
const SPAN_NEUTRAL = new Set(["^", "|"]);
const PLACEHOLDER_RE = /^[A-Z][A-Z0-9₀-₉]*$/;

function spanWords(text: string): string[] {
  return text
    .split(/\s+/)
    // A free-standing tone mark (`%`, `?!`) is prosody, not a word.
    .filter((chunk) => chunk && toneRunLength(chunk, 0) !== chunk.length)
    .map((chunk) => peelLintChunk(withoutForeignPayloads(chunk).replace(/[[\](){}]/g, "")).core)
    .filter((core) => core && !SPAN_NEUTRAL.has(core));
}

/** Class of one span (or one line of an `agalan` fence), before parsing. */
/** A spoken opaque span (`duxal … xuxul`): its interior is foreign, not Agalan words. */
const SPOKEN_OPAQUE_RE = /(\b(?:th|[zdbvgwhxj])ux[ae][lmn]\s)[\s\S]*?(\sxuxu[lmr]\b)/g;

export function classifyAgalanSpan(text: string): AgalanSpanClass | "unclassified" {
  const trimmed = text.trim().replace(SPOKEN_OPAQUE_RE, "$1$2");
  const words = spanWords(trimmed);
  if (words.length === 0) return "english";
  const agalan = words.filter(isAgalanLintCandidate);
  if (/[.?!]$/.test(trimmed) && isAgalanLintCandidate(words[0]!)) return "sentence";
  if (/…|\.\.\./.test(trimmed) || words.some((w) => PLACEHOLDER_RE.test(w))) {
    // Placeholders alone (`ROOT`, `NUM`, `…`) name a slot, with no Agalan to trace.
    const rest = trimmed.replace(/…|\.\.\.|[A-Z][A-Z0-9₀-₉]*/g, "");
    return /[a-z]/.test(rest) ? "template" : "english";
  }
  if (agalan.length === 0) return "english";
  if (words.length === 1) return "word";
  if (agalan.length === words.length) return "phrase";
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
  stats: AgalanSpanStats,
  issues: AgalanSpanIssue[],
  used?: ConstructionSink,
): void {
  const cls = classifyAgalanSpan(text);
  if (cls === "unclassified") {
    issues.push({
      text,
      index,
      kind: "unclassified",
      detail: "mixes Agalan and other words; fix it, or mark it <!-- lint: fragment -->",
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
  issues: AgalanSpanIssue[],
  used?: ConstructionSink,
): void {
  try {
    for (const id of trace()) used?.(id, index);
  } catch (error) {
    issues.push({ text, index, kind, detail: error instanceof Error ? error.message : String(error) });
  }
}

const HTML_CODE_RE = /<code>([\s\S]*?)<\/code>/g;

function decodeEntities(text: string): string {
  return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

/** A single-word span exercises its word-level and slot constructions (`word.*`, `token.*`). */
function addWordSpanConstructions(text: string, index: number, tables: ClassifyTables, used: ConstructionSink): void {
  const { core } = peelLintChunk(text.trim());
  if (!isAgalanLintCandidate(core)) return;
  try {
    const word = classify(parseWord(core), tables);
    used(`token.${classifyTokenBranch(word).branch}`, index);
    for (const id of wordConstructions(word)) used(id, index);
  } catch {
    // The per-word lint reports words that do not parse.
  }
}

/**
 * Lint code spans. When `used` is given, it receives the construction IDs
 * ([constructions.ts](../parse/constructions.ts)) the page's examples exercise.
 */
export function lintAgalanSpans(
  text: string,
  tables: ClassifyTables,
  stats: AgalanSpanStats = emptySpanStats(),
  used?: ConstructionSink,
): AgalanSpanIssue[] {
  const issues: AgalanSpanIssue[] = [];

  forEachMarkdownCodeSpan(text, (span) => {
    const marker = span.marker ? LINT_MARKER_RE.exec(span.marker)?.[1] : undefined;
    if (span.marker?.startsWith("lint:") && marker !== "skip" && marker !== "fragment") {
      issues.push({ text: span.text, index: span.index, kind: "bad-marker", detail: `unknown marker: ${span.marker}` });
      return;
    }
    if (marker === "skip") {
      issues.push({
        text: span.text,
        index: span.index,
        kind: "bad-marker",
        detail: "<!-- lint: skip --> is not allowed; make the span parse, or write it another way",
      });
      return;
    }
    if (marker === "fragment") {
      stats["marked-fragment"] += 1;
      lintTraced(span.text, span.index, "fragment", () => traceFragment(span.text, tables), issues, used);
      return;
    }
    if (span.kind === "fence") {
      const info = span.info.split(/\s+/)[0] ?? "";
      if (info === "agalan") {
        let offset = 0;
        for (const line of span.text.split("\n")) {
          if (line.trim()) lintSpanText(line, span.index + offset, tables, stats, issues, used);
          offset += line.length + 1;
        }
        return;
      }
      if (info) {
        stats["text-fence"] += 1;
        let offset = 0;
        for (const line of span.text.split("\n")) {
          const cls = line.trim() ? classifyAgalanSpan(line) : "english";
          if (cls === "sentence" || cls === "phrase") {
            issues.push({
              text: line,
              index: span.index + offset,
              kind: "agalan-in-text-fence",
              detail: "reads as Agalan; put it in an ```agalan fence",
            });
          }
          offset += line.length + 1;
        }
        return;
      }
      issues.push({
        text: span.text.split("\n")[0] ?? "",
        index: span.index,
        kind: "unmarked-fence",
        detail: "fenced block needs an info string: ```agalan (checked) or ```text (not Agalan)",
      });
      return;
    }
    lintSpanText(span.text, span.index, tables, stats, issues, used);
  });

  // HTML <code> (used where a span holds `<…>`, which Vue would read as a tag).
  for (const match of text.matchAll(HTML_CODE_RE)) {
    const index = match.index! + "<code>".length;
    const body = decodeEntities(match[1]!);
    lintSpanText(body, index, tables, stats, issues, used);
  }

  return issues;
}
