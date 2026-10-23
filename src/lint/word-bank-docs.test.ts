import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLOSED } from "../closed-roots.js";

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
        root: CLOSED.swan,
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

| English | Agebon | Same root as |
|---------|--------|--------------|
| *Uzozen* | \`uzozen\` | |
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

| English | Agebon |
|---------|--------|
| *see* | \`vayul\` |
`;
    const findings = lintWordBankMarkdown(md, tables);
    assert.equal(findings.length, 1);
    assert.equal(findings[0]!.agebon, "vayul");
    assert.equal(findings[0]!.english, "see");
  });

  it("accepts the learner name slot only as *your name*", () => {
    const md = (english: string) => `### Translation practice

**Roots used here:**

| English | Agebon |
|---------|--------|
| *${english}* | \`SELFn\` |
`;
    assert.deepEqual(lintWordBankMarkdown(md("your name"), tables), []);
    assert.equal(lintWordBankMarkdown(md("speaker"), tables).length, 1);
  });

  it("accepts *I* / *you* for the speaker and listener specials", () => {
    const md = (english: string, agebon: string) => `### Translation practice

**Roots used here:**

| English | Agebon |
|---------|--------|
| *${english}* | \`${agebon}\` |
`;
    for (const [english, agebon] of [["I", "uwon"], ["speaker", "uwon"], ["you", "awan"], ["listener", "awan"]]) {
      assert.deepEqual(lintWordBankMarkdown(md(english!, agebon!), tables), [], `${english} ${agebon}`);
    }
    assert.equal(lintWordBankMarkdown(md("I", "uwol"), tables).length, 1);
    assert.equal(lintWordBankMarkdown(md("you", "uwon"), tables).length, 1);
  });
});

