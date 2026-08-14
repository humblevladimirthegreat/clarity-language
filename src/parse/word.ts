import { parse as peggyParse, SyntaxError as PeggySyntaxError } from "../generated/word-parser.js";

import type { MorphWord } from "./types.js";

export class WordParseError extends Error {
  readonly peggyError: PeggySyntaxError;

  constructor(peggyError: PeggySyntaxError) {
    super(peggyError.message);
    this.name = "WordParseError";
    this.peggyError = peggyError;
  }
}

/** Parse one Agelan word from surface text (Stage 1 Peggy grammar). */
export function parseWord(input: string): MorphWord {
  try {
    return peggyParse(input.trim()) as MorphWord;
  } catch (error) {
    if (error instanceof PeggySyntaxError) {
      throw new WordParseError(error);
    }
    throw error;
  }
}

/** Parse whitespace-separated words. */
export function parseWords(input: string): MorphWord[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/).map((token) => parseWord(token));
}
