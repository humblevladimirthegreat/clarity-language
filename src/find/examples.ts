/** The parsed Agalan examples on a docs page, as the docs lint reads them. */
import { classify, type ClassifyTables } from "../parse/classify.js";
import { wordConstructions } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import { parseWord } from "../parse/word.js";
import { fillSelf } from "../learner-name.js";
import { classifyAgalanSpan, isAgalanLintCandidate, peelLintChunk, walkAgalanSpans } from "../lint/agalan-docs.js";
import { flattenWords, type FoundWord } from "./query.js";

export type Example = {
  text: string;
  /** Offset of the span in the page. */
  index: number;
  cls: "sentence" | "phrase" | "word";
  words: FoundWord[];
  constructions: string[];
};

function chunksOf(text: string): string[] {
  return text.trim().split(/\s+/).map((chunk) => peelLintChunk(chunk).core);
}

function parseExample(text: string, cls: Example["cls"], tables: ClassifyTables): Omit<Example, "text" | "index" | "cls"> | null {
  try {
    if (cls === "word") {
      const { core } = peelLintChunk(text.trim());
      if (!isAgalanLintCandidate(core)) return null;
      const word = classify(parseWord(core), tables);
      return { words: [{ word, unit: "", position: 0 }], constructions: wordConstructions(word) };
    }
    const result = parseWithTables(text.trim(), tables, { constructions: true });
    return { words: flattenWords(result, chunksOf(text)), constructions: result.constructions ?? [] };
  } catch {
    // The docs lint reports spans that do not parse.
    return null;
  }
}

/**
 * Sentence, phrase, and single-word examples on a page (templates and fragments are skipped).
 * `SELF` slots are filled with the default learner root, as the docs lint does.
 */
export function collectExamples(markdown: string, tables: ClassifyTables): Example[] {
  const examples: Example[] = [];
  walkAgalanSpans(fillSelf(markdown), {
    text: (text, index) => {
      const cls = classifyAgalanSpan(text);
      if (cls !== "sentence" && cls !== "phrase" && cls !== "word") return;
      const parsed = parseExample(text, cls, tables);
      if (parsed) examples.push({ text: text.trim(), index, cls, ...parsed });
    },
  });
  return examples;
}
