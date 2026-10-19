import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEditorData } from "./data.js";
import { compileTrigger, createScanner, type Cue } from "./match.js";
import { ownedNoun } from "./owned-noun.js";
import { applyChanges, placeAtCommand, placeDropIn, type PlaceOptions } from "./place.js";

const { data } = buildEditorData();
const scanner = createScanner(data.triggers.map(compileTrigger), data.lessons.map((l) => l.id));
const ALL = { enabled: new Set(data.lessons.map((l) => l.id)), never: new Set<string>(), dismissed: new Set<string>(), formsByLesson: new Map() };

/** Placement is the same for any form, so these use a placeholder rather than a spelling. */
const FORM = "FORM";

function cueIn(text: string): Cue {
  const [mark] = scanner(text, ALL);
  assert.ok(mark, `no cue in “${text}”`);
  return mark.cue;
}

function place(text: string, over: Partial<PlaceOptions> = {}): string {
  const options: PlaceOptions = { placement: "after-clause", joiner: "space", dropCue: true, ...over };
  return applyChanges(text, placeDropIn(cueIn(text), FORM, options)).text;
}

describe("after-clause placement", () => {
  const dropped: [string, string][] = [
    ["I think the store is closed.", "The store is closed FORM."],
    ["The store is probably closed.", "The store is closed FORM."],
    ["Probably, the store is closed.", "The store is closed FORM."],
    ["The store is closed, I think.", "The store is closed FORM."],
    ["The store, I think, is closed.", "The store is closed FORM."],
    ["I think the store is closed, so I'll go tomorrow.", "The store is closed FORM, so I'll go tomorrow."],
    ["I heard that Marco quit", "Marco quit FORM"],
  ];
  for (const [input, output] of dropped) {
    it(`“${input}” → “${output}”`, () => assert.equal(place(input), output));
  }

  it("keeps the cue when asked", () => {
    assert.equal(place("I think the store is closed.", { dropCue: false }), "I think the store is closed FORM.");
  });

  it("joins with a comma", () => {
    assert.equal(place("Thanks!", { joiner: "comma", dropCue: false }), "Thanks, FORM!");
    assert.equal(place("Thanks for the ride", { joiner: "comma", dropCue: false }), "Thanks for the ride, FORM");
  });

  it("joins as its own sentence", () => {
    assert.equal(place("Sorry, I cancelled again.", { joiner: "sentence" }), "I cancelled again. FORM.");
    assert.equal(place("I'm sorry I'm late", { joiner: "sentence" }), "I'm late. FORM");
  });

  it("keeps a cue that is the whole sentence", () => {
    assert.equal(place("Sorry!", { joiner: "sentence" }), "Sorry! FORM.");
  });

  it("works at document offsets past the first sentence", () => {
    const text = "Long day. I think it rained.";
    const changes = placeDropIn(cueIn(text), FORM, { placement: "after-clause", joiner: "space", dropCue: true });
    assert.equal(applyChanges(text, changes).text, "Long day. It rained FORM.");
  });

  it("reports where the form landed", () => {
    const text = "I think it rained.";
    const result = applyChanges(text, placeDropIn(cueIn(text), FORM, { placement: "after-clause", joiner: "space", dropCue: true }));
    assert.equal(result.text.slice(result.form!.from, result.form!.to), FORM);
  });
});

describe("after-noun placement", () => {
  it("puts the form right after the owned noun phrase", () => {
    const text = "Thank you, my old coat, for ten winters.";
    const noun = ownedNoun(text);
    assert.equal(noun?.text, "my old coat");
    assert.equal(place(text, { placement: "after-noun", dropCue: false, noun }), "Thank you, my old coat FORM, for ten winters.");
  });

  it("finds no owned noun without `my`", () => {
    assert.equal(ownedNoun("Thanks for the ride."), undefined);
  });

  it("stops the noun phrase before a date word", () => {
    assert.equal(ownedNoun("Grateful for my running shoes today.")?.text, "my running shoes");
  });
});

describe("suffix placement", () => {
  const suffix = (text: string) => place(text, { placement: "suffix", dropCue: false }).replace(FORM, "-S");
  const cases: [string, string][] = [
    ["I can't sing.", "I sing-S."],
    ["He can't read music.", "He read-S music."],
    ["I can't even breathe.", "I even breathe-S."],
    ["Can't sleep.", "Sleep-S."],
    ["I cannot drink milk", "I drink-S milk"],
    ["I couldn't sleep.", "I sleep-S."],
    ["I'm not able to focus.", "I'm focus-S."],
  ];
  for (const [input, output] of cases) {
    it(`“${input}” → “${output}”, always dropping the cue`, () => assert.equal(suffix(input), output));
  }

  it("places nothing when no verb follows", () => {
    assert.deepEqual(placeDropIn(cueIn("I can't"), FORM, { placement: "suffix", joiner: "space", dropCue: true }), []);
  });
});

describe("on-cue placement", () => {
  const onCue = (text: string) => place(text, { placement: "on-cue" }).replace(FORM, "-S");
  const cases: [string, string][] = [
    ["He's a liar.", "He's a liar-S."],
    ["I was so lazy this morning.", "I was so lazy-S this morning."],
    ["She's rude, to him at least.", "She's rude-S, to him at least."],
    ["Long day. You're such a jerk", "Long day. You're such a jerk-S"],
  ];
  for (const [input, output] of cases) {
    it(`“${input}” → “${output}”, keeping the cue`, () => assert.equal(onCue(input), output));
  }
});

describe("before-word placement", () => {
  const mark = (text: string, dropCue: boolean) => applyChanges(text, placeDropIn(cueIn(text), "%", { placement: "before-word", joiner: "space", dropCue })).text;

  it("puts the mark at the start of the sentence", () => {
    assert.equal(mark("You're the worst.", false), "%You're the worst.");
    assert.equal(mark("Long day. You're the worst.", false), "Long day. %You're the worst.");
  });

  it("drops a laugh at either end", () => {
    assert.equal(mark("Mondays again lol", true), "%Mondays again");
    assert.equal(mark("lol mondays again", true), "%mondays again");
    assert.equal(mark("Lol mondays again", true), "%Mondays again");
  });
});

describe("command placement", () => {
  function command(line: string, form: string): string {
    const m = /\/[a-z]+/.exec(line)!;
    return applyChanges(line, placeAtCommand(line, 0, { from: m.index, to: m.index + m[0].length }, form)).text;
  }

  it("puts a word in the command's place", () => {
    assert.equal(command("The store is closed /sure.", "FORM"), "The store is closed FORM.");
    assert.equal(applyChanges("/sureit rained", placeAtCommand("/sureit rained", 0, { from: 0, to: 5 }, "FORM")).text, "FORM it rained");
  });

  it("joins a suffix to the word before it", () => {
    assert.equal(command("I sing /can in public", "-xo"), "I sing-xo in public");
    assert.equal(command("I sing/can", "-xo"), "I sing-xo");
    assert.deepEqual(placeAtCommand("/can sing", 0, { from: 0, to: 4 }, "-xo"), []);
  });

  it("joins a tone mark to the word after it", () => {
    assert.equal(command("/tone You're the worst.", "%"), "%You're the worst.");
    assert.equal(command("We went /tone Tuesday.", "&"), "We went &Tuesday.");
  });
});
