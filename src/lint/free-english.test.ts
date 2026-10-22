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
    assert.deepEqual(splitFreeEnglish('"Uzozen walks."'), one("Uzozen walks."));
    assert.deepEqual(splitFreeEnglish('"tea or coffee." (pick one)'), one("tea or coffee.", "pick one"));
    assert.deepEqual(splitFreeEnglish('"A." (whose (left))'), one("A.", "whose (left)"));
    assert.deepEqual(splitFreeEnglish("*3 to 5* (`[3, 5)`)", "*"), one("3 to 5", "`[3, 5)`"));
  });

  it("splits italics in a checkpoint", () => {
    assert.deepEqual(splitFreeEnglish("*Ahelan sees that Olazun sneaks.*", "*"), one("Ahelan sees that Olazun sneaks."));
    assert.deepEqual(splitFreeEnglish("*Uzozen sits.* (no one is to blame)", "*"), one("Uzozen sits.", "no one is to blame"));
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
    assert.equal(splitFreeEnglish("*Didn’t Uzozen tell?* *True, Uzozen didn’t.*", "*")?.join, "turns");
  });

  it("rejects every other shape", () => {
    assert.equal(splitFreeEnglish('"A." / "B." "C."'), null);
    assert.equal(splitFreeEnglish('"A." (one) (two)'), null);
    assert.equal(splitFreeEnglish('"A." (one).'), null);
    assert.equal(splitFreeEnglish('"A." You name yourself.'), null);
    assert.equal(splitFreeEnglish('"A." (one) "B."'), null);
    assert.equal(splitFreeEnglish("*Uzozen sits* (no one is to blame).", "*"), null);
    assert.equal(splitFreeEnglish("*Didn’t Uzozen tell?* Then confirm: *true, Uzozen didn’t.*", "*"), null);
    assert.equal(splitFreeEnglish("A."), null);
  });
});

describe("parenGroups", () => {
  it("counts top-level groups only", () => {
    assert.equal(parenGroups("Uzozen walks."), 0);
    assert.equal(parenGroups("Uzozen (A) and Olazun (E) harvest."), 2);
    assert.equal(parenGroups("Uzozen walks (quietly (very))."), 1);
  });
});

describe("extraParens", () => {
  it("allows one group per aside or scope island", () => {
    assert.equal(extraParens("Uzozen walks (quietly).", "z-Uzozen | v-walk | ASIDE[th-quiet]"), 0);
    assert.equal(extraParens("Uzozen and (just water).", "[z-Uzozen | SCOPE[z-water | z-and] | z-and.open]"), 0);
    assert.equal(extraParens("Uzozen walks (as mechanism).", "z-Uzozen | v-walk"), 1);
  });

  it("allows a letter group only for a tag the gloss sets", () => {
    const gloss = "[[z-dog | z-tag.A] | [z-cat | z-tag.E] | z-and.open] | v-walk . z-←tag.A+E | v-run";
    assert.equal(extraParens("A dog (A) and a cat (E) walk. A and E run.", gloss), 0);
    assert.equal(extraParens("A dog (A) walks (quietly).", gloss), 1);
    assert.equal(extraParens("Uzozen (A) punches.", "z-Uzozen | d-←tag.A | v-punch"), 1);
  });
});

describe("noteFindings", () => {
  const kinds = (note: string) => noteFindings(note, labels).map((f) => f.kind);

  it("allows plain English", () => {
    for (const note of ["pick one", "the surprise is Uzozen's", "an open list", "a cause, and no one is blamed", "Uzozen's left", "he/she/they"]) {
      assert.deepEqual(kinds(note), [], note);
    }
  });

  it("flags forms, labels, and grammar terms", () => {
    assert.deepEqual(kinds("`zwazar` would be Olazun"), ["note-form"]);
    assert.deepEqual(kinds("/w/ does not retarget it"), ["note-form"]);
    assert.deepEqual(kinds("PATTERN is the baseline"), ["note-label"]);
    assert.deepEqual(kinds("mirative with an Uzozen holder"), ["note-term", "note-term"]);
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
      "> `zuzozen vowurel.`",
      ">",
      '> "Uzozen walks." (alone)',
      "",
      "> `zuzozen vuduyel.`",
      "> `zwazuduyer vezuvol.`",
      ">",
      "> z-Uzozen | v-teach . z-←episode-agent-teach | v-sleep",
      ">",
      '> "Uzozen teaches. The one teaching sleeps."',
      "",
      '> "English only."',
    ].join("\n");
    const lines = extractFreeEnglish(md);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0], {
      kind: "example",
      agebon: "zuzozen vowurel.",
      morph: null,
      text: '"Uzozen walks." (alone)',
      index: md.indexOf('"Uzozen walks."'),
      delimiter: '"',
      split: { sentence: "Uzozen walks.", note: "alone", parts: ["Uzozen walks."], join: "one" },
    });
    assert.equal(lines[1]!.agebon, "zuzozen vuduyel. zwazuduyer vezuvol.");
    assert.equal(lines[1]!.morph, "z-Uzozen | v-teach . z-←episode-agent-teach | v-sleep");
  });

  it("reads checkpoint prompts and answers", () => {
    const md = [
      "### Practice {#beginner-practice}",
      "",
      "#### English → Agebon {#beginner-english-to-agebon}",
      "",
      "**1.** *Uzozen walks.* (alone)",
      "",
      "::: details Show answer",
      "`zuzozen vowurel.`",
      "",
      "z-Uzozen | v-walk",
      ":::",
      "",
      "#### Agebon → English {#beginner-agebon-to-english}",
      "",
      "**1.** `zuzozen vowurel.`",
      "",
      "::: details Show answer",
      "z-Uzozen | v-walk",
      "",
      "*Uzozen walks.* (alone)",
      ":::",
      "",
      "#### Fix it {#beginner-fix-it}",
      "",
      "**1.** *Uzozen walks.* <!-- lint: error -->`vowurel zuzozen.`",
      "",
      "::: details Show answer",
      "`zuzozen vowurel.`",
      ":::",
    ].join("\n");
    const lines = extractFreeEnglish(md).map(({ kind, agebon, morph, text }) => ({ kind, agebon, morph, text }));
    assert.deepEqual(lines, [
      { kind: "en-ag", agebon: "zuzozen vowurel.", morph: "z-Uzozen | v-walk", text: "*Uzozen walks.* (alone)" },
      { kind: "ag-en", agebon: "zuzozen vowurel.", morph: "z-Uzozen | v-walk", text: "*Uzozen walks.* (alone)" },
      { kind: "fix", agebon: "zuzozen vowurel.", morph: null, text: "*Uzozen walks.*" },
    ]);
  });
});

