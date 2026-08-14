import type { MorphWord, WritingBracket } from "../parse/types.js";
import { parseWord } from "../parse/word.js";
import type { SpeechToken } from "./plan.js";

const BRACKET_TYPE: Record<WritingBracket, "a" | "e" | "o" | "u"> = {
  "[": "a",
  "(": "e",
  "{": "o",
  "<": "u",
};

export function spanTypeVowel(bracket: WritingBracket): "a" | "e" | "o" | "u" {
  return BRACKET_TYPE[bracket];
}

function spanOpenSurface(
  pos: string,
  typeV: "a" | "e" | "o" | "u",
  edgeV: "a" | "e" | "o" | "u",
  ending: string,
): string {
  return `${pos}${typeV}x${edgeV}${ending}`;
}

function interiorTokens(payload: string): string[] {
  const trimmed = payload.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/);
}

function edgeForPayload(payload: string, anaphor: boolean): "a" | "e" | "o" | "u" {
  if (anaphor) return "u";
  const tokens = interiorTokens(payload);
  if (tokens.length === 0) return "u";
  if (tokens.length === 1) return "o";
  return "a";
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

export function expandWritingSpan(
  word: MorphWord,
  expandWord: (word: MorphWord) => SpeechToken[],
): SpeechToken[] {
  const family = word.family;
  if (family.kind !== "writingSpan") {
    throw new Error(`Not a writing span: ${word.raw}`);
  }

  const pos = word.pos ?? "d";
  const typeV = spanTypeVowel(family.bracket);
  const ending = word.ending ?? "l";
  const edgeV = edgeForPayload(family.payload, family.anaphor);
  const open = spanOpenSurface(pos, typeV, edgeV, ending);

  const tokens: SpeechToken[] = [{ kind: "word", raw: open }];

  if (edgeV === "u") return tokens;

  if (edgeV === "o") {
    tokens.push(...expandInterior(family.payload, expandWord));
    return tokens;
  }

  tokens.push(...expandInterior(family.payload, expandWord));
  tokens.push({ kind: "word", raw: "xuxul" });
  return tokens;
}

export function expandOpaqueSpan(word: MorphWord): SpeechToken[] {
  const family = word.family;
  if (family.kind !== "foreign" || !family.opaque) {
    throw new Error(`Not an opaque span: ${word.raw}`);
  }

  const pos = word.pos ?? "d";
  const payload = family.payload;
  const anaphor = payload === "=";
  const edgeV = edgeForPayload(anaphor ? "=" : payload, anaphor);
  const ending = anaphor ? "r" : "l";
  const open = spanOpenSurface(pos, "u", edgeV, ending);

  const tokens: SpeechToken[] = [{ kind: "word", raw: open }];

  if (edgeV === "o") {
    tokens.push({ kind: "skip", raw: payload, reason: "foreign" });
    return tokens;
  }
  if (edgeV === "a") {
    tokens.push({ kind: "skip", raw: payload, reason: "foreign" });
    tokens.push({ kind: "word", raw: "xuxul" });
    return tokens;
  }

  return tokens;
}
