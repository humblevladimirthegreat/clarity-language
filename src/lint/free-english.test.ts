import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { glossLabels } from "./terminology-docs.js";
import {
  extraParens,
  extractFreeEnglish,
  lintTableEnglish,
  lintFreeEnglish,
  noteFindings,
  parenGroups,
  splitFreeEnglish,
  tableEnglish,
} from "./free-english.js";

const tables = loadDefaultTables();
const labels = glossLabels(tables.overlays.values());

describe("splitFreeEnglish", () => {
  const one = (sentence: string, note: string | null = null) => ({ sentence, note, parts: [sentence], join: "one" });

  it("splits a quoted sentence and its note", () => {
    assert.deepEqual(splitFreeEnglish('"Azawan walks."'), one("Azawan walks."));
    assert.deepEqual(splitFreeEnglish('"tea or coffee." (pick one)'), one("tea or coffee.", "pick one"));
    assert.deepEqual(splitFreeEnglish('"A." (whose (left))'), one("A.", "whose (left)"));
  });

  it("splits italics in a checkpoint", () => {
    assert.deepEqual(splitFreeEnglish("*Ahaben sees that Alahen sneaks.*", "*"), one("Ahaben sees that Alahen sneaks."));
    assert.deepEqual(splitFreeEnglish("*Azawan sits.* (no one is to blame)", "*"), one("Azawan sits.", "no one is to blame"));
  });

  it("splits alternatives and takes the first as the sentence", () => {
    assert.deepEqual(splitFreeEnglish('"Yes." / "True." / "Got it."'), {
      sentence: "Yes.",
      note: null,
      parts: ["Yes.", "True.", "Got it."],
      join: "alternatives",
    });
    assert.deepEqual(splitFreeEnglish("*No.* / *False.* (the claim does not match)", "*"), {
      sentence: "No.",
      note: "the claim does not match",
      parts: ["No.", "False."],
      join: "alternatives",
    });
  });

  it("splits dialogue turns and joins them as the sentence", () => {
    assert.deepEqual(splitFreeEnglish('"Walk." "Will do." (a promise)'), {
      sentence: "Walk. Will do.",
      note: "a promise",
      parts: ["Walk.", "Will do."],
      join: "turns",
    });
    assert.equal(splitFreeEnglish("*Didn’t Azawan tell?* *True, Azawan didn’t.*", "*")?.join, "turns");
  });

  it("rejects every other shape", () => {
    assert.equal(splitFreeEnglish('"A." / "B." "C."'), null);
    assert.equal(splitFreeEnglish('"A." (one) (two)'), null);
    assert.equal(splitFreeEnglish('"A." (one).'), null);
    assert.equal(splitFreeEnglish('"A." You name yourself.'), null);
    assert.equal(splitFreeEnglish('"A." (one) "B."'), null);
    assert.equal(splitFreeEnglish("*Azawan sits* (no one is to blame).", "*"), null);
    assert.equal(splitFreeEnglish("*Didn’t Azawan tell?* Then confirm: *true, Azawan didn’t.*", "*"), null);
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

describe("extraParens", () => {
  it("allows one group per aside or scope island", () => {
    assert.equal(extraParens("Azawan walks (quietly).", "z-Azawan | v-walk | ASIDE[th-quiet]"), 0);
    assert.equal(extraParens("Azawan and (just water).", "[z-Azawan | SCOPE[z-water | z-and] | z-and.open]"), 0);
    assert.equal(extraParens("Azawan walks (as mechanism).", "z-Azawan | v-walk"), 1);
  });

  it("allows a letter group only for a tag the gloss sets", () => {
    const gloss = "[[z-dog | z-tag.A] | [z-cat | z-tag.E] | z-and.open] | v-walk . z-←tag.A+E | v-run";
    assert.equal(extraParens("A dog (A) and a cat (E) walk. A and E run.", gloss), 0);
    assert.equal(extraParens("A dog (A) walks (quietly).", gloss), 1);
    assert.equal(extraParens("Azawan (A) punches.", "z-Azawan | d-←tag.A | v-punch"), 1);
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
    assert.deepEqual(kinds("say [how you know it](knowing.md#holder)"), []);
    assert.deepEqual(kinds("takes a [holder](knowing.md#holder)"), ["note-term"]);
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
      split: { sentence: "Azawan walks.", note: "alone", parts: ["Azawan walks."], join: "one" },
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

describe("tableEnglish", () => {
  const sheet = (rows: string[], header = "| Job | Example | English | Stage |") =>
    [header, "|-----|---------|---------|-------|", ...rows].join("\n");

  it("reads italic English cells beside an Agazan phrase or sentence", () => {
    const md = sheet(["| Walk | `zazawan vowogal.` | *Azawan walks.* (alone) | B |", "| Kin | `grebuwol` | the layer above the focus | A |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ agazan, text }) => ({ agazan, text })),
      [{ agazan: "zazawan vowogal.", text: "*Azawan walks.* (alone)" }],
    );
    assert.deepEqual(tableEnglish(sheet(["| `hadem` | here | *here*, *this* | B |"], "| Agazan | Use | English | Stage |")), []);
    assert.deepEqual(tableEnglish(sheet(["| Join | `A xol B` | *(A or B)* | B |"])), []);
  });

  it("splits pieces and pairs them with the Example pieces", () => {
    const md = sheet(["| Acts | `yel vowogal.` · `yul vowogal.` | *Walk!* · *Don't walk.* (a ban) | B |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ agazan, text }) => ({ agazan, text })),
      [
        { agazan: "yel vowogal.", text: "*Walk!*" },
        { agazan: "yul vowogal.", text: "*Don't walk.* (a ban)" },
      ],
    );
  });

  it("skips generated blocks", () => {
    const md = ["<!-- generated: overlays kind=x -->", sheet(["| A | `zazawan vowogal.` | *Azawan walks (alone).* | B |"]), "<!-- /generated -->"].join("\n");
    assert.deepEqual(tableEnglish(md), []);
  });
});

describe("lintTableEnglish", () => {
  const kinds = (cell: string) =>
    lintTableEnglish(["| Job | Example | English |", "|---|---|---|", `| Walk | \`zazawan vowogal.\` | ${cell} |`].join("\n"), tables).map(
      (f) => f.kind,
    );

  it("flags the shape and parentheses inside the sentence, not the note", () => {
    assert.deepEqual(kinds("*Azawan walks* (alone)."), ["shape"]);
    assert.deepEqual(kinds("*Azawan walks (alone).*"), ["inside-parens"]);
    assert.deepEqual(kinds("*Azawan walks.* (a mirative)"), []);
    assert.deepEqual(kinds("*Azawan walks.* (alone; quietly)"), []);
  });
});
