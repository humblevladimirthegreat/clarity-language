import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { listMarkdown } from "../markdown-files.js";
import { parsePublishedCsv } from "../lexicon-search.js";
import { dataPath } from "../repo-paths.js";
import { collectEnglishEntries, collectRootEntries, searchEnglish, tokens } from "./english.js";

const tables = loadDefaultTables();

function entriesOf(markdown: string) {
  return collectEnglishEntries(markdown, "page.md", tables);
}

describe("tokens", () => {
  it("drops stop words and markdown, and stems", () => {
    assert.deepEqual(tokens("*Azawan* walks to the `hill`"), ["azawan", "walk", "hill"]);
    assert.deepEqual(tokens("stories"), ["story"]);
  });
});

describe("collectEnglishEntries", () => {
  it("indexes Use and English columns but not Cue", () => {
    const entries = entriesOf(`| Agazan | Use | English | Cue |
|--------|-----|---------|-----|
| \`or …\` | back to the main line | *Anyway, …* | **o** ≈ one |
`);
    assert.equal(entries.length, 1);
    assert.equal(entries[0]!.form, "or …");
    assert.equal(entries[0]!.english, "back to the main line — *Anyway, …*");
    assert.equal(searchEnglish(entries, "one").length, 0);
  });

  it("finds the form column by its backticks when no header names it", () => {
    const entries = entriesOf(`| English | Bar |
|---------|-----|
| *late* / *early* | **\`zahen\`** with **\`bral\`** |
`);
    assert.deepEqual(
      entries.map((e) => [e.form, e.english]),
      [["zahen / bral", "*late* / *early*"]],
    );
  });

  it("skips a table with no Agazan column", () => {
    assert.deepEqual(entriesOf("| English | Notes |\n|---|---|\n| walk | slow |\n"), []);
  });

  it("gives examples and their glosses the section and stage", () => {
    const entries = entriesOf(`## Intermediate {#intermediate}

### Point back {#hook-resume}

> \`or zazawan vowogal.\`
>
> "Anyway, Azawan walks."
`);
    const example = entries.find((e) => e.kind === "example")!;
    assert.equal(example.english, "Anyway, Azawan walks.");
    assert.equal(example.slug, "hook-resume");
    assert.equal(example.band, "intermediate");
    assert.equal(example.line, 5);
    const gloss = entries.find((e) => e.kind === "gloss" && e.form === "or")!;
    assert.equal(gloss.english, "anyway");
    assert.ok(entries.some((e) => e.kind === "gloss" && e.form === "vowogal" && e.english === "walk"));
  });
});

describe("searchEnglish", () => {
  const entries = entriesOf(`### Walking

> \`zazawan vowogal.\`
>
> "Azawan walks."

### From the end

| Form | Reading |
|------|---------|
| \`g#-2\` | *penultimate* |
`);

  it("matches stemmed words", () => {
    assert.equal(searchEnglish(entries, "walking")[0]!.slug, "walking");
  });
  it("marks a hit found through a synonym", () => {
    const [section] = searchEnglish(entries, "last time");
    assert.equal(section!.slug, "from-the-end");
    assert.equal(section!.hits[0]!.via, "penultimate");
  });
});

describe("taught cues in docs/grammar", () => {
  const all = listMarkdown("docs/grammar").flatMap((file) => collectEnglishEntries(readFileSync(file, "utf8"), file, tables));
  const cases: { phrase: string; page: string; slug?: string; forms: string[] }[] = [
    { phrase: "anyway", page: "hooks.md", slug: "hook-resume", forms: ["or"] },
    { phrase: "late", page: "comparatives.md", slug: "vague-amounts", forms: ["zahen / bral / zel / zuel"] },
    { phrase: "last time", page: "numbers.md", forms: ["gruedul", "g#-2", "h#-2"] },
  ];
  for (const { phrase, page, slug, forms } of cases) {
    it(`finds *${phrase}* first`, () => {
      const [top] = searchEnglish(all, phrase);
      assert.ok(top, `*${phrase}* has no entry`);
      assert.ok(top.page.endsWith(page) && (!slug || top.slug === slug), `*${phrase}* top section is ${top.page}#${top.slug}, not ${page}${slug ? `#${slug}` : ""}`);
      assert.ok(
        top.hits.some((h) => forms.includes(h.entry.form)),
        `*${phrase}* lost its entry: ${top.hits.map((h) => h.entry.form).join(", ")}`,
      );
    });
  }
});

describe("collectRootEntries", () => {
  const csv = "emoji,concrete,root,abstract,mnemonic,english_by_pos,english_aliases\n😀,grin,egeva,delight,m,v:smile,glad; joy\n";
  const entries = collectRootEntries(parsePublishedCsv(csv));

  it("indexes senses, per-PoS lemmas and aliases under the owning root", () => {
    assert.deepEqual(entries.map((e) => e.english), ["grin", "delight", "smile", "glad", "joy"]);
    assert.ok(entries.every((e) => e.kind === "root" && e.form === "egeva"));
    assert.deepEqual(entries.filter((e) => e.alias).map((e) => e.english), ["glad", "joy"]);
  });

  it("finds a root by alias, ranked just below a sense match", () => {
    const [alias] = searchEnglish(entries, "glad", { kind: "root" });
    assert.equal(alias!.hits[0]!.entry.form, "egeva");
    const [sense] = searchEnglish(entries, "grin", { kind: "root" });
    assert.ok(sense!.hits[0]!.score > alias!.hits[0]!.score);
  });

  it("covers the real lexicon aliases", () => {
    const real = collectRootEntries(parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8")));
    assert.ok(real.some((e) => e.alias));
  });
});
