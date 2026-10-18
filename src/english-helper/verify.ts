/**
 * `--verify`: the parser's existing checks on an Agazan draft, to show beside its English. It adds
 * no checks of its own: a sentence parse, the lexicon check (`parse.mjs --check-lexicon`), and
 * the morph gloss the Inspect page shows.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { unknownWords, type UnknownWord } from "../parse/lexicon-check.js";
import { morphGlossLine } from "../parse/morph-gloss.js";
import { parseWithTables } from "../parse/parse-core.js";

export type Verified = { english: string; agazan: string; gloss?: string; error?: string; unknown: UnknownWord[] };

export function verifyDraft(english: string, agazan: string, tables: ClassifyTables): Verified {
  try {
    const unknown = unknownWords(parseWithTables(agazan, tables));
    return { english, agazan, gloss: morphGlossLine(agazan, tables), unknown };
  } catch (error) {
    return { english, agazan, error: error instanceof Error ? error.message : String(error), unknown: [] };
  }
}

export function verifiedLines(v: Verified): string[] {
  const out = [`English: ${v.english}`, `Agazan:  ${v.agazan}`];
  if (v.error) out.push(`parse error: ${v.error}`);
  if (v.gloss) out.push(`gloss:   ${v.gloss}`);
  for (const word of v.unknown) {
    const hint = word.maybeCompound.length > 0 ? ` (unlisted compound? ${word.maybeCompound.join(" / ")})` : "";
    out.push(`not in the lexicon: ${word.raw}${hint}`);
  }
  if (!v.error && v.unknown.length === 0) out.push("ok: parses, every word is in the lexicon");
  return out;
}
