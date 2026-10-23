/** The parsed Agebon examples on a docs page, as the docs lint reads them. */
import { classify, type ClassifyTables } from "../parse/classify.js";
import { collectAmbiguity } from "../parse/ambiguity.js";
import type { LexWord } from "../parse/types.js";
import { wordConstructions } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import { parseWord } from "../parse/word.js";
import { fillSelf, hasSelfSlot } from "../learner-name.js";
import { classifyAgebonSpan, isAgebonLintCandidate, peelLintChunk, walkAgebonSpans } from "../lint/agebon-docs.js";
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

export function parseExample(text: string, cls: Example["cls"], tables: ClassifyTables): Omit<Example, "text" | "index" | "cls" | "source"> | null {
  try {
    if (cls === "word") {
      const { core } = peelLintChunk(text.trim());
      if (!isAgebonLintCandidate(core)) return null;
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

/**
 * Sentence, phrase, and single-word examples on a page (templates and fragments are skipped).
 * Walks the original Markdown; `SELF` is filled only when parsing a span.
 */
export function collectPageSpans(markdown: string, tables: ClassifyTables): PageSpans {
  const examples: Example[] = [];
  const unparsed: UnparsedSpan[] = [];
  walkAgebonSpans(markdown, {
    text: (source, index) => {
      const filled = fillSelf(source);
      const cls = classifyAgebonSpan(filled);
      if (cls !== "sentence" && cls !== "phrase" && cls !== "word") return;
      const parsed = parseExample(filled, cls, tables);
      if (parsed) {
        examples.push({ text: filled.trim(), source, index, cls, ...parsed });
      } else {
        unparsed.push({ text: source.trim(), index, cls });
      }
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
  const filled = hasSelfSlot(text) ? fillSelf(text) : text;
  if (!parseExample(filled, cls, tables)) return "does not parse";
  if (checkAmbiguity && collectAmbiguity(filled, tables).length > 0) return "two trees";
  return null;
}
