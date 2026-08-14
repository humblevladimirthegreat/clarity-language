import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createClassifyTables, type ClassifyTables } from "./classify.js";
import { parseWithTables } from "./parse-core.js";
import type { ParseResult } from "./types.js";

export { classify, classifyAll, createClassifyTables, NEED_ROOTS } from "./classify.js";
export { parseSentenceTokens, SentenceParseError } from "./sentence-parser.js";
export { letterPrefix, numberMarkerIdentity, resolve } from "./resolve.js";
export { classifyToTokenType } from "./tokens.js";
export { segmentUtterance, tokenizeUtterance } from "./tokenize.js";
export { parseWord, parseWords, WordParseError } from "./word.js";
export { parseWithTables } from "./parse-core.js";
export { inspectText, glossFor, chipsFor, morphDetails, endingSense } from "./inspect.js";
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

function loadDefaultTables(): ClassifyTables {
  if (defaultTables) return defaultTables;
  const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  defaultTables = createClassifyTables(
    readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
    readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  );
  return defaultTables;
}

/** End-to-end parse: surface text → sentence AST. */
export function parse(text: string, tables?: ClassifyTables): ParseResult {
  return parseWithTables(text, tables ?? loadDefaultTables());
}
