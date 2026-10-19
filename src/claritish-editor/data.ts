// Builds the Claritish editor's data and checks it (docs/meta/grammar-docs.md#claritish-track, journal editor):
// - every flow choice resolves to a cheat sheet cell, and every answer path to a form;
// - every trigger's lesson, flow, defaults, patterns, and gap sentence exist;
// - gap coverage: each italic English phrase in a cued lesson's `## The gap` raises one of
//   that lesson's cues, or matches a row marked exempt with its reason.
// Node only: the page loads the result through a VitePress data loader.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseCsv } from "../csv.js";
import { REPO_ROOT, readData } from "../repo-paths.js";
import { compileTrigger, parsePattern, sentenceCues, sentences, type CompiledTrigger } from "./match.js";
import type { Joiner, Placement } from "./place.js";
import { plain, readFormula, readSheet, readSwap, resolveRef, type Sheet, type SheetRef } from "./sheet.js";
import { answerKey, type EditorData, type EditorFlow, type EditorLesson, type EditorOutcome, type EditorQuestion, type EditorTrigger } from "./types.js";

const CLARITISH = join(REPO_ROOT, "docs", "grammar", "claritish");
const PLACEMENTS: readonly Placement[] = ["after-clause", "after-noun"];
const JOINERS: readonly Joiner[] = ["space", "comma", "sentence"];

type FormulaPart = { formula: SheetRef; swap?: SheetRef; slots: Record<string, SheetRef> };
type Part = SheetRef | FormulaPart;
type FlowSpec = {
  lesson: string;
  questions: { id: string; prompt: string; choices: { value: string; label?: string; requires?: "owned-noun" }[] }[];
  forms: { when?: Record<string, string>; placement?: Placement; parts: Part[]; gloss: SheetRef[] }[];
};

export type EditorSources = {
  triggersCsv: string;
  flowsJson: string;
  sheet: string;
  /** Intro page: the lesson list gives track order. */
  index: string;
  /** Lesson Markdown by id (file stem). */
  lessons: Map<string, string>;
};

export function readSources(): EditorSources {
  const lessons = new Map<string, string>();
  const index = readFileSync(join(CLARITISH, "index.md"), "utf8");
  for (const id of trackOrder(index)) lessons.set(id, readFileSync(join(CLARITISH, `${id}.md`), "utf8"));
  return {
    triggersCsv: readData("claritish-triggers.csv"),
    flowsJson: readData("claritish-flows.json"),
    sheet: readFileSync(join(CLARITISH, "cheat-sheet.md"), "utf8"),
    index,
    lessons,
  };
}

/** Lesson ids in the intro page's lesson list, then its other lesson links (the bonus). */
function trackOrder(index: string): string[] {
  const ids = [...index.matchAll(/\]\(([\w-]+)\.md\)/g)].map((m) => m[1]!);
  return [...new Set(ids)].filter((id) => id !== "learn-agazan" && id !== "cheat-sheet" && id !== "editor");
}

/** The prose of a lesson section (`## … {#gap}`), up to the next heading. */
function section(markdown: string, id: string): string | undefined {
  const m = new RegExp(`^##\\s.*\\{#${id}\\}\\s*$`, "m").exec(markdown);
  if (!m) return undefined;
  const rest = markdown.slice(m.index + m[0].length);
  const end = rest.search(/^#{1,6}\s/m);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

function gapSentences(gap: string): string[] {
  return gap.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[\p{Lu}*])/u);
}

function splitList(cell: string | undefined): string[] {
  return (cell ?? "").split("|").map((s) => s.trim()).filter(Boolean);
}

/** Every combination of one choice per question. */
function answerPaths(questions: FlowSpec["questions"]): Record<string, string>[] {
  let paths: Record<string, string>[] = [{}];
  for (const q of questions) paths = paths.flatMap((p) => q.choices.map((c) => ({ ...p, [q.id]: c.value })));
  return paths;
}

