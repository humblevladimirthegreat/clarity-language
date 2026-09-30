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
    .map((row) => row.root)
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
          stem,
          left: stem.slice(0, 3),
          join: "l",
          right: "abede",
          concrete: "bad",
          abstract: "",
          mnemonic: "note",
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
          stem: "unululuhu",
          left: "unu",
          join: "l",
          right: "uluhu",
          concrete: "sunlight",
          abstract: "",
          mnemonic: "note",
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
          stem: "owogalul",
          left: "owoga",
          join: "l",
          right: "ul",
          concrete: "leave",
          abstract: "",
          mnemonic: "note",
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
          stem: "awalalul",
          left: "awala",
          join: "l",
          right: "ul",
          concrete: "leave",
          abstract: "",
          mnemonic: "note",
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
          stem: "ebedalahaza",
          left: "abede",
          join: "l",
          right: "ohohu",
          concrete: "bedroom",
          abstract: "",
          mnemonic: "note",
        },
      ],
      new Map([["ohohu", "ahaha"]]),
    );
    assert.equal(rows[0]?.stem, "abedelahaha");
    assert.equal(rows[0]?.left, "abede");
    assert.equal(rows[0]?.right, "ahaha");
    assert.equal(changes.some((c) => c.field === "stem" && c.to === "abedelahaha"), true);
  });

  it("rejects a compound with no mnemonic, a repeated root, or a gloss the lexicon already has", () => {
    const [a, b] = [...publishedRoots];
    const row = {
      stem: `${a}l${b}`,
      left: a!,
      join: "l" as const,
      right: b!,
      concrete: "bedroom",
      abstract: "",
      mnemonic: "",
    };
    const reasons = validateCompoundRows([row], publishedRoots, new Set(["bedroom"])).map((e) => e.reason);
    assert.ok(reasons.includes("missing mnemonic"));
    assert.ok(reasons.some((r) => r.includes("already a published sense")));
    const same = validateCompoundRows([{ ...row, stem: `${a}l${a}`, right: a!, mnemonic: "m" }], publishedRoots);
    assert.ok(same.some((e) => e.reason.includes("same root")));
  });
});
