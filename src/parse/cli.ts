#!/usr/bin/env node
import { readFileSync } from "node:fs";

import { orderRegistry } from "../lint/construction-order.js";
import { formatLater, laterConstructions, orderPoint, stageLearningOrder } from "../lint/draft-order.js";
import { parseCliArgs } from "./cli-args.js";
import { describeError, describeUnknown, reportInput } from "./cli-report.js";
import { loadDefaultTables, parse, parseWithTables } from "./index.js";
import { unknownWords } from "./lexicon-check.js";
import { loadPromptContext } from "./llm-examples.js";
import { promptForPassage } from "./llm-passage.js";

const USAGE = [
  "Usage: node scripts/parse.mjs [--check-ambiguity] [--check-lexicon] [--constructions] [--at <page>[#<id>]] [--json] '<Ageben text>' ['<Ageben text>' ...]",
  "       node scripts/parse.mjs [same flags] - < inputs.txt   (one input per line)",
  "       node scripts/parse.mjs --llm-prompt [--loose] [--examples N] '<Ageben text>' ['<Ageben text>' ...]",
  "  Prints each input, then its morph gloss or a one-line error, then words the lexicon does not know.",
  "  Exits 1 when any input does not parse.",
  "  --json             print the parse tree instead (one input: an object; several: an array)",
  "  --check-ambiguity  also report readings no grammar rule picks between",
  "  --check-lexicon    also exit 1 when a word is not in the lexicon (a stem that only parses is not a lexicon word)",
  "  --constructions    also list the construction IDs each parse used",
  "  --at <page>[#<id>] also list, and exit 1 on, each construction whose home comes after that point in the",
  "                     reading order (learning-order  <id>  →  <home>); <page> alone passes anything homed on it",
  "  --llm-prompt       print a translation prompt for an LLM with no Ageben context (several inputs make one passage)",
  "  --loose            with --llm-prompt: ask for the sentence only, no note",
  "  --examples N       with --llm-prompt: how many doc examples to show (default 4; 0 for none)",
].join("\n");

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
const { checkAmbiguity, constructions, checkLexicon, llmPrompt, loose, examples, json, at, args } = parsed;

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
} else if (!json) {
  const tables = loadDefaultTables();
  // `--at`: the learning-order check of lint:ageben, run on drafts at one point.
  let draftOrder: { check: (ids: readonly string[]) => string[] } | undefined;
  if (at !== undefined) {
    const order = stageLearningOrder();
    const registry = orderRegistry(tables.overlays.values());
    let point: ReturnType<typeof orderPoint>;
    try {
      point = orderPoint(order, at);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
    draftOrder = { check: (ids) => laterConstructions(order, registry, point, ids).map((later) => formatLater(later, point)) };
  }
  let failed = false;
  for (const input of inputs) {
    const report = reportInput(input, tables, { checkAmbiguity, constructions, checkLexicon });
    if (draftOrder) {
      let ids: readonly string[] = [];
      try {
        ids = parseWithTables(input, tables, { constructions: true }).constructions ?? [];
      } catch {
        // The report already shows the parse error.
      }
      const lines = draftOrder.check(ids);
      for (const line of lines) report.lines.push(`  ${line}`);
      if (lines.length > 0) report.failed = true;
    }
    console.log(report.lines.join("\n"));
    if (report.failed) failed = true;
  }
  if (failed) process.exit(1);
} else if (inputs.length === 1) {
  try {
    const result = parse(inputs[0]!, undefined, { checkAmbiguity, constructions });
    console.log(JSON.stringify(result, null, 2));
    if (checkLexicon) {
      const unknown = unknownWords(result);
      for (const word of unknown) console.error(describeUnknown(word));
      if (unknown.length > 0) process.exit(1);
    }
  } catch (error) {
    console.error(describeError(error));
    process.exit(1);
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
