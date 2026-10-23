import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
import { classify, loadDefaultTables } from "../parse/index.js";
import { parseWord } from "../parse/word.js";
import { collectExamples } from "./examples.js";
import { hitWord, matchesTerm, matchSequence, parseTerm } from "./query.js";

const tables = loadDefaultTables();

function sentence(text: string) {
  const [example] = collectExamples(`\`${text}\``, tables);
  assert.ok(example, `${text} should parse`);
  return example;
}

describe("parseTerm", () => {
  it("reads comma-separated conditions", () => {
    assert.deepEqual(
      parseTerm("role=v,ending!=r").map(({ key, value, negate }) => ({ key, value, negate })),
      [
        { key: "role", value: "v", negate: false },
        { key: "ending", value: "r", negate: true },
      ],
    );
  });
  it("keeps commas inside a regex", () => {
    assert.deepEqual(
      parseTerm("raw=z[a-z]{2,4}l,role=z").map(({ key, value }) => [key, value]),
      [
        ["raw", "z[a-z]{2,4}l"],
        ["role", "z"],
      ],
    );
  });
  it("rejects unknown keys and bad regexes", () => {
    assert.throws(() => parseTerm("colour=red"), /bad term/);
    assert.throws(() => parseTerm("raw=("), /bad regex/);
  });
  it("reads xFamily and marker keys", () => {
    assert.deepEqual(
      parseTerm("xFamily=ability,marker=re").map(({ key, value }) => [key, value]),
      [
        ["xFamily", "ability"],
        ["marker", "re"],
      ],
    );
  });
});

describe("regex conditions", () => {
  const { words } = sentence("zuzozen vowurel al behaham om buwon.");
  const raws = (term: string) => words.filter((w) => matchesTerm(w, parseTerm(term))).map((w) => w.word.raw);

  it("match the whole value", () => {
    assert.deepEqual(raws("raw=om"), ["om"]);
    assert.deepEqual(raws("raw=.*ham"), ["behaham"]);
  });
  it("take alternations and classes on any key", () => {
    assert.deepEqual(raws("family=hook,raw=al|om"), ["al", "om"]);
    assert.deepEqual(raws("role=[zv]"), ["zuzozen", "vowurel"]);
  });
  it("negate with !=", () => {
    assert.deepEqual(raws("role=b,raw!=.*n"), ["behaham"]);
  });
  it("match roots inside mid-word x compounds", () => {
    const [word] = sentence("zubedaxuyudal.").words;
    assert.ok(matchesTerm(word!, parseTerm("root=uyuda")));
    assert.ok(matchesTerm(word!, parseTerm("family=compound,root=ubeda")));
  });
});

describe("example words", () => {
  it("lists words in surface order with their unit", () => {
    const { words } = sentence("zuzozen vavobel oel buwon.");
    assert.deepEqual(
      words.map((w) => [w.word.raw, w.unit]),
      [
        ["zuzozen", "np"],
        ["vavobel", "vp"],
        ["oel", "hook"],
        ["buwon", "np"],
      ],
    );
  });
  it("includes left-edge hooks", () => {
    const { words } = sentence("or zuzozen vowurel.");
    assert.ok(matchesTerm(words[0]!, parseTerm("family=hook,ending=r")));
  });
  it("matches adjacent sequences only", () => {
    const { words } = sentence("zolazun vezuyel thewem bluzozen.");
    assert.deepEqual(matchSequence(words, [parseTerm("role=th"), parseTerm("role=b")]), [2]);
    assert.deepEqual(matchSequence(words, [parseTerm("role=v"), parseTerm("role=b")]), []);
  });
});

describe("collectExamples", () => {
  it("reads a teaching stub with an ellipsis as the Agebon word", () => {
    assert.deepEqual(
      collectExamples("`el …`", tables).map((e) => e.words.map((w) => w.word.raw)),
      [["el"]],
    );
  });

  it("reads inline, <code>, and agebon fence spans, and skips fragments", () => {
    const md = [
      "Say `zuzozen vowurel.` or <code>zolazun vowurel.</code>.",
      "",
      "```agebon",
      "zuzozen vezuvol.",
      "```",
      "",
      "<!-- lint: fragment --> `zuzozen vowurel`",
      "",
      "```text",
      "zuzozen vowurel.",
      "```",
    ].join("\n");
    assert.deepEqual(
      collectExamples(md, tables).map((e) => e.text),
      ["zuzozen vowurel.", "zuzozen vezuvol.", "zolazun vowurel."],
    );
  });
});

