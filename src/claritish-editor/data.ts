// Builds the Claritish editor's data and checks it (docs/meta/grammar-docs.md#claritish-track, journal editor):
// - every flow choice resolves to a cheat sheet cell, and every answer path to a form;
// - every trigger's lesson, flow, defaults, patterns, and gap sentence exist;
// - gap coverage: each italic English phrase in a cued lesson's `## The gap` raises one of
//   that lesson's cues, or matches a row marked exempt with its reason;
// - every slash command names a flow and answers it has;
// - every `@list` a cue names is in data/claritish-words.csv, and no word is in two lists.
// Also gathers what reading back needs: each form's English, each cued lesson's practice items,
// and the English words close enough to a form to look like a near miss.
// Node only: the page loads the result through a VitePress data loader.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import nlp from "compromise";

import { parseCsv } from "../csv.js";
import { REPO_ROOT, readData } from "../repo-paths.js";
import { compileTrigger, parsePattern, sentenceCues, sentences, type CompiledTrigger } from "./match.js";
import type { Joiner, Placement } from "./place.js";
import { findDropIns, findNearMisses } from "./read-back.js";
import { plain, readFormula, readSheet, readSwap, resolveRef, type Sheet, type SheetRef } from "./sheet.js";
import {
  answerPaths,
  dependsKey,
  indexForms,
  type EditorChoice,
  type EditorCommand,
  type EditorData,
  type EditorFlow,
  type EditorForm,
  type EditorLesson,
  type EditorPiece,
  type EditorQuestion,
  type EditorTrigger,
  type PracticeItem,
} from "./types.js";

const CLARITISH = join(REPO_ROOT, "docs", "grammar", "claritish");
const PLACEMENTS: readonly Placement[] = ["after-clause", "after-noun", "suffix", "on-cue", "before-word"];
const JOINERS: readonly Joiner[] = ["space", "comma", "sentence"];
/** Letters typed before autocomplete offers a drop-in (`EditorData.autocompleteMin`). */
const AUTOCOMPLETE_MIN = 4;

type FormulaPart = { formula: SheetRef; swap?: SheetRef; slots: Record<string, SheetRef> };
type Part = SheetRef | FormulaPart;
type FlowSpec = {
  lesson: string;
  /** Slash command name → answers it preselects. */
  commands?: Record<string, Record<string, string>>;
  questions: {
    id: string;
    prompt: string;
    /** Choice labels that read an earlier answer (`{kind}`) as well as the choice (`{source}`). */
    labelFrom?: SheetRef;
    choices: { value: string; label?: string; requires?: EditorChoice["requires"]; none?: string }[];
  }[];
  forms: {
    when?: Record<string, string>;
    placement?: Placement;
    /** Join the parts with nothing, as one word (a feeling), not with a space (`thanathum blehon`). */
    oneWord?: boolean;
    breakdown?: boolean;
    parts: Part[];
    gloss: SheetRef[];
  }[];
};

export type EditorSources = {
  triggersCsv: string;
  flowsJson: string;
  /** Word lists the cues name as `@list`. */
  wordsCsv: string;
  sheet: string;
  /** Intro page: the lesson list gives track order. */
  index: string;
  /** Lesson Markdown by id (file stem). */
  lessons: Map<string, string>;
  /** English words to keep out of near misses: the WordNet index's headwords and compromise's lexicon. */
  englishWords: readonly string[];
};

export function readSources(): EditorSources {
  const lessons = new Map<string, string>();
  const index = readFileSync(join(CLARITISH, "index.md"), "utf8");
  for (const id of trackOrder(index)) lessons.set(id, readFileSync(join(CLARITISH, `${id}.md`), "utf8"));
  return {
    triggersCsv: readData("claritish-triggers.csv"),
    flowsJson: readData("claritish-flows.json"),
    wordsCsv: readData("claritish-words.csv"),
    sheet: readFileSync(join(CLARITISH, "cheat-sheet.md"), "utf8"),
    index,
    lessons,
    englishWords: englishWords(),
  };
}

