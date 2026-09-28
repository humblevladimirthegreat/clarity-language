import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish, parseEnglishByPos } from "../lexicon-search.js";

import { lintWordBankMarkdown, lintWordBankUsage } from "./word-bank-docs.js";
import { loadDefaultTables } from "../parse/index.js";

function tablesOf(): ClassifyTables {
  return createClassifyTablesFromRows(
    [
      {
        emoji: "",
        concrete: "swan",
        abstract: "grace",
        clarity: "azawa",
        mnemonic: "",
        englishByPos: "",
        posEnglish: emptyPosEnglish(),
      },
      {
        emoji: "",
        concrete: "eye",
        abstract: "",
        clarity: "eye",
        mnemonic: "",
        englishByPos: "v:see",
        posEnglish: parseEnglishByPos("v:see", { concrete: "eye" }),
      },
      {
        emoji: "",
        concrete: "chair",
        abstract: "",
        clarity: "ayu",
        mnemonic: "",
        englishByPos: "v:sit",
        posEnglish: parseEnglishByPos("v:sit", { concrete: "chair" }),
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
| *see* | \`veyel\` | \`eyel\` *eye* |
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
| *see* | \`vayul\` |
`;
    const findings = lintWordBankMarkdown(md, tables);
    assert.equal(findings.length, 1);
    assert.equal(findings[0]!.agalan, "vayul");
    assert.equal(findings[0]!.english, "see");
  });

  it("accepts the learner name slot only as *your name*", () => {
    const md = (english: string) => `### Translation practice

**Roots used here:**

| English | Agalan |
|---------|--------|
| *${english}* | \`SELFn\` |
`;
    assert.deepEqual(lintWordBankMarkdown(md("your name"), tables), []);
    assert.equal(lintWordBankMarkdown(md("speaker"), tables).length, 1);
  });
});

describe("lintWordBankUsage", () => {
  const tables = loadDefaultTables();
  const bank = (rows: string[]) =>
    ["| English | Agalan |", "|---------|--------|", ...rows.map((row) => `| ${row} |`)].join("\n");
  const page = (rows: string[], drills: string[], lead = "") => `### Translation practice

Short drills. ${lead}

**Roots used here:**

${bank(rows)}

#### English → Agalan

${drills.map((d, i) => `**${i + 1}.** *…*\n\n::: details Show answer\n\`${d}\`\n:::\n`).join("\n")}
`;
  const kinds = (md: string) => lintWordBankUsage(md, tables).map((f) => `${f.kind} ${f.roots.join(",")}`);

  it("accepts a bank that lists exactly the drill roots", () => {
    const md = page(["*Azawan* | `azawan`", "*run* | `arahal`"], ["zazawan varahal."]);
    assert.deepEqual(kinds(md), []);
  });

  it("flags a drill root with no row, at its use line", () => {
    const md = page(["*Azawan* | `azawan`"], ["zazawan varahal."]);
    const findings = lintWordBankUsage(md, tables);
    assert.deepEqual(kinds(md), ["missing araha"]);
    assert.equal(md.split("\n")[findings[0]!.line - 1], "`zazawan varahal.`");
  });

  it("flags unused rows, house names included", () => {
    const md = page(["*Azawan* | `azawan`", "*Alahen* | `alahen`", "*run* | `arahal`", "*dog* | `odogal`"], ["zazawan varahal."]);
    assert.deepEqual(kinds(md), ["unused alahe", "unused odoga"]);
  });

  it("matches roots, not spellings: other roles, full-root resumes, role compounds", () => {
    const rows = ["*Azawan* | `azawan`", "*tell* | `vezebel`", "*run* | `arahal`", "*dog* | `odogal`", "*scream* | `vezogel`"];
    const md = page(rows, ["zazawan vezebel. zoxezeber varahal.", "zodogal varahal. zodogar vezogel."]);
    assert.deepEqual(kinds(md), []);
  });

  it("does not read a short resume stem as its own root", () => {
    const md = page(["*Azawan* | `azawan`", "*run* | `arahal`", "*scream* | `vezogel`"], ["zazawan varahal. zazar vezogel."]);
    assert.deepEqual(kinds(md), []);
  });

  it("needs no row for an overlay, but a row for one must be used", () => {
    const rows = ["*Azawan* | `azawan`", "*run* | `arahal`"];
    assert.deepEqual(kinds(page(rows, ["zazawan thovom varahal."])), []);
    assert.deepEqual(kinds(page([...rows, "*MAY* | `thovom`"], ["zazawan varahal."])), ["unused ovo"]);
  });

  it("covers the SELF slot only with the *your name* row", () => {
    assert.deepEqual(kinds(page(["*run* | `arahal`"], ["zSELFn varahal."])).map((k) => k.split(" ")[0]), ["missing"]);
    assert.deepEqual(kinds(page(["*your name* | `SELFn`", "*run* | `arahal`"], ["zSELFn varahal."])), []);
  });

  it("does not count spans in the lead or the bank as drill uses", () => {
    const md = page(["*Azawan* | `azawan`", "*run* | `arahal`", "*dog* | `odogal`"], ["zazawan varahal."], "Compare `zodogal varahal.`");
    assert.deepEqual(kinds(md), ["unused odoga"]);
  });
});
