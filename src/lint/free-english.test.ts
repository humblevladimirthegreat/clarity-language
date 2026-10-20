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
    assert.deepEqual(splitFreeEnglish('"Uzazon walks."'), one("Uzazon walks."));
    assert.deepEqual(splitFreeEnglish('"tea or coffee." (pick one)'), one("tea or coffee.", "pick one"));
    assert.deepEqual(splitFreeEnglish('"A." (whose (left))'), one("A.", "whose (left)"));
    assert.deepEqual(splitFreeEnglish("*3 to 5* (`[3, 5)`)", "*"), one("3 to 5", "`[3, 5)`"));
  });

  it("splits italics in a checkpoint", () => {
    assert.deepEqual(splitFreeEnglish("*Ehalon sees that Olozun sneaks.*", "*"), one("Ehalon sees that Olozun sneaks."));
    assert.deepEqual(splitFreeEnglish("*Uzazon sits.* (no one is to blame)", "*"), one("Uzazon sits.", "no one is to blame"));
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
    assert.equal(splitFreeEnglish("*Didn’t Uzazon tell?* *True, Uzazon didn’t.*", "*")?.join, "turns");
  });

  it("rejects every other shape", () => {
    assert.equal(splitFreeEnglish('"A." / "B." "C."'), null);
    assert.equal(splitFreeEnglish('"A." (one) (two)'), null);
    assert.equal(splitFreeEnglish('"A." (one).'), null);
    assert.equal(splitFreeEnglish('"A." You name yourself.'), null);
    assert.equal(splitFreeEnglish('"A." (one) "B."'), null);
    assert.equal(splitFreeEnglish("*Uzazon sits* (no one is to blame).", "*"), null);
    assert.equal(splitFreeEnglish("*Didn’t Uzazon tell?* Then confirm: *true, Uzazon didn’t.*", "*"), null);
    assert.equal(splitFreeEnglish("A."), null);
  });
});

describe("parenGroups", () => {
  it("counts top-level groups only", () => {
    assert.equal(parenGroups("Uzazon walks."), 0);
    assert.equal(parenGroups("Uzazon (A) and Olozun (E) harvest."), 2);
    assert.equal(parenGroups("Uzazon walks (quietly (very))."), 1);
  });
});

describe("extraParens", () => {
  it("allows one group per aside or scope island", () => {
    assert.equal(extraParens("Uzazon walks (quietly).", "z-Uzazon | v-walk | ASIDE[th-quiet]"), 0);
    assert.equal(extraParens("Uzazon and (just water).", "[z-Uzazon | SCOPE[z-water | z-and] | z-and.open]"), 0);
    assert.equal(extraParens("Uzazon walks (as mechanism).", "z-Uzazon | v-walk"), 1);
  });

  it("allows a letter group only for a tag the gloss sets", () => {
    const gloss = "[[z-dog | z-tag.A] | [z-cat | z-tag.E] | z-and.open] | v-walk . z-←tag.A+E | v-run";
    assert.equal(extraParens("A dog (A) and a cat (E) walk. A and E run.", gloss), 0);
    assert.equal(extraParens("A dog (A) walks (quietly).", gloss), 1);
    assert.equal(extraParens("Uzazon (A) punches.", "z-Uzazon | d-←tag.A | v-punch"), 1);
  });
});

describe("noteFindings", () => {
  const kinds = (note: string) => noteFindings(note, labels).map((f) => f.kind);

  it("allows plain English", () => {
    for (const note of ["pick one", "the surprise is Uzazon's", "an open list", "a cause, and no one is blamed", "Uzazon's left", "he/she/they"]) {
      assert.deepEqual(kinds(note), [], note);
    }
  });

  it("flags forms, labels, and grammar terms", () => {
    assert.deepEqual(kinds("`zaxar` would be Olozun"), ["note-form"]);
    assert.deepEqual(kinds("/w/ does not retarget it"), ["note-form"]);
    assert.deepEqual(kinds("PATTERN is the baseline"), ["note-label"]);
    assert.deepEqual(kinds("mirative with an Uzazon holder"), ["note-term", "note-term"]);
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
      "> `zuzazon voworel.`",
      ">",
      '> "Uzazon walks." (alone)',
      "",
      "> `zuzazon vodeyel.`",
      "> `zaxodeyer vuzevol.`",
      ">",
      "> z-Uzazon | v-teach . z-←agent-x-teach | v-sleep",
      ">",
      '> "Uzazon teaches. The one teaching sleeps."',
      "",
      '> "English only."',
    ].join("\n");
    const lines = extractFreeEnglish(md);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0], {
      kind: "example",
      egabon: "zuzazon voworel.",
      morph: null,
      text: '"Uzazon walks." (alone)',
      index: md.indexOf('"Uzazon walks."'),
      delimiter: '"',
      split: { sentence: "Uzazon walks.", note: "alone", parts: ["Uzazon walks."], join: "one" },
    });
    assert.equal(lines[1]!.egabon, "zuzazon vodeyel. zaxodeyer vuzevol.");
    assert.equal(lines[1]!.morph, "z-Uzazon | v-teach . z-←agent-x-teach | v-sleep");
  });

  it("reads checkpoint prompts and answers", () => {
    const md = [
      "### Practice {#beginner-practice}",
      "",
      "#### English → Egabon {#beginner-english-to-egabon}",
      "",
      "**1.** *Uzazon walks.* (alone)",
      "",
      "::: details Show answer",
      "`zuzazon voworel.`",
      "",
      "z-Uzazon | v-walk",
      ":::",
      "",
      "#### Egabon → English {#beginner-egabon-to-english}",
      "",
      "**1.** `zuzazon voworel.`",
      "",
      "::: details Show answer",
      "z-Uzazon | v-walk",
      "",
      "*Uzazon walks.* (alone)",
      ":::",
      "",
      "#### Fix it {#beginner-fix-it}",
      "",
      "**1.** *Uzazon walks.* <!-- lint: error -->`voworel zuzazon.`",
      "",
      "::: details Show answer",
      "`zuzazon voworel.`",
      ":::",
    ].join("\n");
    const lines = extractFreeEnglish(md).map(({ kind, egabon, morph, text }) => ({ kind, egabon, morph, text }));
    assert.deepEqual(lines, [
      { kind: "en-ag", egabon: "zuzazon voworel.", morph: "z-Uzazon | v-walk", text: "*Uzazon walks.* (alone)" },
      { kind: "ag-en", egabon: "zuzazon voworel.", morph: "z-Uzazon | v-walk", text: "*Uzazon walks.* (alone)" },
      { kind: "fix", egabon: "zuzazon voworel.", morph: null, text: "*Uzazon walks.*" },
    ]);
  });
});

