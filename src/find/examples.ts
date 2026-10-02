/** The parsed Agazan examples on a docs page, as the docs lint reads them. */
import { classify, type ClassifyTables } from "../parse/classify.js";
import type { LexWord } from "../parse/types.js";
import { wordConstructions } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import { parseWord } from "../parse/word.js";
import { fillSelf } from "../learner-name.js";
import { classifyAgazanSpan, isAgazanLintCandidate, peelLintChunk, walkAgazanSpans } from "../lint/agazan-docs.js";
import { flattenWords, type FoundWord } from "./query.js";

export type Example = {
  text: string;
  /** Offset of the span in the page. */
  index: number;
  cls: "sentence" | "phrase" | "word";
  words: FoundWord[];
  constructions: string[];
  /** Resume words bound to an antecedent in the same example. */
  boundResumes: Set<LexWord>;
};

function chunksOf(text: string): string[] {
  return text.trim().split(/\s+/).map((chunk) => peelLintChunk(chunk).core);
}

function parseExample(text: string, cls: Example["cls"], tables: ClassifyTables): Omit<Example, "text" | "index" | "cls"> | null {
  try {
    if (cls === "word") {
      const { core } = peelLintChunk(text.trim());
      if (!isAgazanLintCandidate(core)) return null;
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

/**
 * Sentence, phrase, and single-word examples on a page (templates and fragments are skipped).
 * `SELF` slots are filled with the default learner root, as the docs lint does.
 */
export function collectExamples(markdown: string, tables: ClassifyTables): Example[] {
  const examples: Example[] = [];
  walkAgazanSpans(fillSelf(markdown), {
    text: (text, index) => {
      const cls = classifyAgazanSpan(text);
      if (cls !== "sentence" && cls !== "phrase" && cls !== "word") return;
      const parsed = parseExample(text, cls, tables);
      if (parsed) examples.push({ text: text.trim(), index, cls, ...parsed });
    },
  });
  return examples;
}
