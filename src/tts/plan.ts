import { parse as peggyParse } from "../generated/word-parser.js";
import { segmentUtterance, type TokenizeSegment } from "../parse/tokenize.js";
import type { MorphWord, PunctKind } from "../parse/types.js";
import { parseWord } from "../parse/word.js";
import { isNativeSurface, toPhonemeWord, type PhonemeWord } from "./phonemes.js";
import { numberWordToSpeechStressed } from "./numbers.js";
import { expandOpaqueSpan, expandWritingSpan } from "./spans.js";

export type SkipReason = "foreign" | "writing" | "punct" | "error" | "shorthand";

export type BoundaryTag =
  | "period"
  | "qmark"
  | "bang"
  | "softM"
  | "xContinue"
  | "jTurn"
  | "islandEnter"
  | "islandExit";

export type SpeechToken =
  | { kind: "word"; raw: string; stress?: number[] }
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

type FramingRole = "force" | "polar" | "vocative" | "linker" | "clauseJoin" | "reviser" | "ordinary";

type SpeechSegment =
  | { kind: "word"; word: MorphWord }
  | { kind: "error"; raw: string }
  | { kind: "punct"; punct: PunctKind }
  | { kind: "islandEdge" };

function isNumberWord(word: MorphWord): boolean {
  const family = word.family;
  return family.kind === "number" || (family.kind === "x" && family.xFamily === "numeric");
}

function classifyFramingRole(word: MorphWord): FramingRole {
  const { family, pos } = word;

  if (family.kind === "reviser") return "reviser";

  if (pos === "j") {
    if (family.kind === "joinMarker") {
      return family.series.length === 1 ? "force" : "polar";
    }
    return "vocative";
  }

  if (pos === "x") {
    if (family.kind === "content") return "linker";
    if (family.kind === "joinMarker") return "clauseJoin";
  }

  return "ordinary";
}

function isSoftFramingWord(word: MorphWord): boolean {
  const role = classifyFramingRole(word);
  return (role === "force" || role === "polar") && word.ending === "m";
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
    const spoken = numberWordToSpeechStressed(word);
    return [{ kind: "word", raw: spoken.raw, stress: spoken.stress }];
  }

  if (!isNativeSurface(word.raw)) {
    return [{ kind: "skip", raw: word.raw, reason: "shorthand" }];
  }

  return [{ kind: "word", raw: word.raw }];
}

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

function tokenizeSegmentsToSpeechSegments(segments: TokenizeSegment[]): SpeechSegment[] {
  const out: SpeechSegment[] = [];

  for (const segment of segments) {
    if (segment.kind === "punct") {
      out.push({ kind: "punct", punct: segment.punct });
      continue;
    }
    if (segment.kind === "islandEdge") {
      out.push({ kind: "islandEdge" });
      continue;
    }
    try {
      out.push({ kind: "word", word: parseWord(segment.text) });
    } catch {
      out.push({ kind: "error", raw: segment.text });
    }
  }

  return out;
}

function speechTokensFromSegments(segments: SpeechSegment[]): SpeechToken[] {
  const tokens: SpeechToken[] = [];
  let softBodyPunct = false;
  let afterBodyEnd = false;
  let islandOpen = false;

  for (const segment of segments) {
    if (segment.kind === "punct") {
      const tag: BoundaryTag = softBodyPunct && segment.punct === "period" ? "softM" : segment.punct;
      tokens.push({ kind: "boundary", tag, raw: boundaryRaw(tag) });
      softBodyPunct = false;
      afterBodyEnd = true;
      continue;
    }

    if (segment.kind === "islandEdge") {
      if (!islandOpen) {
        tokens.push({ kind: "boundary", tag: "islandEnter", raw: "^" });
        islandOpen = true;
      } else {
        tokens.push({ kind: "boundary", tag: "islandExit", raw: "^" });
        islandOpen = false;
      }
      continue;
    }

    if (segment.kind === "error") {
      tokens.push({ kind: "skip", raw: segment.raw, reason: "error" });
      continue;
    }

    const role = classifyFramingRole(segment.word);

    if (role === "linker" || role === "clauseJoin") {
      tokens.push({ kind: "boundary", tag: "xContinue", raw: "" });
    } else if (afterBodyEnd && (role === "force" || role === "polar" || role === "vocative")) {
      tokens.push({ kind: "boundary", tag: "jTurn", raw: "" });
    }

    afterBodyEnd = false;

    if (isSoftFramingWord(segment.word)) {
      softBodyPunct = true;
    }

    tokens.push(...expandWordToTokens(segment.word));
  }

  return tokens;
}

export function toSpeech(segments: TokenizeSegment[]): SpeechToken[] {
  return speechTokensFromSegments(tokenizeSegmentsToSpeechSegments(segments));
}

export function toSpeechText(text: string): SpeechToken[] {
  return speechTokensFromSegments(speechSegmentsFromText(text));
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
  switch (tag) {
    case "qmark":
      return "?";
    case "bang":
      return "!";
    case "softM":
      return ";";
    case "xContinue":
    case "islandEnter":
    case "islandExit":
      return ",";
    case "jTurn":
      return "_:200";
    default:
      return ".";
  }
}

export function toPhonemes(plan: SpeechPlan): PhonemePlan {
  const words: PhonemeWord[] = [];
  const parts: EspeakPart[] = [];
  let islandDepth = 0;

  for (const token of plan.tokens) {
    if (token.kind === "word") {
      const phoneme = toPhonemeWord(token.raw, token.stress);
      words.push(phoneme);
      parts.push({ espeak: phoneme.espeak, inIsland: islandDepth > 0 });
      continue;
    }

    if (token.kind === "boundary") {
      if (token.tag === "islandEnter") islandDepth++;
      else if (token.tag === "islandExit") islandDepth = Math.max(0, islandDepth - 1);
      parts.push({ espeak: boundaryToEspeak(token.tag), inIsland: false, boundary: true });
    }
  }

  const espeak = wrapEspeakParts(parts);

  return {
    words,
    skipped: plan.skipped,
    espeak,
  };
}

type EspeakPart = { espeak: string; inIsland: boolean; boundary?: boolean };

/** Join phoneme spans and punctuation for eSpeak clause intonation. */
function wrapEspeakParts(parts: EspeakPart[]): string {
  if (parts.length === 0) return "";
  const chunks: string[] = [];
  let phonemeRun: string[] = [];
  let runInIsland = false;

  function flushPhonemes(): void {
    if (phonemeRun.length === 0) return;
    const sep = runInIsland ? " " : " _ ";
    chunks.push(`[[${phonemeRun.join(sep)}]]`);
    phonemeRun = [];
  }

  for (const part of parts) {
    if (part.boundary) {
      flushPhonemes();
      chunks.push(part.espeak);
      continue;
    }

    if (phonemeRun.length > 0 && part.inIsland !== runInIsland) {
      flushPhonemes();
    }

    runInIsland = part.inIsland;
    phonemeRun.push(part.espeak);
  }

  flushPhonemes();
  return chunks.join("");
}

export function previewPhonemes(text: string): PhonemePlan {
  return toPhonemes(previewSpeech(text));
}

function boundaryRaw(tag: BoundaryTag): string {
  return boundaryToEspeak(tag);
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
    case "error":
      return "unparsed token";
  }
}
