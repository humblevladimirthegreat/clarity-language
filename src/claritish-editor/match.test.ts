import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEditorData } from "./data.js";
import { compileTrigger, createScanner, dismissKey, parsePattern, matchAt, sentences, tokenize, type ScanOptions } from "./match.js";

const { data } = buildEditorData();
const triggers = data.triggers.map(compileTrigger);
const order = data.lessons.map((l) => l.id);
const formsByLesson = new Map(Object.entries(data.formsByLesson).map(([k, v]) => [k, new Set(v)]));

function options(over: Partial<ScanOptions> = {}): ScanOptions {
  return { enabled: new Set(order), never: new Set(), dismissed: new Set(), formsByLesson, ...over };
}

function scan(text: string, over: Partial<ScanOptions> = {}) {
  return createScanner(triggers, order)(text, options(over));
}

describe("patterns", () => {
  it("matches optional words and alternatives, longest first", () => {
    const p = parsePattern("I (just) think/guess (that)");
    const tokens = tokenize("i just guess that it rained");
    assert.equal(matchAt(p, tokens, 0), 4);
    assert.equal(matchAt(p, tokenize("I think it rained"), 0), 2);
    assert.equal(matchAt(p, tokenize("we think"), 0), -1);
  });

  it("treats curly and straight apostrophes alike", () => {
    assert.equal(matchAt(parsePattern("I'm sorry"), tokenize("I’m sorry"), 0), 2);
  });

  it("matches `*` inside a token", () => {
    assert.equal(matchAt(parsePattern("like *ing"), tokenize("like going"), 0), 2);
    assert.equal(matchAt(parsePattern("like *ing"), tokenize("like a"), 0), -1);
  });

  it("rejects a pattern with no required token", () => {
    assert.throws(() => parsePattern("(just)"));
  });
});

describe("sentences", () => {
  it("splits on terminal punctuation and line breaks", () => {
    assert.deepEqual(
      sentences("I left. Did I?\nNew line").map((s) => s.text),
      ["I left.", "Did I?", "New line"],
    );
  });

  it("drops quoted and code tokens", () => {
    const [s] = sentences('She said "I think so" and `I think` too.');
    assert.ok(!s!.tokens.some((t) => t.norm === "think"));
  });
});

describe("cues", () => {
  const cases: [string, string, string][] = [
    ["I think the store is closed.", "i-think", "I think"],
    ["The flight is probably delayed.", "probably", "probably"],
    ["I heard that Marco quit.", "i-heard", "I heard that"],
    ["Apparently the server is down.", "apparently", "Apparently"],
    ["Thanks for the ride!", "thanks", "Thanks"],
    ["I'm so sorry I missed it.", "sorry", "I'm so sorry"],
    ["I feel like something's wrong.", "i-feel-like", "I feel like"],
    ["I can't sing in front of people.", "cant", "can't"],
    ["I couldn't sleep last night.", "cant", "couldn't"],
    ["I'm unable to focus today.", "cant", "unable to"],
    ["She isn't able to drive yet.", "cant", "isn't able to"],
    ["We're not allowed to park here.", "forbidden", "not allowed"],
    ["I have to finish the report.", "required", "have to"],
    ["I borrowed your car without asking.", "assumed-ok", "without asking"],
    ["You should call her.", "you-should", "You should"],
    ["She should apologize.", "should", "should"],
    ["I did it for you.", "did-it-for", "I did it for you"],
    ["I want to visit in March.", "want", "I want to"],
    ["I'll call her tomorrow.", "plan", "I'll"],
    ["I've decided to quit.", "decided", "I've decided"],
    ["I'm going to try running.", "try", "I'm going to try"],
    ["Let's try the new place.", "trial", "Let's try"],
    ["Mondays again lol", "laughing", "lol"],
    ["See you soon <3", "hearts", "<3"],
  ];
  for (const [text, trigger, cue] of cases) {
    it(`flags *${cue}* in “${text}”`, () => {
      const marks = scan(text);
      assert.equal(marks.length, 1);
      assert.equal(marks[0]!.cue.trigger, trigger);
      assert.equal(marks[0]!.cue.text, cue);
    });
  }

  const quiet = [
    "I think so.",
    "Thanks to the rain, the match was cancelled.",
    "No thanks, I'm full.",
    "Sorry?",
    "I was sorry to hear about your dad.",
    "I'm sorry for your loss.",
    "I feel sorry for him.",
    "I believe in you.",
    "I feel like going for a walk.",
    "I feel like a fool.",
    "I might go to the gym.",
    "She speaks clearly.",
    "Remember to call Mom.",
    "I remember when we met.",
    'He said "I think it is broken" and left.',
    "I thought about it all day.",
    "The package arrived on Friday.",
    "I can't wait to see you.",
    "That can't be right.",
    "Why can't I sleep?",
    "I couldn't care less.",
    "It couldn't be better.",
    "No, I can't.",
    "I'm going to the store.",
    "I'll be fine.",
    "I should have called.",
    "It should be fine.",
    "Should I call her?",
    "You don't have to come.",
    "She did it for you.",
    "I got to see the coast.",
  ];
  for (const text of quiet) {
    it(`raises nothing for “${text}”`, () => {
      assert.deepEqual(scan(text).map((m) => m.cue.text), []);
    });
  }

  it("marks *maybe we should* for the should, not the maybe", () => {
    assert.deepEqual(scan("Maybe we should leave early.").map((m) => m.cue.trigger), ["you-should"]);
  });

  it("puts one mark on a sentence, from the earliest lesson, and the rest under Also here", () => {
    const [mark, ...rest] = scan("Apparently I think the store is closed.");
    assert.equal(rest.length, 0);
    assert.equal(mark!.cue.lesson, order[0]);
    assert.deepEqual(mark!.also.map((c) => c.trigger), ["apparently"]);
  });

  it("marks each sentence on its own, with document offsets", () => {
    const text = "Long day.\nI think it rained. Thanks for the umbrella.";
    const marks = scan(text);
    assert.deepEqual(marks.map((m) => text.slice(m.cue.from, m.cue.to)), ["I think", "Thanks"]);
  });

  it("follows the lesson filter, the never-flag list, and Leave it", () => {
    const text = "I think it rained.";
    assert.equal(scan(text, { enabled: new Set(order.slice(1)) }).length, 0);
    assert.equal(scan(text, { never: new Set(["i think"]) }).length, 0);
    const [mark] = scan(text);
    assert.equal(scan(text, { dismissed: new Set([dismissKey(mark!.cue)]) }).length, 0);
    assert.equal(scan("I think it snowed.", { dismissed: new Set([dismissKey(mark!.cue)]) }).length, 1);
  });

  it("does not flag a sentence that already has a drop-in from the cue's lesson", () => {
    const form = data.formsByLesson[order[0]!]![0]!;
    assert.equal(scan(`I think it rained ${form}.`).length, 0);
    assert.equal(scan("%You're the worst.").length, 0);
    assert.equal(scan("I can't sing, but I drive-xe.").length, 0);
  });
});
