import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEditorData } from "./data.js";
import { compileTrigger, createScanner, type Cue } from "./match.js";
import { ownedNoun } from "./owned-noun.js";
import { applyChanges, placeDropIn, type PlaceOptions } from "./place.js";

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
