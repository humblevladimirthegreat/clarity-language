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
    assert.deepEqual(splitFreeEnglish('"Azozon walks."'), one("Azozon walks."));
    assert.deepEqual(splitFreeEnglish('"tea or coffee." (pick one)'), one("tea or coffee.", "pick one"));
    assert.deepEqual(splitFreeEnglish('"A." (whose (left))'), one("A.", "whose (left)"));
    assert.deepEqual(splitFreeEnglish("*3 to 5* (`[3, 5)`)", "*"), one("3 to 5", "`[3, 5)`"));
  });

  it("splits italics in a checkpoint", () => {
    assert.deepEqual(splitFreeEnglish("*Ahelan sees that Alazun sneaks.*", "*"), one("Ahelan sees that Alazun sneaks."));
    assert.deepEqual(splitFreeEnglish("*Azozon sits.* (no one is to blame)", "*"), one("Azozon sits.", "no one is to blame"));
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
    assert.equal(splitFreeEnglish("*Didn’t Azozon tell?* *True, Azozon didn’t.*", "*")?.join, "turns");
  });

  it("rejects every other shape", () => {
    assert.equal(splitFreeEnglish('"A." / "B." "C."'), null);
    assert.equal(splitFreeEnglish('"A." (one) (two)'), null);
    assert.equal(splitFreeEnglish('"A." (one).'), null);
    assert.equal(splitFreeEnglish('"A." You name yourself.'), null);
    assert.equal(splitFreeEnglish('"A." (one) "B."'), null);
    assert.equal(splitFreeEnglish("*Azozon sits* (no one is to blame).", "*"), null);
    assert.equal(splitFreeEnglish("*Didn’t Azozon tell?* Then confirm: *true, Azozon didn’t.*", "*"), null);
    assert.equal(splitFreeEnglish("A."), null);
  });
});

describe("parenGroups", () => {
  it("counts top-level groups only", () => {
    assert.equal(parenGroups("Azozon walks."), 0);
    assert.equal(parenGroups("Azozon (A) and Alazun (O) harvest."), 2);
    assert.equal(parenGroups("Azozon walks (quietly (very))."), 1);
  });
});

describe("extraParens", () => {
  it("allows one group per aside or scope island", () => {
    assert.equal(extraParens("Azozon walks (quietly).", "z-Azozon | v-walk | ASIDE[th-quiet]"), 0);
    assert.equal(extraParens("Azozon and (just water).", "[z-Azozon | SCOPE[z-water | z-and] | z-and.open]"), 0);
    assert.equal(extraParens("Azozon walks (as mechanism).", "z-Azozon | v-walk"), 1);
  });

  it("allows a letter group only for a tag the gloss sets", () => {
    const gloss = "[[z-dog | z-tag.A] | [z-cat | z-tag.O] | z-and.open] | v-walk . z-←tag.A+O | v-run";
    assert.equal(extraParens("A dog (A) and a cat (O) walk. A and O run.", gloss), 0);
    assert.equal(extraParens("A dog (A) walks (quietly).", gloss), 1);
    assert.equal(extraParens("Azozon (A) punches.", "z-Azozon | d-←tag.A | v-punch"), 1);
  });
});

describe("noteFindings", () => {
  const kinds = (note: string) => noteFindings(note, labels).map((f) => f.kind);

  it("allows plain English", () => {
    for (const note of ["pick one", "the surprise is Azozon's", "an open list", "a cause, and no one is blamed", "Azozon's left", "he/she/they"]) {
      assert.deepEqual(kinds(note), [], note);
    }
  });

  it("flags forms, labels, and grammar terms", () => {
    assert.deepEqual(kinds("`zwuzer` would be Alazun"), ["note-form"]);
    assert.deepEqual(kinds("/w/ does not retarget it"), ["note-form"]);
    assert.deepEqual(kinds("PATTERN is the baseline"), ["note-label"]);
    assert.deepEqual(kinds("mirative with an Azozon holder"), ["note-term", "note-term"]);
    assert.deepEqual(kinds("say [how you know it](holder.md#holder)"), []);
    assert.deepEqual(kinds("takes a [holder](holder.md#holder)"), ["note-term"]);
  });

  it("reports the longest matching term", () => {
    const details = noteFindings("loan verb", labels).map((f) => f.detail);
    assert.deepEqual(details, ['the note uses the grammar term "loan verb"']);
  });
});

