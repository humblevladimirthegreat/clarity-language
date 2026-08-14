import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord, parseWords, WordParseError } from "./word.js";
import type { MorphWord } from "./types.js";

function parseOk(input: string): MorphWord {
  return parseWord(input);
}

describe("parseWord — content / gl- / citation", () => {
  it("parses zumogon as /z/ content umogo + -n (core.md orthography)", () => {
    const word = parseOk("zumogon");
    assert.equal(word.raw, "zumogon");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "n");
    assert.equal(word.gl, undefined);
    assert.equal(word.plural, undefined);
    assert.deepEqual(word.family, { kind: "content", roots: ["umogo"] });
  });

  it("parses glulebul as left-bound /ɡ/ (core.md gl-)", () => {
    const word = parseOk("glulebul");
    assert.equal(word.pos, "g");
    assert.equal(word.gl, true);
    assert.equal(word.ending, "l");
    assert.deepEqual(word.family, { kind: "content", roots: ["ulebu"] });
  });

  it("parses prefix-less citation uzem (core.md citation-forms)", () => {
    const word = parseOk("uzem");
    assert.equal(word.pos, undefined);
    assert.equal(word.ending, "m");
    assert.deepEqual(word.family, { kind: "content", roots: ["uze"] });
  });
});

describe("parseWord — numbers (writing + speech)", () => {
  it("parses g+3 and speech twin grarel", () => {
    const writing = parseOk("g+3");
    assert.equal(writing.pos, "g");
    assert.equal(writing.ending, "l");
    assert.deepEqual(writing.family, {
      kind: "number",
      stem: { marker: "+", groups: [{ mantissa: "3" }] },
    });

    const speech = parseOk("grarel");
    assert.equal(speech.pos, "g");
    assert.equal(speech.ending, "l");
    assert.deepEqual(speech.family, {
      kind: "number",
      stem: { marker: "+", groups: [{ mantissa: "3" }] },
    });
  });

  it("parses digitless g+, approximate g~+3, anaphor g=+", () => {
    const digitless = parseOk("g+");
    assert.equal(digitless.ending, "l");
    assert.deepEqual(digitless.family, {
      kind: "number",
      stem: { marker: "+", groups: [] },
    });

    const approx = parseOk("g~+3");
    assert.equal(approx.ending, "m");
    assert.equal(approx.family.kind, "number");
    if (approx.family.kind === "number") {
      assert.equal(approx.family.writingEndingMark, "~");
      assert.deepEqual(approx.family.stem, { marker: "+", groups: [{ mantissa: "3" }] });
    }

    const resume = parseOk("g=+");
    assert.equal(resume.ending, "r");
    if (resume.family.kind === "number") {
      assert.equal(resume.family.writingEndingMark, "=");
      assert.deepEqual(resume.family.stem, { marker: "+", groups: [] });
    }
  });

  it("parses digitless exponent g+e and comma-separated digit-string groups", () => {
    const inf = parseOk("g+e");
    if (inf.family.kind === "number") {
      assert.deepEqual(inf.family.stem, { marker: "+", groups: [], digitlessExp: "e" });
    }

    const code = parseOk("d_555,123,4567");
    if (code.family.kind === "number") {
      assert.equal(code.family.stem.marker, "_");
      assert.deepEqual(code.family.stem.groups, [
        { mantissa: "555" },
        { mantissa: "123" },
        { mantissa: "4567" },
      ]);
    }
  });
});