function resolvePart(sheet: Sheet, part: Part, answers: Record<string, string>): string {
  if (!("formula" in part)) return resolveRef(sheet, part, answers);
  const formula = readFormula(resolveRef(sheet, part.formula));
  const swap = part.swap ? readSwap(resolveRef(sheet, part.swap)) : undefined;
  const slots = formula.flatMap((p) => ("slot" in p ? [p.slot] : []));
  const named = Object.keys(part.slots);
  if ([...slots].sort().join() !== [...named].sort().join()) {
    throw new Error(`formula slots are ${slots.join(", ")}; the flow fills ${named.join(", ")}`);
  }
  let swapped = !swap;
  const out = formula.map((p) => {
    if ("slot" in p) return resolveRef(sheet, part.slots[p.slot]!, answers);
    if (swap && p.literal === swap.from) {
      swapped = true;
      return swap.to;
    }
    return p.literal;
  });
  if (!swapped) throw new Error(`swap \`${swap!.from}\` is not a literal of the formula`);
  return out.join("");
}

/** The first ref in a form that reads `{question}`, for a choice with no label of its own. */
function labelRef(form: FlowSpec["forms"][number], question: string): SheetRef | undefined {
  const refs: SheetRef[] = [...form.gloss, ...form.parts.flatMap((p) => ("formula" in p ? Object.values(p.slots) : [p]))];
  return refs.find((r) => [r.row, r.col, r.cell].some((v) => v?.includes(`{${question}}`)));
}

function buildFlow(sheet: Sheet, id: string, spec: FlowSpec, problems: string[]): EditorFlow {
  const where = `claritish-flows.json ${id}`;
  const questions: EditorQuestion[] = spec.questions.map((q) => {
    if (!q.choices.length) problems.push(`${where}: question ${q.id} has no choices`);
    const values = q.choices.map((c) => c.value);
    if (new Set(values).size !== values.length) problems.push(`${where}: question ${q.id} repeats a choice`);
    return {
      id: q.id,
      prompt: q.prompt,
      choices: q.choices.map((c) => {
        let label = c.label;
        if (label === undefined) {
          const ref = labelRef(spec.forms[0]!, q.id);
          try {
            if (!ref) throw new Error("no ref reads this question");
            label = resolveRef(sheet, ref, { [q.id]: c.value });
          } catch (err) {
            problems.push(`${where}: choice ${q.id}=${c.value} has no label: ${(err as Error).message}`);
            label = c.value;
          }
        }
        return { value: c.value, label, ...(c.requires ? { requires: c.requires } : {}) };
      }),
    };
  });
  const outcomes: Record<string, EditorOutcome> = {};
  for (const answers of answerPaths(spec.questions)) {
    const form = spec.forms.find((f) => Object.entries(f.when ?? {}).every(([q, v]) => answers[q] === v));
    const key = answerKey(questions, answers);
    if (!form) {
      problems.push(`${where}: no form for ${key}`);
      continue;
    }
    if (form.placement && !PLACEMENTS.includes(form.placement)) problems.push(`${where}: unknown placement \`${form.placement}\``);
    try {
      const gloss = form.gloss.map((ref) => resolveRef(sheet, ref, answers)).filter((g) => g && g !== "default");
      outcomes[key] = {
        form: form.parts.map((part) => resolvePart(sheet, part, answers)).join(" "),
        gloss: [...new Set(gloss)],
        ...(form.placement ? { placement: form.placement } : {}),
      };
    } catch (err) {
      problems.push(`${where}: ${key}: ${(err as Error).message}`);
    }
  }
  return { id, lesson: spec.lesson, questions, outcomes };
}

