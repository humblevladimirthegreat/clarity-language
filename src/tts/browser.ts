export type SpeakOptions = {
  rate?: number;
};

export {
  expandWordToTokens,
  previewPhonemes,
  previewSpeech,
  skipLabel,
  toPhonemes,
  toSpeech,
  toSpeechText,
} from "./plan.js";
export type {
  BoundaryTag,
  PhonemePlan,
  SkipReason,
  SpeechPlan,
  SpeechToken,
} from "./plan.js";
export { numberStemToSpeech, numberStemToSpeechStressed, numberWordToSpeech, numberWordToSpeechStressed } from "./numbers.js";
export { engineSyllableTokens, isNativeSurface, toEngineWord, toPhonemeWord } from "./phonemes.js";
export type { EngineSyllable, EngineUtterance, EngineWord, PhonemeWord, Syllable } from "./phonemes.js";
