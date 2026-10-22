import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord } from "../parse/word.js";
import {
  digitsToSyllables,
  markerToSpeech,
  NUMBER_SYLLABLES,
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
    assert.equal(digitsToSyllables("1234567890"), "badogehuzavorelunamo");
  });

  it("expands g+3 to gragel (numbers.md)", () => {
    const word = parseWord("g+3");
    assert.equal(numberWordToSpeech(word), "gragel");
  });

  it("expands digitless g+ to gral", () => {
    assert.equal(numberWordToSpeech(parseWord("g+")), "gral");
  });

  it("expands g#-2 to gruedol", () => {
    assert.equal(numberWordToSpeech(parseWord("g#-2")), "gruedol");
  });

  it("expands approximate g~+3 to gragem", () => {
    assert.equal(numberWordToSpeech(parseWord("g~+3")), "gragem");
  });

  it("expands anaphor g=+ to grar", () => {
    assert.equal(numberWordToSpeech(parseWord("g=+")), "grar");
  });

  it("expands g+e to grawal (+∞)", () => {
    assert.equal(numberWordToSpeech(parseWord("g+e")), "grawal");
  });

  it("expands g+0e-1 to grawubayamol", () => {
    assert.equal(numberWordToSpeech(parseWord("g+0e-1")), "grawubayamol");
  });

  it("expands g+27e12 to grawabadoyadorel", () => {
    assert.equal(numberWordToSpeech(parseWord("g+27e12")), "grawabadoyadorel");
  });

  it("expands bare OoM speech twin grawanal", () => {
    assert.equal(numberWordToSpeech(parseWord("grawanal")), "grawanal");
  });

  it("expands g+5e3,860,4e-2 with tha separators", () => {
    assert.equal(numberWordToSpeech(parseWord("g+5e3,860,4e-2")), "grawageyazathaluvomothawudoyahul");
  });

  it("expands digit-string d_555,123,4567", () => {
    assert.equal(
      numberWordToSpeech(parseWord("d_555,123,4567")),
      "drozazazathobadogethohuzavorel",
    );
  });

  it("expands h_15,30 to hrobazathogemol", () => {
    assert.equal(numberWordToSpeech(parseWord("h_15,30")), "hrobazathogemol");
  });

  it("uses thu between groups of a negative scalar", () => {
    assert.equal(numberWordToSpeech(parseWord("g-1e9,265e3,4")), "gruwanayabathuwageyadovozathuhul");
  });

  it("expands calendar date h_#22,7 with roe marker", () => {
    const word = parseWord("h_#22,7");
    assert.equal(word.family.kind, "number");
    if (word.family.kind !== "number") return;
    assert.equal(word.family.stem.calendarOrdinal, true);
    assert.equal(word.family.stem.marker, "_");
    assert.equal(numberWordToSpeech(word), "hroedodothorel");
  });

  it("expands full calendar date h_#22,7,2026 (year stays one group)", () => {
    assert.equal(numberWordToSpeech(parseWord("h_#22,7,2026")), "hroedodothorethodomodovol");
  });

  it("round-trips spoken calendar date groedodothorel", () => {
    const word = parseWord("groedodothorel");
    assert.equal(numberWordToSpeech(word), "groedodothorel");
  });

  it("round-trips speech-shaped gragel", () => {
    assert.equal(numberWordToSpeech(parseWord("gragel")), "gragel");
  });

  it("serializes stem without pos/ending", () => {
    const stem = parseWord("g+3").family;
    assert.equal(stem.kind, "number");
    if (stem.kind !== "number") return;
    assert.equal(numberStemToSpeech(stem.stem), "rage");
  });
});

