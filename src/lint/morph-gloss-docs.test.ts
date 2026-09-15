import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";

import {
  extractTranslationExercises,
  formatMorphGlossFinding,
  lintMorphGlossMarkdown,
} from "./morph-gloss-docs.js";

function tablesOf(): ClassifyTables {
  return createClassifyTablesFromRows(
    [
      { emoji: "", literal: "swan", metaphorical: "grace", clarity: "azawa", mnemonic: "" },
      { emoji: "", literal: "chair", metaphorical: "", clarity: "aju", mnemonic: "" },
    ],
    [],
  );
}

const PRACTICE = `### Translation practice

#### English → Agalan

**1.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`
<!-- gloss: z-Azawan | v-sit -->
:::

#### Agalan → English

**1.** \`zazawan vajul.\`
<!-- gloss: z-Azawan | v-sit -->

::: details Show answer
*Azawan sits.*
:::
`;

describe("extractTranslationExercises", () => {
  it("pairs spoiler and prompt Agalan with gloss comments", () => {
    const items = extractTranslationExercises(PRACTICE);
    assert.equal(items.length, 2);
    assert.equal(items[0]!.agalan, "zazawan vajul.");
    assert.equal(items[0]!.morph, "z-Azawan | v-sit");
    assert.equal(items[1]!.agalan, "zazawan vajul.");
  });

  it("records missing morph when a numbered item has no gloss comment", () => {
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

  it("requires a gloss on every exercise once the file uses gloss comments", () => {
    const md = `### Translation practice

**1.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`
<!-- gloss: z-Azawan | v-sit -->
:::

**2.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`
:::
`;
    const findings = lintMorphGlossMarkdown(md, tables);
    assert.equal(findings.some((f) => f.kind === "missing-gloss"), true);
  });

  it("does not require exercise glosses when the file has none", () => {
    const md = `### Translation practice

**1.** *Azawan sits.*

::: details Show answer
\`zazawan vajul.\`
:::
`;
    const findings = lintMorphGlossMarkdown(md, tables);
    assert.equal(findings.some((f) => f.kind === "missing-gloss"), false);
  });

  it("fails teach-block mismatches", () => {
    const md = `> \`zazawan vajul.\`
>
> z-Azawan | v-walk
`;
    const findings = lintMorphGlossMarkdown(md, tables);
    const mismatch = findings.find((f) => f.kind === "mismatch");
    assert.ok(mismatch && mismatch.kind === "mismatch");
    assert.match(mismatch.parser, /v-sit|v-chair/);
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
