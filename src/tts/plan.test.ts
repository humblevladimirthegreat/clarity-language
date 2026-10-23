import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { previewPhonemes, previewSpeech } from "./plan.js";

function boundaryTags(plan: ReturnType<typeof previewSpeech>): string[] {
  return plan.tokens.filter((t) => t.kind === "boundary").map((t) => t.tag);
}

describe("previewSpeech", () => {
  it("passes through already speech-shaped words", () => {
    const plan = previewSpeech("zazozon vuwalal.");
    assert.deepEqual(plan.spoken, ["zazozon", "vuwalal"]);
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"));
  });

  it("expands writing number shorthand to speech CV", () => {
    const writing = previewSpeech("g+3");
    assert.deepEqual(writing.spoken, ["gragel"]);

    const speech = previewSpeech("gragel");
    assert.deepEqual(speech.spoken, ["gragel"]);
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
    assert.deepEqual(previewSpeech("d[zudaval zogozel]").spoken, ["zudaval", "zogozel"]);
    assert.deepEqual(previewSpeech("d@[zudaval zogozel]").spoken, ["zudaval", "zogozel"]);
  });

  it("tags island edges without skipping them", () => {
    const plan = previewSpeech("{ zazozon vuwalal }");
    assert.deepEqual(boundaryTags(plan), ["islandEnter", "islandExit"]);
    assert.deepEqual(plan.spoken, ["zazozon", "vuwalal"]);
    assert.equal(plan.skipped.length, 0);
  });

  it("tags island in join scope example", () => {
    const plan = previewSpeech("zazozon { zununel zal } zam.");
    assert.deepEqual(plan.spoken, ["zazozon", "zununel", "zal", "zam"]);
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "islandEnter"));
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "islandExit"));
  });

  it("adds question boundary", () => {
    const plan = previewSpeech("yol zazozon vuwalal?");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "qmark"));
  });

  it("adds xContinue before discourse linker after period", () => {
    const plan = previewSpeech("zazozon vuwalal. xamalal zululon varunul.");
    const tags = boundaryTags(plan);
    assert.ok(tags.includes("period"));
    assert.ok(tags.includes("xContinue"));
    assert.equal(tags.includes("yTurn"), false);
    const xIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "xContinue");
    const linkerIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "xamalal");
    assert.ok(xIdx >= 0 && linkerIdx > xIdx);
  });

  it("adds xContinue before clause join", () => {
    const plan = previewSpeech("zazozon vuwalal zululon varunul xan.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "xContinue"));
    const xIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "xContinue");
    const joinIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "xan");
    assert.ok(xIdx >= 0 && joinIdx > xIdx);
  });

  it("adds yTurn before polar second turn", () => {
    const plan = previewSpeech("zazozon vuwalal. yaol.");
    assert.deepEqual(plan.spoken, ["zazozon", "vuwalal", "yaol"]);
    const tags = boundaryTags(plan);
    assert.ok(tags.includes("period"));
    assert.ok(tags.includes("yTurn"));
    const jIdx = plan.tokens.findIndex((t) => t.kind === "boundary" && t.tag === "yTurn");
    const polarIdx = plan.tokens.findIndex((t) => t.kind === "word" && t.raw === "yaol");
    assert.ok(jIdx >= 0 && polarIdx > jIdx);
  });

  it("uses softM for soft force statement", () => {
    const plan = previewSpeech("yam zazozon vuwalal.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "softM"));
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"), false);
  });

  it("keeps period for firm polar turn", () => {
    const plan = previewSpeech("yaol.");
    assert.ok(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "period"));
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "softM"), false);
  });

  it("does not add yTurn after period before reviser", () => {
    const plan = previewSpeech("zazozon vuwalal. al zululon vuwalal.");
    assert.equal(plan.tokens.some((t) => t.kind === "boundary" && t.tag === "yTurn"), false);
  });

  it("skips unparsed tokens instead of throwing", () => {
    const plan = previewSpeech("zazozon zl.");
    assert.deepEqual(plan.spoken, ["zazozon"]);
    assert.ok(plan.skipped.some((s) => s.raw === "zl" && s.reason === "error"));
    assert.doesNotThrow(() => previewPhonemes("zl"));
  });
});

describe("previewPhonemes", () => {
  it("builds IPA for a plain clause", () => {
    const plan = previewPhonemes("zazozon gozulamum.");
    assert.deepEqual(
      plan.words.map((w) => w.ipa),
      ["zä.zo̞.zo̞n", "ɡo̞.zʉ.lä.mʉm"],
    );
    assert.equal(plan.ipaPhonemes, "zäzo̞zo̞n ɡo̞zʉlämʉm.");
  });

  it("builds a word-spaced IPA phoneme stream", () => {
    const plan = previewPhonemes("zazozon vuwalal.");
    assert.equal(plan.ipaPhonemes, "zäzo̞zo̞n vʉwäläl.");
    const yuon = previewPhonemes("yuon");
    assert.equal(yuon.ipaPhonemes, "jʉo̞n");
  });

  it("includes punctuation cue between phoneme spans", () => {
    const plan = previewPhonemes("zazozon vuwalal?");
    assert.match(plan.ipaPhonemes, /\?$/);
  });

  it("uses comma dip before discourse linker", () => {
    const plan = previewPhonemes("zazozon vuwalal. xamalal zululon varunul.");
    assert.match(plan.ipaPhonemes, /\.,/);
  });

  it("keeps word spaces inside islands without comma between words", () => {
    const plan = previewPhonemes("{ zazozon vuwalal }");
    assert.match(plan.ipaPhonemes, /zäzo̞zo̞n vʉwäläl/);
    assert.doesNotMatch(plan.ipaPhonemes, /zo̞n, vä/);
  });
});
