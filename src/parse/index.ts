import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createClassifyTables, type ClassifyTables } from "./classify.js";
import { parseWithTables } from "./parse-core.js";
import type { ParseOptions, ParseResult } from "./types.js";

export {
  classify,
  classifyAll,
  classifyHits,
  createClassifyTables,
  joinFenceGloss,
  knownLexiconRoots,
  lexiconContentRoots,
  INTEREST_ROOTS,
  unknownLexiconContentRoots,
} from "./classify.js";
export { parseSentenceTokens, SentenceParseError } from "./sentence-parser.js";
export { contentMatch, letterPrefix, numberMarkerIdentity, resolve } from "./resolve.js";
export { classifyToTokenType } from "./tokens.js";
export { segmentUtterance, tokenizeUtterance } from "./tokenize.js";
export { parseWord, parseWords, parseWordStream, probeMorphWord, WordParseError } from "./word.js";
export { collectAmbiguity } from "./ambiguity.js";
export { parseWithTables } from "./parse-core.js";
export { inspectText, glossFor, chipsFor, morphDetails, endingSense } from "./inspect.js";
export {
  compareMorphGloss,
  extractExampleBlocks,
  extractTeachBlocks,
  morphGlossFor,
  morphGlossLine,
  morphRedundantWithLoose,
  normalizeAgalan,
  normalizeLooseEnglish,
  normalizeMorphLine,
  senseLabel,
} from "./morph-gloss.js";
export type {
  CompareMorphGlossResult,
  ExampleBlockPair,
  MorphGlossContext,
  TeachBlock,
} from "./morph-gloss.js";
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
  const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  defaultTables = createClassifyTables(
    readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
    readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
    readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
  );
  return defaultTables;
}

/** End-to-end parse: surface text → sentence AST. */
export function parse(text: string, tables?: ClassifyTables, options?: ParseOptions): ParseResult {
  return parseWithTables(text, tables ?? loadDefaultTables(), options);
}
