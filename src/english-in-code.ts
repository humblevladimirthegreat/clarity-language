/**
 * English that can appear in grammar backticks and also look Agebon-shaped. The doc lint reads these
 * as English in code, so placement never spells a root with one.
 */
export const ENGLISH_IN_CODE: ReadonlySet<string> = new Set([
  "are",
  "bare",
  "vowel",
]);
