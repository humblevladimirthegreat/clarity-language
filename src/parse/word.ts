import { parse as pegParse } from "../generated/word-parser.js";
import type { MorphWord } from "./types.js";

export type {
  Ending,
  MorphWord,
  MorphWordFamily,
  NumberGroup,
  NumberStem,
  Pos,
  SpanCloseFlavor,
  XFamily,
} from "./types.js";

export class WordParseError extends Error {
  readonly input: string;
  readonly location?: { line: number; column: number; offset: number };

  constructor(input: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Could not parse Agelan word ${JSON.stringify(input)}: ${message}`);
    this.name = "WordParseError";
    this.input = input;
    if (cause && typeof cause === "object" && "location" in cause) {
      const loc = (cause as { location?: { start?: { line: number; column: number; offset: number } } })
        .location?.start;
      if (loc) this.location = loc;
    }
  }
}

/** Parse one Agelan token into a Stage-1 `MorphWord`. */
export function parseWord(input: string): MorphWord {
  try {
    return pegParse(input) as MorphWord;
  } catch (cause) {
    throw new WordParseError(input, cause);
  }
}

/** Parse whitespace-separated Agelan tokens. */
export function parseWords(input: string): MorphWord[] {
  try {
    return pegParse(input, { startRule: "words" }) as MorphWord[];
  } catch (cause) {
    throw new WordParseError(input, cause);
  }
}
