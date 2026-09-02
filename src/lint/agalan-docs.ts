import { knownLexiconRoots, unknownLexiconContentRoots, type ClassifyTables } from "../parse/classify.js";
import { parseWord, WordParseError } from "../parse/word.js";
import { forEachMarkdownCodeToken } from "../retie/tokens.js";
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
const WORD_CHAR_RE = /^[aeouhwdjbgzmnvlrx0-9+\-#_.=@~%±[\]{}()]+$/;

const TEACHING_GLOSS_RE = /^[zdbvgwhxj]-[a-z@]+$/;

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

/** PoS + published-shaped root, no ending — lemma citation like `hegera`. */
function prefixedBareRoot(core: string): string | null {
  if (core.length < 4) return null;
  if (!POS.includes(core[0]!)) return null;
  const rest = core.slice(1);
  if (isClarityRootShape(rest) && rest.length >= 3) return rest;
  return null;
}

/**
 * Worth reporting a parse failure: morph glyphs, or PoS/citation + CV body + ending.
 * English in backticks (`and`, `would`, `dog`) does not match.
 */
function looksLikeFullSpelledWord(core: string): boolean {
  if (unmatchedBrackets(core)) return false;
  if (/^[zdbvgwhxj][+#_]$/.test(core)) return false;
  if (hasMorphGlyph(core)) return true;
  if (/^[zdbvgwhxj][aeou](?:[hwdjbgzmnvlr][aeou])+[lmnr](?:sh)?$/.test(core)) return true;
  if (/^[aeou](?:[hwdjbgzmnvlr][aeou])+[lmnr](?:sh)?$/.test(core)) return true;
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
  if (!/^[zdbvgwhxjaeou]/.test(core)) return false;
  return true;
}

export function lintAgalanToken(
  core: string,
  tables: ClassifyTables,
  known: ReadonlySet<string> = knownLexiconRoots(tables),
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

  const missing = unknownLexiconContentRoots(word, known);
  if (missing.length > 0) {
    return { kind: "unknown-root", detail: `not in the lexicon: ${missing.join(", ")}` };
  }
  return null;
}

export function lintAgalanMarkdown(text: string, tables: ClassifyTables): AgalanLintIssue[] {
  const known = knownLexiconRoots(tables);
  const issues: AgalanLintIssue[] = [];

  forEachMarkdownCodeToken(text, ({ chunk, index }) => {
    const { prefix, core } = peelLintChunk(chunk);
    if (!core) {
      return;
    }
    const hit = lintAgalanToken(core, tables, known);
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

  return issues;
}
