import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
import { loadDefaultTables } from "../parse/index.js";
import { analyzeEnglish, type JobSuggestion, type RootSuggestion, type Slot } from "./analyze.js";
import { loadHelperData } from "./load.js";
import { verifyDraft } from "./verify.js";

const tables = loadDefaultTables();
const data = loadHelperData();

const slotOf = (english: string, text: string): Slot =>
  analyzeEnglish(data, english)
    .clauses.flatMap((c) => c.slots)
    .find((s) => s.text === text)!;
const wordOf = (english: string, text: string) => slotOf(english, text).suggestions.find((s): s is RootSuggestion => s.kind === "lexicon" && !!s.word)!.word!;
const jobOf = (english: string, text: string, link: string) => slotOf(english, text).suggestions.find((s): s is JobSuggestion => s.kind === "job" && s.link === link)!;

describe("verifyDraft: someone else's stance", () => {
  const english = "Alazun wants to walk.";
  const held = jobOf(english, "wants to", "want-and-decide.md#whose-intention").phrase!.split(" / ")[0]!;
  const want = held.split(" ").pop()!;
  const subject = wordOf(english, "Alazun");
  const walk = wordOf(english, "walk");

  it("flags a bare WANT when someone else owns it", () => {
    assert.deepEqual(verifyDraft(english, `${subject} ${want} ${walk}.`, tables, data).missingHolder, [want]);
  });

  it("passes the same WANT after a holder", () => {
    assert.equal(verifyDraft(english, `${subject} ${held} ${walk}.`, tables, data).missingHolder, undefined);
  });

  it("passes a bare WANT when the speaker owns it", () => {
    assert.equal(verifyDraft("I want to walk.", `z${CLOSED.microphone}n ${want} ${walk}.`, tables, data).missingHolder, undefined);
  });

  it("flags a bare feeling when someone else has it", () => {
    const upset = "Alazun is upset.";
    const feeling = jobOf(upset, "upset", "say-reasons.md#sake-words").form;
    const draft = `${wordOf(upset, "Alazun")} ${feeling}.`;
    assert.deepEqual(verifyDraft(upset, draft, tables, data).missingHolder, [feeling.split(" ")[0]]);
  });
});
