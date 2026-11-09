/**
 * The default `parse.mjs` output: one short block per input (the input, then its morph gloss or
 * a one-line error, then any unknown words), instead of the parse tree. `--json` prints the tree.
 */
import type { ClassifyTables } from "./classify.js";
import { morphGlossLine } from "./morph-gloss.js";
import { parseWithTables } from "./parse-core.js";
import { unknownWordsWith, type UnknownWord } from "./unknown-words.js";
import { WordParseError } from "./word.js";

export type ReportOptions = {
  checkAmbiguity: boolean;
  constructions: boolean;
  checkLexicon: boolean;
};

export type InputReport = {
  /** The printed block: the input, then indented result lines. */
  lines: string[];
  /** The input did not parse, or (with `checkLexicon`) has words the lexicon does not know. */
  failed: boolean;
};

export function describeUnknown(word: UnknownWord): string {
  const hint = word.maybeCompound.length > 0 ? ` (unlisted compound? ${word.maybeCompound.join(" / ")})` : "";
  return `not in the lexicon: ${word.raw}${hint}`;
}

/** One line for a parse failure: which word, then the parser's message, with no stack. */
export function describeError(error: unknown): string {
  if (error instanceof WordParseError && error.word) return `ERROR word "${error.word}": ${error.message}`;
  const message = error instanceof Error ? error.message : String(error);
  return `ERROR ${message.split("\n")[0]}`;
}

export function reportInput(input: string, tables: ClassifyTables, options: ReportOptions): InputReport {
  const lines = [input];
  let result;
  try {
    result = parseWithTables(input, tables, { checkAmbiguity: options.checkAmbiguity, constructions: options.constructions });
  } catch (error) {
    lines.push(`  ${describeError(error)}`);
    return { lines, failed: true };
  }
  const unknown = unknownWordsWith(result, tables);
  try {
    lines.push(`  ${morphGlossLine(input, tables, { strict: true })}`);
  } catch (error) {
    // An unknown word has no sense to gloss; its own line below says so.
    if (unknown.length === 0) lines.push(`  no gloss: ${describeError(error).replace(/^ERROR /, "")}`);
  }
  for (const word of unknown) lines.push(`  ${describeUnknown(word)}`);
  for (const conflict of result.ambiguity ?? []) {
    lines.push(`  ambiguous: ${conflict.surface} (${conflict.detail})`);
  }
  if (options.constructions) lines.push(`  constructions: ${(result.constructions ?? []).join(", ")}`);
  return { lines, failed: options.checkLexicon && unknown.length > 0 };
}
