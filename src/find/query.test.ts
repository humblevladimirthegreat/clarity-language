import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { collectExamples } from "./examples.js";
import { matchesTerm, matchSequence, parseTerm } from "./query.js";

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
});

describe("regex conditions", () => {
  const { words } = sentence("zuzozen vewurel al behaham om bamun.");
  const raws = (term: string) => words.filter((w) => matchesTerm(w, parseTerm(term))).map((w) => w.word.raw);

  it("match the whole value", () => {
    assert.deepEqual(raws("raw=om"), ["om"]);
    assert.deepEqual(raws("raw=.*ham"), ["behaham"]);
  });
  it("take alternations and classes on any key", () => {
    assert.deepEqual(raws("family=hook,raw=al|om"), ["al", "om"]);
    assert.deepEqual(raws("role=[zv]"), ["zuzozen", "vewurel"]);
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
    const { words } = sentence("zuzozen vavobel oel bamun.");
    assert.deepEqual(
      words.map((w) => [w.word.raw, w.unit]),
      [
        ["zuzozen", "np"],
        ["vavobel", "vp"],
        ["oel", "hook"],
        ["bamun", "np"],
      ],
    );
  });
  it("includes left-edge hooks", () => {
    const { words } = sentence("or zuzozen vewurel.");
    assert.ok(matchesTerm(words[0]!, parseTerm("family=hook,ending=r")));
  });
  it("matches adjacent sequences only", () => {
    const { words } = sentence("zolazun vezuyel thegem buzozen.");
    assert.deepEqual(matchSequence(words, [parseTerm("role=th"), parseTerm("role=b")]), [2]);
    assert.deepEqual(matchSequence(words, [parseTerm("role=v"), parseTerm("role=b")]), []);
  });
});

describe("collectExamples", () => {
  it("reads inline, <code>, and egabon fence spans, and skips fragments", () => {
    const md = [
      "Say `zuzozen vewurel.` or <code>zolazun vewurel.</code>.",
      "",
      "```egabon",
      "zuzozen vezuvol.",
      "```",
      "",
      "<!-- lint: fragment --> `zuzozen vewurel`",
      "",
      "```text",
      "zuzozen vewurel.",
      "```",
    ].join("\n");
    assert.deepEqual(
      collectExamples(md, tables).map((e) => e.text),
      ["zuzozen vewurel.", "zuzozen vezuvol.", "zolazun vewurel."],
    );
  });
});

describe("learner name slot", () => {
  it("parses SELF examples with the default learner root", () => {
    assert.deepEqual(
      collectExamples("`yom zSELFn vuhohol thegom.`", tables).map((e) => e.text),
      ["yom zamun vuhohol thegom."],
    );
  });
});
