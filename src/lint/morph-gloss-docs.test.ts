import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
      { emoji: "", literal: "swan", metaphorical: "grace", clarity: "azawa", mnemonic: "", englishByPos: "", posEnglish: emptyPosEnglish() },
      { emoji: "", literal: "chair", metaphorical: "", clarity: "aju", mnemonic: "", englishByPos: "v:sit", posEnglish: parseEnglishByPos("v:sit", { literal: "chair" }) },
    ],
    [],
  );
}

const PRACTICE = `### Translation practice

#### English → Agalan

**1.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`

z-Azawan | v-sit

:::

#### Agalan → English

**1.** \`zazawan vajul.\`

::: details Show answer
z-Azawan | v-sit

*Azawan sits.*
:::
`;

describe("extractTranslationExercises", () => {
  it("pairs spoiler and prompt Agalan with visible morph glosses", () => {
    const items = extractTranslationExercises(PRACTICE);
    assert.equal(items.length, 2);
    assert.equal(items[0]!.agalan, "zazawan vajul.");
    assert.equal(items[0]!.morph, "z-Azawan | v-sit");
    assert.equal(items[1]!.agalan, "zazawan vajul.");
    assert.equal(items[0]!.loose, "Azawan sits.");
    assert.equal(items[1]!.loose, "Azawan sits.");
  });

  it("records missing morph when a numbered item has no morph gloss", () => {
    const md = `### Translation practice

**1.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`
:::
`;
    const items = extractTranslationExercises(md);
    assert.equal(items.length, 1);
    assert.equal(items[0]!.morph, null);
  });
});

describe("lintMorphGlossMarkdown", () => {
  const tables = tablesOf();

  it("requires a morph gloss on every exercise in translation practice", () => {
    const md = `### Translation practice

**1.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`

z-Azawan | v-sit

:::

**2.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`
:::
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    assert.equal(findings.some((f) => f.kind === "missing-gloss"), true);
  });

  it("does not require exercise glosses outside translation practice", () => {
    const md = `> \`zazawan vajul.\`
>
> z-Azawan | v-sit
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    assert.equal(findings.some((f) => f.kind === "missing-gloss"), false);
  });

  it("allows omitted teach morph when parser output matches loose English", () => {
    const md = `> \`azawal\`
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
    const md = `> \`zazawan vajul.\`
>
> "Azawan sits."
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    assert.equal(
      findings.some((f) => f.kind === "missing-gloss" && f.scope === "teach"),
      true,
    );
  });

  it("fails teach-block mismatches", () => {
    const md = `> \`zazawan vajul.\`
>
> z-Azawan | v-walk
`;
    const { findings } = lintMorphGlossMarkdown(md, tables);
    const mismatch = findings.find((f) => f.kind === "mismatch");
    assert.ok(mismatch && mismatch.kind === "mismatch");
    assert.match(mismatch.parser, /v-sit|v-chair/);
  });

  it("reports checked pair count", () => {
    const md = `> \`zazawan vajul.\`
>
> z-Azawan | v-sit
`;
    const { checked } = lintMorphGlossMarkdown(md, tables);
    assert.equal(checked, 1);
  });

  it("formats findings as a stdout block", () => {
    const text = formatMorphGlossFinding("docs/grammar/core.md", {
      kind: "mismatch",
      line: 10,
      agalan: "zazawan vajul.",
      documented: "z-Azawan | v-walk",
      parser: "z-Azawan | v-sit",
    });
    assert.match(text, /docs\/grammar\/core.md:10  morph gloss mismatch/);
    assert.match(text, /documented: z-Azawan \| v-walk/);
  });
});
