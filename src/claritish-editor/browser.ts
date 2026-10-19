// Browser entry for the Claritish editor page (docs/grammar/.vitepress/components/ClaritishEditor.vue).
// owned-noun.ts loads separately, so compromise is fetched only when a thanks card needs it.
export { compileTrigger, createScanner, dismissKey, normalize } from "./match.js";
export type { CompiledTrigger, Cue, Mark, ScanOptions, Span } from "./match.js";
export { applyChanges, placeAtCommand, placeDropIn } from "./place.js";
export type { Joiner, PlacedChange, Placement } from "./place.js";
export { findDropIns, findNearMisses, sameDropIns } from "./read-back.js";
export type { FoundDropIn, NearMiss } from "./read-back.js";
export { answerPaths, choiceLabel, indexForms, outcomeFor } from "./types.js";
export type {
  BreakdownPart,
  CommandAt,
  EditorChoice,
  EditorCommand,
  EditorData,
  EditorFlow,
  EditorGloss,
  EditorLesson,
  EditorOutcome,
  EditorQuestion,
  EditorTrigger,
  PracticeItem,
} from "./types.js";
