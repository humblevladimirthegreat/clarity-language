import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLOSED } from "../closed-roots.js";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish, parseEnglishByPos } from "../lexicon-search.js";

import {
  extractTranslationExercises,
  formatMorphGlossFinding,
  lintMorphGlossMarkdown,
} from "./morph-gloss-docs.js";

function tablesOf(): ClassifyTables {
  return createClassifyTablesFromRows(
    [
      { emoji: "", concrete: "swan", abstract: "grace", root: CLOSED.swan, mnemonic: "", englishByPos: "", posEnglish: emptyPosEnglish() },
      { emoji: "", concrete: "chair", abstract: "", root: "ayu", mnemonic: "", englishByPos: "v:sit", posEnglish: parseEnglishByPos("v:sit", { concrete: "chair" }) },
    ],
    [],
  );
}

const PRACTICE = `### Translation practice

#### English → Agebon

**1.** *Uzozen sits.*

::: details Show answer
\`zuzozen vayul.\`

z-Uzozen | v-sit

:::

#### Agebon → English

**1.** \`zuzozen vayul.\`

::: details Show answer
z-Uzozen | v-sit

*Uzozen sits.*
:::
`;

describe("extractTranslationExercises", () => {
  it("pairs spoiler and prompt Agebon with visible morph glosses", () => {
    const items = extractTranslationExercises(PRACTICE);
    assert.equal(items.length, 2);
    assert.equal(items[0]!.agebon, "zuzozen vayul.");
    assert.equal(items[0]!.morph, "z-Uzozen | v-sit");
    assert.equal(items[1]!.agebon, "zuzozen vayul.");
    assert.equal(items[0]!.loose, "Uzozen sits.");
    assert.equal(items[1]!.loose, "Uzozen sits.");
  });

  it("reads items under a converted Practice heading", () => {
    const items = extractTranslationExercises(PRACTICE.replace("### Translation practice", "### Practice"));
    assert.equal(items.length, 2);
    assert.equal(items[0]!.morph, "z-Uzozen | v-sit");
  });

  it("pairs decision items by type in a converted checkpoint", async () => {
    const { PRACTICE: CONVERTED } = await import("./practice-fixtures.js");
    const items = extractTranslationExercises(CONVERTED);
    const pairs = items.map((item) => [item.agebon, item.morph]);
    // Pick one and Fix it: the answer form and its morph, never the prompt forms.
    assert.deepEqual(pairs[6], ["zuzozen dolazun vawebol.", "z-Uzozen | d-Olazun | v-see"]);
    assert.deepEqual(pairs[7], ["zolazun duzozen vawebol.", "z-Olazun | d-Uzozen | v-see"]);
    // What changes: each sentence with its own morph line.
    assert.deepEqual(pairs.slice(8), [
      ["zuzozen vuhohol.", "z-Uzozen | v-sit"],
      ["zolazun vuhohol.", "z-Olazun | v-sit"],
    ]);
    assert.equal(items.length, 10);
  });

  it("compares converted decision items to the parser", async () => {
    const { houseTables, PRACTICE: CONVERTED } = await import("./practice-fixtures.js");
    assert.deepEqual(lintMorphGlossMarkdown(CONVERTED, houseTables()).findings, []);
    const wrong = CONVERTED.replace("z-Uzozen | v-sit\n\nz-Olazun | v-sit", "z-Uzozen | v-sit\n\nz-Olazun | v-walk");
    assert.equal(lintMorphGlossMarkdown(wrong, houseTables()).findings[0]?.kind, "mismatch");
  });

  it("records missing morph when a numbered item has no morph gloss", () => {
    const md = `### Translation practice

**1.** *Uzozen sits.*

::: details Show answer
\`zuzozen vayul.\`
:::
`;
    const items = extractTranslationExercises(md);
    assert.equal(items.length, 1);
    assert.equal(items[0]!.morph, null);
  });

  it("pairs a spoken → written prompt's answer, not the spoken row", () => {
    const md = `### Translation practice

**1.** 🔊 \`gradamal\`

::: details Show answer
\`g+20\`

g-20
:::
`;
    const items = extractTranslationExercises(md);
    assert.equal(items[0]!.agebon, "g+20");
    assert.equal(items[0]!.morph, "g-20");
  });

  it("skips a decision answer's spoken row when it pairs the morph line", () => {
    const md = `### Practice {#beginner-practice}

#### Pick one {#beginner-pick-one}

**1.** *Twenty.* \`g+20\` or \`g+30\`

::: details Show answer
\`g+20\`

🔊 \`gradamal\`

g-20

Twenty is two tens.
:::
`;
    const items = extractTranslationExercises(md);
    assert.equal(items[0]!.agebon, "g+20");
    assert.equal(items[0]!.morph, "g-20");
  });
});

