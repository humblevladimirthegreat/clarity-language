#!/usr/bin/env node
import { readFileSync } from "node:fs";

import { parse, SentenceParseError } from "./index.js";

const USAGE = [
  "Usage: node scripts/parse.mjs [--check-ambiguity] '<Agalan text>' ['<Agalan text>' ...]",
  "       node scripts/parse.mjs [--check-ambiguity] - < inputs.txt   (one input per line)",
].join("\n");

const raw = process.argv.slice(2);
const checkAmbiguity = raw.includes("--check-ambiguity");
const args = raw.filter((arg) => arg !== "--check-ambiguity");

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
    console.log(JSON.stringify(parse(inputs[0]!, undefined, { checkAmbiguity }), null, 2));
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
      return { input, result: parse(input, undefined, { checkAmbiguity }) };
    } catch (error) {
      // Record any failure (sentence or word level) so one bad input does not end the batch.
      failed = true;
      return { input, error: error instanceof Error ? error.message : String(error) };
    }
  });
  console.log(JSON.stringify(results, null, 2));
  if (failed) process.exit(1);
}
