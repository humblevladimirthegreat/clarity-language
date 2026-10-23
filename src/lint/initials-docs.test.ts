import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { parseWord } from "../parse/word.js";
import { grammarFile } from "../repo-paths.js";

const page = grammarFile("initials.md");

/** Each title root's first consonant, `th` as one letter (initials.md#initials). */
function initials(title: string): string {
  const family = parseWord(title).family;
  assert.equal(family.kind === "x" && family.xFamily, "compound", `${title} is not a hyphenated name`);
  if (family.kind !== "x" || family.xFamily !== "compound") return "";
  return [...family.leftRoots, ...(family.rightRoots ?? [])].map((root) => /th|[^aeou]/.exec(root)![0]).join("");
}

// Initials copy their title's root spellings, which a lexicon retie moves without touching the handle.
describe("initials examples (initials.md#initials)", () => {
  it("spell each title's handle from its roots' first consonants", () => {
    const text = readFileSync(page, "utf8");
    const section = text.slice(text.indexOf("### Initials"), text.indexOf("### Rays"));
    const spans = [...section.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
    let pairs = 0;
    spans.forEach((span, i) => {
      if (!/^z[aeou][a-z]*x[a-z]*n$/.test(span)) return;
      const handle = spans.slice(i + 1).find((s) => s.startsWith("z@_"));
      assert.equal(handle, `z@_${initials(span)}`, `initials of ${span}`);
      pairs++;
    });
    assert.ok(pairs >= 2, "the section pairs at least two titles with their initials");
  });
});