describe("extractFreeEnglish", () => {
  it("reads example blocks with or without a morph line", () => {
    const md = [
      "> `zazozon vowurol.`",
      ">",
      '> "Azozon walks." (alone)',
      "",
      "> `zazozon veduyol.`",
      "> `zwuzeduyor vezuvel.`",
      ">",
      "> z-Azozon | v-teach . z-←episode-agent-teach | v-sleep",
      ">",
      '> "Azozon teaches. The one teaching sleeps."',
      "",
      '> "English only."',
    ].join("\n");
    const lines = extractFreeEnglish(md);
    assert.equal(lines.length, 2);
    assert.deepEqual(lines[0], {
      kind: "example",
      ageben: "zazozon vowurol.",
      morph: null,
      text: '"Azozon walks." (alone)',
      index: md.indexOf('"Azozon walks."'),
      delimiter: '"',
      split: { sentence: "Azozon walks.", note: "alone", parts: ["Azozon walks."], join: "one" },
    });
    assert.equal(lines[1]!.ageben, "zazozon veduyol. zwuzeduyor vezuvel.");
    assert.equal(lines[1]!.morph, "z-Azozon | v-teach . z-←episode-agent-teach | v-sleep");
  });

  it("reads checkpoint prompts and answers", () => {
    const md = [
      "### Practice {#beginner-practice}",
      "",
      "#### English → Ageben {#beginner-english-to-ageben}",
      "",
      "**1.** *Azozon walks.* (alone)",
      "",
      "::: details Show answer",
      "`zazozon vowurol.`",
      "",
      "z-Azozon | v-walk",
      ":::",
      "",
      "#### Ageben → English {#beginner-ageben-to-english}",
      "",
      "**1.** `zazozon vowurol.`",
      "",
      "::: details Show answer",
      "z-Azozon | v-walk",
      "",
      "*Azozon walks.* (alone)",
      ":::",
      "",
      "#### Fix it {#beginner-fix-it}",
      "",
      "**1.** *Azozon walks.* <!-- lint: error -->`vowurol zazozon.`",
      "",
      "::: details Show answer",
      "`zazozon vowurol.`",
      ":::",
    ].join("\n");
    const lines = extractFreeEnglish(md).map(({ kind, ageben, morph, text }) => ({ kind, ageben, morph, text }));
    assert.deepEqual(lines, [
      { kind: "en-ag", ageben: "zazozon vowurol.", morph: "z-Azozon | v-walk", text: "*Azozon walks.* (alone)" },
      { kind: "ag-en", ageben: "zazozon vowurol.", morph: "z-Azozon | v-walk", text: "*Azozon walks.* (alone)" },
      { kind: "fix", ageben: "zazozon vowurol.", morph: null, text: "*Azozon walks.*" },
    ]);
  });
});

describe("lintFreeEnglish", () => {
  const kinds = (md: string) => lintFreeEnglish(md, tables).map((f) => f.kind);

  it("allows parentheses inside the quotes only for an aside span", () => {
    assert.deepEqual(kinds('> `zazozon vowurol.`\n>\n> "Azozon walks (quietly)."'), ["inside-parens"]);
    assert.deepEqual(kinds('> `zazozon vowurol th(hugowul).`\n>\n> "Azozon walks (quietly)."'), []);
    assert.deepEqual(kinds('> `zazozon vowurol th(hugowul).`\n>\n> "Azozon walks, quietly."'), []);
  });

  it("flags the shape and the note", () => {
    assert.deepEqual(kinds('> `zazozon vowurol.`\n>\n> "Azozon walks." You name yourself.'), ["shape"]);
    assert.deepEqual(kinds('> `zazozon vowurol.`\n>\n> "Azozon walks." (a mirative)'), ["note-term"]);
    assert.deepEqual(kinds('> `zazozon vowurol.`\n>\n> "Azozon walks." (alone)'), []);
  });
});

describe("tableEnglish", () => {
  const sheet = (rows: string[], header = "| Job | Example | English | Stage |") =>
    [header, "|-----|---------|---------|-------|", ...rows].join("\n");

  it("reads italic English cells beside an Ageben phrase or sentence", () => {
    const md = sheet(["| Walk | `zazozon vowurol.` | *Azozon walks.* (alone) | B |", "| Kin | `growubal` | the layer above the focus | A |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ ageben, text }) => ({ ageben, text })),
      [{ ageben: "zazozon vowurol.", text: "*Azozon walks.* (alone)" }],
    );
    assert.deepEqual(tableEnglish(sheet(["| `hanem` | here | *here*, *this* | B |"], "| Ageben | Use | English | Stage |")), []);
    assert.deepEqual(tableEnglish(sheet(["| Join | `A xol B` | *(A or B)* | B |"])), []);
    assert.deepEqual(tableEnglish("| English | Ageben |\n|---|---|\n| *walks, strolls* | `zazozon vowurol.` |"), []);
  });

  it("splits pieces and pairs them with the Example pieces", () => {
    const md = sheet(["| Acts | `yol vowurol.` · `yul vowurol.` | *Walk!* · *Don't walk.* (a ban) | B |"]);
    assert.deepEqual(
      tableEnglish(md).map(({ ageben, text }) => ({ ageben, text })),
      [
        { ageben: "yol vowurol.", text: "*Walk!*" },
        { ageben: "yul vowurol.", text: "*Don't walk.* (a ban)" },
      ],
    );
  });

  it("skips generated blocks", () => {
    const md = ["<!-- generated: overlays kind=x -->", sheet(["| A | `zazozon vowurol.` | *Azozon walks (alone).* | B |"]), "<!-- /generated -->"].join("\n");
    assert.deepEqual(tableEnglish(md), []);
  });
});

describe("lintTableEnglish", () => {
  const kinds = (cell: string) =>
    lintTableEnglish(["| Job | Example | English |", "|---|---|---|", `| Walk | \`zazozon vowurol.\` | ${cell} |`].join("\n"), tables).map(
      (f) => f.kind,
    );

  it("flags the shape and parentheses inside the sentence, not the note", () => {
    assert.deepEqual(kinds("*Azozon walks* (alone)."), ["shape"]);
    assert.deepEqual(kinds("*Azozon walks (alone).*"), ["inside-parens"]);
    assert.deepEqual(kinds("*Azozon walks.* (a mirative)"), []);
    assert.deepEqual(kinds("*Azozon walks.* (alone; quietly)"), []);
  });
});
