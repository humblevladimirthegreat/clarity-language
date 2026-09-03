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
export {
  ipaPhonemesToKittenIdChunks,
  ipaToKittenIds,
  KittenTextCleaner,
  normalizeIpaForKitten,
} from "./kitten-ids.js";
export { isNativeSurface, toPhonemeWord, wordIpaPhones } from "./phonemes.js";
export type { PhonemeWord, Syllable } from "./phonemes.js";
