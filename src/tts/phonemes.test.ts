import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ipaToKittenIds,
  KITTEN_END_MARKER_ID,
  normalizeIpaForKitten,
  textToKittenIds,
} from "./kitten-ids.js";
import { isNativeSurface, toPhonemeWord, wordIpaPhones } from "./phonemes.js";

describe("normalizeIpaForKitten", () => {
  it("maps e̞ to ASCII e", () => {
    assert.equal(normalizeIpaForKitten("e̞"), "e");
    assert.equal(normalizeIpaForKitten("ɡle̞"), "ɡle");
  });

  it("keeps Agalan inventory phones", () => {
    assert.equal(normalizeIpaForKitten("zɑːzɑːwɑn"), "zɑːzɑːwɑn");
    assert.equal(normalizeIpaForKitten("ʌɦɡɹʒʃ"), "ʌɦɡɹʒʃ");
  });

  it("keeps citation dots and lengthens non-final vowels for Kitten", () => {
    const word = toPhonemeWord("zazawan");
    assert.equal(word.ipa, "zɑ.zɑ.wɑn");
    assert.equal(wordIpaPhones(word), "zɑːzɑːwɑn");
    const juon = toPhonemeWord("juon");
    assert.equal(juon.ipa, "jʌ.on");
    assert.equal(wordIpaPhones(juon), "jʌːon");
    assert.equal(wordIpaPhones(toPhonemeWord("gomonum")), "ɡoːmoːnʌm");
    assert.equal(wordIpaPhones(toPhonemeWord("guzumum")), "ɡʌːzʌːmʌm");
    assert.equal(wordIpaPhones(toPhonemeWord("jal")), "jɑl");
  });
});

describe("ipaToKittenIds", () => {
  it("wraps with start pad, end marker, and end pad", () => {
    const ids = ipaToKittenIds("zɑzɑwɑn");
    assert.equal(ids[0], 0);
    assert.equal(ids.at(-2), KITTEN_END_MARKER_ID);
    assert.equal(ids.at(-1), 0);
  });

  it("maps zazawan phones without syllable dots", () => {
    const word = toPhonemeWord("zazawan");
    const ids = ipaToKittenIds(wordIpaPhones(word));
    assert.ok(ids.includes(textToKittenIds("z")[0]!));
    assert.ok(ids.includes(textToKittenIds("ɑ")[0]!));
    assert.ok(ids.includes(textToKittenIds("ː")[0]!));
    assert.ok(!ids.includes(textToKittenIds(".")[0]!));
  });

  it("does not inject hiatus stress on stacked vowels", () => {
    const ids = ipaToKittenIds(wordIpaPhones(toPhonemeWord("juon")));
    assert.ok(ids.includes(textToKittenIds("ː")[0]!));
    assert.ok(!ids.includes(textToKittenIds("ˈ")[0]!));
  });
});

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
  });

  it("keeps word-final -sh as /ʃ/ (zazawansh)", () => {
    const word = toPhonemeWord("zazawansh");
    assert.equal(word.ipa, "zɑ.zɑ.wɑnʃ");
    assert.equal(word.syllables.at(-1)?.ipa.endsWith("ʃ"), true);
  });

  it("treats mid-word x as /ʒ/ (zugoboxrawon)", () => {
    const word = toPhonemeWord("zugoboxrawon");
    assert.ok(word.ipa.includes("ʒ"));
    assert.equal(word.ipa, "zʌ.ɡo.bo.ʒɹɑ.won");
  });

  it("keeps gl- as an onset cluster (glelulul)", () => {
    const word = toPhonemeWord("glelulul");
    assert.equal(word.ipa, "ɡle̞.lʌ.lʌl");
  });

  it("matches the phonology try-it line", () => {
    assert.equal(toPhonemeWord("zazawan").ipa, "zɑ.zɑ.wɑn");
    assert.equal(toPhonemeWord("guzumum").ipa, "ɡʌ.zʌ.mʌm");
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
