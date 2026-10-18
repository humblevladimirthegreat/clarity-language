/**
 * The English helper without file access: `createHelperData` builds the analyzer's data from a
 * JSON payload (load.ts `helperPayload`), the lexicon CSV text, and the classify tables. Node
 * (load.ts) and the Inspect page's English helper section both build their data here, so the
 * page analyzes exactly as the CLI does.
 */
import type { EnglishEntry } from "../find/english.js";
import { parseCompoundCsv, parseOverlayCsv, parsePublishedCsv } from "../lexicon-search.js";
import { classifyAll, type ClassifyTables } from "../parse/classify.js";
import { parseWords } from "../parse/word.js";
import type { HelperData, SectionInfo } from "./analyze.js";
import type { GrammarJob } from "./cues.js";
import { buildLexiconIndex } from "./lexicon.js";
import type { WordnetIndex } from "./wordnet-index.js";

export { analyzeEnglish, slotTier, TIERS } from "./analyze.js";
export type {
  Analysis,
  AnalyzedClause,
  ClassSuggestion,
  DetectorSuggestion,
  EntrySuggestion,
  Gap,
  HelperData,
  JobSuggestion,
  LiveSuggestion,
  RoleSuggestion,
  RootSuggestion,
  SectionInfo,
  Slot,
  Suggestion,
  Tier,
} from "./analyze.js";
export { featureLabels, leadNote, plainTitle, roleReading, suggestionChip, type SuggestionChip } from "./describe.js";
export { BANDS, type Band } from "../lint/learning-order.js";

/** The helper's grammar-page data, JSON-safe: what the docs say, read once at build time. */
export type HelperPayload = {
  /** Teaching-section English entries, for one-word gloss and table matches. */
  entries: EnglishEntry[];
  /** The cue index as `[key, jobs]` pairs. */
  cues: [string, GrammarJob[]][];
  sections: [string, SectionInfo][];
  wordnet?: WordnetIndex;
};

export type LexiconCsvText = { published: string; overlays: string; compounds: string };

/** Word shape and lexicon only: the sentence parser takes seconds to build, and one word needs no clause. */
export function wordParsesWith(tables: ClassifyTables): (word: string) => boolean {
  return (word) => {
    try {
      return classifyAll(parseWords(word), tables).every((w) => w.reading !== "unknown");
    } catch {
      return false;
    }
  };
}

export function createHelperData(payload: HelperPayload, csv: LexiconCsvText, tables: ClassifyTables): HelperData {
  const compounds = parseCompoundCsv(csv.compounds);
  return {
    lexicon: buildLexiconIndex(parsePublishedCsv(csv.published), compounds, parseOverlayCsv(csv.overlays)),
    cues: new Map(payload.cues),
    entries: payload.entries,
    sections: new Map(payload.sections),
    ...(payload.wordnet ? { wordnet: payload.wordnet } : {}),
    compoundParts: new Map(compounds.map((r) => [`${r.left}+${r.right}`, r])),
    wordParses: wordParsesWith(tables),
  };
}
