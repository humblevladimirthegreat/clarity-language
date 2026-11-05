import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { parseWithTables } from "../parse/parse-core.js";
import { drillWrongForms, lintWordOrder, orderFindings, staleMovedMarkers } from "./word-order.js";

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

  it("lets a measure /b/ go anywhere, like an /h/ word", () => {
    assert.deepEqual(rules("zazozon bezerom gradol vowurol."), []);
    assert.deepEqual(rules("zahelan bagorum gradom vezuvel."), []);
    assert.deepEqual(rules("zalazun bazozon oel bahelan varal."), ["/b/ right after the verb"]);
  });

  it("reads a range hook in -r as a fill-ask blank, with the range it completes", () => {
    assert.deepEqual(rules("yel dorelx gragel oer grazal zazozon varal."), []);
    assert.deepEqual(rules("yel zazozon dorelx gragel oer grazal varal."), ["fill-ask: every blank first"]);
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

  it("skips a sentence marked moved, and flags the marker on a sentence in default order", () => {
    const page = "<!-- lint: moved -->`dogozel zodozel vayebel.` and <!-- lint: moved -->`zodozel dogozel vayebel.`\n";
    assert.deepEqual(lintWordOrder(page, tables), []);
    const marked = (text: string) => ({ text, index: 0, result: parseWithTables(text, tables), moved: true });
    assert.deepEqual(
      staleMovedMarkers([marked("dogozel zodozel vayebel."), marked("zodozel dogozel vayebel.")]).map((s) => s.text),
      ["zodozel dogozel vayebel."],
    );
  });

  it("reads a joined verb with its own object or recipient as one verb slot (verb-and-stance-joins.md#vp-clause-forms)", () => {
    assert.deepEqual(rules("zahelan vowuyal davogel erom vowurol."), []);
    assert.deepEqual(rules("zalazun vezuyol bahelan abam vowurol."), []);
    assert.deepEqual(rules("zazozon dabedal vugudol daledel vagedal val."), []);
    // A word after the last verb is not that verb's own: it still leaves statement order.
    assert.deepEqual(rules("zahelan vowurol abam vowuyal davogel."), ["statement: verb late"]);
  });

  it("skips a drill's wrong forms: the Pick one option that is not the answer, and a Fix it error form", () => {
    const page = [
      "### Practice {#practice}",
      "",
      "#### English → Ageben {#e}",
      "",
      "#### Ageben → English {#a}",
      "",
      "#### Pick one {#p}",
      "",
      "**1.** *Azozon sees a stick.* `zazozon vayebel dodozel.` or `zazozon dodozel vayebel.`",
      "",
      "::: details Show answer",
      "`zazozon dodozel vayebel.`",
      ":::",
      "",
      "#### Fix it {#f}",
      "",
      "**1.** *Azozon sees a stick.* <!-- lint: error -->`zazozon vayebel dodozel.`",
      "",
      "::: details Show answer",
      "`zazozon dodozel vayebel.`",
      ":::",
      "",
      "Elsewhere `zalazun vayebel dodozel.`",
      "",
    ].join("\n");
    assert.deepEqual(drillWrongForms(page).map((w) => w.text), ["zazozon vayebel dodozel.", "zazozon vayebel dodozel."]);
    assert.deepEqual(lintWordOrder(page, tables).map((w) => w.text), ["zalazun vayebel dodozel."]);
  });

  it("gives one warning per span, naming the sentence when the span has several", () => {
    assert.deepEqual(lintWordOrder("`zazozon vayebel dogozel. zazozon vayeber dodozel.`\n", tables).map((w) => w.detail), [
      "sentence 1: statement: verb late (z v d); sentence 2: statement: verb late (z v d)",
    ]);
    assert.deepEqual(lintWordOrder("`zazozon vayebel dogozel.`\n", tables).map((w) => w.detail), ["statement: verb late (z v d)"]);
  });
});
