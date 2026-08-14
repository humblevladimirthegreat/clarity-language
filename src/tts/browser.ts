export type SpeakOptions = {
  rate?: number;
};

export { previewPhonemes, previewSpeech, skipLabel, toPhonemes } from "./plan.js";
export type { PhonemePlan, SkipReason, SpeechPlan, SpeechToken } from "./plan.js";
export { isNativeSurface, toPhonemeWord } from "./phonemes.js";
export type { PhonemeWord, Syllable } from "./phonemes.js";
