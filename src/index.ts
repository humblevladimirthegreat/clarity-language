import { CharStream, CommonTokenStream } from "antlr4ng";
import type { ParseTree } from "antlr4ng";

import { SentenceParserLexer } from "./generated/SentenceParserLexer.js";
import { SentenceParserParser } from "./generated/SentenceParserParser.js";

export { toClarityWord, toUniqueClarityWord } from "./word-converter.js";

export type ParseResult = {
  tree: ParseTree;
  parser: SentenceParserParser;
};

/** Parse Clarity Language input with the SentenceParser grammar. */
export function parseSentence(input: string): ParseResult {
  const chars = CharStream.fromString(input);
  const lexer = new SentenceParserLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new SentenceParserParser(tokens);
  const tree = parser.start();
  return { tree, parser };
}

export function treeToString(result: ParseResult): string {
  return result.tree.toStringTree(result.parser);
}