let englishCache: string[] | undefined;

/** Lowercase single English words from the English helper's WordNet index and compromise's lexicon. */
function englishWords(): string[] {
  if (!englishCache) {
    // Every quoted word in the index: its headwords, and the lexicon senses they point to (*theater*).
    const wordnet = readFileSync(join(REPO_ROOT, "src", "generated", "english-wordnet.json"), "utf8");
    const lexicon = (nlp as unknown as { model(): { one: { lexicon: Record<string, unknown> } } }).model().one.lexicon;
    const quoted = [...wordnet.matchAll(/"(\p{Ll}+)"/gu)].map((m) => m[1]!);
    const words = new Set([...quoted, ...Object.keys(lexicon)].filter((w) => /^\p{Ll}+$/u.test(w)));
    englishCache = [...words];
  }
  return englishCache;
}

/** Lesson ids in the intro page's lesson list, then its other lesson links (the bonus). */
function trackOrder(index: string): string[] {
  const ids = [...index.matchAll(/\]\(([\w-]+)\.md\)/g)].map((m) => m[1]!);
  return [...new Set(ids)].filter((id) => id !== "learn" && id !== "cheat-sheet" && id !== "editor");
}

/** The prose of a lesson section (`## … {#gap}`), up to the next heading. */
function section(markdown: string, id: string): string | undefined {
  const m = new RegExp(`^##\\s.*\\{#${id}\\}\\s*$`, "m").exec(markdown);
  if (!m) return undefined;
  const rest = markdown.slice(m.index + m[0].length);
  const end = rest.search(/^#{1,6}\s/m);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

/**
 * A lesson's practice items: `**1.** *Prompt.* (note)`, then the answer in `::: details`. A prompt
 * not in italics is an instruction with no English to start from (*How you feel right now, with
 * no clause.*): the item starts empty, and the instruction leads the note.
 */
export function lessonPractice(markdown: string): Omit<PracticeItem, "forms">[] {
  const re = /^\*\*\d+\.\*\* (?:\*(.+?)\*|([^*\s][^(\n]*?))\s*(?:\((.+)\))?\s*\n\n::: details Show answer\n(.+)\n:::/gm;
  return [...markdown.matchAll(re)].map((m) => {
    const answer = m[4]!.replace(/`/g, "").trim();
    if (m[1] !== undefined) return { prompt: m[1], note: m[3] ?? "", answer };
    const instruction = m[2]!.trim().replace(/\.$/, "");
    return { prompt: "", note: m[3] ? `${instruction}: ${m[3]}` : instruction, answer };
  });
}

function gapSentences(gap: string): string[] {
  return gap.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[\p{Lu}*])/u);
}

function splitList(cell: string | undefined): string[] {
  return (cell ?? "").split("|").map((s) => s.trim()).filter(Boolean);
}

/** Word lists by name (data/claritish-words.csv). */
function readWords(csv: string, problems: string[]): { lists: Map<string, string[]>; presets: Map<string, string> } {
  const lists = new Map<string, string[]>();
  const presets = new Map<string, string>();
  const listOf = new Map<string, string>();
  for (const row of parseCsv(csv).rows) {
    const list = row.list ?? "";
    const word = row.word ?? "";
    const where = `claritish-words.csv ${list} ${word}`;
    if (!/^[a-z][a-z-]*$/.test(list)) problems.push(`${where}: a list name is lowercase letters and hyphens`);
    if (!/^\p{Ll}+(?:'\p{Ll}+)?$/u.test(word)) problems.push(`${where}: a list word is one lowercase word`);
    const other = listOf.get(word);
    if (other) problems.push(`claritish-words.csv: ${word} is in ${other === list ? `${list} twice` : `both ${other} and ${list}`}`);
    listOf.set(word, list);
    lists.set(list, [...(lists.get(list) ?? []), word]);
    if (row.preset) {
      if (list.startsWith("emotion-")) presets.set(word, row.preset);
      else problems.push(`${where}: only an emotion word has a preset`);
    }
  }
  return { lists, presets };
}

/** `@trait` in a pattern → every word of that list, as alternatives; `(@trait)` stays optional. */
function expandLists(pattern: string, lists: ReadonlyMap<string, readonly string[]>): string {
  return pattern
    .trim()
    .split(/\s+/)
    .map((token) => {
      const m = /^(\(?)@([a-z-]+)(\)?)$/.exec(token);
      if (!m) {
        if (token.includes("@")) throw new Error(`a word list is a token of its own: \`${token}\` in \`${pattern}\``);
        return token;
      }
      const words = lists.get(m[2]!);
      if (!words) throw new Error(`no word list \`${m[2]}\` in claritish-words.csv (pattern \`${pattern}\`)`);
      return `${m[1]}${words.join("/")}${m[3]}`;
    })
    .join(" ");
}

/** `q=v&…`, naming one answer path in a problem. */
function pathName(answers: Readonly<Record<string, string>>): string {
  return Object.entries(answers).map(([q, v]) => `${q}=${v}`).join("&");
}

/** `{id}` placeholders in a ref. */
function placeholders(ref: SheetRef): string[] {
  return [ref.row, ref.col, ref.cell, ref.line, ref.item].flatMap((v) => [...(v ?? "").matchAll(/\{([\w-]+)\}/g)].map((m) => m[1]!));
}

const literal = (text: string): EditorPiece => ({ reads: [], values: { "": text } });

/** The piece a ref spells: its value for each combination of the answers it reads, within the form's `when`. */
function refPiece(
  sheet: Sheet,
  ref: SheetRef,
  questions: FlowSpec["questions"],
  when: Readonly<Record<string, string>>,
  onError: (path: string, message: string) => void,
): EditorPiece {
  const ids = new Set(placeholders(ref));
  const read = questions
    .filter((q) => ids.has(q.id))
    .map((q) => ({ ...q, choices: q.choices.filter((c) => when[q.id] === undefined || c.value === when[q.id]) }));
  const reads = read.map((q) => q.id);
  const values: Record<string, string> = {};
  for (const answers of answerPaths(read)) {
    try {
      values[dependsKey(reads, answers)] = resolveRef(sheet, ref, answers);
    } catch (err) {
      onError(pathName(answers), (err as Error).message);
    }
  }
  return { reads, values };
}

/** A part's pieces: one for a ref, and one per literal and slot of a formula. */
function partPieces(sheet: Sheet, part: Part, piece: (ref: SheetRef) => EditorPiece): EditorPiece[] {
  if (!("formula" in part)) return [piece(part)];
  const formula = readFormula(resolveRef(sheet, part.formula));
  const swap = part.swap ? readSwap(resolveRef(sheet, part.swap)) : undefined;
  const slots = formula.flatMap((p) => ("slot" in p ? [p.slot] : []));
  const named = Object.keys(part.slots);
  if ([...slots].sort().join() !== [...named].sort().join()) {
    throw new Error(`formula slots are ${slots.join(", ")}; the flow fills ${named.join(", ")}`);
  }
  if (swap && !formula.some((p) => "literal" in p && p.literal === swap.from)) throw new Error(`swap \`${swap.from}\` is not a literal of the formula`);
  return formula.map((p) => ("slot" in p ? piece(part.slots[p.slot]!) : literal(swap && p.literal === swap.from ? swap.to : p.literal)));
}

/** The first ref in a form that reads `{question}` and no other answer, for a choice with no label of its own. */
function labelRef(form: FlowSpec["forms"][number], question: string): SheetRef | undefined {
  const refs: SheetRef[] = [...form.gloss, ...form.parts.flatMap((p) => ("formula" in p ? Object.values(p.slots) : [p]))];
  return refs.find((r) => placeholders(r).length > 0 && placeholders(r).every((id) => id === question));
}

function buildFlow(sheet: Sheet, id: string, spec: FlowSpec, problems: string[]): EditorFlow {
  const where = `claritish-flows.json ${id}`;
  const questions: EditorQuestion[] = spec.questions.map((q, qi) => {
    if (!q.choices.length) problems.push(`${where}: question ${q.id} has no choices`);
    const values = q.choices.map((c) => c.value);
    if (new Set(values).size !== values.length) problems.push(`${where}: question ${q.id} repeats a choice`);
    const dependsOn = q.labelFrom ? [...new Set(placeholders(q.labelFrom).filter((id) => id !== q.id))] : [];
    const earlier = spec.questions.slice(0, qi);
    for (const id of dependsOn) {
      if (!earlier.some((e) => e.id === id)) problems.push(`${where}: question ${q.id} labels read {${id}}, which is not an earlier question`);
    }
    const combos = answerPaths(earlier.filter((e) => dependsOn.includes(e.id)));
    return {
      id: q.id,
      prompt: q.prompt,
      ...(dependsOn.length ? { dependsOn } : {}),
      choices: q.choices.map((c) => {
        const labels: Record<string, string> = {};
        if (q.labelFrom && !c.none) {
          for (const combo of combos) {
            try {
              const label = resolveRef(sheet, q.labelFrom, { ...combo, [q.id]: c.value });
              if (label) labels[dependsKey(dependsOn, combo)] = label;
            } catch (err) {
              problems.push(`${where}: choice ${q.id}=${c.value}: ${(err as Error).message}`);
            }
          }
        }
        let label = c.label;
        const ref = labelRef(spec.forms[0]!, q.id);
        // A label that always depends on an earlier answer shows the one for the first choices.
        if (label === undefined && !ref && combos.length) label = labels[dependsKey(dependsOn, combos[0]!)];
        if (label === undefined) {
          try {
            if (!ref) throw new Error("no ref reads this question");
            label = resolveRef(sheet, ref, { [q.id]: c.value });
          } catch (err) {
            problems.push(`${where}: choice ${q.id}=${c.value} has no label: ${(err as Error).message}`);
            label = c.value;
          }
        }
        return {
          value: c.value,
          label,
          ...(c.requires ? { requires: c.requires } : {}),
          ...(c.none ? { none: c.none } : {}),
          ...(Object.keys(labels).length ? { labels } : {}),
        };
      }),
    };
  });
  const forms: EditorForm[] = spec.forms.map((f) => {
    if (f.placement && !PLACEMENTS.includes(f.placement)) problems.push(`${where}: unknown placement \`${f.placement}\``);
    const piece = (ref: SheetRef) => refPiece(sheet, ref, spec.questions, f.when ?? {}, (path, message) => problems.push(`${where}: ${path}: ${message}`));
    const pieces: EditorPiece[] = [];
    f.parts.forEach((part, i) => {
      if (i && !f.oneWord) pieces.push(literal(" "));
      try {
        pieces.push(...partPieces(sheet, part, piece));
      } catch (err) {
        problems.push(`${where}: ${(err as Error).message}`);
      }
    });
    return {
      ...(f.when ? { when: f.when } : {}),
      ...(f.placement ? { placement: f.placement } : {}),
      pieces,
      gloss: f.gloss.map(piece),
      ...(f.breakdown ? { breakdown: true } : {}),
    };
  });
  for (const answers of answerPaths(spec.questions)) {
    if (!forms.some((f) => Object.entries(f.when ?? {}).every(([q, v]) => answers[q] === v))) problems.push(`${where}: no form for ${pathName(answers)}`);
  }
  return { id, lesson: spec.lesson, questions, forms };
}

export function buildEditorData(sources: EditorSources = readSources()): { data: EditorData; problems: string[] } {
  const problems: string[] = [];
  const sheet = readSheet(sources.sheet);
  const { lists, presets } = readWords(sources.wordsCsv, problems);
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

  // An emotion word can start the feelings composer on its need (*confused* → understanding).
  const feeling = flows.feeling;
  const wordDefaults: Record<string, Record<string, string>> = {};
  for (const [word, preset] of presets) {
    const answers: Record<string, string> = {};
    for (const pair of splitList(preset.replace(/;/g, "|"))) {
      const [q, v] = pair.split("=").map((x) => x.trim());
      const question = feeling?.questions.find((x) => x.id === q);
      if (!question || !question.choices.some((c) => c.value === v)) problems.push(`claritish-words.csv ${word}: preset \`${pair}\` names no question and choice of the feeling flow`);
      else answers[q!] = v!;
    }
    wordDefaults[word] = answers;
  }

  const triggers: EditorTrigger[] = [];
  const exempt: { lesson: string; cues: string[] }[] = [];
  for (const row of parseCsv(sources.triggersCsv).rows) {
    const where = `claritish-triggers.csv ${row.id}`;
    const lesson = row.lesson ?? "";
    const markdown = sources.lessons.get(lesson);
    let cues: string[];
    let exclude: string[];
    try {
      cues = splitList(row.cue).map((p) => expandLists(p, lists));
      exclude = splitList(row.exclude).map((p) => expandLists(p, lists));
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
    const mirror = (row.mirror ?? "").split("/").map((s) => s.trim());
    if (mirror.length !== 2 || !mirror[0] || !mirror[1]) problems.push(`${where}: mirror must be \`one/many\` (\`unmarked guess/unmarked guesses\`)`);
    triggers.push({
      id: row.id!,
      lesson,
      cues,
      exclude,
      flow: row.flow!,
      defaults,
      placement,
      joiner,
      dropCue: row.drop_cue === "yes",
      gap: gap ?? "",
      mirror: [mirror[0] ?? "", mirror[1] ?? ""],
    });
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

  const { glossary } = indexForms(flows);

  const commands: EditorCommand[] = [];
  for (const [id, spec] of Object.entries(flowSpecs)) {
    const flow = flows[id]!;
    for (const [name, defaults] of Object.entries(spec.commands ?? {})) {
      const where = `claritish-flows.json ${id}: command /${name}`;
      if (!/^[a-z]+$/.test(name)) problems.push(`${where}: a command name is lowercase letters`);
      if (commands.some((c) => c.name === name)) problems.push(`${where}: another flow has /${name}`);
      const picked: string[] = [];
      for (const [q, v] of Object.entries(defaults)) {
        const choice = flow.questions.find((x) => x.id === q)?.choices.find((c) => c.value === v);
        if (!choice) problems.push(`${where}: \`${q}=${v}\` names no question and choice`);
        else picked.push(choice.label);
      }
      const title = lessons.find((l) => l.id === flow.lesson)?.title ?? flow.lesson;
      commands.push({ name, flow: id, defaults, hint: [title, ...picked].join(": ") });
    }
  }

  const known = new Set(Object.keys(glossary));
  const practice: Record<string, PracticeItem[]> = {};
  for (const lesson of lessons) {
    practice[lesson.id] = lessonPractice(sources.lessons.get(lesson.id)!).map((item) => ({
      ...item,
      forms: findDropIns(item.answer, known).map((d) => d.form),
    }));
  }

  // English words a near miss would flag (*thunder* for `thuner`), or that start a form and would
  // open autocomplete (*than*): recomputed from the forms, so a new form or a respelling brings its own.
  // A suffix's host is English too, so the word after a hyphen counts as well (*twenty-two*, `-tho`);
  // a two-letter one stays a near miss (`lied-ta`).
  const wordForms = [...known].filter((f) => /^\p{Ll}/u.test(f));
  const english = [
    ...findNearMisses(sources.englishWords.join(" "), known).map((m) => m.text),
    ...findNearMisses(sources.englishWords.filter((w) => w.length >= 3).map((w) => `a-${w}`).join(" "), known).map((m) => m.text.slice(2)),
    ...sources.englishWords.filter((w) => w.length >= AUTOCOMPLETE_MIN && wordForms.some((f) => f.startsWith(w) && f !== w)),
  ];

  return { data: { lessons, triggers, flows, commands, wordDefaults, practice, english, autocompleteMin: AUTOCOMPLETE_MIN }, problems };
}
