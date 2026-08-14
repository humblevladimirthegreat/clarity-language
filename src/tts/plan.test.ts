import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { previewPhonemes, previewSpeech } from "./plan.js";

describe("previewSpeech", () => {
  it("passes through already speech-shaped words", () => {
    const plan = previewSpeech("zazawan vawul.");
    assert.deepEqual(plan.spoken, ["zazawan", "vawul"]);
    assert.ok(plan.skipped.some((s) => s.raw === "." && s.reason === "punct"));
  });

  it("skips writing number shorthand but keeps speech CV", () => {
    const writing = previewSpeech("g+3");
    assert.deepEqual(writing.spoken, []);
    assert.equal(writing.skipped[0]?.reason, "shorthand");

    const speech = previewSpeech("grarel");
    assert.deepEqual(speech.spoken, ["grarel"]);
  });

  it("skips writing spans and foreign payloads", () => {
    const span = previewSpeech("d[hi]");
    assert.equal(span.skipped[0]?.reason, "writing");

    const foreign = previewSpeech("d<sushi>");
    assert.equal(foreign.skipped[0]?.reason, "foreign");
  });

  it("skips island edges", () => {
    const plan = previewSpeech("^ zazawan vawul ^");
    assert.ok(plan.skipped.some((s) => s.reason === "island"));
    assert.deepEqual(plan.spoken, ["zazawan", "vawul"]);
  });
});

describe("previewPhonemes", () => {
  it("builds IPA for a plain clause", () => {
    const plan = previewPhonemes("zazawan guzem.");
    assert.deepEqual(
      plan.words.map((w) => w.ipa),
        ["zɑ.zɑ.wɑn", "ɡʌ.ze̞m"],
    );
    assert.match(plan.espeak, /zA\.zA\.wAn/);
  });
});