describe("lintFreeEnglish", () => {
  const kinds = (md: string) => lintFreeEnglish(md, tables).map((f) => f.kind);

  it("allows parentheses inside the quotes only for an aside span", () => {
    assert.deepEqual(kinds('> `zuzazon voworel.`\n>\n> "Uzazon walks (quietly)."'), ["inside-parens"]);
    assert.deepEqual(kinds('> `zuzazon voworel th(hogawol).`\n>\n> "Uzazon walks (quietly)."'), []);
    assert.deepEqual(kinds('> `zuzazon voworel th(hogawol).`\n>\n> "Uzazon walks, quietly."'), []);
  });

  it("flags the shape and the note", () => {
    assert.deepEqual(kinds('> `zuzazon voworel.`\n>\n> "Uzazon walks." You name yourself.'), ["shape"]);
    assert.deepEqual(kinds('> `zuzazon voworel.`\n>\n> "Uzazon walks." (a mirative)'), ["note-term"]);
    assert.deepEqual(kinds('> `zuzazon voworel.`\n>\n> "Uzazon walks." (alone)'), []);
  });
});

describe("tableEnglish", () => {
  const sheet = (rows: string[], header = "| Job | Example | English | Stage |") =>
    [header, "|-----|---------|---------|-------|", ...rows].join("\n");

  it("reads italic English cells beside an Egabon phrase or sentence", () => {
    const md = sheet(["| Walk | `zuzazon voworel.` | *Uzazon walks.* (alone) | B |", "| Kin | `grebuwol` | the layer above the focus | A |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ egabon, text }) => ({ egabon, text })),
      [{ egabon: "zuzazon voworel.", text: "*Uzazon walks.* (alone)" }],
    );
    assert.deepEqual(tableEnglish(sheet(["| `hadem` | here | *here*, *this* | B |"], "| Egabon | Use | English | Stage |")), []);
    assert.deepEqual(tableEnglish(sheet(["| Join | `A xol B` | *(A or B)* | B |"])), []);
    assert.deepEqual(tableEnglish("| English | Egabon |\n|---|---|\n| *walks, strolls* | `zuzazon voworel.` |"), []);
  });

  it("splits pieces and pairs them with the Example pieces", () => {
    const md = sheet(["| Acts | `yel voworel.` · `yul voworel.` | *Walk!* · *Don't walk.* (a ban) | B |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ egabon, text }) => ({ egabon, text })),
      [
        { egabon: "yel voworel.", text: "*Walk!*" },
        { egabon: "yul voworel.", text: "*Don't walk.* (a ban)" },
      ],
    );
  });

  it("skips generated blocks", () => {
    const md = ["<!-- generated: overlays kind=x -->", sheet(["| A | `zuzazon voworel.` | *Uzazon walks (alone).* | B |"]), "<!-- /generated -->"].join("\n");
    assert.deepEqual(tableEnglish(md), []);
  });
});

describe("lintTableEnglish", () => {
  const kinds = (cell: string) =>
    lintTableEnglish(["| Job | Example | English |", "|---|---|---|", `| Walk | \`zuzazon voworel.\` | ${cell} |`].join("\n"), tables).map(
      (f) => f.kind,
    );

  it("flags the shape and parentheses inside the sentence, not the note", () => {
    assert.deepEqual(kinds("*Uzazon walks* (alone)."), ["shape"]);
    assert.deepEqual(kinds("*Uzazon walks (alone).*"), ["inside-parens"]);
    assert.deepEqual(kinds("*Uzazon walks.* (a mirative)"), []);
    assert.deepEqual(kinds("*Uzazon walks.* (alone; quietly)"), []);
  });
});
