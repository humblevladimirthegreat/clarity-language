import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cells, spans, tables } from "../lint/cheat-sheet-tables.js";
import { parse } from "../parse/index.js";
import { buildEditorData, lessonPractice, readSources } from "./data.js";
import { compileTrigger, createScanner, tokenize, type Mark } from "./match.js";
import { applyChanges, placeAtCommand, placeDropIn } from "./place.js";
import { findNearMisses } from "./read-back.js";
import { answerPaths, indexForms, outcomeFor, presetFor } from "./types.js";

const sources = readSources();
const { data, problems } = buildEditorData(sources);
const lessonIds = data.lessons.map((l) => l.id);
const scanner = createScanner(data.triggers.map(compileTrigger), lessonIds);
const ALL = { enabled: new Set(lessonIds), never: new Set<string>(), dismissed: new Set<string>(), formsByLesson: new Map() };
const outcomes = Object.values(data.flows).flatMap((f) => answerPaths(f.questions).map((a) => outcomeFor(f, a)!));
const allForms = new Set(outcomes.map((o) => o.form));
const { glossary } = indexForms(data.flows);
/** Forms a card inserts, and each word of a multi-word one (`thanathum` from `thanathum blehon`). */
const insertable = new Set([...allForms, ...[...allForms].flatMap((f) => (f.includes(" ") ? f.split(" ") : []))]);

/** `> …` example lines under `## Examples`. */
function examples(markdown: string): string[] {
  const section = /^## Examples.*$([\s\S]*?)^## /m.exec(markdown)?.[1] ?? "";
  return [...section.matchAll(/^>\s*(.+?)\s*$/gm)].map((m) => m[1]!);
}

/** The drop-ins in a lesson line: code spans (the suffix of a hyphenated host), and tone marks before a word. */
function dropIns(line: string): string[] {
  const code = [...line.matchAll(/`([^`]+)`/g)].map((m) => /^\p{L}+(-.+)$/u.exec(m[1]!)?.[1] ?? m[1]!);
  const marks = [...line.replace(/`[^`]*`/g, "").matchAll(/(?<=^|\s)[%;&?!]+(?=\p{L})/gu)].flatMap((m) => [...m[0]]);
  return [...code, ...marks];
}

/** The English with its drop-ins taken out; a suffix's English host stays (`lied-tha` → *lied*). */
const english = (line: string) =>
  line
    .replace(/`(\p{L}+)-[^`]+`/gu, "$1")
    .replace(/,?\s*`[^`]+`/g, "")
    .replace(/\.\./g, ".")
    .trim();

/** The flow whose outcomes include `form`, or the first word of a set phrase (`thanathum` of `thanathum blehon`). */
const flowOf = (form: string) =>
  Object.values(data.flows).find((flow) =>
    answerPaths(flow.questions).some((a) => {
      const f = outcomeFor(flow, a)!.form;
      return f === form || f.split(" ")[0] === form;
    }),
  );
const outcomeOf = (form: string) => outcomes.find((o) => o.form === form || o.form.split(" ")[0] === form)!;

/** `text` with the drop-in placed for `mark`, as *Use this* places it. */
function byCue(text: string, mark: Mark, form: string): string {
  const trigger = data.triggers.find((t) => t.id === mark.cue.trigger)!;
  return applyChanges(text, placeDropIn(mark.cue, outcomeOf(form).form, { placement: trigger.placement, joiner: trigger.joiner, dropCue: trigger.dropCue })).text;
}

/**
 * `answer` with `form` taken out and put back by typing a command where it was, as the writer
 * would with no English cue. A stack of tone marks (`?!`) takes one command per mark.
 */
function byCommand(answer: string, form: string): string {
  const at = answer.indexOf(form);
  const parts = /^\p{L}|^-/u.test(form) ? [form] : [...form];
  let placed = answer.slice(0, at) + answer.slice(at + form.length);
  let cursor = at;
  for (const part of parts) {
    const command = data.commands.find((c) => c.flow === flowOf(part)?.id);
    assert.ok(command, `no command inserts ${part}`);
    const typed = `${part.startsWith("-") ? " " : ""}/${command.name}${parts.length > 1 ? " " : ""}`;
    const line = placed.slice(0, cursor) + typed + placed.slice(cursor);
    const slash = cursor + typed.indexOf("/");
    placed = applyChanges(line, placeAtCommand(line, 0, { from: slash, to: slash + command.name.length + 1 }, part)).text;
    cursor += part.length;
  }
  return placed;
}