describe("lintMorphGlossMarkdown", () => {
  const tables = tablesOf();

  it("requires a morph gloss on every exercise in translation practice", () => {
    const md = `### Translation practice

**1.** *Uzozen sits.*

::: details Show answer
\`zuzozen vayul.\`

z-Uzozen | v-sit

:::

**2.** *Uzozen sits.*

::: details Show answer
\`zuzozen vayul.\`
:::
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    assert.equal(findings.some((f) => f.kind === "missing-gloss"), true);
  });

  it("does not require exercise glosses outside translation practice", () => {
    const md = `> \`zuzozen vayul.\`
>
> z-Uzozen | v-sit
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    assert.equal(findings.some((f) => f.kind === "missing-gloss"), false);
  });

  it("allows omitted teach morph when parser output matches loose English", () => {
    const md = `> \`uzozel\`
>
> "swan"
`;
    const result = lintMorphGlossMarkdown(md, tables);
    assert.equal(result.withLooseEnglish, 1);
    assert.equal(result.redundantOmitted, 1);
    assert.equal(result.comparedWithLoose, 0);
    assert.equal(result.findings.some((f) => f.kind === "missing-gloss"), false);
  });

  it("requires teach morph when loose English is a full sentence", () => {
    const md = `> \`zuzozen vayul.\`
>
> "Uzozen sits."
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    assert.equal(
      findings.some((f) => f.kind === "missing-gloss" && f.scope === "teach"),
      true,
    );
  });

  it("fails teach-block mismatches", () => {
    const md = `> \`zuzozen vayul.\`
>
> z-Uzozen | v-walk
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    const mismatch = findings.find((f) => f.kind === "mismatch");
    assert.ok(mismatch && mismatch.kind === "mismatch");
    assert.match(mismatch.parser, /v-sit|v-chair/);
  });

  it("reports a sentence that does not parse instead of comparing word by word", () => {
    const text = "> `zuzozen vul vayul.`\n>\n> z-Uzozen | v-not | v-sit\n";
    const { findings } = lintMorphGlossMarkdown(text, tables);
    assert.equal(findings[0]?.kind, "parse-error");
    assert.match(formatMorphGlossFinding("x.md", findings[0]!), /sentence does not parse/);
  });

  it("reports checked pair count", () => {
    const md = `> \`zuzozen vayul.\`
>
> z-Uzozen | v-sit
`;
    const { checked } = lintMorphGlossMarkdown(md, tables);
    assert.equal(checked, 1);
  });

  it("formats findings as a stdout block", () => {
    const text = formatMorphGlossFinding("docs/grammar/clause.md", {
      kind: "mismatch",
      line: 10,
      agebon: "zuzozen vayul.",
      documented: "z-Uzozen | v-walk",
      parser: "z-Uzozen | v-sit",
    });
    assert.match(text, /docs\/grammar\/clause.md:10  morph gloss mismatch/);
    assert.match(text, /documented: z-Uzozen \| v-walk/);
  });
});
