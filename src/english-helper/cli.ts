/**
 * English → Agebon helper: per-clause root and grammar suggestions for English input.
 *
 *   node scripts/english-helper.mjs 'My sister could not come.'
 *   node scripts/english-helper.mjs 'He saw/n the saw.' --stage beginner
 *   node scripts/english-helper.mjs 'Azawan walks.' --json
 *   node scripts/english-helper.mjs 'Azawan walks.' --llm-prompt
 *   node scripts/english-helper.mjs 'Azawan walks.' --verify '<agebon draft>'
 *
 * Suggestion-only: it never writes the Agebon sentence. A word with several jobs lists them
 * all; pick by meaning and open the linked section. Force a reading with `word/n`, `/v`,
 * `/adj` or `/adv`. Words with no suggestion are listed as gaps with the forms tried.
 * `--llm-prompt` wraps the suggestions in a prompt for an LLM (llm-prompt.ts); `--verify` puts
 * the parser's output for a draft beside each English line (verify.ts).
 */
import { BANDS, type Band } from "../lint/learning-order.js";
import { loadDefaultTables } from "../parse/index.js";
import { loadPromptContext } from "../parse/llm-examples.js";
import { analyzeEnglish, slotTier } from "./analyze.js";
import { analysisLines } from "./describe.js";
import { promptForEnglish } from "./llm-prompt.js";
import { loadHelperData } from "./load.js";
import { verifiedLines, verifyDraft } from "./verify.js";

function usage(message: string, code = 2): never {
  console.error(
    [
      message,
      `usage: english-helper.mjs '<english>' ['<english>'…] [--json] [--stage ${BANDS.join("|")}]`,
      "       english-helper.mjs '<english>' ['<english>'…] --llm-prompt [--examples N] [--stage …]",
      "       english-helper.mjs '<english>' --verify '<agebon draft>' ['<english>' --verify '<draft>'…] [--json]",
      "  --llm-prompt  print an English → Agebon prompt for an LLM (several inputs make one numbered prompt)",
      "  --examples N  with --llm-prompt: how many doc examples to show (default 6; 0 for none)",
      "  --verify      parse a draft, list words the lexicon does not know, print its morph gloss, and line up each word's sense with the English",
    ].join("\n"),
  );
  process.exit(code);
}

const inputs: string[] = [];
const drafts: string[] = [];
let json = false;
let llmPrompt = false;
let examples: number | undefined;
let stage: Band | undefined;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === "--json") json = true;
  else if (arg === "--llm-prompt") llmPrompt = true;
  else if (arg === "--stage") {
    const value = args[++i];
    if (!BANDS.includes(value as Band)) usage(`--stage needs one of ${BANDS.join(", ")}`);
    stage = value as Band;
  } else if (arg === "--examples") {
    examples = Number(args[++i]);
    if (!Number.isInteger(examples) || examples < 0) usage("--examples needs a whole number");
  } else if (arg === "--verify") {
    const draft = args[++i];
    if (!draft) usage("--verify needs an Agebon draft");
    drafts.push(draft);
  } else if (arg === "--help" || arg === "-h") usage("Suggest Agebon roots and grammar sections for English.", 0);
  else if (arg.startsWith("--")) usage(`unknown flag ${arg}`);
  else inputs.push(arg);
}
if (inputs.length === 0) usage("give at least one English sentence");
if (examples !== undefined && !llmPrompt) usage("--examples goes with --llm-prompt");
if (drafts.length > 0 && (llmPrompt || stage)) usage("--verify checks drafts; it does not combine with --llm-prompt or --stage");
if (drafts.length > 0 && drafts.length !== inputs.length) usage(`give one --verify draft per English line (${inputs.length} English, ${drafts.length} drafts)`);
if (llmPrompt && json) usage("--llm-prompt prints text; it does not combine with --json");

if (drafts.length > 0) {
  const tables = loadDefaultTables();
  const data = loadHelperData();
  const verified = inputs.map((english, k) => verifyDraft(english, drafts[k]!, tables, data));
  if (json) console.log(JSON.stringify(verified, null, 2));
  else console.log(verified.map((v) => verifiedLines(v).join("\n")).join("\n\n"));
  if (verified.some((v) => v.error || v.unknown.length > 0)) process.exit(1);
  process.exit(0);
}

const data = loadHelperData();

if (llmPrompt) {
  const tables = loadDefaultTables();
  process.stdout.write(promptForEnglish(inputs, data, loadPromptContext(tables), { stage, ...(examples === undefined ? {} : { examples }) }));
  process.exit(0);
}

const results = inputs.map((input) => ({ input, analysis: analyzeEnglish(data, input, { stage }) }));

if (json) {
  console.log(JSON.stringify(results, (key, value) => (key === "tags" ? undefined : value), 2));
} else {
  for (const { input, analysis } of results) {
    if (inputs.length > 1) console.log(`== ${input}`);
    for (const line of analysisLines(data, analysis)) console.log(line);
    const tally = new Map<string, number>();
    for (const slot of analysis.clauses.flatMap((c) => c.slots)) tally.set(slotTier(slot), (tally.get(slotTier(slot)) ?? 0) + 1);
    console.log(`tiers: ${[...tally].map(([t, n]) => `${t} ${n}`).join(", ")}`);
    if (inputs.length > 1) console.log();
  }
}
