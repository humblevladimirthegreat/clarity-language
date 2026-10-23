import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord, parseWords, WordParseError } from "./word.js";
import type { MorphWord } from "./types.js";

function parseOk(input: string): MorphWord {
  return parseWord(input);
}

describe("parseWord — content / gl- / citation", () => {
  it("parses zugobon as /z/ content ugobo + -n (clause.md orthography)", () => {
    const word = parseOk("zugobon");
    assert.equal(word.raw, "zugobon");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "n");
    assert.equal(word.gl, undefined);
    assert.equal(word.plural, undefined);
    assert.deepEqual(word.family, { kind: "content", roots: ["ugobo"] });
  });

  it("parses associative plural -x after the ending (plurality.md)", () => {
    const word = parseOk("zazawanx");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "n");
    assert.equal(word.plural, true);
    assert.deepEqual(word.family, { kind: "content", roots: ["azawa"] });
  });

  it("parses -ln as one thing a name applies to, with -x after it (proper-names.md#name-instance--ln)", () => {
    const word = parseOk("dazawaln");
    assert.equal(word.ending, "ln");
    assert.deepEqual(word.family, { kind: "content", roots: ["azawa"] });
    const group = parseOk("dazawalnx");
    assert.equal(group.ending, "ln");
    assert.equal(group.plural, true);
    const compound = parseOk("zalexaloweln");
    assert.equal(compound.ending, "ln");
    const span = parseOk("d^@<iPhone>");
    assert.equal(span.ending, "ln");
    assert.deepEqual(span.family, { kind: "writingSpan", bracket: "<", payload: "iPhone", marks: ["^@"] });
    assert.throws(() => parseWord("d^<iPhone>"), WordParseError);
  });

  it("parses glelulul as left-bound /ɡ/ (clause.md gl-)", () => {
    const word = parseOk("glelulul");
    assert.equal(word.pos, "g");
    assert.equal(word.gl, true);
    assert.equal(word.ending, "l");
    assert.deepEqual(word.family, { kind: "content", roots: ["elulu"] });
  });

  it("parses prefix-less citation uzumum (word-endings.md citation-forms)", () => {
    const word = parseOk("uzumum");
    assert.equal(word.pos, undefined);
    assert.equal(word.ending, "m");
    assert.deepEqual(word.family, { kind: "content", roots: ["uzumu"] });
  });
});

