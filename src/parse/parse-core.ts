import type { IToken } from "chevrotain";

import type { ClassifyTables } from "./classify.js";
import { resolve } from "./resolve.js";
import { parseSentenceTokens } from "./sentence-parser.js";
import { tokenizeUtterance } from "./tokenize.js";
import { Bang, Force, Period, Polar, QMark, Reviser, Vocative } from "./tokens.js";
import type { ParseResult } from "./types.js";

function isLeftEdgeStart(token: IToken): boolean {
  return (
    token.tokenType === Polar ||
    token.tokenType === Force ||
    token.tokenType === Vocative ||
    token.tokenType === Reviser
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
export function parseWithTables(text: string, tables: ClassifyTables): ParseResult {
  const tokens = tokenizeUtterance(text, tables);
  const groups = splitUtteranceGroups(tokens);

  const utterances = groups.flatMap((group) => {
    if (group.length === 0) return [];
    return parseSentenceTokens(group).utterances;
  });

  return resolve({ utterances });
}
