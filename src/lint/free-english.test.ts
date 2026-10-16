import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { glossLabels } from "./terminology-docs.js";
import { extractFreeEnglish, lintFreeEnglish, noteFindings, parenGroups, splitFreeEnglish } from "./free-english.js";

const tables = loadDefaultTables();
const labels = glossLabels(tables.overlays.values());

describe("splitFreeEnglish", () => {
  it("splits a quoted sentence and its note", () => {
    assert.deepEqual(splitFreeEnglish('"Azawan walks."'), { sentence: "Azawan walks.", note: null });
    assert.deepEqual(splitFreeEnglish('"tea or coffee." (pick one)'), { sentence: "tea or coffee.", note: "pick one" });
    assert.deepEqual(splitFreeEnglish('"A." (whose (left))'), { sentence: "A.", note: "whose (left)" });
  });

  it("splits italics in a checkpoint", () => {
    assert.deepEqual(splitFreeEnglish("*Ahaben sees that Alahen sneaks.*", "*"), { sentence: "Ahaben sees that Alahen sneaks.", note: null });
    assert.deepEqual(splitFreeEnglish("*Azawan sits.* (no one is to blame)", "*"), { sentence: "Azawan sits.", note: "no one is to blame" });
  });

  it("rejects every other shape", () => {
    assert.equal(splitFreeEnglish('"A." "B."'), null);
    assert.equal(splitFreeEnglish('"A." / "B."'), null);
    assert.equal(splitFreeEnglish('"A." (one) (two)'), null);
    assert.equal(splitFreeEnglish('"A." (one).'), null);
    assert.equal(splitFreeEnglish('"A." You name yourself.'), null);
    assert.equal(splitFreeEnglish("*Azawan sits* (no one is to blame).", "*"), null);
    assert.equal(splitFreeEnglish("*null* / *void*", "*"), null);
    assert.equal(splitFreeEnglish("A."), null);
  });
});

describe("parenGroups", () => {
  it("counts top-level groups only", () => {
    assert.equal(parenGroups("Azawan walks."), 0);
    assert.equal(parenGroups("Azawan (A) and Alahen (E) harvest."), 2);
    assert.equal(parenGroups("Azawan walks (quietly (very))."), 1);
  });
});

describe("noteFindings", () => {
  const kinds = (note: string) => noteFindings(note, labels).map((f) => f.kind);

  it("allows plain English", () => {
    for (const note of ["pick one", "the surprise is Azawan's", "an open list", "a cause, and no one is blamed", "Azawan's left", "he/she/they"]) {
      assert.deepEqual(kinds(note), [], note);
    }
  });

  it("flags forms, labels, and grammar terms", () => {
    assert.deepEqual(kinds("`zaxar` would be Alahen"), ["note-form"]);
    assert.deepEqual(kinds("/w/ does not retarget it"), ["note-form"]);
    assert.deepEqual(kinds("PATTERN is the baseline"), ["note-label"]);
    assert.deepEqual(kinds("mirative with an Azawan holder"), ["note-term", "note-term"]);
  });

  it("reports the longest matching term", () => {
    const details = noteFindings("loan verb", labels).map((f) => f.detail);
    assert.deepEqual(details, ['the note uses the grammar term "loan verb"']);
  });
});

describe("extractFreeEnglish", () => {
  it("reads example blocks with or without a morph line", () => {
    const md = [
      "> `zazawan vowogal.`",
      ">",
      '> "Azawan walks." (alone)',
      "",
      "> `zazawan vedehol.`",
      "> `zaxedehor vezebal.`",
      ">",
      "> z-Azawan | v-teach . z-←agent-x-teach | v-sleep",
      ">",
      '> "Azawan teaches. The one teaching sleeps."',
      "",
      '> "English only."',
    ].join("\n");
    const lines = extractFreeEnglish(md);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0], {
      kind: "example",
      agazan: "zazawan vowogal.",
      morph: null,
      text: '"Azawan walks." (alone)',
      index: md.indexOf('"Azawan walks."'),
      delimiter: '"',
      split: { sentence: "Azawan walks.", note: "alone" },
    });
    assert.equal(lines[1]!.agazan, "zazawan vedehol. zaxedehor vezebal.");
    assert.equal(lines[1]!.morph, "z-Azawan | v-teach . z-←agent-x-teach | v-sleep");
  });

  it("reads checkpoint prompts and answers", () => {
    const md = [
      "### Practice {#beginner-practice}",
      "",
      "#### English → Agazan {#beginner-english-to-agazan}",
      "",
      "**1.** *Azawan walks.* (alone)",
      "",
      "::: details Show answer",
      "`zazawan vowogal.`",
      "",
      "z-Azawan | v-walk",
      ":::",
      "",
      "#### Agazan → English {#beginner-agazan-to-english}",
      "",
      "**1.** `zazawan vowogal.`",
      "",
      "::: details Show answer",
      "z-Azawan | v-walk",
      "",
      "*Azawan walks.* (alone)",
      ":::",
      "",
      "#### Fix it {#beginner-fix-it}",
      "",
      "**1.** *Azawan walks.* <!-- lint: error -->`vowogal zazawan.`",
      "",
      "::: details Show answer",
      "`zazawan vowogal.`",
      ":::",
    ].join("\n");
    const lines = extractFreeEnglish(md).map(({ kind, agazan, morph, text }) => ({ kind, agazan, morph, text }));
    assert.deepEqual(lines, [
      { kind: "en-ag", agazan: "zazawan vowogal.", morph: "z-Azawan | v-walk", text: "*Azawan walks.* (alone)" },
      { kind: "ag-en", agazan: "zazawan vowogal.", morph: "z-Azawan | v-walk", text: "*Azawan walks.* (alone)" },
      { kind: "fix", agazan: "zazawan vowogal.", morph: null, text: "*Azawan walks.*" },
    ]);
  });
});

describe("lintFreeEnglish", () => {
  const kinds = (md: string) => lintFreeEnglish(md, tables).map((f) => f.kind);

  it("allows parentheses inside the quotes only for an aside span", () => {
    assert.deepEqual(kinds('> `zazawan vowogal.`\n>\n> "Azawan walks (quietly)."'), ["inside-parens"]);
    assert.deepEqual(kinds('> `zazawan vowogal th(hagawal).`\n>\n> "Azawan walks (quietly)."'), []);
    assert.deepEqual(kinds('> `zazawan vowogal th(hagawal).`\n>\n> "Azawan walks, quietly."'), []);
  });

  it("flags the shape and the note", () => {
    assert.deepEqual(kinds('> `zazawan vowogal.`\n>\n> "Azawan walks." You name yourself.'), ["shape"]);
    assert.deepEqual(kinds('> `zazawan vowogal.`\n>\n> "Azawan walks." (a mirative)'), ["note-term"]);
    assert.deepEqual(kinds('> `zazawan vowogal.`\n>\n> "Azawan walks." (alone)'), []);
  });
});