describe("numberWordToSpeechStressed", () => {
  function stressedLetters(form: string): string[] {
    const s = numberWordToSpeechStressed(parseWord(form));
    return s.stress.map((i) => s.raw[i]!);
  }

  it("stresses the last exponent digit when a group has an exponent (g+27e12)", () => {
    assert.deepEqual(stressedLetters("g+27e12"), ["o"]); // wa ba DO ya do re
  });

  it("stresses the last mantissa digit when a group has no exponent (g+139)", () => {
    assert.deepEqual(stressedLetters("g+139"), ["a"]); // ra ba ge NA
  });

  it("stresses each group's final digit in a multi-group value (g+5e3,860,4e-2)", () => {
    assert.deepEqual(stressedLetters("g+5e3,860,4e-2"), ["e", "o", "o"]); // gE · mO · dO
  });

  it("stresses the marker vowel of a digitless word (g+)", () => {
    assert.deepEqual(stressedLetters("g+"), ["a"]); // RA
  });

  it("stresses the bare digitless-exponent marker (g+e)", () => {
    assert.deepEqual(stressedLetters("g+e"), ["a"]); // ra WA
  });

  it("stresses last digit of each comma group in digit strings (d_555,123,4567)", () => {
    assert.deepEqual(stressedLetters("d_555,123,4567"), ["a", "e", "e"]); // zA · gE · rE
  });

  it("keeps raw text identical to numberWordToSpeech", () => {
    for (const form of ["g+3", "g+27e12", "g+5e3,860,4e-2", "d_555,123,4567"]) {
      const s = numberWordToSpeechStressed(parseWord(form));
      assert.equal(s.raw, numberWordToSpeech(parseWord(form)));
    }
  });

  it("marks group-final stress in IPA", async () => {
    const { previewPhonemes } = await import("./plan.js");
    const plan = previewPhonemes("g+27e12.");
    const word = plan.words[0]!;
    const stressed = word.syllables.filter((s) => s.ipa.includes("ˈ"));
    assert.equal(stressed.length, 1);
    const multi = previewPhonemes("g+5e3,860,4e-2.");
    assert.equal(multi.words[0]!.syllables.filter((s) => s.ipa.includes("ˈ")).length, 3);
    assert.ok(multi.ipaPhonemes.includes("ˈ"));
  });
});

describe("digitless exponent with power digits", () => {
  it("speaks bare OoM bands per numbers.md", () => {
    assert.equal(numberWordToSpeech(parseWord("g+e0")), "grawamol");
    assert.equal(numberWordToSpeech(parseWord("g+e3")), "grawagel");
    assert.equal(numberWordToSpeech(parseWord("g#e-2")), "grewudol");
  });
});

describe("spelled-out stems", () => {
  it("keeps mantissa digits before a digitless exponent", () => {
    assert.equal(numberWordToSpeech(parseWord("gramowal")), "gramowal");
  });
});

describe("digit table (design-decisions.md § digit syllables)", () => {
  const syllables = Object.values(NUMBER_SYLLABLES.digits);
  // Each consonant with the vowels it takes in a number body: one per digit, `w` on a / u, `y` on all four.
  const vowelsOf = (consonant: string): string[] => {
    if (consonant === "w") return ["a", "u"];
    if (consonant === "y") return ["a", "o", "e", "u"];
    return syllables.filter((s) => s[0] === consonant).map((s) => s[1]!);
  };

  it("never puts an easily misheard consonant pair on the same vowel", () => {
    const hard = ["m/n", "d/g", "b/d", "b/v", "l/r", "b/g", "v/w", "r/w", "l/n", "v/z", "v/h"];
    const soft = ["d/l", "d/n", "d/z", "b/m", "g/h"];
    for (const pair of [...hard, ...soft]) {
      const [a, b] = pair.split("/") as [string, string];
      const shared = vowelsOf(a).filter((v) => vowelsOf(b).includes(v));
      assert.deepEqual(shared, [], pair);
    }
  });

  it("climbs the vowel pitches a o e u from 1, counting 0 as the tenth digit", () => {
    const order = [..."1234567890"].map((d) => NUMBER_SYLLABLES.digits[d]![1]);
    assert.deepEqual(order, [..."aoeuaoeuao"]);
  });

  it("keeps digits off the count and negative markers", () => {
    assert.ok(!syllables.includes("ra") && !syllables.includes("ru"));
  });

  it("is the table the parser reads", () => {
    for (const [digit, syllable] of Object.entries(NUMBER_SYLLABLES.digits)) {
      const family = parseWord(`gra${syllable}l`).family;
      assert.ok(family.kind === "number", syllable);
      assert.equal(family.stem.groups[0]?.mantissa, digit, syllable);
    }
  });
});
