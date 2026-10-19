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

/** Text that depends on some answers: one value per combination of the answers it reads. */
export type EditorPiece = {
  /** Question ids, in question order; none for a piece no answer changes (`th` of a formula, a space). */
  reads: string[];
  /** By `dependsKey(reads, answers)`. */
  values: Record<string, string>;
};

/** One way to spell the flow's drop-in: the first form whose `when` the answers match. */
export type EditorForm = {
  when?: Record<string, string>;
  placement?: Placement;
  /** Joined with nothing: a space between words is a piece of its own. */
  pieces: EditorPiece[];
  gloss: EditorPiece[];
  /** Show the word part by part, as the cheat sheet does (the feelings composer). */
  breakdown?: boolean;
};

/** A part of a form, and the question whose answer spells it. */
export type BreakdownPart = { text: string; question?: string };

export type EditorOutcome = {
  form: string;
  /** The form's parts in English, from the sheet. */
  gloss: string[];
  placement?: Placement;
  breakdown?: BreakdownPart[];
};

export type EditorFlow = {
  id: string;
  lesson: string;
  questions: EditorQuestion[];
  forms: EditorForm[];
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
  /** Every form a flow can produce, and its English: `indexForms(flows)`. */
  flows: Record<string, EditorFlow>;
  commands: EditorCommand[];
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

/** Key into `EditorChoice.labels`: the answers to the questions a label depends on. */
export function dependsKey(dependsOn: readonly string[], answers: Readonly<Record<string, string>>): string {
  return dependsOn.map((id) => answers[id] ?? "").join("&");
}

/** The label a choice shows, given the answers so far. */
export function choiceLabel(question: EditorQuestion, choice: EditorChoice, answers: Readonly<Record<string, string>>): string {
  if (!question.dependsOn || !choice.labels) return choice.label;
  return choice.labels[dependsKey(question.dependsOn, answers)] ?? choice.label;
}

/** Every combination of one choice per question, leaving out choices that end in no drop-in. */
export function answerPaths(questions: readonly { id: string; choices: readonly { value: string; none?: string }[] }[]): Record<string, string>[] {
  let paths: Record<string, string>[] = [{}];
  for (const q of questions) paths = paths.flatMap((p) => q.choices.filter((c) => !c.none).map((c) => ({ ...p, [q.id]: c.value })));
  return paths;
}

/** The drop-in for one answer per question, or none when no form fits them. */
export function outcomeFor(flow: EditorFlow, answers: Readonly<Record<string, string>>): EditorOutcome | undefined {
  const form = flow.forms.find((f) => Object.entries(f.when ?? {}).every(([q, v]) => answers[q] === v));
  if (!form) return undefined;
  const read = (piece: EditorPiece) => piece.values[dependsKey(piece.reads, answers)];
  const texts = form.pieces.map(read);
  if (texts.some((t) => t === undefined)) return undefined;
  const gloss = form.gloss.map(read).filter((g): g is string => Boolean(g) && g !== "default");
  const outcome: EditorOutcome = { form: texts.join(""), gloss: [...new Set(gloss)] };
  if (form.placement) outcome.placement = form.placement;
  if (form.breakdown) {
    // A piece no answer changes (`th`) belongs to the part after it: `th` + `ulo` is `thulo`.
    const parts: BreakdownPart[] = [];
    let lead = "";
    form.pieces.forEach((piece, i) => {
      if (!piece.reads.length) {
        lead += texts[i];
        return;
      }
      parts.push({ text: lead + texts[i], ...(piece.reads.length === 1 ? { question: piece.reads[0] } : {}) });
      lead = "";
    });
    if (lead) parts.push({ text: lead });
    outcome.breakdown = parts;
  }
  return outcome;
}

/** Every form each lesson's flows can produce, and each form's English. */
export function indexForms(flows: Readonly<Record<string, EditorFlow>>): {
  formsByLesson: Record<string, string[]>;
  glossary: Record<string, EditorGloss>;
} {
  const formsByLesson: Record<string, string[]> = {};
  const glossary: Record<string, EditorGloss> = {};
  for (const flow of Object.values(flows)) {
    const forms = new Set(formsByLesson[flow.lesson] ?? []);
    for (const answers of answerPaths(flow.questions)) {
      const outcome = outcomeFor(flow, answers);
      if (!outcome) continue;
      forms.add(outcome.form);
      glossary[outcome.form] ??= { gloss: outcome.gloss, lesson: flow.lesson };
    }
    formsByLesson[flow.lesson] = [...forms];
  }
  return { formsByLesson, glossary };
}