describe("parseWord — numbers (writing + speech)", () => {
  it("parses g+3 and speech twin gragel", () => {
    const writing = parseOk("g+3");
    assert.equal(writing.pos, "g");
    assert.equal(writing.ending, "l");
    assert.deepEqual(writing.family, {
      kind: "number",
      stem: { marker: "+", groups: [{ mantissa: "3" }] },
    });

    const speech = parseOk("gragel");
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

  it("parses bare OoM g+e0 and explicit-ending v+0el (numbers.md)", () => {
    const ones = parseOk("g+e0");
    assert.equal(ones.ending, "l");
    if (ones.family.kind === "number") {
      assert.deepEqual(ones.family.stem, { marker: "+", groups: [], digitlessExp: "e0" });
    }

    const wipe = parseOk("v+0el");
    assert.equal(wipe.ending, "l");
    if (wipe.family.kind === "number") {
      assert.deepEqual(wipe.family.stem, { marker: "+", groups: [], digitlessExp: "0e" });
    }

    const sci = parseOk("g+1e9");
    if (sci.family.kind === "number") {
      assert.deepEqual(sci.family.stem.groups, [
        { mantissa: "1", exponentSign: "wa", exponentDigits: "9" },
      ]);
    }
  });
});

describe("parseWord — spans and writing atoms", () => {
  it("parses writing atoms d[hi] and d@[Hamlet] (spans.md / clause.md)", () => {
    const cite = parseOk("d[hi]");
    assert.equal(cite.pos, "d");
    assert.equal(cite.ending, "l");
    assert.deepEqual(cite.family, {
      kind: "writingSpan",
      bracket: "[",
      payload: "hi",
      marks: [],
    });

    const proper = parseOk("d@[Hamlet]");
    assert.equal(proper.ending, "n");
    assert.deepEqual(proper.family, {
      kind: "writingSpan",
      bracket: "[",
      payload: "hamlet",
      marks: ["@"],
    });
  });

  it("has no span resume, no curly span and no unclosed span (spans.md)", () => {
    assert.throws(() => parseWord("d[=]"));
    assert.throws(() => parseWord("z{odoga}"));
    assert.throws(() => parseWord("d[hi"));
  });

  it("parses nested opaque ] inside a cite (spans.md literal-content)", () => {
    const word = parseOk("d[ vuwurul d<]> ]");
    assert.equal(word.pos, "d");
    assert.equal(word.family.kind, "writingSpan");
    if (word.family.kind === "writingSpan") {
      assert.equal(word.family.payload, " vuwurul d<]> ");
    }
  });
});

describe("parseWord — capitals", () => {
  it("reads native capitals as lowercase (phonology.md#vowels)", () => {
    assert.deepEqual(parseWord("ZAzawan"), parseWord("zazawan"));
    assert.deepEqual(parseWord("D[Azawan]"), parseWord("d[azawan]"));
  });

  it("keeps capitals inside an opaque span (spans.md#loans)", () => {
    const word = parseWord("D@<NaCl>");
    assert.equal(word.pos, "d");
    assert.equal(word.family.kind === "writingSpan" && word.family.payload, "NaCl");
  });
});

describe("parseWord — x families, revisers, joins, foreign", () => {
  it("parses golozothal as a sake: sake + th + stance vowel (sakes.md)", () => {
    const word = parseOk("golozothal");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "sake",
      leftRoots: ["olozo"],
      stanceVowel: "a",
    });
  });

  it("parses tholozothom: stance role letter plus a sake word", () => {
    const word = parseOk("tholozothom");
    assert.equal(word.pos, "th");
    assert.equal(word.family.kind === "x" && word.family.xFamily, "sake");
  });

  it("parses hewezathuzozer as a viewpoint lateral that resumes its anchor; a pointer is no anchor", () => {
    const word = parseOk("hewezathuzozer");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "lateral",
      leftRoots: ["eweza"],
      rightRoots: ["uzoze"],
    });
    assert.equal(word.ending, "r");
    assert.throws(() => parseWord("hewezathwazar"));
    assert.throws(() => parseWord("hewezathaxar"));
  });

  it("parses gewezethazawaxululon as a viewpoint lateral with a multipart anchor", () => {
    const word = parseOk("gewezethazawaxululon");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "lateral",
      leftRoots: ["eweze"],
      rightRoots: ["azawa", "ululo"],
    });
  });

  it("requires the separator the between spoken number groups (numbers.md § Group separator)", () => {
    const word = parseOk("hrobazathegemol");
    assert.equal(word.family.kind === "number" && word.family.stem.groups.length, 2);
    assert.throws(() => parseWord("hrovothamol"));
    assert.throws(() => parseWord("grabathugel"));
    const merged = parseOk("hrobazagemol");
    assert.equal(merged.family.kind === "number" && merged.family.stem.groups.length, 1);
  });

  it("parses letter codes on _ in writing and speech (numbers-applied.md § Letter codes)", () => {
    for (const [writing, speech, fields] of [
      ["z_b12", "zrobubadol", [{ code: "b12" }]],
      ["z_4b", "zrohubul", [{ code: "4b" }]],
      ["z_thw", "zrothowal", [{ code: "thw" }]],
      ["z_e1", "zro'ebal", [{ code: "e1" }]],
      ["z_2,1", "zrodothebal", [{ mantissa: "2" }, { mantissa: "1" }]],
    ] as const) {
      for (const raw of [writing, speech]) {
        const word = parseOk(raw);
        assert.equal(word.family.kind === "number" && word.family.stem.marker, "_");
        assert.deepEqual(word.family.kind === "number" && word.family.stem.groups, fields);
      }
    }
    const handle = parseOk("z@_nl");
    assert.equal(handle.ending, "n");
    assert.equal(parseOk("zronulan").ending, "n");
  });

  it("keeps the date stack roe apart from a code that starts with a vowel", () => {
    const date = parseOk("zroebal");
    assert.equal(date.family.kind === "number" && date.family.stem.calendarOrdinal, true);
    const code = parseOk("zro'ebal");
    assert.equal(code.family.kind === "number" && !!code.family.stem.calendarOrdinal, false);
  });

  it("rejects exponents, percent, and x in a code", () => {
    for (const raw of ["z_5%", "zrozayol", "zrowugel", "z_1xb"]) assert.throws(() => parseWord(raw), raw);
  });

  it("parses stance numbers under th (thrabamol = th+10)", () => {
    const word = parseOk("thrabamol");
    assert.equal(word.pos, "th");
    assert.equal(word.family.kind, "number");
  });

  it("parses vuzunexel as ability (intention.md § Ability)", () => {
    const word = parseOk("vuzunexel");
    assert.equal(word.family.kind, "x");
    if (word.family.kind === "x") {
      assert.deepEqual(word.family, {
        kind: "x",
        xFamily: "ability",
        leftRoots: ["uzune"],
        stanceVowel: "e",
      });
    }
  });

  it("parses gwazuwuruxam as role + ability on /ɡ/ only (intention.md § Ability)", () => {
    const word = parseOk("gwazuwuruxam");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "role",
      leftRoots: [],
      scopeVowel: "a",
      part: "z",
      rightRoots: ["uwuru"],
      stanceVowel: "a",
    });
    assert.throws(() => parseWord("vwazuwuruxam"));
  });

  it("parses stacked label-scope vowels on a content root and a role compound", () => {
    const word = parseOk("gunemuthaol");
    assert.equal(word.family.kind, "x");
    if (word.family.kind === "x") {
      assert.equal(word.family.xFamily, "sake");
      assert.equal(word.family.stanceVowel, "ao");
    }
    const role = parseOk("gwuezuduyel");
    if (role.family.kind === "x") {
      assert.equal(role.family.xFamily, "role");
      assert.equal(role.family.scopeVowel, "ue");
    }
  });

  it("reads ao as one stack in a feeling word (phonotactics.md#phonotactics)", () => {
    for (const raw of ["wuwathuraor", "thuwathuraor"]) {
      const word = parseOk(raw);
      assert.ok(word.family.kind === "x" && word.family.xFamily === "sake", raw);
      if (word.family.kind === "x") {
        assert.equal(word.family.locus, "ao", raw);
        assert.equal(word.ending, "r", raw);
      }
    }
    for (const locus of ["a", "o", "uo", "ae"]) assert.equal((parseOk(`wuwathur${locus}r`).family as { locus?: string }).locus, locus);
  });

  it("parses hooked joins: hook, optional m / r, x, join (hook-compounds.md#hooked-joins)", () => {
    const cases: [string, string, string, string, boolean][] = [
      ["zoxual", "ol", "ua", "l", false],
      ["daoxar", "aol", "a", "r", false],
      ["zomxuam", "om", "ua", "m", false],
      ["zorxarx", "or", "a", "r", true],
      ["zuexual", "uel", "ua", "l", false],
      ["huxal", "ul", "a", "l", false],
      ["dexar", "el", "a", "r", false],
    ];
    for (const [raw, hook, series, ending, plural] of cases) {
      const word = parseOk(raw);
      assert.deepEqual(word.family, { kind: "joinMarker", series, hook }, raw);
      assert.equal(word.ending, ending, raw);
      assert.equal(!!word.plural, plural, raw);
    }
  });

  it("reads no hooked join with join -n, a stand-in coda, or l / n before the seam", () => {
    for (const raw of ["zoxuan", "zonxual", "zolxual", "zoxarl", "zeaxual"]) {
      assert.throws(() => parseWord(raw), WordParseError, raw);
    }
  });

  it("parses hook prefixes on x and mx (hook-compounds.md#hook-prefixes)", () => {
    const cases: [string, string, string[]][] = [
      ["guexavuvul", "uel", ["avuvu"]],
      ["daexarayel", "ael", ["araye"]],
      ["guemxewulel", "uem", ["ewule"]],
      ["gaomxohalal", "aom", ["ohala"]],
      ["guexahehaxowurel", "uel", ["aheha", "owure"]],
      ["uexavuvul", "uel", ["avuvu"]],
      ["guexonam", "uel", ["ona"]],
    ];
    for (const [raw, hook, rightRoots] of cases) {
      const word = parseOk(raw);
      assert.equal(word.family.kind, "x", raw);
      if (word.family.kind === "x") {
        assert.equal(word.family.xFamily, "hookPrefix", raw);
        assert.equal(word.family.hook, hook, raw);
        assert.deepEqual(word.family.rightRoots, rightRoots, raw);
      }
    }
    const scoped = parseOk("zuexavuvuthel");
    assert.equal(scoped.family.kind === "x" && scoped.family.scopeVowel, "e");
    assert.equal(parseOk("bluexavuvul").bl, true);
  });

  it("reads no hook prefix on a non-hook pair, another seam consonant, or r before the seam", () => {
    for (const raw of ["geaxavuvul", "gouxavuvul", "guelxavuvul", "guenxavuvul", "gorxahehal"]) {
      assert.throws(() => parseWord(raw), WordParseError, raw);
    }
  });

  it("parses azawaxan as ability host (greeting bid classified later)", () => {
    const word = parseOk("azawaxan");
    assert.equal(word.pos, undefined);
    assert.equal(word.ending, "n");
    assert.equal(word.family.kind, "x");
    if (word.family.kind === "x") {
      assert.equal(word.family.xFamily, "ability");
      assert.deepEqual(word.family.leftRoots, ["azawa"]);
      assert.equal(word.family.stanceVowel, "a");
    }
  });

  it("parses fused extra-noun hook compounds (hooks.md)", () => {
    const two = parseOk("vawalalul");
    assert.equal(two.pos, "v");
    assert.equal(two.family.kind, "content");
    const three = parseOk("awalalual");
    assert.equal(three.pos, undefined);
    assert.equal(three.family.kind, "hookCompound");
    if (three.family.kind === "hookCompound") {
      assert.equal(three.family.leftRoot, "awala");
      assert.equal(three.family.hook, "ual");
    }
    const prefixed = parseOk("vawalalual");
    assert.equal(prefixed.family.kind, "hookCompound");
  });

  it("parses citation ululon (reviser prefix is not a word by itself)", () => {
    const word = parseOk("ululon");
    assert.equal(word.pos, undefined);
    assert.equal(word.ending, "n");
    assert.deepEqual(word.family, { kind: "content", roots: ["ululo"] });
  });

  it("parses ordinary x-compound zazawaxululon (compounds.md)", () => {
    const word = parseOk("zazawaxululon");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "n");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "compound",
      leftRoots: ["azawa"],
      rightRoots: ["ululo"],
    });
  });

  it("parses z@<Sam> and d<kimchi> as writing opaque spans (spans.md)", () => {
    const named = parseOk("z@<Sam>");
    assert.equal(named.pos, "z");
    assert.equal(named.ending, "n");
    assert.deepEqual(named.family, {
      kind: "writingSpan",
      bracket: "<",
      payload: "Sam",
      marks: ["@"],
    });

    const opaque = parseOk("d<kimchi>");
    assert.equal(opaque.pos, "d");
    assert.equal(opaque.ending, "l");
    assert.deepEqual(opaque.family, {
      kind: "writingSpan",
      bracket: "<",
      payload: "kimchi",
      marks: [],
    });
  });

  it("parses zrawaxolovel as a numeric prefix +e (numeric-derivation.md)", () => {
    const word = parseOk("zrawaxolovel");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "l");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "numeric",
      leftRoots: [],
      rightRoots: ["olove"],
      numberStem: { marker: "+", groups: [], digitlessExp: "e" },
    });
  });

  it("parses numeric prefixes on x and mx, on a compound stem, and hosted", () => {
    const approx = parseOk("dragemxezuyel");
    assert.equal(approx.family.kind === "x" && approx.family.approx, true);
    assert.equal(parseOk("zrawaxolovem").ending, "m");
    const compound = parseOk("zragexahehaxowurel");
    assert.deepEqual(compound.family.kind === "x" && compound.family.rightRoots, ["aheha", "owure"]);
    assert.equal(parseOk("blragexezuyel").bl, true);
    assert.equal(parseOk("zragexezuyelx").plural, true);
    assert.equal(parseOk("rawaxolovel").family.kind, "x");
  });

  it("reads no numeric prefix in the root-first shape, on another seam consonant, or on a one-vowel stem", () => {
    for (const raw of ["zolovelrawal", "zolovemrawal", "zragelxezuyel", "zragenxezuyel", "zragerxezuyel", "zragexal", "zragemxal"]) {
      assert.throws(() => parseWord(raw), WordParseError, raw);
    }
  });

  it("parses zal as a join marker, not content (joins.md)", () => {
    const word = parseOk("zal");
    assert.equal(word.pos, "z");
    assert.equal(word.ending, "l");
    assert.deepEqual(word.family, { kind: "joinMarker", series: "a" });
  });

  it("parses zarx as a join -r with -x (joins.md#unspecified-member-r-phrase)", () => {
    const word = parseOk("zarx");
    assert.equal(word.ending, "r");
    assert.equal(word.plural, true);
    assert.deepEqual(word.family, { kind: "joinMarker", series: "a" });
  });

  it("reads role letter + w + vowels as a tag, and a consonant that is not a part as no word", () => {
    assert.deepEqual(parseOk("zwuar").family, { kind: "tag", vowels: ["u", "a"] });
    // Remaining open shapes: a consonant that is not a part (`r`, or `ey` + extra letters).
    for (const input of ["zweyual", "hweral"]) assert.throws(() => parseWord(input), WordParseError, input);
  });

  it("parses darl / darm as stand-ins (clause.md stand-in)", () => {
    const locked = parseOk("darl");
    assert.equal(locked.pos, "d");
    assert.equal(locked.ending, "rl");
    assert.deepEqual(locked.family, { kind: "joinMarker", series: "a" });
    const open = parseOk("dorl");
    assert.equal(open.ending, "rl");
    assert.deepEqual(open.family, { kind: "joinMarker", series: "o" });
    const gist = parseOk("darm");
    assert.equal(gist.ending, "rm");
  });

  it("parses ordinary compound zuzuzuxogoven (compounds.md)", () => {
    const word = parseOk("zuzuzuxogoven");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "compound",
      leftRoots: ["uzuzu"],
      rightRoots: ["ogove"],
    });
  });

  it("parses three-root ordinary compound zuzuzuxogovexadedan (compounds.md)", () => {
    const word = parseOk("zuzuzuxogovexadedan");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "compound",
      leftRoots: ["uzuzu"],
      rightRoots: ["ogove", "adeda"],
    });
  });

  it("parses w + scope + b + ROOT as recipient role (roles.md)", () => {
    const word = parseOk("zwabezehel");
    assert.equal(word.family.kind, "x");
    if (word.family.kind === "x") {
      assert.equal(word.family.xFamily, "role");
      assert.equal(word.family.scopeVowel, "a");
      assert.equal(word.family.part, "b");
      assert.deepEqual(word.family.rightRoots, ["ezehe"]);
    }
  });

  it("tells a pointer from a compound after the part consonant (zwazar, zwazarayel)", () => {
    const pointer = parseOk("zwazar");
    assert.equal(pointer.family.kind === "x" && pointer.family.xFamily, "pointer");
    const compound = parseOk("zwazarayel");
    assert.equal(compound.family.kind === "x" && compound.family.xFamily, "role");
  });

  it("reads the pointer shape on /h/ as a say word", () => {
    assert.equal(parseOk("hwazam").family.kind, "say");
    assert.equal(parseOk("zwazam").family.kind, "x");
  });

  it("parses a slot-part role compound on /h/ as capacity (viewpoint.md#capacity)", () => {
    const word = parseOk("hwezuduyel");
    if (word.family.kind === "x") {
      assert.equal(word.family.xFamily, "role");
      assert.equal(word.family.scopeVowel, "e");
      assert.equal(word.family.part, "z");
      assert.deepEqual(word.family.rightRoots, ["uduye"]);
    }
    assert.equal(word.pos, "h");
  });

  it("parses content-rule parts as pointers and compounds (viewpoint.md#content-of-the-event)", () => {
    const pointer = parseOk("dwahar");
    assert.deepEqual(pointer.family, {
      kind: "x",
      xFamily: "pointer",
      leftRoots: [],
      scopeVowel: "a",
      part: "h",
      pointerVowel: "a",
    });
    const compound = parseOk("dwahowurel");
    if (compound.family.kind === "x") {
      assert.equal(compound.family.xFamily, "role");
      assert.equal(compound.family.part, "h");
      assert.deepEqual(compound.family.rightRoots, ["owure"]);
    }
    const event = parseOk("dwavar");
    assert.equal(event.family.kind === "x" && event.family.part, "v");
    assert.throws(() => parseWord("zwavowurel"), WordParseError);
    const stance = parseOk("dwathar");
    assert.equal(stance.family.kind === "x" && stance.family.part, "th");
    const move = parseOk("zwuyar");
    assert.equal(move.family.kind === "x" && move.family.xFamily, "pointer");
    assert.equal(move.family.kind === "x" && move.family.part, "y");
  });

  it("rejects the old role shape and a th scope after a role stem", () => {
    for (const raw of ["zwazuduyethel", "xuxun"]) assert.throws(() => parseWord(raw), WordParseError, raw);
  });
});

describe("parseWord — illegal shapes", () => {
  it("rejects a digit after a root (numeric-derivation.md)", () => {
    assert.throws(() => parseWord("zolovel1l"), WordParseError);
  });
  it("rejects a reversed stack (design-decisions.md#stacked-vowels)", () => {
    for (const raw of ["zoal", "yoal", "oal", "doaxeguyel", "wuwathuroar", "zeol", "yeal"]) assert.throws(() => parseWord(raw), WordParseError, raw);
  });
});
