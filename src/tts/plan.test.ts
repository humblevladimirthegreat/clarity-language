import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { previewPhonemes, previewSpeech } from "./plan.js";

function boundaryTags(plan: ReturnType<typeof previewSpeech>): string[] {
  return plan.tokens.filter((t) => t.kind === "boundary").map((t) => t.tag);
}

describe("previewSpeech", () => {
  it("passes through already speech-shaped words", () => {
    const plan = previewSpeech("zazawan vawalal.");
    assert.deepEqual(plan.spoken, ["zazawan", "vawalal"]);
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"));
  });

  it("expands writing number shorthand to speech CV", () => {
    const writing = previewSpeech("g+3");
    assert.deepEqual(writing.spoken, ["grarel"]);

    const speech = previewSpeech("grarel");
    assert.deepEqual(speech.spoken, ["grarel"]);
  });

  it("speaks a span's words and skips foreign interiors", () => {
    const span = previewSpeech("d[hi]");
    assert.deepEqual(span.spoken, []);
    assert.ok(span.skipped.some((s) => s.raw === "hi" && s.reason === "foreign"));

    const foreign = previewSpeech("d<sushi>");
    assert.deepEqual(foreign.spoken, []);
    assert.ok(foreign.skipped.some((s) => s.raw === "sushi" && s.reason === "foreign"));
  });

  it("speaks a multi-token cite without opens or closes", () => {
    assert.deepEqual(previewSpeech("d[zadagal zagadul]").spoken, ["zadagal", "zagadul"]);
    assert.deepEqual(previewSpeech("d@[zadagal zagadul]").spoken, ["zadagal", "zagadul"]);
  });

  it("tags island edges without skipping them", () => {
    const plan = previewSpeech("{ zazawan vawalal }");
    assert.deepEqual(boundaryTags(plan), ["islandEnter", "islandExit"]);
    assert.deepEqual(plan.spoken, ["zazawan", "vawalal"]);
    assert.equal(plan.skipped.length, 0);
  });

  it("tags island in join scope example", () => {
    const plan = previewSpeech("zazawan { zununel zal } zam.");
    assert.deepEqual(plan.spoken, ["zazawan", "zununel", "zal", "zam"]);
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "islandEnter"));
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "islandExit"));
  });

  it("adds question boundary", () => {
    const plan = previewSpeech("yol zazawan vawalal?");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "qmark"));
  });

  it("adds xContinue before discourse linker after period", () => {
    const plan = previewSpeech("zazawan vawalal. xamalal zululon vurunul.");
    const tags = boundaryTags(plan);
    assert.ok(tags.includes("period"));
    assert.ok(tags.includes("xContinue"));
    assert.equal(tags.includes("yTurn"), false);
    const xIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "xContinue");
    const linkerIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "xamalal");
    assert.ok(xIdx >= 0 && linkerIdx > xIdx);
  });

  it("adds xContinue before clause join", () => {
    const plan = previewSpeech("zazawan vawalal zululon vurunul xan.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "xContinue"));
    const xIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "xContinue");
    const joinIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "xan");
    assert.ok(xIdx >= 0 && joinIdx > xIdx);
  });

  it("adds yTurn before polar second turn", () => {
    const plan = previewSpeech("zazawan vawalal. yael.");
    assert.deepEqual(plan.spoken, ["zazawan", "vawalal", "yael"]);
    const tags = boundaryTags(plan);
    assert.ok(tags.includes("period"));
    assert.ok(tags.includes("yTurn"));
    const jIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "yTurn");
    const polarIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "yael");
    assert.ok(jIdx >= 0 && polarIdx > jIdx);
  });

  it("uses softM for soft force statement", () => {
    const plan = previewSpeech("yam zazawan vawalal.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "softM"));
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"), false);
  });

  it("keeps period for firm polar turn", () => {
    const plan = previewSpeech("yael.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"));
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "softM"), false);
  });

  it("does not add yTurn after period before reviser", () => {
    const plan = previewSpeech("zazawan vawalal. al zululon vawalal.");
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "yTurn"), false);
  });

  it("skips unparsed tokens instead of throwing", () => {
    const plan = previewSpeech("zazawan zl.");
    assert.deepEqual(plan.spoken, ["zazawan"]);
    assert.ok(plan.skipped.some((s) => s.raw === "zl" && s.reason === "error"));
    assert.doesNotThrow(() => previewPhonemes("zl"));
  });
});

describe("previewPhonemes", () => {
  it("builds IPA for a plain clause", () => {
    const plan = previewPhonemes("zazawan gozezomum.");
    assert.deepEqual(
      plan.words.map((w) => w.ipa),
      ["zä.zä.wän", "ɡo̞.ze̞.zo̞.mʉm"],
    );
    assert.equal(plan.ipaPhonemes, "zäzäwän ɡo̞ze̞zo̞mʉm.");
  });

  it("builds a word-spaced IPA phoneme stream", () => {
    const plan = previewPhonemes("zazawan vawalal.");
    assert.equal(plan.ipaPhonemes, "zäzäwän väwäläl.");
    const yuon = previewPhonemes("yuon");
    assert.equal(yuon.ipaPhonemes, "jʉo̞n");
  });

  it("includes punctuation cue between phoneme spans", () => {
    const plan = previewPhonemes("zazawan vawalal?");
    assert.match(plan.ipaPhonemes, /\?$/);
  });

  it("uses comma dip before discourse linker", () => {
    const plan = previewPhonemes("zazawan vawalal. xamalal zululon vurunul.");
    assert.match(plan.ipaPhonemes, /\.,/);
  });

  it("keeps word spaces inside islands without comma between words", () => {
    const plan = previewPhonemes("{ zazawan vawalal }");
    assert.match(plan.ipaPhonemes, /zäzäwän väwäläl/);
    assert.doesNotMatch(plan.ipaPhonemes, /wän, vä/);
  });
});
