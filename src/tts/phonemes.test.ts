import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isNativeSurface, toPhonemeWord, wordIpaPhones } from "./phonemes.js";

describe("wordIpaPhones", () => {
  it("keeps citation dots on ipa and joins syllables without them", () => {
    const word = toPhonemeWord("zazawan");
    assert.equal(word.ipa, "zɑ.zɑ.wɑn");
    assert.equal(wordIpaPhones(word), "zɑzɑwɑn");
    const yuon = toPhonemeWord("yuon");
    assert.equal(yuon.ipa, "ju.on");
    assert.equal(wordIpaPhones(yuon), "juon");
    assert.equal(wordIpaPhones(toPhonemeWord("gomonum")), "ɡomonum");
    assert.equal(wordIpaPhones(toPhonemeWord("yal")), "jɑl");
  });
});

describe("th stance letter", () => {
  it("reads th as one letter /ð/", () => {
    assert.ok(isNativeSurface("thodohom"));
    assert.equal(toPhonemeWord("thodohom").ipa, "ðo.do.ɦom");
    assert.ok(!isNativeSurface("todohom"));
  });
});

describe("toPhonemeWord", () => {
  it("maps the phonology letter table", () => {
    assert.equal(toPhonemeWord("e").ipa, "e̞");
    assert.equal(toPhonemeWord("u").ipa, "u");
    assert.equal(toPhonemeWord("o").ipa, "o");
    assert.equal(toPhonemeWord("a").ipa, "ɑ");
    assert.equal(toPhonemeWord("h").ipa, "ɦ");
    assert.equal(toPhonemeWord("j").ipa, "j");
    assert.equal(toPhonemeWord("x").ipa, "ʒ");
    assert.equal(toPhonemeWord("r").ipa, "ɹ");
    assert.equal(toPhonemeWord("g").ipa, "ɡ");
  });

  it("splits stacked vowels as separate syllables (yuon)", () => {
    const word = toPhonemeWord("yuon");
    assert.deepEqual(
      word.syllables.map((s) => s.ipa),
      ["ju", "on"],
    );
    assert.equal(word.ipa, "ju.on");
  });

  it("keeps word-final -x as letter x /ʒ/ (zazawanx)", () => {
    const word = toPhonemeWord("zazawanx");
    assert.equal(word.ipa, "zɑ.zɑ.wɑnʒ");
    assert.equal(word.syllables.at(-1)?.ipa.endsWith("ʒ"), true);
  });

  it("treats mid-word x as /ʒ/ (zugoboxrawon)", () => {
    const word = toPhonemeWord("zugoboxrawon");
    assert.ok(word.ipa.includes("ʒ"));
    assert.equal(word.ipa, "zu.ɡo.bo.ʒɹɑ.won");
  });

  it("keeps gl- as an onset cluster (glelulul)", () => {
    const word = toPhonemeWord("glelulul");
    assert.equal(word.ipa, "ɡle̞.lu.lul");
  });

  it("matches the phonology try-it line", () => {
    assert.equal(toPhonemeWord("zazawan").ipa, "zɑ.zɑ.wɑn");
    assert.equal(toPhonemeWord("guzumum").ipa, "ɡu.zu.mum");
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
