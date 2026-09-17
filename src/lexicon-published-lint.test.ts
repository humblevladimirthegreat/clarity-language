import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  englishCitationForms,
  concreteAbstractCollide,
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

  it("does not expand hyphen segments into separate citation forms", () => {
    const forms = englishCitationForms("credit-card");
    assert.ok(forms.has("credit-card"));
    assert.equal(forms.has("credit"), false);
    assert.equal(forms.has("card"), false);
  });
});

describe("concreteAbstractCollide", () => {
  it("allows distinct literal and metaphor", () => {
    assert.equal(concreteAbstractCollide("glasses", "clarity"), null);
    assert.equal(concreteAbstractCollide("smile", "happy"), null);
    assert.equal(concreteAbstractCollide("playground", "play"), null);
  });

  it("flags exact and related collisions", () => {
    assert.deepEqual(concreteAbstractCollide("passion", "passion"), { kind: "exact" });
    assert.deepEqual(concreteAbstractCollide("stressed", "stress"), { kind: "related" });
    assert.equal(concreteAbstractCollide("credit-card", "credit"), null);
    assert.equal(concreteAbstractCollide("south-africa", "south-african"), null);
  });

  it("ignores empty abstract", () => {
    assert.equal(
      validatePublishedSenseSeparation([
        {
          emoji: "x",
          concrete: "passion",
          clarity: "atest",
          abstract: "",
          mnemonic: "",
          englishByPos: "",
          posEnglish: { concrete: {}, abstract: {} },
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
    assert.equal(errors.length, 0, errors.map((e) => `row ${e.row} ${e.literal}/${e.abstract}`).join("; "));
  });
});