describe("parseWord — spans and writing atoms", () => {
  it("parses daxal as span open and xuxul as span close (spans.md)", () => {
    const open = parseOk("daxal");
    assert.equal(open.pos, "d");
    assert.equal(open.ending, "l");
    assert.deepEqual(open.family, {
      kind: "x",
      xFamily: "span",
      leftRoots: [],
      typeVowel: "a",
      edgeVowel: "a",
    });

    const close = parseOk("xuxul");
    assert.equal(close.pos, undefined);
    assert.deepEqual(close.family, { kind: "spanClose", flavor: "complete" });
  });

  it("parses writing atoms d[hi], d@[Hamlet], d[=] (spans.md / core.md)", () => {
    const cite = parseOk("d[hi]");
    assert.equal(cite.pos, "d");
    assert.equal(cite.ending, "l");
    assert.deepEqual(cite.family, {
      kind: "writingSpan",
      bracket: "[",
      payload: "hi",
      marks: [],
      anaphor: false,
    });

    const proper = parseOk("d@[Hamlet]");
    assert.equal(proper.ending, "n");
    assert.deepEqual(proper.family, {
      kind: "writingSpan",
      bracket: "[",
      payload: "Hamlet",
      marks: ["@"],
      anaphor: false,
    });

    const anaphor = parseOk("d[=]");
    assert.equal(anaphor.ending, "r");
    assert.deepEqual(anaphor.family, {
      kind: "writingSpan",
      bracket: "[",
      payload: "=",
      marks: [],
      anaphor: true,
    });
  });

  it("parses daxal xuxul as two tokens", () => {
    const words = parseWords("daxal xuxul");
    assert.equal(words.length, 2);
    assert.equal(words[0]?.family.kind, "x");
    assert.equal(words[1]?.family.kind, "spanClose");
  });
});

describe("parseWord — x families, revisers, joins, foreign", () => {
  it("parses veguxel as valueAbility (ability.md; classify splits need-set later)", () => {
    const word = parseOk("veguxel");
    assert.equal(word.pos, "v");
    assert.equal(word.ending, "l");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "valueAbility",
      leftRoots: ["egu"],
      stanceVowel: "e",
    });
  });

  it("parses revisers al and om (revisers.md)", () => {
    assert.deepEqual(parseOk("al").family, { kind: "reviser", form: "al" });
    assert.equal(parseOk("al").ending, "l");
    assert.deepEqual(parseOk("om").family, { kind: "reviser", form: "om" });
    assert.equal(parseOk("om").ending, "m");
  });

  it("parses z<Sam>n compact foreign and d<sushi> opaque (core.md / spans.md)", () => {
    const named = parseOk("z<Sam>n");
    assert.equal(named.pos, "z");
    assert.equal(named.ending, "n");
    assert.deepEqual(named.family, { kind: "foreign", payload: "Sam", opaque: false });

    const opaque = parseOk("d<sushi>");
    assert.equal(opaque.pos, "d");
    assert.equal(opaque.ending, undefined);
    assert.deepEqual(opaque.family, { kind: "foreign", payload: "sushi", opaque: true });
  });

  it("parses zolexrabal as numeric derivation +e (numeric-derivation.md)", () => {
    const word = parseOk("zolexrabal");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "l");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "numeric",
      leftRoots: ["ole"],
      numberStem: { marker: "+", groups: [], digitlessExp: "e" },
    });
  });

  it("parses zal as a join marker, not content (coordination.md)", () => {
    const word = parseOk("zal");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "l");
    assert.deepEqual(word.family, { kind: "joinMarker", series: "a" });
  });

  it("parses ordinary compound zuzuzuxogeven (x-compounds.md)", () => {
    const word = parseOk("zuzuzuxogeven");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "compound",
      leftRoots: ["uzuzu"],
      rightRoots: ["ogeve"],
    });
  });
});

describe("parseWord — illegal shapes", () => {
  it("rejects capital role letter Zazawan (core.md capitalization)", () => {
    assert.throws(() => parseWord("Zazawan"), WordParseError);
  });

  it("rejects ROOTx1 with no number marker (numeric-derivation.md)", () => {
    assert.throws(() => parseWord("zolex1l"), WordParseError);
  });

  it("rejects reserved e x ROOT role (x-compounds.md / roles.md)", () => {
    assert.throws(() => parseWord("zexogodol"), WordParseError);
  });
});
