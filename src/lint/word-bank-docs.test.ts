import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish, parseEnglishByPos } from "../lexicon-search.js";

import { lintWordBankMarkdown } from "./word-bank-docs.js";

function tablesOf(): ClassifyTables {
  return createClassifyTablesFromRows(
    [
      {
        emoji: "",
        literal: "swan",
        metaphorical: "grace",
        clarity: "azawa",
        mnemonic: "",
        englishByPos: "",
        posEnglish: emptyPosEnglish(),
      },
      {
        emoji: "",
        literal: "eye",
        metaphorical: "",
        clarity: "eje",
        mnemonic: "",
        englishByPos: "v:see",
        posEnglish: parseEnglishByPos("v:see", { literal: "eye" }),
      },
      {
        emoji: "",
        literal: "chair",
        metaphorical: "",
        clarity: "aju",
        mnemonic: "",
        englishByPos: "v:sit",
        posEnglish: parseEnglishByPos("v:sit", { literal: "chair" }),
      },
    ],
    [],
  );
}

const BANK = `### Translation practice

**Roots used here:**

| English | Agalan | Same root as |
|---------|--------|--------------|
| *Azawan* | \`azawan\` | |
| *see* | \`vejel\` | \`ejel\` *eye* |
`;

describe("lintWordBankMarkdown", () => {
  const tables = tablesOf();

  it("accepts house names, packed role English, and same-root citations", () => {
    assert.deepEqual(lintWordBankMarkdown(BANK, tables), []);
  });

  it("flags English that is not a sense of that spelling", () => {
    const md = `### Translation practice

**Roots used here:**

| English | Agalan |
|---------|--------|
| *see* | \`vajul\` |
`;
    const findings = lintWordBankMarkdown(md, tables);
    assert.equal(findings.length, 1);
    assert.equal(findings[0]!.agalan, "vajul");
    assert.equal(findings[0]!.english, "see");
  });

  it("defers overlay-tag and special-pronoun banks", () => {
    const md = `### Translation practice

**Roots used here:**

| English | Agalan |
|---------|--------|
| *I* | \`ugobon\` |
`;
    assert.deepEqual(lintWordBankMarkdown(md, tables), []);
  });
});
