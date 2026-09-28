import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";

import { lintRetieFormat, sharedPrefixLosses, shortCutLost } from "./retie-format.js";

function tablesOf(roots: string[]): ClassifyTables {
  return createClassifyTablesFromRows(
    roots.map((clarity) => ({
      emoji: "",
      concrete: "gloss",
      abstract: "",
      clarity,
      mnemonic: "",
      englishByPos: "",
      posEnglish: emptyPosEnglish(),
    })),
    [],
  );
}

const tables = tablesOf(["abaha", "adahe", "ezeba", "ezebo"]);

const shared = `<!-- retie: shared-prefix -->

Short \`ezeba\` and \`ezebo\`.

> \`vezebal gezebol.\`
`;

describe("lintRetieFormat", () => {
  it("requires an English id when a heading spells a published root", () => {
    const findings = lintRetieFormat("### Gravity (`abaha` / `adahe`)\n", tables);
    assert.equal(findings.length, 1);
    assert.match(findings[0]!.detail, /pin an English/);
  });

  it("leaves a pinned heading and a closed letter alone", () => {
    const markdown = "### Gravity (`abaha`) {#gravity}\n\n### Always (`hual`)\n";
    assert.deepEqual(lintRetieFormat(markdown, tables), []);
  });

  it("keeps italic English that also spells a root", () => {
    assert.deepEqual(lintRetieFormat("There is no bare *ago* word, *even* so.\n", tablesOf(["ago", "eve"])), []);
    const glossed = createClassifyTablesFromRows(
      [
        {
          emoji: "",
          concrete: "eye",
          abstract: "",
          clarity: "eye",
          mnemonic: "",
          englishByPos: "",
          posEnglish: emptyPosEnglish(),
        },
      ],
      [],
    );
    assert.deepEqual(lintRetieFormat("Seeing is what an *eye* does.\n", glossed), []);
  });

  it("rejects retie: skip and an italic Agazan word", () => {
    const markdown = "<!-- retie: skip -->\n\nSee *abaha* and *sleep* and *Azawan*.\n";
    const details = lintRetieFormat(markdown, tables).map((finding) => finding.detail);
    assert.equal(details.length, 2);
    assert.match(details[0]!, /retie: skip/);
    assert.match(details[1]!, /\*abaha\*/);
  });

  it("accepts a shared-prefix example whose roots share a short cut", () => {
    assert.deepEqual(lintRetieFormat(shared, tables), []);
  });

  it("rejects a shared-prefix mark whose roots do not share a cut", () => {
    const markdown = "<!-- retie: shared-prefix -->\n\n`abaha` and `adahe`.\n\n> `abaha adahe.`\n";
    const findings = lintRetieFormat(markdown, tables);
    assert.equal(findings.length, 1);
    assert.match(findings[0]!.detail, /do not share/);
  });
});

describe("short cut across a retie", () => {
  it("blocks when the marked roots no longer share a cut", () => {
    assert.equal(shortCutLost(["ezeba", "ezebo"], ["abaha", "adahe"]), true);
    assert.equal(shortCutLost(["ezeba", "ezebo"], ["ezeba", "ezebo"]), false);
    const after = `<!-- retie: shared-prefix -->

\`abaha\` and \`adahe\`.

> \`abaha adahe.\`
`;
    const losses = sharedPrefixLosses(shared, after, tables, tables);
    assert.equal(losses.length, 1);
    assert.match(losses[0]!.detail, /no longer share/);
  });
});
