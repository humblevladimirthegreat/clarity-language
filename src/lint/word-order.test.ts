import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { parseWithTables } from "../parse/parse-core.js";
import { lintWordOrder, orderFindings } from "./word-order.js";

const tables = loadDefaultTables();
const rules = (text: string) => orderFindings(parseWithTables(text, tables)).map((f) => f.rule);

describe("word order by speech act (speech-moves.md#act-word-order)", () => {
  it("passes each act's default order", () => {
    for (const text of [
      "zazozon dubogal vabuvul.",
      "yel zazozon vabuvul dubogal.",
      "yol vabuvul dubogal.",
      "yul dubogal vabuvul.",
      "zazozon vezuyol balazun.",
      "yol varal bazozon.",
      "zodozel hadurom vowurol.",
      "zazozon vowurol hadurom.",
    ]) {
      assert.deepEqual(rules(text), [], text);
    }
  });

  it("warns where the verb leaves its place", () => {
    assert.deepEqual(rules("zazozon vabuvul dubogal."), ["statement: verb late"]);
    assert.deepEqual(rules("yul vabuvul dubogal."), ["prohibition: verb late"]);
    assert.deepEqual(rules("yel zazozon dubogal vabuvul."), ["question: verb second"]);
    assert.deepEqual(rules("yol dubogal vabuvul."), ["command: verb first"]);
  });

  it("warns on an object before the subject and a recipient before the verb", () => {
    assert.deepEqual(rules("dogozel zodozel vayebel."), ["subject before object"]);
    assert.deepEqual(rules("zazozon balazun vezuyol."), ["/b/ right after the verb"]);
  });

  it("reads the outer of two stacked act words", () => {
    assert.deepEqual(rules("yol yel vabuvul dubogal zawan."), []);
  });

  it("puts a fill-ask's blank first, then statement order", () => {
    assert.deepEqual(rules("yel dar zazozon vayebel."), []);
    assert.deepEqual(rules("yel hewem blar zazozon vowurol."), []);
    assert.deepEqual(rules("yel abam zar zazozon vowurol."), []);
    assert.deepEqual(rules("yel zar vayebel dodozel."), ["fill-ask: statement order after the blank"]);
  });

  it("reads X HOOK Y in one role as one slot, and a hook's landmark as placed anywhere", () => {
    assert.deepEqual(rules("yel zazozon aor zahelan varuyol."), []);
    assert.deepEqual(rules("zazozon vowurol erom vazuvol."), []);
    assert.deepEqual(rules("zazozon vowurol el bohehal."), []);
  });

  it("leaves a stand-in and what follows it to the dependent", () => {
    assert.deepEqual(rules("zahelan vezuyol balazun dorm vunurol."), []);
  });

  it("skips a moved sentence when the page also shows it in default order", () => {
    const page = "> `zodozel dogozel vayebel.`\n\nSame meaning:\n\n> `dogozel zodozel vayebel.`\n\nAlso `dogozel zalazun vayebel.`\n";
    assert.deepEqual(
      lintWordOrder(page, tables).map((w) => w.text),
      ["dogozel zalazun vayebel."],
    );
  });
});
