import type { IToken } from "chevrotain";

import { collectAmbiguity } from "./ambiguity.js";
import { enforceResult, enforceTokens } from "./enforce.js";
import type { ClassifyTables } from "./classify.js";
import { resolve } from "./resolve.js";
import { addCstConstructions, addReadingConstructions, addResolveConstructions } from "./construction-trace.js";
import { parseSentenceTokensWithCst } from "./sentence-parser.js";
import { tokenizeUtterance } from "./tokenize.js";
import { Bang, Force, Period, Polar, QMark, Hook, Vocative } from "./tokens.js";
import type { ParseOptions, ParseResult } from "./types.js";

function isLeftEdgeStart(token: IToken): boolean {
  return (
    token.tokenType === Polar ||
    token.tokenType === Force ||
    token.tokenType === Vocative ||
    token.tokenType === Hook
  );
}

function splitUtteranceGroups(tokens: IToken[]): IToken[][] {
  const groups: IToken[][] = [];
  let current: IToken[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]!;
    current.push(tok);

    const isBoundary =
      tok.tokenType === Period ||
      tok.tokenType === QMark ||
      tok.tokenType === Bang;
    if (!isBoundary) continue;

    const next = tokens[i + 1];
    if (next && isLeftEdgeStart(next)) {
      groups.push(current);
      current = [];
    }
  }

  if (current.length > 0) groups.push(current);
  return groups.length > 0 ? groups : [[]];
}

/** End-to-end parse with caller-supplied lexicon tables (browser-safe). */
export function parseWithTables(
  text: string,
  tables: ClassifyTables,
  options: ParseOptions = {},
): ParseResult {
  const tokens = tokenizeUtterance(text, tables);
  enforceTokens(tokens, tables);
  const groups = splitUtteranceGroups(tokens);

  const constructions = options.constructions ? new Set<string>() : undefined;
  const utterances = groups.flatMap((group) => {
    if (group.length === 0) return [];
    const { result, cst } = parseSentenceTokensWithCst(group);
    if (constructions) addCstConstructions(cst, constructions);
    return result.utterances;
  });

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
