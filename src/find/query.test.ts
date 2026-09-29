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
    assert.deepEqual(parseTerm("role=v,ending=r"), [
      { key: "role", value: "v" },
      { key: "ending", value: "r" },
    ]);
  });
  it("rejects unknown keys", () => {
    assert.throws(() => parseTerm("colour=red"), /bad term/);
  });
});

describe("example words", () => {
  it("lists words in surface order with their unit", () => {
    const { words } = sentence("zazawan vuvudel oel bamegun.");
    assert.deepEqual(
      words.map((w) => [w.word.raw, w.unit]),
      [
        ["zazawan", "np"],
        ["vuvudel", "vp"],
        ["oel", "hook"],
        ["bamegun", "np"],
      ],
    );
  });
  it("includes left-edge hooks", () => {
    const { words } = sentence("or zazawan vowogal.");
    assert.ok(matchesTerm(words[0]!, parseTerm("family=hook,ending=r")));
  });
  it("matches adjacent sequences only", () => {
    const { words } = sentence("zalahen vezebel thegem bazawan.");
    assert.deepEqual(matchSequence(words, [parseTerm("role=th"), parseTerm("role=b")]), [2]);
    assert.deepEqual(matchSequence(words, [parseTerm("role=v"), parseTerm("role=b")]), []);
  });
});

describe("collectExamples", () => {
  it("reads inline, <code>, and agazan fence spans, and skips fragments", () => {
    const md = [
      "Say `zazawan vowogal.` or <code>zalahen vowogal.</code>.",
      "",
      "```agazan",
      "zazawan vezebal.",
      "```",
      "",
      "<!-- lint: fragment --> `zazawan vowogal`",
      "",
      "```text",
      "zazawan vowogal.",
      "```",
    ].join("\n");
    assert.deepEqual(
      collectExamples(md, tables).map((e) => e.text),
      ["zazawan vowogal.", "zazawan vezebal.", "zalahen vowogal."],
    );
  });
});

describe("learner name slot", () => {
  it("parses SELF examples with the default learner root", () => {
    assert.deepEqual(
      collectExamples("`yom zSELFn vehahel thegam.`", tables).map((e) => e.text),
      ["yom zamegun vehahel thegam."],
    );
  });
});
