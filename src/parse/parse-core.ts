import type { IToken } from "chevrotain";

import { collectAmbiguity } from "./ambiguity.js";
import { diagnoseParseError, enforceResult, enforceTokens, enforceTones } from "./enforce.js";
import type { ClassifyTables } from "./classify.js";
import { resolve } from "./resolve.js";
import { addCstConstructions, addReadingConstructions, addResolveConstructions } from "./construction-trace.js";
import { parseSentenceTokensWithCst } from "./sentence-parser.js";
import { tokenizeUtterance } from "./tokenize.js";
import type { ParseOptions, ParseResult } from "./types.js";

/** End-to-end parse with caller-supplied lexicon tables (browser-safe). */
export function parseWithTables(
  text: string,
  tables: ClassifyTables,
  options: ParseOptions = {},
): ParseResult {
  const toned = enforceTones(tokenizeUtterance(text, tables));
  const tokens = toned.tokens;
  enforceTokens(tokens, tables);

  const constructions = options.constructions ? new Set<string>(toned.constructions) : undefined;
  let utterances: ParseResult["utterances"] = [];
  if (tokens.length > 0) {
    let parsed: ReturnType<typeof parseSentenceTokensWithCst>;
    try {
      parsed = parseSentenceTokensWithCst(tokens);
    } catch (error) {
      diagnoseParseError(tokens, error);
      throw error;
    }
    const { result, cst } = parsed;
    if (constructions) addCstConstructions(cst, constructions);
    utterances = result.utterances;
  }

  let result = resolve({ utterances });
  enforceResult(result, tables);
  if (constructions) {
    addResolveConstructions(result.resolve, constructions);
    addReadingConstructions(result, constructions);
    result = { ...result, constructions: [...constructions].sort() };
  }
  if (!options.checkAmbiguity) return result;
  return { ...result, ambiguity: collectAmbiguity(text, tables) };
}
