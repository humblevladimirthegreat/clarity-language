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
    const { words } = sentence("zazawan vovol oel bugobon.");
    assert.deepEqual(
      words.map((w) => [w.word.raw, w.unit]),
      [
        ["zazawan", "np"],
        ["vovol", "vp"],
        ["oel", "hook"],
        ["bugobon", "np"],
      ],
    );
  });
  it("includes left-edge hooks", () => {
    const { words } = sentence("or zazawan vawalal.");
    assert.ok(matchesTerm(words[0]!, parseTerm("family=hook,ending=r")));
  });
  it("matches adjacent sequences only", () => {
    const { words } = sentence("zululon vezehel thegegam bazawan.");
    assert.deepEqual(matchSequence(words, [parseTerm("role=th"), parseTerm("role=b")]), [2]);
    assert.deepEqual(matchSequence(words, [parseTerm("role=v"), parseTerm("role=b")]), []);
  });
});

describe("collectExamples", () => {
  it("reads inline, <code>, and agalan fence spans, and skips fragments", () => {
    const md = [
      "Say `zazawan vawalal.` or <code>zululon vawalal.</code>.",
      "",
      "```agalan",
      "zazawan velebel.",
      "```",
      "",
      "<!-- lint: fragment --> `zazawan vawalal`",
      "",
      "```text",
      "zazawan vawalal.",
      "```",
    ].join("\n");
    assert.deepEqual(
      collectExamples(md, tables).map((e) => e.text),
      ["zazawan vawalal.", "zazawan velebel.", "zululon vawalal."],
    );
  });
});
