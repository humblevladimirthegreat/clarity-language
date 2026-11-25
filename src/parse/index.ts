import { createClassifyTables, type ClassifyTables } from "./classify.js";
import { parseWithTables } from "./parse-core.js";
import type { ParseOptions, ParseResult } from "./types.js";
import { readData } from "../repo-paths.js";
import { WORD_SLOTS_FILE } from "./word-slots.js";

export {
  classify,
  classifyAll,
  classifyHits,
  createClassifyTables,
  joinFenceGloss,
  knownLexiconRoots,
  lexiconContentRoots,
  SAKE_ROOTS,
  unknownLexiconContentRoots,
} from "./classify.js";
export { parseSentenceTokens } from "./sentence-parser.js";
export { SentenceParseError } from "./sentence-shapes.js";
export { numberMarkerIdentity, resolve, wholeStem } from "./resolve.js";
export { classifyToTokenType } from "./tokens.js";
export { segmentUtterance, tokenizeUtterance } from "./tokenize.js";
export { parseWord, parseWords, parseWordStream, probeMorphWord, WordParseError } from "./word.js";
export { collectAmbiguity } from "./ambiguity.js";
export { parseWithTables } from "./parse-core.js";
export { inspectText, glossFor, chipsFor, morphDetails, endingSense } from "./inspect.js";
export { compareMorphGloss, extractExampleBlocks, extractTeachBlocks, morphRedundantWithLoose, normalizeAgeben, normalizeLooseEnglish, normalizeMorphLine } from "./morph-gloss-blocks.js";
export { morphGlossFor, morphGlossLine } from "./morph-gloss.js";
export { senseLabel } from "./morph-gloss-labels.js";
export type { CompareMorphGlossResult, ExampleBlockPair, MorphGlossContext, TeachBlock } from "./morph-gloss-tables.js";
export type {
  InspectConstruction,
  InspectError,
  InspectRelated,
  InspectResult,
  InspectToken,
  InspectWhy,
} from "./inspect.js";
export type * from "./types.js";

let defaultTables: ClassifyTables | null = null;

export function loadDefaultTables(): ClassifyTables {
  if (defaultTables) return defaultTables;
  defaultTables = createClassifyTables(
    readData("lexicon-published.csv"),
    readData("lexicon-overlays.csv"),
    readData("lexicon-compounds.csv"),
    readData(WORD_SLOTS_FILE),
  );
  return defaultTables;
}

/** End-to-end parse: surface text → sentence AST. */
export function parse(text: string, tables?: ClassifyTables, options?: ParseOptions): ParseResult {
  return parseWithTables(text, tables ?? loadDefaultTables(), options);
}