const words = (text: string): string[] => text.toLowerCase().match(/[\p{L}']+/gu) ?? [];

/**
 * The placed text is the lesson's answer, or, when the answer adds English the prompt lacks
 * (*He's bossy-tho* ***with his brother***), carries the form on the same English word.
 */
function assertPlaced(placed: string, prompt: string, answer: string, form: string, message: string) {
  if (placed === answer) return;
  const added = words(answer.replace(form, "")).filter((w) => !words(prompt).includes(w));
  assert.ok(added.length, `${message}: placed “${placed}”, the lesson has “${answer}”`);
  const host = answer.split(/\s+/).find((w) => w.includes(form))!.replace(/[.,!?;:]+$/, "");
  assert.ok(placed.includes(host), `${message}: placed “${placed}”, the lesson has ${host}`);
}

describe("editor data", () => {
  it("builds with no problems", () => {
    assert.deepEqual(problems, []);
  });

  it("covers every lesson, in track order", () => {
    assert.deepEqual(lessonIds, [
      "could-be",
      "how-you-know",
      "labels",
      "can-and-cant",
      "thanks-and-sorry",
      "allowed-required-agreed",
      "oughts-and-motives",
      "wants-and-plans",
      "decisions-and-tries",
      "feelings",
      "tone-marks",
    ]);
  });

  it("fails on a cue that names a word list that does not exist", () => {
    const csv = sources.triggersCsv.replace("@trait", "@traits");
    assert.notEqual(csv, sources.triggersCsv);
    const result = buildEditorData({ ...sources, triggersCsv: csv });
    assert.ok(result.problems.some((p) => /no word list `traits`/.test(p)), result.problems.join("\n"));
  });

  it("fails on a word in two lists", () => {
    const result = buildEditorData({ ...sources, wordsCsv: `${sources.wordsCsv}emotion-unmet,lazy\n` });
    assert.ok(result.problems.some((p) => /lazy is in both trait and emotion-unmet/.test(p)), result.problems.join("\n"));
  });

  it("presets the need for an emotion word", () => {
    assert.deepEqual(presetFor("I'm so confused", data.wordDefaults), { sake: "understanding" });
    assert.deepEqual(presetFor("I'm so anxious", data.wordDefaults), {});
  });

  it("fails on a preset that names no choice, or a preset on a trait word", () => {
    const bad = buildEditorData({ ...sources, wordsCsv: `${sources.wordsCsv}emotion-unmet,zany,sake=nonsense\n` });
    assert.ok(bad.problems.some((p) => /zany: preset/.test(p)), bad.problems.join("\n"));
    const trait = buildEditorData({ ...sources, wordsCsv: `${sources.wordsCsv}trait,zany,sake=purpose\n` });
    assert.ok(trait.problems.some((p) => /only an emotion word has a preset/.test(p)), trait.problems.join("\n"));
  });

  it("fails on a flow that names a cell the sheet does not have", () => {
    const broken = sources.flowsJson.replace('"row": "could be"', '"row": "might be"');
    assert.notEqual(broken, sources.flowsJson);
    const result = buildEditorData({ ...sources, flowsJson: broken });
    assert.ok(result.problems.some((p) => /might be/.test(p)), result.problems.join("\n"));
  });

  it("fails when a gap phrase has no cue", () => {
    const csv = sources.triggersCsv.split("\n").filter((line) => !line.startsWith("thanks,")).join("\n");
    const result = buildEditorData({ ...sources, triggersCsv: csv });
    assert.ok(result.problems.some((p) => /\*Thanks\* raises no/.test(p)), result.problems.join("\n"));
  });

  it("fails on a command that presets an answer its flow lacks", () => {
    const broken = sources.flowsJson.replace('"plan": { "kind": "planned" }', '"plan": { "kind": "hoped" }');
    assert.notEqual(broken, sources.flowsJson);
    const result = buildEditorData({ ...sources, flowsJson: broken });
    assert.ok(result.problems.some((p) => /\/plan: `kind=hoped`/.test(p)), result.problems.join("\n"));
  });

  it("produces only word forms that parse", { timeout: 60_000 }, () => {
    for (const form of allForms) if (/^\p{L}/u.test(form)) assert.doesNotThrow(() => parse(form), form);
  });

  it("starts every question on its default and covers every answer path", () => {
    for (const flow of Object.values(data.flows)) {
      const firsts = Object.fromEntries(flow.questions.map((q) => [q.id, q.choices[0]!.value]));
      assert.ok(outcomeFor(flow, firsts), flow.id);
      for (const answers of answerPaths(flow.questions)) assert.ok(outcomeFor(flow, answers), `${flow.id}: ${JSON.stringify(answers)}`);
    }
  });

  it("gives every form one lesson", () => {
    const lessonOf = new Map<string, string>();
    for (const flow of Object.values(data.flows)) {
      for (const answers of answerPaths(flow.questions)) {
        const { form } = outcomeFor(flow, answers)!;
        assert.ok((lessonOf.get(form) ?? flow.lesson) === flow.lesson, `${form}: ${lessonOf.get(form)} and ${flow.lesson}`);
        lessonOf.set(form, flow.lesson);
      }
    }
  });

  it("breaks a feeling into the parts the cheat sheet shows", () => {
    const flow = data.flows.feeling!;
    const outcome = outcomeFor(flow, { sake: "competence", stance: "unmet", ending: "-r", locus: "the atmosphere", motion: "-r" })!;
    const sheetLine = /^`([^`]+)` \*can I measure up/m.exec(sources.sheet)!;
    assert.equal(outcome.form, sheetLine[1]);
    const header = tables(sources.sheet).find((t) => t.section === "feelings")!.header;
    assert.deepEqual(outcome.breakdown!.map((p) => p.text), cells(header).flatMap((c) => spans(c)));
    assert.deepEqual(outcome.breakdown!.map((p) => p.question), ["sake", "stance", "ending", "locus", "motion"]);
  });

  it("can insert every cheat sheet form from a card or a command", () => {
    const sakeParts = (section: string | undefined, index: number, col: number) => section === "sakes" && (index === 0 || col === 0);
    const counts = new Map<string, number>();
    for (const table of tables(sources.sheet)) {
      const index = counts.get(table.section ?? "") ?? 0;
      counts.set(table.section ?? "", index + 1);
      // Feelings tables list parts (a locus), not drop-ins: the whole word is checked below.
      if (table.section === "sounds" || table.section === "feelings") continue;
      for (const row of table.rows) {
        cells(row.text).forEach((cell, col) => {
          if (sakeParts(table.section, index, col)) return;
          for (const form of spans(cell)) assert.ok(insertable.has(form), `${form} (#${table.section})`);
        });
      }
    }
    const feelings = /^## .*\{#feelings\}$([\s\S]*?)^## /m.exec(sources.sheet)![1]!;
    const composed = feelings.split("\n").filter((l) => !l.startsWith("|")).flatMap((l) => spans(l));
    assert.ok(composed.length > 0);
    for (const form of composed) assert.ok(insertable.has(form), `${form} (#feelings)`);
  });

  it("names every command once, each from a flow with outcomes", () => {
    const names = data.commands.map((c) => c.name);
    assert.equal(new Set(names).size, names.length);
    for (const c of data.commands) assert.ok(answerPaths(data.flows[c.flow]!.questions).length > 0, c.name);
  });

  it("keeps English words within reach of a form out of near misses", () => {
    assert.ok(data.english.length > 0);
    const sample = data.english.find((w) => w.length >= 4) ?? data.english[0]!;
    const known = new Set(Object.keys(glossary));
    const text = `A thunderstorm kept me up, so I tuned the guitar with a tuner and went to the theater. ${sample} again. Twenty-two of us went tip-toe in bow-ties.`;
    assert.deepEqual(findNearMisses(text, known, { english: new Set(data.english) }), []);
  });

  it("reads every lesson's practice items, with the drop-ins in each answer", () => {
    for (const id of lessonIds) {
      const items = data.practice[id]!;
      assert.equal(items.length, lessonPractice(sources.lessons.get(id)!).length, id);
      assert.ok(items.length > 0, id);
      for (const item of items) assert.ok(item.forms.length > 0, `${id}: ${item.answer}`);
    }
  });
});

