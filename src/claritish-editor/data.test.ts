import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cells, spans, tables } from "../lint/cheat-sheet-tables.js";
import { parse } from "../parse/index.js";
import { buildEditorData, lessonPractice, readSources } from "./data.js";
import { compileTrigger, createScanner, tokenize } from "./match.js";
import { applyChanges, placeAtCommand, placeDropIn } from "./place.js";
import { findNearMisses } from "./read-back.js";
import { answerKey } from "./types.js";

const sources = readSources();
const { data, problems } = buildEditorData(sources);
const lessonIds = data.lessons.map((l) => l.id);
const scanner = createScanner(data.triggers.map(compileTrigger), lessonIds);
const ALL = { enabled: new Set(lessonIds), never: new Set<string>(), dismissed: new Set<string>(), formsByLesson: new Map() };
const outcomes = Object.values(data.flows).flatMap((f) => Object.values(f.outcomes));
const allForms = new Set(outcomes.map((o) => o.form));
/** Forms a card inserts, and each word of a multi-word one (`thanathum` from `thanathum behon`). */
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

/** The English with its drop-ins taken out. */
const english = (line: string) => line.replace(/,?\s*`[^`]+`/g, "").replace(/\.\./g, ".").trim();

describe("editor data", () => {
  it("builds with no problems", () => {
    assert.deepEqual(problems, []);
  });

  it("covers every lesson but Labels and Feelings, in track order", () => {
    assert.deepEqual(lessonIds, [
      "could-be",
      "how-you-know",
      "can-and-cant",
      "thanks-and-sorry",
      "allowed-required-agreed",
      "oughts-and-motives",
      "wants-and-plans",
      "decisions-and-tries",
      "tone-marks",
    ]);
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

  it("produces only word forms that parse", () => {
    for (const form of allForms) if (/^\p{L}/u.test(form)) assert.doesNotThrow(() => parse(form), form);
  });

  it("starts every question on its default and covers every answer path", () => {
    for (const flow of Object.values(data.flows)) {
      const firsts = Object.fromEntries(flow.questions.map((q) => [q.id, q.choices[0]!.value]));
      assert.ok(flow.outcomes[answerKey(flow.questions, firsts)], flow.id);
      const paths = flow.questions.reduce((n, q) => n * q.choices.filter((c) => !c.none).length, 1);
      assert.equal(Object.keys(flow.outcomes).length, paths, flow.id);
    }
  });

  it("can insert every cheat sheet form outside Labels and Feelings from a card or a command", () => {
    const sakeParts = (section: string | undefined, index: number, col: number) => section === "sakes" && (index === 0 || col === 0);
    const counts = new Map<string, number>();
    for (const table of tables(sources.sheet)) {
      const index = counts.get(table.section ?? "") ?? 0;
      counts.set(table.section ?? "", index + 1);
      if (table.section === "sounds" || table.section === "feelings") continue;
      for (const row of table.rows) {
        cells(row.text).forEach((cell, col) => {
          if (sakeParts(table.section, index, col)) return;
          for (const form of spans(cell)) {
            if (form.startsWith("-th")) continue; // label scope: Labels
            assert.ok(insertable.has(form), `${form} (#${table.section})`);
          }
        });
      }
    }
  });

  it("names every command once, each from a flow with outcomes", () => {
    const names = data.commands.map((c) => c.name);
    assert.equal(new Set(names).size, names.length);
    for (const c of data.commands) assert.ok(Object.keys(data.flows[c.flow]!.outcomes).length > 0, c.name);
  });

  it("keeps English words within reach of a form out of near misses", () => {
    assert.ok(data.english.includes("thunder"));
    const known = new Set(Object.keys(data.glossary));
    const text = "A thunderstorm kept me up, so I tuned the guitar with a tuner and went to the theater. Thunder again.";
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
        const flowOf = (f: string) => Object.values(data.flows).find((flow) => Object.values(flow.outcomes).some((o) => o.form === f || o.form.split(" ")[0] === f));
        // A thanks answer is a new sentence with no English cue to place against; a sorry answer replaces *Sorry*.
        if (id === "thanks-and-sorry" && flowOf(form!)?.id !== "sorry") continue;
        const own = scanner(item.prompt, ALL).find((m) => m.cue.lesson === id);
        const text = own || !prefixes[id] ? item.prompt : `${prefixes[id]} ${item.prompt[0]!.toLowerCase()}${item.prompt.slice(1)}`;
        const [mark] = own ? [own] : prefixes[id] ? scanner(text, ALL) : [];
        let placed: string;
        if (mark) {
          const trigger = data.triggers.find((t) => t.id === mark.cue.trigger)!;
          const outcome = outcomes.find((o) => o.form === form || o.form.split(" ")[0] === form)!;
          placed = applyChanges(text, placeDropIn(mark.cue, outcome.form, { placement: trigger.placement, joiner: trigger.joiner, dropCue: trigger.dropCue })).text;
        } else {
          // No cue: the writer types a command where the drop-in goes, and the card replaces it.
          // A stack of tone marks (`?!`) takes one command per mark.
          const at = item.answer.indexOf(form!);
          const parts = /^\p{L}|^-/u.test(form!) ? [form!] : [...form!];
          placed = item.answer.slice(0, at) + item.answer.slice(at + form!.length);
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
        }
        assert.equal(placed, item.answer, `“${item.prompt}”`);
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
