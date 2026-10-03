import type { MorphWord } from "../parse/types.js";
import { parseWord } from "../parse/word.js";
import type { SpeechToken } from "./plan.js";

function interiorTokens(payload: string): string[] {
  const trimmed = payload.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/);
}

function expandInterior(
  payload: string,
  expandWord: (word: MorphWord) => SpeechToken[],
): SpeechToken[] {
  const tokens: SpeechToken[] = [];
  for (const text of interiorTokens(payload)) {
    try {
      const inner = parseWord(text);
      tokens.push(...expandWord(inner));
    } catch {
      tokens.push({ kind: "skip", raw: text, reason: "foreign" });
    }
  }
  return tokens;
}

/**
 * A span has no spoken form (spans.md): speech says the interior's words and nothing for the brackets
 * or marks. An opaque `<…>` interior is foreign text, so it is skipped.
 */
export function expandWritingSpan(
  word: MorphWord,
  expandWord: (word: MorphWord) => SpeechToken[],
): SpeechToken[] {
  const family = word.family;
  if (family.kind !== "writingSpan") {
    throw new Error(`Not a writing span: ${word.raw}`);
  }
  if (family.bracket === "<") return [{ kind: "skip", raw: family.payload, reason: "foreign" }];
  return expandInterior(family.payload, expandWord);
}
