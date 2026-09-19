import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  factorizationsForStem,
  parseCompoundCsv,
  retieCompoundRows,
  validateCompoundRows,
} from "./lexicon-compounds.js";
import { parsePublishedCsv } from "./lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedRoots = new Set(
  parsePublishedCsv(readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"))
    .map((row) => row.clarity)
    .filter(Boolean),
);

describe("lexicon-compounds", () => {
  it("validates the seed lexicon-compounds.csv", () => {
    const csv = readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8");
    const rows = parseCompoundCsv(csv);
    const errors = validateCompoundRows(rows, publishedRoots);
    assert.equal(errors.length, 0, errors.map((e) => e.reason).join("; "));
  });

  it("rejects stem that is already a published root", () => {
    const stem = [...publishedRoots][0]!;
    const errors = validateCompoundRows(
      [
        {
          emoji: "",
          stem,
          left: stem.slice(0, 3),
          join: "l",
          right: "abede",
          concrete: "bad",
          abstract: "",
          mnemonic: "",
        },
      ],
      publishedRoots,
    );
    assert.ok(errors.some((e) => /published simple root/.test(e.reason)));
  });

  it("rejects ambiguous factorization (sunlight-style)", () => {
    const published = new Set(["unu", "uluhu", "unulu", "uhu"]);
    const errors = validateCompoundRows(
      [
        {
          emoji: "",
          stem: "unululuhu",
          left: "unu",
          join: "l",
          right: "uluhu",
          concrete: "sunlight",
          abstract: "",
          mnemonic: "",
        },
      ],
      published,
    );
    assert.ok(errors.some((e) => /ambiguous factorization/.test(e.reason)));
    const alts = factorizationsForStem("unululuhu", published);
    assert.ok(alts.length >= 2);
  });

  it("accepts extra-noun hook as the right member", () => {
    const errors = validateCompoundRows(
      [
        {
          emoji: "",
          stem: "awalalul",
          left: "awala",
          join: "l",
          right: "ul",
          concrete: "leave",
          abstract: "",
          mnemonic: "",
        },
      ],
      publishedRoots,
    );
    assert.equal(errors.length, 0, errors.map((e) => e.reason).join("; "));
  });

  it("does not retie a hook right member", () => {
    const { rows } = retieCompoundRows(
      [
        {
          emoji: "",
          stem: "awalalul",
          left: "awala",
          join: "l",
          right: "ul",
          concrete: "leave",
          abstract: "",
          mnemonic: "",
        },
      ],
      new Map([["ul", "ogogo"]]),
    );
    assert.equal(rows[0]?.right, "ul");
    assert.equal(rows[0]?.stem, "awalalul");
  });

  it("reties left/right and recomputes stem", () => {
    const { rows, changes } = retieCompoundRows(
      [
        {
          emoji: "🛏️",
          stem: "abedelohohu",
          left: "abede",
          join: "l",
          right: "ohohu",
          concrete: "bedroom",
          abstract: "",
          mnemonic: "",
        },
      ],
      new Map([["ohohu", "ahaha"]]),
    );
    assert.equal(rows[0]?.stem, "abedelahaha");
    assert.equal(rows[0]?.left, "abede");
    assert.equal(rows[0]?.right, "ahaha");
    assert.equal(changes.some((c) => c.field === "stem" && c.to === "abedelahaha"), true);
  });
});
