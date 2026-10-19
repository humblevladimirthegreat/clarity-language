// Browser entry for the Claritish editor page (docs/grammar/.vitepress/components/ClaritishEditor.vue).
// owned-noun.ts loads separately, so compromise is fetched only when a thanks card needs it.
export { compileTrigger, createScanner, dismissKey, normalize } from "./match.js";
export type { CompiledTrigger, Cue, Mark, ScanOptions, Span } from "./match.js";
export { applyChanges, placeDropIn } from "./place.js";
export type { Joiner, PlacedChange, Placement } from "./place.js";
export { answerKey } from "./types.js";
export type { EditorChoice, EditorData, EditorFlow, EditorLesson, EditorOutcome, EditorQuestion, EditorTrigger } from "./types.js";
