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
  const { words } = sentence("zazozon vowurol al bahaham om buwen.");
  const raws = (term: string) => words.filter((w) => matchesTerm(w, parseTerm(term))).map((w) => w.word.raw);

  it("match the whole value", () => {
    assert.deepEqual(raws("raw=om"), ["om"]);
    assert.deepEqual(raws("raw=.*ham"), ["bahaham"]);
  });
  it("take alternations and classes on any key", () => {
    assert.deepEqual(raws("family=hook,raw=al|om"), ["al", "om"]);
    assert.deepEqual(raws("role=[zv]"), ["zazozon", "vowurol"]);
  });
  it("negate with !=", () => {
    assert.deepEqual(raws("role=b,raw!=.*n"), ["bahaham"]);
  });
  it("match roots inside mid-word x compounds", () => {
    const [word] = sentence("zuwedaxubudal.").words;
    assert.ok(matchesTerm(word!, parseTerm("root=ubuda")));
    assert.ok(matchesTerm(word!, parseTerm("family=compound,root=uweda")));
  });
});

describe("example words", () => {
  it("lists words in surface order with their unit", () => {
    const { words } = sentence("zazozon vavobol oel buwen.");
    assert.deepEqual(
      words.map((w) => [w.word.raw, w.unit]),
      [
        ["zazozon", "np"],
        ["vavobol", "vp"],
        ["oel", "hook"],
        ["buwen", "np"],
      ],
    );
  });
  it("includes left-edge hooks", () => {
    const { words } = sentence("er zazozon vowurol.");
    assert.ok(matchesTerm(words[0]!, parseTerm("family=hook,ending=r")));
  });
  it("matches adjacent sequences only", () => {
    const { words } = sentence("zalazun vezuyol thewom blazozon.");
    assert.deepEqual(matchSequence(words, [parseTerm("role=th"), parseTerm("role=b")]), [2]);
    assert.deepEqual(matchSequence(words, [parseTerm("role=v"), parseTerm("role=b")]), []);
  });
});

describe("collectExamples", () => {
  it("reads a teaching stub with an ellipsis as the Ageben word", () => {
    assert.deepEqual(
      collectExamples("`el …`", tables).map((e) => e.words.map((w) => w.word.raw)),
      [["el"]],
    );
  });

  it("reads inline, <code>, and ageben fence spans, and skips fragments", () => {
    const md = [
      "Say `zazozon vowurol.` or <code>zalazun vowurol.</code>.",
      "",
      "```ageben",
      "zazozon vezuvel.",
      "```",
      "",
      "<!-- lint: fragment --> `zazozon vowurol`",
      "",
      "```text",
      "zazozon vowurol.",
      "```",
    ].join("\n");
    assert.deepEqual(
      collectExamples(md, tables).map((e) => e.text),
      ["zazozon vowurol.", "zazozon vezuvel.", "zalazun vowurol."],
    );
  });
});

describe("parse field keys", () => {
  const raws = (text: string, term: string) =>
    sentence(text)
      .words.filter((w) => matchesTerm(w, parseTerm(term)))
      .map((w) => w.word.raw);

  it("matches join series o, not a hook or polar yes", () => {
    const text = "zazozon zol vowurol al buwen. yaol.";
    assert.deepEqual(raws(text, "family=joinMarker,series=o"), ["zol"]);
    assert.deepEqual(raws(text, "family=hook,form=al|om"), ["al"]);
    assert.deepEqual(raws(text, "family=joinMarker,role=y,series=ao"), ["yaol"]);
  });

  it("matches hook form on a prefix", () => {
    assert.deepEqual(raws("guoxuvuvul.", "form=uol"), ["guoxuvuvul"]);
  });

  it("treats writing and speech number markers as twins, not a digit re", () => {
    const text = "zanal grodol. zanal g#2. zanal grarel.";
    assert.deepEqual(raws(text, "marker=ro").sort(), ["g#2", "grodol"]);
    assert.deepEqual(raws(text, "marker=#").sort(), ["g#2", "grodol"]);
    assert.deepEqual(raws(text, "marker=ra"), ["grarel"]);
  });

  it("matches say answer and scope", () => {
    const text = "zazozon vowurol hwuvam. zazozon vowurol hwuvom.";
    assert.deepEqual(raws(text, "family=say,answer=a"), ["hwuvam"]);
    assert.deepEqual(raws(text, "family=say,answer=o"), ["hwuvom"]);
    assert.deepEqual(raws(text, "family=say,scope=u").sort(), ["hwuvam", "hwuvom"]);
  });

  it("matches ability and sake stance, not th-scope", () => {
    assert.deepEqual(raws("vuzunoxol.", "xFamily=ability,stance=o"), ["vuzunoxol"]);
    const sake = `g${CLOSED.ballot}thal`;
    assert.deepEqual(raws(sake, "xFamily=sake,stance=a"), [sake]);
    const [scope] = sentence("gazozothul").words;
    assert.ok(scope);
    assert.equal(scope.word.family.kind === "x" && scope.word.family.xFamily, "scope");
    assert.ok(matchesTerm(scope, parseTerm("scope=u")));
    assert.ok(!matchesTerm(scope, parseTerm("stance=a")));
  });

  it("matches landmark facing as pair scope, not sake stance", () => {
    const facing = { word: classify(parseWord("gazuhothel"), tables), unit: "", position: 0 };
    assert.ok(matchesTerm(facing, parseTerm("xFamily=lateral,scope=e")));
    assert.ok(!matchesTerm(facing, parseTerm("stance=o")));
  });

  it("matches pointer vowel and role scope", () => {
    const [pointer] = sentence("dwuher").words;
    assert.ok(pointer);
    assert.ok(matchesTerm(pointer, parseTerm("xFamily=pointer,pointer=e")));
    assert.ok(matchesTerm(pointer, parseTerm("scope=u")));
  });

  it("matches restrictor reading, not a join", () => {
    const text = "zahelan vozuyel hol. zazozon zol vowurol.";
    assert.deepEqual(raws(text, "reading=restrictor"), ["hol"]);
    assert.deepEqual(raws(text, "reading=join,series=o"), ["zol"]);
  });

  it("projects hitWord fields including stored marker", () => {
    const [ordinal] = sentence("grodol").words;
    assert.deepEqual(hitWord(ordinal!), {
      raw: "grodol",
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
    assert.deepEqual(raws("zexual blohehal.", "family=joinMarker,form=el"), ["zexual"]);
    const locus = { word: classify(parseWord("wuwathuraer"), tables), unit: "", position: 0 };
    assert.ok(matchesTerm(locus, parseTerm("xFamily=sake,locus=ae")));
  });
});

describe("learner name slot", () => {
  it("parses SELF examples with the default learner root", () => {
    assert.deepEqual(
      collectExamples("`yem zSELFn vehohel hwuvam.`", tables).map((e) => e.text),
      ["yem zuwen vehohel hwuvam."],
    );
  });
});