describe("lesson round-trip", () => {
  for (const id of lessonIds) {
    const markdown = sources.lessons.get(id)!;

    it(`${id}: every drop-in in the examples and practice can be built from a card`, () => {
      const lines = [...examples(markdown), ...lessonPractice(markdown).map((p) => p.answer)];
      assert.ok(lines.length > 0);
      for (const line of lines) for (const form of dropIns(line)) assert.ok(insertable.has(form), `${form} in “${line}”`);
    });

    it(`${id}: an example's English raises cues only from its own lesson`, () => {
      for (const line of examples(markdown)) {
        for (const mark of scanner(english(line), ALL)) {
          for (const cue of [mark.cue, ...mark.also]) assert.equal(cue.lesson, id, `“${english(line)}” raised ${cue.trigger}`);
        }
      }
    });
  }

  /** A cue in front of each practice prompt that has none of its own. */
  const prefixes: Record<string, string> = { "could-be": "I think", "how-you-know": "Apparently", "thanks-and-sorry": "Sorry," };
  for (const id of lessonIds) {
    it(`${id}: a practice prompt's cue, or a command, places the answer's form as the lesson does`, () => {
      for (const item of data.practice[id]!) {
        const [form] = item.forms;
        // A thanks answer is a new sentence with no English cue to place against; a sorry answer replaces *Sorry*.
        if (id === "thanks-and-sorry" && flowOf(form!)?.id !== "sorry") continue;
        const own = scanner(item.prompt, ALL).find((m) => m.cue.lesson === id);
        const text = own || !prefixes[id] ? item.prompt : `${prefixes[id]} ${item.prompt[0]!.toLowerCase()}${item.prompt.slice(1)}`;
        const [mark] = own ? [own] : prefixes[id] ? scanner(text, ALL) : [];
        const placed = mark ? byCue(text, mark, form!) : byCommand(item.answer, form!);
        assertPlaced(placed, text, item.answer, form!, `“${item.prompt}”`);
      }
    });
  }

  /** Lessons whose examples each say one drop-in per sentence, with the English cue left in. */
  for (const id of ["labels", "feelings"]) {
    it(`${id}: each example sentence's cue, or a command, places its drop-in as the lesson does`, () => {
      for (const line of examples(sources.lessons.get(id)!)) {
        for (const sentence of line.split(/(?<=[.!?])\s+/)) {
          const [form, more] = dropIns(sentence);
          assert.ok(form && !more, sentence);
          const answer = sentence.replace(/`/g, "");
          const prompt = english(sentence);
          const mark = scanner(prompt, ALL).find((m) => m.cue.lesson === id);
          assert.equal(mark ? byCue(prompt, mark, form) : byCommand(answer, form), answer, `“${prompt}”`);
        }
      }
    });
  }

  it("thanks-and-sorry: the kept-cue thanks example places as the lesson writes it", () => {
    const line = examples(sources.lessons.get("thanks-and-sorry")!).find((l) => /^Thanks\b/.test(l))!;
    const text = english(line);
    const [mark] = scanner(text, ALL);
    const trigger = data.triggers.find((t) => t.id === mark!.cue.trigger)!;
    const placed = applyChanges(text, placeDropIn(mark!.cue, dropIns(line)[0]!, { placement: trigger.placement, joiner: trigger.joiner, dropCue: trigger.dropCue }));
    assert.equal(placed.text, line.replace(/`/g, ""));
  });

  it("tokenizes a tone mark apart from the word it colors", () => {
    assert.deepEqual(tokenize("%You're").map((t) => t.text), ["%", "You're"]);
  });
});
