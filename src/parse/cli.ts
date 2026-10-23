#!/usr/bin/env node
import { readFileSync } from "node:fs";

import { parseCliArgs } from "./cli-args.js";
import { loadDefaultTables, parse, SentenceParseError } from "./index.js";
import { unknownWords } from "./lexicon-check.js";
import { loadPromptContext } from "./llm-examples.js";
import { promptForPassage } from "./llm-passage.js";

const USAGE = [
  "Usage: node scripts/parse.mjs [--check-ambiguity] [--check-lexicon] [--constructions] '<Agebon text>' ['<Agebon text>' ...]",
  "       node scripts/parse.mjs [--check-ambiguity] [--check-lexicon] [--constructions] - < inputs.txt   (one input per line)",
  "       node scripts/parse.mjs --llm-prompt [--loose] [--examples N] '<Agebon text>' ['<Agebon text>' ...]",
  "  Several quoted inputs print a JSON array. There is no --json flag.",
  "  --check-lexicon  exit 1 and list words the lexicon does not know (a stem that only parses is not a lexicon word)",
  "  --llm-prompt     print a translation prompt for an LLM with no Agebon context (several inputs make one passage)",
  "  --loose          with --llm-prompt: ask for the sentence only, no note",
  "  --examples N     with --llm-prompt: how many doc examples to show (default 4; 0 for none)",
].join("\n");

function reportUnknown(word: { raw: string; maybeCompound: string[] }): string {
  const hint = word.maybeCompound.length > 0 ? ` (unlisted compound? ${word.maybeCompound.join(" / ")})` : "";
  return `not in the lexicon: ${word.raw}${hint}`;
}

function usage(message: string): never {
  console.error(`${message}\n${USAGE}`);
  process.exit(1);
}

let parsed: ReturnType<typeof parseCliArgs>;
try {
  parsed = parseCliArgs(process.argv.slice(2));
} catch (error) {
  usage(error instanceof Error ? error.message : String(error));
}
const { checkAmbiguity, constructions, checkLexicon, llmPrompt, loose, examples, args } = parsed;

// Each argument is one input; `-` (or no arguments with piped stdin) reads one input per line.
const readStdin = args.includes("-") || (args.length === 0 && !process.stdin.isTTY);
const inputs = [
  ...args.filter((arg) => arg !== "-"),
  ...(readStdin ? readFileSync(0, "utf8").split("\n") : []),
]
  .map((text) => text.trim())
  .filter(Boolean);

if (inputs.length === 0) {
  console.error(USAGE);
  process.exit(1);
}

if (llmPrompt) {
  try {
    const tables = loadDefaultTables();
    const prompt = promptForPassage(inputs, tables, loadPromptContext(tables), { loose, examples });
    process.stdout.write(prompt);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
} else if (inputs.length === 1) {
  try {
    const result = parse(inputs[0]!, undefined, { checkAmbiguity, constructions });
    console.log(JSON.stringify(result, null, 2));
    if (checkLexicon) {
      const unknown = unknownWords(result);
      for (const word of unknown) console.error(reportUnknown(word));
      if (unknown.length > 0) process.exit(1);
    }
  } catch (error) {
    if (error instanceof SentenceParseError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
} else {
  let failed = false;
  const results = inputs.map((input) => {
    try {
      const result = parse(input, undefined, { checkAmbiguity, constructions });
      if (checkLexicon) {
        const unknown = unknownWords(result);
        if (unknown.length > 0) {
          failed = true;
          return { input, result, unknownWords: unknown };
        }
      }
      return { input, result };
    } catch (error) {
      // Record any failure (sentence or word level) so one bad input does not end the batch.
      failed = true;
      return { input, error: error instanceof Error ? error.message : String(error) };
    }
  });
  console.log(JSON.stringify(results, null, 2));
  if (failed) process.exit(1);
}
