/** The parsed Ageben examples on a docs page, as the docs lint reads them. */
import { classify, type ClassifyTables } from "../parse/classify.js";
import { collectAmbiguity } from "../parse/ambiguity.js";
import type { LexWord } from "../parse/types.js";
import { wordConstructions } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import { parseWord } from "../parse/word.js";
import { fillSelf, hasSelfSlot } from "../learner-name.js";
import { classifyAgebenSpan, isAgebenLintCandidate, peelLintChunk, walkAgebenSpans } from "../lint/ageben-docs.js";
import { flattenWords, type FoundWord } from "./query.js";

export type Example = {
  /** Filled span text used for display and parse (`SELF` → the default learner root). */
  text: string;
  /** Span body as stored on the page (unfilled). */
  source: string;
  /** Offset of the span in the original page. */
  index: number;
  cls: "sentence" | "phrase" | "word";
  words: FoundWord[];
  constructions: string[];
  /** Resume words bound to an antecedent in the same example. */
  boundResumes: Set<LexWord>;
};

export type UnparsedSpan = {
  text: string;
  index: number;
  cls: "sentence" | "phrase" | "word";
};

function chunksOf(text: string): string[] {
  return text.trim().split(/\s+/).map((chunk) => peelLintChunk(chunk).core);
}

/** True when a stored chunk is the parsed word, a `SELF` slot, or a placeholder stub (`th#N` → `th#`). */
function chunkMatchesRaw(chunk: string, raw: string): boolean {
  const core = peelLintChunk(chunk).core;
  if (core === raw) return true;
  if (fillSelf(core) === raw) return true;
  const stripped = findParseText(core);
  return stripped === raw || fillSelf(stripped) === raw;
}

/** Map parsed words onto chunk indexes in the stored span (`A ol B` → `ol` at 1). */
function alignWordPositions(source: string, words: FoundWord[]): FoundWord[] {
  const chunks = source.trim().split(/\s+/).filter((chunk) => chunk.length > 0);
  const used = new Set<number>();
  return words.map((item) => {
    const i = chunks.findIndex((chunk, idx) => {
      if (used.has(idx)) return false;
      return chunkMatchesRaw(chunk, item.word.raw);
    });
    if (i >= 0) used.add(i);
    return { ...item, position: i };
  });
}

export function parseExample(text: string, cls: Example["cls"], tables: ClassifyTables): Omit<Example, "text" | "index" | "cls" | "source"> | null {
  try {
    if (cls === "word") {
      const { core } = peelLintChunk(text.trim());
      if (!isAgebenLintCandidate(core)) return null;
      const word = classify(parseWord(core), tables);
      return { words: [{ word, unit: "", position: 0 }], constructions: wordConstructions(word), boundResumes: new Set() };
    }
    const result = parseWithTables(text.trim(), tables, { constructions: true });
    const boundResumes = new Set<LexWord>();
    for (const bind of result.resolve?.anaphors ?? []) {
      // A topic pronoun spells its own root, not a cut of its antecedent's, so it counts as a use.
      if (bind.antecedent && bind.kind !== "topic") boundResumes.add(bind.pronoun);
    }
    return { words: flattenWords(result, chunksOf(text)), constructions: result.constructions ?? [], boundResumes };
  } catch {
    // The docs lint reports spans that do not parse.
    return null;
  }
}

export type PageSpans = { examples: Example[]; unparsed: UnparsedSpan[] };

const FIND_PLACEHOLDER = /\b(?!SELF\b)[A-Z][A-Z0-9₀-₉]*\b/g;

/** Teaching stubs (`el …`, `A xol B`) keep the Ageben; drop slots the lint calls a template. */
export function findParseText(source: string): string {
  return source
    .replace(/(^|\s)(?:…|\.\.\.)(?=\s|$)/g, " ")
    .replace(FIND_PLACEHOLDER, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSpanBody(source: string, tables: ClassifyTables): Omit<Example, "index" | "source"> | null {
  const filled = fillSelf(source);
  const direct = classifyAgebenSpan(filled);
  const candidates: { text: string; cls: Example["cls"] }[] = [];
  if (direct === "sentence" || direct === "phrase" || direct === "word") {
    candidates.push({ text: filled.trim(), cls: direct });
  } else {
    const stripped = findParseText(filled);
    const cls = stripped ? classifyAgebenSpan(stripped) : "unclassified";
    if (cls === "sentence" || cls === "phrase" || cls === "word") {
      candidates.push({ text: stripped, cls });
    }
  }
  for (const { text, cls } of candidates) {
    const parsed = parseExample(text, cls, tables);
    if (parsed) return { text, cls, ...parsed };
  }
  return null;
}

/** Parse one stored Ageben body (a Markdown span, a string literal, or a TSV cell). */
export function collectBodySpan(source: string, index: number, tables: ClassifyTables): Example | UnparsedSpan {
  const parsed = parseSpanBody(source, tables);
  if (parsed) {
    const filled = fillSelf(source).trim();
    const words = parsed.text === filled ? parsed.words : alignWordPositions(source, parsed.words);
    return { ...parsed, words, source, index };
  }
  const filled = fillSelf(source);
  const cls = classifyAgebenSpan(filled);
  return {
    text: source.trim(),
    index,
    cls: cls === "sentence" || cls === "phrase" || cls === "word" ? cls : "word",
  };
}

function isExample(span: Example | UnparsedSpan): span is Example {
  return "words" in span;
}

/**
 * Sentence, phrase, and single-word examples on a page (templates and fragments are skipped).
 * Walks the original Markdown; `SELF` is filled only when parsing a span.
 */
export function collectPageSpans(markdown: string, tables: ClassifyTables): PageSpans {
  const examples: Example[] = [];
  const unparsed: UnparsedSpan[] = [];
  walkAgebenSpans(markdown, {
    text: (source, index) => {
      const span = collectBodySpan(source, index, tables);
      if (isExample(span)) examples.push(span);
      else unparsed.push(span);
    },
  });
  return { examples, unparsed };
}

/** Sentence, phrase, and single-word examples on a page (templates and fragments are skipped). */
export function collectExamples(markdown: string, tables: ClassifyTables): Example[] {
  return collectPageSpans(markdown, tables).examples;
}

/** Reparse a patched span. `null` is success; a string is the failure reason. */
export function reparseSpan(
  text: string,
  cls: Example["cls"],
  tables: ClassifyTables,
  checkAmbiguity = false,
): string | null {
  const parsed = parseSpanBody(text, tables);
  if (!parsed) {
    const filled = hasSelfSlot(text) ? fillSelf(text) : text;
    if (!parseExample(filled, cls, tables)) return "does not parse";
  }
  const forTrees = parsed?.text ?? (hasSelfSlot(text) ? fillSelf(text) : text);
  if (checkAmbiguity && collectAmbiguity(forTrees, tables).length > 0) return "two trees";
  return null;
}
