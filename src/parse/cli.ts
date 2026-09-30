#!/usr/bin/env node
import { readFileSync } from "node:fs";

import { parse, SentenceParseError } from "./index.js";
import { unknownWords } from "./lexicon-check.js";

const USAGE = [
  "Usage: node scripts/parse.mjs [--check-ambiguity] [--check-lexicon] [--constructions] '<Agazan text>' ['<Agazan text>' ...]",
  "       node scripts/parse.mjs [--check-ambiguity] [--check-lexicon] [--constructions] - < inputs.txt   (one input per line)",
  "  --check-lexicon  exit 1 and list words the lexicon does not know (a stem that only parses is not a lexicon word)",
].join("\n");

function reportUnknown(word: { raw: string; maybeCompound: string[] }): string {
  const hint = word.maybeCompound.length > 0 ? ` (unlisted compound? ${word.maybeCompound.join(" / ")})` : "";
  return `not in the lexicon: ${word.raw}${hint}`;
}

const raw = process.argv.slice(2);
const checkAmbiguity = raw.includes("--check-ambiguity");
const constructions = raw.includes("--constructions");
const checkLexicon = raw.includes("--check-lexicon");
const args = raw.filter((arg) => arg !== "--check-ambiguity" && arg !== "--constructions" && arg !== "--check-lexicon");

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

if (inputs.length === 1) {
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