describe("lintFreeEnglish", () => {
  const kinds = (md: string) => lintFreeEnglish(md, tables).map((f) => f.kind);

  it("allows parentheses inside the quotes only for an aside span", () => {
    assert.deepEqual(kinds('> `zuzozen vowurel.`\n>\n> "Uzozen walks (quietly)."'), ["inside-parens"]);
    assert.deepEqual(kinds('> `zuzozen vowurel th(hogowul).`\n>\n> "Uzozen walks (quietly)."'), []);
    assert.deepEqual(kinds('> `zuzozen vowurel th(hogowul).`\n>\n> "Uzozen walks, quietly."'), []);
  });

  it("flags the shape and the note", () => {
    assert.deepEqual(kinds('> `zuzozen vowurel.`\n>\n> "Uzozen walks." You name yourself.'), ["shape"]);
    assert.deepEqual(kinds('> `zuzozen vowurel.`\n>\n> "Uzozen walks." (a mirative)'), ["note-term"]);
    assert.deepEqual(kinds('> `zuzozen vowurel.`\n>\n> "Uzozen walks." (alone)'), []);
  });
});

describe("tableEnglish", () => {
  const sheet = (rows: string[], header = "| Job | Example | English | Stage |") =>
    [header, "|-----|---------|---------|-------|", ...rows].join("\n");

  it("reads italic English cells beside an Agebon phrase or sentence", () => {
    const md = sheet(["| Walk | `zuzozen vowurel.` | *Uzozen walks.* (alone) | B |", "| Kin | `grewubal` | the layer above the focus | A |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ agebon, text }) => ({ agebon, text })),
      [{ agebon: "zuzozen vowurel.", text: "*Uzozen walks.* (alone)" }],
    );
    assert.deepEqual(tableEnglish(sheet(["| `hanom` | here | *here*, *this* | B |"], "| Agebon | Use | English | Stage |")), []);
    assert.deepEqual(tableEnglish(sheet(["| Join | `A xol B` | *(A or B)* | B |"])), []);
    assert.deepEqual(tableEnglish("| English | Agebon |\n|---|---|\n| *walks, strolls* | `zuzozen vowurel.` |"), []);
  });

  it("splits pieces and pairs them with the Example pieces", () => {
    const md = sheet(["| Acts | `yel vowurel.` · `yul vowurel.` | *Walk!* · *Don't walk.* (a ban) | B |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ agebon, text }) => ({ agebon, text })),
      [
        { agebon: "yel vowurel.", text: "*Walk!*" },
        { agebon: "yul vowurel.", text: "*Don't walk.* (a ban)" },
      ],
    );
  });

  it("skips generated blocks", () => {
    const md = ["<!-- generated: overlays kind=x -->", sheet(["| A | `zuzozen vowurel.` | *Uzozen walks (alone).* | B |"]), "<!-- /generated -->"].join("\n");
    assert.deepEqual(tableEnglish(md), []);
  });
});

describe("lintTableEnglish", () => {
  const kinds = (cell: string) =>
    lintTableEnglish(["| Job | Example | English |", "|---|---|---|", `| Walk | \`zuzozen vowurel.\` | ${cell} |`].join("\n"), tables).map(
      (f) => f.kind,
    );

  it("flags the shape and parentheses inside the sentence, not the note", () => {
    assert.deepEqual(kinds("*Uzozen walks* (alone)."), ["shape"]);
    assert.deepEqual(kinds("*Uzozen walks (alone).*"), ["inside-parens"]);
    assert.deepEqual(kinds("*Uzozen walks.* (a mirative)"), []);
    assert.deepEqual(kinds("*Uzozen walks.* (alone; quietly)"), []);
  });
});
