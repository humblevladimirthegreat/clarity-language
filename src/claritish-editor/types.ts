// The Claritish editor's data, as the page loads it (docs/grammar/.vitepress/lib/claritish-editor.data.ts).
// Built by data.ts from data/claritish-triggers.csv, data/claritish-flows.json, the cheat
// sheet, and the lessons. Every form here was read from the sheet.
import type { MatchTrigger } from "./match.js";
import type { Joiner, Placement } from "./place.js";

export type EditorLesson = {
  id: string;
  /** The lesson's H1. */
  title: string;
  /** Site path of the lesson's forms section, without the base. */
  learn: string;
};

export type EditorTrigger = MatchTrigger & {
  flow: string;
  /** Preselected answers (question id → choice value) that differ from each question's first choice. */
  defaults: Record<string, string>;
  placement: Placement;
  joiner: Joiner;
  dropCue: boolean;
  /** One sentence of the lesson's gap, in Markdown (italics kept). */
  gap: string;
};

export type EditorChoice = {
  value: string;
  label: string;
  /** Offered only when the sentence has an owned noun phrase (*my coat*). */
  requires?: "owned-noun";
};

export type EditorQuestion = { id: string; prompt: string; choices: EditorChoice[] };

export type EditorOutcome = {
  form: string;
  /** The form's parts in English, from the sheet. */
  gloss: string[];
  placement?: Placement;
};

export type EditorFlow = {
  id: string;
  lesson: string;
  questions: EditorQuestion[];
  /** By `answerKey`. */
  outcomes: Record<string, EditorOutcome>;
};

export type EditorData = {
  /** Lessons with cues, in track order. */
  lessons: EditorLesson[];
  triggers: EditorTrigger[];
  flows: Record<string, EditorFlow>;
  /** Every form each lesson's flows can produce. */
  formsByLesson: Record<string, string[]>;
};

/** Outcome key for one answer per question. */
export function answerKey(questions: readonly EditorQuestion[], answers: Readonly<Record<string, string>>): string {
  return questions.map((q) => `${q.id}=${answers[q.id] ?? ""}`).join("&");
}
