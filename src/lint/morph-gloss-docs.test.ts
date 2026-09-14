import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows } from "../parse/classify.js";
import { extractExampleBlocks } from "../parse/morph-gloss.js";

import { extractMorphPairs, formatMorphGlossReport, lintMorphGlossMarkdown } from "./morph-gloss-docs.js";

describe("extractMorphPairs", () => {
  it("picks blockquote Agalan + morph and skips quoted free English", () => {
    const md = `> \`zazawan godogol.\`
>
> z-Azawan | g-dog
>
> "Azawan is a dog."
`;
    const [pair] = extractExampleBlocks(md);
    assert.equal(pair?.agalan, "zazawan godogol.");
    assert.equal(pair?.morph, "z-Azawan | g-dog");
  });

  it("skips omit-morph citations", () => {
    const md = `> \`azawal\`
>
> "swan"
`;
    assert.equal(extractExampleBlocks(md).length, 0);
  });

  it("reads a Morph-column table and normalizes middot", () => {
    const md = `| Example | Morph | Gloss |
|---------|-------|-------|
| \`zel g<big>l\` | \`z-rank/more\` · \`g-big\` | *bigger* |
`;
    const pairs = extractMorphPairs(md);
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0]?.agalan, "zel g<big>l");
    assert.equal(pairs[0]?.morph, "z-rank/more | g-big");
    assert.equal(pairs[0]?.source, "table");
  });
});

describe("formatMorphGlossReport", () => {
  it("splits ambiguities and mismatches", () => {
    const text = formatMorphGlossReport([
      {
        relpath: "docs/grammar/foo.md",
        findings: [
          {
            kind: "mismatch",
            line: 12,
            agalan: "zazawan godogol.",
            documented: "z-Azawan | g-hound",
            parser: "z-Azawan | g-dog",
          },
          {
            kind: "ambiguity",
            line: 40,
            agalan: "hal",
            conflict: {
              surface: "hal",
              stage: "classify",
              sources: ["restrictor", "join"],
              detail: "restrictor:restrictor vs join:join",
            },
          },
        ],
      },
    ]);
    assert.match(text, /Leftover `--check-ambiguity`/);
    assert.match(text, /Suspected wrong grammar morph lines/);
    assert.match(text, /g-hound/);
    assert.match(text, /stage: classify/);
  });
});

describe("lintMorphGlossMarkdown", () => {
  it("records a documented sense mismatch without needing real lexicon rows for the pair shape", () => {
    const tables = createClassifyTablesFromRows(
      [
        {
          emoji: "",
          literal: "dog",
          metaphorical: "",
          clarity: "odogo",
          mnemonic: "",
        },
        {
          emoji: "",
          literal: "swan",
          metaphorical: "grace",
          clarity: "azawa",
          mnemonic: "",
        },
      ],
      [],
    );
    const md = `> \`zazawan godogol.\`
>
> z-Azawan | g-hound
`;
    const findings = lintMorphGlossMarkdown(md, tables);
    const mismatch = findings.find((f) => f.kind === "mismatch");
    assert.ok(mismatch);
    if (mismatch?.kind !== "mismatch") return;
    assert.equal(mismatch.documented, "z-Azawan | g-hound");
    assert.equal(mismatch.parser, "z-Azawan | g-dog");
  });
});
