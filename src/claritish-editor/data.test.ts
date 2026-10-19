import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parse } from "../parse/index.js";
import { buildEditorData, readSources } from "./data.js";
import { compileTrigger, createScanner } from "./match.js";
import { applyChanges, placeDropIn } from "./place.js";
import { answerKey } from "./types.js";

const sources = readSources();
const { data, problems } = buildEditorData(sources);
const lessonIds = data.lessons.map((l) => l.id);
const scanner = createScanner(data.triggers.map(compileTrigger), lessonIds);
const ALL = { enabled: new Set(lessonIds), never: new Set<string>(), dismissed: new Set<string>(), formsByLesson: new Map() };
const allForms = new Set(Object.values(data.formsByLesson).flat());

/** `> …` example lines under `## Examples`. */
function examples(markdown: string): string[] {
  const section = /^## Examples.*$([\s\S]*?)^## /m.exec(markdown)?.[1] ?? "";
  return [...section.matchAll(/^>\s*(.+?)\s*$/gm)].map((m) => m[1]!);
}

/** Practice items: the italic prompt and the answer inside its details block. */
function practice(markdown: string): { prompt: string; answer: string }[] {
  return [...markdown.matchAll(/^\*\*\d+\.\*\* \*(.+?)\*.*\n\n::: details Show answer\n(.+)\n:::/gm)].map((m) => ({ prompt: m[1]!, answer: m[2]! }));
}

const dropIns = (line: string) => [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);

/** The English with its drop-ins taken out. */
const english = (line: string) => line.replace(/,?\s*`[^`]+`/g, "").replace(/\.\./g, ".").trim();

describe("editor data", () => {
  it("builds with no problems", () => {
    assert.deepEqual(problems, []);
  });

  it("covers three lessons, in track order", () => {
    assert.deepEqual(lessonIds, ["could-be", "how-you-know", "thanks-and-sorry"]);
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

  it("produces only forms that parse", () => {
    for (const form of allForms) assert.doesNotThrow(() => parse(form), form);
  });

  it("starts every question on its default and covers every answer path", () => {
    for (const flow of Object.values(data.flows)) {
      const firsts = Object.fromEntries(flow.questions.map((q) => [q.id, q.choices[0]!.value]));
      assert.ok(flow.outcomes[answerKey(flow.questions, firsts)], flow.id);
      const paths = flow.questions.reduce((n, q) => n * q.choices.length, 1);
      assert.equal(Object.keys(flow.outcomes).length, paths, flow.id);
    }
  });
});

describe("lesson round-trip", () => {
  for (const id of lessonIds) {
    const markdown = sources.lessons.get(id)!;

    it(`${id}: every drop-in in the examples and practice can be built from a card`, () => {
      const lines = [...examples(markdown), ...practice(markdown).map((p) => p.answer)];
      assert.ok(lines.length > 0);
      for (const line of lines) for (const form of dropIns(line)) assert.ok(allForms.has(form), `${form} in “${line}”`);
    });

    it(`${id}: an example's English raises cues only from its own lesson`, () => {
      for (const line of examples(markdown)) {
        for (const mark of scanner(english(line), ALL)) {
          for (const cue of [mark.cue, ...mark.also]) assert.equal(cue.lesson, id, `“${english(line)}” raised ${cue.trigger}`);
        }
      }
    });
  }

  /** A cue in front of each practice prompt; *Use this* with the answer's form should give the answer. */
  const prefixes: Record<string, string> = { "could-be": "I think", "how-you-know": "Apparently", "thanks-and-sorry": "Sorry," };
  for (const id of lessonIds) {
    it(`${id}: a cue added to a practice prompt places the answer's form as the lesson does`, () => {
      for (const { prompt, answer } of practice(sources.lessons.get(id)!)) {
        const [form] = dropIns(answer);
        // A thanks answer is a new sentence with no English cue to place against; a sorry answer replaces *Sorry*.
        if (id === "thanks-and-sorry" && !Object.values(data.flows.sorry!.outcomes).some((o) => o.form === form)) continue;
        const text = `${prefixes[id]} ${prompt[0]!.toLowerCase()}${prompt.slice(1)}`;
        const [mark] = scanner(text, ALL);
        assert.ok(mark, `no cue in “${text}”`);
        const trigger = data.triggers.find((t) => t.id === mark.cue.trigger)!;
        const placed = applyChanges(text, placeDropIn(mark.cue, form!, { placement: trigger.placement, joiner: trigger.joiner, dropCue: trigger.dropCue }));
        assert.equal(placed.text, answer.replace(/`/g, ""));
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
});
