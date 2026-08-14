import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord } from "../parse/word.js";
import { digitsToSyllables, markerToSpeech, numberStemToSpeech, numberWordToSpeech } from "./numbers.js";

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
