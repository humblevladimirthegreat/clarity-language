import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  englishCitationForms,
  literalMetaphorCollide,
  validatePublishedSenseSeparation,
} from "./lexicon-published-lint.js";
import { parsePublishedCsv } from "./lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");

describe("englishCitationForms", () => {
  it("includes inflectional alternates on the whole lemma", () => {
    const forms = englishCitationForms("stressed");
    assert.ok(forms.has("stressed"));
    assert.ok(forms.has("stress"));
  });

  it("includes hyphen segments", () => {
    const forms = englishCitationForms("credit-card");
    assert.ok(forms.has("credit"));
    assert.ok(forms.has("card"));
  });
});

describe("literalMetaphorCollide", () => {
  it("allows distinct literal and metaphor", () => {
    assert.equal(literalMetaphorCollide("glasses", "clarity"), null);
    assert.equal(literalMetaphorCollide("smile", "happy"), null);
    assert.equal(literalMetaphorCollide("playground", "play"), null);
  });

  it("flags exact and related collisions", () => {
    assert.deepEqual(literalMetaphorCollide("passion", "passion"), { kind: "exact" });
    assert.deepEqual(literalMetaphorCollide("stressed", "stress"), { kind: "related" });
    assert.deepEqual(literalMetaphorCollide("credit-card", "credit"), { kind: "related" });
  });

  it("ignores empty metaphorical", () => {
    assert.equal(
      validatePublishedSenseSeparation([
        {
          emoji: "x",
          literal: "passion",
          clarity: "atest",
          metaphorical: "",
          mnemonic: "",
          englishByPos: "",
          posEnglish: { literal: {}, metaphorical: {} },
        },
      ]).length,
      0,
    );
  });
});

describe("lexicon-published.csv sense separation", () => {
  it("has no literal/metaphor citation collisions", () => {
    const rows = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
    const errors = validatePublishedSenseSeparation(rows);
    assert.equal(errors.length, 0, errors.map((e) => `row ${e.row} ${e.literal}/${e.metaphorical}`).join("; "));
  });
});