describe("parse field keys", () => {
  const raws = (text: string, term: string) =>
    sentence(text)
      .words.filter((w) => matchesTerm(w, parseTerm(term)))
      .map((w) => w.word.raw);

  it("matches join series e, not a hook or polar yes", () => {
    const text = "zuzozen zel vowurel al buwon. yael.";
    assert.deepEqual(raws(text, "family=joinMarker,series=e"), ["zel"]);
    assert.deepEqual(raws(text, "family=hook,form=al|om"), ["al"]);
    assert.deepEqual(raws(text, "family=joinMarker,role=y,series=ae"), ["yael"]);
  });

  it("matches hook form on a prefix", () => {
    assert.deepEqual(raws("guexavuvul.", "form=uel"), ["guexavuvul"]);
  });

  it("treats writing and speech number markers as twins, not a digit re", () => {
    const text = "zanal gredol. zanal g#2. zanal grarel.";
    assert.deepEqual(raws(text, "marker=re").sort(), ["g#2", "gredol"]);
    assert.deepEqual(raws(text, "marker=#").sort(), ["g#2", "gredol"]);
    assert.deepEqual(raws(text, "marker=ra"), ["grarel"]);
  });

  it("matches say answer and scope", () => {
    const text = "zuzozen vowurel hwavam. zuzozen vowurel hwavem.";
    assert.deepEqual(raws(text, "family=say,answer=a"), ["hwavam"]);
    assert.deepEqual(raws(text, "family=say,answer=e"), ["hwavem"]);
    assert.deepEqual(raws(text, "family=say,scope=a").sort(), ["hwavam", "hwavem"]);
  });

  it("matches ability and sake stance, not th-scope", () => {
    assert.deepEqual(raws("vuzunexel.", "xFamily=ability,stance=e"), ["vuzunexel"]);
    const sake = `g${CLOSED.ballot}thal`;
    assert.deepEqual(raws(sake, "xFamily=sake,stance=a"), [sake]);
    const [scope] = sentence("guzozethal").words;
    assert.ok(scope);
    assert.equal(scope.word.family.kind === "x" && scope.word.family.xFamily, "scope");
    assert.ok(matchesTerm(scope, parseTerm("scope=a")));
    assert.ok(!matchesTerm(scope, parseTerm("stance=a")));
  });

  it("matches landmark facing as pair scope, not sake stance", () => {
    const facing = { word: classify(parseWord("gazuhethol"), tables), unit: "", position: 0 };
    assert.ok(matchesTerm(facing, parseTerm("xFamily=lateral,scope=o")));
    assert.ok(!matchesTerm(facing, parseTerm("stance=o")));
  });

  it("matches pointer vowel and role scope", () => {
    const [pointer] = sentence("dwahar").words;
    assert.ok(pointer);
    assert.ok(matchesTerm(pointer, parseTerm("xFamily=pointer,pointer=a")));
    assert.ok(matchesTerm(pointer, parseTerm("scope=a")));
  });

  it("matches restrictor reading, not a join", () => {
    const text = "zahelan vezuyol hel. zuzozen zel vowurel.";
    assert.deepEqual(raws(text, "reading=restrictor"), ["hel"]);
    assert.deepEqual(raws(text, "reading=join,series=e"), ["zel"]);
  });

  it("projects hitWord fields including stored marker", () => {
    const [ordinal] = sentence("gredol").words;
    assert.deepEqual(hitWord(ordinal!), {
      raw: "gredol",
      role: "g",
      family: "number",
      series: null,
      form: null,
      marker: "#",
      xFamily: null,
      reading: "number",
      scope: null,
      answer: null,
      stance: null,
      pointer: null,
      locus: null,
    });
  });

  it("matches hooked-join form and a feeling locus", () => {
    assert.deepEqual(raws("zoxual blahehal.", "family=joinMarker,form=ol"), ["zoxual"]);
    const locus = { word: classify(parseWord("wuwathuraor"), tables), unit: "", position: 0 };
    assert.ok(matchesTerm(locus, parseTerm("xFamily=sake,locus=ao")));
  });
});

describe("learner name slot", () => {
  it("parses SELF examples with the default learner root", () => {
    assert.deepEqual(
      collectExamples("`yom zSELFn vuhohol hwavam.`", tables).map((e) => e.text),
      ["yom zuwon vuhohol hwavam."],
    );
  });
});
