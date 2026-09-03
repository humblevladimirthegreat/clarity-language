import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { engineSyllableTokens, isNativeSurface, toPhonemeWord } from "./phonemes.js";

describe("toPhonemeWord", () => {
  it("maps the phonology letter table", () => {
    assert.equal(toPhonemeWord("e").ipa, "e̞");
    assert.equal(toPhonemeWord("u").ipa, "ʌ");
    assert.equal(toPhonemeWord("o").ipa, "o");
    assert.equal(toPhonemeWord("a").ipa, "ɑ");
    assert.equal(toPhonemeWord("h").ipa, "ɦ");
    assert.equal(toPhonemeWord("j").ipa, "j");
    assert.equal(toPhonemeWord("x").ipa, "ʒ");
    assert.equal(toPhonemeWord("r").ipa, "ɹ");
    assert.equal(toPhonemeWord("g").ipa, "ɡ");
  });

  it("splits stacked vowels as separate syllables (juon)", () => {
    const word = toPhonemeWord("juon");
    assert.deepEqual(
      word.syllables.map((s) => s.ipa),
      ["jʌ", "on"],
    );
    assert.equal(word.ipa, "jʌ.on");
    assert.deepEqual(
      word.syllables.map((s) => s.engine),
      ["yuh", "ohn"],
    );
  });

  it("keeps word-final -sh as /ʃ/ (zazawansh)", () => {
    const word = toPhonemeWord("zazawansh");
    assert.equal(word.ipa, "zɑ.zɑ.wɑnʃ");
    assert.equal(word.syllables.at(-1)?.engine.endsWith("sh"), true);
  });

  it("treats mid-word x as /ʒ/ (zugoboxrawon)", () => {
    const word = toPhonemeWord("zugoboxrawon");
    assert.ok(word.ipa.includes("ʒ"));
    assert.equal(word.ipa, "zʌ.ɡo.bo.ʒɹɑ.won");
  });

  it("keeps gl- as an onset cluster (glelulul)", () => {
    const word = toPhonemeWord("glelulul");
    assert.equal(word.ipa, "ɡle̞.lʌ.lʌl");
    assert.deepEqual(
      word.syllables.map((s) => s.engine),
      ["gleh", "luh", "luhl"],
    );
  });

  it("matches the phonology try-it line", () => {
    assert.equal(toPhonemeWord("zazawan").ipa, "zɑ.zɑ.wɑn");
    assert.equal(toPhonemeWord("guzumum").ipa, "ɡʌ.zʌ.mʌm");
  });

  it("emits one lowercase engine token per syllable (eSpeak word breaks, no audio)", () => {
    const word = toPhonemeWord("zazawan");
    assert.deepEqual(
      word.syllables.map((s) => s.engine),
      ["zah", "zah", "wahn"],
    );
    assert.equal(word.engine, "zah zah wahn");
    assert.deepEqual(engineSyllableTokens(word.engine), word.syllables.map((s) => s.engine));
    assert.equal(engineSyllableTokens(word.engine).length, word.syllables.length);
    assert.match(word.engine, /^[a-z]+(?: [a-z]+)*$/);
  });
});

describe("isNativeSurface", () => {
  it("accepts ordinary words and rejects writing shorthand", () => {
    assert.equal(isNativeSurface("zazawan"), true);
    assert.equal(isNativeSurface("grarel"), true);
    assert.equal(isNativeSurface("g+3"), false);
    assert.equal(isNativeSurface("d[hi]"), false);
  });
});
