/**
 * Entry for the published parser bundle (`/tools/ageben.mjs`, built by
 * [agent-bundle.ts](../../scripts/lib/agent-bundle.ts)): the browser parser with the lexicon and
 * the translation prompt's doc examples inlined, so an agent can run it with no repo and no network.
 * Importable from Node, Deno, Bun, or a browser; run directly with Node it is a small CLI.
 */
import { createClassifyTables, inspectText, morphGlossLine, type InspectResult } from "../parse/browser.js";
import { reportInput } from "../parse/cli-report.js";
import { promptForPassage } from "../parse/llm-passage.js";
import type { PromptContext } from "../parse/llm-prompt.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { ParseResult } from "../parse/types.js";
import { unknownWordsWith, type UnknownWord } from "../parse/unknown-words.js";
// Resolved by the bundle build: the three lexicon CSVs and the prompt context as JSON-safe data.
import { compoundsCsv, contextData, overlaysCsv, publishedCsv } from "ageben:data";

const tables = createClassifyTables(publishedCsv, overlaysCsv, compoundsCsv);

const promptContext: PromptContext = {
  index: contextData.index.map((pair) => ({ ...pair, source: "" })),
  labelGlosses: new Map(contextData.labelGlosses),
  readers: new Map(contextData.readers),
};

export type CheckResult = {
  input: string;
  ok: boolean;
  /** Bracketed morph gloss, when the input parses and every word has a sense. */
  gloss?: string;
  /** One-line parse error. */
  error?: string;
  /** Words that parse but are not in the lexicon. */
  unknown: UnknownWord[];
};

/** Parse one input: its morph gloss, or the error, plus words the lexicon does not know. */
export function check(input: string): CheckResult {
  let result: ParseResult;
  try {
    result = parseWithTables(input, tables);
  } catch (error) {
    return { input, ok: false, error: firstLine(error), unknown: [] };
  }
  const unknown = unknownWordsWith(result, tables);
  try {
    return { input, ok: true, gloss: morphGlossLine(input, tables, { strict: true }), unknown };
  } catch (error) {
    return { input, ok: true, error: `no gloss: ${firstLine(error)}`, unknown };
  }
}

/** The same report `parse.mjs` prints for one input: the input, then its gloss or error lines. */
export function report(input: string): string {
  return reportInput(input, tables, { checkAmbiguity: false, constructions: false, checkLexicon: false }).lines.join(
    "\n",
  );
}

/** The parse tree. Throws on a parse error. */
export function parseTree(input: string): ParseResult {
  return parseWithTables(input, tables);
}

/** Per-word inspect data, as the Inspect page shows it. */
export function inspect(input: string): InspectResult {
  return inspectText(input, tables);
}

/**
 * A prompt asking an LLM to translate `inputs` into English (several inputs are one passage), the
 * same as the Inspect page's Copy Translation Prompt. Throws when an input does not parse.
 */
export function translationPrompt(inputs: string | readonly string[], options: { loose?: boolean; examples?: number } = {}): string {
  const list = typeof inputs === "string" ? inputs.split("\n").map((line) => line.trim()).filter(Boolean) : inputs;
  return promptForPassage(list, tables, promptContext, options);
}

function firstLine(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).split("\n")[0]!;
}

const USAGE = `Usage: node ageben.mjs [--prompt [--loose] [--examples N] | --json] '<Ageben text>' ['<Ageben text>' ...]
       node ageben.mjs [flags] - < inputs.txt   (one input per line)
  Prints each input, then its morph gloss or a one-line error, then words the lexicon does not know.
  Exits 1 when any input does not parse.
  --prompt       print a prompt that asks an LLM to translate the inputs (several inputs make one passage)
  --loose        with --prompt: ask for the sentence only, no note
  --examples N   with --prompt: how many doc examples to show (default 4; 0 for none)
  --json         print check() results as JSON
Import it instead for check(), report(), parseTree(), inspect(), and translationPrompt().`;

type NodeProcess = {
  argv: string[];
  exitCode?: number;
  stdin: AsyncIterable<unknown>;
  stdout: { write(text: string): void };
  stderr: { write(text: string): void };
};

/** True when Node runs this file directly (not when it is imported). */
function runAsCli(proc: NodeProcess | undefined): proc is NodeProcess {
  const script = proc?.argv?.[1];
  if (!script || !import.meta.url.startsWith("file:")) return false;
  const self = decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
  return self === script.replace(/\\/g, "/");
}

async function cli(proc: NodeProcess): Promise<void> {
  const args = proc.argv.slice(2);
  let prompt = false;
  let loose = false;
  let json = false;
  let examples: number | undefined;
  const inputs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--prompt") prompt = true;
    else if (arg === "--loose") loose = true;
    else if (arg === "--json") json = true;
    else if (arg === "--examples") {
      examples = Number(args[++i]);
      if (!Number.isInteger(examples) || examples < 0) return fail(proc, "--examples needs a whole number");
    } else if (arg === "--help" || arg === "-h") {
      proc.stdout.write(`${USAGE}\n`);
      return;
    } else if (arg === "-") {
      let text = "";
      for await (const chunk of proc.stdin) text += String(chunk);
      inputs.push(...text.split("\n").map((line) => line.trim()).filter(Boolean));
    } else if (arg.startsWith("--")) return fail(proc, `unknown flag ${arg}`);
    else inputs.push(arg);
  }
  if (inputs.length === 0) return fail(proc, "no input");
  if (prompt && json) return fail(proc, "--prompt prints text; it does not combine with --json");
  if (!prompt && (loose || examples !== undefined)) return fail(proc, "--loose and --examples go with --prompt");
  if (prompt) {
    try {
      proc.stdout.write(translationPrompt(inputs, { loose, examples }));
    } catch (error) {
      fail(proc, firstLine(error), false);
    }
    return;
  }
  const results = inputs.map(check);
  if (json) proc.stdout.write(`${JSON.stringify(results.length === 1 ? results[0] : results, null, 2)}\n`);
  else proc.stdout.write(`${inputs.map(report).join("\n")}\n`);
  if (results.some((result) => !result.ok)) proc.exitCode = 1;
}

function fail(proc: NodeProcess, message: string, usage = true): void {
  proc.stderr.write(`${message}\n${usage ? `${USAGE}\n` : ""}`);
  proc.exitCode = 1;
}

const proc = (globalThis as { process?: NodeProcess }).process;
if (runAsCli(proc)) await cli(proc);
