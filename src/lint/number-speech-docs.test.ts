import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lintNumberSpeechMarkdown, spokenForm } from "./number-speech-docs.js";

describe("spokenForm", () => {
  it("spells out number shorthand and keeps other words", () => {
    assert.equal(spokenForm("zogozelx g+3."), "zogozelx gragel.");
    assert.equal(spokenForm("h_15,30"), "hrebazathegemol");
  });
});

describe("lintNumberSpeechMarkdown", () => {
  it("accepts a matching row under a teach block", () => {
    const md = "> `zogozelx g+3.`\n>\n> 🔊 `zogozelx gragel.`\n>\n> \"Three cats.\"\n";
    assert.deepEqual(lintNumberSpeechMarkdown(md), []);
  });

  it("flags a missing row", () => {
    const md = "> `zogozelx g+3.`\n>\n> \"Three cats.\"\n";
    const [finding] = lintNumberSpeechMarkdown(md);
    assert.equal(finding?.documented, null);
    assert.equal(finding?.expected, "zogozelx gragel.");
  });

  it("flags a mismatched row", () => {
    const md = "> `zogozelx g+3.`\n>\n> 🔊 `zogozelx grahul.`\n";
    assert.equal(lintNumberSpeechMarkdown(md)[0]?.documented, "zogozelx grahul.");
  });

  it("needs no row when writing already equals speech", () => {
    assert.deepEqual(lintNumberSpeechMarkdown("> `zogozelx gragel.`\n"), []);
  });

  it("pairs a spoken → written prompt with its answer", () => {
    const ok = "**1.** 🔊 `gradol`\n\n::: details Show answer\n`g+2`\n\ng-two\n:::\n";
    assert.deepEqual(lintNumberSpeechMarkdown(ok), []);
    const bad = ok.replace("gradol", "gragel");
    assert.equal(lintNumberSpeechMarkdown(bad).length, 1);
  });

  it("checks Spoken table cells", () => {
    const md = "| Value | Preferred writing | Spoken |\n|---|---|---|\n| 3 | `g+3` | `grugel` (sketch) |\n";
    assert.equal(lintNumberSpeechMarkdown(md)[0]?.expected, "gragel");
  });
});
