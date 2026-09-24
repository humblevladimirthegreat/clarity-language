import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lintNumberSpeechMarkdown, spokenForm } from "./number-speech-docs.js";

describe("spokenForm", () => {
  it("spells out number shorthand and keeps other words", () => {
    assert.equal(spokenForm("zagadalx g+3."), "zagadalx grarel.");
    assert.equal(spokenForm("h_15,30"), "hrowovathorezol");
  });
});

describe("lintNumberSpeechMarkdown", () => {
  it("accepts a matching row under a teach block", () => {
    const md = "> `zagadalx g+3.`\n>\n> 🔊 *zagadalx grarel.*\n>\n> \"Three cats.\"\n";
    assert.deepEqual(lintNumberSpeechMarkdown(md), []);
  });

  it("flags a missing row", () => {
    const md = "> `zagadalx g+3.`\n>\n> \"Three cats.\"\n";
    const [finding] = lintNumberSpeechMarkdown(md);
    assert.equal(finding?.documented, null);
    assert.equal(finding?.expected, "zagadalx grarel.");
  });

  it("flags a mismatched row", () => {
    const md = "> `zagadalx g+3.`\n>\n> 🔊 *zagadalx gramol.*\n";
    assert.equal(lintNumberSpeechMarkdown(md)[0]?.documented, "zagadalx gramol.");
  });

  it("needs no row when writing already equals speech", () => {
    assert.deepEqual(lintNumberSpeechMarkdown("> `zagadalx grarel.`\n"), []);
  });

  it("pairs a spoken → written prompt with its answer", () => {
    const ok = "**1.** 🔊 *gradul*\n\n::: details Show answer\n`g+2`\n\ng-two\n:::\n";
    assert.deepEqual(lintNumberSpeechMarkdown(ok), []);
    const bad = ok.replace("gradul", "grarel");
    assert.equal(lintNumberSpeechMarkdown(bad).length, 1);
  });

  it("checks Spoken table cells", () => {
    const md = "| Value | Preferred writing | Spoken |\n|---|---|---|\n| 3 | `g+3` | *grurel* (sketch) |\n";
    assert.equal(lintNumberSpeechMarkdown(md)[0]?.expected, "grarel");
  });
});
