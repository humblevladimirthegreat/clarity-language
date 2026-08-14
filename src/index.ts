export {
  CLARITY_CONSONANTS,
  CLARITY_VOWELS,
  allClarityRoots,
  clarityRootSyllables,
  isClarityRootShape,
  toClarityWord,
  toUniqueClarityWord,
} from "./word-converter.js";

export { parse, SentenceParseError } from "./parse/index.js";
export type { ParseResult, Utterance, Clause, Unit } from "./parse/types.js";

export { previewPhonemes, previewSpeech, skipLabel, toPhonemes } from "./tts/plan.js";
export type { PhonemePlan, SkipReason, SpeechPlan, SpeechToken } from "./tts/plan.js";
export { isNativeSurface, toPhonemeWord } from "./tts/phonemes.js";
export type { PhonemeWord, Syllable } from "./tts/phonemes.js";
