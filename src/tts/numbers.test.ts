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
    assert.equal(markerToSpeech("#-"), "reu");
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

  it("expands g#-2 to greudul", () => {
    assert.equal(numberWordToSpeech(parseWord("g#-2")), "greudul");
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

  it("expands g+0e-1 to grabuwojazol", () => {
    assert.equal(numberWordToSpeech(parseWord("g+0e-1")), "grabuwojazol");
  });

  it("expands g+27e12 to grabawodujadulel", () => {
    assert.equal(numberWordToSpeech(parseWord("g+27e12")), "grabawodujadulel");
  });

  it("expands bare OoM speech twin grabanal", () => {
    assert.equal(numberWordToSpeech(parseWord("grabanal")), "grabanal");
  });

  it("expands g+5e3,860,4e-2 to grabarejavahaguzobudujamol", () => {
    assert.equal(numberWordToSpeech(parseWord("g+5e3,860,4e-2")), "grabarejavahaguzobudujamol");
  });

  it("expands digit-string d_555,123,4567", () => {
    assert.equal(
      numberWordToSpeech(parseWord("d_555,123,4567")),
      "drovavavawoduremovagulel",
    );
  });

  it("expands h_15,30 to hrowovarezol", () => {
    assert.equal(numberWordToSpeech(parseWord("h_15,30")), "hrowovarezol");
  });

  it("expands calendar date h_#22,7 with roe marker", () => {
    const word = parseWord("h_#22,7");
    assert.equal(word.family.kind, "number");
    if (word.family.kind !== "number") return;
    assert.equal(word.family.stem.calendarOrdinal, true);
    assert.equal(word.family.stem.marker, "_");
    assert.equal(numberWordToSpeech(word), "hroedudulel");
  });

  it("expands full calendar date h_#22,7,2026 (year stays one group)", () => {
    assert.equal(numberWordToSpeech(parseWord("h_#22,7,2026")), "hroeduduleduzodugul");
  });

  it("round-trips spoken calendar date groedudulel", () => {
    const word = parseWord("groedudulel");
    assert.equal(numberWordToSpeech(word), "groedudulel");
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
    assert.deepEqual(stressedLetters("g+27e12"), ["u"]); // ba wo DU ja du le
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

  it("emits eSpeak primary stress on the group-final syllable", async () => {
    const { previewPhonemes } = await import("./plan.js");
    const plan = previewPhonemes("g+27e12.");
    // ra ba wo DU ja du le + l — only the exponent's last digit is stressed.
    assert.match(plan.espeak, /wo\.d'V\.jA\.dV\.lel/);
    const multi = previewPhonemes("g+5e3,860,4e-2.");
    assert.equal(multi.espeak, "[[grA.bA.r'e.jA.vA.hA.gV.z'o.bV.d'V.jA.mol]].");
  });
});
