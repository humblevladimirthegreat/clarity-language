/** Flags `parse.mjs` accepts. Unknown `--…` flags are rejected so they are not parsed as Agebon. */

export const PARSE_FLAGS = [
  "--check-ambiguity",
  "--check-lexicon",
  "--constructions",
  "--llm-prompt",
  "--loose",
  "--examples",
] as const;

export type ParseCliOptions = {
  checkAmbiguity: boolean;
  constructions: boolean;
  checkLexicon: boolean;
  llmPrompt: boolean;
  loose: boolean;
  examples: number | undefined;
  args: string[];
};

/** Split argv after the node/script names. Throws an Error whose message is the usage lead. */
export function parseCliArgs(raw: string[]): ParseCliOptions {
  const known = new Set<string>(PARSE_FLAGS);
  const options: ParseCliOptions = {
    checkAmbiguity: false,
    constructions: false,
    checkLexicon: false,
    llmPrompt: false,
    loose: false,
    examples: undefined,
    args: [],
  };
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i]!;
    if (arg === "--examples") {
      const value = Number(raw[++i]);
      if (!Number.isInteger(value) || value < 0) throw new Error("--examples needs a whole number");
      options.examples = value;
    } else if (arg.startsWith("--")) {
      if (!known.has(arg)) throw new Error(`unknown flag ${arg}`);
      if (arg === "--check-ambiguity") options.checkAmbiguity = true;
      else if (arg === "--constructions") options.constructions = true;
      else if (arg === "--check-lexicon") options.checkLexicon = true;
      else if (arg === "--llm-prompt") options.llmPrompt = true;
      else if (arg === "--loose") options.loose = true;
    } else {
      options.args.push(arg);
    }
  }
  if (options.llmPrompt && (options.constructions || options.checkAmbiguity)) {
    throw new Error("--llm-prompt prints text; it does not combine with --constructions or --check-ambiguity");
  }
  if (!options.llmPrompt && (options.loose || options.examples !== undefined)) {
    throw new Error("--loose and --examples go with --llm-prompt");
  }
  return options;
}
