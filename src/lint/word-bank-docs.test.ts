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
| *Azozon* | \`azozon\` | |
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
    for (const [english, agebon] of [["I", "uwen"], ["speaker", "uwen"], ["you", "awan"], ["listener", "awan"]]) {
      assert.deepEqual(lintWordBankMarkdown(md(english!, agebon!), tables), [], `${english} ${agebon}`);
    }
    assert.equal(lintWordBankMarkdown(md("I", "uwel"), tables).length, 1);
    assert.equal(lintWordBankMarkdown(md("you", "uwen"), tables).length, 1);
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
    const md = page(["*Azozon* | `azozon`", "*run* | `eruvol`"], ["zazozon veruvol."]);
    assert.deepEqual(kinds(md), []);
  });

  it("flags a drill root with no row, at its use line", () => {
    const md = page(["*Azozon* | `azozon`"], ["zazozon veruvol."]);
    const findings = lintWordBankUsage(md, tables);
    assert.deepEqual(kinds(md), ["missing eruvo"]);
    assert.equal(md.split("\n")[findings[0]!.line - 1], "`zazozon veruvol.`");
  });

  it("flags unused rows, house names included", () => {
    const md = page(["*Azozon* | `azozon`", "*Alazun* | `alazun`", "*run* | `eruvol`", "*dog* | `odozel`"], ["zazozon veruvol."]);
    assert.deepEqual(kinds(md), ["unused alazu", "unused odoze"]);
  });

  it("matches roots, not spellings: other roles, full-root resumes, role compounds", () => {
    const rows = ["*Azozon* | `azozon`", "*tell* | `vezuyol`", "*run* | `eruvol`", "*dog* | `odozel`", "*scream* | `veyamul`"];
    const md = page(rows, ["zazozon vezuyol. zwubezuyor veruvol.", "zodozel veruvol. zodozer veyamul."]);
    assert.deepEqual(kinds(md), []);
  });

  it("reads a resume as its antecedent's root", () => {
    const md = page(["*Azozon* | `azozon`", "*run* | `eruvol`", "*scream* | `veyamul`"], ["zazozon veruvol. zazozor veyamul."]);
    assert.deepEqual(kinds(md), []);
  });

  it("needs no row for an overlay, but a row for one must be used", () => {
    const rows = ["*Azozon* | `azozon`", "*run* | `eruvol`"];
    assert.deepEqual(kinds(page(rows, ["zazozon thomam veruvol."])), []);
    assert.deepEqual(kinds(page([...rows, "*MAY* | `thomam`"], ["zazozon veruvol."])), ["unused oma"]);
  });

  it("covers the SELF slot only with the *your name* row", () => {
    assert.deepEqual(kinds(page(["*run* | `eruvol`"], ["zSELFn veruvol."])).map((k) => k.split(" ")[0]), ["missing"]);
    assert.deepEqual(kinds(page(["*your name* | `SELFn`", "*run* | `eruvol`"], ["zSELFn veruvol."])), []);
  });

  it("does not count spans in the lead or the bank as drill uses", () => {
    const md = page(["*Azozon* | `azozon`", "*run* | `eruvol`", "*dog* | `odozel`"], ["zazozon veruvol."], "Compare `zodozel veruvol.`");
    assert.deepEqual(kinds(md), ["unused odoze"]);
  });
});

describe("converted checkpoint bank", () => {
  const tables = houseTables();
  const kinds = (md: string) => lintWordBankUsage(md, tables).map((f) => `${f.kind} ${f.roots.join(",")}`);
  const shape = (md: string) => lintPracticeBank(md, tables).map((f) => f.detail);
  const NEW_SEE = "| *see* | `vayebel` | 👁️ from *eye* |\n";
  const REVIEW = (rows: string) =>
    `**Review:**\n\n| English | Agebon |\n|---------|--------|\n${rows}\n\n#### English → Agebon {#beginner-english-to-agebon}`;
  const withReview = (rows: string) => PRACTICE.replace(NEW_SEE, "").replace("#### English → Agebon {#beginner-english-to-agebon}", REVIEW(rows));

  it("passes an exact New words bank", () => {
    assert.deepEqual(lintWordBankMarkdown(PRACTICE, tables), []);
    assert.deepEqual(kinds(PRACTICE), []);
    assert.deepEqual(shape(PRACTICE), []);
  });

  it("does not count the Fix it wrong form as a use, and flags the unused row", () => {
    const md = PRACTICE.replace("<!-- lint: error -->`zazozon dalazun vayebel.`", "<!-- lint: error -->`zazozon dalazun vowurol.`");
    // Swap out the translation items' *walk*, so only the wrong form spells it.
    const onlyFix = md.replace("`zalazun vowurol.`", "`zalazun vehohel.`").replace("`zahelan vowurol.`", "`zahelan vehohel.`");
    assert.deepEqual(kinds(onlyFix), ["unused owuro"]);
  });

  it("reads New words and Review together", () => {
    const md = withReview("| *see* | `vayebel` |");
    assert.deepEqual(kinds(md), []);
    assert.deepEqual(shape(md), []);
  });

  it("flags a drill root in neither group", () => {
    assert.deepEqual(kinds(PRACTICE.replace(NEW_SEE, "")), ["missing ayebe"]);
  });

  it("flags a converted checkpoint with no bank", () => {
    const md = PRACTICE.replace(/\*\*New words:\*\*[\s\S]*?\n\n(?=####)/, "");
    const findings = lintWordBankUsage(md, tables);
    assert.deepEqual(findings.map((f) => [f.kind, f.converted]), [["no-bank", true]]);
  });

  it("checks Review English against the lexicon", () => {
    const findings = lintWordBankMarkdown(withReview("| *chair* | `vayebel` |"), tables);
    assert.deepEqual(findings.map((f) => [f.agebon, f.english]), [["vayebel", "chair"]]);
  });

  it("needs a cue on every New words row", () => {
    assert.deepEqual(shape(PRACTICE.replace("| 👁️ from *eye* |", "| |")), ["**New words** row `vayebel` has no Cue"]);
  });

  it("checks the columns of each group", () => {
    assert.match(shape(PRACTICE.replace("| English | Agebon | Cue |\n|---------|--------|-----|", "| English | Agebon |\n|---------|--------|")).join("\n"), /\*\*New words\*\* columns are English · Agebon; use English · Agebon · Cue/);
    const md = withReview("| *see* | `vayebel` |").replace("| English | Agebon |\n|---------|--------|\n| *see*", "| English | Agebon | Cue |\n|---------|--------|-----|\n| *see*");
    assert.match(shape(md).join("\n"), /\*\*Review\*\* columns are English · Agebon · Cue; use English · Agebon/);
  });

  it("flags a root listed twice", () => {
    assert.match(shape(withReview("| *see* | `vayebel` |").replace("| *sit* | `vehohel`", "| *see* | `vayebel` | 👁️ |\n| *sit* | `vehohel`")).join("\n"), /root ayebe .* is already listed/);
  });

  it("flags a legacy Roots used here table", () => {
    const md = PRACTICE.replace("**New words:**", "**Roots used here:**\n\n| English | Agebon |\n|---|---|\n| *see* | `vayebel` |\n\n**New words:**");
    assert.match(shape(md).join("\n"), /not \*\*Roots used here\*\*/);
  });
});
