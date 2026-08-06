/**
 * Convert English text to a Clarity root.
 *
 * Run: npm run convert-word -- fishing
 *      npm run convert-word -- --unique fishing
 */
import { toClarityWord, toUniqueClarityWord } from "../src/word-converter.js";

type CliOptions = {
  input: string;
  unique: boolean;
  syllables: number;
};

function parseArgs(argv: string[]): CliOptions {
  let unique = false;
  let syllables = 2;
  const parts: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--unique") {
      unique = true;
      continue;
    }
    if (arg === "--syllables") {
      const value = argv[++i];
      if (!value || Number.isNaN(Number(value))) {
        throw new Error("Missing or invalid value for --syllables");
      }
      syllables = Number(value);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    parts.push(arg);
  }

  const input = parts.join(" ").trim();
  if (!input) {
    printUsage();
    throw new Error("Missing input text");
  }

  return { input, unique, syllables };
}

function printUsage(): void {
  console.error(`Usage: npm run convert-word -- <english> [--unique] [--syllables N]

Examples:
  npm run convert-word -- fishing
  npm run convert-word -- --unique fishing`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const root = options.unique
    ? toUniqueClarityWord(options.input)
    : toClarityWord(options.input, options.syllables);
  console.log(root);
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
