import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isNativeSurface, toPhonemeWord, wordIpaPhones } from "./phonemes.js";

describe("wordIpaPhones", () => {
  it("keeps citation dots on ipa and joins syllables without them", () => {
    const word = toPhonemeWord("zuzozen");
    assert.equal(word.ipa, "zʉ.zo̞.ze̞n");
    assert.equal(wordIpaPhones(word), "zʉzo̞ze̞n");
    const yuon = toPhonemeWord("yuon");
    assert.equal(yuon.ipa, "jʉ.o̞n");
    assert.equal(wordIpaPhones(yuon), "jʉo̞n");
    assert.equal(wordIpaPhones(toPhonemeWord("gomoldam")), "ɡo̞mo̞ldäm");
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
    assert.equal(toPhonemeWord("u").ipa, "ʉ");
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
      ["jʉ", "o̞n"],
    );
    assert.equal(word.ipa, "jʉ.o̞n");
  });

  it("keeps word-final -x as letter x /ʒ/ (zuzozenx)", () => {
    const word = toPhonemeWord("zuzozenx");
    assert.equal(word.ipa, "zʉ.zo̞.ze̞nʒ");
    assert.equal(word.syllables.at(-1)?.ipa.endsWith("ʒ"), true);
  });

  it("treats mid-word x as /ʒ/ (zugoboxrawon)", () => {
    const word = toPhonemeWord("zugoboxrawon");
    assert.ok(word.ipa.includes("ʒ"));
    assert.equal(word.ipa, "zʉ.ɡo̞.bo̞.ʒɹä.wo̞n");
  });

  it("keeps gl- as an onset cluster (glelulul)", () => {
    const word = toPhonemeWord("glelulul");
    assert.equal(word.ipa, "ɡle̞.lʉ.lʉl");
  });

  it("matches the phonology try-it line", () => {
    assert.equal(toPhonemeWord("zuzozen").ipa, "zʉ.zo̞.ze̞n");
    assert.equal(toPhonemeWord("gozulamum").ipa, "ɡo̞.zʉ.lä.mʉm");
  });
});

describe("isNativeSurface", () => {
  it("accepts ordinary words and rejects writing shorthand", () => {
    assert.equal(isNativeSurface("zuzozen"), true);
    assert.equal(isNativeSurface("grarel"), true);
    assert.equal(isNativeSurface("g+3"), false);
    assert.equal(isNativeSurface("d[hi]"), false);
  });
});
