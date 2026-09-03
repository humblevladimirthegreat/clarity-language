export {
  CLARITY_CONSONANTS,
  CLARITY_VOWELS,
  allClarityRoots,
  clarityRootSyllables,
  isClarityRootShape,
  letterDistribution,
  toClarityWord,
  toUniqueClarityWord,
} from "./word-converter.js";
export type { LetterDistribution } from "./word-converter.js";

export { parse, SentenceParseError } from "./parse/index.js";
export type { ParseResult, Utterance, Clause, Unit } from "./parse/types.js";

export {
  expandWordToTokens,
  previewPhonemes,
  previewSpeech,
  skipLabel,
  toPhonemes,
  toSpeech,
  toSpeechText,
} from "./tts/plan.js";
export type {
  BoundaryTag,
  PhonemePlan,
  SkipReason,
  SpeechPlan,
  SpeechToken,
} from "./tts/plan.js";
export { numberStemToSpeech, numberStemToSpeechStressed, numberWordToSpeech, numberWordToSpeechStressed } from "./tts/numbers.js";
export { engineSyllableTokens, isNativeSurface, toEngineWord, toPhonemeWord } from "./tts/phonemes.js";
export type { EngineSyllable, EngineUtterance, EngineWord, PhonemeWord, Syllable } from "./tts/phonemes.js";
