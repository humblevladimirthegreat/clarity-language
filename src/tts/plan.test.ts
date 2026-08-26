import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { previewPhonemes, previewSpeech } from "./plan.js";

function boundaryTags(plan: ReturnType<typeof previewSpeech>): string[] {
  return plan.tokens.filter((t) => t.kind === "boundary").map((t) => t.tag);
}

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

  it("tags island edges without skipping them", () => {
    const plan = previewSpeech("^ zazawan vawul ^");
    assert.deepEqual(boundaryTags(plan), ["islandEnter", "islandExit"]);
    assert.deepEqual(plan.spoken, ["zazawan", "vawul"]);
    assert.equal(plan.skipped.length, 0);
  });

  it("tags island in join scope example", () => {
    const plan = previewSpeech("zazawan ^ zudural zal ^ zam.");
    assert.deepEqual(plan.spoken, ["zazawan", "zudural", "zal", "zam"]);
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "islandEnter"));
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "islandExit"));
  });

  it("adds question boundary", () => {
    const plan = previewSpeech("jol zazawan vawul?");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "qmark"));
  });

  it("adds xContinue before discourse linker after period", () => {
    const plan = previewSpeech("zazawan vawul. xamalal zulonun vurunul.");
    const tags = boundaryTags(plan);
    assert.ok(tags.includes("period"));
    assert.ok(tags.includes("xContinue"));
    assert.equal(tags.includes("jTurn"), false);
    const xIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "xContinue");
    const linkerIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "xamalal");
    assert.ok(xIdx >= 0 && linkerIdx > xIdx);
  });

  it("adds xContinue before clause join", () => {
    const plan = previewSpeech("zazawan vawul zulonun vurunul xan.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "xContinue"));
    const xIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "xContinue");
    const joinIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "xan");
    assert.ok(xIdx >= 0 && joinIdx > xIdx);
  });

  it("adds jTurn before polar second turn", () => {
    const plan = previewSpeech("zazawan vawul. jael.");
    assert.deepEqual(plan.spoken, ["zazawan", "vawul", "jael"]);
    const tags = boundaryTags(plan);
    assert.ok(tags.includes("period"));
    assert.ok(tags.includes("jTurn"));
    const jIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "jTurn");
    const polarIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "jael");
    assert.ok(jIdx >= 0 && polarIdx > jIdx);
  });

  it("uses softM for soft force statement", () => {
    const plan = previewSpeech("jam zazawan vawul.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "softM"));
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"), false);
  });

  it("keeps period for firm polar turn", () => {
    const plan = previewSpeech("jael.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"));
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "softM"), false);
  });

  it("does not add jTurn after period before reviser", () => {
    const plan = previewSpeech("zazawan vawul. al zulonun vawul.");
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "jTurn"), false);
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

  it("uses comma dip before discourse linker", () => {
    const plan = previewPhonemes("zazawan vawul. xamalal zulonun vurunul.");
    assert.match(plan.espeak, /\]\]\.,/);
  });

  it("uses tighter spacing inside islands", () => {
    const plan = previewPhonemes("^ zazawan vawul ^");
    assert.match(plan.espeak, /\[\[zA\.zA\.wAn vA\.wVl\]\]/);
    assert.doesNotMatch(plan.espeak, /\[\[zA\.zA\.wAn _ vA\.wVl\]\]/);
  });
});
