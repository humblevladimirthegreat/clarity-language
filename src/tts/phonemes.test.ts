import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isNativeSurface, toPhonemeWord, wordIpaPhones } from "./phonemes.js";

describe("wordIpaPhones", () => {
  it("keeps citation dots on ipa and joins syllables without them", () => {
    const word = toPhonemeWord("zazawan");
    assert.equal(word.ipa, "zä.zä.wän");
    assert.equal(wordIpaPhones(word), "zäzäwän");
    const yuon = toPhonemeWord("yuon");
    assert.equal(yuon.ipa, "ju.o̞n");
    assert.equal(wordIpaPhones(yuon), "juo̞n");
    assert.equal(wordIpaPhones(toPhonemeWord("gomonum")), "ɡo̞mo̞num");
    assert.equal(wordIpaPhones(toPhonemeWord("yal")), "jäl");
  });
});

describe("th stance letter", () => {
  it("reads th as one letter /ð/", () => {
    assert.ok(isNativeSurface("thodohom"));
    assert.equal(toPhonemeWord("thodohom").ipa, "ðo̞.do̞.ɦo̞m");
    assert.ok(!isNativeSurface("todohom"));
  });
});

describe("toPhonemeWord", () => {
  it("maps the phonology letter table", () => {
    assert.equal(toPhonemeWord("e").ipa, "e̞");
    assert.equal(toPhonemeWord("u").ipa, "u");
    assert.equal(toPhonemeWord("o").ipa, "o̞");
    assert.equal(toPhonemeWord("a").ipa, "ä");
    assert.equal(toPhonemeWord("h").ipa, "ɦ");
    assert.equal(toPhonemeWord("y").ipa, "j");
    assert.equal(toPhonemeWord("x").ipa, "ʒ");
    assert.equal(toPhonemeWord("r").ipa, "ɹ");
    assert.equal(toPhonemeWord("g").ipa, "ɡ");
  });

  it("splits stacked vowels as separate syllables (yuon)", () => {
    const word = toPhonemeWord("yuon");
    assert.deepEqual(
      word.syllables.map((s) => s.ipa),
      ["ju", "o̞n"],
    );
    assert.equal(word.ipa, "ju.o̞n");
  });

  it("keeps word-final -x as letter x /ʒ/ (zazawanx)", () => {
    const word = toPhonemeWord("zazawanx");
    assert.equal(word.ipa, "zä.zä.wänʒ");
    assert.equal(word.syllables.at(-1)?.ipa.endsWith("ʒ"), true);
  });

  it("treats mid-word x as /ʒ/ (zugoboxrawon)", () => {
    const word = toPhonemeWord("zugoboxrawon");
    assert.ok(word.ipa.includes("ʒ"));
    assert.equal(word.ipa, "zu.ɡo̞.bo̞.ʒɹä.wo̞n");
  });

  it("keeps gl- as an onset cluster (glelulul)", () => {
    const word = toPhonemeWord("glelulul");
    assert.equal(word.ipa, "ɡle̞.lu.lul");
  });

  it("matches the phonology try-it line", () => {
    assert.equal(toPhonemeWord("zazawan").ipa, "zä.zä.wän");
    assert.equal(toPhonemeWord("gozezomum").ipa, "ɡo̞.ze̞.zo̞.mum");
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
