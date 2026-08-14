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
export { numberStemToSpeech, numberWordToSpeech } from "./numbers.js";
export { isNativeSurface, toPhonemeWord } from "./phonemes.js";
export type { PhonemeWord, Syllable } from "./phonemes.js";
