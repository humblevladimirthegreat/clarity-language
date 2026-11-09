import { loadDefaultTables } from "./index.js";
import { unknownWordsWith, type UnknownWord } from "./unknown-words.js";

export type { UnknownWord } from "./unknown-words.js";

/** [unknownWordsWith](./unknown-words.ts) over the repo's lexicon. */
export function unknownWords(result: unknown): UnknownWord[] {
  return unknownWordsWith(result, loadDefaultTables());
}
