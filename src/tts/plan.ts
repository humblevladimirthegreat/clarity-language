import { segmentUtterance } from "../parse/tokenize.js";
import type { MorphWord } from "../parse/types.js";
import { parseWord } from "../parse/word.js";
import { isNativeSurface, toPhonemeWord, type PhonemeWord } from "./phonemes.js";

export type SkipReason = "foreign" | "writing" | "punct" | "island" | "error" | "shorthand";

export type SpeechToken =
  | { kind: "word"; raw: string }
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

function skipReasonFor(word: MorphWord): SkipReason | null {
  if (word.family.kind === "foreign") return "foreign";
  if (word.family.kind === "writingSpan") return "writing";
  if (!isNativeSurface(word.raw)) return "shorthand";
  return null;
}

export function previewSpeech(text: string): SpeechPlan {
  const tokens: SpeechToken[] = [];
  for (const segment of segmentUtterance(text)) {
    if (segment.kind === "punct") {
      tokens.push({ kind: "skip", raw: punctChar(segment.punct), reason: "punct" });
      continue;
    }
    if (segment.kind === "islandEdge") {
      tokens.push({ kind: "skip", raw: "^", reason: "island" });
      continue;
    }
    try {
      const word = parseWord(segment.text);
      const reason = skipReasonFor(word);
      if (reason) tokens.push({ kind: "skip", raw: word.raw, reason });
      else tokens.push({ kind: "word", raw: word.raw });
    } catch {
      tokens.push({ kind: "skip", raw: segment.text, reason: "error" });
    }
  }
  return {
    tokens,
    spoken: tokens.filter((t): t is { kind: "word"; raw: string } => t.kind === "word").map((t) => t.raw),
    skipped: tokens.filter((t): t is { kind: "skip"; raw: string; reason: SkipReason } => t.kind === "skip"),
  };
}

export function toPhonemes(plan: SpeechPlan): PhonemePlan {
  const words = plan.spoken.map((raw) => toPhonemeWord(raw));
  return {
    words,
    skipped: plan.skipped,
    espeak: words.map((w) => w.espeak).join(" _ "),
  };
}

export function previewPhonemes(text: string): PhonemePlan {
  return toPhonemes(previewSpeech(text));
}

function punctChar(punct: "period" | "qmark" | "bang"): string {
  if (punct === "qmark") return "?";
  if (punct === "bang") return "!";
  return ".";
}

export function skipLabel(reason: SkipReason): string {
  switch (reason) {
    case "foreign":
      return "foreign surface — not Agelan phonology";
    case "writing":
      return "writing-only span (Phase 1 skips brackets)";
    case "shorthand":
      return "writing shorthand (Phase 1 skips numbers/spans)";
    case "punct":
      return "punctuation (Phase 1 has no pause map yet)";
    case "island":
      return "island edge (Phase 1 has no framing cues)";
    case "error":
      return "unparsed token";
  }
}
