import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { previewPhonemes, previewSpeech } from "./plan.js";

describe("previewSpeech", () => {
  it("passes through already speech-shaped words", () => {
    const plan = previewSpeech("zazawan vawul.");
    assert.deepEqual(plan.spoken, ["zazawan", "vawul"]);
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"));
  });

  it("expands writing number shorthand to speech CV", () => {
    const writing = previewSpeech("g+3");
    assert.deepEqual(writing.spoken, ["grarel"]);

    const speech = previewSpeech("grarel");
    assert.deepEqual(speech.spoken, ["grarel"]);
  });

  it("expands writing spans and skips foreign interiors", () => {
    const span = previewSpeech("d[hi]");
    assert.deepEqual(span.spoken, ["daxol"]);
    assert.ok(span.skipped.some((s) => s.raw === "hi" && s.reason === "foreign"));

    const foreign = previewSpeech("d<sushi>");
    assert.deepEqual(foreign.spoken, ["duxol"]);
    assert.ok(foreign.skipped.some((s) => s.raw === "sushi" && s.reason === "foreign"));
  });

  it("expands multi-token cite with close", () => {
    const plan = previewSpeech("d[zogodol zagadal]");
    assert.deepEqual(plan.spoken, ["daxal", "zogodol", "zagadal", "xuxul"]);
  });

  it("expands span anaphor and empty cite", () => {
    assert.deepEqual(previewSpeech("d[=]").spoken, ["daxur"]);
    assert.deepEqual(previewSpeech("d[]").spoken, ["daxul"]);
    assert.deepEqual(previewSpeech("d@[Hamlet]").spoken, ["daxon"]);
  });

  it("skips island edges", () => {
    const plan = previewSpeech("^ zazawan vawul ^");
    assert.ok(plan.skipped.some((s) => s.reason === "island"));
    assert.deepEqual(plan.spoken, ["zazawan", "vawul"]);
  });

  it("adds question boundary", () => {
    const plan = previewSpeech("jol zazawan vawul?");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "qmark"));
  });
});

describe("previewPhonemes", () => {
  it("builds IPA for a plain clause", () => {
    const plan = previewPhonemes("zazawan guzem.");
    assert.deepEqual(
      plan.words.map((w) => w.ipa),
      ["zɑ.zɑ.wɑn", "ɡʌ.ze̞m"],
    );
    assert.match(plan.espeak, /\[\[zA\.zA\.wAn _ gV\.zem\]\]\./);
  });

  it("includes punctuation cue between phoneme spans", () => {
    const plan = previewPhonemes("zazawan vawul?");
    assert.match(plan.espeak, /\]\]\?/);
  });
});
