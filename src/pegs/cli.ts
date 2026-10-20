/**
 * Digit pegs both ways (src/digit-pegs.ts; docs/grammar/pegs.md).
 *
 *   node scripts/pegs.mjs 2381 '555,1234'         # digits → ranked pegs per chunk
 *   node scripts/pegs.mjs 'zudozol dabedol varuvel' # words → digits
 *   node scripts/pegs.mjs --check                  # list empty 0–9 / 00–99 cells
 */
import { readFileSync } from "node:fs";

import { emptyCells, isDigitInput, pegBank, suggestPegs, wordDigits } from "../digit-pegs.js";
import { parsePublishedCsv } from "../lexicon-search.js";
import { classifyAll, loadDefaultTables, parseWords } from "../parse/index.js";
import { dataPath } from "../repo-paths.js";

function usage(message: string, code = 2): never {
  console.error(`${message}\nusage: pegs.mjs <digits|words> [<digits|words>…] [--json] [--limit N] | --check`);
  process.exit(code);
}

const inputs: string[] = [];
let json = false;
let check = false;
let limit = 5;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === "--json") json = true;
  else if (arg === "--check") check = true;
  else if (arg === "--limit") {
    limit = Number(args[++i]);
    if (!Number.isInteger(limit) || limit < 1) usage("--limit needs a positive integer");
  } else if (arg === "--help" || arg === "-h") usage("Digit pegs: digits to roots, or words to digits.", 0);
  else if (arg.startsWith("--")) usage(`unknown flag ${arg}`);
  else inputs.push(arg);
}
if (!check && inputs.length === 0) usage("give a digit string or Agebon words");

const bank = pegBank(parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8")));

if (check) {
  const empty = emptyCells(bank);
  if (json) console.log(JSON.stringify(empty));
  else console.log(empty.length ? `empty cells: ${empty.join(" ")}` : "every 0–9 and 00–99 cell has a root");
  process.exit(empty.length ? 1 : 0);
}

const results = inputs.map((input) => {
  if (isDigitInput(input)) return { input, chunks: suggestPegs(input, bank).map(({ chunk, pegs }) => ({ chunk, pegs: pegs.slice(0, limit), more: Math.max(0, pegs.length - limit) })) };
  try {
    return { input, words: classifyAll(parseWords(input), loadDefaultTables()).map(wordDigits) };
  } catch (error) {
    return { input, error: (error as Error).message };
  }
});

if (json) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const result of results) {
    console.log(result.input);
    if ("error" in result) console.log(`  error: ${result.error}`);
    for (const { chunk, pegs, more } of "chunks" in result ? result.chunks ?? [] : []) {
      const list = pegs.map((peg) => `${peg.emoji} \`${peg.root}\` ${peg.concrete}${peg.core ? " (core)" : ""}`).join(", ");
      console.log(`  ${chunk.padEnd(2)}  ${list || "(no root)"}${more ? `, +${more} more` : ""}`);
    }
    const words = "words" in result ? result.words ?? [] : [];
    for (const word of words) console.log(`  ${word.raw}  ${"digits" in word ? `${word.digits}  (${word.roots.join(" + ")})` : `not a peg: ${word.notPeg}`}`);
    if (words.length > 1) console.log(`  = ${words.map((word) => ("digits" in word ? word.digits : "·")).join(" ")}`);
  }
}