export function buildEditorData(sources: EditorSources = readSources()): { data: EditorData; problems: string[] } {
  const problems: string[] = [];
  const sheet = readSheet(sources.sheet);
  const order = trackOrder(sources.index);

  let flowSpecs: Record<string, FlowSpec> = {};
  try {
    flowSpecs = JSON.parse(sources.flowsJson) as Record<string, FlowSpec>;
  } catch (err) {
    problems.push(`claritish-flows.json: ${(err as Error).message}`);
  }
  const flows: Record<string, EditorFlow> = {};
  for (const [id, spec] of Object.entries(flowSpecs)) {
    if (!sources.lessons.has(spec.lesson)) problems.push(`claritish-flows.json ${id}: unknown lesson \`${spec.lesson}\``);
    flows[id] = buildFlow(sheet, id, spec, problems);
  }

  const triggers: EditorTrigger[] = [];
  const exempt: { lesson: string; cues: string[] }[] = [];
  for (const row of parseCsv(sources.triggersCsv).rows) {
    const where = `claritish-triggers.csv ${row.id}`;
    const lesson = row.lesson ?? "";
    const markdown = sources.lessons.get(lesson);
    const cues = splitList(row.cue);
    const exclude = splitList(row.exclude);
    try {
      for (const p of [...cues, ...exclude]) parsePattern(p);
    } catch (err) {
      problems.push(`${where}: ${(err as Error).message}`);
      continue;
    }
    if (!markdown) {
      problems.push(`${where}: unknown lesson \`${lesson}\``);
      continue;
    }
    if (row.exempt) {
      exempt.push({ lesson, cues });
      continue;
    }
    const flow = flows[row.flow ?? ""];
    if (!flow) problems.push(`${where}: unknown flow \`${row.flow}\``);
    else if (flow.lesson !== lesson) problems.push(`${where}: flow ${flow.id} belongs to ${flow.lesson}, not ${lesson}`);
    const defaults: Record<string, string> = {};
    for (const pair of splitList(row.defaults?.replace(/;/g, "|"))) {
      const [q, v] = pair.split("=").map((s) => s.trim());
      const question = flow?.questions.find((x) => x.id === q);
      if (!question || !question.choices.some((c) => c.value === v)) problems.push(`${where}: default \`${pair}\` names no question and choice of ${row.flow}`);
      else defaults[q!] = v!;
    }
    const placement = row.placement as Placement;
    const joiner = row.join as Joiner;
    if (!PLACEMENTS.includes(placement)) problems.push(`${where}: unknown placement \`${row.placement}\``);
    if (!JOINERS.includes(joiner)) problems.push(`${where}: unknown join \`${row.join}\``);
    if (row.drop_cue !== "yes" && row.drop_cue !== "no") problems.push(`${where}: drop_cue must be yes or no`);
    const gapText = section(markdown, "gap");
    const gap = gapText ? gapSentences(gapText)[Number(row.gap_sentence) - 1] : undefined;
    if (!gap) problems.push(`${where}: ${lesson}.md has no gap sentence ${row.gap_sentence}`);
    triggers.push({ id: row.id!, lesson, cues, exclude, flow: row.flow!, defaults, placement, joiner, dropCue: row.drop_cue === "yes", gap: gap ?? "" });
  }

  // Gap coverage: the English words a cued lesson's gap names.
  const compiled = triggers.map(compileTrigger);
  const exemptCompiled = exempt.map((e, i) => compileTrigger({ id: `exempt-${i}`, lesson: e.lesson, cues: e.cues, exclude: [] }));
  const cued = [...new Set(triggers.map((t) => t.lesson))];
  for (const lesson of cued) {
    const gap = section(sources.lessons.get(lesson)!, "gap") ?? "";
    for (const m of gap.matchAll(/(?<!\*)\*([^*\n]+)\*(?!\*)/g)) {
      const phrase = plain(m[1]!);
      const hit = (list: readonly CompiledTrigger[]) => sentences(phrase).some((s) => sentenceCues(s, list.filter((t) => t.lesson === lesson)).length > 0);
      if (!hit(compiled) && !hit(exemptCompiled)) {
        problems.push(`claritish/${lesson}.md gap: *${phrase}* raises no ${lesson} cue and is not exempt in claritish-triggers.csv`);
      }
    }
  }

  const lessons: EditorLesson[] = order
    .filter((id) => cued.includes(id))
    .map((id) => ({ id, title: plain(/^#\s+(.*?)\s*(?:\{#[\w-]+\})?\s*$/m.exec(sources.lessons.get(id)!)?.[1] ?? id), learn: `claritish/${id}.html#forms` }));

  const formsByLesson: Record<string, string[]> = {};
  for (const flow of Object.values(flows)) {
    const forms = new Set([...(formsByLesson[flow.lesson] ?? []), ...Object.values(flow.outcomes).map((o) => o.form)]);
    formsByLesson[flow.lesson] = [...forms];
  }

  return { data: { lessons, triggers, flows, formsByLesson }, problems };
}