describe("lintWordBankUsage", () => {
  const tables = loadDefaultTables();
  const bank = (rows: string[]) =>
    ["| English | Agebon |", "|---------|--------|", ...rows.map((row) => `| ${row} |`)].join("\n");
  const page = (rows: string[], drills: string[], lead = "") => `### Translation practice

Short drills. ${lead}

**Roots used here:**

${bank(rows)}

#### English → Agebon

${drills.map((d, i) => `**${i + 1}.** *…*\n\n::: details Show answer\n\`${d}\`\n:::\n`).join("\n")}
`;
  const kinds = (md: string) => lintWordBankUsage(md, tables).map((f) => `${f.kind} ${f.roots.join(",")}`);

  it("accepts a bank that lists exactly the drill roots", () => {
    const md = page(["*Uzozen* | `uzozen`", "*run* | `aruvel`"], ["zuzozen varuvel."]);
    assert.deepEqual(kinds(md), []);
  });

  it("flags a drill root with no row, at its use line", () => {
    const md = page(["*Uzozen* | `uzozen`"], ["zuzozen varuvel."]);
    const findings = lintWordBankUsage(md, tables);
    assert.deepEqual(kinds(md), ["missing aruve"]);
    assert.equal(md.split("\n")[findings[0]!.line - 1], "`zuzozen varuvel.`");
  });

  it("flags unused rows, house names included", () => {
    const md = page(["*Uzozen* | `uzozen`", "*Olazun* | `olazun`", "*run* | `aruvel`", "*dog* | `udozol`"], ["zuzozen varuvel."]);
    assert.deepEqual(kinds(md), ["unused olazu", "unused udozo"]);
  });

  it("matches roots, not spellings: other roles, full-root resumes, role compounds", () => {
    const rows = ["*Uzozen* | `uzozen`", "*tell* | `vezuyel`", "*run* | `aruvel`", "*dog* | `udozol`", "*scream* | `varemul`"];
    const md = page(rows, ["zuzozen vezuyel. zwubezuyer varuvel.", "zudozol varuvel. zudozor varemul."]);
    assert.deepEqual(kinds(md), []);
  });

  it("reads a resume as its antecedent's root", () => {
    const md = page(["*Uzozen* | `uzozen`", "*run* | `aruvel`", "*scream* | `varemul`"], ["zuzozen varuvel. zuzozer varemul."]);
    assert.deepEqual(kinds(md), []);
  });

  it("needs no row for an overlay, but a row for one must be used", () => {
    const rows = ["*Uzozen* | `uzozen`", "*run* | `aruvel`"];
    assert.deepEqual(kinds(page(rows, ["zuzozen thomam varuvel."])), []);
    assert.deepEqual(kinds(page([...rows, "*MAY* | `thomam`"], ["zuzozen varuvel."])), ["unused oma"]);
  });

  it("covers the SELF slot only with the *your name* row", () => {
    assert.deepEqual(kinds(page(["*run* | `aruvel`"], ["zSELFn varuvel."])).map((k) => k.split(" ")[0]), ["missing"]);
    assert.deepEqual(kinds(page(["*your name* | `SELFn`", "*run* | `aruvel`"], ["zSELFn varuvel."])), []);
  });

  it("does not count spans in the lead or the bank as drill uses", () => {
    const md = page(["*Uzozen* | `uzozen`", "*run* | `aruvel`", "*dog* | `udozol`"], ["zuzozen varuvel."], "Compare `zudozol varuvel.`");
    assert.deepEqual(kinds(md), ["unused udozo"]);
  });
});

describe("converted checkpoint bank", () => {
  const tables = houseTables();
  const kinds = (md: string) => lintWordBankUsage(md, tables).map((f) => `${f.kind} ${f.roots.join(",")}`);
  const shape = (md: string) => lintPracticeBank(md, tables).map((f) => f.detail);
  const NEW_SEE = "| *see* | `vawebol` | 👁️ from *eye* |\n";
  const REVIEW = (rows: string) =>
    `**Review:**\n\n| English | Agebon |\n|---------|--------|\n${rows}\n\n#### English → Agebon {#beginner-english-to-agebon}`;
  const withReview = (rows: string) => PRACTICE.replace(NEW_SEE, "").replace("#### English → Agebon {#beginner-english-to-agebon}", REVIEW(rows));

  it("passes an exact New words bank", () => {
    assert.deepEqual(lintWordBankMarkdown(PRACTICE, tables), []);
    assert.deepEqual(kinds(PRACTICE), []);
    assert.deepEqual(shape(PRACTICE), []);
  });

  it("does not count the Fix it wrong form as a use, and flags the unused row", () => {
    const md = PRACTICE.replace("<!-- lint: error -->`zuzozen dolazun vawebol.`", "<!-- lint: error -->`zuzozen dolazun vowurel.`");
    // Swap out the translation items' *walk*, so only the wrong form spells it.
    const onlyFix = md.replace("`zolazun vowurel.`", "`zolazun vuhohol.`").replace("`zahelan vowurel.`", "`zahelan vuhohol.`");
    assert.deepEqual(kinds(onlyFix), ["unused owure"]);
  });

  it("reads New words and Review together", () => {
    const md = withReview("| *see* | `vawebol` |");
    assert.deepEqual(kinds(md), []);
    assert.deepEqual(shape(md), []);
  });

  it("flags a drill root in neither group", () => {
    assert.deepEqual(kinds(PRACTICE.replace(NEW_SEE, "")), ["missing awebo"]);
  });

  it("flags a converted checkpoint with no bank", () => {
    const md = PRACTICE.replace(/\*\*New words:\*\*[\s\S]*?\n\n(?=####)/, "");
    const findings = lintWordBankUsage(md, tables);
    assert.deepEqual(findings.map((f) => [f.kind, f.converted]), [["no-bank", true]]);
  });

  it("checks Review English against the lexicon", () => {
    const findings = lintWordBankMarkdown(withReview("| *chair* | `vawebol` |"), tables);
    assert.deepEqual(findings.map((f) => [f.agebon, f.english]), [["vawebol", "chair"]]);
  });

  it("needs a cue on every New words row", () => {
    assert.deepEqual(shape(PRACTICE.replace("| 👁️ from *eye* |", "| |")), ["**New words** row `vawebol` has no Cue"]);
  });

  it("checks the columns of each group", () => {
    assert.match(shape(PRACTICE.replace("| English | Agebon | Cue |\n|---------|--------|-----|", "| English | Agebon |\n|---------|--------|")).join("\n"), /\*\*New words\*\* columns are English · Agebon; use English · Agebon · Cue/);
    const md = withReview("| *see* | `vawebol` |").replace("| English | Agebon |\n|---------|--------|\n| *see*", "| English | Agebon | Cue |\n|---------|--------|-----|\n| *see*");
    assert.match(shape(md).join("\n"), /\*\*Review\*\* columns are English · Agebon · Cue; use English · Agebon/);
  });

  it("flags a root listed twice", () => {
    assert.match(shape(withReview("| *see* | `vawebol` |").replace("| *sit* | `vuhohol`", "| *see* | `vawebol` | 👁️ |\n| *sit* | `vuhohol`")).join("\n"), /root awebo .* is already listed/);
  });

  it("flags a legacy Roots used here table", () => {
    const md = PRACTICE.replace("**New words:**", "**Roots used here:**\n\n| English | Agebon |\n|---|---|\n| *see* | `vawebol` |\n\n**New words:**");
    assert.match(shape(md).join("\n"), /not \*\*Roots used here\*\*/);
  });
});
