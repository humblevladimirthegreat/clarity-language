import { parse as peggyParse } from "../generated/word-parser.js";
import { segmentUtterance, type TokenizeSegment } from "../parse/tokenize.js";
import type { MorphWord, PunctKind } from "../parse/types.js";
import { parseWord } from "../parse/word.js";
import { isNativeSurface, toPhonemeWord, type PhonemeWord } from "./phonemes.js";
import { numberWordToSpeech } from "./numbers.js";
import { expandOpaqueSpan, expandWritingSpan } from "./spans.js";

export type SkipReason = "foreign" | "writing" | "punct" | "island" | "error" | "shorthand";

export type BoundaryTag = "period" | "qmark" | "bang";

export type SpeechToken =
  | { kind: "word"; raw: string }
  | { kind: "boundary"; tag: BoundaryTag; raw: string }
  | { kind: "skip"; raw: string; reason: SkipReason };

export type SpeechPlan = {
  tokens: SpeechToken[];
  spoken: string[];
  skipped: { raw: string; reason: SkipReason }[];
};

export type PhonemePlan = {
  words: PhonemeWord[];
  skipped: { raw: string; reason: SkipReason }[];
  espeak: string;
};

function isNumberWord(word: MorphWord): boolean {
  const family = word.family;
  return family.kind === "number" || (family.kind === "x" && family.xFamily === "numeric");
}

export function expandWordToTokens(word: MorphWord): SpeechToken[] {
  const family = word.family;

  if (family.kind === "writingSpan") {
    return expandWritingSpan(word, expandWordToTokens);
  }

  if (family.kind === "foreign") {
    if (family.opaque) return expandOpaqueSpan(word);
    return [{ kind: "skip", raw: word.raw, reason: "foreign" }];
  }

  if (isNumberWord(word)) {
    return [{ kind: "word", raw: numberWordToSpeech(word) }];
  }

  if (!isNativeSurface(word.raw)) {
    return [{ kind: "skip", raw: word.raw, reason: "shorthand" }];
  }

  return [{ kind: "word", raw: word.raw }];
}

type SpeechSegment =
  | { kind: "word"; word: MorphWord }
  | { kind: "punct"; punct: PunctKind }
  | { kind: "islandEdge" };

/** Batch whitespace-split chunks and parse with Peggy `words` (same as sentence tokenize). */
function speechSegmentsFromText(text: string): SpeechSegment[] {
  const raw = segmentUtterance(text);
  const out: SpeechSegment[] = [];
  let wordBatch: string[] = [];

  function flushWords(): void {
    if (wordBatch.length === 0) return;
    const joined = wordBatch.join(" ");
    const parsed = peggyParse(joined, { startRule: "words" }) as MorphWord[];
    for (const word of parsed) out.push({ kind: "word", word });
    wordBatch = [];
  }

  for (const segment of raw) {
    if (segment.kind === "word") {
      wordBatch.push(segment.text);
      continue;
    }
    flushWords();
    if (segment.kind === "punct") out.push({ kind: "punct", punct: segment.punct });
    else out.push({ kind: "islandEdge" });
  }
  flushWords();
  return out;
}

export function toSpeech(segments: TokenizeSegment[]): SpeechToken[] {
  const tokens: SpeechToken[] = [];

  for (const segment of segments) {
    if (segment.kind === "punct") {
      tokens.push({
        kind: "boundary",
        tag: segment.punct,
        raw: punctChar(segment.punct),
      });
      continue;
    }
    if (segment.kind === "islandEdge") {
      tokens.push({ kind: "skip", raw: "^", reason: "island" });
      continue;
    }
    try {
      const word = parseWord(segment.text);
      tokens.push(...expandWordToTokens(word));
    } catch {
      tokens.push({ kind: "skip", raw: segment.text, reason: "error" });
    }
  }

  return tokens;
}

export function toSpeechText(text: string): SpeechToken[] {
  const tokens: SpeechToken[] = [];

  for (const segment of speechSegmentsFromText(text)) {
    if (segment.kind === "punct") {
      tokens.push({
        kind: "boundary",
        tag: segment.punct,
        raw: punctChar(segment.punct),
      });
      continue;
    }
    if (segment.kind === "islandEdge") {
      tokens.push({ kind: "skip", raw: "^", reason: "island" });
      continue;
    }
    tokens.push(...expandWordToTokens(segment.word));
  }

  return tokens;
}

function buildPlan(tokens: SpeechToken[]): SpeechPlan {
  return {
    tokens,
    spoken: tokens.filter((t): t is { kind: "word"; raw: string } => t.kind === "word").map((t) => t.raw),
    skipped: tokens.filter((t): t is { kind: "skip"; raw: string; reason: SkipReason } => t.kind === "skip"),
  };
}

export function previewSpeech(text: string): SpeechPlan {
  return buildPlan(toSpeechText(text));
}

function boundaryToEspeak(tag: BoundaryTag): string {
  if (tag === "qmark") return "?";
  if (tag === "bang") return "!";
  return ".";
}

export function toPhonemes(plan: SpeechPlan): PhonemePlan {
  const words: PhonemeWord[] = [];
  const parts: string[] = [];

  for (const token of plan.tokens) {
    if (token.kind === "word") {
      const phoneme = toPhonemeWord(token.raw);
      words.push(phoneme);
      parts.push(phoneme.espeak);
      continue;
    }
    if (token.kind === "boundary") {
      parts.push(boundaryToEspeak(token.tag));
    }
  }

  const espeak = wrapEspeakParts(parts);

  return {
    words,
    skipped: plan.skipped,
    espeak,
  };
}

/** Join phoneme spans and punctuation for eSpeak clause intonation. */
function wrapEspeakParts(parts: string[]): string {
  if (parts.length === 0) return "";
  const chunks: string[] = [];
  let phonemeRun: string[] = [];

  function flushPhonemes(): void {
    if (phonemeRun.length === 0) return;
    chunks.push(`[[${phonemeRun.join(" _ ")}]]`);
    phonemeRun = [];
  }

  for (const part of parts) {
    if (part === "." || part === "?" || part === "!") {
      flushPhonemes();
      chunks.push(part);
    } else {
      phonemeRun.push(part);
    }
  }
  flushPhonemes();
  return chunks.join("");
}

export function previewPhonemes(text: string): PhonemePlan {
  return toPhonemes(previewSpeech(text));
}

function punctChar(punct: BoundaryTag): string {
  if (punct === "qmark") return "?";
  if (punct === "bang") return "!";
  return ".";
}

export function skipLabel(reason: SkipReason): string {
  switch (reason) {
    case "foreign":
      return "foreign surface — not Agelan phonology";
    case "writing":
      return "writing-only span";
    case "shorthand":
      return "unexpanded writing shorthand";
    case "punct":
      return "punctuation";
    case "island":
      return "island edge (no spoken open/close yet)";
    case "error":
      return "unparsed token";
  }
}
