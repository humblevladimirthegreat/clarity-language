import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { IToken } from "chevrotain";

import { createClassifyTables, type ClassifyTables } from "./classify.js";
import { parseSentenceTokens, SentenceParseError } from "./sentence-parser.js";
import { tokenizeUtterance } from "./tokenize.js";
import { Bang, Force, Period, Polar, QMark, Reviser, Vocative } from "./tokens.js";
import type { ParseResult } from "./types.js";

export { classify, classifyAll, createClassifyTables, NEED_ROOTS } from "./classify.js";
export { parseSentenceTokens, SentenceParseError } from "./sentence-parser.js";
export { classifyToTokenType } from "./tokens.js";
export { segmentUtterance, tokenizeUtterance } from "./tokenize.js";
export { parseWord, parseWords, WordParseError } from "./word.js";
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

/** End-to-end parse: surface text → sentence AST. */
export function parse(text: string, tables?: ClassifyTables): ParseResult {
  const resolvedTables = tables ?? loadDefaultTables();
  const tokens = tokenizeUtterance(text, resolvedTables);
  const groups = splitUtteranceGroups(tokens);

  const utterances = groups.flatMap((group) => {
    if (group.length === 0) return [];
    return parseSentenceTokens(group).utterances;
  });

  return { utterances };
}
