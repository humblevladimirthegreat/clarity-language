/**
 * Retie Agalan tokens in docs/grammar/ from the map dumped by convert-word --lexicon.
 *
 * Run: npm run retie-docs
 *      npm run retie-docs -- --write
 *      npm run retie-docs -- --map tmp/lexicon-retie-map.json --write
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { parseRetieMapJson, RETIE_MAP_RELATIVE_PATH } from "../src/retie/map.js";
import { lineNumberAt, rewriteMarkdown } from "../src/retie/tokens.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(rootDir, "docs", "grammar");

type CliOptions = {
  mapPath: string;
  write: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  let mapPath = join(rootDir, RETIE_MAP_RELATIVE_PATH);
  let write = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--map") {
      const value = argv[++i];
      if (!value) {
        throw new Error("Missing value for --map");
      }
      mapPath = value;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { mapPath, write };
}

function printUsage(): void {
  console.error(`Usage: npm run retie-docs -- [--map PATH] [--write]

Reads ${RETIE_MAP_RELATIVE_PATH} (from convert-word --lexicon) and reties
Agalan tokens in docs/grammar/. Default is a dry-run.`);
}

function listGrammarMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === ".vitepress" || name === "public") {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listGrammarMarkdown(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out.sort();
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.mapPath)) {
    throw new Error(
      `Retie map not found: ${options.mapPath}\nRun npm run convert-word -- --lexicon first, or pass --map.`,
    );
  }

  const map = parseRetieMapJson(readFileSync(options.mapPath, "utf8"));
  const files = listGrammarMarkdown(grammarDir);
  let total = 0;
  let filesChanged = 0;

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const { text, changes } = rewriteMarkdown(original, map);
    if (changes.length === 0) {
      continue;
    }
    filesChanged += 1;
    total += changes.length;
    const rel = relative(rootDir, file);
    for (const change of changes) {
      const line = lineNumberAt(original, change.index);
      console.log(`${rel}:${line}  ${change.from} → ${change.to}`);
    }
    if (options.write) {
      writeFileSync(file, text);
    }
  }

  if (total === 0) {
    console.log("No reties.");
    return;
  }
  if (options.write) {
    console.log(`Wrote ${total} reties in ${filesChanged} files.`);
  } else {
    console.log(`Dry-run: ${total} reties in ${filesChanged} files. Pass --write to apply.`);
  }
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
