import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lintNumberSpeechMarkdown, spokenForm } from "./number-speech-docs.js";

describe("spokenForm", () => {
  it("spells out number shorthand and keeps other words", () => {
    assert.equal(spokenForm("zagozolx g+3."), "zagozolx gragol.");
    assert.equal(spokenForm("h_15,30"), "hrobuzuthogomal");
  });
});

describe("lintNumberSpeechMarkdown", () => {
  it("accepts a matching row under a teach block", () => {
    const md = "> `zagozolx g+3.`\n>\n> 🔊 `zagozolx gragol.`\n>\n> \"Three cats.\"\n";
    assert.deepEqual(lintNumberSpeechMarkdown(md), []);
  });

  it("flags a missing row", () => {
    const md = "> `zagozolx g+3.`\n>\n> \"Three cats.\"\n";
    const [finding] = lintNumberSpeechMarkdown(md);
    assert.equal(finding?.documented, null);
    assert.equal(finding?.expected, "zagozolx gragol.");
  });

  it("flags a mismatched row", () => {
    const md = "> `zagozolx g+3.`\n>\n> 🔊 `zagozolx gravel.`\n";
    assert.equal(lintNumberSpeechMarkdown(md)[0]?.documented, "zagozolx gravel.");
  });

  it("needs no row when writing already equals speech", () => {
    assert.deepEqual(lintNumberSpeechMarkdown("> `zagozolx gragol.`\n"), []);
  });

  it("pairs a spoken → written prompt with its answer", () => {
    const ok = "**1.** 🔊 `gradal`\n\n::: details Show answer\n`g+2`\n\ng-two\n:::\n";
    assert.deepEqual(lintNumberSpeechMarkdown(ok), []);
    const bad = ok.replace("gradal", "gragol");
    assert.equal(lintNumberSpeechMarkdown(bad).length, 1);
  });

  it("checks Spoken table cells", () => {
    const md = "| Value | Preferred writing | Spoken |\n|---|---|---|\n| 3 | `g+3` | `grugol` (sketch) |\n";
    assert.equal(lintNumberSpeechMarkdown(md)[0]?.expected, "gragol");
  });
});
