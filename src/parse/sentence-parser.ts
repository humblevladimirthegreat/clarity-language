/** The sentence parser's entry points: the shared parser instance, parsing a token list, and the grammar's productions. */

import type { CstNode, IToken } from "chevrotain";
import { assignHookJobs } from "./hook-jobs.js";
import type { ParseResult } from "./types.js";
import { AgebenSentenceParser } from "./sentence-grammar.js";
import { markContext } from "./mark-context.js";
import { SentenceParseError } from "./sentence-shapes.js";
import { buildUtterances } from "./sentence-build.js";

// Built on first use: construction takes seconds, and many importers never parse a sentence.
let parserInstance: AgebenSentenceParser | undefined;
function sentenceParser(): AgebenSentenceParser {
  return (parserInstance ??= new AgebenSentenceParser());
}
let lastCst: CstNode | undefined;
export function parseSentenceTokens(input: IToken[]): ParseResult {
  const tokens = markContext(input);
  const parser = sentenceParser();
  parser.input = tokens;
  const cst = parser.document();
  lastCst = cst;

  if (parser.errors.length > 0) {
    throw new SentenceParseError(
      parser.errors.map((e) => e.message).join("; "),
      parser.errors,
    );
  }

  const utterances = buildUtterances(cst, tokens);
  const result = { utterances };
  assignHookJobs(result);
  return result;
}

/** Parse and also return the CST (construction tracing reads rule / child keys off it). */
export function parseSentenceTokensWithCst(tokens: IToken[]): { result: ParseResult; cst: CstNode } {
  const result = parseSentenceTokens(tokens);
  return { result, cst: lastCst! };
}

/** Grammar productions keyed by rule name (the sentence-layer construction inventory). */
export function sentenceGrammar(): ReturnType<AgebenSentenceParser["getGAstProductions"]> {
  return sentenceParser().getGAstProductions();
}
