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
  /** The mirror panel's name for the habit, one and many (`unmarked guess`, `unmarked guesses`). */
  mirror: [string, string];
};

export type EditorChoice = {
  value: string;
  label: string;
  /**
   * `owned-noun`: offered only when the sentence has an owned noun phrase (*my coat*).
   * `command`: offered only from a slash command, never for an English cue (*can* for a *can't*).
   */
  requires?: "owned-noun" | "command";
  /** No drop-in fits this answer: the card shows this line and offers only *Leave it in English*. */
  none?: string;
  /** Labels that depend on earlier answers, by `dependsKey` (*tolerated* for allowed, *by custom* for required). */
  labels?: Record<string, string>;
};

export type EditorQuestion = {
  id: string;
  prompt: string;
  choices: EditorChoice[];
  /** Earlier questions whose answers pick this question's labels. */
  dependsOn?: string[];
};

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

/** A slash command: `/name` at the cursor opens `flow` with no English cue. */
export type EditorCommand = {
  name: string;
  flow: string;
  defaults: Record<string, string>;
  /** Lesson title, and the preselected answer when there is one. */
  hint: string;
};

/** A slash command typed in the text: its span, and the line it sits in (at document offset `lineFrom`). */
export type CommandAt = { name: string; from: number; to: number; line: string; lineFrom: number };

/** What a form means, for hover and the practice check. */
export type EditorGloss = { gloss: string[]; lesson: string };

/** A lesson practice item: the English prompt, the note on what the speaker means, and the lesson's answer. */
export type PracticeItem = {
  prompt: string;
  note: string;
  /** Plain text, drop-ins unmarked, as the writer would type it. */
  answer: string;
  /** The drop-ins in the answer (`-xe` for `run-xe`, `?!` for a stack of tone marks). */
  forms: string[];
};

export type EditorData = {
  /** Lessons with cues, in track order. */
  lessons: EditorLesson[];
  triggers: EditorTrigger[];
  flows: Record<string, EditorFlow>;
  commands: EditorCommand[];
  /** Every form each lesson's flows can produce. */
  formsByLesson: Record<string, string[]>;
  /** Every form the flows can produce, with its English. */
  glossary: Record<string, EditorGloss>;
  /** Practice items of each lesson with cues. */
  practice: Record<string, PracticeItem[]>;
  /**
   * English words that look like a form: within near-miss reach (*thunder*, `thuner`) or the start
   * of one (*than*). They are never flagged and never open autocomplete.
   */
  english: string[];
  /** Letters a word needs before autocomplete offers drop-ins for it. */
  autocompleteMin: number;
};

/** Outcome key for one answer per question. */
export function answerKey(questions: readonly EditorQuestion[], answers: Readonly<Record<string, string>>): string {
  return questions.map((q) => `${q.id}=${answers[q.id] ?? ""}`).join("&");
}

/** Key into `EditorChoice.labels`: the answers to the questions a label depends on. */
export function dependsKey(dependsOn: readonly string[], answers: Readonly<Record<string, string>>): string {
  return dependsOn.map((id) => answers[id] ?? "").join("&");
}

/** The label a choice shows, given the answers so far. */
export function choiceLabel(question: EditorQuestion, choice: EditorChoice, answers: Readonly<Record<string, string>>): string {
  if (!question.dependsOn || !choice.labels) return choice.label;
  return choice.labels[dependsKey(question.dependsOn, answers)] ?? choice.label;
}
