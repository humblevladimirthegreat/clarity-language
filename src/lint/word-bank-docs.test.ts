import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish, parseEnglishByPos } from "../lexicon-search.js";

import { lintPracticeBank, lintWordBankMarkdown, lintWordBankUsage } from "./word-bank-docs.js";
import { houseTables, PRACTICE } from "./practice-fixtures.js";
import { loadDefaultTables } from "../parse/index.js";

function tablesOf(): ClassifyTables {
  return createClassifyTablesFromRows(
    [
      {
        emoji: "",
        concrete: "swan",
        abstract: "grace",
        root: "azawa",
        mnemonic: "",
        englishByPos: "",
        posEnglish: emptyPosEnglish(),
      },
      {
        emoji: "",
        concrete: "eye",
        abstract: "",
        root: "eye",
        mnemonic: "",
        englishByPos: "v:see",
        posEnglish: parseEnglishByPos("v:see", { concrete: "eye" }),
      },
      {
        emoji: "",
        concrete: "chair",
        abstract: "",
        root: "ayu",
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

| English | Agazan | Same root as |
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

| English | Agazan |
|---------|--------|
| *see* | \`vayul\` |
`;
    const findings = lintWordBankMarkdown(md, tables);
    assert.equal(findings.length, 1);
    assert.equal(findings[0]!.agazan, "vayul");
    assert.equal(findings[0]!.english, "see");
  });

  it("accepts the learner name slot only as *your name*", () => {
    const md = (english: string) => `### Translation practice

**Roots used here:**

| English | Agazan |
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
    ["| English | Agazan |", "|---------|--------|", ...rows.map((row) => `| ${row} |`)].join("\n");
  const page = (rows: string[], drills: string[], lead = "") => `### Translation practice

Short drills. ${lead}

**Roots used here:**

${bank(rows)}

#### English → Agazan

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
    const rows = ["*Azawan* | `azawan`", "*tell* | `vezebel`", "*run* | `arahal`", "*dog* | `odogal`", "*scream* | `vezugel`"];
    const md = page(rows, ["zazawan vezebel. zoxezeber varahal.", "zodogal varahal. zodogar vezugel."]);
    assert.deepEqual(kinds(md), []);
  });

  it("reads a resume as its antecedent's root", () => {
    const md = page(["*Azawan* | `azawan`", "*run* | `arahal`", "*scream* | `vezugel`"], ["zazawan varahal. zazawar vezugel."]);
    assert.deepEqual(kinds(md), []);
  });

  it("needs no row for an overlay, but a row for one must be used", () => {
    const rows = ["*Azawan* | `azawan`", "*run* | `arahal`"];
    assert.deepEqual(kinds(page(rows, ["zazawan thovum varahal."])), []);
    assert.deepEqual(kinds(page([...rows, "*MAY* | `thovum`"], ["zazawan varahal."])), ["unused ovu"]);
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

describe("converted checkpoint bank", () => {
  const tables = houseTables();
  const kinds = (md: string) => lintWordBankUsage(md, tables).map((f) => `${f.kind} ${f.roots.join(",")}`);
  const shape = (md: string) => lintPracticeBank(md, tables).map((f) => f.detail);
  const NEW_SEE = "| *see* | `vahahal` | 👁️ from *eye* |\n";
  const REVIEW = (rows: string) =>
    `**Review:**\n\n| English | Agazan |\n|---------|--------|\n${rows}\n\n#### English → Agazan {#beginner-english-to-agazan}`;
  const withReview = (rows: string) => PRACTICE.replace(NEW_SEE, "").replace("#### English → Agazan {#beginner-english-to-agazan}", REVIEW(rows));

  it("passes an exact New words bank", () => {
    assert.deepEqual(lintWordBankMarkdown(PRACTICE, tables), []);
    assert.deepEqual(kinds(PRACTICE), []);
    assert.deepEqual(shape(PRACTICE), []);
  });

  it("does not count the Fix it wrong form as a use, and flags the unused row", () => {
    const md = PRACTICE.replace("<!-- lint: error -->`zazawan dalahen vahahal.`", "<!-- lint: error -->`zazawan dalahen vowogal.`");
    // Swap out the translation items' *walk*, so only the wrong form spells it.
    const onlyFix = md.replace("`zalahen vowogal.`", "`zalahen vehahel.`").replace("`zahaben vowogal.`", "`zahaben vehahel.`");
    assert.deepEqual(kinds(onlyFix), ["unused owoga"]);
  });

  it("reads New words and Review together", () => {
    const md = withReview("| *see* | `vahahal` |");
    assert.deepEqual(kinds(md), []);
    assert.deepEqual(shape(md), []);
  });

  it("flags a drill root in neither group", () => {
    assert.deepEqual(kinds(PRACTICE.replace(NEW_SEE, "")), ["missing ahaha"]);
  });

  it("flags a converted checkpoint with no bank", () => {
    const md = PRACTICE.replace(/\*\*New words:\*\*[\s\S]*?\n\n(?=####)/, "");
    const findings = lintWordBankUsage(md, tables);
    assert.deepEqual(findings.map((f) => [f.kind, f.converted]), [["no-bank", true]]);
  });

  it("checks Review English against the lexicon", () => {
    const findings = lintWordBankMarkdown(withReview("| *chair* | `vahahal` |"), tables);
    assert.deepEqual(findings.map((f) => [f.agazan, f.english]), [["vahahal", "chair"]]);
  });

  it("needs a cue on every New words row", () => {
    assert.deepEqual(shape(PRACTICE.replace("| 👁️ from *eye* |", "| |")), ["**New words** row `vahahal` has no Cue"]);
  });

  it("checks the columns of each group", () => {
    assert.match(shape(PRACTICE.replace("| English | Agazan | Cue |\n|---------|--------|-----|", "| English | Agazan |\n|---------|--------|")).join("\n"), /\*\*New words\*\* columns are English · Agazan; use English · Agazan · Cue/);
    const md = withReview("| *see* | `vahahal` |").replace("| English | Agazan |\n|---------|--------|\n| *see*", "| English | Agazan | Cue |\n|---------|--------|-----|\n| *see*");
    assert.match(shape(md).join("\n"), /\*\*Review\*\* columns are English · Agazan · Cue; use English · Agazan/);
  });

  it("flags a root listed twice", () => {
    assert.match(shape(withReview("| *see* | `vahahal` |").replace("| *sit* | `vehahel`", "| *see* | `vahahal` | 👁️ |\n| *sit* | `vehahel`")).join("\n"), /root ahaha .* is already listed/);
  });

  it("flags a legacy Roots used here table", () => {
    const md = PRACTICE.replace("**New words:**", "**Roots used here:**\n\n| English | Agazan |\n|---|---|\n| *see* | `vahahal` |\n\n**New words:**");
    assert.match(shape(md).join("\n"), /not \*\*Roots used here\*\*/);
  });
});
