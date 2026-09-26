import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord } from "../parse/word.js";
import {
  digitsToSyllables,
  markerToSpeech,
  numberStemToSpeech,
  numberStemToSpeechStressed,
  numberWordToSpeech,
  numberWordToSpeechStressed,
} from "./numbers.js";

describe("numberStemToSpeech", () => {
  it("maps markers per numbers.md", () => {
    assert.equal(markerToSpeech("+"), "ra");
    assert.equal(markerToSpeech("-"), "ru");
    assert.equal(markerToSpeech("#"), "re");
    assert.equal(markerToSpeech("#-"), "rue");
    assert.equal(markerToSpeech("_"), "ro");
  });

  it("maps digits per numbers.md digit table", () => {
    assert.equal(digitsToSyllables("1234567890"), "woduremovagulehanazo");
  });

  it("expands g+3 to grarel (numbers.md)", () => {
    const word = parseWord("g+3");
    assert.equal(numberWordToSpeech(word), "grarel");
  });

  it("expands digitless g+ to gral", () => {
    assert.equal(numberWordToSpeech(parseWord("g+")), "gral");
  });

  it("expands g#-2 to gruedul", () => {
    assert.equal(numberWordToSpeech(parseWord("g#-2")), "gruedul");
  });

  it("expands approximate g~+3 to grarem", () => {
    assert.equal(numberWordToSpeech(parseWord("g~+3")), "grarem");
  });

  it("expands anaphor g=+ to grar", () => {
    assert.equal(numberWordToSpeech(parseWord("g=+")), "grar");
  });

  it("expands g+e to grabal (+∞)", () => {
    assert.equal(numberWordToSpeech(parseWord("g+e")), "grabal");
  });

  it("expands g+0e-1 to grabuwoyazol", () => {
    assert.equal(numberWordToSpeech(parseWord("g+0e-1")), "grabuwoyazol");
  });

  it("expands g+27e12 to grabawoduyadulel", () => {
    assert.equal(numberWordToSpeech(parseWord("g+27e12")), "grabawoduyadulel");
  });

  it("expands bare OoM speech twin grabanal", () => {
    assert.equal(numberWordToSpeech(parseWord("grabanal")), "grabanal");
  });

  it("expands g+5e3,860,4e-2 with tha separators", () => {
    assert.equal(numberWordToSpeech(parseWord("g+5e3,860,4e-2")), "grabareyavathahaguzothabuduyamol");
  });

  it("expands digit-string d_555,123,4567", () => {
    assert.equal(
      numberWordToSpeech(parseWord("d_555,123,4567")),
      "drovavavathowodurethomovagulel",
    );
  });

  it("expands h_15,30 to hrowovathorezol", () => {
    assert.equal(numberWordToSpeech(parseWord("h_15,30")), "hrowovathorezol");
  });

  it("uses thu between groups of a negative scalar", () => {
    assert.equal(numberWordToSpeech(parseWord("g-1e9,265e3,4")), "grubanayawothubareyaduguvathumol");
  });

  it("expands calendar date h_#22,7 with roe marker", () => {
    const word = parseWord("h_#22,7");
    assert.equal(word.family.kind, "number");
    if (word.family.kind !== "number") return;
    assert.equal(word.family.stem.calendarOrdinal, true);
    assert.equal(word.family.stem.marker, "_");
    assert.equal(numberWordToSpeech(word), "hroedudutholel");
  });

  it("expands full calendar date h_#22,7,2026 (year stays one group)", () => {
    assert.equal(numberWordToSpeech(parseWord("h_#22,7,2026")), "hroedudutholethoduzodugul");
  });

  it("round-trips spoken calendar date groedudutholel", () => {
    const word = parseWord("groedudutholel");
    assert.equal(numberWordToSpeech(word), "groedudutholel");
  });

  it("round-trips speech-shaped grarel", () => {
    assert.equal(numberWordToSpeech(parseWord("grarel")), "grarel");
  });

  it("serializes stem without pos/ending", () => {
    const stem = parseWord("g+3").family;
    assert.equal(stem.kind, "number");
    if (stem.kind !== "number") return;
    assert.equal(numberStemToSpeech(stem.stem), "rare");
  });
});

describe("numberWordToSpeechStressed", () => {
  function stressedLetters(form: string): string[] {
    const s = numberWordToSpeechStressed(parseWord(form));
    return s.stress.map((i) => s.raw[i]!);
  }

  it("stresses the last exponent digit when a group has an exponent (g+27e12)", () => {
    assert.deepEqual(stressedLetters("g+27e12"), ["u"]); // ba wo DU ya du le
  });

  it("stresses the last mantissa digit when a group has no exponent (g+139)", () => {
    assert.deepEqual(stressedLetters("g+139"), ["a"]); // ra wo re NA
  });

  it("stresses each group's final digit in a multi-group value (g+5e3,860,4e-2)", () => {
    assert.deepEqual(stressedLetters("g+5e3,860,4e-2"), ["e", "o", "u"]); // rE · zO · dU
  });

  it("stresses the marker vowel of a digitless word (g+)", () => {
    assert.deepEqual(stressedLetters("g+"), ["a"]); // RA
  });

  it("stresses the bare digitless-exponent marker (g+e)", () => {
    assert.deepEqual(stressedLetters("g+e"), ["a"]); // ra BA
  });

  it("stresses last digit of each comma group in digit strings (d_555,123,4567)", () => {
    assert.deepEqual(stressedLetters("d_555,123,4567"), ["a", "e", "e"]); // vA · rE · lE
  });

  it("keeps raw text identical to numberWordToSpeech", () => {
    for (const form of ["g+3", "g+27e12", "g+5e3,860,4e-2", "d_555,123,4567"]) {
      const s = numberWordToSpeechStressed(parseWord(form));
      assert.equal(s.raw, numberWordToSpeech(parseWord(form)));
    }
  });

  it("marks group-final stress in IPA as a Kitten symbol", async () => {
    const { previewPhonemes } = await import("./plan.js");
    const { textToKittenIds } = await import("./kitten-ids.js");
    const plan = previewPhonemes("g+27e12.");
    const word = plan.words[0]!;
    const stressed = word.syllables.filter((s) => s.ipa.includes("ˈ"));
    assert.equal(stressed.length, 1);
    assert.ok(textToKittenIds("ˈ").length > 0);
    const multi = previewPhonemes("g+5e3,860,4e-2.");
    assert.equal(multi.words[0]!.syllables.filter((s) => s.ipa.includes("ˈ")).length, 3);
    assert.ok(multi.ipaPhonemes.includes("ˈ"));
  });
});

describe("digitless exponent with power digits", () => {
  it("speaks bare OoM bands per numbers.md", () => {
    assert.equal(numberWordToSpeech(parseWord("g+e0")), "grabazol");
    assert.equal(numberWordToSpeech(parseWord("g+e3")), "grabarel");
    assert.equal(numberWordToSpeech(parseWord("g#e-2")), "grebudul");
  });
});

describe("spelled-out stems and numeric derivation", () => {
  it("keeps mantissa digits before a digitless exponent", () => {
    assert.equal(numberWordToSpeech(parseWord("grazobal")), "grazobal");
  });

  it("keeps the lexical join on a numeric-derivation host", () => {
    assert.equal(numberWordToSpeech(parseWord("vologolrazobal")), "vologolrazobal");
  });
});
