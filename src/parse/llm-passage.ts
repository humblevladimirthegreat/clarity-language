/**
 * The translation prompt for a passage of raw Egabon: parse it for constructions, gloss each
 * input, and hand both to [llm-prompt.ts](./llm-prompt.ts). Shared by the parse CLI and the
 * Inspect page, so neither needs node:fs.
 */
import type { ClassifyTables } from "./classify.js";
import { buildPrompt, type PromptContext, type PromptOptions } from "./llm-prompt.js";
import { morphGlossLine } from "./morph-gloss.js";
import { parseWithTables } from "./parse-core.js";

function withFinalStop(text: string): string {
  return /[.]$/.test(text) ? text : `${text}.`;
}

/** Each input's gloss line, glossed after the inputs before it so a `←` can reach back into them. */
export function passageGlosses(texts: readonly string[], tables: ClassifyTables): string[] {
  const sentences = texts.map(withFinalStop);
  const out: string[] = [];
  let before = "";
  sentences.forEach((_, k) => {
    const upTo = morphGlossLine(sentences.slice(0, k + 1).join(" "), tables, { strict: true });
    out.push(k > 0 && upTo.startsWith(`${before} . `) ? upTo.slice(before.length + 3) : morphGlossLine(sentences[k]!, tables, { strict: true }));
    before = upTo;
  });
  return out;
}

/** The whole prompt for `inputs` (one numbered gloss line each when there are several). */
export function promptForPassage(
  inputs: readonly string[],
  tables: ClassifyTables,
  context: PromptContext,
  options: PromptOptions = {},
): string {
  const passage = parseWithTables(inputs.map(withFinalStop).join(" "), tables, { constructions: true });
  return buildPrompt(passageGlosses(inputs, tables), passage.constructions ?? [], context, options);
}
