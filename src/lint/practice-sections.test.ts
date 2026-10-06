import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isConvertedPracticeHeading, PRACTICE_TITLE_RE, practiceRanges } from "./practice-sections.js";

describe("practiceRanges", () => {
  it("finds both headings and marks only Practice as converted", () => {
    const lines = [
      "## Beginner",
      "### Translation practice {#beginner-translation-practice}",
      "#### English → Agazan",
      "## Intermediate",
      "### Practice {#intermediate-practice}",
      "#### Pick one {#intermediate-pick-one}",
      "### See also",
    ];
    assert.deepEqual(practiceRanges(lines), [
      { start: 1, end: 3, converted: false },
      { start: 4, end: 6, converted: true },
    ]);
  });

  it("ignores other headings that mention practice", () => {
    assert.deepEqual(practiceRanges(["## Practice {#practice}", "### Practical joins", "#### Practice"]), []);
  });
});

describe("checkpoint headings", () => {
  it("tells converted from legacy", () => {
    assert.equal(isConvertedPracticeHeading("### Practice {#beginner-practice}"), true);
    assert.equal(isConvertedPracticeHeading("### Translation practice {#beginner-translation-practice}"), false);
  });

  it("matches both section titles", () => {
    assert.equal(PRACTICE_TITLE_RE.test("Practice"), true);
    assert.equal(PRACTICE_TITLE_RE.test("Translation practice"), true);
    assert.equal(PRACTICE_TITLE_RE.test("Practical joins"), false);
  });
});
